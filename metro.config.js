const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Настройка алиаса @/
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
};

// Блокируем папку, которая вызывает ошибку SHA-1
config.resolver.blockList = [
  /node_modules\/react-native-css-interop\/.*/
];

module.exports = config;
