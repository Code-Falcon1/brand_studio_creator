const STORAGE_KEY = 'pollinations_api_key_v1';

export function loadRuntimeApiKey() {
  try {
    return String(localStorage.getItem(STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function saveRuntimeApiKey(key) {
  try {
    const v = String(key || '').trim();
    if (!v) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // ignore storage failures
  }
}

export function clearRuntimeApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

