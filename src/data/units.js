export const UNITS = {
  // ── Phase 0 Personnel ──────────────────────────────────────────────────────

  juniorCalculator: {
    id: 'juniorCalculator',
    label: 'Junior Calculator',
    phase: 0,
    type: 'personnel',
    flopsPerSec: 0.1,
    supplyPerUnit: 1,
    description: '0.1 FLOPs/sec',
    stateKey: 'juniorCalculator',
  },

  boffin: {
    id: 'boffin',
    label: 'Mathematical Lead (Boffin)',
    phase: 0,
    type: 'personnel',
    flopsPerSec: 2.5,
    supplyPerUnit: 3,
    description: '2.5 FLOPs/sec · −2% all Operation costs',
    stateKey: 'boffin',
    onBuy(state) {
      state.flags.boffinsReduceOpCost += 1;
      state.multipliers.operationCost = Math.max(0.1,
        state.multipliers.operationCost - 0.02);
    },
  },

  sectionHead: {
    id: 'sectionHead',
    label: 'Section Head',
    phase: 0,
    type: 'personnel',
    flopsPerSec: 0,
    supplyPerUnit: 2,
    description: '×1.25 to all Calculators in their Hut',
    stateKey: 'sectionHead',
    maxPerHut: 1,
    requiresUnlock: 'formationHut6',
  },
};

export const INFRASTRUCTURE = {
  hut: {
    id: 'hut',
    label: 'Hut',
    phase: 0,
    baseCost: 80,
    costScale: 1.5,
    description: '+6 Calculator slots · +1 Section Head slot',
    maxCount: 10,
  },

  canteenExpansion: {
    id: 'canteenExpansion',
    label: 'Canteen Expansion',
    phase: 0,
    baseCost: 150,
    costScale: 1.6,
    description: '+20 Supply Cap',
    maxCount: 10,
  },

  coffeeRationing: {
    id: 'coffeeRationing',
    label: 'Coffee Rationing',
    phase: 0,
    baseCost: 200,
    costScale: 2.0,
    description: '−15% Supply cost per person',
    maxCount: 3,
  },
};
