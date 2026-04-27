import { Tabs } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Pressable, View, StyleSheet, Modal, Text, TextInput, ScrollView } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSensitivityCoefficient } from "@/hooks/use-sensitivity-coefficient";
import { useInsulinSensitivity } from "@/hooks/use-insulin-sensitivity";
import { useThemeContext } from "@/lib/theme-provider";
import { useLanguageContext } from "@/lib/language-provider";
import { t } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

export default function TabLayout() {
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { language, setLanguage } = useLanguageContext();
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const { coefficient, updateCoefficient } = useSensitivityCoefficient();
  const { sensitivity, updateSensitivity } = useInsulinSensitivity();
  const [settingsCoefficient, setSettingsCoefficient] = useState(coefficient.toString());
  const [settingsSensitivity, setSettingsSensitivity] = useState(sensitivity.toString());
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(colorScheme as "light" | "dark");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language as Language);
  
  const coeffNum = parseFloat(settingsCoefficient.replace(",", "."));
  const sensNum = parseFloat(settingsSensitivity.replace(",", "."));
  const isCoeffInvalid = settingsCoefficient !== "" && (isNaN(coeffNum) || coeffNum <= 0);
  const isSensInvalid = settingsSensitivity !== "" && (isNaN(sensNum) || sensNum <= 0);
  
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  const handleThemeChange = (theme: "light" | "dark") => {
    setSelectedTheme(theme);
    setColorScheme(theme);
  };

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
    setLanguage(lang);
  };

  const handleSaveAll = async () => {
    // Save coefficients
    const coeffValue = parseFloat(settingsCoefficient.replace(",", "."));
    if (!isNaN(coeffValue) && coeffValue > 0) {
      await updateCoefficient(coeffValue);
    }

    const sensValue = parseFloat(settingsSensitivity.replace(",", "."));
    if (!isNaN(sensValue) && sensValue > 0) {
      await updateSensitivity(sensValue);
    }

    setShowSettings(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors?.primary ?? "#0a7ea4",
          tabBarInactiveTintColor: colors?.muted ?? "#687076",
          tabBarStyle: {
            backgroundColor: colors?.background ?? "#ffffff",
            borderTopColor: colors?.border ?? "#E5E7EB",
            borderTopWidth: 0.5,
            height: tabBarHeight,
            paddingTop: 8,
            paddingBottom: bottomPadding,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="hypo-free"
          options={{
            title: t("hypoFree", language),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.up" color={color} />,
          }}
        />
        <Tabs.Screen
          name="hyper-glu"
          options={{
            title: t("hyperGlu", language),
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.down" color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Index",
            tabBarItemStyle: { display: "none" },
          }}
        />
      </Tabs>

      {/* Floating Settings Button */}
      <View
        style={[
          styles.floatingButtonContainer,
          {
            bottom: bottomPadding + 56 / 2 - 36,
          },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => setShowSettings(!showSettings)}
          style={({ pressed }) => [
            styles.floatingButton,
            {
              backgroundColor: colors?.primary ?? "#0a7ea4",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <IconSymbol size={42} name="gear" color={colors?.background ?? "#ffffff"} />
        </Pressable>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={() => setShowSettings(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors?.surface ?? "#f5f5f5" },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Close Button */}
              <Pressable
                onPress={() => setShowSettings(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.closeButtonText, { color: colors?.foreground }]}>
                  ✕
                </Text>
              </Pressable>

              {/* Settings Title */}
              <Text style={[styles.settingsTitle, { color: colors?.foreground }]}>
                {t("settings", language)}
              </Text>

              {/* Carbs Sensitivity Section */}
              <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: colors?.foreground }]}>
                  {t("carbsCoefficient", language)}
                </Text>
                <Text style={[styles.sectionDescription, { color: colors?.muted }]}>
                  {t("carbsCoefficientDesc", language)}
                </Text>
                <TextInput
                  style={[
                    styles.settingsInput,
                    {
                      color: colors?.foreground,
                      borderColor: isCoeffInvalid ? "#EF4444" : colors?.border,
                      borderWidth: isCoeffInvalid ? 2 : 1,
                    },
                  ]}
                  value={settingsCoefficient}
                  onChangeText={setSettingsCoefficient}
                  placeholder="2.2"
                  placeholderTextColor={colors?.muted}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                {isCoeffInvalid && (
                  <Text style={[styles.errorText, { color: "#EF4444" }]}>
                    {language === "ru" ? "Значение должно быть больше 0" : "Value must be greater than 0"}
                  </Text>
                )}
              </View>

              {/* Insulin Sensitivity Section */}
              <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: colors?.foreground }]}>
                  {t("insulinSensitivity", language)}
                </Text>
                <Text style={[styles.sectionDescription, { color: colors?.muted }]}>
                  {t("insulinSensitivityDesc", language)}
                </Text>
                <TextInput
                  style={[
                    styles.settingsInput,
                    {
                      color: colors?.foreground,
                      borderColor: isSensInvalid ? "#EF4444" : colors?.border,
                      borderWidth: isSensInvalid ? 2 : 1,
                    },
                  ]}
                  value={settingsSensitivity}
                  onChangeText={setSettingsSensitivity}
                  placeholder="1.8"
                  placeholderTextColor={colors?.muted}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </View>

              {/* Theme Selection Section */}
              <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: colors?.foreground }]}>
                  {t("theme", language)}
                </Text>
                <View style={styles.themeButtonsContainer}>
                  <Pressable
                    onPress={() => handleThemeChange("light")}
                    style={({ pressed }) => [
                      styles.themeButton,
                      {
                        backgroundColor:
                          selectedTheme === "light"
                            ? colors?.primary ?? "#0a7ea4"
                            : colors?.border ?? "#E5E7EB",
                        opacity: pressed ? 0.8 : 1,
                      },
                      styles.themeButtonLeft,
                    ]}
                  >
                    <Text
                      style={[
                        styles.themeButtonText,
                        {
                          color:
                            selectedTheme === "light"
                              ? "#ffffff"
                              : colors?.foreground ?? "#11181C",
                        },
                      ]}
                    >
                      {t("light", language)}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleThemeChange("dark")}
                    style={({ pressed }) => [
                      styles.themeButton,
                      {
                        backgroundColor:
                          selectedTheme === "dark"
                            ? colors?.primary ?? "#0a7ea4"
                            : colors?.border ?? "#E5E7EB",
                        opacity: pressed ? 0.8 : 1,
                      },
                      styles.themeButtonRight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.themeButtonText,
                        {
                          color:
                            selectedTheme === "dark"
                              ? "#ffffff"
                              : colors?.foreground ?? "#11181C",
                        },
                      ]}
                    >
                      {t("dark", language)}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Language Selection Section */}
              <View style={styles.settingsSection}>
                <Text style={[styles.sectionTitle, { color: colors?.foreground }]}>
                  {t("language", language)}
                </Text>
                <View style={styles.themeButtonsContainer}>
                  <Pressable
                    onPress={() => handleLanguageChange("ru")}
                    style={({ pressed }) => [
                      styles.themeButton,
                      {
                        backgroundColor:
                          selectedLanguage === "ru"
                            ? colors?.primary ?? "#0a7ea4"
                            : colors?.border ?? "#E5E7EB",
                        opacity: pressed ? 0.8 : 1,
                      },
                      styles.themeButtonLeft,
                    ]}
                  >
                    <Text
                      style={[
                        styles.themeButtonText,
                        {
                          color:
                            selectedLanguage === "ru"
                              ? "#ffffff"
                              : colors?.foreground ?? "#11181C",
                        },
                      ]}
                    >
                      {t("russian", language)}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleLanguageChange("en")}
                    style={({ pressed }) => [
                      styles.themeButton,
                      {
                        backgroundColor:
                          selectedLanguage === "en"
                            ? colors?.primary ?? "#0a7ea4"
                            : colors?.border ?? "#E5E7EB",
                        opacity: pressed ? 0.8 : 1,
                      },
                      styles.themeButtonRight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.themeButtonText,
                        {
                          color:
                            selectedLanguage === "en"
                              ? "#ffffff"
                              : colors?.foreground ?? "#11181C",
                        },
                      ]}
                    >
                      {t("english", language)}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Save Button */}
              <View style={{ marginTop: 16 }}>
                <Pressable
                  onPress={handleSaveAll}
                  style={({ pressed }) => [
                    styles.saveAllButton,
                    {
                      backgroundColor: colors?.primary ?? "#0a7ea4",
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={styles.saveAllButtonText}>{t("save", language)}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: "absolute",
    left: "50%",
    marginLeft: -36,
    zIndex: 100,
  },
  floatingButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingTop: 12,
    paddingHorizontal: 16,
    display: "flex",
    flexDirection: "column",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 6,
    marginBottom: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  settingsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  settingsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    marginLeft: 4,
  },
  themeButtonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  themeButtonLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  themeButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  saveAllButton: {
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    marginHorizontal: 0,
  },
  saveAllButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
