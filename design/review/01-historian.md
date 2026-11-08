# Review 01: Historian (dated lines, facts, ledger order, tone)

Scope: every dated line in `src/data/stage1.js` and `src/data/stage2.js` (upgrades, beats, customers, goal, finale,
ending, handover). I checked doubtful facts on the web; sources are at the end.

Overall the writing is strong and mostly accurate: dates, numbers and quotes are right (Pyry, 158 million million million,
Victory, the diagonal board, Banburismus, U-559, Heath Robinson, Colossus Mk 2 on 1 June 1944, ENIAC, the Moore School
Lectures' 28 students, the moth at 15:45, the Baby's 52 minutes, EDSAC, the 1950 forecast, UNIVAC and the census, the 1952
election, Turing at 41, FORTRAN, Kilby's summer, CTSS, System/360, the 4004's 2,300 transistors). No exclamation marks
anywhere. The fixes below are small.

## How I checked ledger order
The engine stamps each entry with `max(its own date, current ledger date)` (`src/engine.js:409–412`). So the ledger
never goes back, but a line shown *after* a later-dated line is stamped with the wrong month. The sim's "ledger never
goes back" check cannot catch this. I ran a copy of the simulator (all 6 profiles × 2 choices) that flags every entry
shown with a later date than its own. Normal-play results are findings 1–6. Greedy play restamps many late cards with
1944-02 / 1966-08 (cards bought after the goal). That is expected and fine.

---

## Findings (most important first)

### 1. Flowers' valve proposal is dated after Heath Robinson, so the Heath Robinson line always shows the wrong month. Severity: bug (date order) and a fact error
`src/data/stage1.js:191`. `colossusRumour` is dated 1943-11 and fires 15 s after "American machines". In 10 of 12 runs it
comes before "Tape-reading machine" (1943-06), which is then stamped **1943-11**. In history, Flowers proposed the
all-valve machine in **February 1943**, before Heath Robinson was delivered (June 1943).
Fix: `date: '1943-11'` → `date: '1943-03'`. That keeps it after American machines (1943-03) and before Heath Robinson.

### 2. "Punched sheets" is always shown as 1940-02. Severity: inconsistency (date order)
`src/data/stage1.js:177`. The `chairs` beat (1940-02) fires at 10 clerks, which is the same condition that reveals
"Punched sheets" (1940-01). The card is always bought later, so it is stamped 1940-02 in 24 of 24 runs.
Fix: chairs `date: '1940-02'` → `date: '1940-01'`.

### 3. "Shared card index" is always shown as 1942-02 or 1942-03. Severity: inconsistency (date order)
`src/data/stage1.js:123`. The "dark", "late" and "faster" beats (1942-02/03) fire 15–46 s after the Churchill letter,
before the card can be bought. The index has no fixed historical date.
Fix: `date: '1942-01'` → `date: '1942-03'`.

### 4. The "pencil" beat is shown as 1940-05 in 16 of 24 runs. Severity: inconsistency (date order)
`src/data/stage1.js:179`. Herivel (1940-05, 30 s after the blueprint) usually fires before the first machine is built.
Fix: pencil `date: '1940-04'` → `date: '1940-05'`. Herivel's own date (May 1940, when the tip first worked) is correct.

### 5. Kennedy's speech is shown as 1961-11 or 1961-12. Severity: bug (a famous date shown wrong)
`src/data/stage2.js:235`. The speech fires 20 s after "Chips". Time-sharing (1961-11) is revealed by Chips and is often
bought within 20 s, so in several runs the speech is stamped November or December 1961. The speech was 25 May 1961.
Fix: `when: { after: 'chips', delay: 20 }` → `when: { after: 'chips', delay: 8 }`.

### 6. "Six women" and "First job" are shown as 1946-03 in 7 of 12 runs. Severity: polish (date order)
`src/data/stage2.js:211`. `firstComputer` (1946-03) often fires before the 10th click.
Fix: firstComputer `date: '1946-03'` → `date: '1946-02'` ("Hire programmers" at 1946-03 still follows it).

### 7. Katherine Johnson is not named, though the men around her are. Severity: inconsistency (respect for real people)
`src/data/stage2.js:238`. Turing, Herivel, Welchman, Flowers, Shannon, Kilby, Noyce, Moore and Glenn are all named.
The one woman who checks Glenn's orbit is "one woman", and this comes right after the "six women" line, which criticises
exactly this.
Fix: `'John Glenn will not fly until Katherine Johnson checks the machine\'s sums by hand. She does. He flies.'`

### 8. The ENIAC women did not teach ENIAC its "first problem". Severity: fact error, and the tense is mixed
`src/data/stage2.js:210`. ENIAC's first problem was the Los Alamos calculation (10 December 1945). The six women set up
the trajectory demonstration for the February 1946 unveiling. The line also mixes tenses ("taught" … "honours").
Fix: `'In Philadelphia, six women set up ENIAC\'s public demonstration by hand. The dinner that night honours the men who built it.'`

### 9. "Sputnik is still beeping overhead" in February 1958 is false. Severity: fact error
`src/data/stage2.js:148`. Sputnik 1's batteries died on 26 October 1957, and it fell on 4 January 1958. NASA did not exist
until July 1958, so "two new agencies" overstates things too.
Fix: `'Since Sputnik, Washington is spending. Two letters arrive in the same month, one about defence, one about space. Both offer money. You answer one first.'`

### 10. The 1202 alarm was about six minutes from landing, not three. Severity: fact error
`src/data/stage2.js:252`. The first 1202 alarm came at 20:11 GMT (landing 20:17), at about 33,000 ft.
Fix: `'Three minutes from the surface'` → `'Six minutes from the surface'`.

### 11. The first ARPANET message went to SRI, not Stanford. Severity: fact error
`src/data/stage2.js:258`. The node was at the Stanford Research Institute (SRI), which was already separate from Stanford University.
Fix: `'UCLA calls the Stanford Research Institute by computer. They type L, then O, then the system crashes. The first message is LO.'`

### 12. Cray's team was in Wisconsin, not Minnesota, and Watson's memo dates from 1963. Severity: fact error
`src/data/stage2.js:240`. The CDC 6600 was built in Chippewa Falls, Wisconsin. Watson's "34 people, including the janitor"
memo is dated 28 August 1963. The 1964-09 date fits the first delivery, so the line should not describe the memo as new.
Fix: `'MEMO. A small team in Wisconsin delivers a computer three times faster than anything else. The chairman of IBM still wants to know how.'`

### 13. Churchill used a red label, not red ink, and he did not reply to the four directly. Severity: fact error
`src/data/stage1.js:117`. Churchill minuted General Ismay on 22 October 1941 and put his red "Action This Day" label on it.
Fix: `'Four codebreakers write to the Prime Minister over everyone\'s head. His answer comes back with a red label: ACTION THIS DAY.'`

### 14. Herivel was twenty-one, not twenty. Severity: fact error
`src/data/stage1.js:182`. He was born on 29 August 1918 and arrived at Bletchley aged 21 in January 1940.
Fix: `'Herivel, twenty, …'` → `'Herivel, twenty-one, …'`.

### 15. Moore used five data points, not four. Severity: fact error
`src/data/stage2.js:176`. The 1965 graph has five points (1959, 1962–65).
Fix: `'draws a line through four points'` → `'draws a line through five points'`.

### 16. The Census Bureau line clashes with the card before it. Severity: inconsistency (clashing lines)
`src/data/stage2.js:125` and `:48` arrive together. The card says "The Census Bureau buys a computer", and the next line
says the Census Bureau will rent yours.
Fix (customer text): `'Your first customer: the Census Bureau has more to count than its new machine can manage. It will pay for your spare hours. You can sell computer time now.'`
(If that is too long, drop "You can sell computer time now." because the panel already says so.)

### 17. "War is declared at 11:15" is slightly off. Severity: polish (fact)
`src/data/stage1.js:168`. Britain's ultimatum expired at 11:00. Chamberlain told the country at 11:15.
Fix: `'3 September 1939, 11:15. The radio says Britain is at war. You are given a desk, a pencil and a basket of intercepted radio messages.'`

### 18. "The first electronic computer" is contested. Severity: polish (fact)
`src/data/stage1.js:158`. The Atanasoff–Berry Computer came earlier. The defensible claim is "programmable".
Fix: `'The first programmable electronic computer. Everything works 3× faster.'`

### 19. "Ships stop sinking" overstates. Severity: polish (fact)
`src/data/stage1.js:184`. Losses fell sharply in the second half of 1941, but ships still sank.
Fix: `'… Convoys steer around the waiting U-boats. Far fewer ships go down.'`

### 20. Turing is treated a little flippantly, and the line is in past tense. Severity: polish (respect, tone)
`src/data/stage2.js:222`. "Most readers laugh. He was used to that." is speculative.
Fix: `'The shy mathematician from the train asks in print whether machines can think. Few people take the question seriously yet.'`

### 21. "Every one of them starts building" overstates. Severity: polish (fact)
`src/data/stage2.js:90`. Some of the 28 students built machines (Wilkes built EDSAC), but not all of them.
Fix: `'… They leave with notes, and many go home to build machines of their own.'`

### 22. Core memory and the Moon program both say "woven by hand". Severity: polish (repeated line)
`src/data/stage2.js:133` vs `:190` (card "Woven programs"). The core-rope line should keep the weaving image.
Fix (core memory): `'Memory is now threaded by hand: thousands of tiny iron rings on copper wire. It remembers even with the power off.'`

### 23. The Colossus goal line is in past tense. Severity: polish (tone)
`src/data/stage1.js:161`.
Fix: `'Flowers is told valves will fail. He builds Colossus with sixteen hundred of them. It works, and it is fast.'`

### 24. Six lines are over about 25 words. Severity: polish (tone)
Counts: tapeMachine 26, postOffice 26, election 26, turingDeath 26 (leave these four), teaShops 27, wovenMemory 28.
- `src/data/stage2.js:50`: `'A chain of tea shops has its own computer for pricing cakes, and still rents yours for the payroll. Of course it is a tea company.'` (25)
- `src/data/stage2.js:190`: `'The Moon computer\'s program is sewn by hand: wire through a ring is a one, around it a zero. One wrong stitch, one wrong instruction.'` (24)

### 25. The docs are stale on dated content. Severity: inconsistency (docs)
- `design/05-game-design.md` §4.1 (opening line, goal 250,000), §4.3 (upgrade order and log lines) and §4.4 (D-Day text)
  are the first draft. The data has moved on. Add one line under §4: "Tables 4.1–4.4 are the original draft; current
  text and order live in `src/data/stage1.js` (see §8–9)."
- `design/05-game-design.md` §3, Stage 2 row: "1945–71" → "1946–71". The end rate 10⁷ is about 2–3×10⁷ in the sim.
- `design/06-stage2.md:13`: "Defence money = mainframes cheaper" → "Defence money = customers pay 1.5× more (see §6)".
- `design/06-stage2.md:15`: "goal 900 M" is superseded by 1.3 billion (§8). Add "(later 1.3 billion, §8)".
- `design/06-stage2.md:30` says the divider comes before the ENIAC line. In code (`engine.js:308` then `:340`) the
  ENIAC line comes first, then the divider. That order reads fine (ENIAC is Stage 1's last word), so fix the doc:
  "the ENIAC line, then the divider 'Stage 2 · The computing lab', then the opening line."

## Checked and fine (nothing to fix)
- Pyry in July 1939; the Enigma keyspace; Turing arriving in September 1939; the first break in January 1940; Victory
  (March 1940); the diagonal board (August 1940); Banburismus and the ban; Wrens in 1941; the four-rotor blackout on
  1 February 1942; U-559 and "six weeks later"; NCR bombes in Dayton; Heath Robinson; Flowers' own money; 1,600 valves;
  Colossus Mk 2 five days before D-Day; VE Day; ENIAC (30 tons, 5,000 a second, February 1946).
- Stage 2: the moth log quote; the transistor (December 1947, germanium and gold); Shannon (July 1948); the Baby (June
  1948, 52 min); EDSAC's library (May 1949); the ENIAC forecast (April 1950, about 24 h); UNIVAC (March 1951); LEO and Lyons
  (November 1951); Turing's conviction (March 1952); the election (November 1952); Turing's death (June 1954, aged 41; the
  line is respectful and the hush is right); FORTRAN (April 1957); ERMA's 33,000 an hour; Kilby (September 1958); Noyce
  (July 1959); CTSS (November 1961); SABRE; System/360 (April 1964); Dartmouth (May 1964); PDP-8; core rope; the AGC (about
  4,000 chips in Block I, first flight August 1966); Earthrise; the 4004 advert (November 1971).
- Kept on purpose: "It was fast enough" (the past tense echoes 1942's "We were not fast enough"); the two
  fingernails (1947 transistor and 1971 chip are a deliberate rhyme); the pencil thread; the Moon picture.
- The undated "overtaken" beat takes the current date. That is intended and fine.
- Post Office engineers is restamped 1944-02 for some "More people" players who reach Colossus first. It is harmless,
  and there is no cheap fix.

## Sources
- [Action This Day memo (Wikipedia)](https://en.wikipedia.org/wiki/Action_This_Day_(memo)), [National Archives](https://www.nationalarchives.gov.uk/explore-the-collection/stories/a-dramatic-plea-for-churchills-help/)
- [John Herivel (Wikipedia)](https://en.wikipedia.org/wiki/John_Herivel)
- [Sputnik 1 (Wikipedia)](https://en.wikipedia.org/wiki/Sputnik_1)
- [SRI: ERMA](https://www.sri.com/story/75-years-of-innovation-banking-automation-erma/)
- [CHM: Watson Jr. memo about CDC 6600](https://www.computerhistory.org/revolution/artifact/33/62), [CDC 6600 (Wikipedia)](https://en.wikipedia.org/wiki/CDC_6600)
- [APS: ENIAC's first program, December 1945](https://www.aps.org/apsnews/2022/11/eniac-first-top-secret-program)
- [NASA Apollo 11 timeline](https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_11i_Timeline.htm)
- [IEEE Milestone: Moore's Law, 1965](https://ethw.org/Milestones:Moores_Law)
