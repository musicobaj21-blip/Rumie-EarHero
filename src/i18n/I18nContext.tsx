import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS, UITranslations } from './translations';
import { Language } from './types';

const LANG_STORAGE_KEY = 'rumie_earhero_lang_v1';

function detectInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'es' || saved === 'en' || saved === 'pt') {
      return saved;
    }
  } catch {
    // Ignore storage read issues
  }

  try {
    const navLang = (
      window.navigator.language ||
      (window.navigator.languages && window.navigator.languages[0]) ||
      'es'
    ).toLowerCase();
    if (navLang.startsWith('en')) return 'en';
    if (navLang.startsWith('pt')) return 'pt';
    if (navLang.startsWith('es')) return 'es';
  } catch {
    // Fallback below
  }

  return 'es';
}

interface I18nContextValue {
  lang: Language;
  setLang: (next: Language) => void;
  t: UITranslations;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'es',
  setLang: () => undefined,
  t: TRANSLATIONS.es,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => detectInitialLanguage());

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage write issues
    }
  }, []);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `${t.brand.name} — ${t.brand.slogan}`;
  }, [lang, t]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
