# Stage 2 — one new mechanic: the systems view

Angle: mechanics. Every candidate adds a **second thing to manage**, not a bigger multiplier. In each one the goal
("Run 900 M operations in total") still counts *every* operation run, so the new system changes how fast speed grows
and can never make the goal bar or the speed number go down. None of them pays for clicking faster.

Numbers for A were checked with a scratch copy of the real engine and simulator (`/private/tmp/claude-501/…/scratchpad/proto`,
about 40 lines added to `engine.js`, a rent policy added to the bot). Nothing in `src/`, `sim/` or `tests/` was edited.

---

## A. Machine time for hire (a second currency: dollars)

**History.** 1951–64 is when computing becomes a business: the Census Bureau's UNIVAC, LEO pricing a tea company's cakes,
IBM *renting* 701s by the month, bank cheque sorting (ERMA, 1959), airline seats (SABRE, 1964). The lab pays for its
big machines by selling machine time.

**What the player sees.** "Magnetic tape" (≈3:40) opens a **Machine time** panel with one 4-step control:
`Rent out: 0% · 25% · 50% · 75%` (starts at 25%), and two plain lines:
"Clients pay for up to 250,000 operations per second. You offer 90,000." and "+$9,000 per second".
A dollar balance sits under the operations counter. **Mainframes cost dollars** ("$600,000"); computers and most upgrades
still cost operations. A few cards cost dollars (Time-sharing, later ones).

**State.** `rent ∈ {0, .25, .5, .75}`, `dollars`. Stage data: `rent: { price, reveal, clients[] }`; producers/upgrades get
an optional `currency: 'dollars'`. Each client is `{ name, when, demand }` and adds to the demand cap when its condition is met.

**Formulas (per tick).** `R` = speed (unchanged), `f` = rent share, `D` = sum of active clients' demand, `p` = $0.10 per operation.
```
lifetime += R·dt                 (all operations count for the Moon, rented or not)
ops      += (1 − f)·R·dt         (spendable operations)
dollars  += p · min(f·R, D)·dt   (operations offered above demand are run but unpaid)
```
Mainframe: $600k × 1.2ⁿ (= today's 6 M operations at p). Defence money becomes "Clients pay 1.5× more" (`rentMul`).

**The decision.** Operations buy computers and upgrades; dollars buy mainframes. Renting more grows mainframes faster but
starves the upgrade cards; renting more than clients want is waste. The right setting moves: it jumps each time a client
arrives (tea company, insurer, bank, airline, every university — each a ledger line) and when an operations card is
pending. This is Paperclips' wire/autoclipper loop: two balances, one flow, you choose the split.

**Bot.** At each decision, pick `f` maximising `vc·(1−f)·R + vm·min(f·R, D)`, where `vc` = best computer output per
operation and `vm` = mainframe output per dollar ÷ p; weight a currency ×1.5 while a card in that currency is waiting.
Buy mainframes with dollars, everything else as today.

**Prototype (average profile, both choices).**
| Rent policy | Stage 2 time | note |
|---|---|---|
| 0% always | 26–27 min | no mainframes: the panel cannot be ignored |
| 25% fixed (the default; idle play) | 14.3–15.1 min | safe, slow |
| 50% fixed | 12.2–13.3 min | |
| 75% fixed | 12.6–14.3 min | over-renting: demand-capped, upgrades starve |
| Smart bot | 11.2–13.6 min (all 6 profiles) | best |

So the choice is worth about 2–3 minutes of a 12-minute stage: it matters, it is not a trap. The default (25%) keeps idle
players inside 15 min. Longest quiet stretch in the prototype was 61–67 s around 6:30 (the Washington card waits while
the bot rents); the six client lines are not yet logged in the prototype and are exactly what fills it. Tune with `delay`.

**Cost.** Engine ~50 lines (`rent`, `dollars`, `currency` on items, `rentDemand`, `rentMul`, save v3 with defaults).
UI: one panel (segmented control + 2 lines), a dollar line under the counter, "$" on card costs and ETAs that use the
dollar rate. Sim: rent policy ~20 lines, plus a test that rent=0 cannot finish and rent=0.25 does. **About 1 day.**

**Risks.** Two currencies on one screen (keep dollars visually secondary). The player hinted the stock market belongs to
the 90s: this is not a market, just selling time, and it sets up money for later stages.

---

## B. Engineers or scientists (grant allocation, Paperclips' Trust → processors/memory)

**History.** NSF (1950), ARPA (1958) and its computing office (1962): the post-war split between building machines and
doing computer science.

**Loop.** At each stage-total milestone (×2.2 apart, about one per minute, 10 in the stage) the lab receives **a grant**:
a card with two buttons, *Engineers* or *Scientists* (reuses the existing choice card). Engineers: everything works
+12% per engineer. Scientists: each produces 1 **idea** per second. The 15 upgrade cards cost **ideas**, not operations
(10, 15, 22 … ≈×1.5); producers still cost operations.

**Decision.** Engineers pay now; scientists pay through the ×1.5 cards later. Too few scientists and the cards stall;
too many and speed lags. Bot: give the grant to scientists if the next card's idea-ETA > 30 s, else engineers.

**Pacing.** Grants are lifetime milestones, so they arrive on time whatever you choose; a stalled card is visible
("needs 40 ideas, 25 s"). Removes the "save operations for a card" tension, which may make the producer side too simple.

**Cost.** Engine ~50 lines (grants, ideas balance, `currency: 'ideas'`). UI: reuse choice card, one counter line.
Data: re-price all 15 upgrades. **About 1 day**, plus a rebalance of every upgrade cost.

**Risks.** Abstract (ideas are not a 1950s thing a player can picture); does not change *what* the cards do, so the
"X works 1.5× faster" complaint survives.

---

## C. Mission control (risk/reward, 1958–69)

**History.** Vanguard explodes on the pad (1957); Rangers 1–6 fail before Ranger 7 photographs the Moon (1964);
Glenn will not fly until Katherine Johnson checks the numbers (1962); the 1202 alarm.

**Loop.** After "Chips", a **Missions** panel shows the next mission (Ranger, Surveyor, Lunar Orbiter, then crewed
Mercury/Gemini, then the finale's Apollo 8/11). A mission saves a **check budget** out of operations automatically
(a set share of income, like A). Chance of success `P = 1 − 0.5^(checks / H)`. The player picks when to launch with one
control: `Launch at 70% · 90% · 99%`. Success: a permanent reward (e.g. everything ×1.2) and the next mission.
Failure (uncrewed only): half the checks are kept ("we learned"), relaunch 15 s later. **Crewed missions always need
99%** — "No one flies on a guess" teaches the rule in one line.

**Decision.** Risk appetite: expected cost at 70% ≈ 2.1 H, at 90% ≈ 3.4 H, at 99% ≈ 6.6 H — gambling is cheaper on
average but can fail twice in a row. Bot: fixed policy per profile; run 20 seeds each.

**Cost.** Engine ~80 lines (missions, check pool, seeded RNG in the save, auto-launch, outcomes). UI: mission panel
(progress bar, chance %, selector, result line). Sim: seeds and variance. **About 2 days.** Replaces the late ×1.5 cards.

**Risks.** Randomness makes stage time vary (needs a pity rule: third attempt always succeeds); failure feels bad;
only the second half of the stage gets it; it pre-empts the finale's drama.

---

## Recommendation: A, Machine time for hire

It is the only one that changes *how you play* for most of the stage (3:40 to the goal, ~8 minutes), not just what a card
says. It is the true story of the era (computers became a business by renting time), it answers the player's "add
money" directly, and it gives later stages a currency to build on. It is deterministic, so the bot plays it exactly
and the 12–15 min window holds (prototype: 11.2–13.6 min smart, 14.3–15.1 min at the untouched default). It cannot
reward clicking: clicks only add operations. The new verb is "choose the split", revisited each time a client arrives,
which also gives the middle of the stage its ledger events. Build cost is about a day. C is a good candidate for a
smaller version later (one Ranger gamble in the 1960s) once A is in.
