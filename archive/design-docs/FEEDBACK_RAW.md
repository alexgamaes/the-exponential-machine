# Raw Feedback Log — The Exponential Machine

Append-only. One entry per session. Do not edit past entries.
The distilled version of this log lives in MEMORY.md.

---

## 2026-04-19

- Operations don't make sense when you click them — e.g. clicking something labeled "ALGO" gives no indication of what action was taken or what changed. Need clear feedback after executing.
- "Army Enigma" and "Naval Enigma" are confusing. Understanding is that it's a code you found and are trying to break. Wants something clearer, like "encrypted code" — doesn't need to be historically accurate, just understandable.
- "Cipher" is also too jargon-y — even a CS student doesn't know what that means in this context.
- The exponential cost scaling feels awful. Every Army Enigma crack taking longer and longer is the opposite of a good idle game. The exponential part must be the generation — producing FLOPs and data faster and faster. Costs can grow too (phase to phase) but in a way where you always feel the rush of producing exponentially and reaching your goal faster.
- Operations section name doesn't make sense. Considered: Projects, Breakthroughs, Research, Initiatives, Upgrades. Chose: Initiatives (option 4).
- Memory/feedback system should not be Claude-specific. Should live in the project folder and work for any agent.
- Wants a two-file system: one file for raw feedback (this file), one file for the agent's distillation. Agent reads raw, checks for consistency, writes concise principles. Then proceeds with implementation.

## 2026-04-19 (continued)

- Initiative cards: the bottom description should show what the initiative actually does (effect/numbers), not the flavor/story text.
- The flavor/story text is good but should go somewhere else — wants a running log like Universal Paperclips has. Log should show recent events (initiative completions, maybe drops).
- Wants the log implemented and tested to see how it feels.

## 2026-04-19 (session 3)

- Event log lines getting truncated with "..." (ellipsis). Text is too long to fit on one line. Wants text to wrap or split into multiple lines rather than be cut off.
- Initiative cards: after clicking, item should disappear immediately with no "COMPLETED" linger state or animation.
- Stream "remaining" (ETA) text should be removed — too much noise.
- Text in general is hard to read — contrast is poor, possibly font size too small.
- Wants dark mode / light mode toggle. Default should follow system preference. Must be able to manually switch.
- Reminder: all feedback should be written to FEEDBACK_RAW.md — agent had not been doing this consistently.

## 2026-04-19 (session 4)

- Light mode text is extremely illegible — contrast too low (muted colors like #9a9a88 on cream background barely visible).
- Font sizes should not use px — use rem so they follow the user's system font size preference.
- Font size should be increased further.

## 2026-04-19 (session 5)

- Light mode still too hard to read — just use full black (#000000) for all text.
- Font should be "stronger/thicker" — not larger, but heavier weight (bold).

## 2026-04-19 (session 6)

- Initiatives should use a DAG with explicit trigger conditions per node, not a static root list. Each node should be fully self-contained.
- Trigger system adopted: each initiative declares its own `trigger` (when it appears) and `gates` (when it can be executed). `unlocks` removed — no parent knows about its children.
- Initiative reveal is now milestone-driven (like Universal Paperclips): e.g. Formation of Hut 6 appears after hiring 3 junior calculators, not at game start.
- All 3 roots appearing after first crack was too many at once — stagger them.
- Infrastructure panel (huts, canteen) was not showing — gating it on `recruitFirst50` completion was too late. Fixed: shows when first person is hired.
- Huts were not actually doing anything despite description saying "+6 slots." Fixed: each hut now adds +6 Supply Cap.
- FLOPs per click was briefly raised to 5 — user said it felt too fast/easy. Reverted to 1.
- Data cap starts at 500 — user confirmed this is correct. cardIndexEarly (×5 cap) is the intended upgrade path.
- "Supply" as a label is confusing — sounds like it's something available, not a cap. User wants a name that reads as "something you give away / assign." Recommendation: **Billets** (already used in design docs, WWII-accurate, Phase 0 appropriate).
- Game is about the full history of computing (11 phases, 1939 to post-human AI), not just WWII. All string/naming decisions should be made in that context.
- Memory/feedback system should live in the project repo, not be agent-specific.

## 2026-04-19 (session 8)

- conceptualizeBombe was unaffordable: dataCap was 2500, cost was 3000. cardIndexEarly was ×5 (giving 2500). Fixed by raising cardIndexEarly to ×10 (cap → 5000). Migration patch added to game.js.
- installationVictory was also unaffordable (same class of bug). Fixed by having installationVictory itself multiply dataCap ×6 (5000 → 30000). Systematic affordability test added to catch this whole class.
- "Why the test didn't pick up this?" — new test added: every op's data cost must be ≤ the dataCap tier reachable before it. This test is now mandatory — any new op that exceeds its tier dataCap will fail CI.
- Bombe FLOPs were not counted: bombeStatesPerSec was computed after `_flopsPerSec` was assigned, so bombes never contributed to the flops stockpile or date acceleration. Fixed by moving bombe block before `state._flopsPerSec = fps`.
- Buying a Bombe before Turing proposes one doesn't make sense — gated buyBombe behind `state.phase >= 1`.
- Bought 6 Bombes → could not buy Wren (all electricity consumed). Fixed: buyBombe reserves 0.5W for at least one Wren.
- CONFIG singleton: all tuneable balance constants centralized in `src/config.js`. Simulator can override with `--config <path>` JSON. All modules read CONFIG properties inline (not cached) so overrides take effect.
- Headless Monte Carlo simulator built (`sim/simulate.js`): no DOM/RAF, seeded mulberry32 PRNG, `--runs N --tick T --max T --seed S --verbose --json --config path`, reports op timing, bottlenecks, cap pressure, final state.
- Simulator immediately found 6.4m / 3.2m / 2.8m dead-period gaps from date-gated operations.
- User wants simulation to never run in infinite loops — needs timeout or max-iteration guard.

## 2026-04-19 (session 7)

- Phase 1 had two silent bugs preventing it from working: (a) `index.html` was missing `<div id="hardware">`, so `renderHardware` ran into a null element and did nothing; (b) `game.js` pointerdown handler had no case for `data-buy-hardware="bombe"`, so the Bombe BUY button did nothing. Phase 1 *data* was fully implemented — it just wasn't reachable.
- Initiative completion overlay/confirmation screen is disliked. User wants no full-screen pause after clicking an initiative — the result line should just go to the event log. Removed the `_pendingOverlay` trigger in `executeOperation`; `op.result` always pushes to log now. `overlay` fields left in place on ops but dormant (can be re-enabled selectively for dramatic beats later).
- Drop rewards ran orders of magnitude above the Data cap. Root cause: `DROP_SCALE = 1.08` compounds to ~2199× at 100 drops, multiplied by ~20× stacked multipliers (theHerivel ×2, firstManual ×1.5, rotorLogic ×3, creationHut3 ×1.5, Herivel-per-boffin). Reduced DROP_SCALE to 1.02. Principle: rewards per drop should stay within one cap tier of current `dataCap`; growth should come from production speed (FLOPs/sec), not per-drop reward inflation.
- Gate-blocked initiatives (e.g. `cardIndexFull` needing 10 Indexers) showed a grayed card with no explanation. Fixed: `renderOperations` now reads `reason` from `canExecuteOperation` and displays it in red next to the cost when the blocker is not a Data/FLOPs shortfall. New CSS class `.op-gate { color: var(--red) }`.

### Design conversation — Phase 0/1 pacing and purpose (2026-04-19, session 7)

User completed all 18 initiatives (10 Phase 0 + 8 Phase 1) in ~10 minutes. Flagged three distinct design problems:

1. **Initiatives are spaced too close.** Reference: Universal Paperclips — you save up visibly before each next unlock. Current game has cheap ops + compounding cost multipliers + abundant data, so every trigger becomes instantly affordable. Proposed fixes: cap `operationCost` multiplier floor at 0.7 (not 0.1); cap boffin `−2%` effect at first 10 boffins; raise milestone thresholds (e.g., `minDrops: 5` → 30; `minJuniorCalculators: 3` → 10); raise Phase 1 op costs 3–5×.
2. **Phase has no intrinsic purpose.** Current initiatives are all economy upgrades. Missing: a parallel track of narrative war-milestone initiatives ("Battle of the Atlantic · convoy losses −40%", "Battle of Britain · early warning enabled", "Operation Mincemeat", "V-E Day") that cost Data to "deliver intelligence" and give both flavor and a mechanical payoff. Phase 0 should end on a war-milestone, not only on `conceptualizeBombe`. Each phase needs a fiction-level goal, not just an upgrade ceiling.
3. **Too many unit and infrastructure types unlocked at start.** Only Junior Calculator should be available at game start. Boffin should be gated behind an initiative ("Recruit Mathematicians from the Universities"), Canteen Expansion behind "Mess Hall Constructed", Coffee Rationing behind a rationing-era narrative initiative. Huts remain open (they're the base building block). Each gate becomes a mini-unlock moment and fills the pacing gaps from #1.

User has not yet picked an implementation order. Recommendation given: start with #3 (cheapest, slots into DAG), then #2 (the biggest feel lift), then #1 largely absorbs into the other two.

Pending question to user: should the war-narrative initiatives from #2 be purely decorative (flavor + log) or also mechanical (bonuses)?

Also discussed: the game has no end/victory condition. There's no WWII-end trigger. Phase 2+ (transistor, EDSAC, Colossus declassified, silicon era, …) is not implemented; player hits `available: []` and has nothing to do. A Phase 0→1→2 narrative end-beat for WWII ("V-E Day") is part of the #2 design.

## 2026-04-19 (session 9)

- Microgap tolerance clarified: a single moment with ~3 simultaneously clickable initiatives is fine. Multiple clumps across a run, or one big clump of 7+, is not. After Phase 1 date-gating fixes, P1 runs now stage 7 ops across ~2 minutes (12–30s gaps) instead of 7 ops in 18s.
- Event log arrow buttons (up/down) stopped working. Cause: `renderLog()` replaced `innerHTML` every animation frame, so mousedown and mouseup landed on different button instances. Fixed with memoization keyed on the visible window.
- Log down-arrow must always be able to move to the next line even with only 2–3 entries — lines can still be truncated visually, so the user must be able to scroll to reveal them. Removed the "don't scroll when ≤2 entries" guard.
- Wren availability confusion: in a mid-Phase-1 save, Bombes were available from op 1 but Wrens (needed to actually *run* the Bombes) unlocked at op 6. User: "is it normal that the Wren is not enabled?" — no, that was a real DAG flaw.
- Full DAG audit requested: Phase 1 reordered so `recruitmentFirstWrens` triggers directly off `installationVictory` at 1942-01 with `minBombes:1, minJC:25`. You now get Bombes and their operators together, matching the fiction ("you have a machine; now you need hands to run it").
- User also asked: "the codebreaking is still producing a lot of data, much more than the cap — instead of an exponential regression maybe an arithmetic one, or unblock the cap through an initiative." Answered in two ways: (a) data cap lifts added mid-Phase-1 (`agnusDei +5000`, `theCilleExploit +10000`, `creationHut3 ×2`) so the cap stays in the same order of magnitude as production; (b) DROP_SCALE stays at 1.02 — the problem was cap tiers lagging, not reward growth.
- "Does the Wren actually need power?" — no. Historically Wrens ate food (billets), Bombes drew the grid. The `electricityPerUnit: 0.5` was causing a UX trap: player buys all Bombes, exhausts grid, can't buy Wrens to run them. Removed. More historically correct anyway.
- Night Shift cooldown of 10 minutes was excessive for Phase 0 (which completes in ~7.5 min, so the bonus fired once at most). Shortened: duration 90s→60s, cooldown 600s→240s. ~1.5× more activations per phase. Flavor on `recruitFirst50` updated to match.
- "I was able to buy only 5 Bombes instead of the 6" — starting electricity cap is 30W, Bombes are 5W each, so 6 should fit exactly. `buyBombe` had a leftover `+0.5W` reservation from when Wrens cost electricity; with that obsolete, removed the reservation. Grid can now fill exactly.
- **CARROT PRINCIPLE (key concept from this session):** The initiative panel often goes empty between trigger conditions being met. When empty, the user has nothing visible to work toward — no reason to keep clicking, no goal in sight. The panel must always show at least one future initiative (even if gated/unaffordable), so the player can always see and work toward something. Cards can be shown as locked/grayed with their blocker reason, but they must be *visible*. This is the difference between "what can I do right now" and "what am I aiming at."

## 2026-04-20 (v2 start)

- Decision: v1 frozen, v2 rebuilt clean-slate in same repo. Option B (lift-on-demand) chosen over upfront engine extraction — no premature abstraction. v1 lives in `v1/`, v2 in `v2/`, landing page at root.
- v2-00 critique crystallized: v1's core failures were (1) metaphor didn't generalize past Enigma, (2) mechanics stacked instead of replaced, (3) full UI revealed at t=0, (4) zero real decisions, (5) gameplay decisions accreting in code without design-first grounding.
- v2-01 universal commitments written: one unit across all 11 phases (Bits-Eliminated), one button at start, phase primitive lineage (pencil → rotor → tube → instruction → program → request → model call → token → goal → action → state), progressive reveal, exponential lives in cadence not cost, mechanics replace don't accumulate, thesis hidden not stated.
- First v2 coding pass repeated the v1 mistake: built a game loop and "HAND" generator without grounding in Phase 0 design. Stripped all historical flavor — "HAND / COMPUTE / bits" — losing the whole point of the game (going through the history of computing). User flagged directly: *"we are losing completely the point of going through the history of computing from World War II anti-cryptographers all the way to transistors, the internet, AI and stuff."*
- Rebuilt Phase 0 with Bletchley atmosphere grounded in `03-lore-phase-0-1.md`: "a ghost without a body" opening flavor, JUNIOR CALCULATOR unit (historically accurate — Bletchley called human computers "calculators"), five-threshold flavor progression ending on "the hut is a machine made of people" as thesis delivery.
- **DESIGN-FIRST RULE established as durable.** User: *"let's first always define the gameplay, review it, think about it, that's the high level plan, this should be great, should be good and then the implementation should be something that only is the implementation of the high level game design."* All future phase/mechanic/feature work: write MD spec first, iterate with user, only then implement. Code is faithful rendering, not decision-making surface.
- File pattern: `v2-01` = universal commitments, `v2-03` = Phase 0 spec, `v2-04` will be Phase 1, etc. Each phase gets its own MD before any code.
- `v2-03-phase-0.md` written with: setting, opening screen mockup, flavor progression table, unit specs (JUNIOR CALCULATOR — reveal 20, cost 30, ×1.15 scale, 0.2 bits/sec — deliberately slower than clicking to preserve "weight of the pencil"), thesis delivery mechanism, 5 open design questions (calendar advance, first break event, second unit, Phase 0→1 transition, audio).
- CSS bug during rebuild: `\n` in flavor strings didn't render as line breaks — fixed by adding `white-space: pre-line` to `#flavor`.
