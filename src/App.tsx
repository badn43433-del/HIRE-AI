/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, FileText, LogOut, ShieldAlert, RefreshCw } from "lucide-react";

import AuthPortal from "./components/auth/AuthPortal";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CandidatePortal from "./components/candidate/CandidatePortal";
import InterviewerPortal from "./components/interviewer/InterviewerPortal";
import ReportsHub from "./components/reports/ReportsHub";
import ThemeToggle from "./components/common/ThemeToggle";
import AIChatAssistant from "./components/common/AIChatAssistant";

import { useAuth } from "./context/AuthContext";
import { UserRole, AIEvaluationReport } from "./types";
import { fetchReports } from "./supabaseClient";
import { detectBrowserExtensions, ExtensionDetectionResult } from "./utils/extensionDetector";

export default function App() {
  const {
    isAuthenticated,
    isLoading,
    userRole,
    userName,
    userEmail,
    loginSession,
    logout,
    switchRole,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [reports, setReports] = useState<AIEvaluationReport[]>([]);
  const [extensionLock, setExtensionLock] = useState<ExtensionDetectionResult>(() => detectBrowserExtensions());

  useEffect(() => {
    const check = () => setExtensionLock(detectBrowserExtensions());
    check();
    const timer = setInterval(check, 3000);
    return () => clearInterval(timer);
  }, []);

  const loadReports = () => {
    fetchReports()
      .then((data) => {
        setReports(data.sort((a: any, b: any) => a.finalRank - b.finalRank));
      })
      .catch((err) => {
        console.error("Error loading reports", err);
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleLoginSuccess = (name: string, email: string, role: UserRole, userId?: string) => {
    loginSession(name, email, role, userId);
    const fromPath = (location.state as any)?.from?.pathname;
    navigate(fromPath && fromPath !== "/login" ? fromPath : `/${role}`, { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSwitchRole = (newRole: UserRole) => {
    switchRole(newRole);
    navigate(`/${newRole}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-indigo-400 animate-pulse" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest">Initializing HireShield AI...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPortal onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" state={{ from: location }} replace />} />
      </Routes>
    );
  }

  if (extensionLock.detected) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/60 rounded-3xl p-7 shadow-2xl space-y-5 text-center">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7 text-rose-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-heading font-extrabold text-rose-300">
              Browser Extension Detected
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              HireShield AI requires a clean browser environment. Disable all browser extensions (or use Incognito with extensions disabled) to continue.
            </p>
          </div>
          <ul className="text-left bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-rose-300 space-y-1">
            {extensionLock.findings.map((f, idx) => (
              <li key={idx}>• {f.name}: {f.reason}</li>
            ))}
          </ul>
          <div className="flex gap-2.5">
            <button
              onClick={() => setExtensionLock(detectBrowserExtensions())}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-scan Browser</span>
            </button>
            <button
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl border border-rose-700 hover:bg-rose-950 text-rose-300 font-bold text-xs cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isReportsPage = location.pathname === "/reports";

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
            {/* Direct Role Switcher */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              {(["candidate", "interviewer"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleSwitchRole(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    userRole === r && !isReportsPage
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
              onClick={() => navigate(isReportsPage ? `/${userRole}` : "/reports")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                isReportsPage
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isReportsPage ? "Back to Dashboard" : "Reports Hub"}
              </span>
            </button>

            <ThemeToggle />

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                {userName.split(" ").map((w) => w[0]).join("")}
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

      {/* Mobile Role Switcher (< md) */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-center gap-2">
        {(["candidate", "interviewer"] as UserRole[]).map((r) => (
          <button
            key={r}
            onClick={() => handleSwitchRole(r)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
              userRole === r && !isReportsPage
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Protected Routes */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 relative z-10">
        <Routes>
          <Route
            path="/login"
            element={<Navigate to={`/${userRole}`} replace />}
          />
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <CandidatePortal
                  candidateName={userName}
                  candidateEmail={userEmail}
                  reports={reports}
                  onRefreshReports={loadReports}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviewer"
            element={
              <ProtectedRoute allowedRoles={["interviewer"]}>
                <InterviewerPortal
                  interviewerName={userName}
                  interviewerEmail={userEmail}
                  reports={reports}
                  onStartLiveInterview={() => handleSwitchRole("candidate")}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["candidate", "interviewer"]}>
                <ReportsHub reports={reports} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={`/${userRole}`} replace />} />
        </Routes>
      </main>

      {/* Floating Groq-Powered AI Chat Assistant */}
      <AIChatAssistant userRole={userRole} userName={userName} />
    </div>
  );
}
