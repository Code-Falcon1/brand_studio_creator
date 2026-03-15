import { useI18n } from '../i18n/I18nProvider';

export default function BrandEditor({
  brands,
  activeBrand,
  activeBrandId,
  settings,
  onUpdateSetting,
  onSetActiveBrandId,
  onCreateBrand,
  onUpdateActiveBrand,
  onUploadLogo,
  onApplyBrandDefaults,
}) {
  const { t } = useI18n();
  const hasLogo = Boolean(activeBrand?.logoDataUrl || activeBrand?.logoDataUrlSmall);
  return (
    <div className="BrandEditor">
      <label className="Field Field--toggle">
        <input
          type="checkbox"
          checked={Boolean(settings.useBrandProfile)}
          onChange={(e) => onUpdateSetting('useBrandProfile', e.target.checked)}
        />
        <span>{t('brand.useProfile')}</span>
      </label>

      {settings.useBrandProfile ? (
        <>
          <div className="Row Row--tight">
            <label className="Field" style={{ flex: 1 }} htmlFor="brandSelect">
              <div className="Field-label">{t('brand.profile')}</div>
              <select
                id="brandSelect"
                value={settings.brandId || activeBrandId || ''}
                onChange={(e) => {
                  const id = e.target.value;
                  onUpdateSetting('brandId', id);
                  onSetActiveBrandId(id);
                }}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || t('brand.untitled')}
                  </option>
                ))}
              </select>
            </label>
            <button className="Btn Btn--ghost" type="button" onClick={onCreateBrand}>
              {t('brand.new')}
            </button>
          </div>

          <div className="Grid Grid--single">
            <label className="Field">
              <div className="Field-label">{t('brand.name')}</div>
              <input
                type="text"
                value={activeBrand?.name || ''}
                onChange={(e) => onUpdateActiveBrand({ name: e.target.value })}
              />
            </label>
            <label className="Field">
              <div className="Field-label">{t('brand.industry')}</div>
              <input
                type="text"
                value={activeBrand?.industry || ''}
                placeholder={t('brand.industryPlaceholder')}
                onChange={(e) => onUpdateActiveBrand({ industry: e.target.value })}
              />
            </label>
            <label className="Field">
              <div className="Field-label">{t('brand.tone')}</div>
              <select
                value={activeBrand?.tone || 'professional'}
                onChange={(e) => onUpdateActiveBrand({ tone: e.target.value })}
              >
                <option value="professional">{t('brand.toneOptions.professional')}</option>
                <option value="luxury">{t('brand.toneOptions.luxury')}</option>
                <option value="playful">{t('brand.toneOptions.playful')}</option>
                <option value="friendly">{t('brand.toneOptions.friendly')}</option>
                <option value="bold">{t('brand.toneOptions.bold')}</option>
              </select>
            </label>

            <label className="Field">
              <div className="Field-label">{t('brand.uploadLogo')}</div>
              <input type="file" accept="image/*" onChange={(e) => onUploadLogo(e.target.files?.[0] || null)} />
              <div className="Hint">
                {activeBrand?.logoName ? t('brand.hintLastLogo', { name: activeBrand.logoName }) : t('brand.hintPaletteLocal')}
              </div>
            </label>

            <label className="Field Field--toggle">
              <input
                type="checkbox"
                checked={Boolean(settings.logoInScene)}
                onChange={(e) => onUpdateSetting('logoInScene', e.target.checked)}
                disabled={!hasLogo}
              />
              <span>{t('brand.logoInScene')}</span>
            </label>
            <div className="Hint">{t('brand.logoInSceneHint')}</div>

            <label className="Field Field--toggle">
              <input
                type="checkbox"
                checked={Boolean(settings.logoOverlayEnabled)}
                onChange={(e) => onUpdateSetting('logoOverlayEnabled', e.target.checked)}
                disabled={!hasLogo}
              />
              <span>{t('brand.logoOverlayEnabled')}</span>
            </label>

            {settings.logoOverlayEnabled ? (
              <div className="Grid Grid--single">
                <label className="Field">
                  <div className="Field-label">{t('brand.logoOverlayPosition')}</div>
                  <select value={settings.logoOverlayPosition || 'bottom_right'} onChange={(e) => onUpdateSetting('logoOverlayPosition', e.target.value)}>
                    <option value="top_left">{t('brand.logoOverlayPositions.top_left')}</option>
                    <option value="top_right">{t('brand.logoOverlayPositions.top_right')}</option>
                    <option value="bottom_left">{t('brand.logoOverlayPositions.bottom_left')}</option>
                    <option value="bottom_right">{t('brand.logoOverlayPositions.bottom_right')}</option>
                    <option value="center">{t('brand.logoOverlayPositions.center')}</option>
                  </select>
                </label>
                <label className="Field">
                  <div className="Field-label">{t('brand.logoOverlaySize')}</div>
                  <input
                    type="number"
                    min={5}
                    max={40}
                    step={1}
                    value={settings.logoOverlaySizePct ?? 18}
                    onChange={(e) => onUpdateSetting('logoOverlaySizePct', e.target.value)}
                  />
                </label>
                <label className="Field">
                  <div className="Field-label">{t('brand.logoOverlayOpacity')}</div>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    step={1}
                    value={Math.round((Number(settings.logoOverlayOpacity ?? 0.9) || 0.9) * 100)}
                    onChange={(e) => onUpdateSetting('logoOverlayOpacity', String((Number(e.target.value) || 0) / 100))}
                  />
                </label>
                <label className="Field">
                  <div className="Field-label">{t('brand.logoOverlayPadding')}</div>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    step={1}
                    value={settings.logoOverlayPadding ?? 18}
                    onChange={(e) => onUpdateSetting('logoOverlayPadding', e.target.value)}
                  />
                </label>
              </div>
            ) : null}

            <div className="Field">
              <div className="Field-label">{t('brand.palette')}</div>
              <div className="Palette">
                {(activeBrand?.palette || []).length ? (
                  (activeBrand.palette || []).map((hex) => (
                    <div key={hex} className="Swatch" title={hex}>
                      <div className="Swatch-color" style={{ background: hex }} />
                      <div className="Swatch-hex">{hex}</div>
                    </div>
                  ))
                ) : (
                  <div className="Empty">{t('brand.noPalette')}</div>
                )}
              </div>
            </div>

            <div className="Row Row--tight">
              <button className="Btn Btn--ghost" type="button" onClick={onApplyBrandDefaults} disabled={!activeBrand?.defaults}>
                {t('brand.applyDefaults')}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
