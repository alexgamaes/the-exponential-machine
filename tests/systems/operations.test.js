import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/core/state.js';
import {
  getOperationCost,
  canExecuteOperation,
  executeOperation,
  refreshAvailableOperations,
} from '../../src/systems/operations.js';

// ── Cost ──────────────────────────────────────────────────────────────────────

describe('getOperationCost', () => {
  test('applies base cost multiplier', () => {
    const state = createInitialState();
    state.multipliers.operationCost = 0.5;
    const cost = getOperationCost(state, 'zygalskiSheets'); // base data: 50
    assert.equal(cost.data, 25);
  });

  test('applies algorithm-type discount from frequencyAnalysis flag', () => {
    const state = createInitialState();
    state.flags.algorithmCostMult = 0.8;
    const cost = getOperationCost(state, 'zygalskiSheets'); // algorithm type
    assert.equal(cost.data, 40); // 50 * 0.8
  });

  test('does not apply algorithm discount to infrastructure ops', () => {
    const state = createInitialState();
    state.flags.algorithmCostMult = 0.5;
    const cost = getOperationCost(state, 'formationHut6'); // infrastructure type
    assert.equal(cost.data, 120); // unchanged
  });
});

// ── canExecuteOperation ───────────────────────────────────────────────────────

describe('canExecuteOperation', () => {
  test('blocked when not enough data', () => {
    const state = createInitialState();
    state.resources.data = 0;
    const { can, reason } = canExecuteOperation(state, 'zygalskiSheets');
    assert.equal(can, false);
    assert.match(reason, /Need 50 Data/);
  });

  test('blocked when not enough flops', () => {
    const state = createInitialState();
    state.resources.data = 5000;
    state.resources.flops = 0;
    const { can, reason } = canExecuteOperation(state, 'frequencyAnalysis'); // costs 1500 flops
    assert.equal(can, false);
    assert.match(reason, /Need 1\.5K FLOPs/);
  });

  test('blocked when already completed', () => {
    const state = createInitialState();
    state.resources.data = 1000;
    state.operations.completed = ['zygalskiSheets'];
    const { can } = canExecuteOperation(state, 'zygalskiSheets');
    assert.equal(can, false);
  });

  test('gates: blocked until minBoffins met', () => {
    const state = createInitialState();
    state.resources.data = 10000;
    state.resources.flops = 100000;
    const { can, reason } = canExecuteOperation(state, 'conceptualizeBombe');
    assert.equal(can, false);
    assert.match(reason, /Need 5 Boffins/);
  });

  test('gates: blocked until minHuts met after boffins satisfied', () => {
    const state = createInitialState();
    state.resources.data = 10000;
    state.resources.flops = 100000;
    state.personnel.boffin.count = 5;
    const { can, reason } = canExecuteOperation(state, 'conceptualizeBombe');
    assert.equal(can, false);
    assert.match(reason, /Need 2 Huts/);
  });

  test('succeeds when all resources and gates satisfied', () => {
    const state = createInitialState();
    state.resources.data = 10000;
    state.resources.flops = 100000;
    state.personnel.boffin.count = 5;
    state.huts = 2;
    const { can } = canExecuteOperation(state, 'conceptualizeBombe');
    assert.equal(can, true);
  });

  test('operation prerequisites are NOT checked here — trigger controls visibility', () => {
    // In the old system, canExecuteOperation blocked ops with unmet requires.operations.
    // Now that's the trigger system's job. canExecute only checks resources + gates.
    const state = createInitialState();
    state.resources.data = 1000;
    // firstManualBreak trigger requires formationHut6 completed, but that's for visibility.
    // If somehow it's in available and you have resources, it should be executable.
    const { can } = canExecuteOperation(state, 'firstManualBreak');
    assert.equal(can, true); // cost 150 data, no gates → allowed
  });
});

// ── Trigger system (refreshAvailableOperations) ───────────────────────────────

describe('trigger system', () => {

  test('zygalskiSheets does not appear before first drop', () => {
    const state = createInitialState();
    state.stats.totalDrops = 0;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('zygalskiSheets'), false);
  });

  test('zygalskiSheets appears after first drop', () => {
    const state = createInitialState();
    state.stats.totalDrops = 1;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('zygalskiSheets'));
  });

  test('formationHut6 appears after 3 junior calculators hired', () => {
    const state = createInitialState();
    state.personnel.juniorCalculator.count = 3;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('formationHut6'));
  });

  test('formationHut6 does not appear with only 2 junior calculators', () => {
    const state = createInitialState();
    state.personnel.juniorCalculator.count = 2;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('formationHut6'), false);
  });

  test('formationHut8 appears after 5 drops', () => {
    const state = createInitialState();
    state.stats.totalDrops = 5;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('formationHut8'));
  });

  test('formationHut8 does not appear at 4 drops', () => {
    const state = createInitialState();
    state.stats.totalDrops = 4;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('formationHut8'), false);
  });

  test('theHerivelTip appears when zygalskiSheets is completed', () => {
    const state = createInitialState();
    state.operations.completed = ['zygalskiSheets'];
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('theHerivelTip'));
  });

  test('recruitFirst50 requires BOTH formationHut6 done AND 10 calculators', () => {
    const state = createInitialState();

    // Only formationHut6 done — not enough
    state.operations.completed = ['formationHut6'];
    state.personnel.juniorCalculator.count = 5;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('recruitFirst50'), false);

    // Add enough calculators — now it appears
    state.personnel.juniorCalculator.count = 10;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('recruitFirst50'));
  });

  test('conceptualizeBombe appears when rotorLogicMapping is completed', () => {
    const state = createInitialState();
    state.operations.completed = ['rotorLogicMapping'];
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('conceptualizeBombe'));
  });

  test('completed nodes are never re-added to available', () => {
    const state = createInitialState();
    state.stats.totalDrops = 10;
    state.operations.completed = ['zygalskiSheets'];
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('zygalskiSheets'), false);
  });

  test('all trigger conditions are AND-ed — partial match is not enough', () => {
    const state = createInitialState();
    // recruitFirst50: needs formationHut6 AND minJuniorCalculators:10
    state.operations.completed = []; // formationHut6 NOT done
    state.personnel.juniorCalculator.count = 10; // calculators met
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('recruitFirst50'), false);
  });
});

// ── executeOperation ──────────────────────────────────────────────────────────

describe('executeOperation', () => {
  test('deducts cost and applies effect', () => {
    const state = createInitialState();
    state.resources.data = 100;
    const ok = executeOperation(state, 'zygalskiSheets');
    assert.equal(ok, true);
    assert.equal(state.resources.data, 50);
    assert.equal(state.streams.armyEnigma.spaceBase, 150); // halved
  });

  test('marks op as completed and removes from available', () => {
    const state = createInitialState();
    state.resources.data = 100;
    state.operations.available = ['zygalskiSheets'];
    executeOperation(state, 'zygalskiSheets');
    assert.ok(state.operations.completed.includes('zygalskiSheets'));
    assert.equal(state.operations.available.includes('zygalskiSheets'), false);
  });

  test('completing an op triggers refresh — children become available', () => {
    const state = createInitialState();
    state.resources.data = 100;
    state.operations.available = ['zygalskiSheets'];
    executeOperation(state, 'zygalskiSheets');
    // theHerivelTip trigger: { operations: ['zygalskiSheets'] } — now satisfied
    assert.ok(state.operations.available.includes('theHerivelTip'));
  });

  test('returns false and changes nothing when cannot execute', () => {
    const state = createInitialState();
    state.resources.data = 0;
    const ok = executeOperation(state, 'zygalskiSheets');
    assert.equal(ok, false);
    assert.equal(state.operations.completed.length, 0);
    assert.equal(state.resources.data, 0);
  });

  test('records completion timestamp', () => {
    const state = createInitialState();
    state.resources.data = 100;
    const before = Date.now();
    executeOperation(state, 'zygalskiSheets');
    const ts = state.operations._completedTimestamps?.zygalskiSheets;
    assert.ok(ts >= before);
  });
});
