# Housekeeping review (Stages 1 and 2)

The player: "After all these changes, make sure the whole game is consistent and everything is cool. So far it's good,
so don't make many changes. It's housekeeping: make it good, make it clean, make it nice."

## Scope
The whole playable game: Stage 1 (1939–45) and Stage 2 (1946–71), the handover between them, and the docs.
- Design: `design/00-requirements.md`, `design/05-game-design.md` (overall + Stage 1), `design/06-stage2.md` (Stage 2, incl. §6 selling computer time).
- Content: `src/data/stage1.js`, `src/data/stage2.js`. Code: `src/engine.js`, `src/ui.js`, `src/main.js`, `index.html`, `style.css`.
- Checks: `tests/engine.test.js`, `sim/simulate.mjs` (`npm test` runs both; `node sim/simulate.mjs --profile average --choice machines --verbose` prints a timeline).
- Do NOT read `archive/`. Do NOT edit any file except your own review file.

## What to look for (your angle first, but note anything you see)
- Inconsistencies: between stages, between data and docs, between card text and what the effect really does, wording and tone, units, dates.
- Anything stale after the recent changes (clicks no longer upgraded in Stage 2; money and selling computer time; goal 1.3 billion; dev buttons).
- Things that are confusing, ugly, or rough for a player. Small bugs.
- Docs that no longer match the game (05 and 06 are the source of truth: say where they are wrong or stale).

## Rules
- Small, safe fixes only. No new mechanics, no rebalancing beyond a number or two, no rewrites.
- Each finding: where (file:line), what is wrong, the exact fix (new text or value), and severity (bug / inconsistency / polish).
- Rank most important first. 25 findings at most. Say "nothing to fix" for areas that are fine.

Write `design/review/<NN>-<role>.md` and reply with a summary under 150 words.
