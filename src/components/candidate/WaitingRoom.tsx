/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Clock, ShieldCheck, Video, Users, CheckCircle2, 
  ArrowRight, Sparkles, FileText, AlertCircle, RefreshCw
} from "lucide-react";
import { motion } from "motion/react";
import { ScheduledInterview } from "../../types";

interface WaitingRoomProps {
  interview: ScheduledInterview;
  onEnterLiveRoom: () => void;
  candidateName: string;
}

export default function WaitingRoom({ interview, onEnterLiveRoom, candidateName }: WaitingRoomProps) {
  const [countdown, setCountdown] = useState(15);
  const [interviewerStatus, setInterviewerStatus] = useState<"connecting" | "ready">("connecting");
  const [cameraVerified, setCameraVerified] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const verifyDefaultCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraVerified(false);
      setCameraError("Camera API unavailable in this browser.");
      return;
    }
    try {
      const probe = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { ideal: "default" } },
      });
      const track = probe.getVideoTracks()[0];
      const ok = Boolean(track && track.readyState === "live" && !track.muted);
      probe.getTracks().forEach((t) => t.stop());
      setCameraVerified(ok);
      if (!ok) {
        setCameraError("Default camera is muted or not streaming live frames.");
      }
    } catch {
      setCameraVerified(false);
      setCameraError("Default camera is closed, blocked, or permission denied. Enable your camera to enter.");
    }
  };

  useEffect(() => {
    verifyDefaultCamera();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setInterviewerStatus("ready");
          return 0;
        }
        if (prev === 5) {
          setInterviewerStatus("ready");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Waiting Room Hero Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Top Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Live Secure Waiting Room
            </span>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>Position #1 in Queue</span>
          </div>
        </div>

        {/* Center Presentation */}
        <div className="text-center space-y-3 py-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Video className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">
              {interview.roleTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Department of {interview.department} • Scheduled with <span className="font-semibold text-slate-700 dark:text-slate-300">{interview.interviewerName}</span>
            </p>
          </div>

          <div className="p-4 max-w-md mx-auto bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Interviewer Connection:</span>
              <span className={`font-bold flex items-center gap-1 ${
                interviewerStatus === "ready" ? "text-emerald-500" : "text-amber-500"
              }`}>
                {interviewerStatus === "ready" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Room Active & Waiting
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Admitting Candidates ({countdown}s)
                  </>
                )}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-1000"
                style={{ width: `${Math.min(100, ((15 - countdown) / 15) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Proctoring Rules Checklist */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono tracking-wider">
            Live Assessment Instructions & Proctor Guidelines:
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              Keep face visible & illuminated in camera frame
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              Do not switch tabs or minimize assessment browser
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              Built-in code compiler & whiteboard provided
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              Live chat with interviewer available throughout
            </li>
          </ul>
        </div>

        {/* Camera Enforcement Warning */}
        {!cameraVerified && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{cameraError || "Verifying default camera stream..."}</span>
            </div>
            <button
              type="button"
              onClick={verifyDefaultCamera}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shrink-0"
            >
              Retry Camera Check
            </button>
          </div>
        )}

        {/* Enter Room Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400 font-mono">
            Candidate ID: <strong className="text-slate-600 dark:text-slate-300">{candidateName}</strong>
          </span>

          <button
            id="admit-now-btn"
            disabled={!cameraVerified}
            onClick={onEnterLiveRoom}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span>Enter Live Interview Screen</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
