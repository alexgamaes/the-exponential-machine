// Stage 3 — The Garage (Nov 1971 – Jan 1984).
// Pure data. Design: design/07-stage3.md §11 (merge of stage3/31 game design, 32 screen, 33 story, 34 critique).
// Every total in a condition counts from the start of this stage.
//
// The new thing, closer to Universal Paperclips: you build computers (by hand, then on workbenches and in factories).
// Each one uses a chip and goes into the warehouse. You set the price; buyers take computers from the warehouse.
// Every computer SOLD keeps running in someone's home and adds its speed to yours, forever. Unsold ones do nothing.
// Money buys chips, workbenches, factories and adverts. Operations buy ideas.

const W = 'workbench', F = 'factory';

export const STAGE3 = {
  id: 3,
  era: '1971',
  role: 'Garage founder',
  title: 'Stage 3 · The garage',
  startDate: '1971-11',
  unit: 'operations',
  clickLabel: 'Build a computer',
  clickBuilds: true,                  // the main button builds one computer (it uses a chip); it makes no operations
  // What a typical player brings from Stage 2 (sim: 2.8–3.3×10⁷ per second; about 6×10⁸ left over).
  arrival: { legacyRate: 3e7, ops: 6e8, lifetime: 2.5e9, clicks: 2000, time: 1400 },
  startDollars: 1300,                 // Stage 2's money stays with the division
  // Speedometer: looking nine moves ahead in chess, about 35^9 positions (Belle, 1980).
  task: { label: 'Checking every chess game nine moves ahead', size: 7.9e13 },
  compare: { lead: 'All your computers together are as fast as', rate: 1.6e8, one: 'one Cray-1 supercomputer', many: '{n} Cray-1 supercomputers', part: '{n}% of a Cray-1 supercomputer' },
  legacy: 'The garage, 1971–84',
  homes: { output: 3e5 },             // operations per second from one 1971 computer in a home (chip cards multiply new ones)
  text: {
    team: 'Builders',
    total: 'Made since 1971: {n}',
    goal: 'Run {n} {unit} in total to {goal}',
    lifetime: 'Run {n} {unit} in total',
    clicks: 'Build {n} computers by hand',
    away: 'the computers in homes ran {n} {unit}',
    teamComplete: 'No new builders now. Every dollar and operation goes to the last two jobs.',
  },
  promotions: [
    { when: { owned: { [F]: 1 } }, role: 'Head of a computer company' },
    { when: { beat: 'shares' }, role: 'Chairman of the board' },
  ],

  market: {
    kind: 'shop',
    title: 'The garage',
    reveal: {},
    // Buyers a second = base × buyer ideas × adverts × Open bonus × (refPrice / price)^elasticity × price war.
    base: 1.2, refPrice: 1000, elasticity: 0.7,
    priceStart: 800,
    // Price steps: tidy numbers about 10% apart.
    priceSteps: [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3, 3.3, 3.6, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9],
    adverts: { cost: 2000, growth: 2, mul: 1.25, reveal: { homes: 5 } },
    // Chips: one per computer. The price halves every `half` seconds of the stage and wobbles (seeded, slow).
    // One button buys about `batchSec` seconds of building, rounded (at least `batch`).
    chips: { start: 40, price: 100, half: 230, wobble: 0.25, step: 4, batch: 10, batchSec: 10 },
    // The price war: a rival price that falls in steps. Above it, buyers fall away fast.
    // `loyal`: the share of buyers who stay with you whatever the rival charges.
    war: { beat: 'war', start: 299, floor: 99, fall: 0.85, every: 20, bite: 3, loyal: 0.2 },
    // A sales manager aims for this many seconds of building in the warehouse.
    managerStock: 6,
  },

  producers: [
    {
      id: W, name: 'Workbenches', short: 'workbenches', verb: 'Set up', buyLabel: 'Set up a workbench',
      each: 'Each builds {out} computers a second.',
      baseCost: 600, growth: 1.14, output: 0.5, currency: 'dollars', makes: 'computers',
      reveal: { homes: 3 },
    },
    {
      id: F, name: 'Factories', short: 'factories', verb: 'Open', buyLabel: 'Open a factory',
      each: 'Each builds {out} computers a second.',
      baseCost: 50000, growth: 1.08, output: 6, currency: 'dollars', makes: 'computers',
      reveal: { upgrade: 'inABox' },
    },
  ],

  upgrades: [
    {
      id: 'eightBit', name: 'Eight bits', cost: 1.8e09,
      text: 'Computers you build from now on run 2× as fast.',
      effect: { type: 'genMul', value: 2 },
      reveal: { homes: 15 }, date: '1972-04',
      log: 'A terminal maker orders a chip that handles eight bits at once, then decides it does not want it. The chip maker sells it to everyone else.',
    },
    {
      id: 'cover', name: 'On a magazine cover', cost: 4.5e09,
      text: 'New buyers: computer clubs. 2× buyers.',
      effect: { type: 'buyersMul', value: 2 },
      // waits for the 1972–74 story lines, so the ledger stays in date order
      reveal: { after: 'eightBit', delay: 45 }, date: '1975-01',
      log: 'A magazine puts a computer kit on its cover. Overnight everyone has heard of a home computer. Computer clubs open in garages and school halls.',
    },
    {
      id: 'cheapChip', name: 'The $25 chip', cost: 1e10,
      text: 'Chips cost half as much.',
      effect: { type: 'chipMul', value: 0.5 },
      reveal: { after: 'cover', delay: 26 }, date: '1975-09',
      log: 'At a trade show, a new chip is sold from a jar for $25. Its rivals cost seven times as much.',
    },
    {
      id: 'tray', name: 'Chips by the tray', cost: 2.1e10,
      text: 'Chips cost 30% less.',
      effect: { type: 'chipMul', value: 0.7 },
      reveal: { after: 'cheapChip', delay: 18 }, date: '1976-03',
      log: 'The distributor stops counting your chips one by one. They come on trays now, and cost less by the tray.',
    },
    {
      id: 'shops', name: 'Computer shops', cost: 3.6e10,
      text: 'New buyers: shops. 2× buyers.',
      effect: { type: 'buyersMul', value: 2 },
      reveal: { after: 'tray', delay: 8 }, date: '1976-07',
      log: 'A shop orders fifty computers and says: assembled, please. Its customers do not own soldering irons.',
      variants: [
        { when: { stock: 50 }, text: 'A shop orders fifty computers and says: assembled, please. You have them already. The owner asks how.' },
        { when: {}, text: 'A shop orders fifty computers and says: assembled, please. You have {stock}. You promise the rest by Friday and do not sleep.' },
      ],
    },
    {
      id: 'inABox', name: 'Computers in a box', cost: 6e10,
      text: 'Unlocks factories. Factories are paid for with money.',
      effect: { type: 'unlockProducer', target: F },
      reveal: { after: 'shops', delay: 8 }, date: '1977-06',
      log: 'No soldering: take it out of the box and plug it into the television. You register a company.',
    },
    {
      id: 'openClosed', name: 'Open or closed', cost: 1e11,
      text: 'Choose one:',
      effect: {
        type: 'choice',
        // ids match the other stages, so the sim's --choice flag covers every stage: machines = Closed, people = Open.
        options: [
          { id: 'people', label: 'Open: eight slots', text: 'Others make add-ons for it. Buyers grow with every computer in a home. Good if your warehouse fills up.',
            effect: { type: 'homesBuyers', value: 1e-5 } },
          { id: 'machines', label: 'Closed: one sealed box', text: 'You make every part. Factories build 1.2× more and chips cost half. Good if your warehouse is empty.',
            effect: { type: 'multi', effects: [{ type: 'producerMul', target: F, value: 1.2 }, { type: 'chipMul', value: 0.5 }] } },
        ],
      },
      reveal: { after: 'inABox', delay: 12 }, date: '1977-06',
      log: 'The engineer wants eight slots, so other people can add their own cards. The salesman wants a sealed box. You decide.',
    },
    {
      id: 'standing', name: 'A standing order', cost: 1.5e11,
      text: 'Buys chips by itself whenever you are about to run out.',
      effect: { type: 'autoChips' },
      reveal: { after: 'openClosed', delay: 10 }, date: '1978-02',
      log: 'The chip maker offers a standing order: a tray on your doorstep whenever the last one is nearly empty. At whatever the price is that week.',
    },
    {
      id: 'z80', name: 'A faster chip', cost: 2.4e11,
      text: 'Computers you build from now on run 2.5× as fast.',
      effect: { type: 'genMul', value: 2.5 },
      reveal: { after: 'standing', delay: 8 }, date: '1978-06',
      log: 'Engineers who left the big chip maker build a better chip of their own. It runs everything the old one ran, faster.',
    },
    {
      id: 'spreadsheet', name: 'A spreadsheet', cost: 5.2e11,
      text: 'New buyers: accountants. 1.8× buyers.',
      effect: { type: 'buyersMul', value: 1.8 },
      reveal: { after: 'z80', delay: 10 }, date: '1979-10',
      log: 'A sheet of numbers that does its own sums. Accountants walk into shops asking for it, and buy whatever computer runs it.',
    },
    {
      id: 'games', name: 'Games at home', cost: 9e11,
      text: 'New buyers: families. 2× buyers.',
      effect: { type: 'buyersMul', value: 2 },
      reveal: { after: 'spreadsheet', delay: 10 }, date: '1980-06',
      log: 'Families buy a computer "for the children\'s homework". The children play games on it.',
    },
    {
      id: 'sixteen', name: 'Sixteen bits', cost: 2.1e12,
      text: 'Computers you build from now on run 3× as fast.',
      effect: { type: 'genMul', value: 3 },
      reveal: { after: 'games', delay: 30 }, date: '1981-07',
      log: 'A chip that handles sixteen bits at once. The program you wrote for the eight-bit one still runs, twice as fast.',
    },
    {
      id: 'offices', name: 'Computers for offices', cost: 3.6e12,
      text: 'New buyers: offices. 2× buyers.',
      effect: { type: 'buyersMul', value: 2 },
      reveal: { after: 'sixteen', delay: 8 }, date: '1981-08',
      log: 'IBM builds a computer from other people\'s parts. The program that starts it is rented from a small firm near Seattle. Offices buy computers because IBM sells them.',
    },
    {
      id: 'manager', name: 'A sales manager', cost: 6e12,
      text: 'Sets your price by itself to keep the warehouse nearly empty.',
      effect: { type: 'autoPrice' },
      reveal: { after: 'offices', delay: 8 }, date: '1982-03',
      log: 'You hire a sales manager. He changes the price every Monday and never asks you first.',
    },
    {
      id: 'robots', name: 'Robots on the line', cost: 8.2e12,
      text: 'Factories build twice as much.',
      effect: { type: 'producerMul', target: F, value: 2 },
      reveal: { after: 'manager', delay: 8 }, date: '1982-09',
      log: 'Robot arms place the chips now. The factory runs all night with the lights off.',
    },
    {
      id: 'thirtyTwo', name: 'Thirty-two bits inside', cost: 1.2e13,
      text: 'Computers you build from now on run 3× as fast.',
      effect: { type: 'genMul', value: 3 },
      reveal: { after: 'robots', delay: 8 }, date: '1982-11',
      log: 'A chip with thirty-two bits inside, built for workstations. You put it in a computer for the kitchen table.',
    },
  ],

  goal: {
    id: 'everyHome', name: 'Put a computer in every home', lifetime: 4.5e13,
    text: 'Computers become ordinary. The last two jobs open.',
    date: '1983-01',
    log: 'January 1983. A magazine chooses its Person of the Year. This year it is not a person. It is the computer.',
  },

  // when: { lifetime } | { clicks } | { after, delay } | { beat, delay } | { t } | { homes } | { stock } | { soldOut }
  //       | { chipsOut } | { chipsBought } | { priceAtLeast } | { belowCost } | { priceUps } | { priceDowns }
  //       | { moneyAtLeast } | { moneyBelow } | { ads } | { owned } | { rivalBelow } | { afterGoal }, plus `for: s`
  //       (the condition must hold that long). kind 'react': no date of its own, at most one every 20 s.
  beats: [
    { id: 'start', when: {}, date: '1971-11',
      text: 'You leave the division the building, the mainframes and the cafeteria. You take the pencil and the ledger. In a garage, you count your savings: $1,300.' },
    { id: 'age', when: { t: 5 }, date: '1971-11',
      text: 'Fifty-five, in a row of garages full of twenty-year-olds. None of them was born when your war ended.' },
    { id: 'built1', when: { built: 1 }, date: '1971-12',
      text: 'The first one takes you a week and a box of parts. It works. It sits on the bench, counting nothing.' },
    { id: 'firstHome', when: { homes: 1 }, date: '1972-01', kind: 'milestone',
      text: 'Your first computer goes to a dentist in Ohio. In 1945 they broke your machines up. This one keeps counting in his house, and the ledger counts it as yours.' },
    { id: 'firstChips', when: { chipsBought: 1 }, date: '1972-02',
      text: 'You buy chips by the box now. The man at the distributor\'s asks what a pensioner wants with a hundred microprocessors.' },
    { id: 'homes10', when: { homes: 10 }, date: '1972-06',
      text: 'Ten computers in ten houses. You know every owner by name. One of them rings on Sundays to tell you what it did.' },
    { id: 'pong', when: { after: 'eightBit', delay: 8 }, date: '1972-11',
      text: 'In a bar in Sunnyvale, a new tennis game stops working. The coin box is too full. Anything people can buy, they will buy.' },
    { id: 'secret', when: { after: 'eightBit', delay: 22 }, date: '1974-05', kind: 'milestone', hush: 15,
      text: 'May 1974. A book tells the world what happened at Bletchley Park. After thirty years you may say what you did. The man you most want to tell has been dead for twenty.' },
    { id: 'notInBook', when: { beat: 'secret', delay: 16 }, date: '1974-06',
      text: 'Your first clerk is not in the book. Nobody like her is. Most of the people in those huts were women. She says she never expected to be.' },
    { id: 'grandson', when: { after: 'cover', delay: 10 }, date: '1975-03', kind: 'milestone',
      text: 'A young man turns up at the garage with the book about Bletchley. He is your first clerk\'s grandson, nineteen. He wants to know what she did. You tell him. He stays.' },
    { id: 'club', when: { after: 'cover', delay: 22 }, date: '1975-03',
      text: 'He takes you to a garage in Menlo Park: thirty-odd strangers, one kit computer, one rule. Share what you know.' },
    { id: 'letter', when: { after: 'cheapChip', delay: 10 }, date: '1976-02',
      text: 'An open letter to hobbyists: stop copying our programs, or nobody will write any. The club laughs. The grandson, a month into his own chess program, does not.' },
    { id: 'factory1', when: { owned: { [F]: 1 } }, date: '1977-07', kind: 'milestone',
      text: 'You rent a building that used to make radios. The pencil gets a desk of its own.' },
    { id: 'clerkBuys', when: { after: 'spreadsheet', delay: 20 }, date: '1979-12',
      text: 'Your first clerk buys one of your computers. It goes on the kitchen table, where the typewriter was.',
      variants: [
        { when: { priceAtLeast: 1500 }, text: 'Your first clerk buys one of your computers. She pays full price. "I know what the first ones cost."' },
        { when: { priceBelow: 300 }, text: 'Your first clerk buys one of your computers. She says you are giving them away, and buys a second for the girl next door.' },
      ] },
    { id: 'shares', when: { after: 'games', delay: 10 }, date: '1980-12', kind: 'milestone',
      text: 'The company sells shares. By evening, forty people in the building are millionaires. The grandson sells none of his. The pencil is still in your top pocket.' },
    // The price war (the twist): from here buyers compare your price with the rival's.
    { id: 'war', when: { after: 'games', delay: 25 }, date: '1981-06', kind: 'milestone',
      text: 'A rival sells a colour computer for $299, in toy shops. "Why buy a games machine when you can have a computer?" Your buyers have a number to compare you with now.' },
    { id: 'boys', when: { after: 'offices', delay: 20 }, date: '1982-06',
      text: 'The adverts all show a boy at the keyboard and his father watching. Your first clerk looks at one for a long time. "In our day, that was a girl\'s job."',
      variants: [{ when: { ads: 4 }, text: 'The adverts all show a boy at the keyboard and his father watching. Yours too. Your first clerk looks at one for a long time. "In our day, that was a girl\'s job."' }] },
    { id: 'war2', when: { rivalBelow: 150 }, date: '1982-01',
      text: 'Another rival cuts its price to $99 and keeps cutting. Every shop window is a price now. The money melts. The computers in homes stay where they are.' },
    { id: 'desert', when: { afterGoal: 20 }, date: '1983-09',
      text: 'Trucks bury unsold game cartridges in the New Mexico desert. Too many made, too few wanted.',
      variants: [{ when: { stock: 2000 }, text: 'Trucks bury unsold game cartridges in the New Mexico desert. You look at your own warehouse and say nothing.' }] },
    { id: 'petrov', when: { beat: 'desert', delay: 14 }, date: '1983-09', hush: 20,
      text: 'September 1983. A Soviet computer reports five American missiles in the air. The officer on duty, Stanislav Petrov, decides it is wrong. It is. Nobody hears about it for fifteen years.' },
    { id: 'quit', when: { beat: 'petrov', delay: 21 }, date: '1983-10',
      text: 'A rival gives up making home computers. It lost hundreds of millions selling them for less than they cost. Every one it sold is still switched on somewhere.' },

    // Reactive lines: what the player did. No date of their own, each once.
    { id: 'shelf', kind: 'react', when: { stock: 3, homesBelow: 40, for: 20 },
      text: 'Three computers on the shelf. Nobody has asked for one this week.' },
    { id: 'full', kind: 'react', when: { stock: 500, for: 30 },
      text: 'The warehouse is full to the door. Every computer in it is switched off.' },
    { id: 'queue', kind: 'react', when: { soldOut: true, homes: 30, for: 20 },
      text: 'The shop rings again. People are queueing for computers you have not built.' },
    { id: 'chipsOut', kind: 'react', when: { chipsOut: true, built: 5 },
      text: 'Out of chips. The bench goes quiet. You sharpen the pencil.' },
    { id: 'raise', kind: 'react', when: { priceUps: 1 },
      text: 'You raise the price. Nobody writes to complain. That worries you more.' },
    { id: 'cut', kind: 'react', when: { priceDowns: 1 },
      text: 'You cut the price. The letters from parents double. So does the accountant\'s frown.' },
    { id: 'dear', kind: 'react', when: { priceAtLeast: 2000, for: 30 },
      text: 'At this price your buyers are dentists and lawyers. They write polite letters on headed paper.' },
    { id: 'clubPrice', kind: 'react', when: { priceAtLeast: 2500, beat: 'grandson', for: 30 },
      text: 'The grandson says the club can no longer afford what you make. He says it once.' },
    { id: 'belowCost', kind: 'react', when: { belowCost: true, for: 20 },
      text: 'Each computer now costs you more in chips than it brings in. The count does not mind. The bank does.' },
    { id: 'broke', kind: 'react', when: { moneyBelow: 50, t: 30 },
      text: 'Almost nothing left in the bank. The manager asks what a codebreaker knows about selling computers. Fair question.' },
    { id: 'million', kind: 'react', when: { moneyAtLeast: 1e6 },
      text: 'A million dollars. You still keep the accounts in pencil.' },
    { id: 'ad1', kind: 'react', when: { ads: 1 },
      text: 'Your first advert: a quarter page in a hobby magazine. You wrote it yourself. It has too many words.' },
    { id: 'adTv', kind: 'react', when: { ads: 6 },
      text: 'Your advert runs between the football and the news. Your first clerk rings to say she saw it.' },
    { id: 'bench1', kind: 'react', when: { owned: { [W]: 1 } },
      text: 'A neighbour\'s son solders for you after school, paid in pizza and in being allowed to touch the oscilloscope.' },
    { id: 'bench10', kind: 'react', when: { owned: { [W]: 10 } },
      text: 'Ten benches. The garage door no longer shuts. The neighbours have stopped asking.' },
    { id: 'cray', kind: 'react', when: { rate: 1.6e8 },
      text: 'Your computers in homes, added together, now outrun the fastest supercomputer in the world. Each one is somebody\'s toy.' },
    { id: 'homes100', kind: 'react', when: { homes: 100 },
      text: 'A farmer keeps his herd on one. He writes to say the cows have not noticed.' },
    { id: 'homes1000', kind: 'react', when: { homes: 1000 },
      text: 'A school buys one. The waiting list to use it is longer than the one for the football team.' },
    { id: 'homes10k', kind: 'react', when: { homes: 10000 },
      text: 'A boy at a shop counter types CAN MACHINES THINK? The computer answers ?SYNTAX ERROR. He laughs and keeps typing.' },
    { id: 'homes50k', kind: 'react', when: { homes: 50000 },
      text: 'A girl of twelve writes a game on hers. The shop sells it in plastic bags by the till.' },
    { id: 'homes150k', kind: 'react', when: { homes: 150000 },
      text: 'You will never meet most of the people who own your computers. They are all still counting.' },
  ],

  // After the goal: the last actions of the stage. No new builders from here; building and selling go on.
  finale: [
    { id: 'advert', name: 'Air the advert', cost: 4e6, currency: 'dollars',
      text: 'One minute of television, shown once.',
      date: '1984-01',
      log: '22 January 1984. In the middle of the football final, a woman runs through a grey hall and throws a hammer through a giant screen. It is shown once. Everyone remembers it.' },
    { id: 'anyone', name: 'Make a computer anyone can use', cost: 2.8e13,
      text: 'Ends this stage.',
      date: '1984-01',
      log: '24 January 1984. On a stage, a computer with a mouse and pictures instead of commands comes out of a bag. It says, in its own voice: Hello.' },
  ],

  ending: [
    { date: '1984-01', text: 'It does not think. Someone told it what to say. The whole hall stands up anyway.' },
    { date: '1984-01', text: 'It costs $2,495. Anyone can use it. Not anyone can buy it.' },
    { date: '1984-02', text: 'Your first clerk asks to try the mouse. She is better at it than you.' },
    { date: '1984-03', text: 'In 1945 they broke up every machine you had. Nobody can break these up: {homes} of them, in other people\'s houses.' },
  ],
  next: {
    date: '1984-09',
    text: '1984. The machines are everywhere now, and every one is waiting to be told what to do. You give the ledger and the pencil to your first clerk\'s grandson. He writes the instructions.',
  },
};
