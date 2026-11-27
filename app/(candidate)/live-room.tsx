/**
 * Cross-Platform Live Interview Screen
 * Supports Web Browser and Expo Go on Android & iOS
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  TextInput,
  KeyboardAvoidingView,
  AppState
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CrossButton } from "../../components/crossplatform/Button";
import { CrossCard } from "../../components/crossplatform/Card";
import { CrossBadge } from "../../components/crossplatform/Badge";
import { CrossPlatformHUD } from "../../components/crossplatform/CrossPlatformHUD";
import { CrossPlatformCodeEditor } from "../../components/crossplatform/CrossPlatformCodeEditor";

const INTERVIEW_DURATION_SECONDS = 45 * 60; // 45 minutes

export default function CandidateLiveRoom() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"code" | "hud" | "chat">("code");
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [trustScore, setTrustScore] = useState(96);
  const [appSwitches, setAppSwitches] = useState(0);
  const [proctorWarning, setProctorWarning] = useState<string | null>(null);

  // Detect app backgrounding / switching on mobile
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        setAppSwitches((c) => c + 1);
        setTrustScore((s) => Math.max(20, s - 10));
        setProctorWarning("⚠️ App backgrounding / screen switch detected and logged.");
      }
    });
    return () => sub.remove();
  }, []);

  // Live countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(INTERVIEW_DURATION_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setSessionEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isLowTime = secondsRemaining < 5 * 60; // last 5 mins

  // Simple in-room chat
  const [chatMessages, setChatMessages] = useState([
    { id: "1", sender: "Interviewer", text: "Hello! Let's begin with the coding challenge.", time: "14:02" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), sender: "You", text: chatInput.trim(), time }]);
    setChatInput("");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Top Session Ribbon */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <CrossBadge label="REC • LIVE" variant="danger" />
              <Text style={styles.roleTitle}>Senior Frontend UI Architect</Text>
            </View>

            <View style={styles.topBarRight}>
              <Text style={[styles.timerText, isLowTime && styles.timerWarning]}>
                {formatTime(secondsRemaining)}
              </Text>
              {isLowTime && <CrossBadge label="LOW TIME" variant="warning" />}
              {!isLowTime && <CrossBadge label="HD 5.2 Mbps" variant="success" />}
            </View>
          </View>

          {/* Proctoring Alert Banner */}
          {proctorWarning && (
            <View style={styles.proctorAlertBanner}>
              <Text style={styles.proctorAlertText}>{proctorWarning}</Text>
              <TouchableOpacity onPress={() => setProctorWarning(null)}>
                <Text style={styles.proctorDismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Camera-Off Proctoring Warning */}
          {cameraOff && (
            <View style={[styles.proctorAlertBanner, { backgroundColor: "#7f1d1d" }]}>
              <Text style={styles.proctorAlertText}>⚠️ Camera is OFF — Active camera is required during proctored interview. Turn camera back on to continue.</Text>
              <TouchableOpacity onPress={() => setCameraOff(false)}>
                <Text style={styles.proctorDismissText}>Turn On</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Session-Ended Screen */}
          {sessionEnded && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 }}>
              <Text style={{ color: "#f8fafc", fontSize: 22, fontWeight: "800", textAlign: "center" }}>
                🎯 Assessment Concluded
              </Text>
              <Text style={{ color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
                Your session has ended. The AI Evaluation Scorecard is being generated.
              </Text>
              <CrossButton
                title="Return to Dashboard"
                variant="primary"
                onPress={() => router.replace("/(candidate)")}
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {/* Video Grid Section */}
          <View style={styles.videoSection}>
            {/* Interviewer Video Tile */}
            <CrossCard style={styles.videoTile}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>MV</Text>
              </View>
              <Text style={styles.participantName}>Marcus Vance (Interviewer)</Text>
              <Text style={styles.participantRole}>Staff Engineering Lead</Text>
              <View style={styles.audioActivePill}>
                <Text style={styles.audioActiveText}>● AUDIO ACTIVE</Text>
              </View>
            </CrossCard>

            {/* Candidate Video Tile with AI indicator */}
            <CrossCard style={[styles.videoTile as any, cameraOff && styles.videoTileOff]}>
              <View style={styles.avatarCircleCandidate}>
                <Text style={styles.avatarInitials}>{cameraOff ? "📷" : "SJ"}</Text>
              </View>
              <Text style={styles.participantName}>Sarah Jenkins (You)</Text>
              <Text style={styles.participantRole}>
                {cameraOff ? "Camera Off" : "Candidate Stream Active"}
              </Text>
              {!cameraOff && (
                <View style={styles.trustPill}>
                  <Text style={styles.trustPillText}>AI Trust: {trustScore}% ✓</Text>
                </View>
              )}
              {micMuted && (
                <View style={[styles.audioActivePill, styles.mutedPill]}>
                  <Text style={styles.mutedPillText}>🔇 MUTED</Text>
                </View>
              )}
            </CrossCard>
          </View>

          {/* Media Controls Bar */}
          <View style={styles.controlsBar}>
            <CrossButton
              title={micMuted ? "🔇 Muted" : "🎙 Mic"}
              variant={micMuted ? "danger" : "secondary"}
              onPress={() => setMicMuted(!micMuted)}
              style={styles.controlBtn}
            />
            <CrossButton
              title={cameraOff ? "📷 Off" : "📹 Cam"}
              variant={cameraOff ? "danger" : "secondary"}
              onPress={() => setCameraOff(!cameraOff)}
              style={styles.controlBtn}
            />
            <CrossButton
              title="🧠 HUD"
              variant={activeTab === "hud" ? "primary" : "secondary"}
              onPress={() => setActiveTab(activeTab === "hud" ? "code" : "hud")}
              style={styles.controlBtn}
            />
            <CrossButton
              title="💬 Chat"
              variant={activeTab === "chat" ? "primary" : "secondary"}
              onPress={() => setActiveTab(activeTab === "chat" ? "code" : "chat")}
              style={styles.controlBtn}
            />
            <CrossButton
              title="End"
              variant="danger"
              onPress={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setSessionEnded(true);
              }}
              style={styles.controlBtn}
            />
          </View>

          {/* Workspace Area */}
          {activeTab === "hud" && (
            <CrossPlatformHUD trustScore={trustScore} gazeStatus="Center" tabSwitches={appSwitches} />
          )}

          {activeTab === "code" && (
            <CrossPlatformCodeEditor />
          )}

          {activeTab === "chat" && (
            <CrossCard style={styles.chatCard}>
              <Text style={styles.chatHeader}>💬 INTERVIEW CHAT</Text>
              <View style={styles.chatMessages}>
                {chatMessages.map(msg => (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatBubble,
                      msg.sender === "You" ? styles.chatBubbleSelf : styles.chatBubbleOther
                    ]}
                  >
                    <Text style={styles.chatSender}>{msg.sender} • {msg.time}</Text>
                    <Text style={styles.chatText}>{msg.text}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Type a message..."
                  placeholderTextColor="#475569"
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                  multiline={false}
                />
                <CrossButton
                  title="Send"
                  variant="primary"
                  onPress={sendMessage}
                  style={styles.sendBtn}
                />
              </View>
            </CrossCard>
          )}
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
  container: {
    padding: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 12,
  },
  proctorAlertBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#be123c",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  proctorAlertText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },
  proctorDismissText: {
    color: "#fecdd3",
    fontSize: 11,
    fontWeight: "700",
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleTitle: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timerText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  videoSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  videoTile: {
    flex: 1,
    aspectRatio: 1.3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#090d16",
    borderColor: "#1e293b",
    position: "relative" as const,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarCircleCandidate: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarInitials: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
  participantName: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "700",
  },
  participantRole: {
    color: "#64748b",
    fontSize: 9,
  },
  audioActivePill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  audioActiveText: {
    color: "#34d399",
    fontSize: 8,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  trustPill: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(5, 150, 105, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#059669",
  },
  trustPillText: {
    color: "#34d399",
    fontSize: 8,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  controlsBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  controlBtn: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 12,
  },
  timerWarning: {
    color: "#f97316",
  },
  videoTileOff: {
    borderColor: "#7f1d1d",
    opacity: 0.75,
  },
  mutedPill: {
    left: undefined,
    right: 8,
    bottom: 30,
    backgroundColor: "rgba(127,29,29,0.8)",
  },
  mutedPillText: {
    color: "#fca5a5",
    fontSize: 8,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  chatCard: {
    gap: 10,
  },
  chatHeader: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  chatMessages: {
    gap: 8,
    maxHeight: 280,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chatBubbleSelf: {
    backgroundColor: "#1e1b4b",
    borderColor: "#312e81",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  chatBubbleOther: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  chatSender: {
    color: "#818cf8",
    fontSize: 9,
    fontWeight: "700",
    fontFamily: "monospace",
    marginBottom: 3,
  },
  chatText: {
    color: "#e2e8f0",
    fontSize: 12,
    lineHeight: 17,
  },
  chatInputRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#f1f5f9",
    fontSize: 12,
  },
  sendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    minWidth: 60,
  },
});
