# v2-03-q4 — Phase 0 → Phase 1 transition (design exploration)

Resolving open question #4 from `v2-03-phase-0.md`: what triggers the
transition out of Phase 0, what does the player see, and what changes?

This is the first **substrate shift** in the game: Compute stops needing a
human body for the work. It is the biggest narrative beat in the first
~30 minutes of play and probably the single most load-bearing moment of
the entire opening arc.

---

## What the transition has to do

From `v2-01`:
- **New primitive:** pencil-stroke → rotor-check.
- **Previous primitive abstracts:** JCs do not vanish, but they collapse
  out of the player's active attention into a single aggregate line.
- **Cadence accelerates visibly.** Bits/sec jumps; years-per-second may
  begin to shrink (first bite at the second-order exponential).
- **Thesis delivered, never stated.** The player should feel "oh, I'm not
  running people anymore" without any UI label saying so.

From `v2-03`:
- No Enigma jargon in UI. The word "Bombe" probably should not appear.
- Atmosphere over nomenclature.

---

## Sub-question 1 — Trigger: what fires the transition?

### Option α — Bit-count threshold
Cross N bits; transition fires.
**Pro.** Deterministic, trivial to tune. **Con.** Arbitrary from the
player's side. No diegetic reason *why* the machine arrives at this moment.

### Option β — JC count threshold
Player owns N junior calculators; transition fires. Reads as "the hut is
full; adding more people doesn't help anymore." This is historically true
(combinatorial blowup outran human throughput at Bletchley — that is *why*
Turing designed the Bombe).
**Pro.** Diegetic. The pressure comes from the workforce itself. The
player earns the transition by running up against a ceiling. **Con.** A
player who over-clicks and under-buys may never trigger it.

### Option γ — Emergent bottleneck
A visible scaling failure. Bit rate demand (some rising line) crosses JC
throughput; the player *sees* the humans fall behind for ~30 seconds
before the transition fires and resolves the bottleneck. This is the most
UP-like reading — the problem shows itself, then the system solves it.
**Pro.** Maximum dramatic weight. Player feels the pressure before the
release. **Con.** Requires a new "demand" concept in Phase 0, which
violates the "no new dimension in Phase 0" constraint. Possibly too heavy.

### Option δ — Player action (initiative-style)
An action appears ("PROPOSE A MACHINE") and the player chooses when.
**Pro.** Agentic. **Con.** Re-introduces v1's initiative surface in Phase
0, which we explicitly excluded from v2-03. Bad precedent.

**Recommendation:** **β** with a soft time/bit floor (e.g., needs both
≥50 JCs *and* ≥3000 bits), so the threshold is hit diegetically but can't
be triggered absurdly early by a grinding player.

## Sub-question 2 — What the player sees (the moment itself)

Proposed sequence, ~6 seconds total:

1. **Trigger fires.** The count freezes. Unit cards fade briefly.
2. **Flavor line, larger than normal, centered:**
   > *a quiet man from hut 8 says: let the machine do the checking.*
   (Historically grounded — Turing — without naming him or the Bombe.)
3. **Old primitive collapses.** The JUNIOR CALCULATOR row dissolves into a
   single aggregate line:
   > HUMAN LABOR · ≡ 50 (quiet now)
   The buy button is gone. The contribution still counts, but as a single
   number, not a row.
4. **New primitive appears.** A new unit slot reveals with its own label
   and buy button. (Exact name — see sub-question 3.)
5. **Count resumes.** Visibly faster. The rate line shows a clear jump.
6. **Date label updates.** "SEPTEMBER 1939" → "1940" or similar; the
   first calendar tick. (Couples to open question #1.)

No modal. No announcement. The UI rearranges itself once and the player
realizes the game has shifted underneath them.

## Sub-question 3 — What is the Phase 1 unit called?

v2-01's table says "rotor-check." The UI needs a unit name that is:
- Plain English to a modern player.
- Historically defensible (doesn't lie about the era).
- Not "Bombe" (jargon).
- Doesn't sound like sci-fi.

Candidates:
- **CHECKING MACHINE** — plain, era-appropriate, slightly flat.
- **ROTOR ENGINE** — evocative, period-correct ("engine" was the word for
  a mechanical calculator in this era), readable.
- **THE MACHINE** (singular, definite article) — mythic but risks feeling
  UP-derivative.
- **AUTOMATIC CALCULATOR** — pairs nicely with JUNIOR CALCULATOR (before:
  human calculator; now: automatic one). Dual-read.

**Recommendation:** **AUTOMATIC CALCULATOR.** The parallelism with JUNIOR
CALCULATOR is the whole point of the transition — same noun, different
substrate. The player reading "AUTOMATIC CALCULATOR" right after the JC
row collapses is the thesis delivered at the noun level.

## Sub-question 4 — What changes mechanically

At the transition:
- JCs become an aggregate line (no longer rows, no buy button, production
  still counts).
- AUTOMATIC CALCULATOR reveals with some production rate and cost. Exact
  numbers belong in `v2-04-phase-1.md`, not here.
- Bits/sec visibly jumps (the new unit starts at >> JC rate).
- Calendar begins advancing (or first advances here if we decided Phase 0
  keeps it static).
- Unit label "possibilities ruled out" stays (bits are universal), but a
  small subtitle may change to signal the new substrate.

What does NOT change:
- The bit counter. Same scalar, same number. It just grows faster.
- The COMPUTE button. Still there, still clickable, still 1 bit/click.
  (It will feel trivial next to the machine — that's the point.)
- The visual language of the stage. No new columns, no new panels. One
  row collapsed, one row appeared.

---

## Relationship to q2

The user's observation that motivated drafting this doc first: **the
humans-to-machine transition is where the real narrative weight lives.**
If we over-invest in intra-Phase-0 beats (q2), we steal thunder from this
moment.

With q4 anchored, q2 should resolve toward **A (nothing) or minimal C
(ambient pulses on log thresholds)**. B and D both introduce small
narrative moments that compete with this transition. They're out.

## Open sub-decisions

Before folding this into `v2-03-phase-0.md` and opening `v2-04-phase-1.md`:

1. Trigger: β with soft floors (recommended), or one of the alternatives?
2. Unit name for Phase 1: AUTOMATIC CALCULATOR (recommended), or other?
3. Is the aggregate collapse line ("HUMAN LABOR · ≡ 50 (quiet now)")
   shown persistently, or does it fade out after a minute?
4. Does the calendar begin advancing at this transition, or earlier, or
   later?
5. Is there audio on the transition itself (even if there's no audio
   elsewhere in Phase 0)?
