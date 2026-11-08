# 02 — Plot and narrative review (Stages 1 and 2)

Angle: does the story read well from the first click of 1939 to the 1971 handover?
Read as a player would: `src/data/stage1.js`, `src/data/stage2.js`, the ledger code in `src/engine.js`/`src/ui.js`,
and `node sim/simulate.mjs --verbose` for all six profiles and both choices (ledger dates as shown on screen).

## Verdict
The story works. The threads hold from the first click to the end:
- **Secrecy.** "You sign a promise never to speak of it" leads to "You cannot tell them you have done this before" and then to "you still cannot say it".
- **The pencil.** Desk and pencil, then "misses the pencil", then "a pencil behind her ear anyway", then "She leaves you her pencil".
- **The Moon picture.** Pinned up in 1946, framed in 1961, then the landing.
- **"Checks."** The word comes back in Glenn's line ("one woman checks the machine's sums").
- **The fingernail.** The transistor in 1947 and the 1971 chip are both "under a fingernail".
- **The MEMO voice** starts with "Chips", the same card that promotes you to Director, computing division.

The 1202 lines fit the new mechanic well. Selling stops at the goal (`engine.js:198-202`), so "It drops the small jobs
and keeps the ones that matter" describes what the player just did. I found no tone breaks.

The faults are small and mostly about timing: two lines land next to the wrong neighbour, one date shows up wrong, one
customer line contradicts the card bought at the same moment, and the docs are stale.

## Findings (most important first)

### 1. The Census Bureau buys a computer, and in the same second rents yours (inconsistency)
`stage2.js:125` (Magnetic tape log) and `stage2.js:48` (the census customer line) fire in the same second (sim: 3:23).
One says "The Census Bureau buys a computer", the next says it "will pay for your spare hours". Read back to back, it
looks like an error. The tea-shop line handles the same situation well ("builds its own … and still rents yours").
**Fix** `stage2.js:48` text:
> Your first customer: the Census Bureau's new machine already has a queue, so they will pay for your spare hours. You can sell computer time now.

### 2. The landing line misses the rhyme by one word (polish, high value)
`stage2.js:257`: "Seconds of fuel left. The Eagle has landed. It was fast enough." Here "It" reads as the Eagle, and
the 1942 line it answers is "**We** were not fast enough" (`stage1.js:188`). This is the payoff of the whole game so far.
**Fix:**
> Seconds of fuel left. The Eagle has landed. This time, we were fast enough.

### 3. Kennedy's speech is dated November 1961 (bug, visible date)
`stage2.js:235`: `kennedy` fires 20 s after "Chips". "Time-sharing" (dated 1961-11) unlocks on Chips and is usually
bought sooner. The ledger then stamps the 1961-05 speech as **Nov 1961** (average/machines), or **Dec 1961** (greedy, after the airline).
**Fix:** `when: { after: 'chips', delay: 20 }` → `delay: 8`. It then sits between "Chips" (1959) and Time-sharing in
every profile, and the 25 s quiet stretch after Chips gets a line.

### 4. The insurer prices lives 9 seconds before Turing dies (polish, tone)
`stage2.js:51`: the insurer arrives 3 s after Core memory ("work out how long its customers will live… It pays on
the first of the month"). The Turing death line follows 9 s later in every profile (`stage2.js:229`). 06 §1 asked for
quiet on both sides of that line, but `hush` only gives quiet after it. The dry joke right before reads badly.
**Fix:** insurer `when: { after: 'coreMemory', delay: 3 }, date: '1953-06'` → `delay: 46, date: '1954-10'`. That is
after the hush ends (12 + 25 = 37 s) and after FORTRAN's slot is checked (38 s). The demand arrives 43 s later, a
negligible economic change. Re-run the sim.

### 5. The ledger never says the shy mathematician is Turing (polish)
In Stage 1 he is "a shy mathematician from Cambridge" (`stage1.js:174`) and, separately, "Turing" (`stage1.js:95`).
In Stage 2, "the shy mathematician from the train" (`stage2.js:221`) is followed by "Turing is in the papers". A player
who does not know the history may not link them, and the conviction and death lines lose their weight.
**Fix** `stage2.js:221`:
> Turing, the shy mathematician from the train, asks in print whether machines can think. Most readers laugh. He was used to that.

### 6. The weather card contradicts the player's own speedometer (inconsistency)
`stage2.js:118`: "The machine forecasts tomorrow's weather. It takes a day to do it." "The machine" reads as yours. At
that moment the speedometer says "forecasting tomorrow's weather in about 38 min" (average; about 1 h when idle). The
day was ENIAC's time. Saying so makes it the second "we did that last year" moment.
**Fix:**
> ENIAC forecasts tomorrow's weather. It takes a day to do it, only just keeping up with the sky. Your machines finish before lunch.

### 7. The ENIAC line lands on the Stage 1 side of the divider (inconsistency, docs vs code)
06 §3 (`06-stage2.md:30`) says: divider "Stage 2 · The computing lab", then the ENIAC line, then the opening line.
The code does it the other way round. `passLedger` logs `next.text` (`engine.js:308`) **before** `enterStage` logs the
divider (`engine.js:340`). The 1946 bridge line therefore reads as the last line of the war.
**Fix (code, 2 lines):** in `passLedger`, call `enterStage` first and pass the bridge text in. In `enterStage`, log the
title, then the bridge, then `checkBeats`. Keep the current path when there is no next stage (`phase = 'next'`). The
alternative is to change the doc line to match the code, but the doc's order reads better.

### 8. Heath Robinson shows as Nov 1943, after Flowers' "nobody believes him" (inconsistency)
`stage1.js:191`: `colossusRumour` (1943-11) fires 15 s after American machines, before the Tape-reading machine is
bought (1943-06). The ledger therefore stamps Heath Robinson **Nov 1943** in every profile.
**Fix:** `colossusRumour` `date: '1943-11'` → `'1943-04'`. Flowers made his valve proposal in early 1943, so the
order becomes: proposal → Heath Robinson "mostly works" → Flowers works day and night → Colossus. All four dates then
run forward with no clamping.

### 9. Customer names read oddly in the panel list (polish)
`ui.js:423` joins the names, `stage2.js:47-57` defines them. The panel shows "Customers: Census Bureau, Tea shops, An
insurance company, A bank, An airline, Every university." The capitals and articles are mixed, and the tea company is
plural in the name but singular in its line ("Of course it is a tea company").
**Fix:** use the names `the Census Bureau`, `a tea company`, `an insurance company`, `a bank`, `an airline`,
`every university`. The panel then reads as a sentence. `ui.js:423` already adds "Customers: " and the full stop.

### 10. The opening of Stage 2 is a burst of five lines (polish, pacing)
At the start of Stage 2 these come within about 8 s: the ENIAC line, the divider, "February 1946…", "First job…" (first
click), "Your first machine…" and "six women…" (10 clicks, 0:04–0:08). The casual profile gets the last two in the same
tick. The six-women line is one of the best in the stage and gets lost.
**Fix:** `stage2.js:209` `when: { clicks: 10 }` → `{ clicks: 30 }`. That is about 12–20 s in for a clicker, after the
first computer line. It shares no space with the moon-picture beat (programmers + 12 s).

### 11. A promotion is only a header pulse, with no ledger line (polish)
`stage2.js:35-38`. Both promotions change the header ("You are: …") with a 2 s pulse. The ledger, which is the record of
your career, never mentions them. The 1971 ending relies on "Your division". A text-only fix needs no code. Add a
sentence to the census line and to the Chips log:
- census (after the change in #1): "… You can sell computer time now. Your title is now Head of computing services."
  If that is too long, drop "You can sell computer time now.": the panel opens at the same moment.
- `stage2.js:155` Chips: "MEMO. To: Director, computing division. Re: valves. Discontinue. …" This puts the new title
  on the memo letterhead, which also explains why memos start here.

### 12. "Hire programmers" reads like a producer button (polish)
`stage2.js:79`. In Stage 1, "Hire" was the verb of a producer ("Hire a clerk"). On an Idea card that makes computers
1.25× faster, "Hire programmers" suggests you get a programmer. The log already mentions "the advert".
**Fix:** name → `Programmers wanted`.

### 13. "Forecast the weather" could rhyme with "Weather reports" (polish)
`stage2.js:114`. This is the only other Idea card named with a verb. If it is renamed `Weather forecasts`, the Stage 2
card echoes the Stage 1 card (`stage1.js:63`). Optional, and pairs with #6.

### 14. "Every year they need less of one" (polish)
`stage2.js:260`: "The machines fill three floors. Every year they need less of one." On a first reading, "less of one"
seems to contradict "fill three floors".
**Fix:**
> Your division has a building and its own cafeteria. The machines fill three floors. Every year the same work fits in less space.

### 15. 1970 retirement: the emotional payoff gets 4 s (polish, optional)
`config.js:7` `endingBeatGapSec: 4`. Stage 2 plays five ending lines four seconds apart, from 1969 to 1971, and the
pencil line is followed 4 s later by the building line. Consider 5 s. That adds 5 s to Stage 2 and 2 s to Stage 1.
No other change needed.

### 16. Greedy players get lines after the goal that describe the goal as future (polish, minor)
Unbought upgrades can still be bought in the finale phase. A greedy player gets Heath Robinson and "Flowers … work day
and night on a machine made of valves" **after** "He built Colossus" (sim greedy, 14:18–14:25). In Stage 2, "Woven
programs" ("The Moon computer's program is sewn by hand") comes after the Moon computer is built. This is greedy-only
and the dates are clamped correctly. Smallest fix: hide unbought upgrade cards once the goal is bought. Low priority,
and only if it is a one-line change in `ui.js`.

### 17. The UCLA–Stanford line (historian check)
`stage2.js:258`: "UCLA calls Stanford by computer." The other end was SRI, the Stanford Research Institute. That is
defensible as shorthand. For accuracy: "UCLA calls a lab at Stanford by computer."

## Docs that are stale (05 and 06 are the source of truth)

### 18. 05 D3 contradicts the game (inconsistency)
`05-game-design.md:25`: "Never a second spendable resource. Money … display conversions only." Stage 2 now has money
as a real second currency (06 §6). **Fix:** append "Superseded in Stage 2: money is spent on mainframes (see 06 §6)."

### 19. 05 header and the Stage 2 row are stale (inconsistency)
- `05-game-design.md:5` "Nothing is built yet." → "Stages 1 and 2 are built."
- `05-game-design.md:43`: "1945–71" → "1946–71". "Valve computers → transistor mainframes" → "Computers → mainframes".
- `05-game-design.md:26` D4 "10–13 one-shot upgrades": Stage 2 has 15. → "10–15".

### 20. 06 §1 still has the old choice and the old goal (inconsistency)
- `06-stage2.md:13`: "Defence money = mainframes cheaper" → "Defence money = customers pay 1.5× more (§6)".
- `06-stage2.md:15`: "goal 900 M" → "goal 1.3 billion (§8)".
- `06-stage2.md:37-38`: "17 tests" → "20 tests". The Stage 2 times in §4 and §5 (11.5–12.8) are superseded by §8
  (11.5–12.3). Say so, or update them.
- `06-stage2.md:14` says hold "~20 s either side" of Turing, but only the 25 s after is implemented. See #4.

### 21. Stage 1 has no ledger divider, and its title is unused (polish)
`stage1.js:9` `title: 'The Codebreakers'` is never shown, because only `enterStage` logs titles. By 1971 the ledger has
a "Stage 2 · The computing lab" divider but nothing marks where 1939 starts. **Fix:** title →
`'Stage 1 · The codebreakers'` (same pattern as Stage 2), and log it as a `'stage'` entry in `createState` before the
opening beat. If the code change is unwanted, at least align the title format.

## Nothing to fix
- **Stage 1 arc.** Poland, the weather crib, "It is always the weather", the lamp, the machine, the pencil. Then the
  dark Atlantic, the late decrypt, the codebook ("the Atlantic can be read again"), Flowers, Colossus, D-Day, VE Day.
  The late-decrypt beats are well spaced (5:55 / 6:20 / 6:26, then 9 s before the next card).
- **The handover.** "The machines are gone. What you learned is not." → ENIAC → "we did that last year." This works,
  once the order in #7 is fixed.
- **Shannon rename.** Lands at 1:30–2:00 as designed, and the wording is clear.
- **Customers' voice.** Census, tea, insurer, bank, airline and universities each get one dry, specific sentence in the
  ledger's voice. Their dates run 1951 → 1964 in the right order. Only #1, #4 and #9 need work.
- **Washington choice.** Sputnik and "You answer one first" are fine. The plain effects follow D12.
- **Goal, finale, ending.** "It only has to be right", "one lamp in the dark" (the lamp motif returns), the 1202 lines,
  LO, the pencil, the 1971 chip. Strong. "Land on the Moon / Ends this stage." mirrors "Win the war / Ends this stage."
- **Tea motif.** "Takes her tea black" pays off lightly in "Of course it is a tea company". Subtle, and fine as it is.
