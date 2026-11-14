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
| The choice | Historian: "Two letters from Washington" (1958); plot: "Payroll for a tea company" | Washington. Defence money = customers pay 1.5× more (§6); Space money = computers cheaper. The tea company stays as a story line. |
| Turing | Plot: hold everything ~20 s either side | The death beat has `hush: 25` (no cards, no other lines for 25 s after it); it comes 12 s after a purchase, and no other line is scheduled in the 12 s before it. Never attached to a purchase or reward. |
| Numbers | Systems | Adopted (15 upgrades, 2 producers, ×3 goal, finale 200 M / 400 M, click = 5% of legacy), then changed after review: goal 1.3 billion, no click upgrades at all (§5, §8), mainframes paid with money (§6). |
| Speedometer | Plot / historian: the weather | "Forecasting tomorrow's weather": ENIAC needed ~24 h at ~5,000/s, so the task is 4.3×10⁸. ~5 h at the start, ~15 s at the end. "As fast as N ENIACs". |
| Look | UX §1 / §1b | Adopted: `body.era-1946` palette (teal accent, machine-room green-grey, manila panels), light and dark, 0.6 s cross-fade, punch-card corners, condensed headings. |

## 2. Engine changes (all stages)
- `passLedger` folds the rate into `legacyRate`, then `enterStage(n+1)` if it exists (otherwise `phase = 'next'`).
- `stageStart` — every condition, the goal bar and the total line count from the start of the stage.
- Production pauses on the "Pass the ledger on" screen.
- `clickLegacyFrac`: a click is a share of the carried speed.
- `unitName(s)` (rename beat), `roleName(s)` (promotions), `phrase(s, key)` (all era text lives in stage data).
- Beats: `kind`, `hush`; condition `legacyTimes` (speed ≥ k × legacy).
- Synergy is data (`stage.synergy`), not hard-coded to clerks.
- Save version 3 (money and the sell share added); older saves are migrated, never dropped. A finished v1 save opens Stage 2.

## 3. Screen
- Under the counter: "Made since 1946: N". Once selling opens, "Money" becomes a second counter beside "You have" (until then "You have" stays centred); dollar prices carry the money swatch. The "Sell computer time" panel sits under "Your lab" (§6).
- Layout (all stages, `design/review/05-ux-layout.md`): on a laptop the ledger is a full-height column on the right that scrolls on its own; below 1024 px it sits under the button at a fixed height. Goal numbers sit on their own line, and the lines under the counter keep their space, so the button never moves.
- Ledger divider "Stage 2 · The computing lab", then the ENIAC line (Stage 1's last word) and the opening line. Stage 1 has its own divider at the very start.
- "Your lab" panel: a fixed **Legacy** row ("Bletchley Park, 1939–45 · N per second, forever.") above the producers.
- "Made since 1946: N" replaces "Checked in total" (it matches the goal bar).
- Rename: the word next to the counter is struck through, then replaced and underlined for 3 s; everything else swaps in the same frame. The number is never touched. Screen readers get one announcement.
- The UI forgets every element of the old stage on a stage change.

## 4. Verified
`npm test`: 20 tests, then the simulator twice (smart selling, and a player who never changes the 25% setting). Numbers below are from before §6–8; the current ones are in §8. `node sim/simulate.mjs` plays Stage 1 → 2 end to end, 6 profiles × 2 choices:
Stage 2 takes 11.2–13.1 min (normal play 11.5–12.8), longest quiet stretch ≤ 41 s, speed never drops (including
across the handover), the ledger never goes back in time, the unit changes once. End speed 2.2–3.2×10⁷.

## 5. Clicks fade by design
At realistic click rates (2.4/s falling to 0.9/s), clicking adds 60% → 14% of the speed over Stage 1's first 3 minutes,
15% → 10% in Stage 2's, then 3–5%. Automation is the point, so click upgrades belong only at the start of a stage.
Late click upgrades were replaced: "A logbook for faults" now makes computers 1.25× faster, and "Space money" makes
computers cheaper. (Current timings: §8 and §9.)

## 6. Selling computer time (the Stage 2 mechanic)
Proposals: `design/stage2/10-innovation-brief.md` and 11–14. All four designers converged on selling machine time;
the open question was whether a sale pays money or a permanent boost. **Decision: money.** A boost would be
another "×1.5 faster" behind a timer (the very complaint), and "selling" without money would make the name lie.
Money gives a new decision instead of a new multiplier: two balances fed by one flow, and you choose the split.

- **Opens** with "Magnetic tape" (1951), with the first customer (Census Bureau) and the promotion to Head of computing services.
- **Control:** "Sell: 0% · 25% · 50% · 75%" of your computer time (starts at 25%). Sold operations still count for the
  Moon goal, so the goal bar and speed never slow; they become dollars instead of spendable operations.
- **Customers** (ledger lines, named in the panel) each add demand: Census Bureau, tea shops, an insurer, a bank,
  an airline, every university. Customers pay $0.10 per operation, only up to their demand; offering more earns nothing,
  and the panel says so. So the best setting changes as customers arrive and as you save for operation-priced cards.
- **Money buys** mainframes ($600,000 × 1.2ⁿ) and the "Time-sharing" card. Defence money now means "customers pay 1.5× more".
- **After the goal** selling stops: every operation goes to the Moon (the 1202 ending line then describes what you did).
- **Sim:** a bot that compares what each currency buys finishes in 11–13 min (greedy 14–15.5); a player who never
  touches the default 25% takes 12–13.5 min; selling nothing takes about 27 min (mainframes need money).

## 7. Dev tools
On localhost only, the footer shows "Dev: Start Stage 1 · Start Stage 2". A stage start uses `startAtStage(n)`, which
plays the real handover with what a typical player carries (`stage.arrival`: 23,000 per second, 200,000 in hand).
The simulator's `--stage 2` uses the same function.

## 8. No click upgrades in Stage 2
"Hire programmers" (was: each click counts twice, unlocked by 15 clicks by hand) now makes computers 1.25× faster and
unlocks with the first computer. Stage 2 has no click upgrades at all: clicks are worth 5% of the legacy and fade as machines grow.
The goal rose to 1.3 billion operations to keep normal play at about 11.3–12.3 min.

## 9. Housekeeping review (Nov 2026)
Four reviews in `design/review/01–04` (historian, plot, UX, systems). Applied: date and fact fixes in both stages (Flowers'
proposal Mar 1943, Kennedy's speech, Sputnik, the 1202 timing, SRI, Wisconsin, Churchill's red label, Herivel 21, Moore's five
points, Katherine Johnson named); "This time, we were fast enough."; the insurer after the Turing quiet; Turing named in 1950;
the ENIAC line now sits under the Stage 2 divider, and Stage 1 has its own divider; "Programmers wanted", "Weather forecasts";
customer names read as a sentence; no confirm() pop-up on reset (press twice); keyboard repeat throttled to 6/s; goal numbers
in words ("1.30 billion"); locked cards always say why; phone buttons wrap cleanly; speed line shows "(25% sold)"; money
earned while away is reported; late frames no longer lose time; finished saves move on when the next stage ships.
The simulator no longer counts failed purchases as events (that hid a 48–56 s wait in Stage 1's finale), so
"Win the war" now costs 1 million (was 1.2). Current sim, normal play: Stage 1 9.9–12.8 min, Stage 2 11.3–12.3 min,
longest quiet ≤ 48 s (casual, limit 50).
