"use client";

import * as React from "react";
import { Language, translations, Translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>("en");

  // Load language from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem("language") as Language;
    if (stored && (stored === "en" || stored === "ms" || stored === "zh")) {
      setLanguage(stored);
    }
  }, []);

  // Save language to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
