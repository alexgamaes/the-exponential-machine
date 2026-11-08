# Stage 2 — The Computing Lab (1946–1971): merged design

Lead designer's merge of `design/stage2/01-historian.md`, `02-plot.md`, `03-ux.md` and `04-systems.md`.
Brief: `design/stage2/00-brief.md`. This file is the source of truth for Stage 2; `src/data/stage2.js` implements it.

## 1. Decisions taken in the merge
| Question | Proposals | Decision |
|---|---|---|
| Who you are | Historian: the same Bletchley veteran, sworn to secrecy, in an unnamed lab | Adopted. Role "Director of a computing lab", promoted to "Head of computing services" (Magnetic tape) and "Director, computing division" (Chips). |
| Goal and finale | Historian A: goal = Moon computer, finale = Apollo 8, Apollo 11. Plot: goal at Apollo 8, finale = landing, splashdown | Historian A. The landing is the last click; the plot's three landing lines become the finale log plus the first two ending lines, so they arrive 4 s apart. "Bring them home" is dropped (one finale action fewer to wait for). |
| When "checks" become "operations" | Systems 0:35–0:55; plot ~2:50; historian at Shannon (Jul 1948) | Shannon beat, 8 s after "Programs in memory" (1948-06): about 1:30 for normal play. |
| Second producer | Historian: transistor mainframes unlocked in 1956 | Unlocked by "Magnetic tape" (UNIVAC, 1951), named just "Mainframes", so 1951–54 history fits between cards. First producer is plain "Computers" (valves are named in the log, so later upgrades to computers are not anachronistic). |
| The choice | Historian: "Two letters from Washington" (1958); plot: "Payroll for a tea company" | Washington. Defence money = mainframes cheaper; Space money = computers cheaper. The tea company stays as a story line. |
| Turing | Plot: hold everything ~20 s either side | The death beat has `hush: 25` (no cards, no other lines for 25 s); it comes 12 s after a purchase. Never attached to a purchase or reward. |
| Numbers | Systems | Adopted (15 upgrades, 2 producers, ×3 goal, finale 200 M / 400 M, click = 5% of legacy), then changed after review: goal 900 M, and no click upgrades after the first minute (see §5). |
| Speedometer | Plot / historian: the weather | "Forecasting tomorrow's weather": ENIAC needed ~24 h at ~5,000/s, so the task is 4.3×10⁸. ~4 h at the start, ~20 s at the end. "As fast as N ENIACs". |
| Look | UX §1 / §1b | Adopted: `body.era-1946` palette (teal accent, machine-room green-grey, manila panels), light and dark, 0.6 s cross-fade, punch-card corners, condensed headings. |

## 2. Engine changes (all stages)
- `passLedger` folds the rate into `legacyRate`, then `enterStage(n+1)` if it exists (otherwise `phase = 'next'`).
- `stageStart` — every condition, the goal bar and the total line count from the start of the stage.
- Production pauses on the "Pass the ledger on" screen.
- `clickLegacyFrac`: a click is a share of the carried speed.
- `unitName(s)` (rename beat), `roleName(s)` (promotions), `phrase(s, key)` (all era text lives in stage data).
- Beats: `kind`, `hush`; condition `legacyTimes` (speed ≥ k × legacy).
- Synergy is data (`stage.synergy`), not hard-coded to clerks.
- Save version 2; v1 saves are migrated, never dropped. A finished v1 save opens Stage 2.

## 3. Screen
- Ledger divider "Stage 2 · The computing lab", then the ENIAC line and the opening line.
- "Your lab" panel: a fixed **Legacy** row ("Bletchley Park, 1939–45 · N per second, forever.") above the producers.
- "Made since 1946: N" replaces "Checked in total" (it matches the goal bar).
- Rename: the word next to the counter is struck through, then replaced and underlined for 3 s; everything else swaps in the same frame. The number is never touched. Screen readers get one announcement.
- The UI forgets every element of the old stage on a stage change.

## 4. Verified
`npm test`: 17 tests. `node sim/simulate.mjs` plays Stage 1 → 2 end to end, 6 profiles × 2 choices:
Stage 2 takes 10.2–14.2 min (normal play 11.6–13.6), longest quiet stretch ≤ 41 s, speed never drops (including
across the handover), the ledger never goes back in time, the unit changes once. End speed 1.5–2.9×10⁷.

## 5. Clicks fade by design
At realistic click rates (2.4/s falling to 0.9/s), clicking adds 60% → 14% of the speed over Stage 1's first 3 minutes,
15% → 10% in Stage 2's, then 3–5%. Automation is the point, so click upgrades belong only at the start of a stage.
Late click upgrades were replaced: "A logbook for faults" now makes computers 1.25× faster, and "Space money" makes
computers cheaper. Normal play takes 11.5–12.8 min.
