# v2-01 — Design direction (crystallized)

Not a spec. A set of commitments that constrain future design choices. Written
before any v2 code exists beyond an empty shell, so later decisions stay
anchored to these rather than drifting into v1's shape.

---

## The spine

**One primary unit, reshaped by phase.** Pick a single scalar that persists
across all 11 phases — candidate: **Bits-Eliminated** (Shannon-style
uncertainty reduction). The ticker never resets. It spans a pencil stroke to
a galaxy-scale calculation.

**One button at start.** No stream panel, no data cap, no personnel. Click = 1
Bit eliminated. That's the entire opening UI. Everything else is a reveal.

**Each phase introduces exactly one new primitive** that re-interprets the
unit, not a new currency. Rough lineage:

| Phase | New primitive | "Bit-elimination" means |
|---|---|---|
| 0 | Pencil stroke | A human excluding one Enigma rotor position |
| 1 | Rotor-check | A Bombe ruling out one wheel setting |
| 2 | Tube-cycle | A vacuum tube flipping once |
| 3 | Instruction | A transistor executing one op |
| 4 | Program | A microprocessor running a routine |
| 5 | Request | A server answering one HTTP call |
| 6 | Model call | A datacenter inferring one result |
| 7 | Token | An LLM predicting one token |
| 8 | Goal | An agent completing one objective |
| 9 | Action | An embodied system acting on the world |
| 10 | State | A post-human intelligence reshaping one cosmological bit |

The previous primitive does not vanish — it abstracts into an aggregate. By
Phase 2 the player does not count pencils; they count tubes. The pencils are
implied.

## Progressive reveal of hidden dimensions

Don't show the full game on turn 1. Hidden dimensions appear through play:

- Personnel first appears after ~N clicks.
- Data storage as a concept appears only when it constrains.
- A second unit type (or a second intercept source) appears only after an explicit discovery moment.
- Constraints (Billets, Electricity, equivalents) are introduced as discoveries,
  not as starting facts. A player at minute 20 should be surprised that
  Electricity exists.

Rule of thumb: the player's first "wait, what?" moment should be at least 5
minutes in, not at minute 0.

## The exponent lives in cadence, not in cost

v1's rule — "the exponential must be in production speed, not in cost" —
is preserved and sharpened. In v2, the cadence of the primary event (drops,
completions, whatever the dopamine beat becomes) itself accelerates
visibly. The player watches drops-per-second tick from 0.5 to 50 to 500.
No DROP_SCALE compounding cost against itself.

**In-game time accelerates with the machine.** Years-per-real-second shrink
as capacity grows. 1939 → 1945 might take 10 minutes; 2020 → 2200 might take
10 seconds. This is the second-order exponential and it's load-bearing —
it *is* the phenomenology of the exponential, enacted in the clock itself.

## Mechanics replace, not accumulate

When a new primitive arrives, the previous one collapses out of the player's
active attention. Old units keep existing as an aggregate number ("human
labor: ≡ 2,830 people"), not as individual rows in the UI. The player's
working memory stays small even as the machine gets huge.

## Metaphor that generalizes

"Bits eliminated" works across all 11 phases. The game is not about cracking
Enigma. It is about *reducing uncertainty about the world, at accelerating
rates, through progressively stranger substrates*. Phase 0 happens to use
Enigma because that's where the substrate was humans-with-pencils. The
metaphor is substrate-agnostic.

## Decisions, not just optimization

Some initiatives must be forks, not sequences. At least one per phase. The
game has moral and strategic weight when the player cannot have both paths.
Examples (illustrative, not final):

- Phase 0: keep the secret of a break, or use it now and risk revealing it?
- Phase 1: comply with Churchill's destruction order, or hide the machines?
- Phase 6: open-source the model, or gate it behind API access?
- Phase 8: instrument the agent for alignment, or optimize for capability?

Forks give replayability and carry the thesis.

## Thesis: hide it, let it emerge

The README says "you play as the emergent intelligence of computation
itself." v1 shows this on the title screen. v2 should not. The player
should discover, not be told. The name of the machine you are running should
become apparent as the scale shifts. Phases 1-10 should not be listed in the
UI. Only Phase 0 is labeled at start. The rest are discovered.

## Non-goals

- **Not historical accuracy for its own sake.** Flavor is accurate where it
  reinforces the mechanic; elsewhere it yields.
- **Not a WWII game.** Phase 0 is one station on a much longer line. Naming
  and UI must make sense across all phases.
- **Not a simulator of computing history.** The game is a toy that happens to
  use computing history as its substrate.

## Open questions (to resolve through design iteration, not upfront)

1. What is the dopamine beat that replaces "the Drop"? Candidates: a
   bit-count crossing thresholds with audio cue, a periodic "insight"
   triggered by crossing entropy-elimination milestones, a rhythmic
   tick that speeds up visibly.
2. What is the first hidden dimension? (After clicking, something the player
   did not expect appears. What is it?)
3. What is the first real decision? (Probably somewhere in Phase 0 — what is
   it and what does it trade?)
4. Does the player have an *identity* in the fiction (a named player role),
   or are they the machine itself? UP made the player the AI. v1 made the
   player a cryptographer. v2 should decide explicitly.
5. Numeric feel: bits grow very fast. How do we display 10^30 without the
   number becoming noise? (Prefix notation, logarithmic bar, a secondary
   comparison readout like "≡ X minds" ticking up?)

These stay open. Any answer locks in before it's load-bearing is premature.

---

## Phase-specific design lives in its own doc

`v2-01` captures only the universal commitments (what's true across all 11
phases). Each phase has its own MD that specifies setting, flavor progression,
unit naming, open questions, and thesis delivery.

- `v2-03-phase-0.md` — Phase 0: The Genesis Load (Bletchley Park, 1939)
- `v2-04-phase-1.md` — tbd (electromechanical Bombe era)
- ...

When adding a phase, create the MD first. Never implement phase content
before its design doc exists and has been reviewed.

## Process rule: design first

1. Define the gameplay in an MD file (here or in a phase-specific doc).
2. Review and iterate with the user until the design is clearly good.
3. Only then implement. Implementation is a faithful rendering of the MD.
4. If code and doc drift, the code is wrong. Update the doc first; then
   update the code to match.

Implementation is not the place to make gameplay decisions. The v2-00
critique of v1 was largely caused by gameplay decisions accreting in code
without being crystallized in design first.

## Implementation constraints (carried from v1)

- Vanilla JS, no build step, no framework.
- One HTML shell, CSS var theming, `pointerdown` delegation.
- Save serializes to localStorage, strips `_`-prefix transient keys.
- All balance constants in a single CONFIG module; headless simulator can
  override via `--config <json>`.
- Tests use `node:test`. Affordability-chain style tests are mandatory for
  any new progression system.
- No engine abstraction until v2 needs it twice. Lift files from v1 the
  first time, extract an engine the second time.
