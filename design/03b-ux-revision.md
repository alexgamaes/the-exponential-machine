# 03b — UX revision after the first Stage 1 playtest

Scope: two pieces of player feedback plus a few small clarity fixes. No code here; each item names
the function or element it touches. Pace and feel stay as they are.

---

## (a) Unit confusion in the goal bar and stage meter

**Root cause.** The game tracks three different quantities but only one of them has a name on screen.
The counter shows `s.ops` (checks you can spend). `s.lifetime` (checks ever made) drives half the
unlocks and the stage goal, yet it is **never displayed anywhere**. Counts of clerks and machines are
also used. The goal bar prints bare numbers ("119 / 180"), so the player cannot tell which one it means.

**Decision:** keep one goal bar that can track different quantities (forcing a single kind would hide
the real next step), but **(1)** show both quantities permanently under fixed names, **(2)** always print
a unit after the goal numbers, and **(3)** use two words consistently everywhere:
**"you have"** = spendable, **"in total"** = lifetime. Neither phrase is ever used for the other quantity.

### 1. Counter block: show the lifetime total (index.html `#core`, ui.js core section)
```
            You have
          31,240 checks
     Checked in total: 412,800          <- new line, muted, tabular digits
  +312.5 per second  ·  +12 per click
```
- Add a small "You have" caption above the big number (muted, 0.85rem, bold).
- New `#total` line: `Checked in total: ${fmt(s.lifetime)}`. Show it from the moment the first upgrade
  is bought (from then on, total ≠ balance, which is when the difference matters).

### 2. Goal bar wording (`currentGoal()` returns `text` and a new `unitLabel`; ui prints `have / need unitLabel`)

| Goal kind (source) | Goal text | Numbers on the right |
|---|---|---|
| Upgrade affordable | `Buy "Wren operators"` | `Ready` (no numbers, full bar) |
| Saving for an upgrade (`s.ops`) | `Save up for "Wren operators"` | `You have 5,120 of 8,000 checks · ~40 s` |
| Owned count (`owned`) | `Hire 10 clerks to unlock "Punched sheets"` / `Build 6 machines to unlock "Wren operators"` | `7 of 10 clerks` / `4 of 6 machines` |
| Lifetime (`lifetime`) | `Check 35,000 guesses in total to unlock "Captured codebook"` | `28,400 of 35,000 in total · ~1 min` |
| Clicks (`clicks`) | `Check 10 guesses by hand to unlock "Notes from Poland"` | `6 of 10 by hand` |
| Stage goal | `Check 800,000 guesses in total to build Colossus` | `412,800 of 800,000 in total · ~2 min` |

- Use **"of"**, not "/". "7 of 10 clerks" reads as a sentence, while "7 / 10" reads as a ratio with no unit.
- Name the unlock target (the locked card already shows its name) instead of "something new".
  The suspense is not worth the confusion.
- Verbs map to quantities: **Save up** = balance, **Hire/Build** = counts, **Check … in total** = lifetime.
- `conditionProgress()` already returns `label`. Add a `verb` (`Hire`/`Build`/`Check`) and a short
  `unitLabel` (`clerks`, `machines`, `in total`, `by hand`) next to it, so the goal bar and the locked card
  use the same words. Locked card text becomes: `Needs 35,000 checked in total. You have 28,400.`
- When the goal kind changes, the existing 400 ms flash is enough. Do not animate the bar fill
  backward. Snap it to the new value.

### 3. Stage meter in the header
"Colossus: 31%" is misleading for two reasons: it measures lifetime with no label, and the fill is
`(total/goal)^0.3`, so 31% really means about 2% of the checks. **Drop the percentage.** The label
becomes `Next stage: Colossus` and the bar keeps its curved fill, which reads as "how far through the stage"
and fills at an even pace, as intended. Set the `title`/`aria-label` to the exact number:
`412,800 of 800,000 checks in total`. The exact numbers appear on screen only in the goal bar, at the
end of the stage, when the linear fill is meaningful.

---

## (b) The speedometer line: **fix it** (and the "people with pencils" line)

It is worth keeping. It is the clearest on-screen statement of requirement 4 (the same job keeps getting
faster), and the sim shows a nice arc (8 min 20 s → 1.4 s). It flickers because it is computed from
`effectiveRate()`, which includes the smoothed click rate, so every click and every pause moves it.

**Fix:**
1. **Measure the team only**: use `getRate(s)`, not `effectiveRate(s)`. The value then changes
   **only when the player buys something**, so each change is a reward rather than noise.
2. **Say so in the wording:** `Your team decodes one day's messages in about 33 min`.
3. **Round to a "nice" duration** (new `fmtApprox(sec)` in format.js):
   ≥ 1 h → nearest 10 min ("about 2 h 10 min"); 10 min–1 h → whole minutes ("about 33 min");
   1–10 min → nearest 10 s ("about 4 min 20 s"); 10–60 s → whole seconds; 1–10 s → one decimal ("1.4 s");
   < 1 s → "under a second".
4. **Show from the first clerk** (`rate > 0`), not from `lifetime >= 100`. Before that it would read "forever".
5. **Mark the improvement:** when the rounded text changes, flash the line in `--ok` for 400 ms (same
   style as the goal flash). Optional: a log line at round thresholds ("A day's messages now take under
   an hour."), at most 4 in Stage 1: under 1 h / 10 min / 1 min / 10 s.

**"As fast as N people with pencils" has the same problem** (it uses `eff / personRate`). Apply the same fix:
use `getRate`, round to 2 significant figures (237 → 240, 1,234 → 1,200), and word it as
`Your team works as fast as 240 people with pencils`. It changes only on purchases.

To keep the core block calm, **merge both into one muted line** under the rate:
`Your team: as fast as 240 people with pencils · one day's messages in about 33 min`
(on phones, wrap after the "·").

**Goal ETA (`~1m 40s`)** flickers for the same reason. Keep `eff` there, because it is useful for players
who click, but recompute it **once per second** (not every frame), format it with `fmtApprox`, and
hide it when it is over 1 hour.

---

## (c) Other cheap clarity fixes

1. **`Buy` goal numbers overflow:** when an open upgrade is affordable, `have` > `need` prints
   "250 / 180". Show `Ready` instead (see table).
2. **Goal priority:** if *any* open upgrade is affordable, show `Buy` for it before any `Save up`.
   Today, one unaffordable card makes the bar say "Save up" while another card is already buyable.
3. **Locked card cost:** show the real cost in muted text ("8,000 checks") instead of the word "locked".
   The "Needs … You have …" line already says it is locked, and the cost lets players plan.
4. **Producer description:** "Together: 75 per second." → "Together: 75 checks per second." Same unit rule.
5. **Rate line:** `+312.5 checks per second · +12 per click` → `+312.5 per second · +12 per click`.
   The unit is now directly above, in the counter, and the shorter line wraps less on phones.
6. **Goal numbers on mobile:** give `#goal-nums` `font-variant-numeric: tabular-nums` and its own line
   under 40rem, so longer labels do not push the text around as digits change.
7. **Unit in the floaters stays out** ("+12"). It is fine as is, so this one is a no-change.

### Summary of touched places
- `engine.js`: `currentGoal()` (wording, priority, `unitLabel`, `Ready`), `conditionProgress()` (`verb`, `unitLabel`).
- `format.js`: new `fmtApprox()`, and a 2-significant-figure helper for the people count.
- `ui.js`: "You have" caption, `#total` line, stage meter label/title, merged team line using `getRate`,
  ETA throttled to 1 Hz, locked card cost, producer "checks per second".
- `index.html` / `style.css`: `#total` element, caption, mobile rule for `#goal-nums`.

---

## (d) Goal bar kinds

**Decision:** keep all the kinds, because each is the real next step and hiding count goals on the
locked card would break "always a visible next goal". Instead, give **each kind a fixed identity**
(tag, colour and bar texture) and play a **visible hand-over** when the kind changes. Colour is never
the only cue: every kind also has a word tag and a bar texture, which keeps it colour-blind safe.

| `kind` | Tag (replaces "Next:") | Bar texture | Light `--k` | Dark `--k` |
|---|---|---|---|---|
| `balance` | `SAVE UP` | solid | `#9b1c1c` red ink | `#ff9180` |
| `lifetime` | `IN TOTAL` | solid + diagonal hatch | `#1f3f8f` blue ink | `#8fb4ff` |
| `owned` | `TEAM` | segmented, one block per clerk/machine | `#8a4b00` brown | `#f2b45a` |
| `clicks` | `BY HAND` | segmented | `#5b2a86` purple | `#c9a2f0` |
| `ready` | `READY` | solid, full | `#1d5c2a` green (`--ok`) | `#8fd19e` |

All five colours give ≥ 4.5:1 against `--bar-bg` and `--surface` in their theme. Goal **text stays
`--text`** (pure black in light mode). Colour appears only on the tag, the bar fill and one outline.
- **Tag:** pill, `background: var(--k)`, text `--k-on` (`#ffffff` in light mode, `#0f1520` in dark mode), 0.75rem,
  weight 700, letter-spacing 0.06em, padding 0.1rem 0.45rem, fixed `min-width: 6.5rem` so the goal text
  does not shift when the tag changes.
- **Hatch:** `background-image: repeating-linear-gradient(135deg, transparent 0 4px, rgb(255 255 255 / .35) 4px 6px)`
  over the fill (dark theme: `rgb(0 0 0 / .35)`).
- **Segments** (only when `need ≤ 20`, else solid): on `.bar`, `--segments: <need>` and
  `background-image: repeating-linear-gradient(90deg, transparent 0 calc(100%/var(--segments) - 2px), var(--bg) 0 calc(100%/var(--segments)))`
  as a mask layer over the fill, so "7 of 10 clerks" visibly reads as 7 blocks of 10.

**Same colour everywhere for a quantity.** A 0.6rem square in the kind colour sits before the
"You have" caption (red) and the "Checked in total" line (blue). When the kind is `owned`, the
matching Hire/Build button gets a 2px `--k` outline for as long as that goal is active. The player
learns "blue = in total" once and then sees it in both places.

**Transition when the kind changes** (only when `kind` changes; a new target of the same kind keeps the
current 400 ms flash, re-coloured to an outline in `--k` instead of turning the fill green):
1. 0–180 ms: the old fill drains to 0 (`width` transition 180 ms ease-in), and the old tag and numbers fade to 0.
2. At 180 ms: swap the kind attribute, tag text, goal text and numbers. Set the fill width to 0 with no transition.
3. 180–330 ms: the new tag pops in (`scale .85 → 1`, opacity 0 → 1, 150 ms ease-out), and the whole
   `#goal` gets `box-shadow: 0 0 0 2px var(--k)` for 700 ms, which says "this bar now measures something else".
4. 200–650 ms: the fill grows from 0 to its real value (`width` 450 ms ease-out).
The total time is under 0.7 s and never blocks input. `aria-live` announces only the new goal text.
Going *to* `ready` skips the drain: the fill runs to 100% in 200 ms and the tag becomes `READY`.

**`prefers-reduced-motion`:** no drain, grow or scale. Swap everything instantly and keep the static
2px outline for 700 ms (a colour change, not motion). This is already covered by the global
`transition: none` rule, plus the outline class.

**Code changes**
- `engine.js` `currentGoal()`: always return a `kind`. Set `kind: 'ready'` on the three `ready: true`
  returns. Nothing else changes.
- `index.html`: replace `<span class="goal-label">Next:</span>` with `<span id="goal-tag" class="goal-tag"></span>`.
  Add a `<span class="swatch">` before the "You have" caption and before `#total`.
- `ui.js` goal bar: keep `lastKind`. If `goal.kind !== lastKind`, add `.switching` to `#goal`
  (CSS drains the fill and fades the tag), and after 180 ms set `document.body.dataset.goalKind = kind` (on `body`, so `--k` also reaches the producer buttons), update
  the tag, text and numbers, force the fill to 0, then on the next frame remove `.switching`, add
  `.kind-changed` (outline) and set the real width. Remove `.kind-changed` after 700 ms. While `.switching`
  is on, skip the per-frame text and fill updates. Set `--segments` on `#goal .bar` when kind is
  `owned`/`clicks` and `need ≤ 20`. Toggle `.goal-target` on the matching producer button.
- `style.css`: `body[data-goal-kind="balance"]{--k:…;--k-on:…}` … per theme (inside the existing three theme blocks). Add
  `.goal-tag`, `#goal .bar > div{background:var(--k)}`, `[data-goal-kind="lifetime"]` hatch, segment mask,
  `.switching`, `.kind-changed`, and `.goal-target{outline:2px solid var(--k)}`. Change `#goal.flash` to an
  outline in `--k` (green fill now means `ready` only).
