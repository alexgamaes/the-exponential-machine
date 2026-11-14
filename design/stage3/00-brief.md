# Stage 3 brief (for the design team)

Read first: `design/00-requirements.md`, `design/05-game-design.md` (overall + Stage 1 + change notes §8–9),
`design/06-stage2.md` (Stage 2 as built, incl. §5–9), `src/data/stage2.js` (the data format Stage 3 must follow),
`src/engine.js` (what the engine can already do). Do NOT read `archive/`. Do NOT edit `src/`, `sim/`, `tests/`.

## Stage 3 at a glance (from 05 §3, open to refinement)
- Years: late 1971 → ~1984. Role: garage founder (later a real company). Stage 2 hands over with the 4004 advert
  (Nov 1971): "a computer on a chip… You think of your three floors."
- Machines: hobby kits → home computers. Goal in 05: "Sell a computer to everyone" (open: e.g. a computer on every desk / in every home).
- Unit: "operations" (keep it unless there is a strong, plain reason). The number never resets.
- You arrive with the Stage 2 legacy: about 2–3×10⁷ operations per second, forever (a fixed Legacy row).
  05's "end rate 10⁸" is stale: systems must propose the real target (each stage should end clearly above its legacy).
- Target length: 12–15 minutes for normal play.

## Hard rules (learned in Stages 1–2)
1. The goal bar shows ONLY the stage goal, in ONE unit (total made since the stage began), then the finale steps.
2. Cards: plain effect + cost + their own ETA. History only in the ledger. Locked things say why.
3. The goal is a total-production milestone, clicked when ready, with a big boost. Then a finale of 2 paid actions,
   closing ledger lines, "Pass the ledger on". No hiring in the finale.
4. No dead time: something new at least every ~45 s; late upgrades for the end of the stage.
5. Plain labels on buttons. Light fact-check; creative freedom is fine if not misleading. Ledger moves forward in time.
6. **No click upgrades.** Clicks matter only at the very start; automation is the point. Nothing that rewards clicking.
7. **Each stage needs one real new mechanic** (a new verb, a new decision), not a pile of "×1.5 faster" cards.
   Stage 1: the hiring choice. Stage 2: selling computer time for money (a second balance, you choose the split).
   Stage 3 needs its own, fitting 1971–84. It may reuse money (a founder sells things), but must feel different from Stage 2.
8. The simulator (`sim/simulate.mjs`) must be able to play it (a bot can make the decision), 6 player styles × 2 choices.
9. The player plays on a laptop: the ledger is a right-hand column, counters sit side by side. No pop-ups, nothing flickering.

## Open questions for the team
- What happens to Stage 2's money at the handover (carried, converted, reset)?
- The new mechanic, and how it ties to the goal.
- The two producers (and whether a third appears), the one choice (two options, a real trade-off), promotions.
- The speedometer task ("forecasting tomorrow's weather in N" in Stage 2): what is Stage 3's?
- Story beats 1971–84 and the closing line that hands over to Stage 4 (1984, software CEO).
