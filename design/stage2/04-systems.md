# Stage 2 — Systems and economy (game systems designer)

Scope: the numbers for Stage 2 and the engine changes needed to play more than one stage.
Names are placeholders (`u01`–`u15`, "Valve computers", "Mainframes"); the lead merges the historian's names.
Every number below was checked by a scratch simulator that imports the real `src/engine.js`
(see §5). Nothing in `src/` or `sim/` was edited.

---

## 1. Engine changes for multiple stages

### 1.1 `STAGES` and `stageData`
- `import { STAGE2 } from './data/stage2.js'`; `export const STAGES = { 1: STAGE1, 2: STAGE2 };`
- `stageData(s)` stays `STAGES[s.stage]`. Every function already reads the stage through it, apart from these four places, which need fixing:
  1. `createState()` uses `STAGE1` directly. That is fine for a new game, but `deserialize` builds its base from it
     (see 1.7).
  2. `producerOutput` has `'clerk'`/`'machine'` hard-coded for `synergy`. Generalise it to
     `{ type: 'synergy', target, source, value }` (Stage 1 data: `target: 'clerk', source: 'machine'`). Stage 2 does not use synergy.
  3. `conditionProgress` and `currentGoal` hard-code "Check … guesses". Move the wording to stage data:
     `phrases: { total: 'Run {n} operations in total', byHand: 'Run {n} calculations by hand' }`.
  4. `ui.js`/`main.js` hard-code "Checked in total", "1 guesses", "people with pencils" and "your team checked … guesses".
     Read these from stage data too (`totalLabel`, `singular`, `personLabel`).

### 1.2 `passLedger` moves to the next stage
Split the function in two. `passLedger(s)` folds the old stage away, exactly as it does today. Then, if `STAGES[s.stage + 1]` exists,
it calls a new `enterStage(s, s.stage + 1)`. If there is no next stage, it falls back to today's `phase = 'next'`
placeholder, which is still needed for 2 → 3.
```
export function enterStage(s, n) {
  const st = STAGES[n];
  s.stage = n;
  s.producers = Object.fromEntries(st.producers.map(p => [p.id, 0]));
  s.bought = {}; s.choices = {}; s.revealed = {}; s.beats = {};
  s.lastRevealAt = -Infinity;
  s.goalDone = false; s.finaleIndex = 0; s.endingIndex = 0; s.endingAt = 0;
  s.stageStart = { time: s.time, lifetime: s.lifetime, clicks: s.clicks };
  s.phase = 'playing';
  checkBeats(s);              // fires the stage's opening line
}
```
The order matters: compute `rate = getRate(s)` with the OLD stage's data, set `s.legacyRate = rate`, log `st.next.text`, and only then
call `enterStage`. The sim checks that `getRate` is identical before and after.

### 1.3 Fields: what resets and what carries over
| Carries over (never reset) | Resets at `enterStage` |
|---|---|
| `ops` (balance), `lifetime` (all-time total), `clicks`, `time`, `date`, `log`, `bestRate`, `legacyRate` (newly set), `version` | `stage`, `producers` (new ids), `bought`, `choices`, `revealed`, `lastRevealAt`, `beats` (Stage 1 and 2 both use ids like `start`), `goalDone`, `finaleIndex`, `endingIndex`, `endingAt`, `phase`; new `stageStart` |

**New field `stageStart = { time, lifetime, clicks }`.** Every *condition* reads stage-relative values:
`stageTotal(s) = s.lifetime - s.stageStart.lifetime` and `stageClicks(s) = s.clicks - s.stageStart.clicks`.
This applies in `conditionMet`, `conditionProgress`, `canBuyGoal`, `currentGoal` and `stageProgress`.
It is required: Stage 1 ends with about 3–4 million in total, which would reveal half of the Stage 2 cards at second 0.
The goal bar therefore counts "in total, this stage". Under the counter, the UX designer should label the line
"Made since 1946: …" (or similar) so that the two totals are never confused.

**Production pauses in `handover` and `next`.** Change `tick` to add `rate*dt` only when `isActive(s) || s.phase === 'ending'`.
Today a player who sits on the "Pass the ledger on" screen keeps earning, so they could start Stage 2 with any balance.
With the pause, the carried balance is only what is left after the ending lines: 0.17–0.24 M in the sim, which is 6–9 s of the
legacy rate. That keeps the first purchase about 3–15 s away (see §4).

### 1.4 Legacy: how it adds and how it is shown
- **Arithmetic (already right, keep it):** `getRate = legacyRate + Σ producers × output × producerMul × globalMul`.
  The legacy is added *outside* every multiplier. Global upgrades and the goal's ×3 do not touch it, so it really "never changes".
  If it were multiplied, Stage 2 would be about 1.6× faster and the ×3 goal would also triple an old number.
- **Display:** the first row of the Machines panel is a fixed, non-buyable line:
  "**Legacy (1939–45)** · 26,654 per second · never changes". Its share of the speed falls over the stage
  (63% at 1:00, 28% at 3:00, 4% at 7:00, under 1% at the goal), and the player can watch this happen.
  Stage data: `legacyLabel: 'Legacy (1939–45)'`. From Stage 3 on, the legacy line holds one number (the Stage 2 end rate).
  Do not stack one line per stage.
- **Click:** a new stage field `clickLegacyFrac`. The base value of a click is `clickLegacyFrac × legacyRate`, which replaces `CONFIG.clickBase`:
  `getClickValue = (st.clickLegacyFrac ? st.clickLegacyFrac * s.legacyRate : CONFIG.clickBase) * fx.clickMul + fx.clickPct * getRate`.
  Stage 2 uses 0.05, so one click is worth 1,333 (machines) or 954 (people), and `clickMul`/`clickPct` work as in Stage 1.

### 1.5 Unit label: "checks" → "operations", the number unchanged
- Stage data: `unit: 'operations', unitBefore: 'checks', unitRenameBeat: '<beat id>'`.
- Engine: `export function unitName(s) { const st = stageData(s); return st.unitRenameBeat && s.beats[st.unitRenameBeat] === undefined ? st.unitBefore : st.unit; }`
- The UI uses `unitName(s)` wherever it uses `st.unit` today (counter, costs, cards, goal bar, legacy line). `ops`/`lifetime` are untouched,
  so the number does not jump. The word changes on the frame the beat's log line appears. Keep the existing flash on the counter.
- Slot: the beat fires at **1.5 M made this stage** (0:35–0:55 for normal play, after the first purchases).
  If the historian dates the beat 1948, the cards bought before it (u01, u02) must carry 1946–47 dates (ledger rule 7).

### 1.6 UI changes on a stage switch
`ui.js` keeps `prodEls`, `cardEls`, `lockedEl` and `goalKind` across frames. When `s.stage` changes, the UI must clear the producer and
upgrade lists and those maps. Otherwise the clerk and machine rows stay on screen. The handover CSS classes and the
`next-stage` placeholder keep working for 2 → 3.

### 1.7 Save compatibility
- Bump `SAVE_VERSION` to 2 and **migrate, do not reject**. Today `deserialize` returns `null` for any other version,
  which would silently wipe every Stage 1 save.
- Migration from v1:
  - Add `stageStart = { time: 0, lifetime: 0, clicks: 0 }`.
  - If `stage === 1 && phase === 'next'` (a finished save from the current build): run `enterStage(s, 2)`.
    `legacyRate` is already correct, because v1 `passLedger` set it. Keep `ops` as it is: these few players earned it
    while idling, and it only lets them skip the first minute.
- In `deserialize`, build the producer base from `STAGES[data.stage]`, not from `createState()`. Otherwise a Stage 2 save
  picks up `clerk: 0, machine: 0`.
- `serialize` needs no change. `applyOffline` works as it is, and is 0 while paused in handover.

### 1.8 Simulator changes (`sim/simulate.mjs`)
1. Refactor `run()` into `playStage(s, profile, choice, clock)`. It plays the *current* stage until it is no longer active and
   returns times relative to `stageStart.time`. `decide()` is already stage-agnostic.
2. Per-stage pass windows: `WINDOWS = { 1: {…today…}, 2: { holder: [9, 99], greedy: [0, 18], active/average/casual: [11, 16], idle: [9, 20] } }`,
   with a quiet limit of 45 s (50 s for idle).
3. `--stage 2` plays Stage 2 **alone**. Start from `createState()`, set `legacyRate` and `ops`, set `phase = 'handover'`,
   then call `passLedger` (which now enters Stage 2). `--legacy N` (default: the real Stage 1 end rate for that profile and choice) and
   `--carry N` (default 200,000).
4. `--through 2` plays **Stage 1 → 2 end to end**. It plays Stage 1, lets the ending lines run, checks that `passLedger`
   keeps the rate, and plays Stage 2 with the same state object. It reports both stage times.
5. Clicking clock: `--clock stage` (default; the profile schedule restarts at Stage 2, as fresh attention) or `--clock game`
   (the schedule keeps decaying from minute 11). Both pass (§5).
6. New invariants: speed never drops *across* the handover. The unit label changes exactly once, never back. Stage 2 opens with
   0 owned and 0 revealed. `--data` patches `STAGES[--stage]`.
7. Both stages use the choice ids `machines`/`people`, so the matrix is still 6 profiles × 2 choices. In `--through` mode the same
   option is chosen in both stages.

---

## 2. Stage 2 economy (`src/data/stage2.js`, same format as Stage 1)

Starting point: the legacy is 26,654/s with "More machines" and about 19,000/s with "More people" in Stage 1 (real Stage 1 sim, normal styles; greedy 24–34k).
The design reference is 23,000/s. Prices are "seconds of the starting rate", using 23k.

### 2.1 Click
| Field | Value | Notes |
|---|---|---|
| `clickLegacyFrac` | 0.05 | 1 click ≈ 1,150–1,330 (0.05 s of legacy). After u01 it is ≈ 2,700, and u03 adds 3% of the speed. |
| Effect in minute 1 | clicking adds **14%** to the average player's speed (holder: 30%) | Stage 1 people option: 5%+15% of speed per click. |
I tried 0.10. It pushed holding the button with "people" below 9 min. Holding is the profile most sensitive to this field.

### 2.2 Producers
| Producer | Appears | Base cost | Growth | Output | In seconds of 23k |
|---|---|---|---|---|---|
| **Valve computers** ("Build a computer") | from 0:00 | 300,000 | ×1.17 | 3,500/s | 13 s; one adds +13–18% of the starting speed |
| **Mainframes** ("Install a mainframe") | after u07 | 6,000,000 | ×1.20 | 60,000/s | the first one at ~4:30 adds +45% (75k on 160k) |
The growth is steeper than in Stage 1 (1.12) on purpose. With a fixed legacy floor, producers with ×1.12 growth snowballed, and the stage lasted 5–7 min.

### 2.3 Upgrades (15)
Effect types are all existing ones. "Avg buy" is the average/machines run.
| # | Cost | Effect (card text) | Type | Reveal | Avg buy | Date slot |
|---|---|---|---|---|---|---|
| u01 | 300 k | Each click counts twice. | clickMul 2 | 15 clicks (this stage) | 0:12 | 1946 |
| u02 | 500 k | Computers work 1.5× faster. | producerMul valve 1.5 | own 3 computers | 0:43 | 1946–47 |
| u03 | 820 k | Each click also adds 3% of your speed. | clickPct 0.03 | 1.6 M this stage | 1:00 | 1948 (after the rename) |
| u04 | 1.3 M | Computers work 1.5× faster. | producerMul valve 1.5 | 2.6 M | 1:25 | 1949 |
| u05 | 2.2 M | Everything works 1.25× faster. | globalMul 1.25 | 4.4 M | 2:07 | 1950–51 |
| u06 | 3.7 M | Computers work 1.5× faster. | producerMul valve 1.5 | 7.4 M | 3:05 | 1952–53 |
| u07 | 6.1 M | Unlocks mainframes: each makes 60,000/s. | unlockProducer mainframe | 12 M | 3:54 | 1954–56 |
| u08 | 10 M | Mainframes work 1.5× faster. | producerMul mainframe 1.5 | own 2 mainframes | 5:31 | 1957 |
| u09 | 16 M | **Choice** (§2.4) | choice | 32 M | 6:09 | 1958–59 |
| u10 | 27 M | Computers work 1.5× faster. | producerMul valve 1.5 | 54 M | 7:25 | 1960 |
| u11 | 45 M | Mainframes work 1.5× faster. | producerMul mainframe 1.5 | 88 M | 8:49 | 1961–62 |
| u12 | 60 M | Everything works 1.25× faster. | globalMul 1.25 | 140 M | 9:27 | 1963–64 |
| u13 | 80 M | Mainframes work 1.5× faster. | producerMul mainframe 1.5 | 170 M | 10:11 | 1964–65 |
| u14 | 100 M | Mainframes work 1.25× faster. | producerMul mainframe 1.25 | 240 M | 10:44 | 1966–67 |
| u15 | 140 M | Computers work twice as fast. | producerMul valve 2 | 320 M | 11:23 | 1968 |
Totals: valves ×10.1, mainframes ×4.2, everything ×1.56. Each card costs 20–45 s of the current speed when revealed.
A card arrives every 30–50 s, and producer purchases fill the gaps. All 15 are bought before the goal for every
profile, so none spill into the finale. Reveal conditions are mostly "made this stage", because count conditions (`own N`) stalled
when the bot stopped buying that producer.

### 2.4 The choice (u09, 16 M)
| Option | Effect | Type | Who it suits |
|---|---|---|---|
| **More machines** | Mainframes get cheaper: each costs 12% more than the last, not 20%. | costGrowth mainframe 1.12 | idle players and builders: about 3 more mainframes by the goal (13 vs 10) |
| **More people** | Each click adds another 10% of your speed. | clickPct 0.10 | clickers: the average player's click share goes from 4% to 14% of speed |
With the same legacy, the two options finish within 0.5 min of each other (see the Stage 2 alone table). "People" was +15% in Stage 1, and +10% here keeps holding the button at 10.6 min or more.

### 2.5 Stage goal
`{ lifetime: 700e6 (made this stage), effect: globalMul 3 }`. It is reached at about 11:40 (machines) and 12:45 (people) for the average player.
The speed is about 4–6 M just before the click and **1.5–1.8×10⁷ after** (normal styles; greedy 2.2–2.9×10⁷). If the lead wants it
closer to 1.0×10⁷, a goal effect of ×2.5 gives 1.25–1.5×10⁷ and changes the times by less than 0.1 min.

### 2.6 Finale (no hiring; upgrades already all bought)
| Step | Cost | At ~6–18 M/s |
|---|---|---|
| Finale 1 | 200 M | ~10 s after the goal |
| Finale 2 | 400 M | ~25 s after that; ends the stage |
The finale takes 30–40 s, then the ending lines (4 s each) and "Pass the ledger on".

---

## 3. Results (scratch sim, real engine, Stage 1 → 2 end to end)

Stage 2 time is measured from "Pass the ledger on". "Rel" means clicks restart the profile schedule at Stage 2, and "abs" means they keep
decaying from the start of the game.
| Profile | Choice | S1 min | Legacy | **S2 min (rel)** | S2 min (abs) | Longest quiet | End speed | Result |
|---|---|---|---|---|---|---|---|---|
| holder | machines | 8.7 | 26,654 | **11.0** | 11.0 | 37 s | 1.81e7 | ok (≥9) |
| holder | people | 7.8 | 18,941 | **10.6** | 10.6 | 39 s | 1.50e7 | ok |
| greedy | machines | 15.4 | 34,236 | **12.3** | 12.8 | 21 s | 2.74e7 | ok (≤18) |
| greedy | people | 15.6 | 24,111 | **13.2** | 13.4 | 22 s | 2.18e7 | ok |
| active | machines | 10.1 | 26,654 | **11.8** | 12.2 | 38 s | 1.81e7 | ok (11–16) |
| active | people | 10.4 | 19,014 | **12.5** | 13.0 | 37 s | 1.50e7 | ok |
| average | machines | 11.0 | 26,654 | **12.2** | 12.6 | 38 s | 1.81e7 | ok |
| average | people | 11.7 | 19,088 | **13.4** | 13.5 | 40 s | 1.50e7 | ok |
| casual | machines | 12.0 | 26,138 | **12.7** | 12.9 | 40 s | 1.81e7 | ok |
| casual | people | 13.1 | 19,688 | **13.8** | 13.8 | 40 s | 1.50e7 | ok |
| idle | machines | 13.2 | 26,654 | **13.2** | 13.2 | 41 s | 1.81e7 | ok (gap ≤50) |
| idle | people | 14.7 | 19,688 | **14.5** | 14.4 | 41 s | 1.50e7 | ok |
All 12 pass in both clock modes. The speed never drops, including across the handover, where the rate is identical.
Stage 1 + 2 for normal play: 23–27 min.

**Stage 2 alone** (fixed legacy, 200 k carried, choice = the profile's), minutes:
| Legacy | holder m/p | greedy m/p | active m/p | average m/p | casual m/p | idle m/p |
|---|---|---|---|---|---|---|
| 19,000 | 11.6 / 10.5 | 13.8 / 13.8 | 12.6 / 12.5 | 13.1 / 13.3 | 13.6 / 13.9 | 14.1 / 14.6 |
| 27,000 | 10.9 / 9.8 | 13.0 / 13.0 | 11.8 / 11.6 | 12.2 / 12.4 | 12.6 / 13.1 | 13.2 / 13.7 |
| 34,000 | 10.5 / 9.3 | 12.5 / 12.5 | 11.3 / 11.2 | 11.8 / 11.9 | 12.1 / 12.5 | 12.7 / 13.3 |
The economy barely depends on the legacy: a 1.8× higher legacy saves only about 1.3 min. This is because the
legacy is added outside the multipliers and is below 5% of the speed after minute 6.

### 3.1 Minute by minute, "average" profile (end to end, rel clock)
**More machines** (legacy 26,654, carried 236 k):
| min | speed/s | click | clicks add | computers | mainframes | made this stage | upgrades |
|---|---|---|---|---|---|---|---|
| 0 | 26,654 | 1,333 | 0% | 0 | 0 | 0 | 0 |
| 1 | 42,404 | 2,665 | 14% | 3 | 0 | 2.5 M | 2 |
| 2 | 58,154 | 4,410 | 12% | 4 | 0 | 6.0 M | 4 |
| 3 | 95,561 | 5,532 | 9% | 7 | 0 | 11.6 M | 5 |
| 4 | 159,545 | 7,452 | 8% | 9 | 0 | 21 M | 7 |
| 5 | 249,311 | 10,145 | 4% | 10 | 1 | 34 M | 7 |
| 6 | 399,311 | 14,645 | 4% | 10 | 2 | 57 M | 8 |
| 7 | 624,311 | 21,395 | 4% | 10 | 4 | 87 M | 9 |
| 8 | 1.01 M | 33,017 | 3% | 14 | 6 | 133 M | 10 |
| 9 | 1.52 M | 48,205 | 3% | 14 | 7 | 205 M | 11 |
| 10 | 2.10 M | 65,718 | 3% | 14 | 8 | 317 M | 12 |
| 11 | 3.97 M | 121,880 | 3% | 14 | 9 | 503 M | 14 |
| 11:42 | goal ×3 → finale | | | 16 | 13 | 700 M | 15 |
| 12:14 | **1.81×10⁷**, stage ends | | | | | | |
Upgrade buys: 0:12, 0:43, 1:00, 1:25, 2:07, 3:05, 3:54, 5:31, 6:09, 7:25, 8:49, 9:27, 10:11, 10:44, 11:23.
There are 29 producer buys and 7 story lines in between. The first mainframe comes at 4:29.

**More people** (legacy 19,088): speed 19 k → 30 k (1 min) → 68 k (3) → 152 k (5) → 392 k (7) → 914 k (9) → 1.9 M (11) → 3.6 M (12);
goal 12:46 → finale ends at 13:21 at 1.50×10⁷. After the choice (7:01), clicks add 13–14% of the speed (4% with "machines").

---

## 4. Does the Stage 1 legacy make the first minute trivial or boring?

**The risk.** The player starts at 19–27 k/s, a rate it took 10 minutes to build. If Stage 2's first things were priced like
Stage 1's (tens to thousands), the player would buy everything instantly (trivial). If they were priced only as
"more of the same" (+1% each), nothing would visibly change (boring), and the legacy would dwarf every early purchase.

**What the numbers do about it:**
1. **First purchase is near, and big.** A computer costs 300 k (13 s of 23 k). With the ~0.2 M carried over it comes at
   **0:03–0:20** (it would be 11–16 s with nothing carried). It adds 3,500/s, **+13–18% of the speed**, so the speed line visibly changes.
   In Stage 1, Polish notes doubled a click of 1. Here the first producer is the first visible "jump".
2. **Fast cadence in the first minute.** Average/machines: computer 0:03 → click ×2 0:12 → computer 0:21 → computer 0:32 →
   ×1.5 computers 0:43 → the rename line ("operations") about 0:40 → +3% per click 1:00. That is something new every **≤ 12 s** for the first minute,
   and the speed is **+59% by 1:00**.
3. **The legacy gets visibly overtaken.** Because the legacy is outside the multipliers, every computer upgrade shrinks its share:
   63% of the speed at 1:00, 28% at 3:00, 10% at 5:00. The fixed "Legacy · never changes" line lets the player see that the new
   machines matter. This is the lab-director fantasy: the old room is now a footnote.
4. **The click is tied to the legacy** (5% of it), so the first click shows "+1,333", not "+1", and clicking adds 14% at 2.4 clicks/s.
   It does not dominate, so holding the button stays at 10.6 min or more.
5. **No carry exploit.** Production pauses during the handover (§1.3), so nobody starts with millions.

The **people** players start about 30% slower (19 k). They get the first computer at 0:08–0:20 and are about 1 min slower over the stage.
The gap closes as the legacy shrinks. This is the deferred cost of their Stage 1 choice, and it is mild.

---

## 5. Method and reproduction
Scratch files (not in the repo): `/private/tmp/claude-501/s2/sim2.mjs` (driver) and `/private/tmp/claude-501/s2/stage2.mjs` (data above).
The driver imports `src/engine.js` and `src/config.js` from the repo and registers `E.STAGES[2] = STAGE2`. It plays Stage 1 with the
real data and the real `passLedger`, then emulates `enterStage`. It emulates the stage-relative conditions by zeroing `lifetime`/`clicks`
at entry (the global total is tracked separately), and the legacy click by setting `CONFIG.clickBase = 0.05 × legacyRate`.
The profiles are copied verbatim from `sim/simulate.mjs`, and so are the `decide()` bot (30 s save horizon, best output-per-cost producer) and
the "nothing new" gap metric (purchases, reveals and log lines). The six placeholder story beats (start, first computer, rename at 1.5 M,
25 s after u07, 20 s after u09, 20 s after u12) count as events. The plot designer's real beats should keep a similar spacing, because the quiet margin for idle play is 9 s.
Run: `node sim2.mjs`, `node sim2.mjs --abs`, `node sim2.mjs --verbose average machines`, `ALONE=1 NOCLI=1 node sim2.mjs`.

**Tuning levers, in order of strength:** goal lifetime (±100 M ≈ ±0.3 min); computer growth 1.17 (1.20 adds ~1 min, and the first minute gets sparser);
`clickLegacyFrac` (holding the button is the binding profile); goal ×3 (end speed only); late card costs u12–u15 (if raised, they spill into the finale).
