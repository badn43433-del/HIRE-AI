/**
 * HireShield AI - Cross-Platform API Client
 * Works seamlessly across Web, Android, and iOS (Expo Go)
 */

import { Platform } from "react-native";

// Resolve API base URL from Expo/Vite env vars with localhost/emulator fallback
export const getApiBaseUrl = (): string => {
  const envUrl =
    (typeof process !== "undefined" && (process.env?.EXPO_PUBLIC_API_URL || process.env?.VITE_API_URL)) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL);
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();

export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json"
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `API Error ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.detail || parsed.error || message;
    } catch (e) {
      // raw text
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}
