#!/usr/bin/env node
// Headless pacing simulator. Plays the REAL engine (src/engine.js) with bot players.
//
//   node sim/simulate.mjs                 # run the full matrix, print a table, exit 1 on any failure
//   node sim/simulate.mjs --profile average --choice machines --verbose   # one run with a timeline
//   node sim/simulate.mjs --config '{"revealGapSec":12}'                    # override CONFIG
//   node sim/simulate.mjs --stage 2 --legacy 19000 --carry 200000           # start at Stage 2 alone
//   node sim/simulate.mjs --sell 0.25                                       # never change how much time is sold
// By default every run plays all built stages in a row (Stage 1 -> 2 ...) with the same state.
//
// Checks per run:
//   - finishes the stage (hard cap on simulated time, so it can never loop forever)
//   - finish time inside the profile's target window
//   - longest stretch with nothing new happening (no purchase, reveal or log line) <= limit
//   - speed never goes down; no NaN; the goal bar is never empty while playing
//   - the handover works (ending lines play, production pauses, the speed carries over exactly)
//   - the ledger never goes back in time; the unit word changes at most once per stage

import { CONFIG } from '../src/config.js';
import * as E from '../src/engine.js';

const DT = 0.1;              // simulation step (s)
const MAX_TIME = 60 * 60;    // hard stop: 1 hour of simulated play
const SAVE_HORIZON = 30;     // bot saves for an upgrade if it is < 30 s away

// Clicks per second over time (the schedule restarts at each stage: fresh attention).
const ACTIVE = [[0, 4], [90, 3], [240, 2], [420, 1.5]];
const PROFILES = {
  holder:  { clicks: [[0, CONFIG.holdRepeatPerSec]], reaction: 0.3 },
  greedy:  { clicks: scale(ACTIVE, 0.6),        reaction: 1.0, greedy: true },
  active:  { clicks: ACTIVE,                    reaction: 0.5 },
  average: { clicks: scale(ACTIVE, 0.6),        reaction: 1.0 },
  casual:  { clicks: scale(ACTIVE, 0.3),        reaction: 2.0 },
  idle:    { clicks: [[0, 1], [60, 0.1]],       reaction: 5.0 },
};
// Per stage: finish window (minutes) and the longest allowed quiet stretch (seconds).
const WINDOWS = {
  1: { holder: [6, 14, 45], greedy: [8, 16, 45], active: [7, 13, 45], average: [7, 13, 45], casual: [8, 15, 50], idle: [8, 30, 120] },
  2: { holder: [9, 16, 45], greedy: [9, 18, 45], active: [10, 16, 45], average: [10, 16, 45], casual: [10, 16, 50], idle: [10, 20, 50] },
};
const CHOICES = ['machines', 'people'];

function scale(sched, k) { return sched.map(([t, c]) => [t, c * k]); }
function clicksAt(sched, t) { let c = 0; for (const [a, b] of sched) if (t >= a) c = b; return c; }

// Plays every built stage in a row with the same state (or from --stage N with a given legacy).
function run(profileName, choice, verbose = false) {
  const s = fromStage > 1
    ? E.startAtStage(fromStage, { ...(legacyArg !== undefined && { legacyRate: legacyArg }), ...(carryArg !== undefined && { ops: carryArg }) })
    : E.createState();
  const out = [];
  while (E.isActive(s)) {
    const r = playStage(s, profileName, choice, verbose);
    out.push(r);
    if (!r.finished) break;
    // the ending plays, then "Pass the ledger on"
    let guard = 0;
    while (s.phase === 'ending' && guard++ < 10000) E.tick(s, DT);
    if (s.phase !== 'handover') { r.fails.push('ending never reached the handover'); break; }
    const before = E.getRate(s), balance = s.ops;
    E.tick(s, 30); // sitting on the handover screen earns nothing
    if (s.ops !== balance) r.fails.push('production did not pause on the handover screen');
    const unitBefore = E.unitName(s);
    if (!E.passLedger(s)) { r.fails.push('passLedger failed'); break; }
    if (Math.abs(E.getRate(s) - before) > 1e-6 * before) r.fails.push('speed changed at the handover');
    if (E.isActive(s)) {
      if (Object.keys(s.revealed).length || Object.values(s.producers).some(n => n)) r.fails.push('next stage did not start empty');
      r.carry = s.ops;
    }
    void unitBefore;
  }
  return out;
}

function playStage(s, profileName, choice, verbose) {
  const prof = PROFILES[profileName];
  const st = E.stageData(s);
  const [winLo, winHi, maxGapLimit] = WINDOWS[s.stage][profileName];
  const t0 = s.time;
  const T = () => s.time - t0;
  const events = [];      // [time, kind, text]
  const ev = (kind, text) => events.push([T(), kind, text]);
  const fails = [];
  let clickCarry = 0, nextDecision = s.time, lastRate = E.getRate(s), lastLogLen = s.log.length;
  const revealedSeen = new Set();
  const snaps = [];
  let nextSnap = 60;
  const units = [E.unitName(s)];
  const legacy = s.legacyRate;

  while (E.isActive(s) && T() < MAX_TIME) {
    clickCarry += clicksAt(prof.clicks, T()) * DT;
    const n = Math.floor(clickCarry);
    if (n > 0) { E.click(s, n); clickCarry -= n; }

    E.tick(s, DT);

    const rate = E.getRate(s);
    if (!Number.isFinite(rate) || !Number.isFinite(s.ops)) { fails.push(`NaN/Infinity at t=${T().toFixed(1)}`); break; }
    if (rate < lastRate - 1e-9) fails.push(`speed dropped at t=${T().toFixed(1)} (${lastRate} -> ${rate})`);
    lastRate = rate;
    if (E.isActive(s) && !E.currentGoal(s)) fails.push(`empty goal bar at t=${T().toFixed(1)}`);
    const u = E.unitName(s);
    if (u !== units[units.length - 1]) { units.push(u); ev('UNIT', u); }

    for (const id of Object.keys(s.revealed)) if (!revealedSeen.has(id)) { revealedSeen.add(id); ev('reveal', id); }
    if (s.log.length !== lastLogLen) { lastLogLen = s.log.length; ev('log', `[${s.log[0].date}] ` + s.log[0].text.slice(0, 50)); }

    if (s.time >= nextDecision) {
      nextDecision = s.time + prof.reaction;
      decide(s, choice, ev, prof.greedy);
    }

    if (T() >= nextSnap) {
      nextSnap += 60;
      const eff = E.effectiveRate(s);
      const cps = clicksAt(prof.clicks, T());
      snaps.push({ min: Math.round(T() / 60), rate, click: E.getClickValue(s), clickShare: cps * E.getClickValue(s) / rate, cps, owned: Object.values(s.producers).join('/'),
        total: E.stageTotal(s), legacyShare: legacy / rate, task: st.task.size / Math.max(eff, 1e-9) });
    }
  }

  const finished = !E.isActive(s);
  const finishTime = T();
  if (!finished) fails.push(`did not finish within ${MAX_TIME / 60} min`);
  if (units.length > 2) fails.push(`unit changed more than once: ${units.join(' -> ')}`);

  const mins = finishTime / 60;
  if (finished && (mins < winLo || mins > winHi)) fails.push(`finish ${mins.toFixed(1)} min outside ${winLo}–${winHi}`);

  const times = [0, ...events.filter(e => e[0] <= finishTime).map(e => e[0]), finishTime];
  let maxGap = 0, gapAt = 0;
  for (let i = 1; i < times.length; i++) if (times[i] - times[i - 1] > maxGap) { maxGap = times[i] - times[i - 1]; gapAt = times[i - 1]; }
  if (maxGap > maxGapLimit) fails.push(`nothing happened for ${maxGap.toFixed(0)} s (from ${fmtT(gapAt)})`);

  // the ledger never goes back in time
  const dates = s.log.slice().reverse().map(e => e.date);
  for (let i = 1; i < dates.length; i++) if (dates[i] < dates[i - 1]) { fails.push(`ledger date went back: ${dates[i - 1]} -> ${dates[i]}`); break; }

  const buys = events.filter(e => e[1] === 'buy-upgrade').map(e => e[0]);
  let clump = 0;
  for (let i = 0; i < buys.length; i++) clump = Math.max(clump, buys.filter(t => t >= buys[i] && t < buys[i] + 5).length);

  if (verbose) {
    console.log(`\n=== Stage ${s.stage} · ${profileName} / ${choice} · legacy ${fmt(legacy)} ===`);
    for (const [t, k, x] of events) if (k !== 'buy-producer') console.log(`${fmtT(t)}  ${k.padEnd(12)} ${x}`);
    console.log('\nmin   speed/s     click  clicks/s  clicks add   owned   stage total   legacy share   task');
    for (const p of snaps) console.log(`${String(p.min).padStart(3)} ${fmt(p.rate).padStart(9)} ${fmt(p.click).padStart(9)} ${p.cps.toFixed(1).padStart(8)} ${((p.clickShare * 100).toFixed(1) + '%').padStart(11)} ${p.owned.padStart(7)} ${fmt(p.total).padStart(13)}   ${(p.legacyShare * 100).toFixed(0).padStart(11)}%   ${fmtDur(p.task)}`);
  }

  return { stage: s.stage, profile: profileName, choice, finished, mins, maxGap, clump, legacy,
           endRate: E.getRate(s), upgrades: buys.length, fails };
}

// How much computer time to sell. 'smart' (default) compares what each currency buys right now;
// --sell 0.25 keeps a fixed share (an idle player who never touches the setting).
function chooseSell(s) {
  if (!E.sellOpen(s)) return;
  if (sellArg !== 'smart') { E.setSell(s, Number(sellArg)); return; }
  const st = E.stageData(s);
  const open = st.upgrades.filter(u => s.revealed[u.id] !== undefined && !(u.id in s.bought));
  const p = E.moneyPerOp(s);
  const money = st.producers.find(x => x.currency === 'dollars');
  const ops = st.producers.find(x => x.currency !== 'dollars');
  // speed bought per operation, either spent directly or sold first
  let vOps = E.producerOutput(s, ops.id) / E.producerCost(s, ops.id);
  let vMoney = E.producerOutput(s, money.id) / (E.producerCost(s, money.id) / p);
  if (open.some(u => u.currency !== 'dollars')) vOps *= 1.5;
  if (open.some(u => u.currency === 'dollars')) vMoney *= 1.5;
  const R = E.getRate(s), D = E.sellDemand(s);
  let best = s.sell, bestV = -1;
  for (const f of st.market.levels) {
    const v = vOps * (1 - f) * R + vMoney * Math.min(f * R, D);
    if (v > bestV + 1e-12) { bestV = v; best = f; }
  }
  E.setSell(s, best);
}

function decide(s, choice, ev, greedy = false) {
  const st = E.stageData(s);
  chooseSell(s);
  for (let guard = 0; guard < 1000; guard++) {
    if (E.canBuyGoal(s)) { E.buyGoal(s); ev('GOAL', st.goal.name); continue; }
    if (E.canBuyFinale(s)) { const f = E.currentFinale(s); E.buyFinale(s); ev('FINALE', f.name); continue; }
    const up = st.upgrades.find(u => E.canBuyUpgrade(s, u.id));
    if (up) {
      const opt = up.effect.type === 'choice' ? choice : undefined;
      E.buyUpgrade(s, up.id, opt);
      ev('buy-upgrade', up.name + (opt ? ` (${opt})` : ''));
      continue;
    }
    // producers paid with money: buy whenever affordable (nothing else competes for dollars except dollar cards)
    const moneyOpen = st.upgrades.some(u => u.currency === 'dollars' && s.revealed[u.id] !== undefined && !(u.id in s.bought));
    const mp = st.producers.find(p => p.currency === 'dollars' && E.producerUnlocked(s, p.id));
    if (mp && !moneyOpen && E.buyProducer(s, mp.id)) { ev('buy-producer', mp.id); continue; }
    // best producer by output per cost
    const opts = st.producers.filter(p => p.currency !== 'dollars' && E.producerUnlocked(s, p.id));
    if (!opts.length) return;
    const best = opts.reduce((a, b) =>
      E.producerOutput(s, a.id) / E.producerCost(s, a.id) >= E.producerOutput(s, b.id) / E.producerCost(s, b.id) ? a : b);
    const cost = E.producerCost(s, best.id);
    // save for an upgrade (or the goal) that is close
    const eff = E.effectiveRate(s);
    const targets = st.upgrades.filter(u => u.currency !== 'dollars' && s.revealed[u.id] !== undefined && !(u.id in s.bought)).map(u => u.cost);
    const fin = E.currentFinale(s); if (fin) targets.push(fin.cost);
    const near = targets.filter(c => c > s.ops && c < s.ops + eff * SAVE_HORIZON);
    if (near.length && !greedy) return; // something worth having is less than SAVE_HORIZON away: save for it
    if (s.ops < cost) return;
    E.buyProducer(s, best.id);
    ev('buy-producer', best.id);
  }
}

function fmt(n) {
  if (n < 10) return n.toFixed(1);
  if (n < 1e6) return Math.round(n).toLocaleString('en-US');
  return n.toExponential(2);
}
function fmtT(t) { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; }
function fmtDur(sec) { return sec >= 60 ? `${Math.floor(sec / 60)} min ${Math.round(sec % 60)} s` : `${sec.toFixed(1)} s`; }

// ---------- CLI ----------
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const fromStage = Number(arg('--stage') || 1);
const legacyArg = arg('--legacy') !== undefined ? Number(arg('--legacy')) : undefined;
const carryArg = arg('--carry') !== undefined ? Number(arg('--carry')) : undefined;
const sellArg = arg('--sell') || 'smart';
if (arg('--config')) Object.assign(CONFIG, JSON.parse(arg('--config')));
// --data '{"computer":{"growth":1.2}}' patches producers/upgrades/goal/finale by id (any built stage)
if (arg('--data')) {
  for (const [id, patch] of Object.entries(JSON.parse(arg('--data')))) {
    let item = null;
    for (const st of Object.values(E.STAGES)) {
      item = item || st.producers.find(x => x.id === id) || st.upgrades.find(x => x.id === id) ||
        st.finale.find(x => x.id === id) || (st.goal.id === id && st.goal);
    }
    if (!item) throw new Error('unknown id ' + id);
    Object.assign(item, patch);
  }
}
const verbose = args.includes('--verbose');
const onlyProfile = arg('--profile');
const onlyChoice = arg('--choice');

const results = [];
for (const p of Object.keys(PROFILES)) {
  if (onlyProfile && p !== onlyProfile) continue;
  for (const c of CHOICES) {
    if (onlyChoice && c !== onlyChoice) continue;
    results.push(...run(p, c, verbose));
  }
}

console.log('\nstage  profile   choice     finish   longest quiet   upgrades/5s     legacy   end speed   result');
for (const r of results) {
  console.log(`  ${r.stage}    ${r.profile.padEnd(9)} ${r.choice.padEnd(9)} ${(r.finished ? r.mins.toFixed(1) + ' min' : 'DNF').padStart(9)}   ${(r.maxGap.toFixed(0) + ' s').padStart(13)}   ${String(r.clump).padStart(11)}   ${fmt(r.legacy).padStart(8)}   ${fmt(r.endRate).padStart(9)}   ${r.fails.length ? 'FAIL' : 'ok'}`);
  for (const f of r.fails) console.log(`          - ${f}`);
}
const failed = results.filter(r => r.fails.length).length;
console.log(failed ? `\n${failed} run(s) failed.` : '\nAll runs passed.');
process.exit(failed ? 1 : 0);
