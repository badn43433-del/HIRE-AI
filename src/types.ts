/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "candidate" | "interviewer";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  status: "active" | "suspended" | "pending";
  createdAt: string;
  twoFactorEnabled?: boolean;
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  description: string;
  difficulty: "Junior" | "Intermediate" | "Senior" | "Lead";
  questionBank: string[];
}

export interface DeviceCheckResult {
  camera: { passed: boolean; label: string; streamActive: boolean };
  microphone: { passed: boolean; label: string; decibels: number };
  network: { 
    passed: boolean; 
    downloadMbps: number; 
    uploadMbps: number; 
    pingMs: number; 
    jitterMs: number;
    rating: "Excellent" | "Good" | "Fair" | "Poor";
  };
  browser: {
    webrtc: boolean;
    canvas: boolean;
    screenShare: boolean;
    fullscreen: boolean;
    browserName: string;
  };
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  language: "python" | "javascript" | "typescript" | "cpp" | "java";
  description: string;
  starterCode: string;
  testCases: {
    input: string;
    expected: string;
  }[];
}

export interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  interviewerId: string;
  interviewerName: string;
  interviewerEmail: string;
  positionId: string;
  roleTitle: string;
  department: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  durationMinutes: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  meetingLink: string;
  resumeUrl?: string;
  skills?: string[];
}

export interface SuspiciousActivity {
  id: string;
  type: "tab_switch" | "focus_lost" | "multiple_faces" | "no_face" | "reading_behavior" | "mobile_phone" | "copy_paste";
  timestamp: string; // ISO string
  description: string;
  severity: "low" | "medium" | "high";
  videoOffsetSeconds?: number;
}

export interface CandidateResponse {
  questionIndex: number;
  questionText: string;
  answerText: string;
  durationSeconds: number;
  transcriptText: string;
}

export interface ChatMessage {
  id: string;
  sender: "candidate" | "interviewer" | "system" | "hr";
  senderName?: string;
  text: string;
  timestamp: string;
  isTechnicalEmergency?: boolean;
  attachmentName?: string;
}

export interface HRSettings {
  hrName: string;
  hrEmail: string;
  receiveInstantAlerts: boolean;
  autoMailTopCandidates: boolean;
}

export interface AIProctoringMetrics {
  faceDetected: boolean;
  multipleFaces: boolean;
  faceConfidence: number; // 0 - 100%
  eyeGaze: "Center" | "Looking Left" | "Looking Right" | "Looking Away";
  headPose: "Forward" | "Tilted Left" | "Tilted Right" | "Looking Down";
  emotion: "Confident" | "Focused" | "Stressed" | "Neutral" | "Perplexed";
  voiceActivity: boolean;
  backgroundNoiseDecibels: number;
  speechTranscript: string;
  tabSwitches: number;
  copyPastes: number;
  phoneDetected: boolean;
  trustScore: number; // 0 - 100%
  malpracticeAlerts: SuspiciousActivity[];
}

export interface InterviewRubricEvaluation {
  technicalScore: number;      // 1 - 5
  codingScore: number;         // 1 - 5
  systemDesignScore: number;   // 1 - 5
  communicationScore: number;  // 1 - 5
  problemSolvingScore: number; // 1 - 5
  interviewerNotes: string;
  hiringVerdict: "STRONG_HIRE" | "HIRE" | "LEANING_HIRE" | "LEANING_REJECT" | "REJECT";
  candidateComparisonNotes?: string;
}

export interface AIEvaluationReport {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobPositionId: string;
  jobTitle: string;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  suspicionScore: number; // 0 (none) to 100 (high suspicion)
  trustScore: number;     // 100 - suspicionScore
  finalRank: number;      // calculated dynamically
  shortlistStatus: "SHORTLISTED" | "STANDBY" | "REJECTED";
  semanticRelevance: number; // Match score
  qualitativeNotes: {
    strengths: string[];
    weaknesses: string[];
    integritySummary: string;
    overallRecommendation: string;
  };
  answersEvaluated: {
    questionText: string;
    candidateAnswer: string;
    aiRationallyScored: string;
    score: number;
  }[];
  suspiciousActivities?: SuspiciousActivity[];
  chats?: ChatMessage[];
  supportEmergencyActive?: boolean;
  codingSubmission?: {
    code: string;
    language: string;
    testCasesPassed: number;
    totalTestCases: number;
  };
  rubricEvaluation?: InterviewRubricEvaluation;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  status: "not_started" | "camera_check" | "waiting_room" | "ongoing" | "transcribing" | "completed";
  currentQuestionIndex: number;
  responses: CandidateResponse[];
  suspiciousActivities: SuspiciousActivity[];
  startedAt?: string;
  completedAt?: string;
  videoBlobUrl?: string;
  chats?: ChatMessage[];
  supportEmergencyActive?: boolean;
  codingCode?: string;
  codingLanguage?: string;
  activeChallengeId?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  ipAddress: string;
  details: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED";
}

export interface AdminSystemSettings {
  strictness: "warning" | "strict" | "log_only";
  faceMeshSensitivity: number; // 0 - 100
  gazeToleranceSeconds: number;
  allowCopyPaste: boolean;
  enableMultiplePersonAlerts: boolean;
  enableMobilePhoneDetection: boolean;
  autoMailReports: boolean;
  jwtExpiryMinutes: number;
  twoFactorRequired: boolean;
}
