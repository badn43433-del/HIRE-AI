import React, { useState } from "react";
import { 
  Settings, Bot, Shield, AlertOctagon, RotateCcw, Save, 
  Layers, Users, Sparkles, CheckCircle2, Video, Mic, Volume2, ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";

interface SettingsTabProps {
  proctorStrictness: "warning" | "strict" | "log_only";
  onChangeStrictness: (val: "warning" | "strict" | "log_only") => void;
  persona: "candidate" | "recruiter";
  onChangePersona: (p: "candidate" | "recruiter") => void;
  apiKeyStatus: boolean;
  onClearDB: () => void;
}

export default function SettingsTab({
  proctorStrictness,
  onChangeStrictness,
  persona,
  onChangePersona,
  apiKeyStatus,
  onClearDB
}: SettingsTabProps) {
  const [strictness, setStrictness] = useState(proctorStrictness);
  const [model, setModel] = useState("gemini-3.5-flash");
  const [weightTech, setWeightTech] = useState(50);
  const [weightComm, setWeightComm] = useState(30);
  const [weightInte, setWeightInte] = useState(20);
  const [isSaved, setIsSaved] = useState(false);
  const [cleared, setCleared] = useState(false);

  // Candidate Settings State
  const [camDevice, setCamDevice] = useState("default-cam");
  const [micDevice, setMicDevice] = useState("default-mic");
  const [soundTested, setSoundTested] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeStrictness(strictness);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDatabaseReset = () => {
    if (window.confirm("Are you sure you want to restore default mock candidates and purge all current test sessions?")) {
      onClearDB();
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    }
  };

  const playTestTone = () => {
    setSoundTested(true);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.value = 440; // A4 tone
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // keep it safe and low
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 500);
    } catch (e) {
      console.log("AudioContext blocked or not supported in iframe context");
    }
    setTimeout(() => setSoundTested(false), 2000);
  };

  // Candidate Mode specific settings layout
  if (persona === "candidate") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Block: Device Calibration inputs */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
              
              <div className="border-b border-slate-100 pb-3 mb-3">
                <h2 className="text-base font-heading font-extrabold text-slate-800 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                  Local Webcam & Audio Signal Calibration Settings
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Assure camera frame capture pipeline coordinates and sound levels are steady before technical interviews.
                </p>
              </div>

              {/* Webcam dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-indigo-500" /> Choose Bounding Camera Device
                </label>
                <select 
                  value={camDevice}
                  onChange={(e) => setCamDevice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-sans focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="default-cam">Default Integrated Facecam HD (1080p - Web capture)</option>
                  <option value="external-usb">External USB Pro Wide-Angle StreamCam (60fps)</option>
                  <option value="virtual-link">OBS Virt-Cam Virtual Link Simulator</option>
                </select>
                <span className="text-[9px] text-slate-400 block pl-1">
                  ✓ Active resolution: 1920x1080px calibrated. Frame classification active.
                </span>
              </div>

              {/* Microphone dropdown and audio test node */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Mic className="h-4 w-4 text-indigo-500" /> Setup Audio Input Signal
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <select 
                    value={micDevice}
                    onChange={(e) => setMicDevice(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 font-sans focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="default-mic">System Default Built-In Microphone Array</option>
                    <option value="studio-usb">Yeti USB Studio Condenser Input (Mono capture)</option>
                    <option value="headset-mic">Bluetooth Wireless Headset Handsfree microphone</option>
                  </select>

                  <button 
                    type="button"
                    onClick={playTestTone}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                  >
                    <Volume2 className="h-4 w-4 text-indigo-500" />
                    {soundTested ? "Outputting Tone..." : "Test Audio Output"}
                  </button>
                </div>
              </div>

              {/* Privacy agreement and data disclosure compliance */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                  Proctor Privacy Disclosures
                </label>
                <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="privacy-disclosure-check"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="h-4 w-4 accent-indigo-650 accent-indigo-600 mt-0.5"
                  />
                  <div className="space-y-1">
                    <label htmlFor="privacy-disclosure-check" className="text-xs font-bold text-slate-700 block cursor-pointer select-none">
                      hire Security & Media Consent
                    </label>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                      I agree to authorize the sandbox proctor frame classifier and page-visibility trackers to capture metrics feed. Frames are categorized locally inside sandbox state limits and are never broadcast outside secure assessor networks.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Block: Persona simulator switcher */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Diagnostics & Mode Switching</span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                You are currently running in Candidate room mode. To test the proctor reporting panels and full recruiter workflows, toggle below.
              </p>
              
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                <button
                  onClick={() => onChangePersona("candidate")}
                  className="flex-1 py-1.5 text-xs font-bold font-mono bg-indigo-600 text-white transition-all cursor-pointer"
                >
                  Candidate
                </button>
                <button
                  onClick={() => onChangePersona("recruiter")}
                  className="flex-1 py-1.5 text-xs font-bold font-mono bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Recruiter
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 space-y-2 text-xs leading-relaxed font-sans">
              <strong className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                Active Integrity Token Clean
              </strong>
              <p className="text-[10.5px] text-slate-650 text-slate-600">
                Your environment signature is fully valid. No focus anomalies or browser tab blur exceptions are marked on this session. Proceed to launch assessments confidently!
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column Settings Selection navigation */}
        <div className="md:col-span-2 space-y-4">
          <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 mb-3">
              <h2 className="text-base font-heading font-bold text-slate-800">Global Proctoring & AI Evaluation Profile</h2>
              <p className="text-xs text-slate-500">Fine-tune evaluation algorithms, model guidelines, and system boundaries.</p>
            </div>

            {/* Model options */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Bot className="h-3.5 w-3.5 text-indigo-500" /> Evaluation Model Selection
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => setModel("gemini-3.5-flash")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    model === "gemini-3.5-flash" 
                      ? "border-indigo-500 bg-indigo-50/30 text-indigo-900" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-xs font-bold block">Gemini 3.5 Flash (Recommended)</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Ultra-fast structured evaluation with deep architectural reasoning.</span>
                </div>

                <div 
                  onClick={() => setModel("gemini-3.5-pro")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    model === "gemini-3.5-pro" 
                      ? "border-indigo-500 bg-indigo-50/30 text-indigo-900" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-xs font-bold block">Gemini 3.5 Pro</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Maximum quality multi-agent analysis for Lead/Executive assessments.</span>
                </div>
              </div>
            </div>

            {/* Strictness selector options */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-indigo-500" /> Proctoring Sandbox Strictness
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => setStrictness("log_only")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    strictness === "log_only" 
                      ? "border-indigo-500 bg-indigo-50/30 text-indigo-900" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-xs font-bold block">Log Only</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Gathers focus-switch data without bothering the candidate.</span>
                </div>

                <div 
                  onClick={() => setStrictness("warning")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    strictness === "warning" 
                      ? "border-indigo-500 bg-indigo-50/30 text-indigo-950" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-xs font-bold block">Soft Warnings</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Alerts the candidate of focus losses instantly inside a red pop-up block.</span>
                </div>

                <div 
                  onClick={() => setStrictness("strict")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    strictness === "strict" 
                      ? "border-rose-500 bg-rose-50/20 text-rose-950" 
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-xs font-bold block text-rose-600">Immediate Lockdown</span>
                  <span className="text-[10px] text-slate-505 text-slate-500 block mt-1">Instantly locks out candidate or flags a severe failure upon focus loss.</span>
                </div>
              </div>
            </div>

            {/* Scorecard Weights slider */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                AI Appraisal Metric Allocation Weighted Map (Must sum to 100%)
              </label>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-xs text-slate-600">
                    <span>Technical correctness factor:</span>
                    <span className="font-bold text-slate-800">{weightTech}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightTech} 
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setWeightTech(v);
                      // Adjust others gracefully
                      const rem = 100 - v;
                      setWeightComm(Math.round(rem * 0.6));
                      setWeightInte(Math.round(rem * 0.4));
                    }}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-205 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-xs text-slate-600">
                    <span>Fluency & communication factor:</span>
                    <span className="font-bold text-slate-800">{weightComm}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={weightComm} 
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setWeightComm(v);
                      const rem = 100 - v;
                      setWeightTech(Math.round(rem * 0.7));
                      setWeightInte(Math.round(rem * 0.3));
                    }}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-xs text-slate-600">
                    <span>Integrity proctor confidence factor:</span>
                    <span className="font-bold text-slate-800">{weightInte}%</span>
                  </div>
                  <div className="w-full bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-mono flex justify-between items-center shadow-sm">
                    <span>Auto-calculated balancing residual index:</span>
                    <strong className="text-indigo-600">{(100 - weightTech - weightComm)}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {isSaved && (
                <span className="text-xs font-mono text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Scoring configuration applied successfully.
                </span>
              )}
              <button
                type="submit"
                className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs font-heading py-2 px-5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                Save Scoring Config <Save className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Platform diagnostics & DB Reset */}
        <div className="col-span-1 space-y-4">
          {/* Active API Status widget */}
          <div className="glass-card rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Model API Engine Status</span>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Google Gemini API</span>
                <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
                  {apiKeyStatus ? "● ONLINE (ENTERPRISE KEY)" : "SIMULATED / EMBEDDED MODE"}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              When no secret KEY is supplied, hire AI fallback gracefully to local natural language response mockers to demonstrate candidate performance ratings.
            </p>
          </div>

          {/* User Persona Shift switcher */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Diagnostic Sandbox Simulator Toggle</span>
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Test dual aspects of the proctor suite! Toggle between Recruiter dashboard review views and the candidate secure browser lockdown sandbox.
              </p>
              
              <div className="flex rounded-xl overflow-hidden border border-slate-200">
                <button
                  onClick={() => onChangePersona("candidate")}
                  className="flex-1 py-1.5 text-xs font-bold font-mono transition-all bg-white text-slate-600 hover:bg-slate-50"
                >
                  Candidate Mode
                </button>
                <button
                  onClick={() => onChangePersona("recruiter")}
                  className="flex-1 py-1.5 text-xs font-bold font-mono transition-all bg-emerald-600 text-white"
                >
                  Recruiter Mode
                </button>
              </div>
            </div>
          </div>

          {/* Database Admin panel */}
          <div className="glass-card rounded-2xl p-5 space-y-3 border border-rose-300">
            <span className="text-[10px] font-mono text-rose-500 font-bold uppercase tracking-widest block flex items-center gap-1">
              <AlertOctagon className="h-4 w-4 text-rose-500" /> Database Administration
            </span>
            <p className="text-[10px] text-slate-505 text-slate-500 leading-relaxed">
              Clear previous results, logs, alerts and restore default candidates (Elena, Marcus, David) to test scoring pipelines cleanly.
            </p>

            <button
              onClick={handleDatabaseReset}
              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl py-2 px-3 text-rose-700 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> 
              {cleared ? "System Reinitialized!" : "Re-Seed Default Database"}
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
