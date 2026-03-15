import { PLATFORM_PRESETS } from './schema';
import { referenceHints } from './referenceUtils';

function compact(list) {
  return list.filter((x) => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim());
}

function platformHint(platformPreset) {
  switch (platformPreset) {
    case 'instagram_square':
      return 'instagram post, 1:1 square composition';
    case 'instagram_portrait':
      return 'instagram portrait post, 4:5 composition';
    case 'instagram_story':
      return 'vertical story/reel frame, 9:16 composition';
    case 'youtube_thumbnail':
      return 'thumbnail-friendly composition, clear subject, strong contrast';
    case 'twitter_header':
      return 'wide header composition with negative space';
    case 'widescreen':
      return 'widescreen 16:9 composition';
    default:
      return '';
  }
}

function contentHint(contentPreset) {
  switch (contentPreset) {
    case 'food':
      return 'served dish or drink, appetizing presentation, no packaging, no labels';
    case 'product':
      return 'product hero shot, clean commercial styling, premium materials';
    case 'fashion':
      return 'fashion editorial, styled outfit, clean background, flattering light';
    case 'travel':
      return 'travel photography, sense of place, natural colors, depth';
    case 'fitness':
      return 'fitness lifestyle, energetic mood, clean composition';
    case 'event':
      return 'promotional background, space for overlay text, simple shapes, no embedded text';
    case 'quote_bg':
      return 'minimal background, soft gradients or texture, lots of negative space, no embedded text';
    case 'abstract':
      return 'abstract shapes, modern design, pleasing color harmony';
    case 'generic':
    default:
      return '';
  }
}

function styleHint(stylePreset) {
  switch (stylePreset) {
    case 'photoreal':
      return 'photorealistic, high detail, natural textures';
    case 'studio':
      return 'commercial studio photo, crisp details, clean shadows';
    case 'cinematic':
      return 'cinematic lighting, film still, dramatic contrast';
    case 'minimal':
      return 'minimalist, clean lines, simple composition';
    case 'illustration':
      return 'digital illustration, clean outlines, stylized shading';
    case '3d':
      return '3d render, realistic materials, global illumination';
    case 'vintage':
      return 'vintage look, film grain, muted tones';
    case 'cyberpunk':
      return 'cyberpunk aesthetic, neon accents, futuristic atmosphere';
    default:
      return '';
  }
}

function lightingHint(lightingPreset) {
  switch (lightingPreset) {
    case 'natural':
      return 'natural light, soft shadows';
    case 'softbox':
      return 'softbox lighting, studio diffusion';
    case 'golden_hour':
      return 'golden hour lighting, warm highlights';
    case 'moody':
      return 'moody lighting, low key, deep shadows';
    case 'neon':
      return 'neon lighting, colorful rim light';
    default:
      return '';
  }
}

function compositionHint(compositionPreset) {
  switch (compositionPreset) {
    case 'centered':
      return 'centered composition, clear focal point';
    case 'rule_of_thirds':
      return 'rule of thirds composition';
    case 'close_up':
      return 'close-up, macro detail, shallow depth of field';
    case 'wide':
      return 'wide shot, environmental context';
    case 'top_down':
      return 'top-down flat lay, overhead view';
    default:
      return '';
  }
}

function paletteHint(palettePreset) {
  switch (palettePreset) {
    case 'vibrant':
      return 'vibrant colors, high saturation';
    case 'pastel':
      return 'pastel palette, soft tones';
    case 'monochrome':
      return 'monochrome palette, tonal contrast';
    case 'warm':
      return 'warm palette, oranges and reds';
    case 'cool':
      return 'cool palette, blues and teals';
    case 'neutral':
      return 'neutral palette, beige and gray tones';
    default:
      return '';
  }
}

function moodHint(moodPreset) {
  switch (moodPreset) {
    case 'clean':
      return 'clean, modern';
    case 'luxury':
      return 'luxury, premium, elegant';
    case 'playful':
      return 'playful, fun, energetic';
    case 'dramatic':
      return 'dramatic, bold, high contrast';
    case 'cozy':
      return 'cozy, warm, inviting';
    default:
      return '';
  }
}

function deriveSize(settings) {
  const preset = PLATFORM_PRESETS.find((p) => p.value === settings.platformPreset);
  if (preset && preset.value !== 'custom') return { width: preset.width, height: preset.height };
  const width = Number(settings.width) || 1024;
  const height = Number(settings.height) || 1024;
  return { width, height };
}

export function buildPrompt(settings) {
  const subject = (settings.subject || '').trim();

  const { width, height } = deriveSize(settings);
  const brand = settings._brandProfile || null;
  const brandConsistency = (settings.brandConsistency || 'medium').toLowerCase();
  const wantsLogoInScene = Boolean(settings.logoInScene && brand && (brand.logoDataUrlSmall || brand.logoDataUrl));

  const brandHints = [];
  if (brand && settings.useBrandProfile) {
    if (brand.name) brandHints.push(`brand: ${brand.name}`);
    if (brand.industry) brandHints.push(`industry: ${brand.industry}`);
    if (brand.tone) brandHints.push(`tone: ${brand.tone}`);
    const palette = Array.isArray(brand.palette) ? brand.palette.filter(Boolean).slice(0, 6) : [];
    if (palette.length) brandHints.push(`use brand color palette: ${palette.join(', ')}`);
    if (brandConsistency === 'high') {
      brandHints.push('very consistent brand template, consistent layout, consistent lighting, consistent color usage');
    } else if (brandConsistency === 'medium') {
      brandHints.push('consistent brand look and feel');
    }
  }
  if (wantsLogoInScene) {
    brandHints.push('include the brand logo (use the provided reference image) on packaging, signage, or a subtle watermark');
    brandHints.push('logo should be sharp, undistorted, and readable; no extra brands');
  }

  const overlayText = (settings.overlayText || '').trim();
  const overlayHints = [];
  if (overlayText) {
    const pos = (settings.overlayPosition || 'bottom').replace('_', ' ');
    const style = (settings.overlayStyle || 'clean').replace('_', ' ');
    const lang = (settings.overlayLanguage || 'auto');
    if (settings.allowText) {
      overlayHints.push(`include text overlay: "${overlayText}"`);
      overlayHints.push(`text position: ${pos}`);
      overlayHints.push(`text style: ${style}`);
      overlayHints.push(lang === 'auto' ? 'language: match the text' : `language: ${lang}`);
    } else {
      overlayHints.push(`leave clean empty space for text overlay at ${pos}`);
      overlayHints.push(`do not render any text in the image`);
    }
  }

  const hints = compact([
    subject,
    contentHint(settings.contentPreset),
    styleHint(settings.stylePreset),
    lightingHint(settings.lightingPreset),
    compositionHint(settings.compositionPreset),
    paletteHint(settings.palettePreset),
    moodHint(settings.moodPreset),
    platformHint(settings.platformPreset),
    settings.scene ? `scene: ${settings.scene}` : '',
    settings.beats ? `camera beats: ${settings.beats}` : '',
    settings.background ? `background: ${settings.background}` : '',
    settings.camera ? `camera: ${settings.camera}` : '',
    ...brandHints,
    ...overlayHints,
    ...(settings.referenceMode && settings.referenceMode !== 'off'
      ? referenceHints({ palette: settings.referencePalette, vibe: settings.referenceVibe })
      : []),
  ]);

  const globalConstraints = compact([
    settings.allowText ? '' : 'no text, no typography, no captions',
    wantsLogoInScene ? 'no other logos, no other brand names, no watermarks' : settings.avoidLogos ? 'no logos, no brand names, no watermarks' : '',
    'no UI, no frames, no borders',
  ]);

  const prompt = compact([hints.join(', '), globalConstraints.join(', ')]).join('. ');

  const negativeBase = compact([
    settings.allowText ? '' : 'text, typography, watermark',
    wantsLogoInScene ? 'other logos, other brand names' : settings.avoidLogos ? 'logo, brand name' : '',
    'blurry, low quality, jpeg artifacts, deformed, bad anatomy, extra limbs',
  ]).join(', ');

  const negative_extra = (settings.negativePromptExtra || '').trim();
  const negative_prompt = compact([negativeBase, negative_extra]).join(', ');

  return {
    prompt,
    negative_prompt,
    width,
    height,
  };
}
