// Core engine. Pure logic, no DOM: the browser and the simulator run this same file.
// All functions take the state object and mutate it. Fields starting with '_' are transient (never saved).

import { CONFIG } from './config.js';
import { fmt } from './format.js';
import { STAGE1 } from './data/stage1.js';
import { STAGE2 } from './data/stage2.js';
import { STAGE3 } from './data/stage3.js';

export const STAGES = { 1: STAGE1, 2: STAGE2, 3: STAGE3 };
export const SAVE_VERSION = 5;

export function stageData(s) { return STAGES[s.stage]; }

// 'playing' = building up; 'finale' = stage goal built, last actions of the stage. Both are interactive.
export function isActive(s) { return s.phase === 'playing' || s.phase === 'finale'; }

export function createState() {
  const st = STAGE1;
  const s = {
    version: SAVE_VERSION,
    stage: 1,
    time: 0,          // seconds played
    ops: 0,           // spendable balance
    lifetime: 0,      // total ever produced
    clicks: 0,
    producers: Object.fromEntries(st.producers.map(p => [p.id, 0])),
    bought: {},       // upgradeId -> time bought
    choices: {},      // upgradeId -> optionId
    revealed: {},     // upgradeId -> time revealed
    lastRevealAt: -Infinity,
    beats: {},        // beatId -> time fired
    date: st.startDate,
    log: [],
    phase: 'playing', // 'playing' | 'finale' | 'ending' | 'handover' | 'next'
    goalDone: false,
    finaleIndex: 0,
    endingIndex: 0,
    endingAt: 0,
    legacyRate: 0,
    stageStart: { time: 0, lifetime: 0, clicks: 0 }, // conditions and the goal count from here
    hushUntil: 0,     // no reveals or story lines until then (a quiet moment after a heavy beat)
    dollars: 0,       // money from selling computer time (Stage 2 on)
    sell: 0.25,       // share of computer time offered to customers (Stage 2)
    homes: 0,         // computers sold that keep running in people's homes (Stage 3)
    models: [],       // Stage 3: every model launched, [{ speed (× Model 1), homes (sold) }]; the last is on sale
    modelAt: 0,       // when the model on sale was launched
    sales: [],        // buyers a second for the model on sale, one sample every 2 s (the chart)
    salesNext: 0,     // when the next sample is due
    goalAt: null,     // when the stage goal was built
    _clickAcc: 0,
    _clickRate: 0,    // smoothed clicks per second (for the speedometer)
  };
  addLog(s, st.title, st.startDate, 'stage');
  checkBeats(s);
  return s;
}

// ---------- derived numbers ----------

function upgradeEffects(s) {
  const st = stageData(s);
  const fx = { clickMul: 1, clickPct: 0, globalMul: 1, synergy: 0, priceMul: 1, demandMul: 1, fadeMul: 1, labMax: 0, mul: {}, growth: {}, unlocked: {} };
  const apply = (e) => {
    switch (e.type) {
      case 'clickMul': fx.clickMul *= e.value; break;
      case 'clickPct': fx.clickPct += e.value; break;
      case 'globalMul': fx.globalMul *= e.value; break;
      case 'synergy': fx.synergy += e.value; break;
      case 'producerMul': fx.mul[e.target] = (fx.mul[e.target] || 1) * e.value; break;
      case 'costGrowth': fx.growth[e.target] = e.value; break;
      case 'priceMul': fx.priceMul *= e.value; break;
      case 'demandMul': fx.demandMul *= e.value; break;
      case 'fadeMul': fx.fadeMul *= e.value; break;
      case 'labMax': fx.labMax += e.value; break;
      case 'unlockProducer': fx.unlocked[e.target] = true; break;
    }
  };
  if (s.goalDone && st.goal.effect) apply(st.goal.effect);
  for (const u of st.upgrades) {
    if (!(u.id in s.bought)) continue;
    if (u.effect.type === 'choice') {
      const opt = u.effect.options.find(o => o.id === s.choices[u.id]);
      if (opt) apply(opt.effect);
    } else apply(u.effect);
  }
  return fx;
}

export function producerUnlocked(s, id) {
  const p = stageData(s).producers.find(x => x.id === id);
  return conditionMet(s, p.reveal);
}

export function producerOutput(s, id, fx = upgradeEffects(s)) {
  const p = stageData(s).producers.find(x => x.id === id);
  let out = p.output * (fx.mul[id] || 1) * fx.globalMul;
  const syn = stageData(s).synergy; // e.g. { target: 'clerk', source: 'machine' }
  if (syn && id === syn.target && fx.synergy) out *= 1 + fx.synergy * (s.producers[syn.source] || 0);
  return out;
}

export function producerCost(s, id, fx = upgradeEffects(s)) {
  const p = stageData(s).producers.find(x => x.id === id);
  const g = fx.growth[id] || p.growth;
  return p.baseCost * Math.pow(g, s.producers[id]);
}

// Speed. Producers that make computers (Stage 3) add to capacity, not speed: the computers they make
// run in other people's homes, and those count.
export function getRate(s, fx = upgradeEffects(s)) {
  let r = s.legacyRate;
  for (const p of stageData(s).producers) if (!p.makes) r += s.producers[p.id] * producerOutput(s, p.id, fx);
  if (stageData(s).homes) r += homeWork(s) * homeOutput(s, fx);
  return r;
}
// Computers in homes, each weighted by its model's speed (Model 1 = 1).
export function homeWork(s) {
  let w = 0;
  for (const m of s.models) w += m.homes * m.speed;
  return w;
}
// Operations per second from one Model 1 in a home (a model N computer runs its model's speed × this).
export function homeOutput(s, fx = upgradeEffects(s)) {
  const h = stageData(s).homes;
  return h ? h.output * (fx.mul.home || 1) * fx.globalMul : 0;
}

export function getClickValue(s, fx = upgradeEffects(s)) {
  const st = stageData(s);
  const base = st.clickLegacyFrac ? st.clickLegacyFrac * s.legacyRate : CONFIG.clickBase;
  return base * fx.clickMul + fx.clickPct * getRate(s, fx);
}

// Totals since this stage began (conditions and the goal use these, not the all-time numbers).
export function stageTotal(s) { return s.lifetime - s.stageStart.lifetime; }
export function stageClicks(s) { return s.clicks - s.stageStart.clicks; }

// The unit word. A stage can rename it partway (checks -> operations); the number never changes.
export function unitName(s) {
  const st = stageData(s);
  return st.unitRenameBeat && s.beats[st.unitRenameBeat] === undefined ? st.unitBefore : st.unit;
}

// Header role: the stage role, or the latest promotion whose condition is met.
export function roleName(s) {
  const st = stageData(s);
  let r = st.role;
  for (const p of st.promotions || []) if (conditionMet(s, p.when)) r = p.role;
  return r;
}

// Fill a stage text template: {n} number, {unit} the current unit word, {goal} the goal name.
export function phrase(s, key, vars = {}) {
  const st = stageData(s);
  let t = st.text[key] || '';
  const all = { unit: unitName(s), goal: st.goal.name.charAt(0).toLowerCase() + st.goal.name.slice(1), ...vars };
  for (const [k, v] of Object.entries(all)) t = t.split(`{${k}}`).join(v);
  return t;
}

// Effective speed = machines + what your clicking currently adds.
export function effectiveRate(s) {
  const fx = upgradeEffects(s);
  return getRate(s, fx) + s._clickRate * getClickValue(s, fx);
}

// ---------- conditions ----------

function conditionMet(s, c) {
  if (!c) return true;
  if (c.lifetime !== undefined && stageTotal(s) < c.lifetime) return false;
  if (c.clicks !== undefined && stageClicks(s) < c.clicks) return false;
  if (c.rate !== undefined && getRate(s) < c.rate) return false;
  if (c.homes !== undefined && s.homes < c.homes) return false;
  if (c.afterGoal !== undefined && !(s.goalAt !== null && s.time >= s.goalAt + c.afterGoal)) return false;
  if (c.legacyTimes !== undefined && !(s.legacyRate > 0 && getRate(s) >= c.legacyTimes * s.legacyRate)) return false;
  if (c.upgrade !== undefined && !(c.upgrade in s.bought)) return false;
  if (c.owned) for (const [id, n] of Object.entries(c.owned)) if ((s.producers[id] || 0) < n) return false;
  if (c.after !== undefined) {
    const t = s.bought[c.after];
    if (t === undefined || s.time < t + (c.delay || 0)) return false;
  }
  return true;
}

// Progress towards a condition, with consistent wording.
// kind: 'lifetime' (made since this stage began, "in total") | 'clicks' ("by hand") | 'owned' (a count) | 'upgrade'.
export function conditionProgress(s, c) {
  const st = stageData(s);
  if (c.lifetime !== undefined && stageTotal(s) < c.lifetime)
    return { kind: 'lifetime', phrase: phrase(s, 'lifetime', { n: fmt(c.lifetime) }), unitLabel: 'in total',
             have: stageTotal(s), need: c.lifetime };
  if (c.clicks !== undefined && stageClicks(s) < c.clicks)
    return { kind: 'clicks', phrase: phrase(s, 'clicks', { n: fmtInt(c.clicks) }), unitLabel: 'by hand',
             have: stageClicks(s), need: c.clicks };
  if (c.homes !== undefined && s.homes < c.homes)
    return { kind: 'homes', phrase: `Get ${fmt(c.homes)} computers into homes`, unitLabel: '', have: s.homes, need: c.homes };
  if (c.owned) for (const [id, n] of Object.entries(c.owned)) {
    if ((s.producers[id] || 0) < n) {
      const p = st.producers.find(x => x.id === id);
      return { kind: 'owned', target: id, phrase: `${p.verb} ${n} ${p.short}`, unitLabel: p.short,
               have: s.producers[id] || 0, need: n };
    }
  }
  if (c.upgrade !== undefined && !(c.upgrade in s.bought)) {
    const u = st.upgrades.find(x => x.id === c.upgrade);
    return { kind: 'upgrade', phrase: `Buy "${u.name}"`, unitLabel: '', have: 0, need: 1 };
  }
  return null;
}

// ---------- actions ----------

export function click(s, n = 1) {
  if (!isActive(s) && s.phase !== 'ending') return 0;
  const v = getClickValue(s) * n;
  s.ops += v; s.lifetime += v; s.clicks += n; s._clickAcc += n;
  return v;
}

// ---------- selling computer time (a second currency: dollars) ----------
// Part of the speed can be sold to customers. Sold operations still count towards the stage goal,
// but they earn dollars instead of spendable operations. Customers only pay for what they want.

export function sellOpen(s) {
  const m = stageData(s).market;
  return !!m && s.phase === 'playing' && conditionMet(s, m.reveal);
}
export function marketKind(s) { return stageData(s).market?.kind || 'sell'; }
export function sellShare(s) { return sellOpen(s) && marketKind(s) === 'sell' ? s.sell : 0; }
export function moneyPerOp(s, fx = upgradeEffects(s)) { return (stageData(s).market?.price || 0) * fx.priceMul; }
// Operations per second that customers want: the sum of every customer who has arrived.
export function sellDemand(s) {
  const m = stageData(s).market;
  if (!m || m.kind === 'models') return 0;
  let d = 0;
  for (const c of m.customers) if (s.beats[c.id] !== undefined) d += c.demand;
  return d;
}
export function customers(s) {
  const m = stageData(s).market;
  return m ? m.customers.filter(c => s.beats[c.id] !== undefined) : [];
}
// What selling does right now: offered and paid operations per second, and dollars per second.
export function sellFlow(s, fx = upgradeEffects(s)) {
  const offered = sellShare(s) * getRate(s, fx);
  const paid = Math.min(offered, sellDemand(s));
  return { offered, paid, dollarsPerSec: paid * moneyPerOp(s, fx) };
}
export function setSell(s, share) {
  const m = stageData(s).market;
  if (!m || m.kind === 'models' || !m.levels.includes(share)) return false;
  s.sell = share;
  return true;
}

// ---------- launching models (Stage 3) ----------
// Workbenches and factories make computers; buyers take the model on sale. Every computer sold keeps
// running in someone's home at its model's speed. The lab keeps designing the next model: it gets better
// fast, then slows down near the limit of the current chip. You choose when to launch it. Launching
// starts a new model with fresh buyers; the old one stops selling. Owners tell friends (word of mouth).
export function capacity(s, fx = upgradeEffects(s)) {
  let c = 0;
  for (const p of stageData(s).producers) if (p.makes) c += s.producers[p.id] * producerOutput(s, p.id, fx);
  return c;
}
const modelMarket = (s) => { const m = stageData(s).market; return m && m.kind === 'models' ? m : null; };
export function modelOnSale(s) { return s.models.length; }
export function modelAge(s) { return s.time - s.modelAt; }
// The most the lab can make the next model, as a multiple of the model on sale.
export function labLimit(s, fx = upgradeEffects(s)) { const m = modelMarket(s); return m ? m.labMax + fx.labMax : 1; }
// How much faster the lab's next model is than the one on sale: an S-curve up to the limit.
// A bigger leap takes longer to design (time × √(limit − 1)).
export function labRatio(s, fx = upgradeEffects(s), age = modelAge(s)) {
  const m = modelMarket(s);
  if (!m) return 1;
  const L = labLimit(s, fx);
  const p = Math.max(0, age) / (m.labTime * Math.sqrt(L - 1));
  const k = Math.pow(p, m.labShape);
  return 1 + (L - 1) * k / (1 + k);
}
// Where the lab is on its curve: 'start' · 'fast' · 'slowing' (the best time to launch has passed) · 'limit'.
export function labPhase(s, fx = upgradeEffects(s)) {
  const m = modelMarket(s), a = modelAge(s), L = labLimit(s, fx), r = labRatio(s, fx, a);
  if (r >= 1 + 0.8 * (L - 1)) return 'limit';
  if (r < m.minRatio) return 'start';
  // The average gain per second, ln(ratio)/age, peaks at the best moment to launch.
  return Math.log(labRatio(s, fx, a + 1)) / (a + 1) < Math.log(r) / a ? 'slowing' : 'fast';
}
// Buyers for the model on sale: many at launch, then fewer as everyone who wanted one has one.
export function freshness(s, fx = upgradeEffects(s), age = modelAge(s)) {
  const m = modelMarket(s);
  return m.fadeFloor + (m.surge - m.fadeFloor) * Math.pow(0.5, age / (m.fadeHalf * fx.fadeMul));
}
// Buyers a second: the markets that have opened plus word of mouth, times how fresh the model is.
export function modelDemand(s, fx = upgradeEffects(s), age = modelAge(s)) {
  const m = modelMarket(s);
  if (!m) return 0;
  let d = m.wordOfMouth * s.homes;
  for (const c of m.customers) if (s.beats[c.id] !== undefined) d += c.demand;
  return d * fx.demandMul * freshness(s, fx, age);
}
export function modelFlow(s, fx = upgradeEffects(s)) {
  const cap = capacity(s, fx), demand = modelDemand(s, fx);
  const sold = sellOpen(s) ? Math.min(cap, demand) : 0;
  return { capacity: cap, demand, sold, dollarsPerSec: sold * (modelMarket(s)?.price || 0) * fx.priceMul };
}
// Why the launch button is off, or null when you can launch.
export function launchBlock(s, fx = upgradeEffects(s)) {
  const m = modelMarket(s);
  if (!m || s.phase !== 'playing' || !sellOpen(s)) return 'closed';
  if (capacity(s, fx) <= 0) return 'workbench';
  if (labRatio(s, fx) < m.minRatio) return 'lab';
  return null;
}
export function canLaunch(s) { return launchBlock(s) === null; }
export function launchModel(s, byEngineers = false) {
  if (!canLaunch(s)) return false;
  const m = modelMarket(s), r = labRatio(s);
  const prev = s.models[s.models.length - 1];
  s.models.push({ speed: prev.speed * r, homes: 0 });
  s.modelAt = s.time; s.sales = []; s.salesNext = s.time;
  const n = s.models.length;
  const line = m.modelLines?.[n] || 'It is faster, and the shops want it.';
  const who = byEngineers
    ? (s.engineersShipped ? 'Your engineers ship' : 'Your engineers stop waiting for you and ship')
    : 'You launch';
  if (byEngineers) s.engineersShipped = true;
  addLog(s, `${who} Model ${n}, ${fmtRatio(r)} as fast as Model ${n - 1}. ${line}`, null, 'model');
  return true;
}
function fmtRatio(r) { return `${(Math.round(r * 10) / 10).toFixed(1)}×`; }
export function setMarket(s, v) { return setSell(s, v); }
export function marketValue(s) { return s.sell; }
// Dollars per second right now, whatever the market.
export function moneyRate(s, fx = upgradeEffects(s)) {
  return marketKind(s) === 'models' ? modelFlow(s, fx).dollarsPerSec : sellFlow(s, fx).dollarsPerSec;
}
// Which balance an item is paid from.
export function wallet(s, item) { return item.currency === 'dollars' ? s.dollars : s.ops; }
function pay(s, item, cost) { if (item.currency === 'dollars') s.dollars -= cost; else s.ops -= cost; }
export function producerById(s, id) { return stageData(s).producers.find(p => p.id === id); }

export function buyProducer(s, id) {
  // After the stage goal the team is complete: no more hiring, everything goes to the finale.
  if (s.phase !== 'playing' || !producerUnlocked(s, id)) return false;
  const cost = producerCost(s, id);
  const p = producerById(s, id);
  if (wallet(s, p) < cost) return false;
  pay(s, p, cost);
  s.producers[id] += 1;
  checkBeats(s);
  return true;
}

export function upgradeById(s, id) { return stageData(s).upgrades.find(u => u.id === id); }

export function canBuyUpgrade(s, id) {
  const u = upgradeById(s, id);
  return !!u && isActive(s) && s.revealed[id] !== undefined && !(id in s.bought) && wallet(s, u) >= u.cost;
}

export function buyUpgrade(s, id, optionId) {
  const u = upgradeById(s, id);
  if (!canBuyUpgrade(s, id)) return false;
  if (u.effect.type === 'choice') {
    if (!u.effect.options.some(o => o.id === optionId)) return false;
    s.choices[id] = optionId;
  }
  pay(s, u, u.cost);
  s.bought[id] = s.time;
  addLog(s, u.log, u.date, 'upgrade');
  checkBeats(s);
  return true;
}

// The stage goal is a total-production milestone, not a purchase: spending never delays it.
// Once reached, the player clicks it (it is free) and the finale begins.
export function canBuyGoal(s) { return s.phase === 'playing' && stageTotal(s) >= stageData(s).goal.lifetime; }

export function buyGoal(s) {
  if (!canBuyGoal(s)) return false;
  const g = stageData(s).goal;
  addLog(s, g.log, g.date, 'milestone');
  s.goalDone = true;
  s.goalAt = s.time;
  s.phase = 'finale';
  s.finaleIndex = 0;
  return true;
}

// Finale: the last actions of the stage, bought one after another with the stage's unit.
export function currentFinale(s) {
  if (s.phase !== 'finale') return null;
  return stageData(s).finale[s.finaleIndex] || null;
}
export function canBuyFinale(s) { const f = currentFinale(s); return !!f && s.ops >= f.cost; }
export function buyFinale(s) {
  if (!canBuyFinale(s)) return false;
  const f = currentFinale(s);
  s.ops -= f.cost;
  addLog(s, f.log, f.date, 'milestone');
  s.finaleIndex += 1;
  if (s.finaleIndex >= stageData(s).finale.length) {
    s.phase = 'ending';
    s.endingIndex = 0;
    s.endingAt = s.time;
  }
  return true;
}

// The handover: machines fold into one Legacy line that keeps the exact rate, then the next stage opens.
export function passLedger(s) {
  if (s.phase !== 'handover') return false;
  const rate = getRate(s);          // computed with the OLD stage's data
  const st = stageData(s);
  for (const p of st.producers) s.producers[p.id] = 0;
  s.homes = 0; s.models = [];       // computers in homes fold into the legacy too
  s.legacyRate = rate;              // (enterStage clears bought/choices/revealed; with no next stage they stay, so the role stays)
  if (STAGES[s.stage + 1]) enterStage(s, s.stage + 1, st.next);
  else {                            // the next stage is not built yet
    addLog(s, st.next.text, st.next.date, 'milestone');
    s.phase = 'next';
  }
  return true;
}

// A fresh game that starts at stage n, as if the earlier stages had just been played
// (each stage's `arrival` holds what a typical player carries into it). Used by the dev buttons and the simulator.
export function startAtStage(n, over = {}) {
  const s = createState();
  for (let k = 2; k <= n && STAGES[k]; k++) {
    const a = { ...STAGES[k].arrival, ...(k === n ? over : {}) };
    s.stage = k - 1;
    s.producers = Object.fromEntries(STAGES[k - 1].producers.map(p => [p.id, 0]));
    s.legacyRate = a.legacyRate; s.ops = a.ops;
    s.lifetime = Math.max(s.lifetime, a.lifetime ?? a.ops); s.clicks = Math.max(s.clicks, a.clicks ?? 0);
    s.time = Math.max(s.time, a.time ?? 0);
    s.phase = 'handover';
    passLedger(s);
  }
  return s;
}

// bridge: the old stage's last line, shown under the new stage's divider.
export function enterStage(s, n, bridge = null) {
  const st = STAGES[n];
  s.stage = n;
  s.producers = Object.fromEntries(st.producers.map(p => [p.id, 0]));
  s.bought = {}; s.choices = {}; s.revealed = {}; s.beats = {};
  s.lastRevealAt = -Infinity; s.hushUntil = 0;
  s.goalDone = false; s.goalAt = null; s.finaleIndex = 0; s.endingIndex = 0; s.endingAt = 0;
  // Money does not cross stages (it belonged to the old job); a stage may start with some savings.
  s.dollars = st.startDollars ?? 0;
  s.homes = 0;
  s.models = st.market?.kind === 'models' ? [{ speed: 1, homes: 0 }] : [];   // Model 1 is on sale from the start
  s.modelAt = s.time; s.sales = []; s.salesNext = s.time; s.engineersShipped = false;
  s.stageStart = { time: s.time, lifetime: s.lifetime, clicks: s.clicks };
  s.phase = 'playing';
  addLog(s, st.title, bridge?.date ?? null, 'stage');
  if (bridge) addLog(s, bridge.text, bridge.date, 'milestone');
  checkBeats(s);                    // the stage's opening line
}

// ---------- time ----------

export function tick(s, dt) {
  if (!(dt > 0)) return;
  s.time += dt;
  const fx = upgradeEffects(s);
  const rate = getRate(s, fx);
  // Production pauses on the "Pass the ledger on" screen, so nobody starts the next stage rich.
  const gain = isActive(s) || s.phase === 'ending' ? rate * dt : 0;
  const sold = gain * sellShare(s);
  s.ops += gain - sold; s.lifetime += gain;
  if (sold > 0) s.dollars += Math.min(sold, sellDemand(s) * dt) * moneyPerOp(s, fx);
  if (marketKind(s) === 'models' && sellOpen(s)) {   // Stage 3: computers leave for homes, money comes in
    const f = modelFlow(s, fx);
    s.homes += f.sold * dt; s.models[s.models.length - 1].homes += f.sold * dt;
    s.dollars += f.dollarsPerSec * dt;
    if (s.time >= s.salesNext) {    // one chart bar every 2 s, the last two minutes kept
      s.sales.push(Math.round(f.demand * 100) / 100);
      if (s.sales.length > 60) s.sales.shift();
      s.salesNext = s.time + 2;
    }
    // The engineers ship a model that is close to the chip's limit themselves.
    const m = stageData(s).market;
    if (capacity(s, fx) > 0 && labRatio(s, fx) >= 1 + m.autoAt * (labLimit(s, fx) - 1)) launchModel(s, true);
  }

  // smoothed click rate (time constant ~3 s)
  const k = Math.min(1, dt / 3);
  s._clickRate += (s._clickAcc / dt - s._clickRate) * k;
  s._clickAcc = 0;

  if (isActive(s)) {
    revealUpgrades(s);
    checkBeats(s);
  } else if (s.phase === 'ending') {
    const st = stageData(s);
    while (s.endingIndex < st.ending.length &&
           s.time >= s.endingAt + (s.endingIndex + 1) * CONFIG.endingBeatGapSec) {
      const b = st.ending[s.endingIndex++];
      addLog(s, b.text, b.date, 'story');
    }
    if (s.endingIndex >= st.ending.length) s.phase = 'handover';
  }
}

function revealUpgrades(s) {
  const st = stageData(s);
  if (s.time - s.lastRevealAt < CONFIG.revealGapSec || s.time < s.hushUntil) return;
  const open = st.upgrades.filter(u => s.revealed[u.id] !== undefined && !(u.id in s.bought)).length;
  if (open >= CONFIG.maxOpenUpgrades) return;
  // Reveal the first upgrade (in data order) whose condition is met.
  for (const u of st.upgrades) {
    if (s.revealed[u.id] !== undefined) continue;
    if (conditionMet(s, u.reveal)) {
      s.revealed[u.id] = s.time;
      s.lastRevealAt = s.time;
      return;
    }
  }
}

function checkBeats(s) {
  const st = stageData(s);
  const all = st.market ? [...st.beats, ...st.market.customers] : st.beats;
  for (const b of all) {
    if (s.time < s.hushUntil) return;
    if (s.beats[b.id] !== undefined) continue;
    if (conditionMet(s, b.when)) {
      s.beats[b.id] = s.time;
      addLog(s, b.text, b.date, b.kind || 'story');
      if (b.hush) s.hushUntil = s.time + b.hush;
    }
  }
}

export function note(s, text, kind = 'note') { addLog(s, text, null, kind); }

function addLog(s, text, date, kind) {
  // The ledger only moves forward: an entry is stamped with the current date (never earlier).
  if (date && date > s.date) s.date = date;
  s.log.unshift({ t: s.time, date: s.date, text, kind });
  if (s.log.length > CONFIG.logMax) s.log.length = CONFIG.logMax;
}

// ---------- what the player should aim at ----------

// The next locked upgrade (not yet revealed), shown as a grey card with its unlock condition.
export function nextLocked(s) {
  if (!isActive(s)) return null;
  for (const u of stageData(s).upgrades) {
    if (s.revealed[u.id] !== undefined) continue;
    return { upgrade: u, progress: conditionProgress(s, u.reveal) };
  }
  return null;
}

// The goal bar: the stage goal (then the finale steps). Never null while active.
// Returns { text, have, need, kind, unitLabel, ready, eta }.
//   kind 'balance' = spendable (finale) · 'lifetime' = made this stage · 'ready'.
export function currentGoal(s) {
  const st = stageData(s);
  if (s.phase === 'finale') {
    const f = currentFinale(s);
    if (!f) return null;
    if (s.ops >= f.cost) return { text: f.name, kind: 'ready', ready: true, have: 1, need: 1 };
    return { text: `Save up for "${f.name}"`, kind: 'balance', unitLabel: unitName(s), have: s.ops, need: f.cost, eta: true };
  }
  if (s.phase !== 'playing') return null;
  // The goal bar tracks only the stage goal, in one unit (checks in total). It does not tell the
  // player which upgrade to buy: the cards show their own progress, the locked card shows what unlocks next.
  if (canBuyGoal(s)) return { text: st.goal.name, kind: 'ready', ready: true, have: 1, need: 1 };
  return { text: phrase(s, 'goal', { n: fmt(st.goal.lifetime) }),
           kind: 'lifetime', unitLabel: 'in total', have: stageTotal(s), need: st.goal.lifetime, eta: true,
           frac: stageProgress(s) };
}

function fmtInt(n) { return Math.round(n).toLocaleString('en-US'); }

// Stage progress, 0..1. (total / goal)^0.3 moves roughly evenly in time for an exponential curve.
export function stageProgress(s) {
  const g = stageData(s).goal.lifetime;
  if (s.phase !== 'playing') return 1;
  return Math.min(1, Math.pow(Math.max(0, stageTotal(s)) / g, 0.3));
}

// ---------- save / load ----------

export function serialize(s) {
  const out = {};
  for (const [k, v] of Object.entries(s)) if (!k.startsWith('_')) out[k] = v;
  out.lastRevealAt = Number.isFinite(s.lastRevealAt) ? s.lastRevealAt : null;
  return JSON.stringify(out);
}

export function deserialize(json) {
  let data;
  try { data = JSON.parse(json); } catch { return null; }
  if (!data || typeof data !== 'object' || !(data.version >= 1 && data.version <= SAVE_VERSION) || !STAGES[data.stage]) return null;
  // Missing fields (older saves) take their defaults from a fresh state.
  const base = createState();
  const s = { ...base, ...data };
  if (s.lastRevealAt === null) s.lastRevealAt = -Infinity;
  s.producers = { ...Object.fromEntries(STAGES[s.stage].producers.map(p => [p.id, 0])), ...data.producers };
  s._clickAcc = 0; s._clickRate = 0;
  // v1 -> v2: stage-relative totals; a finished Stage 1 save moves on to Stage 2.
  if (data.version === 1) {
    s.stageStart = { time: 0, lifetime: 0, clicks: 0 };
    s.hushUntil = 0;
    s.version = SAVE_VERSION;
  }
  // v4 -> v5: the price tag became models. Computers already in homes become Model 1s.
  delete s.price;
  if (STAGES[s.stage].market?.kind === 'models' && !s.models.length) {
    s.models = [{ speed: 1, homes: s.homes }]; s.modelAt = s.time; s.sales = []; s.salesNext = s.time;
  }
  // A save that finished the last built stage moves on once the next stage exists.
  if (s.phase === 'next' && STAGES[s.stage + 1]) enterStage(s, s.stage + 1);
  s.version = SAVE_VERSION;
  return s;
}

// Apply time away in bounded chunks. Returns the total made (sold time included).
export function applyOffline(s, seconds) {
  const sec = Math.max(0, Math.min(seconds, CONFIG.offlineMaxSec));
  const before = s.lifetime;
  const chunks = Math.min(1000, Math.ceil(sec / 1));
  for (let i = 0; i < chunks; i++) tick(s, sec / chunks);
  return s.lifetime - before;
}
