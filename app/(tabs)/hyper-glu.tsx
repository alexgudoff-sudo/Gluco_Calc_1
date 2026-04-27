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
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { useInsulinSensitivity } from "@/hooks/use-insulin-sensitivity";
import { useLanguageContext } from "@/lib/language-provider";
import { t } from "@/lib/i18n";

// Formula for insulin dose:
// Insulin units = (currentGlucose - targetGlucose) / insulinSensitivity
// Where insulinSensitivity is typically 1.8-2.0 (how many mmol/L one unit of insulin lowers glucose)
export function calculateInsulinDose(
  current: number,
  target: number,
  insulinSensitivity: number = 1.8
): number | null {
  if (
    isNaN(current) ||
    isNaN(target) ||
    isNaN(insulinSensitivity) ||
    insulinSensitivity <= 0 ||
    current <= target
  ) {
    return null;
  }
  const dose = (current - target) / insulinSensitivity;
  return Math.round(dose * 2) / 2; // Round to nearest 0.5
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

export default function HyperGluScreen() {
  const colors = useColors();
  const { language } = useLanguageContext();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { sensitivity, updateSensitivity } = useInsulinSensitivity();

  const [targetGlucose, setTargetGlucose] = useState("");
  const [currentGlucose, setCurrentGlucose] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [insulinSensitivity, setInsulinSensitivity] = useState(sensitivity.toString());

  // Sync with hook when sensitivity changes
  useEffect(() => {
    setInsulinSensitivity(sensitivity.toString());
  }, [sensitivity]);

  const targetNum = parseFloat(targetGlucose.replace(",", "."));
  const currentNum = parseFloat(currentGlucose.replace(",", "."));
  const sensitivityNum = parseFloat(insulinSensitivity.replace(",", "."));

  const hasAllInputs =
    targetGlucose.trim() !== "" &&
    currentGlucose.trim() !== "";

  const result = hasAllInputs
    ? calculateInsulinDose(currentNum, targetNum, sensitivityNum)
    : null;

  const isInvalidInput =
    hasAllInputs &&
    (isNaN(targetNum) ||
      isNaN(currentNum) ||
      isNaN(sensitivityNum) ||
      currentNum <= targetNum ||
      sensitivityNum <= 0);

  const getResultText = useCallback(() => {
    if (!hasAllInputs || isInvalidInput || result === null) return "—";
    return `${result}`;
  }, [hasAllInputs, isInvalidInput, result]);

  const resultColor =
    result !== null && !isInvalidInput ? colors.success : colors.muted;

  const resultBorderColor =
    result !== null && !isInvalidInput ? colors.success : colors.border;

  const errorMessage = isInvalidInput
    ? currentNum <= targetNum
      ? language === "ru" ? "Текущий уровень должен быть выше целевого" : "Current level must be higher than target"
      : language === "ru" ? "Проверьте введённые значения" : "Check your values"
    : null;

  const handleSaveSensitivity = async () => {
    const newSens = parseFloat(insulinSensitivity.replace(",", "."));
    if (isNaN(newSens) || newSens <= 0) {
      Alert.alert(
        "Ошибка",
        "Чувствительность инсулина должна быть положительным числом"
      );
      return;
    }
    const success = await updateSensitivity(newSens);
    if (success) {
      Alert.alert("Успешно", "Чувствительность инсулина сохранена");
    }
    setShowSettings(false);
  };

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
              {t("hyperGluTitle", language)}
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.muted }]}>
              {t("hyperGluSubtitle", language)}
            </Text>
          </View>
        </View>

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
          placeholder="12.0"
          unit={language === "ru" ? "ммоль/л" : "mmol/L"}
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
            {t("insulinNeeded", language).toUpperCase()}
          </Text>
          <View style={styles.resultRow}>
            <Text style={[styles.resultValue, { color: resultColor }]}>
              {getResultText()}
            </Text>
            {result !== null && !isInvalidInput && (
              <Text style={[styles.resultUnit, { color: colors.success }]}>
                {language === "ru" ? "ед" : "U"}
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
            ? `Расчёт основан на чувствительности инсулина ${sensitivityNum.toFixed(1)} ммоль/л на 1 ед. Проконсультируйтесь с врачом для подбора индивидуальной чувствительности.`
            : `Calculation based on insulin sensitivity ${sensitivityNum.toFixed(1)} mmol/L per 1 unit. Consult your doctor for individual sensitivity.`}
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
              Чувствительность инсулина
            </Text>
            <Text style={[styles.modalDescription, { color: colors.muted }]}>
              На сколько ммоль/л снижается глюкоза при 1 ед инсулина
            </Text>

            <View style={styles.modalInputContainer}>
              <TextInput
                style={[
                  styles.modalInput,
                  { color: colors.foreground, borderColor: colors.border },
                ]}
                value={insulinSensitivity}
                onChangeText={setInsulinSensitivity}
                placeholder="1.8"
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
              Типичное значение: 1.8 ммоль/л на 1 ед инсулина
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
                onPress={() => setShowSettings(false)}
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
                  Отмена
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveSensitivity}
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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
