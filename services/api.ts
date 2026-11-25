/**
 * HireShield AI - Cross-Platform API Client
 * Works seamlessly across Web, Android, and iOS (Expo Go)
 */

import { Platform } from "react-native";

// Automatically resolve localhost for Web vs Android Emulator (10.0.2.2) vs Physical Expo Go Device
export const getApiBaseUrl = (): string => {
  if (Platform.OS === "android") {
    // Android emulator alias for host machine
    return "http://10.0.2.2:8000";
  }
  // Web & iOS simulator
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

  return response.json();
}
