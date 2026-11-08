// Stage 1 — The Codebreaker (1939–1945).
// Pure data. Numbers come from design/05-game-design.md §4; tune them here or in config.js.
// Dates are 'YYYY-MM'. The header date is the latest date of anything that has happened.

export const STAGE1 = {
  id: 1,
  era: '1939',
  role: 'Codebreaker',
  title: 'The Codebreakers',
  startDate: '1939-09',
  unit: 'checks',
  clickLabel: 'Check a guess',
  // Speedometer: a fixed task whose duration shrinks as you get faster.
  task: { label: "Decoding one day's messages", size: 10000 },
  // How many checks per second one person with a pencil manages (for "as fast as N people").
  personRate: 0.5,

  producers: [
    {
      id: 'clerk', name: 'Clerks', short: 'clerks', verb: 'Hire', buyLabel: 'Hire a clerk',
      each: 'Each checks {out} guesses per second.',
      baseCost: 10, growth: 1.12, output: 0.5,
      reveal: { lifetime: 8 },
    },
    {
      id: 'machine', name: 'Code-breaking machines', short: 'machines', verb: 'Build', buyLabel: 'Build a machine',
      each: 'Each checks {out} guesses per second.',
      baseCost: 600, growth: 1.12, output: 8,
      reveal: { upgrade: 'machineBlueprint' },
    },
  ],

  upgrades: [
    {
      id: 'polishNotes', name: 'Notes from Poland', cost: 15,
      text: 'Each click checks 2 guesses.',
      effect: { type: 'clickMul', value: 2 },
      reveal: { clicks: 10 }, date: '1939-09',
      log: 'Notes from Warsaw, handed over in a forest in July: how to rebuild the enemy machine using nothing but algebra.',
    },
    {
      id: 'nightShifts', name: 'Night shifts', cost: 60,
      text: 'Clerks work twice as fast.',
      effect: { type: 'producerMul', target: 'clerk', value: 2 },
      reveal: { owned: { clerk: 3 } }, date: '1939-11',
      log: 'The hut never closes now. Someone has chained his mug to the radiator so nobody borrows it.',
    },
    {
      id: 'weatherReports', name: 'Weather reports', cost: 180,
      text: 'Each click also adds 5% of your speed.',
      effect: { type: 'clickPct', value: 0.05 },
      reveal: { lifetime: 120 }, date: '1940-01',
      log: 'Every morning a German weather station sends the weather. Every morning it gives us a few words for free. We call them cribs.',
    },
    {
      id: 'punchedSheets', name: 'Punched sheets', cost: 450,
      text: 'Clerks work twice as fast.',
      effect: { type: 'producerMul', target: 'clerk', value: 2 },
      reveal: { owned: { clerk: 10 } }, date: '1940-01',
      log: 'Sheets punched with holes, stacked on a lamp. Where the light shines through all of them, the key is hiding.',
    },
    {
      id: 'machineBlueprint', name: 'A machine that guesses', cost: 1000,
      text: 'Unlocks machines. Each checks 8 guesses per second.',
      effect: { type: 'unlockProducer', target: 'machine' },
      reveal: { lifetime: 600 }, date: '1940-03',
      log: 'The first machine arrives: wardrobe-sized, clattering, smelling of hot oil. They name it Victory.',
    },
    {
      id: 'wiringBoard', name: 'Extra wiring board', cost: 2200,
      text: 'Machines work twice as fast.',
      effect: { type: 'producerMul', target: 'machine', value: 2 },
      reveal: { owned: { machine: 2 } }, date: '1940-08',
      log: 'Welchman adds one board of extra wiring. The machine now spots contradictions we missed. Search times collapse.',
    },
    {
      id: 'scoringSheets', name: 'Scoring sheets', cost: 4500,
      text: 'Clerks work twice as fast.',
      effect: { type: 'producerMul', target: 'clerk', value: 2 },
      reveal: { lifetime: 4000 }, date: '1941-04',
      log: 'Turing needs a unit for weighing evidence, so he invents one: the ban. The clerks score each guess on long sheets printed in Banbury.',
    },
    {
      id: 'wrens', name: 'Wren operators', cost: 8000,
      text: 'Machines work twice as fast.',
      effect: { type: 'producerMul', target: 'machine', value: 2 },
      reveal: { owned: { machine: 6 } }, date: '1941-06',
      log: 'Wrens from the navy now run the machines in shifts, day and night. The noise never stops.',
    },
    {
      id: 'churchillLetter', name: 'Letter to Churchill', cost: 14000,
      text: 'Choose one:',
      effect: {
        type: 'choice',
        options: [
          { id: 'machines', label: 'More machines', text: 'Machines get cheaper: each one costs 7% more than the last, not 12%.',
            effect: { type: 'costGrowth', target: 'machine', value: 1.07 } },
          { id: 'people', label: 'More people', text: 'Each click adds another 15% of your speed.',
            effect: { type: 'clickPct', value: 0.15 } },
        ],
      },
      reveal: { lifetime: 12000 }, date: '1941-10',
      log: 'Four codebreakers write to the Prime Minister over everyone\'s head. Churchill replies in red ink: ACTION THIS DAY.',
    },
    {
      id: 'cardIndex', name: 'Shared card index', cost: 24000,
      text: 'Each machine makes every clerk 2% faster.',
      effect: { type: 'synergy', value: 0.02 },
      reveal: { owned: { machine: 12 } }, date: '1942-01',
      log: 'Every name, place and call sign goes on a card. The clerks check the machines\' answers against a million of them.',
    },
    {
      id: 'capturedCodebook', name: 'Captured codebook', cost: 40000,
      text: 'Everything works 1.5× faster.',
      effect: { type: 'globalMul', value: 1.5 },
      reveal: { lifetime: 35000 }, date: '1942-12',
      log: 'Two sailors drown in a sinking U-boat, passing codebooks up the ladder. Six weeks later the Atlantic can be read again.',
    },
    {
      id: 'americanMachines', name: 'American machines', cost: 65000,
      text: 'Machines work twice as fast.',
      effect: { type: 'producerMul', target: 'machine', value: 2 },
      reveal: { lifetime: 60000 }, date: '1943-03',
      log: 'In Dayton, Ohio, a cash-register company starts building over a hundred machines of its own.',
    },
    {
      id: 'tapeMachine', name: 'Tape-reading machine', cost: 110000,
      text: 'Everything works 1.25× faster.',
      effect: { type: 'globalMul', value: 1.25 },
      reveal: { lifetime: 100000 }, date: '1943-06',
      log: 'A new machine reads two loops of paper tape at once. The tapes stretch, slip and snap. The staff call it Heath Robinson. It mostly works.',
    },
    {
      id: 'postOffice', name: 'Post Office engineers', cost: 180000,
      text: 'Machines work 1.5× faster.',
      effect: { type: 'producerMul', target: 'machine', value: 1.5 },
      reveal: { lifetime: 170000 }, date: '1943-12',
      log: 'At Dollis Hill, Tommy Flowers and his team work day and night on a machine made of valves, partly paid for out of his own pocket.',
    },
  ],

  goal: {
    id: 'colossus', name: 'Build Colossus', lifetime: 650000,
    text: 'The first electronic computer. Everything works 3× faster.',
    effect: { type: 'globalMul', value: 3 },
    date: '1944-02',
    log: 'Flowers was told valves would fail. He built Colossus with sixteen hundred of them. It works, and it is fast.',
  },

  // Story beats: log only, they never change the numbers.
  // when: { lifetime } | { owned: {id: n} } | { after: upgradeId, delay: seconds } | { rate }
  beats: [
    { id: 'start', when: { lifetime: 0 }, date: '1939-09',
      text: '3 September 1939. War is declared at 11:15. You are given a desk, a pencil and a basket of intercepted radio messages.' },
    { id: 'keyspace', when: { lifetime: 25 }, date: '1939-09',
      text: 'Each guess you rule out is one fewer to try. The book says there are 158 million million million.' },
    { id: 'firstClerk', when: { owned: { clerk: 1 } }, date: '1939-09',
      text: 'Your first clerk comes from the typing pool. Quick, silent, takes her tea black.' },
    { id: 'turing', when: { lifetime: 80 }, date: '1939-09',
      text: 'A shy mathematician from Cambridge arrives by train. He will think about this problem more than anyone alive.' },
    { id: 'firstRead', when: { lifetime: 300 }, date: '1940-01',
      text: 'The first message comes out in plain German: WEATHER BISCAY RAIN WIND WEST FOUR. It is the weather. It is always the weather.' },
    { id: 'chairs', when: { owned: { clerk: 10 } }, date: '1940-02',
      text: 'Ten clerks now. The hut is running out of chairs.' },
    { id: 'pencil', when: { owned: { machine: 1 } }, date: '1940-04',
      text: 'Your first clerk is moved to the machine room. She says she misses the pencil.' },
    { id: 'herivel', when: { after: 'machineBlueprint', delay: 30 }, date: '1940-05',
      text: 'Herivel, twenty, pictures a sleepy enemy operator at dawn. A guess about laziness becomes a weapon.' },
    { id: 'convoys', when: { after: 'wrens', delay: 12 }, date: '1941-06',
      text: 'The navy\'s messages can be read. Convoys steer around the waiting U-boats. Ships stop sinking.' },
    { id: 'dark', when: { after: 'churchillLetter', delay: 15 }, date: '1942-02',
      text: 'February 1942. The U-boats add a fourth wheel to their machine. Overnight, the Atlantic goes dark.' },
    { id: 'late', when: { after: 'churchillLetter', delay: 40 }, date: '1942-03',
      text: 'A message is broken at last. It reaches the Admiralty four hours after the convoy was attacked. We were not fast enough.' },
    { id: 'faster', when: { after: 'churchillLetter', delay: 46 }, date: '1942-03',
      text: 'Nobody in the hut says it out loud, but everyone thinks it: faster. We have to be faster.' },
    { id: 'colossusRumour', when: { after: 'americanMachines', delay: 15 }, date: '1943-11',
      text: 'At the Post Office research station, an engineer named Flowers says he can build a machine out of valves. Nobody believes him.' },
  ],

  // After Colossus: the last actions of the stage, bought in order.
  finale: [
    { id: 'dday', name: "Read Berlin's orders", cost: 600000,
      text: 'Confirm the enemy still expects the landings in the wrong place.',
      date: '1944-06',
      log: 'June 1944. Five days before the landings, a second Colossus starts work. Berlin is still watching the wrong beach.' },
    { id: 'winWar', name: 'Win the war', cost: 1200000,
      text: 'Ends this stage.',
      date: '1945-05',
      log: '8 May 1945. Bells ring in the village. Nobody in the hut can say why they are crying.' },
  ],

  // Played in order after the finale, one every few seconds.
  ending: [
    { date: '1945-06', text: 'Orders: the machines are to be broken up and the papers burned. You sign a promise never to speak of it.' },
    { date: '1945-06', text: 'The machines are gone. What you learned is not.' },
  ],
  next: {
    date: '1946-02',
    text: 'Philadelphia, February 1946. Thirty tons of valves called ENIAC. They say it adds five thousand numbers a second. You think: we did that last year.',
  },
};
