# The Exponential Machine

Idle game about the history of computation — from human calculators with pencils in 1939 to a post-human force re-engineering the universe across 11 phases.

Inspired by Universal Paperclips. Vanilla JavaScript, no framework, no build step.

---

## Repo layout

```
index.html          # Landing page → pick v1 or v2
serve.py            # One-liner dev server (Python stdlib only)
package.json        # Test runner entry (points at v1/tests/)

v1/                 # Frozen original implementation (Phase 0–1, Enigma framing)
  src/ sim/ tests/ docs/ assets/ index.html style.css

v2/                 # Active rebuild (clean slate — see v2/README.md)
  src/ index.html style.css
```

Design docs and feedback live in a sibling repo at
`/Users/gama/gemini/the-exponential-machine/` (shared across both versions).

---

## Setup

```bash
python3 serve.py
# Opens http://localhost:8000 — landing page picks v1 or v2
```

`npm install` + `npm test` runs the v1 test suite (84 tests).

---

## Why the split

v1 shipped a playable Phase 0–1 but the design review concluded the mechanics
couldn't generalize past Enigma and were dimensionally overloaded at start.
v2 rebuilds from scratch with a different metaphor. v1 stays runnable as
reference and as a donor for engine-style pieces (save harness, event log,
theme toggle, headless simulator) — no engine abstraction is carried over
speculatively. See `v2-02-separation.md` in the design docs repo.
