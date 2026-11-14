import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import { STAGE1 } from '../src/data/stage1.js';
import { STAGE3 } from '../src/data/stage3.js';

test('starts with the stage divider and one log line, nothing revealed, the goal visible', () => {
  const s = E.createState();
  assert.equal(s.log.length, 2);
  assert.equal(s.log[1].kind, 'stage');
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

// ---------- Stage 2 and the handover ----------
import { STAGE2 } from '../src/data/stage2.js';

function finishStage1(rateClerks = 40, rateMachines = 20) {
  const s = E.createState();
  s.producers.clerk = rateClerks; s.producers.machine = rateMachines;
  s.lifetime = STAGE1.goal.lifetime; s.clicks = 500;
  E.buyGoal(s);
  s.ops = 1e12;
  while (E.currentFinale(s)) E.buyFinale(s);
  for (let i = 0; i < 1000 && s.phase === 'ending'; i++) E.tick(s, 0.5);
  s.ops = 200000;
  return s;
}

test('production pauses on the "Pass the ledger on" screen', () => {
  const s = finishStage1();
  assert.equal(s.phase, 'handover');
  const before = s.ops;
  E.tick(s, 60);
  assert.equal(s.ops, before);
});

test('passing the ledger opens Stage 2 empty, with the speed carried as legacy', () => {
  const s = finishStage1();
  const rate = E.getRate(s);
  assert.equal(E.passLedger(s), true);
  assert.equal(s.stage, 2);
  assert.equal(s.phase, 'playing');
  assert.equal(s.legacyRate, rate);
  assert.ok(Math.abs(E.getRate(s) - rate) < 1e-9);
  assert.deepEqual(s.revealed, {});
  assert.ok(Object.values(s.producers).every(n => n === 0));
  assert.equal(E.stageTotal(s), 0, 'conditions count from the start of the stage');
  assert.equal(E.unitName(s), 'checks', 'the word changes later, at the Shannon beat');
  assert.ok(Math.abs(E.getClickValue(s) - 0.05 * rate) < 1e-9, 'a click is 5% of the legacy');
  assert.ok(s.log.some(e => e.kind === 'stage'), 'the ledger gets a stage divider');
  assert.equal(E.currentGoal(s).kind, 'lifetime');
  assert.equal(E.currentGoal(s).have, 0);
});

test('the unit is renamed once, at the Shannon beat, and the number does not change', () => {
  const s = finishStage1();
  E.passLedger(s);
  s.bought.storedProgram = s.time;
  const ops = s.ops;
  E.tick(s, 9);
  assert.equal(E.unitName(s), 'operations');
  assert.ok(s.ops >= ops);
});

test('a heavy beat holds new cards and story lines for a while', () => {
  const s = finishStage1();
  E.passLedger(s);
  s.bought.coreMemory = s.time; s.bought.magneticTape = s.time - 200;
  E.tick(s, 12.5);
  assert.ok(s.beats.turingDeath !== undefined);
  assert.ok(s.hushUntil > s.time + 20);
  const logLen = s.log.length, revealed = Object.keys(s.revealed).length;
  s.lifetime += 1e9;
  for (let i = 0; i < 20; i++) E.tick(s, 1);
  assert.equal(s.log.length, logLen);
  assert.equal(Object.keys(s.revealed).length, revealed);
});

test('Stage 2 data: plain texts, log lines, unique ids, cards in date order', () => {
  const ids = new Set();
  let last = '';
  for (const u of STAGE2.upgrades) {
    assert.ok(u.text && u.log && u.name && u.date, u.id);
    assert.ok(!ids.has(u.id)); ids.add(u.id);
    assert.ok(u.date >= last, `${u.id} is dated before the card above it`); last = u.date;
  }
  assert.ok(STAGE2.goal.date >= last);
  assert.ok(STAGE2.finale.every(f => f.date >= STAGE2.goal.date));
});

test('an old (v1) save that finished Stage 1 moves on to Stage 2', () => {
  const s = finishStage1();
  s.legacyRate = 25000; s.phase = 'next'; s.version = 1;
  delete s.stageStart; delete s.hushUntil;
  const t = E.deserialize(E.serialize(s));
  assert.equal(t.stage, 2);
  assert.equal(t.phase, 'playing');
  assert.equal(t.legacyRate, 25000);
  assert.equal(t.version, E.SAVE_VERSION);
});

test('a Stage 2 save round-trips with Stage 2 producers', () => {
  const s = finishStage1();
  E.passLedger(s);
  s.producers.computer = 3;
  const t = E.deserialize(E.serialize(s));
  assert.equal(t.stage, 2);
  assert.equal(t.producers.computer, 3);
  assert.equal(t.producers.clerk, undefined);
});

// ---------- selling computer time ----------
test('a dev start at Stage 2 carries what a typical Stage 1 leaves', () => {
  const s = E.startAtStage(2);
  assert.equal(s.stage, 2);
  assert.equal(s.phase, 'playing');
  assert.equal(s.legacyRate, STAGE2.arrival.legacyRate);
  assert.equal(s.ops, STAGE2.arrival.ops);
  assert.equal(E.stageTotal(s), 0);
  assert.equal(s.date, '1946-02');
});

test('selling computer time earns money, capped by what customers want, and still counts for the goal', () => {
  const s = E.startAtStage(2);
  assert.equal(E.sellOpen(s), false, 'opens with Magnetic tape');
  s.bought.magneticTape = s.time;
  E.tick(s, 0.01); // the first customer arrives
  assert.equal(E.sellOpen(s), true);
  assert.ok(E.sellDemand(s) > 0);
  E.setSell(s, 0.75);
  const rate = E.getRate(s), ops = s.ops, total = E.stageTotal(s), dollars = s.dollars;
  E.tick(s, 10);
  assert.ok(Math.abs(E.stageTotal(s) - total - rate * 10) < 1e-6 * rate, 'every operation counts for the goal');
  assert.ok(Math.abs(s.ops - ops - rate * 10 * 0.25) < 1e-6 * rate, 'only the unsold part is spendable');
  const paid = Math.min(0.75 * rate, E.sellDemand(s)) * 10 * E.moneyPerOp(s);
  assert.ok(Math.abs(s.dollars - dollars - paid) < 1e-6 * paid + 1e-9, 'customers pay only for what they want');
  assert.equal(E.setSell(s, 0.33), false, 'only the listed shares');
});

test('mainframes are paid for with money; selling stops after the goal', () => {
  const s = E.startAtStage(2);
  s.bought.magneticTape = s.time; E.tick(s, 0.01);
  s.ops = 1e12; s.dollars = 0;
  assert.equal(E.buyProducer(s, 'mainframe'), false);
  s.dollars = 1e7;
  assert.equal(E.buyProducer(s, 'mainframe'), true);
  assert.ok(s.dollars < 1e7 && s.ops === 1e12);
  s.lifetime = s.stageStart.lifetime + STAGE2.goal.lifetime;
  E.buyGoal(s);
  assert.equal(E.sellShare(s), 0, 'every operation now goes to the Moon');
});

// ---------- housekeeping review additions ----------
test('finishing the last built stage shows "to be continued", and the save stays there', () => {
  const last = Math.max(...Object.keys(E.STAGES).map(Number));
  const s = E.startAtStage(last);
  s.lifetime = s.stageStart.lifetime + E.STAGES[last].goal.lifetime;
  E.buyGoal(s);
  s.ops = 1e18;
  while (E.currentFinale(s)) E.buyFinale(s);
  for (let i = 0; i < 1000 && s.phase === 'ending'; i++) E.tick(s, 0.5);
  const rate = E.getRate(s);
  assert.equal(E.passLedger(s), true);
  assert.equal(s.phase, 'next');
  assert.equal(s.legacyRate, rate);
  assert.equal(E.currentGoal(s), null);
  const t = E.deserialize(E.serialize(s));
  assert.equal(t.phase, 'next');
  assert.equal(t.stage, last);
});

test('money keeps coming in while away, capped by demand', () => {
  const s = E.startAtStage(2);
  s.bought.magneticTape = s.time; E.tick(s, 0.01);
  E.setSell(s, 0.75);
  const d0 = s.dollars, ops0 = s.ops;
  const made = E.applyOffline(s, 3600);
  assert.ok(s.dollars - d0 <= E.sellDemand(s) * E.moneyPerOp(s) * 3600 + 1e-6);
  assert.ok(s.dollars > d0);
  assert.ok(Math.abs((s.ops - ops0) - made * 0.25) < 1e-6 * made);
});

test('a v2 save (before money) loads with no money and 25% sold', () => {
  const s = E.startAtStage(2);
  const data = JSON.parse(E.serialize(s));
  delete data.dollars; delete data.sell; data.version = 2;
  const t = E.deserialize(JSON.stringify(data));
  assert.equal(t.dollars, 0);
  assert.equal(t.sell, 0.25);
  assert.equal(t.version, E.SAVE_VERSION);
});

test('every card says what its effect really does', () => {
  const says = (text, e) => {
    if (e.type === 'producerMul' || e.type === 'globalMul' || e.type === 'priceMul')
      return e.value === 2 ? /twice/.test(text) : text.includes(`${e.value}×`);
    if (e.type === 'costGrowth') return text.includes(`${Math.round((e.value - 1) * 100)}%`);
    if (e.type === 'clickPct') return text.includes(`${Math.round(e.value * 100)}%`);
    if (e.type === 'clickMul') return /2 guesses|twice/.test(text);
    if (e.type === 'demandMul') return text.includes(`${e.value}× more buyers`);
    if (e.type === 'labMax') return text.includes(`limit goes up by ${e.value}×`);
    if (e.type === 'fadeMul') return e.value === 2 && /twice as long/.test(text);
    return true; // unlockProducer, synergy: checked by hand
  };
  for (const st of [STAGE1, STAGE2, STAGE3]) {
    for (const u of st.upgrades) {
      if (u.effect.type === 'choice') for (const o of u.effect.options) assert.ok(says(o.text, o.effect), `${u.id}/${o.id}: ${o.text}`);
      else assert.ok(says(u.text, u.effect), `${u.id}: ${u.text}`);
    }
    assert.ok(says(st.goal.text, st.goal.effect), st.goal.id);
  }
});

// ---------- Stage 3: launching models ----------
function stage3() { return E.startAtStage(3); }

test('Stage 3 starts with savings, not Stage 2 money, and Model 1 on sale', () => {
  const s = stage3();
  assert.equal(s.stage, 3);
  assert.equal(s.dollars, STAGE3.startDollars);
  assert.equal(E.modelOnSale(s), 1);
  assert.equal(s.homes, 0);
  assert.equal(E.getRate(s), s.legacyRate);       // workbenches make computers, not speed
});

test('computers sold go into homes, add speed and earn money; capped by what you make', () => {
  const s = stage3();
  assert.ok(E.buyProducer(s, 'workbench'));
  const r0 = E.getRate(s);
  E.tick(s, 10);
  assert.ok(Math.abs(s.homes - 10) < 1e-6, 'one workbench, 10 s: 10 computers (demand is higher)');
  assert.ok(E.getRate(s) > r0);
  assert.ok(Math.abs(s.dollars - (STAGE3.startDollars - 1000 + 10 * STAGE3.market.price)) < 1e-6);
});

test('the lab improves on an S-curve up to the chip limit; chip cards raise the limit', () => {
  const s = stage3();
  const L = E.labLimit(s);
  assert.equal(L, STAGE3.market.labMax);
  const r = (a) => E.labRatio(s, undefined, a);
  assert.equal(r(0), 1);
  assert.ok(r(30) < r(60) && r(60) < r(120) && r(1e6) <= L + 1e-9);
  assert.ok(r(60) - r(30) > r(300) - r(270), 'fast first, then slowing');
  s.bought.eightBit = s.time;
  assert.ok(Math.abs(E.labLimit(s) - (L + 0.4)) < 1e-9);
});

test('launching: only from 1.2×, the new model is faster, buyers come back, old homes keep their speed', () => {
  const s = stage3();
  assert.equal(E.launchBlock(s), 'workbench');
  E.buyProducer(s, 'workbench');
  assert.equal(E.launchBlock(s), 'lab');
  assert.equal(E.launchModel(s), false);
  while (E.labRatio(s) < STAGE3.market.minRatio) E.tick(s, 1);
  const before = E.modelDemand(s), homes1 = s.homes, ratio = E.labRatio(s), rate = E.getRate(s);
  assert.ok(E.launchModel(s));
  assert.equal(E.modelOnSale(s), 2);
  assert.ok(Math.abs(s.models[1].speed - ratio) < 1e-9);
  assert.equal(s.models[0].homes, homes1);
  assert.ok(E.modelDemand(s) > before, 'a new model has fresh buyers');
  assert.equal(E.getRate(s), rate, 'launching changes nothing already in homes');
  assert.equal(E.labRatio(s), 1, 'the lab starts the next one');
});

test('the engineers ship a model themselves near the limit', () => {
  const s = stage3();
  E.buyProducer(s, 'workbench');
  for (let i = 0; i < 600 && E.modelOnSale(s) === 1; i++) E.tick(s, 1);
  assert.equal(E.modelOnSale(s), 2);
  assert.ok(s.log.some(e => /engineers stop waiting/.test(e.text)));
});

test('selling stops at the goal', () => {
  const s = stage3();
  E.buyProducer(s, 'workbench');
  s.lifetime = s.stageStart.lifetime + STAGE3.goal.lifetime;
  E.buyGoal(s);
  const h = s.homes;
  E.tick(s, 10);
  assert.equal(s.homes, h);
  assert.equal(E.canLaunch(s), false);
});

test('a Stage 3 save round-trips; a v4 save (price tag) becomes Model 1 homes', () => {
  const s = stage3();
  E.buyProducer(s, 'workbench'); E.tick(s, 30);
  const t = E.deserialize(E.serialize(s));
  assert.equal(t.homes, s.homes);
  assert.deepEqual(t.models, s.models);
  assert.equal(E.getRate(t), E.getRate(s));
  const old = JSON.parse(E.serialize(s));
  old.version = 4; old.price = 1299; delete old.models; delete old.modelAt; delete old.sales;
  const u = E.deserialize(JSON.stringify(old));
  assert.equal(u.price, undefined);
  assert.equal(u.models.length, 1);
  assert.equal(u.models[0].homes, s.homes);
  assert.ok(Math.abs(E.getRate(u) - E.getRate(s)) < 1e-6);
});

test('Stage 3 data: plain texts, log lines, unique ids, cards in date order', () => {
  const ids = new Set();
  let last = '';
  for (const u of STAGE3.upgrades) {
    assert.ok(u.text && u.log && u.name && u.date, u.id);
    assert.ok(!ids.has(u.id)); ids.add(u.id);
    assert.ok(u.date >= last, `${u.id} is dated before the card above it`); last = u.date;
  }
  assert.ok(STAGE3.goal.date >= last);
  assert.ok(STAGE3.finale.every(f => f.date >= STAGE3.goal.date));
});
