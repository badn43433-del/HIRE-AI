/**
 * HireShield AI - Cross-Platform API Client
 * Works seamlessly across Web, Expo Go LAN, Expo Tunnel, and Hosted Backends
 */

import { Platform } from "react-native";
import Constants from "expo-constants";

export interface ApiDiagnostics {
  baseUrl: string;
  source: "EXPO_PUBLIC_API_URL" | "VITE_API_URL" | "LAN_HOST_URI" | "EMULATOR_FALLBACK" | "LOCALHOST";
  isTunnelBundler: boolean;
  needsPublicApiUrl: boolean;
  warning: string | null;
}

function getEnvApiUrl(): { url: string; source: "EXPO_PUBLIC_API_URL" | "VITE_API_URL" } | null {
  const expoUrl = typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_API_URL : undefined;
  if (expoUrl && typeof expoUrl === "string" && expoUrl.trim()) {
    return { url: expoUrl.trim().replace(/\/+$/, ""), source: "EXPO_PUBLIC_API_URL" };
  }
  const viteUrl =
    (typeof process !== "undefined" ? process.env?.VITE_API_URL : undefined) ||
    (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_API_URL : undefined);
  if (viteUrl && typeof viteUrl === "string" && viteUrl.trim()) {
    return { url: viteUrl.trim().replace(/\/+$/, ""), source: "VITE_API_URL" };
  }
  return null;
}

export function getApiDiagnostics(): ApiDiagnostics {
  const envEntry = getEnvApiUrl();
  const hostUri = typeof Constants?.expoConfig?.hostUri === "string" ? Constants.expoConfig.hostUri : "";
  const isTunnelBundler =
    hostUri.includes(".exp.direct") || hostUri.includes(".ngrok") || hostUri.includes("trycloudflare.com");

  if (envEntry) {
    const pointsToLocal =
      envEntry.url.includes("localhost") || envEntry.url.includes("127.0.0.1");
    if (Platform.OS !== "web" && isTunnelBundler && pointsToLocal) {
      return {
        baseUrl: envEntry.url,
        source: envEntry.source,
        isTunnelBundler,
        needsPublicApiUrl: true,
        warning:
          "EXPO_PUBLIC_API_URL points to localhost, which a physical phone on another network cannot reach. Set EXPO_PUBLIC_API_URL to your HTTPS tunnel or hosted backend URL in .env.local.",
      };
    }
    return {
      baseUrl: envEntry.url,
      source: envEntry.source,
      isTunnelBundler,
      needsPublicApiUrl: false,
      warning: null,
    };
  }

  // In Expo Go tunnel mode without EXPO_PUBLIC_API_URL, hostUri is *.exp.direct (Metro only, not port 3000)
  if (Platform.OS !== "web" && isTunnelBundler) {
    return {
      baseUrl: "",
      source: "LOCALHOST",
      isTunnelBundler: true,
      needsPublicApiUrl: true,
      warning:
        "Running via Expo Tunnel without EXPO_PUBLIC_API_URL. Set EXPO_PUBLIC_API_URL=https://<your-ngrok-or-cloudflare-url> in .env.local and restart npm run tunnel.",
    };
  }

  // Physical device on same Wi-Fi LAN: derive Metro host LAN IP -> Express port 3000
  if (Platform.OS !== "web" && hostUri) {
    const hostIp = hostUri.split(":")[0];
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return {
        baseUrl: `http://${hostIp}:3000`,
        source: "LAN_HOST_URI",
        isTunnelBundler: false,
        needsPublicApiUrl: false,
        warning: null,
      };
    }
  }

  if (Platform.OS === "android") {
    return {
      baseUrl: "http://10.0.2.2:3000",
      source: "EMULATOR_FALLBACK",
      isTunnelBundler: false,
      needsPublicApiUrl: false,
      warning: null,
    };
  }

  return {
    baseUrl: "http://localhost:3000",
    source: "LOCALHOST",
    isTunnelBundler: false,
    needsPublicApiUrl: false,
    warning: null,
  };
}

export const getApiBaseUrl = (): string => {
  return getApiDiagnostics().baseUrl;
};

export const API_BASE_URL = getApiBaseUrl();

export async function checkBackendConnectivity(timeoutMs = 5000): Promise<{
  ok: boolean;
  baseUrl: string;
  message: string;
}> {
  const diag = getApiDiagnostics();
  if (!diag.baseUrl || diag.needsPublicApiUrl) {
    return {
      ok: false,
      baseUrl: diag.baseUrl || "(not configured)",
      message:
        diag.warning ||
        "EXPO_PUBLIC_API_URL is missing. Set it in .env.local to your HTTPS backend URL.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${diag.baseUrl}/api/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "bypass-tunnel-reminder": "true",
        "ngrok-skip-browser-warning": "true",
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 503) {
        return {
          ok: false,
          baseUrl: diag.baseUrl,
          message:
            "Tunnel returned HTTP 503: either server.ts is not running on port 3000, or this temporary tunnel URL has expired — restart your backend tunnel and update EXPO_PUBLIC_API_URL in .env.local.",
        };
      }
      return {
        ok: false,
        baseUrl: diag.baseUrl,
        message: `Backend responded with HTTP ${res.status}. Verify server.ts is running.`,
      };
    }
    return {
      ok: true,
      baseUrl: diag.baseUrl,
      message: `Connected (${diag.source})`,
    };
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    return {
      ok: false,
      baseUrl: diag.baseUrl,
      message: isAbort
        ? `Connection timed out reaching ${diag.baseUrl}. If on a different network, expose port 3000 via HTTPS tunnel and set EXPO_PUBLIC_API_URL in .env.local.`
        : `Cannot reach ${diag.baseUrl}. Ensure npm run dev is running and EXPO_PUBLIC_API_URL points to an HTTPS tunnel when on mobile data / different Wi-Fi.`,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const diag = getApiDiagnostics();
  if (!diag.baseUrl || diag.needsPublicApiUrl) {
    throw new Error(
      diag.warning ||
        "Backend URL is not configured for cross-network Expo Go. Set EXPO_PUBLIC_API_URL in .env.local."
    );
  }

  const url = `${diag.baseUrl}${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "bypass-tunnel-reminder": "true",
    "ngrok-skip-browser-warning": "true",
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(
      `Network error reaching ${diag.baseUrl}. If your phone is on a different network, expose port 3000 over HTTPS and set EXPO_PUBLIC_API_URL in .env.local.`
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `API Error ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.detail || parsed.error || message;
    } catch {
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
