# Plan 07 — Starter Gating (Redesign #3)

> **Order:** This plan ships **first**, before 08 (war narrative) and 09 (pacing). It establishes the gating primitives the other two plans build on.

---

## 1. Goal

At game start, the player should have only one unit type (Junior Calculator) and one infrastructure type (Hut) available. Every other personnel and infrastructure option must be explicitly unlocked via an initiative. This turns the first 2–5 minutes into a *saving-and-building* phase rather than a *pick-everything-you-want* phase, and gives us three more cheap initiatives to fill the early pacing gap identified in plan 09.

---

## 2. Current behaviour

### Personnel visibility (`src/ui/render.js`)

`renderPersonnel` — lines 193–214 — renders rows in this order:

- Line 199: `juniorCalculator` — **always visible** ✅
- Line 200: `boffin` — **always visible** ❌ (should be gated)
- Line 202–204: `sectionHead` — gated behind `formationHut6` ✅
- Line 206–208: `wren` — gated behind `recruitmentFirstWrens` ✅
- Line 209–212: `cryptanalyst`, `indexer` — both gated behind `creationHut3` ✅

### Infrastructure visibility (`src/ui/render.js`)

`renderInfrastructure` — lines 302–326 — renders rows in this order:

- Line 306: `hut` — **always visible** ✅
- Line 307: `canteenExpansion` — **always visible** ❌ (should be gated)
- Line 308: `coffeeRationing` — **always visible** ❌ (should be gated)
- Lines 311–323: Night Shift Rotation status card — already gated behind `u.nightShiftUnlocked` ✅

Electricity infrastructure (`localPowerLine`, `dedicatedGenerator`) is rendered inside `renderHardware` (lines 264–294) and only appears in Phase ≥ 1, so it's already effectively gated.

### Existing DAG entry points

From `src/data/operations.js`, the three Phase 0 roots are:

- `zygalskiSheets` — trigger `minDrops: 1`
- `formationHut6` — trigger `minJuniorCalculators: 3`
- `formationHut8` — trigger `minDrops: 5`

The player can currently reach `firstManualBreak` (the op that reduces `operationCost`) via `formationHut6` after hiring only 3 juniors. Boffins are buyable from the start, so the player typically buys a few boffins before ever completing an initiative.

---

## 3. Target behaviour

At `t = 0` the player can:

- Hire **Junior Calculators only**.
- Build **Huts only**.
- See the **Army Radio Code** stream and click COMPUTE.

After the first drop, the existing initiatives (`zygalskiSheets`, `formationHut6`, `formationHut8`) appear. After completing specific new initiatives, the following become available:

| New initiative | Unlocks | Trigger (rough) |
|---|---|---|
| `recruitMathematicians` | Boffin unit | `minDrops: 3` + `minJuniorCalculators: 5` |
| `messHallConstructed` | Canteen Expansion infra | `minHuts: 2` |
| `wartimeRationing` | Coffee Rationing infra | `operations: ['recruitMathematicians']` + `minBoffins: 3` |

Rationale for triggers:
- `recruitMathematicians` comes before `formationHut6` (which also needs 3 JCs) in the natural progression — the player hires juniors, unlocks boffins, then has enough people to trigger Hut 6.
- `messHallConstructed` is tied to huts — you notice you can't expand the canteen until you have a real camp.
- `wartimeRationing` gates behind having boffins, because it's a boffin-heavy late-Phase-0 economy tool and should feel earned.

---

## 4. Code changes by file

### 4.1 `src/data/operations.js` — add three new initiative definitions

Add these entries inside the `OPERATIONS` object, in the Phase 0 block. Don't forget to update the graph comment at the top of the file.

```js
recruitMathematicians: {
  id: 'recruitMathematicians',
  phase: 0,
  label: 'Recruit Mathematicians from the Universities',
  type: 'infrastructure',
  trigger: { minDrops: 3, minJuniorCalculators: 5 },
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
  trigger: { minHuts: 2 },
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
  trigger: { operations: ['recruitMathematicians'], minBoffins: 3 },
  cost: { data: 500 },
  gates: {},
  result: 'Coffee Rationing infrastructure unlocked · Each rank reduces Billet usage by 15%',
  flavor: "Sugar, tea, and butter on coupons. The Park stretches every ration, and the boffins complain about the tea.",
  effect(state) {
    // Coffee Rationing becomes purchasable — gated via operations.completed in render.js
  },
},
```

Also update the Phase 0 graph comment at the top of the file to include the new nodes.

### 4.2 `src/ui/render.js` — add visibility gates

**Personnel section** (around lines 199–211). Gate the `boffin` row:

```js
html += unitRow(state, 'juniorCalculator', supplyFree, elecFree);
if (state.operations.completed.includes('recruitMathematicians')) {
  html += unitRow(state, 'boffin', supplyFree, elecFree);
}
if (state.operations.completed.includes('formationHut6')) {
  html += unitRow(state, 'sectionHead', supplyFree, elecFree);
}
// ... rest unchanged
```

**Infrastructure section** (around lines 306–308). Gate the canteen and coffee rows:

```js
html += infraRow(state, 'hut');
if (state.operations.completed.includes('messHallConstructed')) {
  html += infraRow(state, 'canteenExpansion');
}
if (state.operations.completed.includes('wartimeRationing')) {
  html += infraRow(state, 'coffeeRationing');
}
```

### 4.3 `src/data/operations.js` — re-check existing trigger values

With boffins now gated, players will reach `formationHut6`'s trigger (`minJuniorCalculators: 3`) before having any boffins. This is fine — `formationHut6` doesn't require boffins. But downstream ops need a mental re-walk:

- `firstManualBreak` — trigger `operations: ['formationHut6']`. No boffin dependency. ✅
- `frequencyAnalysis` — trigger `operations: ['theHerivelTip']`. `theHerivelTip` needs `zygalskiSheets`. No boffin dependency in trigger. ✅
- `conceptualizeBombe` — **has a gate `minBoffins: 5`**. This is still fine because by the time the player can afford 5000 Data + 20000 FLOPs for Conceptualize, they'll have completed `recruitMathematicians` and hired boffins. But verify this assumption during implementation.

No other op has a boffin dependency. DAG remains solvable.

### 4.4 `src/core/state.js` — no change needed

The `ui.showPersonnel` and `ui.showInfrastructure` flags remain unchanged. Sections still appear when appropriate (first drop for personnel; first hire for infrastructure). The *contents* of those sections are what gets gated.

---

## 5. New state / schema changes

**None.** This plan uses the existing `state.operations.completed` array for gating checks, and adds no new state fields. This is the cleanest possible change — no save migration concerns.

---

## 6. Save migration notes

`src/core/save.js` has **no versioning / migration system** — saves are loaded as-is, then top-level keys missing from the save are merged from `createInitialState()` defaults (see `src/core/game.js` init, lines 26–54).

**Impact of this plan on existing saves:** zero. Because we add no new state fields and gate only on `state.operations.completed` (which already exists), saves from before this change load cleanly. If a player already had boffins when they load, their existing boffin count is preserved and the row still renders — **but only if `recruitMathematicians` is also in their completed list**. For saves where the player has boffins without having completed `recruitMathematicians`, the row will be hidden but the counts and FLOPs contribution will still be active in the background.

**Choice point for implementer:** Do you want to auto-grant `recruitMathematicians` (and siblings) to saves where the player already has those units/buildings? Two options:

- **(a) Don't auto-grant.** Existing boffins keep working but can't be added to. Feels punishing for returning players.
- **(b) One-shot reconciliation in `game.js init()`:** after the shallow merge, if `saved.personnel.boffin.count > 0 && !saved.operations.completed.includes('recruitMathematicians')`, push `recruitMathematicians` into `completed`. Same pattern for canteen/coffee. This is 6 lines of code, no save-format bump needed.

**Recommendation: (b).** Code sketch for `game.js init()`, after the existing merges:

```js
// Migration: grandfather unit/infra unlocks for saves from before starter-gating
if (saved.personnel.boffin.count > 0 && !saved.operations.completed.includes('recruitMathematicians'))
  saved.operations.completed.push('recruitMathematicians');
if (saved.upgrades.canteenExpansion > 0 && !saved.operations.completed.includes('messHallConstructed'))
  saved.operations.completed.push('messHallConstructed');
if (saved.upgrades.coffeeRationing > 0 && !saved.operations.completed.includes('wartimeRationing'))
  saved.operations.completed.push('wartimeRationing');
```

---

## 7. ⚠️ Difficulty flags for a dumber model

These are the implementation traps a less-capable model is likely to miss:

1. **`boffin.onBuy` still fires after migration-granted saves.** Boffin `onBuy` reduces `operationCost` by 2% each time. The migration in §6 does NOT re-run `onBuy` for existing boffins — that's correct, because the player has already had those effects applied. A dumber model might try to "apply missed effects" and double-reduce the cost. **Rule: migration only reconciles the `completed` list; never re-run `onBuy`.**

2. **DAG walk must be done manually; there's no automated check.** The file `src/data/operations.js` has a prose graph at the top but no runtime validation that the DAG is solvable. When adding `recruitMathematicians` as a boffin prerequisite, the implementer must mentally walk every op that *uses* boffins (trigger `minBoffins: N`, gate `minBoffins: N`, any code that reads `state.personnel.boffin.count`) and confirm that `recruitMathematicians` is reachable *before* any of them. Currently only `conceptualizeBombe` has `gates: { minBoffins: 5 }` — but check every op in the file by name, don't rely on grep.

3. **The `trigger` evaluator (`src/systems/operations.js :: triggerMet`, lines 11–28) AND-combines all conditions.** `recruitMathematicians`'s trigger `{ minDrops: 3, minJuniorCalculators: 5 }` means BOTH must hold. A dumber model might think it's OR. Test by verifying the op appears only when both thresholds are met.

4. **Supply-cap arithmetic traps:**
   - Start supply cap is 12 (`state.js`).
   - Each JC costs 1 supply.
   - With `minJuniorCalculators: 5` on `recruitMathematicians`, the player needs 5 supply. Fine.
   - After `recruitMathematicians`, buying 3 boffins costs 3×3=9 more supply. That's 5+9=14 needed, vs 12 starting cap. Player must build a Hut (+6 cap → 18) before they can afford the boffins for `wartimeRationing` (`minBoffins: 3`).
   - **Implication:** `wartimeRationing`'s trigger chain implicitly requires at least 1 Hut. That's fine, but the implementer should verify this by hand — off-by-one supply errors are easy.

5. **Don't forget to update the graph comment at the top of `operations.js`.** The prose DAG diagram in the header comment is the single source of truth for "what is the tree shape." If you add three new nodes without updating the diagram, the next developer will misread the tree. This is not runtime-critical, but it's a specific item a dumber model will skip.

6. **Feature interaction with plan 09 (pacing).** Plan 09 raises `minJuniorCalculators` on `formationHut6` from 3 → 10. If plan 07 ships first with `recruitMathematicians` requiring only `minJuniorCalculators: 5`, then plan 09 lands, the triggers stay internally consistent. But if they're shipped together, make sure the two trigger values are chosen as a pair. **Recommendation: ship plan 07 with the values specified here; revisit in plan 09.**

7. **The `effect` fields on the three new ops are intentionally empty.** Unlocking is done by the render-time check on `state.operations.completed`, not by setting a flag. A dumber model may assume each new op needs to set a flag like `state.flags.boffinsUnlocked = true`. Resist this — it's redundant with the completed-list check and adds state surface for no gain.

---

## 8. Verification

### Manual test — fresh save

1. Wipe localStorage (`btn-reset` in dev mode).
2. Reload. Only Junior Calculator is visible in Personnel. Only Hut is visible in Infrastructure.
3. Click COMPUTE until first drop. Personnel/Operations sections appear. `zygalskiSheets`, `formationHut6` trigger conditions check correctly.
4. Hire 5 JCs, get to 3 drops. `recruitMathematicians` appears. Complete it. Boffin row appears in Personnel.
5. Build 2 huts. `messHallConstructed` appears. Complete it. Canteen Expansion appears in Infrastructure.
6. Hire 3 Boffins + complete `recruitMathematicians`. `wartimeRationing` appears. Complete it. Coffee Rationing appears.
7. Verify `conceptualizeBombe` still becomes completable in the normal progression (needs 5 Boffins — still doable).

### Manual test — migrated save

1. Load a save from before this change (use an exported save from the s7 session).
2. Verify all existing personnel counts are preserved.
3. Verify that boffin/canteen/coffee rows are visible (migration in §6 grandfathered them in).
4. Verify `state.operations.completed` has been extended with `recruitMathematicians`, `messHallConstructed`, `wartimeRationing` as appropriate.
5. Verify `operationCost` multiplier is unchanged (no double-application of boffin effects).

### Static checks

- `grep -rn "boffin\|canteen\|coffeeRationing" src/` — verify every place these units/infras are referenced gates correctly.
- Graph comment in `operations.js` reflects the new three nodes.
- No test infrastructure exists in this repo, so manual in-browser verification is the ground truth.
