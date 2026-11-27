/**
 * Interviewer Dashboard - Cross-Platform (Expo Router)
 * Runs on Web, Android, and iOS (Expo Go SDK 57.0.9)
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CrossButton } from "../../components/crossplatform/Button";
import { CrossCard } from "../../components/crossplatform/Card";
import { CrossBadge } from "../../components/crossplatform/Badge";
import { MobileHeader } from "../../components/crossplatform/MobileHeader";
import { useMobileAuth } from "../../services/mobileAuthContext";
import { MOCK_SCHEDULED_INTERVIEWS } from "../../src/mockData";

export default function InterviewerDashboard() {
  const [activeTab, setActiveTab] = useState<"pipeline" | "copilot" | "verdicts">("pipeline");
  const { session, isRestoring, theme } = useMobileAuth();
  const router = useRouter();
  const isLight = theme === "light";

  useEffect(() => {
    if (!isRestoring && !session) {
      router.replace("/");
    }
  }, [isRestoring, session, router]);

  // Rubric Scores
  const [rubricScores, setRubricScores] = useState({
    technical: 4,
    coding: 5,
    systemDesign: 4,
    communication: 5
  });

  return (
    <SafeAreaView style={[styles.safeArea, isLight && styles.safeAreaLight]} edges={["top", "bottom"]}>
      <MobileHeader />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isLight && styles.titleDark]}>INTERVIEWER CO-PILOT CONSOLE</Text>
          <Text style={styles.subtitle}>Lead Evaluator: {session?.name || "Marcus Vance"} • Staff Engineering</Text>
        </View>

        {/* Tab Row */}
        <View style={styles.tabRow}>
          <CrossButton
            title="Pipeline"
            variant={activeTab === "pipeline" ? "primary" : "secondary"}
            onPress={() => setActiveTab("pipeline")}
            style={styles.tabBtn}
          />
          <CrossButton
            title="Live Rubric"
            variant={activeTab === "copilot" ? "primary" : "secondary"}
            onPress={() => setActiveTab("copilot")}
            style={styles.tabBtn}
          />
          <CrossButton
            title="Hiring Verdicts"
            variant={activeTab === "verdicts" ? "primary" : "secondary"}
            onPress={() => setActiveTab("verdicts")}
            style={styles.tabBtn}
          />
        </View>

        {/* 1. Pipeline */}
        {activeTab === "pipeline" && (
          <View style={styles.section}>
            {MOCK_SCHEDULED_INTERVIEWS.map((item) => (
              <CrossCard key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.candidateName}>{item.candidateName}</Text>
                  <CrossBadge label="Round 2 Active" variant="success" />
                </View>
                <Text style={styles.roleText}>{item.roleTitle} ({item.department})</Text>
                <Text style={styles.timeText}>{item.scheduledDate} • {item.scheduledTime}</Text>

                <View style={styles.cardActions}>
                  <CrossButton
                    title="View Resume"
                    variant="secondary"
                    onPress={() => alert(`Opening verified resume for ${item.candidateName}`)}
                    style={styles.actionBtn}
                  />
                  <CrossButton
                    title="Launch Co-Pilot"
                    variant="primary"
                    onPress={() => setActiveTab("copilot")}
                    style={styles.actionBtn}
                  />
                </View>
              </CrossCard>
            ))}
          </View>
        )}

        {/* 2. Co-Pilot & Rubric */}
        {activeTab === "copilot" && (
          <CrossCard style={styles.card}>
            <Text style={styles.sectionTitle}>5-POINT RUBRIC EVALUATION</Text>
            <Text style={styles.candidateHeader}>Candidate: Sarah Jenkins (Lead Frontend)</Text>

            {(["technical", "coding", "systemDesign", "communication"] as const).map((key) => {
              const labels: Record<string, string> = {
                technical: "Technical Depth & Concurrency",
                coding: "Algorithm Implementation",
                systemDesign: "System Design & Architecture",
                communication: "Communication & Problem Solving",
              };
              return (
                <View key={key} style={styles.rubricItem}>
                  <Text style={styles.rubricLabel}>{labels[key]}</Text>
                  <View style={styles.rubricScoreRow}>
                    <CrossButton
                      title="−"
                      variant="secondary"
                      onPress={() =>
                        setRubricScores(prev => ({ ...prev, [key]: Math.max(1, prev[key] - 1) }))
                      }
                      style={styles.rubricBtn}
                    />
                    <Text style={styles.rubricScore}>{rubricScores[key]} / 5</Text>
                    <CrossButton
                      title="+"
                      variant="primary"
                      onPress={() =>
                        setRubricScores(prev => ({ ...prev, [key]: Math.min(5, prev[key] + 1) }))
                      }
                      style={styles.rubricBtn}
                    />
                  </View>
                </View>
              );
            })}

            <View style={styles.verdictSection}>
              <Text style={styles.verdictTitle}>RECOMMENDATION VERDICT: STRONG HIRE</Text>
              <Text style={styles.verdictNote}>
                Candidate demonstrated mastery of asynchronous queue management with zero memory leaks. Integrity verified at 96%.
              </Text>
            </View>

            <CrossButton
              title="Sign &amp; Submit Evaluation"
              variant="success"
              onPress={() => {
                const total = Object.values(rubricScores).reduce((a, b) => a + b, 0);
                const pct = Math.round((total / (Object.keys(rubricScores).length * 5)) * 100);
                alert(`✅ Evaluation submitted (Score: ${pct}%). Cryptographically signed and logged.`);
              }}
              style={styles.submitBtn}
            />
          </CrossCard>
        )}

        {/* 3. Hiring Verdicts */}
        {activeTab === "verdicts" && (
          <CrossCard style={styles.card}>
            <Text style={styles.sectionTitle}>FINAL HIRING COMMITTEE VERDICTS</Text>
            <View style={styles.verdictRow}>
              <Text style={styles.verdictName}>Sarah Jenkins</Text>
              <CrossBadge label="STRONG HIRE (92%)" variant="success" />
            </View>
            <View style={styles.verdictRow}>
              <Text style={styles.verdictName}>David Chen</Text>
              <CrossBadge label="HIRE (86%)" variant="primary" />
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
  safeAreaLight: {
    backgroundColor: "#f8fafc",
  },
  titleDark: {
    color: "#0f172a",
  },
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
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
  card: {
    marginBottom: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  candidateName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  roleText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  timeText: {
    color: "#34d399",
    fontSize: 11,
    fontFamily: "monospace",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
  },
  sectionTitle: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  candidateHeader: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  rubricItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#090d16",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  rubricLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    flex: 1,
    paddingRight: 8,
  },
  rubricScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rubricScore: {
    color: "#818cf8",
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "monospace",
    minWidth: 36,
    textAlign: "center",
  },
  rubricBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 32,
    borderRadius: 8,
  },
  verdictSection: {
    backgroundColor: "rgba(5, 150, 105, 0.1)",
    borderWidth: 1,
    borderColor: "#059669",
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  verdictTitle: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: "800",
  },
  verdictNote: {
    color: "#cbd5e1",
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  submitBtn: {
    marginTop: 12,
  },
  verdictRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  verdictName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  }
});
