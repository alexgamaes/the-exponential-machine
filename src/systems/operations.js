import { OPERATIONS } from '../data/operations.js';
import { log } from '../core/debug.js';
import { pushLog } from '../core/log.js';

// ── Trigger evaluation ────────────────────────────────────────────────────────
//
// Called every tick via refreshAvailableOperations. Returns true if all
// conditions in the trigger are satisfied. All fields are optional; omitting
// a field means that condition is not required.

function triggerMet(trigger, state) {
  const t = trigger || {};
  const completed = state.operations.completed;

  if (t.operations) {
    for (const id of t.operations) {
      if (!completed.includes(id)) return false;
    }
  }
  if (t.minDrops              && state.stats.totalDrops                    < t.minDrops)              return false;
  if (t.minJuniorCalculators  && state.personnel.juniorCalculator.count    < t.minJuniorCalculators)  return false;
  if (t.minBoffins            && state.personnel.boffin.count              < t.minBoffins)            return false;
  if (t.minHuts               && state.huts                                < t.minHuts)               return false;
  if (t.minData               && state.resources.data                      < t.minData)               return false;

  return true;
}

// Scans every operation and pushes any whose trigger is now satisfied into the
// available pool. Called on load and every game tick.
export function refreshAvailableOperations(state) {
  const completed = new Set(state.operations.completed);
  const available = new Set(state.operations.available);

  for (const [id, op] of Object.entries(OPERATIONS)) {
    if (completed.has(id) || available.has(id)) continue;
    if (triggerMet(op.trigger, state)) available.add(id);
  }

  state.operations.available = [...available];
}

// ── Cost calculation ──────────────────────────────────────────────────────────

export function getOperationCost(state, opId) {
  const op = OPERATIONS[opId];
  if (!op) return null;

  const baseMult = state.multipliers.operationCost;
  const algoMult = op.type === 'algorithm' ? (state.flags.algorithmCostMult || 1) : 1;

  return {
    data:  Math.floor((op.cost.data  || 0) * baseMult * algoMult),
    flops: Math.floor((op.cost.flops || 0) * baseMult * algoMult),
  };
}

// ── Execution ─────────────────────────────────────────────────────────────────

export function canExecuteOperation(state, opId) {
  const op = OPERATIONS[opId];
  if (!op) return { can: false, reason: 'Unknown operation' };
  if (state.operations.completed.includes(opId)) return { can: false, reason: 'Already completed' };

  const cost = getOperationCost(state, opId);
  if (state.resources.data  < cost.data)  return { can: false, reason: `Need ${fmt(cost.data)} Data` };
  if (state.resources.flops < cost.flops) return { can: false, reason: `Need ${fmt(cost.flops)} FLOPs` };

  // Gates: visible but not yet executable (separate from trigger conditions)
  const gates = op.gates || {};
  if (gates.minBoffins && state.personnel.boffin.count < gates.minBoffins)
    return { can: false, reason: `Need ${gates.minBoffins} Boffins` };
  if (gates.minHuts && state.huts < gates.minHuts)
    return { can: false, reason: `Need ${gates.minHuts} Huts` };

  return { can: true };
}

export function executeOperation(state, opId) {
  const check = canExecuteOperation(state, opId);
  log('canExecute', opId, check, { data: state.resources.data, flops: state.resources.flops });
  if (!check.can) return false;

  const op = OPERATIONS[opId];
  const cost = getOperationCost(state, opId);

  state.resources.data  -= cost.data;
  state.resources.flops -= cost.flops;

  op.effect(state);

  if (op.result && !op.overlay) pushLog(`${op.label}: ${op.result}`);

  state.operations.completed.push(opId);
  state.operations.available = state.operations.available.filter(id => id !== opId);

  state.operations._completedTimestamps = state.operations._completedTimestamps || {};
  state.operations._completedTimestamps[opId] = Date.now();

  // Completing a node may satisfy triggers on other nodes — re-scan immediately
  refreshAvailableOperations(state);

  if (op.overlay) state._pendingOverlay = op.overlay;

  return true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}
