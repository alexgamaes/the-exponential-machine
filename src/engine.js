// Core engine. Pure logic, no DOM: the browser and the simulator run this same file.
// All functions take the state object and mutate it. Fields starting with '_' are transient (never saved).

import { CONFIG } from './config.js';
import { STAGE1 } from './data/stage1.js';

export const STAGES = { 1: STAGE1 };
export const SAVE_VERSION = 1;

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
    _clickAcc: 0,
    _clickRate: 0,    // smoothed clicks per second (for the speedometer)
  };
  checkBeats(s);
  return s;
}

// ---------- derived numbers ----------

function upgradeEffects(s) {
  const st = stageData(s);
  const fx = { clickMul: 1, clickPct: 0, globalMul: 1, synergy: 0, mul: {}, growth: {}, unlocked: {} };
  const apply = (e) => {
    switch (e.type) {
      case 'clickMul': fx.clickMul *= e.value; break;
      case 'clickPct': fx.clickPct += e.value; break;
      case 'globalMul': fx.globalMul *= e.value; break;
      case 'synergy': fx.synergy += e.value; break;
      case 'producerMul': fx.mul[e.target] = (fx.mul[e.target] || 1) * e.value; break;
      case 'costGrowth': fx.growth[e.target] = e.value; break;
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
  if (id === 'clerk' && fx.synergy) out *= 1 + fx.synergy * (s.producers.machine || 0);
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
  return CONFIG.clickBase * fx.clickMul + fx.clickPct * getRate(s, fx);
}

// Effective speed = machines + what your clicking currently adds.
export function effectiveRate(s) {
  const fx = upgradeEffects(s);
  return getRate(s, fx) + s._clickRate * getClickValue(s, fx);
}

// ---------- conditions ----------

function conditionMet(s, c) {
  if (!c) return true;
  if (c.lifetime !== undefined && s.lifetime < c.lifetime) return false;
  if (c.clicks !== undefined && s.clicks < c.clicks) return false;
  if (c.rate !== undefined && getRate(s) < c.rate) return false;
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
  if (c.lifetime !== undefined && s.lifetime < c.lifetime)
    return { kind: 'lifetime', phrase: `Check ${fmtInt(c.lifetime)} guesses in total`, unitLabel: 'in total',
             have: s.lifetime, need: c.lifetime };
  if (c.clicks !== undefined && s.clicks < c.clicks)
    return { kind: 'clicks', phrase: `Check ${fmtInt(c.clicks)} guesses by hand`, unitLabel: 'by hand',
             have: s.clicks, need: c.clicks };
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

export function buyProducer(s, id) {
  // After Colossus the team is complete: no more hiring, every check goes to the finale.
  if (s.phase !== 'playing' || !producerUnlocked(s, id)) return false;
  const cost = producerCost(s, id);
  if (s.ops < cost) return false;
  s.ops -= cost;
  s.producers[id] += 1;
  checkBeats(s);
  return true;
}

export function upgradeById(s, id) { return stageData(s).upgrades.find(u => u.id === id); }

export function canBuyUpgrade(s, id) {
  const u = upgradeById(s, id);
  return !!u && isActive(s) && s.revealed[id] !== undefined && !(id in s.bought) && s.ops >= u.cost;
}

export function buyUpgrade(s, id, optionId) {
  const u = upgradeById(s, id);
  if (!canBuyUpgrade(s, id)) return false;
  if (u.effect.type === 'choice') {
    if (!u.effect.options.some(o => o.id === optionId)) return false;
    s.choices[id] = optionId;
  }
  s.ops -= u.cost;
  s.bought[id] = s.time;
  addLog(s, u.log, u.date, 'upgrade');
  checkBeats(s);
  return true;
}

// The stage goal is a total-production milestone, not a purchase: spending never delays it.
// Once reached, the player clicks it (it is free) and the finale begins.
export function canBuyGoal(s) { return s.phase === 'playing' && s.lifetime >= stageData(s).goal.lifetime; }

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

// The handover: machines fold into one Legacy line that keeps the exact rate.
export function passLedger(s) {
  if (s.phase !== 'handover') return false;
  const rate = getRate(s);
  const st = stageData(s);
  for (const p of st.producers) s.producers[p.id] = 0;
  s.bought = {}; s.choices = {}; s.revealed = {};
  s.legacyRate = rate;
  addLog(s, st.next.text, st.next.date, 'milestone');
  s.phase = 'next'; // Stage 2 is not built yet.
  return true;
}

// ---------- time ----------

export function tick(s, dt) {
  if (!(dt > 0)) return;
  s.time += dt;
  const fx = upgradeEffects(s);
  const rate = getRate(s, fx);
  const gain = rate * dt;
  s.ops += gain; s.lifetime += gain;
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
  if (s.time - s.lastRevealAt < CONFIG.revealGapSec) return;
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
  for (const b of st.beats) {
    if (s.beats[b.id] !== undefined) continue;
    if (conditionMet(s, b.when)) {
      s.beats[b.id] = s.time;
      addLog(s, b.text, b.date, 'story');
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
    return { text: `Save up for "${f.name}"`, kind: 'balance', unitLabel: st.unit, have: s.ops, need: f.cost, eta: true };
  }
  if (s.phase !== 'playing') return null;
  // The goal bar tracks only the stage goal, in one unit (checks in total). It does not tell the
  // player which upgrade to buy: the cards show their own progress, the locked card shows what unlocks next.
  if (canBuyGoal(s)) return { text: st.goal.name, kind: 'ready', ready: true, have: 1, need: 1 };
  return { text: `Check ${fmtInt(st.goal.lifetime)} guesses in total to ${st.goal.name.charAt(0).toLowerCase() + st.goal.name.slice(1)}`,
           kind: 'lifetime', unitLabel: 'in total', have: s.lifetime, need: st.goal.lifetime, eta: true,
           frac: stageProgress(s) };
}

function fmtInt(n) { return Math.round(n).toLocaleString('en-US'); }

// Stage progress, 0..1. (total / goal)^0.3 moves roughly evenly in time for an exponential curve.
export function stageProgress(s) {
  const g = stageData(s).goal.lifetime;
  if (s.phase !== 'playing') return 1;
  return Math.min(1, Math.pow(s.lifetime / g, 0.3));
}

// ---------- save / load ----------

export function serialize(s) {
  const out = {};
  for (const [k, v] of Object.entries(s)) if (!k.startsWith('_')) out[k] = v;
  out.lastRevealAt = Number.isFinite(s.lastRevealAt) ? s.lastRevealAt : null;
  return JSON.stringify(out);
}

export function deserialize(json) {
  const base = createState();
  let data;
  try { data = JSON.parse(json); } catch { return null; }
  if (!data || data.version !== SAVE_VERSION) return null;
  const s = { ...base, ...data };
  if (s.lastRevealAt === null) s.lastRevealAt = -Infinity;
  s.producers = { ...base.producers, ...data.producers };
  s._clickAcc = 0; s._clickRate = 0;
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
