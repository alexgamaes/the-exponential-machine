# Stage 2 — one new mechanic: the UX view (designer)

Angle: what new *panel* would feel fresh, readable and calm in today's layout (counter, goal bar, "Your lab", "Ideas",
ledger). Rules from every candidate: buttons only (no drag, no timing), one change per event, numbers update at most
once a second, labels say what a thing does, the goal bar keeps only the stage goal, clicks never speed the new thing up.
Where it goes: on wide screens the new panel sits **under "Your lab" in the left column** (the lab is where work
happens, Ideas stays where it is). On phones the order is Lab → new panel → Ideas → ledger.

## A. The job board: customers bring work, you choose what to run (money arrives)
**What the player sees.** At "Magnetic tape" (1951, ~4:30) a panel opens: **"Jobs waiting"**. Three customer jobs, each a
plain card: who, how big, what it pays. One button: **Run this job**. A running job takes a fixed share of the lab's speed
(25 %, said on the card and on the rate line) and pays **dollars** when done. Dollars are a second counter under the
operations counter, and mainframes are bought with dollars (operations still buy computers and ideas).
```
 JOBS WAITING                                      Funds: $1.40 M
 ┌ RUNNING ─────────────────────────────────────────────────────┐
 │ Census Bureau · count the country           pays $2.0 M     │
 │ ████████████░░░░░░░░  61 % · about 40 s left                │
 └──────────────────────────────────────────────────────────────┘
 ┌──────────────────────────────────────────────────────────────┐
 │ A tea company · weekly payroll              pays $0.6 M     │
 │ Size: 8 M operations (about 25 s)           [ Run next ]    │
 ├──────────────────────────────────────────────────────────────┤
 │ Air Force · flight tables                   pays $3.1 M     │
 │ Size: 30 M operations (about 1 min 30 s)    [ Run next ]    │
 └──────────────────────────────────────────────────────────────┘
 Jobs use 25 % of your lab's speed. Clicking does not speed them up.
```
- **Decision:** which job first (small and quick vs big and well paid), and when to stop running jobs (the share costs
  operations). "Run next" queues one job behind the running one; the queue holds one, so there is nothing to arrange or forget.
- **Teach without a tutorial:** the first board holds **one** job (the Census, which really bought UNIVAC I), already
  explained by its card. The rate line gains a muted segment `· 25 % to jobs`. The Mainframes row says
  `Install a mainframe · $1.2 M`, so the reason for dollars is visible before the first job ends. Locked third slot:
  "A third customer arrives with Time-sharing."
- **Calm:** jobs never expire and have no deadlines. A finished job leaves one ledger line (flavour) and its slot refills
  **in place** with the next customer after 2 s (no reshuffle). The progress bar moves at 1 Hz, ETAs use `fmtApprox`.
- **Access:** "RUNNING" is a text tag plus a bold 3px border, not colour alone. Each card is a real `<button>` row (44 px
  targets, full width on phones). The bar is a `progressbar` with its text next to it. One polite announcement per
  finished job ("Census job done. +$2.0 M."). Focus never moves when a slot refills; reduced motion swaps it instantly.
- **Moon tie:** after the Washington letters, the clients follow your choice (Defence: Air Force, missile tables; Space:
  NASA, Mercury orbits, Glenn's re-entry). The last job on the board is "MIT · program the Moon computer", the biggest pay.
- **History:** UNIVAC/Census 1951, LEO for J. Lyons tea shops 1951, CBS election night 1952, SAGE, IBM service bureaus that
  rented machine time by the hour: computing was sold as a service in exactly this way.
- **Cost:** state (`funds`, `jobs[]`, `running`), job data per stage, one panel, a second price unit on producers; the sim
  bot uses "run the best pay per operation, always". ~200 lines across engine/ui, and the systems designer has to retune mainframes.
- **Risks:** a second currency is a real economy change; a 25 % share must not read as "slower" (the headline rate stays the
  total and the share is a label, so requirement 4 holds). Phone: three cards are tall, so waiting jobs collapse to one line each.

## B. Core memory: a small grid you allocate to programs
**What the player sees.** At "Core memory" (1953) a panel **"Memory"** shows the core plane as a grid of words, and a short
list of programs that can be loaded. Each program needs some words and gives a stated effect while loaded. Memory grows
with later ideas (Chips, One family of machines), and new programs arrive with history (FORTRAN, the weather model, trajectory).
```
 MEMORY                                            24 of 32 words used
 ■■■■■■■■ ■■■■■■■■ ■■■■■■■■ □□□□□□□□
 Weather model        8 words   Computers work 1.3× faster      [ Unload ]
 FORTRAN compiler    16 words   Everything works 1.2× faster    [ Unload ]
 Payroll              8 words   +40,000 operations per second   [ Load ]
 Trajectory          16 words   Mainframes work 1.5× faster     Needs 16 free words
```
- **Decision:** a knapsack. What fits now, what to unload when a better program arrives. It reshuffles every few minutes,
  never every second, and the bot can solve it greedily (best effect per word).
- **Teach:** first grid is 8 words with one program that fits exactly ("Load"). The second program arrives one size too big,
  and its button says "Needs 16 free words. You have 0." The player discovers unloading. Squares fill in the program's
  order with a thin gap between programs; colour is never the only cue (each block has the program's initial on hover/focus).
- **Calm and access:** loading is instant (no animation beyond the squares filling once). The grid is decorative
  (`aria-hidden`); the list is the real control, with a plain "24 of 32 words used" line. Phone: the grid wraps to 16 per row.
- **Moon tie:** the last program is "Moon landing program · 36 words" and needs the full final memory: you clear the board for it.
- **Cost:** small: `memory`, `loaded{}`, program data, one panel. No new currency. **Risk:** unloading a program lowers speed,
  which breaks "never slower" on screen. Fix: unloading is only offered in the same click as loading the replacement ("Swap in").

## C. Uptime: valves fail, the room has a gauge
A dial "Machines running: 94 %" falls as computers age; you assign engineers or buy "Spare valves". It is historically
lovely (ENIAC lost a valve every two days) but it is a chore and a penalty: buying a computer could lower the rate, idle play
gets punished, and any random failure is a flicker by definition. I keep it only as **flavour**: one fixed line in the Lab
panel ("Machines running: 99.9 % since transistors"), changing only on purchases.

## Recommendation: A, the job board
It is the only candidate that adds a **new verb** (choose whose work to run) and a **second resource** (money), which is what
the player asked for, without asking for more clicks: once a job is queued it runs itself, and clicks don't touch it. It reads
in one glance because every card is a sentence ("A tea company · weekly payroll · pays $0.6 M"), it puts the stage's best
stories (the Census, the tea shops, election night, Glenn) on buttons instead of only in the ledger, and it ends on the Moon
with the last customer. It also fits the arc: in 1946–71 computing was a service you sold by the hour. Bigger money and
markets belong to the 1990s investor stage; here it stays small and literal: customers, jobs, a payroll.
If the second currency proves too heavy to tune in time, B is the fallback: cheaper, calm, and still a real decision.
