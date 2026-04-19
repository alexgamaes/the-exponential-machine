import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/core/state.js';
import { 
  tickResources, 
  getUnitCost, 
  canAffordUnit, 
  buyUnit, 
  getInfrastructureCost, 
  buyInfrastructure 
} from '../../src/systems/resources.js';
import { UNITS } from '../../src/data/units.js';

describe('systems/resources', () => {

  describe('tickResources', () => {
    test('calculates FLOPs from personnel', () => {
      const state = createInitialState();
      state.personnel.juniorCalculator.count = 10; // 10 * 0.1 = 1.0 fps
      tickResources(state, 1);
      assert.equal(state._flopsPerSec, 1.0);
      assert.equal(state.resources.flops, 1.0);
    });

    test('applies section head multiplier', () => {
      const state = createInitialState();
      state.personnel.juniorCalculator.count = 10; // 1.0 base fps
      state.personnel.sectionHead.count = 1;      // +25%
      tickResources(state, 1);
      assert.equal(state._flopsPerSec, 1.25);
    });

    test('night shift doubles output', () => {
      const state = createInitialState();
      state.personnel.juniorCalculator.count = 10;
      state.upgrades.nightShiftUnlocked = true;
      state.upgrades.nightShiftActive = true;
      tickResources(state, 1);
      assert.equal(state._flopsPerSec, 2.0);
    });

    test('night shift timer logic', () => {
      const state = createInitialState();
      state.upgrades.nightShiftUnlocked = true;
      
      // First tick should activate it
      tickResources(state, 1);
      assert.equal(state.upgrades.nightShiftActive, true);
      assert.equal(state.upgrades.nightShiftTimer, 90);
      
      // Second tick should decrement it
      tickResources(state, 1);
      assert.equal(state.upgrades.nightShiftTimer, 89);
      
      // Tick until it expires (needs 89 more)
      tickResources(state, 89);
      assert.equal(state.upgrades.nightShiftActive, false);
      assert.equal(state.upgrades.nightShiftCooldown, 600);
      
      // Tick cooldown
      tickResources(state, 300);
      assert.equal(state.upgrades.nightShiftActive, false);
      assert.equal(state.upgrades.nightShiftCooldown, 300);
      
      // Finish cooldown
      tickResources(state, 300);
      // When it reaches 0, it activates again
      assert.equal(state.upgrades.nightShiftActive, true);
      assert.equal(state.upgrades.nightShiftTimer, 90);
    });

    test('calculates supply used', () => {
      const state = createInitialState();
      state.personnel.juniorCalculator.count = 2; // 2 * 1 = 2
      state.personnel.boffin.count = 1;           // 1 * 3 = 3
      tickResources(state, 1);
      assert.equal(state.resources.supply.used, 5);
    });

    test('coffee rationing reduces supply cost', () => {
      const state = createInitialState();
      state.personnel.juniorCalculator.count = 10; // 10 * 1 = 10
      state.upgrades.coffeeRationing = 1;          // -15% = 8.5 -> ceil = 9
      tickResources(state, 1);
      assert.equal(state.resources.supply.used, 9);
    });

    test('enforces data cap', () => {
      const state = createInitialState();
      state.resources.data = 1000;
      state.resources.dataCap = 500;
      tickResources(state, 1);
      assert.equal(state.resources.data, 500);
    });
  });

  describe('cost and affordability', () => {
    test('getUnitCost scales exponentially', () => {
      const state = createInitialState();
      const base = UNITS.juniorCalculator.baseCost; // should be 10
      assert.equal(getUnitCost(state, 'juniorCalculator'), 10);
      
      state.personnel.juniorCalculator.count = 1;
      assert.equal(getUnitCost(state, 'juniorCalculator'), 11); // 10 * 1.12^1 = 11.2 -> floor = 11
      
      state.personnel.juniorCalculator.count = 2;
      assert.equal(getUnitCost(state, 'juniorCalculator'), 12); // 10 * 1.12^2 = 12.544 -> floor = 12
    });

    test('getUnitCost handles multiple quantity', () => {
      const state = createInitialState();
      // count 0: cost 10
      // count 1: cost 11
      // total: 21
      assert.equal(getUnitCost(state, 'juniorCalculator', 2), 21);
    });

    test('canAffordUnit checks data and supply', () => {
      const state = createInitialState();
      state.resources.data = 5; // juniorCalculator costs 10
      assert.equal(canAffordUnit(state, 'juniorCalculator'), false);
      
      state.resources.data = 20;
      assert.equal(canAffordUnit(state, 'juniorCalculator'), true);
      
      state.resources.supply.used = 12; // cap is 12
      assert.equal(canAffordUnit(state, 'juniorCalculator'), false);
    });
  });

  describe('buyUnit', () => {
    test('deducts data and increments count', () => {
      const state = createInitialState();
      state.resources.data = 100;
      const success = buyUnit(state, 'juniorCalculator');
      assert.equal(success, true);
      assert.equal(state.personnel.juniorCalculator.count, 1);
      assert.equal(state.resources.data, 90);
    });

    test('triggers onBuy effect', () => {
      const state = createInitialState();
      state.resources.data = 200;
      buyUnit(state, 'boffin');
      assert.equal(state.flags.boffinsReduceOpCost, 1);
      assert.ok(state.multipliers.operationCost < 1);
    });
  });

  describe('infrastructure', () => {
    test('getInfrastructureCost scales', () => {
      const state = createInitialState();
      // hut baseCost 80, scale 1.5
      assert.equal(getInfrastructureCost(state, 'hut'), 80);
      state.huts = 1;
      assert.equal(getInfrastructureCost(state, 'hut'), 120);
    });

    test('buyInfrastructure for hut increases supply cap by 6', () => {
      const state = createInitialState();
      state.resources.data = 1000;
      const capBefore = state.resources.supply.cap;
      buyInfrastructure(state, 'hut');
      assert.equal(state.huts, 1);
      assert.equal(state.resources.supply.cap, capBefore + 6);
    });

    test('buyInfrastructure for canteenExpansion increases supply cap', () => {
      const state = createInitialState();
      state.resources.data = 1000;
      const initialCap = state.resources.supply.cap;
      buyInfrastructure(state, 'canteenExpansion');
      assert.equal(state.resources.supply.cap, initialCap + 20);
      assert.equal(state.upgrades.canteenExpansion, 1);
    });
  });

});
