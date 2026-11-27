/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, Monitor,
  Hand, Maximize, Minimize, PhoneOff, MessageSquare,
  Code2, PenTool, BrainCircuit, ShieldAlert, ShieldCheck, Wifi,
  Clock, Paperclip, Send, Sparkles, AlertCircle, CheckCircle2,
  HelpCircle, UserCheck, Eye, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CodingEditor from "./CodingEditor";
import WhiteboardCanvas from "./WhiteboardCanvas";
import AIProctoringHUD from "../ai/AIProctoringHUD";
import { ScheduledInterview, ChatMessage, SuspiciousActivity } from "../../types";

interface LiveInterviewSuiteProps {
  interview: ScheduledInterview;
  candidateName: string;
  candidateEmail: string;
  onEndInterview: (summary: any) => void;
}

export default function LiveInterviewSuite({
  interview,
  candidateName,
  candidateEmail,
  onEndInterview
}: LiveInterviewSuiteProps) {
  // Active Workspace Tab
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"coding" | "whiteboard" | "chat" | "ai_hud">("coding");

  // Media & Controls
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<"HD" | "Good" | "Fair">("HD");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Timer: 45 minutes default countdown
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);

  // Video references
  const candidateVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Proctoring & Trust Score
  const [trustScore, setTrustScore] = useState(96);
  const [malpracticeEvents, setMalpracticeEvents] = useState<SuspiciousActivity[]>([]);
  const [liveWarning, setLiveWarning] = useState<string | null>(null);

  // Live Chat
  const [chats, setChats] = useState<ChatMessage[]>([
    {
      id: "chat-1",
      sender: "interviewer",
      senderName: interview.interviewerName,
      text: `Hello ${candidateName}! Welcome to your technical round. Let's begin by reviewing the WebSocket queue challenge on your code editor tab.`,
      timestamp: "14:02 PM"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Start local camera & mic stream using system default devices
  const startDefaultMedia = () => {
    setMediaError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Camera & Microphone API unavailable in this browser.");
      return;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    navigator.mediaDevices.getUserMedia({
      video: { deviceId: { ideal: "default" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: { deviceId: { ideal: "default" }, echoCancellation: true, noiseSuppression: true }
    })
      .then(s => {
        s.getTracks().forEach(t => {
          t.enabled = true;
          t.onended = () => {
            setMediaError(`Default ${t.kind === "video" ? "Camera" : "Microphone"} disconnected. Click retry to reconnect.`);
          };
        });
        localStreamRef.current = s;
        setLocalStream(s);
        setMicMuted(false);
        setCameraOff(false);
        if (candidateVideoRef.current) {
          candidateVideoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        console.warn("Camera/Mic permission required:", err);
        setMediaError("Please allow Default Camera & Microphone access to continue.");
      });
  };

  useEffect(() => {
    sessionStorage.setItem("hireshield_active_session_id", interview.id);
    startDefaultMedia();
    return () => {
      sessionStorage.removeItem("hireshield_active_session_id");
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      setLocalStream(null);
    };
  }, [interview.id]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = micMuted; });
    }
    setMicMuted(!micMuted);
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = cameraOff; });
    }
    setCameraOff(!cameraOff);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
      } catch (err) {
        setIsScreenSharing(!isScreenSharing);
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !fileAttached) return;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: "candidate",
      senderName: candidateName,
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachmentName: fileAttached || undefined
    };

    setChats(prev => [...prev, newMsg]);
    setChatInput("");
    setFileAttached(null);

    // Simulate Interviewer response after 3 seconds
    setTimeout(() => {
      setChats(prev => [
        ...prev,
        {
          id: `chat-reply-${Date.now()}`,
          sender: "interviewer",
          senderName: interview.interviewerName,
          text: "Understood, feel free to write test assertions or diagram the message topology on the whiteboard.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 3000);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const confirmEnd = () => {
    onEndInterview({
      role: interview.roleTitle,
      candidateName,
      trustScore,
      malpracticeEvents,
      durationMinutes: Math.round((45 * 60 - secondsRemaining) / 60)
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] max-w-7xl mx-auto space-y-3">
      {/* Top Session Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1">
              REC • LIVE SESSION
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-700" />

          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[220px] sm:max-w-xs">
              {interview.roleTitle}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Interviewer: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{interview.interviewerName}</span>
            </p>
          </div>
        </div>

        {/* Timer & Network Quality */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-bold text-slate-800 dark:text-white">{formatTimer(secondsRemaining)}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
            <Wifi className="h-3 w-3" />
            <span>{networkQuality} (5.2 Mbps)</span>
          </div>

          <button
            id="end-interview-btn"
            onClick={() => setShowExitConfirm(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">End Interview</span>
          </button>
        </div>
      </div>

      {/* Live Proctoring Warning Toast (Visible across all tabs) */}
      <AnimatePresence>
        {liveWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center justify-between shadow-lg shadow-rose-600/30"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 animate-bounce" />
              <span>PROCTORING ALERT: {liveWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setLiveWarning(null)}
              className="text-[10px] font-mono bg-rose-800 px-2 py-0.5 rounded cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Split Grid: Left Videos, Right Multi-tool Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Side: Video Grid (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto">
          {/* 1. Interviewer Stream (Simulated Live WebRTC Tile) */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-700/80 overflow-hidden shadow-sm flex items-center justify-center">
            {/* Interviewer Avatar / Feed */}
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                MV
              </div>
              <div>
                <p className="text-xs font-bold text-white">{interview.interviewerName}</p>
                <p className="text-[10px] text-indigo-300 font-mono">Staff Engineering Lead</p>
              </div>
            </div>

            {/* Speaking Audio Waveform Indicator */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-700">
              <span className="h-2 w-0.5 bg-emerald-400 animate-pulse" />
              <span className="h-3 w-0.5 bg-emerald-400 animate-pulse delay-75" />
              <span className="h-1.5 w-0.5 bg-emerald-400 animate-pulse delay-150" />
              <span className="text-[9px] font-mono text-emerald-400 ml-1">AUDIO ACTIVE</span>
            </div>

            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-slate-300 border border-slate-700">
              HOST
            </div>
          </div>

          {/* 2. Candidate Stream (Local Webcam with HUD overlay) */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-700/80 overflow-hidden shadow-sm flex items-center justify-center">
            <video
              ref={candidateVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover mirror ${cameraOff ? "hidden" : "block"}`}
            />

            {mediaError && !cameraOff && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center space-y-2.5 z-10">
                <AlertCircle className="h-7 w-7 text-amber-400" />
                <p className="text-xs text-slate-200 max-w-xs">{mediaError}</p>
                <button
                  type="button"
                  onClick={startDefaultMedia}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Enable Camera &amp; Mic
                </button>
              </div>
            )}

            {cameraOff && (
              <div className="text-center space-y-2">
                <div className="h-14 w-14 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xl flex items-center justify-center mx-auto">
                  {candidateName.split(" ").map(w => w[0]).join("")}
                </div>
                <span className="text-xs text-slate-400">Camera Paused</span>
              </div>
            )}

            {/* Candidate label & AI status */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-mono text-white flex items-center gap-1.5 border border-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {candidateName} (You)
            </div>

            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Trust: {trustScore}%</span>
            </div>

            {handRaised && (
              <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 shadow-md animate-bounce">
                <Hand className="h-3 w-3" /> Hand Raised
              </div>
            )}
          </div>

          {/* Video Stream Controls Ribbon */}
          <div className="flex items-center justify-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <button
              onClick={toggleMic}
              className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${micMuted
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                }`}
              title={micMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <button
              onClick={toggleCamera}
              className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${cameraOff
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                }`}
              title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {cameraOff ? <VideoOff className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${isScreenSharing
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                }`}
              title="Share Screen"
            >
              <Monitor className="h-4 w-4" />
            </button>

            <button
              onClick={() => setHandRaised(!handRaised)}
              className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${handRaised
                ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                }`}
              title="Raise Hand"
            >
              <Hand className="h-4 w-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs cursor-pointer transition-all"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Right Side: Multi-Tool Workspace (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Workspace Tab Switcher */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveWorkspaceTab("coding")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeWorkspaceTab === "coding"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Coding Editor</span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab("whiteboard")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeWorkspaceTab === "whiteboard"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>Whiteboard</span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab("chat")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${activeWorkspaceTab === "chat"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Live Chat</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </button>

              <button
                onClick={() => setActiveWorkspaceTab("ai_hud")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeWorkspaceTab === "ai_hud"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>AI Proctor HUD</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              Sync: <strong className="text-emerald-500">REALTIME P2P</strong>
            </span>
          </div>

          {/* Active Workspace Content Area */}
          <div className="flex-1 min-h-0 p-3 overflow-hidden">
            {activeWorkspaceTab === "coding" && (
              <CodingEditor />
            )}

            {activeWorkspaceTab === "whiteboard" && (
              <WhiteboardCanvas />
            )}

            {activeWorkspaceTab === "chat" && (
              <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Chat Message Stream */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {chats.map((c) => (
                    <div
                      key={c.id}
                      className={`flex flex-col ${c.sender === "candidate" ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mb-1">
                        <span className="font-bold text-slate-600 dark:text-slate-300">{c.senderName || c.sender}</span>
                        <span>• {c.timestamp}</span>
                      </div>
                      <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${c.sender === "candidate"
                        ? "bg-indigo-600 text-white rounded-br-none shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-xs"
                        }`}>
                        {c.text}
                        {c.attachmentName && (
                          <div className="mt-2 p-1.5 bg-black/20 rounded-lg text-[10px] font-mono flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            <span>Attachment: {c.attachmentName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <label className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    <Paperclip className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFileAttached(file.name);
                      }}
                    />
                  </label>

                  {fileAttached && (
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded font-mono truncate max-w-[120px]">
                      {fileAttached}
                    </span>
                  )}

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message your interviewer..."
                    className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            <div className={activeWorkspaceTab === "ai_hud" ? "h-full overflow-y-auto space-y-4" : "hidden"}>
              <AIProctoringHUD
                streamActive={!cameraOff}
                videoRef={candidateVideoRef}
                audioStream={localStream}
                sessionId={interview.id}
                elapsedSeconds={45 * 60 - secondsRemaining}
                trustScore={trustScore}
                onTrustScoreChange={(newScore) => setTrustScore(newScore)}
                onMalpracticeAlert={(alert) => {
                  setMalpracticeEvents(prev => [alert, ...prev]);
                  setLiveWarning(alert.description);
                  setTimeout(() => setLiveWarning(null), 5000);
                }}
              />

              {activeWorkspaceTab === "ai_hud" && (
                /* Malpractice Timeline */
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-500" /> Proctor Event Log (Audit Trail)
                  </h4>

                  {malpracticeEvents.length > 0 ? (
                    <div className="space-y-2">
                      {malpracticeEvents.map((evt) => (
                        <div key={evt.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{evt.description}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{evt.timestamp}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold uppercase">
                            {evt.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs font-sans">
                      No security anomalies recorded. Integrity index is optimal at {trustScore}%.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-center"
            >
              <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <PhoneOff className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Conclude Live Assessment?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ending the interview will seal your code submissions, whiteboard drawings, and proctoring telemetry. An AI Evaluation Scorecard will be automatically generated.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Stay in Session
                </button>
                <button
                  id="confirm-end-interview-btn"
                  onClick={confirmEnd}
                  className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-md"
                >
                  Yes, Conclude & Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
