/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Mail, Map, Trash, Award, Briefcase, Search, 
  User, CheckCircle, XCircle, ArrowRight, ExternalLink, RefreshCw, 
  Lock, AlertTriangle, Eye, Video, CheckSquare, Layers, Play, Download
} from "lucide-react";
import { JobPosition, AIEvaluationReport, HRSettings } from "../types";

export default function RecruiterDashboard() {
  const [reports, setReports] = useState<AIEvaluationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [explainRecruiterSync, setExplainRecruiterSync] = useState(false);

  // Selection state for sending bulk summary email
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [hrEmailRecipient, setHrEmailRecipient] = useState("recruiting-lead@enterprise.com");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessLog, setEmailSuccessLog] = useState<any | null>(null);

  // Focus Candidate detail selection
  const [selectedReport, setSelectedReport] = useState<AIEvaluationReport | null>(null);

  // Video playback telemetry states
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // e.g., 0.5, 1, 1.5, 2
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  // Auto-play interval effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds(prev => {
          if (prev >= 90) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed]);

  // Sync state resets on candidate toggle
  useEffect(() => {
    setPlaybackSeconds(0);
    setIsPlaying(false);
    setPlaybackSpeed(1);
    setActiveAlertId(null);
  }, [selectedReport]);

  // Download suspicious clip payload helper
  const handleDownloadClip = (act: any, candidateName: string) => {
    const timestamp = act.timestamp || new Date().toISOString();
    const payload = {
      appId: "hireshield-security-applet",
      reportTitle: "Proctor Security Visual Integrity Evidence Clip",
      exportedAt: new Date().toISOString(),
      violationMetadata: {
        candidateName,
        alertId: act.id,
        eventType: act.type,
        eventSeverity: act.severity,
        videoOffsetSeconds: act.videoOffsetSeconds ?? 0,
        timelineOffsetLabel: `0:${(act.videoOffsetSeconds ?? 0).toString().padStart(2, "0")}`,
        timestampLogged: timestamp,
        proctorDescription: act.description
      },
      forensicVerificationHash: `SHA-256-SIGN-${Array.from({length: 6}, () => Math.floor(Math.random()*16).toString(16)).join("").toUpperCase()}`,
      reconstructionLog: [
        { time: Math.max(0, (act.videoOffsetSeconds ?? 0) - 5), status: "Biometric mesh aligned. High gaze fidelity." },
        { time: Math.max(0, (act.videoOffsetSeconds ?? 0) - 2), status: "Subtle ocular deviation detected. Hand-gesture tracker activated." },
        { time: act.videoOffsetSeconds ?? 0, status: `SEC_VIOLATION_TRIGGERED: ${act.type.toUpperCase()}` },
        { time: (act.videoOffsetSeconds ?? 0) + 2, status: "Auto-screenshot capture buffer serialized and uploaded." },
        { time: (act.videoOffsetSeconds ?? 0) + 5, status: "Focus state recovery flag logged. Biometric sync restored." }
      ]
    };
    
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hireshield_clip_offset_${act.videoOffsetSeconds}s_${candidateName.toLowerCase().replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeAnomaly = selectedReport?.suspiciousActivities?.find(act => {
    const offset = act.videoOffsetSeconds ?? 0;
    return Math.abs(playbackSeconds - offset) <= 3;
  });

  // Fetch reports data
  const loadReports = () => {
    setLoading(true);
    fetch("/api/reports")
      .then(res => res.json())
      .then(data => {
        // Sort reports by rank or score
        setReports(data.sort((a: any, b: any) => a.finalRank - b.finalRank));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading reports", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filter logic
  const filteredReports = reports.filter(rep => {
    const matchesSearch = rep.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rep.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === "all" || rep.jobPositionId === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === "all" || rep.shortlistStatus === selectedStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Unique listed positions
  const availablePositions = Array.from(new Set(reports.map(r => r.jobPositionId)))
    .map(id => ({ id, title: reports.find(r => r.jobPositionId === id)?.jobTitle || "Role Opportunity" }));

  // Aggregate stats
  const totalProfiles = reports.length;
  const totalShortlisted = reports.filter(r => r.shortlistStatus === "SHORTLISTED").length;
  const avgSuspicionIndex = Math.ceil(reports.reduce((acc, curr) => acc + curr.suspicionScore, 0) / Math.max(1, totalProfiles));
  const avgTechnicalPerformance = Math.ceil(reports.reduce((acc, curr) => acc + curr.technicalScore, 0) / Math.max(1, totalProfiles));

  // Toggle selection for emailing
  const handleToggleSelect = (id: string) => {
    setSelectedReportIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllTop = () => {
    const topShortlistedIds = reports
      .filter(r => r.shortlistStatus === "SHORTLISTED")
      .map(r => r.id);
    setSelectedReportIds(topShortlistedIds);
  };

  // Submit bulk email evaluation report
  const handleNotifyHRTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReportIds.length === 0) return;

    setIsSendingEmail(true);
    fetch("/api/notify-hr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail: hrEmailRecipient, reportIds: selectedReportIds })
    })
      .then(res => res.json())
      .then(data => {
        setIsSendingEmail(false);
        if (data.success) {
          setEmailSuccessLog(data.payload);
          setTimeout(() => setEmailSuccessLog(null), 10000);
        } else {
          alert("Error sending email summary payload");
        }
      })
      .catch(err => {
        setIsSendingEmail(false);
        console.error("Bulking email failure", err);
      });
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Scoreboard Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-indigo-500/10 to-transparent blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Total Assessments Captured</span>
          <span className="text-3xl font-heading font-extrabold text-white mt-1 block">{totalProfiles}</span>
          <span className="text-xs text-slate-400 mt-2 block font-mono flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-indigo-400" /> Proctor Sandbox Active
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Verified Top Candidates</span>
          <span className="text-3xl font-heading font-extrabold text-emerald-400 mt-1 block">{totalShortlisted}</span>
          <span className="text-xs text-slate-400 mt-2 block font-mono flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> High technical compliance
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-rose-500/10 to-transparent blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Average Anomaly Index</span>
          <span className={`text-3xl font-heading font-extrabold mt-1 block ${
            avgSuspicionIndex > 30 ? "text-rose-400" : "text-sky-400"
          }`}>{avgSuspicionIndex}%</span>
          <span className="text-xs text-slate-400 mt-2 block font-mono flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-500" /> Focus-loss telemetry flags
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-sky-500/10 to-transparent blur-xl rounded-full" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Core Skill Matching</span>
          <span className="text-3xl font-heading font-extrabold text-sky-400 mt-1 block">{avgTechnicalPerformance}%</span>
          <span className="text-xs text-slate-400 mt-2 block font-mono flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-sky-400" /> Average Technical Score
          </span>
        </div>
      </div>

      {/* Synchronized Core Explanation Toggle ("How is Candidate and Recuiter page same?") */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
        <button
          type="button"
          onClick={() => setExplainRecruiterSync(!explainRecruiterSync)}
          className="text-xs font-mono font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider focus:outline-none cursor-pointer"
        >
          <span className="p-1 rounded bg-indigo-50 border border-indigo-150">💡</span>
          {explainRecruiterSync ? "Hide Alignment Insights" : "How is the Candidate experience aligned with this Dashboard?"}
        </button>

        {explainRecruiterSync && (
          <div className="text-xs text-slate-600 font-sans leading-relaxed pt-1 space-y-2 max-w-4xl">
            <p>
              Both screens share the exact same underlying architecture, database schemas, and AI proctoring engines to form a cohesive system:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-205 border-slate-150 space-y-1">
                <strong className="text-slate-800 font-bold">1. Shared Local Database State</strong>
                <p className="text-[11px] text-slate-500">
                  All proctored sessions, active candidate answers, and generated evaluation metrics read and write to the same central database file (<code>server_db.json</code>).
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-205 border-slate-150 space-y-1">
                <strong className="text-slate-800 font-bold">2. Real-time Telemetry Tracking</strong>
                <p className="text-[11px] text-slate-500">
                  When a candidate switches tabs or looks away, that event is written immediately. Recruiting dashboards pick this up in real-time, matching offsets on the player timeline.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-150 space-y-1">
                <strong className="text-slate-800 font-bold">3. Shared AI Scoring Engine</strong>
                <p className="text-[11px] text-slate-500">
                  The same backend assessment algorithms compute skills matching, language filler percentages, and final risk rankings in perfect cohesion.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Candidate Table, Right Dispatch Box or Details */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Candidates List Column */}
        <div className="xl:col-span-8 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            
            {/* Filter Hub Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <h2 className="text-base font-heading font-bold text-slate-800">Continuous Assessment Review Roll</h2>
              <button 
                onClick={loadReports}
                className="text-xs font-mono text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded shadow-sm transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reload Database
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Query Name or Email address..."
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                />
              </div>

              <div>
                <select 
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                >
                  <option value="all">Filter: All Roles</option>
                  {availablePositions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <select 
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                >
                  <option value="all">Filter: All Statuses</option>
                  <option value="SHORTLISTED">SHORTLISTED</option>
                  <option value="STANDBY">STANDBY</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>

            {/* Candidates Feed Table */}
            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-slate-500 animate-pulse">
                Accessing local database registers...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-slate-500">
                Zero candidate matches. Run a candidate application workspace test.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-widest text-slate-500">
                      <th className="py-3 px-2 w-8">Send</th>
                      <th className="py-3 px-3">Subject</th>
                      <th className="py-3 px-3">Technical Rating</th>
                      <th className="py-3 px-3">Suspicion Risk</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(rep => (
                      <tr 
                        key={rep.id}
                        className={`border-b border-slate-100 text-xs transition-colors hover:bg-slate-50 cursor-pointer ${
                          selectedReport?.id === rep.id ? "bg-indigo-50/50" : ""
                        }`}
                        onClick={() => setSelectedReport(rep)}
                      >
                        <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox"
                            checked={selectedReportIds.includes(rep.id)}
                            onChange={() => handleToggleSelect(rep.id)}
                            className="h-3.5 w-3.5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{rep.candidateName}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{rep.jobTitle}</div>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className="font-bold text-emerald-600">{rep.technicalScore}%</span>
                          <span className="text-[10px] text-slate-500 block">Sem: {rep.semanticRelevance}%</span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className={`font-bold ${rep.suspicionScore > 40 ? "text-rose-600 animate-pulse" : "text-emerald-600"}`}>
                            {rep.suspicionScore}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">Proctor Verified</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                            rep.shortlistStatus === "SHORTLISTED" 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                              : rep.shortlistStatus === "REJECTED"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}>
                            {rep.shortlistStatus}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedReport(rep)}
                            className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-705 hover:text-indigo-600 hover:border-indigo-500 transition-all font-bold shadow-sm"
                          >
                            Review Feed
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* HR Executive Email Dispatch Box */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="mb-2">
              <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-mono font-medium">
                Platform Actionable: Automated HR Verification Alerts
              </span>
              <h3 className="text-base font-heading font-bold text-slate-800 mt-2">Verified Enterprise Shortlist Notification</h3>
              <p className="text-xs text-slate-500">
                Compile and send an email listing the selected candidate evaluations (accompanied by proctor and AI scoring metrics) directly to the lead hiring team.
              </p>
            </div>

            <form onSubmit={handleNotifyHRTeam} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-mono text-slate-550 text-slate-500 uppercase mb-1.5">Destination HR Recruiter Notification Email</label>
                  <input 
                    type="email" 
                    required
                    value={hrEmailRecipient}
                    onChange={(e) => setHrEmailRecipient(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-sans"
                  />
                </div>
                <div className="sm:self-end">
                  <button
                    type="button"
                    onClick={handleSelectAllTop}
                    className="text-xs font-mono text-slate-650 text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-white border border-slate-200 rounded-lg transition-all cursor-pointer"
                  >
                    Select All Shortlisted (Check)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-slate-500">
                  Selected candidates: <strong className="text-indigo-600">{selectedReportIds.length}</strong>
                </span>

                <button
                  type="submit"
                  disabled={selectedReportIds.length === 0 || isSendingEmail}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-heading font-medium py-2 px-5 rounded-lg transition-all flex items-center gap-1.5"
                >
                  {isSendingEmail ? "Assembling with Gemini..." : "Send Verified Shortlist Email"} <Mail className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            {/* Simulated Email Dispatch Success Log */}
             {emailSuccessLog && (
              <div className="p-4 bg-slate-50 border border-indigo-150 border-indigo-200 rounded-xl space-y-3 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between text-[10px] text-emerald-600 border-b border-indigo-100 pb-2">
                  <span className="flex items-center gap-1 font-bold">● EMAIL DISPATCH CONFIRMED RECIPIENT: {emailSuccessLog.to}</span>
                  <span>UTC REPORT</span>
                </div>
                <div className="text-slate-700 leading-relaxed font-sans">{emailSuccessLog.intro}</div>
                <div className="space-y-2 pt-2 border-t border-indigo-100">
                  <p className="text-[10px] text-slate-505 text-slate-500 uppercase tracking-widest font-bold">SHORTLIST BRIEFS ENCLOSED:</p>
                  {emailSuccessLog.candidatesList.map((cand: any, idx: number) => (
                    <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-[10px] flex justify-between items-center shadow-sm">
                      <div>
                        <span className="font-bold text-slate-800">{cand.name}</span> applied for <span className="text-indigo-600">{cand.position}</span>
                        <div className="text-slate-500 font-sans mt-1">{cand.overallRecommendation}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600 font-bold block">TECHNICAL: {cand.scores.technical}%</span>
                        <span className="text-slate-505 text-slate-500 block font-sans">Proctor Anomaly: {cand.scores.suspicion}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Candidate Deep Audit Sidebar */}
        <div className="xl:col-span-4">
          {selectedReport ? (
            <div className="glass-card rounded-2xl p-5 space-y-5 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-heading font-bold text-slate-800">Candidate Integrity Report</h3>
                  <span className="text-[10px] text-slate-500 font-mono">ID Reference: {selectedReport.candidateId}</span>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Bio block */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-heading">
                  <User className="h-4 w-4 text-indigo-650 text-indigo-600" /> {selectedReport.candidateName}
                </div>
                <div className="text-xs text-slate-500">{selectedReport.candidateEmail}</div>
                <div className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded inline-block mt-1">
                  Position Applied: <span className="text-indigo-600 font-bold">{selectedReport.jobTitle}</span>
                </div>
              </div>

              {/* High precision stats breakdown */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[9px] font-mono text-slate-500 font-semibold block">TECHNICAL SCORE</span>
                  <span className="text-lg font-heading font-bold text-slate-900 block mt-0.5">{selectedReport.technicalScore}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[9px] font-mono text-slate-500 font-semibold block">SEMANTIC COMPLY</span>
                  <span className="text-lg font-heading font-bold text-indigo-600 block mt-0.5">{selectedReport.semanticRelevance}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[9px] font-mono text-slate-500 font-semibold block">SPEECH CONFIDENCE</span>
                  <span className="text-lg font-heading font-bold text-sky-600 block mt-0.5">{selectedReport.confidenceScore}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-sm">
                  <span className="text-[9px] font-mono text-slate-500 font-semibold block">SUSPICION LEVEL</span>
                  <span className={`text-lg font-heading font-bold block mt-0.5 ${
                    selectedReport.suspicionScore > 40 ? "text-rose-600 animate-pulse font-extrabold" : "text-emerald-600"
                  }`}>{selectedReport.suspicionScore}%</span>
                </div>
              </div>

              {/* Simulated Record Playback */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-rose-500" /> Proctor Webcam Sandbox playback feed
                </span>
                
                {/* Webcam Visual screen */}
                <div className={`relative aspect-video rounded-2xl bg-slate-950 border-2 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 shadow-inner ${
                  activeAnomaly 
                    ? "border-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                    : "border-slate-800"
                }`}>
                  {/* Subtle Grid overlay representing digital tracking dashboard */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />
                  
                  {/* Live Scanlines effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-20" />

                  {/* Top indicators */}
                  <div className="absolute top-2.5 left-3 right-3 flex justify-between items-center z-20">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-[8px] text-slate-300 font-mono tracking-wider flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
                      PLAYHEAD: 0:{(playbackSeconds).toString().padStart(2, "0")}s / 0:90s
                    </span>

                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border tracking-wider uppercase font-bold ${
                      activeAnomaly
                        ? "bg-rose-950/80 border-rose-500 text-rose-400 animate-bounce"
                        : "bg-slate-900/80 border-slate-700 text-slate-400"
                    }`}>
                      {activeAnomaly ? `⚠ ANOMALY: ${activeAnomaly.type.replace("_", " ")}` : "● PROCTOR SECURE"}
                    </span>
                  </div>

                  {/* Active Anomaly Overlays or standard face mesh tracking */}
                  {activeAnomaly ? (
                    <div className="absolute inset-0 bg-rose-950/50 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-4 z-10 text-center space-y-3">
                      <AlertTriangle className="h-10 w-10 text-rose-500 animate-pulse" />
                      <div>
                        <span className="px-2 py-0.5 rounded bg-rose-900 border border-rose-500 text-[9px] text-rose-200 font-mono font-bold uppercase tracking-wider">
                          {activeAnomaly.severity.toUpperCase()} ALERT FLAG
                        </span>
                        <p className="text-[11px] text-white font-bold font-sans mt-1.5 max-w-[240px] leading-snug drop-shadow-md">
                          {activeAnomaly.description}
                        </p>
                      </div>

                      <button
                        id="download-active-clip"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadClip(activeAnomaly, selectedReport.candidateName);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] font-bold flex items-center gap-1.5 inline-block cursor-pointer transition-all border border-rose-400 shadow-lg transform hover:scale-105"
                      >
                        <Download className="h-3 w-3" />
                        Download Event Clip
                      </button>
                    </div>
                  ) : (
                    /* General tracker layout when secure */
                    <div className="relative flex flex-col items-center justify-center z-10">
                      {/* Bounding box corners mimicking face tracker */}
                      <div className="absolute -inset-6 border border-emerald-500/30 rounded-full animate-pulse pointer-events-none" />
                      <div className="absolute -top-10 -left-10 h-4 w-4 border-t-2 border-l-2 border-emerald-500/65" />
                      <div className="absolute -top-10 -right-10 h-4 w-4 border-t-2 border-r-2 border-emerald-500/65" />
                      <div className="absolute -bottom-10 -left-10 h-4 w-4 border-b-2 border-l-2 border-emerald-500/65" />
                      <div className="absolute -bottom-10 -right-10 h-4 w-4 border-b-2 border-r-2 border-emerald-500/65" />

                      {/* Mock avatar */}
                      <div className="h-14 w-14 rounded-full bg-indigo-50/10 border-2 border-indigo-550 border-indigo-500/50 flex items-center justify-center font-extrabold text-base text-white shadow-lg backdrop-blur-xs">
                        {selectedReport.candidateName.split(" ").map(w => w[0]).join("")}
                      </div>

                      {/* Reticle coordinates */}
                      <span className="font-mono text-[7px] text-emerald-400 mt-2 tracking-widest block bg-slate-900/50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        X: 421.15 • Y: 290.04 • GAZ: OK
                      </span>
                    </div>
                  )}

                  {/* Digital status bars */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[8px] font-mono text-slate-400 z-10 w-auto">
                    <span>BIOMETRIC INDEX: {selectedReport.confidenceScore}%</span>
                    <span>FPS: 30.0 • INTEGRITY COHESION</span>
                  </div>
                </div>

                {/* Player Controller Bars */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-sm">
                  {/* Seeker Scrubber area */}
                  <div className="space-y-1">
                    <div className="relative flex items-center h-4">
                      <input 
                        type="range"
                        min={0}
                        max={90}
                        value={playbackSeconds}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPlaybackSeconds(val);
                          // Sync active alert highlighting based on closest timeline event
                          const directHit = selectedReport.suspiciousActivities?.find(act => (act.videoOffsetSeconds ?? 0) === val);
                          if (directHit) {
                            setActiveAlertId(directHit.id);
                          } else {
                            // Find any active block anomaly
                            const activeBlock = selectedReport.suspiciousActivities?.find(act => Math.abs((act.videoOffsetSeconds ?? 0) - val) <= 3);
                            setActiveAlertId(activeBlock ? activeBlock.id : null);
                          }
                        }}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                      />

                      {/* Tick Marks corresponding to alert timelines pinned on timeline */}
                      {selectedReport.suspiciousActivities?.map((act, idx) => {
                        const seconds = act.videoOffsetSeconds ?? 0;
                        const percent = (seconds / 90) * 100;
                        const highlight = activeAnomaly?.id === act.id;
                        return (
                          <button
                            key={act.id}
                            onClick={() => {
                              setPlaybackSeconds(seconds);
                              setActiveAlertId(act.id);
                              setIsPlaying(true);
                            }}
                            className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 cursor-pointer border-2 border-white shadow-md focus:outline-none z-20 transition-all ${
                              highlight 
                                ? "bg-rose-500 scale-125 ring-2 ring-rose-450 ring-rose-300" 
                                : act.severity === "high" 
                                ? "bg-rose-600" 
                                : "bg-amber-500"
                            }`}
                            style={{ left: `${percent}%` }}
                            title={`${act.type}: ${act.description}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Play Pause Trigger control */}
                  <div className="flex flex-col sm:flex-row gap-2.5 justify-between sm:items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isPlaying 
                            ? "bg-amber-500 border-amber-600 text-white" 
                            : "bg-indigo-600 border-indigo-700 text-white shadow-sm"
                        }`}
                        title={isPlaying ? "Pause Playback" : "Play Biometric Feed"}
                      >
                        {isPlaying ? (
                          <span className="block h-3.5 w-3.5 font-mono text-[9px] font-bold flex items-center justify-center">||</span>
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setPlaybackSeconds(0);
                          setIsPlaying(false);
                          setActiveAlertId(null);
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-705 text-slate-600 bg-white text-[10px] font-mono hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Reset Track
                      </button>
                    </div>

                    {/* Standard Playback Speed Controls */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-0.5 rounded-lg text-[9px] font-mono shadow-inner">
                      <span className="text-[8px] text-slate-400 px-1 font-bold">SPEED:</span>
                      {[0.5, 1, 1.5, 2].map((sp) => (
                        <button
                          key={sp}
                          onClick={() => setPlaybackSpeed(sp)}
                          className={`px-1.5 py-0.5 rounded-md font-extrabold cursor-pointer transition-all ${
                            playbackSpeed === sp
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 justify-end">
                      <span>Playback:</span>
                      <strong className="text-slate-700">0:{(playbackSeconds).toString().padStart(2, "0")}</strong>
                      <span className="text-slate-300">/</span>
                      <span>0:90</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proctor alerts Timeline */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono text-amber-600 font-bold uppercase tracking-widest block flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Proctoring telemetry log timeline
                  </span>
                  <span className="text-[9px] text-slate-500 font-sans">
                    Click an alert to jump to video timestamp
                  </span>
                </div>

                {selectedReport.suspiciousActivities && selectedReport.suspiciousActivities.length > 0 ? (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {selectedReport.suspiciousActivities.map((act) => {
                      const offsetSeconds = act.videoOffsetSeconds ?? 0;
                      const isHighlighted = activeAlertId === act.id || activeAnomaly?.id === act.id;
                      
                      return (
                        <div
                          key={act.id}
                          onClick={() => {
                            setPlaybackSeconds(offsetSeconds);
                            setActiveAlertId(act.id);
                            setIsPlaying(true);
                          }}
                          className={`p-2.5 rounded-lg border transition-all text-[10px] space-y-1 cursor-pointer flex flex-col ${
                            isHighlighted
                              ? "bg-rose-50 border-rose-500 shadow-sm ring-1 ring-rose-300"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-mono text-[9px] text-slate-500 font-bold flex items-center gap-1">
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                act.severity === "high" ? "bg-rose-500" : act.severity === "medium" ? "bg-amber-500" : "bg-sky-500"
                              }`} />
                              Offset 0:{offsetSeconds.toString().padStart(2, "0")}
                            </span>

                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-extrabold border ${
                              act.severity === "high"
                                ? "bg-rose-50 border-rose-250 border-rose-200 text-rose-750 text-rose-700"
                                : act.severity === "medium"
                                ? "bg-amber-50 border-amber-250 text-amber-700"
                                : "bg-sky-50 border-sky-200 text-sky-700"
                            }`}>
                              {act.severity.toUpperCase()} ALERT
                            </span>
                          </div>

                          <div className="text-slate-800 font-bold text-[10.5px]">
                            {act.type.toUpperCase().replace("_", " ")}
                          </div>

                          <p className="text-slate-605 text-slate-600 text-[10px] font-sans leading-relaxed">
                            {act.description}
                          </p>

                          <button
                            id={`download-clip-${act.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadClip(act, selectedReport.candidateName);
                            }}
                            className="mt-2 self-start flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-slate-100 hover:bg-indigo-650 font-mono text-[8px] font-semibold transition-all cursor-pointer shadow-sm hover:scale-[1.03]"
                            title="Download evidence telemetry payload clip"
                          >
                            <Download className="h-2.5 w-2.5" />
                            Download Clip
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-white border border-slate-200 rounded-lg text-center text-[10px] text-slate-400 font-mono">
                    ● Zero suspicion indicators captured. Absolute record compliance.
                  </div>
                )}

                <div className="border-t border-slate-200/60 pt-2 flex justify-between items-center text-[9px] font-mono text-slate-400">
                  <span>Proctor Strictness: Warning Mode</span>
                  <span>Calculated Suspicion Score: {selectedReport.suspicionScore}%</span>
                </div>
              </div>

              {/* AI qualitative recommendations */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Executive Summary Scorecard</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedReport.qualitativeNotes?.overallRecommendation}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Evaluation per Answer</span>
                  {selectedReport.answersEvaluated?.map((ans, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-205 border-slate-200 rounded-lg text-[10px] space-y-1.5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 block truncate max-w-[150px]">{ans.questionText}</span>
                        <span className="text-emerald-600 font-mono font-bold shrink-0">Score: {ans.score}%</span>
                      </div>
                      <div className="text-slate-605 text-slate-600 leading-relaxed font-sans mt-1">
                        {ans.aiRationallyScored}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center text-xs font-mono text-slate-505 text-slate-500 py-16 space-y-3">
              <Eye className="h-8 w-8 text-indigo-400 mx-auto" />
              <div>Select a candidate profile to launch the Proctor telemetry feed and check structured NLP evaluations.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
