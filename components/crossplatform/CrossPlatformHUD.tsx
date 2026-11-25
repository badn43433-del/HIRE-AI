/**
 * Cross-Platform AI Proctoring HUD Overlay
 * Renders real-time neural proctor metrics across Web and Expo Go
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CrossBadge } from "./Badge";

interface HUDProps {
  trustScore?: number;
  faceDetected?: boolean;
  gazeStatus?: string;
  tabSwitches?: number;
}

export const CrossPlatformHUD: React.FC<HUDProps> = ({
  trustScore = 96,
  faceDetected = true,
  gazeStatus = "Center",
  tabSwitches = 0
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>AI PROCTOR GUARD</Text>
          <Text style={styles.subTitle}>OpenCV • MediaPipe (On-Server)</Text>
        </View>

        <View style={styles.trustBadge}>
          <Text style={styles.trustLabel}>Trust Score: </Text>
          <Text style={[
            styles.trustValue,
            trustScore > 80 ? styles.highTrust : (trustScore > 60 ? styles.midTrust : styles.lowTrust)
          ]}>
            {trustScore}%
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Face Verified</Text>
          <Text style={styles.metricVal}>{faceDetected ? "1 Person (98%)" : "No Face"}</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Eye Gaze</Text>
          <Text style={[styles.metricVal, gazeStatus === "Center" ? styles.greenVal : styles.amberVal]}>
            {gazeStatus}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Tab Switches</Text>
          <Text style={[styles.metricVal, tabSwitches > 0 ? styles.redVal : styles.greenVal]}>
            {tabSwitches} Flags
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Device Checks</Text>
          <Text style={styles.metricVal}>YOLO: Clean ✓</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.8)",
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingBottom: 8,
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: "column",
  },
  title: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  subTitle: {
    color: "#64748b",
    fontSize: 9,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  trustLabel: {
    color: "#94a3b8",
    fontSize: 10,
  },
  trustValue: {
    fontSize: 12,
    fontWeight: "800",
  },
  highTrust: {
    color: "#10b981",
  },
  midTrust: {
    color: "#f59e0b",
  },
  lowTrust: {
    color: "#f43f5e",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
  },
  metricItem: {
    flex: 1,
    minWidth: 70,
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 8,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  metricVal: {
    color: "#e2e8f0",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  greenVal: {
    color: "#34d399",
  },
  amberVal: {
    color: "#fbbf24",
  },
  redVal: {
    color: "#fb7185",
  }
});
