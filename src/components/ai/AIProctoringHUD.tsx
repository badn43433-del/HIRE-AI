/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, Eye, Users, AlertTriangle, 
  Volume2, Sparkles, BrainCircuit, Activity, Smartphone,
  CheckCircle2, Flame, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AIProctoringMetrics, SuspiciousActivity } from "../../types";

interface AIProctoringHUDProps {
  streamActive: boolean;
  onMalpracticeAlert?: (alert: SuspiciousActivity) => void;
  trustScore: number;
  onTrustScoreChange?: (score: number) => void;
}

export default function AIProctoringHUD({
  streamActive,
  onMalpracticeAlert,
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

  // Periodic micro-telemetry fluctuations to simulate MediaPipe/OpenCV inference
  useEffect(() => {
    const interval = setInterval(() => {
      // Natural gaze & emotion drift
      const gazes: ("Center" | "Looking Left" | "Looking Right" | "Looking Away")[] = [
        "Center", "Center", "Center", "Center", "Looking Left", "Looking Right"
      ];
      const emotions: ("Confident" | "Focused" | "Neutral" | "Stressed")[] = [
        "Focused", "Confident", "Focused", "Neutral"
      ];
      const randomGaze = gazes[Math.floor(Math.random() * gazes.length)];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

      setMetrics(prev => ({
        ...prev,
        eyeGaze: randomGaze,
        emotion: randomEmotion,
        backgroundNoiseDecibels: Math.floor(22 + Math.random() * 14)
      }));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

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
