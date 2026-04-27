import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "gluco_calc_sensitivity_coefficient";
const DEFAULT_COEFFICIENT = 2.2;

/**
 * Hook to manage user's sensitivity coefficient (how much glucose rises per 10g of carbs).
 * Default: 2.2 mmol/L per 10g carbs (standard Rule of 10)
 * Persists to AsyncStorage.
 */
export function useSensitivityCoefficient() {
  const [coefficient, setCoefficient] = useState<number>(DEFAULT_COEFFICIENT);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed) && parsed > 0) {
            setCoefficient(parsed);
          }
        }
      } catch (error) {
        console.error("Failed to load sensitivity coefficient:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Save to storage when coefficient changes
  const updateCoefficient = async (newValue: number) => {
    if (isNaN(newValue) || newValue <= 0) {
      return false; // Invalid value
    }
    try {
      setCoefficient(newValue);
      await AsyncStorage.setItem(STORAGE_KEY, newValue.toString());
      return true;
    } catch (error) {
      console.error("Failed to save sensitivity coefficient:", error);
      return false;
    }
  };

  const resetToDefault = async () => {
    return updateCoefficient(DEFAULT_COEFFICIENT);
  };

  return {
    coefficient,
    updateCoefficient,
    resetToDefault,
    isLoading,
  };
}
