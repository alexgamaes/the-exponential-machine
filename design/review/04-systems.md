# 04 — Systems review (engine, data, simulator, docs)

Reviewed against the working tree on 2026-11-08, including the uncommitted edits made during this review
(stage dividers in `createState`/`enterStage`, the text edits in both data files, the 05/06 doc edits).
`npm test`: 20 tests pass, both simulator matrices pass.

Overall: the engine is in good shape. Save/load, the handover, `startAtStage`, hush, dollars and offline progress
all behave correctly in the cases I scripted: 1 h offline while selling 75%, offline through the ending into the
handover, Stage 2 → `next`, then save and load. The serious problem is in the simulator: one of its checks has been
hiding a real quiet stretch in Stage 1.

---

## 1. Simulator logs failed purchases as events, which hides the Stage 1 finale gap. **bug**
`sim/simulate.mjs:208-210`. In the finale, hiring is closed, but `decide()` still calls `E.buyProducer` and
records `ev('buy-producer')` without checking the result, then loops up to 1000 times. In one matrix run that adds
**318,990 fake events**, all in Stage 1's finale. These events count as "something happened", so the
"longest quiet" check never sees the wait between *Read Berlin's orders* and *Win the war*.
With the bug fixed, 3 Stage 1 runs fail: active/people 48 s, average/people 53 s, casual/people 56 s (limit 45 s).
The Stage 1 "longest quiet" column rises from 14–50 s to 32–60 s.

Fix:
```js
    if (s.ops < cost) return;
    if (!E.buyProducer(s, best.id)) return;   // hiring is closed after the goal
    ev('buy-producer', best.id);
```

## 2. The Stage 1 finale wait is too long for "people" players. **inconsistency (pacing)**
`src/data/stage1.js:201` `winWar` cost `1200000` → **`1000000`**. Checked with the fixed sim and
`--data '{"winWar":{"cost":1000000}}'`: every run passes in both matrices. Stage 1 longest quiet is 28–50 s
(normal play ≤ 48 s), and finish times fall by about 0.1–0.2 min. Stage 2 does not change.
Also update `design/05-game-design.md` §9 ("Win the war costs 1.2 million." → "1 million"). Make this change
**together with** #1, or the matrix goes red.

## 3. Saves from the last built stage will not move on when Stage 3 ships. **bug (latent)**
`src/engine.js` `deserialize`: the "finished save moves on" step only runs for `data.version === 1`. A player who
finishes Stage 2 today is saved at `stage: 2, phase: 'next', version: 3`. When Stage 3 exists, that save stays on
the "To be continued" screen forever. Replace the `if (s.stage === 1 && s.phase === 'next') enterStage(s, 2);` line
with a check that does not depend on the version, after the v1 block:
```js
  // A save that finished the last built stage moves on once the next stage exists.
  if (s.phase === 'next' && STAGES[s.stage + 1]) enterStage(s, s.stage + 1);
```
(This keeps the v1 test passing.)

## 4. 2–5 s of progress is dropped whenever a frame is late. **bug**
`src/main.js:40` sends any `dt > 2` to `awayCatchUp`, and `awayCatchUp` (line 27) returns without ticking when
`seconds < 5`. So a 3 s tab switch or a GC pause loses 3 s of production. Fix line 27:
```js
  if (seconds < 5) { E.tick(st, seconds); return; }
```

## 5. The "ledger never goes back in time" check can never fail. **missing simulator check**
`sim/simulate.mjs:136-138`. `addLog` stamps each entry with `max(own date, header date)`, so the stamped dates
always ascend. What can go wrong is a line shown with a later date than its own. I measured that across the
matrix. Most cases are a month or two, which is harmless. The large ones:
- Stage 2: *Doubling every year* (1965-04), *Small computers* (1965-06), *Woven programs* (1966-03), *One family*
  (1964-04), the Cray memo (1964-09) and *every university* (1964-05) are all often bought or fired **after** the Moon
  goal (1966-08), so they show "Aug 1966".
- Stage 1: *American machines* (1943-03), *Tape-reading machine* (1943-06), *Post Office engineers* (1943-12) and
  *Captured codebook* (1942-12) show "Feb 1944" when bought after Colossus.

Suggested check (warn only, no fail): keep a map from text to its data date, and report any line whose stamped date
is more than 12 months after its own date. This is a numbers issue, not an engine one: the late cards stay open
into the finale. For now, record it and leave it.

## 6. Offline money is not reported. **inconsistency**
`src/main.js:29`. While you are away, selling keeps earning money (1 h at 75% earned $90 M in my script), but the
line only says "your lab ran N operations". Fix:
```js
  const d0 = st.dollars;
  const gained = E.applyOffline(st, seconds);
  const earned = st.dollars - d0;
  if (gained > 0) E.note(st, `While you were away (${fmtDuration(Math.min(seconds, CONFIG.offlineMaxSec))}), ${E.phrase(st, 'away', { n: fmt(gained) })}` + (earned >= 1 ? `, and earned $${fmt(earned)}` : '') + '.');
```
Also, `engine.js:488` says `applyOffline` "Returns ops gained". It returns the total made, sold time included.
Change the comment to "Returns the total made (sold time included)."

## 7. The speed line ignores selling. **inconsistency**
`src/ui.js:82` shows `+rate per second` even when 75% is sold, so "You have" grows 4× slower than the line says.
When `E.sellShare(s) > 0`, append the split:
`` `+${fmt(rate,1)} per second (${Math.round(E.sellShare(s)*100)}% sold)   ·   +${fmt(clickValue,1)} per click` ``.

## 8. The card ETA treats clicks as if they were sold too. **polish**
`src/ui.js:156` `income = eff * (1 - E.sellShare(s))`, but clicks are never sold. Use
`rate * (1 - E.sellShare(s)) + (eff - rate)`.

## 9. 06 §2 still says save version 2. **doc stale**
`design/06-stage2.md` §2: "Save version 2; v1 saves are migrated…" → "Save version 3 (adds `dollars` and `sell`;
older saves start with $0 and 25% sold). v1 saves are migrated, never dropped. A finished v1 save opens Stage 2."

## 10. 06 §6 sim numbers are stale. **doc stale**
Current results: smart selling gives 11.1–12.6 min (greedy 14.2–15.4). A player who never touches 25% takes
**12.0–13.4 min** (greedy 13.9–15.6), not "13–14.5". Selling nothing still takes about 27 min (`--stage 2 --sell 0`:
26.7–27.4). Change: "…finishes in 11–13 min (greedy 14–15.5); a player who never touches the default 25% takes
12–13.5 min; selling nothing takes about 27 min."

## 11. 06 §8 and §4 timing. **doc stale**
§8: "normal play at 11.5–12.3 min" → **11.2–12.2 min** (active/average/casual, smart selling; end speed
2.8–3.3×10⁷; longest quiet ≤ 36 s). §4 now says its numbers are from before §6–8, which is fine.

## 12. 06 §1 speedometer numbers. **doc stale**
4.32×10⁸ at the arrival speed of 23,000/s is about 5.2 h, and at the end speed of about 3×10⁷ it is about 14 s.
"~4 h at the start, ~20 s at the end" → "~5 h at the start, ~15 s at the end".

## 13. 05 §3: the Stage 1 end rate is wrong. **doc stale**
The table says `5×10³`. The sim gives 1.9–3.4×10⁴ ("people" ≈ 19,000, "machines" ≈ 26,600). → `2–3×10⁴`.
§4.5 also says "End rate is about 6,600 checks/s" and cites `tools/sim_stage1.py`. The new italic note covers §4.1–4.4
only: extend it to "Tables and figures in 4.1–4.5…".

## 14. `tools/sim_stage1.py` is dead. **dead code**
It is the pre-build Python sim (old ids `pencil`, `bombe`, goal 250,000). `sim/simulate.mjs` replaces it, and
the README does not mention it. Delete it, or move it to `archive/`.

## 15. Stale data-file headers. **polish**
- `src/data/stage1.js:2` "Numbers come from design/05-game-design.md §4" → "Numbers: tuned with sim/simulate.mjs
  (history of changes in design/05-game-design.md §8–9)."
- `src/data/stage2.js:2` "Numbers: design/stage2/04-systems.md" → "Numbers: design/06-stage2.md (changed since
  stage2/04-systems.md)."
- `src/data/stage2.js:18` "(sim: 19,000–27,000 per second…)" → "(sim: 19,000–34,000 per second, 27,000 or less
  outside greedy play; about 0.2 M left over)".
- `src/data/stage2.js:131` "waits for the 1951–52 story lines" is still true (70 s > 64 s), so keep it.

## 16. Duplicate and Stage-1-only engine comments. **polish**
- `engine.js:160` and `:428` are leftover first lines of rewritten comments. Delete both: "Progress towards a
  condition, for "Needs X…"" and "One short-horizon goal for the goal bar. Never null while playing."
- `engine.js:162` "'lifetime' (checks ever made…)" → "(made since this stage began, 'in total')".
- `engine.js:431` "'balance' = checks you have (spendable) · 'lifetime' = checks in total · 'owned'/'clicks' = counts"
  → "'balance' = spendable (finale) · 'lifetime' = made this stage · 'ready'". `currentGoal` no longer returns
  owned/clicks.
- `engine.js:281` "bought one after another with checks" → "…with the stage's unit".
- `ui.js:174` and `:287` mention only Colossus → "the stage goal (when ready), then each finale action".

## 17. Goal-bar code for kinds that no longer occur. **dead code**
After the "goal bar = stage goal only" change, `currentGoal` returns only `lifetime`, `balance` and `ready`. These
are unreachable: `ui.js:204` `owned`/`clicks` TAGS, `:228-230` (segmented bar) and `:232` (goal-target outline).
Removing them, and their CSS (`.segmented`, `.goal-target`), is safe. Removing them is optional; leaving them costs nothing.

## 18. Other dead state. **dead code**
- `s.bestRate` (`engine.js:33`, `:356`) is written but never read. Drop both lines (old saves just carry the field).
- `sim/simulate.mjs:63,70` `unitBefore` / `void unitBefore`, and `:68` `r.carry` (never printed). Delete them.
- `main.js:63` duplicates `mainBtn.classList.add('pressed')` (line 65 re-adds it after `stopHold`). Delete line 63.

## 19. Fragile plural fix in shared UI. **polish**
`ui.js:134` `.replace('1 guesses', '1 guess')` is a Stage 1 hack that would also turn "21 guesses" into "21 guess".
I checked: no Stage 1 output can be an integer ending in 1 except 1 itself, so it is harmless today. Safer:
`.replace(/^Each checks 1 guesses/, 'Each checks 1 guess')`.

## 20. Test gaps. **tests**
Add these (each a few lines):
- **Stage 2 → `next`**: finish Stage 2 (as `finishStage1` does), `passLedger`, then expect `phase 'next'`,
  `legacyRate === rate`, `currentGoal === null`, and the same after serialize → deserialize.
- **Offline while selling**: `startAtStage(2)`, buy Magnetic tape, sell 75%, `applyOffline(3600)`. Expect dollars ≤
  demand × price × 3600 and spendable ops = 25% of the total made.
- **v2 → v3 load**: a save without `dollars`/`sell` loads with `dollars 0`, `sell 0.25`.
- **Card text matches effect** (both stages): for `producerMul`/`globalMul`, the text contains `twice` (value 2) or
  `${value}×`; for `costGrowth`, it contains `${Math.round((value-1)*100)}%`; for `priceMul`, it contains `${value}×`. All
  current texts pass. I checked every card and option by hand: they match their effects.
- Optional simulator check: serialize → deserialize the state once a minute and keep playing. This catches save
  bugs (Infinity, missing fields) in the real flow.

## 21. Stage 2 choice ids reuse Stage 1's names. **polish (note only)**
`stage2.js` Washington options have ids `machines` (= Defence money, price ×1.5) and `people` (= Space money,
cheaper computers). The sim's `--choice machines` therefore means "Defence money" in Stage 2. Renaming would orphan
saved `choices`, so keep the ids. Add a comment above the options:
`// ids match Stage 1's so the sim's --choice flag covers both stages: machines = Defence, people = Space.`

---

## Nothing to fix
- **Handover / finale:** speed is exact across `passLedger`, production pauses on the handover screen, and hiring
  stops after the goal. Upgrades stay buyable in the finale, which is consistent in both stages. The new bridge line
  and stage dividers are correct, and the v1 migration still works (its `enterStage(s, 2)` without a bridge is right,
  because a v1 save already has the ENIAC line).
- **startAtStage:** gives the same state as a real handover. The `over` options and the sim's `--stage/--legacy/--carry` work.
- **Hush:** it blocks reveals, beats and customers. Offline ticks respect it.
- **Dollars:** paid = min(offered, demand) per tick, also in 28.8 s offline chunks. Selling closes at the goal.
  Dollar cards and producers use `wallet`/`pay` everywhere.
- **Card texts vs effects:** all 29 cards, goal texts and choice options match their numbers.
- **README** matches the scripts.
