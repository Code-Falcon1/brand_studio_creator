import { getPollinationsBaseUrl } from './schema';

function addParam(params, key, value) {
  if (value === undefined || value === null) return;
  if (typeof value === 'string' && value.trim() === '') return;
  params.set(key, String(value));
}

function buildProxyImageUrl({
  prompt,
  model,
  width,
  height,
  seed,
  enhance,
  negative_prompt,
  safe,
  quality,
  transparent,
  duration,
  aspectRatio,
  audio,
}) {
  const params = new URLSearchParams();
  addParam(params, 'prompt', prompt);
  addParam(params, 'model', model || 'flux');
  addParam(params, 'width', width);
  addParam(params, 'height', height);
  addParam(params, 'seed', seed);
  addParam(params, 'enhance', enhance);
  addParam(params, 'negative_prompt', negative_prompt);
  addParam(params, 'safe', safe);
  addParam(params, 'quality', quality);
  addParam(params, 'transparent', transparent);
  addParam(params, 'duration', duration);
  addParam(params, 'aspectRatio', aspectRatio);
  addParam(params, 'aspect-ratio', aspectRatio);
  addParam(params, 'audio', audio);
  return `/api/image?${params.toString()}`;
}

function buildProxyVideoUrl({ prompt, model, seed, duration, aspectRatio, audio }) {
  const params = new URLSearchParams();
  addParam(params, 'prompt', prompt);
  addParam(params, 'model', model);
  addParam(params, 'seed', seed);
  addParam(params, 'duration', duration);
  addParam(params, 'aspectRatio', aspectRatio);
  addParam(params, 'aspect-ratio', aspectRatio);
  addParam(params, 'audio', audio);
  return `/api/video?${params.toString()}`;
}

function buildProxyTextUrl({ prompt, model, seed }) {
  const params = new URLSearchParams();
  addParam(params, 'prompt', prompt);
  addParam(params, 'model', model);
  addParam(params, 'seed', seed);
  return `/api/text?${params.toString()}`;
}

function buildProxyAudioUrl({ text, model, voice, format }) {
  const params = new URLSearchParams();
  addParam(params, 'text', text);
  addParam(params, 'model', model);
  addParam(params, 'voice', voice);
  addParam(params, 'format', format);
  return `/api/audio?${params.toString()}`;
}

export function buildPollinationsImageUrl({
  prompt,
  model,
  width,
  height,
  seed,
  enhance,
  negative_prompt,
  safe,
  quality,
  transparent,
  apiKey,
  referenceImage,
  duration,
  aspectRatio,
  audio,
  useProxy,
}) {
  if (useProxy) {
    // Note: strong reference images (data URLs) are intentionally NOT proxied via query params.
    return buildProxyImageUrl({
      prompt,
      model,
      width,
      height,
      seed,
      enhance,
      negative_prompt,
      safe,
      quality,
      transparent,
      duration,
      aspectRatio,
      audio,
    });
  }
  const baseUrl = getPollinationsBaseUrl();
  const url = new URL(`${baseUrl}/image/${encodeURIComponent(prompt)}`);

  // Some deployments require ?key= even if they also accept Authorization.
  addParam(url.searchParams, 'key', apiKey);
  // Optional: reference image (data URL / base64). Some models may ignore or reject it.
  addParam(url.searchParams, 'image', referenceImage);
  addParam(url.searchParams, 'model', model || 'flux');
  addParam(url.searchParams, 'width', width);
  addParam(url.searchParams, 'height', height);
  addParam(url.searchParams, 'seed', seed);
  addParam(url.searchParams, 'enhance', enhance);
  addParam(url.searchParams, 'negative_prompt', negative_prompt);
  addParam(url.searchParams, 'safe', safe);
  addParam(url.searchParams, 'quality', quality);
  addParam(url.searchParams, 'transparent', transparent);
  // Video-ish params (some models may ignore/reject; harmless for image models).
  addParam(url.searchParams, 'duration', duration);
  addParam(url.searchParams, 'aspectRatio', aspectRatio);
  addParam(url.searchParams, 'aspect-ratio', aspectRatio);
  addParam(url.searchParams, 'audio', audio);

  return url.toString();
}

export function buildPollinationsVideoUrl({
  prompt,
  model,
  seed,
  apiKey,
  duration,
  aspectRatio,
  audio,
  referenceImage,
  useProxy,
}) {
  if (useProxy) {
    return buildProxyVideoUrl({ prompt, model, seed, duration, aspectRatio, audio });
  }
  const baseUrl = getPollinationsBaseUrl();
  const url = new URL(`${baseUrl}/video/${encodeURIComponent(prompt)}`);

  addParam(url.searchParams, 'key', apiKey);
  addParam(url.searchParams, 'model', model);
  addParam(url.searchParams, 'seed', seed);
  addParam(url.searchParams, 'duration', duration);
  addParam(url.searchParams, 'aspectRatio', aspectRatio);
  addParam(url.searchParams, 'aspect-ratio', aspectRatio);
  addParam(url.searchParams, 'audio', audio);
  addParam(url.searchParams, 'image', referenceImage);

  return url.toString();
}

export function buildPollinationsTextUrl({ prompt, model, seed, apiKey, useProxy }) {
  if (useProxy) return buildProxyTextUrl({ prompt, model, seed });
  const baseUrl = getPollinationsBaseUrl();
  const url = new URL(`${baseUrl}/text/${encodeURIComponent(prompt)}`);
  addParam(url.searchParams, 'key', apiKey);
  addParam(url.searchParams, 'model', model);
  addParam(url.searchParams, 'seed', seed);
  return url.toString();
}

export function buildPollinationsAudioUrl({ text, model, voice, format, apiKey, useProxy }) {
  if (useProxy) return buildProxyAudioUrl({ text, model, voice, format });
  const baseUrl = getPollinationsBaseUrl();
  const url = new URL(`${baseUrl}/audio/${encodeURIComponent(text)}`);
  addParam(url.searchParams, 'key', apiKey);
  addParam(url.searchParams, 'model', model);
  addParam(url.searchParams, 'voice', voice);
  addParam(url.searchParams, 'format', format);
  return url.toString();
}

export async function downloadImageFromUrl(url, filename) {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'image.jpg';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return { ok: true };
  } catch (err) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return { ok: false, error: String(err) };
  }
}
