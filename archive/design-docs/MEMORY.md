# MEMORY — The Exponential Machine

## How this works

- **FEEDBACK_RAW.md** — append-only log of raw user feedback, one block per session.
- **MEMORY.md** (this file) — agent-written distillation. After each session, the agent reads all new raw feedback, checks it for consistency with existing principles, and updates this file. Concise over complete. Resolve contradictions explicitly.

Any agent starting work on this project should:
1. Read MEMORY.md fully.
2. Skim FEEDBACK_RAW.md for anything not yet distilled.
3. After the session, append new raw feedback to FEEDBACK_RAW.md and update this file if principles changed.

---

## User

CS student. Evaluates the game as a player. Prioritizes clarity and feel over historical accuracy.

---

## Language rules

**All interactive labels must be understood with zero context.** No jargon — not historical ("enigma"), not technical ("cipher", "decrypt"). Plain words only.

- Historical flavor goes in `flavor` fields (italicized, atmospheric, non-actionable).
- Interactive labels use plain descriptors: "ARMY RADIO CODE" not "ARMY ENIGMA"; "crack" not "decrypt".
- When naming anything new: would a non-CS non-historian understand this immediately?

**Established names (UI label → internal key):**

| UI label | Internal key |
|---|---|
| Initiatives | `operations` / `OPERATIONS` |
| ARMY RADIO CODE | `armyEnigma` |
| NAVAL RADIO CODE | `navalEnigma` |

Internal keys are not renamed — the labels are enough.

---

## Game feel rules

**The exponential must be in production speed, not in cost.**
Players must feel like they generate FLOPs and Data exponentially faster as they upgrade. The search space can grow, but rewards must grow at the same rate so loop time stays consistent. Multipliers from initiatives and personnel are what make the player feel faster — that's where the exponential rush comes from.

- `DROP_SCALE` is `1.02` (`src/systems/search.js`). Keep it small. Crack rewards scale by `DROP_SCALE^dropCount` so each loop takes roughly the same time. Earlier values (1.35, 1.08) compounded too hard — after ~100 drops, rewards were orders of magnitude above `dataCap`, so most of each drop was wasted.
- Costs can grow phase-to-phase, but the player must always have tools to outpace them before being gated.

**Every initiative card must show its plain effect, not flavor text.**
The card body (below the label) shows what the initiative actually does in plain numbers. Flavor text goes to the log.

- `result` field: plain English effect shown in the card. On completion it's pushed to the event log. Use ` · ` as inline separator (no line breaks in card).
- `flavor` field: atmospheric story text (historical narrative).
- Never add an initiative without both fields.

**No confirmation overlay after clicking an initiative.** Completions push `result` straight to the event log. `overlay` fields on operations are dormant — reserved for rare dramatic beats only (phase transitions, war milestones). Do not default-enable them.

**Gate-blocked initiatives must show the blocker inline.** When `canExecuteOperation` returns `can: false` with a non-cost `reason` (e.g. "Need 10 Indexers"), `renderOperations` displays it in red next to the cost. Players must always be able to tell *why* a card is grayed out.

**The Carrot Principle — always show a visible next goal.** The initiative panel must never be empty. When the panel has nothing, the player has nothing to aim at and no reason to keep clicking — they cannot "work toward" what they cannot see. At least one future initiative should always be visible, even if it's gated/unaffordable/date-locked. The blocker reason (e.g. "Need 8 Boffins", "Available from March 1942") becomes the carrot: the player knows *exactly* what to do next. Preview cards must be readable as future goals, not just present affordances. When adding trigger conditions, think: "does the player always have something on screen to pursue?"

**There is a running event log (right column, above Initiatives).**
Populated by: initiative completions (flavor text), crack events, phase transitions. Newest entries at top. Max 20 entries. Implemented in `src/core/log.js`, rendered in `src/ui/render.js`.

**Streams must communicate what they are and what's happening.**
Each stream has: a plain label, a one-line `description` ("Captured enemy message — crack it to earn Data"), a status line that changes as progress advances, ETA, and reward preview.

---

## Theme system

Dark/light mode via CSS custom properties on `data-theme` attribute of `<html>`. Default follows `prefers-color-scheme`. Manual choice stored in `localStorage` key `tem_theme`. A `<script>` in `<head>` reads this before CSS loads to prevent flash. Toggle button in footer shows the opposite of the current mode ("LIGHT" when dark, "DARK" when light). All colors in CSS must use variables — no hardcoded hex values in rules that apply to themed elements.

## Save system rules

Save key: `tem_save_v1` (localStorage). Fields starting with `_` are never saved (transient).

**When adding new state fields:** add them to `createInitialState()`. The merge in `game.js init()` only covers top-level keys — new nested fields inside existing objects will be absent on old saves. Either flatten to top level or add explicit migration in `loadGame()`.

---

## Naming rules

**Phase 0 capacity label:** Use **Billets** (not "Supply") in UI. Already in design docs. WWII-accurate. Reads as "slots you assign to workers." Internally still `supply` in state. Label evolves in later phases.

**The game is about the history of computing**, not just WWII. Phase 0 (Bletchley Park) is the starting era. All naming and string decisions should make sense across all 11 phases.

---

## Initiative DAG rules

- `src/data/operations.js` is the single source of truth. Each node is self-contained.
- **`trigger`**: when the node enters the available pool (checked every tick). Fields: `operations[]`, `minDrops`, `minJuniorCalculators`, `minBoffins`, `minHuts`, `minData`, `minPhase`.
- **`gates`**: additional conditions checked at execution time (node visible but not clickable). Fields: `minBoffins`, `minHuts`, `minBombes`, `minIndexers`, `minJuniorCalculators`, `minWrens`, `minDate: { year, month }`.
- **`minDate` is a gate, not a trigger.** Historical/war dates (e.g. "Available from Aug 1940") block execution, not visibility — otherwise the panel empties while the player waits for dates to tick over. `hasDateGatedPendingOp` checks only `trigger.minDate` (currently unused) — if re-added, do NOT extend it to gate dates or the game freezes at t=0.
- **No `unlocks` field** — parents do not know their children. Children declare their own parents via `trigger.operations`.
- To add an initiative: add one object to `OPERATIONS`, set its `trigger`, update the graph diagram at the top of the file. Nothing else.

---

## v2 rebuild (from 2026-04-20)

v1 froze at the end of session 11. Design review concluded the mechanics
couldn't generalize past Phase 1 and were dimensionally overloaded at start.
v2 is a clean-slate rebuild; v1 stays runnable as reference and as a donor
for system-level pieces (save, log, theme, simulator).

- `v2-00-critique.md` — 10-point failure analysis of v1 from a complex-systems read
- `v2-01-design.md` — v2 universal commitments (one unit across all phases, progressive reveal, cadence-not-cost exponential, decisions not just optimization, process rule: design-first)
- `v2-02-separation.md` — repo layout, what's reusable vs throwaway, rules for lifting from v1
- `v2-03-phase-0.md` — Phase 0 spec (Bletchley, flavor progression, JUNIOR CALCULATOR, thesis delivery). Pattern for all phases: `v2-0N` = phase N.

**Process rule — design first, always.** Define gameplay in MD, review,
iterate, THEN implement. No gameplay decisions in code. The v2-00 critique
of v1 identified gameplay-decided-in-code as a root cause of the mechanics
drift. Violating this is how v2 starts to repeat v1's mistakes.

**Historical flavor is load-bearing.** The first v2 implementation stripped
all atmosphere (HAND / COMPUTE / bits) and lost the point of the game —
going through the history of computing. The metaphor (bits-eliminated) is
substrate-agnostic. The DRESS at each phase is substrate-specific. Phase 0
is Bletchley Park in 1939. The player is Compute procuring substrate. The
atmospheric layer is what makes this not just a Universal Paperclips clone.
Discipline: phase-agnostic mechanic spine + phase-specific flavor skin.

**Code repo layout** (`/Users/gama/Documents/personal/the-exponential-machine/`):
```
v1/                 # frozen — src/, sim/, tests/, docs/, index.html, style.css
v2/                 # active — src/main.js empty shell, index.html, style.css
index.html          # landing page → pick v1 or v2
serve.py            # static server at root (unchanged)
package.json        # npm test points at v1/tests/
```

**Rules for lifting from v1 into v2:**
- Lift the first time (copy + strip v1 assumptions), extract an engine the second time.
- Never import across the v1/v2 boundary.
- v1 is frozen — no features or refactors.
- v1's 84-test suite stays green (`npm test`).

Everything in the sections above this one (language rules, game feel rules,
theme system, save system, naming rules, initiative DAG rules) was written
against v1 and applies to v1. Rules that survive into v2 are re-stated in
`v2-01-design.md`; the rest stays as v1 reference.

---

## Session log

| Date | Changes |
|---|---|
| 2026-04-19 | DROP_SCALE 1.35→1.08; reward scaling per drop; stream names and descriptions; stream UI (status text, ETA removed, reward preview); initiative cards show effect not flavor; initiatives disappear immediately on click; running event log (right column, fixed 2-line, arrow nav, initiative events only); dark/light theme system with system-preference default and manual toggle; contrast and font size improved |
| 2026-04-19 (s6) | Initiative DAG redesigned: trigger-based reveal (milestone-driven like UP), gates for execution blocking, unlocks removed; infrastructure panel shows on first hire; huts now give +6 supply cap; data cap stays at 500 (cardIndexEarly is the upgrade); flopsPerClick stays at 1; 01-mechanics.md updated to reflect implementation; Billets chosen as Phase 0 supply label |
| 2026-04-19 (s7) | Phase 1 fixed (missing `#hardware` div in HTML, missing `data-buy-hardware` handler in game.js); initiative completion overlays disabled (results push straight to log); DROP_SCALE reduced 1.08→1.02 (rewards were millions vs 2500 cap); gate reasons ("Need 10 Indexers") now rendered in red on blocked initiative cards; design discussion captured — pacing too fast, phases need narrative purpose beyond economy, too many units/infra available at start |
| 2026-04-19 (s8) | Affordability chain tests added (any op exceeding its dataCap tier fails CI); cardIndexEarly ×10 (cap 500→5000); installationVictory adds dataCap ×6; Bombe FLOPs fix (moved before _flopsPerSec assignment); buyBombe gated behind phase≥1; Wren deadlock fix (0.5W reserved); CONFIG singleton in src/config.js wired everywhere; headless Monte Carlo simulator (sim/simulate.js) with seeded PRNG, --config override, bottleneck/cap pressure report; sim infinite-loop guard added (max wall-clock + max ticks) |
| 2026-04-19 (s9) | Phase 1 DAG reorder: `recruitmentFirstWrens` now off `installationVictory` at 1942-01 (was `creationHut3` at 1942-11) so Bombes + operators arrive together; mid-P1 dataCap lifts (`agnusDei +5000`, `theCilleExploit +10000`, `creationHut3 ×2`); Wren electricity removed (was 0.5W, caused UX trap where Bombes exhausted grid and Wrens became unbuyable); `buyBombe` reservation removed (cap 30W now fits 6 Bombes exactly); Night Shift duration 90s→60s, cooldown 600s→240s; event log arrow buttons fixed (memoized render stops innerHTML thrash); log scroll allows down-nav at any entry count; `firstNavalEnigmaBreak` gains `minIndexers:3`; stripped stale/contradicted historical dates from flavor; **Carrot Principle** — initiative panel must never be empty, always show next goal even if gated |
| 2026-04-19 (s10) | Carrot tuning — empty panel 64.2%→0.1% (30/30 completion). Moved `minDate` from trigger → gates on all 15 date-gated ops (phase 0 war events + all phase 1 ops); `canExecuteOperation` renders "Available from Aug 1940" when gate.minDate unmet; `hasDateGatedPendingOp` deliberately NOT extended to gate dates (would freeze t=0). Simulator now tracks carrot penalty (`sim/simulate.js`). Lowered several early triggers (zygalski minDrops:0, formationHut6 minJC:2, messHall minHuts:1, concept/turing gate minHuts:1). Tests updated (84/84 pass). Tuning log at `10-carrot-tuning-log.md` |
| 2026-04-19 (s11) | Historical date realism pass — WW2 was ending in 1941 because date gates compressed too far. All 15 date gates re-tightened to within 1 month of real events (veDay now 1945-04, dDay 1944-05, Atlantic 1943-04, Bismarck 1941-04, Cape Matapan 1941-02, Shark blackout 1942-08). Added 6 new filler ops to bridge long 1941-1945 span: `battleOfCapeMatapan`, `sinkingOfBismarck`, `sharkBlackout`, `fourRotorBombe` (gate 1942-12, minBombes:10), `colossusOperational` (effect: `state.multipliers.flopsPerSec *= 2`), `ardennesOffensive`. Rewired `veDay` trigger `['dDayIntelligence']`→`['ardennesOffensive']`. Game now spans 1939-09→1945-04 in ~12.4m with carrot still at 0.0-0.1%. Rule: dates in flavor text must match gate dates; flavor historical dates are "real"; gate dates can be up to 1 month earlier but never more. Tests 84/84 pass. |
