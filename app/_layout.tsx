/**
 * HireShield AI - Root Cross-Platform Layout
 * Configures TanStack Query, SafeAreaProvider, MobileAuthProvider, and Theme for Web & Expo Go
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { View, StyleSheet } from "react-native";
import { MobileAuthProvider, useMobileAuth } from "../services/mobileAuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootShell() {
  const { theme } = useMobileAuth();
  const isLight = theme === "light";
  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      <StatusBar style={isLight ? "dark" : "light"} />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MobileAuthProvider>
          <RootShell />
        </MobileAuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  containerLight: {
    backgroundColor: "#f8fafc",
  },
});
