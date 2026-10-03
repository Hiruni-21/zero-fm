"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  translations,
  type SiteLanguage,
  type TranslationKey,
} from "../i18n/translations";

export type { SiteLanguage, TranslationKey };

export interface LanguageContextType {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const STORAGE_KEY = "zero-fm-language";
const DEFAULT_LANGUAGE: SiteLanguage = "english";

const LanguageContext = createContext<LanguageContextType | null>(null);

function applyDocumentLanguage(lang: SiteLanguage) {
  if (typeof document === "undefined") return;

  const htmlLang = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  document.documentElement.setAttribute("data-site-language", lang);
  document.documentElement.setAttribute("lang", htmlLang);
  document.body?.setAttribute("data-site-language", lang);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>(DEFAULT_LANGUAGE);
  const [hasMounted, setHasMounted] = useState(false);

  // Restore language from localStorage on client-side mount without hydration mismatch
  useEffect(() => {
    setHasMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (
        saved === "english" ||
        saved === "sinhala" ||
        saved === "tamil"
      ) {
        setLanguageState(saved);
        applyDocumentLanguage(saved);
      } else {
        applyDocumentLanguage(DEFAULT_LANGUAGE);
      }
    } catch {
      applyDocumentLanguage(DEFAULT_LANGUAGE);
    }
  }, []);

  // Keep document attributes synchronized whenever language changes
  useEffect(() => {
    if (hasMounted) {
      applyDocumentLanguage(language);
    }
  }, [language, hasMounted]);

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    setLanguageState(nextLanguage);
    try {
      localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      // localStorage may fail in private browsing mode
    }
    applyDocumentLanguage(nextLanguage);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const currentDict = translations[language] as Record<string, string>;
      const englishDict = translations.english as Record<string, string>;

      let text = currentDict[key] ?? englishDict[key];

      if (text === undefined) {
        // Fallback: try stripping section prefix (e.g. "nav.home" -> "home" or vice-versa)
        const parts = key.split(".");
        if (parts.length > 1) {
          const suffix = parts.slice(1).join(".");
          text = currentDict[suffix] ?? englishDict[suffix];
        }
      }

      if (text === undefined) {
        text = key;
      }

      if (vars) {
        for (const [varKey, varVal] of Object.entries(vars)) {
          text = text.replaceAll(`{${varKey}}`, String(varVal));
        }
      }

      return text;
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
