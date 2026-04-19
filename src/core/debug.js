export const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

export function log(...args) {
  if (isDev) console.log('[TEM]', ...args);
}
