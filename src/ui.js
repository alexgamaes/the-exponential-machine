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
  lastTeamText = ''; lastGoalText = ''; shopSec = -1; stockTag = { shown: '', cand: '', since: 0, hist: [] };
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
  const goal = E.currentGoal(s);
  renderGoal(goal, goal?.money ? E.moneyRate(s) : eff);

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
  set($('rate'), `+${fmt(rate, 1)} per second` + (sold ? ` (${Math.round(sold * 100)}% sold)` : '') + (canClick && !st.clickBuilds ? `   ·   +${fmt(clickValue, 1)} per click` : ''));
  // Team line: team speed only (no clicks), rounded, so it changes only when you buy something.
  show($('team'), rate > 0);
  if (st.homes) {   // Stage 3: the line says where the speed comes from (computers sold), once a second
    const key = Math.floor(s.homes) + '|' + E.genSpeed(s);
    if (key !== lastTeamText) { lastTeamText = key; $('team').replaceChildren(...homesLine(s, unit)); }
  } else if (rate > 0) {
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
  if (!E.isShop(s)) set(mainBtn, st.clickLabel);
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
  else if (goal.kind === 'balance' && goal.money) nums = `You have ${money(goal.have)} of ${money(goal.need)}`;
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
    if (item) { can = E.wallet(s, item) >= item.cost; costText = price(item, item.cost, unit); }
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
  fill(bigEl.progress, item.cost ? E.wallet(s, item) / item.cost : 1);
  toggle(bigEl.cost, 'dollars', item.currency === 'dollars');
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
export function floater(value, suffix = '') {
  const box = $('floaters');
  if (!box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (floaters.length >= 5) {
    const f = floaters[floaters.length - 1];
    f.value += value; f.el.textContent = '+' + fmt(f.value, 1) + (suffix && f.value !== 1 ? suffix + 's' : suffix);
    return;
  }
  const el = h('span', { class: 'floater' }, '+' + fmt(value, 1) + suffix);
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
  const shop = m.kind === 'shop';
  show($('market-seg'), !shop);
  show($('shop'), shop);
  show($('sell-status'), !shop);
  show($('sell-customers'), !shop);
  show($('market-intro'), !!m.intro);
  document.body.classList.toggle('has-shop', shop);
  if (shop) return;
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
  if (st.market.kind === 'shop') { renderShop(s); return; }
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

// ---------- Stage 3: the shop ----------
// Paperclips-style rows: label, number, the buttons that change it. Counters tick freely; slower words
// (buyers, chip price, the warehouse tag) change at most once a second, and a new tag must hold for 2 s.
const count = (n) => fmt(Math.floor(n + 1e-9));
const perSec = (x) => x < 10 ? String(Math.round(x * 10) / 10) : fmt(sig2(x));
const chipMoney = (x) => '$' + (x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : fmt(Math.round(x)));
const visible = (el, on) => { const v = on ? '' : 'hidden'; if (el.style.visibility !== v) el.style.visibility = v; };
let shopSec = -1;
let stockTag = { shown: '', cand: '', since: 0, hist: [] };
function renderShop(s) {
  const fx = E.shopFlow(s), active = E.isActive(s);
  set($('shop-stock'), count(s.stockN));
  set($('shop-chips'), count(s.chips));
  set($('shop-price'), money(s.price));
  toggle($('chips-row'), 'out', s.chips < 1);
  // buttons: never hidden (dashed when you cannot afford them), so nothing moves
  const batch = Math.max(1, E.chipBuyable(s)), cost = E.chipBatchCost(s);
  set($('chips-label'), `Buy ${fmt(batch)}`);
  set($('chips-cost'), money(sig2(cost)));
  const noChips = !active || E.chipBuyable(s) < 1;
  if ($('buy-chips').disabled !== noChips) $('buy-chips').disabled = noChips;
  for (const b of document.querySelectorAll('[data-action="price"]')) if (b.disabled === active) b.disabled = !active;
  for (const which of ['price', 'chips']) {
    const btn = $('auto-' + which), has = E.autoUnlocked(s, which);
    visible(btn, has);
    set(btn, E.autoOn(s, which) ? 'Auto: on' : 'Auto: off');
    toggle(btn, 'on', E.autoOn(s, which));
  }
  const adsOpen = E.advertsOpen(s);
  visible($('ads-row'), adsOpen);
  set($('ads-level'), `level ${s.ads}`);
  const adCost = E.advertCost(s), noAd = s.phase !== 'playing' || s.dollars < adCost;
  set($('ad-cost'), money(adCost));
  set($('ad-label'), `+${Math.round((E.stageData(s).market.adverts.mul - 1) * 100)}% buyers`);
  if ($('buy-ad').disabled !== noAd) $('buy-ad').disabled = noAd;
  const rival = E.rivalPrice(s);
  visible($('rival-row'), rival !== null);
  const main = $('main-btn'), out = E.isActive(s) && s.chips < 1;
  set(main, out ? 'No chips' : E.stageData(s).clickLabel);
  if (main.disabled !== out) main.disabled = out;

  const sec = Math.floor(s.time);
  if (sec === shopSec) return;
  shopSec = sec;
  const make = s.chips < 1 ? 0 : fx.build + (s._clickRate || 0);
  set($('shop-buyers'), perSec(fx.buyers));
  set($('shop-build'), `a second · you build ${perSec(make)}`);
  if (rival !== null) {
    set($('rival-price'), money(rival));
    set($('rival-note'), s.price > rival ? 'Above yours: buyers go to them' : 'Yours is lower');
  }
  const cp = E.chipPrice(s), mv = E.chipMove(s);
  set($('chip-price'), chipMoney(cp) + (mv > 0 ? ' ▲' : mv < 0 ? ' ▼' : '  '));
  const deal = E.chipDeal(s);
  set($('chip-tag'), deal === 'cheap' ? 'Cheap' : deal === 'dear' ? 'Dear' : '');
  // the warehouse tag: did stock grow or shrink over the last 5 s?
  const h5 = stockTag.hist;
  h5.push(s.stockN); if (h5.length > 6) h5.shift();
  const delta = h5[h5.length - 1] - h5[0];
  let cand = '';
  if (s.stockN < 1) cand = fx.buyers > make * 1.05 ? 'Sold out' : '';
  else if (delta > Math.max(2, 0.05 * fx.buyers * 5)) cand = '▲ Piling up';
  else if (delta < -Math.max(2, 0.05 * fx.buyers * 5)) cand = '▼ Selling fast';
  if (cand !== stockTag.cand) { stockTag.cand = cand; stockTag.since = s.time; }
  if (cand !== stockTag.shown && (s.time - stockTag.since >= 2 || s.stockN < 1)) stockTag.shown = cand;   // an empty warehouse shows at once
  set($('stock-tag'), stockTag.shown);
}

// Stage 3: the line under the speed says where it comes from.
function homesLine(s, unit) {
  const each = E.homeOutput(s) * E.genSpeed(s);
  const n = Math.floor(s.homes);
  const lead = n < 1 ? 'No computers in homes yet.' : n === 1 ? '1 computer in a home.' : `${fmt(n)} computers in homes.`;
  return [h('b', {}, lead), ` Each new one sold: +${fmt(sig2(each))} ${unit} per second.`];
}
