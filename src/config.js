/**
 * Game balance configuration — every tuneable constant lives here.
 *
 * This object is mutable so the simulator can swap values between runs:
 *   import { CONFIG } from './config.js';
 *   Object.assign(CONFIG, myOverrides);
 *
 * Sections mirror the systems that consume them.
 */
export const CONFIG = {

  // ── Time / date ──────────────────────────────────────────────────────────────
  dayDuration:            1,        // real seconds per in-game day
  timeScaleOffset:   10,    // constant added to fps before log10; sets speed floor at fps=0

  // ── Search / drops ───────────────────────────────────────────────────────────
  dropScale:         1.02,  // each drop, search space grows by this factor
  flopsToStates:     10,    // 1 FLOP clears this many states/sec

  // ── Personnel ────────────────────────────────────────────────────────────────
  unitCostScale:         1.12,  // exponential cost multiplier per unit bought
  juniorCalcFlopsPerSec: 0.1,
  boffinFlopsPerSec:     2.5,
  sectionHeadBonus:      0.25,  // additive FLOPs multiplier per section head
  boffinCostReduction:   0.02,  // operationCost reduction per boffin hired
  boffinCostReductionCap:10,    // stop reducing after this many boffins
  operationCostFloor:    0.7,   // operationCost multiplier cannot go below this

  // ── Night shift ──────────────────────────────────────────────────────────────
  nightShiftDuration:  60,   // seconds active (doubles FLOPs)
  nightShiftCooldown:  240,  // seconds between cycles

  // ── Bombe ────────────────────────────────────────────────────────────────────
  bombeStatesPerMin: 17000,  // states/min cleared by one running Bombe
  bombeElecPerUnit:  5,      // watts consumed per Bombe
  bombeCostScale:    1.15,   // exponential cost multiplier per Bombe bought

  // ── Starting values ──────────────────────────────────────────────────────────
  initialDataCap:    500,
  initialSupplyCap:  12,

  // ── Stream baselines ─────────────────────────────────────────────────────────
  armyEnigmaSpaceBase:   300,
  armyEnigmaRewardBase:  100,
  navalEnigmaSpaceBase:  48000,
  navalEnigmaRewardBase: 400,

  // ── Initiative costs ─────────────────────────────────────────────────────────
  // Global multiplier applied on top of every opBaseCosts entry.
  // Vary this in the simulator sweep to test difficulty curves.
  opCostMultiplier: 1.0,

  // Per-initiative base data/flops costs (before player discounts).
  // getOperationCost() reads these; override via --config JSON in the simulator.
  opBaseCosts: {
    // Phase 0 — pre-cardIndexEarly (dataCap ≤ 500)
    zygalskiSheets:            { data: 80 },
    formationHut6:             { data: 200 },
    formationHut8:             { data: 280 },
    firstManualBreak:          { data: 200 },
    theHerivelTip:             { data: 120 },
    recruitMathematicians:     { data: 280 },
    convoyEscortsRerouted:     { data: 120 },
    messHallConstructed:       { data: 380 },
    recruitFirst50:            { data: 300 },
    cardIndexEarly:            { data: 400 },

    // Phase 0 — post-cardIndexEarly (dataCap = 5000)
    frequencyAnalysis:         { data: 500, flops: 2500 },
    rotorLogicMapping:         { data: 1200, flops: 6000 },
    wartimeRationing:          { data: 800 },
    battleOfBritainIntel:      { data: 600 },
    afrikaKorpsSupplyTracked:  { data: 1800 },
    battleOfCapeMatapan:       { data: 1800 },
    sinkingOfBismarck:         { data: 2400 },
    conceptualizeBombe:        { data: 3000, flops: 15000 },
    turingMemorandum:          { data: 2500 },

    // Phase 1 — installationVictory uses pre-×6 cap (dataCap = 5000)
    installationVictory:       { data: 4000 },

    // Phase 1 — post-installationVictory (dataCap = 30000)
    welchmanDiagonalBoard:     { data: 5000 },
    agnusDei:                  { data: 6000 },
    theCilleExploit:           { data: 6000 },
    creationHut3:              { data: 4000 },
    recruitmentFirstWrens:     { data: 3500 },
    operationMincemeat:        { data: 6000 },
    firstNavalEnigmaBreak:     { data: 15000 },
    sharkBlackout:             { data: 9000 },
    fourRotorBombe:            { data: 13000 },
    cardIndexFull:             { data: 20000 },

    // Phase 1 war — post-cardIndexFull (dataCap = 600000)
    battleOfAtlanticTide:      { data: 12000 },
    colossusOperational:       { data: 22000 },
    dDayIntelligence:          { data: 30000 },
    ardennesOffensive:         { data: 40000 },
    veDay:                     { data: 60000 },
  },

};
