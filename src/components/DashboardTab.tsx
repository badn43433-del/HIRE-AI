import React, { useState, useEffect } from "react";
import { 
  Users, Award, ShieldAlert, CheckCircle, ArrowRight, Video, 
  Map, Sparkles, Server, Activity, ShieldCheck, Layers 
} from "lucide-react";
import { motion } from "motion/react";
import { AIEvaluationReport } from "../types";

interface DashboardTabProps {
  reports: AIEvaluationReport[];
  loading: boolean;
  onEnterInterview: (jobId: string) => void;
  onNavigateToTab: (index: number) => void;
  persona?: "recruiter" | "candidate";
  candidateName?: string;
}

export default function DashboardTab({ reports, loading, onEnterInterview, onNavigateToTab, persona = "recruiter", candidateName = "Sarah Jenkins" }: DashboardTabProps) {
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/positions")
      .then(res => res.json())
      .then(data => setPositions(data))
      .catch(err => console.error("Error fetching positions", err));
  }, []);

  // Filter candidate's own reports
  const myReports = reports.filter(r => r.candidateName.toLowerCase() === candidateName.toLowerCase());
  const hasFinishedInterview = myReports.length > 0;

  if (persona === "candidate") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Personalized Candidate Welcome Hero Card */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg border border-indigo-800">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-505 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-12 bottom-0 w-36 h-36 bg-sky-505 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-700/80 text-[10px] font-mono tracking-wider text-indigo-200">
              <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
              CANDIDATE ASSESSMENT WORKSPACE ACTIVE
            </div>
            
            <h2 className="text-xl md:text-2xl font-heading font-extrabold tracking-tight">
              Welcome Back, {candidateName}! 🌟
            </h2>
            
            <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
              Prepare, practice, and complete highly secure proctored developer interviews with our AI-guided scoring systems. Gain immediate career confidence.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigateToTab(3)} // launch interview room
                className="px-4 py-2 bg-white text-indigo-950 hover:bg-indigo-50 font-sans text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 transform hover:scale-[1.02]"
              >
                <Video className="h-4 w-4 text-indigo-600 animate-pulse" />
                Go to Interview Room
              </button>
              <button
                onClick={() => onNavigateToTab(4)} // launch sample quiz test
                className="px-4 py-2 bg-indigo-800/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-700 font-sans text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="h-4 w-4 text-indigo-300" />
                Launch Practice Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Candidate-specific tracking blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 relative shadow-xs">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Assessment Status</span>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${hasFinishedInterview ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
              <strong className="text-slate-800 text-sm font-bold">
                {hasFinishedInterview ? "Evaluated & Logged" : "Pending Sandbox Launch"}
              </strong>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1">
              {hasFinishedInterview 
                ? "Your completed proctor scorecard and transcripts are safely archived in the workspace." 
                : "Select any available active job role details below to enter your first interview session."}
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 relative shadow-xs">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold">My Personal Scorecards</span>
            <div className="flex items-center gap-1.5 text-indigo-700">
              <Award className="h-4 w-4" />
              <strong className="text-slate-800 text-sm font-bold">
                {hasFinishedInterview ? `${myReports.length} Active Records` : "No submissions yet"}
              </strong>
            </div>
            {hasFinishedInterview ? (
              <button 
                onClick={() => onNavigateToTab(1)} 
                className="text-[10px] text-indigo-600 hover:text-indigo-850 font-bold block hover:underline text-left cursor-pointer"
              >
                View feedback score & action plan →
              </button>
            ) : (
              <p className="text-[10px] text-slate-500 font-sans">
                Finish your evaluation to spawn skill grades instantly.
              </p>
            )}
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 relative shadow-xs">
            <span className="text-[9px] font-mono text-rose-500 uppercase tracking-wider block font-bold flex items-center gap-1">
              <Activity className="h-3 w-3 animate-ping" /> System Integrity Clear
            </span>
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              <strong className="text-slate-800 text-sm font-bold">100% SECURE</strong>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans mb-1">
              Camera pipeline and page visibility listeners calibrated safely to ensure standard compliance.
            </p>
          </div>
        </div>

        {/* Cozy Prep Guide (Interactive Proctoring Rules) */}
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 space-y-2.5 text-xs text-amber-900 leading-relaxed font-sans">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            💡 Essential Prep Checklist for a Successful Interview:
          </h3>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
            <li>
              <strong>Look center at the webcam:</strong> Face classification algorithms track steady focus on screen. Looking away repeatedly generates suspicious warning alerts.
            </li>
            <li>
              <strong>Avoid switching windows or tags:</strong> Navigating out of the browser tab instantly logs a Blur Event flag onto your session report ledger.
            </li>
            <li>
              <strong>Speak key vocabulary terms:</strong> AI checks key semantics matching for terms associated with your chosen job description.
            </li>
          </ul>
        </div>

        {/* Active opportunities bank list */}
        <div className="space-y-4 pt-1">
          <div>
            <h3 className="text-sm font-heading font-extrabold text-slate-800">Your Assigned Active Job Roles</h3>
            <p className="text-xs text-slate-500 font-sans">Launch your technical interview assessment environment for any position listed below.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {positions.map((pos) => (
              <div 
                key={pos.id}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-5 flex flex-col justify-between h-56 transition-all text-left relative overflow-hidden group hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[9px] text-indigo-600 font-mono font-semibold">
                      {pos.difficulty} LEVEL
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">{pos.department}</span>
                  </div>
                  
                  <h4 className="text-sm font-heading font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                    {pos.title}
                  </h4>
                  
                  <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-1 line-clamp-3">
                    {pos.description}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4">
                  <button
                    onClick={() => onEnterInterview(pos.id)}
                    className="flex w-full items-center justify-between text-[10px] text-indigo-600 font-mono font-bold hover:text-indigo-850 cursor-pointer"
                  >
                    <span>Launch Interview Sandbox</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    );
  }

  // Recruiter Dashboard View below
  const totalAssessments = reports.length;
  const filteredShortlisted = reports.filter(r => r.shortlistStatus === "SHORTLISTED");
  const shortlistRate = totalAssessments > 0 ? Math.round((filteredShortlisted.length / totalAssessments) * 100) : 0;
  
  const averageTechnical = totalAssessments > 0 
    ? Math.round(reports.reduce((acc, r) => acc + r.technicalScore, 0) / totalAssessments) 
    : 0;

  const averageSuspicion = totalAssessments > 0 
    ? Math.round(reports.reduce((acc, r) => acc + r.suspicionScore, 0) / totalAssessments) 
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Upper Grid Stats Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigateToTab(2)} // Navigate to Reports Tab
          className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="absolute top-0 right-0 h-14 w-14 bg-indigo-505 bg-indigo-50/20 blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Core Registrations</span>
          <span className="text-3xl font-heading font-extrabold text-slate-900 mt-1 block group-hover:text-indigo-600 transition-colors">
            {loading ? "..." : totalAssessments}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block font-mono flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-indigo-500" /> Active applicants logs
          </span>
        </div>

        <div 
          onClick={() => onNavigateToTab(1)} // Navigate to Results Tab
          className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="absolute top-0 right-0 h-14 w-14 bg-emerald-50/20 blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-medium">Shortlist Ratio</span>
          <span className="text-3xl font-heading font-extrabold text-emerald-600 mt-1 block">
            {loading ? "..." : `${shortlistRate}%`}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block font-mono flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Top tier matches
          </span>
        </div>

        <div 
          onClick={() => onNavigateToTab(5)} // Navigate to Alerts Tab
          className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:border-rose-400 hover:shadow-md transition-all group"
        >
          <div className="absolute top-0 right-0 h-14 w-14 bg-rose-50/20 blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-medium">Anomaly Index</span>
          <span className={`text-3xl font-heading font-extrabold mt-1 block transition-colors ${
            averageSuspicion > 30 ? "text-rose-600" : "text-sky-600"
          }`}>
            {loading ? "..." : `${averageSuspicion}%`}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block font-mono flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Average proctor alerts
          </span>
        </div>

        <div 
          onClick={() => onNavigateToTab(1)} // Navigate to Results Tab
          className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="absolute top-0 right-0 h-14 w-14 bg-indigo-50/20 blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-medium">Avg Technical Score</span>
          <span className="text-3xl font-heading font-extrabold text-indigo-700 mt-1 block">
            {loading ? "..." : `${averageTechnical}%`}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 block font-mono flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-indigo-600" /> Semantic correctness
          </span>
        </div>

      </div>

      {/* Middle Grid: Custom Interactive SVG splines Spline line charts & Security Statuses */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* SVG Splines Section */}
        <div className="md:col-span-8 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-800">Historical Evaluation & Integrity Vectors</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Real-time candidate score performance mapping (Technical vs. Integrity).</p>
            </div>
            
            <div className="flex gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-indigo-650 text-indigo-600">
                <span className="h-2 w-2 rounded-full bg-indigo-600" /> Technical Score
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <span className="h-2 w-2 rounded-full bg-rose-505 bg-rose-500" /> Proctor Deviations
              </span>
            </div>
          </div>

          {/* Fully Custom, Elegant SVG Chart */}
          <div className="h-48 relative w-full flex items-end">
            <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSusp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="#e2e8f0" strokeWidth="0.8" />

              {/* Technical Performance Spline */}
              <path 
                d="M 10 90 Q 70 20 130 15 T 250 35 T 390 10 L 390 110 L 10 110 Z" 
                fill="url(#colorTech)" 
              />
              <path 
                d="M 10 90 Q 70 20 130 15 T 250 35 T 390 10" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2" 
                strokeLinecap="round"
              />

              {/* Proctor Deviations Spline */}
              <path 
                d="M 10 110 Q 70 105 130 95 T 250 80 T 390 100 L 390 110 L 10 110 Z" 
                fill="url(#colorSusp)" 
              />
              <path 
                d="M 10 110 Q 70 105 130 95 T 250 80 T 390 100" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="1.5" 
                strokeDasharray="3,3"
                strokeLinecap="round"
              />

              {/* Points indicators */}
              <circle cx="130" cy="15" r="3.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
              <circle cx="250" cy="35" r="3.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
              <circle cx="390" cy="10" r="3.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
              <circle cx="250" cy="80" r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
            </svg>

            {/* X-Axis titles */}
            <div className="absolute inset-x-0 -bottom-1 flex justify-between px-2 text-[8px] font-mono text-slate-400">
              <span>Assessment Elena</span>
              <span>Assessment Marcus</span>
              <span>Latest Assessments</span>
            </div>
          </div>
        </div>

        {/* System parameters checklist block */}
        <div className="md:col-span-4 glass-card rounded-2xl p-5 space-y-4">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Security Integrity Metrics</span>
          
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 relative shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Active Proctor Check
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-505 text-slate-500 leading-relaxed font-sans">
                Continuous page blur trackers, visibility-change listeners, and face posture classifiers are fully integrated inside the test sandbox.
              </p>
            </div>

            <div className="p-3 bg-indigo-50/20 border border-indigo-100 rounded-xl space-y-2 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-indigo-505 text-indigo-600" /> AI Scoring Engine
                </span>
                <span className="text-[8px] font-mono text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">ONLINE</span>
              </div>
              <p className="text-[10px] text-slate-505 text-slate-500 leading-relaxed font-sans">
                Analyzes technical definitions, semantic keyword compliance, and filler vocals density utilizing custom structured JSON guidelines.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Active opportunities bank list */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-heading font-bold text-slate-800">Launch New Candidate Assessment Sandbox</h3>
          <p className="text-xs text-slate-500">Pick any available position opportunity below to open its dedicated proctoring test space.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {positions.map((pos) => (
            <div 
              key={pos.id}
              className="glass-card rounded-2xl p-5 flex flex-col justify-between h-56 glass-card-hover text-left relative overflow-hidden group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[9px] text-indigo-600 font-mono font-semibold">
                    {pos.difficulty} LEVEL
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">{pos.department}</span>
                </div>
                
                <h4 className="text-sm font-heading font-bold text-slate-850 text-slate-800 leading-snug group-hover:text-indigo-950 transition-colors">
                  {pos.title}
                </h4>
                
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed mt-1 line-clamp-3">
                  {pos.description}
                </p>
              </div>

              <button
                onClick={() => onEnterInterview(pos.id)}
                className="flex items-center gap-1.5 text-[10px] text-indigo-600 group-hover:text-indigo-700 font-mono font-bold mt-4 border-t border-slate-100 pt-3 cursor-pointer"
              >
                Launch Assessment Playground <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
