/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, 
  UserCheck, KeyRound, Sparkles, AlertCircle 
} from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLoginSuccess: (name: string, email: string, persona: "recruiter" | "candidate") => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [persona, setPersona] = useState<"recruiter" | "candidate">("recruiter");
  const [name, setName] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorText("Please state a valid Email address to request authorization.");
      return;
    }
    if (!password || password.length < 4) {
      setErrorText("Passwords must be at least 4 characters long for security compliance.");
      return;
    }

    setIsSubmitting(true);
    setErrorText("");

    // Simulate database lookup latency
    setTimeout(() => {
      setIsSubmitting(false);
      const calculatedName = name.trim() || (persona === "recruiter" ? "Hrishikesh Patel" : "Sarah Jenkins");
      onLoginSuccess(calculatedName, email.trim(), persona);
    }, 850);
  };

  const triggerQuickFill = (role: "recruiter" | "candidate") => {
    if (role === "recruiter") {
      setEmail("recruiter-lead@enterprise.com");
      setPassword("hr-sandbox-secure");
      setName("Hrishikesh Patel");
      setPersona("recruiter");
    } else {
      setEmail("sarah.jenkins@enterprise-recruit.com");
      setPassword("candidate-room-404");
      setName("Sarah Jenkins");
      setPersona("candidate");
    }
    setErrorText("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 flex-col relative overflow-hidden">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent top-0" />

      {/* Main card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white border border-slate-200/80 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.1)] rounded-3xl p-6 md:p-8 relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-11 w-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
              hire AI Portal
            </h2>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Identity Verification Platform
            </p>
          </div>
        </div>

        {/* Demo Quick Fills */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
          <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest block font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" /> Sandbox Quick-Sign-In accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerQuickFill("recruiter")}
              className="p-2 bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left text-[10px] cursor-pointer transition-all flex flex-col justify-between group shadow-xs"
            >
              <span className="text-indigo-600 font-bold block mb-0.5 font-sans group-hover:translate-x-0.5 transition-transform">Recruiter Sandbox</span>
              <span className="text-[9px] text-slate-400 font-mono truncate">recruiter-lead@enterprise.com</span>
            </button>
            <button
              onClick={() => triggerQuickFill("candidate")}
              className="p-2 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-[10px] cursor-pointer transition-all flex flex-col justify-between group shadow-xs"
            >
              <span className="text-emerald-600 font-bold block mb-0.5 font-sans group-hover:translate-x-0.5 transition-transform">Candidate Sandbox</span>
              <span className="text-[9px] text-slate-400 font-mono truncate">sarah.jenkins@enterprise-recruit.com</span>
            </button>
          </div>
        </div>

        {/* Traditional credentials form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Persona select */}
          <div className="space-y-1.5">
            <label className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Access Credentials Level
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setPersona("recruiter")}
                className={`py-2 rounded-xl text-[10.5px] font-bold font-sans cursor-pointer transition-all ${
                  persona === "recruiter"
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Recruiter View
              </button>
              <button
                type="button"
                onClick={() => setPersona("candidate")}
                className={`py-2 rounded-xl text-[10.5px] font-bold font-sans cursor-pointer transition-all ${
                  persona === "candidate"
                    ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Candidate Room
              </button>
            </div>

            {/* Role-spec privileges details demonstrating variation */}
            <div className={`p-2.5 rounded-xl text-[10px] border leading-relaxed font-sans ${
              persona === "recruiter" 
                ? "bg-indigo-50/40 border-indigo-100 text-indigo-950" 
                : "bg-emerald-50/40 border-emerald-100 text-emerald-950"
            }`}>
              <div className="font-bold uppercase text-[8px] font-mono tracking-wider mb-1">
                Authorized Workspace Access Rights:
              </div>
              {persona === "recruiter" ? (
                <ul className="list-disc pl-3.5 space-y-0.5">
                  <li className="font-medium">Full Interactive Recruiter Assessment Suite & dashboards</li>
                  <li className="font-medium">Proctored event telemetry timelines & custom clips download</li>
                  <li className="font-medium">Global AI strictness controls & sandbox threshold updates</li>
                </ul>
              ) : (
                <ul className="list-disc pl-3.5 space-y-0.5">
                  <li className="font-medium">Exclusively restricted to assigned Interview Technical Chamber</li>
                  <li className="font-medium">Direct practice sandbox, sample tests, and personalized results</li>
                  <li className="font-medium">Interactive AI Coaching & "Improversion" study guides</li>
                </ul>
              )}
            </div>
          </div>

          {/* Direct Custom Name Input */}
          <div className="space-y-1">
            <label className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Full Name <span className="text-slate-300 lowercase italic font-sans">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={persona === "recruiter" ? "Hrishikesh Patel" : "Sarah Jenkins"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs py-2 px-3 pl-8 text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all"
              />
              <UserCheck className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Authorization Email ID
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="identity-audit@organization.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs py-2 px-3 pl-8 text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all"
              />
              <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-[9.5px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Cryptographic Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs py-2 px-3 pl-8 pr-10 text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 focus:outline-none transition-all"
              />
              <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Validation Feedback Errors */}
          {errorText && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-[10px] text-rose-750 text-rose-700 font-sans flex items-start gap-1.5 animate-shake">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-normal">{errorText}</p>
            </div>
          )}

          {/* Sign In submit trigger button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-xl font-heading text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isSubmitting 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10 hover:shadow-indigo-500/20 active:translate-y-px"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="border-2 border-slate-100 border-t-transparent rounded-full h-3 w-3 animate-spin" />
                Validating Authorization...
              </span>
            ) : (
              <>
                Authorize Environment Access
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-[9px] text-slate-400 font-sans text-center leading-relaxed">
          Security warning: Unauthenticated access is recorded. Authorized user activities are monitored in compliance with corporate privacy regulations & GD-PR norms.
        </p>
      </motion.div>
    </div>
  );
}
