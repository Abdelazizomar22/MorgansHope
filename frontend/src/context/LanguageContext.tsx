import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LanguageContextType {
  lang: 'en' | 'ar';
  toggleLang: () => void;
  t: (en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<'en' | 'ar'>(() => {
    const stored = localStorage.getItem('lang');
    if (stored === 'ar' || stored === 'en') return stored;
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');
  const t = (en: string, ar: string) => lang === 'ar' ? ar : en;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
