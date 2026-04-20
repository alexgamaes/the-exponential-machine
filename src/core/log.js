const MAX_ENTRIES = 50;
const _entries = [];
let _offset = 0;

export function pushLog(text) {
  _entries.unshift(text);
  if (_entries.length > MAX_ENTRIES) _entries.pop();
  _offset = 0; // snap to newest on every new entry
}

export function getLogWindow() {
  return {
    a: _entries[_offset] ?? null,
    b: _entries[_offset + 1] ?? null,
    canGoNewer: _offset > 0,
    canGoOlder: _offset + 1 < _entries.length,
  };
}

export function scrollLog(delta) {
  _offset = Math.max(0, Math.min(_entries.length - 1, _offset + delta));
}
