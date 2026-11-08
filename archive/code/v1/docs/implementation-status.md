# Implementation Status

Tracks what is built in code vs. what exists only in design docs.

## Phase 0: The Human Mainframe (1939–1940)

### Core Loop
- [x] COMPUTE click button
- [x] FLOPs accumulation
- [x] Army Enigma search bar (The Drop)
- [x] Data reward on Drop
- [x] Search space scaling per drop (×1.35)
- [x] Naval Enigma stream (unlocked via Operation)
- [ ] Manual FLOPs weighting between streams (currently split evenly)

### Personnel
- [x] Junior Calculator (0.1 FLOPs/sec)
- [x] Mathematical Lead / Boffin (2.5 FLOPs/sec, −2% op cost per Boffin)
- [x] Section Head (×1.25 multiplier to Calculators in hut)
- [x] Cost scaling (×1.12 per unit owned)

### Infrastructure
- [x] Huts (slot management)
- [x] Canteen Expansion (+20 Supply cap)
- [x] Coffee Rationing (−15% Supply cost, max 3)
- [x] Night Shift Rotation (×2 FLOPs, 90s on / 10min cooldown)

### Operations (Phase 0)
- [x] Receipt of the Zygalski Sheets
- [x] Formation of Hut 6
- [x] Formation of Hut 8
- [x] First Manual Break of Army Enigma
- [x] The Herivel Tip
- [x] Frequency Analysis
- [x] Rotor Logic Mapping
- [x] Recruit First 50 Computers
- [x] Card Index (Early)
- [x] Conceptualize the Bombe (phase transition trigger)

### Save / Load
- [x] Auto-save (15s)
- [x] Save on tab hide
- [x] Transient `_` keys stripped from save
- [x] Missing keys merged on load (forward compatibility)

### UI
- [x] Progressive disclosure (sections appear as unlocked)
- [x] Operations panel with type tags and affordability state
- [x] System Specs footer (FLOPs/sec vs Phase 0 baseline)
- [x] Floating Data reward popup on Drop
- [x] Full-screen overlay for narrative moments
- [x] Dev-only RESET button (localhost)
- [x] Dev-only console logs (localhost)
- [ ] ETA on search bar (coded, not verified accurate)
- [ ] Audio (The THWACK sound on Drop)

---

## Phase 1: The Mechanized Search (1940–1945)

Fully designed in `docs/mechanics-p0-p1.md`. Not yet implemented.

- [ ] Bombe unit (hardware, requires Wren operator)
- [ ] Electricity resource (hardware cap, separate from Supply)
- [ ] Wren, Cryptanalyst, Indexer, Senior Boffin units
- [ ] Crib system (search space multipliers)
- [ ] Diagonal Board upgrade (×10 Bombe output)
- [ ] All Phase 1 Operations (see mechanics doc)
- [ ] The Blackout crisis (auto-trigger, M4 Enigma)
- [ ] Colossus unit
- [ ] Phase 2 transition
- [ ] The Great Decommissioning (player choice)

---

## Phases 2–10

Design only. See `docs/overview.md`.

---

## Known Issues / Tech Debt

- Operations `canExecuteOperation` checks `state.resources.flops` for flops cost, but FLOPs are never decremented by the resource system — they just accumulate. Operations that have a `flops` cost do deduct from it in `executeOperation`. This is inconsistent; FLOPs should probably be treated as a "spent" resource like Data, not an accumulator. Low priority until Phase 1.
- `state.hardware.bombes` exists in initial state but is unused (Phase 1 not built).
- `state.flags.boffinsReduceOpCost` counter is tracked but the actual multiplier is applied directly on `onBuy`. The counter is redundant.
- No automated tests for `systems/search.js` or `ui/render.js` yet.
