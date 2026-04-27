import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = "app_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");
  const [isLoading, setIsLoading] = useState(true);

  // Load language from AsyncStorage on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved && (saved === "ru" || saved === "en")) {
          setLanguageState(saved);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider");
  }
  return context;
}
