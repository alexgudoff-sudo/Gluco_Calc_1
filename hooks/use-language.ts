import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "@/lib/i18n";

const LANGUAGE_KEY = "app_language";

export function useLanguage() {
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

  return { language, setLanguage, isLoading };
}
