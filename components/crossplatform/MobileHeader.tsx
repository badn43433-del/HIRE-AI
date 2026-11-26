/**
 * Cohesive Cross-Platform Header for Expo Go (matches Web App.tsx header)
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useMobileAuth } from "../../services/mobileAuthContext";
import { UserRole } from "../../src/types";

export function MobileHeader() {
  const { session, theme, toggleTheme, switchRole, signOut } = useMobileAuth();
  const router = useRouter();
  const isLight = theme === "light";

  const handleRoleSwitch = async (nextRole: UserRole) => {
    await switchRole(nextRole);
    router.replace(nextRole === "interviewer" ? "/(interviewer)" : "/(candidate)");
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <View style={[styles.wrapper, isLight && styles.wrapperLight]}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🛡️</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.brandTitle, isLight && styles.textDark]}>HireShield AI</Text>
              <View style={styles.livePill}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            {session && (
              <Text style={styles.userSub}>
                {session.name} • {session.role.toUpperCase()}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconBtn, isLight && styles.iconBtnLight]}
            activeOpacity={0.75}
          >
            <Text style={styles.iconText}>{isLight ? "🌙" : "☀️"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.75}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {session && (
        <View style={[styles.roleBar, isLight && styles.roleBarLight]}>
          {(["candidate", "interviewer"] as UserRole[]).map((r) => {
            const active = session.role === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => handleRoleSwitch(r)}
                style={[styles.rolePill, active && styles.rolePillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.rolePillText, active && styles.rolePillTextActive]}>
                  {r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  wrapperLight: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#e2e8f0",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
  },
  textDark: {
    color: "#0f172a",
  },
  livePill: {
    backgroundColor: "rgba(99,102,241,0.18)",
    borderWidth: 1,
    borderColor: "#4f46e5",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  liveText: {
    color: "#818cf8",
    fontSize: 9,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  userSub: {
    color: "#64748b",
    fontSize: 10,
    fontFamily: "monospace",
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  iconBtnLight: {
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
  },
  iconText: {
    fontSize: 13,
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7f1d1d",
    backgroundColor: "rgba(127,29,29,0.22)",
  },
  logoutText: {
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: "700",
  },
  roleBar: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 10,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  roleBarLight: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  rolePill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  rolePillActive: {
    backgroundColor: "#4f46e5",
  },
  rolePillText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800",
  },
  rolePillTextActive: {
    color: "#ffffff",
  },
});
