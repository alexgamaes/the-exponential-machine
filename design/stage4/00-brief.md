# Stage 4 brief: the software company (Sep 1984 → Aug 1995)

Lead designer's brief for the experts. The merged design will be `design/08-stage4.md`.

## Where we are
- Stages 1–3 are built. Stage 3 was just rebuilt as a Paperclips-style shop (`design/07-stage3.md` §11). The player
  wanted Stage 3 "closer to Paperclips: demand, the warehouse items". The three earlier Stage 3 versions failed for the
  same reason: they put the player in front of **rates and ratios** (a price tag, a lab bar with a launch button,
  series and programs), and each one was solved by a single rule. The shop works because the player looks at **things**
  (a pile of computers, a chip count that runs out, a price they nudge) and every number talks to the others.
- The player has not playtested the new Stage 3 yet, so Stage 4 must not depend on fine details of it.

## What Stage 4 must hand over and receive
- **Arrives:** about 8×10¹¹ operations per second of legacy (sim: 7–9×10¹¹), about 145,000 computers in homes, some
  operations in hand. Stage 3's money is $1–3 M at the end (whether it carries over is the designer's call; Stage 3
  reset it to $1,300 with a story line).
- **The story hand-off** (Stage 3's last line): "1984. The machines are everywhere now, and every one is waiting to be
  told what to do. You give the ledger and the pencil to your first clerk's grandson. He writes the instructions."
  So in Stage 4 **you are the grandson** (born ~1956, 28 in 1984), the first clerk's (Stage 1) grandson, who joined the
  garage at 19 in 1975 and wrote its software.
- **Leaves:** the original plan (`05-game-design.md` §3) is "Software company CEO, PCs on desks → office networks,
  goal: go online (the web)", end around 10¹⁶ per second. Stage 5 is the investor (1995–2001, the dot-com bubble), so
  Stage 4 should end with the web going public (Mosaic 1993, Netscape's IPO in Aug 1995, Windows 95 two weeks later).
- **Pace:** the game must speed up stage by stage. Stage 3 doubles speed every ~53 s. Stage 4: one doubling every
  ≤ 50 s, 12–15 min of normal play, so roughly ×10⁴–10⁵ over the stage (end ~10¹⁶–10¹⁷; argue for a number). Real
  anchor: ~100 M PCs in use by 1995 at ~10⁸ instructions a second each ≈ 10¹⁶.

## What the stage must have
1. **A real new mechanic** (the player's standing rule: every stage brings one). Not the shop again: no warehouse,
   price and raw-material loop as the core (those can stay as minor parts if the designer argues for it).
2. **Things, not ratios.** Paperclips-like: counts the player can see go up and down, buttons that do one thing,
   one resource that runs out or piles up, every number on screen and connected to the others.
3. **A decision that is not solved by one rule.** The strategy critic will try to break it with a simple bot policy.
4. **Chores that ideas later remove** (like the standing order and the sales manager), so automation feels like
   progress. Automations are togglable.
5. **One mid-stage twist** rooted in the history, that adds a new *kind* of decision (Stage 3: the price war).
6. **The tie to the one number** (requirement 3): operations per second never drop. Stage 3's tie: every computer
   sold runs for you in a home. Stage 4 needs its own tie that grows out of software and networks.

## Seeds (the lead's hunches; the designer may throw them away)
- **Software is copied for free.** A program costs a lot to write and nothing to copy. The scarce things change: not
  chips but *programmers' time*, *bugs*, *users*. Possible things on screen: lines of code, bugs (a pile that grows by
  itself and that you must keep down), copies sold, users, versions.
- **Software makes old computers faster.** A better program does the same job with fewer operations. The ~145,000+
  computers from Stage 3, and every PC sold since, run your programs: installs could multiply what the installed
  base computes for you.
- **Networks.** Office networks (Novell, Ethernet), bulletin boards and modems, then the web (CERN 1989–91, Mosaic
  1993). Connected computers can share work; the value of a network grows faster than its size (Metcalfe). A natural
  source of acceleration and a natural road to the goal "go online".
- **Platform war.** Two-sided markets: users go where the programs are, programmers go where the users are (DOS vs
  Mac, then Windows 3.0 in 1990, then the browser war of 1995). Candidate twist.
- **Ship it or fix it.** When to release a version with known bugs (crunch, delays, the Y2K-style debt) is a classic
  software decision. Careful: a "progress bar with a launch button" was tried in Stage 3 and was solved by one rule.
- **Paperclips' later layers** each add one new kind of decision: investments with a risk level, strategic-modeling
  tournaments, and the Trust allocation between processors (speed) and memory (capacity). Something like that last
  one could fit software (memory was the hard limit of 1980s software: 640 KB).

## Hard constraints
- Requirements: `design/00-requirements.md`. Speed never drops.
- Engine stays pure and data-driven (`src/engine.js` + `src/data/stage4.js`); reuse what Stage 3 built where it fits
  (money, ideas paid with operations, finale items paid with money, reactive ledger lines with conditions and variants,
  togglable automations). The simulator (`sim/simulate.mjs`) must be able to play it with a smart bot and a few lazy
  ones. Lazy play must clearly lose and still finish. Longest stretch with nothing new to do ≤ 45 s.
- Player preferences: plain, short, jargon-free labels "like a video game"; high contrast, pure black text in light
  mode, emphasis bold not bigger; no pop-ups, no confirmations; locked things say why; nothing flickers and the
  layout never jumps; the goal bar shows only the stage goal; no click upgrades; desktop first (1366×768, the main
  panel should fit above the fold), phone must work.
- Never read `archive/`.

## Material
Overall design `design/05-game-design.md`; Stage 2 `06-stage2.md`; Stage 3 `07-stage3.md` (§11 is current) and
`design/stage3/30-34` (the last round of expert proposals, a good model for depth and format); history
`01-historian.md` (its "Stage 5" row is our Stage 4); story `02-plot.md`; engine `src/engine.js`; Stage 3 data
`src/data/stage3.js`; simulator `sim/simulate.mjs`.
