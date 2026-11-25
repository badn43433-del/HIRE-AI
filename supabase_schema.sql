-- 🔒 HireShield AI: Enterprise Supabase Database Schema
-- Run this in your Supabase SQL Editor to initialize or migrate the complete platform tables.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (RBAC)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('candidate', 'interviewer', 'admin')),
    department TEXT DEFAULT 'Engineering',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    two_factor_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Candidate Profiles Table
CREATE TABLE IF NOT EXISTS public.candidate_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    experience_years INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Job Positions Table
CREATE TABLE IF NOT EXISTS public.positions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('Junior', 'Intermediate', 'Senior', 'Lead')),
    question_bank JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Scheduled Interviews Pipeline Table
CREATE TABLE IF NOT EXISTS public.scheduled_interviews (
    id TEXT PRIMARY KEY DEFAULT ('int-' || substr(md5(random()::text), 1, 8)),
    candidate_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    interviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    interviewer_name TEXT NOT NULL,
    interviewer_email TEXT NOT NULL,
    position_id TEXT REFERENCES public.positions(id) ON DELETE SET NULL,
    role_title TEXT NOT NULL,
    department TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    meeting_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Live Interview Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    job_id TEXT REFERENCES public.positions(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'camera_check', 'waiting_room', 'ongoing', 'transcribing', 'completed')),
    current_question_index INTEGER DEFAULT 0 NOT NULL,
    responses JSONB NOT NULL DEFAULT '[]'::jsonb,
    coding_submission JSONB DEFAULT '{}'::jsonb,
    whiteboard_snapshot_url TEXT,
    trust_score NUMERIC(5,2) DEFAULT 100.0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    support_emergency_active BOOLEAN DEFAULT false
);

-- 6. Suspicious Activities & AI Malpractice Alerts Table
CREATE TABLE IF NOT EXISTS public.suspicious_activities (
    id TEXT PRIMARY KEY DEFAULT ('alert-' || substr(md5(random()::text), 1, 8)),
    session_id TEXT REFERENCES public.sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('tab_switch', 'focus_lost', 'multiple_faces', 'no_face', 'reading_behavior', 'mobile_phone', 'copy_paste')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    video_offset_seconds INTEGER DEFAULT 0
);

-- 7. Rubric Evaluations & Interviewer Scoring Table
CREATE TABLE IF NOT EXISTS public.rubric_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT REFERENCES public.sessions(id) ON DELETE CASCADE,
    interviewer_email TEXT NOT NULL,
    technical_score INTEGER CHECK (technical_score BETWEEN 1 AND 5),
    coding_score INTEGER CHECK (coding_score BETWEEN 1 AND 5),
    system_design_score INTEGER CHECK (system_design_score BETWEEN 1 AND 5),
    communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 5),
    problem_solving_score INTEGER CHECK (problem_solving_score BETWEEN 1 AND 5),
    interviewer_notes TEXT,
    hiring_verdict TEXT NOT NULL CHECK (hiring_verdict IN ('STRONG_HIRE', 'HIRE', 'LEANING_HIRE', 'LEANING_REJECT', 'REJECT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Candidate AI Evaluation Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    candidate_id TEXT REFERENCES public.sessions(id) ON DELETE SET NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    job_position_id TEXT REFERENCES public.positions(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    technical_score INTEGER NOT NULL,
    communication_score INTEGER NOT NULL,
    confidence_score INTEGER NOT NULL,
    suspicion_score INTEGER NOT NULL,
    trust_score INTEGER GENERATED ALWAYS AS (100 - suspicion_score) STORED,
    final_rank INTEGER DEFAULT 0,
    shortlist_status TEXT NOT NULL CHECK (shortlist_status IN ('SHORTLISTED', 'STANDBY', 'REJECTED')),
    semantic_relevance INTEGER NOT NULL,
    qualitative_notes JSONB NOT NULL,
    answers_evaluated JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Real-Time Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chats (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES public.sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('candidate', 'interviewer', 'system', 'hr')),
    sender_name TEXT,
    text TEXT NOT NULL,
    attachment_name TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_technical_emergency BOOLEAN DEFAULT false
);

-- 10. System Audit Logs Table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'WARNING', 'BLOCKED')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for ultra-fast query latency
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_scheduled_interviews_date ON public.scheduled_interviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_sessions_job_id ON public.sessions(job_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_session_id ON public.suspicious_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_candidate_id ON public.reports(candidate_id);
CREATE INDEX IF NOT EXISTS idx_chats_session_id ON public.chats(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.system_audit_logs(timestamp);

-- Row Level Security (RLS) Enablement on ALL exposed public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Secure RLS Policies (using TO authenticated + ownership / app_metadata, never user_metadata)
DROP POLICY IF EXISTS "Admins have full access" ON public.users;
DROP POLICY IF EXISTS "Public read for positions" ON public.positions;
DROP POLICY IF EXISTS "Candidates view own interviews" ON public.scheduled_interviews;

CREATE POLICY "Users read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Candidates manage own profile"
  ON public.candidate_profiles FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Authenticated users read positions"
  ON public.positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Participants view own interviews"
  ON public.scheduled_interviews FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = candidate_id
    OR (select auth.uid()) = interviewer_id
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'interviewer'
  );

CREATE POLICY "Authenticated users view own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (
    (select auth.uid())::text = candidate_id
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'interviewer'
  );

-- Seed Positions
INSERT INTO public.positions (id, title, department, description, difficulty, question_bank)
VALUES 
('pos-1', 'Senior Frontend UI Architect', 'Engineering', 'Architect secure high-speed React applications, state management architectures, and proactive defense against browser-based vulnerability vectors.', 'Senior', '[
  "How do you optimize React render cycles when dealing with complex high-frequency WebSocket streams? Explain memoization patterns and tradeoffs.",
  "How would you build a client-side sandbox to identify if user extensions or local malicious packages are hijacking input elements in your React UI?",
  "Detail your strategy for managing complex app state. Why might you pair state machines with custom UI lockdown layers?"
]')
ON CONFLICT (id) DO NOTHING;
