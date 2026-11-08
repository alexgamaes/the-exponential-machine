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
