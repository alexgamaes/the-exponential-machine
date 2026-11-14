# Stage 3 redesign: a better new mechanic (senior game designer, Nov 13)

Answers `10-redesign-brief.md`. Proposal only: nothing in `src/` or `sim/` was changed. Numbers come from a throwaway copy
of the real engine and sim with the new mechanic built in (see §6).

## 1. Why the price tag fails as gameplay
- **The decision has one right answer, and it is easy to work out.** `sold = min(capacity, demand(P))`, `dollars += sold × P`.
  Once capacity runs out, every price that still sells out places the same number of computers, so the best price is
  simply "the highest one that still sells out". That makes it a thermostat: you check it now and then, you don't play it.
- **You can't see the result.** Changing the price changes two rates, and the screen shows the money one. Nothing
  happens on screen when you click: no event, no spike, no ledger line. Nothing pays off.
- **A mistake costs a fixed share of income, and in a growing stage that costs almost no time.** The stage grows
  ×7×10⁴ in ~12 min, so its income grows about 1.55% a second. Losing 20% of income for good costs ln(1.25)/0.0155 ≈ **14 s**.
  For a lazy player to lose ≥15% (~110 s), they have to fall about **5× behind** by the end. So the decision has to change
  **how fast you grow**, not how much you earn. A wrong price only lowers the level, which is why the sim found just 3–9%.
- It also feels like Stage 2 again: a 4-way switch on a flow.

## 2. Concepts (1971–84)
| # | Concept | Pitch | Recurring decision | What you see | Different from 1 and 2 because | Lazy player loses by | Engine cost |
|---|---|---|---|---|---|---|---|
| A | **The next model** (Moore's clock) | The lab is always designing your next computer. It gets better along an S-curve, up to a limit the current chip allows. You choose when to **launch** it. Every computer sold keeps the speed of the model it was sold as. Old models stay in homes and keep counting. | Launch now (a small jump, but sooner) or wait (a bigger jump, but slower and slower gains, and sales of the old model fade) | A lab bar filling toward a limit marker, "1.6× as fast as Model 3", sales of the current model visibly falling, a launch spike and a ledger line | It's about timing, a small "prestige" inside the stage. Nothing is split or priced. You cash in progress the world makes for you | Launching at every chance (too many small jumps) or waiting for the limit both lower the **growth rate** of model speed, so you fall further behind every minute | Medium-small: 4 state fields, 1 action, 2 effect types |
| B | **Markets fill up** | Each market (hobbyists, schools, accountants, families, offices) is a pool that fills on an S-curve. Your factories serve one market at a time. | Which market to serve: fast-filling hobbyists, well-paying offices, or families that spread word of mouth | A fill bar per market. Sales stall when the one you serve is full | It's an allocation with a wall | Never switching: the market fills up and sales stop | Medium. Risk: a selector, so close to the price switch |
| C | **Clones and the price war** | Rivals copy your model after N seconds and take buyers. You answer by launching or cutting the price. (1982–83: Commodore v. TI.) | Answer the clone, or ride it out | A rival line eating your sales | An opponent that reacts | Ignoring rivals: your share shrinks | High (rival AI, hard to tune). Its useful core is "sales fade", which A already includes |
| D | **Chips get cheaper** | Workbench and factory prices fall by half every ~90 s (Moore's law on costs). | Buy capacity now at a high price, or wait for it to get cheaper | Price tags ticking down | A falling cost is new to the game | Buying at once: you overpay (only a fixed share, so a weak penalty) | Small, but weak and invisible |
| E | **The club: share or sell** | You share designs with the club (word of mouth grows, but rivals copy faster) or keep them closed. | Toggle open/closed over time | Word-of-mouth line growing | Social growth | Leaving it closed | Small. It's a switch, the same complaint again |
| F | **The killer program** | The grandson writes programs. Each one makes certain models "must-buy". | Which program to fund | A program list | Software | Funding nothing | Medium. It is Stage 4's subject: don't spend it here |

## 3. Pick: A, "The next model", with sales that fade (the useful core of C)
Why A: it is the subject of the stage and of the whole game (Moore's law: the machine you can build keeps getting better,
and the skill is knowing when to ship it). It is a decision you make 8–9 times, each with a visible payoff (a launch spike,
a ledger line, the "newest model" number jumping). The sweet spot moves as chip cards raise the limit. Mistiming changes
your **growth rate**, so lazy play loses real time (§5). It is also not a switch: it is a button you time, like the
Paperclips probe launch or quantum chip, not a setting.

**Computers in homes stay, and become the payoff.** Every home keeps the model it bought, so your installed base is a
stack of generations. Old Model 1s still count, which explains why speed never drops. Launching early or late shows up
in that stack. The "Computers sold" row says: "Computers in homes: 132,000. Your newest model is 107× as fast as your first."

**The price tag goes.** Every computer sells for a fixed $1,000 (× effects). Money still comes from sales and still builds
workbenches and factories. One decision on screen is enough.

### 3.1 State (saved; save version 5)
`model` (number on sale, starts 1) · `modelSpeed` (speed of the model on sale, relative to Model 1; starts 1) ·
`modelAt` (when it launched) · `homeWork` (Σ computers sold × the speed of their model) · `homes` (count, kept for beats).

### 3.2 Formulas (per tick, only while `phase === 'playing'`, like selling today)
```
age      = time − modelAt
limit    = 1.8 + Σ labMax effects                         (the most the current chip allows over the model on sale)
p        = age / (65 × √(limit − 1))                      (design takes longer when the leap is bigger)
labRatio = 1 + (limit − 1) × p³ / (1 + p³)                (S-curve: slow start, fast middle, flattens at the limit)
fresh    = 0.25 + 1.25 × 0.5^(age / (45 × fadeMul))       (1.5 at launch, fades toward 0.25: "everyone who wanted one has one")
demand   = (Σ arrived markets + 0.0015 × homes) × fresh   (computers a second; no price term)
sold     = min(capacity, demand)
homes   += sold × dt;   homeWork += sold × modelSpeed × dt;   dollars += sold × 1000 × priceMul × dt
speed    = legacy + homeWork × 35,000 × homeMul × globalMul
Launch (button, allowed when labRatio ≥ 1.2 and you own a workbench):  modelSpeed ×= labRatio;  model += 1;  modelAt = now
Auto-launch: when labRatio ≥ 1 + 0.9 × (limit − 1), the engineers ship it themselves (plus a ledger line).
```
The best moment to launch is when ln(labRatio)/age stops rising (where a line from the origin touches the S-curve). In plain
words: **launch once the lab bar starts slowing down.** Sales fading below what the factories can make is a reason to launch a bit earlier.

### 3.3 Starting numbers (prototype values)
| Thing | Value |
|---|---|
| Home output (Model 1) | 35,000 ops/s (was 50,000) |
| Price per computer | $1,000 |
| Lab | base limit 1.8×, time 65 s × √(limit−1), shape p³, launch allowed from 1.2×, auto-launch at 90% of the way |
| Sales fade | ×1.5 at launch, half-life 45 s, floor ×0.25 |
| Factories | output 10, cost growth 1.10 (was 20, 1.06): fewer homes, because model speed now carries more of the growth |
| Markets, word of mouth, workbenches, goal 7×10¹³, finale | unchanged (`elasticity` removed) |

Card changes (names, dates, ledger lines unchanged unless stated):
| Card | Now | New effect (card text) |
|---|---|---|
| Eight bits (1972) | homes ×1.5 | Lab limit +0.4 → 2.2. "Your next models can be up to 2.2× as fast as the one on sale." |
| A language for kits, A floppy disk drive ($), A spreadsheet, Games at home, A whole river in 4K, A spreadsheet that draws | homes ×1.5 / ×1.25 | **Every computer already in a home** works 1.2× faster ("software reaches every home"). This keeps hardware (new sales) and software (all homes) apart, and sets up Stage 4. |
| The $25 chip (1975) | workbenches ×1.5 | Lab limit +0.6 |
| Chips for everyone (1980) | factories ×1.5 | Lab limit +0.6 |
| Rubber keys (1982) | homes ×1.5 | Lab limit +0.6 (limit 4.0, or 4.4 with Closed) |
| **Open or closed** | demand ×1.5 / money ×1.5 | **Open: eight slots:** other people build add-ons, so each model stays wanted twice as long (fade half-life ×2). **Closed: one sealed box:** you design every part, so lab limit +0.4. Open: launch less often, for sales. Closed: wait for bigger leaps. |
| Magazine cover, Computers in a box, Computers for offices, For the masses ($) | | unchanged |

### 3.4 Phase-in over ~12.5 min (smart bot, average player)
| Time | What happens |
|---|---|
| 0:00 | Panel "Your computer" from the first frame: Model 1 on sale, the lab bar at 1.00×. "Eight bits" raises the limit to 2.2×. The Legacy row still carries the speed. |
| ~0:25 | Lab passes 1.2×: **Launch Model 2** lights up. |
| 0:58 | First smart launch (1.43×): the sales spike, a ledger line, the "newest model" number. A lazy player's engineers ship it at ~2:30, with the line "Your engineers stop waiting for you and ship Model 2 themselves." That line teaches the mechanic to anyone who missed it. |
| 1:00–3:30 | A launch every ~60 s at ~1.4×. Clubs and shops arrive. Sales fade matters here because buyers ≈ capacity. |
| 3:24 | The $25 chip: the limit marker jumps to 2.8× in the middle of a design (surprise; the best moment moves later). |
| 4:52–6:00 | Factories, then Open or closed. Supply jumps, so buyers now wait for computers and fading matters less: wait for the curve. |
| 5:41–10:47 | Launches every ~90–100 s at 2.0–2.4× (limits 3.2 → 3.8 → 4.4). The best ratio has moved from 1.4× to 2.4×. |
| ~12:00 | Goal "A computer in every home". Sales and launches stop (as selling stops today). Petrov, then the finale, unchanged. |

### 3.5 Screen (replaces "Sell computers", same slot, same height in every state)
```
YOUR COMPUTER
 On sale: Model 3, 1.4× as fast as Model 2.
 Selling 410 a second (900 at launch: everyone who wanted one has one).
 In the lab: Model 4, 1.6× as fast.   [█████████████░░░░░░│░░]  limit 2.8×
 Getting better fast.                                   [ Launch Model 4 ]
```
- The lab line and the sales line update once a second, rounded to 2 digits (no flicker). The bar fills smoothly, like the goal bar.
- The status line has four fixed texts: "Just started" · "Getting better fast" · **"Slowing down"** (from the best moment
  on) · "Nearly at the chip's limit: your engineers will ship it soon". It says where the curve is, not what to do.
  Playtest it. If it makes the choice too easy, drop "Slowing down" and let the bar's shape speak.
- The button is disabled below 1.2× and says why ("The lab needs a 1.2× better model first"). No confirmation.
- Launch payoff: the sales line jumps to its launch number, one ledger line per model (era flavour: the wooden case, colour,
  the floppy, the portable, 16 bits…; plot to write ~10), and the "newest model" number in "Computers sold" changes.

### 3.6 Story beats, cards, goal
Beats keep their conditions (`homes` counts still work, about 5× smaller at the end: 170,000 instead of 775,000, so the
"half a million" beat would never fire: move it to 150,000 and reword it, "A hundred and fifty thousand of your computers…"). Promotions, goal, finale, Petrov,
handover: unchanged. The Cray-1 beat still fires on speed. Selling stops at the goal, so the last model stays on sale.

## 4. How the sim bot plays it
`wantLaunch(s)` (sibling of `choosePrice`), called each decision tick:
1. Not before 1.2× or without a workbench.
2. If buyers are below 70% of capacity (sales faded) and the lab has passed 35% of its range, launch.
3. Otherwise launch when ln(labRatio)/age starts falling (compare now with 1 s later).
While it wants to launch, it doesn't spend money (launching is free; this only keeps the bot simple). New flag
`--launch smart|eager|ratio:X|cap:X|fade|never`. `npm test`'s second run becomes `--launch never --sell 0.25` (the lazy player).

## 5. Prototype results (6 profiles × 2 choices, real engine copy; minutes for Stage 3 alone)
| Player | Closed | Open | Launches | vs smart |
|---|---|---|---|---|
| **Smart** (rule §4) | 12.2–12.4 | 12.4 | 8–9 | — |
| Best fixed rule (always at 1.8×) | 12.2–12.4 | 12.2–12.4 | 8 | ±0% |
| Always at 1.5× / 2.2× | 12.6–12.7 / 12.8–13.0 | 12.6–12.7 / 12.9–13.2 | 11 / 6 | +3% / +5% |
| Only when sales fade | 12.5–12.8 | 13.7–13.9 | 5–7 | +2–12% |
| **Eager** (launches whenever the button lights) | 14.8–15.3 | 14.7–15.2 | 18–20 | **+21–24%** |
| **Lazy: never touches it** (engineers ship at 90%) | 15.3–15.5 | 15.1–15.3 | 4 | **+24–25%** |
| *Today's price tag: smart / never touches / best fixed* | *11.9–12.1 / 13–14 / 12.5–13* | | | *+10% / +3–9%* |
All smart runs pass (window 10–15 min, longest quiet ≤ 31 s). Lazy runs finish but sit just above the 15-min window
(which is right for a lazy player). End speed 3.4–4.0×10¹² (target ~2×10¹²; see §7).

**Honest caveat:** the sweet spot is wide. "Launch at about 1.8×" does as well as the smart rule, because near the best
moment the curve is flat. The decision punishes extremes, not small errors. I think that is right for this game: the skill
is reading the curve and coming back on time, and a player who works out "about 2×, a bit more later" has solved it a
little, which is the fun. If the build wants the best moment to move more, use §7's levers.

## 6. Engine, sim, UI cost
- **Engine** (`src/engine.js`): `market.kind = 'models'` beside `'sell'`/`'price'`; `labRatio`, `freshness`, `modelFlow`,
  `canLaunch`, `launchModel`, auto-launch in `tick`; effects `labMax` (adds) and `fadeMul`; `getRate` uses `homeWork` for this
  kind; `passLedger` zeroes `homeWork`; save v5 (a v4 Stage 3 save gets `model 1`, `modelSpeed 1`, `homeWork = homes`). The
  price code can go once Stage 3 no longer uses it. About 60 lines.
- **Data** (`src/data/stage3.js`): market block (§3.3), card effects (§3.3), ~10 launch ledger lines, the beat threshold change.
- **Sim**: `wantLaunch`, `--launch`, the money-saving guard. **UI**: the panel in §3.5 replaces the price switch; "Computers sold" gains the newest-model line.
- Prototype (throwaway): `/private/tmp/claude-501/-Users-gama-Documents-personal-the-exponential-machine/b48c323b-86b4-4cb4-a356-d9493ec755d3/scratchpad/proto/`
  (`final.sh` prints the table above; patches in `D6.json` plus the market flags in `final.sh`).

## 7. Risks and tuning levers
- **End speed is 2× the target** (3.4–4×10¹²). Levers: the last two software cards 1.2 → 1.1, or home output 35,000 → 25,000
  with the goal kept; re-run the sim.
- **8–9 launches** is the floor for "again and again". For more, shorten the lab time (65 → 50 s) and lower the limits
  (start 1.6×). The jumps get smaller, though, so less visible.
- **To make the best moment move more:** bigger limit steps late (Rubber keys +1.0), or a "price war" card (1983) that halves
  the fade half-life, so the last minutes reward launching sooner.
- The "Slowing down" hint may solve the problem for the player; keep it a playtest question (§3.5).
- Card ETAs are already pessimistic while speed grows; launches make growth lumpier. Same fix as today: acceptable.
