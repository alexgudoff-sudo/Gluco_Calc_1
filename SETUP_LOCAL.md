# GlucoCalc — Инструкция по локальному запуску

Это приложение построено на **Expo SDK 54** с использованием **React Native**, **TypeScript** и **NativeWind** (Tailwind CSS). Данное руководство поможет вам запустить приложение на локальном компьютере.

## Требования

Перед началом убедитесь, что у вас установлены:

- **Node.js** версии 18+ ([скачать](https://nodejs.org/))
- **pnpm** (менеджер пакетов) или **npm**
- **Expo CLI** (установится автоматически)
- **Git** (опционально, для версионирования)

## Шаг 1: Распаковка проекта

1. Распакуйте архив `gluco-calc.zip` в удобное место на вашем компьютере
2. Откройте папку проекта в VS Code:
   ```bash
   cd gluco-calc
   code .
   ```

## Шаг 2: Установка зависимостей

Откройте терминал в VS Code (Ctrl+`) и выполните:

```bash
pnpm install
```

Если у вас установлен только npm, используйте:
```bash
npm install
```

Процесс займёт 2-3 минуты.

## Шаг 3: Запуск приложения

### На веб-браузере (быстро)

```bash
pnpm dev
```

Приложение откроется в браузере на `http://localhost:8081`. Это удобно для тестирования функциональности.

### На физическом устройстве (iOS/Android)

1. Установите приложение **Expo Go** на ваш телефон ([App Store](https://apps.apple.com/app/expo-go/id982107779) для iOS, [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) для Android)

2. Запустите dev сервер:
   ```bash
   pnpm dev
   ```

3. В терминале появится QR-код. Отсканируйте его камерой телефона (iOS) или приложением Expo Go (Android)

4. Приложение загрузится на вашем устройстве

## Структура проекта

```
gluco-calc/
├── app/                          # Основной код приложения
│   ├── _layout.tsx              # Корневой layout с провайдерами
│   └── (tabs)/                  # Tab-based навигация
│       ├── _layout.tsx          # Tab bar конфигурация
│       ├── hypo-free.tsx        # Экран "Повысить глюкозу"
│       └── hyper-glu.tsx        # Экран "Понизить глюкозу"
├── components/                   # Переиспользуемые компоненты
│   ├── screen-container.tsx     # SafeArea wrapper
│   └── ui/                      # UI компоненты
├── hooks/                        # React hooks
│   ├── use-sensitivity-coefficient.ts  # Сохранение коэффициента
│   ├── use-insulin-sensitivity.ts      # Сохранение чувствительности инсулина
│   ├── use-language.ts                 # Локализация
│   └── use-colors.ts                   # Темы
├── lib/                          # Утилиты и провайдеры
│   ├── language-provider.tsx    # Глобальный провайдер языка
│   ├── theme-provider.tsx       # Глобальный провайдер темы
│   ├── i18n.ts                  # Переводы (русский/английский)
│   └── utils.ts                 # Вспомогательные функции
├── app.config.ts                # Конфигурация Expo
├── package.json                 # Зависимости
├── tailwind.config.js           # Tailwind конфигурация
└── theme.config.js              # Цветовая палитра
```

## Сохранение данных

Приложение использует **AsyncStorage** для локального сохранения пользовательских настроек:

- **Коэффициент чувствительности углеводов** (по умолчанию 2.2 ммоль/л на 10g углеводов)
- **Коэффициент чувствительности инсулина** (по умолчанию 1.8 ммоль/л на 1 единицу инсулина)
- **Выбранная тема** (светлая/тёмная)
- **Выбранный язык** (русский/английский)

Все данные хранятся локально на устройстве и не передаются на серверы. Данные сохраняются автоматически при изменении.

## Редактирование кода

Все изменения в коде применяются автоматически (hot reload):

1. Отредактируйте файл в VS Code
2. Сохраните (Ctrl+S)
3. Приложение перезагрузится автоматически

## Команды разработки

| Команда | Описание |
|---------|---------|
| `pnpm dev` | Запуск dev сервера для веб и мобильных устройств |
| `pnpm ios` | Запуск на iOS симуляторе (требует macOS) |
| `pnpm android` | Запуск на Android эмуляторе |
| `pnpm test` | Запуск тестов |
| `pnpm lint` | Проверка кода на ошибки |
| `pnpm format` | Форматирование кода |

## Решение проблем

### Приложение не загружается в браузере

Проверьте, что порт 8081 не занят другим приложением:
```bash
# На macOS/Linux
lsof -i :8081

# На Windows
netstat -ano | findstr :8081
```

Если порт занят, используйте другой:
```bash
EXPO_PORT=3000 pnpm dev
```

### Ошибка при установке зависимостей

Очистите кэш и переустановите:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### QR-код не сканируется

Убедитесь, что ваш телефон подключён к той же сети Wi-Fi, что и компьютер. Если это не помогает, используйте туннель:
```bash
pnpm dev --tunnel
```

## Следующие шаги

- **Для публикации на App Store**: Используйте EAS Build (требует регистрации на [expo.dev](https://expo.dev))
- **Для PWA на iPhone**: Смотрите раздел "PWA для iPhone" ниже
- **Для добавления новых функций**: Редактируйте файлы в папке `app/(tabs)/`

---

# PWA для iPhone — Добавление на главный экран

Приложение можно использовать как **Progressive Web App (PWA)** и добавить на главный экран iPhone без Expo Go.

## Требования

- iPhone с iOS 11.3 или выше
- Safari браузер
- Интернет соединение

## Шаг 1: Подготовка приложения для PWA

Убедитесь, что в проекте есть файл `public/manifest.json`. Если его нет, создайте:

```bash
mkdir -p public
```

Создайте файл `public/manifest.json`:

```json
{
  "name": "GlucoCalc",
  "short_name": "GlucoCalc",
  "description": "Калькулятор глюкозы для диабетиков",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0a7ea4",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

## Шаг 2: Добавление meta-тегов в HTML

Отредактируйте файл `web/index.html` (или создайте его в папке `public/`):

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Калькулятор глюкозы для диабетиков">
  <meta name="theme-color" content="#0a7ea4">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="GlucoCalc">
  <link rel="apple-touch-icon" href="/icon-192.png">
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/png" href="/icon-192.png">
  <title>GlucoCalc</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

## Шаг 3: Запуск веб-версии

Запустите приложение в режиме веб:

```bash
pnpm dev
```

Откройте браузер на адресе `http://localhost:8081`

## Шаг 4: Добавление на главный экран iPhone

1. Откройте приложение в Safari на iPhone
2. Нажмите кнопку **Поделиться** (значок со стрелкой)
3. Прокрутите вниз и выберите **"На экран Домой"**
4. Введите имя приложения (например, "GlucoCalc")
5. Нажмите **"Добавить"**

Приложение появится на вашем главном экране как обычное приложение. При нажатии оно откроется в полноэкранном режиме без адресной строки Safari.

## Особенности PWA на iPhone

| Функция | Поддержка |
|---------|-----------|
| Добавление на главный экран | ✅ Да |
| Полноэкранный режим | ✅ Да |
| Локальное хранилище данных | ✅ Да (AsyncStorage) |
| Автоматические обновления | ⚠️ При перезагрузке браузера |
| Работа без интернета | ❌ Нет (требует Service Worker) |

## Развёртывание PWA на сервере

Для использования PWA на реальном сервере:

1. Соберите веб-версию:
   ```bash
   pnpm build
   ```

2. Загрузите содержимое папки `dist/` на веб-сервер (Vercel, Netlify, GitHub Pages и т.д.)

3. Убедитесь, что сервер использует HTTPS (требование для PWA)

4. Пользователи смогут добавить приложение на главный экран через Safari

## Рекомендуемые хостинги

- **Vercel** ([vercel.com](https://vercel.com)) — бесплатно, автоматический деплой из GitHub
- **Netlify** ([netlify.com](https://netlify.com)) — бесплатно, простая настройка
- **GitHub Pages** ([pages.github.com](https://pages.github.com)) — бесплатно, для статических сайтов

---

## Поддержка и помощь

Если у вас возникли вопросы:

1. Проверьте логи в консоли браузера (F12 → Console)
2. Убедитесь, что все зависимости установлены (`pnpm install`)
3. Попробуйте очистить кэш (`rm -rf node_modules && pnpm install`)
4. Перезагрузите dev сервер (`Ctrl+C` и `pnpm dev`)

**Успехов в разработке! 🚀**
