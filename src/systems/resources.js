import { UNITS, INFRASTRUCTURE } from '../data/units.js';
import { CONFIG } from '../config.js';

export function tickResources(state, delta) {
  const p = state.personnel;
  const m = state.multipliers;
  const u = state.upgrades;

  // ── FLOPs per second from personnel ───────────────────────────────────────
  let fps = 0;

  const calcCount = p.juniorCalculator.count;
  const boffinCount = p.boffin.count;
  const sectionHeadCount = p.sectionHead.count;

  const sectionHeadMult = 1 + sectionHeadCount * CONFIG.sectionHeadBonus;

  fps += calcCount * CONFIG.juniorCalcFlopsPerSec * sectionHeadMult;
  fps += boffinCount * CONFIG.boffinFlopsPerSec;

  // Night shift doubles output while active
  if (u.nightShiftActive) fps *= 2;

  fps *= m.flopsPerSec;

  // ── Bombe mechanics (Phase 1) ─────────────────────────────────────────────
  // Computed before _flopsPerSec is set so bombe output is included in the total.
  const wrenCount = p.wren?.count || 0;
  const runningBombes = Math.min(state.hardware.bombes.count, wrenCount);
  state.hardware.bombes.running = runningBombes;
  state._bombeStatesPerSec = runningBombes * (CONFIG.bombeStatesPerMin / 60) * (m.bombeOutput || 1);
  fps += state._bombeStatesPerSec / CONFIG.flopsToStates;

  state._flopsPerSec = fps;
  state.resources.flops += fps * delta;
  state.stats.totalFlops += fps * delta;

  // ── Night shift timer ──────────────────────────────────────────────────────
  if (u.nightShiftUnlocked) {
    if (u.nightShiftActive) {
      u.nightShiftTimer -= delta;
      if (u.nightShiftTimer <= 0) {
        u.nightShiftActive = false;
        u.nightShiftCooldown = CONFIG.nightShiftCooldown;
      }
    } else if (u.nightShiftCooldown > 0) {
      u.nightShiftCooldown -= delta;
      if (u.nightShiftCooldown <= 0) {
        u.nightShiftActive = true;
        u.nightShiftTimer = CONFIG.nightShiftDuration;
      }
    } else {
      u.nightShiftActive = true;
      u.nightShiftTimer = CONFIG.nightShiftDuration;
    }
  }

  // ── Electricity used ──────────────────────────────────────────────────────
  state.resources.electricity.used = state.hardware.bombes.count * 5 + wrenCount * 0.5;

  // ── Supply used ───────────────────────────────────────────────────────────
  let supplyUsed = 0;
  let coffeeDiscount = 1 - (u.coffeeRationing * 0.15);

  supplyUsed += p.juniorCalculator.count * UNITS.juniorCalculator.supplyPerUnit * coffeeDiscount;
  supplyUsed += p.boffin.count * UNITS.boffin.supplyPerUnit * coffeeDiscount;
  supplyUsed += p.sectionHead.count * UNITS.sectionHead.supplyPerUnit * coffeeDiscount;
  supplyUsed += wrenCount * UNITS.wren.supplyPerUnit * coffeeDiscount;
  supplyUsed += (p.cryptanalyst?.count || 0) * UNITS.cryptanalyst.supplyPerUnit * coffeeDiscount;
  supplyUsed += (p.indexer?.count || 0) * UNITS.indexer.supplyPerUnit * coffeeDiscount;

  state.resources.supply.used = Math.ceil(supplyUsed);

  // ── Passive data from Indexers ────────────────────────────────────────────
  if (state.flags.indexersGenerateData) {
    const indexerCount = p.indexer?.count || 0;
    const passiveData = indexerCount * 0.5 * delta;
    state.resources.data = Math.min(state.resources.data + passiveData, state.resources.dataCap);
  }

  // ── Data cap ─────────────────────────────────────────────────────────────
  state.resources.data = Math.min(state.resources.data, state.resources.dataCap);
}

// ── Buying helpers ───────────────────────────────────────────────────────────

export function canAffordUnit(state, unitId, qty = 1) {
  const unit = UNITS[unitId];
  if (!unit) return false;
  const cost = getUnitCost(state, unitId, qty);
  const discount = 1 - (state.upgrades.coffeeRationing * 0.15);
  const supplyNeeded = unit.supplyPerUnit * qty * discount;
  const supplyAvail = state.resources.supply.cap - state.resources.supply.used;
  return state.resources.data >= cost && supplyAvail >= supplyNeeded;
}

export function getUnitCost(state, unitId, qty = 1) {
  const unit = UNITS[unitId];
  if (!unit) return Infinity;
  const stateUnit = state.personnel[unitId];
  let cost = 0;
  for (let i = 0; i < qty; i++) {
    cost += stateUnit.baseCost * Math.pow(CONFIG.unitCostScale, stateUnit.count + i);
  }
  return Math.floor(cost);
}

export function buyUnit(state, unitId) {
  if (!canAffordUnit(state, unitId)) return false;
  const cost = getUnitCost(state, unitId);
  state.resources.data -= cost;
  state.personnel[unitId].count += 1;
  const unit = UNITS[unitId];
  if (unit.onBuy) unit.onBuy(state);
  return true;
}

export function getInfrastructureCost(state, infraId) {
  const infra = INFRASTRUCTURE[infraId];
  if (!infra) return Infinity;
  let count;
  if (infraId === 'hut') count = state.huts;
  else if (infraId === 'canteenExpansion') count = state.upgrades.canteenExpansion;
  else if (infraId === 'coffeeRationing') count = state.upgrades.coffeeRationing;
  else if (infraId === 'localPowerLine') count = state.upgrades.localPowerLine;
  else if (infraId === 'dedicatedGenerator') count = state.upgrades.dedicatedGenerator;
  else count = 0;
  return Math.floor(infra.baseCost * Math.pow(infra.costScale, count));
}

export function buyInfrastructure(state, infraId) {
  const cost = getInfrastructureCost(state, infraId);
  if (state.resources.data < cost) return false;

  state.resources.data -= cost;

  if (infraId === 'hut') {
    state.huts += 1;
    state.resources.supply.cap += 6;
  } else if (infraId === 'canteenExpansion') {
    const max = INFRASTRUCTURE.canteenExpansion.maxCount;
    if (state.upgrades.canteenExpansion < max) {
      state.upgrades.canteenExpansion += 1;
      state.resources.supply.cap += 20;
    }
  } else if (infraId === 'coffeeRationing') {
    const max = INFRASTRUCTURE.coffeeRationing.maxCount;
    if (state.upgrades.coffeeRationing < max) {
      state.upgrades.coffeeRationing += 1;
    }
  } else if (infraId === 'localPowerLine') {
    if (state.upgrades.localPowerLine < INFRASTRUCTURE.localPowerLine.maxCount) {
      state.upgrades.localPowerLine += 1;
      state.resources.electricity.cap += 50;
    }
  } else if (infraId === 'dedicatedGenerator') {
    if (state.upgrades.dedicatedGenerator < INFRASTRUCTURE.dedicatedGenerator.maxCount) {
      state.upgrades.dedicatedGenerator += 1;
      state.resources.electricity.cap += 200;
    }
  }
  return true;
}

// ── Bombe buying ──────────────────────────────────────────────────────────────

export function getBombeCost(state) {
  return Math.floor(state.hardware.bombes.baseCost * Math.pow(1.15, state.hardware.bombes.count));
}

export function buyBombe(state) {
  if (state.phase < 1) return false; // production gated behind turingMemorandum
  if (state.resources.electricity.cap <= 0) return false;
  const cost = getBombeCost(state);
  if (state.resources.data < cost) return false;
  const elecFree = state.resources.electricity.cap - state.resources.electricity.used;
  // Reserve 0.5W for the Wren operator — buying a Bombe with no room left for a Wren
  // creates a deadlock where Bombes can't run and can never be staffed.
  const WREN_ELEC = 0.5;
  if (elecFree < CONFIG.bombeElecPerUnit + WREN_ELEC) return false;
  state.resources.data -= cost;
  state.hardware.bombes.count += 1;
  return true;
}
