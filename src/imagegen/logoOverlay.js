function clampNumber(n, { min, max }) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, v));
}

async function loadImageFromBlob(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function loadImageFromUrl(url, { crossOrigin } = {}) {
  const img = new Image();
  img.decoding = 'async';
  if (crossOrigin) img.crossOrigin = crossOrigin;
  img.src = url;
  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
  });
  return img;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'image.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

function computeLogoPlacement({ baseWidth, baseHeight, logoWidth, logoHeight, position, padding }) {
  const p = Number(padding) || 0;
  const positions = {
    top_left: { x: p, y: p },
    top_right: { x: baseWidth - logoWidth - p, y: p },
    bottom_left: { x: p, y: baseHeight - logoHeight - p },
    bottom_right: { x: baseWidth - logoWidth - p, y: baseHeight - logoHeight - p },
    center: { x: Math.round((baseWidth - logoWidth) / 2), y: Math.round((baseHeight - logoHeight) / 2) },
  };
  return positions[position] || positions.bottom_right;
}

export async function downloadImageWithLogoOverlay({
  imageUrl,
  logoDataUrl,
  filename,
  position = 'bottom_right',
  sizePct = 18,
  opacity = 0.9,
  padding = 18,
}) {
  const pct = clampNumber(sizePct, { min: 5, max: 40 });
  const alpha = clampNumber(opacity, { min: 0.05, max: 1 });
  const pad = clampNumber(padding, { min: 0, max: 80 });

  let baseBlob;
  try {
    const resp = await fetch(imageUrl, { mode: 'cors' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    baseBlob = await resp.blob();
  } catch (e) {
    return { ok: false, error: `Could not fetch image (CORS). ${String(e?.message || e)}` };
  }

  try {
    const [baseImg, logoImg] = await Promise.all([
      loadImageFromBlob(baseBlob),
      loadImageFromUrl(logoDataUrl),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = baseImg.naturalWidth || baseImg.width;
    canvas.height = baseImg.naturalHeight || baseImg.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    const targetLogoWidth = Math.round((canvas.width * pct) / 100);
    const ratio = (logoImg.naturalWidth || logoImg.width) / Math.max(1, (logoImg.naturalHeight || logoImg.height));
    const targetLogoHeight = Math.max(1, Math.round(targetLogoWidth / Math.max(0.01, ratio)));

    const { x, y } = computeLogoPlacement({
      baseWidth: canvas.width,
      baseHeight: canvas.height,
      logoWidth: targetLogoWidth,
      logoHeight: targetLogoHeight,
      position,
      padding: pad,
    });

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(logoImg, x, y, targetLogoWidth, targetLogoHeight);
    ctx.restore();

    const outBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!outBlob) throw new Error('Failed to export image');
    downloadBlob(outBlob, filename || 'image.png');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

