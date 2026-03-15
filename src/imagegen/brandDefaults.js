export function makeDefaultBrandProfile() {
  return {
    id: `brand-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: 'New Brand',
    description: '',
    industry: '',
    tone: 'professional',
    logoName: '',
    logoDataUrl: '',
    logoDataUrlSmall: '',
    palette: [],
    defaults: {
      platformPreset: 'instagram_square',
      stylePreset: 'cinematic',
      lightingPreset: 'warm',
      moodPreset: 'clean',
      allowText: false,
      avoidLogos: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function makeScanDineExampleBrand() {
  return {
    id: 'brand-scan-dine',
    name: 'Scan Dine',
    description: 'Restaurant SaaS / QR Menu',
    industry: 'Restaurant SaaS',
    tone: 'professional',
    logoName: '',
    logoDataUrl: '',
    logoDataUrlSmall: '',
    palette: ['#6D5BFF', '#0B1020', '#E9EEFC'],
    defaults: {
      platformPreset: 'instagram_story',
      stylePreset: 'cinematic',
      lightingPreset: 'golden_hour',
      compositionPreset: 'centered',
      palettePreset: 'warm',
      moodPreset: 'luxury',
      allowText: false,
      avoidLogos: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
