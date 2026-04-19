/**
 * Initiative DAG — src/data/operations.js
 * ════════════════════════════════════════
 *
 * Single source of truth for all initiatives. Every node is self-contained:
 * reading one entry tells you everything about it — when it appears, what it
 * costs, what blocks it, and what it does. No other file needs to change when
 * you add a node.
 *
 *
 * GRAPH — Phase 0
 * ───────────────
 * Arrows show trigger.operations dependencies (what must be completed first).
 * Milestone triggers (drops, personnel counts) are noted inline.
 *
 *   [1st drop]          zygalskiSheets ──► theHerivelTip ──► frequencyAnalysis ──► rotorLogicMapping ──► conceptualizeBombe ⚑
 *   [3 calculators]     formationHut6  ──► firstManualBreak
 *                                      └──► recruitFirst50 [also: 10 calculators] ──► cardIndexEarly
 *   [5 drops]           formationHut8  (standalone — unlocks naval stream)
 *
 *   ⚑ = phase transition (also gated: 5 Boffins, 2 Huts)
 *
 *
 * NODE SHAPE
 * ──────────
 *   trigger   object    When this node is pushed into the available pool.
 *                       All conditions are AND-ed. Checked every game tick.
 *                       Fields:
 *                         operations: string[]   — all must be completed
 *                         minDrops: number
 *                         minJuniorCalculators: number
 *                         minBoffins: number
 *                         minHuts: number
 *                         minData: number
 *
 *   cost      object    { data?, flops? } — consumed on execution.
 *
 *   gates     object    Non-trigger prerequisites checked at execution time.
 *                       A node can be visible (triggered) but not yet executable.
 *                       Fields: { minBoffins?, minHuts? }
 *                       (resource costs belong in `cost`, not here)
 *
 *   result    string    Plain-English effect shown in the card and completion overlay.
 *                       Use ` · ` as separator. No line breaks.
 *
 *   flavor    string    Atmospheric text pushed to the event log on completion.
 *
 *   effect    function  (state) => void — mutates state, called once on execution.
 *
 *   Optional:
 *     id                string   must match the object key (used for serialization)
 *     phase             number   game phase (0, 1, …)
 *     type              string   'algorithm' | 'infrastructure' | 'intelligence'
 *     isPhaseTransition bool     triggers phase-change logic
 *     overlay           object   { title, body } — full-screen overlay on completion
 *
 *
 * TO ADD AN INITIATIVE
 * ────────────────────
 *   1. Add the node object below (id must match the key).
 *   2. Set trigger.operations to the ids that must be completed first,
 *      plus any milestone conditions (minDrops, minJuniorCalculators, etc.).
 *   3. Update the graph diagram above.
 *   That's it. No other file needs to change.
 */


export const OPERATIONS = {

  // ── Phase 0 ──────────────────────────────────────────────────────────────────

  zygalskiSheets: {
    id: 'zygalskiSheets',
    phase: 0,
    label: 'Receipt of the Zygalski Sheets',
    type: 'algorithm',
    trigger: { minDrops: 1 },
    cost: { data: 50 },
    gates: {},
    result: 'Army Radio Code search space halved · Each crack now takes 50% less computation',
    flavor: 'The Polish mathematicians hand over their three years of work. We do not waste it.',
    effect(state) {
      state.streams.armyEnigma.spaceCurrent *= 0.5;
      state.streams.armyEnigma.spaceBase *= 0.5;
    },
  },

  formationHut6: {
    id: 'formationHut6',
    phase: 0,
    label: 'Formation of Hut 6',
    type: 'infrastructure',
    trigger: { minJuniorCalculators: 3 },
    cost: { data: 120 },
    gates: {},
    result: 'Dedicated Army Radio Code cluster online · Section Head role unlocked · Personnel expansion available',
    flavor: 'Logic Sector 1 initialized. Army and Air Enigma now have a dedicated processing cluster.',
    effect(state) {
      // Section Head unit becomes purchasable — gated via operations.completed in units.js
    },
  },

  formationHut8: {
    id: 'formationHut8',
    phase: 0,
    label: 'Formation of Hut 8',
    type: 'intelligence',
    trigger: { minDrops: 5 },
    cost: { data: 180 },
    gates: {},
    result: 'Naval Radio Code stream unlocked · U-boat encrypted traffic now intercepted · Cracking it yields 4× the Data reward',
    flavor: 'Naval Enigma gets its own hut. The U-boats are the primary target.',
    effect(state) {
      state.streams.navalEnigma.unlocked = true;
    },
  },

  firstManualBreak: {
    id: 'firstManualBreak',
    phase: 0,
    label: 'First Manual Break of Army Code',
    type: 'intelligence',
    trigger: { operations: ['formationHut6'] },
    cost: { data: 150 },
    gates: {},
    result: 'Army code crack reward +50% · All future operation costs −5%',
    flavor: 'January 6, 1940. Proof of concept for human-meat calculation. The search space is finite. It can be beaten.',
    effect(state) {
      state.streams.armyEnigma.rewardBase *= 1.5;
      state.multipliers.operationCost = Math.max(0.1, state.multipliers.operationCost - 0.05);
    },
  },

  theHerivelTip: {
    id: 'theHerivelTip',
    phase: 0,
    label: 'The Herivel Tip',
    type: 'algorithm',
    trigger: { operations: ['zygalskiSheets'] },
    cost: { data: 80 },
    gates: {},
    result: 'Army Radio Code crack reward doubled · Each Boffin now adds +5% bonus to every crack',
    flavor: "Herivel notices that lazy German operators set their rotors to yesterday's position. Human error is the first exploit.",
    effect(state) {
      state.streams.armyEnigma.rewardBase *= 2;
      state.flags.herivelTipActive = true;
    },
  },

  frequencyAnalysis: {
    id: 'frequencyAnalysis',
    phase: 0,
    label: 'Frequency Analysis',
    type: 'algorithm',
    trigger: { operations: ['theHerivelTip'] },
    cost: { data: 300, flops: 1500 },
    gates: {},
    result: 'Search speed +40% · All future algorithm operations −20% cheaper',
    flavor: "The letters aren't random. The machine thinks it's hiding, but the language leaks through.",
    effect(state) {
      state.multipliers.searchSpeed *= 1.4;
      state.flags.algorithmCostMult = (state.flags.algorithmCostMult || 1) * 0.8;
    },
  },

  rotorLogicMapping: {
    id: 'rotorLogicMapping',
    phase: 0,
    label: 'Rotor Logic Mapping',
    type: 'algorithm',
    trigger: { operations: ['frequencyAnalysis'] },
    cost: { data: 800, flops: 4000 },
    gates: {},
    result: 'Data earned per crack ×3 · You now see exactly how far through each intercept you are',
    flavor: 'We stop guessing how the rotors step and start knowing.',
    effect(state) {
      state.multipliers.dataPerDrop *= 3;
      state.flags.showSearchPercent = true;
    },
  },

  recruitFirst50: {
    id: 'recruitFirst50',
    phase: 0,
    label: 'Recruit First 50 Computers',
    type: 'infrastructure',
    trigger: { operations: ['formationHut6'], minJuniorCalculators: 10 },
    cost: { data: 200 },
    gates: {},
    result: '+50 Supply Cap · Night Shift Rotation now active (×2 FLOPs for 90s every 10 min)',
    flavor: 'Parallel processing capacity +50. Requisition approved.',
    effect(state) {
      state.resources.supply.cap += 50;
      state.upgrades.nightShiftUnlocked = true;
    },
  },

  cardIndexEarly: {
    id: 'cardIndexEarly',
    phase: 0,
    label: 'Card Index (Early)',
    type: 'infrastructure',
    trigger: { operations: ['recruitFirst50'] },
    cost: { data: 400 },
    gates: {},
    result: 'Data storage capacity ×5 · You can now stockpile far more before hitting the cap',
    flavor: 'Three million index cards, cross-referencing every fragment of decrypted text. The first persistent memory.',
    effect(state) {
      state.resources.dataCap *= 5;
    },
  },

  conceptualizeBombe: {
    id: 'conceptualizeBombe',
    phase: 0,
    label: 'Conceptualize the Bombe',
    type: 'algorithm',
    trigger: { operations: ['rotorLogicMapping'] },
    cost: { data: 5000, flops: 20000 },
    gates: { minBoffins: 5, minHuts: 2 },
    result: 'Phase transition — mechanical computation begins',
    flavor: "Turing writes it down: 'We do not need the men to think faster. We need the copper to flow smarter.' The phase shift begins.",
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
