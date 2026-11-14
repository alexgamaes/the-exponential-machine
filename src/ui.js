// Rendering. Elements are created once and updated in place (never rebuilt every frame),
// so buttons stay the same DOM nodes and clicks always land.
import * as E from './engine.js';
import { fmt, fmtDate, fmtApprox, sig2 } from './format.js';

const $ = (id) => document.getElementById(id);
const set = (el, txt) => { if (el.textContent !== txt) el.textContent = txt; };
const show = (el, on) => { if (el.hidden === on) el.hidden = !on; };
const fill = (el, frac) => {
  const w = (Math.max(0, Math.min(1, frac)) * 100).toFixed(1) + '%';
  if (el.style.width !== w) el.style.width = w;
};
const toggle = (el, cls, on) => { if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on); };

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('data-')) el.setAttribute(k, v);
    else el[k] = v;
  }
  for (const k of kids) el.append(k);
  return el;
}

const prodEls = new Map();
const cardEls = new Map();
let lockedEl = null;
let logKey = '';
let lastGoalText = '';
let lastTeamText = '';
let etaText = '', etaAt = 0;
let shownStage = null, shownUnit = null, shownRole = null;

// A new stage: forget every element built for the old one (otherwise its rows stay on screen).
function resetStage(s, st) {
  const first = shownStage === null;
  shownStage = s.stage;
  prodEls.clear(); cardEls.clear(); etaCache.clear();
  lockedEl = null; bigEl = null; goalKind = null;
  lastTeamText = ''; lastGoalText = ''; chartKey = ''; textClock = {}; verdict = { shown: null, cand: null, since: 0 };
  $('producer-list').replaceChildren();
  $('upgrade-list').replaceChildren();
  // Era palette: one body class per stage; CSS cross-fades the colours.
  for (const c of [...document.body.classList]) if (c.startsWith('era-')) document.body.classList.remove(c);
  document.body.classList.add('era-' + st.era);
  document.body.classList.toggle('has-market', !!st.market); // decided once per stage, so nothing moves mid-stage
  buildMarket(st);
  if (!first) {
    pulse(document.body, 'stage-enter', 2600);
    announce(`${fmtDate(s.date)}. You are now ${st.role}. Your speed carries over.`);
  }
}

export function render(s) {
  const st = E.stageData(s);
  if (s.stage !== shownStage) resetStage(s, st);
  const rate = E.getRate(s);
  const clickValue = E.getClickValue(s);
  const eff = E.effectiveRate(s);
  const unit = E.unitName(s);

  document.body.classList.toggle('ending', s.phase === 'ending');
  document.body.classList.toggle('handover', s.phase === 'handover');
  document.body.classList.toggle('next', s.phase === 'next');

  // header
  set($('era-date'), fmtDate(s.date));
  const role = E.roleName(s);
  set($('era-role'), role);
  if (role !== shownRole) { if (shownRole !== null) { pulse($('era-role'), 'promoted', 2000); announce(`You are now ${role}.`); } shownRole = role; }

  // goal bar
  renderGoal(E.currentGoal(s), eff);

  // core
  set($('ops'), fmt(s.ops));
  renderUnit(unit);
  const total = E.stageTotal(s);
  show($('total'), Math.abs(total - s.ops) > 0.5);
  set($('total-text'), E.phrase(s, 'total', { n: fmt(total) }));
  renderMarket(s, unit);
  show($('rate'), s.clicks > 0 || rate > 0);
  const canClick = E.isActive(s) || s.phase === 'ending';
  const sold = E.sellShare(s);
  set($('rate'), `+${fmt(rate, 1)} per second` + (sold ? ` (${Math.round(sold * 100)}% sold)` : '') + (canClick ? `   ·   +${fmt(clickValue, 1)} per click` : ''));
  // Team line: team speed only (no clicks), rounded, so it changes only when you buy something.
  show($('team'), rate > 0);
  if (rate > 0) {
    const ratio = rate / st.compare.rate, n = sig2(ratio);
    // slower than one of them: say what share ("20% of a Cray-1")
    const like = ratio < 0.95 && st.compare.part ? st.compare.part.replace('{n}', Math.max(1, Math.round(ratio * 100)))
      : n === 1 ? st.compare.one : st.compare.many.replace('{n}', fmt(n));
    // Two plain sentences: how fast, then what that speed does ("Decoding one day's messages: about 3 min.").
    const team = `${st.compare.lead} ${like}. ` +
      `${st.task.label}: ${st.task.size / rate < 1 ? 'under a second' : 'about ' + fmtApprox(st.task.size / rate)}.`;
    set($('team'), team);
    if (team !== lastTeamText) {
      if (lastTeamText) { $('team').classList.add('flash'); setTimeout(() => $('team').classList.remove('flash'), 400); }
      lastTeamText = team;
    }
  }
  const mainBtn = $('main-btn');
  set(mainBtn, st.clickLabel);
  show(mainBtn, canClick);
  show($('click-wrap'), canClick || s.phase === 'handover');
  show($('pass-btn'), s.phase === 'handover');

  // producers
  const anyProducer = st.producers.some(p => E.producerUnlocked(s, p.id));
  set($('producers-title'), st.text.team);
  show($('producers'), (anyProducer || s.legacyRate > 0) && s.phase !== 'next');
  show($('team-complete'), s.phase !== 'playing');
  set($('team-complete'), E.phrase(s, 'teamComplete'));
  // Legacy: everything from earlier stages, folded into one fixed line. It never changes.
  show($('legacy-row'), s.legacyRate > 0);
  if (s.legacyRate > 0) {
    const prev = E.STAGES[s.stage - 1];
    set($('legacy-label'), prev ? prev.legacy : 'Earlier stages');
    set($('legacy-text'), `${fmt(s.legacyRate, 1)} ${unit} per second, forever.`);
  }
  // Stage 3: every computer sold keeps running in someone's home, and counts.
  const showHomes = !!st.homes && s.homes >= 1 && s.phase !== 'next';
  show($('homes-row'), showHomes);
  if (showHomes) {
    const each = E.homeOutput(s);
    set($('homes-owned'), fmt(Math.floor(s.homes)));
    renderHomes(s, E.homeWork(s) * each, unit);
  }
  for (const p of st.producers) {
    const unlocked = E.producerUnlocked(s, p.id);
    let el = prodEls.get(p.id);
    if (unlocked && !el) {
      el = {
        root: h('div', { class: 'producer' }),
        owned: h('span', { class: 'producer-owned' }),
        desc: h('p'),
        cost: h('span', { class: 'cost' }),
      };
      el.btn = h('button', { class: 'buy-btn', 'data-action': 'buy-producer', 'data-id': p.id }, h('span', {}, p.buyLabel), el.cost);
      el.root.append(h('div', { class: 'producer-head' }, h('span', {}, p.name), el.owned), el.desc, el.btn);
      $('producer-list').append(el.root);
      prodEls.set(p.id, el);
    }
    if (!el) continue;
    const out = E.producerOutput(s, p.id);
    const n = s.producers[p.id];
    const cost = E.producerCost(s, p.id);
    set(el.owned, `${n} owned`);
    const each = p.each.replace('{out}', fmt(out, 1)).replace('{unit}', unit).replace(/^Each checks 1 guesses/, 'Each checks 1 guess').replace(/^Each builds 1 computers/, 'Each builds 1 computer');
    set(el.desc, each + (n ? ` Together: ${fmt(out * n, 1)} ${p.makes === 'programs' ? 'a second' : 'per second'}.` : '') + (p.note ? ' ' + p.note : ''));
    set(el.cost, price(p, Math.ceil(cost), unit)); toggle(el.cost, 'dollars', p.currency === 'dollars');
    const can = s.phase === 'playing' && E.wallet(s, p) >= cost;
    if (el.btn.disabled === can) el.btn.disabled = !can;
    show(el.btn, s.phase === 'playing');
  }

  // upgrades
  const open = st.upgrades.filter(u => s.revealed[u.id] !== undefined && !(u.id in s.bought));
  const locked = E.nextLocked(s);
  show($('upgrades'), (open.length > 0 || Object.keys(s.revealed).length > 0) && E.isActive(s));
  const list = $('upgrade-list');
  for (const [id, el] of cardEls) if (!open.some(u => u.id === id)) { el.root.remove(); cardEls.delete(id); }
  for (const u of open) {
    let el = cardEls.get(u.id);
    if (!el) { el = makeCard(u); cardEls.set(u.id, el); }
    const have = E.wallet(s, u);
    const can = have >= u.cost;
    toggle(el.root, 'affordable', can);
    toggle(el.root, 'unaffordable', !can);
    fill(el.progress, have / u.cost);
    const income = u.currency === 'dollars' ? E.moneyRate(s) : rate * (1 - E.sellShare(s)) + (eff - rate); // clicks are never sold
    set(el.cost, price(u, u.cost, unit) + (can ? '' : cardEta(u.id, u.cost - have, income))); toggle(el.cost, 'dollars', u.currency === 'dollars');
    for (const b of el.optionBtns) if (b.disabled === can) b.disabled = !can;
  }
  // locked preview card (the next thing to aim for)
  const wantLocked = locked && Object.keys(s.revealed).length > 0;
  if (wantLocked) {
    if (!lockedEl) {
      lockedEl = { root: h('div', { class: 'card locked' }), name: h('span'), cost: h('span', { class: 'card-cost' }), needs: h('div', { class: 'needs' }) };
      lockedEl.root.append(h('div', { class: 'card-head' }, lockedEl.name, lockedEl.cost), lockedEl.needs);
    }
    set(lockedEl.name, locked.upgrade.name);
    const p = locked.progress;
    set(lockedEl.cost, price(locked.upgrade, locked.upgrade.cost, unit)); toggle(lockedEl.cost, 'dollars', locked.upgrade.currency === 'dollars');
    const why = p ? p.phrase.charAt(0).toLowerCase() + p.phrase.slice(1) : '';
    set(lockedEl.needs, !p ? (open.length >= 2 ? 'Appears when you buy one of the ideas above.' : 'Appears in a moment.')
      : p.kind === 'upgrade' ? `Locked: ${why}.` : `Locked: ${why} (${fmt(p.have)} of ${fmt(p.need)}).`);
  }
  // Cards in data order, locked preview last. Only touch the DOM when the order changes,
  // so a button never moves between mouse-down and mouse-up.
  // Stage-end card (the stage goal when ready, then each finale action) goes first.
  const big = bigCard(s, st, unit);
  const wanted = open.map(u => cardEls.get(u.id).root);
  if (big) wanted.unshift(big);
  if (wantLocked) wanted.push(lockedEl.root);
  const current = [...list.children];
  if (wanted.length !== current.length || wanted.some((el, i) => el !== current[i])) list.replaceChildren(...wanted);

  // next stage placeholder
  show($('next-stage'), s.phase === 'next');
  if (s.phase === 'next') set($('legacy-rate'), `${fmt(s.legacyRate, 1)} ${unit} per second`);

  renderLog(s);
}

// "~20 s" on cards you are saving for. Updated at most once a second per card, so it does not flicker.
const etaCache = new Map(); // id -> { at, text }
function cardEta(id, missing, eff) {
  const now = performance.now();
  const c = etaCache.get(id);
  if (c && now - c.at < 1000) return c.text;
  const sec = missing / Math.max(eff, 1e-9);
  const text = eff > 0 && missing > 0 && sec < 3600 ? ` · ~${fmtApprox(sec)}` : '';
  etaCache.set(id, { at: now, text });
  return text;
}

// ---------- goal bar ----------
// Each goal kind has a fixed identity (tag + colour + bar texture, see design/03b §d).
// When the kind changes, the bar drains, swaps, and refills, so the switch is visible.
const TAGS = { balance: 'SAVE UP', lifetime: 'IN TOTAL', ready: 'READY' };
let goalKind = null, goalSwitching = false;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function goalNums(goal, eff) {
  let nums;
  if (goal.ready) nums = 'Ready';
  else if (goal.kind === 'balance') nums = `You have ${fmt(goal.have)} of ${fmt(goal.need)} ${goal.unitLabel}`;
  else nums = `${fmt(goal.have)} of ${fmt(goal.need)} ${goal.unitLabel}`;
  const now = performance.now();
  if (now - etaAt > 1000 || goal.text !== lastGoalText) {
    etaAt = now;
    const sec = (goal.need - goal.have) / Math.max(eff, 1e-9);
    etaText = goal.eta && !goal.ready && eff > 0 && sec < 3600 ? `  ·  ~${fmtApprox(sec)}` : '';
  }
  return nums + etaText;
}

function applyGoal(goal, eff) {
  const box = $('goal');
  set($('goal-tag'), TAGS[goal.kind] || '');
  set($('goal-text'), goal.text);
  set($('goal-nums'), goalNums(goal, eff));
}

function renderGoal(goal, eff) {
  const box = $('goal');
  show(box, !!goal);
  if (!goal || goalSwitching) return;
  const fillEl = $('goal-fill');
  // The stage goal grows exponentially, so its fill is curved (see stageProgress) to move at an even pace.
  const frac = goal.ready ? 1 : (goal.frac ?? goal.have / goal.need);

  if (goal.kind !== goalKind) {
    const first = goalKind === null;
    const toReady = goal.kind === 'ready';
    goalKind = goal.kind;
    etaAt = 0; // never carry the old goal's time estimate over
    lastGoalText = goal.text;
    if (first || reducedMotion() || toReady) {
      document.body.dataset.goalKind = goal.kind;
      applyGoal(goal, eff);
      fill(fillEl, frac);
      if (!first) outline(box);
      return;
    }
    // 1) drain the old bar and fade the old tag, 2) swap, 3) pop the new tag and refill.
    goalSwitching = true;
    box.classList.add('switching');
    fill(fillEl, 0);
    setTimeout(() => {
      document.body.dataset.goalKind = goal.kind;
      applyGoal(goal, eff);
      box.classList.remove('switching');
      box.classList.add('refill');
      outline(box);
      requestAnimationFrame(() => {
        fill(fillEl, frac);
        setTimeout(() => box.classList.remove('refill'), 500);
        goalSwitching = false;
      });
    }, 180);
    return;
  }

  applyGoal(goal, eff);
  fill(fillEl, frac);
  if (goal.text !== lastGoalText) { lastGoalText = goal.text; outline(box); }
}

function outline(box) {
  box.classList.remove('kind-changed');
  void box.offsetWidth; // restart
  box.classList.add('kind-changed');
  clearTimeout(outline.t);
  outline.t = setTimeout(() => box.classList.remove('kind-changed'), 700);
}

// One persistent "milestone" card reused for the stage goal and the finale actions.
let bigEl = null;
function bigCard(s, st, unit) {
  let item = null, action = null, costText = '', can = false;
  if (E.canBuyGoal(s)) { item = st.goal; action = 'build-goal'; costText = 'ready'; can = true; }
  else if (s.phase === 'finale') {
    item = E.currentFinale(s); action = 'finale';
    if (item) { can = s.ops >= item.cost; costText = `${fmt(item.cost)} ${unit}`; }
  }
  if (!item) return null;
  if (!bigEl) {
    bigEl = { name: h('span'), cost: h('span', { class: 'card-cost' }), effect: h('div', { class: 'card-effect' }), progress: h('div', { class: 'progress' }) };
    bigEl.root = h('button', { class: 'card milestone' }, h('div', { class: 'card-head' }, bigEl.name, bigEl.cost), bigEl.effect, bigEl.progress);
  }
  bigEl.root.dataset.action = action;
  set(bigEl.name, item.name);
  set(bigEl.cost, costText);
  set(bigEl.effect, item.text);
  toggle(bigEl.root, 'affordable', can);
  toggle(bigEl.root, 'unaffordable', !can);
  fill(bigEl.progress, item.cost ? s.ops / item.cost : 1);
  return bigEl.root;
}

function makeCard(u) {
  const cost = h('span', { class: 'card-cost' });
  const head = h('div', { class: 'card-head' }, h('span', {}, u.name), cost);
  const effect = h('div', { class: 'card-effect' }, u.text);
  const progress = h('div', { class: 'progress' });
  const optionBtns = [];
  let root;
  if (u.effect.type === 'choice') {
    root = h('div', { class: 'card choice' }, head, effect);
    const opts = h('div', { class: 'choice-options' });
    for (const o of u.effect.options) {
      const b = h('button', { class: 'buy-btn', 'data-action': 'choose', 'data-id': u.id, 'data-option': o.id },
        h('span', {}, o.label), h('small', {}, o.text));
      optionBtns.push(b); opts.append(b);
    }
    root.append(opts, progress);
  } else {
    root = h('button', { class: 'card', 'data-action': 'buy-upgrade', 'data-id': u.id }, head, effect, progress);
  }
  return { root, progress, optionBtns, cost };
}

function renderLog(s) {
  const key = s.log.length + '|' + (s.log[0] ? s.log[0].t + s.log[0].text : '');
  if (key === logKey) return;
  const first = !logKey;
  logKey = key;
  const ol = $('log');
  // Keep the reader's place if they scrolled down; otherwise the newest line stays in view at the top.
  const reading = !first && ol.scrollTop > 8;
  const fromBottom = ol.scrollHeight - ol.scrollTop;
  ol.replaceChildren(...s.log.map((e, i) => {
    if (e.kind === 'stage') return h('li', { class: 'stage-divider' + (i === 0 && !first ? ' fresh' : '') }, h('span', {}, e.text));
    const li = h('li', { class: e.kind + (i === 0 && !first ? ' fresh' : '') },
      h('span', { class: 'when' }, fmtDate(e.date, true)),
      h('span', { class: 'what' }, e.text));
    return li;
  }));
  if (reading) { ol.scrollTop = ol.scrollHeight - fromBottom; show($('log-new'), true); }
}

// "+N" floaters over the main button. At most 5 alive; extra clicks merge into the newest.
const floaters = [];
export function floater(value) {
  const box = $('floaters');
  if (!box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (floaters.length >= 5) {
    const f = floaters[floaters.length - 1];
    f.value += value; f.el.textContent = '+' + fmt(f.value, 1);
    return;
  }
  const el = h('span', { class: 'floater' }, '+' + fmt(value, 1));
  el.style.top = `${Math.random() * 1.5}rem`;
  box.append(el);
  const f = { el, value };
  floaters.push(f);
  setTimeout(() => { el.remove(); floaters.splice(floaters.indexOf(f), 1); }, 700);
}

// ---------- small effects ----------
function pulse(el, cls, ms) {
  el.classList.remove(cls);
  void el.offsetWidth; // restart the animation
  el.classList.add(cls);
  clearTimeout(el['_t_' + cls]);
  el['_t_' + cls] = setTimeout(() => el.classList.remove(cls), ms);
}

function announce(text) { const el = $('announce'); if (el) el.textContent = text; }

// The unit word next to the counter. A rename is struck through like a ledger correction, then replaced.
// The number is a separate element and is never touched.
function renderUnit(unit) {
  const el = $('unit');
  if (shownUnit === null || reducedMotion()) {
    if (shownUnit !== null && unit !== shownUnit) { pulse(el, 'renamed', 3000); announce(`${cap(shownUnit)} are now called ${unit}.`); }
    shownUnit = unit; set(el, unit); return;
  }
  if (unit === shownUnit || renderUnit.busy) return;
  renderUnit.busy = true;
  announce(`${cap(shownUnit)} are now called ${unit}.`);
  shownUnit = unit;
  el.classList.add('striking');
  setTimeout(() => {
    el.classList.remove('striking');
    set(el, unit);
    pulse(el, 'renamed', 3000);
    renderUnit.busy = false;
  }, 450);
}
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

// ---------- money ----------
const price = (item, n, unit) => item.currency === 'dollars' ? money(n) : `${fmt(n)} ${unit}`;
const money = (n) => '$' + fmt(n);

// The market panel's title, text and buttons come from the stage (Stage 2: share sold; Stage 3: price tag).
function buildMarket(st) {
  const m = st.market;
  if (!m) return;
  set($('market-title'), m.title);
  set($('market-intro'), m.intro);
  const models = m.kind === 'models';
  show($('market-seg'), !models);
  show($('models'), models);
  show($('sell-status'), !models);
  show($('sell-customers'), !models);
  show($('market-intro'), !!m.intro);
  if (models) return;
  const seg = $('market-seg');
  seg.setAttribute('aria-label', m.kind === 'price' ? 'Price of your computer' : 'How much computer time to sell');
  const values = m.kind === 'price' ? m.prices : m.levels;
  seg.replaceChildren(h('span', { class: 'seg-label' }, m.label),
    ...values.map(v => h('button', { 'data-action': 'sell', 'data-value': String(v) }, m.kind === 'price' ? money(v) : `${Math.round(v * 100)}%`)));
}

function renderMarket(s, unit) {
  const st = E.stageData(s);
  const open = E.sellOpen(s);
  show($('market'), open);
  const moneyOn = !!st.market && (open || s.dollars > 0 || !!st.startDollars) && s.phase !== 'next';
  show($('money'), moneyOn);
  toggle($('balances'), 'two', moneyOn);
  if (!st.market) return;
  const perSec = E.moneyRate(s);
  set($('money-text'), money(s.dollars));
  set($('money-rate'), perSec > 0 ? `+${money(sig2(perSec))} per second` : '');
  if (!open) return;
  if (st.market.kind === 'models') { renderModels(s); return; }
  const value = E.marketValue(s);
  for (const b of $('market-seg').querySelectorAll('[data-action="sell"]')) {
    const on = Number(b.dataset.value) === value;
    if (b.getAttribute('aria-pressed') !== String(on)) b.setAttribute('aria-pressed', String(on));
  }
  const flow = E.sellFlow(s);
  const want = E.sellDemand(s);
  let status;
  if (s.sell === 0) status = `You sell nothing. Customers would pay for up to ${fmt(want)} ${unit} per second.`;
  else if (flow.offered > want * 1.0001)
    status = `You offer ${fmt(sig2(flow.offered))} ${unit} per second, but customers only want ${fmt(want)}. The rest earns nothing.`;
  else status = `You sell ${fmt(sig2(flow.offered))} ${unit} per second. Customers want up to ${fmt(want)}.`;
  set($('sell-status'), status);
  const names = E.customers(s).map(c => c.name).join(', ');
  set($('sell-customers'), 'Customers: ' + names.charAt(0).toUpperCase() + names.slice(1) + '.');
}

// ---------- Stage 3: launching models and series ----------
const ratioText = (r) => E.fmtRatio(r);
const progText = (n) => n < 1000 ? fmt(Math.floor(n)) : fmt(sig2(n * 10) / 10, 1);   // 845 · 4,210 (3 digits)
const rateText = (x) => x < 10 ? String(Math.round(x * 10) / 10) : fmt(sig2(x), 1);   // 0.3 · 2.5 · 14
const boostText = (x) => '×' + (x < 10 ? x.toFixed(1) : String(Math.round(x)));
let textClock = {};   // per block: [second, models] it last wrote at
// Computers in homes: newest model against the first, a small table of series, and the total.
function renderHomes(s, total, unit) {
  const st = E.stageData(s), n = s.models.length;
  const r = n ? s.models[n - 1].speed / s.models[0].speed : 1;
  if (!textReady(s, 'homes')) return;
  $('homes-gen').replaceChildren(...(n <= 1 ? ['Every one is a Model 1, the speed you started with.']
    : ['Model ', h('b', {}, String(n)), ' runs ', h('b', {}, ratioText(r)), ' as fast as Model 1.']));
  $('homes-total').replaceChildren('Together: ', h('b', {}, fmt(sig2(total), 1)), ` ${unit} per second.`);
  const progs = E.programsOpen(s);
  show($('series-grid'), progs); show($('homes-programs'), progs);
  if (!progs) return;
  // Up to 3 rows (reserved from the new chip on): with 4 or more series the oldest are summed in the first row.
  const k = s.series.length, slots = E.newSeriesOpen(s) ? 3 : 1;
  const range = (i0, i1) => {
    let lo = Infinity, hi = 0;
    s.models.forEach((m, j) => { if ((m.series ?? 0) >= i0 && (m.series ?? 0) <= i1) { lo = Math.min(lo, j + 1); hi = Math.max(hi, j + 1); } });
    return lo === hi ? ` (Model ${lo})` : ` (Models ${lo}–${hi})`;
  };
  const row = (i0, i1) => {
    let homes = 0, programs = 0, plain = 0, boosted = 0;
    for (let i = i0; i <= i1; i++) { homes += s.series[i].homes; programs += s.series[i].programs; }
    for (const m of s.models) { const i = m.series ?? 0; if (i >= i0 && i <= i1) { plain += m.homes * m.speed; boosted += m.homes * m.speed * E.seriesMul(s, i); } }
    const boost = i0 === i1 ? E.seriesMul(s, i0) : (plain > 0 ? boosted / plain : 1);
    const name = i0 === i1 ? `Series ${i0 + 1}` : `Series ${i0 + 1}–${i1 + 1}`;
    const cls = i1 === k - 1 ? 'on-sale' : '';
    return [h('span', { class: cls }, name, h('span', { class: 'range' }, range(i0, i1))),
      h('span', { class: cls }, fmt(Math.floor(homes))), h('span', { class: cls }, progText(programs)), h('span', { class: cls }, boostText(boost))];
  };
  const rows = [];
  if (k > slots) { rows.push(row(0, k - slots)); for (let i = k - slots + 1; i < k; i++) rows.push(row(i, i)); }
  else for (let i = 0; i < k; i++) rows.push(row(i, i));
  while (rows.length < slots) rows.push([' ', '', '', ''].map(x => h('span', { class: 'empty' }, x)));
  $('series-grid').replaceChildren(...['', 'Homes', 'Programs', 'Boost'].map(x => h('span', { class: 'grid-head' }, x)), ...rows.flat());
  const rate = E.programRate(s);
  const own = st.producers.filter(p => p.makes === 'programs').reduce((a, p) => a + s.producers[p.id] * E.producerOutput(s, p.id), 0);
  $('homes-programs').replaceChildren(`Series ${k} gets `, h('b', {}, `+${rateText(rate)}`), ' programs a second' +
    (own > 0 ? ` (${rateText(own)} from your programmers).` : '.'));
}
// Panel text changes at most once a second (and at once after a launch); bars move smoothly.
function textReady(s, block) {
  const now = [Math.floor(s.time), s.models.length], was = textClock[block];
  if (was && was[0] === now[0] && was[1] === now[1]) return false;
  textClock[block] = now;
  return true;
}
function niceCeil(v) {
  if (!(v > 0)) return 1;
  const k = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 5, 10]) if (v <= m * k) return m * k;
  return 10 * k;
}
const SLOTS = 60, SHOWN = 45;    // 60 slots of 2 s; the last 15 are kept for the expected fade
let chartKey = '';
// Bars: filled = sold, outlined = buyers turned away. Dashed step line: what you could make. Dotted: buyers if you wait.
function renderChart(s, f) {
  const bars = s.sales.slice(-SHOWN).map(x => Array.isArray(x) ? x : [x, f.capacity]);
  const n = bars.length, age = E.modelAge(s), now = E.modelDemand(s);
  const proj = [];
  const f0 = E.freshness(s);
  for (let j = 1; n + j - 1 < SLOTS; j++) proj.push(now * E.freshness(s, undefined, age + 2 * j) / f0);
  const top = niceCeil(Math.max(1, ...bars.map(b => Math.max(b[0], b[1])), ...proj, f.capacity) * 1.05);
  const key = bars.length + '|' + (bars[n - 1] || []).join(',') + '|' + top + '|' + s.models.length;
  if (key === chartKey) return;
  chartKey = key;
  const y = (v) => (40 - 40 * Math.min(1, v / top));
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  const kids = [];
  bars.forEach(([buy, make], i) => {
    const sold = Math.min(buy, make);
    kids.push(el('rect', { x: i * 2 + 0.3, y: y(sold).toFixed(2), width: 1.4, height: (40 - y(sold)).toFixed(2), class: 'bar' }));
    if (buy > make) kids.push(el('rect', { x: i * 2 + 0.3, y: y(buy).toFixed(2), width: 1.4, height: (y(make) - y(buy)).toFixed(2), class: 'bar-away', 'vector-effect': 'non-scaling-stroke' }));
  });
  if (proj.length) {
    const pts = [[n * 2 - 1, y(now)], ...proj.map((v, j) => [(n + j) * 2 + 1, y(v)])];
    kids.push(el('polyline', { points: pts.map(p => p.map(v => (+v).toFixed(2)).join(',')).join(' '), class: 'proj', 'vector-effect': 'non-scaling-stroke' }));
  }
  if (n) {
    const pts = [];
    bars.forEach(([, make], i) => { pts.push([i * 2, y(make)], [i * 2 + 2, y(make)]); });
    pts.push([120, y(f.capacity)]);
    kids.push(el('polyline', { points: pts.map(p => p.map(v => (+v).toFixed(2)).join(',')).join(' '), class: 'cap', 'vector-effect': 'non-scaling-stroke' }));
  }
  $('chart-svg').replaceChildren(...kids);
  set($('chart-max'), `${fmt(top)} a second`);
  const capY = 100 * Math.min(1, f.capacity / top);
  const label = $('chart-capline');
  show(label, f.capacity > 0);
  set(label, `you can make ${fmt(sig2(f.capacity), 1)}`);
  label.style.bottom = capY > 75 ? `calc(${capY.toFixed(1)}% - 1.3em)` : `${capY.toFixed(1)}%`;
}

// The supply verdict: a new state shows only after it has held for 2 s (switching over shows at once).
let verdict = { shown: null, cand: null, since: 0 };
function supplyState(s, f) {
  if (!(s.producers.workbench > 0)) return 'none';
  if (E.retoolLeft(s) > 0) return 'switch';
  if (f.demand > f.capacity * 1.05) return 'short-computers';
  if (f.capacity > f.demand * 1.05) return 'short-buyers';
  return 'even';
}
const gap = (x, one, many) => { const v = rateText(Math.max(0, x)); return `${v} ${v === '1' ? one : many}`; };
function secondsTo(s, progress, age) {
  const m = E.stageData(s).market;
  const need = m.labTime * Math.pow(progress / (1 - progress), 1 / m.labShape);
  return Math.max(1, Math.ceil(need - age));
}

function renderModels(s) {
  const st = E.stageData(s), m = st.market, f = E.modelFlow(s);
  const n = E.modelOnSale(s), k = E.seriesOnSale(s), launched = n !== (textClock.models?.[1] ?? n);
  const progs = E.programsOpen(s), chipIn = E.newSeriesOpen(s);
  // bars move every frame; after a launch they go back to the start without sliding
  for (const id of ['next-fill', 'series-fill']) toggle($(id), 'no-anim', launched);
  fill($('next-fill'), E.labProgress(s, E.modelAge(s)));
  fill($('series-fill'), chipIn ? E.designProgress(s) : 0);
  renderChart(s, f);
  const buttons = [['next-btn', 'next'], ['series-btn', 'series']];
  for (const [id, kind] of buttons) { const off = !E.canLaunch(s, kind); if ($(id).disabled !== off) $(id).disabled = off; }
  if (!textReady(s, 'models')) return;

  set($('model-tag'), progs ? `Model ${n} · Series ${k}` : `Model ${n}`);
  // Supply line
  const full = f.capacity / Math.max(E.retoolFactor(s), 1e-9);
  const B = rateText(f.demand), M = rateText(f.capacity);
  set($('supply-nums'), `Buyers ${B} a second · you can make ${M}` + (E.retoolLeft(s) > 0 ? ` (soon ${fmt(sig2(full), 1)})` : ''));
  const state = supplyState(s, f);
  // Only the steady states wait 2 s before they replace each other; "switching over" and "nobody can build" are facts.
  const steady = (x) => x === 'short-computers' || x === 'short-buyers' || x === 'even';
  if (state !== verdict.cand) { verdict.cand = state; verdict.since = s.time; }
  if (!steady(state) || !steady(verdict.shown) || s.time - verdict.since >= 2) verdict.shown = state;
  const shown = verdict.shown, factories = E.producerUnlocked(s, 'factory');
  const programmers = st.producers.some(p => p.makes === 'programs' && E.producerUnlocked(s, p.id));
  const [bold, fix] = {
    none: ['Nobody can build one yet.', 'Set up a workbench.'],
    switch: [`Switching over to Model ${n}: ${Math.ceil(E.retoolLeft(s))} s left.`, 'It is the cost of a launch.'],
    'short-computers': [`Short of computers: ${gap(f.demand - f.capacity, 'buyer', 'buyers')} a second ${f.demand - f.capacity < 1.5 ? 'goes' : 'go'} home.`,
      E.modelAge(s) < 60 && n > 1 ? 'The launch rush will fade.' : factories ? 'Open a factory.' : 'Set up a workbench.'],
    'short-buyers': [`Short of buyers: ${gap(f.capacity - f.demand, 'computer', 'computers')} a second not made.`,
      E.launchBlock(s, 'next') === 'lab' ? `Launch Model ${n + 1} when it is ready.` : programmers ? 'Launch, or hire programmers.' : `Launch Model ${n + 1} to bring buyers.`],
    even: ['Making and selling are even.', ''],
  }[shown];
  set($('verdict-bold'), bold); set($('verdict-fix'), fix);

  // Next model
  const phases = { start: 'Just started', fast: 'Improving fast', slowing: 'Slowing down' };
  set($('next-head'), `Next model: ${ratioText(E.labRatio(s, 'next'))} as fast`);
  set($('next-phase'), E.labPhase(s, 'next') === 'limit' ? 'Nearly done' : phases[E.labPhase(s, 'next')]);
  set($('next-btn'), `Launch Model ${n + 1}`);
  const nb = E.launchBlock(s, 'next'), P = s.series[k - 1].programs;
  const line1 = nb === 'workbench' ? 'Set up a workbench first: someone has to build it.'
    : nb === 'lab' ? `Ready to launch in ${secondsTo(s, m.minProgress, E.modelAge(s))} s.`
    : E.labPhase(s, 'next') === 'limit' ? 'Your engineers will ship it themselves soon.'
    : !progs ? 'Computers already in homes keep counting.'
    : `Runs all ${progText(P)} programs of Series ${k}.`;
  set($('next-note'), `${line1}\nBuilding slows for ${m.retool.next} s.`);

  // New series
  show($('lab-series'), progs);
  if (progs) {
    toggle($('lab-series'), 'locked', !chipIn);
    if (!chipIn) {
      set($('series-head'), 'New series'); set($('series-phase'), 'Needs a new chip');
      set($('series-btn'), 'Launch a new series');
      $('series-note').replaceChildren('A new series needs a new chip: The $25 chip. It is a bigger leap, but none of your programs run on it.');
    } else {
      const sb = E.launchBlock(s, 'series'), ph = E.labPhase(s, 'series');
      set($('series-head'), `New series: ${ratioText(E.labRatio(s, 'series'))} as fast`);
      set($('series-phase'), sb === 'behind' ? 'Overtaken' : ph === 'limit' ? 'As good as it gets' : phases[ph] || '');
      set($('series-btn'), `Launch Series ${k + 1}`);
      const C = E.carried(s);
      const progLine = C >= 1 ? `Keeps ${progText(C)} of your ${progText(P)} programs.` : `Runs none of your ${progText(P)} programs.`;
      const chipLine = `On ${s.design?.chip || E.chipName(s)}. Building slows for ${m.retool.series} s.`;
      let first;
      if (sb === 'behind') first = 'Your next models have caught up with it. The lab starts a new design.';
      else if (sb === 'lab') first = `Ready to launch in ${secondsTo(s, m.minProgress, E.designAge(s))} s.`;
      else {
        const w = E.saleValue(s, 'series') / E.saleValue(s, 'next');
        first = h('b', {}, `Worth ${w < 0.1 ? 'under 0.1' : (Math.round(w * 10) / 10).toFixed(1)}× a next model.`);
      }
      $('series-note').replaceChildren(first, ` ${progLine}\n${chipLine}`);
    }
  }
}
