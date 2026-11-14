# 05 — UX: desktop layout (ledger, money, width)

Player feedback: (1) the ledger is below the fold, so the story is lost while playing; (2) money has no clear home;
(3) wasted width. Desktop first (1280–1600 × ~800), phones must still work. Today: 72rem single centred column.

## Options considered
| | Layout | Verdict |
|---|---|---|
| A | Three columns: core + Your lab · Ideas · Ledger | Core squeezed into a third. Panels of different heights leave ragged gaps. No. |
| B | Ledger as a fixed bottom strip under everything (3–4 lines) | Always visible, but only a few lines, and it steals height that is already short at 800 px. No. |
| **C** | **Play area on the left; the ledger a full-height column on the right that never scrolls with the page** | Ledger readable at every moment, nothing shoves it, width is used. **Chosen.** |

## Chosen layout at ~1440 × 900
```
| Feb 1953 · You are: Head of computing services      (◐) |  THE LEDGER                    [New lines ↑] |
|---------------------------------------------------------|  ▌Mar 1953  An insurer buys time on the night |
| SAVE UP  Run 1.30 billion operations in total…  78.7 M |  ▌           shift. It pays for every second.  |
| ███████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ |   Jan 1953  Magnetic tape. The machine can    |
|                                                         |             remember a whole census.         |
|       ■ You have                  ■ Money               |   Jun 1952  …                                |
|  1.23 million operations       $4.52 million            |   Nov 1951  …                                |
|  +31,200 per second (25% sold)  +$3,120 per second      |   ── Stage 2 · The computing lab ──          |
|        · +40 per click                                  |   Feb 1946  Philadelphia. ENIAC …            |
|  Made since 1946: 78.7 million                          |   …          (scrolls on its own)            |
|  The lab: as fast as 6.2 ENIACs · weather in about 4 min|                                              |
|              [  Run a calculation  ]  +40               |                                              |
|                                                         |                                              |
| YOUR LAB                   | IDEAS                      |                                              |
|  Bletchley Park… LEGACY    |  [Time-sharing    ■ $2.00 M]                                              |
|  Computers 12 [Buy 41.2 K] |  [Programs in memory 900 K]|                                              |
|  Mainframes 2 [Buy ■ $864K]|  …                          |                                              |
| SELL COMPUTER TIME         |                            |                                              |
|  Sell [0%][25%][50%][75%]  |                            |                                              |
<-------------------- ~920 px, page scrolls ------------> <------- 28rem (448 px), fixed, full height --->
```
At 800 px tall the header, goal and core take ~420 px, so ~380 px of panels are visible with the ledger beside them.

## Breakpoints
| Width | Layout |
|---|---|
| ≥ 85rem (1360 px) | Page max 100rem (1600 px), centred. Ledger 28rem fixed on the right. Counters 2.5rem. Lab / Ideas two columns. |
| 64–85rem (1024–1360, incl. 1100 laptops) | Same, ledger 22rem, both counters 2rem (so "123 million operations" fits a half column). |
| 40–64rem (tablet) | Single column as today. Ledger sits in the flow right after the core, fixed `height: 18rem`, own scroll. |
| < 40rem (phone) | As tablet, ledger `height: 13rem` (about 5 entries), the two balances stack. Main button stays the fixed bottom bar. |

## index.html: what moves
1. `#ledger` moves out of the end of `<main>` to **directly after `#core`** (before `#columns`), and becomes
   `<aside id="ledger" class="panel" aria-labelledby="ledger-title">`, with `<h2 id="ledger-title">The ledger</h2>`,
   then `<button id="log-new" class="link-btn" data-action="log-top" hidden>New lines ↑</button>`, then `<ol id="log">`.
   On desktop it is `position: fixed`, so its DOM place only matters for tablet/phone, where it should follow the counter.
2. In `#core`, wrap the counters in `<div id="balances">` with two cells:
   - `<div class="balance">`: `#have-caption`, `#counter`, `#rate` (moved up from after `#money`).
   - `<div class="balance" id="money" hidden>`: `<div class="caption"><span class="swatch swatch-money"></span>Money</div>`,
     `<div class="counter" id="money-text"></div>`, `<div id="money-rate" class="rate"></div>`.
   `#total`, `#team`, `#click-wrap` stay after `#balances`, in that order. Everything else in index.html stays.

## ui.js (small, needed by the layout)
- `renderMarket`: `#money-text` gets only `money(s.dollars)`; new `#money-rate` gets `+$N per second` (empty when 0).
- `resetStage`: `document.body.classList.toggle('has-market', !!st.market)` (decided once per stage, never mid-stage).
- Dollar costs: wherever `price()` fills a `.cost` / `.card-cost`, toggle class `dollars` when `item.currency === 'dollars'`.
- `renderLog`: see "Ledger behaviour". Add `log-top` to the click handler: `$('log').scrollTop = 0`.

## CSS (concrete rules)
```css
body { max-width: 100rem; padding: 0 1.5rem 6rem; --ledger-w: 28rem; --k-money: var(--ok); } /* --k-money on body, not :root, so era --ok overrides reach it */
@media (min-width: 64rem) {
  body { padding-right: calc(var(--ledger-w) + 3rem); }
  #ledger { position: fixed; top: 0; bottom: 0; margin: 0; width: var(--ledger-w);
    right: max(1.5rem, calc((100vw - 100rem) / 2 + 1.5rem));
    display: flex; flex-direction: column; border-width: 0 1px; animation: none; }
  #log { flex: 1; min-height: 0; max-height: none; }
}
@media (min-width: 64rem) and (max-width: 85rem) { body { --ledger-w: 22rem; } #counter, .counter { font-size: 2rem; } }
#log { overflow-y: auto; overscroll-behavior: contain; overflow-anchor: none; }
#ledger h2 { display: flex; justify-content: space-between; align-items: baseline; } /* #log-new sits inside this row */

#core { padding: 1rem 0 1.25rem; }
#balances { display: grid; grid-template-columns: 1fr; gap: 0.5rem 2rem; }
body.has-market #balances { grid-template-columns: 1fr 1fr; }
.counter { font-family: var(--font-num); font-weight: 700; font-size: 2.5rem; font-variant-numeric: tabular-nums; }
.caption { font-size: 0.85rem; font-weight: 700; color: var(--muted); }            /* same as #have-caption */
.rate, #rate { font-family: var(--font-num); font-size: 1.05rem; min-height: 3rem; } /* 2 lines reserved */
.swatch-money, .cost.dollars::before, .card-cost.dollars::before { background: var(--k-money); }
.cost.dollars::before, .card-cost.dollars::before { content: ''; display: inline-block; width: .6rem; height: .6rem; margin-right: .35rem; }
/* reserve the slots so lines appearing later never push the button down */
#rate[hidden], #total[hidden], #team[hidden], body.has-market #money[hidden] { display: block !important; visibility: hidden; }
#team { min-height: 1.45em; }

@media (max-width: 64rem) { #ledger { height: 18rem; display: flex; flex-direction: column; } #log { flex: 1; max-height: none; } }
@media (max-width: 40rem) { #ledger { height: 13rem; } body.has-market #balances { grid-template-columns: 1fr; } .counter { font-size: 2rem; } }
```
Remove old `#log { max-height: 22rem }` and `#money { font-size: .95rem }`. Era palettes untouched (existing tokens only).

## Money
A second balance beside "You have", same caption style, same counter font, size and weight, its own swatch
(`--k-money`, the existing green). Under it its own rate line, parallel to the operations rate. Dollar prices in
Your lab and on cards carry the same swatch, so the eye links "where it piles up" with "where it is spent".
In a stage with a market the Money slot is reserved from the stage's first frame (invisible until selling opens), so
"You have" is in its final place from the start and nothing moves in 1951. Stage 1 has one centred balance, as today.

## Ledger behaviour
- **Height:** desktop = full viewport height, always on screen, independent of page scroll. Tablet 18rem, phone 13rem.
- **Order:** newest on top (already so). It scrolls on its own; scrolling it never scrolls the page (`overscroll-behavior`).
- **Newest visible:** if `#log.scrollTop` is 0 (≤ 8 px) when a line arrives, it stays at the top and the new line shows.
  If the player has scrolled down to read, keep their place (save `scrollHeight - scrollTop` before `replaceChildren`,
  restore after) and show `#log-new` "New lines ↑" in the heading row; clicking it, or scrolling back to the top, hides it.
  The button's slot is in the heading row, so showing it moves nothing. Never auto-scroll while the player reads.
- **New-entry highlight:** the newest entry has a permanent 3px `--accent` left rule (`#log li:first-child`); it moves
  to the next line when a newer one comes. `.fresh` keeps today's 0.4 s `appear`, plus a `--bar-bg` background that fades
  out over 2 s, once. No looping, no glow. Reduced motion: only the static rule. The divider row gets no rule.
- **Width:** date column stays 5.5rem; text wraps. Ending dimming hits `#columns` only, so finale lines stay readable.

## Risks
- Above 1600 px a classic (Windows) scrollbar puts the ledger ~8 px off (`100vw`). Harmless.
- Reserved blank lines (rate, total, team) at the very start of Stage 1 leave ~3 empty lines under the counter for a few seconds. Calm, and the price of a button that never moves.
- Two equal counters say "two currencies of equal weight". True in Stage 2; re-check for later stages.
- Green money vs. the green READY goal tag: the word "Money" is always written next to it, and selling stops at the goal, so they rarely meet. `--k-money` is its own token if a later era needs to split them.
- The goal bar now spans only the left column; its long text wraps earlier at 1024–1100 px. Check that `#goal` height stays fixed during a stage.
- `renderLog` rebuilds the list on each new line; the scroll restore must run in the same frame or the list will jump once.
- Test at 1280×720 (smallest laptop): core + goal must still leave the first producer row visible above the fold.
