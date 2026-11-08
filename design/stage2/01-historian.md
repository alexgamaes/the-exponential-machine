# Stage 2 — Historian & Storyteller (1946–1971)

Factual and story backbone for Stage 2. Format and voice follow `05-game-design.md` and `src/data/stage1.js`.
Dates and figures were checked against Wikipedia, the Computer History Museum and primary-source summaries
(Nov 2026). **(approx.)** = right year, exact day or figure varies by source. **(unsure)** = verify before shipping.
Log lines: present tense, 25 words or fewer, no exclamation marks.

---

## 1. Setting and role

**Recommendation: an unnamed composite lab, run by the same person who kept the Stage 1 ledger.**

- The Stage 1 handover already places the player in Philadelphia in 1946, thinking "we did that last year".
  Keep that person. They are a Bletchley veteran bound by the Official Secrets Act: they know Colossus
  came first and can never say so. This is the quiet irony of the whole stage (Colossus stays secret until
  the mid-1970s, after this stage ends).
- **The lab is never named or placed.** The ledger reports real places as visits, letters and news:
  "A letter from Manchester", "You visit Cambridge", "Word from Princeton". Reasons:
  1. The real story is spread over a dozen sites; no single real lab saw ENIAC, the Baby, UNIVAC, IBM and Apollo.
  2. A real lab (MIT, say) would force us to give the player credit for someone else's work. Rule: **real people
     do the real things; the player funds, buys, hires and decides.**
  3. It matches the brief: "creative freedom is fine if it is not misleading".
- Alternative (if the team wants a place): start in a British university lab (Manchester/Cambridge style), then
  cross the Atlantic in 1957–58 with the "brain drain" to a US agency contractor. More colourful, but the move
  needs its own beat and splits the stage in two. Not recommended.

**How the role grows** (the header title changes at these points; the numbers never reset):

| When (trigger) | Title in header | What the player runs |
|---|---|---|
| Start, 1946 | Director, Computing Laboratory | One borrowed machine, six programmers, a room that smells of hot dust |
| Stored programs, 1948 | Director, Computing Laboratory | Your own machines; visitors queue to use them |
| Business customers, 1951 | Head of Computing Services | Payrolls, census returns, the weather, for paying clients |
| Transistors unlock, 1956–59 | Director, Computing Division | Mainframes on raised floors, hundreds of staff |
| The 1958 choice | Director, Computing Division (Defense / Space) | One big government client, by your choice |
| Stage goal, 1966 | Head of Flight Computing | The computer that goes to the Moon |

---

## 2. Beats (chronological)

Order is strict (rule 7: the ledger only moves forward). ★ = required by the brief.

| # | Date | What happened (plain) | Log line |
|---|---|---|---|
| 1 ★ | 14–15 Feb 1946 | ENIAC is unveiled at the University of Pennsylvania: ~18,000 valves, 30 tons, 150 kW, 5,000 additions a second. | "ENIAC is shown to the press. The newspapers call it a giant brain. You say nothing. You signed a paper." |
| 2 | Feb 1946 | ENIAC's first programmers, six women, set up its problems by hand with cables and switches. They are left out of the press photos and the dinner. | "Six women taught the machine its first problem. The dinner that night honours the men who built it." |
| 3 | Jul–Aug 1946 | The Moore School Lectures: the first course on how to build an electronic computer. Attendees (28, approx.) go home and build their own. | "Twenty-eight people spend a summer in a hot Philadelphia classroom. They leave with notes, and every one of them starts building." |
| 4 ★ | 9 Sep 1947 | Harvard Mark II: a moth is found in relay 70, panel F, and taped into the logbook: "First actual case of bug being found." (Engineers said "bug" long before; Grace Hopper made the story famous, she did not find the moth.) | "15:45. A moth is found in relay seventy. Someone tapes it into the logbook. First actual case of bug being found." |
| 5 ★ | 16 Dec 1947 | At Bell Labs, Bardeen and Brattain make the first transistor work (shown to managers 23 Dec). Announced July 1948 to almost no attention. | "At Bell Labs, a sliver of germanium and a paperclip of gold amplify a voice. It is the size of a fingernail." |
| 6 ★ | 21 Jun 1948 | Manchester "Baby" runs the first program held in electronic memory: 17 instructions, 52 minutes, ~3.5 million operations, to find the highest factor of 2¹⁸. | "Manchester. The program lives inside the machine now, not in its cables. It runs for fifty-two minutes and gets the right answer." |
| 7 ★ | Jul 1948 | Claude Shannon's "A Mathematical Theory of Communication" (Bell System Technical Journal, July and Oct 1948). He uses "bit", a word he credits to John Tukey. **→ Unit renamed "checks" → "operations".** | "Shannon at Bell Labs gives information a unit: the bit. Engineers have a word for what you count too. Operations. The number stays." |
| 8 ★ | 6 May 1949 | EDSAC (Cambridge, Maurice Wilkes) runs its first program, a table of squares, and soon offers a regular computing service to scientists. | "Cambridge. EDSAC prints a table of squares, then opens for business. Scientists queue with their problems on paper tape." |
| 9 ★ | Mar–Apr 1950 (approx.) | ENIAC makes the first computed weather forecasts (Charney, Fjørtoft, von Neumann). A 24-hour forecast takes about 24 hours to compute. Published Nov 1950. | "The machine forecasts tomorrow's weather. It takes a day to do it. For now, it is only just keeping up with the sky." |
| 10 | Oct 1950 | Turing publishes "Computing Machinery and Intelligence": can a machine think? He proposes the imitation game. | "Turing asks whether machines can think, and answers with a party game. Most readers laugh. He was used to that." |
| 11 | 31 Mar 1951 | UNIVAC I, the first US commercial computer, is accepted by the Census Bureau. It reads data from magnetic tape. | "The Census Bureau buys a computer. The country can now be counted on tape instead of punched cards." |
| 12 | Nov 1951 (approx.) | LEO I, built by the J. Lyons teashop company, runs the first routine business job: bakery valuations. | "A chain of teashops builds its own computer to price its cakes. Business computing begins with a bakery." |
| 13 ★ | 31 Mar 1952 | Turing is convicted of "gross indecency" for a relationship with a man, and accepts chemical castration instead of prison. | "Turing is convicted for loving a man. The court does not know what he did in the war. You do, and cannot say it." |
| 14 ★ | 4 Nov 1952 | On CBS, UNIVAC predicts an Eisenhower landslide (odds 100 to 1). The people running it think it is wrong and alter the output. It was right. | "Election night. The machine predicts a landslide. The men around it adjust the answer, then go on air. The landslide comes anyway." |
| 15 ★ | 1953 (approx.) | Core memory: tiny magnetic rings strung on wires (Forrester, MIT Whirlwind). Fast and reliable; it becomes the standard memory for 20 years. | "Memory is now woven by hand: thousands of tiny iron rings on copper wire. It remembers even with the power off." |
| 16 ★ | 7 Jun 1954 | Turing dies at home of cyanide poisoning, aged 41. The inquest says suicide. A half-eaten apple is by his bed. | "June 1954. Turing is dead at forty-one. The ledger stops for a day. Then you go back to work, because he would." |
| 17 ★ | Apr 1957 | IBM delivers FORTRAN (John Backus's team) for the IBM 704. Scientists write formulas, not machine code. | "FORTRAN arrives. Physicists write formulas and the machine writes its own instructions. Programmers fear for their jobs. Soon there are far more of them." |
| 18 | 4 Oct 1957 | Sputnik 1 orbits the Earth, beeping. The US answers with ARPA (Feb 1958) and NASA (Oct 1958). | "A metal ball crosses the sky every ninety-six minutes, beeping. In Washington, money for computers suddenly appears." |
| 19 ★ | 12 Sep 1958 | Jack Kilby (Texas Instruments) shows the first integrated circuit: parts on one piece of germanium, joined by wires. | "Kilby is too new at Texas Instruments for a summer holiday, so he thinks alone. In September, a whole circuit works on one chip." |
| 20 ★ | Jul 1959 | Robert Noyce (Fairchild) files the patent for a flat, wireless (planar) integrated circuit: the design every chip still follows. | "Noyce draws the circuit flat, printed on silicon, no wires. Every chip you will ever buy starts on this page." |
| 21 | Dec 1959 | IBM 7090, a transistor mainframe six times faster than the valve machine it replaces, is installed. | "The valves go out on trolleys. The transistor machine is six times faster and does not warm the room." |
| 22 | 20 Feb 1962 | Before his orbital flight, John Glenn asks for Katherine Johnson, a NASA human computer, to check the electronic computer's numbers by hand. | "John Glenn will not fly until one woman checks the machine's sums with a desk calculator. She does. He flies." |
| 23 ★ | 7 Apr 1964 | IBM announces System/360: one family of compatible computers, small to large. A bet of about $5 billion. | "IBM bets the company on one idea: every machine, large or small, runs the same programs. The bet pays for decades." |
| 24 | Sep 1964 (approx.) | CDC 6600 (Seymour Cray), about three times faster than anything else: the first supercomputer. (IBM chief Thomas Watson Jr's "34 people, including the janitor" memo is Aug 1963, at the announcement.) | "A company of thirty-four people, including the janitor, builds the fastest computer in the world. IBM's chairman wants to know how." |
| 25 ★ | 19 Apr 1965 | Gordon Moore, in *Electronics*: the number of parts on a chip doubles every year (revised in 1975 to every two years). | "Moore draws a line through four points and predicts the next ten years. The industry spends fifty making him right." |
| 26 | 9 Dec 1968 | Douglas Engelbart's demonstration in San Francisco: mouse, windows, links, video calls, shared editing. | "In San Francisco, a man shows the future in ninety minutes: a mouse, windows, a video call. The audience stands." |
| 27 | 24 Dec 1968 | Apollo 8 orbits the Moon; the crew photograph the Earth rising. | "Christmas Eve. Three men go around the Moon and photograph the Earth, small and blue, rising over the grey." |
| 28 ★ | 20 Jul 1969 | Apollo 11 descent: the guidance computer raises 1201/1202 alarms (overloaded). It drops low-priority work and keeps flying. Steve Bales and Jack Garman in Houston call "Go". | "The computer flashes 1202. It is overloaded, and it knows it. It drops the small jobs and keeps flying. Houston says go." |
| 29 ★ | 29 Oct 1969 | ARPANET's first message, UCLA to Stanford Research Institute, ~22:30. "LOGIN" crashes after two letters: "LO". | "UCLA calls Stanford by computer. They type L, then O, then the system crashes. The first message is LO." |
| 30 ★ | 15 Nov 1971 | Intel advertises the 4004: a whole computer processor on one chip, 2,300 transistors, made for a Japanese calculator. | See §7. |

Notes on respect: beats 13 and 16 should play as beats, never attached to a purchase or reward, and should not be
triggered while a finale or celebration is on screen. Do not include the apple-as-logo myth. (Britain apologised
in 2009 and pardoned him in 2013: after this stage, a possible callback in a later era.)

---

## 3. Upgrades and producers

**Click verb:** "Run a calculation" (recommended). Alternatives: "Run a program" (wrong before 1948, when
programs were cables), "Set up a problem". The click stays the same verb after the rename; only the unit changes.

**Producers** (button labels plain, per D12):

| Producer | Button | Appears | Log on first purchase |
|---|---|---|---|
| **Valve computers** (early) | "Build a computer" | at start (or after ~10 clicks) | "Your first machine: a room of glowing valves. Every morning, a few have burned out. Someone walks the racks with a basket." |
| **Transistor mainframes** (late) | "Install a mainframe" | unlocked by upgrade U10 | "The mainframe arrives on a raised floor, with its own air conditioning. The operators wear ties." |

(Alternative producer names: "Room-sized computers" / "Mainframes". Avoid "vacuum tube" — British "valve" matches Stage 1.)

**Upgrades** (16 candidates, in date order; effect type is a suggestion for systems; ⇢ = beat it draws on):

| # | Card name | Date | Suggested effect type | Log line (on purchase) |
|---|---|---|---|---|
| U1 | Trained programmers | 1946-02 | click ×2 | ⇢ beat 2 (use it here, or as a beat) |
| U2 | A summer course | 1946-08 | computers ×2 | ⇢ beat 3 |
| U3 | A logbook for faults | 1947-09 | computers ×2 | ⇢ beat 4 (the moth) |
| U4 | Programs in memory | 1948-06 | everything ×1.5 | ⇢ beat 6 (Baby) |
| U5 | A library of subroutines | 1949-05 | click +5% of speed | "Cambridge keeps a cupboard of tested routines on paper tape: sines, square roots. Nobody writes the same thing twice." (EDSAC library, 1949–51) |
| U6 | Overnight runs | 1950-04 | computers ×2 | ⇢ beat 9 (weather) |
| U7 | Magnetic tape | 1951-03 | computers ×2 | ⇢ beat 11 (UNIVAC/Census) |
| U8 | Business customers | 1951-11 | each computer makes clicks +x% (synergy) | ⇢ beat 12 (LEO) |
| U9 | Core memory | 1953 (approx.) | computers ×2 | ⇢ beat 15 |
| U10 | Transistor circuits | 1956 (approx.) | **unlocks mainframes** | "At MIT, TX-0 runs on transistors instead of valves. It fits in a room, not a building, and almost never breaks." (TX-0, 1956) |
| U11 | FORTRAN | 1957-04 | everything ×1.5 | ⇢ beat 17 |
| U12 | **Choice** (see §5) | 1958 | choice | see §5 |
| U13 | Chips | 1959-07 | mainframes ×2 | ⇢ beat 20 (Noyce) |
| U14 | Time-sharing | 1961-11 | click +10% of speed | "MIT's CTSS lets many people use one computer at once, each at their own typewriter. Everyone thinks it is theirs alone." (CTSS demo Nov 1961, approx.) |
| U15 | One family of machines | 1964-04 | mainframes cost growth lower | ⇢ beat 23 (System/360) |
| U16 | A faster design | 1964-09 | mainframes ×2 | ⇢ beat 24 (CDC 6600) |
| U17 | Doubling every year | 1965-04 | everything ×1.5 | ⇢ beat 25 (Moore) |

That is 16 plus the choice. Late-stage spares if dead time appears after 1965: **"Software engineering"**
(NATO conference, Garmisch, Oct 1968, where the term is popularised): "Fifty experts meet in Bavaria and agree
on one thing: software is in crisis. They name the cure software engineering." and **"Woven programs"**
(core rope memory for Apollo, programs literally sewn by hand by women at Raytheon; 1965–69): "In Waltham, women
thread copper wire through iron rings by hand. A wire through the ring is a one. The program is sewn."

---

## 4. Stage goal and finale

Mirror Stage 1: *build the machine* (goal) → *use it* (finale 1) → *the world changes* (finale 2).

**Recommended (A)**
- **Goal: "Build a computer for the Moon"** — IN TOTAL milestone; 3× speed. Date 1966 (first Block I AGC flies
  on AS-202, Aug 1966 (approx.)). Card text: "A computer small enough to fly. Everything works 3× faster."
  Log: *"A computer the size of a suitcase, made of four thousand chips. NASA is one of the first big buyers of chips. The price falls for everyone."*
  (Block I: ~4,100 single-gate ICs; Block II ~2,800 dual-gate. Apollo was a major early IC buyer, (approx.) share of the market.)
- **Finale 1: "Fly around the Moon"** (24 Dec 1968) — log = beat 27.
- **Finale 2: "Land on the Moon"** (20 Jul 1969), card text "Ends this stage." Log = beat 28, then:
  *"Tranquility Base. The Eagle has landed. In Houston, the room breathes out. The computer counts down nothing; it is done."*

**Alternative (B)** — Goal "Land on the Moon" (20 Jul 1969); Finale 1 **"Bring them home"** (splashdown 24 Jul 1969):
*"Three men fall into the Pacific, on time, where the computer said they would."*; Finale 2 **"Connect two computers"**
(ARPANET, 29 Oct 1969) with beat 29. Strength: ends on the network, a strong bridge forward. Weakness: the climax
(landing) is the goal, not the finale, so the last click is quieter.

**Alternative (C)** — Goal "Build a computer for the Moon"; Finale 1 **"Go for landing"** (the 1202 line);
Finale 2 **"Land on the Moon"**. Same day for both; tightest drama, but loses the Apollo 8 image.

---

## 5. The player's choice (Stage 1 equivalent: "Action This Day")

**Candidate 1 (recommended): "Who pays?" — 1958, after Sputnik.** Washington creates ARPA (Feb 1958) and NASA
(Oct 1958) in the same year; both fund computing. Card: **"Two letters from Washington"**.
- **Defense money** → machines-type effect (e.g. mainframes cost growth lower). Flavour: big machines, secret customers.
- **Space money** → people-type effect (e.g. each click adds x% of speed). Flavour: public missions, many small teams.
- Log: *"Sputnik is still beeping. Two new agencies write to you in the same month. Both offer money. You answer one first."*
- Follow-up beat (by option): Defense: *"The generals want missiles tracked and messages that survive a war. One day this money will build a network."* Space: *"The astronauts want a computer they can trust with their lives. You promise one."*
- Why: real, dated, one decision with consequences both ways; history continues either way (ARPANET and Apollo both still happen), so no beat contradicts the choice.

**Candidate 2: "Build or buy?" — 1964, System/360.** Keep building your own machines (as Manchester, Cambridge and
MIT did) or buy IBM's compatible family.
- **Build our own** → mainframes ×2 later / more expensive. **Buy from IBM** → mainframes cheaper (cost growth lower).
- Log: *"IBM's salesman leaves a brochure for System/360. Your engineers leave a design for a better machine. Both are on your desk."*
- Weaker: less moral weight and it lands late (the stage already ends soon). The phrase "Nobody ever got fired
  for buying IBM" is from the 1970s (unsure of origin); do not date it inside this stage.

---

## 6. Calibration (real machines, operations per second)

Brief: start ~2–2.7×10⁴/s (Legacy), end ~10⁷/s. The player starts *above* ENIAC, which is the joke of the
handover ("we did that last year"). Real 1946→1969 growth is about 5,000 → 10⁷: ×2,000, the same range.

| Machine | Year | Figure | Order of magnitude |
|---|---|---|---|
| ENIAC | 1946 | 5,000 additions/s; ~357–385 multiplications/s | 5×10³ |
| Manchester Baby | 1948 | ~700–1,100 instructions/s (sources differ) | 10³ |
| EDSAC | 1949 | ~650 instructions/s **(approx.)** | 10³ |
| UNIVAC I | 1951 | ~1,905 ops/s (addition 525 µs) | 2×10³ |
| Whirlwind | 1951 | ~20,000 ops/s | 2×10⁴ |
| IBM 704 | 1954–55 | up to 12,000 floating-point additions/s; ~4×10⁴ instructions/s **(unsure)** | 10⁴ |
| IBM 7090 | 1959 | ~100,000 FLOP/s; 6× the 709 | 10⁵ |
| CDC 6600 | 1964 | ~3 MFLOPS (up to ~3 million instructions/s) **(approx.)** | 3×10⁶ |
| CDC 7600 | 1969 | ~10 MFLOPS typical, 36 MFLOPS peak; fastest machine ~1969–75 | 10⁷ |
| Apollo Guidance Computer | 1966–69 | 2.048 MHz clock, addition 23.4 µs → ≤ ~43,000 additions/s **(inferred)**; 2,048 words RAM, 36,864 words rope ROM | 4×10⁴ |
| Intel 4004 (next stage) | 1971 | 740 kHz, up to ~92,000 instructions/s | 10⁵ |

Speedometer suggestions: **"Forecasting tomorrow's weather"** (1950: about 24 hours; a 1969 supercomputer: minutes;
the line shrinks to seconds) or "as fast as N human computers" (a person with a desk calculator ≈ 0.1–0.5 ops/s, est.).
Milestone comparisons: "You are now faster than ENIAC" fires at the start (good irony), then UNIVAC is skipped,
then "faster than a 7090", "faster than Cray's 6600". Note the AGC is *slower* than the player late in the stage:
a fine log line ("The Moon computer is slower than your mainframes. It only has to be right.").

---

## 7. Closing lines and handover

`ending` (played in order after "Land on the Moon"):
1. 1969-07 — "Six hundred million people watch the landing. Somewhere among them, children decide what they want to be."
2. 1969-10 — beat 29 (LO), if not already used.
3. 1970-01 — "The Moon computers are retired. The tape drives spin on in a thousand basements. What you learned is not retired."
4. 1971-06 — "Your division has a building, a car park and its own cafeteria. The machines fill three floors. Every year they need less of one."

`next` (handover into Stage 3, the garage founder):
> **1971-11** — "November 1971. A magazine advert: a computer on a chip, 2,300 transistors, under a fingernail. You think of your three floors."

Alternatives: *"A Japanese calculator firm asked for twelve chips. Intel gave them one. It is a whole computer. Somewhere, a garage is free."*
or *"The 4004 is slower than your mainframe and costs less than its manual. Anyone could own one. That is the point."*

---

## 8. Unit rename (Shannon, 1948) — implementation note
Trigger the rename on the beat (or upgrade U4/U5 slot) dated **1948-07**, after the Baby (1948-06). The log line
(beat 7) does the work; the counter label switches "checks" → "operations" with no other fanfare. "Checked in total"
becomes "Run in total" or "Operations in total". Stage 1 log entries keep saying "checks" (history is not rewritten).
