# Stage 3 — The Garage (Nov 1971 → Jan 1984): merged design

Lead designer's merge of `design/stage3/01-historian.md`, `02-plot.md`, `03-ux.md`, `04-systems.md`, with the player's
decisions in `stage3/05-decisions.md`. Brief: `stage3/00-brief.md`. **Approved and built** (`src/data/stage3.js`); §8 records what changed while building.

## 1. The stage in one paragraph
You are the Bletchley codebreaker, now about 55. You leave the computing division with a pension, the pencil and the
ledger, and start again in a garage among twenty-year-olds. This stage's new thing: **you sell the computers themselves,
and they keep counting after they are sold.** Every computer in someone's home runs for you. You set the price: cheap puts
more computers into homes (your speed, and the goal), dear brings money to build workbenches and factories. Owners tell
their friends, so homes snowball. Stage 1 was urgency, Stage 2 wonder; Stage 3 is joy, then giving speed away.

## 2. Decisions taken in the merge
| Question | Proposals | Decision |
|---|---|---|
| Who you are | Historian: the same codebreaker, ~55. Plot: the first clerk's grandchild, 19 | **Player's choice: the codebreaker.** The first clerk's **grandson** joins the garage in 1975 (19, with her pencil), writes the software, and takes the ledger in 1984 (Stage 4's software CEO). |
| New mechanic | All four: price + computers in homes + word of mouth | **Adopted** (systems' formulas, §4). Software is not a second system: it is idea cards (BASIC, the spreadsheet, games), and Stage 4's subject. |
| Stage 2's money | All four: not carried | **Reset to $1,300** (the garage's start-up money). Line: "You hand the division back its budget. In the garage you count what you have: $1,300." The Money counter stays in place, so nothing moves. |
| Producers | Historian: Kits → Home computers. Systems: Workbenches → Factories (both cost money, both make computers) | **Systems' shape, plain names:** Workbenches ("Set up a workbench"), then Factories ("Open a factory"), unlocked by the 1977 card "Computers in a box". Kits and boxed computers are named in the ledger. |
| The choice | Historian: Open or closed (1977, the eight slots). Systems: for business / for the masses (1980) | **"Open or closed"** with systems' numbers: *Open: eight slots* = 1.5× more buyers at every price; *Closed: one sealed box* = each sale earns 1.5× more money. Moved to 1977, right after "Computers in a box" (sim to re-check). |
| Goal | All: a computer in every home | **"A computer in every home"**, 7×10¹³ operations made this stage, everything 3× faster. Ledger: Time's Machine of the Year (Jan 1983). |
| Finale | Historian: air the advert, unveil the new computer. Plot: every classroom, a computer anyone can use | **Plot's, plain verbs:** "Put a computer in every classroom" (1983), then "Make a computer anyone can use" (Jan 1984: it comes out of a bag on stage and says hello). The advert goes into an ending line. |
| Speedometer | Historian: a film frame. Systems: chess, 35⁹ ≈ 7.9×10¹³ positions | **"Looking nine moves ahead in chess"** (Belle, 1980), ~30 days at the start, ~40 s at the end. Comparison "as fast as N Cray-1s"; beat "You are now faster than a Cray-1" at ~1:10. |
| Roles | Historian: Garage founder → Founder and president (1977) → Chairman of the board (1980) | **Historian's**: they fit a 55-year-old. |
| Unit | All: keep "operations" | Kept. No rename beat: the homes count is the stage's new number. |
| Look | UX | **`body.era-1971`**: beige case (light, text #000) / amber terminal (dark), Space Mono headings, a static three-band case stripe under the header, 4 px rounded cards. |
| Main button | UX | "Run a program". Worth a share of the legacy; fades. No click upgrades. |

## 3. Arrival and pace
- Arrive with the Stage 2 legacy, ~3.0×10⁷ per second (one Legacy row: "The computing lab, 1946–71 · N per second, forever.").
- End at ~2×10¹² per second: one doubling every ~45 s (Stage 2: ~69 s), so the game speeds up again. Realistic: ~10 M
  personal computers by 1984 × ~0.3 M instructions per second.
- Normal play 12–14 min; a player who never touches the price ~13–14.5 min; longest quiet ≤ 45 s (systems' prototype).
- **05 §3's later end rates must move up** (Stage 4 ≈ 10¹⁶, not 10¹¹). To fix in 05 when Stage 3 is built.

## 4. The mechanic (systems §3, with UX's panel)
**Panel "Sell computers"** under "Your garage":
```
SELL COMPUTERS
 Price  [ $299 ][ $599 ][ $1,299 ][ $2,499 ]          (default $1,299, the 1977 price)
 At $1,299: about 30 buyers a second, $39,000 a second.
 Computers in homes: 4,120   +30 a second · +12 from word of mouth
 Buyers are waiting: build more computers.            (or: "Computers are piling up: lower the price." / "Making and selling are even.")
```
```
capacity  = Σ workbenches/factories × output × multipliers          (computers per second)
demand(P) = (Σ markets + 0.0015 × homes) × demandMul × (1299 / P)^0.5
sold      = min(capacity, demand(P));  homes += sold;  dollars += sold × P × priceMul
speed     = legacy + homes × 50,000 × multipliers
```
- **Dollars build things** (both producers). **Operations buy ideas** and the finale. No operations become money.
- **Markets** are Stage 2's customers, as ledger lines that add demand: hobbyists, clubs, the first computer shops, schools,
  accountants (the spreadsheet), families and games, offices (the IBM PC), Britain.
- The best price moves through the stage. Cheap is right in the garage (few buyers). Dear is right when the first factories
  open and you can make more than people buy. As each new market arrives, cheap or middle is right again. The smart bot
  changes price 15–23 times.
- Selling stops at the goal (as in Stage 2). Home milestones write their own ledger lines (plot §8: the dentist in Ohio, the
  farmer's herd, the school's waiting list, a girl's game in plastic bags, a million computers "all still counting").
- **Known weakness, must fix when building:** in the prototype "always $299" is only 5–8% slower than smart pricing. The
  build must make the decision matter more (elasticity 0.6, bigger supply jumps, or late markets that pay well only
  at the higher prices) until a fixed price costs at least ~15%.

## 5. The stage, in order (~13 min; dates from the historian, text from plot and historian)
1. 0:00 · 1971-11 · Divider, the 4004 advert, then: "You leave the division the building, the mainframes and the cafeteria. You take the pencil."
2. 1972 · Pong stops working in a bar: the coin box is too full. · Card "Eight bits" (8008).
3. **1974-05 · The secret is out.** A book tells the world about Bletchley Park. For the first time in thirty years you can say what you did. (Replaces plot's grandmother line; now it is yours.)
4. 1974–75 · Cards: "A better chip" (8080), "On a magazine cover" (a kit for $397; clubs open), "A language for kits" (BASIC written for a machine its authors never touched).
5. 1975-03 · The club in a Menlo Park garage. **The first clerk's grandson turns up**, 19, with her pencil. He writes programs.
6. 1975-09 · "The $25 chip". · 1976-02 · The open letter to hobbyists ("Not everyone laughs").
7. 1976-07 · A shop orders fifty, assembled. **Promotion: Founder and president** (1977, with "Computers in a box", factories, and **the choice: Open or closed**).
8. 1978 · Space Invaders (a flaw becomes the game). · A boy types CAN MACHINES THINK? → ?SYNTAX ERROR. (Turing's thread.)
9. 1979-10 · The spreadsheet: accountants buy a computer just to run it (market). · Xerox shows a visitor its mouse.
10. 1980 · Roberta Williams' game in zip-lock bags. **Promotion: Chairman of the board** (shares sold).
11. 1981-08 · IBM's PC: built from other people's parts; the program that starts it is rented from a small firm in Seattle. (Sets up Stage 4.)
12. 1982 · Britain's rubber-key computer; "For the masses, not the classes". · The first clerk's quiet line: the adverts all show a boy at the keyboard. "In our day that was a girl's job."
13. **Goal, Jan 1983:** "A computer in every home". Time's Machine of the Year.
14. **1983-09 · Petrov** (`hush: 20`, 12 s after a purchase, no reward attached): the machine was fast, sure and wrong, and a man said no.
15. Finale: "Put a computer in every classroom" (10 PRINT "HELLO"), then "Make a computer anyone can use" ("Hello").
16. Ending lines: "It does not think. Someone told it what to say. The whole hall stands up anyway." · The advert with the hammer, shown once.
    · "A single street now has more computing in its kitchens than Bletchley Park had in the whole war."
17. Handover (under Stage 4's divider): **"1984. The machine no longer matters. What runs on it does. You hand the ledger and the pencil to the grandson. He writes the programs now."**
Card list, costs and reveal thresholds: systems §4 (15 cards + goal + 2 finale), renamed with the historian's dates.
Two cards cost money (the floppy disk, the price war), the rest operations. Lines marked (check) are fact-checked when built.

## 6. Engine and sim changes (systems §5; small and data-driven)
- `stage.homes` (output per home computer) added to the speed; producers with `makes: 'computers'` add to capacity, not speed.
- `stage.market.kind = 'price'` (Stage 2 stays `'sell'`): prices, default, elasticity, word of mouth, customers as markets.
- New effect `demandMul`; `priceMul` reused. `enterStage` sets `s.dollars = st.startDollars ?? 0`.
- Save version 4 (`homes`, `price`). The sim gets `choosePrice` and `--price`, `WINDOWS[3]`, and `stage.arrival` for Stage 3.
- UI: the Sell panel learns the price kind; the Money counter shows from the stage's first frame; a "Computers in homes" line.

## 7. Risks
- The price decision is too soft (§4); fix in the build, verify with the sim.
- Card ETAs run 10–20% pessimistic because speed grows between purchases. Acceptable, or estimate from the growth.
- Three numbers in the panel is the limit; anything more goes to the ledger.
- "Computers in other people's homes count as yours" needs one plain ledger line at the first sale.

## 8. As built (Nov 2026)
- **The price decision was too soft** in the prototype (a fixed price only 5–8% behind). Two changes fixed most of it:
  - **Each market has its own price sensitivity** (`elasticity` per customer): hobbyists 1.2, clubs 1.2, families 1.3 count every
    dollar; shops 0.6, radio shops 0.8; accountants 0.1 and offices 0.05 pay what it costs. Word of mouth 0.8.
    So the right price depends on who is buying: cheap in the garage, dearer once offices and accountants arrive.
  - **Money matters more:** factories cost $500,000 and each costs 6% more than the last (was $50,000, 15%); workbenches 30% (was 25%).
- Sim, average player: smart pricing 11.9–12.1 min · never touching $1,299 13–14 min · best fixed price ($599) 12.5–13 min
  (3–9% slower) · always $299 15–16 min · always $2,499 16–18 min. All 6 profiles × 2 choices pass, quiet ≤ 31 s, end speed ~2–2.4×10¹².
- `npm test`: the second sim run is a player who never touches either market (`--sell 0.25 --price 1299`). New flags: `--price`,
  `--market` (patch the price market), `--horizon` (the price bot's valuation).
- Choice ids: Open = `people`, Closed = `machines` (the sim's `--choice` covers all stages). Finale costs 3×10¹³ and 6×10¹³.
- The Cray-1 line waits for 1976. The speedometer says "N% of a Cray-1" until you are faster than one, and long times read in days.
- Engine: `homes`, `capacity`, `demandAt`, `priceFlow`, `setPrice`/`setMarket`, `moneyRate`, conditions `homes` and `afterGoal`,
  effect `demandMul`, `startDollars`. Save version 4. The market panel is built from stage data (Stage 2 and 3 share it).
- **Player feedback (Nov 13):** the count of computers sold and what they produce were hard to find (a line inside the Sell
  panel). Now a **"Computers sold"** row in "Your garage", between the Legacy line and the workbenches: the count, "Each runs
  N operations a second in someone's home. Together: N per second." The Sell panel keeps only the word-of-mouth share.
- **The speed line, all stages,** is now two plain sentences: "All your computers together are as fast as 220 Cray-1
  supercomputers. Checking every chess game nine moves ahead: about 37 min." (was "Your garage: as fast as 220 Cray-1s ·
  looking nine moves ahead in chess in about 37 min"). Each stage's `compare.lead` gives the first words.
