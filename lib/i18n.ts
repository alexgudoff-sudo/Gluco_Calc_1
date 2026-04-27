export type Language = "ru" | "en";

export const translations = {
  ru: {
    // Tab names
    hypoFree: "Повысить глюкозу",
    hyperGlu: "Понизить глюкозу",
    
    // HypoFree screen
    hypoFreeTitle: "Повысить глюкозу",
    hypoFreeSubtitle: "Расчёт продукта при гипогликемии",
    targetGlucose: "Целевой уровень глюкозы",
    currentGlucose: "Текущий уровень глюкозы",
    carbsPerProduct: "Углеводы на 100 г продукта",
    productNeeded: "Необходимо съесть",
    carbsCoefficient: "Коэффициент углеводов",
    carbsCoefficientDesc: "На сколько ммоль/л повышается глюкоза при 10 г углеводов",
    
    // HyperGlu screen
    hyperGluTitle: "Понизить глюкозу",
    hyperGluSubtitle: "Расчёт инсулина при гипергликемии",
    insulinNeeded: "Необходимо поставить",
    insulinSensitivity: "Чувствительность к инсулину",
    insulinSensitivityDesc: "На сколько ммоль/л снижается глюкоза при 1 единице инсулина",
    
    // Settings
    settings: "Настройки",
    theme: "Тема",
    light: "Светлая",
    dark: "Тёмная",
    language: "Язык",
    save: "Сохранить",
    russian: "Русский",
    english: "English",
  },
  en: {
    // Tab names
    hypoFree: "Raise Glucose",
    hyperGlu: "Lower Glucose",
    
    // HypoFree screen
    hypoFreeTitle: "Raise Glucose",
    hypoFreeSubtitle: "Calculate product for hypoglycemia",
    targetGlucose: "Target glucose level",
    currentGlucose: "Current glucose level",
    carbsPerProduct: "Carbs per 100g product",
    productNeeded: "Need to eat",
    carbsCoefficient: "Carbs coefficient",
    carbsCoefficientDesc: "How many mmol/L glucose increases per 10g carbs",
    
    // HyperGlu screen
    hyperGluTitle: "Lower Glucose",
    hyperGluSubtitle: "Calculate insulin for hyperglycemia",
    insulinNeeded: "Need to inject",
    insulinSensitivity: "Insulin sensitivity",
    insulinSensitivityDesc: "How many mmol/L glucose decreases per 1 unit insulin",
    
    // Settings
    settings: "Settings",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    language: "Language",
    save: "Save",
    russian: "Русский",
    english: "English",
  },
};

export const t = (key: keyof typeof translations.ru, language: Language): string => {
  return translations[language][key] || translations.ru[key];
};
