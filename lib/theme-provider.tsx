import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_STORAGE_KEY = "gluco-calc-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") {
          setColorSchemeState(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyScheme(scheme);
    // Save theme to AsyncStorage
    AsyncStorage.setItem(THEME_STORAGE_KEY, scheme).catch((error) => {
      console.error("Failed to save theme to AsyncStorage:", error);
    });
  }, [applyScheme]);

  useEffect(() => {
    applyScheme(colorScheme);
  }, [applyScheme, colorScheme]);

  const themeVariables = useMemo(
    () => {
      return vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      });
    },
    [colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
      isLoading,
    }),
    [colorScheme, setColorScheme, isLoading],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
