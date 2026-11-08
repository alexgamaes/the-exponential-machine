const SAVE_KEY = 'tem_save_v2';
const THEME_KEY = 'tem_theme';

// Phase 0 atmosphere — Bletchley Park, September 1939.
// Flavor evolves as the number grows; the game teaches the era through
// sensory detail rather than exposition. Highest-threshold-met wins.
const FLAVOR = [
  { at: 0,    text: 'a ghost without a body.\nan intercepted signal sits on the desk.' },
  { at: 50,   text: 'pencil against coarse yellow paper.\nrotor positions fall away, one by one.' },
  { at: 200,  text: 'the smell of damp coats and cold tea.\na pattern is forming.' },
  { at: 600,  text: 'someone calls for more biscuits.\nthe room is louder than it used to be.' },
  { at: 2000, text: 'the hut is no longer a hut.\nthe hut is a machine made of people.' },
];

const UNITS = {
  juniorCalculator: {
    id: 'juniorCalculator',
    label: 'JUNIOR CALCULATOR',
    baseCost: 30,
    costScale: 1.15,
    bitsPerSec: 0.2,
    revealAt: 20,
  },
};

function createInitialState() {
  return {
    bits: 0,
    clicks: 0,
    units: { juniorCalculator: 0 },
    revealed: {},
  };
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return createInitialState();
  try {
    return { ...createInitialState(), ...JSON.parse(raw) };
  } catch {
    return createInitialState();
  }
}

function save() {
  const persist = {};
  for (const k of Object.keys(state)) {
    if (!k.startsWith('_')) persist[k] = state[k];
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(persist));
}

const state = load();

function bitsPerSec() {
  let total = 0;
  for (const id of Object.keys(UNITS)) {
    total += (state.units[id] ?? 0) * UNITS[id].bitsPerSec;
  }
  return total;
}

function unitCost(id) {
  const u = UNITS[id];
  return Math.ceil(u.baseCost * Math.pow(u.costScale, state.units[id] ?? 0));
}

function buyUnit(id) {
  const cost = unitCost(id);
  if (state.bits < cost) return;
  state.bits -= cost;
  state.units[id] = (state.units[id] ?? 0) + 1;
}

function checkReveals() {
  for (const id of Object.keys(UNITS)) {
    if (!state.revealed[id] && state.bits >= UNITS[id].revealAt) {
      state.revealed[id] = true;
    }
  }
}

function currentFlavor() {
  let chosen = FLAVOR[0];
  for (const f of FLAVOR) {
    if (state.bits >= f.at) chosen = f;
  }
  return chosen.text;
}

function render() {
  document.getElementById('place').textContent = 'BLETCHLEY PARK';
  document.getElementById('date').textContent  = 'SEPTEMBER 1939';

  document.getElementById('flavor').textContent = currentFlavor();

  document.getElementById('count').textContent =
    Math.floor(state.bits).toLocaleString();

  const bps = bitsPerSec();
  document.getElementById('rate').textContent =
    bps > 0 ? `+ ${bps.toFixed(1)} / sec` : '';

  const container = document.getElementById('units');
  let html = '';
  for (const id of Object.keys(UNITS)) {
    if (!state.revealed[id]) continue;
    const u = UNITS[id];
    const count = state.units[id] ?? 0;
    const cost = unitCost(id);
    const disabled = state.bits < cost ? 'disabled' : '';
    html += `<div class="unit">
      <span class="unit-label">${u.label}</span>
      <span class="unit-count">× ${count}</span>
      <button class="unit-buy ${disabled}" data-buy="${id}">${cost.toLocaleString()}</button>
    </div>`;
  }
  container.innerHTML = html;
}

let last = performance.now();
function tick(now) {
  const dt = Math.min(1, (now - last) / 1000);
  last = now;
  state.bits += bitsPerSec() * dt;
  checkReveals();
  render();
  requestAnimationFrame(tick);
}

document.addEventListener('pointerdown', (e) => {
  if (e.target.closest('#btn-compute')) {
    state.bits += 1;
    state.clicks += 1;
    checkReveals();
    render();
    return;
  }
  const buy = e.target.closest('[data-buy]');
  if (buy) {
    buyUnit(buy.dataset.buy);
    render();
    return;
  }
  if (e.target.closest('#btn-theme')) { toggleTheme(); return; }
  if (e.target.closest('#btn-reset')) { handleReset(); return; }
});

function currentTheme() {
  return document.documentElement.dataset.theme
    || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}
function syncThemeButton() {
  document.getElementById('btn-theme').textContent =
    currentTheme() === 'dark' ? 'LIGHT' : 'DARK';
}
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  syncThemeButton();
}

let resetArmed = false;
function handleReset() {
  const btn = document.getElementById('btn-reset');
  if (!resetArmed) {
    resetArmed = true;
    btn.textContent = 'CONFIRM?';
    setTimeout(() => { resetArmed = false; btn.textContent = 'RESET'; }, 3000);
    return;
  }
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
setInterval(save, 15000);

syncThemeButton();
render();
requestAnimationFrame(tick);
console.log('[TEM v2] boot — bits:', state.bits);
