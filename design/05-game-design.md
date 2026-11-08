# 05 — Game Design (merged, lead designer)

This is the single source of truth. It merges 01 (historian), 02 (plot), 03 (UX) and 04 (systems).
If this file conflicts with one of those, this file wins. The proposals stay as background reference.
Status: **draft for user review.** Nothing is built yet.

---

## 1. The game in one paragraph

You are the person in charge of making computation faster. It is 1939, you are a codebreaker, and
you check guesses by hand. Each era hands you a new role (lab director, garage founder, investor,
AI lab owner…) and a new machine, but you keep one number: **how fast your machines compute**.
It grows from about 1 operation per second to the limits of physics. Everything else exists to make
that number climb and to make you *feel* it climb.

---

## 2. Decisions taken (and why)

| # | Decision | Why / source |
|---|---|---|
| D1 | **Core unit = the operation.** One currency (ops), one score (ops/s). | Historian and systems agreed. Your speed can be compared with real machines (ENIAC 5,000/s, Cray-1 1.6×10⁸, Frontier 10¹⁸). That is the requirement made concrete. |
| D2 | **The unit's *name* changes with the era; the number never resets.** Stage 1: "checks" (guesses checked). Stage 2, 1948: the log says engineers call them "operations", and the label changes while the number stays. From the supercomputer era: "FLOPs". | Plot's renaming beat ("we were counting this all along"), applied to ops instead of bits. The idea of bits as information survives in the log, not in the counter. |
| D3 | **Never a second spendable resource.** Money, users and so on are display conversions only. | Systems. Players hated juggling caps. |
| D4 | **Stage template:** 1 click, 2 producers, 10–13 one-shot upgrades, 1 choice, 1 stage goal visible from second 0. | Systems. Small, repeatable, tunable. |
| D5 | **Stage end = "collapse", not reset.** Producers fold into one "Legacy" line that keeps the exact rate. Upgrade multipliers are wiped. The next stage's prices are in seconds of that rate. | Systems + plot ("you lose your toys, you keep your momentum"). Satisfies "never slower" and stops multipliers compounding between stages. |
| D6 | **Handover ritual:** goal reached → closing log lines → old machines fade (rate stays) → only button: **"Pass the ledger on"** → new role, new skin, new goal immediately. | Plot. Same shape every era, about 30 s. |
| D7 | **The log is "the ledger"**, a logbook passed from keeper to keeper. Its voice changes per era. | Plot + historian. Requirement 8's log becomes the thread through the whole game. |
| D8 | **Two horizons always visible:** a goal bar (the next nearest unlock, with progress and ETA) plus a stage meter (progress to the stage goal, on a log scale). | UX + systems. Requirement 7. |
| D9 | **Speedometer:** "Decoding one day's messages: ~8 min at your speed" shrinks to about 1 s by the end of the stage. Plus milestone comparisons: "You are now faster than ENIAC." | Systems + UX. The exponential feeling, made visible. |
| D10 | **One screen, fixed positions, era skins via CSS variables.** No pop-ups, no confirmations. Bought cards vanish and post a log line. | UX. |
| D11 | **10 stages** (the historian's 12, with lab+mainframe merged and the last two fiction stages merged). | Shorter, and each stage has a clear role. |
| D12 | **Plain labels on controls; history only in the log.** "Check a guess", "Hire a clerk", "Build a machine". Never "Enigma" or "Bombe" on a button. | Requirements + UX. |

---

## 3. The stages

| # | Years | Role ("You are…") | Machines (producers) | Stage goal | End rate (ops/s, approx.) |
|---|---|---|---|---|---|
| 1 | 1939–45 | Codebreaker | Clerks → code-breaking machines | Build Colossus | 5×10³ |
| 2 | 1945–71 | Director of a computing lab | Valve computers → transistor mainframes | Put a computer on the Moon (Apollo) | 10⁷ |
| 3 | 1971–84 | Garage founder | Hobby kits → home computers | Sell a computer to everyone | 10⁸ |
| 4 | 1984–95 | Software company CEO | PCs on desks → office networks | Go online (the web) | 10¹¹ |
| 5 | 1995–2001 | Investor, Silicon Valley | Startups → server farms | Survive the crash | 10¹³ |
| 6 | 2001–12 | Chief of infrastructure, web giant | Server racks → data centres | Recognise a cat (AlexNet) | 10¹⁶ |
| 7 | 2012–22 | Research director, AI lab | GPU clusters → TPU pods | Ship a model the world talks to | 10¹⁸ |
| 8 | 2022–~2030 | Owner of a frontier AI lab | Training clusters → gigawatt campuses | A model that does research better than you | 10²¹ |
| 9 | 2030s (fiction, "Projected") | Steward of the first self-improving AI | Self-built chips → automated fabs | Leave Earth | 10²⁶ |
| 10 | far future (fiction) | The machine itself | Swarms around the Sun → matter arranged for thought | The last computation | 10⁵⁰ |

Rough lengths: Stage 1 ≈ 10 min (a requirement), later stages 12–20 min. Total ≈ 2.5 h.
The doubling time shrinks every stage (50 s → ~15 s), so the whole game speeds up, not just each stage.
Only Stage 1 is designed in detail. Each later stage gets its own doc before it is built.

---

## 4. Stage 1 — The Codebreaker (1939–1945)

### 4.1 Opening (t = 0)
```
            0 checks

        [ Check a guess ]

  Goal: Build Colossus — 250,000 checks        0%
  ──────────────────────────────────────────────
  3 September 1939. War is declared. You are given a desk,
  a pencil, and a basket of intercepted radio messages.
```
That is the whole screen: counter, one button, the stage goal and one log line. Plus a tiny ◐ theme toggle.

### 4.2 Producers
| Producer (button label) | Appears | Base cost | Cost growth | Output |
|---|---|---|---|---|
| **Clerks** — "Hire a clerk" | 8 lifetime checks | 10 | ×1.12 | 0.5 checks/s |
| **Code-breaking machines** — "Build a machine" | after upgrade 5 | 600 | ×1.12 | 8 checks/s |

### 4.3 Upgrades
Cost and effect numbers come from the systems sim (04 §3.4). Names and log lines come from the historian (01 §3).
The card shows the **name + plain effect + cost**. The **log line** appears when you buy it.

| # | Card name | Cost | Plain effect (on card) | Appears when | Log line (on purchase, draft) |
|---|---|---|---|---|---|
| 1 | Notes from Poland | 15 | Each click checks 2 guesses. | 10 clicks | "A forest outside Warsaw. The Poles hand over everything they know. Five weeks remain." |
| 2 | Night shifts | 60 | Clerks work twice as fast. | 3 clerks | "The hut never closes now. Someone has chained the mug to the radiator." |
| 3 | Weather reports | 180 | Each click also adds 5% of your speed. | 120 lifetime | "Every morning a German weather station reports the weather. Every morning he gives us a word for free." |
| 4 | Punched sheets | 450 | Clerks work twice as fast. | 10 clerks | "Sheets punched with holes, stacked on a lamp. Where the light shines through, a key might be hiding." |
| 5 | A machine that guesses | 1,000 | Unlocks machines: each checks 8 guesses per second. | 600 lifetime | "Victory arrives: wardrobe-sized, clattering, smelling of oil. It never sleeps." |
| 6 | Wren operators | 2,200 | Machines work twice as fast. | 2 machines | "Hundreds of Wrens tend the machines in shifts. The noise never stops." |
| 7 | The lazy-operator trick | 4,500 | Clerks work twice as fast. | 4,000 lifetime | "Herivel, twenty, pictures a sleepy operator at dawn. A guess about laziness becomes a weapon." |
| 8 | Extra wiring board | 8,000 | Machines work twice as fast. | 6 machines | "Welchman adds one board of wires. Search times collapse." |
| 9 | **Letter to Churchill** (choice) | 14,000 | Pick one: **More machines**: machines get cheaper to build. **More people**: each click adds another 25% of your speed. | 12,000 lifetime | "Four codebreakers write over everyone's head. Churchill replies in red: ACTION THIS DAY." |
| 10 | Shared card index | 24,000 | Each machine makes every clerk 2% faster. | 12 machines | "Every name, place and call sign on a card. The clerks check the machines' answers." |
| 11 | Captured codebook | 40,000 | Everything works 1.5× faster. | 35,000 lifetime | "Two sailors go down with U-559 handing papers up the ladder. Six weeks later, the Atlantic speaks again." |
| 12 | American machines | 65,000 | Machines work twice as fast. | 60,000 lifetime | "Ohio builds a hundred more machines. They arrive in crates marked 'office equipment'." |
| G | **Build Colossus** | 250,000 | Ends the stage. | visible from 0:00 | "Flowers was told valves would fail. He built Colossus with sixteen hundred of them. It works." |

Reveal rules: at most 2 locked cards are shown, at least 15 s apart, each with "Needs X. You have Y." (04 §4)

### 4.4 Story beats (log only; they never change the numbers)
- ~1:10 First message read: "WEATHER BISCAY RAIN WIND WEST FOUR. It's the weather. It's always the weather."
- ~3:30 The first machine: the log notes the clerk who misses her pencil.
- ~5:30 Ships rerouted: "Convoy turned north at 02:00. All ships in."
- **~6:15 The late decrypt** (the most important beat of the game): the Atlantic goes dark (the four-rotor change, 1942), and one decrypt reaches the Admiralty four hours too late. Speed becomes a moral matter. *Your rate does not drop; only the story hurts.*
- ~8:00 D-Day: "Berlin believes the landing will be at Calais. Berlin is wrong."
- Handover: VE Day → "the machines are to be broken up, the papers burned. The count is not." → **Pass the ledger on** → "Philadelphia, 1946. Thirty tons of valves. They say it adds five thousand numbers a second. You think: we did that last year."

### 4.5 Pacing (simulated, `tools/sim_stage1.py`)
- Ends at **9.6 min** for an average clicker, and between 7.5 and 12.7 min across play styles and both choice options.
- Something to buy at least every **35 s**. An upgrade arrives about every 45 s.
- Speedometer: "one day's messages" goes from 8 min 20 s → 1.4 s.
- End rate is about 6,600 checks/s, roughly ENIAC, a clean hand-off to Stage 2.
- ⚠ The upgrade order changed slightly from 04 (the ×1.5 boost and the machines ×2 swapped places). The sim must be re-run before building.

---

## 5. Interface (summary of 03, adopted)
- **Layout:** era header (era · role · stage meter) / goal bar / counter + speed + click button / two columns: Machines | Upgrades / the ledger (log) underneath. Panels appear in a fixed order and never move.
- **Reveal order:** counter + button + goal → speed line (first click) → upgrades panel (10 checks) → log panel → Machines panel (first clerk) → locked previews → machines row → stats/settings → stage meter fills → goal card glows near the end.
- **Cards:** name, bold plain effect, cost, and a "Needs X. You have Y." line when locked. Affordable = solid border. Bought = vanish (150 ms) + log line.
- **Numbers:** 3 significant digits, number words up to decillion, then ×10ⁿ. Tabular digits. Plain comparisons ("enough to store a novel"). From Stage 2 on: "× faster than 1939".
- **Feel:** one visual cue + at most one sound per action, under 300 ms. Click floaters merge. Holding the button auto-repeats at 10/s. Honours `prefers-reduced-motion`.
- **Readability:** rem units, bold not bigger, pure black text in light mode, light/dark mode following the system with a manual toggle. Log lines wrap.
- **Era skins:** one CSS-variable set per stage (1939 paper/typewriter → 60s punch card → 70s/80s phosphor terminal → 90s bevelled web → clean AI lab → post-human: everything fades except the counter).
- **Mobile:** sticky header + goal bar on top, click button sticky at the bottom.
- **Saving:** autosave every 10 s and when the tab is hidden. Returning players get one log line ("While you were away: +2.1 million checks").

---

## 6. Parked ideas (good, not committed)
- **The five unread letters** (plot): a group in the first intercept that no key fits. It stays on screen all game, and the ending reveals it was a one-time key (Shannon 1949), so you choose the reading yourself. Historically defensible: one-time pads were in diplomatic use in the 1930s. Decide when we design the late game.
- **The log writing about the player** in the AI era (plot): real play data, and one entry dated before the click it describes.
- **Name your first machine**, with the name reappearing in later eras.
- **Legacy pick** at stage end (a small bonus carried forward).
- **Rhymes across eras:** the 2023 AI Safety Summit at Bletchley Park; xAI's "Colossus" cluster.

## 7. Before building
- Fact-check every historical line that ships (the historian worked from memory and marked unsure items).
- Re-run the Stage 1 sim with the reordered upgrades.
- Tech default: plain HTML/CSS/JS, no build step, opened in the browser.
