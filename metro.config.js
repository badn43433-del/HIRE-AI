import { getDefaultConfig } from "expo/metro-config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = getDefaultConfig(__dirname);

export default config;
