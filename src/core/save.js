const SAVE_KEY = 'tem_save_v1';

const REPLACER = (key, value) => {
  if (key.startsWith('_')) return undefined; // transient signals, never persist
  if (value instanceof Set) return { __type: 'Set', values: [...value] };
  return value;
};

const REVIVER = (_key, value) => {
  if (value && value.__type === 'Set') return new Set(value.values);
  return value;
};

export function saveGame(state) {
  try {
    const serialized = JSON.stringify(state, REPLACER);
    localStorage.setItem(SAVE_KEY, serialized);
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw, REVIVER);
  } catch (e) {
    console.warn('Load failed, starting fresh:', e);
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

// ── Export / Import ──────────────────────────────────────────────────────────

export function exportSaveBase64(state) {
  const serialized = JSON.stringify(state, REPLACER);
  return btoa(unescape(encodeURIComponent(serialized))); // btoa handle unicode better this way
}

export function importSaveBase64(base64String) {
  try {
    // Remove all whitespace/newlines that might have been introduced during copy-paste
    const cleaned = (base64String || '').trim().replace(/\s/g, '');
    if (!cleaned) return null;
    const decoded = decodeURIComponent(escape(atob(cleaned)));
    const parsed = JSON.parse(decoded, REVIVER);
    return (parsed && typeof parsed === 'object') ? parsed : null;
  } catch (e) {
    console.error('Failed to import Base64 save:', e);
    return null;
  }
}

export function exportSaveFile(state) {
  const serialized = JSON.stringify(state, REPLACER);
  const blob = new Blob([serialized], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tem-save-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSaveFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result, REVIVER);
        resolve(state);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}
