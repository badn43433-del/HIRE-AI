/**
 * 🔒 HireShield AI: Supabase Connection & Auth Service
 * Supports dynamic configuration via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * Falls back gracefully to local Express / sandbox mode if keys are not provided.
 */

import { createClient, SupabaseClient, Session, User } from "@supabase/supabase-js";
import { JobPosition, InterviewSession, AIEvaluationReport, SuspiciousActivity, ChatMessage, UserRole } from "./types";

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

const hasValidConfig =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  !SUPABASE_URL.includes("your-project.supabase.co") &&
  !SUPABASE_ANON_KEY.includes("your-supabase-anon-key");

export const supabase: SupabaseClient | null = hasValidConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  : null;

const supabaseClient = supabase;

if (supabaseClient) {
  console.log("🔥 HireShield AI: Supabase Client Initialized Successfully!");
} else {
  console.log("ℹ️ Supabase environment variables not configured. Operating in local/Express fallback mode.");
}

export const isSupabaseConnected = (): boolean => {
  return supabaseClient !== null;
};

// --- Supabase Auth Helpers ---

async function ensureSupabaseUserProfile(
  user: User,
  fallbackName: string,
  fallbackRole: UserRole
): Promise<{ id: string; name: string; email: string; role: UserRole }> {
  const cleanEmail = (user.email || "").trim().toLowerCase();
  const resolvedName =
    (user.user_metadata?.full_name as string) || fallbackName || cleanEmail.split("@")[0] || "User";
  const appRole = user.app_metadata?.role;
  const metaRole = user.user_metadata?.requested_role;
  const resolvedRole: UserRole =
    appRole === "candidate" || appRole === "interviewer"
      ? appRole
      : metaRole === "candidate" || metaRole === "interviewer"
      ? metaRole
      : fallbackRole;

  if (!supabaseClient) {
    return { id: user.id, name: resolvedName, email: cleanEmail, role: resolvedRole };
  }

  // Look up existing profile by auth UUID first
  const { data: existing, error: selectErr } = await supabaseClient
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (selectErr) {
    console.warn("Supabase public.users lookup warning:", selectErr.message);
  }

  if (existing) {
    const dbRole: UserRole = existing.role === "interviewer" ? "interviewer" : "candidate";
    return {
      id: existing.id,
      name: existing.name || resolvedName,
      email: existing.email || cleanEmail,
      role: dbRole,
    };
  }

  // Persist missing public.users row using authenticated user's UUID
  const { error: upsertErr } = await supabaseClient
    .from("users")
    .upsert(
      [
        {
          id: user.id,
          email: cleanEmail,
          name: resolvedName,
          role: resolvedRole,
          status: "active",
        },
      ],
      { onConflict: "id" }
    );

  if (upsertErr) {
    console.warn("Supabase public.users sync warning:", upsertErr.message);
  }

  return { id: user.id, name: resolvedName, email: cleanEmail, role: resolvedRole };
}

export async function signInWithSupabase(
  email: string,
  password: string,
  fallbackRole: UserRole = "candidate"
): Promise<{
  session: Session | null;
  user: User | null;
  profile: { id: string; name: string; email: string; role: UserRole } | null;
  error: string | null;
}> {
  if (!supabaseClient) {
    return { session: null, user: null, profile: null, error: "Supabase is not configured." };
  }
  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email: cleanEmail, password });
  if (error) {
    const msg = error.message.toLowerCase().includes("email not confirmed")
      ? "Email not confirmed yet. Check your inbox or disable Confirm Email in Supabase Auth settings."
      : error.message;
    return { session: null, user: null, profile: null, error: msg };
  }
  if (!data.user || !data.session) {
    return { session: null, user: null, profile: null, error: "No user ID returned from Supabase Auth." };
  }
  const profile = await ensureSupabaseUserProfile(data.user, cleanEmail.split("@")[0], fallbackRole);
  return { session: data.session, user: data.user, profile, error: null };
}

export async function signUpWithSupabase(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<{
  session: Session | null;
  user: User | null;
  profile: { id: string; name: string; email: string; role: UserRole } | null;
  error: string | null;
  needsEmailConfirmation: boolean;
}> {
  if (!supabaseClient) {
    return { session: null, user: null, profile: null, error: "Supabase is not configured.", needsEmailConfirmation: false };
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const { data, error } = await supabaseClient.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: { full_name: cleanName, requested_role: role },
    },
  });
  if (error) {
    return { session: null, user: null, profile: null, error: error.message, needsEmailConfirmation: false };
  }
  if (!data.user) {
    return { session: null, user: null, profile: null, error: "Account creation failed: no user ID returned.", needsEmailConfirmation: false };
  }
  let profile: { id: string; name: string; email: string; role: UserRole } | null = null;
  if (data.session) {
    profile = await ensureSupabaseUserProfile(data.user, cleanName, role);
  }
  return {
    session: data.session,
    user: data.user,
    profile,
    error: null,
    needsEmailConfirmation: !data.session,
  };
}

export async function signOutSupabase(): Promise<void> {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
}

// --- API & Fallback Helper Actions ---

// 1. Fetch Job Positions
export async function fetchPositions(): Promise<JobPosition[]> {
  if (supabaseClient) {
    const { data, error } = await supabaseClient.from("positions").select("*");
    if (!error && data) {
      return data.map((pos: any) => ({
        id: pos.id,
        title: pos.title,
        department: pos.department,
        description: pos.description,
        difficulty: pos.difficulty,
        questionBank: pos.question_bank || []
      }));
    }
    console.error("Supabase positions error:", error);
  }

  // Fallback to Express API
  const res = await fetch("/api/positions");
  return res.json();
}

// 2. Create Interview Session
export async function createInterviewSession(
  candidateName: string,
  candidateEmail: string,
  jobId: string
): Promise<InterviewSession> {
  if (supabaseClient) {
    const id = `ses-${Math.random().toString(36).substring(2, 10)}`;
    const newSession = {
      id,
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      job_id: jobId,
      status: "camera_check",
      current_question_index: 0,
      responses: [],
      started_at: new Date().toISOString()
    };

    const { error } = await supabaseClient.from("sessions").insert([newSession]);
    if (!error) {
      return {
        id,
        candidateName,
        candidateEmail,
        jobId,
        status: "camera_check",
        currentQuestionIndex: 0,
        responses: [],
        suspiciousActivities: [],
        startedAt: newSession.started_at
      };
    }
    console.error("Supabase session insert error:", error);
  }

  // Fallback to Express API
  const res = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateName, candidateEmail, jobId })
  });
  return res.json();
}

// 3. Log Suspicious Activity
export async function logSuspiciousActivity(
  sessionId: string,
  type: string,
  description: string,
  severity: "low" | "medium" | "high",
  videoOffsetSeconds: number
): Promise<SuspiciousActivity> {
  const newActivity: SuspiciousActivity = {
    id: `evt-${Math.random().toString(36).substring(2, 8)}`,
    type: type as any,
    timestamp: new Date().toISOString(),
    description,
    severity,
    videoOffsetSeconds
  };

  if (supabaseClient) {
    const { error } = await supabaseClient.from("suspicious_activities").insert([{
      id: newActivity.id,
      session_id: sessionId,
      type: newActivity.type,
      timestamp: newActivity.timestamp,
      description: newActivity.description,
      severity: newActivity.severity,
      video_offset_seconds: newActivity.videoOffsetSeconds
    }]);
    if (!error) return newActivity;
    console.error("Supabase suspicious log error:", error);
  }

  // Fallback to Express API
  const res = await fetch(`/api/sessions/${sessionId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, description, severity, videoOffsetSeconds })
  });
  const data = await res.json();
  return data.activity || newActivity;
}

// 4. Submit Candidate Responses for AI Evaluation
export async function submitEvaluation(
  sessionId: string,
  responses: any[]
): Promise<any> {
  if (supabaseClient) {
    // 1. Update session status
    await supabaseClient
      .from("sessions")
      .update({
        status: "transcribing",
        responses: responses,
        completed_at: new Date().toISOString()
      })
      .eq("id", sessionId);
  }

  // Delegate calculation and scoring evaluation to full-stack Express engine/API
  const res = await fetch(`/api/sessions/${sessionId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ responses })
  });
  return res.json();
}

// 5. Get AI Candidate Evaluation Reports
export async function fetchReports(): Promise<AIEvaluationReport[]> {
  if (supabaseClient) {
    const { data: dbReports, error } = await supabaseClient
      .from("reports")
      .select(`
        *,
        suspicious_activities:suspicious_activities(*),
        chats:chats(*)
      `)
      .order("final_rank", { ascending: true });

    if (!error && dbReports) {
      return dbReports.map((rep: any) => ({
        id: rep.id,
        candidateId: rep.candidate_id,
        candidateName: rep.candidate_name,
        candidateEmail: rep.candidate_email,
        jobPositionId: rep.job_position_id,
        jobTitle: rep.job_title,
        technicalScore: rep.technical_score,
        communicationScore: rep.communication_score,
        confidenceScore: rep.confidence_score,
        suspicionScore: rep.suspicion_score,
        trustScore: rep.trust_score ?? Math.max(0, 100 - (rep.suspicion_score ?? 0)),
        finalRank: rep.final_rank,
        shortlistStatus: rep.shortlist_status,
        semanticRelevance: rep.semantic_relevance,
        qualitativeNotes: rep.qualitative_notes,
        answersEvaluated: rep.answers_evaluated,
        suspiciousActivities: (rep.suspicious_activities || []).map((sa: any) => ({
          id: sa.id,
          type: sa.type,
          timestamp: sa.timestamp,
          description: sa.description,
          severity: sa.severity,
          videoOffsetSeconds: sa.video_offset_seconds
        })),
        chats: (rep.chats || []).map((ch: any) => ({
          id: ch.id,
          sender: ch.sender,
          text: ch.text,
          timestamp: ch.timestamp,
          isTechnicalEmergency: ch.is_technical_emergency
        }))
      }));
    }
    console.error("Supabase reports query error:", error);
  }

  // Fallback to Express API
  const res = await fetch("/api/reports");
  return res.json();
}

// 6. Update Candidate Shortlist Status
export async function updateReportStatus(
  reportId: string,
  newStatus: "SHORTLISTED" | "STANDBY" | "REJECTED"
): Promise<boolean> {
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("reports")
      .update({ shortlist_status: newStatus })
      .eq("id", reportId);
    if (!error) return true;
    console.error("Supabase status update error:", error);
  }

  // Fallback to Express API
  const res = await fetch(`/api/reports/${reportId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  });
  const data = await res.json();
  return data.success;
}

// 7. Get Chats for Session
export async function fetchChats(sessionId: string): Promise<{ chats: ChatMessage[]; supportEmergencyActive: boolean }> {
  if (supabaseClient) {
    const { data: chatData, error: chatError } = await supabaseClient
      .from("chats")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    const { data: sessionData } = await supabaseClient
      .from("sessions")
      .select("support_emergency_active")
      .eq("id", sessionId)
      .single();

    if (!chatError && chatData) {
      return {
        chats: chatData.map((ch: any) => ({
          id: ch.id,
          sender: ch.sender,
          text: ch.text,
          timestamp: ch.timestamp,
          isTechnicalEmergency: ch.is_technical_emergency
        })),
        supportEmergencyActive: sessionData ? !!sessionData.support_emergency_active : false
      };
    }
  }

  const res = await fetch(`/api/sessions/${sessionId}/chats`);
  return res.json();
}

// 8. Add Chat Message
export async function addChatMessage(
  sessionId: string,
  sender: "candidate" | "hr",
  text: string,
  isTechnicalEmergency = false
): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    id: `msg-${Math.random().toString(36).substring(2, 10)}`,
    sender,
    text,
    timestamp: new Date().toISOString(),
    isTechnicalEmergency
  };

  if (supabaseClient) {
    const { error } = await supabaseClient.from("chats").insert([{
      id: newMsg.id,
      session_id: sessionId,
      sender: newMsg.sender,
      text: newMsg.text,
      timestamp: newMsg.timestamp,
      is_technical_emergency: newMsg.isTechnicalEmergency
    }]);

    if (isTechnicalEmergency) {
      await supabaseClient
        .from("sessions")
        .update({ support_emergency_active: true })
        .eq("id", sessionId);
    }

    if (!error) return newMsg;
    console.error("Supabase insert message error:", error);
  }

  // Fallback to Express API
  const res = await fetch(`/api/sessions/${sessionId}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, text, isTechnicalEmergency })
  });
  const data = await res.json();
  return data.message || newMsg;
}
