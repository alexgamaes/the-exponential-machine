// Stage 2 — The Computing Lab (1946–1971).
// Pure data. Numbers: design/06-stage2.md (changed since stage2/04-systems.md). History: 01-historian.md. Story: 02-plot.md.
// Merged design: design/06-stage2.md. Every total in a condition counts from the start of this stage.

const C = 'computer', M = 'mainframe';

export const STAGE2 = {
  id: 2,
  era: '1946',
  role: 'Director of a computing lab',
  title: 'Stage 2 · The computing lab',
  startDate: '1946-02',
  // The counter keeps saying "checks" until Shannon's beat; then the same number is called "operations".
  unit: 'operations',
  unitBefore: 'checks',
  unitRenameBeat: 'shannon',
  clickLabel: 'Run a calculation',
  // What a typical player brings from Stage 1 (sim: 19,000–34,000 per second, 27,000 or less outside greedy play; about 0.2 M left over).
  arrival: { legacyRate: 23000, ops: 200e3, lifetime: 3.5e6, clicks: 1500, time: 660 },
  // A click is worth 5% of the speed you carried over (so the first press is in the thousands, not +1).
  clickLegacyFrac: 0.05,
  // Speedometer: ENIAC's 1950 forecast took about 24 hours at ~5,000 operations per second.
  task: { label: "Forecasting tomorrow's weather", size: 24 * 3600 * 5000 },
  compare: { rate: 5000, one: 'one ENIAC', many: '{n} ENIACs' },
  legacy: 'The computing lab, 1946–71',
  text: {
    team: 'Your lab',
    total: 'Made since 1946: {n}',
    goal: 'Run {n} {unit} in total to {goal}',
    lifetime: 'Run {n} {unit} in total',
    clicks: 'Run {n} calculations by hand',
    away: 'your lab ran {n} {unit}',
    teamComplete: 'The lab is complete. Every operation now goes to the Moon.',
  },
  promotions: [
    { when: { upgrade: 'magneticTape' }, role: 'Head of computing services' },
    { when: { upgrade: 'chips' }, role: 'Director, computing division' },
  ],

  // Selling computer time: a share of your speed goes to customers for dollars. Mainframes cost dollars.
  // Each customer adds demand (operations per second they will pay for) and arrives with a ledger line.
  market: {
    title: 'Sell computer time',
    intro: 'Customers pay for part of your computer time. Money buys mainframes and some ideas.',
    label: 'Sell',
    reveal: { upgrade: 'magneticTape' },
    price: 0.1,                       // dollars per operation sold
    levels: [0, 0.25, 0.5, 0.75],
    customers: [
      { id: 'census', name: 'the Census Bureau', demand: 100e3, when: { upgrade: 'magneticTape' }, date: '1951-03', kind: 'milestone',
        text: 'Your first customer: the Census Bureau has more to count than its new machine can manage. It will pay for your spare hours.' },
      { id: 'teaShops', name: 'a tea company', demand: 150e3, when: { after: 'magneticTape', delay: 18 }, date: '1951-11',
        text: 'A chain of tea shops has its own computer for pricing cakes, and still rents yours for the payroll. Of course it is a tea company.' },
      { id: 'insurer', name: 'an insurance company', demand: 300e3, when: { after: 'coreMemory', delay: 46 }, date: '1954-10',
        text: 'An insurance company rents time to work out how long its customers will live. It pays on the first of the month.' },
      { id: 'bank', name: 'a bank', demand: 600e3, when: { after: 'washington', delay: 8 }, date: '1958-06',
        text: 'A bank wants its cheques read by machine: magnetic ink, thirty-three thousand an hour. It pays by the cheque.' },
      { id: 'airline', name: 'an airline', demand: 1.5e6, when: { after: 'timeSharing', delay: 6 }, date: '1961-12',
        text: 'An airline wants every seat on every flight in one machine, answered while the customer waits on the phone.' },
      { id: 'universities', name: 'every university', demand: 3e6, when: { after: 'oneFamily', delay: 6 }, date: '1964-05',
        text: 'Every university wants computer time. The queue of students with card decks runs past midnight.' },
    ],
  },

  producers: [
    {
      id: C, name: 'Computers', short: 'computers', verb: 'Build', buyLabel: 'Build a computer',
      each: 'Each runs {out} {unit} per second.',
      baseCost: 300e3, growth: 1.17, output: 3500,
      reveal: {},
    },
    {
      id: M, name: 'Mainframes', short: 'mainframes', verb: 'Install', buyLabel: 'Install a mainframe',
      each: 'Each runs {out} {unit} per second.',
      baseCost: 600e3, growth: 1.2, output: 60e3, currency: 'dollars',
      reveal: { upgrade: 'magneticTape' },
    },
  ],

  upgrades: [
    {
      id: 'programmers', name: 'Programmers wanted', cost: 300e3,
      text: 'Computers work 1.25× faster.',
      effect: { type: 'producerMul', target: C, value: 1.25 },
      reveal: { owned: { [C]: 1 } }, date: '1946-03',
      log: 'Your first clerk from 1939 answers the advert. She is a programmer now. She keeps a pencil behind her ear anyway.',
    },
    {
      id: 'summerCourse', name: 'A summer course', cost: 500e3,
      text: 'Computers work 1.5× faster.',
      effect: { type: 'producerMul', target: C, value: 1.5 },
      reveal: { owned: { [C]: 3 } }, date: '1946-08',
      log: 'Twenty-eight people spend a summer in a hot Philadelphia classroom. They leave with notes, and many go home to build machines of their own.',
    },
    {
      id: 'faultLog', name: 'A logbook for faults', cost: 820e3,
      text: 'Computers work 1.25× faster.',
      effect: { type: 'producerMul', target: C, value: 1.25 },
      reveal: { lifetime: 1.6e6 }, date: '1947-09',
      log: '15:45. A moth is found in relay seventy. Someone tapes it into the logbook: first actual case of bug being found.',
    },
    {
      id: 'storedProgram', name: 'Programs in memory', cost: 1.3e6,
      text: 'Computers work 1.5× faster.',
      effect: { type: 'producerMul', target: C, value: 1.5 },
      reveal: { lifetime: 2.6e6 }, date: '1948-06',
      log: 'Manchester. The program lives inside the machine now, not in its cables. It runs for fifty-two minutes and gets the right answer.',
    },
    {
      id: 'subroutines', name: 'A library of subroutines', cost: 2.2e6,
      text: 'Everything works 1.25× faster.',
      effect: { type: 'globalMul', value: 1.25 },
      reveal: { lifetime: 4.4e6 }, date: '1949-05',
      log: 'Cambridge keeps a cupboard of tested routines on paper tape: sines, square roots. Nobody writes the same thing twice.',
    },
    {
      id: 'weather', name: 'Weather forecasts', cost: 3.7e6,
      text: 'Computers work 1.5× faster.',
      effect: { type: 'producerMul', target: C, value: 1.5 },
      reveal: { lifetime: 7.4e6 }, date: '1950-04',
      log: 'ENIAC forecasts tomorrow\'s weather. It takes a day to do it, only just keeping up with the sky. Your machines finish before lunch.',
    },
    {
      id: 'magneticTape', name: 'Magnetic tape', cost: 6.1e6,
      text: 'Unlocks mainframes and selling computer time. Mainframes are paid for with money.',
      effect: { type: 'unlockProducer', target: M },
      reveal: { lifetime: 12e6 }, date: '1951-03',
      log: 'The Census Bureau buys a computer. The country can now be counted on tape instead of punched cards.',
    },
    {
      id: 'coreMemory', name: 'Core memory', cost: 10e6,
      text: 'Mainframes work 1.5× faster.',
      effect: { type: 'producerMul', target: M, value: 1.5 },
      // waits for the 1951–52 story lines, so the ledger stays in date order
      reveal: { owned: { [M]: 2 }, after: 'magneticTape', delay: 70 }, date: '1953-05',
      log: 'Memory is now threaded by hand: thousands of tiny iron rings on copper wire. It remembers even with the power off.',
    },
    {
      id: 'washington', name: 'Two letters from Washington', cost: 16e6,
      text: 'Choose one:',
      effect: {
        type: 'choice',
        // ids match Stage 1's so the sim's --choice flag covers both stages: machines = Defence, people = Space.
        options: [
          { id: 'machines', label: 'Defence money', text: 'Customers pay 1.5× more for your computer time.',
            effect: { type: 'priceMul', value: 1.5 } },
          { id: 'people', label: 'Space money', text: 'Computers get cheaper: each one costs 10% more than the last, not 17%.',
            effect: { type: 'costGrowth', target: C, value: 1.10 } },
        ],
      },
      reveal: { lifetime: 32e6, after: 'coreMemory', delay: 42 }, date: '1958-02',
      log: 'Since Sputnik, Washington is spending. Two letters arrive in the same month, one about defence, one about space. Both offer money. You answer one first.',
    },
    {
      id: 'chips', name: 'Chips', cost: 27e6,
      text: 'Computers work 1.5× faster.',
      effect: { type: 'producerMul', target: C, value: 1.5 },
      reveal: { lifetime: 54e6, upgrade: 'washington' }, date: '1959-07',
      log: 'MEMO. To: Director, computing division. Re: valves. Discontinue. Noyce has printed a whole circuit flat on silicon. Every chip you will ever buy starts on his page.',
    },
    {
      id: 'timeSharing', name: 'Time-sharing', cost: 3e6, currency: 'dollars',
      text: 'Mainframes work 1.5× faster.',
      effect: { type: 'producerMul', target: M, value: 1.5 },
      reveal: { lifetime: 88e6, upgrade: 'chips' }, date: '1961-11',
      log: 'MEMO. Many people now share one mainframe, each at their own typewriter. Every one of them thinks it is theirs alone.',
    },
    {
      id: 'oneFamily', name: 'One family of machines', cost: 60e6,
      text: 'Everything works 1.25× faster.',
      effect: { type: 'globalMul', value: 1.25 },
      reveal: { lifetime: 140e6, upgrade: 'timeSharing' }, date: '1964-04',
      log: 'IBM bets the company on one idea: every machine, large or small, runs the same programs. The bet pays for decades.',
    },
    {
      id: 'moore', name: 'Doubling every year', cost: 80e6,
      text: 'Mainframes work 1.5× faster.',
      effect: { type: 'producerMul', target: M, value: 1.5 },
      reveal: { lifetime: 170e6 }, date: '1965-04',
      log: 'Gordon Moore draws a line through five points and predicts the next ten years. The industry spends fifty making him right.',
    },
    {
      id: 'minicomputers', name: 'Small computers', cost: 100e6,
      text: 'Computers work twice as fast.',
      effect: { type: 'producerMul', target: C, value: 2 },
      reveal: { lifetime: 240e6 }, date: '1965-06',
      log: 'MEMO. A computer the size of a fridge, cheap enough for one laboratory. Purchasing asks if we want a dozen. We do.',
    },
    {
      id: 'wovenMemory', name: 'Woven programs', cost: 140e6,
      text: 'Mainframes work 1.25× faster.',
      effect: { type: 'producerMul', target: M, value: 1.25 },
      reveal: { lifetime: 320e6 }, date: '1966-03',
      log: 'The Moon computer\'s program is sewn by hand: wire through a ring is a one, around it a zero. One wrong stitch, one wrong instruction.',
    },
  ],

  goal: {
    id: 'moonComputer', name: 'Build a computer for the Moon', lifetime: 1.3e9,
    text: 'A computer small enough to fly. Everything works 3× faster.',
    effect: { type: 'globalMul', value: 3 },
    date: '1966-08',
    log: 'A computer the size of a suitcase, made of four thousand chips. It is slower than your mainframes. It only has to be right.',
  },

  // when: { lifetime } (this stage) | { clicks } | { owned } | { after, delay } | { legacyTimes: k } (speed >= k × legacy)
  // hush: seconds of quiet after the line (no new cards, no other story lines).
  beats: [
    { id: 'start', when: {}, date: '1946-02',
      text: 'February 1946. A university gives you two empty rooms, a budget and no machine. You cannot tell them you have done this before.' },
    { id: 'firstJob', when: { clicks: 1 }, date: '1946-02',
      text: 'First job: a firing table for the army. Your old clerks would have needed a month.' },
    { id: 'sixWomen', when: { clicks: 30 }, date: '1946-02',
      text: 'In Philadelphia, six women set up ENIAC\'s public demonstration by hand. The dinner that night honours the men who built it.' },
    { id: 'firstComputer', when: { owned: { [C]: 1 } }, date: '1946-02',
      text: 'Your first machine: a room of glowing valves. When one dies, you find it by the dark.' },
    { id: 'moonPicture', when: { after: 'programmers', delay: 12 }, date: '1946-04',
      text: 'Someone pins a picture of the Moon above the door. Nobody admits to it.' },
    { id: 'transistor', when: { after: 'faultLog', delay: 10 }, date: '1947-12',
      text: 'At Bell Labs, a sliver of germanium and a wire of gold amplify a voice. It is the size of a fingernail. Interesting. Filed.' },
    { id: 'shannon', when: { after: 'storedProgram', delay: 8 }, date: '1948-07', kind: 'milestone',
      text: 'Shannon at Bell Labs gives information a unit: the bit. Engineers have a word for what you count too. Operations. The number stays.' },
    { id: 'overtaken', when: { legacyTimes: 3 },
      text: 'Your new machines now outrun everything you did in the war. Nobody here knows what that means. You do.' },
    { id: 'turingAsks', when: { after: 'weather', delay: 15 }, date: '1950-10',
      text: 'Turing, the shy mathematician from the train, asks in print whether machines can think. Few people take the question seriously yet.' },
    { id: 'conviction', when: { after: 'magneticTape', delay: 38 }, date: '1952-03',
      text: 'Turing is in the papers. Not for the war; no one may know about the war. He is convicted for loving a man.' },
    { id: 'election', when: { after: 'magneticTape', delay: 55 }, date: '1952-11',
      text: 'Election night. With a few votes counted, a computer predicts a landslide. The men around it think it is broken and say the race is close.' },
    { id: 'election2', when: { after: 'magneticTape', delay: 64 }, date: '1952-11',
      text: 'It was a landslide. The machine was right. It was only early.' },
    { id: 'turingDeath', when: { after: 'coreMemory', delay: 12 }, date: '1954-06', hush: 25,
      text: 'June 1954. Alan Turing is found dead at home. He was forty-one. You knew what he did in the war, and you still cannot say it.' },
    { id: 'fortran', when: { after: 'coreMemory', delay: 38 }, date: '1957-04',
      text: 'FORTRAN arrives. Physicists write formulas and the machine writes its own instructions. Programmers fear for their jobs. Soon there are far more of them.' },
    { id: 'kilby', when: { after: 'washington', delay: 20 }, date: '1958-09',
      text: 'Kilby is too new at Texas Instruments for a summer holiday, so he works alone. In September, a whole circuit works on one chip.' },
    { id: 'kennedy', when: { after: 'chips', delay: 8 }, date: '1961-05',
      text: 'The President says: the Moon, before the decade is out. Someone takes the picture down from above the door and frames it.' },
    { id: 'glenn', when: { after: 'timeSharing', delay: 15 }, date: '1962-02',
      text: 'John Glenn will not fly until Katherine Johnson checks the machine\'s sums by hand. She does. He flies.' },
    { id: 'cray', when: { after: 'oneFamily', delay: 15 }, date: '1964-09',
      text: 'MEMO. A small team in Wisconsin delivers a computer three times faster than anything else. The chairman of IBM still wants to know how.' },
  ],

  // After the Moon computer: the last actions of the stage. No new machines from here.
  finale: [
    { id: 'apollo8', name: 'Fly around the Moon', cost: 200e6,
      text: 'Send three people around the Moon and bring them back.',
      date: '1968-12',
      log: 'Christmas Eve 1968. Three men go around the Moon and photograph the Earth rising over the grey: one lamp in the dark.' },
    { id: 'apollo11', name: 'Land on the Moon', cost: 400e6,
      text: 'Ends this stage.',
      date: '1969-07',
      log: '20 July 1969. Six minutes from the surface, the Moon computer flashes an alarm: 1202. It is overloaded.' },
  ],

  ending: [
    { date: '1969-07', text: 'It drops the small jobs and keeps the ones that matter. Houston says go.' },
    { date: '1969-07', text: 'Seconds of fuel left. The Eagle has landed. This time, we were fast enough.' },
    { date: '1969-10', text: 'UCLA calls the Stanford Research Institute by computer. They type L, then O, then the system crashes. The first message is LO.' },
    { date: '1970-06', text: 'Your first clerk retires. She leaves you her pencil.' },
    { date: '1971-06', text: 'Your division has a building and its own cafeteria. The machines fill three floors. Every year the same work fits in less space.' },
  ],
  next: {
    date: '1971-11',
    text: 'November 1971. A magazine advert: a computer on a chip, 2,300 transistors, under a fingernail. You think of your three floors.',
  },
};
