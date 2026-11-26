/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConnected, signOutSupabase } from "../supabaseClient";
import { UserRole } from "../types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  userId: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseAuth: boolean;
  userRole: UserRole;
  userName: string;
  userEmail: string;
  loginSession: (name: string, email: string, role: UserRole, id?: string) => void;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveRole(user: User | null): UserRole {
  // Authorization role comes from app_metadata (server-controlled) or saved local role
  const appRole = user?.app_metadata?.role;
  if (appRole === "candidate" || appRole === "interviewer") {
    return appRole;
  }
  const saved = localStorage.getItem("hireshield_role");
  if (saved === "candidate" || saved === "interviewer") {
    return saved;
  }
  return "candidate";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConnected());

  const [localLoggedIn, setLocalLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("hireshield_is_logged_in") === "true";
  });

  const [userRole, setUserRole] = useState<UserRole>(() => resolveRole(null));

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("hireshield_user_name") || "Sarah Jenkins";
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem("hireshield_user_email") || "sarah.jenkins@enterprise-recruit.com";
  });

  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem("hireshield_user_id") || "";
  });

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const currentSession = data.session;
      setSession(currentSession);
      if (currentSession?.user) {
        const u = currentSession.user;
        const resolvedRole = resolveRole(u);
        setUserRole(resolvedRole);
        setUserEmail(u.email || "");
        setUserName(u.user_metadata?.full_name || u.email?.split("@")[0] || "User");
      }
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        const u = nextSession.user;
        setUserRole(resolveRole(u));
        setUserEmail(u.email || "");
        setUserName(u.user_metadata?.full_name || u.email?.split("@")[0] || "User");
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const loginSession = (name: string, email: string, role: UserRole, id?: string) => {
    const resolvedId = id || session?.user?.id || `usr-${email.trim().toLowerCase()}`;
    localStorage.setItem("hireshield_is_logged_in", "true");
    localStorage.setItem("hireshield_user_id", resolvedId);
    localStorage.setItem("hireshield_user_name", name);
    localStorage.setItem("hireshield_user_email", email.trim().toLowerCase());
    localStorage.setItem("hireshield_role", role);

    setLocalLoggedIn(true);
    setUserId(resolvedId);
    setUserName(name);
    setUserEmail(email.trim().toLowerCase());
    setUserRole(role);
  };

  const logout = async () => {
    await signOutSupabase();
    localStorage.removeItem("hireshield_is_logged_in");
    localStorage.removeItem("hireshield_user_id");
    localStorage.removeItem("hireshield_user_name");
    localStorage.removeItem("hireshield_user_email");
    localStorage.removeItem("hireshield_role");
    setSession(null);
    setUserId("");
    setLocalLoggedIn(false);
  };

  const switchRole = (newRole: UserRole) => {
    setUserRole(newRole);
    localStorage.setItem("hireshield_role", newRole);
    if (newRole === "candidate") {
      setUserName("Sarah Jenkins");
      setUserEmail("sarah.jenkins@enterprise-recruit.com");
    } else {
      setUserName("Marcus Vance");
      setUserEmail("marcus.vance@techcorp.io");
    }
  };

  const isAuthenticated = Boolean(session?.user) || localLoggedIn;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        userId: session?.user?.id || userId,
        isAuthenticated,
        isLoading,
        isSupabaseAuth: Boolean(session?.user),
        userRole,
        userName,
        userEmail,
        loginSession,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
