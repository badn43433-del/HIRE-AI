/**
 * Cross-Platform Badge Component
 * Renders status pills and role indicators for Web & Expo Go
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CrossBadge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  style,
  textStyle
}) => {
  const getColors = () => {
    switch (variant) {
      case "success":
        return { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.4)", text: "#10b981" };
      case "warning":
        return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#f59e0b" };
      case "danger":
        return { bg: "rgba(225, 29, 72, 0.15)", border: "rgba(225, 29, 72, 0.4)", text: "#f43f5e" };
      case "neutral":
        return { bg: "rgba(100, 116, 139, 0.15)", border: "rgba(100, 116, 139, 0.3)", text: "#94a3b8" };
      default:
        return { bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.4)", text: "#818cf8" };
    }
  };

  const colors = getColors();

  return (
    <View style={[
      styles.badge,
      { backgroundColor: colors.bg, borderColor: colors.border },
      style
    ]}>
      <Text style={[
        styles.text,
        { color: colors.text },
        textStyle
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  }
});
