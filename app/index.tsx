/**
 * HireShield AI - Cross-Platform Portal Gateway
 * Seamlessly routes across Web, Android, and iOS (Expo Go)
 */

import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { CrossButton } from "../components/crossplatform/Button";
import { CrossCard } from "../components/crossplatform/Card";
import { CrossBadge } from "../components/crossplatform/Badge";
import { UserRole } from "../src/types";
import { checkBackendConnectivity } from "../services/api";

export default function HomeScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("candidate");
  const [backendStatus, setBackendStatus] = useState<{
    checking: boolean;
    ok: boolean;
    baseUrl: string;
    message: string;
  }>({
    checking: true,
    ok: false,
    baseUrl: "",
    message: "Checking backend connection...",
  });
  const router = useRouter();

  const runConnectivityCheck = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const res = await checkBackendConnectivity();
    setBackendStatus({ checking: false, ...res });
  };

  useEffect(() => {
    runConnectivityCheck();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🛡️</Text>
          </View>
          <Text style={styles.title}>HireShield AI Enterprise</Text>
          <Text style={styles.subTitle}>
            Universal Cross-Platform Live Interview & Proctoring Platform
          </Text>
          <View style={styles.badgesRow}>
            <CrossBadge label="Expo SDK 57.0.9" variant="primary" />
            <CrossBadge label={`Platform: ${Platform.OS.toUpperCase()}`} variant="success" />
            <CrossBadge label="Zero Paid APIs" variant="warning" />
          </View>
        </View>

        {/* Role Selection Card */}
        <CrossCard style={styles.roleCard}>
          <Text style={styles.cardHeader}>SELECT PORTAL ROLE</Text>
          <View style={styles.roleButtonsGrid}>
            {(["candidate", "interviewer"] as UserRole[]).map((r) => (
              <CrossButton
                key={r}
                title={r.toUpperCase()}
                variant={selectedRole === r ? "primary" : "secondary"}
                onPress={() => setSelectedRole(r)}
                style={styles.roleBtn}
              />
            ))}
          </View>

          {/* Quick Sandbox Login Preset */}
          <View style={styles.demoCredentialsBox}>
            <Text style={styles.demoLabel}>1-CLICK SANDBOX DEMO CREDENTIALS:</Text>
            <Text style={styles.demoAccount}>
              {selectedRole === "candidate"
                ? "Candidate: sarah.jenkins@enterprise-recruit.com (Sarah J.)"
                : "Interviewer: marcus.vance@techcorp.io (Marcus V.)"}
            </Text>
            <Text style={styles.demoOtp}>2FA OTP: 849201</Text>
          </View>

          <CrossButton
            title={`Enter ${selectedRole.toUpperCase()} Dashboard`}
            variant="success"
            onPress={() => {
              if (Platform.OS === "web" && typeof window !== "undefined" && typeof localStorage !== "undefined") {
                // Web: set localStorage and reload for auth state to pick up
                localStorage.setItem("hireshield_is_logged_in", "true");
                localStorage.setItem("hireshield_role", selectedRole);
                window.location.reload();
              } else {
                // Native (Android / iOS): navigate via Expo Router
                if (selectedRole === "candidate") {
                  router.push("/(candidate)");
                } else {
                  router.push("/(interviewer)");
                }
              }
            }}
            style={styles.enterBtn}
          />
        </CrossCard>

        {/* Cross-Network Backend Status Card */}
        <CrossCard style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <Text style={styles.cardHeader}>BACKEND CONNECTIVITY</Text>
            <CrossBadge
              label={backendStatus.checking ? "CHECKING" : backendStatus.ok ? "CONNECTED" : "OFFLINE"}
              variant={backendStatus.checking ? "warning" : backendStatus.ok ? "success" : "danger"}
            />
          </View>
          <Text style={styles.statusUrl}>{backendStatus.baseUrl || "EXPO_PUBLIC_API_URL not set"}</Text>
          <Text style={styles.statusMsg}>{backendStatus.message}</Text>
          {!backendStatus.ok && !backendStatus.checking && (
            <CrossButton
              title="Re-check Connection"
              variant="secondary"
              onPress={runConnectivityCheck}
              style={styles.recheckBtn}
            />
          )}
        </CrossCard>

        {/* Cross-Platform Specifications Card */}
        <CrossCard style={styles.specCard}>
          <Text style={styles.cardHeader}>CROSS-PLATFORM ARCHITECTURE</Text>
          <View style={styles.specItem}>
            <Text style={styles.specTitle}>• Mobile & Web Reactivity</Text>
            <Text style={styles.specDesc}>
              Runs natively on Android and iOS devices via Expo Go SDK 57.0.9, and on modern desktop/tablet web browsers via React Native Web.
            </Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specTitle}>• On-Server AI Inference</Text>
            <Text style={styles.specDesc}>
              No battery or memory drain on mobile devices. Face mesh (MediaPipe), eye-gaze tracking (OpenCV), phone detection (YOLO), and candidate answer evaluation execute on the FastAPI backend.
            </Text>
          </View>
        </CrossCard>
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
    padding: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    textAlign: "center",
  },
  subTitle: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
    maxWidth: 320,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  roleCard: {
    width: "100%",
    maxWidth: 480,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 12,
  },
  roleButtonsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  demoCredentialsBox: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  demoLabel: {
    color: "#818cf8",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  demoAccount: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  demoOtp: {
    color: "#34d399",
    fontSize: 11,
    fontFamily: "monospace",
    marginTop: 2,
  },
  enterBtn: {
    width: "100%",
  },
  statusCard: {
    width: "100%",
    maxWidth: 480,
    marginBottom: 16,
  },
  statusHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statusUrl: {
    color: "#38bdf8",
    fontSize: 11,
    fontFamily: "monospace",
  },
  statusMsg: {
    color: "#cbd5e1",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  recheckBtn: {
    marginTop: 10,
    paddingVertical: 8,
  },
  specCard: {
    width: "100%",
    maxWidth: 480,
  },
  specItem: {
    marginVertical: 6,
  },
  specTitle: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "700",
  },
  specDesc: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  }
});
