// Search space attrition and The Drop

const DROP_SCALE = 1.35; // each drop the search space grows by this factor
const FLOPS_TO_STATES = 10; // 1 FLOP clears 10 states/sec

export function tickSearch(state, delta) {
  const flopsPerSec = state._flopsPerSec || 0;
  const clickFlops = state._pendingClickFlops || 0;
  state._pendingClickFlops = 0;

  const totalFlops = (flopsPerSec * delta) + clickFlops;
  const statesCleared = totalFlops * FLOPS_TO_STATES * state.multipliers.searchSpeed;

  // Distribute across active streams weighted by player assignment
  // For now: all FLOPs go to army enigma; naval splits 50/50 when active
  const activeStreams = Object.values(state.streams).filter(s => s.unlocked && !s.blackout);
  if (activeStreams.length === 0) return;

  const statesPerStream = statesCleared / activeStreams.length;

  for (const stream of activeStreams) {
    stream.progress += statesPerStream;

    if (stream.progress >= stream.spaceCurrent) {
      triggerDrop(state, stream);
    }
  }
}

function triggerDrop(state, stream) {
  stream.progress = 0;
  stream.dropCount += 1;

  // Reward calculation
  let reward = stream.rewardBase * state.multipliers.dataPerDrop;

  // Herivel tip bonus: +5% per boffin
  if (state.flags.herivelTipActive) {
    reward *= (1 + state.personnel.boffin.count * 0.05);
  }

  reward = Math.floor(reward);
  state.resources.data = Math.min(state.resources.data + reward, state.resources.dataCap);
  state.stats.totalData += reward;
  state.stats.totalDrops += 1;

  // Scale up the next intercept
  stream.spaceCurrent = Math.floor(stream.spaceBase * Math.pow(DROP_SCALE, stream.dropCount));

  // Signal to UI for visual/audio feedback
  state._lastDrop = { streamId: stream.id, reward, timestamp: Date.now() };
}

export function handleComputeClick(state) {
  const clickValue = state.multipliers.flopsPerClick;
  state._pendingClickFlops = (state._pendingClickFlops || 0) + clickValue;
  state.resources.flops += clickValue;
  state.stats.totalFlops += clickValue;
}
