// Core engine. Pure logic, no DOM: the browser and the simulator run this same file.
// All functions take the state object and mutate it. Fields starting with '_' are transient (never saved).

import { CONFIG } from './config.js';
import { STAGE1 } from './data/stage1.js';
import { STAGE2 } from './data/stage2.js';

export const STAGES = { 1: STAGE1, 2: STAGE2 };
export const SAVE_VERSION = 3;

export function stageData(s) { return STAGES[s.stage]; }

// 'playing' = building up; 'finale' = Colossus built, last actions of the stage. Both are interactive.
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
    bestRate: 0,
    phase: 'playing', // 'playing' | 'finale' | 'ending' | 'handover' | 'next'
    goalDone: false,
    finaleIndex: 0,
    endingIndex: 0,
    endingAt: 0,
    legacyRate: 0,
    stageStart: { time: 0, lifetime: 0, clicks: 0 }, // conditions and the goal count from here
    hushUntil: 0,     // no reveals or story lines until then (a quiet moment after a heavy beat)
    dollars: 0,       // money from selling computer time (Stage 2 on)
    sell: 0.25,       // share of computer time offered to customers
    _clickAcc: 0,
    _clickRate: 0,    // smoothed clicks per second (for the speedometer)
  };
  checkBeats(s);
  return s;
}

// ---------- derived numbers ----------

function upgradeEffects(s) {
  const st = stageData(s);
  const fx = { clickMul: 1, clickPct: 0, globalMul: 1, synergy: 0, priceMul: 1, mul: {}, growth: {}, unlocked: {} };
  const apply = (e) => {
    switch (e.type) {
      case 'clickMul': fx.clickMul *= e.value; break;
      case 'clickPct': fx.clickPct += e.value; break;
      case 'globalMul': fx.globalMul *= e.value; break;
      case 'synergy': fx.synergy += e.value; break;
      case 'producerMul': fx.mul[e.target] = (fx.mul[e.target] || 1) * e.value; break;
      case 'costGrowth': fx.growth[e.target] = e.value; break;
      case 'priceMul': fx.priceMul *= e.value; break;
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

export function getRate(s, fx = upgradeEffects(s)) {
  let r = s.legacyRate;
  for (const p of stageData(s).producers) r += s.producers[p.id] * producerOutput(s, p.id, fx);
  return r;
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
  if (c.legacyTimes !== undefined && !(s.legacyRate > 0 && getRate(s) >= c.legacyTimes * s.legacyRate)) return false;
  if (c.upgrade !== undefined && !(c.upgrade in s.bought)) return false;
  if (c.owned) for (const [id, n] of Object.entries(c.owned)) if ((s.producers[id] || 0) < n) return false;
  if (c.after !== undefined) {
    const t = s.bought[c.after];
    if (t === undefined || s.time < t + (c.delay || 0)) return false;
  }
  return true;
}

// Progress towards a condition, for "Needs X. You have Y." Returns {label, have, need} or null.
// Progress towards a condition, with consistent wording.
// kind: 'lifetime' (checks ever made, "in total") | 'clicks' ("by hand") | 'owned' (a count) | 'upgrade'.
export function conditionProgress(s, c) {
  const st = stageData(s);
  if (c.lifetime !== undefined && stageTotal(s) < c.lifetime)
    return { kind: 'lifetime', phrase: phrase(s, 'lifetime', { n: fmtInt(c.lifetime) }), unitLabel: 'in total',
             have: stageTotal(s), need: c.lifetime };
  if (c.clicks !== undefined && stageClicks(s) < c.clicks)
    return { kind: 'clicks', phrase: phrase(s, 'clicks', { n: fmtInt(c.clicks) }), unitLabel: 'by hand',
             have: stageClicks(s), need: c.clicks };
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
export function sellShare(s) { return sellOpen(s) ? s.sell : 0; }
export function moneyPerOp(s, fx = upgradeEffects(s)) { return (stageData(s).market?.price || 0) * fx.priceMul; }
// Operations per second that customers want: the sum of every customer who has arrived.
export function sellDemand(s) {
  const m = stageData(s).market;
  if (!m) return 0;
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
  if (!m || !m.levels.includes(share)) return false;
  s.sell = share;
  return true;
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
  s.phase = 'finale';
  s.finaleIndex = 0;
  return true;
}

// Finale: the last actions of the stage, bought one after another with checks.
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
  s.bought = {}; s.choices = {}; s.revealed = {};
  s.legacyRate = rate;
  addLog(s, st.next.text, st.next.date, 'milestone');
  if (STAGES[s.stage + 1]) enterStage(s, s.stage + 1);
  else s.phase = 'next';            // the next stage is not built yet
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

export function enterStage(s, n) {
  const st = STAGES[n];
  s.stage = n;
  s.producers = Object.fromEntries(st.producers.map(p => [p.id, 0]));
  s.bought = {}; s.choices = {}; s.revealed = {}; s.beats = {};
  s.lastRevealAt = -Infinity; s.hushUntil = 0;
  s.goalDone = false; s.finaleIndex = 0; s.endingIndex = 0; s.endingAt = 0;
  s.stageStart = { time: s.time, lifetime: s.lifetime, clicks: s.clicks };
  s.phase = 'playing';
  addLog(s, st.title, null, 'stage');
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
  if (rate > s.bestRate) s.bestRate = rate;

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

// One short-horizon goal for the goal bar. Never null while playing.
// The goal bar: the stage goal (then the finale steps). Never null while active.
// Returns { text, have, need, kind, unitLabel, ready, eta }.
//   kind 'balance' = checks you have (spendable) · 'lifetime' = checks in total · 'owned'/'clicks' = counts.
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
  return { text: phrase(s, 'goal', { n: fmtInt(st.goal.lifetime) }),
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
    if (s.stage === 1 && s.phase === 'next') enterStage(s, 2);
  }
  s.version = SAVE_VERSION;
  return s;
}

// Apply time away in bounded chunks. Returns ops gained.
export function applyOffline(s, seconds) {
  const sec = Math.max(0, Math.min(seconds, CONFIG.offlineMaxSec));
  const before = s.lifetime;
  const chunks = Math.min(1000, Math.ceil(sec / 1));
  for (let i = 0; i < chunks; i++) tick(s, sec / chunks);
  return s.lifetime - before;
}
