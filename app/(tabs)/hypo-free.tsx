import { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useSensitivityCoefficient } from "@/hooks/use-sensitivity-coefficient";
import { useThemeContext } from "@/lib/theme-provider";
import { useLanguageContext } from "@/lib/language-provider";
import { t } from "@/lib/i18n";

// Formula:
// Carbs needed (g) = (targetGlucose - currentGlucose) × 10 / coefficient
// Product mass (g) = carbsNeeded × 100 / carbsPer100g
export function calculateProductMass(
  target: number,
  current: number,
  carbsPer100g: number,
  coefficient: number = 2.2
): number | null {
  if (
    isNaN(target) ||
    isNaN(current) ||
    isNaN(carbsPer100g) ||
    isNaN(coefficient) ||
    carbsPer100g <= 0 ||
    coefficient <= 0 ||
    target <= current
  ) {
    return null;
  }
  const carbsNeeded = ((target - current) * 10) / coefficient;
  const mass = (carbsNeeded * 100) / carbsPer100g;
  return Math.round(mass);
}

interface InputCardProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  unit: string;
  colors: ReturnType<typeof useColors>;
  onFocus?: () => void;
  error?: string;
}

function InputCard({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  colors,
  onFocus,
  error,
}: InputCardProps) {
  const numValue = parseFloat(value.replace(",", "."));
  const isInvalid = value !== "" && (isNaN(numValue) || numValue <= 0);

  return (
    <View>
      <View style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isInvalid ? "#EF4444" : colors.border,
          borderWidth: isInvalid ? 2 : 1,
        },
      ]}>
        <View style={styles.labelRow}>
          <Text style={[styles.inputLabel, { color: colors.muted }]}>{label}</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.inputValue, { color: colors.foreground }]}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            maxLength={6}
          />
          <Text style={[styles.inputUnit, { color: colors.muted }]}>{unit}</Text>
        </View>
      </View>
      {isInvalid && (
        <Text style={[styles.errorText, { color: "#EF4444" }]}>
          {error || "Значение должно быть больше 0"}
        </Text>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { language } = useLanguageContext();
  const { coefficient, updateCoefficient, resetToDefault, isLoading } =
    useSensitivityCoefficient();

  const [targetGlucose, setTargetGlucose] = useState("");
  const [currentGlucose, setCurrentGlucose] = useState("");
  const [carbsPer100g, setCarbsPer100g] = useState("");
  const [productName, setProductName] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsCoefficient, setSettingsCoefficient] = useState(
    coefficient.toString()
  );

  // Handle barcode scanner result
  useEffect(() => {
    if (params?.carbsPer100g) {
      setCarbsPer100g(params.carbsPer100g.toString());
      if (params?.productName) {
        setProductName(params.productName.toString());
      }
    }
  }, [params]);

  const targetNum = parseFloat(targetGlucose.replace(",", "."));
  const currentNum = parseFloat(currentGlucose.replace(",", "."));
  const carbsNum = parseFloat(carbsPer100g.replace(",", "."));

  const hasAllInputs =
    targetGlucose.trim() !== "" &&
    currentGlucose.trim() !== "" &&
    carbsPer100g.trim() !== "";

  const result = hasAllInputs
    ? calculateProductMass(targetNum, currentNum, carbsNum, coefficient)
    : null;

  const isInvalidInput =
    hasAllInputs &&
    (isNaN(targetNum) ||
      isNaN(currentNum) ||
      isNaN(carbsNum) ||
      targetNum <= currentNum ||
      carbsNum <= 0);

  const getResultText = useCallback(() => {
    if (!hasAllInputs || isInvalidInput || result === null) return "—";
    return `${result}`;
  }, [hasAllInputs, isInvalidInput, result]);

  const resultColor =
    result !== null && !isInvalidInput ? colors.success : colors.muted;

  const resultBorderColor =
    result !== null && !isInvalidInput ? colors.success : colors.border;

  const errorMessage = isInvalidInput
    ? targetNum <= currentNum
      ? language === "ru" ? "Целевой уровень должен быть выше текущего" : "Target level must be higher than current"
      : language === "ru" ? "Проверьте введённые значения" : "Check your values"
    : null;

  const handleSaveCoefficient = async () => {
    const newCoeff = parseFloat(settingsCoefficient.replace(",", "."));
    if (isNaN(newCoeff) || newCoeff <= 0) {
      Alert.alert(
        "Ошибка",
        "Коэффициент должен быть положительным числом"
      );
      return;
    }
    const success = await updateCoefficient(newCoeff);
    if (success) {
      setShowSettings(false);
    } else {
      Alert.alert("Ошибка", "Не удалось сохранить коэффициент");
    }
  };

  const handleResetCoefficient = async () => {
    const success = await resetToDefault();
    if (success) {
      setSettingsCoefficient("2.2");
      setShowSettings(false);
    }
  };

  const { colorScheme, setColorScheme } = useThemeContext();

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Settings Button */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={[styles.appTitle, { color: colors.foreground }]}>
              {t("hypoFreeTitle", language)}
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.muted }]}>
              {t("hypoFreeSubtitle", language)}
            </Text>
          </View>

        </View>

        {/* Product Name Display */}
        {productName && (
          <View
            style={[
              styles.productBadge,
              { backgroundColor: colors.primary + "20", borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.productBadgeText, { color: colors.primary }]}>
              {productName}
            </Text>
          </View>
        )}

        {/* Input: Target Glucose */}
        <InputCard
          label={t("targetGlucose", language).toUpperCase()}
          value={targetGlucose}
          onChangeText={setTargetGlucose}
          onFocus={() => setTargetGlucose("")}
          placeholder="5.5"
          unit={language === "ru" ? "ммоль/л" : "mmol/L"}
          colors={colors}
        />

        {/* Input: Current Glucose */}
        <InputCard
          label={t("currentGlucose", language).toUpperCase()}
          value={currentGlucose}
          onChangeText={setCurrentGlucose}
          onFocus={() => setCurrentGlucose("")}
          placeholder="2.8"
          unit={language === "ru" ? "ммоль/л" : "mmol/L"}
          colors={colors}
        />

        {/* Input: Carbs per 100g with Scan Button */}
        <InputCard
          label={t("carbsPerProduct", language).toUpperCase()}
          value={carbsPer100g}
          onChangeText={setCarbsPer100g}
          onFocus={() => setCarbsPer100g("")}
          placeholder="75"
          unit="g"
          colors={colors}
        />

        {/* Result Card */}
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: colors.surface,
              borderColor: resultBorderColor,
            },
          ]}
        >
          <Text style={[styles.resultLabel, { color: colors.muted }]}>
            {t("productNeeded", language).toUpperCase()}
          </Text>
          <View style={styles.resultRow}>
            <Text style={[styles.resultValue, { color: resultColor }]}>
              {getResultText()}
            </Text>
            {result !== null && !isInvalidInput && (
              <Text style={[styles.resultUnit, { color: colors.success }]}>
                г
              </Text>
            )}
          </View>
          {errorMessage && (
            <Text style={[styles.errorHint, { color: colors.error }]}>
              {errorMessage}
            </Text>
          )}
        </View>

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, { color: colors.muted }]}>
          {language === "ru"
            ? `Расчёт основан на коэффициенте ${coefficient.toFixed(1)} ммоль/л на 10 г углеводов. Проконсультируйтесь с врачом для подбора индивидуального коэффициента.`
            : `Calculation based on coefficient ${coefficient.toFixed(1)} mmol/L per 10g carbs. Consult your doctor for individual coefficient.`}
        </Text>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={() => setShowSettings(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Коэффициент чувствительности
            </Text>
            <Text style={[styles.modalDescription, { color: colors.muted }]}>
              На сколько ммоль/л повышается глюкоза при 10 г углеводов
            </Text>

            <View style={styles.modalInputContainer}>
              <TextInput
                style={[
                  styles.modalInput,
                  { color: colors.foreground, borderColor: colors.border },
                ]}
                value={settingsCoefficient}
                onChangeText={setSettingsCoefficient}
                placeholder="2.2"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={5}
              />
              <Text style={[styles.modalInputUnit, { color: colors.muted }]}>
                ммоль/л
              </Text>
            </View>

            <Text style={[styles.modalHint, { color: colors.muted }]}>
              Стандартное значение: 2.2 ммоль/л (правило 10)
            </Text>

            <View style={styles.themeContainer}>
              <Text style={[styles.modalDescription, { color: colors.muted }]}>
                Тема
              </Text>
              <View style={styles.themeButtonsContainer}>
                <Pressable
                  onPress={() => setColorScheme("light")}
                  style={({ pressed }) => [
                    styles.themeButton,
                    {
                      backgroundColor: colorScheme === "light" ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      {
                        color: colorScheme === "light" ? "#FFFFFF" : colors.foreground,
                      },
                    ]}
                  >
                    Светлая
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setColorScheme("dark")}
                  style={({ pressed }) => [
                    styles.themeButton,
                    {
                      backgroundColor: colorScheme === "dark" ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      {
                        color: colorScheme === "dark" ? "#FFFFFF" : colors.foreground,
                      },
                    ]}
                  >
                    Тёмная
                  </Text>
                </Pressable>

              </View>
            </View>

            <View style={styles.modalButtonsContainer}>
              <Pressable
                onPress={handleResetCoefficient}
                style={({ pressed }) => [
                  styles.modalButtonSecondary,
                  {
                    backgroundColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.foreground },
                  ]}
                >
                  Сбросить
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveCoefficient}
                style={({ pressed }) => [
                  styles.modalButtonPrimary,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
                  Сохранить
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 12,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  header: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  settingsButtonText: {
    fontSize: 20,
  },
  productBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  productBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputValue: {
    fontSize: 26,
    fontWeight: "600",
    flex: 1,
    padding: 0,
    minHeight: 40,
    ...Platform.select({
      android: { paddingVertical: 0 },
    }),
  },
  inputUnit: {
    fontSize: 15,
    fontWeight: "400",
    marginLeft: 8,
    flexShrink: 0,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    marginLeft: 4,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 4,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  resultValue: {
    fontSize: 64,
    fontWeight: "700",
    letterSpacing: -2,
    lineHeight: 72,
  },
  resultUnit: {
    fontSize: 24,
    fontWeight: "500",
    paddingBottom: 6,
  },
  errorHint: {
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: "85%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalInput: {
    fontSize: 24,
    fontWeight: "600",
    flex: 1,
    padding: 0,
    minHeight: 40,
    ...Platform.select({
      android: { paddingVertical: 0 },
    }),
  },
  modalInputUnit: {
    fontSize: 14,
    fontWeight: "400",
    marginLeft: 8,
    flexShrink: 0,
  },
  modalHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  themeContainer: {
    marginVertical: 20,
  },
  themeButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
