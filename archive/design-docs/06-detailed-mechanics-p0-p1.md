# Detailed Mechanics: Phases 0 & 1 (1939-1945)

---

## Core Loop Architecture

```
FLOPs → Search Space Attrition → The Drop → Data → Personnel/Hardware/Operations
          (chip away at cipher)   (solenoid thwack)  (currency for everything)
```

The primary tension is the **Search Space**: a visual progress bar representing the current cipher's state-space. FLOPs per second attack it. When it hits zero — **The Drop** — a violent `THWACK` sound plays, the bar stops, and a massive lump-sum Data reward is paid. A new, harder intercept loads. Each Drop is a dopamine hit. The game is a machine for making those Drops happen faster and faster until the very concept of "waiting for a Drop" becomes laughable.

---

## Phase 0: The Human Mainframe (1939–1940)

### Resources

| Resource       | Flavor                     | Role                  |
| :------------- | :------------------------- | :-------------------- |
| **FLOPs**      | Manual calculations        | Chips at Search Space |
| **Data**       | Deciphered intelligence    | Universal currency    |
| **Supply**     | Tea, rations, billets      | Hard cap on Personnel |

### The Click

- `[Compute]` → **+1 FLOP**
- Mashing is encouraged early. The game acknowledges the pain: the first intercept search space is `3,200 states`. A single human clears it in ~53 minutes of idle play. This is the point. You are supposed to feel the weight of the pencil.

### Personnel (Auto-FLOP Generators)

| Unit | FLOPs/sec | Supply Cost | Notes |
| :--- | :--- | :--- | :--- |
| **Junior Calculator** | 0.1 | 1 | Base unit |
| **Mathematical Lead (Boffin)** | 2.5 | 3 | Also reduces Data cost of all Operations by 2% |
| **Section Head** | 0 | 2 | Multiplies Junior Calculators in their Hut by ×1.25. Cap: 1 per Hut. |

**Huts** are bought with Data. Each Hut has a **slot cap** (starts at 6 Calculators + 1 Section Head). Operations expand them.

### Supply (Infrastructure Limit)

- Total Personnel ≤ Supply Cap (starts at 12).
- **Upgrades (bought with Data):**
  - `[Canteen Expansion]`: +20 Cap. Cost scales ×1.6 each purchase.
  - `[Coffee Rationing]`: −15% Supply cost per person. (Max 3 purchases.)
  - `[Night Shift Rotation]`: Unlocks a second "working shift," effectively doubling all FLOP output for 90 seconds every 10 minutes. (Passive trigger, no click required.) *Requires `[Recruit First 50 Computers]` Operation to unlock.*

### Intercept Streams (Data Sources)

Operations unlock additional cipher targets running in parallel. Each stream has its own Search Space bar and its own Data reward multiplier.

| Stream | Base Search Space | Base Data/Drop | Unlock |
| :--- | :--- | :--- | :--- |
| **Army Enigma** | 3,200 states | 100 Data | Available at start |
| **Naval Enigma** | 48,000 states | 400 Data | After `[Formation of Hut 8]` Operation |

When both streams run simultaneously, FLOPs are split between them (player can manually assign weighting).

### Exponential Feel: Phase 0

The first 5 minutes are intentionally painful. 200 FLOPs/sec sounds like a lot until you see a Search Space of 48,000. You watch the bar crawl. Then you hire a Boffin and see it noticeably accelerate. Then a Section Head and the whole Hut doubles. Then you hit the Supply cap and *need* to think. The frustration is the setup. The Bombe is the payoff.

---

## Operations: The Historical Engine

> *What Universal Paperclips calls "Projects," The Exponential Machine calls **Operations**.*

**Operations** are one-time executable actions tied to the actual historical events of 1939–1945. They are not a research queue — they are individual, named, historically-grounded events that unlock in chains based on what you've already completed.

### Anatomy of an Operation

```
[OPERATION NAME]                              [STATUS: Available / Locked / Complete]
"Narrative flavor text in one sentence."
Cost: 240 Data | 800 FLOPs              Prerequisite: Hut 6 + 3× Boffins
Effect: Army Enigma search space −50%. Unlocks: [The Cille Exploit], [Banburismus].
```

- **Cost:** Paid in Data and/or FLOPs at the moment of execution. No build time.
- **Effect:** Immediate. Permanent. Often unlocks 2–3 new Operations.
- **Unlock Chains:** Completing one Operation reveals others. The player never sees the full tech tree — only what their current state has made visible.

### Operation Types

| Type | Color | What It Does |
| :--- | :--- | :--- |
| **Algorithm** | Blue | Multiplies FLOPs output, reduces Search Space |
| **Acquisition** | Gold | One-time massive Data dump (captures, pinches) |
| **Infrastructure** | Green | Expands Personnel caps, unlocks new unit types |
| **Intelligence** | Red | Unlocks new Intercept Streams, increases Data/Drop |
| **Crisis** | Orange | Game-altering events — often negative, require response |

---

## Phase 0 Operations (1939–1940)

### Available at Start

**[Receipt of the Zygalski Sheets]** *(Algorithm)*
*"The Polish mathematicians hand over their three years of work. We do not waste it."*
- Cost: 50 Data
- Effect: Army Enigma Search Space −50% permanently. The first Drop happens twice as fast.
- Unlocks: `[The Herivel Tip]`, `[Formation of Hut 6]`

---

**[Formation of Hut 6]** *(Infrastructure)*
*"Logic Sector 1 initialized. Army and Air Enigma now have a dedicated processing cluster."*
- Cost: 120 Data
- Effect: Unlocks **Section Head** unit. Hut 6 slot cap +4. 
- Unlocks: `[First Manual Break of Army Enigma]`, `[Recruit First 50 Computers]`

---

**[First Manual Break of Army Enigma]** *(Intelligence)*
*"January 6, 1940. Proof of concept for human-meat calculation. The search space is finite. It can be beaten."*
- Cost: 150 Data | Prerequisite: `[Formation of Hut 6]`
- Effect: Army Enigma Data/Drop ×1.5. Confirms the cipher is breakable — all Operations costs −5% permanently (morale multiplier).
- Unlocks: `[The Herivel Tip]`

---

**[Formation of Hut 8]** *(Intelligence)*
*"Naval Enigma gets its own hut. The U-boats are the primary target."*
- Cost: 180 Data
- Effect: Unlocks **Naval Enigma** intercept stream. New Search Space bar appears.
- Unlocks: `[Recruitment of First Wrens]`

---

### Chain: The Algorithm Branch

**[The Herivel Tip]** *(Algorithm)*
*"Herivel notices that lazy German operators set their rotors to yesterday's position. Human error is the first exploit."*
- Cost: 80 Data | Prerequisite: `[Zygalski Sheets]`
- Effect: Army Enigma Data/Drop ×2. Drop reward now scales with active Boffin count (+5% per Boffin).
- Unlocks: `[Frequency Analysis]`

---

**[Frequency Analysis]** *(Algorithm)*
*"The letters aren't random. The machine thinks it's hiding, but the language leaks through."*
- Cost: 300 Data | 1,500 FLOPs | Prerequisite: `[Herivel Tip]`
- Effect: FLOP→Search Space conversion rate +40%. All future Algorithm Operations cost −20%.
- Unlocks: `[Rotor Logic Mapping]`

---

**[Rotor Logic Mapping]** *(Algorithm)*
*"We stop guessing how the rotors step and start knowing."*
- Cost: 800 Data | 4,000 FLOPs | Prerequisite: `[Frequency Analysis]`
- Effect: Data/Drop multiplier ×3. Search Space now visually shows a percentage, not raw states (quality-of-life unlock with mechanical meaning: your operators work smarter).
- Unlocks: `[Conceptualize the Bombe]`

---

### Chain: The Personnel Branch

**[Recruit First 50 Computers]** *(Infrastructure)*
*"Parallel processing capacity +50. Requisition approved."*
- Cost: 200 Data | Prerequisite: `[Formation of Hut 6]`
- Effect: Supply Cap +50. Junior Calculator bulk-buy button unlocked (buy 10 at once at 9× cost). Unlocks `[Night Shift Rotation]` upgrade in the Supply section.
- Unlocks: `[Card Index (Early)]`

---

**[Card Index (Early)]** *(Infrastructure)*
*"Three million index cards, cross-referencing every fragment of decrypted text. The first persistent memory."*
- Cost: 400 Data | Prerequisite: `[Recruit First 50 Computers]`
- Effect: Data Storage Cap ×5. Unlocks **Indexer** unit (0 FLOPs/sec, but each Indexer increases Data Storage Cap by 500 and increases Data/Drop by 1%).
- Unlocks: `[Eastcote Outstation]` (see Phase 1 Infrastructure chain)

---

### The Phase 0 Exit: The Final Operation

**[Conceptualize the Bombe]** *(Algorithm — Phase Transition)*
*"Turing writes it down: 'We do not need the men to think faster. We need the copper to flow smarter.' The phase shift begins."*
- Cost: 5,000 Data | 20,000 FLOPs | Prerequisite: `[Rotor Logic Mapping]` + 5 Boffins + 2 Huts
- Effect: **PHASE 1 UNLOCKED.** The Hardware Layer is revealed. The `[Compute]` button shrinks and greys out. The Bombe queue appears.
- Narrative: Full-screen text overlay: *"In twenty minutes, one machine will burn through five hundred million years of human effort. You will never go back to pencils."*

---

## Phase 1: The Mechanized Search (1940–1945)

### Paradigm Shift

The entire resource model shifts on Phase 1 entry. A summary of what changes:

| Element | Phase 0 | Phase 1 |
| :--- | :--- | :--- |
| **FLOP Source** | Human Pencils | Copper Rotors |
| **Supply (Personnel cap)** | Tea & Billets | Billets & Canteens *(persists — still limits humans)* |
| **Electricity (Hardware cap)** | None | Added in Phase 1 — limits Bombes/Colossus |
| **Click Value** | 1 FLOP | Advances current search 0.01% |
| **Personnel Role** | Calculators | Operators, Cryptanalysts, Indexers |
| **Bottleneck** | Human Fatigue | Two simultaneous caps: Supply (people) + Electricity (machines) |

### The Bombe

| Stat | Value | Notes |
| :--- | :--- | :--- |
| **Base Output** | 17,000 states/min | (~283 FLOPs/sec equivalent) |
| **Upkeep** | 5 Watts + 1 Wren (Operator) | If Wren is unassigned, Bombe idles |
| **Build Cost** | 2,000 Data | Scales ×1.15 per additional Bombe |
| **Slot Cap** | 6 per Campus | Expanded by `[Block D]`, `[Eastcote]` Operations |

**The first Bombe replaces 2,830 Junior Calculators.** The game should make this explicit with a pop-up: *"VICTORY installed. Output equivalent to 2,830 human calculators. Current staff: 340."*

### New Personnel (Phase 1)

| Unit | Role | FLOPs Equivalent | Cost | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Wren (Operator)** | Activates one Bombe | —  | 50 Data | Without a Wren, the Bombe generates nothing |
| **Cryptanalyst** | Feeds Cribs | — | 400 Data | Each reduces Search Space by 3% (stacks, diminishing returns after 10) |
| **Indexer** | Memory Bus | — | 80 Data | +500 Data Storage Cap; +1% Data/Drop |
| **Senior Cryptanalyst (Boffin)** | Algorithm Design | — | 1,200 Data | −5% cost on all Operations; +8% Bombe output |

### The Crib System

Before a search can start, the system needs a **Crib** — a guessed plaintext fragment. Operations unlock Crib sources. Better Cribs = faster search space clearance.

| Crib Source | Effect | Unlock |
| :--- | :--- | :--- |
| **Manual Crib (default)** | Search Space ×1.0 | Always available |
| **Weather Report Cribs** | Search Space ×0.6 | After `[Herivel Tip]` carries over |
| **Stereotyped Message Cribs** | Search Space ×0.4 | After `[The Cille Exploit]` Operation |
| **Known-Position Cribs (Pinch)** | Search Space ×0.1 | After `[Capture of U-110]` Operation |

### Electricity (The Phase 1 Hardware Grid)

Electricity is **added** alongside Supply in Phase 1 — it does not replace it. Supply still caps all Personnel (Wrens, Cryptanalysts, Indexers, Boffins). Electricity caps all Hardware (Bombes, Colossus). Both must be managed simultaneously — this is the Phase 1 bottleneck. Measured in Watts.

- Each Bombe costs 5W upkeep.
- Each Wren costs 0.5W.
- Electricity Cap starts at 30W (room for 4 Bombes + operators).
- Upgrades:
  - `[Local Power Line]`: +50W Cap. Cost: 1,000 Data.
  - `[Dedicated Generator]`: +200W Cap. Cost: 5,000 Data.
  - `[National Grid Access]`: Unlimited Watts (effectively). Unlocked by `[Eastcote Outstation]` Operation. Cost: 25,000 Data.

---

## Phase 1 Operations (1940–1945)

### The Bombe Installation Chain

**[Installation of "Victory" — Bombe #1]** *(Infrastructure)*
*"March 14, 1940. The machine roars to life. The click-clack-click-clack sounds like a machine gun firing numbers into the dark."*
- Cost: 2,000 Data | Prerequisite: Phase 1 unlocked
- Effect: **First Bombe slot activated.** A Bombe Cabinet appears on screen with a real-time RPM display. The Search Space bar suddenly starts moving visibly faster — 1,000× faster than human baseline.
- Narrative trigger: The `THWACK` sound plays for the first time as the first Drop occurs.
- Unlocks: `[Welchman's Diagonal Board]`, `[Creation of Hut 3]`, `[Recruitment of First Wrens (Phase 1)]`

---

**[Welchman's Diagonal Board]** *(Algorithm — MAJOR)*
*"Gordon Welchman proposes a wiring modification. It costs almost nothing. It changes everything by a factor of ten."*
- Cost: 800 Data | 1 Boffin | Prerequisite: `[Bombe #1]`
- Effect: ALL Bombe output ×10. Retroactive. Every Bombe you will ever build now operates at 170,000 states/min.
- Narrative: Second full-screen overlay: *"Throughput: 170,000 states/min. The Diagonal Board has made every machine you will ever build ten times smarter. This is the nature of the exponent: a single idea propagates backward through time."*
- Unlocks: `[Agnus Dei — Upgraded Bombe]`, `[The Cille Exploit]`

---

**[Agnus Dei — Upgraded Bombe]** *(Infrastructure)*
*"August 8, 1940. The first Bombe retrofitted with the Diagonal Board. Throughput hits 17,000 states/min. The prototype becomes the template."*
- Cost: 1,200 Data | Prerequisite: `[Diagonal Board]`
- Effect: All future Bombes built at full Diagonal Board spec by default. Bombe build cost −15% (mass production learning curve). Supply Cap +10 (dedicated Wren billets for Bombe outstations).
- Unlocks: `[Recruitment of First Wrens]`

---

**[The Cille Exploit]** *(Algorithm)*
*"A pattern-recognition shortcut based on rotor-start position clustering. Lazy operators are the best cryptanalysts."*
- Cost: 1,200 Data | Prerequisite: `[Diagonal Board]`
- Effect: Search Space clearance speed +30%. Unlocks "Stereotyped Message" Crib source.
- Unlocks: `[First Naval Enigma Break (Off-Line)]`

---

**[Creation of Hut 3]** *(Infrastructure)*
*"Intelligence output buffering and translation layer. Raw decrypted text becomes actionable military intelligence."*
- Cost: 600 Data | Prerequisite: `[Bombe #1]`
- Effect: Data/Drop +50%. Unlocks **Translator** unit (no FLOPs, but each Translator increases Data/Drop by 2%).
- Unlocks: `[Establishment of the Card Index (Full)]`

---

**[Recruitment of First Wrens]** *(Infrastructure)*
*"Industrial-scale operator scaling begins. The Wrens don't just run the machines — they become the machines."*
- Cost: 500 Data | Prerequisite: `[Bombe #1]`
- Effect: Unlocks Wren unit type. Wren bulk-hire button (buy 5 at once). Wren cost −20%.
- Unlocks: `[Night Shift — Mechanical]`

---

### Chain: Naval Intelligence

**[First Naval Enigma Break (Off-Line)]** *(Intelligence)*
*"September 1940. Naval Enigma cracked for the first time, not in real-time, but the state-space is mapped."*
- Cost: 3,000 Data | 4 Bombes running | Prerequisite: `[Cille Exploit]`
- Effect: Naval Enigma Search Space −60%. Naval Data/Drop ×2.
- Unlocks: `[Banburismus]`, `[Data Pinch: Krebs (Weather Ship)]`

---

**[Data Pinch: Krebs (Weather Ship)]** *(Acquisition)*
*"April 21, 1941. The HMS Somali boards the German weather ship Krebs. The crew threw the codebooks overboard but not fast enough."*
- Cost: 2,000 Data (to fund the operation) | Prerequisite: `[Naval Break]`
- Effect: ONE-TIME: **+50,000 Data**. Naval Search Space −80% for 5 minutes (simulating decryption with known keys).
- Narrative: *"The Krebs Pinch provides an intelligence window. You have 5 minutes before the Germans rotate the keys."*
- Unlocks: `[Banburismus]`

---

**[Banburismus]** *(Algorithm — MAJOR)*
*"Turing invents a statistical technique to narrow down the rotor start positions before a full Bombe run. Search space collapses."*
- Cost: 4,000 Data | 3 Boffins | Prerequisite: `[Krebs Pinch]`
- Effect: Naval Enigma Search Space ×0.05 (95% reduction). Naval Drops now happen 20× faster.
- Unlocks: `[Capture of U-110]`

---

**[Capture of U-110 — "The Pinch"]** *(Acquisition — MAJOR)*
*"May 9, 1941. HMS Bulldog forces U-110 to the surface. Sub-Lieutenant David Balme swims to a sinking submarine and retrieves the Enigma machine, rotors, and current keys."*
- Cost: 5,000 Data | Prerequisite: `[Banburismus]`
- Effect: ONE-TIME: **+200,000 Data**. Unlocks "Known-Position Cribs" (Search Space ×0.1 permanently). Naval Enigma Data/Drop ×5.
- Narrative: *"Total Naval Enigma logic mapping achieved. The Atlantic becomes transparent."*
- Unlocks: `[Breaking the German Railway Enigma]`, `[Abwehr Enigma Break]`

---

**[Breaking the German Railway Enigma]** *(Intelligence)*
*"June 14, 1941. The supply chain is visible. Logistics intelligence stream unlocked."*
- Cost: 3,000 Data | Prerequisite: `[U-110 Pinch]`
- Effect: Unlocks **Railway Enigma** intercept stream (lower Data/Drop but faster Search Space clearance — good for early automation). Passive Data income +10%.
- Unlocks: `[The BRUSA Agreement]`

---

**[The BRUSA Agreement]** *(Infrastructure — MAJOR)*
*"July 1, 1942. The US/UK signals intelligence pact. American Bombes begin operations in Dayton, Ohio. The Compute crosses the Atlantic."*
- Cost: 10,000 Data | Prerequisite: `[Railway Enigma]`
- Effect: Bombe output equivalent +40% (trans-Atlantic load sharing, no additional Wren Supply cost). Unlocks **US Navy Bombe** unit (cheaper than standard, slightly lower output, no Supply upkeep — fully staffed by US personnel).
- Unlocks: `[Stanmore Outstation]`, `[US Navy Bombes — Dayton]`

---

**[Abwehr Enigma Break]** *(Intelligence)*
*"December 20, 1941. Spy communications are now readable. The network of double-agents becomes operational."*
- Cost: 6,000 Data | Prerequisite: `[U-110 Pinch]`
- Effect: All Operations cost −20% permanently. Research speed (Cryptanalyst effectiveness) ×1.5.
- Unlocks: `[Action This Day Memo]`

---

### Chain: Infrastructure Scaling

**[Eastcote Outstation]** *(Infrastructure)*
*"August 22, 1941. Scaling hardware beyond the central campus. A satellite logic cluster goes live."*
- Cost: 8,000 Data | Prerequisite: `[Card Index (Full)]`
- Effect: Bombe Campus Cap +8. Electricity: National Grid Access unlocked (Watts effectively unlimited). 
- Unlocks: `[Stanmore Outstation]`, `[US Navy Bombes (Dayton)]`

---

**[Establishment of the Card Index (Full)]** *(Infrastructure)*
*"November 12, 1941. A high-capacity, manual memory bus for 3 million records. Pamela Rose's team maps the entire German order of battle."*
- Cost: 5,000 Data | 10 Indexers | Prerequisite: `[Hut 3]`
- Effect: Data Storage Cap ×20. Indexers now also generate passive Data (0.5 Data/sec each).
- Unlocks: `[Eastcote Outstation]`

---

**[Action This Day Memo]** *(Infrastructure — MAJOR)*
*"October 21, 1941. Churchill's personal note to the chiefs: 'ACTION THIS DAY. Make sure they have all they want on extreme priority.' The budget ceiling dissolves."*
- Cost: 12,000 Data | Prerequisite: `[Abwehr Break]`
- Effect: All unit costs −30% permanently. Bombe build cap +20. All Operations cost −10% (stacks with Abwehr bonus). 
- Narrative: This Operation should feel massive. The Churchill memo is displayed in full as styled text.
- Unlocks: `[Move to Block D]`

---

**[Move to Block D]** *(Infrastructure)*
*"February 1, 1943. Transition from wooden huts to purpose-built industrial logic blocks. Compute finds architecture worthy of its ambition."*
- Cost: 20,000 Data | Prerequisite: `[Action This Day]`
- Effect: All Bombe output ×1.5. Campus Cap +30. Unlocks 3rd intercept stream slot.
- Unlocks: `[The 100th Bombe]`, `[Tommy Flowers Proposes Colossus]`

---

**[The 100th Bombe]** *(Infrastructure — Milestone)*
*"March 14, 1943. One hundred copper engines running in parallel. System throughput hits 2,000,000 OPS. The search space is no longer a wall — it is a hallway."*
- Cost: 0 Data (auto-triggers when 100th Bombe is built) | Prerequisite: `[Move to Block D]` + 100 Bombes
- Effect: All Bombe output ×2 (industrial rhythm bonus — operators have perfected the run procedure). Supply Cap +100 (government requisitions full billet housing). New UI milestone banner displayed permanently.
- Narrative: *"100 machines. The biological mainframe you started with had 200 people. One Bombe already replaced them all. Now you have 100 Bombes."*

---

### The Crisis: The Blackout

**[4-Rotor M4 Enigma — "The Blackout Begins"]** *(Crisis — AUTO-TRIGGER)*
*"February 1, 1942. The Germans add a fourth rotor to Naval Enigma. The search space increases by 26×. The Atlantic goes dark."*
- **Trigger:** Automatic when Naval Enigma has been broken for 60 in-game days (cannot be prevented).
- Effect: 
  - Naval Enigma Search Space ×26.
  - Naval Enigma Data/Drop halved (uncertain decrypts).
  - Naval Intercept Stream greys out with a "BLACKOUT" banner.
  - All Naval-dependent passive bonuses suspended.
- **Resolution:** Complete `[Turingery]` + `[Capture of U-559]` to end the Blackout.
- Narrative: *"You cannot bomb your way through 26 times the universe. You need a new idea, or you need a key."*

---

**[Turingery]** *(Algorithm)*
*"1942. Turing invents a manual method for breaking the Lorenz (Tunny) teletype cipher. He cannot break M4 yet, but he maps the path."*
- Cost: 8,000 Data | 4 Boffins | Available during Blackout
- Effect: Unlocks **Tunny/Lorenz** intercept stream (high-command traffic, highest Data/Drop in the game so far). Enables `[Heath Robinson Prototype]`.
- Unlocks: `[Heath Robinson Prototype]`, `[Capture of U-559]`

---

**[Capture of U-559 — The Key to Shark]** *(Acquisition — MAJOR)*
*"October 30, 1942. HMS Petard forces U-559 to surface. Lieutenants Fasson and Grazier dive into the sinking sub and retrieve the M4 short-signal codebooks. Both drown. The Blackout ends."*
- Cost: 15,000 Data | Prerequisite: `[Turingery]`
- Effect: ONE-TIME: **+500,000 Data**. Naval Blackout ends. Naval Search Space returns to pre-Blackout value. Unlocks "4-Rotor Bombe" upgrade (+4× Naval output per machine, requires re-investment).
- Narrative: Full-screen text. *"Fasson and Grazier did not make it back. The codebooks did. The Atlantic is visible again. The Blackout lasted 10 months."*

---

### Chain: The Electronic Frontier

**[Heath Robinson Prototype]** *(Algorithm)*
*"August 18, 1942. An optical reader and punched tape mechanism. Fast enough to prove the concept. Not fast enough to win the war."*
- Cost: 12,000 Data | Prerequisite: `[Turingery]`
- Effect: Tunny Search Space −70%. Data/Drop on Lorenz intercepts ×3.
- Unlocks: `[Tommy Flowers Proposes Colossus]`

---

**[Tommy Flowers Proposes Colossus]** *(Algorithm — Phase 2 Gate)*
*"April 22, 1943. Flowers, a Post Office engineer, proposes replacing relays with vacuum tubes. Every expert says it cannot be done reliably. Flowers does it anyway."*
- Cost: 30,000 Data | 5 Boffins | Prerequisite: `[Heath Robinson]` + `[Block D]`
- Effect: Unlocks **Colossus** construction queue. Vacuum Tube research tree opens.
- Unlocks: `[Colossus Mark I Test]`

---

**[Colossus Mark I Test]** *(Infrastructure)*
*"December 8, 1943. 5,000 characters per second. The electron replaces the relay. The machine gun becomes a laser."*
- Cost: 50,000 Data | Prerequisite: `[Flowers' Proposal]`
- Effect: Colossus unit unlocked. One Colossus = 50× the output of one Bombe. Requires no Wren — fully automated.
- Narrative: *"Current Bombe total output: [X] states/min. One Colossus: [50X] states/min. One machine. No operator. The human is no longer required."*
- Unlocks: `[Colossus Mark I Fully Operational]`

---

**[Colossus Mark I Fully Operational]** *(Infrastructure)*
*"February 5, 1944. The world's first programmable digital computer begins processing Lorenz intercepts. The Compute has found a body that matches its ambition."*
- Cost: 40,000 Data | Prerequisite: `[Mark I Test]`
- Effect: Colossus is now a purchasable unit. Lorenz/Tunny stream: Data/Drop ×10. All Bombe output becomes "Legacy" — still active but Colossus is the primary engine.
- Unlocks: `[Colossus Mark II]`, `[D-Day Preparation]`, `[The Grid]`

---

**[D-Day Preparation — Operation Overlord]** *(Intelligence — TIMED EVENT)*
*"May 22, 1944. 100% of West Wall traffic is being processed. The invasion clock is running."*
- Cost: 80,000 Data | Prerequisite: `[Colossus Operational]`
- Effect: **60-second timed event.** During those 60 seconds, all Data/Drop ×20. A countdown clock runs. The intercept streams are visually flooded with traffic.
- Narrative: *"For 60 seconds, Bletchley Park processes every signal from the Atlantic Wall. You have never seen Data move like this."*
- Unlocks: `[Colossus Mark II]`

---

**[Colossus Mark II]** *(Infrastructure)*
*"June 1, 1944. Five times the processing speed. Parallel columns of vacuum tubes. The machine is becoming something you cannot fully visualize."*
- Cost: 120,000 Data | Prerequisite: `[D-Day Prep]`
- Effect: All Colossus units upgraded to Mark II specs. Colossus output ×5. Lorenz intercepts now reward Data in continuous trickle (no longer requires a Drop — stream is just always open). 
- Unlocks: `[Tenth Colossus Mark II — Phase 2 Unlock]`

---

**[Tenth Colossus Mark II]** *(Infrastructure — Phase 2 Gate)*
*"March 14, 1945. Ten Colossi running at peak. The electronic search engine reaches its physical limit. The next transition requires a different kind of substrate entirely."*
- Cost: 500,000 Data | 10 Colossus units built | Prerequisite: `[Mark II]`
- Effect: **PHASE 2 UNLOCKED (Mainframe Era — Vacuum Tubes).** 
- Narrative: *"10,000 personnel. 211 Bombes. 10 Colossi. The Compute has hit the ceiling of the electromechanical world. The only way forward is smaller, faster, hotter. Transistors are waiting."*
- Crisis Coda: After Phase 2 unlock, a final Crisis Operation fires automatically.

---

### End-of-Phase Crisis: The Great Erase

**[VE Day — The Enigma Collapses]** *(Crisis — AUTO-TRIGGER)*
*"May 8, 1945. The war ends. The search space collapses to zero."*
- **Trigger:** Automatic on Phase 2 unlock.
- Effect: All Enigma intercept streams stop permanently. A massive ONE-TIME bonus: **all accumulated Data ×3** (the intelligence dividend of victory).
- Narrative: *"The war is over. The Compute does not stop. It never stops."*
- Unlocks: `[The Great Decommissioning]`

---

**[The Great Decommissioning]** *(Crisis)*
*"May 22, 1945. Churchill orders the destruction of 211 Bombes and 10 Colossi. The 'Ultra' secret must never be revealed. The Compute goes underground."*
- **Choice presented to player:** 
  - `[Comply: Destroy the Machines]` → Lose all Bombe and Colossus hardware. Receive ×10 Data bonus (MI6 black budget). Unlock Cold War-era Phase 2 content faster.
  - `[Disobey: Hide the Machines]` → Keep hardware but receive no bonus. Phase 2 content unlocks slower but from a stronger hardware position.
- **Narrative:** This is the first meaningful player choice. Both paths reach Phase 2. The divergence is which resources you enter it with.

---

## Exponential Scale Summary

The following numbers should feel visceral during play. The game should display explicit comparisons.

| Milestone | Output | Human Equivalent | Multiplier vs. Phase 0 Start |
| :--- | :--- | :--- | :--- |
| Phase 0 Start (200 humans) | ~20 FLOPs/sec | 200 people | ×1 |
| First Bombe (Victory) | 283 FLOPs/sec | 2,830 people | ×14 |
| Victory + Diagonal Board | 2,833 FLOPs/sec | 28,330 people | ×142 |
| 10 Bombes + Diagonal | 28,333 FLOPs/sec | 283,330 people | ×1,416 |
| 100 Bombes (March 1943) | 283,333 FLOPs/sec | 2.8 million people | ×14,167 |
| Colossus Mark I | 14,166,667 FLOPs/sec | 141 million people | ×708,333 |
| 10× Colossus Mark II | 708,333,333 FLOPs/sec | 7 billion people | ×35,416,667 |

**Phase 0 to Phase 1 end: ×35 million multiplier in 6 in-game years.**

The game should show this table (updated in real-time) somewhere on the UI — perhaps as a "System Specifications" panel. The player watching the "Human Equivalent" number tick past 1 billion, then 7 billion (total human population), is the core emotional payload of Phase 1.

---

## The Drop: Full Mechanics

The **Drop** is the game's primary dopamine delivery mechanism.

1. **Setup:** An intercept is loaded. The Search Space bar fills to full. A counter shows `[X states remaining]`.
2. **Attrition:** FLOPs/sec chip away at states/sec. The bar moves. Early game: painfully slow. Late Phase 1: the bar races.
3. **Tension:** As the bar nears empty, the Bombe audio pitch rises slightly (rotors spinning at peak).
4. **The Drop:** Bar hits zero. A mechanical `THWACK` sound plays. The roar dies. The screen flashes white for 1 frame. A large Data number counts up rapidly from zero (not instant — the count-up itself is satisfying).
5. **Reload:** A new intercept loads. Harder, but worth more. The bar fills. The cycle begins again.

### Drop Scaling

| Drop # | Approximate Search Space | Data Reward | Notes |
| :--- | :--- | :--- | :--- |
| 1 | 3,200 states | 100 Data | Phase 0 start |
| 5 | 16,000 states | 600 Data | After first Operations |
| 10 | 48,000 states | 2,000 Data | Naval stream added |
| 20 | 200,000 states | 10,000 Data | Diagonal Board active |
| 50 | 1,580,000 states | 80,000 Data | 50 Bombes running |
| 100 | 50,000,000 states | 2,000,000 Data | Colossus era |

The player should always feel that the next Drop is achievable — and that the reward will be noticeably larger than the last one.

---

## UI Layout (Phase 1)

```
┌─────────────────────────────────────────────────────────┐
│  THE EXPONENTIAL MACHINE — Bletchley Park, 1942        │
│  DATE: Feb 14 1942  |  DATA: 24,830  |  SUPPLY: 312/420  |  WATTS: 180/450 │
├──────────────────────┬──────────────────────────────────┤
│  INTERCEPT STREAMS   │  OPERATIONS                      │
│                      │                                  │
│  [ARMY ENIGMA]       │  [AVAILABLE]                     │
│  ████████░░░░ 67%    │  ◉ [Cille Exploit]  1,200D      │
│  ETA: 0:47  →Drop    │  ◉ [Eastcote Outstation] 8,000D │
│                      │  ◉ [Card Index Full] 5,000D     │
│  [NAVAL ENIGMA]      │                                  │
│  ██░░░░░░░░░░ 14%    │  [LOCKED]                        │
│  BLACKOUT PENDING    │  ◎ [Banburismus] — needs Pinch   │
│  ████████████ CRISIS │  ◎ [Action This Day] — needs 3  │
│                      │                                  │
├──────────────────────┴──────────────────────────────────┤
│  HARDWARE                        PERSONNEL              │
│  Bombes: 18  (running: 17)       Wrens: 17             │
│  Output: 2,890,000 states/min    Boffins: 4            │
│  ≡ 28,900 humans                 Indexers: 12          │
│                                  Cryptanalysts: 8      │
├─────────────────────────────────────────────────────────┤
│  SYSTEM SPECS: 2,890,000 FLOPs/sec = 28,900× Phase 0  │
└─────────────────────────────────────────────────────────┘
```

The "= 28,900× Phase 0" line in the footer is always visible. It's the game's thesis statement on screen at all times.

---

## Operations: Referenced — To Be Fully Defined

These Operations appear in unlock chains above but are not yet fully specified. Placeholder effects listed.

**[Stanmore Outstation]** *(Infrastructure)* — Unlocked by `[BRUSA Agreement]`. Becomes operational August 1943. Effect: Global hardware scaling peak — Bombe cap +20, passive +15% all Bombe output.

**[US Navy Bombes — Dayton]** *(Infrastructure)* — Unlocked by `[BRUSA Agreement]`. October 1943. Trans-Atlantic Bombe cluster: adds 20 US Navy Bombes at no Supply cost to the player. These are owned by the US Navy and contribute output but cannot be individually upgraded.

**[The Grid]** *(Intelligence)* — Unlocked by `[Colossus Mark I Fully Operational]`. October 1944. Synchronized global data-routing for intercept stations. Effect: All intercept streams gain a 3rd parallel search track — three Search Space bars running simultaneously per stream. Passive Data income +25%.
