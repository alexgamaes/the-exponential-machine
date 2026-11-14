// Stage 3 — The Garage (Nov 1971 – Jan 1984).
// Pure data. Merged design: design/07-stage3.md. Numbers: stage3/04-systems.md (tuned with sim/simulate.mjs).
// History: stage3/01-historian.md. Story: stage3/02-plot.md. Every total in a condition counts from the start of this stage.
//
// The new thing: you launch models. The lab keeps designing the next computer; you choose when to launch it.
// Workbenches and factories (paid with money) make computers; every computer sold keeps running in someone's
// home at its model's speed. Redesign: design/stage3/13-merged-redesign.md (from 11-game-design, 12-ux).

const W = 'workbench', F = 'factory';

export const STAGE3 = {
  id: 3,
  era: '1971',
  role: 'Garage founder',
  title: 'Stage 3 · The garage',
  startDate: '1971-11',
  unit: 'operations',
  clickLabel: 'Run a program',
  // What a typical player brings from Stage 2 (sim: 2.8–3.3×10⁷ per second; about 6×10⁸ left over).
  arrival: { legacyRate: 3e7, ops: 6e8, lifetime: 2.5e9, clicks: 2000, time: 1400 },
  clickLegacyFrac: 0.05,
  startDollars: 1300,                 // Stage 2's money stays with the division
  // Speedometer: looking nine moves ahead in chess, about 35^9 positions (Belle, 1980).
  task: { label: 'Checking every chess game nine moves ahead', size: 7.9e13 },
  compare: { lead: 'All your computers together are as fast as', rate: 1.6e8, one: 'one Cray-1 supercomputer', many: '{n} Cray-1 supercomputers', part: '{n}% of a Cray-1 supercomputer' },
  legacy: 'The garage, 1971–84',
  homes: { output: 3.5e4 },           // operations per second from one Model 1 in a home
  text: {
    team: 'Your garage',
    total: 'Made since 1971: {n}',
    goal: 'Run {n} {unit} in total to {goal}',
    lifetime: 'Run {n} {unit} in total',
    clicks: 'Run {n} programs by hand',
    away: 'the computers in homes ran {n} {unit}',
    teamComplete: 'The factories are full. Every operation now goes to the last two jobs.',
  },
  promotions: [
    { when: { upgrade: 'inABox' }, role: 'Founder and president' },
    { when: { after: 'chips', delay: 8 }, role: 'Chairman of the board' },
  ],

  // Launching models. Lab: next model = 1 + (limit − 1)·k/(1 + k), k = p³, p = age / (labTime·√(limit − 1)).
  // Buyers = (markets + wordOfMouth × homes) × freshness; freshness = surge at launch, halves every fadeHalf s, floor fadeFloor.
  market: {
    kind: 'models',
    title: 'Your computers on sale',
    reveal: {},
    price: 1000,                      // money per computer sold
    labMax: 1.8, labTime: 65, labShape: 3,
    minRatio: 1.2,                    // you can launch once the next model is this much faster
    autoAt: 0.9,                      // the engineers ship it themselves this far towards the limit
    surge: 1.5, fadeHalf: 45, fadeFloor: 0.25,
    wordOfMouth: 0.0015,              // buyers per second added by each computer already in a home
    // What each model is like (ledger). Model 1 is the kit on sale from the start.
    modelLines: {
      2: 'It comes in a wooden case. The hobbyists say it looks like furniture.',
      3: 'It has a keyboard built in. Nobody flips switches to type in a program any more.',
      4: 'It plugs into a television and shows colour.',
      5: 'It loads programs from a cassette tape. One game takes a cup of tea.',
      6: 'It has 16K of memory: as much as a whole lab had when you started.',
      7: 'It has lower-case letters. The typists stop complaining.',
      8: 'It has a disk drive built in.',
      9: 'It shows eighty columns of text, as wide as a typed page.',
      10: 'It is portable: eleven kilos, a five-inch screen and a handle.',
      11: 'It has a sixteen-bit chip.',
      12: 'It has a hard disk of ten megabytes. Nobody can imagine filling it.',
    },
    customers: [
      { id: 'hobbyists', name: 'hobbyists', demand: 6, when: {}, date: '1971-12',
        text: 'A few hobbyists write to ask if they can buy one. They will solder it themselves.' },
      { id: 'clubs', name: 'computer clubs', demand: 20, when: { after: 'cover', delay: 6 }, date: '1975-02',
        text: 'Computer clubs open in garages and school halls. Everyone wants what the others have.' },
      { id: 'shops', name: 'computer shops', demand: 10, when: { after: 'cheapChip', delay: 35 }, date: '1976-07',
        text: 'A shop orders fifty computers and says: assembled, please. Its customers do not own soldering irons.' },
      { id: 'radioShops', name: 'a chain of radio shops', demand: 150, when: { after: 'inABox', delay: 20 }, date: '1977-08',
        text: 'A chain of radio shops plans for three thousand computers. Ten thousand people order one in the first month.' },
      { id: 'accountants', name: 'accountants', demand: 300, when: { after: 'spreadsheet', delay: 6 }, date: '1979-11',
        text: 'Accountants walk into shops asking for the spreadsheet, and buy whatever computer runs it.' },
      { id: 'families', name: 'families', demand: 400, when: { after: 'games', delay: 6 }, date: '1980-06',
        text: 'Families buy a computer "for the children\'s homework". The children play games on it.' },
      { id: 'offices', name: 'offices', demand: 800, when: { after: 'officePC', delay: 8 }, date: '1981-09',
        text: 'Offices put a computer on every desk. The typing pool learns to save its work.' },
    ],
  },

  producers: [
    {
      id: W, name: 'Workbenches', short: 'workbenches', verb: 'Set up', buyLabel: 'Set up a workbench',
      each: 'Each builds {out} computers a second.',
      baseCost: 1000, growth: 1.3, output: 1, currency: 'dollars', makes: 'computers',
      reveal: {},
    },
    {
      id: F, name: 'Factories', short: 'factories', verb: 'Open', buyLabel: 'Open a factory',
      each: 'Each builds {out} computers a second.',
      baseCost: 500000, growth: 1.1, output: 10, currency: 'dollars', makes: 'computers',
      reveal: { upgrade: 'inABox' },
    },
  ],

  upgrades: [
    {
      id: 'eightBit', name: 'Eight bits', cost: 6e8,
      text: 'Better chips: the lab\'s limit goes up by 0.4×.',
      effect: { type: 'labMax', value: 0.4 },
      reveal: {}, date: '1972-04',
      log: 'A terminal maker orders a chip that handles eight bits at once, then decides it does not want it. The chip maker sells it to everyone else.',
    },
    {
      id: 'cover', name: 'On a magazine cover', cost: 2e9,
      text: 'Workbenches build 1.5× more.',
      effect: { type: 'producerMul', target: W, value: 1.5 },
      // waits for the 1972–74 story lines, so the ledger stays in date order
      reveal: { lifetime: 2.5e9, after: 'eightBit', delay: 42 }, date: '1975-01',
      log: 'A magazine puts a computer kit on its cover: $397 and a weekend with a soldering iron. Orders arrive by the sack.',
    },
    {
      id: 'basic', name: 'A language for kits', cost: 7.2e9,
      text: 'Every computer in a home works 1.2× faster.',
      effect: { type: 'producerMul', target: 'home', value: 1.2 },
      reveal: { lifetime: 9e9, after: 'cover', delay: 14 }, date: '1975-03',
      log: 'Two young men sell a BASIC for a machine they have never touched. One finishes the last part on the plane. It runs first time.',
    },
    {
      id: 'cheapChip', name: 'The $25 chip', cost: 2e10,
      text: 'Better chips: the lab\'s limit goes up by 0.6×.',
      effect: { type: 'labMax', value: 0.6 },
      reveal: { lifetime: 2.5e10, after: 'basic', delay: 12 }, date: '1975-09',
      log: 'At a trade show, a new chip is sold from a jar for $25. Its rivals cost seven times as much.',
    },
    {
      id: 'inABox', name: 'Computers in a box', cost: 5.6e10,
      text: 'Unlocks factories. Factories are paid for with money.',
      effect: { type: 'unlockProducer', target: F },
      reveal: { lifetime: 7e10, after: 'cheapChip', delay: 40 }, date: '1977-06',
      log: 'No soldering: take it out of the box and plug it into the television. You register a company and rent an office.',
    },
    {
      id: 'openClosed', name: 'Open or closed', cost: 9e10,
      text: 'Choose one:',
      effect: {
        type: 'choice',
        // ids match the other stages, so the sim's --choice flag covers every stage: machines = Closed, people = Open.
        options: [
          { id: 'people', label: 'Open: eight slots', text: 'Other people build add-ons: each model keeps its buyers twice as long.',
            effect: { type: 'fadeMul', value: 2 } },
          { id: 'machines', label: 'Closed: one sealed box', text: 'You design every part: the lab\'s limit goes up by 0.4×.',
            effect: { type: 'labMax', value: 0.4 } },
        ],
      },
      reveal: { lifetime: 1.1e11, after: 'inABox', delay: 10 }, date: '1977-06',
      log: 'The engineer wants eight slots, so other people can add their own cards. The salesman wants two. You decide.',
    },
    {
      id: 'floppy', name: 'A floppy disk drive', cost: 1e6, currency: 'dollars',
      text: 'Every computer in a home works 1.2× faster.',
      effect: { type: 'producerMul', target: 'home', value: 1.2 },
      reveal: { lifetime: 1.6e11, upgrade: 'openClosed' }, date: '1978-06',
      log: 'Programs on a disk instead of a cassette tape. Loading a game takes seconds, not a cup of tea.',
    },
    {
      id: 'spreadsheet', name: 'A spreadsheet', cost: 2.24e11,
      text: 'Every computer in a home works 1.2× faster.',
      effect: { type: 'producerMul', target: 'home', value: 1.2 },
      reveal: { lifetime: 2.8e11, upgrade: 'floppy' }, date: '1979-10',
      log: 'A sheet of numbers that does its own sums: change one and every total changes with it. Accountants buy a computer just to run it.',
    },
    {
      id: 'games', name: 'Games at home', cost: 8.96e11,
      text: 'Every computer in a home works 1.2× faster.',
      effect: { type: 'producerMul', target: 'home', value: 1.2 },
      reveal: { lifetime: 1.12e12, after: 'spreadsheet', delay: 20 }, date: '1980-05',
      log: 'Roberta Williams writes a murder mystery with pictures. Her husband programs it. They sell it in zip-lock bags.',
    },
    {
      id: 'chips', name: 'Chips for everyone', cost: 1.76e12,
      text: 'Better chips: the lab\'s limit goes up by 0.6×.',
      effect: { type: 'labMax', value: 0.6 },
      reveal: { lifetime: 2.2e12, upgrade: 'games' }, date: '1980-10',
      log: 'Lynn Conway\'s course teaches students to design whole chips. Dozens of class projects share one wafer.',
    },
    {
      id: 'officePC', name: 'Computers for offices', cost: 3.52e12,
      text: 'Everything works 1.25× faster.',
      effect: { type: 'globalMul', value: 1.25 },
      reveal: { lifetime: 4.4e12, after: 'chips', delay: 16 }, date: '1981-08',
      log: 'IBM builds a computer from other people\'s parts. The program that starts it is rented from a small firm near Seattle.',
    },
    {
      id: 'rubberKeys', name: 'Rubber keys', cost: 7.04e12,
      text: 'Better chips: the lab\'s limit goes up by 0.6×.',
      effect: { type: 'labMax', value: 0.6 },
      reveal: { lifetime: 8.8e12, upgrade: 'officePC' }, date: '1982-04',
      log: 'In Britain, a computer with rubber keys costs £125. A generation writes games in its bedroom.',
    },
    {
      id: 'masses', name: 'For the masses', cost: 3e7, currency: 'dollars',
      text: 'Factories build 1.5× more.',
      effect: { type: 'producerMul', target: F, value: 1.5 },
      reveal: { lifetime: 1.28e13, upgrade: 'rubberKeys' }, date: '1982-08',
      log: 'A computer with 64K of memory for $595, sold in toy shops. "For the masses, not the classes."',
    },
    {
      id: 'riverRaid', name: 'A whole river in 4K', cost: 1.44e13,
      text: 'Every computer in a home works 1.2× faster.',
      effect: { type: 'producerMul', target: 'home', value: 1.2 },
      reveal: { lifetime: 1.8e13 }, date: '1982-10',
      log: 'Carol Shaw fits a whole river into a game cartridge: it is not stored, it is worked out from a number as you fly.',
    },
    {
      id: 'lotus', name: 'A spreadsheet that draws', cost: 2.2e13,
      text: 'Every computer in a home works 1.2× faster.',
      effect: { type: 'producerMul', target: 'home', value: 1.2 },
      reveal: { lifetime: 2.8e13 }, date: '1983-01',
      log: 'The new spreadsheet draws its own charts. Offices buy computers in tens.',
    },
  ],

  goal: {
    id: 'everyHome', name: 'Put a computer in every home', lifetime: 7e13,
    text: 'Computers become ordinary. Everything works twice as fast.',
    effect: { type: 'globalMul', value: 2 },
    date: '1983-01',
    log: 'January 1983. A magazine chooses its Person of the Year. This year it is not a person. It is the computer.',
  },

  // when: { lifetime } | { clicks } | { after, delay } | { rate } | { homes: n } | { afterGoal: s }
  beats: [
    { id: 'start', when: {}, date: '1971-12',
      text: 'You leave the division the building, the mainframes and the cafeteria. You take the pencil and the ledger. In a garage, you count your savings: $1,300.' },
    { id: 'firstClick', when: { clicks: 1 }, date: '1971-12',
      text: 'The chip on your bench costs less than a dinner. It is faster than the first room of valves.' },
    { id: 'firstHome', when: { homes: 1 }, date: '1972-01', kind: 'milestone',
      text: 'Your first computer goes to a dentist in Ohio. He does his bills on it. It keeps counting in his house, and the ledger counts it as yours.' },
    { id: 'pong', when: { after: 'eightBit', delay: 10 }, date: '1972-11',
      text: 'In a bar in Sunnyvale, a new tennis game stops working. The coin box is too full.' },
    { id: 'parc', when: { after: 'eightBit', delay: 24 }, date: '1973-03',
      text: 'At Xerox, a computer for one person: windows, a mouse, a printer that uses a laser. Xerox sells copiers.' },
    { id: 'ultra', when: { after: 'eightBit', delay: 36 }, date: '1974-05', kind: 'milestone',
      text: 'May 1974. A book tells the world what happened at Bletchley Park. After thirty years you may say what you did. Your neighbours think you are making it up.' },
    { id: 'homes100', when: { homes: 100 },
      text: 'A farmer keeps his herd on one of your computers. He writes to say the cows have not noticed.' },
    { id: 'homebrew', when: { after: 'cover', delay: 10 }, date: '1975-03',
      text: 'A garage in Menlo Park. Thirty-odd strangers, one kit computer, one rule: share what you know.' },
    { id: 'grandson', when: { after: 'basic', delay: 8 }, date: '1975-06',
      text: 'Your first clerk from 1939 sends her grandson to the garage. He is nineteen and writes programs on squared paper. He recognises the pencil.' },
    { id: 'letter', when: { after: 'cheapChip', delay: 12 }, date: '1976-02',
      text: 'An open letter to hobbyists: stop copying our programs, or nobody will write any. The club reads it aloud and laughs. Not everyone laughs.' },
    { id: 'homes1000', when: { homes: 1000 },
      text: 'A school buys one of your computers. The waiting list to use it is longer than the one for the football team.' },
    { id: 'invaders', when: { after: 'openClosed', delay: 10 }, date: '1978-06',
      text: 'Space Invaders: the aliens speed up as you shoot them, because the chip has fewer to draw. A flaw becomes the game.' },
    { id: 'cray', when: { rate: 1.6e8, after: 'cheapChip', delay: 20 }, date: '1976-03',  // the Cray-1 ships in 1976
      text: 'Your computers in homes, added together, now outrun the fastest supercomputer in the world. Each one is a toy.' },
    { id: 'syntax', when: { after: 'floppy', delay: 8 }, date: '1978-09',
      text: 'A boy at a shop counter types: CAN MACHINES THINK? The computer answers: ?SYNTAX ERROR. He laughs and keeps typing.' },
    { id: 'homes10k', when: { homes: 10000 },
      text: 'A girl of twelve writes a game on hers. The shop sells it in plastic bags by the till.' },
    { id: 'xerox', when: { after: 'spreadsheet', delay: 15 }, date: '1979-12',
      text: 'Xerox shows a young visitor its mouse and its windows. He takes notes.' },
    { id: 'shares', when: { after: 'chips', delay: 8 }, date: '1980-12', kind: 'milestone',
      text: 'The company sells shares. By the evening, forty people in the building are millionaires. The pencil is still in your top pocket.' },
    { id: 'homes100k', when: { homes: 100000 },
      text: 'A writer finishes a novel on one of your computers. She says she will never go back to the typewriter.' },
    { id: 'boys', when: { after: 'rubberKeys', delay: 12 }, date: '1982-06',
      text: 'The adverts all show a boy at the keyboard and his father watching. Your first clerk looks at one for a long time. "In our day, that was a girl\'s job."' },
    { id: 'homes150k', when: { homes: 150000 },
      text: 'A hundred and fifty thousand of your computers are switched on in other people\'s houses. You will never meet most of their owners. They are all still counting.' },
    { id: 'petrov', when: { afterGoal: 2 }, date: '1983-09', hush: 20,
      text: 'September 1983. A Soviet computer reports five American missiles in the air. The officer on duty, Stanislav Petrov, decides it is wrong. It is. Nobody hears about it for fifteen years.' },
  ],

  // After the goal: the last actions of the stage. No new workbenches or factories from here.
  finale: [
    { id: 'classroom', name: 'Put a computer in every classroom', cost: 3e13,
      text: 'Every school gets computers.',
      date: '1983-11',
      log: 'Schools unpack computers by the thousand. A class of ten-year-olds writes its first program before lunch: 10 PRINT "HELLO". 20 GOTO 10.' },
    { id: 'anyone', name: 'Make a computer anyone can use', cost: 6e13,
      text: 'Ends this stage.',
      date: '1984-01',
      log: '24 January 1984. On a stage, a computer with a mouse and pictures instead of commands comes out of a bag. It says, in its own voice: Hello.' },
  ],

  ending: [
    { date: '1984-01', text: 'It does not think. Someone told it what to say. The whole hall stands up anyway.' },
    { date: '1984-01', text: 'Its advert shows a woman throwing a hammer through a giant screen. It is shown once. Everyone remembers it.' },
    { date: '1984-03', text: 'A single street now has more computing in its kitchens than Bletchley Park had in the whole war.' },
    { date: '1984-06', text: 'Cheaper copies of every computer are in the shops now. They all run the same programs.' },
  ],
  next: {
    date: '1984-09',
    text: '1984. The machine no longer matters. What runs on it does. You give the ledger and the pencil to your first clerk\'s grandson. He writes the programs now.',
  },
};
