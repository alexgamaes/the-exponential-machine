# Stage 3 restart: the plot (narrative designer, Nov 14)

For the "closer to Paperclips" restart (`30-restart-brief.md`). Story only. Systems owns numbers, timings and card names;
the historian owns facts (anything marked (check) needs a look). Triggers use the new mechanics' names: **built**
(computers made), **warehouse** (unsold), **price**, **buyers**, **homes** (sold, still counting), **money**, **chips**
(in stock), **chip price**, **adverts** (advertising level), **workbenches**, **factories**, **cards** (ideas).

## 1. Why the current story is weak
- **It is a list of other people's history.** Pong, Xerox, Space Invaders, Conway, River Raid, Roberta Williams: about 40
  lines of trivia, evenly spaced. Each is true and nicely written; together they say "the industry happened near you".
- **You are not in it.** The keeper appears in four lines (savings, the secret, shares, the pencil). The price, the one
  decision of the last three versions, never reaches the log. Only the home-count lines (dentist, farmer) react to play,
  and they are the best lines in the stage. That is the clue.
- **No want, no cost, no turn.** Stage 1 wants speed and pays with the late decrypt. Stage 2 wants the Moon and pays with
  Turing. Stage 3 wants... a magazine award. Nothing is risked, so nothing lands.
- **The anchors are cameos.** The grandson arrives and is silent until 1984. The 1974 secret is a joke ("your neighbours
  think you are making it up"). Petrov is moving but unrelated to anything the player did.

## 2. The arc in one paragraph
**Want:** for thirty years every machine you touched was behind a locked door, and in 1945 they were broken up. You want
the opposite: machines that leave the building, go into anyone's house and are never taken back. Every computer that
leaves your warehouse keeps counting in a stranger's kitchen. **Cost:** getting them out takes money, and money means
price. Dear builds the factory; cheap fills the houses. The garage becomes a company, the club (the grandson) and the
books pull apart, and the year you are finally allowed to talk about the war is twenty years too late for the one man
you want to tell, while the clerks are not even in the book. **Turn:** 1982–83, the price war. Chips cost almost
nothing, everyone's factories are full, rivals sell below cost and lose fortunes, unsold stock is buried in a desert. The
money vanishes; the homes stay. What the ledger counted all along was never dollars. Then the last locked machine of the
story, in a Soviet bunker, is fast, sure and wrong, and a man says no. A computer anyone can use says hello, and you give
the ledger to the grandson, because what runs on the machines matters now.

Stage 1 was "not fast enough", Stage 2 "fast enough". Stage 3: **fast, and in everyone's hands, and nobody can take it back.**

## 3. Rules for the ledger in this stage
- Main lines (§4) keep date order: a line waits until the one before it has fired (as now).
- Reactive lines (§5) have **no date of their own**: they show the ledger's current date. Each fires once, never during a
  hush, at most one per 20 s, and never two in a row with no main line between, if one is waiting.
- Variants (`if … / else`) pick a text from the state at the moment the line fires. Text with `{n}` shows a live number.
- Nothing here changes a number. No line ends with advice ("lower the price") or an exclamation mark.

## 4. Main ledger lines, in order (~min is normal play)
| # | ~min | Date | Trigger | Line |
|---|---|---|---|---|
| 1 | 0:00 | 1971-11 | stage start | You leave the division the building, the mainframes and the cafeteria. You take the pencil and the ledger. In a garage, you count your savings: $1,300. |
| 2 | 0:04 | 1971-11 | 4 s later | Fifty-five, in a row of garages full of twenty-year-olds. None of them was born when your war ended. |
| 3 | 0:10 | 1971-12 | built 1 | The first one takes you a week and a box of parts. It works. It sits on the bench, counting nothing. |
| 4 | 0:25 | 1971-12 | homes 1 | Your first computer goes to a dentist in Ohio. In 1945 they broke your machines up. This one keeps counting in his house, and the ledger counts it as yours. |
| 5 | 0:50 | 1972-04 | first chips bought | You buy chips by the box now. The man at the distributor's asks what a pensioner wants with forty microprocessors. |
| 6 | 1:20 | 1972-11 | time 80 s | In a bar in Sunnyvale, a new tennis game stops working. The coin box is too full. Anything you can buy, people will buy. |
| 7 | 1:50 | 1973-06 | homes 10 | Ten computers in ten houses. You know every owner by name. One of them rings on Sundays to tell you what it did. |
| 8 | 2:30 | 1974-04 | card: a better chip | The new chip costs $360, and it is finally enough to build a real computer around. |
| **9** | 2:50 | **1974-05** | 12 s after a purchase, after #8; **hush 15** | May 1974. A book tells the world what happened at Bletchley Park. After thirty years you may say what you did. The man you most want to tell has been dead for twenty. (check month) |
| 10 | 3:05 | 1974-05 | after #9's hush | Your first clerk is not in the book. Nobody like her is. Three in four people in those huts were women. She says she never expected to be. (check share) |
| 11 | 3:40 | 1975-01 | time, after #10 | A magazine puts somebody else's kit on its cover. Overnight, everyone has heard of a home computer, including your buyers. *(buyers step up here)* |
| 12 | 4:10 | 1975-03 | after #11 + 25 s | A young man turns up at the garage with the book about Bletchley. He is your first clerk's grandson, nineteen. He wants to know what she did. You tell him. He stays. |
| 13 | 4:30 | 1975-03 | after #12 + 15 s | He takes you to a garage in Menlo Park: thirty-odd strangers, one kit computer, one rule. Share what you know. |
| 14 | 5:00 | 1975-09 | card: the $25 chip (or chip price first below a set level) | At a trade show, a new chip is sold from a jar for $25. Its rivals cost seven times as much. |
| 15 | 5:30 | 1976-02 | time, after #14 | An open letter to hobbyists: stop copying our programs, or nobody will write any. The club laughs. The grandson, a month into his own chess program, does not. |
| 16 | 6:00 | 1976-07 | card: shops (new buyers) | A shop orders fifty computers and says: assembled, please. **if warehouse ≥ 50:** You have them already. The owner asks how. **else:** You have {warehouse}. You promise the rest by Friday and do not sleep. |
| 17 | 6:40 | 1977-03 | factories 1 *(promotion)* | You register a company and rent a building that used to make radios. The pencil gets a desk of its own. |
| 18 | 7:20 | 1977-08 | card: radio shops (new buyers) | A chain of radio shops plans for three thousand computers. Ten thousand people order one in the first month. (check) |
| 19 | 8:10 | 1979-10 | card: the spreadsheet (accountants) | A sheet of numbers that does its own sums. Accountants walk into shops asking for it and buy whatever computer runs it. |
| 20 | 8:40 | 1979-12 | after #19 + 25 s | Your first clerk buys one of your computers. **if price ≥ $1,500:** She pays full price. "I know what the first ones cost." **if price < $600:** She says you are giving them away, and buys a second for the girl next door. **else:** It goes on the kitchen table, where the typewriter was. |
| 21 | 9:20 | 1980-12 | card: selling shares *(promotion)* | The company sells shares. By evening forty people in the building are millionaires. The grandson sells none of his. The pencil is still in your top pocket. |
| 22 | 9:50 | 1981-08 | card: offices (new buyers) | IBM builds a computer from other people's parts. The program that starts it is rented from a small firm near Seattle. Offices buy it because it says IBM. |
| 23 | 10:20 | 1982-06 | after #22 + 30 s, alone 10 s | The adverts all show a boy at the keyboard and his father watching. **if adverts ≥ 3:** Yours too. Your first clerk looks at one for a long time. "In our day, that was a girl's job." |
| **24** | 10:40 | **1982-08** | the price war opens *(twist)* | A rival sells a computer with 64K of memory for $595, in toy shops. "For the masses, not the classes." Your buyers have a new number to compare you with. |
| 25 | 11:10 | 1982-12 | rival price falls again | Another rival cuts to $99 (check). Every shop window is a price now. |
| G | ~11:40 | 1983-01 | goal bought | §6 |
| 26 | — | 1983-09 | after G + 20 s | Trucks bury unsold game cartridges in the New Mexico desert. **if warehouse ≥ (large):** You look at your warehouse and say nothing. **else:** Too many made, too few wanted. |
| **27** | — | **1983-09** | 12 s after a purchase, after #26; **hush 20**; no reward | September 1983. A Soviet computer reports five American missiles in the air. The officer on duty, Stanislav Petrov, decides it is wrong. It is. Nobody hears about it for fifteen years. |
| 28 | — | 1983-10 | after #27's hush | A rival gives up making home computers. It lost hundreds of millions selling them for less than they cost (check). Every one it sold is still switched on somewhere. |
| F1, F2 | — | 1983-11, 1984-01 | finale cards | §6 |

Lines 6, 11, 18, 22 are the only "industry" lines kept, and each one explains a jump the player can see (buyers, demand).
Pong, Xerox (twice), Space Invaders, Conway, River Raid, the zip-lock game, Time's novel writer: cut. Card logs should
follow the same test: does it explain what just happened on screen?

## 5. Reactive lines (state triggers, no own date, each once)
| Trigger | Line |
|---|---|
| warehouse ≥ 1 and buyers 0 for 20 s (early) | Three computers on the shelf. Nobody has asked for one this week. |
| warehouse ≥ 500 for 30 s | The warehouse is full to the door. Every computer in it is switched off. |
| warehouse 0 for 20 s while buyers > 0 | The shop rings again. People are queueing for computers you have not built. |
| chips 0 while trying to build (first time) | Out of chips. The bench goes quiet. You sharpen the pencil. |
| chips bought at ≤ 70% of the recent average price (first time) | You buy a box of chips the week the price drops. Old habit: wait for the other side to make a mistake. |
| chips bought at ≥ 130% of the recent average (first time) | You buy chips at the top of the market. The distributor sends a thank-you card. |
| first price raise | You raise the price. Nobody writes to complain. That worries you more. |
| first price cut | You cut the price. The letters from parents double. So does the accountant's frown. |
| price ≥ $2,000 for 30 s | At this price your buyers are dentists and lawyers. They write polite letters on headed paper. |
| price ≥ $2,500 for 30 s, after #12 | The grandson says the club can no longer afford what you make. He says it once. |
| price below the chip cost of one computer for 20 s | Each computer now costs you more than it brings in. The count does not mind. The bank does. |
| money ≤ $50 (first time after start) | Almost nothing left in the bank. The manager asks what a codebreaker knows about selling computers. Fair question. |
| money ≥ $1,000,000 (first time) | A million dollars. You still keep the accounts in pencil. |
| adverts 1 | Your first advert: a quarter page in a hobby magazine. You wrote it yourself. It has too many words. |
| adverts on television (a later level) | Your advert runs between the football and the news. Your first clerk rings to say she saw it. |
| workbenches 1 | A neighbour's son solders for you after school, paid in pizza and in being allowed to touch the oscilloscope. |
| workbenches 10 | Ten benches. The garage door no longer shuts. The neighbours have stopped asking. |
| no hand-built computer for 120 s, factories ≥ 3 | Nobody here builds a computer by hand any more. The first soldering iron hangs on the wall, next to a picture of the Moon. |
| a hand build while factories ≥ 5 | You build one by hand, for old times' sake. It takes an afternoon. The factories made a few thousand while you did. |
| homes 100 | A farmer keeps his herd on one. He writes to say the cows have not noticed. |
| homes 1,000 | A school buys one. The waiting list to use it is longer than the one for the football team. |
| homes 10,000 | A boy at a shop counter types CAN MACHINES THINK? The computer answers ?SYNTAX ERROR. He laughs and keeps typing. |
| homes 100,000 | A girl of twelve writes a game on hers. The shop sells it in plastic bags by the till. |
| homes 1,000,000 | A million of your computers, added together, outrun the fastest machine in the world. Each one is somebody's toy. (check: 10⁶ × ~0.3 M/s vs a Cray) |
| homes 10,000,000 (if reached) | Ten million computers in other people's houses. You will never meet most of their owners. They are all still counting. |

The warehouse line, the below-cost line and the desert (#26) are the stage's small "late decrypt": not a death, but the
quiet fact that a computer in a warehouse counts for nothing, said in the player's own numbers.

## 6. Goal, finale, ending, handover
- **Goal: "Put a computer in every home"**, story preference: measured in **homes** so the goal bar and the story are the same
  number (systems decides). Line, 1983-01: *January 1983. A magazine chooses its Person of the Year. This year it is not a
  person. It is the computer.*
- **Finale 1: "Put a computer in every classroom"** (1983-11): *Schools unpack computers by the thousand. A class of
  ten-year-olds writes its first program before lunch: 10 PRINT "HELLO". 20 GOTO 10.*
- **Finale 2: "Make a computer anyone can use"** (ends the stage, 1984-01): *24 January 1984. On a stage, a computer with a
  mouse and pictures instead of commands comes out of a bag. It says, in its own voice: Hello.*
- **Ending lines** (4–6 s apart):
  1. 1984-01 · It does not think. Someone told it what to say. The whole hall stands up anyway.
  2. 1984-01 · It costs $2,495. Anyone can use it. Not anyone can buy it.
  3. 1984-02 · Your first clerk asks to try the mouse. She is better at it than you.
  4. 1984-03 · In 1945 they broke up every machine you had. Nobody can break these up: {homes} of them, in other people's houses.
- **Handover** (under Stage 4's divider), 1984: *The machines are everywhere now, and every one is waiting to be told what
  to do. You give the ledger and the pencil to your first clerk's grandson. He writes the instructions.*

## 7. Roles (header)
**Garage founder** (start) → **Head of a computer company** (first factory, 1977, line #17) → **Chairman of the board**
(shares, Dec 1980, line #21). Stage 4 opens with the grandson as "Software company CEO".

## 8. The anchors: keep, and what changes
- **The codebreaker at 55: keep**, and let the age speak (lines 2, 5, the bank manager, the soldering iron on the wall).
- **The grandson: keep, and give him a reason and a side.** He comes because of the book (#12), takes the club's side on
  price (reactive), and the programmers' side on copying (#15, sets up Stage 4). He keeps his shares (#21).
- **The 1974 secret: keep, and make it the first hurt** (#9–10, hush 15): freedom to speak arrives after Turing and
  without the clerks. It is the only hush the player does not see coming.
- **Petrov: keep, but it is the weakest fit.** It is the one anchor nothing the player does touches. It stays because it is
  the last locked machine of the story, the counter-image of a million unguarded ones, and it completes 1942 (too slow) /
  1952 (right, and doubted) / 1983 (wrong, and doubted). No comment from "you". If anything goes, it is this.
- **"A computer anyone can use": keep**, but the stage is about cheapness and the Macintosh was dear; ending line 2 says so.
- **The ledger to the grandson: keep.** It is the stage's thesis: the box stopped mattering; the instructions are next.

## 9. Notes for systems and the lead
- **Twist, story preference: the 1982–83 price war** (a rival price that buyers compare against, falling from $595 to $99).
  It is the narrative turn: money melts, homes stay. Selling shares (1980) works as a promotion with no mechanic.
  The Osborne effect fits the warehouse well, but two twists in the last third crowd the story; keep it as a backup.
- Buyer steps the story explains: hobbyists (start), the magazine cover (#11), shops (#16), radio shops (#18), accountants
  (#19), offices (#22), toy shops and families (#24). Families' games and Britain's rubber keys can be card logs if needed.
- Hushes: #9 (15 s, ~2:50) and #27 (20 s, after the goal). Neither is attached to a purchase or reward.
