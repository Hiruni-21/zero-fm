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
import { LANGUAGE_COOKIE, isSiteLanguage } from "../i18n/language-cookie";

export type { SiteLanguage, TranslationKey };

export interface LanguageContextType {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const STORAGE_KEY = LANGUAGE_COOKIE;
const DEFAULT_LANGUAGE: SiteLanguage = "english";

function saveLanguageCookie(lang: SiteLanguage) {
  document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function applyDocumentLanguage(lang: SiteLanguage) {
  if (typeof document === "undefined") return;

  const htmlLang = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  document.documentElement.setAttribute("data-site-language", lang);
  document.documentElement.setAttribute("lang", htmlLang);
  document.body?.setAttribute("data-site-language", lang);
}

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: React.ReactNode;
  initialLanguage?: SiteLanguage;
}) {
  // The server already read the language cookie, so start in that language
  const [language, setLanguageState] = useState<SiteLanguage>(initialLanguage);
  const [hasMounted, setHasMounted] = useState(false);

  // Visitors who picked a language before the cookie existed only have it in
  // localStorage: switch them once and save the cookie for next time
  useEffect(() => {
    setHasMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isSiteLanguage(saved) && saved !== initialLanguage) {
        setLanguageState(saved);
        saveLanguageCookie(saved);
      } else if (isSiteLanguage(saved)) {
        saveLanguageCookie(saved);
      }
    } catch {
      // localStorage may fail in private browsing mode
    }
  }, [initialLanguage]);

  // Keep document attributes synchronized whenever language changes
  useEffect(() => {
    if (hasMounted) {
      applyDocumentLanguage(language);
    }
  }, [language, hasMounted]);

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    setLanguageState(nextLanguage);
    saveLanguageCookie(nextLanguage);
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
