#!/usr/bin/env node
// Headless pacing simulator. Plays the REAL engine (src/engine.js) with bot players.
//
//   node sim/simulate.mjs                 # run the full matrix, print a table, exit 1 on any failure
//   node sim/simulate.mjs --profile average --choice machines --verbose   # one run with a timeline
//   node sim/simulate.mjs --config '{"revealGapSec":12}'                    # override CONFIG
//
// Checks per run:
//   - finishes the stage (hard cap on simulated time, so it can never loop forever)
//   - finish time inside the profile's target window
//   - longest stretch with nothing new happening (no purchase, reveal or log line) <= limit
//   - speed never goes down; no NaN; the goal bar is never empty while playing
//   - the handover works (ending lines play, "Pass the ledger on" moves to the next stage)

import { CONFIG } from '../src/config.js';
import * as E from '../src/engine.js';

const DT = 0.1;              // simulation step (s)
const MAX_TIME = 60 * 60;    // hard stop: 1 hour of simulated play
const SAVE_HORIZON = 30;     // bot saves for an upgrade if it is < 30 s away

// Clicks per second over time. Holding the button counts as 10/s.
const ACTIVE = [[0, 4], [90, 3], [240, 2], [420, 1.5]];
const PROFILES = {
  holder:  { clicks: [[0, CONFIG.holdRepeatPerSec]], reaction: 0.3, window: [6, 14], maxGap: 45 },
  greedy:  { clicks: scale(ACTIVE, 0.6),        reaction: 1.0, window: [8, 16],  maxGap: 45, greedy: true },
  active:  { clicks: ACTIVE,                    reaction: 0.5, window: [7, 13],  maxGap: 45 },
  average: { clicks: scale(ACTIVE, 0.6),        reaction: 1.0, window: [7, 13],  maxGap: 45 },
  casual:  { clicks: scale(ACTIVE, 0.3),        reaction: 2.0, window: [8, 15],  maxGap: 50 },
  idle:    { clicks: [[0, 1], [60, 0.1]],       reaction: 5.0, window: [8, 30],  maxGap: 120 },
};
const CHOICES = ['machines', 'people'];

function scale(sched, k) { return sched.map(([t, c]) => [t, c * k]); }
function clicksAt(sched, t) { let c = 0; for (const [a, b] of sched) if (t >= a) c = b; return c; }

function run(profileName, choice, verbose = false) {
  const prof = PROFILES[profileName];
  const s = E.createState();
  const st = E.stageData(s);
  const events = [];      // [time, kind, text]
  const ev = (kind, text) => events.push([s.time, kind, text]);
  const fails = [];
  let clickCarry = 0, nextDecision = 0, lastRate = 0, lastLogLen = s.log.length;
  const revealedSeen = new Set();
  const snaps = [];
  let nextSnap = 60;

  while (E.isActive(s) && s.time < MAX_TIME) {
    // clicking
    clickCarry += clicksAt(prof.clicks, s.time) * DT;
    const n = Math.floor(clickCarry);
    if (n > 0) { E.click(s, n); clickCarry -= n; }

    E.tick(s, DT);

    // invariants
    const rate = E.getRate(s);
    if (!Number.isFinite(rate) || !Number.isFinite(s.ops)) { fails.push(`NaN/Infinity at t=${s.time.toFixed(1)}`); break; }
    if (rate < lastRate - 1e-9) fails.push(`speed dropped at t=${s.time.toFixed(1)} (${lastRate} -> ${rate})`);
    lastRate = rate;
    if (E.isActive(s) && !E.currentGoal(s)) fails.push(`empty goal bar at t=${s.time.toFixed(1)}`);

    for (const id of Object.keys(s.revealed)) if (!revealedSeen.has(id)) { revealedSeen.add(id); ev('reveal', id); }
    if (s.log.length !== lastLogLen) { lastLogLen = s.log.length; ev('log', s.log[0].text.slice(0, 50)); }

    // decisions, with human reaction time
    if (s.time >= nextDecision) {
      nextDecision = s.time + prof.reaction;
      decide(s, choice, ev, prof.greedy);
    }

    if (s.time >= nextSnap) {
      nextSnap += 60;
      const eff = E.effectiveRate(s);
      snaps.push({ min: Math.round(s.time / 60), rate: E.getRate(s), click: E.getClickValue(s),
        ...s.producers, lifetime: s.lifetime, task: st.task.size / Math.max(eff, 1e-9) });
    }
  }

  const finished = !E.isActive(s);
  const finishTime = s.time;
  if (!finished) fails.push(`did not finish within ${MAX_TIME / 60} min`);

  // let the ending play out and pass the ledger
  if (finished) {
    let guard = 0;
    while (s.phase === 'ending' && guard++ < 10000) E.tick(s, DT);
    if (s.phase !== 'handover') fails.push('ending never reached the handover');
    const rateBefore = E.getRate(s);
    if (!E.passLedger(s)) fails.push('passLedger failed');
    else if (Math.abs(E.getRate(s) - rateBefore) > 1e-6 * rateBefore) fails.push('speed changed at the handover');
  }

  // pacing metrics
  const mins = finishTime / 60;
  if (finished && (mins < prof.window[0] || mins > prof.window[1]))
    fails.push(`finish ${mins.toFixed(1)} min outside ${prof.window[0]}–${prof.window[1]}`);

  const times = [0, ...events.filter(e => e[0] <= finishTime).map(e => e[0]), finishTime];
  let maxGap = 0, gapAt = 0;
  for (let i = 1; i < times.length; i++) if (times[i] - times[i - 1] > maxGap) { maxGap = times[i] - times[i - 1]; gapAt = times[i - 1]; }
  if (maxGap > prof.maxGap) fails.push(`nothing happened for ${maxGap.toFixed(0)} s (from ${fmtT(gapAt)})`);

  const buys = events.filter(e => e[1] === 'buy-upgrade').map(e => e[0]);
  let clump = 0;
  for (let i = 0; i < buys.length; i++) clump = Math.max(clump, buys.filter(t => t >= buys[i] && t < buys[i] + 5).length);

  if (verbose) {
    console.log(`\n=== ${profileName} / ${choice} ===`);
    for (const [t, k, x] of events) if (k !== 'buy-producer') console.log(`${fmtT(t)}  ${k.padEnd(12)} ${x}`);
    console.log('\nmin   speed/s   click   clerks machines   lifetime   one day\'s messages');
    for (const p of snaps) console.log(`${String(p.min).padStart(3)} ${fmt(p.rate).padStart(9)} ${fmt(p.click).padStart(7)} ${String(p.clerk).padStart(7)} ${String(p.machine).padStart(8)} ${fmt(p.lifetime).padStart(10)}   ${fmtDur(p.task)}`);
  }

  return { profile: profileName, choice, finished, mins, maxGap, clump,
           endRate: E.getRate(s), upgrades: buys.length, fails };
}

function decide(s, choice, ev, greedy = false) {
  const st = E.stageData(s);
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
    // best producer by output per cost
    const opts = st.producers.filter(p => E.producerUnlocked(s, p.id));
    if (!opts.length) return;
    const best = opts.reduce((a, b) =>
      E.producerOutput(s, a.id) / E.producerCost(s, a.id) >= E.producerOutput(s, b.id) / E.producerCost(s, b.id) ? a : b);
    const cost = E.producerCost(s, best.id);
    // save for an upgrade (or the goal) that is close
    const eff = E.effectiveRate(s);
    const targets = st.upgrades.filter(u => s.revealed[u.id] !== undefined && !s.bought[u.id]).map(u => u.cost);
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
if (arg('--config')) Object.assign(CONFIG, JSON.parse(arg('--config')));
// --data '{"clerk":{"growth":1.15},"weatherReports":{"cost":120}}' patches producers/upgrades/goal by id
if (arg('--data')) {
  const st = E.STAGES[1];
  for (const [id, patch] of Object.entries(JSON.parse(arg('--data')))) {
    const item = st.producers.find(x => x.id === id) || st.upgrades.find(x => x.id === id) ||
      st.finale.find(x => x.id === id) || (st.goal.id === id && st.goal);
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
    results.push(run(p, c, verbose));
  }
}

console.log('\nprofile   choice     finish   longest quiet   upgrades/5s   end speed   result');
for (const r of results) {
  console.log(`${r.profile.padEnd(9)} ${r.choice.padEnd(9)} ${(r.finished ? r.mins.toFixed(1) + ' min' : 'DNF').padStart(9)}   ${(r.maxGap.toFixed(0) + ' s').padStart(13)}   ${String(r.clump).padStart(11)}   ${fmt(r.endRate).padStart(9)}   ${r.fails.length ? 'FAIL' : 'ok'}`);
  for (const f of r.fails) console.log(`          - ${f}`);
}
const failed = results.filter(r => r.fails.length).length;
console.log(failed ? `\n${failed} run(s) failed.` : '\nAll runs passed.');
process.exit(failed ? 1 : 0);
