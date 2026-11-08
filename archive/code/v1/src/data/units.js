import { CONFIG } from '../config.js';

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
      if (state.personnel.boffin.count <= CONFIG.boffinCostReductionCap) {
        state.multipliers.operationCost = Math.max(
          CONFIG.operationCostFloor,
          state.multipliers.operationCost - CONFIG.boffinCostReduction
        );
      }
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

  // ── Phase 1 Personnel ──────────────────────────────────────────────────────

  wren: {
    id: 'wren',
    label: 'Wren (Operator)',
    phase: 1,
    type: 'personnel',
    flopsPerSec: 0,
    supplyPerUnit: 1,
    electricityPerUnit: 0,
    description: 'Activates one Bombe',
    stateKey: 'wren',
    requiresUnlock: 'recruitmentFirstWrens',
    baseCost: 50,
  },

  cryptanalyst: {
    id: 'cryptanalyst',
    label: 'Cryptanalyst',
    phase: 1,
    type: 'personnel',
    flopsPerSec: 0,
    supplyPerUnit: 2,
    electricityPerUnit: 0,
    description: '+3% search speed · diminishing after 10',
    stateKey: 'cryptanalyst',
    requiresUnlock: 'creationHut3',
    baseCost: 400,
  },

  indexer: {
    id: 'indexer',
    label: 'Indexer',
    phase: 1,
    type: 'personnel',
    flopsPerSec: 0,
    supplyPerUnit: 1,
    electricityPerUnit: 0,
    description: '+500 Data Cap · +1% Data/Drop',
    stateKey: 'indexer',
    requiresUnlock: 'creationHut3',
    baseCost: 80,
    onBuy(state) {
      state.resources.dataCap += 500;
      state.multipliers.dataPerDrop *= 1.01;
    },
  },
};

export const INFRASTRUCTURE = {
  hut: {
    id: 'hut',
    label: 'Hut',
    phase: 0,
    baseCost: 80,
    costScale: 1.5,
    description: '+6 Supply Cap',
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

  // ── Phase 1 Infrastructure ──────────────────────────────────────────────────

  localPowerLine: {
    id: 'localPowerLine',
    label: 'Local Power Line',
    phase: 1,
    baseCost: 1000,
    costScale: 2.0,
    description: '+50W Electricity Cap',
    maxCount: 5,
  },

  dedicatedGenerator: {
    id: 'dedicatedGenerator',
    label: 'Dedicated Generator',
    phase: 1,
    baseCost: 5000,
    costScale: 2.5,
    description: '+200W Electricity Cap',
    maxCount: 3,
  },
};
