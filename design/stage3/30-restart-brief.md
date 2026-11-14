# Stage 3 from scratch: closer to Universal Paperclips (brief, Nov 14)

## Why
The player, after playing "series and programs" (07-stage3.md §10):

> "I'm not very pleased with the latest stage 3. I think the UX, the gameplay, the plot, even itself, is not that good.
> Maybe try to think it from scratch. Maybe now it can be a little closer to Paperclips, and what works in there:
> demand, the warehouse items and things like that."

Three versions so far, all abstract: a price tag with four buttons (dull), a lab bar with a launch button (one solved
rule), series and programs (too much to read, still one rule). All three put the player in front of *rates and ratios*.
Paperclips puts you in front of *things*: a pile of unsold clips, a spool of wire that runs out, a price you nudge and
watch the pile react to. We restart Stage 3 from that.

## What works in Universal Paperclips' first phase (and why)
- **One button makes one thing.** "Make Paperclip" → the clip goes into *Unsold Inventory*. You see the count tick up.
- **Price and demand are one visible loop.** Price `$0.25 [lower] [raise]`, "Public Demand: 32%". Too dear: inventory
  piles up. Too cheap: inventory hits zero and you leave money on the table. You nudge, you watch, you nudge again.
- **A raw material that runs out.** Every clip uses wire. "Wire: 1,000 inches [Buy Wire] $15". The wire price drifts
  up and down by itself, so buying is a small timing game (buy when cheap). When wire hits 0, production stops dead,
  which is felt immediately. Later an idea automates buying.
- **Marketing.** Spend money for a level that multiplies demand. A clear money sink with a clear effect.
- **Machines that click for you** (AutoClippers, then MegaClippers), paid with money. Each one bought is visible in
  the inventory rising faster, which then pushes you back to price and wire.
- **Ideas paid with a different resource** (operations), each a one-line effect, many of them improving the loop
  above (better wire use, better demand, automation). Ideas often *remove a chore* the player has learnt to do by
  hand (WireBuyer), which feels like progress.
- **Every number is on screen and they all talk to each other.** No hidden curves, no formulas to infer.
- Later "genius" layers (investments with a risk level, strategic-modeling tournaments, probe trust) each add one
  new kind of decision, not more of the same.

## Direction set by the lead (designers: work within this, argue with it if you must)
Garage → company, Nov 1971 → Jan 1984. The product is **the home computer**. Proposed shape:
- **The main button builds a computer by hand** ("Build a computer"), which goes into the warehouse. (In earlier stages
  the button made operations; here it makes the stage's thing. It still fades as workbenches take over. No click upgrades.)
- **Warehouse**: unsold computers. **Price** with lower/raise. **Buyers** (demand) shown plainly. Sales take from the warehouse
  and bring **money**.
- **Chips** are the wire: each computer needs a chip (or a box of parts). Bought with money in batches; the price moves.
  Historically the chip price *falls* fast over the period (Moore's law, the $25 6502) with shortages and gluts on top,
  so the timing game has a direction.
- **Advertising** (marketing): money → more buyers.
- **Workbenches**, then **factories**: build computers automatically, paid with money.
- **Computers in homes keep running for you.** Every computer *sold* adds its speed to your operations per second,
  forever. This is how the stage ties back to the game's one number (requirement 3): selling computers is what
  makes you faster. Unsold computers in the warehouse do nothing.
- **Operations buy ideas** (cards): better chips (computers built from now on are faster), automation (a standing
  order for chips, a sales team that sets the price?), new kinds of buyers (shops, accountants with the spreadsheet,
  families with games, offices with the IBM PC), and the stage goal and finale.
- One **mid-stage twist** that adds a new kind of decision, rooted in the history (candidates: the 1983 price war,
  the Osborne effect where announcing the next model leaves the old one stuck in the warehouse, selling shares in 1980,
  a chip shortage, the Open or Closed choice of 1977). Pick one or two, not five.

## Hard constraints
- Requirements: `design/00-requirements.md`. Speed (operations per second) **never drops**; homes only accumulate.
- Arrive with ~3×10⁷ operations per second (Stage 2's legacy) and ~6×10⁸ operations in hand. Money starts at $1,300.
  End around 10¹²–2×10¹² per second (Stage 4 is not built, so this may move if the designer argues for it).
- 12–14 minutes for normal play; longest stretch with nothing new to do ≤ 45 s. Lazy play must clearly lose and still finish.
- Engine stays pure and data-driven (`src/engine.js` + `src/data/stage3.js`). The simulator (`sim/simulate.mjs`) must be
  able to play it with a smart bot and a few dumb ones. Save version goes up with a migration.
- Player preferences: plain, short, jargon-free labels "like a video game"; high contrast, pure black text in light
  mode, emphasis bold not bigger; no pop-ups, no confirmations; locked things say why; nothing flickers and the layout
  never jumps; the goal bar shows only the stage goal; no click upgrades; desktop first (1366×768), phone must work.
- Story beats (log only) keep the stage's anchors unless the plot writer argues otherwise: the codebreaker (~55) starts
  again in a garage; the first clerk's grandson joins; the Bletchley secret comes out in 1974; Petrov in 1983;
  "a computer anyone can use" in Jan 1984; the ledger passes to the grandson.
- Never read `archive/`.

## Material
Current (to be replaced) design: `design/07-stage3.md`, data `src/data/stage3.js`, critique `21-strategy-critique.md`
(what made the last version solvable). History: `01-historian.md`. Story: `02-plot.md`. Stage 1–2 design: `05`, `06`.
