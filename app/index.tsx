/**
 * HireShield AI - Cross-Platform Auth & Portal Gateway
 * Automatically restores persisted session on launch; otherwise presents Sign In / Sign Up.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CrossButton } from "../components/crossplatform/Button";
import { CrossCard } from "../components/crossplatform/Card";
import { CrossBadge } from "../components/crossplatform/Badge";
import { CrossInput } from "../components/crossplatform/Input";
import { UserRole } from "../src/types";
import { checkBackendConnectivity } from "../services/api";
import { useMobileAuth } from "../services/mobileAuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { session, isRestoring, theme, toggleTheme, signIn, signUp } = useMobileAuth();
  const isLight = theme === "light";

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

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

  // Automatically route to user's portal if a valid session already exists
  useEffect(() => {
    if (!isRestoring && session) {
      router.replace(session.role === "interviewer" ? "/(interviewer)" : "/(candidate)");
    }
  }, [isRestoring, session, router]);

  const runConnectivityCheck = async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const res = await checkBackendConnectivity();
    setBackendStatus({ checking: false, ...res });
  };

  useEffect(() => {
    runConnectivityCheck();
  }, []);

  if (isRestoring || session) {
    return (
      <SafeAreaView style={[styles.safeArea, isLight && styles.safeAreaLight]}>
        <View style={styles.loadingContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🛡️</Text>
          </View>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={[styles.loadingText, isLight && styles.textDark]}>
            {session ? "Restoring your HireShield AI session..." : "Initializing HireShield AI..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    setErrorText(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorText("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorText("Password must be at least 6 characters.");
      return;
    }
    if (authMode === "signup" && !name.trim()) {
      setErrorText("Please enter your full name.");
      return;
    }

    setSubmitting(true);
    try {
      const nextSession =
        authMode === "signup"
          ? await signUp(name.trim(), cleanEmail, password, selectedRole)
          : await signIn(cleanEmail, password);

      if (Platform.OS === "web" && typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.setItem("hireshield_is_logged_in", "true");
        localStorage.setItem("hireshield_user_id", nextSession.userId);
        localStorage.setItem("hireshield_user_name", nextSession.name);
        localStorage.setItem("hireshield_user_email", nextSession.email);
        localStorage.setItem("hireshield_role", nextSession.role);
      }

      router.replace(nextSession.role === "interviewer" ? "/(interviewer)" : "/(candidate)");
    } catch (err: any) {
      setErrorText(err?.message || "Authentication failed. Check your credentials and network.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isLight && styles.safeAreaLight]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Top Theme Switcher */}
          <View style={styles.topUtilityRow}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.themeChip, isLight && styles.themeChipLight]}
              activeOpacity={0.75}
            >
              <Text style={[styles.themeChipText, isLight && styles.textDark]}>
                {isLight ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🛡️</Text>
            </View>
            <Text style={[styles.title, isLight && styles.textDark]}>HireShield AI</Text>
            <Text style={styles.subTitle}>
              Enterprise Live Technical Interview &amp; Proctoring Suite
            </Text>
            <View style={styles.badgesRow}>
              <CrossBadge label={`Platform: ${Platform.OS.toUpperCase()}`} variant="success" />
              <CrossBadge label="2FA & Session Sync" variant="primary" />
            </View>
          </View>

          {/* Auth Card */}
          <CrossCard style={[styles.authCard, isLight && styles.cardLight]}>
            {/* Sign In / Sign Up Mode Switcher */}
            <View style={[styles.modeSwitchRow, isLight && styles.modeSwitchRowLight]}>
              <CrossButton
                title="Sign In"
                variant={authMode === "login" ? "primary" : "secondary"}
                onPress={() => {
                  setAuthMode("login");
                  setErrorText(null);
                }}
                style={styles.modeBtn}
              />
              <CrossButton
                title="Create Account"
                variant={authMode === "signup" ? "primary" : "secondary"}
                onPress={() => {
                  setAuthMode("signup");
                  setErrorText(null);
                }}
                style={styles.modeBtn}
              />
            </View>

            {/* Role Selector (for Sign Up) */}
            {authMode === "signup" && (
              <>
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

                <CrossInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                />
              </>
            )}

            <CrossInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CrossInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              secureTextEntry
            />

            {errorText && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            )}

            <CrossButton
              title={
                submitting
                  ? "Authenticating..."
                  : authMode === "signup"
                  ? `Create ${selectedRole.toUpperCase()} Account`
                  : "Sign In"
              }
              variant="success"
              loading={submitting}
              disabled={submitting}
              onPress={handleSubmit}
              style={styles.enterBtn}
            />
          </CrossCard>

          {/* Cross-Network Backend Status Card */}
          <CrossCard style={[styles.statusCard, isLight && styles.cardLight]}>
            <View style={styles.statusHeaderRow}>
              <Text style={styles.cardHeader}>BACKEND CONNECTIVITY</Text>
              <CrossBadge
                label={backendStatus.checking ? "CHECKING" : backendStatus.ok ? "CONNECTED" : "OFFLINE"}
                variant={backendStatus.checking ? "warning" : backendStatus.ok ? "success" : "danger"}
              />
            </View>
            <Text style={styles.statusUrl}>{backendStatus.baseUrl || "EXPO_PUBLIC_API_URL not set"}</Text>
            <Text style={[styles.statusMsg, isLight && styles.textMutedDark]}>
              {backendStatus.message}
            </Text>
            {!backendStatus.ok && !backendStatus.checking && (
              <CrossButton
                title="Re-check Connection"
                variant="secondary"
                onPress={runConnectivityCheck}
                style={styles.recheckBtn}
              />
            )}
          </CrossCard>
        </ScrollView>
      </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
  },
  loadingText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  container: {
    padding: 18,
    alignItems: "center",
    paddingBottom: 36,
  },
  topUtilityRow: {
    width: "100%",
    maxWidth: 480,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  themeChipLight: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
  },
  themeChipText: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "700",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 26,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f8fafc",
    textAlign: "center",
  },
  textDark: {
    color: "#0f172a",
  },
  textMutedDark: {
    color: "#475569",
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
    marginTop: 10,
  },
  authCard: {
    width: "100%",
    maxWidth: 480,
    marginBottom: 16,
  },
  cardLight: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  modeSwitchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  modeSwitchRowLight: {
    backgroundColor: "#f1f5f9",
    padding: 4,
    borderRadius: 14,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
  },
  cardHeader: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 8,
  },
  roleButtonsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
  },
  errorBox: {
    backgroundColor: "rgba(225,29,72,0.14)",
    borderWidth: 1,
    borderColor: "#e11d48",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "#fda4af",
    fontSize: 12,
    fontWeight: "600",
  },
  enterBtn: {
    width: "100%",
    marginTop: 4,
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
});
