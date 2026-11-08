// Tunables that are not stage data. The simulator can override any of these.
export const CONFIG = {
  clickBase: 1,
  holdRepeatPerSec: 6,       // holding the button = this many clicks per second
  revealGapSec: 8,           // minimum seconds between two upgrade reveals (anti-clump)
  maxOpenUpgrades: 2,        // at most this many revealed-but-unbought upgrades on screen
  endingBeatGapSec: 4,       // seconds between ending log lines
  logMax: 200,
  offlineMaxSec: 8 * 3600,   // offline progress cap
};
