# Stage 2 brief (for the design team)

Read first: `design/00-requirements.md`, `design/05-game-design.md` (the merged design and all the change notes in §8–9),
and `src/data/stage1.js` (Stage 1 exactly as built: the data format Stage 2 must follow).
Do NOT read `archive/`.

## Stage 2 at a glance (from 05 §3, open to refinement)
- Years: 1945/46 → ~1971. Role: Director of a computing lab (later a big computing division).
- Machines: valve (vacuum-tube) computers → transistor mainframes. Stage goal: something like "Put a computer on the Moon" (Apollo, 1969).
- The unit name changes from "checks" to "operations" (1948: the log notes what engineers call them); the number never resets.
- The player starts with the Stage 1 legacy speed of about 20,000–27,000 per second (a "Legacy" line that never changes). The stage should end around 10^7 per second.
- Target length: 12–15 minutes for normal play.

## Lessons from playtesting Stage 1 (hard rules now)
1. The goal bar shows ONLY the stage goal, in ONE unit (total made), then the finale steps. It never says "Buy X". Never switch units mid-stage.
2. Cards show a plain effect + cost + their own "~20 s" estimate. History only goes in the log.
3. The stage goal is a total-production milestone (spending never delays it), clicked when ready, and gives a big speed boost.
4. A finale of 2 paid actions after the goal, then closing log lines, then "Pass the ledger on". No hiring during the finale.
5. No dead time: something new (purchase, reveal or log line) at least every ~45 s; the end of the stage needs late upgrades.
6. Plain labels on buttons ("Build a machine", not "ENIAC"). A light fact-check is enough; creative freedom is fine if it is not misleading.
7. The ledger only moves forward in time; log lines must be in historical order with the upgrades that trigger them.
8. The simulator (`sim/simulate.mjs`) must pass for 6 player styles × both choice options.
