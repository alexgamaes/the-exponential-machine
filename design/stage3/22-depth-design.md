# Stage 3, second pass: families and programs (senior game designer, Nov 14)

Answers `20-depth-brief.md`. Uses the critic's numbers in `21-strategy-critique.md` and the player's second note ("most of
the time demand is higher than what I can produce… I can't tell when I'm doing it wrong"). Proposal only: nothing in
`src/` or `sim/` was changed. Every number below comes from a throwaway copy of the real engine and sim with the design
built in: `/private/tmp/claude-501/-Users-gama-Documents-personal-the-exponential-machine/b48c323b-86b4-4cb4-a356-d9493ec755d3/scratchpad/proto2/`
(`src/engine.js` models section, `src/data/stage3.js`, `sim/simulate.mjs`; the bot is in `chooseLaunch.js`, merged in by `patch_sim.py`).

## 1. Why the stage is shallow (diagnosis)
1. **One decision, one answer.** The only real choice is when to launch, and its best answer is a fixed rule: launch at ~55%
   of the limit. The lab label "Slowing down" prints that rule. Anything from 30% to 65% is within 4%.
2. **The buyer side does nothing.** With good play, buyers outnumber what you can make 68–71% of the stage, and 100% from
   minute 7 on. So sales = what the factories make. The fade, the surge, word of mouth, new markets and Open's bonus have
   no effect (removing the fade: 12.9 vs 13.0 min). That is exactly the player's note: demand is always higher, so nothing
   you do on the buyer side shows up, and good and bad play feel the same.
3. **Costs you cannot see.** An early launch costs a smaller leap and a reset S-curve. Neither appears anywhere. The
   ledger just says "1.2× as fast", and speed goes up either way.
4. **Systems that do not touch each other.** Money only buys factories (no choice: factories always win, and $1–9 M is
   left unspent). Operations only buy cards (buy each one as soon as you can). Chip cards are worth 2%. Open vs Closed is
   12.9 vs 12.8 min. The guide fits on an index card.
5. **Changes to the level, not the growth rate.** A stage that grows ×7×10⁴ loses only ~14 s if income drops 20% for
   good. A choice only matters if it changes **how fast you grow**. Most of today's levers change only the level.

## 2. Three directions (all from 1971–84)

| | A. Families and programs | B. The warehouse and the Osborne effect | C. The lab budget and the chip clock |
|---|---|---|---|
| History | Apple II's slots and VisiCalc (1979) sold the machine. IBM PC compatibility (1981). The incompatible Apple III (1980), TRS-80 Model II, and Commodore's PET → VIC-20 → C64, which could not run each other's programs. The 6502 and Z80 were different chip families. | Osborne announced its next model in 1983, sales of the current one stopped, and the firm went bankrupt. TI wrote off its TI-99/4A stock. The Commodore price war of 1983. | Apple paid for the Lisa out of Apple II money. A computer was designed around whatever chip was on the bench (the $25 6502, the 8088). |
| Core loop | The lab offers two launches: the **next model in the family** (runs every program, small leap) or a **new family** on the newest chip (big leap, starts with no programs). Programs are written for the family on sale, in proportion to its installed base, and every program makes **every computer of that family already in homes** run better. | Computers go into a warehouse, and buyers take from it. When you launch, the old stock sells at half price. You can announce the next model early: buyers wait (sales drop) but crowd in at launch. | Engineers cost money and speed up the lab. A chip card raises only designs started after it. Money splits between factories (supply) and the lab (leaps). |
| Decisions | Next model or new family; when; when to start designing a family; factories vs programmers; Open vs Closed | Build ahead or not; when to launch given stock; whether to announce | How to split money; when to start a design given the chip clock |
| Competing strategies | One platform everyone writes for (IBM) vs a new machine whenever a chip allows (Apple/Commodore) | Lean stock and frequent launches vs a big stockpile and rare launches | Lab-heavy vs factory-heavy |
| Why no rule wins | The value of staying grows with the family's programs (it compounds). The value of leaving grows with each chip card. Which is larger changes during the stage and with Open/Closed. | The best launch moment depends on stock, the fade and the lab together | The best split flips with supply vs demand |
| Weakness | Most new pieces (2 launch kinds, programs, families) | Mostly costs money (a level, not a rate), so it is weak on its own. Announcing adds a fourth number to the panel. | A slider, the same complaint as the price tag |

**Pick: A**, with the two useful pieces of C (a new chip only helps designs **started** after it; launching retools the
factories) and B's lesson (supply and demand must cross). It is the genius touch the brief asks for, and it is the
whole game's theme in miniature. Stage 3 ends with "The machine no longer matters. What runs on it does." A shows that
the player learns this by playing: by minute 10 the programs on your family are worth more than the hardware. Stage 4
(the grandson's software company) inherits it.

## 3. The design: families and programs

### 3.1 In one paragraph
You still launch models, and every computer sold still counts in its home forever. Now each model belongs to a
**family**: a line of computers that run the same programs. Owners and outside developers write programs for the family
you are selling, more the bigger its installed base. **Every program makes every computer of that family run better,
including the ones sold years ago.** The lab always designs the next model in the family (a small, safe leap). Once a
new chip arrives you can also design a **new family** on it: a much bigger leap, but its computers run none of the old
programs. Old families keep counting with the programs they have. They just stop getting new ones. Open (the IBM
way) makes programs pour in and rewards staying. Closed (the sealed box) makes leaps bigger and lets you take your own
programs along, which rewards leaving. Every launch retools the factories for a while, and buyers come in waves after
each launch, so you are sometimes short of computers and sometimes short of buyers. The screen always says which, and
what to do about it.

### 3.2 State (saved; save version 6)
`platforms: [{ homes, programs, bonus, compat }]` (the last one is on sale) · `models: [{ speed, homes, pf, kind }]`
(`pf` = family index, `kind` = 'compat' | 'new') · `modelAt` · `project: null | { start, gain, base }` (the new family
in design). A v5 save becomes one family holding every model, with 0 programs.

### 3.3 Formulas (per tick while playing)
```
progress(age, T) = k/(1+k),  k = (age / T)^3                       S-curve; T = 50 s for both designs
next model ratio   = 1 + (0.35 + cards) × progress(time − modelAt)  cards: Eight bits +0.2, Open +0.2
new family ratio   = base × (1 + gain × progress(time − project.start)) / speed of the model on sale
                     gain = 1.0 + chip cards bought BEFORE the design started (+0.4, +0.6, +0.6; Closed +0.5)
                     base = speed of the model on sale when the design started, so next models launched meanwhile eat into its lead
programs/s (family on sale) = (0.015 × √(family homes) × devMul + 0.5 × programmers) × 1.5 if floppy
                     devMul: Open 3, Closed 0.6
software(family)   = 1 + programs / 600 + killer-app bonus            the family's multiplier
speed              = legacy + Σ models  homes × model speed × software(its family) × 35,000 × card multipliers
buyers/s           = (Σ markets + 0.00015 × all homes) × freshness × software(family on sale)^0.4
freshness          = 0.3 + 1.2 × 0.5^(age / 40 s)                      ×1.5 at launch, fading to ×0.3
can make/s         = factories and workbenches × retool;  retool = 0.25 → 1 over 20 s after a launch (30 s after a new family)
sold/s             = min(can make, buyers);  money += sold × $1,000
New family launch: platforms.push({ programs: carry × old programs, bonus: Closed ? old bonus : 0 }); carry = Closed 0.8, Open 0
```
Launch rules: next model from 12% progress; a new family from 12% of its design; the engineers ship the next model
themselves at 95%. Starting a new design is free and replaces any design in progress (so a chip card that lands
early in a design is worth a restart, and one that lands late is not).

### 3.4 Starting numbers (prototype values)
| Thing | Value | Was |
|---|---|---|
| Lab | T 50 s, shape p³, next model +0.35, new family +1.0 + chips | limit 1.8, T 65·√(L−1) |
| Software | 600 programs = +1×; developers 0.015·√(family homes)/s | (cards ×1.2 per home) |
| Programmers (new producer, money) | $5,000, ×1.3 each, 0.5 programs/s, unlocked 8 s after "A language for kits" (the grandson's arrival) | — |
| Retool | factories at 25%, full after 20 s (30 s for a new family) | — |
| Buyers | markets 2.5 / 6 / 4 / 15 / 25 / 40 / 60; word of mouth 0.00015; fade half-life 40 s, ×1.5 → ×0.3; buyers × software^0.4 | 6 … 800; 0.0015 |
| Factories, workbenches, $1,000 per computer, goal 7×10¹³, finale | unchanged | |
| Goal reward | everything ×1.6 | ×2 |
| "For the masses" | $5 M | $30 M |

### 3.5 Cards
| Card | New effect | Why it matters now |
|---|---|---|
| Eight bits (0:00) | Each next model +0.2× | The first minute stays simple: one button, bigger leaps |
| A language for kits (~2:50) | Owners write programs: the software count appears | Phase 2: one new number |
| The $25 chip (~4:30) | Unlocks new families; +0.4 to designs started after it | Phase 3: the second launch button |
| Open or closed (~6:45) | Open: programs ×3, next models +0.2. Closed: new families +0.5, take 80% of programs along, outsiders write ×0.6 | Sets which strategy wins |
| A floppy disk drive ($1 M) | Programs written ×1.5 | Money card that competes with factories |
| A spreadsheet, Games at home, A whole river in 4K, A spreadsheet that draws | Killer program: the family **on sale** gets +0.3×. Open leaves it behind when you change family; Closed takes it along | Card timing now interacts with launches (VisiCalc sold Apple IIs) |
| Chips for everyone, Rubber keys | +0.6 to new family designs started after it | Restart a young design? Launch the old one first? |
| On a magazine cover, Computers in a box, Computers for offices, For the masses | unchanged | |

### 3.6 Phase-in (average player)
| Time | What is new on screen | Decisions |
|---|---|---|
| 0:00–2:50 | Model on sale, the lab bar, **Launch Model 2**, workbenches, the supply/demand line | When to launch (early on there are few buyers, so launch for the fresh wave) |
| 2:50 | "Programs for your computers: 0 → …" and the software multiplier in the homes row; Programmers 8 s later | Factories or programmers |
| 4:30 | Second lab bar "New family (on the $25 chip)", **Start designing** / **Launch new family** | Stay or leave |
| 5:55 | Factories | Supply vs buyers matters more |
| 6:45 | Open or closed | Which plan you will follow |
| 7:40–12:00 | Killer programs, chip cards | When to buy and when to launch, read together |

### 3.7 The screen (every trade-off visible before and after)
```
YOUR COMPUTERS ON SALE                                     Family 2 · Model 9
 Buyers 310 a second · you can make 240 · 70 buyers a second go home without one     (→ "Open a factory")
   or: You can make 240 · buyers 150 · 90 computers a second are not made (factories idle)   (→ "Launch, or write programs")
   or: Factories retooling for the new model: 60% for 12 s more
 [chart: buyers since launch, dashed "you can make"]

 NEXT MODEL (same family)        ███████░░░  1.28× now · getting better fast
   [Launch Model 10]  Each new computer: 1.28× as fast, runs all 4,210 programs (×8.0).  Retool 20 s.
 NEW FAMILY on the $25 chip      ████░░░░░░  2.1× now
   [Launch new family]  Each new computer: 2.1× as fast, runs 0 programs (×1.0 instead of ×8.0).
   Worth 0.33× a Model 10 today; its programs will grow with its homes. Retool 30 s.
   (Closed: "takes 3,370 of your programs along (×6.6)")
   [Start again on Chips for everyone]   (when a better chip arrives; says how far the current design is)

YOUR GARAGE
 Computers in homes: 41,000 in 2 families
   Family 1 (Models 1–6): 22,000 computers · 3,212 programs · ×6.4 · no longer gets new programs
   Family 2 (Models 7–9): 19,000 computers · 4,210 programs · ×8.0 · +14 programs a second
 Together: 1.1×10¹² operations per second.
 Programmers: 18 · Each writes 0.5 programs a second for the family on sale.   [Hire a programmer $1.1 M]
```
- Each launch button shows **what one computer sold will be worth**: speed × programs. So the break-even is printed:
  "Worth 0.33× a Model 10 today". The cost of leaving a family is on the button. You never have to guess it.
- After acting: the ledger line names the trade ("You launch Model 10 (a new family), 2.1× as fast. It runs none of the
  old programs. 22,000 computers stay in Family 1 with 3,212 programs."). The supply/demand line changes at once
  (retooling, then the buyer wave).
- The supply/demand line has three states, and each one names its fix. That answers "when am I doing it wrong":
  **buyers turned away** → build factories (or wait: it is the launch wave); **factories idle** → launch, hire
  programmers, or wait for a market; **retooling** → the price of the launch you just made.

### 3.8 How the sim bot plays it (`--family keep|break|theta:X`, `--launch smart|eager|never|frac:X`, `--money smart|factories|programmers`)
- **Money (smart):** if buyers are waiting, buy whatever builds computers most cheaply; otherwise hire programmers.
  Dollar cards first when revealed.
- **New family (theta:1.2, the default):** start a design as soon as a chip allows. Restart it if a better chip arrives
  before it is 40% done, or if it is 80% done and still not worth launching. Launch it when its computers will be worth
  ≥ 1.2× the next model, launched well (speed × programs, programs carried included). While such a design is coming,
  hold the next models (each one eats into its lead and retools twice).
- **Launch timing:** launch when the lab says "Slowing down", or earlier (≥ 35%) if the factories stand idle, because a
  launch brings a fresh wave of buyers.

### 3.9 Results (prototype, average profile unless noted; finish time in minutes)
| Strategy | Open | Closed |
|---|---|---|
| **One family, next models only** (`keep`) | **13.0** | 13.8 (+8%) |
| **New family when it is worth 1.2×** (smart default) | 13.0 (never triggers: stays) | **12.8** (6 families) |
| New family at every chance (`break`) | 14.1 (+8%) | 12.9 |
| Launch at 30% / 85% of the lab | 13.4 / 13.8 | 14.0 / 13.7 |
| Launch at every chance (`eager`) | 15.5 (**+19%**) | 16.2 (**+27%**) |
| Never launch (engineers ship at 95%) | 15.6 (**+20%**) | 16.7 (**+30%**) |
| Ignore programmers (`--money factories`) | 15.5 (**+19%**) | 17.2 (**+34%**) |
| Only programmers, no factories | 15.8 (+22%) | 15.5 (+21%) |
| Everything wrong (eager, always leave, no programmers) | 20.8 | 18.7 |

- **Pace, all 6 profiles × both choices (smart):** 12.7–13.7 min, longest quiet 23–32 s, end speed 1.9–2.5×10¹².
  Arrival 2.5×10⁷ or 3.5×10⁷: 12.6–13.5 min. All sim checks pass (speed never drops, ledger order, handover).
- **Supply and demand now cross.** Smart play is short of computers 47–53% of the stage (was 71%) and changes between
  "short of computers" and "short of buyers" ~20 times, about once per launch: the buyer wave after a launch is more than
  the factories can make, then the fade leaves them idle. Each mistake has its own symptom on the panel:
  never launching → factories idle 37% of the time; eager → 100,000 buyers turned away (always retooling);
  no programmers → factories idle 37–39%.
- **Two different plans are both best, and the choice decides which.** Open: one family, ~15 next models, ~11,000
  programs, software ×20 by the end. Closed: 6 families from minute 8, software ×7–9 carried from family to family,
  hardware leaps of 2.0–2.5×. 13.0 vs 12.8 min (within 2%). Playing the other choice's plan costs 8% either way.
- **The best plan changes during the stage.** Before Open/Closed and early in Closed, leaving is not worth it (the
  bot's first new family comes at ~8:00, after the floppy and the spreadsheet). A late chip card makes a fresh design
  worth restarting. In Open, a new family is never worth it with the current numbers (the button shows it
  worth well under 1× a next model once programs build up), so a guide would say "in Open, stay"; a bigger late chip could change that.

### 3.10 Strategies a guide could discuss
1. **The standard (Open, stay):** one family, launch next models on "Slowing down", hire programmers whenever the
   factories stand idle. Programs compound with the installed base: 13.0 min.
2. **The leapfrogger (Closed, leave):** design on every new chip, launch new families back to back from ~8:00, take
   80% of your programs along (killer programs come too). 12.8 min. In Open, by contrast, a killer program bought just
   before leaving stays behind.
3. **The waver:** launch early and often (at ~30% of the lab) to ride the buyer waves. It is close behind in Open
   (13.4, +3%) but weak in Closed (14.0, +9%), where each new family needs its full design time. The smart bot uses it
   only when the factories stand idle.
4. **The mistakes**, each with a clear symptom: the hardware purist (always leave in Open: 14.1, programs always ×1),
   the hoarder (never launch: idle factories), the impatient (eager: permanent retooling), the factory baron (no
   programmers: idle factories, ×1 software).

## 4. What it costs to build
- Engine (all data-driven, `kind: 'models'` market): `platforms`, `project`, `startFamily`, `labRatio(kind)`,
  `launchModel(kind)`, `programRate`, `softMul`, `retoolFactor`, `saleValue(kind)` for the buttons, producer
  `makes: 'programs'`, effects `compatAdd`, `devMul`, `softMul`, `carry`, `unlock`, `multi`, `killerApp`. About 150 lines.
  The prototype's models section is ready to copy.
- UI: a second lab row, the three-state supply line, family lines in the homes row (at most 3 shown; older ones
  summed), one producer row. No pop-ups. Locked things say why ("New families need a new chip: The $25 chip").
- Story: model lines say "new family" when one starts. New ledger lines: the first new family ("None of the old
  programs run on it. The shops ask why."), the first family abandoned ("Family 1 stops getting programs. Its
  owners keep using it."). Home milestones move down (homes now end at 45–60 k): 100 / 1,000 / 10,000 / **40,000**
  (was 100 k / 150 k).
- Sim: `--family`, `--money`, `--hold`, `--restart`. `npm test`'s lazy run becomes `--launch never --money factories`.

## 5. Risks and open points
- **Within Closed, the ranking of the leave rules is sensitive** (theta 1.2 vs always leave swap places between
  profiles: 12.7–13.2). The Open-vs-Closed contrast is robust. The fine ranking is not, and that is acceptable.
- **The supply/demand line is the most important new text.** If it is not legible, the depth is invisible again. UX
  should prototype it first.
- **The bot's money rule is simple** ("factories while buyers wait"). A smarter allocation might find a dominant
  split. Re-check after tuning.
- **End speed** 1.9–2.5×10¹² with the goal at ×1.6. Closed ends ~20% faster than Open. Stage 4's arrival should take the average.
- **Not used:** the warehouse and announcing early (B). They are a good later layer if the stage still feels thin,
  but they add a fourth number to the panel. The 1983 price war would fit as one late event on top of A.
