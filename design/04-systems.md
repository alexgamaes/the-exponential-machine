# 04 — Systems & Economy (proposal)

Author role: game systems / economy designer. Scope: the core loop, the resource model,
stage structure, Stage 1 in full detail, pacing formulas, choices, and failure modes.
All Stage 1 numbers below were checked with a throwaway simulation (results in §3.5).

---

## 1. The core loop

### 1.1 One unit: the **operation** (op)

The game has **one number that matters**: operations performed.

| Thing on screen | What it is | Spendable? |
|---|---|---|
| **ops** (balance) | operations available to spend | yes, the only currency |
| **ops/s** (rate) | how fast you compute, which later becomes FLOPS | no, it is the score that matters |
| **lifetime ops** | total ever computed, used for reveals and the log | no |
| **task time** | seconds to do one fixed task at your current rate | no, it is the speedometer |

Why "operation" and not bits or entropy:
- Requirement 3 lists FLOPs as an option. An op works in 1939 (testing one rotor setting
  by hand is one operation) and in 2040 (one floating-point op in a model). Bits measure
  storage. Entropy is abstract. Neither is something you *do faster*.
- The **rate** is the historical metric. Stage 1 ends at about 5,000 ops/s, which is ENIAC's
  5,000 additions/s in 1946. Later stages can end at the real FLOPS of each era's top machine
  (Cray-1 about 10^8, ASCI Red about 10^12, Frontier about 10^18). The player's speed **is** the
  history. The historian's order-of-magnitude table can be dropped straight into §2.3.
- Label: "ops" in Stage 1 and 2, then "FLOP" from the mainframe era on, when floating point
  becomes standard. It is the same variable; only the label changes.

### 1.2 Why only one resource

- Every spendable resource is a second thing to watch. Players already said they hate
  spending attention on caps (housing, power). A second currency is the same tax in another form.
- With one currency, every decision reads the same way: "is this worth N seconds of my
  production?". That makes costs easy to read and pacing easy to tune.
- Era roles (cryptographer, investor, lab owner) change the **verb and the label**, not
  the unit. The 90s investor "invests compute budget". The rate panel can show "$" as flavor
  (ops × era exchange rate) but it is never a second balance. **Rule: never add a second
  spendable resource. A derived meter (a display) is fine.**

### 1.3 Diagram

```
           ┌───────────────────────── click (you, by hand) ───────────────┐
           │                                                               ▼
   ┌───────────────┐   buy    ┌──────────────┐   produce   ┌───────────────────────┐
   │  UPGRADES     │◄──ops────│   OPS (one   │◄────ops/s───│  PRODUCERS (2/stage)  │
   │ one-shot,     │          │   balance)   │──ops──────► │  e.g. clerks, Bombes  │
   │ plain effects │──×mult──►└──────┬───────┘   buy       └───────────────────────┘
   └───────────────┘                 │                              ▲
           │ reveal (lifetime / counts)                             │ ×mult
           ▼                         ▼                              │
   ┌────────────────────────────────────────────┐                   │
   │ GOAL PANEL: next upgrade (locked + reason) │                   │
   │ + STAGE GOAL project (visible from t=0)    │───── complete ────► COLLAPSE → next stage
   └────────────────────────────────────────────┘   (rate carried, machines fold into 1)
           ▲
           └── speedometer: "one day's traffic decoded in 4.5 s" (always shrinking)
```

The loop: **compute → spend ops on producers or upgrades → compute faster → the task
takes less time → the next goal comes sooner.** Nothing in the loop consumes rate. Rate can only go up.

---

## 2. Stages without piling up mechanics

### 2.1 The stage template (same in every stage)

Each stage contains exactly:
- **1 click verb**, which changes per era: "Test a setting", "Submit a job", "Fund a startup",
  "Train a run", and so on.
- **2 producers**: a cheap early one and a strong late one that is unlocked by an upgrade.
- **10–13 one-shot upgrades** with plain-language effects.
- **1 choice** (two mutually exclusive upgrades, §5).
- **1 stage goal project**, visible from second 0.
- **1 speedometer task** with a fixed op size, shown as a shrinking time.

Mechanics do **not** stack across stages. When a stage ends, its producers and
upgrades **collapse**, so the screen never holds more than about 2 producers and 3 visible upgrades.

### 2.2 The collapse: what carries, what resets

| Carries over | Resets / collapses |
|---|---|
| **ops/s, exactly** (rate never drops) | producer counts |
| ops balance (usually small after the goal) | upgrades (they were era tools) |
| lifetime ops, log, stage-choice flags | producer cost curves (new era, new machines) |
| click strength as a % of rate | old click verb |

Mechanic: at goal completion, all producers fold into **one "Legacy" line item** that
produces R_end forever. This matches history: the Bombes and Colossi were broken up
after the war, but the know-how built ENIAC and EDSAC. The next stage's producers are priced
in **seconds of R_end**, so the first new machine is affordable within about 10 s and is
clearly better. The player feels an immediate jump, never a reset to zero.

Why a collapse instead of a classic prestige reset:
- Prestige would make the player redo work, which breaks the rule that the same task never gets slower.
  The collapse keeps the rate.
- It removes the multiplier stack every stage (see §6.3), so tuning stays local to each stage.
- It removes UI clutter: the old machines become one line.

### 2.3 Orders-of-magnitude ladder (draft, to be merged with the historian's table)

| Stage | Era / role | Start ops/s | End ops/s | OOM | Target min | Doubling time |
|---|---|---|---|---|---|---|
| 1 | 1939–45 cryptographer | 0 (click) | 5×10^3 | ~3.7 | 10 | ~50 s |
| 2 | 1946–63 mainframes | 5×10^3 | 3×10^6 | ~2.8 | 12 | ~45 s |
| 3 | 1964–79 supercomputers | 3×10^6 | 2×10^8 | ~1.8 | 12 | ~40 s |
| 4 | 1980–99 PC / investor | 2×10^8 | 10^12 | ~3.7 | 15 | ~35 s |
| 5 | 2000–15 web / GPU | 10^12 | 10^17 | 5 | 15 | ~30 s |
| 6 | 2016–30 AI lab owner | 10^17 | 10^24 | 7 | 15 | ~25 s |
| 7+ | post-human | 10^24 | 10^40+ | 16+ | 15 | ~15 s |

Doubling time shrinks every stage. The whole game accelerates, not just each stage.

---

## 3. Stage 1 in full: "Hut 8" (1939–1945, cryptographer)

### 3.1 Starting state
- Screen: one button, **[Test a rotor setting]**, and one number, **ops: 0**.
- Goal panel (always visible, top right):
  `STAGE GOAL — Break Shark (naval Enigma): 250,000 ops. Locked: you are testing settings by hand.`
- Nothing else. No rate shown until the first producer exists.

### 3.2 The click
- Click = **+1 op**. Later: `click = base_click + click_pct × ops/s`.
- The click never gets weaker in absolute terms, and later in the stage it scales with rate.
- The speedometer appears at 100 lifetime ops:
  `Decoding one day's traffic (10,000 ops): ~45 min at your speed`. It shrinks to about 1.5 s by the
  end of the stage. This line is how the player *sees* exponential speed.

### 3.3 Producers
| Producer | Reveal | Base cost | Cost growth | Base output |
|---|---|---|---|---|
| **Clerk** (human computer) | lifetime ≥ 8 ops | 10 | ×1.12 per unit | 0.5 ops/s |
| **Bombe** | bought "Bombe blueprint" | 600 | ×1.12 per unit | 8 ops/s |

### 3.4 Upgrades (12 + goal)
Costs are in ops. "Reveal" is when the item appears; until then the goal panel shows it as
the *next locked item* with the reason ("Own 10 clerks — 7/10"). "Sim t" is the purchase
time in the reference run (choice A, average clicking).

| # | Upgrade | Cost | Effect (plain language, as shown to the player) | Reveal when | Sim t |
|---|---|---|---|---|---|
| 1 | Squared paper | 15 | Each click tests 2 settings instead of 1. | 10 clicks | 0:04 |
| 2 | Shift rota | 60 | Clerks work twice as fast. | own 3 clerks | 0:14 |
| 3 | Cribs | 180 | Each click also adds 5% of your ops/s. | lifetime ≥ 120 | 0:31 |
| 4 | Zygalski sheets | 450 | Clerks work twice as fast. | own 10 clerks | 1:02 |
| 5 | Bombe blueprint | 1,000 | Unlocks the Bombe: a machine that tests settings for you (8 ops/s). | lifetime ≥ 600 | 1:32 |
| 6 | Wren operators | 2,200 | Bombes run twice as fast. | own 2 Bombes | 2:41 |
| 7 | Hollerith punch cards | 4,500 | Clerks work twice as fast. | lifetime ≥ 4,000 | 3:29 |
| 8 | Diagonal board | 8,000 | Bombes run twice as fast. | own 6 Bombes | 4:15 |
| 9 | **"Action This Day"** (choice) | 14,000 | Pick one: **A** Bombes get cheaper to build (cost growth 12% → 7%), or **B** each click adds a further 25% of your ops/s. | lifetime ≥ 12,000 | 4:55 |
| 10 | Hut 8 coordination | 24,000 | Each Bombe makes every clerk 2% faster (clerks check the Bombe stops). | own 12 Bombes | 5:51 |
| 11 | US Navy Bombes | 40,000 | Bombes run twice as fast. | lifetime ≥ 35,000 | 6:54 |
| 12 | Typex network | 65,000 | Everything runs 1.5× faster. | lifetime ≥ 60,000 | 7:23 |
| G | **Break Shark** (stage goal) | 250,000 | Ends Stage 1. Collapse → Stage 2 (ENIAC). | visible from 0:00 | 9:33 |

The log carries the historical flavor (Rejewski, the Polish bomba, Turing, Welchman, the U-110
capture, and so on). Effect text stays plain, as requirement 8 says.

### 3.5 Minute-by-minute pacing (reference run, choice A, simulated)

Player model: clicks 4/s for the first 90 s, then 3/s until 4:00, then 2/s until 7:00, then
1.5/s. The player buys any revealed affordable upgrade, otherwise the producer with the best
ops/s per cost, and saves when a visible upgrade is less than 30 s away.

| Minute | ops/s at end | click value | What happens | Task time (10k ops) |
|---|---|---|---|---|
| 0–1 | 10 | 2.5 | Clicks only, then first clerk (0:03), Squared paper, Shift rota, Cribs. About 10 clerks. | 8 min 20 s |
| 1–2 | 48 | 4.4 | Zygalski sheets; **Bombe blueprint** reveals the second producer. | 2 min 43 s |
| 2–3 | 114 | 7.7 | First Bombes; Wren operators. | 73 s |
| 3–4 | 216 | 12.8 | Hollerith cards; Bombes overtake clerks. | 39 s |
| 4–5 | 408 | 22.4 | Diagonal board; **the choice** ("Action This Day"). | 22 s |
| 5–6 | 848 | 44 | Hut 8 coordination; Bombe count about 20. | 11 s |
| 6–7 | 2,010 | 103 | US Navy Bombes. | 4.5 s |
| 7–8 | 4,978 | 251 | Typex network; the goal bar starts visibly filling. | 1.9 s |
| 8–9:33 | 6,600 | 333 | Final sprint: buying Bombes while the Shark bar fills. **Goal at 9:33.** | 1.4 s |

Checks:
- **Total: 9.6 min.** Sensitivity to clicking (choice A): 0.3× clicking gives 11.4 min,
  0.6× gives 10.5, 1.5× gives 8.8. Choice B: 12.7 / 11.0 / 9.3 / 7.5 min. The stage stays
  inside 7.5–12.7 min for every play style.
- **Longest gap between any two purchases: 35 s** (38 s for choice B or a lazy clicker).
  **Longest gap between upgrades: 69 s** (1:32 → 2:41), filled with Bombe purchases.
- **The task time halves about every minute** (500 s → 1.4 s). It never increases, because no
  mechanic lowers ops/s.
- End rate is about 5–7×10^3 ops/s, which hands off cleanly to ENIAC (5×10^3 add/s) in Stage 2.
- The script is at `/private/tmp/claude-501/sim3.py` (`python3 sim3.py A|B [clickscale]`).

### 3.6 Stage end
Buying **Break Shark** starts a short log sequence, then the collapse: "The machines are
broken up by order. The method survives." Clerks and Bombes fold into "Legacy: Bletchley,
6,600 ops/s". Stage 2 opens with one new button and the first ENIAC priced at about 10 s of production.

---

## 4. Pacing rules as formulas (one config)

All per-stage numbers derive from a few knobs. Costs are written **in seconds of
expected production**, so the same template works at 10^1 or 10^30 ops/s.

```
config.stage[n] = {
  R0:        start rate (ops/s)            // = R_end of stage n-1 (stage 1: ~1, the click)
  T:         target duration (s)           // 600 for stage 1
  D:         doubling time of the rate (s) // 50 for stage 1
  g:         producer cost growth          // 1.12
  W:         upgrade wait target (s)       // 30 (range 20–45)
  reveal_a:  reveal fraction               // 0.6
  goal_W:    goal wait (s)                 // ~90
  mult_budget: max product of upgrade multipliers in the stage  // ~×50
}
```

**Expected rate curve:** `R*(t) = R0 · 2^(t/D)`. Stage 1: 1 · 2^(600/50) ≈ 4,096, which
matches the simulated 5–7k.

**Producer cost:** `cost_k(n) = c0_k · g^n`, where `c0_k = R*(t_unlock_k) · τ_k` and τ is
about 10–20 s of production at unlock. With g = 1.12 the tenth unit costs ×3.1 and the
twentieth ×9.6. The doubling time D must satisfy **D < (time to buy ~6 units)**, so that
rate growth outpaces cost growth (ln 2 / ln 1.12 ≈ 6.1 units per cost doubling).

**Producer output:** `out_k = base_k · Π(upgrade mults for k)`, with `base_late ≈ 16 × base_early`.

**Upgrade cost schedule:** `U_i = R*(t_i) · W`, where `t_i = i · T / (N_upgrades + 1)`. Upgrades
are spread evenly in *time*, which spaces them geometrically in *cost*. Stage 1 cost ratios
fall from ×4 to ×1.6 per step as the doubling of rate settles in (15 → 65,000).

**Reveal threshold:** an upgrade appears when `lifetime ≥ reveal_a · U_i` (or when a count
condition is met). It then sits visible for about 20–40 s before it is affordable. That gives
the "saving up" feeling without a dead wait.

**Reveal queue (anti-clump):** at most **2 unaffordable upgrades** visible, plus the goal.
Reveals that are due wait in a queue, with at least **15 s** between reveals.

**Click:** `click = base_click_n · Π(click mults) + click_pct · R`, with `base_click_n ≈ R0_n · 0.5 s`.

**Goal:** `G = R*(T) · goal_W`. Stage 1: about 4,000 · 60, rounded to 250,000.

**Speedometer task:** `K_n = R*(T/2) · 30 s`, so the task takes about 30 s mid-stage, minutes
at the start, and about 1 s at the end. Stage 1: 10,000 ops.

**Automated tests the config must pass** (run the sim in CI per stage):
1. T_sim is within ±15% of T for clickscale 0.6–1.0, and within ±35% for 0.3–1.5.
2. Max gap between purchases is ≤ 45 s, and max gap between upgrades is ≤ 75 s.
3. ops/s is monotonically non-decreasing, so task time never goes up.
4. R_end / R*(T) is within [0.5, 2].
5. Product of upgrade multipliers ≤ mult_budget.
6. Choices A and B finish within 20% of each other at clickscale 1.0.

---

## 5. Player choices in Stage 1

### 5.1 "Action This Day" (main choice, at about 4:50)
The 1941 letter from Turing, Welchman, Alexander and Milner-Barry to Churchill. The player
gets one answer, and each option is a different play style:

| Option | Effect | Who it suits | Sim result (clickscale 0.3 / 1.0 / 1.5) |
|---|---|---|---|
| **A: More Bombes** | Bombe cost growth drops from 12% to 7% | idle / builder | 11.4 / 9.6 / 8.8 min |
| **B: More people (Banburismus)** | each click adds a further 25% of ops/s | active clicker | 12.7 / 9.3 / 7.5 min |

The crossover sits near average clicking, so neither option is strictly better. The right pick
depends on how you intend to play the next five minutes. That is the kind of choice we want
instead of "click whatever is affordable".

### 5.2 The legacy pick (at the collapse, optional, untested past Stage 1)
When Shark falls, choose what survives the breakup:
- **Keep the people**: the Stage 2 click starts at ×3 base.
- **Keep the method**: Stage 2 producer cost growth is 1.12 → 1.10.

Both are small, both carry over, and both give the player a reason to remember Stage 1. Keep
this optional; drop it if the lead wants fewer choice points.

### 5.3 Built-in micro-choice
Every moment of saving is a small decision: buy a Bombe now, or save 30 s for Wren
operators? The reveal-before-affordable rule (§4) is what makes that decision visible.

---

## 6. Failure modes and how this design avoids them

### 6.1 The dead wait
*Symptom:* nothing to buy, nothing changing, the player tabs away.
- Upgrades are spaced in **time**, not cost (`t_i = i·T/(N+1)`), so one arrives about every 45 s.
- Two producers per stage give a purchase about every ≤ 35 s between upgrades. The sim's max gap is 35–38 s.
- Every locked item shows a progress bar and an ETA ("Wren operators: 1,400 / 2,200 — ~18 s").
- The speedometer keeps moving, so even waiting shows progress.
- The final sprint to the goal (about 90 s) has its own big progress bar and Bombes to buy.

### 6.2 The clump of unlocks
*Symptom:* five things appear at once, the player buys all of them, then waits.
- The reveal queue allows 2 unaffordable visible items, with ≥ 15 s between reveals.
- Reveal thresholds are tied to each upgrade's own cost (`reveal_a · U_i`), not to one shared milestone.
- A CI test fails if more than 2 purchases land within 5 s of each other after minute 2.

### 6.3 Stacked multipliers exploding
*Symptom:* late in a stage, rate goes up ×1,000 in a minute and the pacing breaks.
- Each stage has a **multiplier budget** (Stage 1: clerks ×8, Bombes ×8 × 1.5 with Typex, global ×1.5).
- Only one synergy upgrade per stage, and it is linear and small (+2% per Bombe).
- **The collapse wipes all multipliers at stage end.** Only the *rate* carries, as a flat
  number. Stage n+1 is tuned against R0 alone, so multipliers never compound across stages.
- CI test 4 (R_end within 0.5–2× of target) catches runaway stacking.

### 6.4 The empty goals panel
*Symptom:* the player does not know what to aim for.
- The **stage goal is visible from second 0**, with its locked reason
  ("You are testing settings by hand").
- The panel always shows **the next locked item and its reveal condition with a counter**
  ("Own 10 clerks — 7/10"), even when nothing is affordable.
- After the last upgrade, the panel shows the goal bar and a teaser for the next stage
  ("Rumours of an electronic machine at Dollis Hill…"), so it is never empty.

### 6.5 Getting slower (requirement 4)
- No mechanic consumes ops/s. There is no upkeep, no cap, no decay.
- The collapse carries rate exactly. Next-stage costs are relative to that rate, so the first
  purchase is about 10 s away.
- Cost growth per unit (12%) is beaten by rate growth (doubling about every 50 s, about every 6
  units). Purchases keep coming sooner in *wall-clock* time even though costs rise.

### 6.6 Caps and juggling (lesson from players)
- No housing, power or storage caps anywhere. Constraints appear only as **"locked
  until …" reveals**, which tell you what to do next instead of what you cannot do.

---

## 7. Open questions for the lead
1. Unit label: "ops" all the way, or switch the display to "FLOP" in Stage 2? (The value is the same.)
2. Should the rate panel show the real-world comparison ("You are now faster than ENIAC")?
   I recommend yes. It is free motivation and it fits the historian's table.
3. Investor era: show "$" as a flavor conversion of ops, never as a second balance (§1.2).
4. Stage lengths after Stage 1 (§2.3) are proposals; only Stage 1 was simulated.
