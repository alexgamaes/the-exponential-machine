export function createInitialState() {
  return {
    phase: 0,

    date: { year: 1939, month: 8, day: 15 },
    dayTimer: 0,        // seconds elapsed toward next in-game day
    dayDuration: 10,    // real seconds per in-game day

    resources: {
      flops: 0,
      data: 0,
      dataCap: 500,
      supply: { used: 0, cap: 12 },
      electricity: { used: 0, cap: 0 }, // activated in phase 1
    },

    personnel: {
      juniorCalculator: { count: 0, baseCost: 10,   supplyPerUnit: 1 },
      boffin:           { count: 0, baseCost: 120,  supplyPerUnit: 3 },
      sectionHead:      { count: 0, baseCost: 250,  supplyPerUnit: 2 },
    },

    huts: 0,

    hardware: {
      bombes: { count: 0, running: 0, baseCost: 2000 },
    },

    streams: {
      armyEnigma: {
        id: 'armyEnigma',
        label: 'ARMY RADIO CODE',
        description: 'Captured enemy message — crack it to earn Data',
        unlocked: true,
        blackout: false,
        spaceBase: 300,
        spaceCurrent: 300,
        progress: 0,       // states cleared so far
        rewardBase: 100,
        dropCount: 0,
      },
      navalEnigma: {
        id: 'navalEnigma',
        label: 'NAVAL RADIO CODE',
        description: 'U-boat traffic — harder to break, earns 4× Data',
        unlocked: false,
        blackout: false,
        spaceBase: 48000,
        spaceCurrent: 48000,
        progress: 0,
        rewardBase: 400,
        dropCount: 0,
      },
    },

    operations: {
      completed: [],
      available: ['zygalskiSheets', 'formationHut6', 'formationHut8'], // shown only after first drop
    },

    upgrades: {
      canteenExpansion: 0,   // count of purchases
      coffeeRationing: 0,
      nightShiftUnlocked: false,
      nightShiftActive: false,
      nightShiftTimer: 0,
      nightShiftCooldown: 0,
    },

    multipliers: {
      flopsPerClick: 1,
      flopsPerSec: 1,
      dataPerDrop: 1,
      operationCost: 1,
      searchSpeed: 1,
    },

    flags: {
      boffinsReduceOpCost: 0,   // count of boffins for cost reduction
    },

    stats: {
      totalFlops: 0,
      totalData: 0,
      totalDrops: 0,
      phase0BaselineFlops: 20,
    },

    // Progressive UI reveal — sections only appear when unlocked
    ui: {
      showData: false,          // after first drop
      showOperations: false,    // after first drop
      showPersonnel: false,     // after formationHut6 completed
      showInfrastructure: false,// after recruitFirst50 completed
      showNavalStream: false,   // after formationHut8 completed
      showFooter: false,        // after first personnel hired
    },
  };
}
