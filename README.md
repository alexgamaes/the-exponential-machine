# The Exponential Machine

An incremental game about the history of computing, from a codebreaker's pencil in 1939
to the limits of physics. Stages 1 (the codebreaker, 1939–45) and 2 (the computing lab, 1946–71)
are playable, about 10–14 minutes each.

## Play
```bash
npm run serve          # or: python3 -m http.server 8000
# open http://localhost:8000
```
(Opening `index.html` straight from disk won't work: browsers block ES modules on file://.)
On localhost the footer has dev buttons to start any stage fresh, with the resources a typical player brings.

## Test the pacing
```bash
npm test                                   # engine unit tests + the full simulator matrix
npm run sim -- --profile average --choice machines --verbose   # one run with a timeline
npm run sim -- --data '{"clerk":{"growth":1.15}}'               # try a balance change
npm run sim -- --config '{"revealGapSec":12}'                    # try an engine setting
npm run sim -- --stage 2 --legacy 19000                          # play Stage 2 alone
npm run sim -- --stage 3 --launch never                          # Stage 3 alone, never launching a model
npm run sim -- --sell 0.25                                       # a player who never changes how much time is sold
```
The simulator plays the real engine (`src/engine.js`) through every built stage in a row,
with 6 player styles × 2 choices, and fails
if the game stalls, never finishes, gets slower, or leaves the player with nothing happening too long.

## Layout
- `design/` — requirements and design docs (`05-game-design.md` overall and Stage 1, `06-stage2.md` Stage 2, `07-stage3.md` Stage 3)
- `src/engine.js` — game rules, no DOM (shared by browser and simulator)
- `src/data/stage1.js`, `stage2.js` — all content, text and numbers for each stage
- `src/config.js` — engine settings
- `src/ui.js`, `src/main.js`, `index.html`, `style.css` — the browser game
- `sim/`, `tests/` — simulator and unit tests
- `archive/` — old abandoned attempts; do not use
