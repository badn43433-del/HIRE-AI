/**
 * HireShield AI - Authentication Service
 * JWT Authentication & 2FA OTP verification for Web, iOS, and Android
 */

import { apiRequest } from "./api";
import { UserRole } from "../src/types";

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  name: string;
  email: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    return apiRequest<{
      success: boolean;
      requires_2fa: boolean;
      demo_otp: string;
      email: string;
      name: string;
      role: UserRole;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  verifyOtp: async (email: string, otp_code: string, role: UserRole) => {
    return apiRequest<AuthResponse>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp_code, role })
    });
  },

  register: async (payload: RegisterPayload) => {
    return apiRequest<{ success: boolean; message: string; demo_otp: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest<{ success: boolean; message: string; demo_otp: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  }
};
