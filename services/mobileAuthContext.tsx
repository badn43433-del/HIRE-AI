/**
 * Mobile Auth & Theme Context for Expo Go (Android & iOS)
 * Persists user session & theme in AsyncStorage and restores automatically on launch.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";
import { UserRole } from "../src/types";

const SESSION_KEY = "hireshield_mobile_session";
const THEME_KEY = "hireshield_theme";

export interface MobileSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

interface MobileAuthContextValue {
  session: MobileSession | null;
  isRestoring: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
  signIn: (email: string, password: string) => Promise<MobileSession>;
  signUp: (name: string, email: string, password: string, role: UserRole) => Promise<MobileSession>;
  signOut: () => Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthContextValue | null>(null);

async function readStorage(key: string): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }
  return AsyncStorage.getItem(key);
}

async function writeStorage(key: string, value: string): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function removeStorage(key: string): Promise<void> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}

export function MobileAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MobileSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rawSession, savedTheme] = await Promise.all([
          readStorage(SESSION_KEY),
          readStorage(THEME_KEY),
        ]);
        if (!mounted) return;
        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        }
        if (rawSession) {
          const parsed = JSON.parse(rawSession);
          if (parsed && parsed.userId && parsed.email) {
            setSession({
              userId: parsed.userId,
              name: parsed.name || parsed.email.split("@")[0],
              email: parsed.email,
              role: parsed.role === "interviewer" ? "interviewer" : "candidate",
            });
          }
        }
      } catch (err) {
        console.warn("Failed to restore mobile session:", err);
      } finally {
        if (mounted) setIsRestoring(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistSession = async (next: MobileSession) => {
    setSession(next);
    await writeStorage(SESSION_KEY, JSON.stringify(next));
  };

  const signIn = async (email: string, password: string): Promise<MobileSession> => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await apiRequest<{
      success: boolean;
      user: { id: string; name: string; email: string; role: UserRole };
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    const next: MobileSession = {
      userId: res.user.id,
      name: res.user.name,
      email: res.user.email,
      role: res.user.role === "interviewer" ? "interviewer" : "candidate",
    };
    await persistSession(next);
    return next;
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<MobileSession> => {
    const cleanEmail = email.trim().toLowerCase();
    const res = await apiRequest<{
      success: boolean;
      user: { id: string; name: string; email: string; role: UserRole };
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), email: cleanEmail, password, role }),
    });

    const next: MobileSession = {
      userId: res.user.id,
      name: res.user.name,
      email: res.user.email,
      role: res.user.role === "interviewer" ? "interviewer" : "candidate",
    };
    await persistSession(next);
    return next;
  };

  const signOut = async () => {
    setSession(null);
    await removeStorage(SESSION_KEY);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    writeStorage(THEME_KEY, next).catch(() => {});
  };

  return (
    <MobileAuthContext.Provider
      value={{
        session,
        isRestoring,
        theme,
        toggleTheme,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
}

export function useMobileAuth(): MobileAuthContextValue {
  const ctx = useContext(MobileAuthContext);
  if (!ctx) {
    throw new Error("useMobileAuth must be used inside <MobileAuthProvider>");
  }
  return ctx;
}
