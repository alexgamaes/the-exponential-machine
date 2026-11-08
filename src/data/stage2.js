// Stage 2 — The Computing Lab (1946–1971).
// Pure data. Numbers: design/stage2/04-systems.md. History: 01-historian.md. Story: 02-plot.md.
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
      baseCost: 6e6, growth: 1.2, output: 60e3,
      reveal: { upgrade: 'magneticTape' },
    },
  ],

  upgrades: [
    {
      id: 'programmers', name: 'Hire programmers', cost: 300e3,
      text: 'Each click counts twice.',
      effect: { type: 'clickMul', value: 2 },
      reveal: { clicks: 15 }, date: '1946-03',
      log: 'Your first clerk from 1939 answers the advert. She is a programmer now. She keeps a pencil behind her ear anyway.',
    },
    {
      id: 'summerCourse', name: 'A summer course', cost: 500e3,
      text: 'Computers work 1.5× faster.',
      effect: { type: 'producerMul', target: C, value: 1.5 },
      reveal: { owned: { [C]: 3 } }, date: '1946-08',
      log: 'Twenty-eight people spend a summer in a hot Philadelphia classroom. They leave with notes, and every one of them starts building.',
    },
    {
      id: 'faultLog', name: 'A logbook for faults', cost: 820e3,
      text: 'Each click also adds 3% of your speed.',
      effect: { type: 'clickPct', value: 0.03 },
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
      id: 'weather', name: 'Forecast the weather', cost: 3.7e6,
      text: 'Computers work 1.5× faster.',
      effect: { type: 'producerMul', target: C, value: 1.5 },
      reveal: { lifetime: 7.4e6 }, date: '1950-04',
      log: 'The machine forecasts tomorrow\'s weather. It takes a day to do it. For now, it is only just keeping up with the sky.',
    },
    {
      id: 'magneticTape', name: 'Magnetic tape', cost: 6.1e6,
      text: 'Unlocks mainframes. Each runs 60,000 per second.',
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
      log: 'Memory is now woven by hand: thousands of tiny iron rings on copper wire. It remembers even with the power off.',
    },
    {
      id: 'washington', name: 'Two letters from Washington', cost: 16e6,
      text: 'Choose one:',
      effect: {
        type: 'choice',
        options: [
          { id: 'machines', label: 'Defence money', text: 'Mainframes get cheaper: each one costs 12% more than the last, not 20%.',
            effect: { type: 'costGrowth', target: M, value: 1.12 } },
          { id: 'people', label: 'Space money', text: 'Each click adds another 10% of your speed.',
            effect: { type: 'clickPct', value: 0.10 } },
        ],
      },
      reveal: { lifetime: 32e6, after: 'coreMemory', delay: 42 }, date: '1958-02',
      log: 'Sputnik is still beeping overhead. Two new agencies write to you in the same month. Both offer money. You answer one first.',
    },
    {
      id: 'chips', name: 'Chips', cost: 27e6,
      text: 'Computers work 1.5× faster.',
      effect: { type: 'producerMul', target: C, value: 1.5 },
      reveal: { lifetime: 54e6, upgrade: 'washington' }, date: '1959-07',
      log: 'MEMO. Re: valves. Discontinue. Noyce has printed a whole circuit flat on silicon. Every chip you will ever buy starts on his page.',
    },
    {
      id: 'timeSharing', name: 'Time-sharing', cost: 45e6,
      text: 'Mainframes work 1.5× faster.',
      effect: { type: 'producerMul', target: M, value: 1.5 },
      reveal: { lifetime: 88e6 }, date: '1961-11',
      log: 'MEMO. Many people now share one mainframe, each at their own typewriter. Every one of them thinks it is theirs alone.',
    },
    {
      id: 'oneFamily', name: 'One family of machines', cost: 60e6,
      text: 'Everything works 1.25× faster.',
      effect: { type: 'globalMul', value: 1.25 },
      reveal: { lifetime: 140e6 }, date: '1964-04',
      log: 'IBM bets the company on one idea: every machine, large or small, runs the same programs. The bet pays for decades.',
    },
    {
      id: 'moore', name: 'Doubling every year', cost: 80e6,
      text: 'Mainframes work 1.5× faster.',
      effect: { type: 'producerMul', target: M, value: 1.5 },
      reveal: { lifetime: 170e6 }, date: '1965-04',
      log: 'Gordon Moore draws a line through four points and predicts the next ten years. The industry spends fifty making him right.',
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
      log: 'The Moon computer\'s program is sewn by hand: a wire through a ring is a one, around it is a zero. One wrong stitch is one wrong instruction.',
    },
  ],

  goal: {
    id: 'moonComputer', name: 'Build a computer for the Moon', lifetime: 700e6,
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
    { id: 'sixWomen', when: { clicks: 10 }, date: '1946-02',
      text: 'In Philadelphia, six women taught ENIAC its first problem by hand. The dinner that night honours the men who built it.' },
    { id: 'firstComputer', when: { owned: { [C]: 1 } }, date: '1946-03',
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
      text: 'The shy mathematician from the train asks in print whether machines can think. Most readers laugh. He was used to that.' },
    { id: 'tea', when: { after: 'magneticTape', delay: 18 }, date: '1951-11',
      text: 'A chain of tea shops builds its own computer to price its cakes. Of course it is a tea company.' },
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
    { id: 'kennedy', when: { after: 'chips', delay: 20 }, date: '1961-05',
      text: 'The President says: the Moon, before the decade is out. Someone takes the picture down from above the door and frames it.' },
    { id: 'glenn', when: { after: 'timeSharing', delay: 15 }, date: '1962-02',
      text: 'John Glenn will not fly until one woman checks the machine\'s sums with a desk calculator. She does. He flies.' },
    { id: 'cray', when: { after: 'oneFamily', delay: 15 }, date: '1964-09',
      text: 'MEMO. A small team in Minnesota has built a computer three times faster than anything else. The chairman of IBM wants to know how.' },
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
      log: '20 July 1969. Three minutes from the surface, the Moon computer flashes an alarm: 1202. It is overloaded.' },
  ],

  ending: [
    { date: '1969-07', text: 'It drops the small jobs and keeps the ones that matter. Houston says go.' },
    { date: '1969-07', text: 'Seconds of fuel left. The Eagle has landed. It was fast enough.' },
    { date: '1969-10', text: 'UCLA calls Stanford by computer. They type L, then O, then the system crashes. The first message is LO.' },
    { date: '1970-06', text: 'Your first clerk retires. She leaves you her pencil.' },
    { date: '1971-06', text: 'Your division has a building and its own cafeteria. The machines fill three floors. Every year they need less of one.' },
  ],
  next: {
    date: '1971-11',
    text: 'November 1971. A magazine advert: a computer on a chip, 2,300 transistors, under a fingernail. You think of your three floors.',
  },
};
