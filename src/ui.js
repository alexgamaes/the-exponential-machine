// Rendering. Elements are created once and updated in place (never rebuilt every frame),
// so buttons stay the same DOM nodes and clicks always land.
import * as E from './engine.js';
import { fmt, fmtDuration, fmtDate } from './format.js';

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

export function render(s) {
  const st = E.stageData(s);
  const rate = E.getRate(s);
  const clickValue = E.getClickValue(s);
  const eff = E.effectiveRate(s);

  document.body.classList.toggle('ending', s.phase === 'ending');
  document.body.classList.toggle('handover', s.phase === 'handover');
  document.body.classList.toggle('next', s.phase === 'next');

  // header
  set($('era-date'), fmtDate(s.date));
  set($('era-role'), st.role);
  set($('stage-meter-label'), `${st.goal.name.replace('Build ', '')}: ${Math.floor(E.stageProgress(s) * 100)}%`);
  fill($('stage-meter-fill'), E.stageProgress(s));

  // goal bar
  const goal = E.currentGoal(s);
  show($('goal'), !!goal);
  if (goal) {
    set($('goal-text'), goal.text);
    let nums = `${fmt(goal.have)} / ${fmt(goal.need)}`;
    if (goal.eta && goal.have < goal.need && eff > 0) nums += `  ·  ~${fmtDuration((goal.need - goal.have) / eff)}`;
    set($('goal-nums'), nums);
    fill($('goal-fill'), goal.have / goal.need);
    if (goal.text !== lastGoalText) {
      if (lastGoalText) { $('goal').classList.add('flash'); setTimeout(() => $('goal').classList.remove('flash'), 400); }
      lastGoalText = goal.text;
    }
  }

  // core
  set($('ops'), fmt(s.ops));
  set($('unit'), st.unit);
  show($('rate'), s.clicks > 0 || rate > 0);
  set($('rate'), `+${fmt(rate, 1)} ${st.unit} per second   ·   +${fmt(clickValue, 1)} per click`);
  const people = eff / st.personRate;
  show($('compare'), rate > 0);
  set($('compare'), `As fast as ${fmt(Math.max(1, people))} ${people < 1.5 ? 'person' : 'people'} with pencils`);
  show($('speedo'), s.lifetime >= 100 && eff > 0);
  set($('speedo'), `${st.task.label} takes ${fmtDuration(st.task.size / Math.max(eff, 1e-9))} at your speed`);
  const mainBtn = $('main-btn');
  set(mainBtn, st.clickLabel);
  show(mainBtn, s.phase === 'playing' || s.phase === 'ending');
  show($('pass-btn'), s.phase === 'handover');

  // producers
  const anyProducer = st.producers.some(p => E.producerUnlocked(s, p.id));
  show($('producers'), anyProducer && s.phase !== 'next');
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
    const each = p.each.replace('{out}', fmt(out, 1)).replace('1 guesses', '1 guess');
    set(el.desc, each + (n ? ` Together: ${fmt(out * n, 1)} per second.` : ''));
    set(el.cost, `${fmt(Math.ceil(cost))} ${st.unit}`);
    const can = s.phase === 'playing' && s.ops >= cost;
    if (el.btn.disabled === can) el.btn.disabled = !can;
  }

  // upgrades
  const open = st.upgrades.filter(u => s.revealed[u.id] !== undefined && !s.bought[u.id]);
  const locked = E.nextLocked(s);
  show($('upgrades'), (open.length > 0 || Object.keys(s.revealed).length > 0) && s.phase === 'playing');
  const list = $('upgrade-list');
  for (const [id, el] of cardEls) if (!open.some(u => u.id === id)) { el.root.remove(); cardEls.delete(id); }
  for (const u of open) {
    let el = cardEls.get(u.id);
    if (!el) { el = makeCard(u, st); cardEls.set(u.id, el); }
    const can = s.ops >= u.cost;
    toggle(el.root, 'affordable', can);
    toggle(el.root, 'unaffordable', !can);
    fill(el.progress, s.ops / u.cost);
    for (const b of el.optionBtns) if (b.disabled === can) b.disabled = !can;
  }
  // locked preview card (the next thing to aim for)
  const wantLocked = locked && Object.keys(s.revealed).length > 0;
  if (wantLocked) {
    if (!lockedEl) {
      lockedEl = { root: h('div', { class: 'card locked' }), name: h('span'), needs: h('div', { class: 'needs' }) };
      lockedEl.root.append(h('div', { class: 'card-head' }, lockedEl.name, h('span', { class: 'card-cost' }, 'locked')), lockedEl.needs);
    }
    set(lockedEl.name, locked.upgrade.name);
    const p = locked.progress;
    set(lockedEl.needs, p ? `Needs ${fmt(p.need)} ${p.label}. You have ${fmt(p.have)}.` : 'Coming soon.');
  }
  // Cards in data order, locked preview last. Only touch the DOM when the order changes,
  // so a button never moves between mouse-down and mouse-up.
  const wanted = open.map(u => cardEls.get(u.id).root);
  if (wantLocked) wanted.push(lockedEl.root);
  const current = [...list.children];
  if (wanted.length !== current.length || wanted.some((el, i) => el !== current[i])) list.replaceChildren(...wanted);

  // next stage placeholder
  show($('next-stage'), s.phase === 'next');
  if (s.phase === 'next') set($('legacy-rate'), `${fmt(s.legacyRate, 1)} ${st.unit} per second`);

  renderLog(s);
}

function makeCard(u, st) {
  const cost = h('span', { class: 'card-cost' }, `${fmt(u.cost)} ${st.unit}`);
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
  return { root, progress, optionBtns };
}

function renderLog(s) {
  const key = s.log.length + '|' + (s.log[0] ? s.log[0].t + s.log[0].text : '');
  if (key === logKey) return;
  const first = !logKey;
  logKey = key;
  const ol = $('log');
  ol.replaceChildren(...s.log.map((e, i) => {
    const li = h('li', { class: e.kind + (i === 0 && !first ? ' fresh' : '') },
      h('span', { class: 'when' }, fmtDate(e.date, true)),
      h('span', { class: 'what' }, e.text));
    return li;
  }));
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
