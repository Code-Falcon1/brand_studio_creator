import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SUPPORTED_LOCALES, TRANSLATIONS } from './translations';

function get(obj, path) {
  if (!obj) return undefined;
  const parts = String(path || '').split('.');
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

function interpolate(str, vars) {
  if (!vars) return str;
  return String(str).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

function detectInitialLocale() {
  try {
    const saved = localStorage.getItem('locale');
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
  } catch {
    // ignore
  }
  const nav = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en';
  if (String(nav).toLowerCase().startsWith('ar')) return 'ar';
  return 'en';
}

const I18nContext = createContext({
  locale: 'en',
  dir: 'ltr',
  setLocale: () => {},
  t: (key, vars) => interpolate(key, vars),
});

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => detectInitialLocale());

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const setLocale = useCallback((next) => {
    const normalized = SUPPORTED_LOCALES.includes(next) ? next : 'en';
    setLocaleState(normalized);
    try {
      localStorage.setItem('locale', normalized);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const fromLocale = get(TRANSLATIONS[locale], key);
      const fromEn = get(TRANSLATIONS.en, key);
      const base = fromLocale ?? fromEn ?? key;
      return interpolate(base, vars);
    },
    [locale]
  );

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', dir);
  }, [locale, dir]);

  const value = useMemo(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

