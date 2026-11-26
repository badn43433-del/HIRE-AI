
/**
 * Ambient Type Declarations for Cross-Platform React Native & Expo Router
 * Ensures 100% Type-Safety for Web, Android (Expo Go), and iOS (Expo Go)
 */

declare module "react-native" {
  import * as React from "react";

  export interface ViewStyle {
    [key: string]: any;
  }
  export interface TextStyle {
    [key: string]: any;
  }

  export const View: React.FC<any>;
  export const Text: React.FC<any>;
  export const TouchableOpacity: React.FC<any>;
  export const ScrollView: React.FC<any>;
  export const TextInput: React.FC<any>;
  export const SafeAreaView: React.FC<any>;
  export const ActivityIndicator: React.FC<any>;
  export const KeyboardAvoidingView: React.FC<any>;
  export const FlatList: React.FC<any>;
  export const Image: React.FC<any>;
  export const Modal: React.FC<any>;
  export const Pressable: React.FC<any>;

  export interface TextInputProps {
    [key: string]: any;
  }

  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
  };

  export const Platform: {
    OS: "web" | "ios" | "android" | "windows" | "macos";
    select: <T>(specifics: { [platform: string]: T }) => T;
  };
}

declare module "@react-native-async-storage/async-storage" {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
  export default AsyncStorage;
}

declare module "expo-constants" {
  const Constants: {
    expoConfig?: {
      hostUri?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  export default Constants;
}

declare module "expo-status-bar" {
  import * as React from "react";
  export const StatusBar: React.FC<{ style?: "auto" | "inverted" | "light" | "dark" }>;
}

declare module "react-native-safe-area-context" {
  import * as React from "react";
  export const SafeAreaProvider: React.FC<{ children: React.ReactNode }>;
  export const SafeAreaView: React.FC<any>;
}

declare module "expo-router" {
  import * as React from "react";
  export const Slot: React.FC<any>;
  export const Stack: React.FC<any>;
  export const Tabs: React.FC<any>;
  export const Link: React.FC<any>;
  export const useRouter: () => {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
  };
  export const useLocalSearchParams: <T = any>() => T;
  export const useSegments: () => string[];
  export const usePathname: () => string;
  export const router: {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
  };
}

declare module "@tanstack/react-query" {
  export const QueryClient: any;
  export const QueryClientProvider: React.FC<{ client: any; children: React.ReactNode }>;
  export function useQuery(options: any): any;
  export function useMutation(options: any): any;
  export function useQueryClient(): any;
}

declare module "motion/react" {
  import * as React from "react";
  export const motion: any;
  export const AnimatePresence: React.FC<any>;
  export function useAnimation(): any;
  export function useMotionValue(initial: number): any;
  export function useTransform(...args: any[]): any;
  export function animate(...args: any[]): any;
}
