# Stage 3 from scratch: the garage as a Paperclips loop (proposal, Nov 14)

Designer's answer to `30-restart-brief.md`. Not built. Prototype (standalone, not the engine):
`/private/tmp/claude-501/-Users-gama-Documents-personal-the-exponential-machine/bed73f35-54f7-453b-ba4c-4a3b9d14ca06/scratchpad/s3proto/sim.mjs`
run with `node sim.mjs --p "$(cat final.json)"` (numbers in §5–6 use `final.json`).

## 1. The core loop, and the screen

You build computers. Each one needs one chip, and goes into the warehouse. You set a price; at that price a
number of buyers turn up each second and take computers from the warehouse. Each sale pays money, and the
computer goes into a home, where it **runs for you forever**: its speed is added to yours. Money buys chips,
workbenches, factories and adverts. Your speed (operations) buys ideas. Too dear and the warehouse fills
(computers sitting there add nothing); too cheap and it is empty and you are giving money away. Chips run out
and stop everything; their price wobbles and falls, so you buy when they are cheap. Every new chip generation
makes the computers you build *from now on* faster, so selling them fast matters more than selling the old stock.

Screen (top to bottom, fixed places, each line appears when it first matters):
```
  Speed 41.6 million operations a second          You have 2.1 billion operations
  [ Build a computer ]                            Money $14,200
  Warehouse: 58 computers          Price: $340  [lower] [raise]
  Buyers: 11 a second at this price · Sold: 1,430 (all still running in homes)
  Chips: 800   [Buy 100 chips: $3,770]   Chip price $37.70 · below the usual price
  Adverts: level 2  [Advertise: $8,000]  More buyers: ×1.56
  Workbenches 22 [Set up: $3,100] builds 11 a second · Factories (locked: Computers in a box)
  Ideas (cards, paid with operations)                      Goal bar: Run 60 trillion operations in total
```
"Below the usual price" / "above the usual price" compares with the last 30 s (no chart needed). When the chip
shortage is coming the chip line says so in bold for its 20 s warning. The goal bar only shows the stage goal.

## 2. Formulas (per second; `dt` steps)

| Thing | Rule |
|---|---|
| Build by hand | 1 click = 1 computer, uses 1 chip. Does nothing with 0 chips. No click upgrades. |
| Workbenches | $600 × 1.14ⁿ, each 0.5 computers/s. Shown after the first sale (the sim allows them from 0:00). |
| Factories | $50,000 × 1.08ⁿ, each 6 computers/s (× For the masses 2, × Closed 1.18). From *Computers in a box*. |
| Building | `want = (benches·0.5 + factories·6·mul + clicks)·dt`; built = min(want, chips). Chips −= built. |
| Warehouse | Batches `{count, speed}` oldest first; a batch's speed is fixed when built (`300,000 × chipMul`). |
| Buyers | `buyers/s = market × 1.25^adverts × openBonus × ($1,000 / price)`. Start market 1.2 (at $1,000 → 1.2/s). |
| Sales | `sold = min(warehouse, buyers·dt)`, oldest first. Money += sold × price. Homes speed += Σ sold × batch speed. |
| Speed | `legacy (3×10⁷) + homes speed`. Only grows: homes never leave, the price never touches it. |
| Operations | += speed·dt; total += speed·dt (the goal). Ideas cost operations. |
| Price | Start $400. [lower]/[raise] move it 5%, rounded to a tidy figure ($1 steps under $100, $5 under $1,000...). |
| Chips: price | `chip = $100 × 0.5^(t/230 s) × e^x × event × card`; `x` is a slow wobble (mean-reverting, ±35%, ~12 s memory; seeded, so a save replays it). Trend: $100 (1971) → about $3 (1983). |
| Chips: buying | One button buys a batch: 100 chips; 500 after *Chips by the tray*; 5,000 after *Sixteen bits*. Start with 40 chips. |
| Chip shortage | 20 s warning in the log and on the chip line, then 60 s at 2× price and **rationed: one batch every 15 s**. Twice: with *A spreadsheet* (1979) and *Computers for offices* (1981). |
| Chip glut | With *For the masses* (1982): 45 s at 0.4× price. |
| Adverts | Level n costs $2,000 × 2ⁿ; each level ×1.25 buyers. |
| Open bonus | Open only: buyers × (1 + homes / 150,000). |
| Automation | *Standing order*: buys a batch the moment chips run out, at whatever price (never stockpiles). *A sales manager*: nudges the price 4% a second toward ~8 s of stock in the warehouse. Both can be overridden by hand. |
| Goal | 6×10¹³ operations in total since 1971, then a card you click. |
| Finale | *Air the advert*: $4,000,000 (money). *Make a computer anyone can use*: 3.5×10¹³ operations. After the goal: no new workbenches or factories; selling goes on. |

Why price is a real control: at the right price buyers equal what you build (homes grow as fast as they can,
and you get the most money for them). The right price moves every time you buy a factory, an advert, a buyer
group or a chip card, so the player keeps nudging, like Paperclips. Late, cheap chips are what let the price fall.

## 3. The cards (ideas), in order

Reveal: at most 2 open cards, 8 s apart, plus the locked preview (as Stages 1–2). Every card after the first
needs the previous one bought, plus a delay (8–15 s) so the ledger's story lines fit between them.

| # | Name | Cost | Effect (card text) | Reveal | Year |
|---|---|---|---|---|---|
| 1 | Eight bits | 2.4 billion | Computers you build from now on are 2× faster. | 15 computers sold | 1972 |
| 2 | On a magazine cover | 6 billion | New buyers: computer clubs. 2× buyers. | #1 + 15 s | 1975 |
| 3 | The $25 chip | 14 billion | Chips cost half. | #2 + 10 s | 1975 |
| 4 | Chips by the tray | 28 billion | Buy chips 500 at a time. | #3 + 10 s | 1976 |
| 5 | Computer shops | 48 billion | New buyers: shops. 2× buyers. | #4 + 8 s | 1976 |
| 6 | Computers in a box | 80 billion | Unlocks factories (paid with money). | #5 + 8 s | 1977 |
| 7 | **Open or closed** (choice) | 140 billion | see §4 | #6 + 15 s | 1977 |
| 8 | A faster chip | 240 billion | Computers you build from now on are 2.5× faster. | #7 + 10 s | 1978 |
| 9 | A spreadsheet | 700 billion | New buyers: accountants. 1.8× buyers. (A chip shortage follows.) | #8 + 10 s | 1979 |
| 10 | Games at home | 1.2 trillion | New buyers: families. 2× buyers. | #9 + 10 s | 1980 |
| 11 | Sixteen bits | 2.8 trillion | Computers you build from now on are 3× faster. Buy chips 5,000 at a time. | #10 + 10 s | 1981 |
| 12 | Computers for offices | 4.8 trillion | New buyers: offices. 2× buyers. (A chip shortage follows.) | #11 + 8 s | 1981 |
| 13 | Standing order | 6 trillion | Buys chips by itself whenever you run out. | #12 + 8 s | 1981 |
| 14 | A sales manager | 8 trillion | Sets your price by itself to keep the warehouse low. | #13 + 8 s | 1982 |
| 15 | For the masses | 11 trillion | Factories build 2× more. (Chip prices crash for a while.) | #14 + 8 s | 1982 |
| 16 | Thirty-two bits inside | 16 trillion | Computers you build from now on are 3× faster. | #15 + 8 s | 1983 |
| G | Put a computer in every home | 60 trillion in total | Ends the build-up; the finale opens. | always shown | 1983-01 |
| F1 | Air the advert | $4,000,000 | A hammer through a screen, shown once. | after G | 1984-01 |
| F2 | Make a computer anyone can use | 35 trillion | Ends this stage. | after F1 | 1984-01 |

Chip generations (#1, 8, 11, 16): ×45 per computer over the stage (300,000 → 13.5 million a second).
Buyer groups (#2, 5, 9, 10, 12): ×29. Automation (#4, 11's crate, 13, 14) removes the three chores the player
learnt by hand, in the order they become tiring. Labels: no chip names on buttons; the 8008, Z80, 6502, 8088,
68000, VisiCalc and IBM go in ledger lines only.

## 4. The twist(s)

**Main twist: Open or closed (1977), redesigned so it picks a side of the loop.**
- **Open: eight slots.** "Other people make add-ons and programs: buyers grow with every computer in a home
  (+1% per 1,500 homes)." Demand that compounds.
- **Closed: one sealed box.** "You make every part yourself: factories build 1.18× more." Supply, now.

Why no fixed answer: Open pays off for a player whose warehouse fills up (not enough buyers: few adverts, a stale
price); Closed pays off for a player whose warehouse is empty (buyers waiting). Which one you are depends on how
you have spent money so far, and the warehouse tells you. Sim: smart play Closed 12.3 vs Open 12.5 min (1.5%);
no adverts: Open 14.7 vs Closed 15.8; fixed price: Open 14.9 vs Closed 16.1; slow chip buying: Closed slightly
better. The card text says it plainly: "Good if your warehouse fills up" / "Good if your warehouse is empty".

**Second twist: the chip shortage (1979, again 1981).** A risk you can see coming: a 20 s warning, then rationing.
The decision is *how many chips to hold* with money that could have bought a factory. Ignoring the warning costs
little (3%); never holding stock costs a lot (§5). It makes the "buy cheap" game have stakes beyond pennies, and
it is the reason *Standing order* is not a free win: it buys only when empty, at any price, during the rationing too.

**Tried and cut: selling shares (1980).** Money for a share of all future sales. In every variant (10–50%, early
or late, company valued at 2–30 min of sales) the effect on finish time was 0–3%: by 1980 money only buys
factories whose cost grows, and operations gate the cards. The IPO stays a story beat ("forty millionaires").
The 1983 price war and the Osborne effect also stay as ledger lines; both would need a model-launch system again.

## 5. Pacing (smart bot, Open, seed 1)

| Time | What is new | Speed | Price | Chip | Build/s |
|---|---|---|---|---|---|
| 0:00 | Build button, warehouse, price, chips (40), $1,300 | 3.0×10⁷ | $400 | $100 | hand |
| 0:10–0:45 | Workbenches; Eight bits (0:42) | 1.3×10⁸ (1:00) | $128 | $85 | 5.5 |
| 1:00–2:00 | Adverts; Magazine cover (1:23); $25 chip (1:59) | 5.1×10⁸ (2:00) | $338 | $38 | 11 |
| 2:41 / 3:25 | Chips by the tray; Computer shops | 1.1×10⁹ (3:00) | $346 | $39 | 16 |
| 4:13 | Computers in a box: factories | 1.8×10⁹ (4:00) | $807 | $30 | 20 |
| 5:07 | **Open or closed** | 3.4×10⁹ (5:00) | $239 | $27 | 80 |
| 5:55 | A faster chip | 7.0×10⁹ (6:00) | $163 | $25 | 128 |
| 6:53 | A spreadsheet → **first shortage** (~7:15–8:15) | 2.1×10¹⁰ (7:00) | $193 | $12 | 183 |
| 7:40 / 8:40 | Games at home; Sixteen bits (crates of 5,000) | 4.2×10¹⁰ (8:00) | $374 | $26 | 316 |
| 9:29 | Offices → **second shortage** | 9.0×10¹⁰ (9:00) | $332 | $10 | 392 |
| 10:02 / 10:35 | Standing order; Sales manager | 2.1×10¹¹ (10:00) | $1,160 (offices pay more) | $13 | 473 |
| 11:10 / 11:47 | For the masses (glut); Thirty-two bits | 3.3×10¹¹ (11:00) | $1,331 | $9 | 536 |
| 12:02 | **Goal**; advert at once; final card at 12:31 | 1.14×10¹² (end) | ~$800 | ~$3 | 1,197 |

Arrive 3×10⁷/s with 6×10⁸ operations and $1,300; end 1.1–1.2×10¹² (×38,000, one doubling every ~50 s).
About 200,000 computers in homes at the end. Speed never drops (checked every step).

**Why lazy play loses (5 seeds each, minutes; Open / Closed):**

| Player | Open | Closed | vs smart |
|---|---|---|---|
| Smart (nudges price toward ~5 s of stock, buys chips on dips and before shortages, adverts when they cost ≤ half a factory) | 12.3–12.7 | 12.1–12.5 | — |
| Never touches the price ($400 until the sales manager) | 14.9 | 16.1 | +19% / +31% |
| Never advertises | 14.7 | 15.8 | +17% / +28% |
| Buys one batch only when chips hit 0 (3 s to react) | 14.5 | 14.3 | +16% / +17% |
| Keeps 12 s of chips, ignores dips and warnings (a decent casual) | 12.8 | 12.6 | +3% |
| All three lazy habits together | 28.7 | 31.7 | +130% / +158% |

Where it goes: a fixed $400 means an empty warehouse early (money thrown away, fewer factories) and a full one
from minute 6 (homes only grow as fast as buyers at $400). No adverts means the price must fall to keep buyers,
so less money. Waiting for chips idles the factories ~15% of the time before *Standing order*, and rationing
catches you with nothing in stock.

## 6. Prototype numbers (honest)

`node sim.mjs --p "$(cat final.json)"`, 5 seeds × 6 bots × 2 choices. Targets vs results:
- Smart play 12–14 min: **12.1–12.7** (at the low end; raise the goal 10% to centre it at ~13).
- Arrive 3×10⁷, end 1–2×10¹²: **1.14–1.16×10¹²**.
- Each naive bot ≥ 15% slower: **16–31%** (chip-when-empty is the tightest, 16–17%).
- Nothing new ≤ 45 s: **≤ 28 s** counting producer and advert purchases; **≤ 51 s counting only cards**
  (the gaps before *Sixteen bits* and *Offices*). Story beats must fill those: not hit with cards alone.
- Speed never drops: **yes**. Lazy (all habits) still finishes: **yes, 29–32 min**, which is probably too harsh (§7).
- Not modelled: story beats, the real engine's reveal queue details, human click fatigue, offline time.

## 7. Engine, risks and what I would cut first

**New engine concepts** (all data-driven): `warehouse` (batches), `price` (+ step rule), `buyers` (market,
groups as `buyersMul` effects, `adverts`), `chips` (stock, batch size, price process with a seeded wobble kept in
the save, events `shortage{warn, len, mul, ration}` / `glut` triggered by cards), effects `genMul`, `chipMul`,
`batch`, `autoChips`, `autoPrice`, `openBonus`. Offline: no chip buying unless *Standing order*; the wobble is
replayed from the seed. Save version +1, Stage 3 saves restart Stage 3 (the old models/series can't map).

**Risks**
1. *Chip chore.* Before *Sixteen bits*, a smart player at 300 computers/s buys a 500-batch ~every 1.5 s
   (minutes 7–8.6). Paperclips players accept this with wire, but it may grate. Fix: hold-to-repeat on the
   chip button (6/s, like the main button), or crates one card earlier (costs ~1 point of the chip penalty).
2. *Lazy is 2.3–2.6× slower.* The fixed price dominates. Make the price line say "Warehouse empty: you could
   charge more" / "Warehouse filling: lower the price" in bold (no pop-up). Expect real players near the
   "decent casual" row.
3. *Late prices rise* ($1,100–1,300 when offices arrive). Defensible (offices paid IBM prices) but not the
   falling-price story. If it matters, offices give 1.5× buyers and *For the masses* adds 1.5× buyers.
4. *Money is weak late* (the reason shares failed): after minute 9, operations gate progress. Advert finale
   in dollars gives money one last job; keep it under ~25 s of income or poor players stall (at $8 M, no-advert
   Closed waited 4 min).
5. *Open or closed* is 1.5% apart for smart play: fine as a style choice, but if players always pick Closed, lift
   Open to +1% per 1,200 homes.

**Cut first, in order:** the chip glut (flavour only), the second shortage (keeps one), *Chips by the tray*
(merge into *The $25 chip*), then *A sales manager* (but then the fixed-price penalty stays to the end: fine).
Never cut: warehouse, price, chips, adverts, the four chip generations, *Standing order*.

## 8. Story (log only, anchors kept)
Opening: the codebreaker (~55) leaves the division and counts $1,300 in a garage (1971-12). First sale: a dentist
in Ohio (his computer "keeps counting in his house, and the ledger counts it as yours"). 1974: the Bletchley secret
comes out. 1975: the first clerk's grandson joins. Shortage lines (check dates): "1979: memory chips are rationed;
the makers in Japan cannot keep up" / "1981: the new office computer has bought every chip in the valley".
1980: the company sells shares, forty millionaires. 1982: "For the masses, not the classes". 1983: the price war,
cartridges buried in the desert (log only). After the goal: Petrov (hush 20 s). 1984-01: the advert, then
"a computer anyone can use" says hello; the ledger passes to the grandson.
