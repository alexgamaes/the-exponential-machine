# The Exponential Machine

Idle game where you play as the emergent intelligence of computation itself — growing from 200 human calculators with pencils at Bletchley Park in 1939 to a post-human force re-engineering the universe across 11 phases of exponential technological evolution.

Inspired by Universal Paperclips. Built with vanilla JavaScript, no framework, no build step.

---

## Setup

```bash
# Run locally (requires Python 3)
python3 serve.py
# Opens http://localhost:8000 automatically
```

No npm install needed to play. `npm install` only required to run tests:

```bash
npm install
npm test
```

---

## Project Structure

```
index.html          # Single HTML shell — mostly empty divs populated by JS
style.css           # All styles
serve.py            # One-liner dev server (Python stdlib only)

src/
  core/
    game.js         # Entry point: init, game loop (rAF), event binding
    state.js        # createInitialState() — canonical shape of all game state
    save.js         # localStorage save/load (strips transient _ keys on save)
    debug.js        # isDev flag + log() gated to localhost only

  data/             # Static definitions — pure config, no logic
    operations.js   # All Operations: cost, effect, unlock chains
    units.js        # Personnel and Infrastructure unit definitions

  systems/          # Logic that mutates state each tick
    resources.js    # FLOPs/sec from personnel, Supply tracking, buy helpers
    search.js       # Search space attrition and The Drop
    operations.js   # Execute operations, check prerequisites, unlock chains

  ui/
    render.js       # Full DOM rebuild each frame + progressive disclosure flags

docs/               # Game design documents
tests/              # Node built-in test runner (node:test)
```

---

## Architecture Notes

See `docs/architecture.md` for a full explanation. Short version:

- **State** is one plain JS object mutated in place. All systems read/write it.
- **Systems** run every frame in order: `resources → search → date → uiFlags`.
- **Render** rebuilds innerHTML every frame. This is intentional simplicity — no virtual DOM, no diffing. Works fine at this scale.
- **Events** use `pointerdown` (not `click`) on a single delegated listener on `#layout`. This is required because innerHTML replacement between `mousedown` and `mouseup` detaches elements, causing `click` to never bubble.
- **Save** serializes state to localStorage every 15s and on tab hide. Keys starting with `_` are transient runtime signals and are never persisted.
- **Progressive disclosure**: the `state.ui` flags gate which DOM sections exist. Sections appear the first time their condition is met and stay visible.

---

## Adding an Operation

1. Add an entry to `src/data/operations.js`:
```js
myOperation: {
  id: 'myOperation',
  label: 'Human-readable name',
  type: 'algorithm' | 'infrastructure' | 'intelligence' | 'acquisition' | 'crisis',
  flavor: 'One sentence of historical flavor text.',
  cost: { data: 500, flops: 0 },
  requires: { operations: ['someOtherId'], minBoffins: 2 },
  unlocks: ['nextOperationId'],
  effect(state) {
    // mutate state here
  },
},
```
2. Add its `id` to the `unlocks` array of whichever existing operation should reveal it.
3. That's it. No registration needed.

## Adding a Personnel Unit

1. Add an entry to `src/data/units.js` under `UNITS`.
2. Add a matching entry to `state.personnel` in `src/core/state.js`.
3. Add a call to `unitRow(state, 'yourUnitId', supplyFree)` in `renderPersonnel()` in `src/ui/render.js`, gated behind whatever operation should unlock it.

---

## Dev Tools (localhost only)

- **RESET button** — bottom-right corner. Two-click confirmation. Clears localStorage and reloads.
- **Console logs** — `[TEM]` prefixed logs fire on all interactions. Check browser console.
