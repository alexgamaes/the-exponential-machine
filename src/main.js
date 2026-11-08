// Browser entry: game loop, input, save/load, theme.
import * as E from './engine.js';
import { CONFIG } from './config.js';
import { render, floater } from './ui.js';
import { fmt, fmtDuration } from './format.js';

const SAVE_KEY = 'tem_save_v1';
const THEME_KEY = 'tem_theme';
const SAVE_EVERY_MS = 10000;

let s = load() || E.createState();

// ---------- save / load ----------
function save() {
  try { s.savedAt = Date.now(); localStorage.setItem(SAVE_KEY, E.serialize(s)); } catch (e) { /* storage blocked */ }
}
function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return null; }
  if (!raw) return null;
  const st = E.deserialize(raw);
  if (!st) return null;
  if (st.savedAt) awayCatchUp(st, (Date.now() - st.savedAt) / 1000);
  return st;
}
function awayCatchUp(st, seconds) {
  if (seconds < 5) return;
  const gained = E.applyOffline(st, seconds);
  if (gained > 0) E.note(st, `While you were away (${fmtDuration(Math.min(seconds, CONFIG.offlineMaxSec))}), ${E.phrase(st, 'away', { n: fmt(gained) })}.`);
}
setInterval(save, SAVE_EVERY_MS);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save);

// ---------- loop ----------
let last = performance.now();
function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  if (dt > 2) awayCatchUp(s, dt);   // tab was asleep
  else if (dt > 0) E.tick(s, dt);
  render(s);
  requestAnimationFrame(frame);
}

// ---------- input ----------
function doClick() {
  const v = E.click(s, 1);
  if (v > 0) floater(v);
}

// Main button: press = one click; hold = repeat.
const mainBtn = document.getElementById('main-btn');
let holdTimer = null, repeatTimer = null;
function stopHold() {
  clearTimeout(holdTimer); clearInterval(repeatTimer); holdTimer = repeatTimer = null;
  mainBtn.classList.remove('pressed');
}
mainBtn.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  e.preventDefault();
  doClick();
  mainBtn.classList.add('pressed');
  stopHold();
  mainBtn.classList.add('pressed');
  holdTimer = setTimeout(() => {
    repeatTimer = setInterval(doClick, 1000 / CONFIG.holdRepeatPerSec);
  }, 350);
});
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) mainBtn.addEventListener(ev, stopHold);
mainBtn.addEventListener('contextmenu', (e) => e.preventDefault());
// Keyboard: Enter/Space on the focused button fire 'click' with detail 0.
mainBtn.addEventListener('click', (e) => { if (e.detail === 0) doClick(); });

// Space anywhere = the main action (held = repeat, throttled to the hold rate).
let lastKeyClick = 0;
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.target.closest('button, input, textarea')) return;
  e.preventDefault();
  const now = performance.now();
  if (now - lastKeyClick >= 1000 / CONFIG.holdRepeatPerSec) { lastKeyClick = now; doClick(); }
});

// Everything else: delegated clicks on data-action.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.disabled) return;
  const { action, id, option } = btn.dataset;
  switch (action) {
    case 'buy-producer': E.buyProducer(s, id); break;
    case 'buy-upgrade': E.buyUpgrade(s, id); break;
    case 'choose': E.buyUpgrade(s, id, option); break;
    case 'build-goal': E.buyGoal(s); save(); break;
    case 'finale': E.buyFinale(s); save(); break;
    case 'pass': E.passLedger(s); save(); window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    case 'theme': cycleTheme(); break;
    case 'reset':
      if (confirm('Start again from 1939? Your progress will be lost.')) {
        try { localStorage.removeItem(SAVE_KEY); } catch (err) {}
        s = E.createState(); location.reload();
      }
      break;
  }
});


// ---------- theme: system → light → dark ----------
function cycleTheme() {
  const root = document.documentElement;
  const cur = root.dataset.theme || 'system';
  const next = cur === 'system' ? 'light' : cur === 'light' ? 'dark' : 'system';
  if (next === 'system') delete root.dataset.theme; else root.dataset.theme = next;
  try { next === 'system' ? localStorage.removeItem(THEME_KEY) : localStorage.setItem(THEME_KEY, next); } catch (e) {}
  document.getElementById('theme-toggle').title = `Theme: ${next}`;
}

// Debug handle for the console: window.tem.s, window.tem.E
window.tem = { get s() { return s; }, E };

render(s);
requestAnimationFrame(frame);
