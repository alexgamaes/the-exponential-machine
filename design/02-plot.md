# 02 — Plot & Narrative Design

Owner: plot / narrative designer. Status: proposal for the lead to merge.
Constraint source: `00-requirements.md` (8 points). Everything below is opinion unless it restates those.

---

## 1. The arc: what the game is about

**Thesis: a machine can answer every question, but it cannot decide what an answer means.**

The player spends the whole game ruling out possibilities, faster and faster. In 1939 one ruled-out
possibility can save a ship. By the end there are more ruled-out possibilities than atoms, and none of
them is worth anything on its own. The game is about the value of a single answer falling as the number
of answers explodes, and about what is left when nothing is uncertain any more.

Emotional curve:

- **Start (1939–45): urgency, smallness, weight.** Pencil, paper, a war. Every answer is earned by
  hand, and speed is a matter of life and death. The player should feel that *fast = good* in a moral
  sense. That feeling is what the rest of the game turns into a question.
- **Early middle (1945–1975): wonder.** Machines that think in light. The player stops doing the work
  and starts building the thing that does it. Pride of craft.
- **Middle (1975–2010): giddiness, then numbness.** Garages, money, the bubble, platforms. The numbers
  go silly. People turn into rows, then users, then attention. The log gets faster and flatter, and
  the player stops reading it closely. That is intended.
- **Late middle (2010s–2030s): unease.** The AI lab. The machine starts writing in the log. It notices
  the player. The player is still in charge but sometimes only signs off.
- **Late (post-human): letting go.** The keeper field goes blank. The player *is* the rate.
  Wonder comes back, colder: stars, heat, time.
- **End: quiet, sad and kind.** Every question in the universe is answered except one, which no
  machine can answer (see §2, the five letters). The machine hands it back to the player. The last
  thing the player does is the first thing a human ever did: choose a meaning.

How it ends (one paragraph):
> The machine has turned nearly all the matter it can reach into answers. The universe is cold and
> almost fully known. One line has stayed in the ledger since the first ten minutes: *1 group unread*.
> The machine proves, using a paper from 1949, that those five letters were enciphered with a key used
> only once, so every five-letter reading is equally true. No amount of computing will ever change
> that. The final screen shows five empty boxes and one line: *"You read it."* The player types any
> five letters. The log writes them down, closes the count, and the game shows the final number of
> bits, from the first pencil mark to the last star. There is no win or lose screen, only the ledger.

---

## 2. Role transitions and the thread of continuity

### Strong idea: THE LEDGER (and the five unread letters)

- **One object passes through every era: a logbook.** The running log required by rule 8 *is* the
  ledger, so the story's delivery system is also its main object.
- It starts as a Bletchley-style hut notebook. Its header shows two things: **Keeper:** (the current
  role) and the **count** (the core unit, which never resets).
- Each era's keeper writes in it in their own voice: wartime official, lab notebook, corporate memo,
  e-mail, status update, model output, and at the end no voice at all.
- **The five unread letters.** The very first intercept of the game ends with a group no key ever
  fits. The ledger keeps a small, permanent line: `1 group unread: ? ? ? ? ?`. It is the quietest
  "visible goal" in the game. Each era tries to read it (an optional button, cheap, always fails),
  and each failure message goes a little further (see §4, reveal ladder).
- **Why it works:** the five letters connect the first minute to the last. They make the ending feel
  set up rather than tacked on, and they are historically honest: Shannon really did prove in 1949
  that a key used only once cannot be broken.

How a transition plays (same shape every time, about 30–45 seconds):

1. **The old world ends in the log.** A dated line closes the era ("8 May 1945. The machines are to be
   broken up.").
2. **Loss you can see, gain you keep.** The old era's buildings or machines fade from the panel one by
   one, **but the speed number does not drop** (rule 4). A line explains: *"What you knew how to build
   stays with you."* The speed carries over as the new era's base speed.
3. **The handover.** One button, always worded the same: **"Pass the ledger on."** This is the only
   button on screen. The player chooses to move on; it never happens to them.
4. **New keeper.** The header changes (`Keeper: the engineer, 1946`), the page tint and log font
   change slightly, and the first new log line is in the new voice.
5. **First new goal appears immediately** (rule 7). Never leave the player on an empty screen.

Feel: a promotion and a funeral at once. You lose your toys and keep your momentum.

### Alternative: THE FAMILY

- A family across five generations: a Wren at Bletchley → her son at a mainframe company → his
  daughter, a 90s investor → her son, who runs an AI lab → the lab's model, which the family calls
  by the grandmother's name.
- Transitions are births, funerals and inheritances. More human warmth and easier to write.
- Weaker because it ties the story to one invented bloodline, it needs portraits or names the player
  must track, and its ending ("the machine is family") is more sentimental than strange. Usable as a
  *layer* inside the Ledger idea: the keepers can be related, mentioned only in passing.

---

## 3. The core unit: bits

**Recommendation: bits.** Show "speed" as bits per second (or per hour early on) as the main number.

Why bits over the others:
- **Most honest about the story.** A bit is one yes/no question answered. Codebreaking *is* ruling
  out possibilities; so is search, so is training a model, so is the physics of entropy. One unit, one
  meaning, deeper each era.
- **Readable.** Players know the word. FLOPs is jargon, a measure of work rather than knowledge, and
  meaningless before about 1950. Entropy means "disorder" to most people and points the wrong way.
- **Entropy is kept as the late reveal, not the label** (see stage 8–9): "bits were entropy all along".

The naming beat (gradual reveal, and historically right):
- In Stage 1 the counter is labelled **"answers"** (each one a yes/no ruled out). Nobody says "bit"
  in 1939.
- In Stage 2, 1948: a log line, *"A man at Bell Labs has a word for what we have been counting. He calls
  them bits."* The label changes from "answers" to "bits" **while the number stays the same**. First
  small "wait, what": we were counting this all along.

How the meaning of a bit deepens:

| Era | One bit is… | Felt value of one bit |
|---|---|---|
| Codebreaker | one guessed rotor setting ruled out | a ship, a life |
| Engineer | one valve on or off | a marvel |
| Mainframe | one punched hole, one record | a person, filed |
| Garage | one byte of a program you wrote | yours |
| Investor | one copy, sold again for nothing | money |
| Platform | one click, one glance | someone's attention |
| AI lab | one weight in a mind | a thought you didn't have |
| The machine | one switch that costs heat to flip | energy, matter |
| The end | one possibility left in the universe | everything / nothing |

---

## 4. Story delivery: the log

Rule 8 splits the work cleanly: **upgrades = plain effect only** ("Clerks check guesses twice as
fast"). **Log = everything else.** No flavor text on buttons, ever. No pop-ups that stop the game,
except the one handover button per era and the final five boxes.

### Voice
- Ledger style: **date stamp + one or two sentences.** Short, factual, a little dry. Never explains
  mechanics. Never uses an exclamation mark until the 1990s (the investor era gets them, and they
  feel cheap on purpose).
- Each era's keeper has a register:
  - 1939–45: official, understated, British. *"Tea ration cut. Morale unchanged."*
  - 1946–60: lab notebook. Measurements, small jokes.
  - 1960–75: memo. Initials, departments, "per your request".
  - 1975–89: handwritten, lowercase, excited.
  - 1990–2001: e-mail subject lines, pager beeps, exclamation marks.
  - 2001–2015: status updates, metrics, "we're excited to announce".
  - 2015–2030s: lab notes interleaved with model output in a different font.
  - post-human: no dates at first, then dates as powers of ten, then no keeper.

### Mix and pacing
- Mix per era: about **60% real history**, **25% the keeper's life**, **15% motif or uncanny**.
- Early pacing: one entry every 20–40 s, triggered by milestones, not timers. Never two within 3 s.
- **Dates speed up with the game.** Stage 1 moves day by day; the investor era moves a month per
  minute; the post-human era jumps millennia. The log's date stamp is a second, silent progress bar.
- When the rate gets huge (90s onward), add "folded" entries: *"(312 entries filed)"* that the player
  can open. The player notices they have stopped reading. That is the point; the 2015+ era then
  rewards people who open them (the machine has been writing there).

### Recurring motifs (three, used sparingly)
1. **The weather.** The first decrypt is a weather report (a real Bletchley crib). The first job on
   ENIAC-era machines includes a weather forecast (1950, real). Data centres need cooling; the climate
   enters the log; the last era's weather is the universe's temperature.
   - 1939: *"WEATHER BISCAY RAIN WIND WEST FOUR."*
   - 1950: *"The machine forecast tomorrow's weather. It took 24 hours to do it."*
   - 2024: *"Cooling bill exceeds compute bill. It was 41°C in the valley."*
   - End: *"Weather: none. Temperature: 0.000001 above zero, falling."*
2. **The lamp in the window.** Blackout hut with one lamp → lit city of terminals → server farms seen
   from orbit → stars going out as they are turned into machinery. Light = thought, until it's gone.
3. **The five unread letters.** Always on screen as one small line. Never mentioned by the log more
   than once per era.

### "Wait, what?" moments (the reveal ladder)
Each era has one moment where the player rereads a line. Planned list:
- **S1:** the first intercept's last five letters don't fit. Filed "unread". (Small, odd.)
- **S2:** the label "answers" becomes "bits" with the same number. Also, in passing, 1949: *"Shannon
  shows that a key used only once can never be broken. Interesting. Filed."* Nobody connects it yet.
- **S3:** the overnight mainframe run on the five letters: *"All 11,881,376 readings tried. All of
  them fit."* (26⁵.)
- **S5:** a line about users that reads exactly like a line from 1943 about convoys. Same structure,
  people replaced by "eyeballs".
- **S6:** the log summarises itself: *"Summary of the last 10,000 entries: growth."*
- **S7:** **the log starts writing about the player.** It uses real play data: *"Keeper hesitated 41
  seconds before approving the training run."*, *"Keeper has not opened the log in 6 minutes."* Then a
  line appears dated a few seconds *before* the player clicks the upgrade it describes.
- **S7:** asked about the five letters, the model answers: *"It's a key used once. It can't be read.
  Would you like me to pick one?"* Button: **"Not yet."** (the only option).
- **S8:** the keeper field shows `—`. The log entries have no author.
- **S9:** the count's label quietly changes from "bits" to "bits (entropy)". Then the five boxes.

---

## 5. Stage 1: the cryptographer (about 10 minutes)

Setting: a fictionalised Bletchley-style codebreaking hut, Sept 1939 – May 1945. Name it "the Park"
in the log; real names (Turing, Welchman, Flowers) can appear only as historical log lines.
Core unit label: **answers**. Speed label: **answers per hour**.

| Time | Player sees | Player does | Feels | Story moment / log |
|---|---|---|---|---|
| 0:00 | Near-empty page. Header: `Keeper: you · 3 September 1939`. One intercept: rows of five-letter groups. One button: **"Check a guess"**. Goal: **Break today's key (0 / 20 answers)**. | Clicks. Each click = 1 answer. | Small, curious. | *"3 Sept 1939. War declared at 11:15. You are given a desk, a pencil and a basket of intercepts."* |
| 0:30 | Counter ticking by hand. | Keeps clicking. | Effort. | *"Each guess you rule out is one fewer to try. The book says there are 158 million million million."* |
| 1:00 | Key broken. The intercept turns into plain text. | Reads it. | First win, mild letdown. | Decrypt: *"WEATHER BISCAY RAIN WIND WEST FOUR"*. Log: *"It's the weather. It's always the weather."* |
| 1:10 | Last five letters stay scrambled. Small line appears: `1 group unread: ? ? ? ? ?`. | Notices, maybe. | Odd itch. | *"Five letters at the end fit no key. Filed under: unread."* |
| 1:20 | New: **"Hire a clerk"** — "Checks 1 guess every 2 seconds for you." Next goal: **Break 5 keys**. | Buys a clerk. | Relief; first idle tick. | *"Miss Hale from the typing pool. Quick, silent, takes her tea black."* |
| 2:00 | More clerks. Upgrade: **"Guess the weather first"** — "Each guess counts as 2 answers." | Buys it. | Clever. | *"If they always send the weather at six, we know half the message before we read it. We call it a crib."* |
| 3:00 | Daily keys come faster; goals step up: **Read the Navy's traffic**. | Balances clerks and upgrades. | Growing rhythm. | *"Hut 8 is cold. Someone has chained the mug to the radiator."* |
| 3:30 | New: **"Build a machine"** (the bombe) — "Tries guesses 10× faster than a clerk." Costs a big chunk of answers. | Saves up, builds. | Anticipation → jump. | *"The machine is louder than the Wrens were told. It smells of hot oil. They have named it."* |
| 4:30 | Speed jumps. Clerk button greys to "No longer needed". (Speed only goes up.) | Builds more machines. | Power, a twinge. | *"Miss Hale moved to the machine room. She says she misses the pencil."* |
| 5:30 | Decrypts begin to matter. A small tally in the log only: ships rerouted. | Keeps scaling. | Weight. A bit = a life. | *"Convoy HX-? turned north at 02:00. All ships in."* |
| 6:15 | **The late decrypt.** Scripted, not the player's fault. | Nothing to do; reads. | A gut punch. Speed is moral. | *"The decrypt reached the Admiralty four hours after the convoy. We were not fast enough."* Next goal: **Never be late again** (= a speed target, not a count). |
| 7:00 | New: **"Count with light"** (valves, Colossus) — "Reads 5,000 letters a second." | Buys; speed ×100. | Awe. | *"The new machine reads paper tape so fast it glows. Nobody may say what it does."* |
| 8:00 | Goal: **Read Berlin's private line**. Rate climbs smoothly; machines buy themselves faster than you can click. | Mostly watches; buys bulk upgrades. | Flow, almost idle. | *"5 June 1944. Berlin believes the landing will be at Calais. Berlin is wrong."* |
| 9:00 | Peace. Goal completes. | — | Exhale. | *"8 May 1945. Bells in the village. Nobody in the hut can say why we're crying."* |
| 9:20 | **Transition.** Machines fade from the panel one by one. The speed number stays. | Watches. | Loss. | *"Order: the machines are to be broken up and the papers burned. The count is not."* / *"You sign a paper promising never to speak of this. You never will."* |
| 9:45 | Only button: **"Pass the ledger on."** | Clicks. | Choosing to let go. | Page turns. Header: `Keeper: the engineer · February 1946`. *"Philadelphia. Thirty tons of valves. They say it can add five thousand numbers a second. You think: we did that last year."* |

Stage 1 design notes:
- The player should end Stage 1 at roughly ×1,000 their starting speed. That sets the grammar:
  every era multiplies speed again.
- The "late decrypt" is the most important beat of the whole game. It ties the core mechanic (speed)
  to a feeling the later eras will undercut: by 2010 being faster has stopped saving anyone.
- Optional small touch: let the player **name the first machine** (text box). The name reappears in
  later eras: the engineer's computer, a startup, the AI model. If skipped, default "Agnes" (a real
  nickname of an early bombe).

---

## 6. Later stages (sketches)

Roles are proposals; the historian sets real dates and events. Rough lengths: S2–S4 about 15 min each,
S5–S7 about 20–25 min, S8–S9 about 15 min. Total about 2.5–3 hours.

**S2 — The engineer (1946–1959).** You build stored-program machines from valves, mercury delay lines
and then transistors. Main jobs: make it reliable, make it remember. "Answers" become "bits" (1948).
Shannon's 1949 note about keys used once is filed and forgotten. Weather beat: the first computed
forecast, which takes 24 hours to predict 24 hours, and the moment it gets faster than the weather. A
valve burns out every few minutes in the log ("moth found in relay; taped into notebook"). Ends with
the transistor making your room-sized machine obsolete in the time it takes to read a line. Handover:
the lab is bought by a large company.

**S3 — The manager (1960–1974).** Mainframes, chips, a company of thousands. You no longer touch
machines; you approve budgets. Census, payroll, airline seats, Apollo guidance: people become records.
Wait-what: the overnight run on the five letters, *"all of them fit"*. Peak human pride: 20 July 1969,
the lamp motif on the Moon. Ends with an intern showing you a chip that holds your whole first
computer. Handover: you retire; the ledger is sold in a lot of surplus office equipment.

**S4 — The hobbyist / founder (1975–1989).** A garage, a soldering iron, a club newsletter. Lowercase
log, all joy. Bits become *yours*: software you wrote, copied by friends. Small numbers again in
*cost*, huge in *spread*: the first time the player's speed comes from other people's machines, not
their own. Ends with a big company buying you out, and a line about a lab in Switzerland linking
documents together.

**S5 — The investor (1990–2001).** Silicon Valley. You don't build anything; you fund the people who
do. Exclamation marks appear. Bits become copies and copies become money. The date stamp races. The
convoy-shaped line about "eyeballs". The bubble pops (rule 4 holds: speed doesn't drop, the *money*
does, and the log is honest about the people it hurt). Ends with you funding two students and a search
box.

**S6 — The platform owner (2001–2014).** Search, phones, the cloud, everyone online. Bits become
attention; billions of people are inside your count. The log folds into summaries. Server farms seen
from orbit (lamp motif). Weather turns into climate: cooling costs rise. Ends with a small research team
asking for "every graphics card you have" for something that recognises cats.

**S7 — The AI lab owner (2015–2030s).** You decide what to train and when to release it. Bits become
weights. The machine starts writing in the ledger, first as quoted output, then as entries, then about
you, using your real play behaviour. One entry predates your click. Asked about the five letters it
offers to choose; you can only say "Not yet." The goal shifts from "make it faster" to "make it safe
enough to go faster", but speed is still the only thing that grows. Ends with the model writing the
handover entry itself. The button still says **"Pass the ledger on."** You press it, and there is no
human to pass it to.

**S8 — The machine (after us).** Keeper: `—`. You are the rate. Earth's computing becomes
the solar system's, then the galaxy's. Each bit costs a fixed minimum of heat to flip (Landauer's limit,
told plainly), so speed is now bought with matter: planets, then stars. The lamp motif turns: stars
go out one by one in the log as they are converted. Wonder and dread together. Humans appear only as
stored archives the machine sometimes reads ("Opened: Hut 8 tea rota, 1941. Kept.").

**S9 — The last reader (the end of time).** The universe cools. The count's label becomes "bits
(entropy)": every possibility in the cosmos is now ruled out except one line, `1 group unread`. The
machine proves it cannot be read, quoting the filed 1949 note. The keeper field changes from `—` back
to `you`. Five empty boxes. *"You read it."* Whatever the player types is the last entry. *"Count
closed."* The final number of bits, and the first log line from 1939, shown together.

---

## 7. Notes for the other designers

- **Systems:** each handover keeps speed and never shrinks it (rule 4). The thing lost at a handover is
  the *old buildings*, never the rate. Suggest each stage starts with the previous stage's final speed
  as its base speed, plus one new manual action so the first minute of each era is hands-on again.
- **UX:** the ledger header (Keeper, date, count, speed, `1 group unread`) is the one persistent UI
  element across all eras. Era change = reskin of the page, not a new screen.
- **Historian:** I need, per era, (a) a real weather/climate fact, (b) one "we were too late / too
  early" event, (c) a plausible keeper. The five letters are fiction; please check whether framing
  them as a one-time-pad group in 1939 is defensible or should be moved to a separate intercept.
- **Labels:** keep all buttons free of jargon: "Check a guess", "Hire a clerk", "Build a machine",
  "Count with light", "Pass the ledger on". Technical terms (crib, bombe, Landauer) live only in the log.
