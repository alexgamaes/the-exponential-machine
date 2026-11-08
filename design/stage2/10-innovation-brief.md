# Stage 2 — brief: one new mechanic (discussion only, no code)

## The problem (from the player)
> "In this second stage we are repeating the same upgrades. There's no real innovation. It's usually only
> 'this does it faster, that does it faster'. Can we think of more innovation in this stage? Add money, add
> something that makes it better. Remember how Paperclips adds the stock market at some point, or the
> quantum computer, or the Yomi / strategy tournaments? I'm not saying to add these things. Think of something
> that fits *this specific stage*."

The player also said: maybe the stock market belongs to a later stage (the 90s investor stage). Clicks fade by design:
automation is the point, so the new thing must **not** be a reason to click more.

## What Stage 2 is today
- Read: `design/06-stage2.md` (merged design), `src/data/stage2.js` (all content), `design/00-requirements.md`.
- 1946–1971, Director of a computing lab. Two producers (Computers, Mainframes), 15 upgrades that are almost all
  "X works 1.5× faster", one choice (Defence money / Space money), goal "Build a computer for the Moon", finale Apollo 8 then Apollo 11.
- About 12 minutes. One resource (operations). Stage 1 is similar in shape; Stage 2 should feel different, not just bigger.

## What Paperclips does that we want the *spirit* of
Each phase adds a **new system with its own decisions**: a second resource or a small sub-game that changes how you
play for a few minutes (investment engine, computational resources (processors/memory -> operations -> creativity),
quantum computing (click when the wave is positive), strategic modeling (Yomi tournaments)). Not a bigger number: a new verb.

## Constraints (hard, learned from Stage 1)
- Plain labels; the effect on a card is stated plainly; flavour goes to the ledger.
- No confirmation pop-ups. Nothing flickering. Locked things say why.
- The goal bar shows only the stage goal, in one unit.
- No dead time over ~45 s; the stage stays 12–15 min; the simulator must be able to play it (a bot can make the decision).
- Must not reward clicking speed. Should fit 1946–71 history (real things happened; creative freedom is fine if not misleading).
- Should feel *fun and new* within ~1 minute of appearing, and be teachable without a tutorial.
- Do NOT read `archive/`. Do NOT edit `src/`, `sim/`, `tests/`.

## What to write
Your own file `design/stage2/1X-<role>-innovation.md` (≤ 120 lines): 2–3 candidate mechanics from your angle,
each with: what the player sees and does, the new decision it creates, why it fits 1946–71, how it ties to the
goal (the Moon), what it costs to build, risks. End with your single recommendation and why.
