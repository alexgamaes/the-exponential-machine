# Stage 3 redesign — UX (designer): a mechanic you play, not a setting you pick

Input: `10-redesign-brief.md`, my earlier `03-ux.md`, `review/05-ux-layout.md`, `07-stage3.md`, `src/data/stage3.js`,
and Stage 3 as built (played at 1440×900 and 390 px, Nov 13).

## 1. Why the price switch fails

What the player sees in "Sell computers" today:
```
Price  [$299][$599][$1,299][$2,499]
At $1,299: about 12 sold a second, $16,000 a second.
Of those, 6 a second come from word of mouth.
Making and selling are even.
Buyers: Hobbyists.
```
- **It is a setting, not a decision.** You pick a price, and nothing on screen asks you to pick again. The right price
  only changes when a new buyer group arrives, and that news is in the ledger, not in the panel. So players set it once.
- **The cost of a high price is invisible.** A dearer price shows more money at once (big, green, in a counter). What it
  costs you, fewer homes and so less speed later, never appears anywhere. So "dearer looks better" (the player's words).
- **No moment.** Clicking a price changes one sentence. Nothing grows, nothing lands, nothing to wait for or watch.
- **Nothing to read at a glance.** Three sentences of numbers. You have to compare two lines in your head to see if
  you made the right choice.
- **It looks like Stage 2.** A row of segment buttons that tunes a flow of money. Same widget, same verb ("set a
  share/price"), same feel.
- **It barely matters.** Never touching it is 3–9% slower. The player is right to ignore it.

What the player needs: **a thing that changes in front of them, that asks them to act at a moment they can choose,
and that answers within a second when they do.**

## 2. Three concepts

All three keep the screen as built: counters on top, "Your garage" and "Ideas" side by side, the ledger column on
the right. The new panel takes the "Sell computers" slot (under "Your garage", ~450 px wide on a laptop, full width
on a phone). All three keep **computers keep counting in homes** (see §3.6 for why).

### Concept A — The town (watch homes light up)
A small map of houses. Lit windows are homes with your computer. Owners show friends, so light spreads to the
houses next door. You spend money to open a **club**, a **shop** or a **school** on a dark patch: it lights a
circle of houses and starts a new spread there. When the map is full: "Your street is full. Now: the town." The map
zooms out; your whole street becomes one lit house among dark ones.
```
┌ YOUR TOWN ─────────────────────────────────────┐
│ ■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□   │
│ ■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□   │  ■ has your computer
│ ■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□   │  □ not yet
│ ■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□   │
│ 312 of 1,000 houses on this street              │
│ Click a dark house to open:                     │
│  (•) a club  $2,000    ( ) a shop  $9,000       │
└─────────────────────────────────────────────────┘
```
- **Recurring action:** pick a spot and open something there (~every 20–40 s).
- **Teaches itself:** the first club opens by itself near your garage; you see the spread start from it.
- **Payoff:** the zoom-out (street → town → country → world), five times in the stage. The exponential made visible.
- **Fails on:** the best spot is always "the biggest dark patch", so after two minutes it is a chore of clicking, not
  a decision. Many small targets on a phone; keyboard play is awkward. A map that changes every second is close to
  "flickering". **Keep the zoom-out idea; not the mechanic.**

### Concept B — Who is at the door (drag the price tag)
The price becomes a tag you drag along a ruler. Each buyer group is a row of small figures with the most it will
pay marked on the ruler. Dragging the tag left lights more figures at once; to the right, fewer, each paying more.
```
┌ WHO BUYS AT YOUR PRICE ─────────────────────────┐
│ $199          $599         $1,299        $2,499 │
│ ├──────────────┼─────▼───────┼─────────────┤    │  ▼ your price: $799
│ Hobbyists    ●●●●●●○○○○○○○                      │  ● buy  ○ walk away
│ Clubs        ●●●●●●●●○○○○                       │
│ Accountants  ●●●●●●●●●●●●  (pay any price)      │
│ 23 buy a second · $18,000 a second · speed +8%  │
└─────────────────────────────────────────────────┘
```
- **Recurring action:** drag the tag when a new group arrives (its row appears).
- **Teaches itself:** the walk-aways are drawn, so the hidden cost of a high price is finally on screen.
- **Payoff:** small. A row of figures lighting up as you drag is pleasant for two seconds.
- **Fails on:** it fixes clarity, not fun. It is still a setting: once the tag is right, there is nothing to do
  until the next row arrives. Dragging is fiddly on phones. **Use only its idea: show who walks away.**

### Concept C — Launch the next model (recommended)
You don't set a price. **You launch computers.** One model is on sale. Its sales rise after launch, peak, then fade as
it gets old. Meanwhile your next model is on the drawing board and gets better: slowly by itself (chips get cheaper
every month), in jumps when you buy an idea ("Eight bits", "A floppy disk drive"). **When to launch** is the
decision: launch early and the new model is only a bit better; wait and it is much better, but the old one is
fading. Launch day brings a pile of orders that your workbenches and factories work through in front of you.
This is 1971–84: the kit, the Apple II, the PET, the TRS-80, the VIC-20, the C64, the IBM PC, each one a launch, and
the Osborne lesson of 1983 (announce the next model and nobody buys the current one).
```
┌ YOUR COMPUTERS ON SALE ─────────────────────────┐
│ Now selling: Model 2 · $599                     │
│ Buyers a second                                 │
│ 40┤       ▄▆██▇▆▅                               │
│   ┤    ▂▅█       ▅▄▃ ·  ·  ·                    │  · · = where it is heading
│   ┤- - - - - - - - - - - - - - you can make 25  │
│  0┼────────────────────────────── 1:10 on sale  │
│ Orders waiting: 6,400                           │
│─────────────────────────────────────────────────│
│ Next: Model 3   1.8× faster than Model 2        │
│ Launch day: about 9,000 orders                  │
│ [ Launch Model 3   ■ $40,000 ]                  │
│ Model 2 stops selling when Model 3 launches.    │
└─────────────────────────────────────────────────┘
```
- **Recurring action:** launch (~8–10 times in the stage, every 60–90 s), plus the old verbs (workbenches,
  factories, ideas), which now have a visible job: drain the order pile, and improve the next model.
- **Teaches itself:** the dotted line shows the current model fading before it happens; the next model's "1.8×" and
  "about 9,000 orders" climb while you watch; the one-line warning says the cost of launching.
- **Payoff in under a second:** click → the chart resets to a new curve with a tall launch-day bar, "Orders waiting"
  jumps to 9,000 and starts draining, "Computers in homes" climbs fast, a ledger line names the model.
- **Feels different:** Stage 1 is click then hire; Stage 2 is a split you tune; Stage 3 is **timing**: a recurring
  launch you choose the moment of, with a curve you read.

## 3. Recommendation: Concept C, "Launch the next model"

### 3.1 The rules, as the player sees them
1. Your models are what you sell. Each has a price (set by history, falling over the stage: $397 kit … $595).
2. A model on sale has buyers a second that rise for ~10 s after launch, then fade towards a floor (~30% of the
   peak) over ~90 s. New buyer groups (the current "markets": clubs, shops, accountants, families, offices) raise
   the curve when they arrive; the chart shows a small tick and the group's name at that moment.
3. Sales are limited by what you can make (workbenches, factories). Above that line, orders wait in a pile.
4. Every computer sold goes to a home and **keeps running there at its model's speed**. A newer model is faster, so
   each launch also raises what each new home adds.
5. The next model starts at "1.0× faster" right after a launch. It grows by itself (about +10% a minute), and
   most "homes" idea cards now say "Your next model is 1.5× faster." (they jump the next model, not old homes).
6. Launching costs money (tooling) and ends the old model's sales at once. Launch-day orders grow with how much
   better the new model is.
7. **Open or closed** (1977) becomes a shape you see: *Open: eight slots* = "Other people's add-ons keep each model
   selling longer" (slower fade); *Closed: one sealed box* = "Each sale earns 1.5× more money."
8. Optional late twist with "For the masses" (1982, the price war): the model on sale gets **[Cut the price]**,
   once per model: buyers jump back up, each sale earns less. Only if systems need more late decisions.

### 3.2 The full panel (laptop, in the "Sell computers" slot)
```
┌ YOUR COMPUTERS ON SALE ─────────────────────────────┐
│ Now selling: Model 4 · $799                         │  line 1: name bold, price with money swatch
│ Buyers a second since launch                        │
│ 1.2K┤          ▅▇█▇▆▅▄                              │  bars, one per 2 s of the model's life
│     ┤     ▃▅▇██       ▄▃▃ ·  ·  ·  ·                │  dotted: expected fade (projection)
│     ┤- - - - - - - - - - - - - - you can make 900   │  dashed: capacity, labelled at its end
│     ┤  │ + radio shops                              │  tick + name when a buyer group arrives
│    0┼──────────────────────────────── 1:40 on sale  │
│ Orders waiting: 12,000 · gone in about 40 s         │  the pile; drains each second
│─────────────────────────────────────────────────────│
│ Next: Model 5      2.3× faster than Model 4         │  ratio bold; steps by 0.1, never every frame
│ Launch day: about 60,000 orders                     │
│ [ Launch Model 5   ■ $2.1 million ]                 │  same .buy-btn as producers; dashed when unaffordable
│ Model 4 stops selling when Model 5 launches.        │
└─────────────────────────────────────────────────────┘
```
And in "Your garage", the "Computers sold" row becomes:
```
│ Computers in homes                          41,200  │
│ Model 1: 900 · Model 2: 6,100 · Model 3: 22,000 ·   │  oldest models fold into "older: N"
│ Model 4: 12,200. Together: 2.1 billion per second.  │  2 lines reserved
```
Phone: same panel, full width; chart 100% wide, 72 px tall; bars widen instead of adding; the dashed-line label
moves under the chart ("You can make 900 a second"). The launch button wraps as producer buttons do today.

### 3.3 States over the stage
**First 60 s (Nov 1971 – 1972)**
| t | Panel shows |
|---|---|
| 0 s | "Now selling: nothing yet. Set up a workbench to build your first computer." Empty chart axes (reserved height). Next block: "Next: Model 1 (a kit) — ready when you have a workbench." |
| ~3 s | Player sets up a workbench. Model 1 launches by itself (the only free launch), "Launch day: 20 orders". The pile "Orders waiting: 20" drains 1 a second; Computers in homes counts up; dentist line in the ledger. |
| ~15 s | Curve has risen above the dashed line: "Orders waiting: 45 · Buyers are waiting: make more." Player buys workbenches; the pile shrinks visibly. |
| ~35 s | Next block unlocks with the first idea: "Next: Model 2 · 1.2× faster · Launch day: about 150 orders · [Launch Model 2 ■ $4,000]". |
| ~45 s | "Eight bits" bought: the next model jumps to 1.7× (bold number changes once). |
| ~60 s | Model 1's bars are past the peak; dots point down. First real choice: launch now, or wait for more. |

**Middle (1975–80, minutes 4–9)**
- A launch every 60–90 s. Each model's peak is taller (new buyer groups, better models); the y-axis label grows
  (40 → 1.2K → 30K) while the chart keeps its height, so every new curve still fills the box.
- Factories appear (1977): the dashed line jumps up; a 60,000-order pile drains in seconds instead of minutes.
- Open or closed changes the fade you see on the next model.
- Ideas show which they feed: "Your next model is 1.5× faster" vs "Factories build 1.5× more".
- Tension now: money for a factory, or money for the launch?

**End (1982 – Jan 1984)**
- Launches every ~45 s, big piles, the price-war cut (if used). The goal arrives in Jan 1983.
- After the goal the Next block becomes the finale, in the same place, same button style:
  "Next: computers for every classroom · [Put a computer in every classroom · 30 trillion operations]",
  then "Next: the computer anyone can use · [Make a computer anyone can use · 60 trillion operations]".
  The last action of the stage is a launch. Its chart bar is one tall bar; the ledger says "Hello."

### 3.4 Labels
| Thing | Label |
|---|---|
| Panel | Your computers on sale |
| Current | Now selling: Model N · $P |
| Chart caption / axis | Buyers a second since launch · "1:40 on sale" |
| Capacity line | you can make N |
| Pile | Orders waiting: N · gone in about T |
| Status (replaces the 3 old lines) | "Buyers are waiting: make more." / "You make more than people buy." (only when the pile is 0 and the curve is under the line) |
| Next | Next: Model N · X× faster than Model N−1 |
| Burst | Launch day: about N orders |
| Button | Launch Model N  ■ $cost |
| Warning (always shown) | Model N−1 stops selling when Model N launches. |
| Locked | Next model — Locked: buy the idea "Eight bits". / Locked: you need $4,000 (shown as a dashed button, like producers) |
| Garage row | Computers in homes · Model 1: N · … Together: N per second. |
| Idea cards | "Your next model is 1.5× faster." (not "Computers in homes work 1.5× faster") |
Model names stay "Model 1, 2, 3…" on buttons. The ledger names what each one is like ("Model 3 has a floppy drive
and colour. The shop window has a queue.").

### 3.5 Player's preferences
- **Plain labels:** "Launch", "Orders waiting", "Buyers a second". No "demand", "elasticity", "capacity".
- **No pop-ups, no confirmations:** launching is one click. The cost is written under the button, always.
- **Nothing flickers:** chart adds one bar every 2 s; numbers update once a second, rounded to 2 significant digits;
  the "×" ratio moves in 0.1 steps; the pile counts down but is rounded too. No blinking, no glow.
- **Bold, not bigger:** the model name, the "×" ratio and the launch-day orders are bold; all text one size.
- **Layout never jumps:** the panel has a fixed height from frame 0 (chart box, pile line, Next block, warning line
  are all reserved). The garage row reserves 2 lines. Finale replaces the Next block in place.
- **No click upgrades:** clicks still fade; launches are not clicks-for-power, they are a timed choice.
- **Locked things say why:** the Next block always says what it waits for.
- **Goal bar** unchanged: stage goal only.

### 3.6 Keep "computers keep counting in homes"? Yes
It is the stage's story (the dentist in Ohio, "they are all still counting") and it is what makes launches add up:
each burst becomes permanent speed, and each model's share is listed, so the player sees their history pile up.
Without it, a launch would be a temporary money spike and the stage would be Stage 2 again.

### 3.7 Notes for systems (not UX numbers, just what the screen needs)
- Ideal launch gap ~60–90 s; launching at the first moment it is affordable should be clearly worse (~10%), and
  never launching after Model 2 should cost ≥ 15% but still finish (the floor keeps the last model selling).
- Bot: launch when the next model is ≥ 1.6× and affordable, or when current sales are below half their peak.
- The price switch, word-of-mouth line and "Buyers:" list go. Word of mouth can stay inside the curve's floor.
- Engine: per-model homes and output, a sales curve by model age, an order pile, a launch action and cost.

### 3.8 Risks
- The chart is new to the game. It must stay calm (bars, no animation beyond adding one) and readable in both themes.
- If systems make the best launch moment too easy to compute, timing becomes a chore. The idea jumps and the
  money-vs-factory tension are there to keep it a judgement.
- Ten models is a lot to name in the ledger; the historian should write one line per launch.
