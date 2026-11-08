# v2-02 — Repo split and what's reusable

Decision log for the v1/v2 separation. Made 2026-04-20.

---

## The choice

**Option B: freeze v1, start v2 fresh, lift engine pieces on demand.**

Considered and rejected:

- **Option A — extract `engine/` first, then build v2 on top.** Too much
  abstraction before we know what v2 actually needs. v1's save harness,
  event log, and simulator are entangled with v1 state shape; extracting
  them in the abstract would lock in v1 assumptions under a cleaner name.

The tradeoff accepted with B: no published engine contract on day one. The
contract crystallizes out of real v2 usage — the second time we lift a
file from v1, *that* is when we factor out an engine module.

## Repo layout after the split

```
the-exponential-machine/            # code repo
  index.html                        # landing page → v1 or v2
  serve.py                          # static server at root
  package.json                      # test script → v1/tests/
  README.md                         # explains the split

  v1/                               # frozen — reference + donor
    src/ sim/ tests/ docs/ assets/
    index.html style.css
    README.md

  v2/                               # active
    src/main.js                     # empty shell
    index.html style.css
    README.md
```

Design docs, MEMORY, and FEEDBACK_RAW live in a sibling repo at
`/Users/gama/gemini/the-exponential-machine/` and are shared across both
versions. v2-prefixed docs are v2-specific; numbered docs (00-10) are v1.

## What's reusable (carry forward)

**System / infrastructure** (lift from `v1/` into `v2/` when first needed):

- **Save harness** — localStorage, `_`-prefix stripping, version-gated
  migration pattern (`v1/src/core/save.js`).
- **Event log primitive** — ring buffer, arrow-nav, memoized render to
  avoid innerHTML thrash (`v1/src/core/log.js` + render bit).
- **Theme system** — CSS vars, `data-theme` attribute, `<head>` no-flash
  script, localStorage `tem_theme` key (touched in `v1/index.html` +
  `v1/style.css`).
- **Dev harness** — `serve.py`, isDev flag gated to localhost, RESET
  button with two-click confirm, `[TEM]`-prefixed console logs.
- **CONFIG singleton pattern** — all balance constants centralized in
  `v1/src/config.js`; consumers read inline (not cached) so overrides
  take effect; simulator can load an override JSON.
- **Headless simulator** — `v1/sim/simulate.js`. Seeded mulberry32 PRNG,
  Monte Carlo runs, `--config --runs --tick --max --seed --verbose --json`,
  max-wall-clock + max-tick guards against infinite loops, per-op timing,
  bottleneck detection, cap-pressure report, **carrot metric** (percent of
  ticks with empty progression panel).
- **DAG evaluator pattern** — `trigger` = visibility, `gates` = executability,
  `canExecute` returns `{can, reason}`, blocker reason rendered inline in red.
  Pattern is reusable even if no content carries over.
- **Affordability-chain test pattern** — every progression step's cost must
  be ≤ the cap tier reachable before it. Mandatory CI check.
- **Progressive disclosure flags** — `state.ui.show*` gates DOM sections.
  Sections appear when condition first met and stay visible.
- **pointerdown event delegation** — `innerHTML` replacement between
  mousedown/mouseup detaches elements, so click never bubbles. Use
  `pointerdown` on a delegated root listener.

**Meta-process** (already shared, stays):

- `FEEDBACK_RAW.md` append-only per-session log.
- `MEMORY.md` agent-distilled principles, updated after each session.
- Plan files (07, 08, 09 pattern — goal, current, target, code changes,
  save migration, difficulty flags, verification) as a template for any
  non-trivial change.

## What's not reusable (throw out for v2)

**Gameplay content and the resource model:**

- Specific resources: FLOPs, Data, Billets (Supply), Electricity, Search Space.
- All operations: Zygalski Sheets through V-E Day; 25+ Phase 0/1 initiatives.
- Personnel types: Junior Calculator, Boffin, Section Head, Wren, Indexer,
  Cryptanalyst, Translator.
- Infrastructure: Hut, Canteen Expansion, Coffee Rationing, Local Power
  Line, Dedicated Generator.
- Streams: Army Enigma, Naval Enigma (and any Phase 1 stream additions).
- Drop mechanic in its current form.
- Search-space metaphor and its 300 → 3,200 → 50M scaling.
- Every balance constant (DROP_SCALE, operationCost floor, reward
  multipliers, billet costs, cost-scale factors).
- Phase 0/1 narrative (BRUSA, Operation Mincemeat, war event ops, etc.) —
  if any of this returns in v2 it returns because the new mechanics
  demand it, not because the work was done.

## Rules for lifting from v1

1. **Lift the first time, extract the second.** Copy a v1 file into `v2/`
   when v2 first needs it. Strip v1-specific state assumptions in place.
   Only factor it into a shared engine module when a *second* v2 file
   needs the same primitive.
2. **Never import across the v1/v2 boundary.** v2 code must not `import`
   from `../v1/`. Copy or extract; don't depend.
3. **v1 is frozen.** No features, no refactors to v1 code. Bug fixes only
   if they block using v1 as a donor, and even then prefer copying first
   and fixing in v2.
4. **The 84-test v1 suite stays green.** `npm test` points at `v1/tests/`
   and must pass. If v1 needs a fix, the tests come with it.

## Exit criteria for the split

The split is "done" when v2 is playable enough to get user feedback. At
that point we reassess:

- Which v1 pieces ended up in v2 (tells us what the real engine is).
- Whether to extract a shared `engine/` folder or keep things copied.
- Whether to delete v1 or keep it as a permanent reference.

Until then: v1 is a museum. v2 is the workshop.
