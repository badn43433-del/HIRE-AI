/**
 * Candidate Dashboard - Cross-Platform (Expo Router)
 * Runs on Web, Android, and iOS (Expo Go SDK 57.0.9)
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { CrossButton } from "../../components/crossplatform/Button";
import { CrossCard } from "../../components/crossplatform/Card";
import { CrossBadge } from "../../components/crossplatform/Badge";
import { MOCK_SCHEDULED_INTERVIEWS } from "../../src/mockData";

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState<"interviews" | "diagnostics" | "scorecards">("interviews");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Welcome Hero */}
        <CrossCard style={styles.heroCard}>
          <CrossBadge label="Candidate Portal Active" variant="primary" />
          <Text style={styles.welcomeTitle}>Welcome Back, Sarah Jenkins! 🌟</Text>
          <Text style={styles.welcomeSubtitle}>
            Prepare, practice, and complete proctored live technical assessments powered by local open-source AI.
          </Text>
        </CrossCard>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <CrossButton
            title="Interviews"
            variant={activeTab === "interviews" ? "primary" : "secondary"}
            onPress={() => setActiveTab("interviews")}
            style={styles.tabBtn}
          />
          <CrossButton
            title="Device Check"
            variant={activeTab === "diagnostics" ? "primary" : "secondary"}
            onPress={() => setActiveTab("diagnostics")}
            style={styles.tabBtn}
          />
          <CrossButton
            title="My Scorecards"
            variant={activeTab === "scorecards" ? "primary" : "secondary"}
            onPress={() => setActiveTab("scorecards")}
            style={styles.tabBtn}
          />
        </View>

        {/* Tab 1: Scheduled Interviews */}
        {activeTab === "interviews" && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>SCHEDULED LIVE TECHNICAL ROUNDS</Text>
            {MOCK_SCHEDULED_INTERVIEWS.map((item) => (
              <CrossCard key={item.id} style={styles.interviewCard}>
                <View style={styles.cardHeaderRow}>
                  <CrossBadge label={item.department} variant="primary" />
                  <Text style={styles.timeBadge}>{item.scheduledDate} • {item.scheduledTime}</Text>
                </View>

                <Text style={styles.roleTitle}>{item.roleTitle}</Text>
                <Text style={styles.interviewerText}>Lead: {item.interviewerName}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.durationText}>Duration: {item.durationMinutes} mins</Text>
                  <CrossButton
                    title="Pre-Flight & Join"
                    variant="success"
                    onPress={() => alert(`Launching assessment room for ${item.roleTitle}`)}
                    style={styles.joinBtn}
                  />
                </View>
              </CrossCard>
            ))}
          </View>
        )}

        {/* Tab 2: Device Diagnostics */}
        {activeTab === "diagnostics" && (
          <CrossCard style={styles.diagCard}>
            <Text style={styles.sectionHeader}>HARDWARE & NETWORK PRE-FLIGHT TEST</Text>
            <View style={styles.diagItem}>
              <Text style={styles.diagLabel}>HD Video Camera</Text>
              <CrossBadge label="Passed (1080p)" variant="success" />
            </View>
            <View style={styles.diagItem}>
              <Text style={styles.diagLabel}>Microphone & Gain</Text>
              <CrossBadge label="Passed (65 dB)" variant="success" />
            </View>
            <View style={styles.diagItem}>
              <Text style={styles.diagLabel}>Network Throughput</Text>
              <CrossBadge label="94.6 Mbps (Ping: 18ms)" variant="success" />
            </View>
            <View style={styles.diagItem}>
              <Text style={styles.diagLabel}>Local AI Proctor Service</Text>
              <CrossBadge label="MediaPipe + YOLO Ready" variant="primary" />
            </View>
          </CrossCard>
        )}

        {/* Tab 3: Scorecards */}
        {activeTab === "scorecards" && (
          <CrossCard style={styles.diagCard}>
            <Text style={styles.sectionHeader}>AI EVALUATION SCORECARD</Text>
            <Text style={styles.scoreTitle}>Senior Frontend UI Architect</Text>
            <View style={styles.scoresGrid}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreBoxLabel}>Coding</Text>
                <Text style={styles.scoreBoxVal}>92/100</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreBoxLabel}>System Design</Text>
                <Text style={styles.scoreBoxVal}>88/100</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreBoxLabel}>Communication</Text>
                <Text style={styles.scoreBoxVal}>94/100</Text>
              </View>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreBoxLabel}>Trust Index</Text>
                <Text style={styles.scoreBoxValGreen}>96%</Text>
              </View>
            </View>
          </CrossCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  container: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: "#1e1b4b",
    borderColor: "#312e81",
    marginBottom: 16,
  },
  welcomeTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  welcomeSubtitle: {
    color: "#c7d2fe",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  interviewCard: {
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeBadge: {
    color: "#34d399",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  roleTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  interviewerText: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  durationText: {
    color: "#64748b",
    fontSize: 11,
    fontFamily: "monospace",
  },
  joinBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  diagCard: {
    gap: 12,
  },
  diagItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#090d16",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  diagLabel: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "600",
  },
  scoreTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  scoresGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: "#090d16",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  scoreBoxLabel: {
    color: "#64748b",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  scoreBoxVal: {
    color: "#818cf8",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  scoreBoxValGreen: {
    color: "#34d399",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  }
});
