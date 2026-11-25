/**
 * Cross-Platform Card Component
 * Glassmorphic surface for Web and Expo Go on Android & iOS
 */

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isDark?: boolean;
}

export const CrossCard: React.FC<CardProps> = ({ children, style, isDark = true }) => {
  return (
    <View style={[
      styles.card,
      isDark ? styles.cardDark : styles.cardLight,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderColor: "rgba(51, 65, 85, 0.7)",
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderColor: "rgba(226, 232, 240, 0.8)",
  }
});
