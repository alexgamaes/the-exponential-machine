# Stage 3 — Systems and numbers (Nov 1971 → ~1984)

Systems designer. Names are placeholders for the historian/plot. Every number below comes from the real Stage 2 sim
(`node sim/simulate.mjs`) plus a Stage 3 prototype that plays these exact rules with bots
(scratchpad `s3.mjs` and `stage3-table.json`; the bot is the same shape as the sim's `decide`/`chooseSell`).

## 1. Arrival, end rate, doubling time
**What Stage 2 hands over** (12 runs: 6 profiles × 2 choices, measured at "Pass the ledger on"):
| | min | typical | max |
|---|---|---|---|
| Legacy rate (ops/s) | 2.82×10⁷ | **3.0×10⁷** | 3.30×10⁷ |
| Operations in hand | 6.0×10⁸ | **6×10⁸** (≈ 20 s of rate earned during the ending lines) | 6.9×10⁸ |
| Dollars in hand | $0.7 M | $3 M | $14 M (players who never moved the 25% setting) |

`stage.arrival = { legacyRate: 3e7, ops: 6e8, dollars: 1300, lifetime: 2.5e9, clicks: 2000, time: 1400 }`.

**Stage 2's dollars are not carried.** They vary ×20 between players, and dollars buy producers in Stage 3, so a $14 M start
would skip ~4 minutes. Story fit: the lab's budget belonged to the company; you leave with nothing. `dollars` resets to
**$1,300** at `enterStage` (Apple's start-up money from a VW bus and an HP-65 calculator; historian to confirm).
Ledger line, e.g. "You hand back the division's budget. In a garage, you count what you have: $1,300."

**End rate: about 2×10¹² ops/s** (sim 1.6–2.2×10¹², most runs 2.0–2.2). 05's 10⁸ is stale (Stage 2 already ends at 3×10⁷).
Fact check: ~10 million personal computers by 1984 × ~0.3 MIPS ≈ 3×10¹²: realistic.
**Doubling time:** Stage 2 grew ×1,300 in 11.8 min (one doubling every ~69 s). Stage 3 grows ×7×10⁴ in ~12 min:
**one doubling every ~45 s.** The game speeds up again. ⚠ 05 §3's later end rates (10¹¹, 10¹³ …) must move up: Stage 4 should aim at ~10¹⁶.

## 2. The mechanic: candidates
| | A. Price tag vs a demand curve (+ computers in homes) | B. Software that multiplies every machine | C. User base + word of mouth |
|---|---|---|---|
| Decision | Pick the price: more computers sold vs more money per sale | Split engineers: new hardware vs software for the base | None by itself: growth is passive |
| Changes over the stage? | Yes: flips each time a market opens (demand jumps) or a factory opens (supply jumps) | Weakly: software late, hardware early (one switch) | — |
| Bot can play it | Yes: score 4 prices (formula §3.4) | Yes | — |
| Not clicking | Yes | Yes | Yes |
| Copy of Stage 2? | No: no operations are diverted; the trade-off is volume vs margin, set by supply and demand | Yes: a split slider in disguise | — |

**Recommendation: A, with C folded in** (sold computers bring more buyers, so a low price also pays later) and B kept as card
flavour (BASIC, the spreadsheet, the mouse make *every* computer already sold more useful).
Fits the role: a garage founder's one real decision is the price. Real prices give the four tags:
$299 (C64 by 1984, Atari) · $599 (Altair assembled, C64 at launch) · **$1,299 (Apple II, the default)** · $2,499 (Macintosh).

## 3. Rules and formulas (recommended)
### 3.1 Two balances, clean roles
- **Dollars build things** (both producers). **Operations buy ideas** (all ops cards) and the finale.
- Your **speed comes from computers in homes**: every computer you have sold keeps computing for you
  ("the ledger counts them all"). No operations are ever converted into money.

### 3.2 Producers (both paid in dollars, both make *computers per second*, not operations)
| Producer (button) | Appears | Base cost | Growth | Output |
|---|---|---|---|---|
| Workbenches — "Set up a workbench" | 0:00 ($1,300 in hand buys the first) | $1,000 | ×1.25 | 1 computer/s |
| Factories — "Open a factory" | card 5 ("A computer in a case", 1977) | $50,000 | ×1.15 | 20 computers/s |

Typical end: 40 workbenches, 55 factories, ~750,000 computers in homes.

### 3.3 Formulas (per tick, only while `phase === 'playing'`; selling stops at the goal, like Stage 2)
```
capacity = Σ makers × output × producerMul × globalMul                      (computers/s)
demand(P) = (Σ arrived markets + 0.0015 × homes) × demandMul × (1299 / P)^0.5 (computers/s)
sold      = min(capacity, demand(P))
homes    += sold × dt
dollars  += sold × P × priceMul × dt
rate      = legacy + homes × 50,000 × homeMul × globalMul                    (ops/s; legacy outside multipliers)
```
Elasticity 0.5: at $299 four times cheaper buys only 2.1× more computers, so a high price always earns more *money* and
a low price always places more *computers*, unless supply runs out first. Then the best price is the highest that still sells out.

**Markets** (reuse `market.customers`: a ledger line + demand at $1,299, computers/s):
hobbyists 6 (start, the 4004 advert) · clubs 20 (cover +6 s) · computer shops 10 (club +35 s) · schools 150 (case +20 s) ·
offices with spreadsheets 300 (+6 s) · families and games 400 (+6 s) · every office desk 800 (IBM PC +8 s).

### 3.4 Bot rule (sim `choosePrice`, sibling of `chooseSell`)
```
vHome   = 50,000 × homeMul × globalMul × 60          // one computer sold = its operations over the next minute
capPer$ = max(workbench output / cost, factory output / cost)   (with multipliers; 0 if none unlocked)
v$      = capPer$ × 30 × vHome                        // a dollar = capacity it buys, run for 30 s
score(P) = sold(P) × vHome + sold(P) × P × priceMul × v$     → pick the best of the 4; change only if ≥ 10% better
```
`--price 1299` keeps the default forever (the "never touches it" player). Dollars: buy the producer with the most
computers/s per dollar, unless a dollar card is open (save for it). Operations: cards only, then the finale.

### 3.5 Prototype results (goal 7×10¹³, choice × 4 price players × 4 reaction times)
| Player | For the masses | For business |
|---|---|---|
| Smart price (rule above) | 11.9–12.3 min | 12.0–12.4 min |
| Never touches it ($1,299) | 13.2–13.7 | 14.1–14.4 |
| Always cheapest ($299) | 13.0–13.3 | 12.8–13.2 |
| Always dearest ($2,499) | 15.3–15.5 | 16.8–17.0 |
The smart bot changes price 15–23 times. The best price moves: $299 in the garage (demand-limited) → $2,499 when the first factories
open → $299 → $1,299/$2,499 as each market arrives → $1,299 at the end. Longest quiet stretch (any purchase, card or market line) ≤ 43 s;
longest stretch between cards or market lines 53–61 s (story beats fill these). Clicks (5% of legacy = 1.5 M) never matter.
Honest caveat: "always cheapest" is only 5–8% slower than smart. If playtests find the decision too soft, raise elasticity to 0.6 or raise late markets.

## 4. Upgrades (15; ops cost ≈ 0.8 × reveal threshold, so each costs ~20–40 s of saving)
| # | Placeholder (date) | Cost | Effect | Reveal (made this stage) | Bought ~ |
|---|---|---|---|---|---|
| 1 | An 8-bit chip (8080, 1974) | 6×10⁸ | Computers in homes 1.5× faster | 0 (carried ops pay it) | 0:00 |
| 2 | A kit on a magazine cover (Jan 1975) | 2×10⁹ | Workbenches build 1.5× more; opens "clubs" | 2.5×10⁹ | 0:55 |
| 3 | BASIC for the kit (1975) | 7.2×10⁹ | Computers in homes 1.5× faster | 9×10⁹ | 1:45 |
| 4 | A club in a garage (1975–76) | 2×10¹⁰ | Workbenches build 1.5× more; opens "shops" | 2.5×10¹⁰ | 2:35 |
| 5 | A computer in a case (1977) | 5.6×10¹⁰ | Unlocks factories; opens "schools" | 7×10¹⁰ | 3:50 |
| 6 | A floppy disk drive (1978) | **$1 M** | Computers in homes 1.5× faster | 1.1×10¹¹ | 4:15 |
| 7 | A spreadsheet (1979) | 2.24×10¹¹ | Computers in homes 1.5× faster; opens "offices" | 2.8×10¹¹ | 5:10 |
| 8 | **The choice** (1980) | 4.48×10¹¹ | see below | 5.6×10¹¹ | 5:50 |
| 9 | Cheaper chips (own chip plant) | 8.96×10¹¹ | Factories build 1.5× more | 1.12×10¹² | 6:35 |
| 10 | Games at home (1980–82) | 1.76×10¹² | Computers in homes 1.25× faster; opens "families" | 2.2×10¹² | 7:30 |
| 11 | IBM's PC (Aug 1981) | 3.52×10¹² | Everything 1.25× faster; opens "every desk" | 4.4×10¹² | 8:25 |
| 12 | 16-bit chips (1982) | 7.04×10¹² | Computers in homes 1.5× faster | 8.8×10¹² | 9:25 |
| 13 | Price war (1983) | **$30 M** | Factories build 1.5× more | 1.28×10¹³ | 9:25 |
| 14 | A hard disk and a big spreadsheet (1983) | 1.44×10¹³ | Computers in homes 1.25× faster | 1.8×10¹³ | 10:20 |
| 15 | A mouse and windows (1983) | 2.2×10¹³ | Computers in homes 1.25× faster | 2.8×10¹³ | 11:10 |
| G | **Goal** (e.g. "A computer in every home"; Time's Machine of the Year, Jan 1983) | — | Everything 3× faster | **7×10¹³ made since 1971** | ~11:40 |
| F1 | Finale 1 (e.g. launch the 1984 computer) | 3×10¹³ ops | — | after goal | +5 s |
| F2 | Finale 2 | 3×10¹³ ops | — | after F1 | +14 s |
At the goal you hold ~2×10¹³ ops, so F1 is ~5 s away and F2 ~14 s after it (Stage 2: 6 s and 14 s). Cards 9–15 are the late cards.

**The choice** (sim ids kept: `machines`/`people`), the same trade-off as the price tag, made permanent:
- **For business** (`machines`): every sale earns 1.5× more money (`priceMul 1.5`). Favours high prices and factories.
- **For the masses** (`people`): 1.5× more buyers at every price (`demandMul 1.5`). Favours low prices and homes.
Balanced: 11.9–12.3 vs 12.0–12.4 min with smart pricing; business punishes a never-touched price more (14.1 vs 13.4).

Speedometer (numbers only; plot names it): a task of ~8×10¹³ ops runs ~30 days at the start and ~37 s at the end.
"Looking nine moves ahead in chess" (35⁹ ≈ 7.9×10¹³ positions) fits; Belle, 1980. Comparison unit: the Cray-1 (1.6×10⁸/s, 1976):
0.2 Cray-1 at the start, ~13,000 at the end ("You are now faster than a Cray-1" at ~1:10).

## 5. Engine changes (small, data-driven, all optional per stage)
1. **`stage.homes = { output: 5e4 }`.** `getRate += s.homes × output × fx.mul.home × fx.globalMul`. Upgrades target it with
   the existing `producerMul` (`target: 'home'`). Producers with `makes: 'computers'` are left out of `getRate`.
2. **`stage.market.kind = 'price'`** (Stage 2 stays `'sell'`): `prices: [299, 599, 1299, 2499]`, `defaultPrice: 1299`,
   `refPrice: 1299`, `elasticity: 0.5`, `wordOfMouth: 0.0015`, `customers` as today (demand in computers/s).
   New: `capacity(s)`, `demandAt(s, P)`, `priceFlow(s)` → `{ capacity, demand, sold, dollarsPerSec }` per price for the panel,
   `setPrice(s, P)`. `tick` adds homes and dollars instead of splitting ops. `sellShare` returns 0 for this kind.
3. **New effect `demandMul`**; existing `priceMul` multiplies dollars per sale.
4. **`currency: 'dollars'` on both producers** (already supported). The sim's `decide` must buy dollar producers by
   output per dollar when there is more than one (today it buys "the" dollar producer).
5. **Dollars at stage start:** `enterStage` sets `s.dollars = st.startDollars ?? 0` (Stage 2 already starts at 0).
6. **Save v4:** new fields `homes: 0`, `price: 1299`; migrating v3 fills defaults. Offline: homes grow in `applyOffline` (same tick).
7. **Sim:** `WINDOWS[3]` = holder/active/average [10, 15, 45], greedy [10, 17, 45], casual [10, 16, 50], idle [10, 18, 50];
   `choosePrice` (§3.4), `--price` flag, `stage.arrival` from §1. Checks stay: speed never drops (homes only grow).

## 6. Risks
- Rate grows between purchases (homes keep arriving), so card ETAs computed at a fixed rate run ~10–20% pessimistic. Acceptable,
  or compute ETA with the current `sold × home output` slope.
- The panel must make supply vs demand obvious: "You make 1,940 a second. At $1,299 buyers want 3,190 → you could charge more."
- Retroactive card effects (old kits get faster) are a simplification: read them as "people upgrade".
