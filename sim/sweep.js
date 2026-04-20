#!/usr/bin/env node
/**
 * Grid-search sweep simulator for The Exponential Machine.
 *
 * Varies two CONFIG knobs independently across N steps each (default 10×10),
 * runs M seeds at every cell, and reports a completion-rate + median-time table.
 *
 * Usage:
 *   node sim/sweep.js
 *   node sim/sweep.js --x opCostMultiplier 0.5 3.0 --y dropScale 1.01 1.05 --steps 5 --runs 10
 *   node sim/sweep.js --x opCostMultiplier 0.5 3.0 --steps 10 --runs 5 --max 3600
 *
 * Flags:
 *   --x  <key> <min> <max>   CONFIG key to sweep on X axis (default: opCostMultiplier 0.5 3.0)
 *   --y  <key> <min> <max>   CONFIG key to sweep on Y axis (default: none — 1D sweep)
 *   --steps N                Grid steps on each axis (default: 10)
 *   --runs  N                Seeds per cell (default: 5)
 *   --max   T                Max simulated seconds per run (default: 7200)
 *   --tick  T                Tick size (default: 0.05)
 *   --csv                    Output CSV instead of table
 */

import { readFileSync } from 'fs';
import { createInitialState } from '../src/core/state.js';
import { tickResources, buyUnit, buyInfrastructure, buyBombe, getUnitCost, getBombeCost } from '../src/systems/resources.js';
import { tickSearch, handleComputeClick } from '../src/systems/search.js';
import { executeOperation, refreshAvailableOperations, canExecuteOperation, hasDateGatedPendingOp } from '../src/systems/operations.js';
import { CONFIG } from '../src/config.js';

// ── CLI args ──────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
function arg(flag, def) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : def;
}
function argN(flag, def) { return Number(arg(flag, def)); }
function argArr(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? [argv[i + 1], Number(argv[i + 2]), Number(argv[i + 3])] : null;
}

const xSpec = argArr('--x') ?? ['opCostMultiplier', 0.5, 3.0];
const ySpec = argArr('--y') ?? null;
const STEPS   = argN('--steps', 10);
const RUNS    = argN('--runs',  5);
const MAX     = argN('--max',   7200);
const TICK    = argN('--tick',  0.05);
const CSV     = argv.includes('--csv');

const WALL_TIMEOUT_MS = 30_000;
const MAX_ITERATIONS  = 20_000_000;

// ── PRNG ─────────────────────────────────────────────────────────────────────

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

const GATED_UNITS = {
  boffin:       'recruitMathematicians',
  wren:         'recruitmentFirstWrens',
  cryptanalyst: 'creationHut3',
  indexer:      'creationHut3',
  sectionHead:  'formationHut6',
};
const GATED_INFRA = {
  canteenExpansion: 'messHallConstructed',
  coffeeRationing:  'wartimeRationing',
};

function isUnlocked(state, id, gateMap) {
  const req = gateMap[id];
  return !req || state.operations.completed.includes(req);
}

function agentTick(state, rng) {
  if (state.phase === 0 && rng() < 0.15) handleComputeClick(state);

  for (const opId of [...state.operations.available]) {
    if (rng() < 0.10) {
      const { can } = canExecuteOperation(state, opId);
      if (can) executeOperation(state, opId);
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
    if (elecFree >= 5 && data >= getBombeCost(state) && rng() < 0.25)
      buyBombe(state);

    const wrenShortfall = state.hardware.bombes.count - (state.personnel.wren?.count || 0);
    if (wrenShortfall > 0 && supplyFree >= 1 && rng() < 0.5)
      buyUnit(state, 'wren');
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

function runOnce(seed) {
  const state = createInitialState();
  const rng = mkRng(seed);
  const wallStart = Date.now();
  let iter = 0;
  let t = 0;

  while (t < MAX) {
    if (++iter % 10_000 === 0) {
      if (Date.now() - wallStart > WALL_TIMEOUT_MS)
        throw new Error(`wall-clock timeout at t=${t.toFixed(1)}s (seed=${seed})`);
    }
    if (iter > MAX_ITERATIONS)
      throw new Error(`iteration cap at t=${t.toFixed(1)}s (seed=${seed})`);

    tickResources(state, TICK);
    tickSearch(state, TICK);
    tickDate(state, TICK);
    refreshAvailableOperations(state);
    agentTick(state, rng);

    t += TICK;
    if (state.phase >= 2) break;
  }

  return { gameSecs: t, completed: state.phase >= 2, finalPhase: state.phase };
}

// ── Cell evaluation ───────────────────────────────────────────────────────────

function evalCell(xKey, xVal, yKey, yVal) {
  const original = { [xKey]: CONFIG[xKey] };
  if (yKey) original[yKey] = CONFIG[yKey];

  CONFIG[xKey] = xVal;
  if (yKey) CONFIG[yKey] = yVal;

  const times = [];
  let wins = 0;
  for (let seed = 1; seed <= RUNS; seed++) {
    try {
      const r = runOnce(seed);
      times.push(r.gameSecs);
      if (r.completed) wins++;
    } catch {
      times.push(MAX);
    }
  }

  Object.assign(CONFIG, original);

  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  const mean = times.reduce((s, v) => s + v, 0) / times.length;
  return { wins, total: RUNS, median: Math.round(median), mean: Math.round(mean) };
}

// ── Build axis values ─────────────────────────────────────────────────────────

function linspace(min, max, steps) {
  const vals = [];
  for (let i = 0; i < steps; i++) {
    vals.push(min + (max - min) * (i / (steps - 1)));
  }
  return vals;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const [xKey, xMin, xMax] = xSpec;
const xVals = linspace(xMin, xMax, STEPS);
const yKey  = ySpec ? ySpec[0] : null;
const yVals = ySpec ? linspace(ySpec[1], ySpec[2], STEPS) : [null];

const totalCells = xVals.length * yVals.length;
process.stderr.write(`Sweep: ${xKey} [${xMin}..${xMax}] × ${yKey ?? 'none'} — ${totalCells} cells × ${RUNS} runs\n`);

const grid = [];
let done = 0;
for (const yVal of yVals) {
  const row = [];
  for (const xVal of xVals) {
    const cell = evalCell(xKey, xVal, yKey, yVal);
    row.push({ xVal, yVal, ...cell });
    done++;
    process.stderr.write(`\r  ${done}/${totalCells} cells done`);
  }
  grid.push(row);
}
process.stderr.write('\n');

// ── Output ────────────────────────────────────────────────────────────────────

function fmt(n) { return (n / 60).toFixed(1) + 'm'; }

if (CSV) {
  const yLabel = yKey ?? 'y';
  const xLabel = xKey;
  if (yKey) {
    process.stdout.write(`${yLabel}\\${xLabel},` + xVals.map(v => v.toFixed(3)).join(',') + '\n');
    for (const row of grid) {
      const yV = row[0].yVal;
      process.stdout.write(
        (yV?.toFixed(3) ?? '') + ',' +
        row.map(c => `${(c.wins / c.total * 100).toFixed(0)}%/${fmt(c.median)}`).join(',') + '\n'
      );
    }
  } else {
    process.stdout.write(`${xLabel},win%,median,mean\n`);
    for (const row of grid) {
      const c = row[0];
      process.stdout.write(`${c.xVal.toFixed(3)},${(c.wins / c.total * 100).toFixed(0)},${fmt(c.median)},${fmt(c.mean)}\n`);
    }
  }
} else {
  const colW = 14;
  const pad = (s, w) => String(s).padStart(w);

  if (!yKey) {
    // 1D table — grid has one row containing all x-axis cells
    const hdr = ['x=' + xKey, 'win %', 'median', 'mean'].map(s => pad(s, colW)).join(' ');
    console.log('\n' + hdr);
    console.log('─'.repeat(hdr.length));
    for (const c of grid[0]) {
      console.log([
        pad(c.xVal.toFixed(3), colW),
        pad((c.wins / c.total * 100).toFixed(0) + '%', colW),
        pad(fmt(c.median), colW),
        pad(fmt(c.mean), colW),
      ].join(' '));
    }
  } else {
    // 2D table — median time per cell; header row = x values
    const label = (yKey + '\\' + xKey).padEnd(colW);
    const hdr = label + xVals.map(v => pad(v.toFixed(2), colW)).join('');
    console.log('\n' + hdr);
    console.log('─'.repeat(hdr.length));
    for (const row of grid) {
      const yV = row[0].yVal;
      const line = pad(yV?.toFixed(2) ?? '', colW) +
        row.map(c => pad(fmt(c.median), colW)).join('');
      console.log(line);
    }
    console.log('\n(cells show median completion time; -- means timeout)');
  }
}
