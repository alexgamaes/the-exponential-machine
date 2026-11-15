# Stage 3 "the garage" as a min-maxer plays it (critique of 31, Nov 14)

Target: `31-game-design.md` with the designer's prototype. Copy with extra bots and switches:
`/private/tmp/claude-501/-Users-gama-Documents-personal-the-exponential-machine/bed73f35-54f7-453b-ba4c-4a3b9d14ca06/scratchpad/s3critic/`
(`sim.mjs` = prototype + bots, `sim_war.mjs` = + rival price / parts cost / elasticity, `batch.mjs` runs a list).
All numbers are 5 seeds, `final.json`, minutes to the end of the stage, Closed unless noted.

## 0. A bug first: every number in 31 §5–6 is ~6% too fast
The bot's buy loop pays `Math.min(factoryCost, benchCost)` but gets whatever is cheaper *per computer*. Late on it
buys a $50 M factory for the price of a $3 M workbench (12 factories at 11 min with $2 M in the bank). Fixed:
smart **13.30 Open / 13.10 Closed** (31 says 12.48 / 12.29). Naive gaps shrink: fixed price +13/+18%, chips when
empty +14%, no adverts +21/+30%, lazy +116/+139%. Also: 31 says Open is "+1% per 1,500 homes", the sim uses 1,000.

## 1. The solved guide (fits on an index card)
> Click the build button for the first 30 seconds. Buy an advert whenever you can afford one, then the cheapest
> builder per computer. Keep the warehouse at about 2 seconds of building (re-balance after every purchase).
> Keep ~10 s of chips; ignore the chip price, the "cheap" tag, the glut and the warnings. Buy every card at once. Closed.

That bot finishes in **12.18 Closed / 12.38 Open**, 7% ahead of the designer's "smart" bot (13.10). Nothing in it
changes during the stage, and every line is a tracking rule, not a choice.

**Why price is a tracking task, not a decision.** Buyers = `market × $1,000 / price`, so whenever the warehouse
is not empty, money per second = buyers × price = **market × $1,000, whatever the price**. Hence:
- Above the price that clears the warehouse: same money, fewer homes. Below it: same homes, less money.
  The best price is exactly the clearing price, always. There is no money-vs-homes trade-off anywhere in the loop.
- Money comes only from adverts and buyer cards. Factories never raise income (they lower the clearing price).
- Any stock in the warehouse is pure loss (delayed homes), so every warehouse-based twist (Osborne, Christmas rush,
  stockpile-then-dump) is dodged by the same rule "keep it at zero". Tested: no stockpile policy beats it.

| Price policy (bot sets price = clearing × k, no feedback) | k=0.75 | 0.9 | **1.0** | 1.1 | 1.25 | 1.5 | fixed $400 |
|---|---|---|---|---|---|---|---|
| Minutes (Closed) | 15.14 | 14.01 | **13.12** | 13.92 | 14.19 | 15.46 | 15.43 |

So price matters (~6% per 10% off), but has one answer, and the warehouse prints it.

## 2. Dominant strategies and exploits
| Thing | Measured | Verdict |
|---|---|---|
| Adverts before factories | ad budget share 0 / 0.1 / 0.25 / 0.5 / ≥2: 17.02 / 14.31 / 13.60 / 13.10 / **12.57** | "Buy every advert" dominates (doubling cost stops it on its own). Ads are the *only* money engine (§1). |
| Never click the build button | **17.63** (+34%); stop after 30 s: 13.26; hold 6/s all stage: 12.86 | Opening cliff: 30 s of clicks decide 4.4 min. Clicking later is worth ≤2%. |
| Price extremes, hoard-and-dump | k=0.6: 18.98, k=1.5: 15.46; stock then dump never pays | No exploit; the identity in §1 forbids it. |
| Hoarding chips at the start | $1,300 = 13 chips, trend halves every 230 s | No exploit. |
| Workbenches vs factories | "cheapest per computer" is the only rule; no benches after factories: same 13.10 | No choice. |
| Open vs Closed | Closed −1.5% (smart and min-max). Open wins only for bad play (fixed price −3%, no ads −5%) | Coin flip with a slight right answer. A min-maxer always picks Closed. |
| Cards | cost operations, which buy nothing else, in a fixed chain | Buy on sight. Cards 20% cheaper: −7%, so ops gate the stage. |

## 3. Dead systems (<3% whichever way played) and chores
| System | Test | Effect |
|---|---|---|
| Chip price wobble | wobble off | **−1%** (faster: dip-buying wastes money) |
| Buying on dips / "Cheap" tag | dips ignored | **−1%** (faster) |
| Both chip shortages | removed | **0.1%**; ignoring the 20 s warning: +0.3% |
| Chip glut | removed | **0.0%** |
| How many chips you hold | 5 s … 60 s of stock | within 1% |
| Chips at all | chips free / chips 2× price | −6% / +5% |
| Second shortage (1981) | 5,000-chip crate every 15 s = 333/s vs ~390/s used | barely rations |

The chip *market* is dead. What remains of chips is an attention tax: "buy one batch 3 s after running out" costs
+14%, all of it reaction latency. **Chores:** chip buying peaks at **48 clicks/min at minute 8** (31/min at minute 6)
until *Standing order* (10:00). Price: a ×2 buyer card means **14 presses of Raise**; the smart bot presses a price
button 48 times a minute, the exact-clearing bot ~16 (one 5% step every ~4 s). Both are the same rule repeated.

## 4. Does the price feel alive?
Clearing price, smart play: $400 → 141 → 300 → 326 → 698 → 225 → 136 → 194 → 353 → 355 → 758 → 1,181 → 372
(start of each minute). About 20 one-click steps a minute, 28 direction changes in the stage. A human will see it
move. But **every move is caused by the player's own last purchase** (factory −1–2%, advert +25%, buyer card ×2,
For the masses −50%); between purchases it sits still (only Open's slow drift). It reads as "re-balance after
shopping", not as a market. And the story's falling price is not there: it ends *higher* than it starts.

## 5. Twists: what can bite at all
A structural law first, measured by forcing shocks into the sim:

| Shock | at 5 min | 7 min | 9 min | 11 min |
|---|---|---|---|---|
| Building ×0.3 for 60 s | +1.8% | +2.5% | +3.3% | +1.8% |
| Operations ×0.5 for 60 s | +1.3% | +1.7% | +1.3% | +2.6% |
| Money ×0.25 *from then on* | +17% | +8.6% | +3.0% | +0.5% |

**Any 60-second event is worth ≤3%, and any money effect after minute ~9 is worth ≤1%.** Speed does not compound
on itself (homes don't make homes); finish time is set by when the last chip cards and factories land. So:
- **Designer's chip shortages (1979, 1981):** 0.1%. Dead by construction, not by tuning.
- **Plot's price war as written (rival from 1982 ≈ minute 10.3, $595 → $99):** 0% for good play (it only melts
  money, and late money is dead). With a parts cost per computer it is a cliff, not a choice: $40–100 changes
  nothing; $150 soft-locks Closed (never finishes: no cash for chips or the $4 M advert); $200 soft-locks both.
- **Same rival moved to minute ~7 (on *A spreadsheet*), $595 × 0.85 every 20 s, floor $99, buyers × (R/p)³ above R:**
  good play +2% ($0 parts) / +7% ($60 parts) / +15% (steeper k=8); fixed price **+84%** (23.9 min). Started at
  *Sixteen bits* (8.7 min): +1–3%, fixed price +23%. The good player's rule stays "keep the warehouse at zero".

So the price war beats the shortages on two counts: it is **persistent** (not a 60 s event) and it makes the price
**move by itself** (a step every 20 s you did not cause), which is exactly what §4 lacks. On its own it is not a new
decision for a min-maxer. It becomes one only if price stops being unit-elastic (§6, change 2).

**Recommended single twist: the price war, as the moment buyers start comparing prices.**
- Before it (clubs, shops, offices): buyers = `market × ($1,000 / p)^0.7`. Dear prices still sell; raising the price
  raises money but loses homes. That is the trade-off the loop is missing.
- From 1982 (calendar re-mapped so it starts at ~minute 7–8, e.g. on *Games at home*): a rival price `R` on the
  price line, `R = max($99, $595 × 0.85^⌊t/20 s⌋)`; families: buyers `× (R/p)^3` above R, exponent 1.0.
- Log: "Texas Instruments: $199." each step; the price tag shows `Rival $299` in a fixed cell.
- Guards: no per-computer cost below `0.6 × $99`; the finale advert must not be payable only in money during the war
  (both soft-lock in the sim otherwise).

Prototype (`sim_war.mjs`, exponent 0.7 → 1.0 at the war on *A spreadsheet*, no parts cost, not re-tuned):
| Price policy | Closed | Open |
|---|---|---|
| Clear the warehouse always (today's rule) | 17.87 | 18.26 |
| Charge 2.5× clearing until minute 3, then clear | **15.01** | 15.41 |
| … until minute 5 | 15.28 | 15.64 |
| … until the war | 16.75 | 17.23 |
| 2.5× until the war + adverts first | 15.79 | 16.26 |
The best policy now *changes during the stage* (charge dear while cash-starved, then flood), costs 16% if you never
skim and 12% if you skim too long, and the warehouse piling up becomes a cost you choose. Risk: with both exponents
tested (0.5, 0.7) the best switch was minute 3–5, so "skim 4 minutes" could become the new index-card line; it holds
only if the right moment follows your cash (skim while you can't afford chips) rather than the clock. Needs
re-tuning (market, goal) to land at 12–14 min again; not done.

## 6. Changes, ranked (impact ÷ complexity)
1. **Fix the bot's buy bug, re-run the tables** (trivial, required). All of 31 §5–6 shifts by 6–7%.
2. **Make early buyers inelastic (exponent ~0.7), families elastic (1.0) from the price war.** One exponent per buyer
   group. Breaks the "money = market × $1,000" identity: price becomes money-vs-homes, the warehouse becomes a choice,
   the optimum changes mid-stage (§5: 15.0 vs 17.9 min). Highest impact for the least code.
3. **Price war as the twist, starting minute 7–8, persistent rival price** (formulas §5). Makes the price move on its
   own; punishes autopilot (+23–84%); the story's "money melts, homes stay". Replace the chip shortages with it.
4. **Cut the chip market's fake decisions** (wobble, "cheap" tag, glut, second shortage: each ≤1%, dip-buying is
   negative). Keep chips as a stock that runs out. Or give them stakes: halve the price fall (half-life 230 → 450 s)
   so chips stay 15–30% of the computer price and the war squeezes margins.
5. **Kill the chip chore before it peaks:** *Standing order* by *Chips by the tray* (minute ~3) or a "keep 10 s"
   setting; today 48 clicks/min at minute 8 for a 1% decision.
6. **Price buttons:** hold-to-repeat, or Raise/Lower at 10% when the step would take >5 presses (a ×2 card = 14).
7. **Adverts:** cost ×3 per level (not ×2), or they only add families after the war. Today "adverts first" wins by 4%
   and they are the only source of money.
8. **Opening:** start with one workbench. Never clicking costs 34%; clicking after 30 s is worth ≤2%. An idle opener
   should lose a little, not crawl for 4 minutes.
9. **Open or closed:** acceptable as a style choice (1.5%). If kept, tie Closed to the war (own chip plant: parts cost
   ×0.5, as Commodore owned MOS) so the 1977 choice is tested in 1982. Fix the 1,000 vs 1,500 mismatch.
