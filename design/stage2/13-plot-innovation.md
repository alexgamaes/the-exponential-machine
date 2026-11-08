# Stage 2 — one new mechanic: the plot designer's view

Owner: plot / narrative designer. Answers `10-innovation-brief.md`. Dates are drafts for the historian; numbers for systems.

## The shift the stage must make you feel
Stage 1: you *are* the work (a hut, pencils, a war). Stage 2 must end with you *running a service*: other
people bring you problems and you decide which get the machine. That is the real story of 1946–71. ENIAC was
built for firing tables, then lent to Los Alamos and the Weather Bureau; UNIVAC counted the census, called an
election, ran GE's payroll; then SABRE sold airline seats, ERMA cleared bank cheques, SAGE watched the sky, and
NASA queued for time. Computers stopped being a machine and became **machine time**.
So the new verb is not "faster", and not "money" (Stage 4, the investor, owns markets). The new verb is
**allocate**: *whose problem runs next?* And Apollo 11 is history's best ending for that verb: the 1202 alarm
is a computer that had too many jobs and dropped the small ones. The stage can end with the machine making,
in a second, the choice the player has been making for eight minutes.

Identity next to the others: Stage 1 = urgency (speed saves lives). Stage 2 = **triage** (speed is shared; who gets it).
Stage 3 garage = ownership (a computer for one person). Stage 4 = money. Stage 5+ = the machine choosing for itself.
Stage 2's triage plants that last one.

---

## Candidate A — "Machine time": a job board (recommended)

**What the player sees.** A new panel, "Machine time", appears at ~3:00 with *Programs in memory* (1948: a
stored-program machine can run anyone's problem). It has **slots** (1 at first) and **offers** (at most 3 cards):
```
 Machine time                                   1 of 2 slots in use
 ▸ Census Bureau: count 150 million people    ████████░░  ~12 s left
 Offers
   Los Alamos: a bomb calculation   ~40 s   Pays: Everything works 1.25× faster.   [Run]
   Weather Bureau: tomorrow's forecast ~30 s Pays: Computers work 1.5× faster.     [Run]
```
- **Run** puts an offer in a free slot. It finishes by itself after the shown time (time is fixed per job, so
  it never drags) and pays its reward for good, like an upgrade. The client's story goes to the ledger on finish.
- Jobs run on the *night shift*: they **do not take speed away** from the goal. Speed never drops; the scarce
  thing is slots, not operations. All operations still count toward the Moon.
- Offers arrive in date order, about every 40–50 s. If a fourth arrives, the oldest offer leaves, plainly:
  ledger "The Census went to a rival lab." No timers on offers, no flicker.
- **Drop** (on a running job) frees its slot; progress is lost. That is the "what do you drop" verb.

**The decisions it creates (all with story weight):**
1. *Whom to serve first.* Rewards are not equal and not moral labels. Defence jobs pay the most (they did:
   the money was there). Civil jobs pay less or pay in other ways (cheaper machines, a better speedometer). The
   ledger only says what the work was for. Running the H-bomb sums before the forecast is your choice, quietly kept.
2. *What to drop when overbooked.* From ~1960, a rush job needs 2 slots (NASA: "Check John Glenn's orbit").
   You must drop a payroll or an airline to fit it, or let it go to a rival.
3. *When to let the machine choose.* ~1964, card **"An operating system"**: "Picks and runs jobs for you."
   (OS/360-era batch monitors.) Optional. Taking it is the stage's thesis: automation is the point.

**Arc: introduce → peak → pay off.**
| Time | Date | Slots | What happens |
|---|---|---|---|
| ~3:00 | 1948 | 1 | First offer only: "Army: firing tables" (the job ENIAC was built for). Teaches Run with zero choice. |
| ~3:40 | 1949 | 1 | Two offers, one slot: Los Alamos vs Weather Bureau. First real choice. |
| ~5:00 | 1951 | 2 | *Magnetic tape* gives slot 2 **and** the promotion "Head of computing services". Census, Tea shops (LEO), TV election night. The election beat now fires when *that job* finishes ("It was only early."). |
| ~8:00 | 1958–62 | 3 | Washington letters, SAGE air defence, bank cheques (ERMA), airline seats (SABRE). Offers outnumber slots; Glenn's 2-slot rush job: **the peak**. |
| ~10:30 | 1964 | 4 | "An operating system" card. The board can run itself. Ledger voice is memos by now. |
| ~12:00 | 1966–68 | 4 | Last offers are all NASA (trajectories, the woven program). Board shows "Every slot is the Moon." |
| finale | 1969-07 | — | See below. |

**The pay-off at the landing (no player input).** On "Land on the Moon" the board relabels itself
"The Moon computer" and shows its own jobs, with 4 slots and 5 jobs: *Steer the descent · Read the landing radar ·
Update the display · Fire the engine · Track the command module (radar left on)*. Line 1 of the finale:
"1202. It is overloaded." The last job greys out with the plain word **Dropped**; the other four keep filling.
Then: "It drops the small jobs and keeps the ones that matter. Houston says go." The player has done exactly this
for eight minutes; now the machine does it, correctly, under pressure, by itself. This is the 1942 rhyme made
playable: in 1942 you were not fast enough; in 1969 the machine was fast *and* knew what to drop.

**Why it fits 1946–71.** Every offer is a real client of the era. Selling machine time, leasing, batch queues,
priority scheduling and the 1202 executive are all literally what happened.
**Tie to the Moon.** NASA jobs crowd the board as the goal nears; the goal bar is unchanged (one unit).
**What it removes.** About 5 of today's 15 "X is 1.5× faster" cards become job rewards (Forecast the weather, the
census, Time-sharing as "slot +1", Small computers, Woven programs). Fewer, more varied upgrade cards; same total
boost, so pacing barely moves.
**Cost to build.** One panel (slots, offer cards, a progress bar per slot). Engine: `jobs` list in stage data
(`client, name, seconds, slots, reward` reusing existing effect types), `slots` count raised by upgrades, timers
in `tick`, an `autoJobs` flag. Sim bot: "run the best reward per second that fits; drop the lowest for a rush job".
Finale: a scripted board state (no logic). Roughly the size of the choice + finale systems together.
**Risks.** Busywork if offers come too fast: cap at 3, ≥40 s apart, jobs ≥25 s. Optimal play might be obvious
(always Defence): make rewards different *kinds* (speed vs cheaper vs slot), not just bigger. Must not hint at
morality on cards; the ledger does that with facts. Checks to keep: no dead time (jobs fill waits), not clicky.

---

## Candidate B — "Price per hour": selling time for money
A **Budget ($)** resource. Clients rent machine time; you set the hourly price (three buttons: cheap / fair /
dear). Dollars buy mainframes (they really were priced and leased in dollars); operations still drive the goal.
*Decision:* fill the machine with many cheap customers or few rich ones. *Fit:* IBM leasing, service bureaus.
*Moon tie:* NASA pays whatever you ask, late. *Cost:* a second currency on costs, a price model, a new bar.
*Risks:* it is Paperclips' price slider almost verbatim, it steals Stage 4's money identity, and two
currencies make the plain "costs X" wording harder. Strong system, wrong stage.

## Candidate C — "Go / no go": checking the machine's answers
From 1959, each mission (Mercury, Gemini, Apollo) needs a **checked** answer. A share of your machines can be set
to "Check" instead of "Run": goal speed is not touched (checking is extra capacity), but unchecked missions
"scrub" and delay their reward. *Decision:* how much to trust the machine. *Fit:* Katherine Johnson checking
Glenn's orbit, Mariner 1 lost to one missing bar in 1962, Hamilton's error handling. *Moon tie:* the landing is
"go" because the checking was done. *Cost:* split toggle per producer, mission ladder, scrub logic.
*Risks:* failure states feel like punishment and fight "speed never drops"; arrives late (1959) so it fixes only
the second half. Best ideas fold into A as jobs (Glenn's rush job, a "Mariner" ledger line).

---

## Recommendation: A, "Machine time"
It is the only candidate that (1) gives a new verb, *allocate*, that Stage 1 never had and later stages do not
own; (2) makes the role change visible: the board is literally the lab turning into a service, and the
promotion lands on the same card that adds slot 2; (3) carries the stage's history in its cards instead of
in the ledger alone, so the player *chooses* to run the bomb sums, the census, the tea shop, the election;
(4) ends on the real 1202 alarm, where the player's own system becomes the Moon computer and does the triage
itself, closing the 1942 rhyme without a word about it; and (5) honours "automation is the point" twice: the
operating-system card, then the landing. It needs no clicking, no new currency, no pop-up, and a bot can play it.
