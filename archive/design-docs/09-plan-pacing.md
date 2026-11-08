# Plan 09 — Economy Pacing Tightening (Redesign #1)

> **Order:** This plan ships **last**, after 07 (starter gating) and 08 (war narrative). It cleans up the economic hygiene that remains after those two plans have widened the DAG and added narrative beats.

---

## 1. Goal

After plans 07 and 08 ship, the DAG has more nodes and war events give flavor-heavy, small mechanical rewards. The remaining pacing problem is pure economic: once the player has a handful of boffins and a few reward-multiplier ops, costs collapse and everything becomes buyable in seconds. This plan caps the runaway multipliers, raises the milestone thresholds on existing Phase 0 triggers, and scales up Phase 1 op costs so that each purchase feels like a saving arc rather than a click.

This is the thinnest of the three plans. That is intentional — the heavy lifting happens in 07 (new content) and 08 (new content + emotional stakes). #1 is hygiene.

---

## 2. Current behaviour

### Runaway multipliers

**`operationCost` multiplier** (target: should stay near 1.0 through normal play):

- Floor is `0.1` in two places:
  - `src/data/units.js:26–27` — boffin `onBuy` does `Math.max(0.1, state.multipliers.operationCost - 0.02)` on every hire.
  - `src/data/operations.js:139` — `firstManualBreak.effect` does `Math.max(0.1, state.multipliers.operationCost - 0.05)`.
- No cap on how many boffins contribute. Session 7 save had `operationCost: 0.47` with 24 boffins (firstManual: −0.05, then 24 × −0.02 = −0.48 → clamped to 0.47). All Phase 1 ops end up at ~47% of sticker price.

**`algorithmCostMult`:**
- `frequencyAnalysis.effect` (operations.js:171) multiplies `state.flags.algorithmCostMult` by 0.8. Currently used once only. Floor is implicit (never goes below 0.8). Not a runaway today, but worth noting so a dumber model doesn't add more −20% stacks.

**Reward multipliers** — handled by plan 08's reward-budget discipline. No changes in this plan to `dataPerDrop`, `searchSpeed`, `bombeOutput`.

### Trigger thresholds

From `src/data/operations.js`, Phase 0 triggers are currently:

| Op | Trigger | Reachable at |
|---|---|---|
| `zygalskiSheets` | `minDrops: 1` | ~30 seconds of clicking COMPUTE |
| `formationHut6` | `minJuniorCalculators: 3` | ~2 min (3 × ~10 Data each) |
| `formationHut8` | `minDrops: 5` | ~2 min |
| `firstManualBreak` | `operations: ['formationHut6']` | seconds after above |
| `theHerivelTip` | `operations: ['zygalskiSheets']` | seconds after above |
| `recruitFirst50` | `operations: ['formationHut6'], minJuniorCalculators: 10` | ~3 min |
| `cardIndexEarly` | `operations: ['recruitFirst50']` | seconds after above |

Everything cascades. By the 3-minute mark the player has triggered 5+ ops.

### Phase 1 costs

| Op | Current Data cost | Effective cost at `operationCost=0.47` |
|---|---:|---:|
| `installationVictory` | 2000 | 940 |
| `welchmanDiagonalBoard` | 800 | 376 |
| `agnusDei` | 1200 | 564 |
| `theCilleExploit` | 1200 | 564 |
| `creationHut3` | 600 | 282 |
| `recruitmentFirstWrens` | 500 | 235 |
| `firstNavalEnigmaBreak` | 3000 | 1410 |
| `cardIndexFull` | 5000 | 2350 |

With a `dataCap` of 2500 (cardIndexEarly × 5 = 2500), a single capped drop already covers most of these.

---

## 3. Target behaviour

### Multiplier caps

- **`operationCost` floor raised to 0.7.** Ops cannot be discounted below 70% of sticker price. This keeps discounts meaningful (you feel the −2% from boffins and the −5% from `firstManualBreak`) without collapsing costs entirely.
- **Boffin's `−2%` effect caps at the first 10 boffins.** After boffin #10, further boffin hires contribute FLOPs but not operationCost reduction.
- `algorithmCostMult` is untouched (it's fine as a single one-time effect).

### Milestone thresholds raised

After plans 07 and 08 land, the Phase 0 tree has ~16 ops. We want the first 3–4 to trigger in the first 2 minutes, and the rest to space out over 10–15 minutes of active play. Concrete raises:

| Op | Old trigger | New trigger |
|---|---|---|
| `zygalskiSheets` | `minDrops: 1` | `minDrops: 3` |
| `formationHut6` | `minJuniorCalculators: 3` | `minJuniorCalculators: 8` |
| `formationHut8` | `minDrops: 5` | `minDrops: 15` |
| `recruitFirst50` | `minJuniorCalculators: 10` | `minJuniorCalculators: 20` |

Plan 07's three new ops (`recruitMathematicians`, `messHallConstructed`, `wartimeRationing`) are already thresholded appropriately; plan 09 does not retouch them.

Plan 08's war events already use `minDrops` + `minDate` combinations that work at the new cadence; plan 09 does not retouch them.

### Phase 1 costs raised

| Op | Old Data cost | New Data cost | Rationale |
|---|---:|---:|---|
| `installationVictory` | 2000 | 6000 | The first real Phase 1 purchase; should require ~2 capped drops at post-cardIndexEarly. |
| `welchmanDiagonalBoard` | 800 | 3000 | A ×10 multiplier should cost a significant saving arc. |
| `agnusDei` | 1200 | 4000 | |
| `theCilleExploit` | 1200 | 4000 | |
| `creationHut3` | 600 | 2500 | |
| `recruitmentFirstWrens` | 500 | 2000 | |
| `firstNavalEnigmaBreak` | 3000 | 10000 | A narrative-adjacent op (could be retagged `warEvent` in a future pass; not in this plan). |
| `cardIndexFull` | 5000 | 15000 | Big cap unlock, should require intentional build-up. |

Phase 0 op costs are **not raised** in this plan. They're already small, and plans 07 and 08 added 3 + 4 Phase 0 ops whose costs are appropriately scaled.

---

## 4. Code changes by file

### 4.1 `src/data/units.js` — boffin `onBuy` cap

Current (lines 24–28):
```js
onBuy(state) {
  state.flags.boffinsReduceOpCost += 1;
  state.multipliers.operationCost = Math.max(0.1,
    state.multipliers.operationCost - 0.02);
},
```

New:
```js
onBuy(state) {
  state.flags.boffinsReduceOpCost += 1;
  // Only the first 10 boffins reduce operationCost
  if (state.personnel.boffin.count <= 10) {
    state.multipliers.operationCost = Math.max(0.7,
      state.multipliers.operationCost - 0.02);
  }
},
```

**Critical:** the `count` check must happen AFTER `buyUnit` in `src/systems/resources.js` has incremented the count. Verified: `buyUnit` increments count at line 111, then calls `unit.onBuy(state)` at line 113. So `count === 1` at the time of the first boffin's `onBuy`, `count === 10` at the time of the 10th boffin's `onBuy`. The check `count <= 10` correctly allows boffins 1–10 to contribute and blocks boffin 11+. Off-by-one verified.

### 4.2 `src/data/operations.js` — `firstManualBreak` floor

Current (line 139):
```js
state.multipliers.operationCost = Math.max(0.1, state.multipliers.operationCost - 0.05);
```

New:
```js
state.multipliers.operationCost = Math.max(0.7, state.multipliers.operationCost - 0.05);
```

Also: plan 08's `operationMincemeat` already uses `Math.max(0.7, ...)` per §4.2 in that plan. If plan 08 shipped first, this is already consistent.

### 4.3 `src/data/operations.js` — raise Phase 0 triggers

Edit the four entries noted in §3:

- `zygalskiSheets.trigger`: `{ minDrops: 1 }` → `{ minDrops: 3 }`
- `formationHut6.trigger`: `{ minJuniorCalculators: 3 }` → `{ minJuniorCalculators: 8 }`
- `formationHut8.trigger`: `{ minDrops: 5 }` → `{ minDrops: 15 }`
- `recruitFirst50.trigger`: `{ operations: ['formationHut6'], minJuniorCalculators: 10 }` → `{ operations: ['formationHut6'], minJuniorCalculators: 20 }`

### 4.4 `src/data/operations.js` — raise Phase 1 costs

Edit the eight `cost.data` values per the table in §3. Exact locations — each op has a `cost: { data: N }` or `cost: { data: N, flops: M }` line:

- `installationVictory.cost.data`: 2000 → 6000
- `welchmanDiagonalBoard.cost.data`: 800 → 3000
- `agnusDei.cost.data`: 1200 → 4000
- `theCilleExploit.cost.data`: 1200 → 4000
- `creationHut3.cost.data`: 600 → 2500
- `recruitmentFirstWrens.cost.data`: 500 → 2000
- `firstNavalEnigmaBreak.cost.data`: 3000 → 10000
- `cardIndexFull.cost.data`: 5000 → 15000

FLOPs costs (where present) are not changed. Currently only `frequencyAnalysis`, `rotorLogicMapping`, and `conceptualizeBombe` have FLOPs costs — none of them are Phase 1.

### 4.5 No other files change

`src/ui/render.js`, `src/systems/*`, `src/core/*` are unchanged. This is purely a data/balance patch.

---

## 5. New state / schema changes

**None.** All changes are to existing fields and effect functions.

---

## 6. Save migration notes

### Multiplier floor change (§4.1, §4.2)

An existing save has `state.multipliers.operationCost` already clamped at whatever the old 0.1 floor allowed. Session 7's save was at `0.47` — below the new 0.7 floor. Choice:

- **(a) Grandfather:** leave `0.47` alone. The new floor only kicks in on the *next* mutation (next boffin hire up to #10, or completing `firstManualBreak` if not yet done). Simple. No migration code.
- **(b) Clamp on load:** in `game.js init()`, after merges, clamp `saved.multipliers.operationCost = Math.max(0.7, saved.multipliers.operationCost)`. Undoes the player's progress.

**Recommendation: (a).** The pacing fix is aimed at new players and fresh saves; punishing existing players for discounts they already earned feels worse than just letting their old save run at `0.47`. If the implementer later decides to enforce the clamp, they should bump `SAVE_KEY` to `tem_save_v2` at the same time so saves are snapshot-versioned.

### Trigger threshold raises (§4.3)

Ops that are already `completed` in a save remain completed. Ops currently in `available` remain available (they were pushed by the old threshold and no code removes them when thresholds change). **Only ops that had not yet triggered** will see the new (higher) threshold.

For most existing saves, the Phase 0 tree is already fully unlocked, so this is a no-op. For a save that was paused mid-Phase-0, the player may see a previously-expected op (e.g., `formationHut6`) disappear temporarily until they hire more juniors — this is an acceptable transient. No migration needed.

### Phase 1 cost raises (§4.4)

Pure data change. Cost is read at execute time via `getOperationCost()` (`src/systems/operations.js`:46). Existing saves with Data in hand will just see more expensive ops.

**No save format changes. No `SAVE_KEY` bump needed.**

---

## 7. ⚠️ Difficulty flags for a dumber model

1. **Boffin cap check must be after the count increment, not before.** The `onBuy` function in `units.js` runs *after* `buyUnit` does `state.personnel[unitId].count += 1`. So inside `onBuy`, the count reflects the boffin just purchased. The check `if (state.personnel.boffin.count <= 10)` correctly includes boffins 1 through 10 and excludes 11+. A dumber model may:
   - Write `< 10` (excludes boffin #10) — wrong.
   - Write the check at `buyUnit` level (before increment) — wrong place; the `count` there is pre-increment so the check is off-by-one.
   - Try to "be clever" and cap by capping the multiplier — misses the fact that the flavor says "first 10 boffins" which is about *which hires contribute*, not about a total multiplier cap.
   **Rule: the check sits inside `boffin.onBuy`, using `state.personnel.boffin.count <= 10`. Nothing fancy.**

2. **Two places use `Math.max(0.1, ...)` — update both.** `src/data/units.js:26` and `src/data/operations.js:139`. Missing one means the floor is inconsistent. A dumber model may find one with grep and update it but miss the other. **Rule: grep `Math.max(0.1,` inside `src/` and expect exactly two hits before edit, zero hits after.**

3. **Plan 08 already writes `Math.max(0.7, ...)` in `operationMincemeat.effect`.** If plan 08 shipped first (the intended order), this value is already correct and does not need updating. A dumber model may see the inconsistency with the rest of the codebase and "fix" it to `0.1` — wrong direction. **Rule: the target is `0.7` everywhere.**

4. **Grandfathered saves are load-bearing.** The recommendation in §6 is *not* to clamp existing saves to the new floor. A dumber model will reach for the "correct" clamp because it looks neater. This is a product judgment, not a code-quality judgment. **Rule: do NOT add `saved.multipliers.operationCost = Math.max(0.7, saved.multipliers.operationCost)` in `init()` unless the plan is explicitly updated to require it.**

5. **Supply cap still matters after threshold raises.** Raising `minJuniorCalculators` on `formationHut6` from 3 → 8 means the player needs 8 Billets for juniors before this op triggers. Starting Billets cap is 12. Player can support 8 juniors + ~1 boffin (if plan 07 is already live, boffin isn't unlocked until `recruitMathematicians` is done). Player does NOT need a Hut for `formationHut6` under the new threshold. But for `recruitFirst50`'s new threshold of 20 JCs: 20 Billets > 12 cap. The player must build at least 2 Huts (+12 Billets → 24 cap) first. Verify this is reachable — huts are already available from game start. ✅

6. **Reward scaling was fixed in session 7 (DROP_SCALE 1.08 → 1.02); don't re-touch.** A dumber model may see `DROP_SCALE = 1.02` in `src/systems/search.js` and, not knowing the history, "restore" it to 1.08 or raise it "to match the harder costs." This would undo the session-7 fix and re-break the reward-vs-cap ratio. **Rule: `DROP_SCALE` is not in scope for this plan. Do not touch `src/systems/search.js`.**

7. **Phase 0 op costs are NOT changed.** Only Phase 1 costs go up. A dumber model, seeing the "raise costs 3–5×" guidance in the session-7 feedback, may raise Phase 0 costs as well. Phase 0 is already gentle enough after plans 07 and 08 widen the tree. **Rule: only the eight ops in §4.4 have their costs changed.**

8. **No schema changes — resist the urge to refactor.** This plan is a pure numeric patch. A dumber model may see that several ops use `Math.max(K, ...)` patterns and try to extract a helper `applyMultiplierDelta(state, key, delta, floor)`. Don't — it's premature abstraction, and session rules in `CLAUDE.md` forbid introducing abstractions beyond what the task requires. **Rule: no new functions, no new files.**

9. **This plan assumes 07 and 08 have shipped.** The trigger thresholds here (`minJuniorCalculators: 8` on `formationHut6`) assume the player has options to burn time on while accumulating (plan 07's new ops, plan 08's war events). If shipped in isolation, the higher thresholds would feel punishing. **Rule: do not ship 09 before 07 and 08.**

10. **Log any rebalance the player sees as "nerfs" clearly.** When this plan ships, players with active saves will see their Phase 1 op costs jump 3–5×. Consider (not required by this plan) pushing a one-time log message via `pushLog()` in `init()` the first time a save is loaded after the update. This is optional but nice to have. A dumber model will either skip this entirely or over-engineer a version-tracking system — both wrong. If in doubt, skip it.

---

## 8. Verification

### Manual test — fresh save

1. Wipe save, reload. Start game.
2. Click COMPUTE until 3 drops. `zygalskiSheets` now appears at drop 3, not drop 1. Confirm.
3. Hire junior calculators until 8; verify `formationHut6` appears at 8, not 3.
4. Complete the Phase 0 tree naturally. Track `state.multipliers.operationCost` in the DevTools console:
   - Expect 1.0 at start.
   - After `firstManualBreak`: 0.95.
   - After buying 1 boffin: 0.93.
   - After buying 10 boffins: 0.75 (0.95 − 0.20).
   - After buying the 11th boffin: still 0.75 (cap kicked in).
   - After buying 30 boffins: still 0.75.
5. Enter Phase 1 (via plan 08's `turingMemorandum` if 08 is live). Verify `installationVictory` costs 6000 Data at sticker, 4500 after `operationCost=0.75`.

### Manual test — migrated save from s7

1. Load session-7 save (`operationCost: 0.47`, 24 boffins, all Phase 0 done).
2. Verify `operationCost` stays at `0.47` (grandfather path).
3. Buy one more boffin. Verify `operationCost` does NOT change (count is already > 10).
4. Verify Phase 1 ops now show the raised sticker costs. `cardIndexFull` shows 15000 × 0.47 = 7050 effective.
5. Verify gameplay still progresses to V-E Day on the raised costs.

### Static checks

- `grep -rn "Math.max(0.1," src/` → expect zero matches after edit.
- `grep -rn "Math.max(0.7," src/` → expect three matches: `units.js`, `operations.js :: firstManualBreak`, `operations.js :: operationMincemeat` (from plan 08).
- `grep -n "cost: { data:" src/data/operations.js` → verify all eight Phase 1 cost lines match the new values.
- `grep -n "minDrops\|minJuniorCalculators" src/data/operations.js` → verify the four threshold changes land and nothing else was touched.

### Feel check

After the full stack (07 + 08 + 09), time from fresh save to Phase 0 → 1 transition (`turingMemorandum`) should be in the 15–30 minute range for an attentive player, not 5 minutes. If it's still under 10 minutes, the implementer should flag it and either raise thresholds further or reduce reward multipliers — both in a follow-up plan, not by patching this one in place.
