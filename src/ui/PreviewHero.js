import { useI18n } from '../i18n/I18nProvider';

export default function PreviewHero({
  previewUrl,
  textOutput,
  sizeLabel,
  modelLabel,
  seedLabel,
  onLockSeed,
  onCopyUrl,
  onCopyText,
  onOpen,
  onDownload,
  onRetry,
  canLockSeed,
  canDownload,
  isLoading,
  errorMessage,
  onImageLoad,
  onImageError,
  mediaType,
  logoOverlay,
}) {
  const { t } = useI18n();
  return (
    <div className="PreviewCard">
      <div className="PreviewHeader">
        <div className="Chips">
          {sizeLabel ? <span className="Chip">{sizeLabel}</span> : null}
          {modelLabel ? <span className="Chip">{modelLabel}</span> : null}
          {seedLabel ? <span className="Chip">{seedLabel}</span> : null}
        </div>
        <div className="PreviewActions">
          {mediaType === 'text' ? (
            <>
              <button className="Btn Btn--ghost" type="button" onClick={onCopyText} disabled={!textOutput}>
                {t('common.copyOutput')}
              </button>
              <button className="Btn Btn--ghost" type="button" onClick={onOpen} disabled={!previewUrl}>
                {t('common.open')}
              </button>
              <button className="Btn Btn--ghost" type="button" onClick={onRetry} disabled={!previewUrl || isLoading}>
                {t('common.retry')}
              </button>
              <button className="Btn" type="button" onClick={onDownload} disabled={!canDownload}>
                {t('common.download')}
              </button>
            </>
          ) : (
            <>
              <button className="Btn Btn--ghost" type="button" onClick={onLockSeed} disabled={!canLockSeed}>
                {t('preview.lockSeed')}
              </button>
              <button className="Btn Btn--ghost" type="button" onClick={onCopyUrl} disabled={!previewUrl}>
                {t('common.copyUrl')}
              </button>
              <button className="Btn Btn--ghost" type="button" onClick={onOpen} disabled={!previewUrl}>
                {t('common.open')}
              </button>
              <button className="Btn Btn--ghost" type="button" onClick={onRetry} disabled={!previewUrl || isLoading}>
                {t('common.retry')}
              </button>
              <button className="Btn" type="button" onClick={onDownload} disabled={!canDownload}>
                {t('common.download')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="PreviewStage">
        {mediaType === 'text' ? (
          <div className="PreviewFrame">
            <pre className="TextResult">{textOutput || '—'}</pre>
            {isLoading ? (
              <div className="PreviewOverlay" aria-label={t('common.loading')}>
                <div className="Spinner" />
                <div className="OverlayText">{t('common.generating')}</div>
              </div>
            ) : null}
            {!isLoading && errorMessage ? (
              <div className="PreviewOverlay PreviewOverlay--error" aria-label={t('common.error')}>
                <div className="OverlayTitle">{t('preview.textFailedTitle')}</div>
                <div className="OverlayText">{errorMessage}</div>
                <button className="Btn" type="button" onClick={onRetry}>
                  {t('common.retry')}
                </button>
              </div>
            ) : null}
          </div>
        ) : previewUrl ? (
          <div className="PreviewFrame">
            {mediaType === 'video' ? (
              <video
                className="PreviewImage"
                src={previewUrl}
                controls
                playsInline
                onLoadedData={onImageLoad}
                onError={onImageError}
              />
            ) : mediaType === 'audio' ? (
              <audio className="PreviewAudio" src={previewUrl} controls onCanPlayThrough={onImageLoad} onError={onImageError} />
            ) : (
              <div style={{ position: 'relative' }}>
                <img
                  className="PreviewImage"
                  src={previewUrl}
                  alt={t('preview.generatedAlt')}
                  onLoad={onImageLoad}
                  onError={onImageError}
                />
                {logoOverlay?.enabled && logoOverlay?.logoDataUrl ? (
                  <img
                    src={logoOverlay.logoDataUrl}
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      pointerEvents: 'none',
                      opacity: logoOverlay.opacity ?? 0.9,
                      width: `${logoOverlay.sizePct ?? 18}%`,
                      height: 'auto',
                      ...(logoOverlay.position === 'top_left'
                        ? { top: logoOverlay.padding ?? 18, left: logoOverlay.padding ?? 18 }
                        : logoOverlay.position === 'top_right'
                          ? { top: logoOverlay.padding ?? 18, right: logoOverlay.padding ?? 18 }
                          : logoOverlay.position === 'bottom_left'
                            ? { bottom: logoOverlay.padding ?? 18, left: logoOverlay.padding ?? 18 }
                            : logoOverlay.position === 'center'
                              ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                              : { bottom: logoOverlay.padding ?? 18, right: logoOverlay.padding ?? 18 }),
                    }}
                  />
                ) : null}
              </div>
            )}
            {isLoading ? (
              <div className="PreviewOverlay" aria-label={t('common.loading')}>
                <div className="Spinner" />
                <div className="OverlayText">
                  {t('common.generating')} {mediaType === 'video' ? t('preview.videoWaitHint') : ''}
                </div>
              </div>
            ) : null}
            {!isLoading && errorMessage ? (
              <div className="PreviewOverlay PreviewOverlay--error" aria-label={t('common.error')}>
                <div className="OverlayTitle">
                  {mediaType === 'video'
                    ? t('preview.loadFailedTitleVideo')
                    : mediaType === 'audio'
                      ? t('preview.loadFailedTitleAudio')
                      : t('preview.loadFailedTitleImage')}
                </div>
                <div className="OverlayText">{errorMessage}</div>
                <button className="Btn" type="button" onClick={onRetry}>
                  {t('common.retry')}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="PreviewEmpty">
            <div className="PreviewEmptyTitle">
              {mediaType === 'audio'
                ? t('preview.emptyTitleAudio')
                : mediaType === 'text'
                  ? t('preview.emptyTitleText')
                  : t('preview.emptyTitleImage')}
            </div>
            <div className="PreviewEmptyHint">{t('preview.emptyHint')}</div>
          </div>
        )}
      </div>
    </div>
  );
}
