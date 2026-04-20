import { createInitialState } from '../src/core/state.js';
import { tickResources, buyUnit, buyInfrastructure, buyBombe, getUnitCost, canAffordUnit, getInfrastructureCost, getBombeCost } from '../src/systems/resources.js';
import { tickSearch, handleComputeClick } from '../src/systems/search.js';
import { executeOperation, refreshAvailableOperations, canExecuteOperation, hasDateGatedPendingOp } from '../src/systems/operations.js';
import { OPERATIONS } from '../src/data/operations.js';
import { CONFIG } from '../src/config.js';

function mkRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Minimal sim to reproduce stuck seed=6
const state = createInitialState();
const rng = mkRng(6);
let t = 0;
const tick = 0.05;
const GATED_UNITS = { boffin:'recruitMathematicians', wren:'recruitmentFirstWrens', cryptanalyst:'creationHut3', indexer:'creationHut3', sectionHead:'formationHut6' };
const GATED_INFRA = { canteenExpansion:'messHallConstructed', coffeeRationing:'wartimeRationing' };
const isUnlocked = (state, id, map) => !map[id] || state.operations.completed.includes(map[id]);

while (t < 600) {
  if (state.phase === 0 && rng() < 0.15) handleComputeClick(state);
  for (const opId of [...state.operations.available]) {
    if (rng() < 0.1) {
      const { can } = canExecuteOperation(state, opId);
      if (can) executeOperation(state, opId);
    }
  }
  const supplyFree = state.resources.supply.cap - state.resources.supply.used;
  if (supplyFree < 4 && rng() < 0.4) buyInfrastructure(state, 'hut');
  if (isUnlocked(state, 'canteenExpansion', GATED_INFRA) && rng() < 0.15) buyInfrastructure(state, 'canteenExpansion');
  const units = ['juniorCalculator', 'boffin', 'sectionHead'];
  for (const u of units) {
    if (!isUnlocked(state, u, GATED_UNITS)) continue;
    if (supplyFree < 1) break;
    if (state.resources.data < 3 * getUnitCost(state, u)) continue;
    if (rng() < 0.08) buyUnit(state, u);
  }
  tickResources(state, tick);
  tickSearch(state, tick);
  // tickDate
  if (!hasDateGatedPendingOp(state)) {
    const ts = Math.log10((state._flopsPerSec || 0) + CONFIG.timeScaleOffset);
    state.dayTimer += tick * ts;
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
  refreshAvailableOperations(state);
  t += tick;
  if (state.phase >= 2) break;
}

console.log('t=', t.toFixed(1), 'phase=', state.phase, 'date=', state.date);
console.log('available:', state.operations.available);
console.log('completed:', state.operations.completed);
console.log('huts:', state.huts, 'boffins:', state.personnel.boffin.count, 'JCs:', state.personnel.juniorCalculator.count);
console.log('data:', Math.floor(state.resources.data), 'supply:', state.resources.supply.used, '/', state.resources.supply.cap);
console.log('date-frozen?', hasDateGatedPendingOp(state));
for (const opId of state.operations.available) {
  const r = canExecuteOperation(state, opId);
  console.log(' visible:', opId, 'can=', r.can, 'reason=', r.reason);
}
