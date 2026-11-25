/**
 * Cross-Platform Text Input Component
 * Compatible with React Hook Form for Web and Expo Go
 */

import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isDark?: boolean;
}

export const CrossInput: React.FC<InputProps> = ({
  label,
  error,
  isDark = true,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor="#64748b"
        style={[
          styles.input,
          isDark ? styles.inputDark : styles.inputLight,
          error ? styles.inputError : null,
          style
        ]}
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  labelDark: {
    color: "#cbd5e1",
  },
  labelLight: {
    color: "#334155",
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderColor: "#334155",
    color: "#ffffff",
  },
  inputLight: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    color: "#0f172a",
  },
  inputError: {
    borderColor: "#e11d48",
  },
  errorText: {
    color: "#f43f5e",
    fontSize: 11,
    marginTop: 3,
  }
});
