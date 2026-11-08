# Plan 08 — War Narrative Initiatives (Redesign #2)

> **Order:** This plan ships **second**, after 07 (starter gating) and before 09 (pacing). It relies on the DAG-gating pattern from 07 and is the largest fiction-level change of the three.

---

## 1. Goal

The player should feel like they are winning a war, not tuning a spreadsheet. Today every Phase 0/1 initiative is an economy upgrade (×2 reward, +50 cap, +10× Bombe output). Nothing in the fiction says "because of you, the Battle of Britain was won" or "because of you, the Atlantic convoys got through." This plan adds a parallel **war-event** initiative track: real historical milestones that the player *unlocks by delivering intelligence* (they cost Data), each giving a *small* mechanical payoff and a *large* narrative payoff in the event log. Phase 0 ends on a war milestone, not on an abstract "Conceptualize the Bombe." Phase 1 ends on V-E Day.

---

## 2. Current behaviour

### Initiative types

From `src/data/operations.js` and `src/ui/render.js` (the `TYPE_TAG` map at lines 153–160):

| Type | Tag | Meaning today |
|---|---|---|
| `algorithm` | ALGO | Code/math upgrades |
| `infrastructure` | INFRA | Huts, cap, grid |
| `intelligence` | INTEL | `firstManualBreak`, `firstNavalEnigmaBreak`, `formationHut8` — closest thing to narrative today, but still economy-flavored |
| `acquisition` | ACQN | Defined but unused |
| `crisis` | CRISIS | Defined but unused |

The `intelligence` type is the closest existing match to "war narrative," but the initiatives that use it mostly give mechanical rewards (+50% reward, ×2 reward, etc).

### Phase transition

`conceptualizeBombe` (lines ~222–240 of `operations.js`) is the sole Phase 0 → 1 transition:

- `isPhaseTransition: true`
- `effect: state => { state.phase = 1; }`
- Has an `overlay` field (currently dormant per plan 07 feedback — overlays were disabled in session 7)

`installationVictory` is the first Phase 1 op; its trigger is `{ minPhase: 1 }`. So the phase boundary is hard-coded via `state.phase`.

### Overlay handling

In `src/systems/operations.js :: executeOperation` (lines 95–109), session 7 removed the line `if (op.overlay) state._pendingOverlay = op.overlay;`. Every op now pushes its `result` to the event log via `pushLog`. The `overlay` field on ops is dormant — present in data but never triggered.

### Event log

`src/core/log.js` — 2-line rolling window, max 50 entries, used for narrative flavor on completion. Already wired up.

### Date system

`src/core/state.js`: `date: { year: 1939, month: 8, day: 15 }`. `dayDuration: 10` real seconds per in-game day.
`src/core/game.js :: tickDate / advanceDay` ticks the in-game calendar.

**No trigger field currently reads `state.date`.** All triggers are milestone-based (drops, personnel, ops).

---

## 3. Target behaviour

### Two-track initiative structure

Initiatives live on two parallel tracks:

- **Economy track** (today's ops, unchanged in this plan): algorithm, infrastructure, intelligence. These are the upgrades.
- **War track** (new): type `warEvent`, tag `WAR`. These are the *reasons* for the upgrades. They consume Data and provide a small mechanical reward plus a big narrative beat in the log.

### New phase boundary

| Old | New |
|---|---|
| Phase 0 ends at `conceptualizeBombe` (abstract mechanical beat) | Phase 0 ends at a war milestone (see §4.2) |
| Phase 1 has no ending | Phase 1 ends at `veDay`, with the overlay re-enabled specifically for this moment |

`conceptualizeBombe` is **demoted**: it stops being the phase-transition op and becomes a mid-Phase-0 unlock op for the Bombe. The new phase-transition op is a war event (candidate: `turingAtHutEightBreakthrough` or similar — see §4.2 for the selected one).

### Reward budget for war events

War events must have a **reward budget** — a cap on how much mechanical impact any one can deliver — so we don't re-stack multipliers on top of the already-problematic multiplier chain.

**Per-event reward budget (MAXIMUMS, not targets):**
- Flat supply cap increase: up to +15
- Flat data cap increase: up to +1000 (not a multiplier)
- Flat reward bonus on one stream: up to +20%
- Unlock of the *next* war-event or a specific economy op
- One-off Data or FLOPs rebate: up to +10% of current cap

**What war events must NOT do:**
- Multiplicative stacks on `dataPerDrop`, `searchSpeed`, `bombeOutput`, `operationCost`, or `flopsPerSec`.
- `spaceCurrent` / `spaceBase` reductions.
- Unlock brand-new unit types (that's what starter-gating ops do).

The fiction does the heavy lifting. The mechanics add a gentle bonus.

### New trigger field: `minDate`

Add optional trigger field:

```js
trigger: {
  minDate: { year: 1940, month: 7 }, // true when state.date.year > year OR (state.date.year === year && state.date.month >= month)
  // ... other fields still AND-combined
}
```

This lets war events gate on in-game date progression AND on op/drop prerequisites. A date-only trigger is allowed; usually date is combined with a drop threshold so that fast-playing and slow-playing players both reach the beat at roughly the right moment.

---

## 4. Code changes by file

### 4.1 `src/systems/operations.js` — extend trigger schema

Add date check to `triggerMet` (around lines 11–28):

```js
function triggerMet(trigger, state) {
  const t = trigger || {};
  const completed = state.operations.completed;

  if (t.operations) {
    for (const id of t.operations) {
      if (!completed.includes(id)) return false;
    }
  }
  if (t.minPhase             !== undefined && state.phase                       < t.minPhase)             return false;
  if (t.minDrops             && state.stats.totalDrops                 < t.minDrops)             return false;
  if (t.minJuniorCalculators && state.personnel.juniorCalculator.count < t.minJuniorCalculators) return false;
  if (t.minBoffins           && state.personnel.boffin.count           < t.minBoffins)           return false;
  if (t.minHuts              && state.huts                             < t.minHuts)              return false;
  if (t.minData              && state.resources.data                   < t.minData)              return false;

  // NEW: date gate (true when in-game date is at or after the specified year+month)
  if (t.minDate) {
    const d = state.date;
    const dateOk = d.year > t.minDate.year
                 || (d.year === t.minDate.year && d.month >= t.minDate.month);
    if (!dateOk) return false;
  }

  return true;
}
```

Document `minDate` in the header comment block of `src/data/operations.js` (the NODE SHAPE section, around lines 32–50).

### 4.2 `src/data/operations.js` — new war events

Add a new `// ── War Events ──` section. Add these ops (exact historical dates — do not paraphrase):

**Phase 0:**

```js
convoyEscortsRerouted: {
  id: 'convoyEscortsRerouted',
  phase: 0,
  label: 'Convoy Escorts Rerouted',
  type: 'warEvent',
  trigger: { minDrops: 5, minDate: { year: 1939, month: 10 } },
  cost: { data: 80 },
  gates: {},
  result: '+5 Billets · Army Radio Code reward +10%',
  flavor: "October 1939. The first Admiralty briefing arrives in a locked box. A westbound convoy turns south three hours before a wolfpack crosses its track.",
  effect(state) {
    state.resources.supply.cap += 5;
    state.streams.armyEnigma.rewardBase = Math.floor(state.streams.armyEnigma.rewardBase * 1.1);
  },
},

battleOfBritainIntel: {
  id: 'battleOfBritainIntel',
  phase: 0,
  label: 'Battle of Britain — Early Warning Enabled',
  type: 'warEvent',
  trigger: { minDrops: 15, minDate: { year: 1940, month: 7 } },
  cost: { data: 400 },
  gates: {},
  result: '+10 Billets · Army Radio Code reward +15% · Search speed +5%',
  flavor: "July 1940. Luftwaffe sortie orders decoded before the bombers reach the Channel. Fighter Command positions squadrons to meet them. The sky belongs to whoever reads the other side's post.",
  effect(state) {
    state.resources.supply.cap += 10;
    state.streams.armyEnigma.rewardBase = Math.floor(state.streams.armyEnigma.rewardBase * 1.15);
    state.multipliers.searchSpeed *= 1.05;
  },
},

afrikaKorpsSupplyTracked: {
  id: 'afrikaKorpsSupplyTracked',
  phase: 0,
  label: "Rommel's Supply Ships Tracked",
  type: 'warEvent',
  trigger: { operations: ['formationHut8'], minDrops: 30, minDate: { year: 1941, month: 2 } },
  cost: { data: 1200 },
  gates: {},
  result: '+200 Data Cap · Naval Radio Code reward +10%',
  flavor: "February 1941. Every tanker leaving Naples is logged, timed, and drawn on a plotting board in Malta before it clears the harbour. The Afrika Korps runs dry.",
  effect(state) {
    state.resources.dataCap += 200;
    state.streams.navalEnigma.rewardBase = Math.floor(state.streams.navalEnigma.rewardBase * 1.1);
  },
},

turingMemorandum: {
  id: 'turingMemorandum',
  phase: 0,
  label: "Turing's Memorandum to Churchill",
  type: 'warEvent',
  trigger: { operations: ['rotorLogicMapping', 'afrikaKorpsSupplyTracked'], minBoffins: 5 },
  cost: { data: 3000 },
  gates: { minHuts: 2 },
  result: 'Phase transition — Bletchley Park is funded directly by the Prime Minister',
  flavor: "October 1941. Turing, Welchman, Alexander, Milner-Barry sign a letter to Churchill describing the bottlenecks. Churchill scrawls 'ACTION THIS DAY'. Resources cease to be a question. The problem becomes: what do you build?",
  isPhaseTransition: true,
  overlay: {
    title: 'ACTION THIS DAY',
    body: "Churchill's minute is on every desk at the Park by morning.\n\nYou are no longer a research project. You are a weapon of state.",
  },
  effect(state) {
    state.phase = 1;
  },
},
```

**Phase 1:**

```js
operationMincemeat: {
  id: 'operationMincemeat',
  phase: 1,
  label: 'Operation Mincemeat',
  type: 'warEvent',
  trigger: { minPhase: 1, minDate: { year: 1943, month: 4 } },
  cost: { data: 4000 },
  gates: {},
  result: '+500 Data Cap · All future Operation costs −5%',
  flavor: "April 1943. A corpse in a Royal Marines uniform washes ashore in Spain with fake invasion plans. Berlin takes the bait. Sicily is lightly defended when the Allies arrive. The deception worked because our codebreakers confirmed they believed it.",
  effect(state) {
    state.resources.dataCap += 500;
    state.multipliers.operationCost = Math.max(0.7, state.multipliers.operationCost - 0.05);
  },
},

battleOfAtlanticTide: {
  id: 'battleOfAtlanticTide',
  phase: 1,
  label: 'Battle of the Atlantic — Tide Turns',
  type: 'warEvent',
  trigger: { operations: ['firstNavalEnigmaBreak'], minDate: { year: 1943, month: 5 } },
  cost: { data: 8000 },
  gates: {},
  result: '+15 Billets · Naval Radio Code reward +20%',
  flavor: "May 1943. Forty-one U-boats sunk in a single month. Dönitz withdraws the wolfpacks from the North Atlantic. The convoys get through. The invasion of Europe becomes logistically possible.",
  effect(state) {
    state.resources.supply.cap += 15;
    state.streams.navalEnigma.rewardBase = Math.floor(state.streams.navalEnigma.rewardBase * 1.2);
  },
},

dDayIntelligence: {
  id: 'dDayIntelligence',
  phase: 1,
  label: 'D-Day — Order of Battle Delivered',
  type: 'warEvent',
  trigger: { operations: ['cardIndexFull'], minDate: { year: 1944, month: 6 } },
  cost: { data: 20000 },
  gates: {},
  result: '+1000 Data Cap · +20 Billets · Search speed +10%',
  flavor: "June 6, 1944. Every German division in Normandy is named, numbered, and positioned on an overlay in SHAEF's operations room. Eisenhower signs the order at 04:15. The weather breaks.",
  overlay: {
    title: 'OVERLORD',
    body: "The largest amphibious operation in history steps off the landing craft with the enemy's order of battle in its pocket.\n\nYour index beat their radio.",
  },
  effect(state) {
    state.resources.dataCap += 1000;
    state.resources.supply.cap += 20;
    state.multipliers.searchSpeed *= 1.1;
  },
},

veDay: {
  id: 'veDay',
  phase: 1,
  label: 'V-E Day',
  type: 'warEvent',
  trigger: { operations: ['dDayIntelligence'], minDate: { year: 1945, month: 5 } },
  cost: { data: 40000 },
  gates: {},
  result: 'Phase transition — The war in Europe is over',
  flavor: "May 8, 1945. The Bombes stop. The huts go dark. Six thousand people sign another Official Secrets Act declaration and are told, individually, to go home and never mention what they did. Bletchley Park will be denied for thirty years.",
  isPhaseTransition: true,
  overlay: {
    title: 'V-E DAY',
    body: "It is over.\n\nThe greatest concentration of computational talent in history dissolves overnight. Some go back to Cambridge. Some to the Post Office. A few — the ones who saw what a Bombe could become — start thinking about a different kind of machine.",
  },
  effect(state) {
    state.phase = 2;
  },
},
```

### 4.3 `src/data/operations.js` — demote `conceptualizeBombe`

The current `conceptualizeBombe` has `isPhaseTransition: true` and `state.phase = 1`. Change it to an ordinary algorithm op that unlocks Bombe hardware without changing the phase:

```js
conceptualizeBombe: {
  id: 'conceptualizeBombe',
  phase: 0,
  label: 'Conceptualize the Bombe',
  type: 'algorithm',
  trigger: { operations: ['rotorLogicMapping'] },
  cost: { data: 5000, flops: 20000 },
  gates: { minBoffins: 5, minHuts: 2 },
  result: 'Bombe hardware design finalized · First machine can now be assembled',
  flavor: "Turing writes it down: 'We do not need the men to think faster. We need the copper to flow smarter.'",
  effect(state) {
    state.flags.bombeConceptualized = true; // read by installationVictory's trigger
  },
},
```

And update `installationVictory`'s trigger from `{ minPhase: 1 }` to `{ operations: ['conceptualizeBombe'] }`. This decouples "Bombes are unlockable" from "we are in Phase 1," which is now a narrative distinction.

### 4.4 `src/systems/operations.js` — selectively re-enable overlays

Session 7 removed the overlay trigger entirely. We need it back, but *only for the dramatic beats*. Add back the line with a guard:

```js
// in executeOperation, after pushLog:
if (op.overlay && op.isPhaseTransition) state._pendingOverlay = op.overlay;
```

This way `conceptualizeBombe`'s old overlay stays dormant (it's no longer `isPhaseTransition`), but `turingMemorandum`, `dDayIntelligence`, and `veDay` all fire their overlays. The `veDay` overlay is the capstone.

Also: `installationVictory` currently has an `overlay` field — remove it (it's not a phase transition anymore, and the event log is the right place for its result).

### 4.5 `src/ui/render.js` — new type tag and CSS hook

Add `warEvent` to `TYPE_TAG` (around line 153):

```js
const TYPE_TAG = {
  algorithm:      'ALGO',
  infrastructure: 'INFRA',
  intelligence:   'INTEL',
  acquisition:    'ACQN',
  crisis:         'CRISIS',
  warEvent:       'WAR', // new
};
```

The rest of `renderOperations` already uses `tag-${op.type}` as a CSS class (line ~180), so the styling hook is automatic: adding `.tag-warEvent` rules to `style.css` will colour the tag.

### 4.6 `style.css` — style the WAR tag

Add a new rule near the other `.tag-*` rules:

```css
.tag-warEvent { color: var(--gold); border-color: var(--gold); }
.op.war-event-card { border-left: 2px solid var(--gold); }
```

To apply `war-event-card` conditionally, extend the op class in `renderOperations` (line ~177) to:

```js
<div class="op${can ? '' : ' unaffordable'}${op.type === 'warEvent' ? ' war-event-card' : ''}" ...>
```

### 4.7 `src/core/state.js` — add `flags.bombeConceptualized`

For cleanness, declare the new flag in `createInitialState()`'s `flags` block so grep can find it:

```js
flags: {
  boffinsReduceOpCost: 0,
  bombeConceptualized: false,
},
```

This is also forward-compatible with existing saves (the shallow merge in `init()` will add it on load).

### 4.8 Update the graph comment at the top of `src/data/operations.js`

The prose DAG diagram in the header must reflect:
- New `// ── War Events ──` section
- `conceptualizeBombe` no longer marked `⚑` (phase transition)
- `turingMemorandum` is the new Phase 0 ⚑
- `veDay` is the new Phase 1 ⚑
- `installationVictory`'s trigger changed from `minPhase:1` to `operations: ['conceptualizeBombe']`

---

## 5. New state / schema changes

- **New trigger field:** `minDate: { year, month }` (optional, AND-combined).
- **New op type:** `warEvent`.
- **New flag:** `state.flags.bombeConceptualized` (boolean, read by `installationVictory`'s trigger).
- **New CSS class:** `.war-event-card`, `.tag-warEvent`.

No changes to `personnel`, `hardware`, `upgrades`, `multipliers`, or `streams` schemas.

---

## 6. Save migration notes

**What changes in save shape:**
- A new flag `flags.bombeConceptualized` (boolean, default `false`).

**Backward compatibility:**

Existing saves where the player has already completed `conceptualizeBombe` under the *old* rules (where it set `phase=1`) present a compatibility issue. The current op has `state.phase = 1` as its effect; after this plan, `conceptualizeBombe` sets `flags.bombeConceptualized = true` and does NOT touch `phase`. But an old save will have:
- `phase: 1` (set by the old effect)
- `operations.completed` contains `conceptualizeBombe`
- `flags.bombeConceptualized` does NOT exist

The player has already moved past that point, so the narrative phase boundary is irrelevant. But we must ensure `installationVictory`'s new trigger `{ operations: ['conceptualizeBombe'] }` evaluates true for such saves. It will, because `conceptualizeBombe` is in their `completed` list. ✅

For safety, add a one-line reconciliation in `game.js init()`:

```js
// Migration: old saves that completed conceptualizeBombe under the old rules
if (saved.operations.completed.includes('conceptualizeBombe') && !saved.flags.bombeConceptualized) {
  saved.flags.bombeConceptualized = true;
}
```

**Other save-compat considerations:**
- Players who have already reached Phase 1 via `conceptualizeBombe` will *not* retroactively see the new Phase 0 war events. That's fine — those war events had prerequisites (`minDate`, `minDrops`) that the player may or may not meet now, but at worst they'll appear in the available pool as bonuses.
- V-E Day, D-Day, etc. will appear when their date and op triggers are met, which for existing Phase 1 saves may be immediate if the player is already past 1944. This is acceptable — catching up on a narrative is better than missing it.

---

## 7. ⚠️ Difficulty flags for a dumber model

1. **Do not paraphrase historical flavor text.** Every date, name, and event in the `flavor` and `result` fields is real. A dumber model will "smooth" these (e.g., write "1941" as "early 1940s," or change "Turing, Welchman, Alexander, Milner-Barry" to "Turing and his team"). This erodes the game's single biggest asset — that it's *true*. Rule: **copy the flavor text in §4.2 verbatim. If anything seems wrong, flag it; don't rewrite it.**

2. **The phase boundary is being rewritten.** The current phase boundary is a simple assignment (`state.phase = 1` in `conceptualizeBombe`). This plan splits it into three moving parts:
   - `conceptualizeBombe` → sets `flags.bombeConceptualized`, NOT `phase`.
   - `installationVictory` → trigger changed from `minPhase: 1` to `operations: ['conceptualizeBombe']`, effect unchanged.
   - `turingMemorandum` → becomes the new phase transition (sets `phase = 1`).
   
   A dumber model will likely touch one or two of these three and leave the system inconsistent (e.g., phase never advances, or advances twice, or `installationVictory` becomes unreachable). **Rule: make all three changes in the same edit session; test the DAG end-to-end on a fresh save before calling it done.**

3. **Overlay re-enablement must be guarded, not blanket.** Session 7's feedback was explicit: no confirmation overlays after ordinary initiatives. The guard `if (op.overlay && op.isPhaseTransition)` restores overlays only for the 3 dramatic beats in this plan. A dumber model may revert to `if (op.overlay)` (restoring everywhere) or forget the guard entirely (restoring nowhere). **Rule: the guard condition is exactly `op.overlay && op.isPhaseTransition` — neither looser nor tighter.**

4. **Reward budget discipline.** Every war event in §4.2 respects the reward budget in §3. Flat additions only (supply cap, data cap, percent-of-base tweaks). No multiplicative stacking on the `multipliers` object except `searchSpeed` at 1.05×–1.10× (deliberate small nudges). A dumber model will be tempted to "make rewards feel bigger" by reaching for `×1.5` on `dataPerDrop` or similar. **Rule: if you are tempted to write `state.multipliers.X *= 1.5` in a war event's effect, stop. The plan explicitly forbids it.**

5. **`minDate` date comparison must handle year rollover correctly.** The comparison in §4.1 is:
   ```
   d.year > t.minDate.year || (d.year === t.minDate.year && d.month >= t.minDate.month)
   ```
   This is correct and doesn't need day-granularity. A dumber model might simplify to `d.year >= t.minDate.year && d.month >= t.minDate.month`, which is **wrong** (e.g., January 1945 would fail a `minDate: { year: 1944, month: 7 }` because month 1 < 7). **Rule: use the exact comparison shown.**

6. **`conceptualizeBombe` still needs to be reachable on saves that haven't completed it.** After the rewrite, the op has `gates: { minBoffins: 5, minHuts: 2 }` — same as before. Its trigger is unchanged (`operations: ['rotorLogicMapping']`). Its cost is unchanged. Only the effect changed. A dumber model may accidentally delete the gates or the trigger during the rewrite. **Rule: when demoting the op, only the `effect`, `result`, `flavor`, `isPhaseTransition`, and `overlay` fields change. Everything else is preserved.**

7. **The existing `installationVictory` overlay must be removed** (§4.4). Its old overlay was a Phase 1 welcome. Now that `turingMemorandum` is the phase-transition beat, `installationVictory` is a post-transition mechanical step. Leaving the overlay on it would re-introduce the confirmation screens the user explicitly disliked in session 7.

8. **Do not add war events without a narrative beat.** The war track is character, not content. If you're inventing a "Battle of Somewhere Unlisted" or "Operation Unheardof," stop — every war event must be a real, verifiable WWII intelligence event. The events listed in §4.2 are curated; additions should cite a source, not a guess.

9. **The graph comment in `operations.js` is authoritative documentation.** After editing, re-read the whole comment block (lines ~1–74) to make sure it represents the new tree. The Phase 0 and Phase 1 subsections both need updating. **Rule: if the comment and the code disagree, the comment is the bug.**

10. **Feature interaction with plan 07.** Plan 07's `recruitMathematicians`, `messHallConstructed`, `wartimeRationing` are all `type: 'infrastructure'`. None of them are war events. Don't retag them. Plan 07 ships first; its ops are already in the tree when plan 08 lands.

11. **Feature interaction with plan 09.** Plan 09 caps the `operationCost` floor at 0.7. `operationMincemeat`'s effect uses `Math.max(0.7, ...)` in §4.2 — consistent with plan 09. If plan 08 ships before plan 09, this clamp is preemptively correct. A dumber model may "fix" this to `Math.max(0.1, ...)` to match the rest of the file. Don't — 0.7 is the new floor and §4.2 is ahead of that curve on purpose.

---

## 8. Verification

### Manual test — fresh save

1. Wipe save, reload. Start game.
2. First drop → war events `convoyEscortsRerouted` may *not* appear yet if `minDate: {year:1939, month:10}` isn't met. Verify date counter advances correctly at 10s/day. (Days 1939-08-15 → 1939-10-01 is ~47 in-game days = 470 real seconds = ~8 minutes. This is too slow in practice — see §3 for why date gating is AND-combined with drop gating, not standalone.)
3. Progress normally. Verify war events appear in the Initiatives list with the `WAR` tag and gold border.
4. Complete war events as data allows. Verify:
   - Each pushes its `result` to the event log.
   - `turingMemorandum`, `dDayIntelligence`, `veDay` each trigger the full-screen overlay.
   - Ordinary (non-transition) ops do not trigger overlays.
5. After `turingMemorandum`: verify `state.phase === 1`, `installationVictory` appears.
6. After `installationVictory`: verify the Hardware section renders (plan 07/s7 hardware div fix is already in).
7. After `veDay`: verify `state.phase === 2`, overlay displays. After dismissing, the initiatives list is empty (Phase 2 is not yet implemented) — this is expected and is a visible prompt that more content is coming.

### Manual test — migrated save from s7

1. Load a session-7 save that had `conceptualizeBombe` completed (phase = 1).
2. Verify `flags.bombeConceptualized` was set by the migration.
3. Verify `installationVictory` still appears in completed (it was).
4. Verify war events with `minDate` in the past appear immediately (e.g., if the save's in-game date is in 1943, `convoyEscortsRerouted` and `battleOfBritainIntel` should be in `available` if their other conditions are met).

### Static checks

- `grep -rn "state.phase = 1\|state.phase = 2" src/` → should return exactly two matches: `turingMemorandum.effect` and `veDay.effect`.
- `grep -rn "isPhaseTransition" src/data/operations.js` → should return exactly two matches.
- `grep -rn "op.overlay" src/systems/operations.js` → should return one match, guarded by `&& op.isPhaseTransition`.
- Every war event's `flavor` field begins with a real historical date. Verify against a WWII intelligence timeline (e.g., David Kahn's *The Codebreakers*, F.H. Hinsley's *British Intelligence in the Second World War*).
