# v2-00 — Critique of v1 (why we're rebuilding)

A complex-systems read of v1's mechanics. Each section names a failure mode and why it matters for an idle game whose thesis is "surprise the player with emergent complexity from simple rules."

Written after Phase 0 and Phase 1 were both playable (2026-04-19, ~12 min playthrough through V-E Day). v1 is not broken — it just plateaus, and the metaphor can't generalize past Phase 1.

---

## 1. Dimensional overload from minute 1

The player juggles FLOPs, Data, Billets, Search Space, DROP_SCALE, Operations cost multiplier, two streams, and a dated calendar — before the first Drop. Universal Paperclips started with one button, one number. Emergent complexity came from one variable being re-contextualized, not from six variables colliding. v1 pays the cognitive cost of complexity without yet having earned the payoff.

## 2. The core loop doesn't recursively transform

In UP, paperclips → money → more paperclips → trust → compute → probes → matter. The *same unit* keeps changing meaning. In v1, FLOPs → Drop → Data → Personnel → FLOPs is a closed loop that never transforms. Data in 1939 and Data in a hypothetical Phase 7 mean the same thing — "currency." There's no conceptual torque across phases.

## 3. The "Search Space" metaphor is a dead end past Phase 1

Enigma-cracking is beautiful for Bletchley, but transistors, chips, personal computers, web, LLMs aren't searches. That's why the content tree stops at Phase 1 — the metaphor won't stretch. A generalizing candidate: **Shannon-style uncertainty reduction**. Every era is "bits of entropy eliminated per second"; the machine invents ever-stranger substrates to eliminate them. That one primitive carries from a human with a pencil to a post-human reshaping cosmological states.

## 4. The full UI skeleton is revealed too early

Streams, personnel, infra, initiatives, billets — all visible by minute two. UP hides Trust, Yomi, Creativity for a long time; when each appears, the player realizes the system was larger than they thought. v1 spends its surprise budget on the first screen.

## 5. Mechanics stack rather than replace

Junior Calculators keep existing in 1943 alongside Colossus. Historically true, mechanically noisy. UP made previous layers *irrelevant* — once autoclippers existed, the player stopped clicking. A new primitive should collapse the old one into a single abstracted number ("labor") or remove it from active attention entirely.

## 6. Date-gates fight the exponential feel

v1's thesis is "the exponent is in production speed." But historical dates force calendar-time to be the rate-limiter for major beats. The player feels slowed by a history lesson. Either calendar dates should be *labels* on achievements the player unlocks at their own pace, or the calendar itself should accelerate as the machine does (years-per-real-minute shrinks — a second-order exponential that *is* the thesis).

## 7. Initiatives do too many things at once

Each card: unlocks a unit + adds a multiplier + gives flavor + unlocks the next. In UP most projects are one atomic fact. Mixing in more "pure narrative" initiatives that *only* advance the date/log would make mechanics-changing ones feel rare and therefore felt.

## 8. Zero real decisions

Every initiative is "click when available." UP had ~5 decisions that gave the game moral and strategic weight (release the HypnoDrones, fight or disassemble). v1 has none. Possible forks: Turing or Newman leads? Use an intercept knowing it kills civilians to keep the secret? This is also where the philosophical weight lives.

## 9. No single "how far am I" scalar

v1 has lots of numbers (Data/sec, FLOPs/sec, supply used) but no visible scalar for phase progress. The player can't tell if they're 10% or 80% through Phase 0 at any given moment. UP's Trust / Creativity / Yomi were readable ratchets.

## 10. Constraint > incentive in player attention

Billets and Electricity are *constraints* — they stop you. Clicking and buying are incentives. Too much of the player's attention goes to removing constraints. UP balanced this: the market system is mostly about *enablement* (lowering price creates demand, making the rush feel good); constraints appeared mostly at phase transitions. In v1 the early game is dominated by not running out of Billets.

---

## Interaction between these failures

The failures reinforce each other. Because the metaphor doesn't generalize (#3), the design needed two escape valves — stacking mechanics (#5) and date-gating (#6) — to keep content flowing. Because the core loop doesn't transform (#2), every new initiative had to do mechanical work (#7), which accelerated dimensional overload (#1). Because the UI reveals everything at once (#4), there's no room for surprise reveals to pay off the complexity.

The fix is not a series of patches. It's a different spine.

---

## What v1 got right (carry forward)

- **The carrot principle.** Always show a visible next goal. This is real and it stays.
- **Progressive disclosure flags.** The `state.ui` pattern is correct; the bug is *how much* is revealed and how early.
- **Trigger vs. gate distinction.** `trigger` controls visibility, `gates` control executability. This separation is right.
- **Event log with flavor.** Running ticker of historical/narrative beats is good atmosphere.
- **Theme toggle, save system, dev harness.** All mechanically solid; reusable.
- **Headless simulator with the carrot metric.** Surprisingly load-bearing for tuning. Keep it.
- **FEEDBACK_RAW → MEMORY flow.** This meta-process works and should continue.
