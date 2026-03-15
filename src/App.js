import './App.css';
import { useEffect, useMemo, useState } from 'react';

import { DEFAULTS, PLATFORM_PRESETS, SETTINGS_SCHEMA } from './imagegen/schema';
import { buildPrompt } from './imagegen/promptBuilder';
import {
  buildPollinationsAudioUrl,
  buildPollinationsImageUrl,
  buildPollinationsTextUrl,
  buildPollinationsVideoUrl,
  downloadImageFromUrl,
} from './imagegen/pollinationsClient';
import { clearHistory, loadHistory, saveHistory } from './imagegen/storage';
import { loadActiveBrandId, loadBrands, saveActiveBrandId, saveBrands } from './imagegen/brandStorage';
import { makeDefaultBrandProfile, makeScanDineExampleBrand } from './imagegen/brandDefaults';
import { extractPaletteFromImageData, imageDataToPngDataUrl, loadImageToImageData } from './imagegen/colorUtils';
import { analyzeReferenceImage } from './imagegen/referenceUtils';
import { downloadImageWithLogoOverlay } from './imagegen/logoOverlay';
import {
  fetchPollinationsAudioModels,
  fetchPollinationsImageModels,
  fetchPollinationsTextModels,
  loadCachedModels,
  saveCachedModels,
} from './imagegen/modelsApi';
import { clearRuntimeApiKey, loadRuntimeApiKey, saveRuntimeApiKey } from './imagegen/apiKeyStorage';

import useIsMobile from './ui/useIsMobile';
import Sheet from './ui/Sheet';
import PreviewHero from './ui/PreviewHero';
import TabsPanel from './ui/TabsPanel';
import BrandEditor from './ui/BrandEditor';
import PromptCard from './ui/PromptCard';
import { SettingsForm } from './ui/FormFields';
import { useI18n } from './i18n/I18nProvider';

function clampNumber(value, { min, max }) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function normalizeSettings(settings) {
  const width = clampNumber(settings.width, { min: 256, max: 2048 });
  const height = clampNumber(settings.height, { min: 256, max: 2048 });
  const historyLimit = clampNumber(settings.historyLimit, { min: 6, max: 100 });

  const logoOverlaySizePct = clampNumber(settings.logoOverlaySizePct, { min: 5, max: 40 });
  const logoOverlayOpacity = clampNumber(settings.logoOverlayOpacity, { min: 0.05, max: 1 });
  const logoOverlayPadding = clampNumber(settings.logoOverlayPadding, { min: 0, max: 80 });
  const pos = String(settings.logoOverlayPosition || 'bottom_right');
  const allowedPos = ['top_left', 'top_right', 'bottom_left', 'bottom_right', 'center'];
  const logoOverlayPosition = allowedPos.includes(pos) ? pos : 'bottom_right';

  return {
    ...settings,
    width,
    height,
    historyLimit,
    logoInScene: Boolean(settings.logoInScene),
    logoOverlayEnabled: Boolean(settings.logoOverlayEnabled),
    logoOverlaySizePct,
    logoOverlayOpacity,
    logoOverlayPadding,
    logoOverlayPosition,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function stripKeyFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    u.searchParams.delete('key');
    return u.toString();
  } catch {
    return urlStr;
  }
}

function addKeyToUrl(urlStr, apiKey) {
  const key = String(apiKey || '').trim();
  if (!key) return urlStr;
  try {
    const u = new URL(urlStr);
    u.searchParams.set('key', key);
    return u.toString();
  } catch {
    return urlStr;
  }
}

function resolveSeedToUse(settings) {
  if (settings.seedMode === 'custom') {
    const raw = String((settings.seedValue || '').trim());
    const n = Number(raw);
    if (!raw) return null;
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      const err = new Error('CUSTOM_SEED_INVALID');
      err.code = 'CUSTOM_SEED_INVALID';
      throw err;
    }
    return String(n);
  }
  return String(Math.floor(Math.random() * 2147483647));
}

export default function App() {
  const { locale, setLocale, t } = useI18n();
  const mobile = useIsMobile(1100);
  const contactEmail = 'contact@codefalcon.me';
  const envApiKey = useMemo(() => String(process.env.REACT_APP_POLLINATIONS_API_KEY || '').trim(), []);
  const [runtimeApiKey, setRuntimeApiKey] = useState(() => loadRuntimeApiKey());
  const [apiKeyInput, setApiKeyInput] = useState(() => loadRuntimeApiKey());
  const apiKey = String(runtimeApiKey || envApiKey || '').trim();

  const [settings, setSettings] = useState(() => normalizeSettings(DEFAULTS));
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState([]); // [{id, seedUsed, sourceUrl}]
  const [variationStatus, setVariationStatus] = useState({}); // id -> loading|loaded|error
  const [previewLoadState, setPreviewLoadState] = useState({ status: 'idle', error: '' }); // idle|loading|loaded|error
  const [previewNonce, setPreviewNonce] = useState(0);

  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState(() => loadHistory());

  const [brands, setBrands] = useState(() => loadBrands());
  const [activeBrandId, setActiveBrandId] = useState(() => loadActiveBrandId());

  const [activeTab, setActiveTab] = useState('prompt'); // prompt | history
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [imageModels, setImageModels] = useState(() => loadCachedModels('image') || []);
  const [textModels, setTextModels] = useState(() => loadCachedModels('text') || []);
  const [audioModels, setAudioModels] = useState(() => loadCachedModels('audio') || []);
  const [modelsError, setModelsError] = useState('');

  useEffect(() => {
    setApiKeyInput(runtimeApiKey || '');
  }, [runtimeApiKey]);

  useEffect(() => {
    // Desktop: keep settings visible by default. Mobile: closed by default.
    setSettingsOpen((prev) => {
      if (mobile) return false;
      return prev || true;
    });
  }, [mobile]);

  useEffect(() => {
    if (brands.length) return;
    const seeded = [makeScanDineExampleBrand()];
    setBrands(seeded);
    saveBrands(seeded);
    setActiveBrandId(seeded[0].id);
    saveActiveBrandId(seeded[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveBrands(brands);
  }, [brands]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setModelsError('');
      try {
        const results = await Promise.allSettled([
          fetchPollinationsImageModels(),
          fetchPollinationsTextModels(),
          fetchPollinationsAudioModels(),
        ]);
        if (cancelled) return;

        const [img, txt, aud] = results;
        if (img.status === 'fulfilled') {
          setImageModels(img.value);
          saveCachedModels('image', img.value);
        }
        if (txt.status === 'fulfilled') {
          setTextModels(txt.value);
          saveCachedModels('text', txt.value);
        }
        if (aud.status === 'fulfilled') {
          setAudioModels(aud.value);
          saveCachedModels('audio', aud.value);
        }

        const errs = results
          .filter((r) => r.status === 'rejected')
          .map((r) => String(r.reason || 'Failed to load models'));
        if (errs.length) setModelsError(errs.join(' • '));
      } catch (e) {
        if (cancelled) return;
        setModelsError(String(e));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeBrandId) return;
    saveActiveBrandId(activeBrandId);
  }, [activeBrandId]);

  useEffect(() => {
    if (!settings.persistHistory) return;
    const serializable = history
      .slice(0, settings.historyLimit)
      .map(({ sourceUrl, ...rest }) => ({
        ...rest,
        sourceUrl: sourceUrl ? stripKeyFromUrl(sourceUrl) : sourceUrl,
      }));
    saveHistory(serializable);
  }, [history, settings.persistHistory, settings.historyLimit]);

  useEffect(() => {
    if (!settings.useBrandProfile) return;
    if (settings.brandId) return;
    if (!activeBrandId) return;
    setSettings((prev) => ({ ...prev, brandId: activeBrandId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrandId, settings.useBrandProfile]);

  const activeBrand = useMemo(() => {
    const id = settings.brandId || activeBrandId;
    return brands.find((b) => b.id === id) || null;
  }, [brands, settings.brandId, activeBrandId]);

  const promptPreview = useMemo(() => {
    const normalized = normalizeSettings(settings);
    const withBrand = { ...normalized, _brandProfile: activeBrand };
    if (normalized.mediaType === 'audio') {
      return { prompt: String(normalized.subject || '').trim(), negative_prompt: '', width: normalized.width, height: normalized.height };
    }
    const { prompt, negative_prompt, width, height } = buildPrompt(withBrand);
    return { prompt, negative_prompt, width, height };
  }, [settings, activeBrand]);

  const previewUrl = useMemo(() => {
    if (!current?.sourceUrl) return '';
    const u = addKeyToUrl(current.sourceUrl, apiKey);
    try {
      const url = new URL(u, window.location.origin);
      url.searchParams.set('r', String(previewNonce));
      return url.toString();
    } catch {
      return u;
    }
  }, [current?.sourceUrl, apiKey, previewNonce]);

  useEffect(() => {
    const type = settings.mediaType || 'image';
    if (type === 'text') {
      setPreviewLoadState({ status: 'loaded', error: '' });
      return;
    }
    if (!previewUrl) {
      setPreviewLoadState({ status: 'idle', error: '' });
      return;
    }
    setPreviewLoadState({ status: 'loading', error: '' });
  }, [previewUrl, settings.mediaType]);

  const selectedModelMeta = useMemo(() => {
    const type = settings.mediaType || 'image';
    const catalog = type === 'text' ? textModels : type === 'audio' ? audioModels : imageModels;
    return catalog.find((x) => x?.name === settings.model) || null;
  }, [imageModels, textModels, audioModels, settings.mediaType, settings.model]);

  const inferredMediaType = settings.mediaType || 'image';

  const allowedModelsForType = useMemo(() => {
    const type = settings.mediaType || 'image';
    if (type === 'text') return (textModels || []).filter((m) => m && typeof m.name === 'string').map((m) => m.name);
    if (type === 'audio') return (audioModels || []).filter((m) => m && typeof m.name === 'string').map((m) => m.name);

    const wantVideo = type === 'video';
    return (imageModels || [])
      .filter((m) => m && typeof m.name === 'string')
      .filter((m) => {
        const outs = m.output_modalities;
        const isVideo = Array.isArray(outs) && outs.includes('video');
        return wantVideo ? isVideo : !isVideo;
      })
      .map((m) => m.name);
  }, [imageModels, textModels, audioModels, settings.mediaType]);

  useEffect(() => {
    // Ensure selected model matches the chosen Type.
    if (!allowedModelsForType.length) return;
    if (allowedModelsForType.includes(settings.model)) return;

    const type = settings.mediaType || 'image';
    const preferred =
      (type === 'video'
        ? allowedModelsForType.find((m) => m === 'grok-video')
        : type === 'text'
          ? allowedModelsForType.find((m) => m === 'openai-fast') || allowedModelsForType.find((m) => m === 'openai')
          : type === 'audio'
            ? allowedModelsForType.find((m) => m === 'elevenlabs')
            : allowedModelsForType.find((m) => m === 'flux')) || allowedModelsForType[0];
    if (!preferred) return;
    setSettings((prev) => ({ ...prev, model: preferred }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedModelsForType, settings.mediaType]);

  useEffect(() => {
    if (settings.mediaType !== 'audio') return;
    const voices = selectedModelMeta?.voices;
    if (!Array.isArray(voices) || !voices.length) return;
    if (voices.includes(settings.voice)) return;
    setSettings((prev) => ({ ...prev, voice: voices[0] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mediaType, selectedModelMeta, settings.voice]);

  const modelCostLabel = useMemo(() => {
    const p = selectedModelMeta?.pricing || {};
    if (typeof p.completionImageTokens === 'number') return `${p.completionImageTokens} pollen/img`;
    if (typeof p.completionVideoSeconds === 'number') return `${p.completionVideoSeconds} pollen/sec`;
    if (typeof p.completionVideoTokens === 'number') return `${p.completionVideoTokens} pollen/video-token`;
    if (typeof p.completionTextTokens === 'number') return `${p.completionTextTokens} pollen/token`;
    if (typeof p.promptTextTokens === 'number') return `${p.promptTextTokens} pollen/prompt-token`;
    if (typeof p.completionAudioTokens === 'number') return `${p.completionAudioTokens} pollen/audio-token`;
    if (typeof p.completionAudioSeconds === 'number') return `${p.completionAudioSeconds} pollen/sec-audio`;
    return '';
  }, [selectedModelMeta]);

  const modelDailyEstimate = useMemo(() => {
    const p = selectedModelMeta?.pricing || {};
    if (settings.mediaType === 'video') {
      const seconds = clampNumber(settings.duration, { min: 1, max: 60 });
      if (typeof p.completionVideoSeconds === 'number' && p.completionVideoSeconds > 0) {
        const cost = p.completionVideoSeconds * seconds;
        const perDay = Math.floor(1.5 / cost);
        if (!Number.isFinite(perDay) || perDay <= 0) return '';
        return `~${perDay} videos/day @ 1.5 pollen`;
      }
      return '';
    }
    if (settings.mediaType === 'audio') return '';
    if (settings.mediaType === 'text') return '';
    if (typeof p.completionImageTokens === 'number' && p.completionImageTokens > 0) {
      const perDay = Math.floor(1.5 / p.completionImageTokens);
      if (!Number.isFinite(perDay) || perDay <= 0) return '';
      return `~${perDay} images/day @ 1.5 pollen`;
    }
    return '';
  }, [selectedModelMeta, settings.mediaType, settings.duration]);

  function updateSetting(key, value) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'mediaType') {
        if (value === 'video') {
          next.model = 'grok-video';
          next.duration = next.duration || 8;
          next.aspectRatio = next.aspectRatio || '9:16';
        } else if (value === 'text') {
          next.model = 'openai-fast';
        } else if (value === 'audio') {
          next.model = 'elevenlabs';
          next.voice = next.voice || 'alloy';
        } else {
          next.model = 'flux';
        }
      }
      if (key === 'platformPreset') {
        const preset = PLATFORM_PRESETS.find((p) => p.value === value);
        if (preset && preset.value !== 'custom') {
          next.width = preset.width;
          next.height = preset.height;
        }
      }
      return normalizeSettings(next);
    });
  }

  async function onUploadReference(file) {
    if (!file) return;
    try {
      const { dataUrl, palette, vibe } = await analyzeReferenceImage(file);
      setSettings((prev) =>
        normalizeSettings({
          ...prev,
          referenceImageDataUrl: dataUrl,
          referencePalette: palette,
          referenceVibe: vibe,
        }),
      );
    } catch (e) {
      setError(`Reference upload failed: ${String(e)}`);
    }
  }

  function clearReference() {
    setSettings((prev) =>
      normalizeSettings({
        ...prev,
        referenceImageDataUrl: '',
        referencePalette: [],
        referenceVibe: null,
      }),
    );
  }

  function randomizeSeed() {
    const n = Math.floor(Math.random() * 2147483647);
    updateSetting('seedMode', 'custom');
    updateSetting('seedValue', String(n));
  }

  async function onGenerate() {
    setError('');
    setVariations([]);
    setVariationStatus({});

    const subject = (settings.subject || '').trim();
    if (!subject) {
      setError(t('validation.subjectRequired'));
      setSettingsOpen(false);
      return;
    }
    if (!apiKey && !settings.useProxy) {
      setError(t('settings.apiKeyHelp'));
      return;
    }

    setIsGenerating(true);
    try {
      const normalized = normalizeSettings(settings);
      const withBrand = { ...normalized, _brandProfile: activeBrand };
      const { prompt, negative_prompt, width, height } = buildPrompt(withBrand);

      if (normalized.useProxy && normalized.referenceMode === 'strong' && normalized.referenceImageDataUrl) {
        setError(t('validation.strongRefProxyUnsupported'));
        return;
      }

      if (normalized.mediaType === 'video') {
        const outs = selectedModelMeta?.output_modalities;
        const isVideoModel = Array.isArray(outs) && outs.includes('video');
        if (!selectedModelMeta) {
          setError(t('validation.videoModelsLoading'));
          return;
        }
        if (!isVideoModel) {
          setError(t('errors.selectedModelNotVideo'));
          return;
        }
      }

      if (normalized.mediaType === 'text' && !selectedModelMeta) {
        setError(t('errors.textModelsLoading'));
        return;
      }

      if (normalized.mediaType === 'audio' && !selectedModelMeta) {
        setError(t('errors.audioModelsLoading'));
        return;
      }

      if (selectedModelMeta?.paid_only) {
        setError(t('validation.modelPaidOnly', { model: normalized.model }));
        return;
      }

      if (normalized.mediaType === 'text') {
        const seedUsed = resolveSeedToUse(normalized) || '';
        const textPrompt = prompt; // reuse the composed prompt (brand + presets) as an instruction
        const textUrl = buildPollinationsTextUrl({
          prompt: textPrompt,
          model: normalized.model,
          seed: seedUsed || undefined,
          apiKey: normalized.useProxy ? undefined : apiKey || undefined,
          useProxy: normalized.useProxy,
        });
        const abs = new URL(textUrl, window.location.origin).toString();
        const resp = await fetch(abs);
        const out = await resp.text();
        if (!resp.ok) throw new Error(out || `HTTP ${resp.status}`);

        const item = {
          id: makeId(),
          createdAt: nowIso(),
          sourceUrl: textUrl,
          prompt: textPrompt,
          negative_prompt: '',
          seedUsed,
          mediaType: 'text',
          resultText: out,
          settings: { ...normalized, width, height },
        };
        setCurrent(item);
        setHistory((prev) => [item, ...prev].slice(0, normalized.historyLimit));
        setActiveTab('prompt');
        setPreviewLoadState({ status: 'loaded', error: '' });
        return;
      }

      if (normalized.mediaType === 'audio') {
        const textToSpeak = subject;
        const audioUrl = buildPollinationsAudioUrl({
          text: textToSpeak,
          model: normalized.model,
          voice: normalized.voice,
          apiKey: normalized.useProxy ? undefined : apiKey || undefined,
          useProxy: normalized.useProxy,
        });

        const item = {
          id: makeId(),
          createdAt: nowIso(),
          sourceUrl: audioUrl,
          prompt: textToSpeak,
          negative_prompt: '',
          seedUsed: '',
          mediaType: 'audio',
          settings: { ...normalized, width, height },
        };
        setCurrent(item);
        setHistory((prev) => [item, ...prev].slice(0, normalized.historyLimit));
        setActiveTab('prompt');
        return;
      }

      const maxVariations = normalized.mediaType === 'video' ? 2 : 6;
      const count = clampNumber(normalized.variations, { min: 1, max: maxVariations });
      const nextVariations = [];
      const nextStatus = {};
      let baseSeed = resolveSeedToUse(normalized);
      if (normalized.seedMode === 'custom' && !baseSeed) {
        baseSeed = String(Math.floor(Math.random() * 2147483647));
      }
      for (let i = 0; i < count; i++) {
        const seedUsed =
          normalized.seedMode === 'custom'
            ? baseSeed
            : String((Number(baseSeed) + i * 1337) % 2147483647);
        const referenceImage =
          normalized.referenceMode === 'strong'
            ? normalized.referenceImageDataUrl || undefined
            : normalized.logoInScene && !normalized.useProxy
              ? activeBrand?.logoDataUrlSmall || activeBrand?.logoDataUrl || undefined
              : undefined;
         const sourceUrl =
           normalized.mediaType === 'video'
             ? buildPollinationsVideoUrl({
                 prompt,
                 model: normalized.model,
                 seed: seedUsed || undefined,
                 apiKey: normalized.useProxy ? undefined : apiKey || undefined,
                 duration: normalized.duration,
                 aspectRatio: normalized.aspectRatio,
                 audio: normalized.audio,
                 referenceImage,
                 useProxy: normalized.useProxy,
               })
             : buildPollinationsImageUrl({
                 prompt,
                 model: normalized.model,
                 width,
                 height,
                 seed: seedUsed || undefined,
                 enhance: normalized.enhance,
                 negative_prompt,
                 safe: normalized.safe,
                 quality: normalized.quality,
                 transparent: normalized.transparent,
                 apiKey: normalized.useProxy ? undefined : apiKey || undefined,
                 referenceImage,
                 useProxy: normalized.useProxy,
               });
        const id = makeId();
        nextVariations.push({ id, seedUsed: seedUsed || '', sourceUrl, mediaType: normalized.mediaType });
        nextStatus[id] = 'loading';
      }

      setVariations(nextVariations);
      setVariationStatus(nextStatus);

      // Pick the first variation as current and add to history.
      const first = nextVariations[0];
      const item = {
        id: makeId(),
        createdAt: nowIso(),
        sourceUrl: first.sourceUrl,
        prompt,
        negative_prompt,
        seedUsed: first.seedUsed,
        mediaType: normalized.mediaType,
        settings: { ...normalized, width, height },
      };
      setCurrent(item);
      setHistory((prev) => [item, ...prev].slice(0, normalized.historyLimit));
      setActiveTab('prompt');
    } catch (e) {
      if (e?.code === 'CUSTOM_SEED_INVALID' || String(e?.message || '').includes('CUSTOM_SEED_INVALID')) {
        setError(t('errors.customSeedInvalid'));
      } else {
        setError(String(e));
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function onDownload() {
    if (!current?.sourceUrl) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const mt = current.mediaType || settings.mediaType;

    const brandIdForItem = current?.settings?.brandId || settings.brandId || activeBrandId || '';
    const brandForItem = (brands || []).find((b) => b?.id === brandIdForItem) || activeBrand;

    const overlayEnabled = Boolean(current?.settings?.logoOverlayEnabled ?? settings.logoOverlayEnabled);
    const overlayPosition = current?.settings?.logoOverlayPosition ?? settings.logoOverlayPosition;
    const overlaySizePct = current?.settings?.logoOverlaySizePct ?? settings.logoOverlaySizePct;
    const overlayOpacity = current?.settings?.logoOverlayOpacity ?? settings.logoOverlayOpacity;
    const overlayPadding = current?.settings?.logoOverlayPadding ?? settings.logoOverlayPadding;

    if (mt === 'image' && overlayEnabled && brandForItem?.logoDataUrl) {
      const url = addKeyToUrl(current.sourceUrl, apiKey);
      const res = await downloadImageWithLogoOverlay({
        imageUrl: url,
        logoDataUrl: brandForItem.logoDataUrl,
        filename: `pollinations-${stamp}.png`,
        position: overlayPosition,
        sizePct: overlaySizePct,
        opacity: overlayOpacity,
        padding: overlayPadding,
      });
      if (!res.ok) {
        setError(String(res.error || 'Logo overlay failed'));
        await downloadImageFromUrl(url, `pollinations-${stamp}.jpg`);
      }
      return;
    }

    const ext = mt === 'video' ? 'mp4' : mt === 'audio' ? 'mp3' : mt === 'text' ? 'txt' : 'jpg';
    await downloadImageFromUrl(addKeyToUrl(current.sourceUrl, apiKey), `pollinations-${stamp}.${ext}`);
  }

  function onCopy(text) {
    if (!text) return;
    navigator.clipboard?.writeText(text);
  }

  function lockSeedFromCurrent() {
    const seed = String(current?.seedUsed || '').trim();
    if (!seed) return;
    updateSetting('seedMode', 'custom');
    updateSetting('seedValue', seed);
  }

  function pickVariation(v) {
    if (!v?.sourceUrl) return;
    const item = {
      id: makeId(),
      createdAt: nowIso(),
      sourceUrl: v.sourceUrl,
      prompt: current?.prompt || promptPreview.prompt,
      negative_prompt: current?.negative_prompt || promptPreview.negative_prompt,
      seedUsed: v.seedUsed || '',
      mediaType: v.mediaType || settings.mediaType,
      settings: current?.settings || normalizeSettings(settings),
    };
    setCurrent(item);
    setHistory((prev) => [item, ...prev].slice(0, (current?.settings?.historyLimit || settings.historyLimit)));
  }

  function onRetryPreview() {
    setPreviewLoadState({ status: 'loading', error: '' });
    setPreviewNonce((n) => n + 1);
  }

  function onClearHistory() {
    setHistory([]);
    setCurrent(null);
    clearHistory();
  }

  async function onUploadLogo(file) {
    if (!file || !activeBrand) return;
    try {
      const [imageDataLarge, imageDataSmall] = await Promise.all([
        loadImageToImageData(file, 512),
        loadImageToImageData(file, 256),
      ]);
      const palette = extractPaletteFromImageData(imageDataSmall, 5);
      const logoDataUrl = imageDataToPngDataUrl(imageDataLarge);
      const logoDataUrlSmall = imageDataToPngDataUrl(imageDataSmall);
      setBrands((prev) =>
        prev.map((b) =>
          b.id === activeBrand.id
            ? { ...b, logoName: file.name, palette, logoDataUrl, logoDataUrlSmall, updatedAt: new Date().toISOString() }
            : b,
        ),
      );
    } catch (e) {
      setError(`Logo upload failed: ${String(e)}`);
    }
  }

  function updateActiveBrand(patch) {
    if (!activeBrand) return;
    setBrands((prev) =>
      prev.map((b) =>
        b.id === activeBrand.id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b,
      ),
    );
  }

  function createBrand() {
    const b = makeDefaultBrandProfile();
    setBrands((prev) => [b, ...prev]);
    setActiveBrandId(b.id);
    setSettings((prev) => ({ ...prev, brandId: b.id, useBrandProfile: true }));
  }

  function applyBrandDefaults() {
    if (!activeBrand?.defaults) return;
    const d = activeBrand.defaults;
    setSettings((prev) => {
      const next = {
        ...prev,
        platformPreset: d.platformPreset ?? prev.platformPreset,
        stylePreset: d.stylePreset ?? prev.stylePreset,
        lightingPreset: d.lightingPreset ?? prev.lightingPreset,
        compositionPreset: d.compositionPreset ?? prev.compositionPreset,
        palettePreset: d.palettePreset ?? prev.palettePreset,
        moodPreset: d.moodPreset ?? prev.moodPreset,
        allowText: d.allowText ?? prev.allowText,
        avoidLogos: d.avoidLogos ?? prev.avoidLogos,
      };
      const preset = PLATFORM_PRESETS.find((p) => p.value === next.platformPreset);
      if (preset && preset.value !== 'custom') {
        next.width = preset.width;
        next.height = preset.height;
      }
      return normalizeSettings(next);
    });
  }

  const brandSelectValue = settings.useBrandProfile ? (settings.brandId || activeBrandId || '') : '';

  const schemaWithDynamicModels = useMemo(() => {
    const type = settings.mediaType || 'image';

    const catalog =
      type === 'text'
        ? textModels
        : type === 'audio'
          ? audioModels
          : imageModels.filter((m) => {
              if (!m || typeof m.name !== 'string') return false;
              const outs = m.output_modalities;
              const isVideo = Array.isArray(outs) && outs.includes('video');
              return type === 'video' ? isVideo : !isVideo;
            });

    const modelOptions = (catalog || [])
      .filter((m) => m && typeof m.name === 'string')
      .map((m) => {
        const p = m?.pricing || {};
        const cost =
          type === 'video'
            ? typeof p.completionVideoSeconds === 'number'
              ? `${p.completionVideoSeconds} pollen/sec`
              : typeof p.completionVideoTokens === 'number'
                ? `${p.completionVideoTokens} pollen/video-token`
                : ''
            : type === 'text'
              ? typeof p.completionTextTokens === 'number'
                ? `${p.completionTextTokens} pollen/token`
                : ''
              : type === 'audio'
                ? typeof p.completionAudioTokens === 'number'
                  ? `${p.completionAudioTokens} pollen/audio-token`
                  : ''
                : typeof p.completionImageTokens === 'number'
                  ? `${p.completionImageTokens} pollen/img`
                  : '';

        const flags = [m.paid_only ? 'paid' : '', m.description?.includes('ALPHA') ? 'alpha' : '']
          .filter(Boolean)
          .join(' • ');
        const suffix = [cost, flags].filter(Boolean).join(' • ');
        return {
          value: m.name,
          label: suffix ? `${m.name} — ${suffix}` : m.name,
          disabled: Boolean(m.paid_only),
        };
      });

    const optionsWithLoading =
      modelOptions.length === 0 ? [{ value: '', label: `Loading ${type} models…`, disabled: true }] : modelOptions;

    const voiceOptions =
      type === 'audio' && Array.isArray(selectedModelMeta?.voices)
        ? selectedModelMeta.voices.map((v) => ({ value: v, label: v }))
        : null;

    return SETTINGS_SCHEMA.map((section) => ({
      ...section,
      fields: section.fields.map((f) => {
        if (f.key === 'model') return { ...f, options: optionsWithLoading.length ? optionsWithLoading : f.options };
        if (f.key === 'voice' && voiceOptions) return { ...f, options: voiceOptions };
        return f;
      }),
    }));
  }, [imageModels, textModels, audioModels, settings.mediaType, selectedModelMeta]);

  const settingsContent = (
    <>
      <div className="SettingsBlock">
        <div className="SettingsBlockTitle">{t('settings.blockApiKey')}</div>
        <div className="CardFlat">
          <div className="Hint" style={{ marginBottom: 10 }}>
            {settings.useProxy
              ? t('settings.apiKeyStatusProxy')
              : runtimeApiKey
                ? t('settings.apiKeyStatusLocalStorage')
                : envApiKey
                  ? t('settings.apiKeyStatusEnv')
                  : t('settings.apiKeyStatusNone')}
          </div>
          {settings.useProxy && process.env.NODE_ENV === 'development' ? (
            <div className="InlineWarn" style={{ marginBottom: 10 }}>
              Proxy mode needs Cloudflare Pages Functions. In dev, use: <span style={{ fontWeight: 900 }}>npm run build</span> then{' '}
              <span style={{ fontWeight: 900 }}>npx wrangler pages dev build</span>.
            </div>
          ) : null}
          <div className="Grid Grid--single">
            <label className="Field" htmlFor="pollinations-api-key">
              <div className="Field-label">{t('settings.apiKey')}</div>
              <input
                id="pollinations-api-key"
                type="password"
                autoComplete="off"
                placeholder="pk_... or sk_..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </label>
            <div className="Row Row--tight">
              <button
                className="Btn"
                type="button"
                onClick={() => {
                  const next = String(apiKeyInput || '').trim();
                  setRuntimeApiKey(next);
                  saveRuntimeApiKey(next);
                  setError('');
                }}
              >
                {t('common.save')}
              </button>
              <button
                className="Btn Btn--ghost"
                type="button"
                onClick={() => {
                  setRuntimeApiKey('');
                  setApiKeyInput('');
                  clearRuntimeApiKey();
                }}
                disabled={!runtimeApiKey}
              >
                {t('settings.clearLocalKey')}
              </button>
            </div>
            <div className="InlineHint">
              {t('settings.clientOnlyHint')}
            </div>
          </div>
        </div>
      </div>

      <div className="SettingsBlock">
        <div className="SettingsBlockTitle">{t('settings.blockBrand')}</div>
        <BrandEditor
          brands={brands}
          activeBrand={activeBrand}
          activeBrandId={activeBrandId}
          settings={settings}
          onUpdateSetting={updateSetting}
          onSetActiveBrandId={setActiveBrandId}
          onCreateBrand={createBrand}
          onUpdateActiveBrand={updateActiveBrand}
          onUploadLogo={onUploadLogo}
          onApplyBrandDefaults={applyBrandDefaults}
        />
      </div>

      <div className="SettingsBlock">
        <div className="SettingsBlockTitle">{t('settings.blockGeneration')}</div>
        {modelsError ? <div className="InlineWarn">{t('settings.modelsPrefix', { msg: modelsError })}</div> : null}
        {settings.mediaType === 'video' ? (
          <div className="InlineWarn">
            {t('settings.videoPaidOnlyNote')}
          </div>
        ) : null}
        <SettingsForm schema={schemaWithDynamicModels} settings={settings} onChange={updateSetting} mobile={mobile} />
        <div className="CardFlat" style={{ marginTop: 10 }}>
          <div className="Row Row--tight">
            <div className="Hint">{t('settings.referenceImage')}</div>
            {settings.referenceImageDataUrl ? (
              <button className="Btn Btn--ghost" type="button" onClick={clearReference}>
                {t('common.clear')}
              </button>
            ) : null}
          </div>
          <div className="Grid Grid--single">
            <label className="Field">
              <div className="Field-label">{t('settings.referenceUpload')}</div>
              <input type="file" accept="image/*" onChange={(e) => onUploadReference(e.target.files?.[0] || null)} />
              <div className="Hint">{t('settings.referenceUploadHint')}</div>
            </label>
            {settings.referenceImageDataUrl ? (
              <>
                <div className="Field">
                  <div className="Field-label">{t('settings.referencePreview')}</div>
                  <img className="RefPreview" src={settings.referenceImageDataUrl} alt="Reference" />
                </div>
                <div className="Field">
                  <div className="Field-label">{t('settings.referenceExtractedPalette')}</div>
                  <div className="Palette">
                    {(settings.referencePalette || []).map((hex) => (
                      <div key={hex} className="Swatch" title={hex}>
                        <div className="Swatch-color" style={{ background: hex }} />
                        <div className="Swatch-hex">{hex}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="Empty">
                {t('settings.referenceEmpty')}
              </div>
            )}
          </div>
        </div>
        {modelCostLabel || modelDailyEstimate ? (
          <div className="InlineHint">
            {modelCostLabel ? <span>{modelCostLabel}</span> : null}
            {modelDailyEstimate ? <span>{modelCostLabel ? ' • ' : ''}{modelDailyEstimate}</span> : null}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="Shell">
      <header className="Header">
        <div className="HeaderLeft">
          <div className="AppMark" aria-hidden="true">
            <img className="AppMarkImg" src={`${process.env.PUBLIC_URL}/codefalcon-mark.png`} alt="" />
          </div>
          <div>
            <div className="AppTitle">{t('app.title')}</div>
            <div className="AppSubtitle">{t('app.subtitle')}</div>
          </div>
        </div>

        <div className="HeaderRight">
          <div className="Seg" role="tablist" aria-label="Media type">
            <button
              type="button"
              className={`SegBtn ${settings.mediaType === 'image' ? 'SegBtn--active' : ''}`}
              onClick={() => updateSetting('mediaType', 'image')}
            >
              {t('media.image')}
            </button>
            <button
              type="button"
              className={`SegBtn ${settings.mediaType === 'video' ? 'SegBtn--active' : ''}`}
              onClick={() => updateSetting('mediaType', 'video')}
            >
              {t('media.video')}
            </button>
            <button
              type="button"
              className={`SegBtn ${settings.mediaType === 'text' ? 'SegBtn--active' : ''}`}
              onClick={() => updateSetting('mediaType', 'text')}
            >
              {t('media.text')}
            </button>
            <button
              type="button"
              className={`SegBtn ${settings.mediaType === 'audio' ? 'SegBtn--active' : ''}`}
              onClick={() => updateSetting('mediaType', 'audio')}
            >
              {t('media.audio')}
            </button>
          </div>

          <div className="Seg" role="tablist" aria-label={t('common.language')}>
            <button type="button" className={`SegBtn ${locale === 'en' ? 'SegBtn--active' : ''}`} onClick={() => setLocale('en')}>
              EN
            </button>
            <button type="button" className={`SegBtn ${locale === 'ar' ? 'SegBtn--active' : ''}`} onClick={() => setLocale('ar')}>
              عربي
            </button>
          </div>

          <div className="BrandPicker" title={t('brand.profile')}>
            <select
              className="SelectSlim"
              value={brandSelectValue}
              onChange={(e) => {
                const id = e.target.value;
                updateSetting('useBrandProfile', true);
                updateSetting('brandId', id);
                setActiveBrandId(id);
              }}
              disabled={!brands.length}
              aria-label={t('brand.profile')}
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name || t('brand.untitled')}
                </option>
              ))}
            </select>
            <button className="IconBtn" type="button" onClick={createBrand} aria-label={t('brand.newBrand')}>
              +
            </button>
          </div>

          <button className="IconBtn" type="button" onClick={() => setSettingsOpen(true)} aria-label={t('common.settings')}>
            ⚙
          </button>

          <button className="Btn Btn--ghost" onClick={randomizeSeed} type="button">
            {t('common.seed')}
          </button>

          <button className="Btn" onClick={onGenerate} type="button" disabled={isGenerating}>
            {isGenerating ? t('common.generating') : t('common.generate')}
          </button>
        </div>
      </header>

      {error ? (
        <div className="Toast" role="status">
          {error}
        </div>
      ) : null}

      <main className="Main">
        <div className="MainLeft">
          <PromptCard
            mediaType={settings.mediaType}
            subject={settings.subject}
            onChangeSubject={(v) => updateSetting('subject', v)}
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            lastError={error}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          <PreviewHero
            previewUrl={previewUrl}
            textOutput={current?.resultText || ''}
            sizeLabel={
              inferredMediaType === 'image'
                ? `${promptPreview.width}×${promptPreview.height}`
                : inferredMediaType === 'video'
                  ? `${settings.aspectRatio} • ${settings.duration}s`
                  : inferredMediaType === 'audio'
                    ? `voice ${settings.voice || '—'}`
                    : ''
            }
            modelLabel={modelCostLabel ? `${settings.model} (${modelCostLabel})` : settings.model}
            seedLabel={current?.seedUsed ? t('variations.seedLabel', { seed: current.seedUsed }) : ''}
            onLockSeed={lockSeedFromCurrent}
            onCopyUrl={() => onCopy(previewUrl)}
            onCopyText={() => onCopy(current?.resultText || '')}
            onOpen={() => {
              if (!previewUrl) return;
              window.open(previewUrl, '_blank', 'noopener,noreferrer');
            }}
            onDownload={onDownload}
            onRetry={onRetryPreview}
            canLockSeed={Boolean(current?.seedUsed)}
            canDownload={Boolean(previewUrl)}
            isLoading={isGenerating || previewLoadState.status === 'loading'}
            errorMessage={previewLoadState.status === 'error' ? previewLoadState.error : ''}
            onImageLoad={() => setPreviewLoadState({ status: 'loaded', error: '' })}
            onImageError={() =>
              setPreviewLoadState({
                status: 'error',
                error: t('settings.checkKeyOrRetry'),
              })
            }
            mediaType={current?.mediaType || inferredMediaType}
            logoOverlay={(() => {
              const brandIdForItem = current?.settings?.brandId || settings.brandId || activeBrandId || '';
              const brandForItem = (brands || []).find((b) => b?.id === brandIdForItem) || activeBrand;
              const overlayEnabled = Boolean(current?.settings?.logoOverlayEnabled ?? settings.logoOverlayEnabled);
              return {
                enabled: overlayEnabled && inferredMediaType === 'image',
                logoDataUrl: brandForItem?.logoDataUrl || '',
                position: current?.settings?.logoOverlayPosition ?? settings.logoOverlayPosition,
                sizePct: current?.settings?.logoOverlaySizePct ?? settings.logoOverlaySizePct,
                opacity: current?.settings?.logoOverlayOpacity ?? settings.logoOverlayOpacity,
                padding: current?.settings?.logoOverlayPadding ?? settings.logoOverlayPadding,
              };
            })()}
          />

          <TabsPanel
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            historyCount={history.length}
            promptPreview={promptPreview}
            onCopy={onCopy}
            history={history}
            currentId={current?.id || ''}
            onPickHistory={(item) => setCurrent(item)}
            persistHistory={settings.persistHistory}
            onClearHistory={onClearHistory}
            apiKey={apiKey}
            addKeyToUrl={addKeyToUrl}
            variations={variations}
            variationStatus={variationStatus}
            onPickVariation={(v) => pickVariation(v)}
            onVariationLoad={(id) => setVariationStatus((prev) => ({ ...prev, [id]: 'loaded' }))}
            onVariationError={(id) => setVariationStatus((prev) => ({ ...prev, [id]: 'error' }))}
            mediaType={inferredMediaType}
          />
        </div>

        {!mobile ? (
          <aside className="MainRight">
            <div className={`SideCard ${settingsOpen ? '' : 'SideCard--closed'}`}>
              <div className="SideHeader">
                <div className="SideTitle">{t('settings.title')}</div>
                <button
                  className="IconBtn"
                  type="button"
                  onClick={() => setSettingsOpen((v) => !v)}
                  aria-label={settingsOpen ? t('settings.collapse') : t('settings.expand')}
                >
                  {settingsOpen ? '▸' : '◂'}
                </button>
              </div>
              {settingsOpen ? <div className="SideBody">{settingsContent}</div> : null}
            </div>
          </aside>
        ) : null}
      </main>

      <Sheet open={mobile && settingsOpen} title={t('settings.title')} onClose={() => setSettingsOpen(false)}>
        {settingsContent}
      </Sheet>

      <footer className="Footer">
        <div className="FooterInner">
          <div className="FooterText">{t('app.footer', { email: contactEmail })}</div>
          <a className="FooterLink" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
        </div>
      </footer>
    </div>
  );
}
