/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, Mic, AlertTriangle, Monitor, Shield, CheckCircle2, 
  Play, Square, Sparkles, Send, Award, Clock, ArrowRight, Video,
  BrainCircuit, UserCheck, HelpCircle, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JobPosition, InterviewSession, SuspiciousActivity } from "../types";
import { 
  fetchPositions, 
  createInterviewSession, 
  logSuspiciousActivity, 
  submitEvaluation, 
  fetchChats, 
  addChatMessage 
} from "../supabaseClient";

interface CandidateAppProps {
  onBackToPortal: () => void;
}

export default function CandidateApp({ onBackToPortal }: CandidateAppProps) {
  // Application states
  const [step, setStep] = useState<"register" | "permissions" | "instructions" | "room" | "sending" | "result">("register");
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [selectedPosId, setSelectedPosId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<InterviewSession | null>(null);

  // Media & Recording
  const [cameraActive, setCameraActive] = useState(false);
  const [micLevel, setMicLevel] = useState(50);
  const [isRecording, setIsRecording] = useState(false);
  const [answerDraft, setAnswerDraft] = useState("");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Dynamic timing standards
  const getPerQuestionMinutes = (difficulty: string): number => {
    switch (difficulty) {
      case "Junior": return 2;
      case "Intermediate": return 3;
      case "Senior": return 4;
      case "Lead": return 5;
      default: return 3;
    }
  };

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [explainSyncMode, setExplainSyncMode] = useState(false);
  
  // Real media recorder
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Proctoring States
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [lockdownActive, setLockdownActive] = useState(false);
  const [gazeStatus, setGazeStatus] = useState<"Center" | "Looking Away" | "Analyzing">("Center");
  const [confidenceFeedback, setConfidenceFeedback] = useState<string>("Initializing analytical tracking...");
  const [liveConfidenceScore, setLiveConfidenceScore] = useState(85);

  // Results Report
  const [aiReport, setAiReport] = useState<any>(null);

  // Real-time Support Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [chatEmergencyActive, setChatEmergencyActive] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const pollChats = () => {
    if (!session) return;
    fetchChats(session.id)
      .then(data => {
        if (data.chats) {
          setChats(data.chats);
        }
        if (typeof data.supportEmergencyActive === "boolean") {
          setChatEmergencyActive(data.supportEmergencyActive);
        }
      })
      .catch(err => console.error("Error polling chats:", err));
  };

  useEffect(() => {
    if (step !== "room" || !session) return;
    pollChats();
    const interval = setInterval(pollChats, 3000);
    return () => clearInterval(interval);
  }, [step, session]);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, chatOpen]);

  const sendChatMessage = (textToSubmit?: string, isEmergency: boolean = false) => {
    if (!session) return;
    const cleanText = textToSubmit !== undefined ? textToSubmit : chatMessageInput.trim();
    if (!cleanText) return;

    setIsSendingMessage(true);
    addChatMessage(session.id, "candidate", cleanText, isEmergency)
      .then(msg => {
        setIsSendingMessage(false);
        if (textToSubmit === undefined) {
          setChatMessageInput("");
        }
        setChats(prev => [...prev, msg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(err => {
        setIsSendingMessage(false);
        console.error("Error sending support chat:", err);
      });
  };

  const triggerEmergencySignal = () => {
    if (!session) return;
    const signalState = !chatEmergencyActive;
    const emergencyText = signalState 
      ? "🚨 URGENT TECHNICAL EMERGENCY DETECTED: Candidate flagged a high-priority technical emergency (e.g. system slowdown or video freezing)!" 
      : "✅ Technical emergency resolved. Candidate restored normal assessment pacing.";
    
    addChatMessage(session.id, "candidate", emergencyText, signalState)
      .then(msg => {
        setChatEmergencyActive(signalState);
        setChats(prev => [...prev, msg]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(err => console.error("Error toggling emergency signal:", err));
  };

  // Load Positions on start
  useEffect(() => {
    fetchPositions()
      .then(data => {
        setPositions(data);
        if (data.length > 0) setSelectedPosId(data[0].id);
      })
      .catch(err => console.error("Error loading positions from Supabase/API", err));
  }, []);

  // Timer logic for answers
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => {
          // Dynamic confidence simulation during recording
          if (prev % 5 === 0) {
            const range = Math.random() > 0.5 ? 5 : -5;
            setLiveConfidenceScore(c => Math.min(100, Math.max(50, c + range)));
          }
          return prev + 1;
        });
      } , 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Tab focus monitor (Primary security proctoring feature)
  useEffect(() => {
    if (step !== "room" || !session) return;

    const handleBlur = () => {
      // Log event to backend
      const desc = "Candidate switched window focus or exited active proctoring lockdown.";
      logSuspiciousEvent("focus_lost", desc, "high");
      setWarningMessage("ALERT: System detected window focus loss! All actions are logged in the Recruiter Scorecard.");
      setTimeout(() => setWarningMessage(null), 5000);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const desc = "Candidate switched browser tabs to access background resources.";
        logSuspiciousEvent("tab_switch", desc, "high");
        setWarningMessage("CRITICAL ERROR: Unauthorized browser tab switch captured! Cheating metrics initialized.");
        setTimeout(() => setWarningMessage(null), 5000);
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [step, session]);

  // Gaze Simulation Loop
  useEffect(() => {
    if (step !== "room") return;
    const gazeInterval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.15) {
        setGazeStatus("Looking Away");
        setConfidenceFeedback("Unbalanced facial orientation flag.");
        // Randomly log occasional eye tracking anomalies
        if (Math.random() > 0.6) {
          logSuspiciousEvent("reading_behavior", "Candidate displays structural eye movement patterns indicative of reading script source.", "medium");
        }
      } else {
        setGazeStatus("Center");
        setConfidenceFeedback("Subject maintaining stable camera eye align.");
      }
    }, 8000);

    return () => clearInterval(gazeInterval);
  }, [step]);

  // Access Webcam & Mic
  useEffect(() => {
    if ((step === "permissions" || step === "room") && !cameraActive) {
      startWebcam();
    }
  }, [step]);

  const startWebcam = async () => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      // Simulate mic audio bars
      const audioInterval = setInterval(() => {
        setMicLevel(Math.floor(Math.random() * 40) + 30);
      }, 300);
      return () => clearInterval(audioInterval);
    } catch (err) {
      console.warn("Real webcam permission blocked. Launching premium virtual emulator.", err);
      setCameraActive(true);
    }
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      setMediaStream(null);
    }
    setCameraActive(false);
  };

  // Log automated events
  const logSuspiciousEvent = (type: string, description: string, severity: "low" | "medium" | "high") => {
    if (!session) return;
    logSuspiciousActivity(session.id, type, description, severity, secondsElapsed)
      .then(activity => {
        if (activity && session) {
          setSession(prev => prev ? {
            ...prev,
            suspiciousActivities: [...prev.suspiciousActivities, activity]
          } : null);
        }
      })
      .catch(err => console.error("Event log failure", err));
  };

  const handleExitPortal = () => {
    stopWebcam();
    onBackToPortal();
  };

  // Continuous loop for interview timer limit
  useEffect(() => {
    let timer: any;
    if (step === "room" && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmitTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timeRemaining]);

  const handleAutoSubmitTimeOut = () => {
    setIsRecording(false);
    setWarningMessage("TIME LIMIT EXPIRED: Compiling assessment and executing security scorecard submission... Please wait.");
    setTimeout(() => {
      setWarningMessage(null);
      handleForceSubmitOnExit();
    }, 3000);
  };

  // End interview early options
  const handleForceSubmitOnExit = () => {
    if (!session || !currentJob) return;

    // Build completed responses array, filling unanswered questions with default text
    const tempResponses = [...session.responses];
    
    // Save current active draft if exists
    if (answerDraft || isRecording) {
      const activeText = answerDraft || "Completing speech transcript using proctor monitoring speech-to-text algorithm representation.";
      tempResponses.push({
        questionIndex: session.currentQuestionIndex,
        questionText: currentQuestionText,
        answerText: activeText,
        durationSeconds: secondsElapsed || 30,
        transcriptText: `Simulated speech transcript completed dynamically before early exit for: "${currentQuestionText}".`
      });
    }

    // Fill the rest of the questions as skipped
    for (let i = tempResponses.length; i < currentJob.questionBank.length; i++) {
      tempResponses.push({
        questionIndex: i,
        questionText: currentJob.questionBank[i],
        answerText: "[Candidate chose to end the technical interview early. Remaining questions skipped.]",
        durationSeconds: 0,
        transcriptText: "[Questions skipped -- interview terminated early by candidate choice]"
      });
    }

    setStep("sending");
    stopWebcam();
    setShowExitDialog(false);

    submitEvaluation(session.id, tempResponses)
      .then(data => {
        if (data.success && data.report) {
          setAiReport(data.report);
          setStep("result");
        } else {
          alert("Error in generating real AI scorecard. Please check server.");
        }
      })
      .catch(err => {
        console.error("Submission failed", err);
        alert("Submission failed. Returning to portal...");
        onBackToPortal();
      });
  };

  const handleAbortAndDestruct = () => {
    // Completely abort
    stopWebcam();
    setShowExitDialog(false);
    onBackToPortal();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedPosId) return;

    createInterviewSession(name, email, selectedPosId)
      .then(data => {
        setSession(data);
        setStep("permissions");
        startWebcam();
      })
      .catch(err => console.error("Error creating registration session", err));
  };

  const handleConfirmPermissions = () => {
    setLockdownActive(true);
    setStep("instructions");
  };

  const handleStartInterview = () => {
    setStep("room");
    setSecondsElapsed(0);
    setAnswerDraft("");
    
    // Set continuous countdown time bounds
    const targetJob = positions.find(p => p.id === session?.jobId);
    if (targetJob) {
      const perQuestionMinutes = getPerQuestionMinutes(targetJob.difficulty);
      const totalAllocatedSeconds = targetJob.questionBank.length * perQuestionMinutes * 60;
      setTimeRemaining(totalAllocatedSeconds);
    } else {
      setTimeRemaining(600); // Default 10 minutes fallback
    }
  };

  const currentJob = positions.find(p => p.id === session?.jobId);
  const currentQuestionText = currentJob && session ? currentJob.questionBank[session.currentQuestionIndex] : "";

  const handleTriggerRecording = () => {
    if (isRecording) {
      // Stop
      setIsRecording(false);
    } else {
      // Start
      setIsRecording(true);
      setSecondsElapsed(0);
      setAnswerDraft("");
    }
  };

  const handleNextQuestion = () => {
    if (!session || !currentJob) return;

    // Save active response
    const transcriptTextSimulation = answerDraft || `Simulated verified speech transcript for: "${currentQuestionText}". The candidate spoke confidently regarding their design principles, addressing latency and caching layers in detail.`;
    
    const newResponse = {
      questionIndex: session.currentQuestionIndex,
      questionText: currentQuestionText,
      answerText: answerDraft || "Completing speech transcript using proctor monitoring speech-to-text algorithm representation.",
      durationSeconds: secondsElapsed || 45,
      transcriptText: transcriptTextSimulation
    };

    const updatedResponses = [...session.responses, newResponse];
    const isLast = session.currentQuestionIndex >= currentJob.questionBank.length - 1;

    if (isLast) {
      // Submit everything to full AI evaluator endpoint
      setStep("sending");
      stopWebcam();
      
      submitEvaluation(session.id, updatedResponses)
        .then(data => {
          if (data.success && data.report) {
            setAiReport(data.report);
            setStep("result");
          } else {
            alert("Error in generating real AI scorecard. Please check server.");
          }
        })
        .catch(err => {
          console.error("Submission failed", err);
          alert("Submission and Evaluation failed. Check server log.");
        });

    } else {
      // Update session locally and proceed
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1,
        responses: updatedResponses
      });
      setAnswerDraft("");
      setSecondsElapsed(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Dynamic Security Warnings Banner */}
      <AnimatePresence>
        {warningMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-50 p-4 bg-red-950/90 border border-cyber-danger rounded-xl flex items-center gap-3 cyber-glow-danger text-sm text-red-200"
          >
            <AlertTriangle className="text-cyber-danger h-5 w-5 shrink-0 animate-bounce" />
            <div>
              <span className="font-bold uppercase tracking-wide mr-1">[Proctor Alert]</span>
              {warningMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Shield className="text-cyber-primary h-8 w-8" />
          <div>
            <h1 className="text-2xl font-heading font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
              hire AI
            </h1>
            <p className="text-xs text-slate-550 font-mono text-[10px]">VERIFIED CANDIDATE LANDING SANDBOX • UTC: 2026</p>
          </div>
        </div>
        <button 
          onClick={handleExitPortal}
          className="text-xs font-mono text-slate-605 text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded bg-white border border-slate-200 shadow-sm transition-all cursor-pointer font-bold"
        >
          ← Return Switch
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === "register" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-indigo-500/10 to-emerald-500/0 blur-2xl rounded-full" />
            
            <div className="mb-6">
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs font-medium">
                Stage 1: Identity & Role Initialization
              </span>
              <h2 className="text-xl font-heading font-medium text-slate-800 mt-3">Welcome to your secure interview room</h2>
              <p className="text-sm text-slate-600 mt-1">
                Please complete registration. Our automated proctoring lockdown environment starts on verification confirmation.
              </p>
            </div>

             <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="sarah.jenkins@enterprise-recruit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Target Job Opportunity</label>
                <select 
                  value={selectedPosId}
                  onChange={(e) => setSelectedPosId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                >
                  {positions.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.department})</option>
                  ))}
                </select>
              </div>

              {/* Dynamically Calibrated Interview Timings based on Difficulty + Number of Questions */}
              {(() => {
                const selectedJobObj = positions.find(p => p.id === selectedPosId);
                if (!selectedJobObj) return null;
                const minPerQ = getPerQuestionMinutes(selectedJobObj.difficulty);
                const qCount = selectedJobObj.questionBank.length;
                const totalMinutes = qCount * minPerQ;
                
                return (
                  <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-900 block flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-indigo-600 animate-pulse" />
                        Dynamic Assessment Timer Settings:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[9px] font-extrabold uppercase tracking-wider">
                        {selectedJobObj.difficulty} Difficulty
                      </span>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed font-sans">
                      This job is classified as <strong className="text-slate-800">{selectedJobObj.difficulty} difficulty</strong>. The system allocates <strong className="text-indigo-700 font-semibold">{minPerQ} minutes</strong> per question for a total of <strong className="text-indigo-700 font-semibold">{qCount} comprehensive questions</strong>:
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold bg-white text-indigo-950 p-2 border border-indigo-100 rounded-lg shadow-xs">
                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                      CALIBRATED COUNTDOWN LIMIT: {totalMinutes} Minutes (Strict proctor auto-submit enabled)
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-medium text-sm py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 font-heading cursor-pointer shadow-md"
                >
                  Acknowledge Sandbox Rules & Proceed <ArrowRight className="h-4 w-4 animate-pulse" />
                </button>
              </div>
            </form>

            {/* Explaining Core Alignment Concept: "How is Candidate and Recruiter page Same?" */}
            <div className="mt-6 border-t border-slate-200/60 pt-4">
              <button
                type="button"
                onClick={() => setExplainSyncMode(!explainSyncMode)}
                className="text-[10px] font-mono hover:text-indigo-700 text-indigo-600 flex items-center gap-1.5 uppercase tracking-wider font-extrabold focus:outline-none cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {explainSyncMode ? "Hide Sandbox Integration Details" : "How does the Candidate page sync with the Recruiter view?"}
              </button>
              
              <AnimatePresence>
                {explainSyncMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 text-xs text-slate-600 space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 leading-relaxed overflow-hidden"
                  >
                    <p className="font-sans">
                      🌟 <strong>Unified Real-time Cohesive Core:</strong> Both the Candidate Chamber and the Recruiter Control Panel connect directly to the same underlying schema:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 font-sans">
                      <li>
                        <strong>Same Backend Registry:</strong> Both pages read/write and share the identical session history file (<code>server_db.json</code>).
                      </li>
                      <li>
                        <strong>Real-time Telemetry:</strong> When you trigger window blur or look away here, it instantly adds events to the session. The Recruiter Dashboard queries these records in real time, so you can test and preview side-by-side!
                      </li>
                      <li>
                        <strong>Identical Proctoring standards:</strong> The suspicious activity rules, risk score calculations, and transcripts are computed identically on both screens for transparent compliance.
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {step === "permissions" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-6 md:p-8 space-y-6"
          >
            <div className="text-center max-w-lg mx-auto">
              <Shield className="h-12 w-12 text-indigo-600 mx-auto mb-3 animate-pulse" />
              <h2 className="text-xl font-heading font-medium text-slate-800">System Diagnostic check requested</h2>
              <p className="text-sm text-slate-600 mt-2">
                This enterprise assessment requests live camera and mic feeds to compute look-away deviations and verify identity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Video Integration Feed</h3>
                  <p className="text-xs text-slate-500 mt-1">Captures facial posture alignment. We do not store raw frames permanently.</p>
                  <span className="text-xs text-emerald-600 font-mono mt-2 block flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Activated successfully
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Microphone Input Waveform</h3>
                  <p className="text-xs text-slate-500 mt-1">Transcribes voice content dynamically and identifies speaking continuity indicators.</p>
                  <div className="w-full bg-slate-200 h-2 rounded mt-3 relative overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${micLevel}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {cameraActive && (
              <div className="max-w-xs mx-auto rounded-xl overflow-hidden aspect-video relative border border-indigo-500/30 bg-slate-950">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur border border-emerald-500/30 text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Real Live Camera Connected
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirmPermissions}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 font-heading"
              >
                Launch Integrity Lockdown room <Shield className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "instructions" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-6 md:p-8 space-y-6"
          >
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex gap-3 shadow-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
              <div>
                <p className="font-semibold text-amber-700">IMPORTANT RECRUITING COMPLIANCE TERMS</p>
                <p className="text-slate-650 text-slate-600 text-xs mt-1">
                  This system contains active security proctors. Any attempts to switch tabs, click away, open menus, copy/paste solutions from tools like ChatGPT, or load secondary displays will be registered instantly in the final AI Executive report.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest">Active Integrity Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 shadow-sm">
                  <span className="font-bold text-slate-800 block mb-1">Tab switching lockdown</span>
                  Detects and acts on page hiding and visibility focus changes.
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 shadow-sm">
                  <span className="font-bold text-slate-800 block mb-1">Look away eyes monitor</span>
                  Monitors continuous face posture orientation values dynamically.
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 shadow-sm">
                  <span className="font-bold text-slate-800 block mb-1">Confidence Speech Analysis</span>
                  Estimates filler vocal density rates alongside vocabulary metrics.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                onClick={handleStartInterview}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-heading text-sm font-medium transition-all inline-flex items-center gap-2 cyber-glow"
              >
                Iniciate Technical Assessment Now <ArrowRight className="h-4 w-4 animate-bounce-x" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "room" && session && currentJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Side: Question, Audio transcript */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 justify-between text-xs font-mono text-slate-500 border-b border-slate-100 pb-3 mb-1">
                  <span className="text-indigo-600 font-bold">QUESTION {session.currentQuestionIndex + 1} OF {currentJob.questionBank.length}</span>
                  <div className="flex flex-col sm:items-end gap-1">
                    <div className="flex items-center gap-1.5 text-slate-650 text-slate-650 text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-indigo-505 text-indigo-500" />
                      <span>Elapsed in Q: <strong>{Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, "0")}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold animate-pulse">
                      <Clock className="h-3.5 w-3.5 text-rose-500" />
                      <span>Interview remaining: <strong>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-heading font-semibold text-slate-900 leading-snug">
                    {currentQuestionText}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Target metrics: High architecture density, clear complexity tradeoff formulation.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest">
                      Live Response Keyboard Input & Workspace
                    </label>
                    <span className="text-[10px] text-indigo-600 font-mono flex items-center gap-1">
                      <Sparkles className="h-3 w-3 animate-spin" /> Speech-To-Text simulator active
                    </span>
                  </div>

                  <textarea
                    value={answerDraft}
                    onChange={(e) => setAnswerDraft(e.target.value)}
                    placeholder="Provide your complete architectural or technical reasoning here. You can also toggle recording above to simulate Whisper Speech-To-Text output."
                    rows={6}
                    className="w-full bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans transition-all resize-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowExitDialog(true)}
                    className="px-3.5 py-2 font-mono text-xs font-bold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 justify-center"
                    title="Stop camera and terminate the active technical session immediately"
                  >
                    ⚠ End Technical Interview
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    disabled={!answerDraft && !isRecording}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-md justify-center font-bold"
                  >
                    {session.currentQuestionIndex >= currentJob.questionBank.length - 1 ? "Submit Full Appraisal" : "Save & Proceed to next"} 
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side: Proctored Webcam feeds */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card rounded-2xl p-4 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500 animate-pulse" />
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-cyber-danger" />
                    LIVE INTEGRITY MONITOR
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-red-950/50 border border-red-500/20 text-[9px] text-red-400 font-mono">
                    PROCTOR VERIFIED
                  </span>
                </div>

                {/* Webcam Box */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  
                  {/* analytical overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs font-mono flex flex-col gap-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Face Tracking:</span>
                      <span className={gazeStatus === "Center" ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {gazeStatus === "Center" ? "● Focus Registered" : "⚠ Eye Gaze Off-center"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Speaking Activity:</span>
                      <span className={isRecording ? "text-indigo-400 font-bold" : "text-slate-500"}>
                        {isRecording ? "● Transcription Stream" : "Vocal Line Silent"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Proctor Tracker Stats */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Speech confidence estimate:</span>
                    <span className="text-indigo-600 font-bold">{liveConfidenceScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full transition-all" style={{ width: `${liveConfidenceScore}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-start gap-1">
                    <BrainCircuit className="h-3 w-3 text-sky-500 shrink-0 mt-0.5" />
                    <span>{confidenceFeedback}</span>
                  </div>
                </div>

                {/* Audio Recording Controls */}
                <div className="pt-2 border-t border-slate-200">
                  <button
                    onClick={handleTriggerRecording}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isRecording 
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                        : "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="h-4 w-4 fill-white" /> Stop Voice Streaming Capture
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-white animate-ping" /> Activate Voice Transcription
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Integrity Shield widget */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600 shadow-sm">
                <Shield className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">Continuous Proctor Logs</p>
                  <p className="text-[10px] text-slate-500">
                    Proctoring secure engine automatically records tab counts, mouse loss deviations, client-side integrity metrics, and network continuity limits.
                  </p>
                </div>
              </div>

              {/* Real-time Support Chat & signaling Widget */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                <button
                  type="button"
                  onClick={() => setChatOpen(!chatOpen)}
                  className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                    </span>
                    <span className="text-xs font-heading font-extrabold text-slate-800 uppercase tracking-wider group-hover:text-indigo-650 transition-colors">
                      Live Support Chat & Emergency Help
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase transition-all px-2 py-0.5 rounded bg-slate-100 ${
                    chatOpen ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:text-indigo-600"
                  }`}>
                    {chatOpen ? "Hide Panel ▴" : `Show Panel ▾`}
                  </span>
                </button>

                {/* Emergency Signalling Ribbon */}
                <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                  chatEmergencyActive
                    ? "bg-rose-50 border-rose-200 text-rose-800 shadow-[0_0_12px_rgba(244,63,94,0.15)] animate-pulse"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <div className="flex gap-2 items-center">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      chatEmergencyActive ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-500"
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="text-[11px] block text-slate-800">
                        {chatEmergencyActive ? "🚨 EMERGENCY TRIGGER ACTIVE" : "Technical Emergency Support"}
                      </strong>
                      <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                        {chatEmergencyActive ? "HR/Recruiters are signaled & alerted" : "Facing issues? Signal HR instantly below"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={triggerEmergencySignal}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-wider font-extrabold cursor-pointer transition-all shrink-0 ${
                      chatEmergencyActive
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                        : "bg-rose-600 hover:bg-rose-500 text-white shadow-sm hover:scale-[1.03]"
                    }`}
                  >
                    {chatEmergencyActive ? "Resolve" : "Signal HR 🚨"}
                  </button>
                </div>

                {chatOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3 pt-2 border-t border-slate-100"
                  >
                    {/* Chat Bubble Scroll Container */}
                    <div className="h-44 overflow-y-auto border border-slate-100 bg-slate-50/50 rounded-xl p-3 space-y-2.5 flex flex-col scrollbar-thin">
                      {chats.length === 0 ? (
                        <div className="my-auto text-center space-y-1">
                          <p className="text-[10px] font-mono text-slate-400">Secure Live Connection Established</p>
                          <p className="text-[11px] font-sans text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                            Need help with screen share, camera freezing, or system timers? Type below.
                          </p>
                        </div>
                      ) : (
                        chats.map((ch: any) => {
                          const isMe = ch.sender === "candidate";
                          return (
                            <div
                              key={ch.id}
                              className={`flex flex-col max-w-[85%] ${
                                isMe ? "self-end items-end" : "self-start items-start"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[8px] font-mono text-slate-400">
                                  {isMe ? "You" : "HR Support"}
                                </span>
                                <span className="text-[7px] text-slate-300">
                                  {new Date(ch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className={`p-2 py-1.5 rounded-xl text-xs leading-normal ${
                                ch.isTechnicalEmergency
                                  ? "bg-rose-100 text-rose-900 border border-rose-200"
                                  : isMe
                                  ? "bg-indigo-600 text-white rounded-tr-none"
                                  : "bg-slate-200 text-slate-800 rounded-tl-none"
                              }`}>
                                {ch.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Quick Helper Pre-populated Suggestions */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[8px] text-slate-400 font-mono tracking-wider items-center flex uppercase">Quick help:</span>
                      {[
                        "Camera Frozen",
                        "Audio/Mic Issue",
                        "Lagging UI",
                        "Time Issue"
                      ].map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            sendChatMessage(`[Automated Inquiry] Candidate is reporting a: "${label}" issue. Please advise.`, false);
                          }}
                          className="px-2 py-0.5 rounded border border-slate-200 text-[9px] font-sans hover:border-indigo-600 hover:bg-indigo-50/50 hover:text-indigo-600 font-medium transition-all cursor-pointer"
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input Bar */}
                    <div className="flex gap-2 relative">
                      <input
                        type="text"
                        value={chatMessageInput}
                        onChange={(e) => setChatMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                        placeholder="Ask HR team for help..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => sendChatMessage()}
                        disabled={isSendingMessage || !chatMessageInput.trim()}
                        className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer disabled:opacity-40"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === "sending" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-8 text-center space-y-6 max-w-lg mx-auto"
          >
            <BrainCircuit className="h-16 w-16 text-indigo-600 mx-auto animate-spin" />
            
            <div className="space-y-2">
              <h2 className="text-xl font-heading font-bold text-slate-900">AI Scoring Engine engaged</h2>
              <p className="text-sm text-slate-600">
                hire AI is performing deep NLP semantic checks, examining technical relevance against enterprise rubrics, calculating confidence rating, and assessing proctoring flags...
              </p>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2 shadow-sm">
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>Analyzing answer key similarity...</span>
                <span className="text-indigo-600 font-bold">80% compliant</span>
              </div>
              <div className="w-full bg-slate-250 h-1.5 rounded-full overflow-hidden bg-slate-200">
                <div className="bg-indigo-600 h-full" style={{ width: "80%" }} />
              </div>
            </div>
          </motion.div>
        )}

        {step === "result" && aiReport && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header Scorecard summary */}
            <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-emerald-500/10 to-indigo-500/0 blur-2xl rounded-full" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono text-xs font-medium">
                    Assessment Completed Successfully
                  </span>
                  <h2 className="text-2xl font-heading font-bold text-slate-900 mt-3">Excellent work, {aiReport.candidateName}!</h2>
                  <p className="text-sm text-slate-500">{aiReport.jobTitle}</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
                  <BrainCircuit className="h-5 w-5 text-indigo-600" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block">SHORTLIST STATUS</span>
                    <span className={`text-sm font-heading font-bold ${
                      aiReport.shortlistStatus === "SHORTLISTED" ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {aiReport.shortlistStatus === "SHORTLISTED" ? "★ SHORTLISTED" : "★ STANDBY"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Dashboard Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Technical Score</span>
                  <span className="text-2xl font-heading font-bold text-slate-900 mt-1 block">{aiReport.technicalScore}%</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-mono">Semantic code match</span>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Communication</span>
                  <span className="text-2xl font-heading font-bold text-indigo-600 mt-1 block">{aiReport.communicationScore}%</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-mono">Coherence & fluency</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Confidence Level</span>
                  <span className="text-2xl font-heading font-bold text-sky-600 mt-1 block">{aiReport.confidenceScore}%</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-mono">Continuous delivery</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Integrity Risk</span>
                  <span className={`text-2xl font-heading font-bold mt-1 block ${
                    aiReport.suspicionScore > 40 ? "text-rose-600" : "text-emerald-600"
                  }`}>{aiReport.suspicionScore}%</span>
                  <span className="text-[9px] text-slate-500 block mt-1 font-mono">Cheating risk metrics</span>
                </div>
              </div>

              {/* Strengths & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
                <div className="space-y-3">
                  <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Key Strengths Identified
                  </h4>
                  <ul className="space-y-2">
                    {aiReport.qualitativeNotes?.strengths?.map((str: string, index: number) => (
                      <li key={index} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                  <h4 className="text-xs font-mono text-sky-600 uppercase tracking-widest flex items-center gap-1 font-semibold">
                    <UserCheck className="h-4 w-4 text-sky-600" /> AI Executive Recommendation
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {aiReport.qualitativeNotes?.overallRecommendation}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-200/60">
                    {aiReport.qualitativeNotes?.integritySummary}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleExitPortal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-8 py-3 rounded-lg font-heading transition-all cursor-pointer font-bold shadow-md"
              >
                Back to Simulation Selector Portal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Early Exit Confirmation Action Dialogue */}
      <AnimatePresence>
        {showExitDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitDialog(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-rose-100 space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 shrink-0">
                  <AlertTriangle className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-extrabold text-slate-900">
                    Terminate Ongoing Assessment?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-sans">
                    You have requested to end the interview before answering all questions. Video sharing will stop instantly. Choose your termination flow:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {/* Option A: Early submit */}
                <button
                  type="button"
                  onClick={handleForceSubmitOnExit}
                  className="p-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200 text-left rounded-xl transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-[9px] font-extrabold uppercase text-indigo-700 group-hover:text-indigo-100 block mb-1">
                      Option A (Recommended)
                    </span>
                    <strong className="text-xs text-slate-800 group-hover:text-white block">
                      Submit Early with AI Scorecard
                    </strong>
                    <p className="text-[10px] text-slate-505 group-hover:text-slate-200 mt-1 font-sans">
                      Compute report immediately based on response metrics answered so far. Recruiter will see partial scorecard.
                    </p>
                  </div>
                </button>

                {/* Option B: Complete Abort */}
                <button
                  type="button"
                  onClick={handleAbortAndDestruct}
                  className="p-3 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 text-left rounded-xl transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="font-mono text-[9px] font-extrabold uppercase text-rose-700 group-hover:text-rose-100 block mb-1">
                      Option B
                    </span>
                    <strong className="text-xs text-slate-800 group-hover:text-white block">
                      Abort completely & Skip logs
                    </strong>
                    <p className="text-[10px] text-slate-505 group-hover:text-slate-200 mt-1 font-sans">
                      Discard your active answers completely and exit to the selector portal. No scorecard will be sent.
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExitDialog(false)}
                  className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-600 hover:bg-slate-55 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel & Stay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
