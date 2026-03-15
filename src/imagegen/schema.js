export const DEFAULT_POLLINATIONS_BASE_URL = 'https://gen.pollinations.ai';

export function getPollinationsBaseUrl() {
  const fromEnv = (process.env.REACT_APP_POLLINATIONS_BASE_URL || '').trim();
  if (!fromEnv) return DEFAULT_POLLINATIONS_BASE_URL;
  return fromEnv.replace(/\/+$/, '');
}

export const PLATFORM_PRESETS = [
  { value: 'instagram_square', label: 'Instagram Post (1:1)', width: 1024, height: 1024 },
  { value: 'instagram_portrait', label: 'Instagram Post (4:5)', width: 1024, height: 1280 },
  { value: 'instagram_story', label: 'Story/Reel (9:16)', width: 1080, height: 1920 },
  { value: 'widescreen', label: 'Widescreen (16:9)', width: 1280, height: 720 },
  { value: 'youtube_thumbnail', label: 'YouTube Thumbnail (16:9)', width: 1280, height: 720 },
  { value: 'twitter_header', label: 'X Header (3:1)', width: 1500, height: 500 },
  { value: 'custom', label: 'Custom Size', width: 1024, height: 1024 },
];

export const CONTENT_PRESETS = [
  { value: 'generic', label: 'Generic (Any)' },
  { value: 'food', label: 'Food / Drink' },
  { value: 'product', label: 'Product' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'travel', label: 'Travel / Location' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'event', label: 'Event / Promo Background' },
  { value: 'quote_bg', label: 'Quote Background' },
  { value: 'abstract', label: 'Abstract' },
];

export const STYLE_PRESETS = [
  { value: 'photoreal', label: 'Photoreal' },
  { value: 'studio', label: 'Studio / Commercial' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'illustration', label: 'Illustration' },
  { value: '3d', label: '3D Render' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
];

export const LIGHTING_PRESETS = [
  { value: 'natural', label: 'Natural Light' },
  { value: 'softbox', label: 'Softbox Studio' },
  { value: 'golden_hour', label: 'Golden Hour' },
  { value: 'moody', label: 'Moody' },
  { value: 'neon', label: 'Neon' },
];

export const COMPOSITION_PRESETS = [
  { value: 'centered', label: 'Centered' },
  { value: 'rule_of_thirds', label: 'Rule of Thirds' },
  { value: 'close_up', label: 'Close-Up' },
  { value: 'wide', label: 'Wide Shot' },
  { value: 'top_down', label: 'Top-Down' },
];

export const PALETTE_PRESETS = [
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'monochrome', label: 'Monochrome' },
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'neutral', label: 'Neutral' },
];

export const MOOD_PRESETS = [
  { value: 'clean', label: 'Clean' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'playful', label: 'Playful' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'cozy', label: 'Cozy' },
];

export const MODEL_PRESETS = [
  { value: 'flux', label: 'flux (default)' },
  { value: 'turbo', label: 'turbo (faster, sometimes unavailable)' },
  { value: 'gptimage', label: 'gptimage (stylized)' },
  { value: 'kontext', label: 'kontext (alternative)' },
];

export const DEFAULTS = {
  subject: '',
  mediaType: 'image', // image | video
  useProxy: false,
  voice: 'alloy',
  logoInScene: false,
  logoOverlayEnabled: false,
  logoOverlayPosition: 'bottom_right', // top_left | top_right | bottom_left | bottom_right | center
  logoOverlaySizePct: 18, // % of base image width
  logoOverlayOpacity: 0.9, // 0..1
  logoOverlayPadding: 18, // px
  platformPreset: 'instagram_square',
  width: 1024,
  height: 1024,
  contentPreset: 'generic',
  stylePreset: 'photoreal',
  lightingPreset: 'natural',
  compositionPreset: 'centered',
  palettePreset: 'vibrant',
  moodPreset: 'clean',
  background: '',
  scene: '',
  beats: '',
  camera: '',
  overlayText: '',
  overlayLanguage: 'auto',
  overlayPosition: 'bottom',
  overlayStyle: 'clean_bold',
  model: 'flux',
  duration: 8,
  aspectRatio: '9:16',
  audio: false,
  seedMode: 'random',
  seedValue: '',
  variations: 4,
  enhance: false,
  safe: true,
  transparent: false,
  quality: 'high',
  allowText: false,
  avoidLogos: true,
  negativePromptExtra: '',
  useBrandProfile: true,
  brandId: '',
  brandConsistency: 'high',
  referenceMode: 'off', // off | style | strong
  referenceImageDataUrl: '',
  referencePalette: [],
  referenceVibe: null,
  persistHistory: true,
  historyLimit: 24,
};

export const SETTINGS_SCHEMA = [
  {
    id: 'input',
    title: 'Subject',
    titleKey: 'schema.section.subject',
    fields: [
      {
        key: 'subject',
        type: 'textarea',
        label: 'What do you want to generate?',
        labelKey: 'schema.field.subject.label',
        placeholder: 'Example: A luxury perfume bottle on a marble table with soft shadows',
        placeholderKey: 'schema.field.subject.placeholder',
        rows: 4,
      },
    ],
  },
  {
    id: 'brand',
    title: 'Brand',
    titleKey: 'schema.section.brand',
    fields: [
      {
        key: 'useBrandProfile',
        type: 'toggle',
        label: 'Use brand profile (colors + style consistency)',
        labelKey: 'schema.field.useBrandProfile.label',
      },
      {
        key: 'brandId',
        type: 'brand_select',
        label: 'Brand profile',
        labelKey: 'schema.field.brandId.label',
        visibleIf: { key: 'useBrandProfile', equals: true },
      },
      {
        key: 'brandConsistency',
        type: 'select',
        label: 'Consistency',
        labelKey: 'schema.field.brandConsistency.label',
        visibleIf: { key: 'useBrandProfile', equals: true },
        options: [
          { value: 'low', label: 'Low (more creative)', labelKey: 'schema.option.brandConsistency.low' },
          { value: 'medium', label: 'Medium', labelKey: 'schema.option.brandConsistency.medium' },
          { value: 'high', label: 'High (more consistent)', labelKey: 'schema.option.brandConsistency.high' },
        ],
      },
    ],
  },
  {
    id: 'output',
    title: 'Output',
    titleKey: 'schema.section.output',
    fields: [
      {
        key: 'mediaType',
        type: 'select',
        label: 'Type',
        labelKey: 'schema.field.mediaType.label',
        options: [
          { value: 'image', label: 'Image', labelKey: 'schema.option.mediaType.image' },
          { value: 'video', label: 'Video', labelKey: 'schema.option.mediaType.video' },
          { value: 'text', label: 'Text', labelKey: 'schema.option.mediaType.text' },
          { value: 'audio', label: 'Audio (TTS)', labelKey: 'schema.option.mediaType.audio' },
        ],
      },
      {
        key: 'platformPreset',
        type: 'select',
        label: 'Preset',
        labelKey: 'schema.field.platformPreset.label',
        options: PLATFORM_PRESETS,
        visibleIf: { key: 'mediaType', equals: 'image' },
      },
      { key: 'width', type: 'number', label: 'Width', labelKey: 'schema.field.width.label', min: 256, max: 2048, step: 64, visibleIf: { key: 'mediaType', equals: 'image' } },
      { key: 'height', type: 'number', label: 'Height', labelKey: 'schema.field.height.label', min: 256, max: 2048, step: 64, visibleIf: { key: 'mediaType', equals: 'image' } },
      {
        key: 'model',
        type: 'select',
        label: 'Model',
        labelKey: 'schema.field.model.label',
        options: MODEL_PRESETS,
      },
      {
        key: 'duration',
        type: 'number',
        label: 'Duration (seconds)',
        labelKey: 'schema.field.duration.label',
        min: 2,
        max: 12,
        step: 1,
        visibleIf: { key: 'mediaType', equals: 'video' },
      },
      {
        key: 'aspectRatio',
        type: 'select',
        label: 'Aspect ratio',
        labelKey: 'schema.field.aspectRatio.label',
        visibleIf: { key: 'mediaType', equals: 'video' },
        options: [
          { value: '9:16', label: '9:16 (Reels/Story)', labelKey: 'schema.option.aspectRatio.9x16' },
          { value: '16:9', label: '16:9 (Widescreen)', labelKey: 'schema.option.aspectRatio.16x9' },
          { value: '1:1', label: '1:1 (Square)', labelKey: 'schema.option.aspectRatio.1x1' },
        ],
      },
      {
        key: 'audio',
        type: 'toggle',
        label: 'Audio (if supported)',
        labelKey: 'schema.field.audio.label',
        visibleIf: { key: 'mediaType', equals: 'video' },
      },
      {
        key: 'voice',
        type: 'select',
        label: 'Voice',
        labelKey: 'schema.field.voice.label',
        visibleIf: { key: 'mediaType', equals: 'audio' },
        options: [
          { value: 'alloy', label: 'alloy' },
          { value: 'echo', label: 'echo' },
          { value: 'fable', label: 'fable' },
          { value: 'onyx', label: 'onyx' },
          { value: 'nova', label: 'nova' },
          { value: 'shimmer', label: 'shimmer' },
        ],
      },
      {
        key: 'seedMode',
        type: 'select',
        label: 'Seed',
        labelKey: 'schema.field.seedMode.label',
        options: [
          { value: 'random', label: 'Random (new each time)', labelKey: 'schema.option.seedMode.random' },
          { value: 'custom', label: 'Custom (locked)', labelKey: 'schema.option.seedMode.custom' },
        ],
      },
      {
        key: 'seedValue',
        type: 'text',
        label: 'Custom seed',
        labelKey: 'schema.field.seedValue.label',
        placeholder: 'Example: 123456',
        placeholderKey: 'schema.field.seedValue.placeholder',
        visibleIf: { key: 'seedMode', equals: 'custom' },
      },
      {
        key: 'variations',
        type: 'select',
        label: 'Variations',
        labelKey: 'schema.field.variations.label',
        options: [
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 4, label: '4' },
          { value: 6, label: '6' },
        ],
      },
    ],
  },
  {
    id: 'network',
    title: 'Network',
    titleKey: 'schema.section.network',
    fields: [{ key: 'useProxy', type: 'toggle', label: 'Use server proxy (hide key on deploy)', labelKey: 'schema.field.useProxy.label' }],
  },
  {
    id: 'creative',
    title: 'Creative',
    titleKey: 'schema.section.creative',
    fields: [
      { key: 'contentPreset', type: 'select', label: 'Content type', labelKey: 'schema.field.contentPreset.label', options: CONTENT_PRESETS },
      { key: 'stylePreset', type: 'select', label: 'Style', labelKey: 'schema.field.stylePreset.label', options: STYLE_PRESETS },
      { key: 'lightingPreset', type: 'select', label: 'Lighting', labelKey: 'schema.field.lightingPreset.label', options: LIGHTING_PRESETS },
      { key: 'compositionPreset', type: 'select', label: 'Composition', labelKey: 'schema.field.compositionPreset.label', options: COMPOSITION_PRESETS },
      { key: 'palettePreset', type: 'select', label: 'Palette', labelKey: 'schema.field.palettePreset.label', options: PALETTE_PRESETS },
      { key: 'moodPreset', type: 'select', label: 'Mood', labelKey: 'schema.field.moodPreset.label', options: MOOD_PRESETS },
      {
        key: 'scene',
        type: 'textarea',
        label: 'Scene (optional)',
        labelKey: 'schema.field.scene.label',
        placeholder: 'Example: modern restaurant, QR code stand on the table, customer scanning with phone',
        placeholderKey: 'schema.field.scene.placeholder',
        rows: 2,
      },
      {
        key: 'beats',
        type: 'textarea',
        label: 'Camera beats (optional)',
        labelKey: 'schema.field.beats.label',
        placeholder: 'Example: Close-up → scan QR → phone screen menu → owner smiling',
        placeholderKey: 'schema.field.beats.placeholder',
        rows: 2,
      },
      {
        key: 'background',
        type: 'text',
        label: 'Background (optional)',
        labelKey: 'schema.field.background.label',
        placeholder: 'Example: clean white backdrop, bokeh city lights',
        placeholderKey: 'schema.field.background.placeholder',
      },
      {
        key: 'camera',
        type: 'text',
        label: 'Camera notes (optional)',
        labelKey: 'schema.field.camera.label',
        placeholder: 'Example: 85mm, shallow depth of field, f/1.8',
        placeholderKey: 'schema.field.camera.placeholder',
      },
    ],
  },
  {
    id: 'reference',
    title: 'Reference image',
    titleKey: 'schema.section.reference',
    fields: [
      {
        key: 'referenceMode',
        type: 'select',
        label: 'Mode',
        labelKey: 'schema.field.referenceMode.label',
        options: [
          { value: 'off', label: 'Off', labelKey: 'schema.option.referenceMode.off' },
          { value: 'style', label: 'Style mimic (colors + vibe)', labelKey: 'schema.option.referenceMode.style' },
          { value: 'strong', label: 'Strong match (use image as reference)', labelKey: 'schema.option.referenceMode.strong' },
        ],
      },
      {
        key: 'referenceImageDataUrl',
        type: 'reference_upload',
        label: 'Upload image',
        labelKey: 'schema.field.referenceImageDataUrl.label',
        visibleIf: { key: 'referenceMode', equals: 'style' },
      },
      {
        key: 'referenceImageDataUrl',
        type: 'reference_upload',
        label: 'Upload image',
        labelKey: 'schema.field.referenceImageDataUrl.label',
        visibleIf: { key: 'referenceMode', equals: 'strong' },
      },
    ],
  },
  {
    id: 'overlay',
    title: 'Overlay (optional)',
    titleKey: 'schema.section.overlay',
    fields: [
      {
        key: 'overlayText',
        type: 'textarea',
        label: 'Text overlay (optional)',
        labelKey: 'schema.field.overlayText.label',
        placeholder: 'Tip: text in images may be imperfect; you can also ask for empty space and add text later.',
        placeholderKey: 'schema.field.overlayText.placeholder',
        rows: 2,
      },
      {
        key: 'overlayLanguage',
        type: 'select',
        label: 'Language',
        labelKey: 'schema.field.overlayLanguage.label',
        options: [
          { value: 'auto', label: 'Auto', labelKey: 'schema.option.overlayLanguage.auto' },
          { value: 'ar', label: 'Arabic', labelKey: 'schema.option.overlayLanguage.ar' },
          { value: 'en', label: 'English', labelKey: 'schema.option.overlayLanguage.en' },
        ],
      },
      {
        key: 'overlayPosition',
        type: 'select',
        label: 'Position',
        labelKey: 'schema.field.overlayPosition.label',
        options: [
          { value: 'top', label: 'Top', labelKey: 'schema.option.overlayPosition.top' },
          { value: 'center', label: 'Center', labelKey: 'schema.option.overlayPosition.center' },
          { value: 'bottom', label: 'Bottom', labelKey: 'schema.option.overlayPosition.bottom' },
          { value: 'left', label: 'Left', labelKey: 'schema.option.overlayPosition.left' },
          { value: 'right', label: 'Right', labelKey: 'schema.option.overlayPosition.right' },
        ],
      },
      {
        key: 'overlayStyle',
        type: 'select',
        label: 'Style',
        labelKey: 'schema.field.overlayStyle.label',
        options: [
          { value: 'clean_bold', label: 'Clean + bold', labelKey: 'schema.option.overlayStyle.clean_bold' },
          { value: 'minimal', label: 'Minimal', labelKey: 'schema.option.overlayStyle.minimal' },
          { value: 'luxury', label: 'Luxury', labelKey: 'schema.option.overlayStyle.luxury' },
          { value: 'playful', label: 'Playful', labelKey: 'schema.option.overlayStyle.playful' },
        ],
      },
    ],
  },
  {
    id: 'constraints',
    title: 'Constraints',
    titleKey: 'schema.section.constraints',
    fields: [
      { key: 'allowText', type: 'toggle', label: 'Allow text/typography in image', labelKey: 'schema.field.allowText.label' },
      { key: 'avoidLogos', type: 'toggle', label: 'Avoid logos/brands', labelKey: 'schema.field.avoidLogos.label' },
      { key: 'safe', type: 'toggle', label: 'Safe mode', labelKey: 'schema.field.safe.label' },
      { key: 'enhance', type: 'toggle', label: 'Enhance (if supported)', labelKey: 'schema.field.enhance.label' },
      { key: 'transparent', type: 'toggle', label: 'Transparent background (if supported)', labelKey: 'schema.field.transparent.label' },
      {
        key: 'quality',
        type: 'select',
        label: 'Quality',
        labelKey: 'schema.field.quality.label',
        options: [
          { value: 'low', label: 'Low', labelKey: 'schema.option.quality.low' },
          { value: 'medium', label: 'Medium', labelKey: 'schema.option.quality.medium' },
          { value: 'high', label: 'High', labelKey: 'schema.option.quality.high' },
        ],
      },
      {
        key: 'negativePromptExtra',
        type: 'textarea',
        label: 'Negative prompt (extra)',
        labelKey: 'schema.field.negativePromptExtra.label',
        placeholder: 'Example: text, watermark, logo, blur, low quality',
        placeholderKey: 'schema.field.negativePromptExtra.placeholder',
        rows: 3,
      },
    ],
  },
  {
    id: 'storage',
    title: 'Storage',
    titleKey: 'schema.section.storage',
    fields: [
      { key: 'persistHistory', type: 'toggle', label: 'Save history in localStorage', labelKey: 'schema.field.persistHistory.label' },
      { key: 'historyLimit', type: 'number', label: 'History limit', labelKey: 'schema.field.historyLimit.label', min: 6, max: 100, step: 1 },
    ],
  },
];
