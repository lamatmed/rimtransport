/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageService } from '@/services/i18n';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Language>('fr');

  useEffect(() => {
    LanguageService.init();
    setLocaleState(LanguageService.getLanguage() as Language);
  }, []);

  const setLocale = (lang: Language) => {
    LanguageService.setLanguage(lang);
    setLocaleState(lang);
    // Force a re-render or update document direction for Arabic
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string, options?: any) => LanguageService.t(key, options);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
