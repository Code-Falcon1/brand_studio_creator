import { useI18n } from '../i18n/I18nProvider';

export default function TabsPanel({
  activeTab,
  onChangeTab,
  historyCount,
  promptPreview,
  onCopy,
  history,
  currentId,
  onPickHistory,
  persistHistory,
  onClearHistory,
  apiKey,
  addKeyToUrl,
  variations,
  variationStatus,
  onPickVariation,
  onVariationLoad,
  onVariationError,
  mediaType,
}) {
  const { t } = useI18n();
  const loadedCount = Object.values(variationStatus || {}).filter((s) => s === 'loaded').length;
  return (
    <div className="Panels">
      <div className="Tabs">
        <button
          className={`Tab ${activeTab === 'prompt' ? 'Tab--active' : ''}`}
          type="button"
          onClick={() => onChangeTab('prompt')}
        >
          {t('tabs.prompt')}
        </button>
        <button
          className={`Tab ${activeTab === 'history' ? 'Tab--active' : ''}`}
          type="button"
          onClick={() => onChangeTab('history')}
        >
          {t('tabs.history', { count: historyCount })}
        </button>
      </div>

      <div className="PanelBody">
        {variations && variations.length > 1 ? (
          <div className="CardFlat" style={{ marginBottom: 12 }}>
            <div className="Row Row--tight">
              <div className="Hint">
                {t('variations.title', { loaded: loadedCount, total: variations.length })}
              </div>
            </div>
            <div className="Variations">
              {variations.map((v) => {
                const st = variationStatus?.[v.id] || 'loading';
                const mt = v.mediaType || mediaType;
                return (
                  <button
                    key={v.id}
                    className={`VariationTile ${st === 'error' ? 'VariationTile--error' : ''}`}
                    type="button"
                    onClick={() => onPickVariation(v)}
                    title={t('variations.seedTitle', { seed: v.seedUsed })}
                  >
                    <div className="VariationImgWrap">
                      {mt === 'video' ? (
                        <video
                          className="VariationImg"
                          src={addKeyToUrl(v.sourceUrl || '', apiKey)}
                          muted
                          playsInline
                          preload="metadata"
                          onLoadedMetadata={() => onVariationLoad?.(v.id)}
                          onError={() => onVariationError?.(v.id)}
                        />
                      ) : (
                        <img
                          className="VariationImg"
                          src={addKeyToUrl(v.sourceUrl || '', apiKey)}
                          alt={t('variations.seedTitle', { seed: v.seedUsed })}
                          loading="lazy"
                          onLoad={() => onVariationLoad?.(v.id)}
                          onError={() => onVariationError?.(v.id)}
                        />
                      )}
                      {st === 'loading' ? <div className="VariationBadge">{t('variations.loading')}</div> : null}
                      {st === 'error' ? <div className="VariationBadge VariationBadge--error">{t('variations.error')}</div> : null}
                    </div>
                    <div className="VariationMeta">{t('variations.seedLabel', { seed: v.seedUsed })}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {activeTab === 'prompt' ? (
          <div className="CardFlat">
            <div className="Row Row--tight">
              <button className="Btn Btn--ghost" type="button" onClick={() => onCopy(promptPreview.prompt)}>
                {t('promptPreview.copyPrompt')}
              </button>
              <button className="Btn Btn--ghost" type="button" onClick={() => onCopy(promptPreview.negative_prompt)}>
                {t('promptPreview.copyNegative')}
              </button>
            </div>
            <pre className="Pre">{promptPreview.prompt}</pre>
            <div className="Meta">
              <div>
                <span className="Meta-k">{t('promptPreview.negative')}</span> {promptPreview.negative_prompt || t('promptPreview.none')}
              </div>
            </div>
          </div>
        ) : (
          <div className="CardFlat">
            <div className="Row Row--tight">
              <div className="Hint">{persistHistory ? t('history.saved') : t('history.memoryOnly')}</div>
              <button className="Btn Btn--ghost" type="button" onClick={onClearHistory} disabled={historyCount === 0}>
                {t('history.clear')}
              </button>
            </div>
            {historyCount ? (
              <div className="HistoryStrip">
                {history.map((item) => (
                  <button
                    key={item.id}
                    className={`HistoryItem ${currentId === item.id ? 'HistoryItem--active' : ''}`}
                    type="button"
                    onClick={() => onPickHistory(item)}
                    title={item.prompt}
                  >
                    {(item.mediaType || mediaType) === 'text' ? (
                      <div className="HistoryText">
                        {(item.resultText || '').slice(0, 120) || t('history.textResult')}
                      </div>
                    ) : (item.mediaType || mediaType) === 'audio' ? (
                      <div className="HistoryText">{t('history.audio')}</div>
                    ) : (item.mediaType || mediaType) === 'video' ? (
                      <video className="HistoryImg" src={addKeyToUrl(item.sourceUrl || '', apiKey)} muted playsInline preload="metadata" />
                    ) : (
                      <img className="HistoryImg" src={addKeyToUrl(item.sourceUrl || '', apiKey)} alt={t('history.historyAlt')} />
                    )}
                  </button>
                ))}
              </div>
            ) : (
                <div className="Empty">{t('history.noHistory')}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
