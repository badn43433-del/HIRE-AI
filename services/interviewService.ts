/**
 * Interview & Code Execution Service
 * Dispatches code execution to sandboxed runner and submits evaluations
 */

import { apiRequest } from "./api";
import { AIEvaluationReport } from "../src/types";

export const interviewService = {
  executeCode: async (code: string, language: string, challengeId?: string) => {
    return apiRequest<{
      stdout: string;
      stderr: string;
      exit_code: number;
      duration_ms: number;
      test_results: { passed: boolean; name: string; duration_ms: number }[];
    }>("/api/interviews/execute-code", {
      method: "POST",
      body: JSON.stringify({ code, language, challenge_id: challengeId })
    });
  },

  submitEvaluation: async (payload: {
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    responses: any[];
    suspiciousActivities: any[];
  }) => {
    return apiRequest<{
      success: boolean;
      reportId: string;
      report: AIEvaluationReport;
    }>("/api/interviews/submit-evaluation", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
