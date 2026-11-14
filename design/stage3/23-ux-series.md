# Stage 3 screen: series and programs (UX spec, Nov 14)

Builds `22-depth-design.md` (with §6: "series", no restart button) into an exact screen. Engine names follow the
work in progress in `src/engine.js` (`s.series`, `s.design`, `labRatio(s, kind)`, `labPhase`, `launchBlock`,
`saleValue`, `retoolLeft`, `programRate`, `carried`). Layout rules from `review/05-ux-layout.md` still hold.

**Measured today (1366×768):** the left column is ~413 px wide (≈ 44 characters of body text per line). The goal bar is
sticky (~88 px), so about **570 px** of a panel is visible at once on a 768 px laptop. The market panel is 497 px today.
**Budget for the new panel: ≤ 570 px at 1366 wide** (check `#market` height with puppeteer; table in §1.6).

Mockup notation: `*text*` = bold. `[ ... ]` = button. `###` bar fill, `...` empty bar. One mockup line = one screen line
at 1366 wide.

## 1. "Your computers on sale" panel

### 1.1 The whole panel (Closed, ~9:00, two series, the launch rush still on)
```
+--------------------------------------------+
| *Your computers on sale*  Model 9 · Series 2|   h2 left bold, right normal
| 500 a second                               |   chart, 3.5rem tall
| ##                                         |   bars: filled = sold, outlined = turned away
| ##%%%%                     you can make 240|   dashed line = what you could make, per moment
| ##%%%%%%%%-------------------------------- |
| ############## . . . . . . . . .           |   dotted = buyers expected if you wait
| Buyers 310 a second · you can make 240     |   numbers line (normal)
| *Short of computers: 70 buyers a second go |   verdict (bold) + fix (normal),
| *home.* The launch rush will fade.         |   2 lines reserved
| - - - - - - - - - - - - - - - - - - - - - -|
| *Next model: 1.3× as fast*    Slowing down |   head: left bold, right normal
| [#################..........]              |   bar
| [ Launch Model 10                        ] |
| Runs all 4,210 programs of Series 2.       |   note, 2 lines reserved
| Building slows for 20 s.                   |
| - - - - - - - - - - - - - - - - - - - - - -|
| *New series: 2.1× as fast*  Improving fast |
| [#########...................]             |
| [ Launch Series 3                        ] |
| *Worth 0.3× a next model.* Runs none of    |   note, 3 lines reserved
| your 4,210 programs (Closed: keeps 3,370). |
| On the $25 chip. Building slows for 30 s.  |
+--------------------------------------------+
```

### 1.2 Header
| Element | Text | Notes |
|---|---|---|
| `h2` left | `Your computers on sale` | as today |
| `h2` right (`#model-tag`, normal weight, tabular) | `Model 3` before programs; `Model 9 · Series 2` from "A language for kits" on | Changes only at a launch |

Removed from the panel: the "Now selling: …" line (the header says it), the chart caption line, the "Selling 6 a
second, $5,700 a second" line (money per second is already under Money), "This chip allows up to 1.8×" (the bar's
end is the limit), and the "Buyers: hobbyists, …" line (each new group of buyers is announced in the ledger).

### 1.3 The supply line (the most important text in the stage)
Two parts. **Numbers line** (`#supply-nums`, normal, 1 line): always `Buyers {B} a second · you can make {M}`.
While switching over: `Buyers {B} a second · you can make {M} (soon {Mfull})`.
**Verdict** (`#supply-verdict`, 2 lines reserved): a bold sentence that names the state, then a normal sentence that
names the fix. Each text ≤ 84 characters, so it fits in 2 lines at 1366 wide.

| State (checked in this order) | Bold part | Normal part (the fix) |
|---|---|---|
| Nothing can build | `Nobody can build one yet.` | `Set up a workbench.` |
| Switching over (`retoolLeft > 0`) | `Switching over to Model {n}: {t} s left.` | `It is the cost of a launch.` |
| Short of computers (buyers > make × 1.05) | `Short of computers: {B−M} buyers a second go home.` | first 60 s after a launch: `The launch rush will fade.` · else, before factories: `Set up a workbench.` · after: `Open a factory.` |
| Short of buyers (make > buyers × 1.05) | `Short of buyers: {M−B} computers a second not made.` | `Launch, or hire programmers.` · before programmers exist: `Launch Model {n+1} to bring buyers.` · next model not ready yet: `Launch Model {n+1} when it is ready.` |
| Even | `Making and selling are even.` | (empty) |

- Why "hire programmers" fixes idle factories: buyers grow with a series' boost (`buyers × boost^0.4`). The Programmers
  row says so (§2.2), so the fix is not magic.
- **No flicker:** the state is recomputed once a second. A new state replaces the shown one only after it has held for
  **2 s in a row**. Exception: "Switching over" shows at once after a launch (the player just acted).
- The word "retooling" is never shown; the player-facing words are "switching over" and "building slows".

### 1.4 The chart: keep it, smaller
Now that buyers and factories cross ~20 times a stage, the chart is the only place the launch wave and its cost are
visible. Keep it, but make it earn its height:
- Height **3.5rem** (was 5.5rem). The caption line is removed; the scale label in the top-left reads `{top} a second`.
- Each bar (2 s slot) is split: the part up to what you could make in that slot is **filled** (`--accent`, sold), the
  part above is **outlined only** (1px `--accent` border, `--surface` fill: buyers turned away). Store the
  capacity per slot next to `s.sales`.
- The dashed line is now the **history** of what you could make (a step line: it drops to 25% at a launch and climbs
  back), not a flat line. Its label stays at the right end, `you can make {M}`, bold, as today.
- The dotted "expected buyers" line stays. Redraw only when a slot is added or the scale moves (as today).
- Fallback if the panel is over budget: drop the chart, never the supply line.

### 1.5 The two launch rows
Both rows have the same 4 parts: **head** (left bold, right normal status), **bar**, **button** (full width), **note**.

Head status words (right side, ≤ 14 characters so the head stays one line at 1366):

| `labPhase` | Next model | New series |
|---|---|---|
| start | `Just started` | `Just started` |
| fast | `Improving fast` | `Improving fast` |
| slowing | `Slowing down` | `Slowing down` |
| limit | `Nearly done` | `As good as it gets` |

**Next model row** (`#lab-next`; always shown)

| Part | Text |
|---|---|
| Head left | `Next model: {r}× as fast` |
| Button | `Launch Model {n+1}` (disabled when blocked: dashed border, as other disabled buttons) |
| Note line 1 | blocked `workbench`: `Set up a workbench first: someone has to build it.` · blocked `lab`: `Ready to launch in {t} s.` · phase `limit`: `Your engineers will ship it themselves soon.` · before programs: `Computers already in homes keep counting.` · else: `Runs all {P} programs of Series {k}.` |
| Note line 2 | `Building slows for 20 s.` |

**New series row** (`#lab-series`)

| State | Head left | Head right | Bar | Button | Note (3 lines reserved) |
|---|---|---|---|---|---|
| Absent | before "A language for kits": the row is not in the DOM flow (`hidden`) | | | | |
| Locked (programs on, no chip) | `New series` | `Needs a new chip` | empty, dashed border | `Launch a new series`, disabled | `A new series needs a new chip: The $25 chip. It is a bigger leap, but none of your programs run on it.` |
| Designing, not ready (`lab`) | `New series: {r}× as fast` | phase word | fills | `Launch Series {k+1}`, disabled | `Ready to launch in {t} s.` / programs line / chip line |
| Ready | same | phase word | fills | `Launch Series {k+1}` | `*Worth {w}× a next model.*` / programs line / chip line |
| Overtaken (`behind`) | same | `Overtaken` | fills | disabled | `Your next models have caught up with it. The lab starts a new design.` |

- **Programs line:** Open (or before the choice): `Runs none of your {P} programs.` Closed: `Keeps {C} of your {P} programs.`
  If a killer program is on the current series and would stay behind (Open): append ` The spreadsheet stays behind.`
  (name of the newest killer program; only if it fits the 3 lines, else drop it: the ledger tells it).
- **Chip line:** `On {chip name}. Building slows for 30 s.` ({chip name} = the newest chip card the design started on:
  `the $25 chip`, `Chips for everyone`, `Rubber keys`.)
- **Worth** = `saleValue(s, 'series') / saleValue(s, 'next')`: what one computer of the new series is worth today against
  one of the next model launched now, programs included. It is the stay-or-leave answer, so it is the only bold text
  in the note. It drops when you launch a next model (the design's lead shrinks): correct, not a bug.
- There is **no "start" or "start again" button.** The design starts by itself at The $25 chip and again right after
  each new-series launch. A better chip moves a young design (< 40%) by itself: the bar goes back to the start and the
  ledger says why (§5). An older design keeps its chip; the next one uses the new chip (ledger says so too).

### 1.6 Height budget at 1366×768 (px, measured on today's styles)
| Part | Lines | Height |
|---|---|---|
| Panel padding + border | | 34 |
| Header | 1 | 48 |
| Chart | 3.5rem | 66 |
| Numbers + verdict | 1 + 2 | 78 |
| Next model row (head, bar, button, note 2) | | 143 + 12 divider |
| New series row (head, bar, button, note 3) | | 165 + 12 divider |
| **Total** | | **≈ 558** (today 497) |
Before programs (no series row) ≈ 380. If the measured total is over 570 px, first cut: chart to 3rem; second: drop it.

### 1.7 What happens on screen at a launch (no pop-up, no confirm, no flash)
| Where | Next model | New series |
|---|---|---|
| Header right | `Model 10 · Series 2` | `Model 10 · Series 3` |
| Chart | clears; bars start again from the left; the dashed line starts at 25% | same |
| Supply line | at once: `Switching over to Model 10: 20 s left.` | same, 30 s |
| Next model row | bar back to empty **without** the width transition (set `transition: none` for that frame); button disabled, note `Ready to launch in 26 s.` | same (the next model now builds on the new series) |
| New series row | worth drops (its lead over the model on sale shrinks) | bar back to empty (new design starts by itself), button disabled, `Ready to launch in 26 s.` |
| Garage | hardware line updates; programs on the series on sale unchanged | the new series takes the next reserved line in the homes grid (no jump), bold moves to it |
| Ledger | one line (§5), with the usual `.fresh` fade | one line, kind `milestone` |
| Screen reader | `announce()` the ledger line | same |

## 2. The garage

### 2.1 "Computers in homes" row
```
| *Computers in homes*                 41,000 |   head (as today)
| Model 9 runs *26×* as fast as Model 1.      |   hardware line (as today)
|                     Homes  Programs  Boost  |   grid header (muted, small)
| Series 1 (Models 1–6) 22,000   3,210  ×6.4  |
| *Series 2 (Models 7–9) 19,000  4,210  ×8.0* |   the series on sale: bold
|                                             |   reserved, empty (visibility: hidden)
| Series 2 gets *+14* programs a second.      |
| Together: *1.1 trillion* operations a second.|
```
- **Grid:** 4 columns (`grid-template-columns: 1fr auto auto auto`, numbers right-aligned, tabular). **3 rows,
  reserved** from the moment The $25 chip is bought (before that no second series can exist, so 1 row). Oldest at the
  top, the series on sale at the bottom of the used rows, bold.
- **4 or more series:** row 1 sums the oldest: `Series 1–2 (Models 1–9)`, homes and programs added, boost = the
  homes-and-speed-weighted average (total output with programs / total output without). Rows 2–3: the two newest.
- **Rate line:** `Series {k} gets +{N} programs a second.` With programmers: `Series {k} gets +{N} programs a second
  ({Q} from your programmers).`
- "Boost" is explained by the card "A language for kits" (§3.2) and the ledger; no extra line on screen.
- Before "A language for kits": only head, hardware line, Together line (today's row).
- Between "A language for kits" and The $25 chip: grid with 1 row `Series 1 (Models 1–4)`, header row, rate line.

### 2.2 Programmers (a normal producer row, under Workbenches/Factories)
```
| *Programmers*                           18  |
| Each writes 0.5 programs a second for the   |
| series on sale. Together: 9 a second. More  |
| programs bring more buyers.                 |
| [ Hire a programmer          ■ $1.10 million ] |
```
- Text: `Each writes {out} programs a second for the series on sale. Together: {N} a second. More programs bring more buyers.`
- Appears 8 s after "A language for kits" (when the grandson arrives), like other producers (row animation `appear`).
- Dollar price with the money swatch, as Workbenches and Factories.

## 3. Phase-in

### 3.1 What is on screen when
| Time | Market panel | Garage | Ideas |
|---|---|---|---|
| 0:00 | header `Model 1`, chart, supply line, next model row | homes row (no grid), Workbenches | Eight bits |
| ~2:50 "A language for kits" | header gains ` · Series 1`; **new series row appears, locked** (`Needs a new chip`) | grid (1 row) + rate line | |
| ~2:58 | | Programmers row | |
| ~4:30 "The $25 chip" | new series row unlocks in place (same height: no jump); design starts by itself | grid reserves 3 rows | |
| ~5:55 | supply fixes say `Open a factory.` | Factories row | |
| ~6:45 | worth and programs line change with the choice | | Open or closed |

Everything new appears at a card purchase or a reveal (once), never at a tick or a launch. The two unavoidable
growths (locked series row at 2:50, programmers row at 2:58) are the same kind as the Factories row today.

### 3.2 Card texts (plain, short; replaces the `text` field)
| Card | Text |
|---|---|
| Eight bits | `Next models leap 0.2× further.` |
| A language for kits | `Owners start writing programs. Each program gives every computer of its series a little boost.` |
| The $25 chip | `A new chip: the lab designs a new series. A bigger leap, but none of your programs run on it.` |
| Open or closed → Open: eight slots | `Anyone can write programs for you: 3× as many. Next models leap 0.2× further. Good if you stay with one series.` |
| Open or closed → Closed: one sealed box | `New series leap 0.5× further and keep 80% of your programs. Outsiders write 0.6× as many. Good if you change series often.` |
| A floppy disk drive | `Programs are written 1.5× faster.` |
| Spreadsheet, Games at home, A whole river in 4K, A spreadsheet that draws | `A program everyone wants: the series on sale gets +0.3 boost.` |
| Chips for everyone, Rubber keys | `A better chip: new series leap 0.6× further. A young design moves to it by itself.` |

## 4. Labels, numbers, weight, widths

### 4.1 Number rounding (all text recomputed at most once a second; bars move smoothly)
| Value | Format | Example |
|---|---|---|
| Buyers, can make, go home, not made (a second) | `fmt(sig2(x), 1)` | `2.5`, `310`, `1,500` |
| Seconds left (switching over, ready to launch) | whole seconds, rounded up | `12 s` |
| Ratios (`as fast`, header of rows, hardware line) | 1 decimal under 10, whole above | `1.3×`, `26×` |
| Worth | 1 decimal; under 0.1: `under 0.1×` | `0.3×`, `1.2×` |
| Programs (grid, notes) | whole under 1,000; 3 significant digits above | `845`, `4,210`, `12,400` |
| Boost | `×` + 1 decimal under 10, whole above | `×8.0`, `×20` |
| Programs a second | `+` + `fmt(sig2(x), 1)` | `+2.5`, `+14` |
| Homes | whole, commas (as today) | `41,000` |

### 4.2 Fixed line counts (min-height in lines, so nothing jumps)
| Element | ≥ 64rem | < 40rem (phone) |
|---|---|---|
| `#supply-nums` | 1 | 2 |
| `#supply-verdict` | 2 | 3 |
| Row head | 1 (no wrap) | 2 |
| `#next-note` | 2 | 3 |
| `#series-note` | 3 | 4 |
| Homes grid | 1 row, then 3 from The $25 chip | same |
| Programmers text | 3 | 4 |

### 4.3 Bold vs normal (bold, never bigger; all text at body size except the grid header and chart labels)
| Bold | Normal |
|---|---|
| Panel title; row head left (`Next model: 1.3× as fast`); verdict's first sentence; `Worth 0.3× a next model.`; button labels; the series on sale in the grid; numbers `26×`, `+14`, Together's total; chart's `you can make` label | Header right; status words; numbers line; the fix; notes; other grid rows; grid header (muted) |

No new colours: existing tokens only (`--accent`, `--muted`, `--surface`, `--soft-border`). The state is carried by
words, not colour.

### 4.4 Phone (< 40rem)
```
+--------------------------------+
| *Your computers on sale*       |
| Model 9 · Series 2             |   header right wraps under the title
| [chart, full width, 3.5rem]    |
| Buyers 310 a second ·          |
| you can make 240               |
| *Short of computers: 70 buyers*|
| *a second go home.* Open a     |
| factory.                       |
| *Next model: 1.3× as fast*     |
| Slowing down                   |
| [#########.......]             |
| [ Launch Model 10            ] |
| ...                            |
```
- Same order and texts; reserved lines per §4.2. Homes grid hides the `(Models 1–6)` part (class `range`).
- The fixed bottom main button bar must not cover the series button: keep today's body bottom padding.

## 5. Ledger lines
| Event | Kind | Text |
|---|---|---|
| Next model launch | `model` | `You launch Model {n}, {r}× as fast as Model {n−1}. {model line}` (as today; the model lines stay) |
| First new series | `milestone` | `You launch Model {n}, the first of Series 2: {r}× as fast as Model {n−1}, but none of the old programs run on it. The shops ask why. Series 1 stops getting new programs; its {H} owners keep using theirs.` Closed: replace "but none … ask why." with "and it keeps {C} of your programs." |
| Later new series | `milestone` | `You launch Model {n}, the first of Series {k}: {r}× as fast as Model {n−1}. None of the old programs run on it. Series {k−1} keeps its {H} computers and {P} programs.` (Closed: `It keeps {C} of your programs.`) |
| Engineers ship a model, first time | `model` | `Your engineers stop waiting for you and ship Model {n}, {r}× as fast as Model {n−1}. It had been ready for a while. {model line}` |
| Engineers ship, later | `model` | `Your engineers ship Model {n}, {r}× as fast as Model {n−1}. {model line}` |
| Design moves to a better chip (extra, needed so the bar reset is explained) | `note` | `The lab starts the new series again on {chip}: a bigger leap, a longer wait.` |
| Better chip arrives late (extra) | `note` | `{chip} arrives too late for the design in the lab. The next new series will use it.` |
| Design overtaken and restarted (extra) | `note` | `Your next models have caught up with the new series design. The lab starts a new one.` |

Numbers in ledger lines use the same rounding as §4.1 (ratios 1 decimal; programs and homes whole, with commas).

## 6. DOM changes for the developer (summary)
- `#models`: remove `#model-now`, `.chart-cap`, `#sales-line`, `#lab-limit`; `#sell-customers` stays hidden in Stage 3.
- `#market-title` becomes a flex row with `<span id="model-tag">`.
- Under the chart: `<p id="supply-nums">`, `<p id="supply-verdict"><b></b> <span></span></p>`.
- `.lab` becomes two blocks `#lab-next` and `#lab-series`, each: `.lab-head` (`b` + status span), `.lab-bar` > fill,
  button (`data-action="launch" data-kind="next|series"`), note `p`.
- `#homes-text`: `#homes-gen`, `<div id="series-grid">` (header + 3 row slots), `#homes-programs`, `#homes-total`.
- All new text goes through `set()` with a 1 s text clock (cache keys as `renderHomes` does today).
