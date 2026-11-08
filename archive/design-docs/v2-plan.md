# v2 Plan — What we're building and why

An overview + v1/v2 comparison. This doc is a map, not a spec. For the
actual design commitments, see:

- `v2-00-critique.md` — why v1 needs rebuilding (10 failure modes + what to carry forward)
- `v2-01-design.md` — universal commitments across all 11 phases
- `v2-02-separation.md` — how v1 and v2 coexist in the same repo
- `v2-03-phase-0.md` — Phase 0 concrete spec (Bletchley, 1939)

---

## One-line difference

**v1** was a WWII cryptanalysis idle game that planned to grow into more.
**v2** is an 11-phase history of computation from the first frame, using a
single generalizable primitive, with the thesis hidden and emerging through
play.

---

## Table 1 — Philosophy, purpose, vision

| Dimension | v1 | v2 |
|---|---|---|
| **Scope framing** | Implicitly a WWII game; later phases were "maybe, someday" | Explicitly all 11 phases from t=0; Phase 0 is a station, not the setting |
| **Core metaphor** | Cryptanalysis / search-space reduction | Shannon-style uncertainty reduction (bits eliminated) — substrate-agnostic |
| **Unit continuity** | FLOPs + Data + Billets + Electricity (4+ currencies) | One scalar — Bits-Eliminated — persists across all 11 phases |
| **Player role** | A cryptographer at Bletchley | Compute itself — "a ghost without a body" — procuring substrate |
| **Thesis delivery** | Stated on title screen ("you play as the emergent intelligence of computation") | Hidden; emerges through flavor and mechanics; player should *discover* it |
| **How complexity grows** | Stack new mechanics on top of existing ones | Each phase introduces **one** new primitive; the old one abstracts into an aggregate |
| **Where the exponential lives** | Costs (bad — DROP_SCALE compounding against itself) | Cadence (good — production speed itself visibly accelerates; years-per-second shrink) |
| **Dopamine beat** | "The Drop" (discrete reward event) | Cadence acceleration + flavor rollovers; specific beat still open for Phase 0 |
| **Decision layer** | Pure optimization — every initiative is "click when available" | At least one real fork per phase; moral/strategic weight; replayability |
| **Information reveal** | Full UI visible by minute 2 (streams, personnel, infra, initiatives) | Progressive reveal; first "wait, what?" moment at 5+ min, not minute 0 |
| **Constraint vs incentive** | Early game dominated by not running out of Billets | Constraints appear as discoveries, not starting facts |
| **Player progress readout** | Many numbers, no single "how far am I" scalar | The bit counter *is* the progress scalar; it never resets across phases |
| **Historical accuracy** | End in itself ("Army Enigma," "Bombe") → too jargon-y | Reinforces mechanic where useful, yields where not; atmosphere over nomenclature |
| **Design process** | Gameplay decisions accreted in code | Design-first: MD spec → review → iterate → only then implement |

---

## Table 2 — Concrete mechanics at Phase 0

Snapshot of what each version actually puts on screen in the opening minutes.

| Element | v1 | v2 |
|---|---|---|
| **Opening UI** | Stats bar + multi-column streams + personnel + infra + initiatives | Single button ("COMPUTE"), flavor text, count, unit label — one vertical stage |
| **Starting currencies** | FLOPs, Data, Billets, Data cap, Electricity | Bits (one scalar). Nothing else. |
| **Click output** | 1 FLOP + drop mechanic | 1 bit |
| **Drop mechanic** | "The Drop": periodic windfall multiplied by DROP_SCALE | None. Drops removed. Cadence carries the beat. |
| **Visible units at t=0** | Junior Calculator + Boffin + Section Head + huts + canteen | None. Only the button. |
| **First unit reveal** | All available immediately | JUNIOR CALCULATOR reveals after 20 bits (≈20 clicks) |
| **First unit production** | ~1 FLOP/sec (faster than clicking) | 0.2 bits/sec (deliberately **slower** than clicking — preserves "weight of the pencil") |
| **Cost scaling** | Per-unit scale + DROP_SCALE (1.08) compounding everywhere | Per-unit scale only (×1.15). No compounding drop multiplier. |
| **Flavor delivery** | Event log with scrolling history | Single flavor element above the count; crosses thresholds (0, 50, 200, 600, 2000) |
| **Flavor content at start** | "Army Enigma intercepted…" (domain jargon) | *"a ghost without a body. / an intercepted signal sits on the desk."* (thesis smuggled in) |
| **Phase 0 ending flavor** | N/A (phase ends on `conceptualizeBombe` op) | *"the hut is no longer a hut. / the hut is a machine made of people."* (thesis delivered without being named) |
| **Initiatives / operations** | 10 in Phase 0 (DAG with trigger + gates) | None yet in Phase 0. Open question: is a single "first break" event needed as a beat? |
| **Data cap** | Present from t=0, must be upgraded | Absent in Phase 0; will appear later only if it constrains something |
| **Personnel cap (Billets)** | Present from t=0 | Absent in Phase 0 |
| **Electricity** | Present from t=0 (Phase 1 introduces Bombes) | Absent in Phase 0; will appear only as a discovery when relevant |
| **Calendar** | "SEPTEMBER 1939" ticker that advances with FLOPs | Static "SEPTEMBER 1939" label for now. Open question: does it advance? |
| **Phase 0 → 1 transition** | Gated on `conceptualizeBombe` initiative | Open question — what triggers it, what does it feel like |
| **Audio** | Planned "THWACK" for Drops, never built | None. Open question whether to add. |
| **Save system** | localStorage, `_`-prefix transient keys stripped | Same (carried over intact) |
| **Theme toggle** | Dark / light with `data-theme` + no-flash script | Same (carried over intact) |
| **Engine abstraction** | None; modules used directly | None (same — lift from v1 on second need, not first) |
| **Tests** | 84 passing in `v1/tests/` | None yet in `v2/`. Affordability-chain test mandatory when first progression system lands. |

---

## Where we are right now

Implemented in `v2/`:
- Empty-shell HTML + CSS + `src/main.js`
- One button, bit counter, flavor progression (5 thresholds), JUNIOR CALCULATOR unit
- Save / load / theme / reset
- Faithful rendering of `v2-03-phase-0.md` at the opening-minutes level

Not yet designed (blocks further implementation):
- The five Phase 0 open questions in `v2-03-phase-0.md`:
  1. Does the calendar advance, and how?
  2. Is there a "first break" dopamine event, and what is it?
  3. Is there a second Phase 0 unit (e.g. `MATHEMATICIAN`), or do we go straight to Phase 1?
  4. What triggers and what does the Phase 0 → 1 transition feel like?
  5. Do we want audio in Phase 0?
- The three universal open questions in `v2-01-design.md`:
  1. What replaces "the Drop" as the dopamine beat across all phases?
  2. What is the first hidden dimension to reveal, and when?
  3. How do we display very large bit counts without the number becoming noise?

Not yet written:
- `v2-04-phase-1.md` through `v2-13-phase-10.md` — one design doc per phase before any code for that phase.
- Decision-fork specs (at least one per phase per `v2-01`'s commitment).

---

## Process rule (durable, from `v2-01`)

1. Write the design in MD first.
2. Review and iterate with the user until the design is clearly good.
3. Only then implement. The code is a faithful rendering of the MD.
4. If code and doc drift, the code is wrong. Update the doc first; then the code to match.

This rule exists because v1's mechanics drift was caused by gameplay
decisions accumulating in code without being crystallized in design first.
The first v2 coding pass repeated this mistake and was rolled back.

---

## Recommended next step

Pick one of the Phase 0 open questions (suggest starting with **#2 — the
first break event**, because it's the dopamine beat and anything mechanical
after it depends on whether it exists). Discuss it here or in an appendix
to `v2-03`, iterate until the answer is clearly good, then — and only
then — touch code.
