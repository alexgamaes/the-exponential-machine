# Carrot tuning log — 2026-04-19

Goal: reduce empty-initiative-panel time from **64%** of run to **<10%**.
Constraint: do not alter DAG structure (parent/child dependencies). All other numbers are fair game.

## Current state (baseline)

From `node sim/simulate.js --runs 10 --seed 1 --max 3600`:

- Panel empty: **64.2%** of run (8.5m of ~13.2m run)
- Longest stretch avg: 119s (p90: 2.5m)
- Empty stretches per run: avg 12.9
- Worst single stretch: 2.5m at t=4.8m (seed=6)

## Gap analysis

Biggest inter-op gaps (game-seconds, avg over 10 runs):

| Gap | Transition | Cause |
|---|---|---|
| 126s | afrikaKorps → turingMemorandum | date wait 1941-02 → 1941-10 |
| 96s | battleOfAtlantic → dDayIntel | date wait 1943-05 → 1944-06 |
| 84s | dDayIntel → veDay | date wait 1944-06 → 1945-05 |
| 66s | conceptualizeBombe → afrikaKorps | date wait to 1941-02 |
| 48s | battleOfBritain → conceptualizeBombe | trigger/cost |
| 42s | rotorLogic → battleOfBritain | date wait 1940-07 |

**Four of the top six are date-gate waits.** The primary lever is to move minDate values forward so the game's calendar arrives in step with player progress.

## Tactics in priority order

1. **Shift minDate values earlier** — the single biggest knob. When a date-gated op's date is already past by the time its other trigger conditions are met, the op appears immediately with no wait.
2. **Raise op costs** (`opCostMultiplier` or specific entries) — makes ops sit "unaffordable but visible" longer, filling any remaining small gaps.
3. **Reduce reward slope** (`dropScale`, stream `rewardBase`) only if raising costs isn't enough.

## Attempts

| # | Change | Empty % | Longest | Stretches | Completion | Note |
|---|---|---|---|---|---|---|
| 0 | baseline | 64.2% | 119s | 12.9 | 10/10 | before any changes |
| 1 | compress date gates, lower early minDrops | ~50% | ~60s | — | 10/10 | date waits mostly closed |
| 2 | lower messHallConstructed to minHuts:1 | — | — | — | 6/10 | regressed — agent stuck on turing/bombe huts gate |
| 2c | also lower conceptualize/turing gate minHuts:2→1 | 40.1% | 26.5s | 11.2 | 10/10 | DAG now solvable, flop save-up gaps remain |
| 3 | opCostMultiplier 1.0→1.5 | 0.0% | 0.0s | 0.0 | 0/10 | too harsh — cardIndexEarly unaffordable with 500 cap |
| 4 | opCostMultiplier 1.2 | 35.9% | 25.6s | 10.6 | 10/10 | small improvement, gaps persist |
| 5 | opCostMultiplier 1.35 | 30.9% | 22.4s | 9.8 | 10/10 | incremental; still well above 10% target |
| **6** | **move minDate: trigger → gates (schema change)** | **0.1%** | **0.3s** | **0.1** | **30/30** | **✓ GOAL MET — date-gated ops now visible as carrots with "Available from Aug 1940" blocker** |

## Winning change (Attempt 6)

**Root cause of the 64% empty panel:** `trigger.minDate` kept date-gated ops INVISIBLE until their date arrived. Every Phase 1 op had a date trigger, so after each op completed the panel went empty until the next date hit.

**Fix:** Add `gates.minDate` support to the gate system. An op becomes visible the moment its trigger (ops + counts) is met, and shows "Available from Aug 1940" as the blocker until the date arrives.

**Code changes:**
1. `src/systems/operations.js :: canExecuteOperation` — new branch for `gates.minDate` returning `Available from <Month> <Year>`.
2. `src/data/operations.js` — moved `minDate` from `trigger` → `gates` on all 15 date-gated ops (phase 0 war events + all phase 1 ops).
3. Header comment updated: `minDate` is a gate field, not a trigger field.
4. `hasDateGatedPendingOp` — intentionally NOT extended to gate dates (doing so freezes date at game start when early gated ops are visible, breaking the game).
5. Tests updated to match: visibility asserted via `available`, execution blocker asserted via `canExecuteOperation.reason`.

**Numbers after attempt 6 (30 seeds, same --max 3600):**
- Completed: 30/30
- Panel empty: 0.1% (was 64.2% — 640× reduction)
- Longest empty stretch: 7.2s (at game start, before zygalskiSheets triggers)
- Remaining "bottleneck" gaps (42s frequencyAnalysis → rotorLogicMapping, 34s turingMemorandum → conceptualizeBombe) are flop-save-up intervals during which the NEXT op IS visible — so they don't contribute to empty-panel time.

The existing "The Carrot Principle" UI behaviour (gates render in red inline on visible cards) means the player now always sees a concrete next goal with a concrete unlock reason.

---

# Date realism pass — 2026-04-19 (session 11)

Problem: attempt 6 closed the carrot gaps by compressing Phase 1 dates — but a full playthrough now finished WW2 in **1941**, which breaks the fiction. Flavor text said "D-Day 1944" while the card had gate `1941-03`.

Rule established: **gate dates must be within 1 month of the real historical event** (earlier is fine for pacing, never more than one month). Flavor-text dates are ground truth.

## Changes

1. **All 15 date gates re-tightened** to match real history:
   - Phase 0 war: convoyEscortsRerouted 1939-09, battleOfBritainIntel 1940-06, afrikaKorpsSupplyTracked 1941-01, turingMemorandum 1941-10.
   - Phase 1 ops: installationVictory 1941-09, welchmanDiagonalBoard 1941-10, agnusDei 1941-11, theCilleExploit 1942-01, creationHut3 1942-02, recruitmentFirstWrens 1942-03, operationMincemeat 1943-03, firstNavalEnigmaBreak 1941-06, veDay 1945-04.

2. **Six new filler ops** added to bridge what became a 5-year span in game time (1940→1945):
   | Op | Gate | Role |
   |---|---|---|
   | `battleOfCapeMatapan` | 1941-02 | intelligence event, small stream reward |
   | `sinkingOfBismarck` | 1941-04 | intelligence event |
   | `sharkBlackout` | 1942-08 | Phase 1 drama beat (4-rotor Enigma setback) |
   | `fourRotorBombe` | 1942-12, `minBombes:10` | algorithm unlock |
   | `colossusOperational` | 1943-12 | `state.multipliers.flopsPerSec *= 2` (big FLOPs beat) |
   | `ardennesOffensive` | 1944-12 | war event, feeds veDay |

   `veDay.trigger.operations` rewired from `['dDayIntelligence']` → `['ardennesOffensive']`.

3. **CONFIG.opBaseCosts** extended with the 6 new costs (Cape Matapan 1800, Bismarck 2400, sharkBlackout 9000, fourRotorBombe 13000, colossus 22000, ardennes 40000).

4. **Tests** extended — affordability chain now includes the 6 new ops in `capForOp`; 84/84 still pass.

## Results

30-seed run (seed 42, --max 3600):
- Completed: 30/30
- Panel empty: **0.0%** (p90 5.2s longest stretch)
- Duration: 12.4m
- In-game calendar: Sep 1939 → Apr 1945

Game now feels like a real WW2 arc ending on V-E Day with a ~20 op chain spread across five distinct war years, instead of a compressed Phase 1 ending in 1941.
