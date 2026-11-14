# Stage 3 redesign brief: a better new mechanic (Nov 13)

## Why
Stage 3 is built (`design/07-stage3.md`, `src/data/stage3.js`) and the player played it. Verdict, in their words:
"The only innovation is that you can set the price, but even that is not very clear, not very cool. It's very simple to
set the price, there is not a cool feature from a gameplay perspective." Earlier they noticed: a higher price looked
always better (the screen shows money, not the computers left unsold); nothing showed computers sold or what they make.
The sim agrees: leaving the price at $599 all stage is only 3–9% slower than playing well.

## What to keep
- Story, era, people, dates, beats, goal and finale (07-stage3 §1, §2, §5): the 55-year-old codebreaker, the garage, the
  first clerk's grandson (joins 1975, takes the ledger in 1984), Open or Closed, Petrov, the Mac's "Hello".
- The idea that **computers you sell keep counting in other people's homes** may stay or go: your call, but say why.
- Pace: ~12–14 min; arrive at ~3×10⁷ per second, leave at ~2×10¹²; longest quiet ≤ 45 s.
- Engine style: pure, data-driven (`src/engine.js`, `src/data/stageN.js`), the sim (`sim/simulate.mjs`) must be able to
  play it with a simple bot, and a lazy player must clearly lose time (target ≥ 15%) but still finish.

## What we need
A **new mechanic that is fun to play, not just to read**: a decision you make again and again, that changes as the stage
goes on, whose effect you can see on screen right away, and that feels different from Stage 1 (click, then automate) and
Stage 2 (sell 0–75% of your computer time for money). It should come out of the history of 1971–84 (microprocessors,
kits, clubs, the home computer, games, software, the spreadsheet, the IBM PC, the price war).

## Player's standing preferences (hard)
Plain, short, jargon-free labels ("like a video game"); high contrast, pure black text in light mode; bold not bigger;
no pop-ups or confirmations; locked things say why; nothing flickers; the goal bar shows only the stage goal; no click
upgrades (clicks matter only early; automation is the point); each stage has a real new mechanic, not "×1.5 faster"
cards; desktop first (laptop), ledger column on the right, layout never jumps.

## Read
`design/00-requirements.md`, `design/05-game-design.md`, `design/06-stage2.md`, `design/07-stage3.md`,
`design/stage3/00-brief.md`, `03-ux.md`, `04-systems.md`, `design/review/05-ux-layout.md`, and `src/data/stage3.js`,
`src/engine.js` for what exists. Never read `archive/`.
