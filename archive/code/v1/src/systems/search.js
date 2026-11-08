// Search space attrition and The Drop

import { CONFIG } from '../config.js';

// Exported for render.js reward preview — reads CONFIG at call time via triggerDrop
export const DROP_SCALE = 1.02; // default; real value always taken from CONFIG.dropScale

export function tickSearch(state, delta) {
  const flopsPerSec = state._flopsPerSec || 0;
  const clickFlops = state._pendingClickFlops || 0;
  state._pendingClickFlops = 0;

  // flopsPerSec already includes bombe output (converted in tickResources)
  const totalFlops = (flopsPerSec * delta) + clickFlops;

  // Cryptanalyst search bonus: +3% per hire, diminishing after 10 (+1% each)
  const cryptCount = state.personnel.cryptanalyst?.count || 0;
  const cryptBonus = Math.min(cryptCount, 10) * 0.03 + Math.max(0, cryptCount - 10) * 0.01;
  const effectiveSpeed = state.multipliers.searchSpeed * (1 + cryptBonus);

  const statesCleared = totalFlops * CONFIG.flopsToStates * effectiveSpeed;

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

  let reward = stream.rewardBase
    * state.multipliers.dataPerDrop
    * Math.pow(CONFIG.dropScale, stream.dropCount - 1);

  // Herivel tip bonus: +5% per boffin
  if (state.flags.herivelTipActive) {
    reward *= (1 + state.personnel.boffin.count * 0.05);
  }

  reward = Math.floor(reward);
  state.resources.data = Math.min(state.resources.data + reward, state.resources.dataCap);
  state.stats.totalData += reward;
  state.stats.totalDrops += 1;

  stream.spaceCurrent = Math.floor(stream.spaceBase * Math.pow(CONFIG.dropScale, stream.dropCount));

  // Signal to UI for visual/audio feedback
  state._lastDrop = { streamId: stream.id, reward, timestamp: Date.now() };
}

export function handleComputeClick(state) {
  if (state.phase >= 1) {
    // In Phase 1+, click is symbolic — Bombes do real work
    const active = Object.values(state.streams).filter(s => s.unlocked && !s.blackout);
    for (const s of active) s.progress += s.spaceCurrent * 0.0001;
    state.resources.flops += 1;
    state.stats.totalFlops += 1;
    return;
  }
  const clickValue = state.multipliers.flopsPerClick;
  state._pendingClickFlops = (state._pendingClickFlops || 0) + clickValue;
  state.resources.flops += clickValue;
  state.stats.totalFlops += clickValue;
}
