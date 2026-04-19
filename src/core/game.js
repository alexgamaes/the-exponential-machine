import { createInitialState } from './state.js';
import { saveGame, loadGame, deleteSave } from './save.js';
import { tickResources, buyUnit, buyInfrastructure } from '../systems/resources.js';
import { tickSearch, handleComputeClick } from '../systems/search.js';
import { executeOperation, refreshAvailableOperations } from '../systems/operations.js';
import { render, updateUIFlags } from '../ui/render.js';
import { isDev, log } from './debug.js';

const SAVE_INTERVAL = 15; // seconds between auto-saves

let state;
let lastTime = null;
let saveTimer = 0;

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  const saved = loadGame();
  if (saved) {
    const defaults = createInitialState();
    // Merge top-level keys from defaults that are missing in the save
    for (const key of Object.keys(defaults)) {
      if (saved[key] === undefined) saved[key] = defaults[key];
    }
  }
  state = saved || createInitialState();

  if (saved) refreshAvailableOperations(state);

  bindEvents();
  requestAnimationFrame(tick);
}

// ── Game loop ─────────────────────────────────────────────────────────────────

function tick(timestamp) {
  if (lastTime === null) {
    lastTime = timestamp;
    requestAnimationFrame(tick);
    return;
  }

  const delta = Math.min((timestamp - lastTime) / 1000, 0.5); // cap at 0.5s to avoid tab-switch spikes
  lastTime = timestamp;

  tickResources(state, delta);
  tickSearch(state, delta);
  tickDate(state, delta);
  updateUIFlags(state);

  saveTimer += delta;
  if (saveTimer >= SAVE_INTERVAL) {
    saveGame(state);
    saveTimer = 0;
  }

  render(state);
  requestAnimationFrame(tick);
}

function tickDate(state, delta) {
  state.dayTimer += delta;
  if (state.dayTimer >= state.dayDuration) {
    state.dayTimer -= state.dayDuration;
    advanceDay(state);
  }
}

function advanceDay(state) {
  const d = state.date;
  d.day += 1;
  const daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
  if (d.day > daysInMonth[d.month - 1]) {
    d.day = 1;
    d.month += 1;
    if (d.month > 12) {
      d.month = 1;
      d.year += 1;
    }
  }
}

// ── Event binding ─────────────────────────────────────────────────────────────

function bindEvents() {
  // Compute button
  document.getElementById('btn-compute').addEventListener('click', () => {
    handleComputeClick(state);
  });

  // Operations, units, infra — single delegated listener on the whole layout
  document.getElementById('layout').addEventListener('pointerdown', e => {
    log('click target:', e.target, e.target.dataset);
    const opEl    = e.target.closest('[data-op-id]');
    const unitEl  = e.target.closest('[data-buy-unit]');
    const infraEl = e.target.closest('[data-buy-infra]');
    log('resolved → op:', opEl?.dataset.opId, 'unit:', unitEl?.dataset.buyUnit, 'infra:', infraEl?.dataset.buyInfra);
    if (opEl)    { const ok = executeOperation(state, opEl.dataset.opId);    log('executeOperation:', opEl.dataset.opId, '→', ok); }
    if (unitEl)  { const ok = buyUnit(state, unitEl.dataset.buyUnit);         log('buyUnit:', unitEl.dataset.buyUnit, '→', ok); }
    if (infraEl) { const ok = buyInfrastructure(state, infraEl.dataset.buyInfra); log('buyInfra:', infraEl.dataset.buyInfra, '→', ok); }
  });

  // Overlay dismiss
  document.getElementById('overlay-dismiss').addEventListener('click', () => {
    document.getElementById('overlay').classList.add('hidden');
  });

  if (isDev) {
    const btn = document.createElement('button');
    btn.textContent = 'RESET';
    btn.style.cssText = 'position:fixed;bottom:12px;right:12px;background:none;border:1px solid #333;color:#444;font-family:monospace;font-size:11px;padding:4px 10px;cursor:pointer;z-index:999';
    btn.addEventListener('click', () => {
      if (btn.dataset.armed) {
        state = null; // prevent visibilitychange from re-saving
        localStorage.clear();
        location.reload();
      } else {
        btn.dataset.armed = '1';
        btn.textContent = 'CONFIRM RESET?';
        btn.style.color = '#ff5a5a';
        btn.style.borderColor = '#ff5a5a';
        setTimeout(() => {
          btn.dataset.armed = '';
          btn.textContent = 'RESET';
          btn.style.color = '#444';
          btn.style.borderColor = '#333';
        }, 3000);
      }
    });
    document.body.appendChild(btn);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && state) saveGame(state);
  });
}

init();
