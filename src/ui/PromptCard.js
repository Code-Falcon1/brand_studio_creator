import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nProvider';

export default function PromptCard({
  mediaType,
  subject,
  onChangeSubject,
  onGenerate,
  isGenerating,
  lastError,
  onOpenSettings,
}) {
  const { t } = useI18n();
  const ref = useRef(null);

  useEffect(() => {
    if (!lastError) return;
    if (!/Subject/i.test(String(lastError))) return;
    ref.current?.focus?.();
  }, [lastError]);

  return (
    <div className="PromptCard">
      <div className="PromptHeader">
        <div>
          <div className="PromptTitle">{t('promptCard.title')}</div>
          <div className="PromptHint">
            {mediaType === 'audio'
              ? t('promptCard.hintAudio')
              : mediaType === 'text'
                ? t('promptCard.hintText')
                : t('promptCard.hintImage')}
          </div>
        </div>
        <div className="PromptActions">
          <button className="Btn Btn--ghost" type="button" onClick={onOpenSettings}>
            {t('common.settings')}
          </button>
          <button className="Btn" type="button" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? t('common.generating') : t('common.generate')}
          </button>
        </div>
      </div>

      <label className="Field" htmlFor="subject">
        <div className="Field-label">
          {mediaType === 'audio'
            ? t('promptCard.fieldLabelAudio')
            : mediaType === 'text'
              ? t('promptCard.fieldLabelText')
              : t('promptCard.fieldLabelImage')}
        </div>
        <textarea
          id="subject"
          ref={ref}
          rows={4}
          placeholder={
            mediaType === 'audio'
              ? t('promptCard.placeholderAudio')
              : mediaType === 'text'
                ? t('promptCard.placeholderText')
                : t('promptCard.placeholderImage')
          }
          value={subject || ''}
          onChange={(e) => onChangeSubject(e.target.value)}
        />
      </label>
    </div>
  );
}
