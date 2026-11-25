/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, LayoutGrid, Award, FileText, Video, 
  HelpCircle, Bell, User, Settings, Sparkles, Activity, 
  LogOut, Users, BarChart3, Terminal, ShieldAlert, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import AuthPortal from "./components/auth/AuthPortal";
import CandidatePortal from "./components/candidate/CandidatePortal";
import InterviewerPortal from "./components/interviewer/InterviewerPortal";
import ReportsHub from "./components/reports/ReportsHub";
import ThemeToggle from "./components/common/ThemeToggle";
import AIChatAssistant from "./components/common/AIChatAssistant";

import { UserRole, AIEvaluationReport, ScheduledInterview } from "./types";
import { fetchReports, updateReportStatus } from "./supabaseClient";
import { MOCK_SCHEDULED_INTERVIEWS } from "./mockData";

export default function App() {
  // Authentication & Session State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("hireshield_is_logged_in") === "true";
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("hireshield_role");
    if (saved === "candidate" || saved === "interviewer") {
      return saved;
    }
    return "candidate";
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("hireshield_user_name") || "Sarah Jenkins";
  });

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("hireshield_user_email") || "sarah.jenkins@enterprise-recruit.com";
  });

  // Global Reports & Data
  const [reports, setReports] = useState<AIEvaluationReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Active top-level subtab (e.g. for switching between Reports Hub, Portal, etc.)
  const [activeMainTab, setActiveMainTab] = useState<string>("portal");

  const loadReports = () => {
    setLoading(true);
    fetchReports()
      .then(data => {
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

  const handleLoginSuccess = (name: string, email: string, role: UserRole) => {
    localStorage.setItem("hireshield_is_logged_in", "true");
    localStorage.setItem("hireshield_user_name", name);
    localStorage.setItem("hireshield_user_email", email);
    localStorage.setItem("hireshield_role", role);

    setIsLoggedIn(true);
    setUserName(name);
    setUserEmail(email);
    setUserRole(role);
    setActiveMainTab("portal");
  };

  const handleLogout = () => {
    localStorage.removeItem("hireshield_is_logged_in");
    localStorage.removeItem("hireshield_user_name");
    localStorage.removeItem("hireshield_user_email");
    localStorage.removeItem("hireshield_role");
    setIsLoggedIn(false);
  };

  const switchRole = (newRole: UserRole) => {
    setUserRole(newRole);
    localStorage.setItem("hireshield_role", newRole);
    if (newRole === "candidate") {
      setUserName("Sarah Jenkins");
      setUserEmail("sarah.jenkins@enterprise-recruit.com");
    } else {
      setUserName("Marcus Vance");
      setUserEmail("marcus.vance@techcorp.io");
    }
  };

  if (!isLoggedIn) {
    return <AuthPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Decorative backdrop mesh */}
      <div className="fixed inset-0 bg-[radial-gradient(#6366f108_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Primary Enterprise App Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-heading font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 dark:from-indigo-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  HireShield AI
                </h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  LIVE
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
                Enterprise Technical Interview Suite
              </p>
            </div>
          </div>

          {/* Quick Role Switcher Pill & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Role Switcher (For Pair Testing & Evaluation) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              {(["candidate", "interviewer"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    userRole === r
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Global Reports Hub Nav button */}
            <button
              onClick={() => setActiveMainTab(activeMainTab === "portal" ? "reports_hub" : "portal")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeMainTab === "reports_hub"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {activeMainTab === "reports_hub" ? "Back to Dashboard" : "Reports Hub"}
              </span>
            </button>

            {/* Dark/Light Mode Theme Switcher */}
            <ThemeToggle />

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                {userName.split(" ").map(w => w[0]).join("")}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block font-sans text-xs text-slate-800 dark:text-slate-200 font-bold max-w-[110px] truncate leading-tight">
                  {userName}
                </span>
                <span className="block text-[9px] font-mono text-indigo-500 uppercase leading-none">
                  {userRole}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              id="header-logout-btn"
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeMainTab === "reports_hub" ? (
            <motion.div
              key="reports_hub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ReportsHub reports={reports} />
            </motion.div>
          ) : (
            <motion.div
              key={userRole}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Role-Specific Portal Module Rendering */}
              {userRole === "candidate" && (
                <CandidatePortal
                  candidateName={userName}
                  candidateEmail={userEmail}
                  reports={reports}
                  onRefreshReports={loadReports}
                />
              )}

              {userRole === "interviewer" && (
                <InterviewerPortal
                  interviewerName={userName}
                  interviewerEmail={userEmail}
                  reports={reports}
                  onStartLiveInterview={(interview) => {
                    // Switch to candidate live room for interactive demo
                    switchRole("candidate");
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Groq-Powered AI Chat Assistant */}
      <AIChatAssistant userRole={userRole} userName={userName} />
    </div>
  );
}
