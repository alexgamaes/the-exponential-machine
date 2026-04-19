import { OPERATIONS } from '../data/operations.js';
import { UNITS, INFRASTRUCTURE } from '../data/units.js';
import { getUnitCost, canAffordUnit, getInfrastructureCost } from '../systems/resources.js';
import { getOperationCost, canExecuteOperation } from '../systems/operations.js';
import { DROP_SCALE } from '../systems/search.js';
import { getLogWindow } from '../core/log.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── UI reveal triggers (called every tick, cheap checks) ─────────────────────

export function updateUIFlags(state) {
  if (state.stats.totalDrops >= 1)                                  state.ui.showData = true;
  if (state.stats.totalDrops >= 1)                                  state.ui.showOperations = true;
  if (state.operations.completed.includes('formationHut6'))         state.ui.showPersonnel = true;
  if (state.operations.completed.includes('recruitFirst50'))        state.ui.showInfrastructure = true;
  if (state.operations.completed.includes('formationHut8'))         state.ui.showNavalStream = true;
  if (state.personnel.juniorCalculator.count > 0 ||
      state.personnel.boffin.count > 0)                             state.ui.showFooter = true;
}

// ── Main render entry ─────────────────────────────────────────────────────────

export function render(state) {
  updateUIFlags(state);
  renderHeader(state);
  renderResources(state);
  renderFlopsRate(state);
  renderStreams(state);
  if (state.ui.showPersonnel)     renderPersonnel(state);
  if (state.ui.showInfrastructure) renderInfrastructure(state);
  renderLog();
  if (state.ui.showOperations)    renderOperations(state);
  if (state.ui.showFooter)        renderFooter(state);
  handleDrop(state);
  handleOverlay(state);
}

// ── Header ────────────────────────────────────────────────────────────────────

function renderHeader(state) {
  const d = state.date;
  document.getElementById('game-date').textContent =
    `${d.day} ${MONTHS[d.month - 1]} ${d.year}`;
}

// ── Resources ─────────────────────────────────────────────────────────────────

function renderResources(state) {
  const el = document.getElementById('resources');
  let html = '';

  html += `<div class="resource-line">FLOPs &nbsp;<b>${fmt(Math.floor(state.resources.flops))}</b></div>`;

  if (state.ui.showData) {
    html += `<div class="resource-line">Data &nbsp;&nbsp;<b>${fmt(Math.floor(state.resources.data))}</b>`
          + `<span class="rate"> / ${fmt(state.resources.dataCap)}</span></div>`;

    const s = state.resources.supply;
    html += `<div class="resource-line">Supply &nbsp;<b>${s.used} / ${s.cap}</b></div>`;
  }

  el.innerHTML = html;
}

// ── FLOPs rate ────────────────────────────────────────────────────────────────

function renderFlopsRate(state) {
  const fps = state._flopsPerSec || 0;
  const el = document.getElementById('flops-rate');
  el.textContent = fps > 0 ? `${fmt(fps)} FLOPs/sec` : '';
}

// ── Streams ───────────────────────────────────────────────────────────────────

const BREAK_STATUS = [
  [0,   'Waiting — click COMPUTE to start breaking'],
  [1,   'Scanning key space...'],
  [20,  'Filtering candidates...'],
  [50,  'Narrowing in on the key...'],
  [75,  'Pattern identified — almost there...'],
  [90,  'Breaking...'],
  [99,  'One more push...'],
];

function breakStatus(pct, fps) {
  if (fps === 0) return BREAK_STATUS[0][1];
  for (let i = BREAK_STATUS.length - 1; i >= 0; i--) {
    if (pct >= BREAK_STATUS[i][0]) return BREAK_STATUS[i][1];
  }
  return BREAK_STATUS[0][1];
}

function renderStreams(state) {
  const el = document.getElementById('streams');
  let html = '';

  for (const stream of Object.values(state.streams)) {
    if (!stream.unlocked) continue;

    const pct = Math.min(100, (stream.progress / stream.spaceCurrent) * 100);
    const fillClass = stream.blackout ? 'stream-fill danger' : 'stream-fill';
    const fps = state._flopsPerSec || 0;
    const status = stream.blackout ? '! SIGNAL LOST — waiting for new intercept' : breakStatus(pct, fps);
    const reward = Math.floor(
      stream.rewardBase * state.multipliers.dataPerDrop * Math.pow(DROP_SCALE, stream.dropCount)
    );

    html += `
      <div class="stream">
        <div class="stream-header">
          <span class="stream-name">${stream.label}</span>
        </div>
        <div class="stream-status-line">${status}</div>
        <div class="stream-track">
          <div class="${fillClass}" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="stream-info">
          <span>${pct.toFixed(1)}% cracked</span>
          <span class="stream-reward">+${fmt(reward)} Data on crack</span>
        </div>
      </div>`;
  }

  el.innerHTML = html;
}

// ── Log ───────────────────────────────────────────────────────────────────────

function renderLog() {
  const el = document.getElementById('log');
  if (!el) return;
  const { a, b, canGoNewer, canGoOlder } = getLogWindow();
  el.innerHTML = `
    <div class="log-line${a ? '' : ' log-line-empty'}">${a ?? '— no events yet —'}</div>
    <div class="log-line${b ? '' : ' log-line-empty'}">${b ?? ''}</div>
    <div class="log-nav">
      <button class="log-btn" data-log-dir="-1" ${canGoNewer ? '' : 'disabled'}>▲</button>
      <button class="log-btn" data-log-dir="1"  ${canGoOlder ? '' : 'disabled'}>▼</button>
    </div>`;
}

// ── Operations ────────────────────────────────────────────────────────────────

const TYPE_TAG = {
  algorithm: 'ALGO',
  infrastructure: 'INFRA',
  intelligence: 'INTEL',
  acquisition: 'ACQN',
  crisis: 'CRISIS',
};

function renderOperations(state) {
  const el = document.getElementById('operations');
  if (!state.ui.showOperations) { el.innerHTML = ''; return; }

  let html = `<div class="section-label">Initiatives</div>`;

  for (const opId of state.operations.available) {
    const op = OPERATIONS[opId];
    if (!op) continue;

    const cost = getOperationCost(state, opId);
    const { can } = canExecuteOperation(state, opId);
    const tag = TYPE_TAG[op.type] || op.type;
    const effectText = op.result ? op.result.replace(/\n/g, ' · ') : '';

    html += `
      <div class="op${can ? '' : ' unaffordable'}" data-op-id="${opId}">
        <div class="op-name">
          <span class="op-type-tag tag-${op.type}">${tag}</span>
          ${op.label}
        </div>
        ${effectText ? `<div class="op-effect">${effectText}</div>` : ''}
        <div class="op-cost">${formatCost(cost)}</div>
      </div>`;
  }

  el.innerHTML = html;
}

// ── Personnel ─────────────────────────────────────────────────────────────────

function renderPersonnel(state) {
  const el = document.getElementById('personnel');
  const supplyFree = state.resources.supply.cap - state.resources.supply.used;
  let html = `<div class="section-label">Personnel</div>`;

  html += unitRow(state, 'juniorCalculator', supplyFree);
  html += unitRow(state, 'boffin', supplyFree);

  if (state.operations.completed.includes('formationHut6')) {
    html += unitRow(state, 'sectionHead', supplyFree);
  }

  el.innerHTML = html;
}

function unitRow(state, unitId, supplyFree) {
  const unit = UNITS[unitId];
  const su = state.personnel[unitId];
  const cost = getUnitCost(state, unitId);
  const canBuy = state.resources.data >= cost && supplyFree >= unit.supplyPerUnit;

  return `
    <div class="unit">
      <div>
        <div class="unit-name">${unit.label}</div>
        <div class="unit-meta">${unit.description} · ${unit.supplyPerUnit} Supply · ${fmt(cost)} Data</div>
      </div>
      <span class="unit-count">${su.count}</span>
      <button class="btn-buy" data-buy-unit="${unitId}" ${canBuy ? '' : 'disabled'}>BUY</button>
    </div>`;
}

// ── Infrastructure ────────────────────────────────────────────────────────────

function renderInfrastructure(state) {
  const el = document.getElementById('infrastructure');
  let html = `<div class="section-label">Infrastructure</div>`;

  html += infraRow(state, 'hut');
  html += infraRow(state, 'canteenExpansion');
  html += infraRow(state, 'coffeeRationing');

  const u = state.upgrades;
  if (u.nightShiftUnlocked) {
    const status = u.nightShiftActive
      ? `ACTIVE — ${Math.ceil(u.nightShiftTimer)}s remaining`
      : `cooldown ${Math.ceil(u.nightShiftCooldown)}s`;
    html += `
      <div class="unit">
        <div>
          <div class="unit-name">Night Shift Rotation</div>
          <div class="unit-meta">×2 FLOPs · 90s on / 10min cooldown · automatic</div>
        </div>
        <span class="unit-count" style="font-size:11px;color:${u.nightShiftActive?'var(--green)':'var(--dim)'}">${status}</span>
      </div>`;
  }

  el.innerHTML = html;
}

function infraRow(state, infraId) {
  const infra = INFRASTRUCTURE[infraId];
  const cost = getInfrastructureCost(state, infraId);
  const count = infraId === 'hut' ? state.huts
    : infraId === 'canteenExpansion' ? state.upgrades.canteenExpansion
    : state.upgrades.coffeeRationing;
  const maxed = count >= infra.maxCount;
  const canBuy = !maxed && state.resources.data >= cost;

  return `
    <div class="unit">
      <div>
        <div class="unit-name">${infra.label}</div>
        <div class="unit-meta">${infra.description} · ${maxed ? 'maxed' : fmt(cost) + ' Data'}</div>
      </div>
      <span class="unit-count">${count}</span>
      <button class="btn-buy" data-buy-infra="${infraId}" ${canBuy ? '' : 'disabled'}>BUY</button>
    </div>`;
}

// ── Footer ────────────────────────────────────────────────────────────────────

function renderFooter(state) {
  const fps = state._flopsPerSec || 0;
  const baseline = state.stats.phase0BaselineFlops;
  const mult = (fps / baseline).toFixed(1);
  document.getElementById('system-specs').innerHTML =
    `<b>${fmt(Math.floor(fps))}</b> FLOPs/sec — <b>${mult}×</b> Phase 0 baseline`;
  document.getElementById('footer').classList.remove('hidden');
}

// ── Drop ──────────────────────────────────────────────────────────────────────

let _lastDropTs = 0;

function handleDrop(state) {
  if (!state._lastDrop || state._lastDrop.timestamp === _lastDropTs) return;
  _lastDropTs = state._lastDrop.timestamp;

  // Floating number near the stream bar
  const popup = document.createElement('div');
  popup.className = 'reward-popup';
  popup.innerHTML = `<strong>CRACKED!</strong><br/>+${fmt(state._lastDrop.reward)} Data`;
  popup.style.left = '40%';
  popup.style.top  = '30vh';
  document.body.appendChild(popup);
  popup.addEventListener('animationend', () => popup.remove());
}

// ── Overlay ───────────────────────────────────────────────────────────────────

function handleOverlay(state) {
  if (!state._pendingOverlay) return;
  const { title, body, type, value, onConfirm } = state._pendingOverlay;
  
  const elTitle   = document.getElementById('overlay-title');
  const elBody    = document.getElementById('overlay-body');
  const elInput   = document.getElementById('overlay-input');
  const elConfirm = document.getElementById('overlay-confirm');
  const elDismiss = document.getElementById('overlay-dismiss');

  elTitle.textContent = title;
  elBody.textContent  = body || '';
  
  if (type === 'input') {
    elInput.value = value || '';
    elInput.classList.remove('hidden');
    elInput.readOnly = false;
    elConfirm.classList.remove('hidden');
    elConfirm.textContent = 'IMPORT';
    elDismiss.textContent = 'CANCEL';
    // We'll store the callback on the element temporarily or handle it in game.js
    elConfirm.onclick = () => {
      if (onConfirm) onConfirm(elInput.value);
      document.getElementById('overlay').classList.add('hidden');
    };
    setTimeout(() => elInput.focus(), 10);
  } else if (type === 'export') {
    elInput.value = value || '';
    elInput.classList.remove('hidden');
    elInput.readOnly = true;
    elConfirm.classList.remove('hidden');
    elConfirm.textContent = 'COPY';
    elDismiss.textContent = 'CLOSE';
    elConfirm.onclick = () => {
      elInput.select();
      document.execCommand('copy');
      elConfirm.textContent = 'COPIED!';
      setTimeout(() => elConfirm.textContent = 'COPY', 2000);
    };
    setTimeout(() => elInput.focus(), 10);
  } else {
    elInput.classList.add('hidden');
    elInput.readOnly = false;
    elConfirm.classList.add('hidden');
    elDismiss.textContent = 'CONTINUE';
    elConfirm.onclick = null;
  }

  document.getElementById('overlay').classList.remove('hidden');
  state._pendingOverlay = null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function formatCost(cost) {
  const parts = [];
  if (cost.data)  parts.push(`${fmt(cost.data)} Data`);
  if (cost.flops) parts.push(`${fmt(cost.flops)} FLOPs`);
  return parts.length ? parts.join(' · ') : 'Free';
}
