const BRANDS_KEY = 'ai_video_generator_brand_profiles_v1';
const ACTIVE_BRAND_KEY = 'ai_video_generator_active_brand_id_v1';

function safeParseJson(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function loadBrands() {
  try {
    const raw = localStorage.getItem(BRANDS_KEY);
    if (!raw) return [];
    const parsed = safeParseJson(raw, []);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((b) => b && typeof b === 'object' && typeof b.id === 'string');
  } catch {
    return [];
  }
}

export function saveBrands(brands) {
  try {
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
  } catch {
    // ignore
  }
}

export function loadActiveBrandId() {
  try {
    return (localStorage.getItem(ACTIVE_BRAND_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function saveActiveBrandId(id) {
  try {
    localStorage.setItem(ACTIVE_BRAND_KEY, String(id || ''));
  } catch {
    // ignore
  }
}

export function clearBrands() {
  try {
    localStorage.removeItem(BRANDS_KEY);
    localStorage.removeItem(ACTIVE_BRAND_KEY);
  } catch {
    // ignore
  }
}

