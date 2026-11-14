# Stage 3, second pass: strategic depth (brief, Nov 14)

## Where we are
"Launch the next model" is built (`design/07-stage3.md` §9, `src/data/stage3.js`, `src/engine.js` models section,
`src/ui.js` renderModels, `sim/simulate.mjs --launch`). The player likes the dynamic. Their verdict on the whole stage:

> "Things that I find kind of confusing is like, okay, there is no penalty of releasing a model right when it's
> available. I'm not saying add one, I'm just saying it doesn't make any sense. Imagine this game gets published and
> people think about strategies: what is the best thing to do. Right now it's very simple. It doesn't have that much
> genius touch."

Facts behind it:
- In the sim, launching at every chance costs ~23% and never launching ~24%, but **the player cannot see why**: nothing on
  screen says "you launched early, so you got a small leap". The cost of an early launch is invisible.
- One rule ("launch at about 1.8×") is as good as perfect play. The stage has **one decision with one answer**.
- Money, workbenches, factories, cards and Open/Closed barely interact with the launch decision. There is no build to
  plan, nothing to combine, no two good strategies that players could argue about.

## What we want
Revisit the stage **end to end** (mechanic, money, producers, cards, Open/Closed, goal, finale), keeping what the player
liked (the lab, choosing when to launch, homes that keep counting, the story). Aim for:
1. **Every trade-off is legible**: the player can see, before and after acting, what a choice costs and gains.
2. **Several viable strategies** with real differences (e.g. many small launches vs. few big ones; build supply vs.
   push the lab; Open vs. Closed changing the best plan), that a strategy guide could discuss. The best play should
   depend on the situation, and change during the stage.
3. **Interacting systems**: the launch decision should connect to money, supply, cards and the choice, so that good
   play means reading the whole board, not one bar.
4. **A "genius touch"**: one idea, rooted in 1971–84 history, that makes the stage memorable and clever (think of
   how Universal Paperclips' investment engine, Strategic Modeling tournaments or probe trust allocation work).
5. Still simple to start: the first minute must read clearly, with complexity revealed as the stage goes.

## Constraints (unchanged)
Pace ~12–14 min, arrive ~3×10⁷/s, leave ~2×10¹²/s, longest quiet ≤ 45 s; pure data-driven engine; the sim bot must play
it, and lazy or naive strategies must lose clearly but still finish. Player preferences: plain short labels, high
contrast, bold not bigger, no pop-ups or confirms, locked things say why, nothing flickers, goal bar = stage goal only,
no click upgrades, a real new mechanic, desktop first, layout never jumps. Never read `archive/`.
