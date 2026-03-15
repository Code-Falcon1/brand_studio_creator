function clampByte(n) {
  return Math.max(0, Math.min(255, n | 0));
}

export function rgbToHex(r, g, b) {
  const rr = clampByte(r).toString(16).padStart(2, '0');
  const gg = clampByte(g).toString(16).padStart(2, '0');
  const bb = clampByte(b).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bb}`.toUpperCase();
}

export function hexToRgb(hex) {
  const raw = String(hex || '').trim().replace('#', '');
  if (raw.length !== 6) return null;
  const n = Number.parseInt(raw, 16);
  if (!Number.isFinite(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function colorDistanceSq(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// Lightweight k-means for palette extraction (good enough for logos).
export function extractPaletteFromImageData(imageData, count = 5) {
  const { data, width, height } = imageData;
  const samples = [];

  // Sample grid to avoid huge arrays
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 6000)));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a < 30) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // drop near-white/near-black noise a bit
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      if (luminance > 0.98 || luminance < 0.02) continue;
      samples.push({ r, g, b });
    }
  }

  if (samples.length === 0) return [];

  const k = Math.max(1, Math.min(count, samples.length));
  let centroids = Array.from({ length: k }, () => ({ ...pickRandom(samples) }));

  for (let iter = 0; iter < 10; iter++) {
    const clusters = Array.from({ length: k }, () => ({ sumR: 0, sumG: 0, sumB: 0, n: 0 }));
    for (const s of samples) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = colorDistanceSq(s, centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      clusters[best].sumR += s.r;
      clusters[best].sumG += s.g;
      clusters[best].sumB += s.b;
      clusters[best].n += 1;
    }

    centroids = centroids.map((c, idx) => {
      const cl = clusters[idx];
      if (cl.n === 0) return { ...pickRandom(samples) };
      return {
        r: Math.round(cl.sumR / cl.n),
        g: Math.round(cl.sumG / cl.n),
        b: Math.round(cl.sumB / cl.n),
      };
    });
  }

  // De-dupe very similar colors
  const unique = [];
  for (const c of centroids) {
    if (!unique.some((u) => colorDistanceSq(u, c) < 18 * 18)) unique.push(c);
  }
  return unique.slice(0, k).map((c) => rgbToHex(c.r, c.g, c.b));
}

export async function loadImageToImageData(file, maxSize = 256) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });

    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    return imageData;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function imageDataToPngDataUrl(imageData) {
  const { width, height } = imageData || {};
  if (!width || !height) throw new Error('Invalid ImageData');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}
