# Stage 3 redesign: merged proposal (lead designer, Nov 13) — awaiting the player's approval

Sources: `10-redesign-brief.md`, game design `11-game-design-redesign.md`, UX `12-ux-redesign.md`. Both designers,
working apart, picked the same mechanic: **launch the next model**. Story, beats, goal, finale, pace: unchanged (07-stage3).

## 1. The mechanic
Your lab is always designing the next computer. It gets better by itself, fast at first and then slowing down (an S-curve
up to the limit the current chip allows). **You choose when to launch it.** Launching early gives a small jump; waiting
gives a bigger one, but the model on sale is fading (everyone who wanted one has one). Every computer sold keeps running
in a home at its own model's speed, so each launch raises what every new home adds, and old homes never stop counting.
The price tag goes: every computer sells for $1,000. One decision on screen, made 8–9 times, with a payoff you see.

Why it is better: it is a button you time, not a setting you pick once; the best moment moves (chip cards raise the
limit, from ~1.4× early to ~2.4× late); and mistiming changes your **growth**, not just your income, so it costs real time.
It is also the story of the era and of the whole game: the machine you can build keeps getting better.

## 2. Rules and numbers: game design §3.1–3.3, as prototyped
- Lab: limit 1.8× + chip cards (Eight bits +0.4, $25 chip +0.6, Chips for everyone +0.6, Rubber keys +0.6; Closed +0.4).
  Design time 65 s × √(limit−1), S-curve p³/(1+p³). Launch allowed from 1.2×. At 90% of the way the engineers ship it
  themselves, with a ledger line that teaches the mechanic to anyone who never pressed it.
- Sales: buyers a second = (markets + word of mouth) × freshness; freshness ×1.5 at launch, half-life 45 s, floor ×0.25.
  Sold = min(what you can make, buyers). $1,000 a computer. Money builds workbenches and factories, as now.
- Speed = legacy + Σ (computers sold × their model's speed) × 35,000 × multipliers.
- Software cards (BASIC, floppy, spreadsheet, games, River Raid, Lotus): **every computer already in a home works 1.2× faster.**
  Hardware = new sales, software = all homes (sets up Stage 4).
- **Open or closed:** Open = models stay wanted twice as long (slower fade, launch less often). Closed = bigger leaps (limit +0.4).
- Launches are free (no money cost): the tested version. The UX idea of a money cost ("factory or launch?") is held back
  as a tuning lever.

## 3. Screen: UX §3.2, simplified to fit the rules
Panel **"Your computers on sale"**, in the Sell panel's slot, same height in every state:
```
 Now selling: Model 4 · 1.6× as fast as Model 3
 Buyers a second since launch
 1.2K┤     ▃▅▇█▇▆▅▄▃▃▂ · · · ·            bars every 2 s; dotted = expected fade
     ┤- - - - - - - - - - you can make 900  dashed = what workbenches and factories make
    0┼────────────────────── 1:40 on sale
 In the lab: Model 5 · 2.1× as fast       [██████████████░░░│░]  limit 2.8×
 Slowing down.                            [ Launch Model 5 ]
 Model 4 stops selling when Model 5 launches.
```
- Status line, fixed texts: "Just started" · "Getting better fast" · "Slowing down" · "Nearly at the chip's limit:
  your engineers will ship it soon". It says where the curve is, not what to do.
- "Your garage" row: **Computers in homes 41,200** · "Model 1: 900 · Model 2: 6,100 · … Together: 2.1 billion per second."
- Idea cards say what they feed: "Your next models can be up to 2.8× as fast" / "Every computer in a home works 1.2× faster."
- After the goal, the lab block holds the finale (same place, same button): the last thing you do is a launch.
- Launch payoff within a second: a new tall bar, one ledger line per model (the wooden case, colour, the floppy, the
  portable…), the homes row gains a model.
- Preferences: plain labels, no confirmation, numbers rounded and updated once a second, bold not bigger, fixed height.

## 4. Prototype results (game design §5; average player, Stage 3 alone)
| Player | Time | vs smart |
|---|---|---|
| Smart (launch once the lab slows down) | 12.2–12.4 min, 8–9 launches | — |
| Launches whenever the button lights | 14.7–15.3 min | +21–24% |
| Never launches (engineers ship at 90%) | 15.1–15.5 min | +24–25% |
| Always at 1.5× / 2.2× | | +3% / +5% |
(Today's price tag: never touching it +10%, best fixed price +3–9%.)

## 5. Left out, and to fix in the build
- Left out: orders piling up (UX), historical prices per model (UX), a "Cut the price" button (UX, optional), selling price.
- Fix: end speed is 3.4–4×10¹² vs ~2×10¹² target (trim late software cards). Homes end ~170,000: the "half a million"
  beat moves to 150,000. Plot writes ~10 model ledger lines. Save version 5. ~60 engine lines; the chart is new UI.
- Risk: the sweet spot is wide (launching at about 1.8× every time is as good as smart). It punishes extremes, not small
  errors. Acceptable for a first build; levers in game design §7.
