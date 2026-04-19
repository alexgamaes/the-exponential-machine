import { OPERATIONS } from '../data/operations.js';
import { log } from '../core/debug.js';

export function getOperationCost(state, opId) {
  const op = OPERATIONS[opId];
  if (!op) return null;

  const baseMult = state.multipliers.operationCost;
  // Algorithm ops get an extra discount from frequencyAnalysis
  const algoMult = op.type === 'algorithm' ? (state.flags.algorithmCostMult || 1) : 1;

  return {
    data:  Math.floor((op.cost.data  || 0) * baseMult * algoMult),
    flops: Math.floor((op.cost.flops || 0) * baseMult * algoMult),
  };
}

export function canExecuteOperation(state, opId) {
  const op = OPERATIONS[opId];
  if (!op) return { can: false, reason: 'Unknown operation' };
  if (state.operations.completed.includes(opId)) return { can: false, reason: 'Already completed' };

  const cost = getOperationCost(state, opId);

  if (state.resources.data < cost.data)
    return { can: false, reason: `Need ${fmt(cost.data)} Data` };
  if (state.resources.flops < cost.flops)
    return { can: false, reason: `Need ${fmt(cost.flops)} FLOPs` };

  const req = op.requires || {};

  if (req.operations) {
    for (const depId of req.operations) {
      if (!state.operations.completed.includes(depId)) {
        return { can: false, reason: `Requires [${OPERATIONS[depId]?.label || depId}]` };
      }
    }
  }
  if (req.minBoffins && state.personnel.boffin.count < req.minBoffins)
    return { can: false, reason: `Need ${req.minBoffins} Boffins` };
  if (req.minHuts && state.huts < req.minHuts)
    return { can: false, reason: `Need ${req.minHuts} Huts` };
  if (req.minData && state.resources.data < req.minData)
    return { can: false, reason: `Need ${fmt(req.minData)} Data stored` };

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

  state.operations.completed.push(opId);
  state.operations.available = state.operations.available.filter(id => id !== opId);

  // Reveal newly unlocked operations
  for (const nextId of (op.unlocks || [])) {
    if (
      !state.operations.completed.includes(nextId) &&
      !state.operations.available.includes(nextId)
    ) {
      state.operations.available.push(nextId);
    }
  }

  // Signal overlay if needed
  if (op.overlay) {
    state._pendingOverlay = op.overlay;
  }

  return true;
}

export function refreshAvailableOperations(state) {
  // Called on load — re-derive available from completed + unlock chains
  const allCompleted = new Set(state.operations.completed);
  const available = new Set(state.operations.available);

  for (const completedId of allCompleted) {
    const op = OPERATIONS[completedId];
    if (!op) continue;
    for (const nextId of (op.unlocks || [])) {
      if (!allCompleted.has(nextId)) available.add(nextId);
    }
  }

  state.operations.available = [...available];
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}
