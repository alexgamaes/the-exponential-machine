// Number and time formatting. 3 significant digits past a million, words up to decillion, then ×10ⁿ.
const WORDS = ['million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion',
  'septillion', 'octillion', 'nonillion', 'decillion'];
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };

export function fmt(n, decimals = 0) {
  if (!Number.isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n, decimals);
  if (n < 1e6) {
    if (decimals && n < 100 && n !== Math.floor(n)) return n.toFixed(decimals);
    return Math.floor(n).toLocaleString('en-US');
  }
  const exp = Math.floor(Math.log10(n));
  const group = Math.floor(exp / 3) - 2; // 0 = million
  if (group < WORDS.length) {
    const v = n / Math.pow(10, (group + 2) * 3);
    return `${sig3(v)} ${WORDS[group]}`;
  }
  const m = n / Math.pow(10, exp);
  return `${sig3(m)} × 10${String(exp).split('').map(c => SUP[c]).join('')}`;
}

function sig3(v) {
  if (v >= 100) return v.toFixed(0);
  if (v >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

export function fmtDuration(sec) {
  if (!Number.isFinite(sec) || sec > 3600 * 24 * 365) return 'forever';
  if (sec < 1) return 'under a second';
  if (sec < 60) return `${Math.round(sec)} s`;
  if (sec < 3600) { const m = Math.floor(sec / 60), s = Math.round(sec % 60); return s ? `${m} min ${s} s` : `${m} min`; }
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];
export function fmtDate(ym, short = false) {
  const [y, m] = ym.split('-').map(Number);
  const name = MONTHS[m - 1];
  return `${short ? name.slice(0, 3) : name} ${y}`;
}

// Stable, rounded durations for text that should not flicker.
export function fmtApprox(sec) {
  if (!Number.isFinite(sec) || sec > 3600 * 24 * 365) return 'forever';
  if (sec < 1) return 'under a second';
  if (sec < 10) return `${sec.toFixed(1)} s`;
  if (sec < 60) return `${Math.round(sec)} s`;
  if (sec < 600) { const t = Math.round(sec / 10) * 10; const m = Math.floor(t / 60), s = t % 60; return s ? `${m} min ${s} s` : `${m} min`; }
  if (sec < 3600) return `${Math.round(sec / 60)} min`;
  const t = Math.round(sec / 600) * 600; const h = Math.floor(t / 3600), m = Math.round((t % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

// Round to 2 significant figures (237 -> 240, 1,234 -> 1,200).
export function sig2(n) {
  if (n < 10) return Math.round(n);
  const p = Math.pow(10, Math.floor(Math.log10(n)) - 1);
  return Math.round(n / p) * p;
}
