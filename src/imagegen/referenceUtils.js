import { extractPaletteFromImageData, loadImageToImageData } from './colorUtils';

export async function fileToDataUrl(file) {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);
  return `data:${file.type || 'application/octet-stream'};base64,${base64}`;
}

export async function analyzeReferenceImage(file) {
  const dataUrl = await fileToDataUrl(file);
  const imageData = await loadImageToImageData(file, 256);
  const palette = extractPaletteFromImageData(imageData, 5);

  // Simple vibe heuristics (good enough as prompt hints)
  const d = imageData.data;
  let sum = 0;
  let sumR = 0;
  let sumB = 0;
  let count = 0;
  for (let i = 0; i < d.length; i += 16) {
    const a = d[i + 3];
    if (a < 30) continue;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    sum += lum;
    sumR += r;
    sumB += b;
    count++;
  }

  const avgLum = count ? sum / count : 0.5;
  const avgR = count ? sumR / count : 128;
  const avgB = count ? sumB / count : 128;

  const warmth = avgR - avgB; // crude
  const vibe = {
    brightness: avgLum > 0.62 ? 'bright' : avgLum < 0.38 ? 'dark' : 'balanced',
    warmth: warmth > 18 ? 'warm' : warmth < -18 ? 'cool' : 'neutral',
  };

  return { dataUrl, palette, vibe };
}

export function referenceHints({ palette, vibe }) {
  const parts = [];
  if (Array.isArray(palette) && palette.length) {
    parts.push(`match reference color palette: ${palette.slice(0, 6).join(', ')}`);
  }
  if (vibe?.brightness) parts.push(`reference brightness: ${vibe.brightness}`);
  if (vibe?.warmth) parts.push(`reference warmth: ${vibe.warmth}`);
  return parts;
}
