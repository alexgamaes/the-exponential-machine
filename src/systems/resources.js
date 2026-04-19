import { UNITS, INFRASTRUCTURE } from '../data/units.js';

export function tickResources(state, delta) {
  const p = state.personnel;
  const m = state.multipliers;
  const u = state.upgrades;

  // ── FLOPs per second from personnel ───────────────────────────────────────
  let fps = 0;

  const calcCount = p.juniorCalculator.count;
  const boffinCount = p.boffin.count;
  const sectionHeadCount = p.sectionHead.count;

  // Section heads give ×1.25 per head to all calculators
  const sectionHeadMult = 1 + (sectionHeadCount * 0.25);

  fps += calcCount * UNITS.juniorCalculator.flopsPerSec * sectionHeadMult;
  fps += boffinCount * UNITS.boffin.flopsPerSec;

  // Night shift doubles output while active
  if (u.nightShiftActive) fps *= 2;

  fps *= m.flopsPerSec;

  state._flopsPerSec = fps;
  state.resources.flops += fps * delta;
  state.stats.totalFlops += fps * delta;

  // ── Night shift timer ──────────────────────────────────────────────────────
  if (u.nightShiftUnlocked) {
    if (u.nightShiftActive) {
      u.nightShiftTimer -= delta;
      if (u.nightShiftTimer <= 0) {
        u.nightShiftActive = false;
        u.nightShiftCooldown = 600; // 10 min real seconds
      }
    } else if (u.nightShiftCooldown > 0) {
      u.nightShiftCooldown -= delta;
      if (u.nightShiftCooldown <= 0) {
        u.nightShiftActive = true;
        u.nightShiftTimer = 90;
      }
    } else {
      // First activation
      u.nightShiftActive = true;
      u.nightShiftTimer = 90;
    }
  }

  // ── Supply used ───────────────────────────────────────────────────────────
  let supplyUsed = 0;
  let coffeeDiscount = 1 - (u.coffeeRationing * 0.15);

  supplyUsed += p.juniorCalculator.count * UNITS.juniorCalculator.supplyPerUnit * coffeeDiscount;
  supplyUsed += p.boffin.count * UNITS.boffin.supplyPerUnit * coffeeDiscount;
  supplyUsed += p.sectionHead.count * UNITS.sectionHead.supplyPerUnit * coffeeDiscount;

  state.resources.supply.used = Math.ceil(supplyUsed);

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
    cost += stateUnit.baseCost * Math.pow(1.12, stateUnit.count + i);
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
  const count = infraId === 'hut' ? state.huts
    : infraId === 'canteenExpansion' ? state.upgrades.canteenExpansion
    : state.upgrades.coffeeRationing;
  return Math.floor(infra.baseCost * Math.pow(infra.costScale, count));
}

export function buyInfrastructure(state, infraId) {
  const cost = getInfrastructureCost(state, infraId);
  if (state.resources.data < cost) return false;

  state.resources.data -= cost;

  if (infraId === 'hut') {
    state.huts += 1;
    // Huts increase supply cap implicitly via slot management
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
  }
  return true;
}
