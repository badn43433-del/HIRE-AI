/**
 * Cross-Platform Button Component
 * Works in Web browsers and Expo Go on Android & iOS
 */

import React from "react";
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle, 
  TextStyle 
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const CrossButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const getVariantStyles = (): { btn: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "secondary":
        return {
          btn: { backgroundColor: "#334155" },
          text: { color: "#f8fafc" }
        };
      case "danger":
        return {
          btn: { backgroundColor: "#e11d48" },
          text: { color: "#ffffff" }
        };
      case "success":
        return {
          btn: { backgroundColor: "#059669" },
          text: { color: "#ffffff" }
        };
      case "outline":
        return {
          btn: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#6366f1" },
          text: { color: "#6366f1" }
        };
      default:
        return {
          btn: { backgroundColor: "#4f46e5" },
          text: { color: "#ffffff" }
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        vStyles.btn,
        disabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text.color || "#fff"} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, vStyles.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
  }
});
