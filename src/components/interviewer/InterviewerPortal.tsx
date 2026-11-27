/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Calendar, Users, Video, Award, FileText, Plus, 
  Send, Sparkles, CheckCircle2, XCircle, ArrowRight, 
  Download, Eye, Star, Filter, Search, BarChart3, 
  Layers, MessageSquare, ShieldCheck, Clock, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScheduledInterview, InterviewRubricEvaluation, AIEvaluationReport } from "../../types";
import { MOCK_SCHEDULED_INTERVIEWS, MOCK_CODING_CHALLENGES } from "../../mockData";

interface InterviewerPortalProps {
  interviewerName: string;
  interviewerEmail: string;
  reports: AIEvaluationReport[];
  onStartLiveInterview: (interview: ScheduledInterview) => void;
}

export default function InterviewerPortal({
  interviewerName,
  interviewerEmail,
  reports,
  onStartLiveInterview
}: InterviewerPortalProps) {
  // Tabs: "pipeline" | "evaluator" | "comparison" | "reports"
  const [activeTab, setActiveTab] = useState<"pipeline" | "evaluator" | "comparison" | "reports">("pipeline");

  // Schedule / Invite Candidate Modal
  const todayStr = new Date().toISOString().split("T")[0];
  const [interviews, setInterviews] = useState<ScheduledInterview[]>(MOCK_SCHEDULED_INTERVIEWS);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [newRoleTitle, setNewRoleTitle] = useState("Senior Frontend UI Architect");
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState("15:00");
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Resume Preview Modal
  const [selectedResumeCandidate, setSelectedResumeCandidate] = useState<ScheduledInterview | null>(null);

  // Active Live Evaluation State
  const [activeInterview, setActiveInterview] = useState<ScheduledInterview>(MOCK_SCHEDULED_INTERVIEWS[0]);
  const [rubric, setRubric] = useState<InterviewRubricEvaluation>({
    technicalScore: 4,
    codingScore: 5,
    systemDesignScore: 4,
    communicationScore: 5,
    problemSolvingScore: 4,
    interviewerNotes: "Candidate Sarah demonstrated phenomenal command of concurrency primitives. Solved the WebSocket debounce problem with clean memory cleanup and zero memory leaks.",
    hiringVerdict: "STRONG_HIRE",
    candidateComparisonNotes: "Outperformed cohort on algorithmic edge-case handling and system design tradeoffs."
  });

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Ask candidate how they would handle backpressure when 10,000 WebSocket events arrive per second.",
    "Probe on how their architecture prevents Cross-Site Scripting (XSS) inside the collaborative whiteboard canvas.",
    "Evaluate candidate's opinion on Web Workers for off-main-thread image processing."
  ]);

  const [evaluationSaved, setEvaluationSaved] = useState(false);

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);
    if (!newCandidateName.trim() || !newCandidateEmail.trim()) {
      setScheduleError("Candidate name and email are required.");
      return;
    }
    if (newDate < todayStr) {
      setScheduleError("Please select today or a future date.");
      return;
    }
    const created: ScheduledInterview = {
      id: `int-${Date.now().toString(36)}`,
      candidateId: `cand-${Date.now().toString(36)}`,
      candidateName: newCandidateName.trim(),
      candidateEmail: newCandidateEmail.trim().toLowerCase(),
      interviewerId: "int-1",
      interviewerName,
      interviewerEmail,
      positionId: "pos-1",
      roleTitle: newRoleTitle,
      department: "Engineering",
      scheduledDate: newDate,
      scheduledTime: newTime,
      durationMinutes: 45,
      status: "scheduled",
      meetingLink: `https://hireshield.ai/room/${Date.now().toString(36)}`,
      skills: ["React", "TypeScript", "System Design"],
    };
    setInterviews(prev => [created, ...prev]);
    setScheduleSuccess(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setScheduleSuccess(false);
      setNewCandidateName("");
      setNewCandidateEmail("");
    }, 1000);
  };

  const handleSaveRubric = () => {
    setEvaluationSaved(true);
    setTimeout(() => setEvaluationSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pipeline"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Interview Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab("evaluator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "evaluator"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <Video className="h-4 w-4" />
            <span>Live Co-Pilot & Rubric</span>
          </button>

          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "comparison"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Candidate Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "reports"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Hiring Verdicts</span>
          </button>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule & Invite Candidate</span>
        </button>
      </div>

      {/* Tab: Pipeline */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Assigned Candidates</span>
              <span className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-1 block">8</span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Scheduled Today</span>
              <span className="text-2xl font-heading font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">2</span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Average Integrity Index</span>
              <span className="text-2xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">95.4%</span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Hiring Offer Target</span>
              <span className="text-2xl font-heading font-extrabold text-sky-600 dark:text-sky-400 mt-1 block">3 Roles</span>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" /> Candidate Pipeline & Interview Sessions
              </h3>
              <span className="text-xs text-slate-500 font-mono">Real-time DB Sync</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5 pl-5">Candidate</th>
                    <th className="p-3.5">Target Role</th>
                    <th className="p-3.5">Schedule</th>
                    <th className="p-3.5">Resume / CV</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {interviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750 transition-all">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-slate-900 dark:text-white">{interview.candidateName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{interview.candidateEmail}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{interview.roleTitle}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{interview.department}</span>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{interview.scheduledDate}</span>
                        <span className="text-[10px] text-slate-400 block">{interview.scheduledTime}</span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedResumeCandidate(interview)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <FileText className="h-3 w-3 text-indigo-500" />
                          <span>View Resume</span>
                        </button>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {interview.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveInterview(interview);
                              setActiveTab("evaluator");
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>Start / Proctor</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Live Co-Pilot & Rubric Evaluation */}
      {activeTab === "evaluator" && (
        <div className="space-y-6">
          {/* Active Candidate Session Banner */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-extrabold text-lg flex items-center justify-center">
                {activeInterview.candidateName.split(" ").map(w => w[0]).join("")}
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE CO-PILOT SESSION
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeInterview.candidateName} — {activeInterview.roleTitle}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartLiveInterview(activeInterview)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Video className="h-4 w-4" />
                <span>Join Live Assessment Room</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: AI Question Recommendations & Probing Prompts (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" /> AI Co-Pilot Suggested Follow-Ups
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Gemini 2.5 Flash</span>
                </div>

                <div className="space-y-2.5">
                  {aiSuggestions.map((prompt, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 hover:border-indigo-300 transition-all cursor-pointer"
                      onClick={() => alert(`Prompt copied to clipboard for candidate: "${prompt}"`)}
                    >
                      <div className="flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                        <span>SUGGESTED QUESTION #{i + 1}</span>
                        <span>Click to Copy</span>
                      </div>
                      <p className="leading-relaxed font-sans">{prompt}</p>
                    </div>
                  ))}
                </div>

                {/* Dispatch Coding Challenge Quick Pill */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Push Algorithm to Candidate Editor:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {MOCK_CODING_CHALLENGES.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => alert(`Pushed challenge "${ch.title}" directly to candidate editor!`)}
                        className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 rounded-xl text-left text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer truncate"
                      >
                        {ch.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Rubric Scoring & Notes (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                  Technical Rubric & Evaluator Notes
                </h4>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  Scale: 1 (Poor) to 5 (Mastery)
                </span>
              </div>

              {/* Rubric Sliders Grid */}
              <div className="space-y-3.5">
                {[
                  { label: "Technical Competence & Architecture", key: "technicalScore" },
                  { label: "Algorithm & Coding Quality", key: "codingScore" },
                  { label: "System Design & Concurrency", key: "systemDesignScore" },
                  { label: "Communication & Technical Articulation", key: "communicationScore" },
                  { label: "Problem Solving & Reasoning Under Pressure", key: "problemSolvingScore" },
                ].map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {(rubric as any)[item.key]} / 5
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={(rubric as any)[item.key]}
                      onChange={(e) => setRubric({ ...rubric, [item.key]: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Interviewer Private Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Private Interviewer Observations & Qualitative Notes:
                </label>
                <textarea
                  value={rubric.interviewerNotes}
                  onChange={(e) => setRubric({ ...rubric, interviewerNotes: e.target.value })}
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  placeholder="Record strengths, edge cases addressed, and behavioral notes..."
                />
              </div>

              {/* Hiring Verdict Radio */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Final Hiring Recommendation Verdict:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: "STRONG_HIRE", label: "Strong Hire", color: "emerald" },
                    { val: "HIRE", label: "Hire", color: "teal" },
                    { val: "LEANING_HIRE", label: "Leaning Hire", color: "sky" },
                    { val: "REJECT", label: "Reject", color: "rose" },
                  ].map((verdict) => (
                    <button
                      key={verdict.val}
                      type="button"
                      onClick={() => setRubric({ ...rubric, hiringVerdict: verdict.val as any })}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                        rubric.hiringVerdict === verdict.val
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      {verdict.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  {evaluationSaved ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="h-4 w-4" /> Rubric Evaluation Saved & Signed
                    </span>
                  ) : "Draft auto-saving to PostgreSQL"}
                </span>

                <button
                  onClick={handleSaveRubric}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="h-4 w-4" />
                  <span>Submit Final Scorecard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Candidate Comparison Matrix */}
      {activeTab === "comparison" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Cohort Candidate Benchmark Comparison</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Comparing finalists for Senior Frontend UI Architect role</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold rounded-xl">
                2 Shortlisted Finalists
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidate 1 */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sarah Jenkins</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Completed Round 2 • Recommendation: STRONG HIRE</p>
                  </div>
                  <span className="text-base font-heading font-extrabold text-emerald-600 dark:text-emerald-400">92/100</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span>Algorithm Score:</span>
                    <strong className="text-indigo-600">95%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>System Design:</span>
                    <strong className="text-sky-600">90%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Communication:</span>
                    <strong className="text-emerald-600">94%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Proctor Integrity:</span>
                    <strong className="text-teal-600">96% (Verified)</strong>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 font-sans border border-slate-200 dark:border-slate-700">
                  "Exemplary async architecture skills. Designed clean queue flush mechanisms with optimal React render isolation."
                </div>
              </div>

              {/* Candidate 2 */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">David Chen</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Completed Round 2 • Recommendation: HIRE</p>
                  </div>
                  <span className="text-base font-heading font-extrabold text-indigo-600 dark:text-indigo-400">86/100</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span>Algorithm Score:</span>
                    <strong className="text-indigo-600">88%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>System Design:</span>
                    <strong className="text-sky-600">86%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Communication:</span>
                    <strong className="text-emerald-600">84%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Proctor Integrity:</span>
                    <strong className="text-amber-500">82% (1 Tab Switch)</strong>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 font-sans border border-slate-200 dark:border-slate-700">
                  "Strong system design thinking. Slight hesitation in explaining React hook dependency arrays, but recovered well."
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === "reports" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
              Signed Evaluator Reports & Hiring Recommendations
            </h3>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export PDF Batch</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            All reports feature cryptographic integrity hashing, proctoring telemetry snapshots, and interviewer rubric signoffs.
          </p>

          <div className="space-y-3">
            {reports.slice(0, 4).map((rep) => (
              <div key={rep.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rep.candidateName} — {rep.jobTitle}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Scores: Tech {rep.technicalScore} • Comm {rep.communicationScore} • Proctor Trust {100 - rep.suspicionScore}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                    rep.shortlistStatus === "SHORTLISTED"
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {rep.shortlistStatus}
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    title="Print report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <span>Schedule & Dispatch Candidate Invitation</span>
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
                >
                  ×
                </button>
              </div>

              {scheduleSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Invitation Dispatched!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Candidate has received secure login credentials, device checklist link, and calendar invite.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateInterview} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Candidate Full Name</label>
                    <input
                      type="text"
                      value={newCandidateName}
                      onChange={(e) => setNewCandidateName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Candidate Email</label>
                    <input
                      type="email"
                      value={newCandidateEmail}
                      onChange={(e) => setNewCandidateEmail(e.target.value)}
                      placeholder="alex.morgan@domain.com"
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Role Title</label>
                    <select
                      value={newRoleTitle}
                      onChange={(e) => setNewRoleTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Senior Frontend UI Architect">Senior Frontend UI Architect</option>
                      <option value="Cybersecurity & Proctoring Architect">Cybersecurity & Proctoring Architect</option>
                      <option value="AI & NLP Platform Alchemist">AI & NLP Platform Alchemist</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
                      <input
                        type="date"
                        min={todayStr}
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time</label>
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {scheduleError && (
                    <p className="text-xs text-rose-500 font-semibold">{scheduleError}</p>
                  )}

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="h-4 w-4" />
                      <span>Dispatch Invitation</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resume Viewer Modal */}
      <AnimatePresence>
        {selectedResumeCandidate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Parsed Resume Preview: {selectedResumeCandidate.candidateName}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedResumeCandidate.roleTitle}</p>
                </div>
                <button
                  onClick={() => setSelectedResumeCandidate(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
                >
                  ×
                </button>
              </div>

              {/* Parsed Resume Body */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs leading-relaxed max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span>Contact: {selectedResumeCandidate.candidateEmail}</span>
                  <span>Experience: 8+ Years</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Executive Summary:</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    Senior UI Architect specializing in high-throughput enterprise SaaS applications, WebSockets, state machine design, WebRTC video streaming, and browser-based anti-tampering sandboxes.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Verified Skills:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResumeCandidate.skills?.map((sk, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedResumeCandidate(null)}
                  className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
