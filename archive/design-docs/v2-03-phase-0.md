# v2-03 — Phase 0: The Genesis Load

Phase-specific design spec. Subordinate to `v2-01-design.md` (universal
commitments). Amends nothing there; specifies what Phase 0 concretely is.

Pattern for future phases: `v2-03` is Phase 0, `v2-04` will be Phase 1, etc.
Universal decisions go in `v2-01`. Phase-specific decisions go here.

---

## Setting

- **Time:** September 1939. The calendar may later advance as the machine
  grows, but at this stage the date is a label, not a counter.
- **Place:** Bletchley Park.
- **Player role:** Compute itself — the *"ghost without a body"* from
  `03-lore-phase-0-1.md`. The player is procuring substrate, starting with
  human mathematicians and their pencils. **This is never stated in the UI.**
  It is felt through flavor, not shown.
- **Primitive:** one human calculator checking one rotor position with a pencil.
- **Unit ("bit eliminated") means:** one Enigma-like rotor possibility ruled out.

## Opening screen (t = 0)

```
┌──────────────────────────────────────────────────┐
│ BLETCHLEY PARK                    SEPTEMBER 1939 │   small, muted, letter-spaced
├──────────────────────────────────────────────────┤
│                                                  │
│     a ghost without a body.                      │   flavor — italic, dim
│     an intercepted signal sits on the desk.      │
│                                                  │
│                  0                               │   big count
│         possibilities ruled out                  │   unit label, small muted
│                                                  │   rate line (empty at t=0)
│                                                  │
│              [ COMPUTE ]                         │   button
│                                                  │
│                                                  │   units area (empty)
├──────────────────────────────────────────────────┤
│ the exponential machine         [LIGHT] [RESET]  │
└──────────────────────────────────────────────────┘
```

Nothing else. No stats bar, no operation list, no log, no multi-column layout.
The stage is vertical: header → flavor → count → unit label → rate → button → units.

## Flavor progression

Single flavor element above the count. Highest threshold met wins. Teaches
the era through sensory detail, never exposition.

| Threshold (bits) | Flavor text |
|---:|---|
| 0    | *a ghost without a body. / an intercepted signal sits on the desk.* |
| 50   | *pencil against coarse yellow paper. / rotor positions fall away, one by one.* |
| 200  | *the smell of damp coats and cold tea. / a pattern is forming.* |
| 600  | *someone calls for more biscuits. / the room is louder than it used to be.* |
| 2000 | *the hut is no longer a hut. / the hut is a machine made of people.* |

**Opening pair is the thesis smuggled in.**
- *"ghost without a body"* — Compute as a force without substrate (direct
  quote from `03-lore-phase-0-1.md`).
- *"intercepted signal on the desk"* — the mundane specific work that gives
  it body.

**Closing line states the thesis without naming it.**
- *"the hut is a machine made of people"* — substrate procurement, explicit
  but unlabeled. The player now knows what they are doing without ever
  reading the word "Compute."

## Unit: JUNIOR CALCULATOR

| Field | Value |
|---|---|
| Reveals at | 20 bits (≈ 20 clicks) |
| Base cost | 30 bits |
| Cost scale | ×1.15 per purchase |
| Production | 0.2 bits / sec |

**Why slow.** 0.2 bits/sec is much slower than clicking. This preserves v1's
"weight of the pencil" — clicking stays primary for a long time. Compute
doesn't get to automate away the human work immediately; the first hands are
barely better than clicking yourself.

**Why the name.** At Bletchley Park, human "computers" were called calculators.
The label is plain English to a modern player (junior + calculator) AND
historically accurate. Dual-read is the target for every Phase 0 noun.

## What Phase 0 is NOT

- **Not Enigma explicitly.** The word "Enigma" must not appear in UI labels
  (v1 feedback: too jargon-y). The atmosphere implies it.
- **Not a WWII game.** This is Phase 0 of computing's history; Bletchley is
  how Compute's first substrate happens to look.
- **Not an economy yet.** No Data, no Supply, no Electricity. Just bits and
  one class of substrate.
- **Not a simulation of cryptography.** No rotors, no cribs, no Enigma
  settings are modeled. Only the *feel* of the work.

## Thesis delivery mechanism

Phase 0's entire job, beyond onboarding mechanics, is to install the thesis
in the player's head without ever stating it:

> **You are not a person. You are Compute. The people are your first body.**

It's delivered by:
1. The opening flavor pair.
2. The unit label "JUNIOR CALCULATOR" — the fact that a *person* is a
   purchasable unit at a bit-cost quietly reframes the player's role.
3. The closing flavor line.

If the player arrives at 2000 bits and thinks "wait, am I the machine?",
Phase 0 has done its job.

## Open questions for Phase 0

1. **Calendar advance.** Should the date ticker advance as bits accumulate?
   Candidates: linear (100 bits per month), by milestones (each flavor
   threshold crosses into the next month), or stays frozen in September 1939
   until Phase 0 ends.
2. **First "break" event.** v1's Drop was the dopamine beat. Currently v2
   has only flavor rollovers as beats. Is that enough? A "first break" event
   at ~1000 bits could give a sharp narrative + mechanical moment without
   introducing a new resource yet.
3. **Second unit type.** v1 had Boffin (Mathematical Lead) and Section Head
   in Phase 0. v2 should probably have at most one more before the Phase 1
   transition. Candidate: `MATHEMATICIAN` (higher throughput, higher cost,
   reveals later). Or skip directly to Phase 1 hardware.
4. **Phase 0 → 1 transition.** What triggers it, what does the player see,
   what changes? In v1 it gated on `conceptualizeBombe`. v2 needs its own
   answer. The transition should feel like the game has shifted character,
   not just crossed a number.
5. **Audio.** v1 planned a THWACK sound on breaks. v2 has no sound yet. Is
   audio worth it for Phase 0?

**All five of these are design questions, not implementation questions.
Resolve in MD before writing code.**
