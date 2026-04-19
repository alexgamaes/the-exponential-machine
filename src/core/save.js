const SAVE_KEY = 'tem_save_v1';

export function saveGame(state) {
  try {
    const serialized = JSON.stringify(state, (key, value) => {
      if (key.startsWith('_')) return undefined; // transient signals, never persist
      if (value instanceof Set) return { __type: 'Set', values: [...value] };
      return value;
    });
    localStorage.setItem(SAVE_KEY, serialized);
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw, (_key, value) => {
      if (value && value.__type === 'Set') return new Set(value.values);
      return value;
    });
  } catch (e) {
    console.warn('Load failed, starting fresh:', e);
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
