import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { STAGE1 } from '../src/data/stage1.js';

test('starts with one log line, nothing revealed, the goal visible', () => {
  const s = E.createState();
  assert.equal(s.log.length, 1);
  assert.deepEqual(s.revealed, {});
  assert.ok(E.currentGoal(s));
});

test('a click adds one check', () => {
  const s = E.createState();
  E.click(s);
  assert.equal(s.ops, 1);
  assert.equal(s.lifetime, 1);
});

test('clerks unlock at 8 checks and produce', () => {
  const s = E.createState();
  E.click(s, 7);
  assert.equal(E.producerUnlocked(s, 'clerk'), false);
  E.click(s, 5);
  assert.equal(E.buyProducer(s, 'clerk'), true);
  E.tick(s, 10);
  assert.ok(s.lifetime > 12);
});

test('cannot buy what you cannot afford or have not seen', () => {
  const s = E.createState();
  assert.equal(E.buyUpgrade(s, 'polishNotes'), false);
  s.ops = 1e9; s.lifetime = 1e9;
  assert.equal(E.buyUpgrade(s, 'polishNotes'), false); // not revealed yet
});

test('choice upgrade needs a valid option', () => {
  const s = E.createState();
  s.ops = 1e6; s.revealed.churchillLetter = 0;
  assert.equal(E.buyUpgrade(s, 'churchillLetter', 'nope'), false);
  assert.equal(E.buyUpgrade(s, 'churchillLetter', 'machines'), true);
  assert.equal(s.choices.churchillLetter, 'machines');
});

test('every upgrade has a plain effect text and a log line; ids are unique', () => {
  const ids = new Set();
  for (const u of STAGE1.upgrades) {
    assert.ok(u.text && u.log && u.name, u.id);
    assert.ok(!ids.has(u.id)); ids.add(u.id);
  }
});

test('save round-trips and drops transient fields', () => {
  const s = E.createState();
  E.click(s, 20); E.tick(s, 1);
  const json = E.serialize(s);
  assert.ok(!json.includes('_clickRate'));
  const t = E.deserialize(json);
  assert.equal(t.lifetime, s.lifetime);
  assert.equal(E.deserialize('garbage'), null);
});

test('offline progress is capped', () => {
  const s = E.createState();
  s.producers.clerk = 10;
  const gained = E.applyOffline(s, 1e9);
  assert.ok(Math.abs(gained - 10 * 0.5 * 8 * 3600) < 1);
});

test('handover keeps the exact speed', () => {
  const s = E.createState();
  s.producers.clerk = 40; s.producers.machine = 20;
  s.lifetime = STAGE1.goal.lifetime;
  const rate = E.getRate(s);
  assert.equal(E.buyGoal(s), true);
  assert.equal(s.phase, 'finale');
  assert.ok(E.getRate(s) > rate, 'Colossus speeds you up');
  s.ops = 1e12;
  assert.equal(E.buyProducer(s, 'clerk'), false, 'no hiring after Colossus');
  while (E.currentFinale(s)) assert.equal(E.buyFinale(s), true);
  for (let i = 0; i < 1000 && s.phase === 'ending'; i++) E.tick(s, 0.5);
  assert.equal(s.phase, 'handover');
  const r2 = E.getRate(s);
  assert.equal(E.passLedger(s), true);
  assert.ok(Math.abs(E.getRate(s) - r2) < 1e-9);
  assert.ok(r2 >= rate);
});

test('goal bar always names its unit', () => {
  const s = E.createState();
  for (let i = 0; i < 4000; i++) {
    E.click(s, 2); E.tick(s, 0.25);
    if (i % 7 === 0) { E.buyProducer(s, 'clerk'); E.buyProducer(s, 'machine'); }
    const u = STAGE1.upgrades.find(x => E.canBuyUpgrade(s, x.id));
    if (u) E.buyUpgrade(s, u.id, u.effect.type === 'choice' ? 'machines' : undefined);
    const g = E.currentGoal(s);
    if (!g) break;
    assert.ok(g.ready || g.unitLabel, `goal "${g.text}" has no unit`);
  }
});
