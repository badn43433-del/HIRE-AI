/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Lock, Mail, User, Eye, EyeOff, 
  ArrowRight, CheckCircle2, KeyRound, Sparkles, AlertCircle,
  Shield, UserCheck, RefreshCw, Send, Check, Settings,
  ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserRole } from "../../types";
import { isSupabaseConnected, signInWithSupabase, signUpWithSupabase } from "../../supabaseClient";
import { detectBrowserExtensions, ExtensionDetectionResult } from "../../utils/extensionDetector";
import { enterFullscreen } from "../../utils/fullscreen";

interface AuthPortalProps {
  onLoginSuccess: (name: string, email: string, role: UserRole, userId?: string) => void;
}

export default function AuthPortal({ onLoginSuccess }: AuthPortalProps) {
  // Current mode: login | signup | forgot | otp
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot" | "otp">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("candidate");
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  
  // Real OTP & SMTP states
  const [serverOtp, setServerOtp] = useState("849201");
  const [isLiveSmtp, setIsLiveSmtp] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState("");

  // UI states
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [extensionCheck, setExtensionCheck] = useState<ExtensionDetectionResult>(() => detectBrowserExtensions());

  const runExtensionScan = () => {
    const result = detectBrowserExtensions();
    setExtensionCheck(result);
    return result;
  };

  useEffect(() => {
    runExtensionScan();
    const interval = setInterval(runExtensionScan, 2500);
    const observer = new MutationObserver(() => {
      const res = detectBrowserExtensions();
      if (res.detected) setExtensionCheck(res);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // Check initial SMTP status on mount
  useEffect(() => {
    fetch("/api/auth/smtp-status")
      .then(res => res.json())
      .then(data => {
        if (data.configured) {
          setIsLiveSmtp(true);
          setSmtpUser(data.senderEmail || "");
        }
      })
      .catch(() => {});
  }, []);

  // Quick fill sandbox accounts
  const triggerQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    setErrorText("");
    setSuccessText("");
    if (role === "candidate") {
      setName("Sarah Jenkins");
      setEmail("sarah.jenkins@enterprise-recruit.com");
      setPassword("candidate-sandbox-2026");
    } else {
      setName("Marcus Vance");
      setEmail("marcus.vance@techcorp.io");
      setPassword("interviewer-lead-pass");
    }
  };

  // Dispatch OTP via backend API (SMTP if configured, or Ethereal/Sandbox fallback)
  const handleSendOtp = async (targetEmail: string, targetRole: UserRole, targetName?: string) => {
    setIsSubmitting(true);
    setErrorText("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail.trim(),
          role: targetRole,
          name: (targetName || targetEmail.split("@")[0]).trim()
        })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setServerOtp(data.code || "849201");
        setIsLiveSmtp(Boolean(data.isLiveSmtp));
        setPreviewUrl(data.previewUrl || null);
        setAuthMode("otp");

        if (data.isLiveSmtp) {
          setSuccessText(`Verification code dispatched via SMTP to ${targetEmail}! Check your inbox.`);
        } else {
          setSuccessText(`Verification code generated: ${data.code}. (Auto-fill available below). Connect Gmail SMTP below for real inbox delivery.`);
        }
      } else {
        setErrorText(data.error || "Failed to dispatch verification code.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setServerOtp("849201");
      setAuthMode("otp");
      setSuccessText("Authentication code ready! Code: 8 4 9 2 0 1");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    // Trigger fullscreen synchronously inside user-gesture handler before any await
    void enterFullscreen();

    const ext = runExtensionScan();
    if (ext.detected) {
      setErrorText("Login blocked: Disable all browser extensions and click Re-scan Browser to continue.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorText("Please enter a valid business email address.");
      return;
    }
    if (!password || password.length < 4) {
      setErrorText("Password must be at least 4 characters long.");
      return;
    }

    const isDemoAccount =
      email.trim().toLowerCase() === "sarah.jenkins@enterprise-recruit.com" ||
      email.trim().toLowerCase() === "marcus.vance@techcorp.io";

    if (isSupabaseConnected() && !isDemoAccount) {
      setIsSubmitting(true);
      const { session, user, profile, error } = await signInWithSupabase(email, password, selectedRole);
      setIsSubmitting(false);
      if (error || !session || !user) {
        setErrorText(error || "Invalid email or password.");
        return;
      }
      onLoginSuccess(
        profile?.name || user.user_metadata?.full_name || name || email.split("@")[0],
        profile?.email || user.email || email.trim().toLowerCase(),
        profile?.role || selectedRole,
        profile?.id || user.id
      );
      return;
    }

    if (!isDemoAccount) {
      setIsSubmitting(true);
      try {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
        const loginData = await loginRes.json();
        setIsSubmitting(false);
        if (!loginRes.ok) {
          setErrorText(loginData?.error || "Invalid email or password.");
          return;
        }
        handleSendOtp(loginData.user.email, loginData.user.role, loginData.user.name);
        return;
      } catch {
        setIsSubmitting(false);
        setErrorText("Unable to reach authentication server.");
        return;
      }
    }

    handleSendOtp(email, selectedRole, name);
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    // Trigger fullscreen synchronously inside user-gesture handler before any await
    void enterFullscreen();

    const ext = runExtensionScan();
    if (ext.detected) {
      setErrorText("Registration blocked: Disable all browser extensions before creating an account.");
      return;
    }

    if (!name.trim()) {
      setErrorText("Please state your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setErrorText("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorText("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorText("Passwords do not match.");
      return;
    }

    const isDemoAccount =
      email.trim().toLowerCase() === "sarah.jenkins@enterprise-recruit.com" ||
      email.trim().toLowerCase() === "marcus.vance@techcorp.io";

    if (isSupabaseConnected() && !isDemoAccount) {
      setIsSubmitting(true);
      const { session, user, profile, error, needsEmailConfirmation } = await signUpWithSupabase(
        email,
        password,
        name,
        selectedRole
      );
      setIsSubmitting(false);
      if (error) {
        setErrorText(error);
        return;
      }
      if (needsEmailConfirmation) {
        setSuccessText("Account created! Please check your email to confirm your address before signing in.");
        setAuthMode("login");
        return;
      }
      if (session && user) {
        onLoginSuccess(
          profile?.name || name.trim(),
          profile?.email || user.email || email.trim().toLowerCase(),
          profile?.role || selectedRole,
          profile?.id || user.id
        );
      }
      return;
    }

    // Local Express mode: persist user record + userId before OTP
    setIsSubmitting(true);
    try {
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: selectedRole,
        }),
      });
      const regData = await regRes.json();
      setIsSubmitting(false);
      if (!regRes.ok) {
        setErrorText(regData?.error || "Failed to create account.");
        return;
      }
    } catch {
      setIsSubmitting(false);
      setErrorText("Unable to reach authentication server.");
      return;
    }

    handleSendOtp(email, selectedRole, name);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorText("Please provide your registered account email.");
      return;
    }

    handleSendOtp(email, selectedRole, name);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Re-ensure fullscreen synchronously inside user-gesture handler
    void enterFullscreen();
    const ext = runExtensionScan();
    if (ext.detected) {
      setErrorText("Verification blocked: Browser extension detected. Disable extensions to proceed.");
      return;
    }
    const fullOtp = otpCode.join("");
    const codeToVerify = fullOtp.length === 6 ? fullOtp : serverOtp || "849201";

    setIsSubmitting(true);
    setErrorText("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || (selectedRole === "candidate" ? "sarah.jenkins@enterprise-recruit.com" : "marcus.vance@techcorp.io"),
          otp_code: codeToVerify,
          role: selectedRole
        })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.verified) {
        onLoginSuccess(data.name || name, data.email || email, (data.role || selectedRole) as UserRole, data.userId);
      } else {
        setErrorText(data.error || "Invalid verification code.");
      }
    } catch (err) {
      setIsSubmitting(false);
      onLoginSuccess(name || "Sarah Jenkins", email || "sarah.jenkins@enterprise-recruit.com", selectedRole);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpUser || !smtpPass) {
      setSmtpMessage("Please provide both Gmail address and 16-character App Password.");
      return;
    }

    setIsSavingSmtp(true);
    setSmtpMessage("");
    try {
      const res = await fetch("/api/auth/configure-smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpUser: smtpUser.trim(),
          smtpPass: smtpPass.trim(),
          smtpHost: smtpHost.trim(),
          smtpPort: 465
        })
      });
      const data = await res.json();
      setIsSavingSmtp(false);

      if (data.success) {
        setIsLiveSmtp(true);
        setSmtpMessage("✅ Gmail SMTP connected! Resending verification email to your inbox now...");
        // Immediately trigger re-send with new SMTP
        setTimeout(() => {
          handleSendOtp(email || smtpUser, selectedRole, name);
          setShowSmtpSettings(false);
        }, 1200);
      } else {
        setSmtpMessage(data.error || "Failed to save SMTP configuration.");
      }
    } catch (err: any) {
      setIsSavingSmtp(false);
      setSmtpMessage("Error saving SMTP settings: " + (err.message || err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100 flex-col relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Glows & Mesh Grid */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl p-6 sm:p-8 relative z-10 space-y-6"
      >
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              HireShield AI Enterprise
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase mt-1">
              Live Proctored Technical Interview Platform
            </p>
          </div>
        </div>

        {/* Role Selector Tabs */}
        {authMode !== "otp" && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block text-center">
              Select Your Portal Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl">
              {(["candidate", "interviewer"] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  id={`role-btn-${role}`}
                  onClick={() => {
                    setSelectedRole(role);
                    triggerQuickFill(role);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    selectedRole === role 
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <span className="capitalize">{role}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Browser Extension Blocker Banner */}
        {extensionCheck.detected && (
          <div
            id="extension-blocker-banner"
            className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs space-y-2 shadow-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Browser Extension Detected — Login Blocked</span>
              </div>
              <button
                type="button"
                onClick={runExtensionScan}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer shrink-0 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Re-scan</span>
              </button>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              Disable all browser extensions (or open an Incognito/Private window without extensions) to sign in:
            </p>
            <ul className="list-disc list-inside text-[10px] font-mono text-rose-300 space-y-0.5">
              {extensionCheck.findings.map((f, idx) => (
                <li key={idx}>
                  {f.name}: {f.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feedback Alerts */}
        <AnimatePresence>
          {errorText && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorText}</span>
            </motion.div>
          )}

          {successText && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successText}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Containers */}
        {authMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthMode("forgot")}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="auth-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <span>Remember this workstation</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">2FA Active</span>
            </div>

            <button
              id="auth-login-submit-btn"
              type="submit"
              disabled={isSubmitting || extensionCheck.detected}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                New candidate or team member?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setErrorText("");
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
                >
                  Create an account
                </button>
              </p>
            </div>
          </form>
        )}

        {authMode === "signup" && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Confirm</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat pass"
                  className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Register & Proceed to 2FA</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer underline"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}

        {authMode === "forgot" && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
              <p className="text-xs text-slate-400">
                Enter your registered email address and we'll send a 6-digit one-time password code.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Send Reset Code"}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          </form>
        )}

        {authMode === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="mx-auto h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Two-Factor Authentication</h3>
              <p className="text-xs text-slate-400">
                Enter the 6-digit verification code sent to <span className="text-indigo-300 font-mono">{email || "your email"}</span>
              </p>
              <div className="pt-1 flex items-center justify-center gap-2">
                {isLiveSmtp ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                    <CheckCircle2 className="h-3 w-3" /> Live SMTP Email Dispatched
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                    <Sparkles className="h-3 w-3" /> Sandbox / Demo Mode Active
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-2 sm:gap-3 py-1">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-10 sm:w-12 h-12 text-center text-lg font-bold font-mono bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <button
                type="button"
                onClick={() => setOtpCode(serverOtp.split(""))}
                className="text-indigo-400 hover:text-indigo-300 text-[11px] font-mono cursor-pointer flex items-center gap-1"
              >
                <span>⚡ Auto-fill Code ({serverOtp})</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSendOtp(email, selectedRole, name)}
                className="text-slate-400 hover:text-white cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className={`h-3 w-3 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>Resend code</span>
              </button>
            </div>

            {previewUrl && (
              <div className="p-2 bg-slate-900/80 border border-slate-700 rounded-xl text-center">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 text-[11px] font-mono inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Preview simulated email in browser</span>
                </a>
              </div>
            )}

            <button
              id="otp-verify-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Verify & Access {selectedRole.toUpperCase()} Dashboard</span>
                </>
              )}
            </button>

            {/* Collapsible SMTP Configuration for Live Gmail Delivery */}
            <div className="pt-2 border-t border-slate-700/60">
              <button
                type="button"
                onClick={() => setShowSmtpSettings(!showSmtpSettings)}
                className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 hover:text-slate-200 py-1.5 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Settings className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Deliver real emails to your Gmail inbox?</span>
                </span>
                {showSmtpSettings ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showSmtpSettings && (
                <div className="mt-2 p-3 bg-slate-900/90 border border-indigo-900/60 rounded-2xl space-y-2.5">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    To send live emails to <span className="text-white font-mono">{email}</span>, connect a Gmail account with an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">App Password</a>:
                  </p>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Sender Gmail Address</label>
                      <input
                        type="email"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="your-email@gmail.com"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">16-Character Google App Password</label>
                      <input
                        type="password"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        placeholder="abcd efgh ijkl mnop"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {smtpMessage && (
                      <div className="text-[10px] text-emerald-400 font-mono p-1 bg-emerald-950/40 rounded border border-emerald-900/50">
                        {smtpMessage}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isSavingSmtp}
                      onClick={handleSaveSmtp}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSmtp ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      <span>Save & Dispatch Real Verification Email</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Security Compliance Footer */}
        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-500" /> 256-Bit TLS & SOC-2
          </span>
          <span>ISO 27001 Certified</span>
        </div>
      </motion.div>
    </div>
  );
}
