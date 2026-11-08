import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/core/state.js';
import { tickSearch, handleComputeClick } from '../../src/systems/search.js';

describe('systems/search', () => {

  test('handleComputeClick increments flops and stats by flopsPerClick', () => {
    const state = createInitialState();
    const clickValue = state.multipliers.flopsPerClick;
    handleComputeClick(state);
    assert.equal(state.resources.flops, clickValue);
    assert.equal(state.stats.totalFlops, clickValue);
    assert.equal(state._pendingClickFlops, clickValue);
  });

  test('tickSearch consumes pending click flops', () => {
    const state = createInitialState();
    state._pendingClickFlops = 5;
    tickSearch(state, 1);
    assert.equal(state._pendingClickFlops, 0);
    // 5 flops * 10 states/flop = 50 progress
    assert.equal(state.streams.armyEnigma.progress, 50);
  });

  test('tickSearch progresses streams based on fps', () => {
    const state = createInitialState();
    state._flopsPerSec = 10;
    // 10 fps * 1s * 10 states/flop = 100 states
    tickSearch(state, 1);
    assert.equal(state.streams.armyEnigma.progress, 100);
  });

  test('triggering a drop grants rewards and scales space', () => {
    const state = createInitialState();
    state.streams.armyEnigma.spaceCurrent = 100;
    state.streams.armyEnigma.progress = 0;
    state._pendingClickFlops = 10; // 10 * 10 = 100 progress
    
    tickSearch(state, 1);
    
    assert.equal(state.streams.armyEnigma.progress, 0);
    assert.equal(state.streams.armyEnigma.dropCount, 1);
    // rewardBase 100
    assert.equal(state.resources.data, 100);
    assert.equal(state.stats.totalData, 100);
    assert.equal(state.stats.totalDrops, 1);
    
    // next space: spaceBase(300) * DROP_SCALE(1.02)^dropCount(1) = 306
    assert.equal(state.streams.armyEnigma.spaceCurrent, 306);
    assert.ok(state._lastDrop);
  });

  test('Herivel tip bonus applied during drop', () => {
    const state = createInitialState();
    state.flags.herivelTipActive = true;
    state.personnel.boffin.count = 2; // +10% reward
    state.streams.armyEnigma.spaceCurrent = 10;
    state._pendingClickFlops = 1; // 10 progress
    
    tickSearch(state, 1);
    
    // rewardBase 100 * 1.1 = 110
    assert.equal(state.resources.data, 110);
  });

  test('search speed multiplier affects progress', () => {
    const state = createInitialState();
    state.multipliers.searchSpeed = 2.0;
    state._pendingClickFlops = 1; // 1 * 10 * 2 = 20 progress
    tickSearch(state, 1);
    assert.equal(state.streams.armyEnigma.progress, 20);
  });

});
