// Stage 4 prototype: code, bugs, users, then the network.
// node proto.mjs [policy] [--verbose]   policies: smart, nofix, half, allfix, nonet, noclick, lazy
const policy = process.argv[2] || 'smart', verbose = process.argv.includes('--verbose');
const OV = Object.fromEntries((process.argv.find(a => a.startsWith('--set=')) || '--set=').slice(6).split(',').filter(Boolean).map(kv => { const [k, v] = kv.split('='); return [k, +v]; }));
const P = {
  legacy: 8e11, ops0: 1e13, money0: 20000,
  clickLines: 20, clicksPerSec: 4, clickFadeUntil: 120,
  progCost: 3000, progGrowth: 1.13, progLines: 10, progFix: 1.0,
  bugsPerLine: 0.02, discover: 0.04,
  base: 0.15, wom: 0.004, featExp: 0.5, featRef: 1000, R0: 40,
  price: 99, perUser: 3e6, hwDouble: 1.5,
  years: 10.9, len: 820,
  serverCost: 50000, serverGrowth: 1.10, serverRoom: 4000,
  netExp: 0.25, netRef: 1000,
  goal: 3e18,
  ...OV,
};
const CARDS = [
  { id: 'mouse',      cost: 2e13, at: 30,  fx: { reach: 1.6 } },
  { id: 'harddisk',   cost: 6e13, at: 60,  fx: { write: 2 } },
  { id: 'testers',    cost: 1.5e14, at: 100, fx: { bugs: 0.6 } },
  { id: 'spreadsheet',cost: 4e14, at: 140, fx: { reach: 2 } },
  { id: 'c',          cost: 9e14, at: 180, fx: { write: 2, code: 1.5 } },
  { id: 'tracker',    cost: 1.8e15, at: 230, fx: { autoFix: 1 } },
  { id: 'desktop',    cost: 3.5e15, at: 270, fx: { reach: 2 } },
  { id: 'fast',       cost: 7e15, at: 320, fx: { code: 2 } },
  { id: 'network',    cost: 1.4e16, at: 380, fx: { net: 1 } },
  { id: 'windows',    cost: 3e16, at: 430, fx: { reach: 2.5 } },
  { id: 'reviews',    cost: 6e16, at: 480, fx: { bugs: 0.5, fix: 2 } },
  { id: 'openclosed', cost: 1.2e17, at: 520, fx: { fix: 3 } },
  { id: 'modems',     cost: 2.5e17, at: 570, fx: { online: 2 } },
  { id: 'web',        cost: 5e17, at: 620, fx: { reach: 3, online: 2 } },
  { id: 'browser',    cost: 1e18, at: 670, fx: { code: 2 } },
];
const s = { t: 0, ops: P.ops0, total: 0, money: P.money0, progs: 1, fixers: 0, lines: 0, hidden: 0, reports: 0, users: 0,
  servers: 0, bought: {}, log: [] };
const fx = () => { const f = { reach: 1, write: 1, bugs: 1, code: 1, fix: 1, net: 0, online: 1, autoFix: 0 };
  for (const c of CARDS) if (s.bought[c.id] !== undefined) for (const [k, v] of Object.entries(c.fx)) { if (k === 'net' || k === 'autoFix') f[k] = v; else f[k] *= v; }
  return f; };
const year = () => s.t / P.len * P.years;
const perUser = (f) => P.perUser * Math.pow(2, year() / P.hwDouble) * f.code;
const onlineWant = (f) => f.net ? s.users * Math.min(0.9, 0.08 * f.online * (1 + Math.max(0, year() - 5) / 3)) : 0;
const connected = (f) => Math.min(onlineWant(f), s.servers * P.serverRoom);
const netBonus = (f) => { const c = connected(f); return c > P.netRef ? Math.pow(c / P.netRef, P.netExp) : 1; };
const speed = (f) => P.legacy + (s.users - connected(f)) * perUser(f) + connected(f) * perUser(f) * netBonus(f);
const progCost = () => P.progCost * Math.pow(P.progGrowth, s.progs - 1);
const serverCost = () => P.serverCost * Math.pow(P.serverGrowth, s.servers);
const writers = () => s.progs - s.fixers;
const appeal = (f) => Math.pow(Math.max(s.lines, 1) / P.featRef, P.featExp) / (1 + s.reports / (P.R0 * Math.sqrt(1 + s.progs)));
const buyers = (f) => P.base * f.reach * (1 + s.users * P.wom / Math.sqrt(1 + s.users / 2e4)) * appeal(f);

let finish = null, maxQuiet = 0, lastEvent = 0;
const ev = (what) => { maxQuiet = Math.max(maxQuiet, s.t - lastEvent); lastEvent = s.t; if (verbose) s.log.push(`${s.t.toFixed(0)}s ${what}`); };
const dt = 0.25;
let nextPrint = 60;
while (s.t < 3000) {
  const clicking = policy !== 'noclick' && s.t < P.clickFadeUntil;
  if (clicking) s.lines += P.clickLines * P.clicksPerSec * dt;
  for (const c of CARDS) if (s.bought[c.id] === undefined && s.t >= c.at && s.ops >= c.cost) { s.ops -= c.cost; s.bought[c.id] = s.t; ev('idea ' + c.id); }
  const F = fx();
  const wantServers = !['nonet', 'lazy'].includes(policy) && F.net && onlineWant(F) > s.servers * P.serverRoom;
  for (let k = 0; k < 50; k++) {
    if (wantServers && s.money >= serverCost() && (serverCost() < progCost() * 3 || onlineWant(F) > 1.5 * s.servers * P.serverRoom)) { s.money -= serverCost(); s.servers++; ev('server'); continue; }
    if (s.money >= progCost()) { s.money -= progCost(); s.progs++; ev('hire'); continue; }
    break;
  }
  const fixRate = P.progFix * F.fix;
  if (policy === 'smart' || (F.autoFix && !['nofix', 'lazy'].includes(policy))) {
    const inflow = s.hidden * P.discover;
    const target = P.R0 * Math.sqrt(1 + s.progs) * 0.3;
    const want = Math.ceil((inflow + Math.max(0, s.reports - target) / 10) / fixRate);
    s.fixers = Math.max(0, Math.min(s.progs - 1, want));
  } else if (policy === 'half') s.fixers = Math.floor(s.progs / 2);
  else if (policy === 'allfix') s.fixers = s.progs - 1;
  else s.fixers = 0;
  const wl = writers() * P.progLines * F.write;
  s.lines += wl * dt;
  s.hidden += (wl + (clicking ? P.clickLines * P.clicksPerSec : 0)) * P.bugsPerLine * F.bugs * dt;
  const found = s.users > 0 ? s.hidden * P.discover * dt : 0;
  s.hidden -= found; s.reports += found;
  s.reports = Math.max(0, s.reports - s.fixers * fixRate * dt);
  const b = buyers(F);
  s.users += b * dt; s.money += b * P.price * dt;
  const sp = speed(F);
  s.ops += sp * dt; s.total += sp * dt;
  s.t += dt;
  if (verbose && s.t >= nextPrint) { nextPrint += 60; console.log(`${(s.t / 60).toFixed(0)}m ${(1984.7 + year()).toFixed(1)} speed ${sp.toExponential(2)} users ${s.users.toExponential(2)} lines ${s.lines.toExponential(2)} rep ${s.reports.toFixed(0)} progs ${s.progs}/${s.fixers} srv ${s.servers} conn ${connected(F).toExponential(1)} net x${netBonus(F).toFixed(1)} $${s.money.toExponential(1)} buyers ${b.toFixed(1)}/s appeal ${appeal(F).toFixed(2)}`); }
  if (s.total >= P.goal) { finish = s.t; break; }
}
const F = fx();
console.log(`${policy.padEnd(8)} finish ${finish ? (finish / 60).toFixed(1) + ' min' : 'DNF'}  quiet ${maxQuiet.toFixed(0)}s  end speed ${speed(F).toExponential(2)}  users ${s.users.toExponential(2)}  progs ${s.progs} (fix ${s.fixers})  servers ${s.servers}  doubling ${(s.t / Math.log2(speed(F) / P.legacy)).toFixed(0)}s`);
if (verbose) console.log(s.log.slice(0, 60).join(' | '));
