const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable React Native Web module resolution
// Resolves .web.tsx/.web.ts/.web.js platform-specific extensions first
config.resolver.sourceExts = [
  'web.tsx', 'web.ts', 'web.jsx', 'web.js',
  ...config.resolver.sourceExts,
];

// Map react-native -> react-native-web when bundling for web target
config.resolver.resolverMainFields = [
  'react-native',
  'browser',
  'main',
];

module.exports = config;
