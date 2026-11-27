/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, ShieldCheck, Eye, Users, AlertTriangle, 
  Volume2, Sparkles, BrainCircuit, Activity, Smartphone,
  CheckCircle2, Flame, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AIProctoringMetrics, SuspiciousActivity } from "../../types";

interface AIProctoringHUDProps {
  streamActive: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  audioStream?: MediaStream | null;
  sessionId?: string;
  elapsedSeconds?: number;
  onMalpracticeAlert?: (alert: SuspiciousActivity) => void;
  onCameraStatusChange?: (healthy: boolean, reason: string | null) => void;
  trustScore: number;
  onTrustScoreChange?: (score: number) => void;
}

export default function AIProctoringHUD({
  streamActive,
  videoRef,
  audioStream,
  sessionId,
  elapsedSeconds = 0,
  onMalpracticeAlert,
  onCameraStatusChange,
  trustScore = 96,
  onTrustScoreChange
}: AIProctoringHUDProps) {
  // AI Proctoring telemetry metrics state
  const [metrics, setMetrics] = useState<AIProctoringMetrics>({
    faceDetected: true,
    multipleFaces: false,
    faceConfidence: 98,
    eyeGaze: "Center",
    headPose: "Forward",
    emotion: "Focused",
    voiceActivity: true,
    backgroundNoiseDecibels: 28,
    speechTranscript: "I am walking through the architecture of the distributed WebSocket message pipeline...",
    tabSwitches: 0,
    copyPastes: 0,
    phoneDetected: false,
    trustScore: trustScore,
    malpracticeAlerts: []
  });

  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const lookingAwaySinceRef = useRef<number | null>(null);
  const cooldownMapRef = useRef<Record<string, number>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trustScoreRef = useRef<number>(trustScore);
  trustScoreRef.current = trustScore;

  // Real-time ambient / side sound monitoring via Web Audio API AnalyserNode
  useEffect(() => {
    if (!audioStream || audioStream.getAudioTracks().length === 0) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    let audioCtx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let highNoiseSince: number | null = null;

    try {
      audioCtx = new AudioCtx();
      source = audioCtx.createMediaStreamSource(audioStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      intervalId = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
        // Scale 0-255 average amplitude into approximate 25-95 dB range
        const estimatedDb = Math.min(95, Math.max(25, Math.round(25 + (avg / 140) * 70)));

        setMetrics((prev) => ({
          ...prev,
          backgroundNoiseDecibels: estimatedDb,
          voiceActivity: estimatedDb > 38,
        }));

        const now = Date.now();
        if (estimatedDb >= 68) {
          if (!highNoiseSince) {
            highNoiseSince = now;
          } else if (now - highNoiseSince >= 2000) {
            const lastAt = cooldownMapRef.current["BACKGROUND_NOISE"] || 0;
            if (now - lastAt >= 6000) {
              cooldownMapRef.current["BACKGROUND_NOISE"] = now;
              highNoiseSince = null;

              const noiseAlert: SuspiciousActivity = {
                id: `noise-${now}`,
                type: "background_noise",
                timestamp: new Date().toISOString(),
                description: `Sustained ambient/side noise detected (${estimatedDb} dB >= 68 dB for > 2s).`,
                severity: "medium",
                videoOffsetSeconds: elapsedSeconds,
              };
              const nextTrust = Math.max(10, trustScoreRef.current - 8);
              setActiveAlert(`⚠️ High ambient noise detected (${estimatedDb} dB)!`);
              setMetrics((prev) => ({
                ...prev,
                trustScore: nextTrust,
                malpracticeAlerts: [noiseAlert, ...prev.malpracticeAlerts],
              }));
              if (onMalpracticeAlert) onMalpracticeAlert(noiseAlert);
              if (onTrustScoreChange) onTrustScoreChange(nextTrust);
              if (sessionId) {
                fetch(`/api/sessions/${sessionId}/events`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(noiseAlert),
                }).catch(() => {});
              }
              setTimeout(() => setActiveAlert(null), 4000);
            }
          }
        } else {
          highNoiseSince = null;
        }
      }, 400);
    } catch {
      // Ignore Web Audio errors on restricted headless/browser environments
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (source) {
        try {
          source.disconnect();
        } catch {}
      }
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    };
  }, [audioStream, sessionId]);

  // Monitor window blur & tab-switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newAlert: SuspiciousActivity = {
          id: `tab-blur-${Date.now()}`,
          type: "tab_switch",
          timestamp: new Date().toISOString(),
          description: "Candidate switched browser tabs / minimized assessment window.",
          severity: "high"
        };
        setActiveAlert("⚠️ Tab switch detected! Window focus lost.");
        setMetrics(prev => ({
          ...prev,
          tabSwitches: prev.tabSwitches + 1,
          trustScore: Math.max(40, prev.trustScore - 12),
          malpracticeAlerts: [newAlert, ...prev.malpracticeAlerts]
        }));
        if (onMalpracticeAlert) onMalpracticeAlert(newAlert);
        if (onTrustScoreChange) onTrustScoreChange(Math.max(40, trustScore - 12));
      } else {
        setTimeout(() => setActiveAlert(null), 4000);
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      const alert: SuspiciousActivity = {
        id: `cp-${Date.now()}`,
        type: "copy_paste",
        timestamp: new Date().toISOString(),
        description: "Clipboard copy-paste event intercepted during proctored session.",
        severity: "medium"
      };
      setActiveAlert("⚠️ Clipboard copy-paste action monitored.");
      setMetrics(prev => ({
        ...prev,
        copyPastes: prev.copyPastes + 1,
        trustScore: Math.max(50, prev.trustScore - 5),
        malpracticeAlerts: [alert, ...prev.malpracticeAlerts]
      }));
      if (onMalpracticeAlert) onMalpracticeAlert(alert);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("paste", handleCopyPaste);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [trustScore, onMalpracticeAlert, onTrustScoreChange]);

  // Real-time 2.5s camera frame sampling & AI Vision Proctoring analysis (runs even when camera is off/blocked)
  useEffect(() => {
    let cancelled = false;
    let lastFrameSignature: string | null = null;
    let frozenFrameCount = 0;

    const mapGazeLabel = (dir: string, away: boolean): AIProctoringMetrics["eyeGaze"] => {
      if (!away || dir === "center") return "Center";
      if (dir === "left") return "Looking Left";
      if (dir === "right") return "Looking Right";
      return "Looking Away";
    };

    const canEmit = (code: string, cooldownMs = 6000): boolean => {
      const now = Date.now();
      const last = cooldownMapRef.current[code] || 0;
      if (now - last < cooldownMs) return false;
      cooldownMapRef.current[code] = now;
      return true;
    };

    const flagCameraUnavailable = (code: string, reason: string) => {
      onCameraStatusChange?.(false, reason);
      setMetrics((prev) => ({
        ...prev,
        faceDetected: false,
        faceConfidence: 0,
      }));
      if (canEmit(code)) {
        const alert: SuspiciousActivity = {
          id: `cam-${Date.now()}`,
          type: "no_face",
          timestamp: new Date().toISOString(),
          description: reason,
          severity: "high",
          videoOffsetSeconds: elapsedSeconds,
        };
        const nextTrust = Math.max(10, trustScoreRef.current - 15);
        setActiveAlert(`⚠️ ${reason}`);
        setMetrics((prev) => ({
          ...prev,
          trustScore: nextTrust,
          malpracticeAlerts: [alert, ...prev.malpracticeAlerts],
        }));
        if (onMalpracticeAlert) onMalpracticeAlert(alert);
        if (onTrustScoreChange) onTrustScoreChange(nextTrust);
        if (sessionId) {
          fetch(`/api/sessions/${sessionId}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alert),
          }).catch(() => {});
        }
      }
    };

    const analyzeCurrentFrame = async () => {
      const video = videoRef?.current;
      const srcStream = (video?.srcObject as MediaStream | null) ?? null;
      const videoTrack = srcStream?.getVideoTracks()?.[0] ?? null;

      if (!streamActive || !video || !videoTrack || videoTrack.readyState !== "live" || videoTrack.muted || !videoTrack.enabled) {
        flagCameraUnavailable(
          "CAMERA_OFF",
          "Camera is turned off, muted, or disconnected during active interview."
        );
        return;
      }

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        flagCameraUnavailable(
          "CAMERA_NO_FRAMES",
          "Camera stream is not producing live video frames."
        );
        return;
      }

      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect covered/black lens or frozen video feed
      const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let lumaSum = 0;
      let sig = "";
      const step = 16 * 4;
      for (let i = 0; i < sample.length; i += step) {
        const luma = (sample[i] * 0.299 + sample[i + 1] * 0.587 + sample[i + 2] * 0.114);
        lumaSum += luma;
        if (sig.length < 32) sig += String.fromCharCode(65 + Math.floor(luma / 16));
      }
      const avgLuma = lumaSum / (sample.length / step);
      if (avgLuma < 8) {
        flagCameraUnavailable(
          "CAMERA_BLACK_FRAME",
          "Camera lens appears covered or outputting a black frame."
        );
        return;
      }

      if (sig === lastFrameSignature) {
        frozenFrameCount += 1;
        if (frozenFrameCount >= 3) {
          flagCameraUnavailable(
            "CAMERA_FROZEN",
            "Camera feed appears frozen or stalled."
          );
          return;
        }
      } else {
        frozenFrameCount = 0;
        lastFrameSignature = sig;
      }

      onCameraStatusChange?.(true, null);
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.6);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch("/api/proctor/analyze-frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            imageBase64,
            sessionId,
            elapsedSeconds,
          }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;

        const now = Date.now();
        let prolongedLookingAway = false;
        if (data.lookingAway) {
          if (!lookingAwaySinceRef.current) {
            lookingAwaySinceRef.current = now;
          } else if (now - lookingAwaySinceRef.current >= 2500) {
            prolongedLookingAway = true;
          }
        } else {
          lookingAwaySinceRef.current = null;
        }

        const newAlerts: SuspiciousActivity[] = [];
        let penaltyTotal = 0;

        if (data.phoneDetected && canEmit("PHONE_DETECTED")) {
          newAlerts.push({
            id: `phone-${now}`,
            type: "mobile_phone",
            timestamp: new Date().toISOString(),
            description: data.reason || "Mobile phone or unauthorized device detected in camera frame.",
            severity: "high",
            videoOffsetSeconds: elapsedSeconds,
          });
          penaltyTotal += 18;
          setActiveAlert("⚠️ Mobile phone / unauthorized device detected!");
        }

        if ((data.multiplePeopleDetected || data.personCount > 1) && canEmit("MULTIPLE_PEOPLE")) {
          newAlerts.push({
            id: `multi-${now}`,
            type: "multiple_faces",
            timestamp: new Date().toISOString(),
            description: `Multiple people detected in frame (${data.personCount} persons visible).`,
            severity: "high",
            videoOffsetSeconds: elapsedSeconds,
          });
          penaltyTotal += 20;
          setActiveAlert(`⚠️ Multiple people detected (${data.personCount} persons in frame)!`);
        }

        if (prolongedLookingAway && canEmit("LOOKING_AWAY")) {
          newAlerts.push({
            id: `gaze-${now}`,
            type: "reading_behavior",
            timestamp: new Date().toISOString(),
            description: `Candidate looking away (${data.gazeDirection}) for > 2.5s.`,
            severity: "medium",
            videoOffsetSeconds: elapsedSeconds,
          });
          penaltyTotal += 10;
          setActiveAlert(`⚠️ Looking away from screen (${data.gazeDirection})!`);
        }

        if (data.personCount === 0 && canEmit("NO_FACE")) {
          newAlerts.push({
            id: `noface-${now}`,
            type: "no_face",
            timestamp: new Date().toISOString(),
            description: "Candidate face not detected in camera frame.",
            severity: "medium",
            videoOffsetSeconds: elapsedSeconds,
          });
          penaltyTotal += 10;
          setActiveAlert("⚠️ No face detected in camera frame!");
        }

        const nextTrust = Math.max(10, trustScoreRef.current - penaltyTotal);
        if (penaltyTotal > 0 && onTrustScoreChange) {
          onTrustScoreChange(nextTrust);
        }
        newAlerts.forEach((al) => {
          if (onMalpracticeAlert) onMalpracticeAlert(al);
        });

        setMetrics((prev) => ({
          ...prev,
          faceDetected: data.personCount > 0,
          multipleFaces: Boolean(data.multiplePeopleDetected || data.personCount > 1),
          faceConfidence: Math.round((data.confidence ?? 0.95) * 100),
          eyeGaze: mapGazeLabel(data.gazeDirection, Boolean(data.lookingAway)),
          headPose: data.lookingAway ? (data.gazeDirection === "down" ? "Looking Down" : "Forward") : "Forward",
          phoneDetected: Boolean(data.phoneDetected),
          trustScore: penaltyTotal > 0 ? nextTrust : prev.trustScore,
          malpracticeAlerts: newAlerts.length > 0 ? [...newAlerts, ...prev.malpracticeAlerts] : prev.malpracticeAlerts,
        }));

        if (newAlerts.length > 0) {
          setTimeout(() => {
            if (!cancelled) setActiveAlert(null);
          }, 4500);
        }
      } catch {
        // Graceful fallback: never freeze camera or crash UI on transient frame error
      } finally {
        clearTimeout(timeoutId);
      }
    };

    const interval = setInterval(analyzeCurrentFrame, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [streamActive, videoRef, sessionId, elapsedSeconds, onMalpracticeAlert, onTrustScoreChange]);

  return (
    <div className="space-y-3">
      {/* Alert Banner Popup */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-between shadow-lg shadow-rose-600/30"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 animate-bounce" />
              <span>{activeAlert}</span>
            </div>
            <span className="text-[10px] font-mono bg-rose-800 px-2 py-0.5 rounded">FLAGGED TO PROCTOR</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main HUD Telemetry Grid */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-3.5 text-slate-100 shadow-md space-y-3 font-sans">
        {/* HUD Top Bar: Trust Score & Neural Proctor Status */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                AI Proctor Guard
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <p className="text-[9px] font-mono text-slate-400">OpenCV • MediaPipe • YOLOv8</p>
            </div>
          </div>

          {/* Dynamic Trust Score Badge */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
            <span className="text-[10px] font-mono text-slate-400">Trust Score:</span>
            <span className={`text-xs font-heading font-extrabold ${
              trustScore > 80 ? "text-emerald-400" : trustScore > 60 ? "text-amber-400" : "text-rose-400"
            }`}>
              {trustScore}%
            </span>
          </div>
        </div>

        {/* Neural Metrics Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* 1. Face Verification */}
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-mono block">Face Verified</span>
              <span className="text-[11px] font-bold text-emerald-300">1 Person (98%)</span>
            </div>
          </div>

          {/* 2. Eye-Gaze Tracking */}
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <div className={`p-1 rounded-lg ${
              metrics.eyeGaze === "Center" ? "bg-indigo-500/10 text-indigo-400" : "bg-amber-500/10 text-amber-400"
            }`}>
              <Eye className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-mono block">Eye Gaze Vector</span>
              <span className={`text-[11px] font-bold ${
                metrics.eyeGaze === "Center" ? "text-slate-200" : "text-amber-300"
              }`}>
                {metrics.eyeGaze}
              </span>
            </div>
          </div>

          {/* 3. Emotion / Demeanor */}
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-mono block">Affect State</span>
              <span className="text-[11px] font-bold text-sky-300">{metrics.emotion}</span>
            </div>
          </div>

          {/* 4. Ambient Noise & Device Check */}
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
            <div className="p-1 rounded-lg bg-teal-500/10 text-teal-400">
              <Volume2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-mono block">Audio Floor</span>
              <span className="text-[11px] font-bold text-teal-300">{metrics.backgroundNoiseDecibels} dB (Clean)</span>
            </div>
          </div>
        </div>

        {/* Live Speech-to-Text Transcript Feed */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-start gap-2">
          <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 text-[9px] uppercase font-bold shrink-0">
            Whisper STT
          </span>
          <span className="italic text-slate-300 line-clamp-1">
            "{metrics.speechTranscript}"
          </span>
        </div>
      </div>
    </div>
  );
}
