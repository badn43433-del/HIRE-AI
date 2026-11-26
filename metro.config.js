import { getDefaultConfig } from "expo/metro-config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [
  "web.tsx",
  "web.ts",
  "web.jsx",
  "web.js",
  ...config.resolver.sourceExts,
];

config.resolver.resolverMainFields = [
  "react-native",
  "browser",
  "main",
];

export default config;
