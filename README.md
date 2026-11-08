# The Exponential Machine

An incremental game about the history of computing, from a codebreaker's pencil in 1939
to the limits of physics. Stage 1 (the codebreaker, ~10 minutes) is playable.

## Play
```bash
npm run serve          # or: python3 -m http.server 8000
# open http://localhost:8000
```
(Opening `index.html` straight from disk won't work: browsers block ES modules on file://.)

## Test the pacing
```bash
npm test                                   # engine unit tests + the full simulator matrix
npm run sim -- --profile average --choice machines --verbose   # one run with a timeline
npm run sim -- --data '{"clerk":{"growth":1.15}}'               # try a balance change
npm run sim -- --config '{"revealGapSec":12}'                    # try an engine setting
```
The simulator plays the real engine (`src/engine.js`) with 6 player styles × 2 choices and fails
if the game stalls, never finishes, gets slower, or leaves the player with nothing happening too long.

## Layout
- `design/` — requirements and design docs (`05-game-design.md` is the source of truth)
- `src/engine.js` — game rules, no DOM (shared by browser and simulator)
- `src/data/stage1.js` — all Stage 1 content and numbers
- `src/config.js` — engine settings
- `src/ui.js`, `src/main.js`, `index.html`, `style.css` — the browser game
- `sim/`, `tests/` — simulator and unit tests
- `archive/` — old abandoned attempts; do not use
