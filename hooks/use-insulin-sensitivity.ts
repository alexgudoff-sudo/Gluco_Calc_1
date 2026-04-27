import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "gluco_calc_insulin_sensitivity";
const DEFAULT_SENSITIVITY = 1.8;

/**
 * Hook to manage user's insulin sensitivity (how much glucose drops per 1 unit of insulin).
 * Default: 1.8 mmol/L per 1 unit of insulin
 * Persists to AsyncStorage.
 */
export function useInsulinSensitivity() {
  const [sensitivity, setSensitivity] = useState<number>(DEFAULT_SENSITIVITY);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed) && parsed > 0) {
            setSensitivity(parsed);
          }
        }
      } catch (error) {
        console.error("Failed to load insulin sensitivity:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Save to storage when sensitivity changes
  const updateSensitivity = useCallback(async (newValue: number) => {
    if (isNaN(newValue) || newValue <= 0) {
      console.warn("Invalid sensitivity value:", newValue);
      return false; // Invalid value
    }
    try {
      setSensitivity(newValue);
      await AsyncStorage.setItem(STORAGE_KEY, newValue.toString());
      console.log("Insulin sensitivity saved:", newValue);
      return true;
    } catch (error) {
      console.error("Failed to save insulin sensitivity:", error);
      return false;
    }
  }, []);

  const resetToDefault = useCallback(async () => {
    return updateSensitivity(DEFAULT_SENSITIVITY);
  }, [updateSensitivity]);

  return {
    sensitivity,
    updateSensitivity,
    resetToDefault,
    isLoading,
  };
}
