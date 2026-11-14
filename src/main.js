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
  if (seconds < 5) { E.tick(st, seconds); return; }   // a late frame: just catch up, no note
  const d0 = st.dollars;
  const gained = E.applyOffline(st, seconds);
  const earned = st.dollars - d0;
  if (gained > 0) E.note(st, `While you were away (${fmtDuration(Math.min(seconds, CONFIG.offlineMaxSec))}), ${E.phrase(st, 'away', { n: fmt(gained) })}` +
    (earned >= 1 ? `, and earned $${fmt(earned)}` : '') + '.');
}
// Back at the top of the ledger: the newest lines are in view, so hide "New lines".
document.getElementById('log').addEventListener('scroll', (e) => { if (e.target.scrollTop <= 8) document.getElementById('log-new').hidden = true; }, { passive: true });
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
  stopHold();
  mainBtn.classList.add('pressed');
  holdTimer = setTimeout(() => {
    repeatTimer = setInterval(doClick, 1000 / CONFIG.holdRepeatPerSec);
  }, 350);
});
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) mainBtn.addEventListener(ev, stopHold);
mainBtn.addEventListener('contextmenu', (e) => e.preventDefault());
// Keyboard: Enter/Space on the focused button fire 'click' with detail 0. Held keys repeat, so throttle
// them to the same rate as holding the mouse button.
let lastKeyClick = 0;
mainBtn.addEventListener('click', (e) => {
  if (e.detail !== 0) return;
  const now = performance.now();
  if (now - lastKeyClick >= 1000 / CONFIG.holdRepeatPerSec) { lastKeyClick = now; doClick(); }
});

// Space anywhere = the main action (held = repeat, throttled to the hold rate).
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
    case 'pass':
      E.passLedger(s); save(); render(s);
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      mainBtn.focus({ preventScroll: true });
      break;
    case 'sell': E.setMarket(s, Number(btn.dataset.value)); break;
    case 'log-top': document.getElementById('log').scrollTop = 0; break;
    case 'dev-stage':
      s = E.startAtStage(Number(btn.dataset.stage));
      save(); location.reload();
      break;
    case 'theme': cycleTheme(); break;
    case 'reset':
      // No pop-up: the first press arms the button, a second press within 4 s erases the game.
      if (btn.dataset.armed) {
        try { localStorage.removeItem(SAVE_KEY); } catch (err) {}
        s = E.createState(); save(); location.reload();
      } else {
        const label = btn.textContent;
        btn.dataset.armed = '1'; btn.textContent = 'Press again to erase everything';
        setTimeout(() => { delete btn.dataset.armed; btn.textContent = label; }, 4000);
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
  labelTheme();
}
function labelTheme() {
  const cur = document.documentElement.dataset.theme || 'system';
  const next = cur === 'system' ? 'light' : cur === 'light' ? 'dark' : 'system';
  const btn = document.getElementById('theme-toggle');
  btn.title = `Theme: ${cur} (press for ${next})`;
  btn.setAttribute('aria-label', btn.title);
}
labelTheme();

// ---------- dev tools (only when served from this computer) ----------
if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname)) {
  const box = document.getElementById('dev-tools');
  box.hidden = false;
  box.append('Dev: ');
  for (const n of Object.keys(E.STAGES)) {
    const b = document.createElement('button');
    b.className = 'link-btn'; b.dataset.action = 'dev-stage'; b.dataset.stage = n;
    b.textContent = `Start Stage ${n}`;
    box.append(b);
  }
}

// Debug handle for the console: window.tem.s, window.tem.E
window.tem = { get s() { return s; }, E };

render(s);
requestAnimationFrame(frame);
