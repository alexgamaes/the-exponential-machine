import { createInitialState } from './state.js';
import {
  saveGame,
  loadGame,
  deleteSave,
  exportSaveBase64,
  importSaveBase64,
  exportSaveFile,
  importSaveFile
} from './save.js';
import { tickResources, buyUnit, buyInfrastructure, buyBombe, getBombeCost } from '../systems/resources.js';
import { tickSearch, handleComputeClick } from '../systems/search.js';
import { executeOperation, refreshAvailableOperations, hasDateGatedPendingOp } from '../systems/operations.js';
import { render, updateUIFlags } from '../ui/render.js';
import { isDev, log } from './debug.js';
import { CONFIG } from '../config.js';
import { scrollLog } from './log.js';

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
    // Migrate nested personnel — add new unit types missing from old saves
    const defaultP = defaults.personnel;
    for (const key of Object.keys(defaultP)) {
      if (!saved.personnel[key]) saved.personnel[key] = defaultP[key];
    }
    // Migrate nested upgrades
    const defaultU = defaults.upgrades;
    for (const key of Object.keys(defaultU)) {
      if (saved.upgrades[key] === undefined) saved.upgrades[key] = defaultU[key];
    }
    // Migrate multipliers
    const defaultM = defaults.multipliers;
    for (const key of Object.keys(defaultM)) {
      if (saved.multipliers[key] === undefined) saved.multipliers[key] = defaultM[key];
    }
    // Migrate ui flags
    const defaultUI = defaults.ui;
    for (const key of Object.keys(defaultUI)) {
      if (saved.ui[key] === undefined) saved.ui[key] = defaultUI[key];
    }
    // Migrate flags (new keys added in later versions)
    if (!saved.flags) saved.flags = {};
    const defaultF = defaults.flags;
    for (const key of Object.keys(defaultF)) {
      if (saved.flags[key] === undefined) saved.flags[key] = defaultF[key];
    }
    // Plan 07: grandfather unit/infra unlocks for saves from before starter-gating
    if (saved.personnel.boffin.count > 0 && !saved.operations.completed.includes('recruitMathematicians'))
      saved.operations.completed.push('recruitMathematicians');
    if (saved.upgrades.canteenExpansion > 0 && !saved.operations.completed.includes('messHallConstructed'))
      saved.operations.completed.push('messHallConstructed');
    if (saved.upgrades.coffeeRationing > 0 && !saved.operations.completed.includes('wartimeRationing'))
      saved.operations.completed.push('wartimeRationing');
    // Plan 08: set bombeConceptualized for saves that had completed conceptualizeBombe
    if (saved.operations.completed.includes('conceptualizeBombe') && !saved.flags.bombeConceptualized)
      saved.flags.bombeConceptualized = true;
    // cardIndexEarly target raised to ×10 (cap=5000) — patch saves that got old ×5 or ×8 values
    if (saved.operations.completed.includes('cardIndexEarly') && saved.resources.dataCap < 5000)
      saved.resources.dataCap = 5000;
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
  refreshAvailableOperations(state);
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
  if (hasDateGatedPendingOp(state)) return;
  const timeScale = Math.log10((state._flopsPerSec || 0) + CONFIG.timeScaleOffset);
  state.dayTimer += delta * timeScale;
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
  // Theme toggle
  const btnTheme = document.getElementById('btn-theme');
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('tem_theme', theme);
    btnTheme.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
  }
  function resolveCurrentTheme() {
    const stored = localStorage.getItem('tem_theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  btnTheme.textContent = resolveCurrentTheme() === 'dark' ? 'LIGHT' : 'DARK';
  btnTheme.addEventListener('click', () => {
    applyTheme(resolveCurrentTheme() === 'dark' ? 'light' : 'dark');
  });

  // Compute button
  document.getElementById('btn-compute').addEventListener('click', () => {
    handleComputeClick(state);
  });

  // Log navigation
  document.getElementById('log').addEventListener('click', e => {
    const dir = e.target.dataset.logDir;
    if (dir) scrollLog(Number(dir));
  });

  // Operations, units, infra — single delegated listener on the whole layout
  document.getElementById('layout').addEventListener('pointerdown', e => {
    log('click target:', e.target, e.target.dataset);
    const opEl    = e.target.closest('[data-op-id]');
    const unitEl  = e.target.closest('[data-buy-unit]');
    const infraEl = e.target.closest('[data-buy-infra]');
    const hwEl    = e.target.closest('[data-buy-hardware]');
    log('resolved → op:', opEl?.dataset.opId, 'unit:', unitEl?.dataset.buyUnit, 'infra:', infraEl?.dataset.buyInfra, 'hw:', hwEl?.dataset.buyHardware);
    if (opEl)    { const ok = executeOperation(state, opEl.dataset.opId);    log('executeOperation:', opEl.dataset.opId, '→', ok); }
    if (unitEl)  { const ok = buyUnit(state, unitEl.dataset.buyUnit);         log('buyUnit:', unitEl.dataset.buyUnit, '→', ok); }
    if (infraEl) { const ok = buyInfrastructure(state, infraEl.dataset.buyInfra); log('buyInfra:', infraEl.dataset.buyInfra, '→', ok); }
    if (hwEl && hwEl.dataset.buyHardware === 'bombe') { const ok = buyBombe(state); log('buyBombe →', ok); }
  });

  // Overlay dismiss
  document.getElementById('overlay-dismiss').addEventListener('click', () => {
    document.getElementById('overlay').classList.add('hidden');
  });

  // Save / Export / Import
  document.getElementById('btn-export-b64').addEventListener('click', () => {
    const b64 = exportSaveBase64(state);
    state._pendingOverlay = {
      title: 'EXPORT SAVE',
      body: 'Copy the string below to save your progress elsewhere:',
      type: 'export',
      value: b64
    };
  });

  document.getElementById('btn-import-b64').addEventListener('click', () => {
    state._pendingOverlay = {
      title: 'IMPORT SAVE',
      body: 'Paste your save string below to load it:',
      type: 'input',
      onConfirm: (val) => {
        const b64 = (val || '').trim();
        if (!b64) return;
        const imported = importSaveBase64(b64);
        if (imported) {
          state = imported;
          saveGame(state);
          location.reload();
        } else {
          // Instead of alert, use the overlay again for the error
          state._pendingOverlay = {
            title: 'IMPORT FAILED',
            body: 'Invalid save string! Make sure you copied the entire string from an export.'
          };
        }
      }
    };
  });

  document.getElementById('btn-export-file').addEventListener('click', () => {
    exportSaveFile(state);
  });

  document.getElementById('btn-import-file').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });

  document.getElementById('import-file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = await importSaveFile(file);
      if (imported) {
        state = imported;
        saveGame(state);
        location.reload();
      }
    } catch (err) {
      state._pendingOverlay = {
        title: 'FILE IMPORT FAILED',
        body: 'Could not read save file: ' + err.message
      };
    }
  });

  const btn = document.getElementById('btn-reset');
  if (!isDev) {
    btn.style.display = 'none';
  } else {
    btn.addEventListener('click', () => {
      if (btn.dataset.armed) {
        state = null; // prevent visibilitychange from re-saving
        const theme = localStorage.getItem('tem_theme');
        localStorage.clear();
        if (theme) localStorage.setItem('tem_theme', theme);
        location.reload();
      } else {
        btn.dataset.armed = '1';
        btn.textContent = 'CONFIRM RESET?';
        btn.style.color = 'var(--red)';
        btn.style.borderColor = 'var(--red)';
        setTimeout(() => {
          btn.dataset.armed = '';
          btn.textContent = 'RESET';
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 3000);
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && state) saveGame(state);
  });
}

init();
