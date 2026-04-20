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
 * Arrows show trigger.operations dependencies. Milestone triggers noted inline.
 *
 *  Economy track:
 *   [3 drops]          zygalskiSheets ──► theHerivelTip ──► frequencyAnalysis ──► rotorLogicMapping ──► conceptualizeBombe
 *   [8 calculators]    formationHut6  ──► firstManualBreak
 *                                     └──► recruitFirst50 [also: 20 calculators] ──► cardIndexEarly
 *   [15 drops]         formationHut8  (unlocks naval stream)
 *   [3 drops, 5 JCs]   recruitMathematicians (unlocks Boffin)
 *   [2 huts]           messHallConstructed (unlocks Canteen Expansion)
 *   [recruitMath, 3 boffins] wartimeRationing (unlocks Coffee Rationing)
 *
 *  War track (date gates are at most 1 month before real events):
 *   [1 drops, gate Sep 1939]                    convoyEscortsRerouted
 *   [15 drops, gate Jun 1940]                   battleOfBritainIntel
 *   [formationHut8, 30 drops, gate Jan 1941]    afrikaKorpsSupplyTracked
 *   [afrikaKorps, gate Feb 1941]                battleOfCapeMatapan
 *   [capeMatapan, gate Apr 1941]                sinkingOfBismarck
 *   [rotorLogicMapping + afrikaKorps, 5 boffins, gate Sep 1941]  turingMemorandum ⚑ Phase 0→1
 *
 *
 * GRAPH — Phase 1
 * ───────────────
 *  Wrens are unlocked early so the Bombes you just built can actually run.
 *  Economy track has three parallel lines out of installationVictory; war track
 *  is linear on dates.
 *
 *   [conceptualizeBombe + turingMemorandum]  installationVictory
 *      ├─► recruitmentFirstWrens  [gate Jan 1942, gate: minBombes:1, minJC:25]
 *      ├─► welchmanDiagonalBoard  [gate Nov 1941, gate: minBombes:1, minBoffins:8, minWrens:3]
 *      │     └─► agnusDei         [gate Feb 1942, gate: minBombes:3, minWrens:6]
 *      │           └─► theCilleExploit        [gate Apr 1942, gate: minBombes:4, minBoffins:12]
 *      │                 └─► firstNavalEnigmaBreak [gate Jun 1942, gate: minBombes:6, minIndexers:3]
 *      │                       └─► sharkBlackout    [gate Feb 1942, no extra gates]
 *      │                             └─► fourRotorBombe [gate Dec 1942, gate: minBombes:10]
 *      └─► creationHut3           [gate Dec 1941, gate: minJuniorCalculators:30]
 *            └─► cardIndexFull    [gate Jan 1943, gate: minIndexers:15, minBoffins:12]
 *
 *  War track:
 *   [phase≥1, gate Mar 1943]            operationMincemeat
 *   [firstNavalEnigmaBreak, gate Apr 1943]   battleOfAtlanticTide
 *   [battleOfAtlanticTide, gate Dec 1943]    colossusOperational
 *   [cardIndexFull, gate May 1944]      dDayIntelligence
 *   [dDayIntelligence, gate Dec 1944]   ardennesOffensive
 *   [ardennesOffensive, gate Apr 1945]  veDay ⚑ Phase 1→2
 *
 *
 * NODE SHAPE
 * ──────────
 *   trigger   object    When this node is pushed into the available pool.
 *                       All conditions are AND-ed. Checked every game tick.
 *                       Fields:
 *                         operations: string[]       — all must be completed
 *                         minDrops: number
 *                         minJuniorCalculators: number
 *                         minBoffins: number
 *                         minHuts: number
 *                         minData: number
 *                         minPhase: number           — minimum game phase
 *
 *   cost      object    { data?, flops? } — consumed on execution.
 *
 *   gates     object    Non-trigger prerequisites checked at execution time.
 *                       A node can be visible (triggered) but not yet executable.
 *                       Fields: { minBoffins?, minHuts?, minBombes?, minIndexers?,
 *                                 minJuniorCalculators?, minWrens?,
 *                                 minDate?: { year, month } }
 *
 *   result    string    Plain-English effect shown in the card and pushed to the log.
 *                       Use ` · ` as separator. No line breaks.
 *
 *   flavor    string    Atmospheric text pushed to the event log on completion.
 *
 *   effect    function  (state) => void — mutates state, called once on execution.
 *
 *   Optional:
 *     id                string   must match the object key
 *     phase             number   game phase (0, 1, …)
 *     type              string   'algorithm' | 'infrastructure' | 'intelligence' | 'warEvent'
 *     isPhaseTransition bool     triggers phase-change overlay
 *     overlay           object   { title, body } — full-screen overlay on completion
 *                                ONLY fires when isPhaseTransition is also true.
 *
 *
 * TO ADD AN INITIATIVE
 * ────────────────────
 *   1. Add the node object below (id must match the key).
 *   2. Set trigger conditions.
 *   3. Update the graph diagram above.
 *   That's it. No other file needs to change.
 */


export const OPERATIONS = {

  // ── Phase 0 — Economy ────────────────────────────────────────────────────────

  zygalskiSheets: {
    id: 'zygalskiSheets',
    phase: 0,
    label: 'Receipt of the Zygalski Sheets',
    type: 'algorithm',
    trigger: { minDrops: 0 },
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
    trigger: { minJuniorCalculators: 2 },
    cost: { data: 120 },
    gates: {},
    result: 'Dedicated Army Radio Code cluster online · Section Head role unlocked',
    flavor: 'Logic Sector 1 initialized. Army and Air Enigma now have a dedicated processing cluster.',
    effect(state) {
      // Section Head unit becomes purchasable — gated via operations.completed in render.js
    },
  },

  formationHut8: {
    id: 'formationHut8',
    phase: 0,
    label: 'Formation of Hut 8',
    type: 'intelligence',
    trigger: { minDrops: 20 },
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
      state.multipliers.operationCost = Math.max(0.7, state.multipliers.operationCost - 0.05);
    },
  },

  theHerivelTip: {
    id: 'theHerivelTip',
    phase: 0,
    label: 'The Herivel Tip',
    type: 'algorithm',
    trigger: { operations: ['zygalskiSheets'], minDrops: 5 },
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
    trigger: { operations: ['theHerivelTip'], minDrops: 8 },
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
    trigger: { operations: ['frequencyAnalysis'], minDrops: 14 },
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
    trigger: { operations: ['formationHut6'], minJuniorCalculators: 25, minDrops: 25 },
    cost: { data: 200 },
    gates: {},
    result: '+50 Billets · Night Shift Rotation now active (×2 FLOPs for 60s every 4 min)',
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
    trigger: { operations: ['recruitFirst50'], minDrops: 35 },
    cost: { data: 400 },
    gates: {},
    result: 'Data storage capacity ×10 · You can now stockpile far more before hitting the cap',
    flavor: 'Three million index cards, cross-referencing every fragment of decrypted text. The first persistent memory.',
    effect(state) {
      state.resources.dataCap *= 10;
    },
  },

  conceptualizeBombe: {
    id: 'conceptualizeBombe',
    phase: 0,
    label: 'Conceptualize the Bombe',
    type: 'algorithm',
    trigger: { operations: ['rotorLogicMapping'] },
    cost: { data: 5000, flops: 20000 },
    gates: { minBoffins: 5, minHuts: 1 },
    result: 'Bombe hardware design finalized · First machine can now be assembled',
    flavor: "Turing writes it down: 'We do not need the men to think faster. We need the copper to flow smarter.'",
    effect(state) {
      state.flags.bombeConceptualized = true;
    },
  },

  // ── Phase 0 — Starter Gating (plan 07) ───────────────────────────────────────

  recruitMathematicians: {
    id: 'recruitMathematicians',
    phase: 0,
    label: 'Recruit Mathematicians from the Universities',
    type: 'infrastructure',
    trigger: { minDrops: 1, minJuniorCalculators: 2 },
    cost: { data: 180 },
    gates: {},
    result: 'Boffin role unlocked · Senior mathematicians can now be hired (+2.5 FLOPs/sec each)',
    flavor: "Cambridge and Oxford empty. Chess champions, crossword setters, classicists who can read German — all signed to the Official Secrets Act before breakfast.",
    effect(state) {
      // Boffin unit becomes purchasable — gated via operations.completed in render.js
    },
  },

  messHallConstructed: {
    id: 'messHallConstructed',
    phase: 0,
    label: 'Mess Hall Constructed',
    type: 'infrastructure',
    trigger: { minHuts: 1 },
    cost: { data: 250 },
    gates: {},
    result: 'Canteen Expansion infrastructure unlocked · Each expansion adds +20 Billets',
    flavor: "A requisitioned farmhouse kitchen, a converted Nissen hut, and one bewildered Army cook. The camp becomes a place you can live.",
    effect(state) {
      // Canteen Expansion becomes purchasable — gated via operations.completed in render.js
    },
  },

  wartimeRationing: {
    id: 'wartimeRationing',
    phase: 0,
    label: 'Wartime Rationing Introduced',
    type: 'infrastructure',
    trigger: { operations: ['recruitMathematicians'], minBoffins: 4, minDrops: 40 },
    cost: { data: 500 },
    gates: {},
    result: 'Coffee Rationing infrastructure unlocked · Each rank reduces Billet usage by 15%',
    flavor: "Sugar, tea, and butter on coupons. The Park stretches every ration, and the boffins complain about the tea.",
    effect(state) {
      // Coffee Rationing becomes purchasable — gated via operations.completed in render.js
    },
  },

  // ── Phase 0 — War Track (plan 08) ────────────────────────────────────────────

  convoyEscortsRerouted: {
    id: 'convoyEscortsRerouted',
    phase: 0,
    label: 'Convoy Escorts Rerouted',
    type: 'warEvent',
    trigger: { minDrops: 1 },
    cost: { data: 80 },
    gates: { minDate: { year: 1939, month: 9 } },
    result: '+5 Billets · Army Radio Code reward +10%',
    flavor: "October 1939. The first Admiralty briefing arrives in a locked box. A westbound convoy turns south three hours before a wolfpack crosses its track.",
    effect(state) {
      state.resources.supply.cap += 5;
      state.streams.armyEnigma.rewardBase = Math.floor(state.streams.armyEnigma.rewardBase * 1.1);
    },
  },

  battleOfBritainIntel: {
    id: 'battleOfBritainIntel',
    phase: 0,
    label: 'Battle of Britain — Early Warning Enabled',
    type: 'warEvent',
    trigger: { minDrops: 15 },
    cost: { data: 400 },
    gates: { minDate: { year: 1940, month: 6 } },
    result: '+10 Billets · Army Radio Code reward +15% · Search speed +5%',
    flavor: "July 1940. Luftwaffe sortie orders decoded before the bombers reach the Channel. Fighter Command positions squadrons to meet them. The sky belongs to whoever reads the other side's post.",
    effect(state) {
      state.resources.supply.cap += 10;
      state.streams.armyEnigma.rewardBase = Math.floor(state.streams.armyEnigma.rewardBase * 1.15);
      state.multipliers.searchSpeed *= 1.05;
    },
  },

  afrikaKorpsSupplyTracked: {
    id: 'afrikaKorpsSupplyTracked',
    phase: 0,
    label: "Rommel's Supply Ships Tracked",
    type: 'warEvent',
    trigger: { operations: ['formationHut8'], minDrops: 30 },
    cost: { data: 1200 },
    gates: { minDate: { year: 1941, month: 1 } },
    result: '+200 Data Cap · Naval Radio Code reward +10%',
    flavor: "February 1941. Every tanker leaving Naples is logged, timed, and drawn on a plotting board in Malta before it clears the harbour. The Afrika Korps runs dry.",
    effect(state) {
      state.resources.dataCap += 200;
      state.streams.navalEnigma.rewardBase = Math.floor(state.streams.navalEnigma.rewardBase * 1.1);
    },
  },

  battleOfCapeMatapan: {
    id: 'battleOfCapeMatapan',
    phase: 0,
    label: 'Battle of Cape Matapan',
    type: 'warEvent',
    trigger: { operations: ['afrikaKorpsSupplyTracked'] },
    cost: { data: 1200 },
    gates: { minDate: { year: 1941, month: 2 } },
    result: '+10 Billets · +300 Data Cap',
    flavor: "March 1941. An Italian fleet sortie broadcast on Naval Enigma. The Mediterranean Fleet ambushes them off Greece at night. Three heavy cruisers and two destroyers go to the bottom. The Italian navy will not leave port in strength again.",
    effect(state) {
      state.resources.supply.cap += 10;
      state.resources.dataCap += 300;
    },
  },

  sinkingOfBismarck: {
    id: 'sinkingOfBismarck',
    phase: 0,
    label: 'Sinking of the Bismarck',
    type: 'warEvent',
    trigger: { operations: ['battleOfCapeMatapan'] },
    cost: { data: 1600 },
    gates: { minDate: { year: 1941, month: 4 } },
    result: '+500 Data Cap · Naval Radio Code reward +15%',
    flavor: "May 1941. HMS Hood blows up in three minutes. The Bismarck runs for St Nazaire. A decoded Luftwaffe signal — a general asking about his son serving aboard — confirms her course. Fifteen hundred miles later, she is on the bottom.",
    effect(state) {
      state.resources.dataCap += 500;
      state.streams.navalEnigma.rewardBase = Math.floor(state.streams.navalEnigma.rewardBase * 1.15);
    },
  },

  turingMemorandum: {
    id: 'turingMemorandum',
    phase: 0,
    label: "Turing's Memorandum to Churchill",
    type: 'warEvent',
    trigger: { operations: ['rotorLogicMapping', 'afrikaKorpsSupplyTracked'], minBoffins: 5 },
    cost: { data: 3000 },
    gates: { minHuts: 1, minDate: { year: 1941, month: 9 } },
    result: 'Phase transition — Bletchley Park is funded directly by the Prime Minister',
    flavor: "October 1941. Turing, Welchman, Alexander, Milner-Barry sign a letter to Churchill describing the bottlenecks. Churchill scrawls 'ACTION THIS DAY'. Resources cease to be a question. The problem becomes: what do you build?",
    isPhaseTransition: true,
    overlay: {
      title: 'ACTION THIS DAY',
      body: "Churchill's minute is on every desk at the Park by morning.\n\nYou are no longer a research project. You are a weapon of state.",
    },
    effect(state) {
      state.phase = 1;
    },
  },

  // ── Phase 1 — Economy ────────────────────────────────────────────────────────

  installationVictory: {
    id: 'installationVictory',
    phase: 1,
    label: 'Installation Victory',
    type: 'infrastructure',
    trigger: { operations: ['conceptualizeBombe', 'turingMemorandum'] },
    cost: { data: 6000 },
    gates: {},
    result: 'First Bombe slot active · Electricity grid online (30W) · Data storage ×6',
    flavor: 'The first machine roars to life. Click-clack-click-clack — a machine gun firing numbers into the dark. Now you need hands to run it.',
    effect(state) {
      state.resources.electricity.cap = 30;
      state.resources.dataCap *= 6;
    },
  },

  welchmanDiagonalBoard: {
    id: 'welchmanDiagonalBoard',
    phase: 1,
    label: 'The Welchman Diagonal Board',
    type: 'algorithm',
    trigger: { operations: ['installationVictory'] },
    cost: { data: 3000 },
    gates: { minBoffins: 8, minBombes: 1, minWrens: 3, minDate: { year: 1941, month: 11 } },
    result: 'All Bombe output ×10 · Retroactive to every machine built',
    flavor: "Gordon Welchman proposes a wiring modification. It costs almost nothing. It changes everything by a factor of ten.",
    overlay: {
      title: 'THE DIAGONAL BOARD',
      body: 'Every Bombe you have ever built — and every Bombe you will ever build — just became ten times smarter.\n\nThis is the nature of the exponent: a single idea propagates backward through time.',
    },
    effect(state) {
      state.multipliers.bombeOutput = (state.multipliers.bombeOutput || 1) * 10;
    },
  },

  agnusDei: {
    id: 'agnusDei',
    phase: 1,
    label: 'Agnus Dei',
    type: 'infrastructure',
    trigger: { operations: ['welchmanDiagonalBoard'] },
    cost: { data: 4000 },
    gates: { minBombes: 3, minWrens: 6, minDate: { year: 1942, month: 2 } },
    result: 'Bombe build cost −15% · +10 Billets · +5000 Data Cap',
    flavor: 'The first Bombe retrofitted with the Diagonal Board. The prototype becomes the template. Dedicated Wren housing goes up in the grounds.',
    effect(state) {
      state.hardware.bombes.baseCost = Math.floor(state.hardware.bombes.baseCost * 0.85);
      state.resources.supply.cap += 10;
      state.resources.dataCap += 5000;
    },
  },

  theCilleExploit: {
    id: 'theCilleExploit',
    phase: 1,
    label: 'The Cillies Exploit',
    type: 'algorithm',
    trigger: { operations: ['agnusDei'] },
    cost: { data: 4000 },
    gates: { minBombes: 4, minBoffins: 12, minDate: { year: 1942, month: 4 } },
    result: 'Search speed +30% · +10000 Data Cap · Stereotyped message cribs unlocked',
    flavor: 'A pattern-recognition shortcut based on rotor-start position clustering. Lazy operators are the best cryptanalysts.',
    effect(state) {
      state.multipliers.searchSpeed *= 1.3;
      state.resources.dataCap += 10000;
    },
  },

  creationHut3: {
    id: 'creationHut3',
    phase: 1,
    label: 'Creation of Hut 3',
    type: 'infrastructure',
    trigger: { operations: ['installationVictory'] },
    cost: { data: 2500 },
    gates: { minJuniorCalculators: 30, minDate: { year: 1941, month: 12 } },
    result: 'Data earned per crack +50% · Data storage ×2 · Cryptanalyst and Indexer units unlocked',
    flavor: 'Intelligence output buffering and translation layer. Raw decrypted text becomes actionable military intelligence — and the library to hold it.',
    effect(state) {
      state.multipliers.dataPerDrop *= 1.5;
      state.resources.dataCap *= 2;
    },
  },

  recruitmentFirstWrens: {
    id: 'recruitmentFirstWrens',
    phase: 1,
    label: 'Recruitment of First Wrens',
    type: 'infrastructure',
    trigger: { operations: ['installationVictory'] },
    cost: { data: 2000 },
    gates: { minJuniorCalculators: 25, minBombes: 1, minDate: { year: 1942, month: 1 } },
    result: 'Wren unit unlocked · Wren cost −20%',
    flavor: "You have a machine. Now you need hands to run it. The Wrens don't just operate the Bombes — they become part of them.",
    effect(state) {
      state.personnel.wren.baseCost = Math.floor(state.personnel.wren.baseCost * 0.8);
    },
  },

  firstNavalEnigmaBreak: {
    id: 'firstNavalEnigmaBreak',
    phase: 1,
    label: 'First Naval Enigma Break',
    type: 'intelligence',
    trigger: { operations: ['theCilleExploit'] },
    cost: { data: 10000 },
    gates: { minBombes: 6, minIndexers: 3, minDate: { year: 1942, month: 6 } },
    result: 'Naval Radio Code search space −60% · Naval crack reward ×2',
    flavor: 'Naval Enigma cracked for the first time — not in real-time, but the state-space is mapped. The U-boat logs begin to fall.',
    effect(state) {
      state.streams.navalEnigma.spaceCurrent *= 0.4;
      state.streams.navalEnigma.spaceBase *= 0.4;
      state.streams.navalEnigma.rewardBase *= 2;
    },
  },

  sharkBlackout: {
    id: 'sharkBlackout',
    phase: 1,
    label: 'The Shark Blackout',
    type: 'intelligence',
    trigger: { operations: ['firstNavalEnigmaBreak'] },
    cost: { data: 6000 },
    gates: { minDate: { year: 1942, month: 8 } },
    result: 'Four-rotor research funded · +2000 Data Cap · Unlocks the Four-Rotor Bombe',
    flavor: "February 1942. The U-boat fleet switches to a four-rotor machine and goes dark. For ten months we lose them. The Atlantic fills with tonnage on the bottom. The staff build new facilities, hire new boffins, and redesign everything for one more rotor.",
    effect(state) {
      state.resources.dataCap += 2000;
      state.flags.sharkBlackoutActive = true;
    },
  },

  fourRotorBombe: {
    id: 'fourRotorBombe',
    phase: 1,
    label: 'Four-Rotor Bombe Operational',
    type: 'infrastructure',
    trigger: { operations: ['sharkBlackout'] },
    cost: { data: 9000 },
    gates: { minBombes: 10, minDate: { year: 1942, month: 12 } },
    result: 'Bombe output ×1.5 · Naval Radio Code search space −30% · Shark defeated',
    flavor: "December 1942. The first four-rotor Bombe runs at Outstation Gayhurst. A week later, a Shark key falls. Convoy SC-118 will lose only three ships instead of forty. The blackout ends.",
    effect(state) {
      state.multipliers.bombeOutput = (state.multipliers.bombeOutput || 1) * 1.5;
      state.streams.navalEnigma.spaceCurrent *= 0.7;
      state.streams.navalEnigma.spaceBase *= 0.7;
      state.flags.sharkBlackoutActive = false;
    },
  },

  cardIndexFull: {
    id: 'cardIndexFull',
    phase: 1,
    label: 'Card Index (Full)',
    type: 'infrastructure',
    trigger: { operations: ['creationHut3'] },
    cost: { data: 15000 },
    gates: { minIndexers: 15, minBoffins: 12, minDate: { year: 1943, month: 1 } },
    result: 'Data storage ×20 · Indexers now generate passive Data',
    flavor: "A high-capacity manual memory bus for 3 million records. Pamela Rose's team maps the entire German order of battle.",
    effect(state) {
      state.resources.dataCap *= 20;
      state.flags.indexersGenerateData = true;
    },
  },

  // ── Phase 1 — War Track (plan 08) ────────────────────────────────────────────

  operationMincemeat: {
    id: 'operationMincemeat',
    phase: 1,
    label: 'Operation Mincemeat',
    type: 'warEvent',
    trigger: { minPhase: 1 },
    cost: { data: 4000 },
    gates: { minDate: { year: 1943, month: 3 } },
    result: '+500 Data Cap · All future operation costs −5%',
    flavor: "April 1943. A corpse in a Royal Marines uniform washes ashore in Spain with fake invasion plans. Berlin takes the bait. Sicily is lightly defended when the Allies arrive. The deception worked because our codebreakers confirmed they believed it.",
    effect(state) {
      state.resources.dataCap += 500;
      state.multipliers.operationCost = Math.max(0.7, state.multipliers.operationCost - 0.05);
    },
  },

  battleOfAtlanticTide: {
    id: 'battleOfAtlanticTide',
    phase: 1,
    label: 'Battle of the Atlantic — Tide Turns',
    type: 'warEvent',
    trigger: { operations: ['firstNavalEnigmaBreak'] },
    cost: { data: 8000 },
    gates: { minDate: { year: 1943, month: 4 } },
    result: '+15 Billets · Naval Radio Code reward +20%',
    flavor: "May 1943. Forty-one U-boats sunk in a single month. Dönitz withdraws the wolfpacks from the North Atlantic. The convoys get through. The invasion of Europe becomes logistically possible.",
    effect(state) {
      state.resources.supply.cap += 15;
      state.streams.navalEnigma.rewardBase = Math.floor(state.streams.navalEnigma.rewardBase * 1.2);
    },
  },

  colossusOperational: {
    id: 'colossusOperational',
    phase: 1,
    label: 'Colossus Operational',
    type: 'infrastructure',
    trigger: { operations: ['battleOfAtlanticTide'] },
    cost: { data: 15000 },
    gates: { minDate: { year: 1943, month: 12 } },
    result: 'FLOPs from all sources ×2 · +10000 Data Cap · First electronic computer online',
    flavor: "January 1944. Tommy Flowers delivers a machine of 1,600 valves to Bletchley. It attacks Lorenz — the cipher the German High Command talks to itself on. It is the first electronic, programmable computer. It exists because Flowers paid for the valves out of his own pocket when the Post Office refused.",
    effect(state) {
      state.multipliers.flopsPerSec *= 2;
      state.resources.dataCap += 10000;
      state.flags.colossusActive = true;
    },
  },

  dDayIntelligence: {
    id: 'dDayIntelligence',
    phase: 1,
    label: 'D-Day — Order of Battle Delivered',
    type: 'warEvent',
    trigger: { operations: ['cardIndexFull'] },
    cost: { data: 20000 },
    gates: { minDate: { year: 1944, month: 5 } },
    result: '+1000 Data Cap · +20 Billets · Search speed +10%',
    flavor: "June 6, 1944. Every German division in Normandy is named, numbered, and positioned on an overlay in SHAEF's operations room. Eisenhower signs the order at 04:15. The weather breaks.",
    effect(state) {
      state.resources.dataCap += 1000;
      state.resources.supply.cap += 20;
      state.multipliers.searchSpeed *= 1.1;
    },
  },

  ardennesOffensive: {
    id: 'ardennesOffensive',
    phase: 1,
    label: 'Ardennes — The Bulge Read Backward',
    type: 'warEvent',
    trigger: { operations: ['dDayIntelligence'] },
    cost: { data: 25000 },
    gates: { minDate: { year: 1944, month: 12 } },
    result: '+30 Billets · +2000 Data Cap · Army Radio Code reward +25%',
    flavor: "December 1944. The Wehrmacht attacks through the Ardennes under radio silence. Ultra sees almost nothing for four days. Then the weather clears, the attack stalls, and the radio discipline collapses. We read the retreat almost in real time.",
    effect(state) {
      state.resources.supply.cap += 30;
      state.resources.dataCap += 2000;
      state.streams.armyEnigma.rewardBase = Math.floor(state.streams.armyEnigma.rewardBase * 1.25);
    },
  },

  veDay: {
    id: 'veDay',
    phase: 1,
    label: 'V-E Day',
    type: 'warEvent',
    trigger: { operations: ['ardennesOffensive'] },
    cost: { data: 40000 },
    gates: { minDate: { year: 1945, month: 4 } },
    result: 'Phase transition — The war in Europe is over',
    flavor: "May 8, 1945. The Bombes stop. The huts go dark. Six thousand people sign another Official Secrets Act declaration and are told, individually, to go home and never mention what they did. Bletchley Park will be denied for thirty years.",
    isPhaseTransition: true,
    overlay: {
      title: 'V-E DAY',
      body: "It is over.\n\nThe greatest concentration of computational talent in history dissolves overnight. Some go back to Cambridge. Some to the Post Office. A few — the ones who saw what a Bombe could become — start thinking about a different kind of machine.",
    },
    effect(state) {
      state.phase = 2;
    },
  },

};
