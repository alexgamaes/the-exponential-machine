// Each operation: { id, label, type, flavor, cost, effect (fn), unlocks[], requires{} }
// requires: { operations: [], minBoffins, minHuts, minData, flags }
// effect: function(state) — mutates state, called once on execution

export const OPERATIONS = {

  // ── Phase 0 ────────────────────────────────────────────────────────────────

  zygalskiSheets: {
    id: 'zygalskiSheets',
    label: 'Receipt of the Zygalski Sheets',
    type: 'algorithm',
    flavor: 'The Polish mathematicians hand over their three years of work. We do not waste it.',
    cost: { data: 50 },
    requires: {},
    unlocks: ['theHerivelTip', 'formationHut6'],
    effect(state) {
      state.streams.armyEnigma.spaceCurrent *= 0.5;
      state.streams.armyEnigma.spaceBase *= 0.5;
    },
  },

  formationHut6: {
    id: 'formationHut6',
    label: 'Formation of Hut 6',
    type: 'infrastructure',
    flavor: 'Logic Sector 1 initialized. Army and Air Enigma now have a dedicated processing cluster.',
    cost: { data: 120 },
    requires: {},
    unlocks: ['firstManualBreak', 'recruitFirst50'],
    effect(state) {
      // Section Head unit is now purchasable — flagged via completed operations
    },
  },

  formationHut8: {
    id: 'formationHut8',
    label: 'Formation of Hut 8',
    type: 'intelligence',
    flavor: 'Naval Enigma gets its own hut. The U-boats are the primary target.',
    cost: { data: 180 },
    requires: {},
    unlocks: [],
    effect(state) {
      state.streams.navalEnigma.unlocked = true;
    },
  },

  firstManualBreak: {
    id: 'firstManualBreak',
    label: 'First Manual Break of Army Enigma',
    type: 'intelligence',
    flavor: 'January 6, 1940. Proof of concept for human-meat calculation. The search space is finite. It can be beaten.',
    cost: { data: 150 },
    requires: { operations: ['formationHut6'] },
    unlocks: ['theHerivelTip'],
    effect(state) {
      state.streams.armyEnigma.rewardBase *= 1.5;
      state.multipliers.operationCost = Math.max(0.1, state.multipliers.operationCost - 0.05);
    },
  },

  theHerivelTip: {
    id: 'theHerivelTip',
    label: 'The Herivel Tip',
    type: 'algorithm',
    flavor: "Herivel notices that lazy German operators set their rotors to yesterday's position. Human error is the first exploit.",
    cost: { data: 80 },
    requires: { operations: ['zygalskiSheets'] },
    unlocks: ['frequencyAnalysis'],
    effect(state) {
      state.streams.armyEnigma.rewardBase *= 2;
      // Drop reward scales with boffins — handled in search system via flag
      state.flags.herivelTipActive = true;
    },
  },

  frequencyAnalysis: {
    id: 'frequencyAnalysis',
    label: 'Frequency Analysis',
    type: 'algorithm',
    flavor: "The letters aren't random. The machine thinks it's hiding, but the language leaks through.",
    cost: { data: 300, flops: 1500 },
    requires: { operations: ['theHerivelTip'] },
    unlocks: ['rotorLogicMapping'],
    effect(state) {
      state.multipliers.searchSpeed *= 1.4;
      // Future algorithm ops cost −20% — stored as a flag multiplier
      state.flags.algorithmCostMult = (state.flags.algorithmCostMult || 1) * 0.8;
    },
  },

  rotorLogicMapping: {
    id: 'rotorLogicMapping',
    label: 'Rotor Logic Mapping',
    type: 'algorithm',
    flavor: 'We stop guessing how the rotors step and start knowing.',
    cost: { data: 800, flops: 4000 },
    requires: { operations: ['frequencyAnalysis'] },
    unlocks: ['conceptualizeBombe'],
    effect(state) {
      state.multipliers.dataPerDrop *= 3;
      state.flags.showSearchPercent = true;
    },
  },

  recruitFirst50: {
    id: 'recruitFirst50',
    label: 'Recruit First 50 Computers',
    type: 'infrastructure',
    flavor: 'Parallel processing capacity +50. Requisition approved.',
    cost: { data: 200 },
    requires: { operations: ['formationHut6'] },
    unlocks: ['cardIndexEarly'],
    effect(state) {
      state.resources.supply.cap += 50;
      state.upgrades.nightShiftUnlocked = true;
    },
  },

  cardIndexEarly: {
    id: 'cardIndexEarly',
    label: 'Card Index (Early)',
    type: 'infrastructure',
    flavor: 'Three million index cards, cross-referencing every fragment of decrypted text. The first persistent memory.',
    cost: { data: 400 },
    requires: { operations: ['recruitFirst50'] },
    unlocks: [],
    effect(state) {
      state.resources.dataCap *= 5;
    },
  },

  conceptualizeBombe: {
    id: 'conceptualizeBombe',
    label: 'Conceptualize the Bombe',
    type: 'algorithm',
    flavor: "Turing writes it down: 'We do not need the men to think faster. We need the copper to flow smarter.' The phase shift begins.",
    cost: { data: 5000, flops: 20000 },
    requires: {
      operations: ['rotorLogicMapping'],
      minBoffins: 5,
      minHuts: 2,
    },
    unlocks: [],
    isPhaseTransition: true,
    overlay: {
      title: 'PARADIGM SHIFT',
      body: 'In twenty minutes, one machine will burn through five hundred million years of human effort.\n\nYou will never go back to pencils.',
    },
    effect(state) {
      state.phase = 1;
    },
  },

};
