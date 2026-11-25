import React, { useState } from "react";
import { 
  Award, TrendingUp, Search, CheckCircle, XCircle, AlertTriangle, 
  HelpCircle, RefreshCw, BarChart2, Star, CheckCheck, BookOpen, Sparkles, Cpu, Lightbulb, UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AIEvaluationReport } from "../types";

interface ResultsTabProps {
  reports: AIEvaluationReport[];
  loading: boolean;
  onUpdateStatus: (id: string, newStatus: "SHORTLISTED" | "STANDBY" | "REJECTED") => void;
  onRefresh: () => void;
  persona?: "recruiter" | "candidate";
  candidateName?: string;
  candidateEmail?: string;
}

export default function ResultsTab({ reports, loading, onUpdateStatus, onRefresh, persona = "recruiter", candidateName = "Sarah Jenkins", candidateEmail = "sarah.jenkins@enterprise-recruit.com" }: ResultsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeImproversionTab, setActiveImproversionTab] = useState<"skills" | "proctoring">("skills");

  const handleStatusChange = (id: string, val: "SHORTLISTED" | "STANDBY" | "REJECTED") => {
    onUpdateStatus(id, val);
  };

  const filteredReports = reports.filter(rep => {
    const matchesSearch = rep.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rep.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || rep.shortlistStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Candidate Filtered Reports
  const myOwnReports = reports.filter(rep => {
    return rep.candidateName.toLowerCase() === candidateName.toLowerCase() || 
           rep.candidateEmail.toLowerCase() === candidateEmail.toLowerCase();
  });

  // Candidate Experience Render
  if (persona === "candidate") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Results Tab Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-heading font-extrabold text-slate-900 flex items-center gap-1.5">
              <Award className="h-5 w-5 text-indigo-600" />
              My AI Scorecard & Actionable Progression Page
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Review personal technical evaluations, spoken metrics feed, and actionable AI improvement guidelines.
            </p>
          </div>
          <button 
            onClick={onRefresh}
            className="px-3 py-1.5 border border-slate-200 hover:border-indigo-500 bg-white text-slate-600 hover:text-indigo-600 rounded-lg transition-all text-xs flex items-center gap-1.5 font-mono cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Reports Ledger
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 animate-pulse">
            Retrieving candidate sandbox history registries...
          </div>
        ) : myOwnReports.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center space-y-4 shadow-xs">
            <div className="mx-auto h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Star className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-heading font-bold text-slate-900">Your Appraisal Scorecard is Empty</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You haven't completed any dynamic technical assessments yet. Head over to the **Interview Chamber** or **Sample Test** tab to compile your initial evaluation report!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display each personal report */}
            {myOwnReports.map((myRep) => {
              const eloScore = Math.ceil(myRep.technicalScore * 0.6 + myRep.communicationScore * 0.4 - myRep.suspicionScore * 0.3);
              return (
                <div key={myRep.id} className="space-y-6">
                  {/* Scorecard Hero Block */}
                  <div className="bg-white border border-slate-205 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-600" />
                    
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1 pl-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[9px] font-mono text-emerald-700 font-extrabold uppercase tracking-wider">
                          Assessment Logged
                        </span>
                        <h3 className="text-base font-heading font-extrabold text-slate-800">
                          {myRep.candidateName} &mdash; {myRep.jobTitle}
                        </h3>
                        <p className="text-xs text-slate-450 text-slate-500">
                          Completed on standard proctor pipeline with record verification log ID <code>{myRep.id.substring(0, 8)}</code>.
                        </p>
                      </div>

                      {/* Status and ELO rating overview */}
                      <div className="text-left md:text-right space-y-1 shrink-0">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold">
                          <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                          Application Status: <strong className="text-indigo-700 capitalize text-xs ml-1 font-bold">{myRep.shortlistStatus.toLowerCase()}</strong>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Rank Assessment rating: <strong className="text-indigo-600 text-sm font-bold">{eloScore}</strong> ELO
                        </div>
                      </div>
                    </div>

                    {/* Performance breakdown meters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                      <div className="p-3.5 bg-indigo-50/20 border border-indigo-100/60 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 font-mono">Technical Accuracy</span>
                          <strong className="text-indigo-700 font-bold">{myRep.technicalScore}%</strong>
                        </div>
                        <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${myRep.technicalScore}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-505 text-slate-500 font-sans leading-relaxed">
                          Checks semantic correct alignments with essential architecture definitions.
                        </p>
                      </div>

                      <div className="p-3.5 bg-emerald-50/20 border border-emerald-100/60 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 font-mono">Filler Word index</span>
                          <strong className="text-emerald-700 font-bold">{myRep.communicationScore}%</strong>
                        </div>
                        <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${myRep.communicationScore}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-505 text-slate-500 font-sans leading-relaxed">
                          Measures vocabulary structure and density of communication filler elements.
                        </p>
                      </div>

                      <div className="p-3.5 bg-rose-50/20 border border-rose-100/60 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700 font-mono">Proctor Risk Index</span>
                          <strong className={myRep.suspicionScore > 40 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                            {myRep.suspicionScore}%
                          </strong>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ 
                            width: `${myRep.suspicionScore}%`,
                            backgroundColor: myRep.suspicionScore > 40 ? "#ef4444" : "#10b981"
                          }} />
                        </div>
                        <p className="text-[10px] text-slate-505 text-slate-500 font-sans leading-relaxed">
                          Anomaly logs, window switching actions, and gaze calibration triggers.
                        </p>
                      </div>
                    </div>

                    {/* Render transcribed responses */}
                    <div className="pt-2">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">My Evaluation Transcript Logs & AI Feeds:</h4>
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                        {myRep.answersEvaluated?.map((resp, idx) => (
                          <div key={idx} className="p-4 bg-slate-50/40 space-y-2 font-sans">
                            <div className="flex justify-between text-[11px] font-mono font-bold text-indigo-700">
                              <span>Q{idx + 1}: {resp.questionText}</span>
                              <span className="text-slate-500">Semantic Score: {resp.score}%</span>
                            </div>
                            <div className="text-xs text-slate-600 leading-relaxed font-sans pl-2.5 border-l-2 border-indigo-200 bg-white p-2 border border-slate-100 rounded-lg space-y-1">
                              <div>
                                <strong className="text-slate-700 text-[10px] uppercase font-mono tracking-wider block mb-0.5">Spoken Transcript:</strong>
                                "{resp.candidateAnswer}"
                              </div>
                              <div className="bg-slate-50 border border-slate-105 p-2 rounded-lg text-[11px] text-slate-500">
                                <strong className="text-indigo-650 text-[9px] uppercase font-mono tracking-wider block mb-0.5">AI Rational Scoring:</strong>
                                {resp.aiRationallyScored}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Improversion Progression Panel */}
                  <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shrink-0">
                        <Cpu className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-heading font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider text-xs">
                          AI STUDY CENTER: "IMPROVERSION" PATHWAY DIRECTIVES
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-mono tracking-wide font-extrabold uppercase">
                            DYNAMIC COHERENCE
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-sans">
                          Algorithmically calculated skill adjustments designed specifically to elevate scorecards in subsequent sandbox sessions.
                        </p>
                      </div>
                    </div>

                    {/* Inner tab choices for study coaching */}
                    <div className="flex gap-2 p-1 bg-slate-800 rounded-xl max-w-xs text-xs font-mono">
                      <button
                        onClick={() => setActiveImproversionTab("skills")}
                        className={`flex-1 py-1.5 rounded-lg text-center font-bold cursor-pointer transition-all ${
                          activeImproversionTab === "skills" 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Vocabulary Study
                      </button>
                      <button
                        onClick={() => setActiveImproversionTab("proctoring")}
                        className={`flex-1 py-1.5 rounded-lg text-center font-bold cursor-pointer transition-all ${
                          activeImproversionTab === "proctoring" 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Proctor Integrity
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeImproversionTab === "skills" ? (
                        <motion.div
                          key="skills"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 pt-1 text-xs"
                        >
                          <div className="p-3.5 bg-slate-850 bg-slate-800/60 border border-slate-800 rounded-xl space-y-2">
                            <h4 className="font-bold flex items-center gap-1.5 text-[11px] text-indigo-300 uppercase tracking-widest font-mono">
                              <Lightbulb className="h-4 w-4 text-amber-400" />
                              Technical Concept Deficits Identified:
                            </h4>
                            <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                              Based on semantic speech vectors, your answers could be boosted up to <strong className="text-emerald-400">+15%</strong> by explicitly weaving in the following professional phrases:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px] font-normal font-mono text-slate-200">
                              <span className="p-1 px-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Hydration Overhead Lag
                              </span>
                              <span className="p-1 px-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Granular Bundle Splitting
                              </span>
                              <span className="p-1 px-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Interactive Next-Paint optimization
                              </span>
                              <span className="p-1 px-2 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Decoupled micro-state Isolation
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 bg-indigo-950/30 border border-indigo-900/40 rounded-xl space-y-1.5">
                            <h4 className="font-bold text-[11px] text-indigo-400 uppercase tracking-wider font-mono">
                              Vocal Filler Guidelines:
                            </h4>
                            <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                              Our analysis tracked filler tokens such as <em>"um"</em>, <em>"ah"</em>, and <em>"like"</em>. Work to insert short pauses instead of fillers during speech transition phases to automatically boost "vocabulary continuity" indexes to over <strong className="text-emerald-400">90%</strong>.
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="proctoring"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 pt-1 text-xs"
                        >
                          <div className="p-3.5 bg-slate-800/60 border border-slate-800 rounded-xl space-y-2">
                            <h4 className="font-bold flex items-center gap-1.5 text-[11px] text-rose-300 uppercase tracking-widest font-mono">
                              <AlertTriangle className="h-4 w-4 text-rose-400" />
                              Anti-Cheating Trigger Mitigation:
                            </h4>
                            <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                              If your Proctor Risk Index showed anomalies on previous tests, follow these simple environment corrections:
                            </p>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                              <li><strong> g-Force background contrast:</strong> Sit in a well-lit space. Backlights throw facial postures in shadow, which triggers look classification errors.</li>
                              <li><strong>Minimize sub-window notification tabs:</strong> System logs Blur events instantly when other software takes screen focus away.</li>
                              <li><strong>Keep posture neutral:</strong> Avoid leaning fully outside the camera grid. State machine requires continuous bounding box tracking.</li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  }

  // Recruiter standard results rendering below
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate or job role..."
            className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto self-end sm:self-center">
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
          >
            <option value="all">Filter Status: All</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="STANDBY">STANDBY</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <button 
            onClick={onRefresh}
            className="px-2.5 py-2 border border-slate-200 hover:border-indigo-500 bg-white text-slate-600 hover:text-indigo-600 rounded-lg transition-all text-xs flex items-center gap-1 font-mono cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Load
          </button>
        </div>
      </div>

      {/* Main rank-ordered checklist cards comparison list */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500 animate-pulse">
          Retrieving scorecard comparison entries...
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500">
          Zero candidate match results detected in search bounds.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((rep) => (
            <div 
              key={rep.id}
              className={`glass-card rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition-all ${
                rep.shortlistStatus === "SHORTLISTED" 
                  ? "border-emerald-350 border-emerald-300 bg-gradient-to-br from-white to-emerald-50/5" 
                  : rep.shortlistStatus === "REJECTED"
                  ? "border-rose-100"
                  : "border-slate-200"
              }`}
            >
              <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-500" style={{
                backgroundColor: rep.shortlistStatus === "SHORTLISTED" ? "#10b981" : rep.shortlistStatus === "REJECTED" ? "#ef4444" : "#f59e0b"
              }} />

              {/* Bio & Position applied */}
              <div className="space-y-2 flex-1 pl-2">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-mono font-bold flex items-center justify-center shadow-sm">
                    R{rep.finalRank || "X"}
                  </span>
                  
                  <div>
                    <h3 className="text-base font-heading font-bold text-slate-800">{rep.candidateName}</h3>
                    <p className="text-[10px] text-slate-500 font-mono italic">{rep.candidateEmail}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-650 text-slate-600 bg-slate-100/60 border border-slate-200/50 rounded-xl py-1.5 px-3 leading-relaxed font-sans">
                  Opportunity: <strong className="text-slate-800">{rep.jobTitle}</strong>
                </div>
              </div>

              {/* Detailed Technical metrics rating bars */}
              <div className="w-full md:w-60 space-y-2 text-xs font-mono text-slate-500">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span>Technical correctness</span>
                    <strong className="text-emerald-600 font-bold">{rep.technicalScore}%</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${rep.technicalScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span>Vocabulary continuity</span>
                    <strong className="text-indigo-600 font-bold">{rep.communicationScore}%</strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-505 bg-indigo-500 h-full" style={{ width: `${rep.communicationScore}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span>Proctor Integrity Risk</span>
                    <strong className={rep.suspicionScore > 40 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                      {rep.suspicionScore}%
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full" style={{ 
                      width: `${rep.suspicionScore}%`,
                      backgroundColor: rep.suspicionScore > 40 ? "#ef4444" : "#10b981"
                    }} />
                  </div>
                </div>
              </div>

              {/* Recruiter Action Switch status */}
              <div className="shrink-0 space-y-2 w-full md:w-auto text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-widest">Adjust Assessment status</span>
                
                <div className="flex rounded-xl overflow-hidden border border-slate-200 max-w-xs ml-auto">
                  <button
                    onClick={() => handleStatusChange(rep.id, "SHORTLISTED")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                      rep.shortlistStatus === "SHORTLISTED" 
                        ? "bg-emerald-500 text-white" 
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    title="Shortlist applicant"
                  >
                    Shortlist
                  </button>

                  <button
                    onClick={() => handleStatusChange(rep.id, "STANDBY")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                      rep.shortlistStatus === "STANDBY" 
                        ? "bg-amber-500 text-white" 
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    title="Standby applicant"
                  >
                    Standby
                  </button>

                  <button
                    onClick={() => handleStatusChange(rep.id, "REJECTED")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                      rep.shortlistStatus === "REJECTED" 
                        ? "bg-rose-500 text-white" 
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    title="Reject applicant"
                  >
                    Reject
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Verification Score: <strong className="text-indigo-600">{Math.ceil(rep.technicalScore * 0.6 + rep.communicationScore * 0.4 - rep.suspicionScore * 0.3)}</strong> ELO
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </motion.div>
  );
}
