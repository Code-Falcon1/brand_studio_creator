import { useEffect } from 'react';
import { useI18n } from '../i18n/I18nProvider';

export default function Sheet({ open, title, onClose, children }) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="SheetRoot" role="dialog" aria-modal="true" aria-label={title}>
      <button className="SheetBackdrop" type="button" onClick={onClose} aria-label={t('common.close')} />
      <div className="Sheet">
        <div className="SheetHeader">
          <div className="SheetTitle">{title}</div>
          <button className="IconBtn" type="button" onClick={onClose} aria-label={t('common.close')}>
            ✕
          </button>
        </div>
        <div className="SheetBody">{children}</div>
      </div>
    </div>
  );
}
