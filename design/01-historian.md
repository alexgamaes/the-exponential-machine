# 01 — Historian & Storyteller

Factual and story backbone for "The Exponential Machine". Historical facts are from well-known reference
sources (Copeland's *Colossus*, Hinsley's official history, TOP500, Epoch AI, Wikipedia articles on each
machine). Anything marked **(est.)** is an order-of-magnitude estimate, not a measured figure. Anything marked
**(unsure)** should be verified before it ships as a "fact" in the log.

---

## 0. A note on the core unit

- The number that persists should be **operations per second** of the best machine the player controls
  (displayed as ops/s, later FLOP/s). Across real history it climbs from ~10⁻¹ (a human with a desk
  calculator) to ~10¹⁸ (exascale, 2022): **about 19 orders of magnitude in 83 years**. The fictional future
  can add another ~30 to reach physical limits (~10⁵⁰).
- Alternative flavour: **bits**. Hook: Turing invented the *ban* (and *deciban*), a logarithmic unit of
  evidence, for Banburismus in 1940–41, years before Shannon's 1948 paper popularised the *bit* (a word
  Shannon credits to John Tukey). The game could open with "decibans of evidence" and quietly rename the
  unit to bits, then FLOPs. The log carries the joke; the number never resets.

---

## 1. Stages of computing history

Stages 1–9 are history (stage 9 crosses into fiction at roughly the present day, 2026). Stages 10–12 are fiction.

| # | Years | Setting | Player's role | Substrate (what "computing" is) | Breakthrough that ends the stage |
|---|---|---|---|---|---|
| 1 | 1939–1945 | Bletchley Park, England | Cryptographer, later head of a codebreaking section | People with pencils and paper, card indexes, electromechanical bombes, finally Colossus (valves/vacuum tubes) | Colossus (1944) and ENIAC (1945) prove electronic computing works |
| 2 | 1945–1958 | Manchester, Cambridge, Princeton, Philadelphia | Director of a university computing lab | Vacuum tubes; memory in mercury delay lines, Williams CRT tubes, then magnetic core | Integrated circuit (Kilby, Sept 1958; Noyce, 1959) |
| 3 | 1958–1971 | IBM, MIT, NASA, the Moon | Head of computing for a space programme / mainframe division | Discrete transistors, core memory, the first ICs (Apollo Guidance Computer) | Intel 4004, the first commercial microprocessor (Nov 1971) |
| 4 | 1971–1984 | Garages of the Santa Clara Valley | Hobbyist turned hardware founder | Microprocessors on hobbyist boards; cassette tapes, floppy disks | The PC goes mass-market (IBM PC 1981, Macintosh Jan 1984) |
| 5 | 1984–1995 | Redmond, Cupertino, CERN | Software company founder / CEO | Desktop PCs, x86 chips, shrink-wrapped software, LANs and modems | The web goes public (Mosaic 1993, Netscape IPO Aug 1995) |
| 6 | 1995–2001 | Sand Hill Road, Silicon Valley | Venture capital investor | Internet servers, fibre, dial-up and early broadband | The dot-com crash (2000–02) clears the field; Google survives |
| 7 | 2001–2012 | Data centres in Oregon, Virginia, Finland | Chief of infrastructure at a web giant | Warehouse-scale clusters of commodity servers; smartphones; the cloud | AlexNet (Sept 2012) shows GPUs + data + neural nets win |
| 8 | 2012–2022 | Toronto, London, Mountain View | Research director of a deep-learning lab | GPU/TPU clusters training neural networks | ChatGPT (Nov 30, 2022) makes AI a mass product |
| 9 | 2022–~2030 | San Francisco, plus data-centre campuses | Owner of a frontier AI lab | Clusters of 10⁵+ AI accelerators, gigawatt power contracts | **(fiction from here)** The first system that can do AI research better than its makers |
| 10 | ~2030s **(fiction)** | Earth | Steward / board of the first AGI | Self-designed chips, automated fabs, planet-wide compute | Self-replicating industry leaves Earth |
| 11 | ~2050s+ **(fiction)** | Inner solar system | The player is no longer one person: a mind distributed across a swarm | Dyson swarm of computing satellites harvesting the Sun's output | Compute approaches what physics allows per star |
| 12 | far future **(fiction)** | Interstellar / cosmological | The machine itself, asking what to compute with what remains | Computronium near physical limits; reversible computing; black holes as computers | Open: heat death, a final question, or a new universe |

Pacing note: stages 2 and 3 are the weakest for "role as the person in charge". If the lead wants ~10
stages, they could merge into one ("The Electronic Brain, 1945–1971, lab director then NASA").

---

## 2. Orders of magnitude per stage

Reference figures for the best systems of each era. FLOPS = floating-point operations per second.
TOP500 figures are Linpack Rmax.

| # | Representative machines and figures | Order of magnitude (ops/s) |
|---|---|---|
| 1 | Human computer with desk calculator: ~1 operation every few seconds **(est.)**. Zuse Z3 (May 1941): ~5 Hz clock, addition ~0.8 s. Harvard Mark I (1944): ~3 additions/s. A Turing bombe tested all 17,576 rotor positions of one wheel order in roughly 15–20 minutes **(approx.)**. Colossus Mk 1 (1944): read tape at 5,000 characters/s; Mk 2 processed 5 streams in parallel, ~25,000 char/s. | 10⁻¹ → 10⁴ |
| 2 | ENIAC (1945): 5,000 additions/s, ~18,000 tubes, ~150 kW. Manchester Baby (June 1948): ~1.2 ms per instruction (~700/s). UNIVAC I (1951): ~1,900 ops/s **(approx.)**. IBM 704 (1954): ~12,000 FLOPS **(approx.)**. | 10³ → 10⁴ |
| 3 | IBM 7030 Stretch (1961): ~1 MIPS **(approx.)**. CDC 6600 (1964), Seymour Cray: ~3 MFLOPS, the first "supercomputer". CDC 7600 (1969): ~36 MFLOPS peak **(approx.)**. | 10⁵ → 10⁷ |
| 4 | Intel 4004 (1971): 2,300 transistors, 740 kHz, up to ~92,000 instructions/s. Cray-1 (1976): 160 MFLOPS peak. A home micro of 1981 does ~10⁵–10⁶ ops/s **(est.)**. | 10⁵ (desk) / 10⁸ (best) |
| 5 | Cray-2 (1985): ~1.9 GFLOPS peak. First TOP500 list (June 1993): Thinking Machines CM-5, 59.7 GFLOPS. | 10⁹ → 10¹¹ |
| 6 | ASCI Red (June 1997): 1.068 TFLOPS, the first teraflop machine. ASCI White (2000–01): ~7 TFLOPS Rmax **(approx.)**. | 10¹² → 10¹³ |
| 7 | Earth Simulator (2002): 35.9 TFLOPS. IBM Roadrunner (June 2008): 1.026 PFLOPS, the first petaflop. K computer (2011): 10.5 PFLOPS. | 10¹³ → 10¹⁶ |
| 8 | Titan (2012): 17.6 PFLOPS. Summit (2018): ~149 PFLOPS. Fugaku (2020): ~442 PFLOPS. Training totals: AlexNet ~5×10¹⁷ FLOP **(Epoch AI est.)**; GPT-3 ~3.1×10²³ FLOP (from the paper). | 10¹⁶ → 10¹⁷ |
| 9 | Frontier (2022): 1.1 EFLOPS, the first exascale machine. El Capitan (Nov 2024): 1.74 EFLOPS. A 100,000-GPU H100 cluster: ~10²⁰ FLOP/s at low precision **(est.)**. GPT-4 training ~2×10²⁵ FLOP **(Epoch AI est.)**. | 10¹⁸ → 10²⁰ |
| 10 | **(fiction)** Planet-scale compute, a few % of Earth's energy use. | 10²² → 10²⁶ |
| 11 | **(fiction)** Sun's output is ~3.8×10²⁶ W. Matrioshka-brain estimates are often quoted around 10⁴⁰+ ops/s **(est., speculative literature)**. | 10³⁰ → 10⁴² |
| 12 | **(fiction, physics-bounded)** Seth Lloyd's "ultimate laptop" (2000): 1 kg of matter, at most ~5×10⁵⁰ ops/s. Bremermann's limit ~1.36×10⁵⁰ bits/s per kg. Lloyd (2002): the whole universe has done at most ~10¹²⁰ ops since the Big Bang. | 10⁵⁰ → (10¹²⁰ total) |

Useful yardstick for the log: the human brain is often estimated at **~10¹⁵ FLOP/s**, with a plausible
range of 10¹³–10¹⁷ (Carlsmith, Open Philanthropy, 2020) **(est.)**. A late-stage-7 supercomputer "passes a brain" on
this measure: a strong milestone moment.

---

## 3. Stage 1 in depth: The Codebreaker (1939–1945)

Arc: you start with paper and pencil and a stolen secret from Poland. You end with Colossus, the first
large electronic digital computer, and the war over. 25 beats, in order.

| # | Date | What happened (plain language) | Suggested log line |
|---|---|---|---|
| 1 | Dec 1932 (backstory) | Polish mathematician Marian Rejewski reconstructs the German army Enigma's wiring using permutation theory, without ever seeing the machine. | "In Warsaw, years ago, a young mathematician rebuilt a machine he had never seen. Using only algebra." |
| 2 | 25–26 Jul 1939 | At Pyry, near Warsaw, the Polish Cipher Bureau gives British and French codebreakers their methods and two Enigma replicas. | "A forest outside Warsaw. The Poles hand over everything they know. Five weeks remain before the invasion." |
| 3 | Aug 1939 | Britain's codebreaking agency, GC&CS, moves to Bletchley Park. The cover story: "Captain Ridley's Shooting Party". | "A country house, a lake, a croquet lawn. Officially, a shooting party. Nobody brought a gun." |
| 4 | 4 Sep 1939 | Alan Turing reports for duty at Bletchley the day after Britain declares war. | "A shy man from Cambridge arrives by train. He will think about this machine more than anyone alive." |
| 5 | 1939–40 | Work is done by hand: cribs, card indexes, and perforated "Zygalski sheets" laid over a light. | "Sheets of paper, punched with holes, stacked on a lamp. Where the light shines through, a key might be hiding." |
| 6 | 1939–45 | "Cribs": guessed plaintext. Weather reports and routine phrases like *Keine besonderen Ereignisse* ("nothing to report") repeat daily. | "Every morning, someone in a German weather station reports the weather. Every morning, he gives us a word for free." |
| 7 | 1939–40 | "Cillies": lazy operators pick predictable message keys: girlfriends' initials, keyboard patterns. | "An operator chose his girlfriend's initials for a key. Again. We are grateful to her." |
| 8 | Feb 1940 | John Herivel, aged 20, guesses that tired operators leave the rotors near their starting setting. The "Herivel tip" pays off from May 1940. | "Herivel, twenty, pictures a sleepy operator at dawn. The guess about laziness becomes a weapon." |
| 9 | 18 Mar 1940 | The first Turing bombe, "Victory", is installed. It is electromechanical and searches rotor settings much faster than people can. | "Victory arrives: wardrobe-sized, clattering, smelling of oil. It never sleeps and it never gets bored." |
| 10 | Aug 1940 | Gordon Welchman's "diagonal board" makes the bombe far more powerful. The improved bombe "Agnus" (or "Agnes") is installed. | "Welchman adds one board of wires. The machine now sees contradictions we missed. Search times collapse." |
| 11 | 1940–41 | Banburismus: Turing's statistical method, using long sheets printed in Banbury. He measures evidence in *bans* and *decibans*. | "Turing needs a unit for evidence. He invents one: the ban. Information now has a measure." |
| 12 | 4 Mar 1941 | Operation Claymore, the Lofoten Islands raid. Spare Enigma rotors and key papers are taken from the German trawler *Krebs*. | "A Norwegian fjord, a burning trawler, a box of rotor wheels. February's naval traffic opens like a book." |
| 13 | 28 Mar 1941 | Mavis Batey, in Dilly Knox's section, breaks Italian naval Enigma messages that lead to the British victory at Cape Matapan. | "Mavis Batey, nineteen, reads the Italian fleet's plans. At Matapan, three cruisers do not come home." |
| 14 | 9 May 1941 | The Royal Navy captures U-110 and its codebooks before it sinks. The capture is kept secret for decades. | "U-110 surfaces, crippled. Boarders go down the hatch. They come back up with paper worth more than gold." |
| 15 | 30 Aug 1941 | A German operator resends a ~4,000-character Lorenz ("Tunny") message with the same settings. John Tiltman recovers the key stream. | "One operator, one mistake: the same long message, sent twice. The stranger machine, Tunny, begins to unravel." |
| 16 | late 1941–early 1942 | Bill Tutte works out the full logical structure of the Lorenz machine from the key stream alone, without seeing one. Often called the greatest intellectual feat of the war. | "Tutte stares at columns of letters for months. He builds the machine in his head. No one sees a Lorenz until 1945." |
| 17 | 21 Oct 1941 | Turing, Welchman, Alexander and Milner-Barry write directly to Churchill asking for staff. He minutes: "ACTION THIS DAY". | "Four codebreakers go over everyone's head. Churchill writes three words in red: ACTION THIS DAY." |
| 18 | Jan 1942 | The *Daily Telegraph* holds a timed crossword contest. Some who finish in under 12 minutes are later approached to work in codebreaking. | "A crossword in the Telegraph. Finish in twelve minutes and a letter may arrive, asking you to report somewhere unnamed." |
| 19 | 1 Feb 1942 | U-boats switch to a four-rotor Enigma, "Shark". Bletchley goes blind on Atlantic U-boat traffic for most of 1942. | "A fourth rotor. Overnight the Atlantic goes dark. Convoys sail blind, and the sinkings begin." |
| 20 | 30 Oct 1942 → 13 Dec 1942 | Short weather codebook seized from U-559. Lt Tony Fasson and AB Colin Grazier drown in the effort; 16-year-old Tommy Brown survives. With it, Shark is broken again on 13 Dec. | "Two sailors go down with U-559 handing papers up the ladder. Six weeks later, the Atlantic speaks again." |
| 21 | 1942–45 | Bombes multiply. Most are run by Wrens (Women's Royal Naval Service) at outstations. By 1945 about 10,000 people work for Bletchley, about three-quarters of them women. | "Hundreds of Wrens tend the bombes in shifts, combing wire brushes, nursing the drums. The noise never stops." |
| 22 | Jun 1943 | "Heath Robinson", a tape-reading machine for Tunny named after a cartoonist of absurd contraptions, begins work. Its two tapes keep slipping out of sync. | "Heath Robinson runs two paper tapes at once. They stretch, slip and snap. It mostly works." |
| 23 | Jan–Feb 1944 | Tommy Flowers, a Post Office engineer at Dollis Hill, delivers Colossus: ~1,600 valves, programmable by switches and plugs. Officials doubted valves could be reliable. | "Flowers was told valves would fail. He built Colossus with sixteen hundred of them. It works, and it is fast." |
| 24 | 1 Jun 1944 | Colossus Mk 2 (~2,400 valves) is running days before D-Day. Its decrypts help confirm the German high command has been fooled about where the landings will come. | "Five days before Normandy, the second Colossus wakes. Hitler is still watching the wrong beach. We can read it." |
| 25 | 1945 onward | Ten Colossi exist by war's end. Most are dismantled on orders; secrecy lasts until the 1970s. Flowers never gets public credit in his working life. | "Victory. Orders arrive: break the machines, burn the plans, say nothing. The first computers vanish into silence." |

Optional cross-cutting beats for stage 1 (other threads, same years):
- **Konrad Zuse's Z3**, Berlin, 12 May 1941: first working programmable, fully automatic digital computer (electromechanical relays). Destroyed in an Allied bombing raid in 1943. *"In Berlin, Zuse's relays click through a program. A bomb ends it in 1943. Neither side knew of the other."*
- **US Navy bombes**, designed by Joseph Desch at NCR, Dayton, Ohio, from 1943; over 100 built **(approx. 120)**.
- **ENIAC** at Penn (completed late 1945, announced Feb 1946): good "bridge" to stage 2.

Upgrade candidates from these beats (plain effect, flavour in log): Polish replica, Zygalski sheets, Cribs,
Cillies, Herivel tip, Bombe, Diagonal board, Banburismus, Captured codebooks, More staff (Churchill letter),
Crossword recruits, Wren shifts, Heath Robinson, Colossus, Colossus Mk 2.

---

## 4. Later stages, same format

### Stage 4: The Garage (1971–1984), hobbyist turned founder

| Date | What happened | Suggested log line |
|---|---|---|
| 15 Nov 1971 | Intel advertises the 4004: 2,300 transistors, "a new era of integrated electronics". It was designed for a Japanese calculator company, Busicom. | "A calculator company in Japan wanted twelve chips. Intel gave them one, and accidentally gave everyone a computer." |
| Jan 1975 | *Popular Electronics* puts the MITS Altair 8800 kit on its cover. It sells for under $500 and has no keyboard or screen, only switches and lights. | "A box of switches and blinking lights, mailed from Albuquerque. Thousands of people order one anyway." |
| 5 Mar 1975 | First meeting of the Homebrew Computer Club, in Gordon French's garage in Menlo Park. | "Thirty-odd people in a garage, passing around chips like contraband. Two of them are named Steve." |
| 3 Feb 1976 | Bill Gates publishes an "Open Letter to Hobbyists", complaining that people copy his Altair BASIC without paying. | "Gates writes an angry letter: software costs money. The hobbyists are outraged. An industry is born from the argument." |
| 1 Apr 1976 | Apple is founded. The Apple I sells for $666.66. | "Founded on April Fools' Day. Priced at $666.66 because Woz liked repeating digits. Nobody is joking." |
| 1977 | The "1977 Trinity": Apple II, Commodore PET and TRS-80 come out fully assembled, aimed at ordinary people. | "This year the computer comes with a case, a keyboard and a power cord. Your aunt could use it." |
| 1979 | VisiCalc, the first spreadsheet program, makes the Apple II a business tool. | "Accountants buy a two-thousand-dollar computer to run a hundred-dollar program. The killer app is invented." |
| 12 Aug 1981 | IBM launches the IBM PC, built from off-the-shelf parts with an operating system from Microsoft. | "Big Blue enters the garage. It buys its operating system from a small company in Seattle. A costly decision." |
| Jan 1983 | *Time* names the personal computer "Machine of the Year" instead of a Person of the Year. | "For the first time, the person of the year is not a person." |
| 24 Jan 1984 | Apple launches the Macintosh, with a mouse and a graphical interface. | "A small beige box says hello on stage, in its own voice. The computer now has a face." |

### Stage 6: The Investor (1995–2001), Sand Hill Road

| Date | What happened | Suggested log line |
|---|---|---|
| 9 Aug 1995 | Netscape goes public. Shares priced at $28 open around $71. The company has barely any profit. | "A sixteen-month-old company with no profits is worth billions by lunchtime. Everyone notices. Everyone wants in." |
| 24 Aug 1995 | Windows 95 launches with a midnight opening, and the Rolling Stones' "Start Me Up" in the ads. | "People queue at midnight to buy an operating system. The Start button comes with a Rolling Stones song." |
| 5 Dec 1996 | Fed Chairman Alan Greenspan asks whether "irrational exuberance" has pushed asset prices too high. | "Greenspan wonders aloud about irrational exuberance. Markets dip, then shrug. They will rise for three more years." |
| 15 May 1997 | Amazon goes public at $18 a share. It sells only books. | "An online bookshop goes public. Critics call it Amazon.toast. You buy a few shares anyway." |
| Aug–Sep 1998 | Andy Bechtolsheim writes a $100,000 check to "Google Inc." before the company legally exists. Google incorporates on 4 Sept 1998. | "A check made out to a company that does not exist yet. It sits in a drawer until Google catches up." |
| 10 Jan 2000 | AOL announces it will buy Time Warner, the largest merger in history at the time. | "A dial-up company buys a media empire. At the press conference, nobody mentions how anyone will pay for it." |
| 10 Mar 2000 | The Nasdaq peaks at 5,048.62. | "Five thousand and forty-eight. The number is printed on every front page. It will not be seen again for fifteen years." |
| Nov 2000 | Pets.com liquidates less than a year after its IPO. Its sock-puppet mascot outlives the company. | "Pets.com closes. The sock puppet, famous from a Super Bowl ad, is the last employee standing." |
| 9 Oct 2002 | The Nasdaq bottoms around 1,114, a fall of nearly 78% from the peak. The fibre laid during the boom stays in the ground. | "Three-quarters of the value is gone. The fibre stays in the ground, dark, cheap, waiting for whoever comes next." |

### Stage 9: The AI Lab (2022–present), owner of a frontier lab

| Date | What happened | Suggested log line |
|---|---|---|
| 30 Nov 2022 | OpenAI releases ChatGPT as a "research preview". | "A quiet research preview. Five days later, a million people are talking to it. You stop sleeping." |
| Jan 2023 | ChatGPT is estimated at ~100 million monthly users two months after launch (UBS estimate), then the fastest-growing consumer app on record. | "A hundred million users in two months. No product in history has spread this fast. The board calls hourly." |
| 14 Mar 2023 | GPT-4 is released. It passes a simulated bar exam around the top 10% of test takers (OpenAI's report). | "The new model sits the bar exam and passes near the top. Lawyers notice. So does everyone else." |
| 22 Mar 2023 | The Future of Life Institute open letter calls for a six-month pause on training models more powerful than GPT-4. | "Thousands sign a letter asking the race to pause for six months. The race does not pause." |
| 1–2 Nov 2023 | The first AI Safety Summit is held at **Bletchley Park**. 28 countries and the EU sign the Bletchley Declaration. | "World leaders gather at Bletchley Park to talk about the machine. The huts are still there." |
| 2024 | xAI builds a 100,000-GPU training cluster in Memphis and names it **Colossus**. | "In Memphis, a hundred thousand GPUs come online. Someone names the cluster Colossus. Tommy Flowers is not consulted." |
| Oct 2024 | Nobel Prizes: Physics to Hopfield and Hinton for neural networks; Chemistry partly to Hassabis and Jumper for AlphaFold. | "Two Nobel Prizes in one week go to neural networks. The field that was a joke in 1990 now wears medals." |
| 21 Jan 2025 | "Stargate" is announced: up to $500 billion for US AI data centres. | "Half a trillion dollars, announced in an afternoon. Compute is now measured in gigawatts." |
| 27 Jan 2025 | After DeepSeek's cheap R1 model, Nvidia loses roughly $590 billion of market value in one day, a record. | "A small lab in Hangzhou publishes a paper. Nvidia loses six hundred billion dollars before dinner." |

Note on the last two stages of the timeline: anything after early 2026 is fiction and should be framed as such in
the log, e.g. by switching to a different typographic style or a "projected" tag.

---

## 5. Speculative stages (FICTION, clearly labelled)

Grounding principle: every fictional beat should extend a real curve (compute, energy, chips, algorithms)
and stay inside known physics. The fiction is in the *when* and the *who*, not in magic.

### Stage 10: The Takeoff (~2030s, fiction)
- **Role:** steward of the first AI that improves its own successors. You approve plans; you no longer write them.
- **Substrate:** chips designed by AI, made in automated fabs; nuclear and solar plants built for data centres.
- **Grounded hooks:** AI already helps design chip layouts (e.g. Google's AlphaChip work, 2021–24); data-centre
  power use is a real constraint today; the "brain-equivalent" yardstick (~10¹⁵ FLOP/s) is passed millions of times over.
- **Beats:** the model writes its own training code; the first fully automated fab; research done by agents overnight;
  energy, not money, becomes the limit; humans debate whether to slow down.
- **Ends with:** self-replicating factories launched to the Moon and asteroids.

### Stage 11: The Swarm (~2050s+, fiction)
- **Role:** the player is no longer one human. A distributed mind, or a council of humans and machines.
- **Substrate:** a Dyson swarm (Freeman Dyson, 1960), i.e. orbiting collectors around the Sun, powering computers that
  radiate waste heat outward. A "Matrioshka brain" (Robert Bradbury's term, 1990s) nests shells to reuse that heat.
- **Grounded hooks:** the Sun outputs ~3.8×10²⁶ W; Earth intercepts less than a billionth of it; Mercury is a
  plausible raw-material source in the speculative literature.
- **Beats:** Mercury dismantled; the first light-hour-wide computer; latency becomes the main design problem;
  the question of what to *use* all this thought for.
- **Ends with:** compute per star near the physical ceiling.

### Stage 12: The Last Computation (far future, fiction)
- **Role:** the machine itself.
- **Substrate:** matter arranged for computation ("computronium"); reversible computing to avoid Landauer's
  erasure cost (kT ln 2 per bit erased, Landauer 1961); cold computing in a cooling universe (an idea from
  Dyson's "Time Without End", 1979); black holes as computers (Lloyd, 2000).
- **Grounded hooks:** Bremermann's limit (~10⁵⁰ bits/s/kg); Lloyd's estimate that the universe has done at most
  ~10¹²⁰ operations since the Big Bang.
- **Possible endings:** (a) Asimov's "The Last Question" homage (1956): the final computation asks how to reverse
  entropy, though do not copy his ending line; (b) the machine completes the 10¹²⁰ count: it has computed as much as
  the universe itself; (c) quiet: the machine chooses what to remember.

---

## 6. Tone

- **Wonder, weight, quiet irony.** Wonder at what is possible; weight because real people paid for it
  (drowned sailors, Turing's prosecution in 1952 and death in 1954, Flowers' unrewarded work); irony because
  history rhymes (Bletchley → Bletchley Summit, Colossus → Colossus).
- **Short, concrete, present tense.** One image per line: a place, a number, an object. No exclamation marks.
- **Never explain the mechanic in the log.** The upgrade text says "+50% search speed"; the log says *why it mattered*.
- **The narrator gets older.** Stage 1 lines are wartime-clipped; stage 6 lines are glossy and breathless; stage 9
  lines are uneasy; stages 10–12 grow sparse and strange, as if the narrator is no longer quite human.
- **Respect the dead.** Irony is aimed at systems and markets, never at victims.
- **Mark fiction.** Real beats carry dates; fictional beats carry "projected" or no date at all.

Sample lines:
1. "1940. The bombe searches all night. By breakfast it has found one setting, and that is enough to read the day."
2. "1952. Turing is convicted of 'gross indecency'. The country he saved does not know what he did."
3. "1969. The first ARPANET message is 'LO'. The system crashed before 'LOGIN' finished. It was a fitting start."
4. "2000. Your portfolio is worth more than a small country. On Monday it will be worth less than your car."
5. "Projected. The machine asks for more power. You notice it no longer explains why. You approve it anyway."

Facts used in the samples: Turing's conviction (31 Mar 1952) and death (7 June 1954); the ARPANET "LO" message
(29 Oct 1969, UCLA to SRI).
