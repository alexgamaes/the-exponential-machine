import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../../src/core/state.js';
import {
  getOperationCost,
  canExecuteOperation,
  executeOperation,
  refreshAvailableOperations,
} from '../../src/systems/operations.js';
import { OPERATIONS } from '../../src/data/operations.js';
import { CONFIG } from '../../src/config.js';

// ── Cost ──────────────────────────────────────────────────────────────────────

describe('getOperationCost', () => {
  test('applies base cost multiplier', () => {
    const state = createInitialState();
    state.multipliers.operationCost = 0.8; // above the 0.7 floor
    const cost = getOperationCost(state, 'zygalskiSheets');
    const base = CONFIG.opBaseCosts.zygalskiSheets.data;
    assert.equal(cost.data, Math.floor(base * 0.8));
  });

  test('applies algorithm-type discount from frequencyAnalysis flag', () => {
    const state = createInitialState();
    state.flags.algorithmCostMult = 0.8;
    const cost = getOperationCost(state, 'zygalskiSheets'); // algorithm type, opCost=1.0
    const base = CONFIG.opBaseCosts.zygalskiSheets.data;
    assert.equal(cost.data, Math.floor(base * 0.8));
  });

  test('does not apply algorithm discount to infrastructure ops', () => {
    const state = createInitialState();
    state.flags.algorithmCostMult = 0.5;
    const cost = getOperationCost(state, 'formationHut6'); // infrastructure — algoMult ignored
    const base = CONFIG.opBaseCosts.formationHut6.data;
    assert.equal(cost.data, base); // unchanged, multiplier=1.0
  });
});

// ── canExecuteOperation ───────────────────────────────────────────────────────

describe('canExecuteOperation', () => {
  test('blocked when not enough data', () => {
    const state = createInitialState();
    state.resources.data = 0;
    const { can, reason } = canExecuteOperation(state, 'zygalskiSheets');
    assert.equal(can, false);
    assert.match(reason, /Need .+ Data/);
  });

  test('blocked when not enough flops', () => {
    const state = createInitialState();
    state.resources.data = 5000;
    state.resources.flops = 0;
    const { can, reason } = canExecuteOperation(state, 'frequencyAnalysis');
    assert.equal(can, false);
    assert.match(reason, /Need .+ FLOPs/);
  });

  test('blocked when already completed', () => {
    const state = createInitialState();
    state.resources.data = 1000;
    state.operations.completed = ['zygalskiSheets'];
    const { can } = canExecuteOperation(state, 'zygalskiSheets');
    assert.equal(can, false);
  });

  test('gates: blocked until minBoffins met', () => {
    const state = createInitialState();
    state.resources.data = 10000;
    state.resources.flops = 100000;
    const { can, reason } = canExecuteOperation(state, 'conceptualizeBombe');
    assert.equal(can, false);
    assert.match(reason, /Need 5 Boffins/);
  });

  test('gates: blocked until minHuts met after boffins satisfied', () => {
    const state = createInitialState();
    state.resources.data = 10000;
    state.resources.flops = 100000;
    state.personnel.boffin.count = 5;
    state.huts = 0;
    const { can, reason } = canExecuteOperation(state, 'conceptualizeBombe');
    assert.equal(can, false);
    assert.match(reason, /Need 1 Huts/);
  });

  test('succeeds when all resources and gates satisfied', () => {
    const state = createInitialState();
    state.resources.data = 10000;
    state.resources.flops = 100000;
    state.personnel.boffin.count = 5;
    state.huts = 1;
    const { can } = canExecuteOperation(state, 'conceptualizeBombe');
    assert.equal(can, true);
  });

  test('operation prerequisites are NOT checked here — trigger controls visibility', () => {
    // In the old system, canExecuteOperation blocked ops with unmet requires.operations.
    // Now that's the trigger system's job. canExecute only checks resources + gates.
    const state = createInitialState();
    state.resources.data = 1000;
    // firstManualBreak trigger requires formationHut6 completed, but that's for visibility.
    // If somehow it's in available and you have resources, it should be executable.
    const { can } = canExecuteOperation(state, 'firstManualBreak');
    assert.equal(can, true); // cost 150 data, no gates → allowed
  });
});

// ── Trigger system (refreshAvailableOperations) ───────────────────────────────

describe('trigger system', () => {

  test('zygalskiSheets appears at game start (no drops required)', () => {
    const state = createInitialState();
    state.stats.totalDrops = 0;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('zygalskiSheets'));
  });

  test('formationHut6 appears after 2 junior calculators hired', () => {
    const state = createInitialState();
    state.personnel.juniorCalculator.count = 2;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('formationHut6'));
  });

  test('formationHut6 does not appear with only 1 junior calculator', () => {
    const state = createInitialState();
    state.personnel.juniorCalculator.count = 1;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('formationHut6'), false);
  });

  test('formationHut8 appears after 20 drops', () => {
    const state = createInitialState();
    state.stats.totalDrops = 20;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('formationHut8'));
  });

  test('formationHut8 does not appear at 19 drops', () => {
    const state = createInitialState();
    state.stats.totalDrops = 19;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('formationHut8'), false);
  });

  test('theHerivelTip appears when zygalskiSheets is completed AND 5 drops reached', () => {
    const state = createInitialState();
    state.operations.completed = ['zygalskiSheets'];
    state.stats.totalDrops = 5;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('theHerivelTip'));
  });

  test('recruitFirst50 requires formationHut6 done AND 25 calculators AND 25 drops', () => {
    const state = createInitialState();

    // Only formationHut6 done — not enough
    state.operations.completed = ['formationHut6'];
    state.personnel.juniorCalculator.count = 20;
    state.stats.totalDrops = 30;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('recruitFirst50'), false);

    // Add enough calculators — now it appears
    state.personnel.juniorCalculator.count = 25;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('recruitFirst50'));
  });

  test('conceptualizeBombe appears when rotorLogicMapping is completed', () => {
    const state = createInitialState();
    state.operations.completed = ['rotorLogicMapping'];
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('conceptualizeBombe'));
  });

  test('completed nodes are never re-added to available', () => {
    const state = createInitialState();
    state.stats.totalDrops = 10;
    state.operations.completed = ['zygalskiSheets'];
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('zygalskiSheets'), false);
  });

  test('all trigger conditions are AND-ed — partial match is not enough', () => {
    const state = createInitialState();
    // recruitFirst50: needs formationHut6 AND minJuniorCalculators:10
    state.operations.completed = []; // formationHut6 NOT done
    state.personnel.juniorCalculator.count = 10; // calculators met
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('recruitFirst50'), false);
  });
});

// ── executeOperation ──────────────────────────────────────────────────────────

describe('executeOperation', () => {
  test('deducts cost and applies effect', () => {
    const state = createInitialState();
    state.resources.data = 5000;
    const { data: cost } = getOperationCost(state, 'zygalskiSheets');
    const ok = executeOperation(state, 'zygalskiSheets');
    assert.equal(ok, true);
    assert.equal(state.resources.data, 5000 - cost);
    assert.equal(state.streams.armyEnigma.spaceBase, 150); // halved
  });

  test('marks op as completed and removes from available', () => {
    const state = createInitialState();
    state.resources.data = 5000;
    state.operations.available = ['zygalskiSheets'];
    executeOperation(state, 'zygalskiSheets');
    assert.ok(state.operations.completed.includes('zygalskiSheets'));
    assert.equal(state.operations.available.includes('zygalskiSheets'), false);
  });

  test('completing an op triggers refresh — children become available', () => {
    const state = createInitialState();
    state.resources.data = 5000;
    state.stats.totalDrops = 5; // satisfy theHerivelTip's minDrops: 5
    state.operations.available = ['zygalskiSheets'];
    executeOperation(state, 'zygalskiSheets');
    // theHerivelTip trigger: { operations: ['zygalskiSheets'], minDrops: 5 } — now satisfied
    assert.ok(state.operations.available.includes('theHerivelTip'));
  });

  test('returns false and changes nothing when cannot execute', () => {
    const state = createInitialState();
    state.resources.data = 0;
    const ok = executeOperation(state, 'zygalskiSheets');
    assert.equal(ok, false);
    assert.equal(state.operations.completed.length, 0);
    assert.equal(state.resources.data, 0);
  });

  test('records completion timestamp', () => {
    const state = createInitialState();
    state.resources.data = 5000;
    const before = Date.now();
    executeOperation(state, 'zygalskiSheets');
    const ts = state.operations._completedTimestamps?.zygalskiSheets;
    assert.ok(ts >= before);
  });
});

// ── minDate trigger ───────────────────────────────────────────────────────────

describe('minDate trigger', () => {
  test('op is visible but blocked by canExecute when date not met', () => {
    const state = createInitialState();
    state.stats.totalDrops = 10;
    state.resources.data = 10000;
    state.date = { year: 1939, month: 8, day: 1 }; // before gate date 1939-09
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('convoyEscortsRerouted'));
    const { can, reason } = canExecuteOperation(state, 'convoyEscortsRerouted');
    assert.equal(can, false);
    assert.match(reason, /Available from/);
  });

  test('op executable when date exactly meets the gate month', () => {
    const state = createInitialState();
    state.stats.totalDrops = 10;
    state.resources.data = 10000;
    state.date = { year: 1939, month: 9, day: 1 };
    refreshAvailableOperations(state);
    const { can } = canExecuteOperation(state, 'convoyEscortsRerouted');
    assert.equal(can, true);
  });

  test('op executable when date is past the gate month', () => {
    const state = createInitialState();
    state.stats.totalDrops = 10;
    state.resources.data = 10000;
    state.date = { year: 1940, month: 1, day: 1 };
    refreshAvailableOperations(state);
    const { can } = canExecuteOperation(state, 'convoyEscortsRerouted');
    assert.equal(can, true);
  });

  test('date gate combined with trigger — trigger still gates visibility', () => {
    const state = createInitialState();
    state.date = { year: 1939, month: 10, day: 1 };
    state.stats.totalDrops = 0; // drops NOT met (trigger needs 1)
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('convoyEscortsRerouted'), false);
  });
});

// ── Starter gating ops (plan 07) ─────────────────────────────────────────────

describe('starter gating operations', () => {
  test('recruitMathematicians appears after 1 drop AND 2 calculators', () => {
    const state = createInitialState();
    state.stats.totalDrops = 1;
    state.personnel.juniorCalculator.count = 2;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('recruitMathematicians'));
  });

  test('recruitMathematicians does not appear with only drops (no calculators)', () => {
    const state = createInitialState();
    state.stats.totalDrops = 1;
    state.personnel.juniorCalculator.count = 1;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('recruitMathematicians'), false);
  });

  test('messHallConstructed appears after 1 hut', () => {
    const state = createInitialState();
    state.huts = 1;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('messHallConstructed'));
  });

  test('messHallConstructed does not appear with 0 huts', () => {
    const state = createInitialState();
    state.huts = 0;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('messHallConstructed'), false);
  });

  test('wartimeRationing appears after recruitMathematicians completed AND 4 boffins hired AND 40 drops', () => {
    const state = createInitialState();
    state.operations.completed = ['recruitMathematicians'];
    state.personnel.boffin.count = 4;
    state.stats.totalDrops = 40;
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('wartimeRationing'));
  });

  test('wartimeRationing does not appear without recruitMathematicians completed', () => {
    const state = createInitialState();
    state.personnel.boffin.count = 5;
    state.stats.totalDrops = 40;
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('wartimeRationing'), false);
  });
});

// ── War events and phase transitions ─────────────────────────────────────────

describe('war events and phase transitions', () => {
  test('conceptualizeBombe sets bombeConceptualized flag, not phase', () => {
    const state = createInitialState();
    state.resources.data = 10000;
    state.resources.flops = 100000;
    state.personnel.boffin.count = 5;
    state.huts = 1;
    executeOperation(state, 'conceptualizeBombe');
    assert.equal(state.flags.bombeConceptualized, true);
    assert.equal(state.phase, 0); // phase unchanged
  });

  test('turingMemorandum sets phase to 1', () => {
    const state = createInitialState();
    state.resources.data = 10000;
    state.personnel.boffin.count = 5;
    state.huts = 1;
    state.date = { year: 1941, month: 10, day: 1 }; // past gate date Sep 1941
    state.operations.completed = ['rotorLogicMapping', 'afrikaKorpsSupplyTracked'];
    executeOperation(state, 'turingMemorandum');
    assert.equal(state.phase, 1);
  });

  test('turingMemorandum is a phase transition (isPhaseTransition flag)', () => {
    assert.equal(OPERATIONS.turingMemorandum.isPhaseTransition, true);
  });

  test('veDay sets phase to 2', () => {
    const state = createInitialState();
    state.resources.data = 500000;
    state.operations.completed = ['ardennesOffensive'];
    state.date = { year: 1945, month: 5, day: 1 };
    executeOperation(state, 'veDay');
    assert.equal(state.phase, 2);
  });

  test('overlay fires only when isPhaseTransition is true', () => {
    // turingMemorandum: isPhaseTransition:true → overlay fires
    const state = createInitialState();
    state.resources.data = 10000;
    state.personnel.boffin.count = 5;
    state.huts = 1;
    state.date = { year: 1941, month: 10, day: 1 };
    state.operations.completed = ['rotorLogicMapping', 'afrikaKorpsSupplyTracked'];
    executeOperation(state, 'turingMemorandum');
    assert.ok(state._pendingOverlay);
    assert.equal(state._pendingOverlay.title, 'ACTION THIS DAY');
  });

  test('overlay does NOT fire for welchmanDiagonalBoard (not isPhaseTransition)', () => {
    const state = createInitialState();
    state.resources.data = 20000;
    state.personnel.boffin.count = 8;
    state.personnel.wren.count = 3;   // satisfies new minWrens: 3 gate
    state.hardware.bombes.count = 1;  // satisfies new minBombes: 1 gate
    state.operations.completed = ['installationVictory'];
    executeOperation(state, 'welchmanDiagonalBoard');
    assert.equal(state._pendingOverlay, undefined);
  });

  test('installationVictory triggers only after both conceptualizeBombe AND turingMemorandum', () => {
    const state = createInitialState();
    state.operations.completed = ['conceptualizeBombe', 'turingMemorandum'];
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('installationVictory'));
  });

  test('installationVictory does not appear with only conceptualizeBombe', () => {
    const state = createInitialState();
    state.operations.completed = ['conceptualizeBombe']; // turingMemorandum missing
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('installationVictory'), false);
  });

  test('installationVictory does not appear without conceptualizeBombe', () => {
    const state = createInitialState();
    state.phase = 1; // phase alone is not sufficient
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('installationVictory'), false);
  });

  test('operationMincemeat requires phase≥1 (date is a gate, not a trigger)', () => {
    const state = createInitialState();
    state.phase = 1;
    state.date = { year: 1941, month: 4, day: 1 };
    refreshAvailableOperations(state);
    assert.ok(state.operations.available.includes('operationMincemeat'));
  });

  test('operationMincemeat does not appear in phase 0', () => {
    const state = createInitialState();
    state.phase = 0;
    state.date = { year: 1941, month: 4, day: 1 };
    refreshAvailableOperations(state);
    assert.equal(state.operations.available.includes('operationMincemeat'), false);
  });
});

// ── Affordability chain — cost must never exceed achievable dataCap ───────────
//
// Each op's minimum possible data cost (at max discounts) must be ≤ the dataCap
// reachable by completing all cap-expanding ops that precede it in the DAG.
// This is the class of bug where a player saves up forever and can never afford
// an op because the cap is lower than the cost.

describe('affordability chain', () => {
  // Build a state that has executed every cap/discount op available before the
  // target, returning { dataCap, minCost }.
  function phase0State() {
    const state = createInitialState();
    // Apply all Phase 0 cap-expanding and cost-reducing effects manually
    // (same order the player would execute them):
    state.resources.dataCap *= 10;           // cardIndexEarly (×10)
    state.multipliers.operationCost = 0.7;   // floor after firstManualBreak + boffins
    state.flags.algorithmCostMult = 0.8;     // frequencyAnalysis
    return state;
  }

  test('conceptualizeBombe minimum cost fits within Phase 0 dataCap', () => {
    const state = phase0State();
    const cost = getOperationCost(state, 'conceptualizeBombe');
    // cost.data must be ≤ dataCap so the player can accumulate it
    assert.ok(
      cost.data <= state.resources.dataCap,
      `conceptualizeBombe costs ${cost.data} data but Phase 0 dataCap is only ${state.resources.dataCap}`
    );
  });

  test('installationVictory minimum cost fits within Phase 1 dataCap', () => {
    const state = phase0State();
    // Phase 1 adds cardIndexFull (×20) but that requires installationVictory first —
    // use only cardIndexEarly cap here (same cap the player starts Phase 1 with)
    const cost = getOperationCost(state, 'installationVictory');
    assert.ok(
      cost.data <= state.resources.dataCap,
      `installationVictory costs ${cost.data} data but dataCap entering Phase 1 is ${state.resources.dataCap}`
    );
  });

  test('all Phase 0 ops have data costs within 500 (base cap)', () => {
    // Ops that appear before cardIndexEarly must be payable with just the base cap
    const PRE_CARD_INDEX = [
      'zygalskiSheets', 'formationHut6', 'theHerivelTip', 'firstManualBreak',
      'formationHut8', 'recruitMathematicians', 'messHallConstructed',
      'convoyEscortsRerouted',
    ];
    const state = createInitialState(); // no discounts, base cap 500
    for (const id of PRE_CARD_INDEX) {
      const cost = getOperationCost(state, id);
      assert.ok(
        cost.data <= state.resources.dataCap,
        `${id} costs ${cost.data} data but base dataCap is ${state.resources.dataCap}`
      );
    }
  });

  test('every op data cost is payable given the dataCap reachable before it', () => {
    // Walk every op and assert: min data cost ≤ dataCap reachable when the op first appears.
    //
    // Cap milestones (in DAG order):
    //   start:              500
    //   cardIndexEarly ×10: 5000
    //   installationVictory ×6: 30000    (first Phase 1 op — gates all Phase 1 successors)
    //   cardIndexFull ×20:  600000
    //
    // Min cost = base × operationCost floor (0.7) × algorithmCostMult (0.8 for algorithm type).
    // A test failure means the op is STRUCTURALLY unaffordable — the player cannot
    // accumulate enough data regardless of play time.

    const CAP_BASE          = 500;
    const CAP_CARD_EARLY    = CAP_BASE * 10;          // 5000  — after cardIndexEarly
    const CAP_INSTALL       = CAP_CARD_EARLY * 6;     // 30000 — after installationVictory
    const CAP_CARD_FULL     = CAP_INSTALL * 20;       // 600000 — after cardIndexFull

    // Each op mapped to the cap available when it first becomes executable.
    // Ops not listed use CAP_BASE (most conservative assumption).
    const capForOp = {
      // Phase 0 — appear before cardIndexEarly (cap = 500)
      zygalskiSheets:          CAP_BASE,
      formationHut6:           CAP_BASE,
      formationHut8:           CAP_BASE,
      firstManualBreak:        CAP_BASE,
      theHerivelTip:           CAP_BASE,
      recruitFirst50:          CAP_BASE,
      recruitMathematicians:   CAP_BASE,
      messHallConstructed:     CAP_BASE,
      convoyEscortsRerouted:   CAP_BASE,
      cardIndexEarly:          CAP_BASE,  // buying uses pre-effect cap

      // Phase 0 — appear after cardIndexEarly (cap = 5000)
      frequencyAnalysis:       CAP_CARD_EARLY,
      rotorLogicMapping:       CAP_CARD_EARLY,
      battleOfBritainIntel:    CAP_CARD_EARLY,
      afrikaKorpsSupplyTracked:CAP_CARD_EARLY,
      battleOfCapeMatapan:     CAP_CARD_EARLY,
      sinkingOfBismarck:       CAP_CARD_EARLY,
      wartimeRationing:        CAP_CARD_EARLY, // requires 3 boffins → player has cardIndexEarly
      conceptualizeBombe:      CAP_CARD_EARLY,
      turingMemorandum:        CAP_CARD_EARLY,
      installationVictory:     CAP_CARD_EARLY, // buying uses pre-×6 cap

      // Phase 1 — post-installationVictory (cap = 30000)
      welchmanDiagonalBoard:   CAP_INSTALL,
      agnusDei:                CAP_INSTALL,
      theCilleExploit:         CAP_INSTALL,
      creationHut3:            CAP_INSTALL,
      recruitmentFirstWrens:   CAP_INSTALL,
      operationMincemeat:      CAP_INSTALL,
      firstNavalEnigmaBreak:   CAP_INSTALL,
      sharkBlackout:           CAP_INSTALL,
      fourRotorBombe:          CAP_INSTALL,
      cardIndexFull:           CAP_INSTALL,    // buying uses pre-×20 cap
      battleOfAtlanticTide:    CAP_INSTALL,    // triggers after firstNavalEnigmaBreak, not cardIndexFull
      colossusOperational:     CAP_INSTALL,    // triggers after battleOfAtlanticTide

      // Phase 1 war — post-cardIndexFull (cap = 600000)
      dDayIntelligence:        CAP_CARD_FULL,
      ardennesOffensive:       CAP_CARD_FULL,
      veDay:                   CAP_CARD_FULL,
    };

    const OP_COST_FLOOR = 0.7;
    const ALGO_COST_FLOOR = 0.8;

    for (const [id, op] of Object.entries(OPERATIONS)) {
      // Read cost from CONFIG (same source getOperationCost uses)
      const baseCost = CONFIG.opBaseCosts?.[id] ?? op.cost ?? {};
      if (!baseCost.data) continue;
      const minCost = Math.floor(
        baseCost.data * OP_COST_FLOOR * (op.type === 'algorithm' ? ALGO_COST_FLOOR : 1)
      );
      const cap = capForOp[id] ?? CAP_BASE;
      assert.ok(
        minCost <= cap,
        `${id}: min data cost ${minCost} exceeds dataCap ${cap} reachable before it`
      );
    }
  });

  test('cardIndexEarly dataCap after effect exceeds conceptualizeBombe minimum cost', () => {
    // Regression: ×5 gave cap=2500 < min cost 2800; ×8 gave cap=4000 < installationVictory 4200; fixed at ×10
    const state = createInitialState();
    state.resources.dataCap *= 10;           // cardIndexEarly effect
    state.multipliers.operationCost = 0.7;
    state.flags.algorithmCostMult = 0.8;
    const bombeCost = getOperationCost(state, 'conceptualizeBombe');
    const installCost = getOperationCost(state, 'installationVictory');
    assert.ok(
      state.resources.dataCap > bombeCost.data,
      `dataCap ${state.resources.dataCap} must exceed conceptualizeBombe cost ${bombeCost.data}`
    );
    assert.ok(
      state.resources.dataCap > installCost.data,
      `dataCap ${state.resources.dataCap} must exceed installationVictory cost ${installCost.data}`
    );
  });
});

// ── operationCost floor ───────────────────────────────────────────────────────

describe('operationCost floor', () => {
  test('firstManualBreak cannot reduce operationCost below 0.7', () => {
    const state = createInitialState();
    state.multipliers.operationCost = 0.71;
    state.resources.data = 1000;
    state.operations.completed = ['formationHut6'];
    executeOperation(state, 'firstManualBreak');
    assert.equal(state.multipliers.operationCost, 0.7);
  });

  test('operationMincemeat effect also floors at 0.7', () => {
    const state = createInitialState();
    state.multipliers.operationCost = 0.72;
    state.resources.data = 100000;
    state.phase = 1;
    state.date = { year: 1943, month: 4, day: 1 };
    state.operations.completed = [];
    executeOperation(state, 'operationMincemeat');
    assert.equal(state.multipliers.operationCost, 0.7);
  });
});
