/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Calendar, Video, Award, User, ShieldCheck, 
  Clock, ArrowRight, Upload, FileText, CheckCircle2,
  Sparkles, ExternalLink, Download, AlertCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DeviceDiagnostics from "./DeviceDiagnostics";
import WaitingRoom from "./WaitingRoom";
import LiveInterviewSuite from "./LiveInterviewSuite";
import { ScheduledInterview, AIEvaluationReport } from "../../types";
import { MOCK_SCHEDULED_INTERVIEWS } from "../../mockData";

interface CandidatePortalProps {
  candidateName: string;
  candidateEmail: string;
  reports: AIEvaluationReport[];
  onRefreshReports?: () => void;
}

export default function CandidatePortal({
  candidateName,
  candidateEmail,
  reports,
  onRefreshReports
}: CandidatePortalProps) {
  // Navigation tabs: "interviews" | "diagnostics" | "waiting_room" | "live_room" | "profile" | "scorecards"
  const [currentTab, setCurrentTab] = useState<"interviews" | "diagnostics" | "waiting_room" | "live_room" | "profile" | "scorecards">("interviews");

  // Selected active interview
  const [activeInterview, setActiveInterview] = useState<ScheduledInterview>(MOCK_SCHEDULED_INTERVIEWS[0]);

  // Profile fields & resume upload state
  const [bio, setBio] = useState("Senior Frontend Engineer specializing in high-concurrency React architectures, WebRTC, and distributed system security.");
  const [skills, setSkills] = useState(["React 19", "TypeScript", "WebRTC", "FastAPI", "Vite", "Tailwind CSS", "Distributed Systems"]);
  const [newSkill, setNewSkill] = useState("");
  const [resumeFileName, setResumeFileName] = useState("sarah_jenkins_lead_fe.pdf");
  const [resumeUploaded, setResumeUploaded] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Completed session report
  const [recentEvaluation, setRecentEvaluation] = useState<any>(null);

  const handleStartInterviewFlow = (interview: ScheduledInterview) => {
    setActiveInterview(interview);
    setCurrentTab("diagnostics"); // Step 1: Pre-flight check
  };

  const handleDiagnosticsPassed = () => {
    setCurrentTab("waiting_room"); // Step 2: Waiting room
  };

  const handleEnterLiveRoom = () => {
    setCurrentTab("live_room"); // Step 3: Live Assessment Room
  };

  const handleEndLiveInterview = (summary: any) => {
    setRecentEvaluation(summary);
    setCurrentTab("scorecards"); // Step 4: Final scorecard review
    if (onRefreshReports) onRefreshReports();
  };

  const handleResumeDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setResumeFileName(file.name);
        setResumeUploaded(true);
        setIsUploading(false);
      }, 800);
    }
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter(item => item !== s));
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setCurrentTab("interviews")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === "interviews"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Upcoming Interviews</span>
        </button>

        <button
          onClick={() => setCurrentTab("diagnostics")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === "diagnostics"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Device & Speed Test</span>
        </button>

        <button
          onClick={() => setCurrentTab("profile")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === "profile"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Resume & Profile</span>
        </button>

        <button
          onClick={() => setCurrentTab("scorecards")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === "scorecards"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>My AI Scorecards</span>
        </button>
      </div>

      {/* Main Tab Screen Switcher */}
      <div>
        {currentTab === "interviews" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-800">
              <div className="space-y-2 relative z-10">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-mono tracking-wider text-indigo-300 uppercase">
                  Candidate Portal Active
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold">
                  Welcome, {candidateName}!
                </h2>
                <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
                  You have scheduled rounds with technical evaluation leads. Review your upcoming interviews below, complete device pre-flight diagnostics, and join when ready.
                </p>
              </div>
            </div>

            {/* Upcoming Interviews List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" /> Scheduled Live Technical Rounds
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {MOCK_SCHEDULED_INTERVIEWS.length} Rounds Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_SCHEDULED_INTERVIEWS.map((interview) => (
                  <div
                    key={interview.id}
                    className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold">
                          {interview.department}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5" /> {interview.scheduledDate} • {interview.scheduledTime}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {interview.roleTitle}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Lead Evaluator: <strong className="text-slate-700 dark:text-slate-300">{interview.interviewerName}</strong>
                        </p>
                      </div>

                      {/* Required Skills Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {interview.skills?.map((sk, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[10px] font-mono">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Duration: {interview.durationMinutes} mins
                      </span>

                      <button
                        onClick={() => handleStartInterviewFlow(interview)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 transform hover:scale-[1.02]"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Pre-Flight & Join</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === "diagnostics" && (
          <DeviceDiagnostics
            candidateName={candidateName}
            onAllPassed={handleDiagnosticsPassed}
          />
        )}

        {currentTab === "waiting_room" && (
          <WaitingRoom
            interview={activeInterview}
            candidateName={candidateName}
            onEnterLiveRoom={handleEnterLiveRoom}
          />
        )}

        {currentTab === "live_room" && (
          <LiveInterviewSuite
            interview={activeInterview}
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            onEndInterview={handleEndLiveInterview}
          />
        )}

        {currentTab === "profile" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-700">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {candidateName.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{candidateName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{candidateEmail}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Executive Bio / Summary</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Resume Upload Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Resume & Credentials</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center space-y-3 bg-slate-50 dark:bg-slate-900/50">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  {resumeUploaded ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Active Resume: {resumeFileName}
                      </p>
                      <p className="text-[10px] text-slate-400">PDF Document • Parsed for AI Evaluation Lead</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Drag & drop or browse your resume (PDF, DOCX)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Maximum size: 10MB</p>
                    </div>
                  )}

                  <label className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-xs">
                    {isUploading ? <RefreshCw className="h-4 w-4 animate-spin inline" /> : "Upload New Resume"}
                    <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleResumeDrop} />
                  </label>
                </div>
              </div>

              {/* Skills Tags Manager */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Technical Skills & Expertise</label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-mono font-medium flex items-center gap-1.5"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={addSkill} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill (e.g. Docker, GraphQL)..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {currentTab === "scorecards" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Technical Assessment Scorecard</h3>
                  <p className="text-xs text-slate-400 font-mono">Candidate: {candidateName}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono rounded-xl border border-emerald-200 dark:border-emerald-800">
                  STATUS: EVALUATED
                </span>
              </div>

              {/* Metric dials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Coding & Algo</span>
                  <span className="text-xl font-heading font-extrabold text-indigo-600 dark:text-indigo-400">92/100</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">System Design</span>
                  <span className="text-xl font-heading font-extrabold text-sky-600 dark:text-sky-400">88/100</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Communication</span>
                  <span className="text-xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">94/100</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Proctor Trust Score</span>
                  <span className="text-xl font-heading font-extrabold text-teal-600 dark:text-teal-400">96%</span>
                </div>
              </div>

              {/* Qualitative AI Summary */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 font-mono uppercase flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" /> AI Executive Synthesis & Hiring Recommendation
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  The candidate exhibited exceptional mastery in asynchronous UI architecture, properly addressing telemetry queue buffering and memory eviction under strict real-time constraints. Communication remained articulate and transparent throughout. Integrity verification scores showed zero severe malpractice incidents.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Verified PDF Report</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
