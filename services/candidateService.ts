/**
 * Candidate Service for HireShield AI
 * Queries upcoming interviews, logs hardware tests, and submits resumes
 */

import { apiRequest } from "./api";
import { ScheduledInterview } from "../src/types";

export const candidateService = {
  getUpcomingInterviews: async (email?: string) => {
    return apiRequest<ScheduledInterview[]>("/api/candidates/interviews");
  },

  logDiagnostics: async (diag: {
    camera_passed: boolean;
    mic_passed: boolean;
    ping_ms: number;
    download_mbps: number;
    upload_mbps: number;
  }) => {
    return apiRequest<{ status: string; timestamp: string }>("/api/candidates/diagnostics", {
      method: "POST",
      body: JSON.stringify(diag)
    });
  }
};
