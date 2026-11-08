# v2-03-q2 — Phase 0 first break event (design exploration)

Resolving open question #2 from `v2-03-phase-0.md`: does Phase 0 need a
dopamine-beat event, and if so, what is it?

This doc presents candidates + trade-offs. Not a spec. Once a direction is
picked, the winning candidate folds back into `v2-03-phase-0.md` and this
file is archived.

---

## What "the beat" has to do

In v1 the beat was **the Drop** — a periodic windfall gated on Data that
fired with a flash and a sound. It worked (dopamine), but it also caused
two v1 failures: DROP_SCALE compounded against itself (cost inflation), and
it was a separate mechanic layered on top of production rather than
produced *by* it.

In v2, the beat must:

- Ride on top of the existing primitive (bits eliminated). No new currency.
- Feel like cadence, not reward-event. The exponential lives in cadence.
- Scale forward. A Phase 0 beat mechanism that can't work in Phase 7 is
  probably the wrong shape.
- Not introduce a new UI affordance in Phase 0 (no panel, no log, no new
  button).
- Deliver thesis weight where possible (every spare surface in Phase 0 is
  carrying "the people are the machine's first body").

---

## Candidate A — No break event

Phase 0 runs on flavor rollovers and unit purchases alone. The Phase 0 → 1
transition *is* the first real beat.

**Pro.** Simplest. Keeps Phase 0 meditative. Respects "mechanics replace,
not accumulate" — the only beat is the phase shift itself. Matches UP's
first-act pacing (UP has no "beat" until the first autoclipper).
**Con.** ~7–10 minutes on four flavor rollovers may feel under-stimulating.
The JC purchase itself has to carry more than we've currently given it.

## Candidate B — Scripted "first break" at ~1000 bits

One scripted narrative event. Count briefly freezes; a one-line flavor
fires in larger type (*"someone has noticed a pattern."*); bits jump by a
small one-time windfall; normal play resumes.

**Pro.** Narrative + mechanical moment. Historically grounded (reads like
a Herivel-tip intuition). Doesn't introduce a new resource.
**Con.** One-shot and scripted; structurally *is* a v1-style initiative in
disguise. And "a windfall at N bits" does not scale — every phase would
need its own scripted beat, which is exactly the content-tree maintenance
problem v1 had.

## Candidate C — Recurring cadence-breaks (thresholded pulses)

Every time the bit count crosses a log-scale threshold (10, 100, 1000,
10k, 100k, …) the count briefly pulses / flashes and a muted tick plays
(if audio is in). No windfall. No flavor. Pure ambient rhythm.

**Pro.** Cadence-native: as bit rate grows, pulses get closer together,
*enacting* the exponential in the UI. Works across all 11 phases with zero
per-phase content. Nothing to maintain.
**Con.** Thin on narrative. Decorative rather than dramatic. Alone, may
feel too subtle to register as "a beat."

## Candidate D — Break = first autoproduction tick

The first time a purchased Junior Calculator produces a bit without a
click (i.e., the passive tick fires for the first time), a one-time flavor
line fires above the counter:

> *she hands you a page. one more position ruled out.*

The player sees — and understands — that the work is no longer coming
from their finger. No windfall; the bit is the bit the JC would have
produced anyway.

**Pro.** Ties the beat to the game's actual structural shift (clicking →
automation). Thesis-aligned: the person is Compute's first body, and the
moment the body moves on its own is the moment the fiction lands. Scales:
every phase has an equivalent "first time the new substrate does the work
by itself" moment.
**Con.** Gated on purchase timing; a player who grinds clicks won't see
it until they choose to buy. That's probably actually fine — the player
who ignores the JC is rejecting the reveal, and that's a valid stance.

---

## Recommendation

**C + D.**

- **C** (ambient pulse on log-threshold crossings) carries the cadence beat
  across all 11 phases for free. It is the universal mechanism.
- **D** (one-time flavor on the first passive tick) delivers Phase 0's
  specific narrative moment with thesis weight, and establishes a pattern
  future phases can re-instantiate ("first time the new substrate works on
  its own").
- **A** is the fallback if C feels like too much — but we should try C
  first, since it costs almost nothing.
- **B** is probably wrong. It's a scripted initiative wearing a different
  hat, and it doesn't scale past Phase 0 without the same content-tree
  problem that killed v1.

## Knock-on implications if we pick C + D

- Phase 0 still has no event log, no initiative panel, no extra UI. Both
  beats live inside the existing three elements (flavor, count, unit
  label).
- Audio becomes implicitly desired for C (silent pulse is weak). This
  couples open question #5 (audio) to this decision. If we say "no audio
  in Phase 0," C becomes visual-only.
- D implies we want the player to *buy* the JC, not just grind clicks.
  That's already the direction (JC reveals at 20 bits, costs 30).

## Decision needed

A / B / C / D / C+D / other? Once picked, the winner folds into the
"Flavor progression" and "Unit" sections of `v2-03-phase-0.md` and this
file moves to `archive/`.
