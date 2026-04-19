import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/core/state.js';
import { 
  getOperationCost, 
  canExecuteOperation, 
  executeOperation,
  refreshAvailableOperations
} from '../../src/systems/operations.js';

describe('systems/operations', () => {

  test('getOperationCost applies multipliers', () => {
    const state = createInitialState();
    // zygalskiSheets cost: { data: 50 }
    state.multipliers.operationCost = 0.5;
    const cost = getOperationCost(state, 'zygalskiSheets');
    assert.equal(cost.data, 25);
  });

  test('getOperationCost applies algorithm multiplier', () => {
    const state = createInitialState();
    state.flags.algorithmCostMult = 0.8;
    const cost = getOperationCost(state, 'zygalskiSheets'); // algorithm type
    assert.equal(cost.data, 40); // 50 * 0.8
  });

  describe('canExecuteOperation', () => {
    test('checks data and flops', () => {
      const state = createInitialState();
      state.resources.data = 0;
      const check = canExecuteOperation(state, 'zygalskiSheets');
      assert.equal(check.can, false);
      assert.match(check.reason, /Need 50 Data/);
    });

    test('checks prerequisites (operations)', () => {
      const state = createInitialState();
      state.resources.data = 1000;
      // firstManualBreak requires formationHut6
      const check = canExecuteOperation(state, 'firstManualBreak');
      assert.equal(check.can, false);
      assert.match(check.reason, /Requires \[Formation of Hut 6\]/);
    });

    test('checks prerequisites (boffins and huts)', () => {
      const state = createInitialState();
      state.resources.data = 10000;
      state.resources.flops = 100000;
      state.operations.completed = ['rotorLogicMapping'];
      // conceptualizeBombe requires 5 boffins, 2 huts
      const check = canExecuteOperation(state, 'conceptualizeBombe');
      assert.equal(check.can, false);
      assert.match(check.reason, /Need 5 Boffins/);
      
      state.personnel.boffin.count = 5;
      const check2 = canExecuteOperation(state, 'conceptualizeBombe');
      assert.equal(check2.can, false);
      assert.match(check2.reason, /Need 2 Huts/);
    });
  });

  describe('executeOperation', () => {
    test('deducts cost and applies effect', () => {
      const state = createInitialState();
      state.resources.data = 100;
      const success = executeOperation(state, 'zygalskiSheets');
      assert.equal(success, true);
      assert.equal(state.resources.data, 50);
      assert.ok(state.operations.completed.includes('zygalskiSheets'));
      
      // effect of zygalskiSheets: halves armyEnigma space
      assert.equal(state.streams.armyEnigma.spaceBase, 150);
    });

    test('unlocks next operations', () => {
      const state = createInitialState();
      state.resources.data = 100;
      state.operations.available = ['zygalskiSheets'];
      executeOperation(state, 'zygalskiSheets');
      // zygalskiSheets unlocks theHerivelTip and formationHut6
      assert.ok(state.operations.available.includes('theHerivelTip'));
      assert.ok(state.operations.available.includes('formationHut6'));
    });

    test('refreshAvailableOperations re-derives available from completed', () => {
      const state = createInitialState();
      state.operations.completed = ['zygalskiSheets'];
      state.operations.available = [];
      refreshAvailableOperations(state);
      // zygalskiSheets unlocks theHerivelTip and formationHut6
      assert.ok(state.operations.available.includes('theHerivelTip'));
      assert.ok(state.operations.available.includes('formationHut6'));
    });
  });

});
