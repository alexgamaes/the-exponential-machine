#!/usr/bin/env node
/**
 * Balance sweep — runs a named list of CONFIG hypotheses against the headless
 * sim and reports pacing metrics side-by-side.
 *
 * The aim is NOT just "does the game complete" — it's whether the *rhythm*
 * feels right: are ops spaced (~15–45s apart), is there a cap-pressure moment
 * that forces a strategic spend, are there any dead gaps over a minute?
 *
 * Usage:
 *   node sim/balance.js                 # runs the hard-coded CONFIG_SETS
 *   node sim/balance.js --runs 10       # seeds per config
 *   node sim/balance.js --max 2400      # cap per run (seconds)
 *   node sim/balance.js --json          # machine-readable output
 */

import { createInitialState } from '../src/core/state.js';
import {
  tickResources, buyUnit, buyInfrastructure, buyBombe,
  getUnitCost, getBombeCost,
} from '../src/systems/resources.js';
import { tickSearch, handleComputeClick } from '../src/systems/search.js';
import {
  executeOperation, refreshAvailableOperations,
  canExecuteOperation, hasDateGatedPendingOp,
} from '../src/systems/operations.js';
import { OPERATIONS } from '../src/data/operations.js';
import { CONFIG } from '../src/config.js';

// ── CLI ───────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
function arg(flag, def) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : def; }
const RUNS = parseInt(arg('--runs', '5'));
const MAX  = parseInt(arg('--max',  '1800'));
const TICK = parseFloat(arg('--tick', '0.05'));
const JSON_OUT = argv.includes('--json');
const CONFIG_FILE = arg('--configs', null);

// ── PRNG + date tick (copied from sweep.js so this file is self-contained) ────

function mkRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tickDate(state, delta) {
  if (hasDateGatedPendingOp(state)) return;
  const timeScale = Math.log10((state._flopsPerSec || 0) + CONFIG.timeScaleOffset);
  state.dayTimer += delta * timeScale;
  while (state.dayTimer >= state.dayDuration) {
    state.dayTimer -= state.dayDuration;
    const d = state.date;
    const dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (++d.day > dim[d.month - 1]) {
      d.day = 1;
      if (++d.month > 12) { d.month = 1; d.year++; }
    }
  }
}

const GATED_UNITS = {
  boffin: 'recruitMathematicians', wren: 'recruitmentFirstWrens',
  cryptanalyst: 'creationHut3', indexer: 'creationHut3', sectionHead: 'formationHut6',
};
const GATED_INFRA = {
  canteenExpansion: 'messHallConstructed', coffeeRationing: 'wartimeRationing',
};
function isUnlocked(state, id, gateMap) {
  const req = gateMap[id];
  return !req || state.operations.completed.includes(req);
}

function agentTick(state, rng, events, t) {
  if (state.phase === 0 && rng() < 0.15) handleComputeClick(state);

  // All ops react at ~0.5s average — we don't vary war-event reaction here.
  for (const opId of [...state.operations.available]) {
    if (rng() < 0.10) {
      const { can } = canExecuteOperation(state, opId);
      if (can) {
        executeOperation(state, opId);
        events.push({ t, id: opId });
      }
    }
  }

  const data = state.resources.data;
  const supply = state.resources.supply;
  const supplyFree = supply.cap - supply.used;

  if (supplyFree < 4 && rng() < 0.4) buyInfrastructure(state, 'hut');
  if (isUnlocked(state, 'canteenExpansion', GATED_INFRA) && rng() < 0.15)
    buyInfrastructure(state, 'canteenExpansion');
  if (isUnlocked(state, 'coffeeRationing', GATED_INFRA) && rng() < 0.08)
    buyInfrastructure(state, 'coffeeRationing');

  if (state.phase >= 1) {
    const elec = state.resources.electricity;
    const elecFree = elec.cap - elec.used;
    if (elecFree < 10 && rng() < 0.3) {
      if (!buyInfrastructure(state, 'localPowerLine'))
        buyInfrastructure(state, 'dedicatedGenerator');
    }
    if (elecFree >= 5 && data >= getBombeCost(state) && rng() < 0.25) buyBombe(state);
    const wrenShortfall = state.hardware.bombes.count - (state.personnel.wren?.count || 0);
    if (wrenShortfall > 0 && supplyFree >= 1 && rng() < 0.5) buyUnit(state, 'wren');
  }

  const minBuffer = 3 * getUnitCost(state, 'juniorCalculator');
  if (data < minBuffer) return;
  for (const u of ['juniorCalculator', 'boffin', 'sectionHead', 'cryptanalyst', 'indexer', 'wren']) {
    if (!isUnlocked(state, u, GATED_UNITS)) continue;
    if (supplyFree < 1) break;
    if (rng() < 0.08) buyUnit(state, u);
  }
}

// ── Single run ────────────────────────────────────────────────────────────────

const WALL_TIMEOUT_MS = 30_000;

function runOnce(seed) {
  const state = createInitialState();
  const rng = mkRng(seed);
  const events = [];
  const snapshots = [];
  let nextSnapshot = 30;
  const wallStart = Date.now();
  let t = 0;
  let iter = 0;

  while (t < MAX) {
    if (++iter % 10_000 === 0) {
      if (Date.now() - wallStart > WALL_TIMEOUT_MS) break;
    }
    tickResources(state, TICK);
    tickSearch(state, TICK);
    tickDate(state, TICK);
    refreshAvailableOperations(state);
    agentTick(state, rng, events, t);

    if (t >= nextSnapshot) {
      snapshots.push({
        t,
        capHit: state.resources.data >= state.resources.dataCap * 0.99,
      });
      nextSnapshot += 30;
    }

    t += TICK;
    if (state.phase >= 2) break;
  }

  return { seed, totalTime: t, completed: state.phase >= 2, events, snapshots };
}

// ── Metrics ───────────────────────────────────────────────────────────────────

function pct(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor((s.length - 1) * p)];
}

function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function gapsOf(run) {
  // Insert virtual start event at t=0, so first gap = time-to-first-op.
  const ts = [0, ...run.events.map(e => e.t)];
  const gaps = [];
  for (let i = 1; i < ts.length; i++) gaps.push(ts[i] - ts[i - 1]);
  return gaps;
}

function analyzeRuns(runs) {
  const completedRuns = runs.filter(r => r.completed);
  const totals = runs.map(r => r.totalTime);
  const allGaps = runs.flatMap(gapsOf);
  const bigGaps = allGaps.filter(g => g > 60).length;      // "dead" moments
  const microGaps = allGaps.filter(g => g < 5).length;     // "dump" moments
  const capPressure = runs.flatMap(r => r.snapshots).filter(s => s.capHit).length /
                      Math.max(1, runs.flatMap(r => r.snapshots).length);
  const opCount = mean(runs.map(r => r.events.length));

  return {
    completion: completedRuns.length / runs.length,
    totalMean: mean(completedRuns.map(r => r.totalTime)),
    totalP10: pct(completedRuns.map(r => r.totalTime), 0.1),
    totalP90: pct(completedRuns.map(r => r.totalTime), 0.9),
    gapMedian: pct(allGaps, 0.5),
    gapP90: pct(allGaps, 0.9),
    gapMax: allGaps.length ? Math.max(...allGaps) : 0,
    bigGapsPerRun: bigGaps / runs.length,
    microGapsPerRun: microGaps / runs.length,
    capPressure,
    opCount,
  };
}

// ── Config mutation ───────────────────────────────────────────────────────────

function snapshotConfig() {
  // Deep-clone the whole CONFIG so any override key is restorable.
  return JSON.parse(JSON.stringify(CONFIG));
}

function applyOverrides(base) {
  // Deep-merge at the top level and one level into opBaseCosts
  const obcOverride = base.opBaseCosts;
  for (const k of Object.keys(base)) {
    if (k === 'opBaseCosts') continue;
    CONFIG[k] = base[k];
  }
  if (obcOverride) {
    for (const opId of Object.keys(obcOverride)) {
      CONFIG.opBaseCosts[opId] = { ...(CONFIG.opBaseCosts[opId] || {}), ...obcOverride[opId] };
    }
  }
}

function restoreConfig(snap) {
  // Clear keys that may have been added by overrides but weren't in snap
  for (const k of Object.keys(CONFIG)) delete CONFIG[k];
  // Then write the snapshot back (deep-clone to protect the snap for later restores)
  Object.assign(CONFIG, JSON.parse(JSON.stringify(snap)));
}

// ── Config sets ───────────────────────────────────────────────────────────────

// Phase 0 ops (before veDay); used for "early phase scaling" configs.
const PHASE0_OPS = [
  'zygalskiSheets','formationHut6','formationHut8','firstManualBreak','theHerivelTip',
  'recruitMathematicians','convoyEscortsRerouted','messHallConstructed','recruitFirst50',
  'cardIndexEarly','frequencyAnalysis','rotorLogicMapping','wartimeRationing',
  'battleOfBritainIntel','afrikaKorpsSupplyTracked','conceptualizeBombe','turingMemorandum',
];
const PHASE1_OPS = [
  'installationVictory','welchmanDiagonalBoard','agnusDei','theCilleExploit','creationHut3',
  'recruitmentFirstWrens','operationMincemeat','firstNavalEnigmaBreak','cardIndexFull',
  'battleOfAtlanticTide','dDayIntelligence','veDay',
];

function scaleOps(ids, factor) {
  const out = {};
  for (const id of ids) {
    const base = CONFIG.opBaseCosts[id] || {};
    out[id] = {};
    if (base.data)  out[id].data  = Math.round(base.data * factor);
    if (base.flops) out[id].flops = Math.round(base.flops * factor);
  }
  return out;
}

// Iteration 1 — 10 hypotheses covering the dominant design knobs.
const ITER1 = [
  { name: 'baseline',            overrides: {} },
  { name: 'all_costs_+25%',      overrides: { opCostMultiplier: 1.25 } },
  { name: 'all_costs_-20%',      overrides: { opCostMultiplier: 0.80 } },
  { name: 'phase0_cheap_phase1_steep',
    overrides: { opBaseCosts: { ...scaleOps(PHASE0_OPS, 0.8), ...scaleOps(PHASE1_OPS, 1.5) } } },
  { name: 'phase1_steep_+80%',
    overrides: { opBaseCosts: scaleOps(PHASE1_OPS, 1.8) } },
  { name: 'slow_drops (1.04)',   overrides: { dropScale: 1.04 } },
  { name: 'fast_drops (1.01)',   overrides: { dropScale: 1.01 } },
  { name: 'stingy_conversion',   overrides: { flopsToStates: 6 } },
  { name: 'generous_conversion', overrides: { flopsToStates: 15 } },
  { name: 'slow_personnel',      overrides: { juniorCalcFlopsPerSec: 0.07, boffinFlopsPerSec: 1.8 } },
];

// Build a "chain ramp" where each op in `ids` costs (factor^i) × the baseline.
// Simulates a curve that rewards strategic saving instead of a flat multiplier.
function chainRamp(ids, factor) {
  const out = {};
  for (let i = 0; i < ids.length; i++) {
    const base = CONFIG.opBaseCosts[ids[i]] || {};
    const mult = Math.pow(factor, i);
    out[ids[i]] = {};
    if (base.data)  out[ids[i]].data  = Math.round(base.data * mult);
    if (base.flops) out[ids[i]].flops = Math.round(base.flops * mult);
  }
  return out;
}

// Ops that unlock a new unit / infra / gameplay surface. Making these more
// expensive means each *structural* unlock requires a deliberate save.
const UNLOCK_OPS = [
  'recruitMathematicians',   // boffins
  'messHallConstructed',     // canteen
  'wartimeRationing',        // coffee
  'cardIndexEarly',          // +10× data cap
  'conceptualizeBombe',      // bombes
  'turingMemorandum',        // phase transition with conceptualizeBombe
  'cardIndexFull',           // +20× data cap
  'creationHut3',            // cryptanalyst+indexer
  'recruitmentFirstWrens',   // wrens
];

// Iteration 2 — targets microgaps & cap pressure, informed by iter-1 findings.
// Hypothesis: iter-1 ops clump because agent has surplus data at unlock time.
// Fix = raise costs of unlock-ops + tighten early cap + ramp drop rewards.
const ITER2 = [
  { name: 'baseline',            overrides: {} },

  // Raise costs of structural unlock ops by 1.8× — these are the "save-up" beats.
  { name: 'expensive_unlocks',   overrides: { opBaseCosts: scaleOps(UNLOCK_OPS, 1.8) } },

  // Geometric ramp in phase 0 (each op 1.08× the prior one's base)
  { name: 'phase0_chain_ramp',   overrides: { opBaseCosts: chainRamp(PHASE0_OPS, 1.08) } },

  // Starter cap = 200 (vs 500) forces early cardIndex push.
  { name: 'tiny_starting_cap',   overrides: { initialDataCap: 200 } },

  // Drops grow slower than baseline + 15% cost raise — accumulation matters.
  { name: 'drop_squeeze',        overrides: { dropScale: 1.015, opCostMultiplier: 1.15 } },

  // Halve junior productivity — hiring becomes a strategic lever.
  { name: 'tight_juniors',       overrides: { juniorCalcFlopsPerSec: 0.05, opCostMultiplier: 1.1 } },

  // Phase 1 only cheaper by 30% — phase 1 already felt compressed.
  { name: 'cheap_phase1',        overrides: { opBaseCosts: scaleOps(PHASE1_OPS, 0.7) } },

  // Combined: modest global raise + smaller cap + faster drop growth.
  { name: 'combined_tight',      overrides: {
      opCostMultiplier: 1.2, initialDataCap: 300, dropScale: 1.025 } },

  // Phase 1 chain ramp — each late op ~1.1× the prior.
  { name: 'phase1_chain_ramp',   overrides: { opBaseCosts: chainRamp(PHASE1_OPS, 1.1) } },

  // All-unlock 2.2× + baseline elsewhere — extreme save-up version.
  { name: 'unlock_heavy_2.2',    overrides: { opBaseCosts: scaleOps(UNLOCK_OPS, 2.2) } },
];

// Iteration 3 — focused exploration of the two knobs that actually moved
// microgaps in iter2 (dropScale and opCostMultiplier), plus day-speed
// experiments to see if the structural 3.0m gap-max can be shrunk.
const ITER3 = [
  { name: 'baseline',              overrides: {} },
  { name: 'drop_squeeze_1.01_+15', overrides: { dropScale: 1.01,  opCostMultiplier: 1.15 } },
  { name: 'drop_squeeze_1.005_+15',overrides: { dropScale: 1.005, opCostMultiplier: 1.15 } },
  { name: 'drop_flat_+20',         overrides: { dropScale: 1.00,  opCostMultiplier: 1.20 } },
  { name: 'cap_400_costs_+10',     overrides: { initialDataCap: 400, opCostMultiplier: 1.10 } },
  { name: 'cap_300_costs_adjusted',
    overrides: { initialDataCap: 300,
                 opBaseCosts: { cardIndexEarly: { data: 280 } } } },
  { name: 'fast_days_0.5',         overrides: { dayDuration: 0.5 } },
  { name: 'slow_days_1.5',         overrides: { dayDuration: 1.5 } },
  { name: 'stingy_flops_8',        overrides: { flopsToStates: 8, opCostMultiplier: 1.1 } },
  { name: 'combined_sweet_spot',   overrides: {
      dropScale: 1.01, opCostMultiplier: 1.15, initialDataCap: 400,
      opBaseCosts: { cardIndexEarly: { data: 360 } } } },
];

// Iteration 4 — zero in on dayDuration (the only knob that moves the floor)
// combined with small cost/drop tuning. Target: 8–10m total, <10 microgaps,
// <2 big gaps per run, capHit 20–30%.
const ITER4 = [
  { name: 'baseline',                    overrides: {} },
  { name: 'dayDur_0.5',                  overrides: { dayDuration: 0.5 } },
  { name: 'dayDur_0.6',                  overrides: { dayDuration: 0.6 } },
  { name: 'dayDur_0.7',                  overrides: { dayDuration: 0.7 } },
  { name: 'dayDur_0.8',                  overrides: { dayDuration: 0.8 } },
  { name: 'dayDur_0.7_costs_+15',        overrides: { dayDuration: 0.7, opCostMultiplier: 1.15 } },
  { name: 'dayDur_0.7_drop_1.01',        overrides: { dayDuration: 0.7, dropScale: 1.01 } },
  { name: 'dayDur_0.6_costs_+10_drop_1.015',
    overrides: { dayDuration: 0.6, opCostMultiplier: 1.10, dropScale: 1.015 } },
  { name: 'dayDur_0.7_costs_+10_drop_1.015',
    overrides: { dayDuration: 0.7, opCostMultiplier: 1.10, dropScale: 1.015 } },
  { name: 'dayDur_0.75_balanced',
    overrides: { dayDuration: 0.75, opCostMultiplier: 1.10, dropScale: 1.015 } },
];

const SETS = { iter1: ITER1, iter2: ITER2, iter3: ITER3, iter4: ITER4 };

// ── Run a named set ───────────────────────────────────────────────────────────

function runConfigSet(sets) {
  const baseline = snapshotConfig();
  const results = [];
  for (const set of sets) {
    restoreConfig(baseline);
    applyOverrides(set.overrides);
    const runs = [];
    for (let s = 1; s <= RUNS; s++) runs.push(runOnce(s));
    results.push({ name: set.name, overrides: set.overrides, metrics: analyzeRuns(runs) });
    process.stderr.write(`  ${set.name.padEnd(30)}  done\n`);
  }
  restoreConfig(baseline);
  return results;
}

function fmtT(s) { return s >= 120 ? (s/60).toFixed(1)+'m' : s.toFixed(0)+'s'; }
function fmtPct(x) { return (x*100).toFixed(0)+'%'; }

function table(results) {
  const cols = [
    ['config', 32],
    ['win%', 6],
    ['total', 8],
    ['p10', 8],
    ['p90', 8],
    ['gap-med', 8],
    ['gap-p90', 8],
    ['gap-max', 8],
    ['big>60s', 8],
    ['microgaps', 10],
    ['capHit', 8],
    ['ops', 5],
  ];
  const line = cols.map(([name, w]) => name.padEnd(w)).join(' ');
  console.log('\n' + line);
  console.log('─'.repeat(line.length));
  for (const r of results) {
    const m = r.metrics;
    const row = [
      r.name.padEnd(cols[0][1]),
      fmtPct(m.completion).padEnd(cols[1][1]),
      fmtT(m.totalMean).padEnd(cols[2][1]),
      fmtT(m.totalP10).padEnd(cols[3][1]),
      fmtT(m.totalP90).padEnd(cols[4][1]),
      fmtT(m.gapMedian).padEnd(cols[5][1]),
      fmtT(m.gapP90).padEnd(cols[6][1]),
      fmtT(m.gapMax).padEnd(cols[7][1]),
      m.bigGapsPerRun.toFixed(1).padEnd(cols[8][1]),
      m.microGapsPerRun.toFixed(1).padEnd(cols[9][1]),
      fmtPct(m.capPressure).padEnd(cols[10][1]),
      m.opCount.toFixed(0).padEnd(cols[11][1]),
    ].join(' ');
    console.log(row);
  }
  console.log('\nColumns:');
  console.log('  total/p10/p90 = mean & percentiles of total game time for COMPLETED runs');
  console.log('  gap-*         = seconds between consecutive op executions (all runs pooled)');
  console.log('  big>60s       = per-run count of gaps > 60s (felt as dead time)');
  console.log('  microgaps     = per-run count of gaps < 5s (felt as ops "dumped" together)');
  console.log('  capHit        = fraction of 30s snapshots where data ≥ 99% of cap');
  console.log('  ops           = mean count of op executions per run');
}

// ── Choose config set ─────────────────────────────────────────────────────────

const setName = arg('--set', 'iter1');
let sets = SETS[setName] ?? ITER1;
if (CONFIG_FILE) {
  const { readFileSync } = await import('fs');
  sets = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
}

process.stderr.write(`Balance sweep: ${sets.length} configs × ${RUNS} runs × max ${MAX}s\n`);
const results = runConfigSet(sets);

if (JSON_OUT) {
  console.log(JSON.stringify(results, null, 2));
} else {
  table(results);
}
