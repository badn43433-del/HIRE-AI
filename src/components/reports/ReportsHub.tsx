/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, Award, ShieldCheck, Download, Search, 
  Sparkles, ExternalLink, Filter, CheckCircle2, AlertTriangle, 
  Printer, ArrowRight, UserCheck, Video
} from "lucide-react";
import { AIEvaluationReport } from "../../types";

interface ReportsHubProps {
  reports: AIEvaluationReport[];
  onSelectReport?: (report: AIEvaluationReport) => void;
}

export default function ReportsHub({ reports, onSelectReport }: ReportsHubProps) {
  const [selectedReport, setSelectedReport] = useState<AIEvaluationReport | null>(reports[0] || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!selectedReport && reports.length > 0) {
      setSelectedReport(reports[0]);
    }
  }, [reports, selectedReport]);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "ALL" || r.shortlistStatus === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> AI Telemetry & Evaluation Scorecards
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 dark:text-white mt-1">
            Enterprise Technical Reports Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated qualitative synthesis, rubric grades, and cryptographic integrity audit trails.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 self-start sm:self-center shadow-xs"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Filter & Report List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-4 shadow-sm space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates or roles..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-1.5">
              {["ALL", "SHORTLISTED", "STANDBY", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer text-center ${
                    statusFilter === st
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Report Cards List */}
            <div className="space-y-2 pt-1 max-h-[520px] overflow-y-auto">
              {filteredReports.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  No evaluation reports match your filter.
                </div>
              ) : (
              filteredReports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedReport?.id === r.id
                      ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{r.candidateName}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      r.shortlistStatus === "SHORTLISTED"
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}>
                      {r.shortlistStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{r.jobTitle}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span>Rank: #{r.finalRank || 1}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Trust: {100 - r.suspicionScore}%
                    </span>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>

        {/* Right: Detailed Selected Report View (8 cols) */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-heading font-extrabold text-slate-900 dark:text-white">
                      {selectedReport.candidateName}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
                      {selectedReport.shortlistStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {selectedReport.jobTitle} • {selectedReport.candidateEmail}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-center font-mono">
                    <span className="text-[9px] uppercase text-slate-400 block font-bold">Overall Match</span>
                    <span className="text-lg font-heading font-extrabold text-indigo-600 dark:text-indigo-400">
                      {selectedReport.semanticRelevance}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Skill Scores Bar Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Technical</span>
                  <span className="text-xl font-heading font-extrabold text-indigo-600 dark:text-indigo-400">
                    {selectedReport.technicalScore}/100
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Communication</span>
                  <span className="text-xl font-heading font-extrabold text-sky-600 dark:text-sky-400">
                    {selectedReport.communicationScore}/100
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Confidence</span>
                  <span className="text-xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400">
                    {selectedReport.confidenceScore}/100
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Proctor Trust</span>
                  <span className="text-xl font-heading font-extrabold text-teal-600 dark:text-teal-400">
                    {100 - selectedReport.suspicionScore}%
                  </span>
                </div>
              </div>

              {/* Qualitative Notes */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" /> AI Executive Synthesis
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {selectedReport.qualitativeNotes?.overallRecommendation || "Candidate exhibited strong mastery across technical questions with solid problem framing."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-indigo-100 dark:border-indigo-900/60 text-xs">
                  <div>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono block mb-1">Key Strengths:</strong>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                      {selectedReport.qualitativeNotes?.strengths?.map((s, i) => (
                        <li key={i}>{s}</li>
                      )) || <li>Strong architecture reasoning</li>}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-amber-600 dark:text-amber-400 font-mono block mb-1">Growth Opportunities:</strong>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                      {selectedReport.qualitativeNotes?.weaknesses?.map((w, i) => (
                        <li key={i}>{w}</li>
                      )) || <li>Dive deeper into low-level browser garbage collection</li>}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Question-by-Question Evaluation Accordion */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                  Question-by-Question Scored Answers
                </h4>

                <div className="space-y-3">
                  {selectedReport.answersEvaluated?.map((ans, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          QUESTION {idx + 1}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-white">
                          Score: {ans.score}/100
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{ans.questionText}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 italic">
                        "{ans.candidateAnswer}"
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        AI Evaluator Critique: {ans.aiRationallyScored}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select a candidate report from the left panel to inspect full metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
