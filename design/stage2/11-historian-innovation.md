# Stage 2 — historian: one new mechanic from real lab life (1946–71)

Answer to `10-innovation-brief.md`. Facts I checked on the web are marked ✓, facts I'm not sure of are marked (?).

## What a real lab director actually worried about
Labs spent little time on speed. Most of their effort went into four other things:
1. **Keeping the machine up.** ENIAC's valves died several times a day at first, so it was down about half the time. Engineers then
   left it switched on (most failures came at warm-up) and got this down to one valve every two days ✓. The longest
   fault-free run was 116 h, in 1954 ✓. Whirlwind added "marginal checking" to find weak valves before they failed. SAGE ran two
   computers per site, one on hot standby (?: often quoted as ~99% uptime).
2. **Who gets the machine.** There was never enough machine time. Jobs went into a queue of card decks. The operator,
   and later the operating system (GM-NAA I/O on the IBM 704, 1956), decided what ran. The Apollo 1202 alarm came from this
   rule: when overloaded, the Executive dropped the low-priority jobs and restarted the ones that mattered.
3. **Paying for it.** Lyons (the tea company) sold LEO time to outside firms. It ran Ford UK's payroll from about 1955–56 ✓,
   later did payroll for Kodak and Tate & Lyle and sales accounting for Dunlop ✓, and did Met Office forecasts before the Met Office
   bought a Mercury in 1959 ✓. A whole bureau trade grew up (ADP, IBM's Service Bureau Corporation, set up by the 1956
   consent decree (?: date and details from memory), and later time-sharing firms like Tymshare). IBM mostly *leased* machines
   and did not sell them. A lab paid every month and could hand the machine back.
4. **People.** Programmers were rare. SAGE alone used a large share of the country's programmers (?: the "SDC trained
   thousands" claim needs a source). FORTRAN (1957) and COBOL (1959) were meant to let fewer experts do more. OS/360
   was late and over budget, which gave the 1968 NATO conference its phrase "software crisis".

Points 2 and 3 are new verbs. Point 1 is good flavour but becomes a penalty very easily. Point 4 is a multiplier with a new name.

---

## Candidate A — Machine time for hire (money, the first second resource)
**Sees / does.** In 1951 the tea-shop line ("Lyons builds its own computer") opens a small **Machine time** panel with one
control: *Time sold to clients: 0% / 25% / 50%* (three buttons, no slider fiddling) and two plain numbers:
"Clients pay $N per second" and "Your own work: N operations per second". Every machine still runs at full speed, so the
speedometer never drops. The goal bar counts only the lab's own work. Sold time earns **dollars**.
From Magnetic tape on, **mainframes are priced in dollars** ("Lease a mainframe: $N"), because mainframes were
something you bought or leased from a company, not something your lab built. Computers stay priced in operations.
**New decision.** This is the Paperclips trade-off between investing now and cashing in later. Selling time slows the goal now but pays
for mainframes, which compound. Around 1966 the right move is to drop back to 0% and put everything on the Moon.
**Moon tie.** "Land on the Moon" sets sold time to 0% by itself, and the ending line about the 1202 alarm now
describes what the player has been doing all along: *drop the small jobs, keep the one that matters.*
**Fits 1946–71.** LEO, UNIVAC at the Census, service bureaus and IBM rental all belong to this stage. It is operating income,
not investment, so the stock market is still free for the 90s investor stage.
**Log lines it enables.**
- "1955. Ford asks if you will run its payroll. Ten thousand pay packets a week, and none of them may be wrong."
- "A cheque arrives from the Met Office for tomorrow's weather. You used it to buy next month's."
- "IBM will not sell you the machine. It will rent it to you, by the month, forever. You sign."
- "The clients' jobs run at night. The Moon gets the day shift." (when the player goes back to 0%)
**Cost to build.** A second counter (dollars), one 3-way control, a currency field on producers (`costIn: 'money'`), and a
"sold share" in the rate formula. The sim bot gets a fixed policy (for example 50% until N mainframes, then 0%), and both policies need tuning.
**Risks.** Two currencies on one screen confuse players unless dollars appear only next to mainframes. If the shares are tuned badly, one
setting always wins and the choice stops mattering. The goal bar moves slower while you sell, so the hint has to say "sold time pays for mainframes".

## Candidate B — The job queue (priority, ends in the 1202 alarm)
**Sees / does.** A short queue of 3–4 named jobs: *Firing table · Ford payroll · Weather · Census · Airline seats (SABRE,
1964) · Trajectory*. Each one shows its size and what it gives (a one-off reward: a machine, a cheaper next card, or a
lump of operations). Machines work from the top down. The player taps "Run next" to move a job up. Jobs with a date drop off if
they are late. Later, the "Operating system" card (1956) sorts the queue by itself, and "Time-sharing" runs two at once.
That is the Paperclips pattern: a manual system that later runs itself.
**New decision.** Which job matters most right now, for example the payroll that pays for a mainframe or the weather job that unlocks the next upgrade.
**Moon tie.** The last job is "Landing guidance". The 1202 line pays off the whole system.
**Log lines.** "The operator files your deck under tomorrow." · "The payroll missed Friday. Ford's men were paid by hand." ·
"The operating system decides now. The operators go home on time."
**Cost / risks.** This is a new panel with timers and needs the most UI. It needs check-ins every ~30 s, which goes against "automation is
the point" until the operating system arrives. Rewards can easily turn into "×1.5 with extra steps".

## Candidate C — Uptime (valves, maintenance, nines)
**Sees / does.** Computers show **Uptime 50%**, which is ENIAC's real figure. Real speed = machines × uptime. Cards that raise uptime
compete with cards for new machines: "Leave it switched on" (to 75%), "Marginal checking" (to 90%), "A spare machine
on standby" (to 99%), "Transistors" (to 99.9%). Uptime only ever goes up, so speed never drops.
**Moon tie.** The Moon goal needs "99.9% up" as well as operations. *It is slower than your mainframes. It only has to be right.*
**Log lines.** "When a valve dies, you find it by the dark." · "Nobody turns ENIAC off any more. It breaks less." ·
"116 hours without a fault. Someone brings a cake."
**Cost / risks.** Cheap to build: one number and some cards. But in practice it is a multiplier with a gauge, which is exactly what the player complained about. It
also adds a second goal condition next to the one-unit goal bar.

---

## Recommendation: A, Machine time for hire
- It gives the player what they asked for (*"add money"*) with a decision that keeps working after the first minute:
  sell now and grow, or keep the time and push for the Moon. One setting is easy to learn in ~1 minute
  ("I sold half my time, and now I can afford a mainframe").
- It doesn't reward clicking. You set it once, think about it again two or three times per stage, and a bot can play it.
- It changes how Stage 2 *feels*, not only how big the numbers get. Stage 1 was a team of people. Stage 2 becomes a lab with a
  budget, clients and a landlord (IBM), which is what changed between 1946 and 1971.
- It gives the 1202 ending a payoff without building B's queue. Candidate C's best lines can stay as log beats.
- Add one thing from B if it is cheap: name the client on the panel ("Now paying: Ford payroll"), and change the name as the
  years pass (Met Office, Census, an airline) so the history appears without a new system.
