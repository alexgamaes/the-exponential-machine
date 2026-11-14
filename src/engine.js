// Core engine. Pure logic, no DOM: the browser and the simulator run this same file.
// All functions take the state object and mutate it. Fields starting with '_' are transient (never saved).

import { CONFIG } from './config.js';
import { fmt } from './format.js';
import { STAGE1 } from './data/stage1.js';
import { STAGE2 } from './data/stage2.js';
import { STAGE3 } from './data/stage3.js';

export const STAGES = { 1: STAGE1, 2: STAGE2, 3: STAGE3 };
export const SAVE_VERSION = 6;

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
    models: [],       // Stage 3: every model launched, [{ speed (× Model 1), homes (sold), series, kind }]; the last is on sale
    series: [],       // Stage 3: computer series, [{ homes, programs, bonus }]; programs run on every computer of their series
    design: null,     // Stage 3: the new series being designed { start, gain, base }
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
  const fx = { clickMul: 1, clickPct: 0, globalMul: 1, synergy: 0, priceMul: 1, demandMul: 1, fadeMul: 1, nextAdd: 0, leapAdd: 0, devMul: 1, progMul: 1, carry: 0, mul: {}, growth: {}, unlocked: {} };
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
      case 'nextAdd': fx.nextAdd += e.value; break;     // next models leap further
      case 'leapAdd': fx.leapAdd += e.value; break;     // new series leap further (chips)
      case 'devMul': fx.devMul *= e.value; break;       // outsiders write programs faster
      case 'progMul': fx.progMul *= e.value; break;     // all programs written faster
      case 'carry': fx.carry = Math.max(fx.carry, e.value); break;  // share of programs a new series keeps
      case 'unlock': fx.unlocked[e.target] = true; break;
      case 'multi': for (const x of e.effects) apply(x); break;
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
// Computers in homes, each weighted by its model's speed and its series' programs (Model 1, no programs = 1).
export function homeWork(s) {
  let w = 0;
  for (const m of s.models) w += m.homes * m.speed * seriesMul(s, m.series ?? 0);
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

// ---------- launching models and series (Stage 3) ----------
// Workbenches and factories make computers; buyers take the model on sale. Every computer sold keeps running
// in someone's home at its model's speed. A SERIES is a line of computers that run the same programs.
// Programs are written for the series on sale (more, the more of it are in homes), and every program makes
// every computer of that series run better, including the ones sold long ago.
// The lab designs two things: the NEXT MODEL in the series (a small leap; keeps every program) and, once a new
// chip arrives, a NEW SERIES (a big leap, but none of the old programs run on it; Closed keeps most of them).
// Every launch retools the factories for a while. Buyers come in a wave after each launch, then fade.
const modelMarket = (s) => { const m = stageData(s).market; return m && m.kind === 'models' ? m : null; };
export function capacity(s, fx = upgradeEffects(s)) {
  let c = 0;
  for (const p of stageData(s).producers) if (p.makes === 'computers') c += s.producers[p.id] * producerOutput(s, p.id, fx);
  return c * retoolFactor(s);
}
export function modelOnSale(s) { return s.models.length; }
export function modelAge(s) { return s.time - s.modelAt; }
export function seriesOnSale(s) { return s.series.length; }
const curSeries = (s) => s.series[s.series.length - 1];
// After a launch the factories retool: they restart at `floor` and are back to full after the retool time.
export function retoolTime(s, kind) { const m = modelMarket(s); return m?.retool?.[kind] || 0; }
export function retoolFactor(s, age = modelAge(s)) {
  const m = modelMarket(s), last = s.models[s.models.length - 1];
  if (!m?.retool || !last?.kind) return 1;
  const T = retoolTime(s, last.kind);
  return T > 0 ? Math.min(1, m.retool.floor + (1 - m.retool.floor) * age / T) : 1;
}
export function retoolLeft(s) {
  const last = s.models[s.models.length - 1];
  return last?.kind ? Math.max(0, retoolTime(s, last.kind) - modelAge(s)) : 0;
}
// What a series' programs add: its computers run this many times faster.
export function seriesMulOf(m, programs, bonus = 0) { return 1 + Math.max(0, programs) / m.programsPerX + bonus; }
export function seriesMul(s, i) {
  const m = modelMarket(s), x = s.series[i];
  return m && x ? seriesMulOf(m, x.programs, x.bonus) : 1;
}
export function programsOpen(s, fx = upgradeEffects(s)) { return !!fx.unlocked.programs; }
export function newSeriesOpen(s, fx = upgradeEffects(s)) { return !!fx.unlocked.newSeries; }
// Lab progress 0..1 on an S-curve: slow start, fast middle, then it flattens.
export function labProgress(s, age) {
  const m = modelMarket(s);
  const k = Math.pow(Math.max(0, age) / m.labTime, m.labShape);
  return k / (1 + k);
}
export function nextGain(s, fx = upgradeEffects(s)) { return modelMarket(s).nextLeap + fx.nextAdd; }
export function seriesGain(s, fx = upgradeEffects(s)) { return modelMarket(s).seriesLeap + fx.leapAdd; }
export function designAge(s) { return s.design ? s.time - s.design.start : 0; }
export function designProgress(s) { return s.design ? labProgress(s, designAge(s)) : 0; }
// How much faster the lab's design is than the model on sale. A new series is designed against the model that was
// on sale when its design began, so next models launched meanwhile eat into its lead.
export function labRatio(s, kind = 'next', fx = upgradeEffects(s)) {
  if (!modelMarket(s)) return 1;
  const cur = s.models[s.models.length - 1].speed;
  if (kind === 'series') return s.design ? s.design.base * (1 + s.design.gain * designProgress(s)) / cur : 1;
  return 1 + nextGain(s, fx) * labProgress(s, modelAge(s));
}
// Where a design is on its curve: 'start' · 'fast' · 'slowing' (the best time to launch has passed) · 'limit'.
export function labPhase(s, kind = 'next', fx = upgradeEffects(s)) {
  const m = modelMarket(s);
  const a = kind === 'series' ? designAge(s) : modelAge(s);
  const g = kind === 'series' ? (s.design?.gain || 0) : nextGain(s, fx);
  const p = labProgress(s, a);
  if (p >= 0.8) return 'limit';
  if (p < m.minProgress) return 'start';
  const r0 = 1 + g * p, r1 = 1 + g * labProgress(s, a + 1);
  return Math.log(r1) / (a + 1) < Math.log(r0) / a ? 'slowing' : 'fast';
}
// The new-series design runs by itself once a new chip is in: it starts at once, moves to a better chip if one
// arrives while the design is young, and starts over if it finished but next models have overtaken it.
// The newest chip card bought (its name, for the screen and the ledger).
export function chipName(s) {
  const m = modelMarket(s);
  let name = '';
  for (const c of m?.chips || []) if (c.id in s.bought) name = c.name;
  return name;
}
function updateDesign(s, fx) {
  const m = modelMarket(s);
  if (!newSeriesOpen(s, fx)) return;
  const fresh = () => {
    s.design = { start: s.time, gain: seriesGain(s, fx), base: s.models[s.models.length - 1].speed, chip: chipName(s) };
  };
  if (!s.design) return fresh();
  const p = designProgress(s), better = seriesGain(s, fx) > s.design.gain + 1e-9;
  if (better && p < m.restartBefore) {
    fresh();
    return addLog(s, `The lab starts the new series again on ${s.design.chip}: a bigger leap, a longer wait.`, null, 'note');
  }
  if (better && s.design.lateFor !== chipName(s)) {
    s.design.lateFor = chipName(s);
    addLog(s, `${cap(chipName(s))} arrives too late for the design in the lab. The next new series will use it.`, null, 'note');
  }
  if (p >= m.autoAt && labRatio(s, 'series', fx) < 1 + m.minProgress * s.design.gain) {
    fresh();
    addLog(s, 'Your next models have caught up with the new series design. The lab starts a new one.', null, 'note');
  }
}
const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
// Buyers for the model on sale: a wave at launch, then fewer as everyone who wanted one has one.
export function freshness(s, fx = upgradeEffects(s), age = modelAge(s)) {
  const m = modelMarket(s);
  return m.fadeFloor + (m.surge - m.fadeFloor) * Math.pow(0.5, age / (m.fadeHalf * fx.fadeMul));
}
// Buyers a second: markets plus word of mouth, times the launch wave, times the programs it runs (people buy
// the computer that runs the program they want).
export function modelDemand(s, fx = upgradeEffects(s), age = modelAge(s)) {
  const m = modelMarket(s);
  if (!m) return 0;
  let d = m.wordOfMouth * s.homes;
  for (const c of m.customers) if (s.beats[c.id] !== undefined) d += c.demand;
  return d * fx.demandMul * freshness(s, fx, age) * Math.pow(seriesMul(s, s.series.length - 1), m.appeal);
}
export function modelFlow(s, fx = upgradeEffects(s)) {
  const cap = capacity(s, fx), demand = modelDemand(s, fx);
  const sold = sellOpen(s) ? Math.min(cap, demand) : 0;
  return { capacity: cap, demand, sold, dollarsPerSec: sold * (modelMarket(s)?.price || 0) * fx.priceMul };
}
// Programs written a second for the series on sale: outsiders follow its installed base; your programmers add theirs.
export function programRate(s, fx = upgradeEffects(s)) {
  const m = modelMarket(s);
  if (!m || !programsOpen(s, fx)) return 0;
  let own = 0;
  for (const p of stageData(s).producers) if (p.makes === 'programs') own += s.producers[p.id] * producerOutput(s, p.id, fx);
  return (m.outsiders * Math.sqrt(curSeries(s).homes) * fx.devMul + own) * fx.progMul;
}
// Programs a new series would start with (Closed keeps most of yours), and its killer programs.
export function carried(s, fx = upgradeEffects(s)) { return fx.carry * curSeries(s).programs; }
const carriedBonus = (s, fx) => fx.carry > 0 ? curSeries(s).bonus : 0;
// What one computer sold is worth, as a multiple of a Model 1 with no programs: now, or after a launch.
export function saleValue(s, kind = null, fx = upgradeEffects(s)) {
  const m = modelMarket(s), cur = s.models[s.models.length - 1].speed;
  if (!kind) return cur * seriesMul(s, s.series.length - 1);
  if (kind === 'next') return cur * labRatio(s, 'next', fx) * seriesMul(s, s.series.length - 1);
  return cur * labRatio(s, 'series', fx) * seriesMulOf(m, carried(s, fx), carriedBonus(s, fx));
}
// Why a launch button is off, or null when you can launch.
export function launchBlock(s, kind = 'next', fx = upgradeEffects(s)) {
  const m = modelMarket(s);
  if (!m || s.phase !== 'playing' || !sellOpen(s)) return 'closed';
  if (kind === 'series' && !newSeriesOpen(s, fx)) return 'chip';
  if (!(s.producers.workbench > 0)) return 'workbench';
  if (kind === 'series') {
    if (!s.design || designProgress(s) < m.minProgress) return 'lab';
    if (labRatio(s, 'series', fx) <= 1) return 'behind';
    return null;
  }
  return labProgress(s, modelAge(s)) < m.minProgress ? 'lab' : null;
}
export function canLaunch(s, kind = 'next') { return launchBlock(s, kind) === null; }
export function launchModel(s, kind = 'next', byEngineers = false) {
  if (!canLaunch(s, kind)) return false;
  const fx = upgradeEffects(s), m = modelMarket(s), r = labRatio(s, kind, fx);
  const prev = s.models[s.models.length - 1];
  if (kind === 'series') {
    const old = curSeries(s), oldN = s.series.length, keep = carried(s, fx);
    s.series.push({ homes: 0, programs: keep, bonus: carriedBonus(s, fx) });
    s.design = null;
    s.models.push({ speed: prev.speed * r, homes: 0, series: s.series.length - 1, kind });
    const n = s.models.length;
    const k = s.series.length, H = fmt(Math.floor(old.homes)), P = fmt(Math.floor(old.programs));
    const head = `You launch Model ${n}, the first of Series ${k}: ${fmtRatio(r)} as fast as Model ${n - 1}`;
    if (keep >= 1) addLog(s, `${head}, and it keeps ${fmt(Math.floor(keep))} of your programs. Series ${oldN} keeps its ${H} computers and ${P} programs.`, null, 'milestone');
    else if (k === 2) addLog(s, `${head}, but none of the old programs run on it. The shops ask why. Series 1 stops getting new programs; its ${H} owners keep using theirs.`, null, 'milestone');
    else addLog(s, `${head}. None of the old programs run on it. Series ${oldN} keeps its ${H} computers and ${P} programs.`, null, 'milestone');
    updateDesign(s, fx);
  } else {
    s.models.push({ speed: prev.speed * r, homes: 0, series: s.series.length - 1, kind });
    const n = s.models.length;
    const line = m.modelLines?.[n] || 'It is faster, and the shops want it.';
    const first = byEngineers && !s.engineersShipped;
    const who = byEngineers ? (first ? 'Your engineers stop waiting for you and ship' : 'Your engineers ship') : 'You launch';
    if (byEngineers) s.engineersShipped = true;
    addLog(s, `${who} Model ${n}, ${fmtRatio(r)} as fast as Model ${n - 1}.${first ? ' It had been ready for a while.' : ''} ${line}`, null, 'model');
  }
  s.modelAt = s.time; s.sales = []; s.salesNext = s.time;
  return true;
}
export function fmtRatio(r) { return r < 10 ? `${(Math.round(r * 10) / 10).toFixed(1)}×` : `${Math.round(r)}×`; }
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
  if (u.effect.type === 'killerApp' && s.series.length) curSeries(s).bonus += u.effect.value;
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
  s.homes = 0; s.models = []; s.series = []; s.design = null;   // computers in homes fold into the legacy too
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
  const models = st.market?.kind === 'models';                  // Model 1, Series 1, is on sale from the start
  s.models = models ? [{ speed: 1, homes: 0, series: 0 }] : [];
  s.series = models ? [{ homes: 0, programs: 0, bonus: 0 }] : []; s.design = null;
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
    s.homes += f.sold * dt; s.models[s.models.length - 1].homes += f.sold * dt; curSeries(s).homes += f.sold * dt;
    curSeries(s).programs += programRate(s, fx) * dt;
    s.dollars += f.dollarsPerSec * dt;
    updateDesign(s, fx);
    if (s.time >= s.salesNext) {    // one chart bar every 2 s, the last two minutes kept
      s.sales.push([Math.round(f.demand * 100) / 100, Math.round(f.capacity * 100) / 100]);   // buyers, could make
      if (s.sales.length > 60) s.sales.shift();
      s.salesNext = s.time + 2;
    }
    // The engineers ship a model that is close to the chip's limit themselves.
    const m = stageData(s).market;
    if (s.producers.workbench > 0 && labProgress(s, modelAge(s)) >= m.autoAt) launchModel(s, 'next', true);
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
    s.models = [{ speed: 1, homes: s.homes, series: 0 }]; s.modelAt = s.time; s.sales = []; s.salesNext = s.time;
  }
  // v5 -> v6: series. Every model so far belongs to Series 1, with no programs yet. The chart starts again.
  if (data.version < 6) s.sales = [];
  if (STAGES[s.stage].market?.kind === 'models' && !s.series.length) {
    s.series = [{ homes: s.models.reduce((a, m) => a + m.homes, 0), programs: 0, bonus: 0 }];
    for (const m of s.models) { m.series = 0; delete m.kind; }
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
