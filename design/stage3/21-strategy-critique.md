# Stage 3 as a min-maxer plays it (critique, Nov 13)

Built version: `07-stage3.md` §9 ("launch the next model"). All numbers: `node sim/simulate.mjs --stage 3`, average
profile, plus a scratch copy of the sim with an extra policy `frac:X` (launch when the lab is X of the way to its limit)
and counters for how often buyers outnumber what you can make. Nothing in `src/` or `sim/` was changed.

## 1. What actually wins

**Launch timing** (Closed; Open within 0.1 min everywhere):

| Policy | Finish | Launches |
|---|---|---|
| launch at 45–55% of the lab's limit | **12.8 min** | 7–8 |
| smart bot ("Slowing down" label) | 13.0 | 8 |
| fixed 1.8× | 13.0 | 8 |
| 30% / 65% of the limit | 13.3 / 13.2 | 10 / 6 |
| 75% / 85% of the limit | 14.0 / 15.2 | 5 |
| never (engineers ship at 90%) | 16.2 | 4 |
| at every chance (1.2×) | 16.4 | 20 |

The optimum is **flat**: anywhere from 30% to 65% of the limit is within 4%. Both extremes cost ~27%.

**The player's feedback is right: the stage is supply-bound.** Share of time when buyers outnumber what you make:
68% overall, **92% once factories exist, and 100% from minute 7 to the end** (smart play). At the end, buyers ~1,500/s
against 600 you can make. Even at the fade floor (×0.25), buyers exceed supply. So:
- **The buyer fade does nothing.** With the fade removed entirely (`--market '{"surge":1,"fadeFloor":1}'`) the
  smart player finishes in 12.9 min (vs 13.0). Never-fading buyers: 12.7. The chart the stage is built around is
  decoration for the last half of it.
- So launching has **no cost** except restarting the lab's curve. The launch decision is pure arithmetic on the
  S-curve: maximise ln(leap)/time. The best leap is ~55% of the way to the limit (1.5× at limit 1.8, 2.0× at 2.8,
  2.5× at 4.0), which is exactly when the lab label turns "Slowing down". **The game prints the answer.**
- Eager play loses not because buyers fade but because the early S-curve is slow: at 1.2× the speed of your models
  doubles every ~160 s; at the best moment, every ~85–118 s.

**Everything else** (all with the best launch policy):
- Workbench vs factory: no choice. Factories (10/s, +10%) beat workbenches (1.5/s, +30%) from the first one; the
  bot buys whatever is cheapest per computer, which is the only sensible rule. Money is never short for long: the
  player ends with $1–9 M unspent.
- Open vs Closed: 12.9 vs 12.8 min. Open's "buyers stay twice as long" is worth nothing because buyers are never the
  limit. Closed's +0.4 limit is worth ~1%. A coin flip with a slight right answer.
- Chip cards (+0.6 limit each): removing all three costs **2%** (13.1 vs 12.8). A bigger limit also makes the lab
  slower (time × √(limit − 1)), which cancels most of the gain. Buying one early in a design even makes the lab's
  ratio drop for a moment (hidden, confusing).
- "For the masses" (factories ×1.5 for $30 M): 1%. Half-price factories: 12.4 min (3%).
- Card order: none. Cards cost operations; operations buy nothing else. Buy each when affordable.
- Clicking: casual, average, active and idle profiles all finish 12.8–13.0. Attention does not matter.
- Where the time goes: at the end, the last two models hold 90% of all home output (Model 7: 33%, Model 8: 58%).
  Early models, homes counts and word of mouth are noise.

## 2. The solved guide (fits on an index card)

> Buy every card when you can. Spend all money on whatever builds the most computers per dollar (factories, once you
> have them). Launch when the lab says "Slowing down" (about halfway to its limit). Pick Closed. That's it:
> 12.8 min, and the next best idea is 1% behind.

## 3. Where depth is missing

**One answer per decision**
- Launch timing: one rule, and the UI's phase label already is that rule.
- Workbench vs factory, card order, Open vs Closed, spending money: all have one dominant answer or none that matters.

**Systems that do not touch each other**
- Supply never meets demand, so the buyer fade, the surge, word of mouth, new customer groups and Open's bonus are all
  inert after minute 7. The money loop (sales → factories) is a straight line with no choice in it.
- Cards (paid in operations) and producers (paid in money) never compete for the same resource.
- Chip cards and launches barely interact (2%), and when they do it is a hidden glitch, not a plan.

**Costs the player cannot see**
- The cost of an early launch (a smaller leap and a reset S-curve) appears nowhere; the ledger just says "1.2× as fast".
- Eager vs best play is 3.5 min (27%), but in the moment both feel the same: speed rises either way.
- The chart shows buyers fading, but the dashed "you can make N" line sits under the bars, so the fade never costs a
  sale. The player correctly concludes: "there doesn't seem to be any difference".

**Moments with nothing to decide**
- After factories open (~minute 5) the stage is: buy cards as they appear, buy factories with the money, press launch
  every ~100 s when the label changes. Seven button presses in eight minutes carry all the skill.

## 4. Changes that would create real tension (ranked: impact vs complexity)

**1. A warehouse and the Osborne effect (1983).** *High impact, medium complexity.*
Computers built go into stock; buyers take from stock. Launching a new model leaves the old stock unsold: it is
cleared at half price (or written off). The player sees "In the warehouse: 4,200 Model 6s · launching now sells
them for $500 each". Tune customers so demand at the fade floor is clearly *below* capacity (and fresh demand above
it). Now: overbuilding fills the warehouse, launching early burns stock, launching late leaves factories idle as buyers
fade. The fade finally matters, the cost of a launch is visible as a dollar figure, and the right moment depends on
stock, demand and the lab together, so no fixed ratio wins. History: Osborne Computer pre-announced its successor
in 1983, sales of the Osborne 1 stopped, the company went bankrupt in September; TI wrote off its TI-99/4A stock
the same year.

**2. A new chip only helps designs started on it (1975–81 chips).** *High impact, low complexity.*
Chip cards no longer raise the current design's limit; they raise the limit of the *next* design. The lab shows
"Next chip arrives in ~40 s" when the card is close. Now launching just before a chip is good (you start the next
model on it) and a long design started just before a chip is wasted. Card timing (save operations or not) and launch
timing become one decision. History: the $25 6502 (1975), the Z80, the 8088 in the IBM PC: computers were designed
around whatever chip was on the bench.

**3. Open vs Closed as compatibility, not a stat.** *High impact, medium complexity.*
Open: every model runs the old software. Home cards apply to all models and word of mouth counts all homes, but
each leap is capped lower (limit −0.4). Closed: big leaps (+0.4), but each launch breaks compatibility: word of mouth
counts only the current model's homes and the software cards apply only to models launched after them. Open rewards
many small launches and a large installed base; Closed rewards few big launches and timing cards just before a
launch. Two real strategies, and the choice changes the launch rule. History: Apple II's eight slots (1977) vs the
sealed Mac (1984); the IBM PC's open design (1981) and its clones; the incompatible Apple III and Coleco Adam.

**4. The lab costs money (engineers vs factories).** *Medium impact, medium complexity.*
Hire engineers with dollars: each team makes the lab 10% faster. Money now splits between supply (factories) and
the lab (bigger models sooner). The right split flips with the warehouse: short of stock, build; stock piling up,
push the lab. Shown as "Engineers: 6 teams · next model in ~70 s". History: Apple spent ~$50 M designing the Lisa
while the Apple II paid the bills; IBM's PC team was twelve people told to finish in a year.

**5. The 1983 price war.** *Medium impact, low complexity (one event).*
Late in the stage a rival cuts prices: every buyer group halves for ~60 s, or you match the price (money per
computer halves). With a warehouse this is a real fork: sit on stock, sell cheap, or launch through it. It makes the
best plan change during the stage, as the brief asks. History: Commodore's C64 price cuts in 1983, TI leaving the
home market with a $500 M loss, "Business is war" (Tramiel).

**Minimum fix if nothing else changes:** make supply and demand cross. As long as buyers exceed capacity for the
last half of the stage, no mechanic built on buyers (fade, surge, Open, word of mouth, customer groups, any price)
can matter, and the player will keep asking whether they are playing well.
