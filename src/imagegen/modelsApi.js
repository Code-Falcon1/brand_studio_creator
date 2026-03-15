const CACHE_KEYS = {
  image: 'ai_video_generator_pollinations_image_models_v2',
  text: 'ai_video_generator_pollinations_text_models_v1',
  audio: 'ai_video_generator_pollinations_audio_models_v1',
};
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function now() {
  return Date.now();
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadCachedModels(kind = 'image') {
  try {
    const key = CACHE_KEYS[kind] || CACHE_KEYS.image;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = safeParse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.models)) return null;
    if (typeof parsed.fetchedAt !== 'number') return null;
    if (now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed.models;
  } catch {
    return null;
  }
}

export function saveCachedModels(kind, models) {
  try {
    const key = CACHE_KEYS[kind] || CACHE_KEYS.image;
    localStorage.setItem(key, JSON.stringify({ fetchedAt: now(), models }));
  } catch {
    // ignore
  }
}

export async function fetchPollinationsImageModels() {
  const resp = await fetch('https://gen.pollinations.ai/image/models', { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load models (HTTP ${resp.status})`);
  const json = await resp.json();
  if (!Array.isArray(json)) throw new Error('Invalid models response');
  return json;
}

export async function fetchPollinationsTextModels() {
  const resp = await fetch('https://gen.pollinations.ai/text/models', { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load text models (HTTP ${resp.status})`);
  const json = await resp.json();
  if (!Array.isArray(json)) throw new Error('Invalid text models response');
  return json;
}

export async function fetchPollinationsAudioModels() {
  const resp = await fetch('https://gen.pollinations.ai/audio/models', { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load audio models (HTTP ${resp.status})`);
  const json = await resp.json();
  if (!Array.isArray(json)) throw new Error('Invalid audio models response');
  return json;
}
