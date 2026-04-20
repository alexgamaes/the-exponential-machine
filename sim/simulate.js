#!/usr/bin/env node
/**
 * Headless Monte Carlo game simulator — no DOM, no RAF, pure CPU.
 *
 * Usage:
 *   node sim/simulate.js [--runs 20] [--tick 0.05] [--max 7200] [--seed 1] [--verbose] [--json]
 *
 * Each run spawns a fresh game state and an agent that plausibly plays the game.
 * Aggregate stats surface bottlenecks, balance issues, and pacing problems.
 */

import { readFileSync } from 'fs';
import { createInitialState } from '../src/core/state.js';
import { tickResources, buyUnit, buyInfrastructure, buyBombe, getUnitCost, canAffordUnit, getInfrastructureCost, getBombeCost } from '../src/systems/resources.js';
import { tickSearch, handleComputeClick } from '../src/systems/search.js';
import { executeOperation, refreshAvailableOperations, canExecuteOperation, hasDateGatedPendingOp } from '../src/systems/operations.js';
import { OPERATIONS } from '../src/data/operations.js';
import { CONFIG } from '../src/config.js';

// ── Load config overrides ─────────────────────────────────────────────────────
// Must happen before any state is created so CONFIG mutations take effect.

const argv = process.argv.slice(2);
function arg(flag, def) { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : def; }

const configPath = arg('--config', null);
if (configPath) {
  try {
    const overrides = JSON.parse(readFileSync(configPath, 'utf8'));
    Object.assign(CONFIG, overrides);
    process.stderr.write(`Config loaded from ${configPath}\n`);
  } catch (e) {
    process.stderr.write(`Failed to load config ${configPath}: ${e.message}\n`);
    process.exit(1);
  }
}

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────

function mkRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Headless date tick ────────────────────────────────────────────────────────

function tickDate(state, delta) {
  // Game behavior: date fully freezes when a war event is pending.
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

// ── Agent ─────────────────────────────────────────────────────────────────────
//
// Simulates a reasonably active player:
//   - Clicks compute ~3/s in Phase 0
//   - Executes ops as soon as affordable (short random reaction delay)
//   - Buys units when has surplus data and supply room
//   - Expands supply cap proactively (huts, canteen)
//   - In Phase 1: buys power infrastructure then bombes then wrens to run them

const GATED_UNITS = {
  boffin:      'recruitMathematicians',
  wren:        'recruitmentFirstWrens',
  cryptanalyst:'creationHut3',
  indexer:     'creationHut3',
  sectionHead: 'formationHut6',
};

const GATED_INFRA = {
  canteenExpansion: 'messHallConstructed',
  coffeeRationing:  'wartimeRationing',
};

function isUnlocked(state, id, gateMap) {
  const req = gateMap[id];
  return !req || state.operations.completed.includes(req);
}

function agentTick(state, rng, t, events, tickSize) {
  // Compute clicks: ~3/s in Phase 0 (Phase 1+ clicks are symbolic)
  if (state.phase === 0 && rng() < 0.15) handleComputeClick(state);

  // Reaction times. Standard ops: ~0.5s. War events: configurable so tests can
  // exercise both an instantly-reacting agent (nowait) and a slow one (longwait).
  const stdReactionSecs = 0.5;
  const warReactionSecs = CONFIG.simAgentWarEventReactionSecs ?? stdReactionSecs;
  const stdProb = Math.min(1, tickSize / stdReactionSecs);
  const warProb = Math.min(1, tickSize / warReactionSecs);

  for (const opId of [...state.operations.available]) {
    const isWarEvent = OPERATIONS[opId]?.type === 'warEvent';
    const prob = isWarEvent ? warProb : stdProb;
    if (rng() < prob) {
      const { can } = canExecuteOperation(state, opId);
      if (can) {
        executeOperation(state, opId);
        events.push({ type: 'op', id: opId, t, date: fmtDate(state.date), phase: state.phase });
      }
    }
  }

  const data = state.resources.data;
  const supply = state.resources.supply;
  const supplyFree = supply.cap - supply.used;

  // ── Supply expansion (priority: stay ahead of hiring) ────────────────────
  if (supplyFree < 4 && rng() < 0.4) buyInfrastructure(state, 'hut');

  if (isUnlocked(state, 'canteenExpansion', GATED_INFRA) && rng() < 0.15)
    buyInfrastructure(state, 'canteenExpansion');

  if (isUnlocked(state, 'coffeeRationing', GATED_INFRA) && rng() < 0.08)
    buyInfrastructure(state, 'coffeeRationing');

  // ── Phase 1: electricity → bombes → wrens (in that priority order) ───────
  if (state.phase >= 1) {
    const elec = state.resources.electricity;
    const elecFree = elec.cap - elec.used;
    const bombeCost = getBombeCost(state);

    // Buy power before bombes
    if (elecFree < 10 && rng() < 0.3) {
      if (!buyInfrastructure(state, 'localPowerLine'))
        buyInfrastructure(state, 'dedicatedGenerator');
    }

    // Buy bombe when electricity and data allow
    if (elecFree >= 5 && data >= bombeCost && rng() < 0.25) {
      const ok = buyBombe(state);
      if (ok) events.push({ type: 'bombe', t, count: state.hardware.bombes.count });
    }

    // Match wrens to running bombes (wrens enable bombes)
    const wrenShortfall = state.hardware.bombes.count - (state.personnel.wren?.count || 0);
    if (wrenShortfall > 0 && supplyFree >= 1 && rng() < 0.5)
      buyUnit(state, 'wren');
  }

  // ── Unit hiring ───────────────────────────────────────────────────────────
  // Don't hire if data is below 3× the cheapest unit cost (keep a buffer)
  const minBuffer = 3 * getUnitCost(state, 'juniorCalculator');
  if (data < minBuffer) return;

  const units = ['juniorCalculator', 'boffin', 'sectionHead', 'cryptanalyst', 'indexer', 'wren'];
  for (const u of units) {
    if (!isUnlocked(state, u, GATED_UNITS)) continue;
    if (supplyFree < 1) break;
    if (rng() < 0.08) buyUnit(state, u);
  }
}

function fmtDate(d) {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

// ── Single run ────────────────────────────────────────────────────────────────

// Maximum wall-clock seconds a single run may take before it's killed.
const WALL_TIMEOUT_MS = 30_000;
// Hard cap on loop iterations as a belt-and-suspenders guard.
const MAX_ITERATIONS = 20_000_000;

function runSim({ seed, tickSize = 0.05, maxTime = 7200 }) {
  if (tickSize <= 0) throw new Error(`tickSize must be > 0, got ${tickSize}`);

  const state = createInitialState();
  const rng = mkRng(seed);
  const events = [];

  // Periodic snapshots every 60 game-seconds for resource balance analysis
  const snapshots = [];
  let nextSnapshot = 60;

  const wallStart = Date.now();
  let iter = 0;
  let t = 0;
  while (t < maxTime) {
    // Safety guards — checked every 10 000 iterations to avoid Date.now() overhead.
    if (++iter % 10_000 === 0) {
      if (Date.now() - wallStart > WALL_TIMEOUT_MS)
        throw new Error(`Run (seed=${seed}) exceeded ${WALL_TIMEOUT_MS}ms wall-clock limit at t=${t.toFixed(1)}s`);
    }
    if (iter > MAX_ITERATIONS)
      throw new Error(`Run (seed=${seed}) exceeded ${MAX_ITERATIONS} iterations at t=${t.toFixed(1)}s`);

    tickResources(state, tickSize);
    tickSearch(state, tickSize);
    tickDate(state, tickSize);
    refreshAvailableOperations(state);
    agentTick(state, rng, t, events, tickSize);

    if (t >= nextSnapshot) {
      snapshots.push({
        t: Math.round(t),
        date: fmtDate(state.date),
        phase: state.phase,
        fps: state._flopsPerSec || 0,
        data: state.resources.data,
        dataCap: state.resources.dataCap,
        supply: state.resources.supply.used,
        supplyCap: state.resources.supply.cap,
        drops: state.stats.totalDrops,
        bombes: state.hardware.bombes.count,
        capHit: state.resources.data >= state.resources.dataCap * 0.99,
      });
      nextSnapshot += 60;
    }

    t += tickSize;
    if (state.phase >= 2) break;
  }

  return {
    seed,
    gameSecs: t,
    completed: state.phase >= 2,
    finalPhase: state.phase,
    finalDate: fmtDate(state.date),
    events,
    snapshots,
    final: {
      fps:      state._flopsPerSec || 0,
      bombes:   state.hardware.bombes.count,
      supply:   state.resources.supply.used,
      supplyCap:state.resources.supply.cap,
      dataCap:  state.resources.dataCap,
      drops:    state.stats.totalDrops,
      data:     state.resources.data,
    },
  };
}

// ── Statistics helpers ────────────────────────────────────────────────────────

function mean(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function stddev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length);
}

function pct(arr, p) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length * p)] ?? 0;
}

function fmtN(n) { return Number(n.toFixed(1)); }

function fmtLarge(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toString();
}

function fmtTime(s) {
  if (s >= 120) return `${(s / 60).toFixed(1)}m`;
  return `${s.toFixed(1)}s`;
}

// ── Report ────────────────────────────────────────────────────────────────────

function report(results) {
  const N = results.length;
  const done = results.filter(r => r.completed);
  const pctDone = ((done.length / N) * 100).toFixed(0);

  console.log(`\n${'═'.repeat(65)}`);
  console.log(` SIMULATION REPORT  (${N} runs)`);
  console.log('═'.repeat(65));
  console.log(`  Completed (phase 2): ${done.length}/${N}  (${pctDone}%)`);

  if (done.length) {
    const times = done.map(r => r.gameSecs);
    console.log(`  Game duration:  avg ${fmtTime(mean(times))}   p10 ${fmtTime(pct(times, 0.1))}   p90 ${fmtTime(pct(times, 0.9))}`);
  }

  // ── Op timing table ───────────────────────────────────────────────────────
  const opBuckets = {};
  for (const r of results) {
    for (const ev of r.events) {
      if (ev.type !== 'op') continue;
      (opBuckets[ev.id] ??= []).push(ev.t);
    }
  }

  const opRows = Object.entries(opBuckets)
    .map(([id, ts]) => ({
      id,
      avg: mean(ts),
      sd: stddev(ts),
      p10: pct(ts, 0.1),
      p90: pct(ts, 0.9),
      n: ts.length,
      missed: N - ts.length,
    }))
    .sort((a, b) => a.avg - b.avg);

  console.log(`\n${'─'.repeat(65)}`);
  console.log(` OP TIMING  (game-seconds from run start)`);
  console.log('─'.repeat(65));
  console.log(`  ${'operation'.padEnd(32)} ${'avg'.padStart(7)}  ${'p10'.padStart(7)}  ${'p90'.padStart(7)}  ${'missed'.padStart(6)}`);
  console.log(`  ${'-'.repeat(63)}`);

  let prevAvg = 0;
  for (const row of opRows) {
    const gap = row.avg - prevAvg;
    const gapWarn = gap > 60 ? ` ← ${fmtTime(gap)} gap ⚠` : gap > 30 ? ` ← ${fmtTime(gap)} gap` : '';
    const missWarn = row.missed > 0 ? ` ⚠${row.missed}` : '   ';
    console.log(
      `  ${row.id.padEnd(32)} ${fmtTime(row.avg).padStart(7)}  ${fmtTime(row.p10).padStart(7)}  ${fmtTime(row.p90).padStart(7)}  ${missWarn}${gapWarn}`
    );
    prevAvg = row.avg;
  }

  // ── Bottlenecks ───────────────────────────────────────────────────────────
  const gaps = opRows.map((row, i) => ({
    from: opRows[i - 1]?.id ?? 'START',
    to: row.id,
    gap: row.avg - (opRows[i - 1]?.avg ?? 0),
  })).filter(g => g.gap > 30).sort((a, b) => b.gap - a.gap);

  if (gaps.length) {
    console.log(`\n${'─'.repeat(65)}`);
    console.log(` BOTTLENECKS  (avg gap > 30s between ops)`);
    console.log('─'.repeat(65));
    for (const g of gaps) {
      const warn = g.gap > 120 ? ' ⚠⚠' : g.gap > 60 ? ' ⚠' : '';
      console.log(`  ${fmtTime(g.gap).padStart(6)}  ${g.from} → ${g.to}${warn}`);
    }
  }

  // ── Data cap pressure ─────────────────────────────────────────────────────
  const allSnaps = results.flatMap(r => r.snapshots);
  const capHitByTime = {};
  for (const s of allSnaps) {
    const bucket = Math.floor(s.t / 60) * 60;
    capHitByTime[bucket] = (capHitByTime[bucket] ?? 0) + (s.capHit ? 1 : 0);
  }
  const capHitPeriods = Object.entries(capHitByTime)
    .map(([t, hits]) => ({ t: Number(t), rate: hits / N }))
    .filter(x => x.rate > 0.3)
    .sort((a, b) => a.t - b.t);

  if (capHitPeriods.length) {
    console.log(`\n${'─'.repeat(65)}`);
    console.log(` DATA CAP PRESSURE  (>30% of runs hitting cap per minute)`);
    console.log('─'.repeat(65));
    for (const { t, rate } of capHitPeriods) {
      const bar = '█'.repeat(Math.round(rate * 20));
      console.log(`  t=${fmtTime(t).padEnd(6)}  ${bar.padEnd(20)}  ${(rate * 100).toFixed(0)}%`);
    }
  }

  // ── Final state ───────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(65)}`);
  console.log(` FINAL STATE  (averages across all runs)`);
  console.log('─'.repeat(65));
  const f = (key) => mean(results.map(r => r.final[key]));
  console.log(`  FPS:       ${fmtLarge(f('fps'))}`);
  console.log(`  Bombes:    ${fmtN(f('bombes'))}`);
  console.log(`  Supply:    ${fmtN(f('supply'))} / ${fmtN(f('supplyCap'))}`);
  console.log(`  DataCap:   ${fmtLarge(f('dataCap'))}`);
  console.log(`  Drops:     ${fmtN(f('drops'))}`);

  // ── Bombe purchase log (timing) ───────────────────────────────────────────
  const bombePurchases = {};
  for (const r of results) {
    for (const ev of r.events.filter(e => e.type === 'bombe')) {
      (bombePurchases[ev.count] ??= []).push(ev.t);
    }
  }
  const bombeRows = Object.entries(bombePurchases)
    .map(([n, ts]) => ({ n: Number(n), avg: mean(ts), sd: stddev(ts), seen: ts.length }))
    .sort((a, b) => a.n - b.n)
    .slice(0, 10);

  if (bombeRows.length) {
    console.log(`\n${'─'.repeat(65)}`);
    console.log(` BOMBE PURCHASE TIMING  (first 10 machines)`);
    console.log('─'.repeat(65));
    for (const row of bombeRows) {
      console.log(`  Bombe #${String(row.n).padStart(2)}:  avg ${fmtTime(row.avg).padStart(7)}  sd ${fmtTime(row.sd).padStart(6)}  (in ${row.seen}/${N} runs)`);
    }
  }

  console.log(`\n${'═'.repeat(65)}\n`);
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const RUNS     = parseInt(arg('--runs', '20'));
const TICK     = parseFloat(arg('--tick', '0.05'));
const MAX_TIME = parseInt(arg('--max', '7200'));
const SEED     = parseInt(arg('--seed', '1'));
const VERBOSE  = argv.includes('--verbose');
const JSON_OUT = argv.includes('--json');

process.stderr.write(`\nRunning ${RUNS} simulations  tick=${TICK}s  max=${MAX_TIME}s  seed=${SEED}\n`);

const results = [];
const wallStart = Date.now();

for (let i = 0; i < RUNS; i++) {
  const t0 = Date.now();
  const result = runSim({ seed: SEED + i, tickSize: TICK, maxTime: MAX_TIME });
  const wallMs = Date.now() - t0;

  results.push(result);

  const status = result.completed ? '✓' : `✗ phase=${result.finalPhase}`;
  process.stderr.write(
    `  [${String(i + 1).padStart(2)}/${RUNS}]  ${status}  date=${result.finalDate}  t=${fmtTime(result.gameSecs)}  wall=${wallMs}ms\n`
  );

  if (VERBOSE) {
    for (const ev of result.events.filter(e => e.type === 'op')) {
      process.stderr.write(`         ${fmtTime(ev.t).padStart(7)}  ${ev.date}  ${ev.id}\n`);
    }
  }
}

process.stderr.write(`\nTotal wall time: ${((Date.now() - wallStart) / 1000).toFixed(1)}s\n`);

if (JSON_OUT) {
  console.log(JSON.stringify(results, null, 2));
} else {
  report(results);
}
