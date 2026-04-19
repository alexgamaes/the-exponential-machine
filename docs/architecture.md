# Architecture

## Game Loop

```
requestAnimationFrame(tick)
  │
  ├── tickResources(state, delta)   — FLOPs/sec, Supply recalc, night shift timer
  ├── tickSearch(state, delta)      — search space attrition, Drop trigger
  ├── tickDate(state, delta)        — in-game calendar (10 real seconds = 1 game day)
  ├── updateUIFlags(state)          — progressive disclosure conditions
  ├── saveGame (every 15s)
  └── render(state)                 — full DOM rebuild
```

Delta is capped at 0.5s to prevent large jumps when the user switches tabs.

---

## State Shape

One plain object, mutated in place. Created by `createInitialState()`. Serialized to localStorage on save.

```
state
├── phase            int          Current phase (0–10)
├── date             object       In-game date {year, month, day}
├── dayTimer         float        Real seconds elapsed toward next game day
├── dayDuration      float        Real seconds per game day (default: 10)
│
├── resources
│   ├── flops        float        Accumulated FLOPs (never decreases except ops with flops cost)
│   ├── data         float        Current Data (capped at dataCap)
│   ├── dataCap      float        Maximum storable Data
│   ├── supply       {used, cap}  Personnel headcount limit
│   └── electricity  {used, cap}  Hardware power limit (Phase 1+, cap=0 means inactive)
│
├── personnel        object       Each unit: {count, baseCost, supplyPerUnit}
├── huts             int          Number of Huts built
├── hardware         object       Phase 1+ machines (Bombes, Colossus)
│
├── streams          object       Intercept streams keyed by id
│   └── [streamId]
│       ├── unlocked    bool
│       ├── blackout    bool      True during the M4 crisis
│       ├── spaceBase   float     Base search space (reset between phases)
│       ├── spaceCurrent float    Actual search space for current intercept
│       ├── progress    float     States cleared so far
│       ├── rewardBase  float     Base Data awarded on Drop
│       └── dropCount   int       Total Drops on this stream (drives spaceCurrent scaling)
│
├── operations
│   ├── completed    string[]     IDs of executed operations
│   └── available    string[]     IDs currently visible to the player
│
├── upgrades         object       Counts and booleans for repeatable upgrades
├── multipliers      object       All floating multipliers (never set to 0)
├── flags            object       Boolean/numeric state from operation effects
├── stats            object       Lifetime totals for display and balancing
│
├── ui               object       Progressive disclosure flags (all start false)
│
└── _*               transient    Keys starting with _ are runtime signals.
                                  Never saved. Cleared between ticks.
                                  Examples: _flopsPerSec, _lastDrop, _pendingOverlay
```

---

## Systems

### resources.js
Runs first each tick. Calculates `_flopsPerSec` from personnel counts and multipliers, adds it to `resources.flops`, updates `supply.used`. Also contains buy helpers (`buyUnit`, `buyInfrastructure`, `getUnitCost`, `canAffordUnit`).

### search.js
Consumes `_flopsPerSec` and `_pendingClickFlops` to advance stream progress bars. When a stream's `progress >= spaceCurrent`, `triggerDrop` fires: rewards Data, increments `dropCount`, scales `spaceCurrent` by `DROP_SCALE^dropCount` (currently 1.35), sets `_lastDrop` signal for the UI.

FLOPs are split evenly across all active (unlocked + not blackout) streams. Manual click FLOPs are consumed the same tick they're generated.

### operations.js
`executeOperation` checks prerequisites, deducts cost, calls `op.effect(state)`, pushes to `completed`, adds `op.unlocks` to `available`. Effects are plain functions that mutate state directly — no event system.

`refreshAvailableOperations` is called on load to re-derive `available` from the completed set, in case new unlock chains were added after the save was written.

---

## Render

`render.js` rebuilds the entire `innerHTML` of each panel every frame (~60fps). There is no virtual DOM or diffing. This is acceptable because:
- The DOM is small (a few dozen nodes at most per panel)
- Avoiding a framework keeps the codebase understandable by a single agent in one pass

**Critical:** event listeners must never be attached to rendered elements directly — they get destroyed on the next frame. All interactive elements use `data-*` attributes and a single `pointerdown` listener on `#layout` (event delegation).

**Why `pointerdown` not `click`:** Between `mousedown` and `mouseup` (a typical click is 50–200ms), multiple rAF callbacks fire and replace innerHTML. By `mouseup`, the original element is detached, so `click` never bubbles. `pointerdown` fires synchronously on press, before any frame runs.

---

## Progressive Disclosure

`state.ui` holds boolean flags. `updateUIFlags()` checks conditions each tick and flips them to `true` (never back to false). `render.js` checks these flags before rendering each section.

| Flag | Condition | Reveals |
|---|---|---|
| `showData` | First drop | Data counter, Supply counter |
| `showOperations` | First drop | Operations panel |
| `showPersonnel` | `formationHut6` completed | Personnel section |
| `showInfrastructure` | `recruitFirst50` completed | Infrastructure section |
| `showNavalStream` | `formationHut8` completed | Naval Enigma stream bar |
| `showFooter` | Any personnel hired | System Specs footer |

---

## Save System

- Auto-save every 15 real seconds and on `visibilitychange` to hidden.
- All keys starting with `_` are stripped before serialization (transient runtime state).
- On load, missing top-level keys are merged from `createInitialState()` to handle saves from older versions.
- Save key: `tem_save_v1`. Increment version if the state shape changes in a breaking way.

---

## Adding Content

### New Operation
Add to `src/data/operations.js`. Add its `id` to the `unlocks` array of an existing operation. No other registration needed.

### New Phase
1. Add phase-specific units to `src/data/units.js`
2. Add their state to `src/core/state.js`
3. Add a `ui` flag for progressive disclosure
4. Add render logic in `src/ui/render.js`
5. Add a phase-transition operation in `src/data/operations.js` with `isPhaseTransition: true`
