// Core engine. Pure logic, no DOM: the browser and the simulator run this same file.
// All functions take the state object and mutate it. Fields starting with '_' are transient (never saved).

import { CONFIG } from './config.js';
import { fmt } from './format.js';
import { STAGE1 } from './data/stage1.js';
import { STAGE2 } from './data/stage2.js';
import { STAGE3 } from './data/stage3.js';

export const STAGES = { 1: STAGE1, 2: STAGE2, 3: STAGE3 };
export const SAVE_VERSION = 7;

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
    homeWork: 0,      // Stage 3: those computers' speed added up, in 1971 computers (newer ones run faster)
    stock: [],        // Stage 3: the warehouse, [[count, speed]] oldest first
    stockN: 0,        // computers in the warehouse
    built: 0,         // computers built this stage
    chips: 0,         // chips in stock (one per computer)
    chipsBought: 0,
    price: 0,         // the price of one computer
    priceUps: 0, priceDowns: 0,   // price changes made by hand
    ads: 0,           // advert level
    autoChips: true, autoPrice: true,   // the standing order and the sales manager, once bought, can be switched off
    seed: 1,          // the chip price's wobble
    holds: {},        // beatId -> since when its condition has held (beats with `for`)
    lastReactAt: -Infinity,
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
  const fx = { clickMul: 1, clickPct: 0, globalMul: 1, synergy: 0, priceMul: 1, demandMul: 1, fadeMul: 1, genMul: 1, buyersMul: 1, chipMul: 1, batch: 0, homesBuyers: 0, autoChips: false, autoPrice: false, mul: {}, growth: {}, unlocked: {} };
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
      case 'genMul': fx.genMul *= e.value; break;       // computers built from now on run faster
      case 'buyersMul': fx.buyersMul *= e.value; break; // a new group of buyers
      case 'chipMul': fx.chipMul *= e.value; break;     // chips cost less
      case 'batch': fx.batch = Math.max(fx.batch, e.value); break;  // chips bought this many at a time
      case 'homesBuyers': fx.homesBuyers += e.value; break;         // buyers grow with homes (Open)
      case 'autoChips': fx.autoChips = true; break;
      case 'autoPrice': fx.autoPrice = true; break;
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
// Computers in homes, each weighted by its speed (a 1971 computer = 1).
export function homeWork(s) { return s.homeWork || 0; }
// Operations per second from one 1971 computer in a home.
export function homeOutput(s, fx = upgradeEffects(s)) {
  const h = stageData(s).homes;
  return h ? h.output * (fx.mul.home || 1) * fx.globalMul : 0;
}

export function getClickValue(s, fx = upgradeEffects(s)) {
  const st = stageData(s);
  if (st.clickBuilds) return 0;     // Stage 3: the button builds a computer, not operations
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
  if (c.homesBelow !== undefined && s.homes >= c.homesBelow) return false;
  if (c.t !== undefined && s.time - s.stageStart.time < c.t) return false;
  if (c.built !== undefined && (s.built || 0) < c.built) return false;
  if (c.beat !== undefined && !(s.beats[c.beat] !== undefined && s.time >= s.beats[c.beat] + (c.after === undefined ? (c.delay || 0) : 0))) return false;
  if (c.stock !== undefined && (s.stockN || 0) < c.stock) return false;
  if (c.chipsBought !== undefined && (s.chipsBought || 0) < c.chipsBought) return false;
  if (c.priceUps !== undefined && (s.priceUps || 0) < c.priceUps) return false;
  if (c.priceDowns !== undefined && (s.priceDowns || 0) < c.priceDowns) return false;
  if (c.priceAtLeast !== undefined && !(s.price >= c.priceAtLeast)) return false;
  if (c.priceBelow !== undefined && !(s.price < c.priceBelow)) return false;
  if (c.moneyAtLeast !== undefined && s.dollars < c.moneyAtLeast) return false;
  if (c.moneyBelow !== undefined && s.dollars >= c.moneyBelow) return false;
  if (c.ads !== undefined && (s.ads || 0) < c.ads) return false;
  if (c.chipsOut && !(isShop(s) && s.chips < 1)) return false;
  if (c.soldOut && !(isShop(s) && (s.stockN || 0) < 1 && buyersAt(s) > buildRate(s))) return false;
  if (c.belowCost && !(isShop(s) && s.price < chipPrice(s))) return false;
  if (c.rivalBelow !== undefined && !(rivalPrice(s) !== null && rivalPrice(s) < c.rivalBelow)) return false;
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
  if (stageData(s).clickBuilds) {   // build computers by hand, one chip each
    if (!isActive(s)) return 0;
    const k = Math.min(n, Math.floor(s.chips));
    if (k <= 0) return 0;
    s.chips -= k; addStock(s, k, genSpeed(s)); s.clicks += k; s._clickAcc += k;
    return k;
  }
  const v = getClickValue(s) * n;
  s.ops += v; s.lifetime += v; s.clicks += n; s._clickAcc += n;
  return v;
}

// ---------- selling computer time (a second currency: dollars) ----------
// Part of the speed can be sold to customers. Sold operations still count towards the stage goal,
// but they earn dollars instead of spendable operations. Customers only pay for what they want.

export function sellOpen(s) {
  const m = stageData(s).market;
  return !!m && (s.phase === 'playing' || (m.kind === 'shop' && s.phase === 'finale')) && conditionMet(s, m.reveal);
}
export function marketKind(s) { return stageData(s).market?.kind || 'sell'; }
export function sellShare(s) { return sellOpen(s) && marketKind(s) === 'sell' ? s.sell : 0; }
export function moneyPerOp(s, fx = upgradeEffects(s)) { return (stageData(s).market?.price || 0) * fx.priceMul; }
// Operations per second that customers want: the sum of every customer who has arrived.
export function sellDemand(s) {
  const m = stageData(s).market;
  if (!m || m.kind === 'shop') return 0;
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
  if (!m || m.kind === 'shop' || !m.levels.includes(share)) return false;
  s.sell = share;
  return true;
}

// ---------- the shop (Stage 3) ----------
// Closer to Universal Paperclips. Computers are built (by hand, on workbenches, in factories), each one uses a chip,
// and they wait in the warehouse. Buyers come at a rate set by the price, adverts and buyer ideas, and take the
// oldest computers first. Every computer SOLD keeps running in someone's home at the speed it was built with
// (chip ideas make computers built from then on faster). Unsold computers do nothing.
// From the price war on, buyers compare your price with a rival's that falls in steps.
const shopMarket = (s) => { const m = stageData(s).market; return m && m.kind === 'shop' ? m : null; };
export function isShop(s) { return !!shopMarket(s); }
const stageTime = (s) => s.time - s.stageStart.time;
// Computers built a second by workbenches and factories (hand-building is separate: one per click).
export function buildRate(s, fx = upgradeEffects(s)) {
  let c = 0;
  for (const p of stageData(s).producers) if (p.makes === 'computers') c += s.producers[p.id] * producerOutput(s, p.id, fx);
  return c;
}
// How fast a computer built now runs, as a multiple of a 1971 computer.
export function genSpeed(s, fx = upgradeEffects(s)) { return fx.genMul; }
export function stockCount(s) { return s.stockN || 0; }

// Chip price: halves every `half` seconds of the stage, with a slow seeded wobble. It moves in steps
// (every `step` seconds), never every frame.
function wobble(s, t) {
  const m = shopMarket(s), seed = s.seed || 1;
  const a = (seed % 97) / 15, b = (seed % 89) / 14, c = (seed % 83) / 13;
  return m.chips.wobble * (0.6 * Math.sin(t / 7.3 + a) + 0.5 * Math.sin(t / 13.1 + b) + 0.4 * Math.sin(t / 29.3 + c)) / 1.1;
}
function chipClock(s) { const m = shopMarket(s); return Math.floor(stageTime(s) / m.chips.step) * m.chips.step; }
export function chipTrend(s, fx = upgradeEffects(s)) {
  const m = shopMarket(s);
  return m.chips.price * Math.pow(0.5, chipClock(s) / m.chips.half) * fx.chipMul;
}
export function chipPrice(s, fx = upgradeEffects(s)) { return chipTrend(s, fx) * Math.exp(wobble(s, chipClock(s))); }
// 'cheap' | 'dear' | '' against the usual price (the trend without the wobble).
export function chipDeal(s) {
  const w = wobble(s, chipClock(s));
  return w < -0.12 ? 'cheap' : w > 0.12 ? 'dear' : '';
}
// Did the chip price go up or down at its last step? 1 | -1 | 0
export function chipMove(s, fx = upgradeEffects(s)) {
  const m = shopMarket(s), t = chipClock(s);
  if (t < m.chips.step) return 0;
  const now = chipPrice(s, fx);
  const before = m.chips.price * Math.pow(0.5, (t - m.chips.step) / m.chips.half) * fx.chipMul * Math.exp(wobble(s, t - m.chips.step));
  return now > before * 1.0001 ? 1 : now < before * 0.9999 ? -1 : 0;
}
// One purchase: about `batchSec` seconds of building, rounded to 1, 2 or 5 × a power of ten.
export function chipBatch(s, fx = upgradeEffects(s)) {
  const c = shopMarket(s).chips, want = Math.max(c.batch, buildRate(s, fx) * c.batchSec);
  const d = Math.pow(10, Math.floor(Math.log10(want))), x = want / d;
  return (x < 1.5 ? 1 : x < 3.5 ? 2 : x < 7.5 ? 5 : 10) * d;
}
// What the button buys now: a full batch, or as many as you can afford (so a player short of money is never stuck).
export function chipBuyable(s, fx = upgradeEffects(s)) {
  return Math.min(chipBatch(s, fx), Math.floor(s.dollars / chipPrice(s, fx) + 1e-9));
}
export function chipBatchCost(s, fx = upgradeEffects(s)) { return chipPrice(s, fx) * Math.max(1, chipBuyable(s, fx)); }
export function buyChips(s) {
  if (!shopMarket(s) || !isActive(s)) return false;
  const fx = upgradeEffects(s), n = chipBuyable(s, fx);
  if (n < 1) return false;
  s.dollars = Math.max(0, s.dollars - n * chipPrice(s, fx)); s.chips += n; s.chipsBought = (s.chipsBought || 0) + 1;
  return true;
}

// Adverts: each level multiplies buyers; each costs more than the last.
export function advertsOpen(s) { const m = shopMarket(s); return !!m && conditionMet(s, m.adverts.reveal); }
export function advertCost(s) { const a = shopMarket(s).adverts; return a.cost * Math.pow(a.growth, s.ads || 0); }
export function buyAdvert(s) {
  if (!advertsOpen(s) || s.phase !== 'playing') return false;
  const c = advertCost(s);
  if (s.dollars < c) return false;
  s.dollars -= c; s.ads = (s.ads || 0) + 1;
  checkBeats(s);
  return true;
}

// The price war: once it starts, a rival price that falls in steps. null before it.
export function rivalPrice(s) {
  const m = shopMarket(s);
  if (!m?.war) return null;
  const t0 = s.beats[m.war.beat];
  if (t0 === undefined) return null;
  return Math.max(m.war.floor, Math.round(m.war.start * Math.pow(m.war.fall, Math.floor((s.time - t0) / m.war.every))));
}
// Buyers a second at a price.
export function buyersAt(s, price = s.price, fx = upgradeEffects(s)) {
  const m = shopMarket(s);
  if (!m) return 0;
  let b = m.base * fx.buyersMul * Math.pow(m.adverts.mul, s.ads || 0) * (1 + fx.homesBuyers * s.homes);
  b *= Math.pow(m.refPrice / price, m.elasticity);
  const r = rivalPrice(s);
  if (r !== null && price > r) b *= m.war.loyal + (1 - m.war.loyal) * Math.pow(r / price, m.war.bite);
  return b;
}
export function shopFlow(s, fx = upgradeEffects(s)) {
  const build = buildRate(s, fx), buyers = buyersAt(s, s.price, fx);
  const sold = (s.stockN || 0) >= 1 ? buyers : Math.min(buyers, build);
  return { build, buyers, sold, dollarsPerSec: sold * s.price };
}

// The price moves in tidy steps, about 10% apart.
function priceLadder(m) {
  const out = [];
  for (let d = 1; d <= 1e5; d *= 10) for (const x of m.priceSteps) out.push(Math.round(x * d * 100) / 100);
  return out;
}
export function priceStep(s, dir) {
  const ladder = priceLadder(shopMarket(s)), p = s.price;
  if (dir > 0) return ladder.find(x => x > p * 1.0001) ?? p;
  for (let i = ladder.length - 1; i >= 0; i--) if (ladder[i] < p * 0.9999) return ladder[i];
  return p;
}
export function changePrice(s, dir, byHand = true) {
  if (!shopMarket(s) || !isActive(s)) return false;
  const p = priceStep(s, dir);
  if (p === s.price) return false;
  s.price = p;
  if (byHand) { if (dir > 0) s.priceUps = (s.priceUps || 0) + 1; else s.priceDowns = (s.priceDowns || 0) + 1; }
  if (byHand && upgradeEffects(s).autoPrice) s.autoPrice = false;   // you took the price back from the sales manager
  return true;
}
// The two automations can be switched off and on again.
export function autoUnlocked(s, which, fx = upgradeEffects(s)) { return which === 'chips' ? !!fx.autoChips : !!fx.autoPrice; }
export function autoOn(s, which, fx = upgradeEffects(s)) {
  return which === 'chips' ? !!fx.autoChips && s.autoChips !== false : !!fx.autoPrice && s.autoPrice !== false;
}
export function toggleAuto(s, which) {
  const fx = upgradeEffects(s);
  if (which === 'chips' && fx.autoChips) { s.autoChips = s.autoChips === false; return true; }
  if (which === 'price' && fx.autoPrice) { s.autoPrice = s.autoPrice === false; return true; }
  return false;
}

function addStock(s, n, v) {
  const last = s.stock[s.stock.length - 1];
  if (last && last[1] === v) last[0] += n; else s.stock.push([n, v]);
  s.stockN += n; s.built = (s.built || 0) + n;
}
function shopTick(s, dt, fx) {
  const m = shopMarket(s);
  // automation first, so a standing order never lets the line stop
  const build = buildRate(s, fx);
  if (autoOn(s, 'chips', fx) && s.chips < build * 3 + 1) buyChips(s);
  if (autoOn(s, 'price', fx) && s.time >= (s.managerAt || 0)) {
    s.managerAt = s.time + 1;
    const want = m.managerStock * Math.max(build, 1);
    const b = buyersAt(s, s.price, fx), floor = chipPrice(s, fx) * 1.2;
    if (s.stockN > want * 1.5 && b < build * 1.2 && priceStep(s, -1) >= floor) changePrice(s, -1, false);
    else if (s.stockN < want * 0.5 && b > build) changePrice(s, 1, false);
  }
  // build (limited by chips)
  const made = Math.min(build * dt, s.chips);
  if (made > 0) { s.chips -= made; addStock(s, made, genSpeed(s, fx)); }
  // sell, oldest first; each computer sold runs at its own speed in a home
  let left = Math.min(s.stockN, buyersAt(s, s.price, fx) * dt);
  const n = left;
  while (left > 1e-9 && s.stock.length) {
    const b = s.stock[0], k = Math.min(b[0], left);
    b[0] -= k; left -= k; s.homeWork += k * b[1];
    if (b[0] <= 1e-9) s.stock.shift();
  }
  s.stockN = Math.max(0, s.stockN - n); if (!s.stock.length) s.stockN = 0;
  s.homes += n; s.dollars += n * s.price;
}
export function setMarket(s, v) { return setSell(s, v); }
export function marketValue(s) { return s.sell; }
// Dollars per second right now, whatever the market.
export function moneyRate(s, fx = upgradeEffects(s)) {
  return marketKind(s) === 'shop' ? shopFlow(s, fx).dollarsPerSec : sellFlow(s, fx).dollarsPerSec;
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
  addLog(s, pickText(s, u, u.log), u.date, 'upgrade');
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
export function canBuyFinale(s) { const f = currentFinale(s); return !!f && wallet(s, f) >= f.cost; }
export function buyFinale(s) {
  if (!canBuyFinale(s)) return false;
  const f = currentFinale(s);
  pay(s, f, f.cost);
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
  s.homes = 0; s.homeWork = 0; s.stock = []; s.stockN = 0;   // computers in homes fold into the legacy too
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
  s.homes = 0; s.homeWork = 0; s.stock = []; s.stockN = 0; s.built = 0;
  const shop = st.market?.kind === 'shop';
  s.chips = shop ? st.market.chips.start : 0; s.chipsBought = 0;
  s.price = shop ? st.market.priceStart : 0; s.priceUps = 0; s.priceDowns = 0;
  s.ads = 0; s.autoChips = true; s.autoPrice = true; s.holds = {}; s.lastReactAt = -Infinity;
  s.seed = 1 + Math.floor(Math.random() * 1e6);
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
  if (marketKind(s) === 'shop' && sellOpen(s)) shopTick(s, dt, fx);   // Stage 3: build, sell, homes

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
      addLog(s, fillText(s, b.text), b.date, 'story');
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
  const all = st.market?.customers ? [...st.beats, ...st.market.customers] : st.beats;
  for (const b of all) {
    if (s.time < s.hushUntil) return;
    if (s.beats[b.id] !== undefined) continue;
    if (!conditionMet(s, b.when)) { if (s.holds?.[b.id] !== undefined) delete s.holds[b.id]; continue; }
    if (b.when.for) {                 // the condition must hold for a while
      s.holds = s.holds || {};
      if (s.holds[b.id] === undefined) s.holds[b.id] = s.time;
      if (s.time < s.holds[b.id] + b.when.for) continue;
    }
    // Lines about what the player did: no date of their own, and at most one every 20 s.
    if (b.kind === 'react' && s.time < (s.lastReactAt ?? -Infinity) + 20) continue;
    if (b.kind === 'react') s.lastReactAt = s.time;
    s.beats[b.id] = s.time;
    addLog(s, pickText(s, b, b.text), b.kind === 'react' ? null : b.date, b.kind === 'react' ? 'story' : (b.kind || 'story'));
    if (b.hush) s.hushUntil = s.time + b.hush;
  }
}

// A line's text: the first variant whose condition holds (else the plain text), with live numbers filled in.
function pickText(s, item, text) {
  for (const v of item.variants || []) if (conditionMet(s, v.when)) { text = v.text; break; }
  return fillText(s, text);
}
function fillText(s, text) {
  return text.split('{homes}').join(fmt(Math.floor(s.homes))).split('{stock}').join(fmt(Math.floor(s.stockN || 0)));
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
    const have = wallet(s, f);
    if (have >= f.cost) return { text: f.name, kind: 'ready', ready: true, have: 1, need: 1 };
    return { text: `Save up for "${f.name}"`, kind: 'balance', unitLabel: f.currency === 'dollars' ? '' : unitName(s),
             money: f.currency === 'dollars', have, need: f.cost, eta: true };
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
  // v4–v6 -> v7: Stage 3 was rebuilt (the shop). Its models, series and programs cannot be mapped,
  // so a Stage 3 save in progress starts Stage 3 again, with the speed it brought from Stage 2.
  for (const k of ['models', 'series', 'design', 'modelAt', 'sales', 'salesNext', 'engineersShipped', 'sell3']) delete s[k];
  if (data.version < 7 && s.stage === 3 && s.phase !== 'next') {
    s.homes = 0; s.homeWork = 0;
    enterStage(s, 3);
    addLog(s, 'The garage has been rebuilt since you were last here. You start it again, with everything you brought from the lab.', null, 'note');
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
