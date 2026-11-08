import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/core/state.js';

describe('createInitialState', () => {
  test('returns phase 0', () => {
    const s = createInitialState();
    assert.equal(s.phase, 0);
  });

  test('starts at Bletchley Park opening date', () => {
    const s = createInitialState();
    assert.equal(s.date.year, 1939);
    assert.equal(s.date.month, 8);
  });

  test('supply cap starts at 12', () => {
    assert.equal(createInitialState().resources.supply.cap, 12);
  });

  test('no resources at start', () => {
    const s = createInitialState();
    assert.equal(s.resources.flops, 0);
    assert.equal(s.resources.data, 0);
  });

  test('army enigma stream is unlocked; naval is not', () => {
    const s = createInitialState();
    assert.equal(s.streams.armyEnigma.unlocked, true);
    assert.equal(s.streams.navalEnigma.unlocked, false);
  });

  test('ui flags all start hidden', () => {
    const s = createInitialState();
    for (const val of Object.values(s.ui)) {
      assert.equal(val, false);
    }
  });
});
