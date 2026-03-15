"use client";

import { useEffect, useState, useCallback } from "react";
import { authAPI } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useUserActivityStore } from "@/lib/useUserActivityStore";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  has_interests?: boolean;
}

/**
 * Storage Keys
 */
const PROFILE_KEY = "qalamda_profile";

/**
 * Simple global listener for state synchronization without Zustand data storage.
 */
let globalUser: User | null = null;
const listeners = new Set<(u: User | null) => void>();

const updateGlobalUser = (u: User | null, token?: string) => {
  globalUser = u;
  if (typeof window !== "undefined") {
    if (u) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(u));
      // Set cookies for server-side hints
      document.cookie = `qalamda_auth_status=authenticated; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `qalamda_username=${u.username}; path=/; max-age=31536000; SameSite=Lax`;
      if (token) {
        document.cookie = `qalamda_token=${token}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } else {
      localStorage.removeItem(PROFILE_KEY);
      // Remove the cookies
      document.cookie = `qalamda_auth_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `qalamda_username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `qalamda_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
  listeners.forEach((l) => l(u));
};

// Initialize from storage
if (typeof window !== "undefined") {
  const saved = localStorage.getItem(PROFILE_KEY);
  if (saved) {
    try {
      globalUser = JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem(PROFILE_KEY);
    }
  }
}

/**
 * Normalization helper
 */
const normalize = (raw: any): User | null => {
  if (!raw) return null;
  const u = raw.user || raw;
  const meta = u.user_metadata || {};
  const email = u.email || meta.email || null;
  return {
    id: u.id,
    email,
    username:
      u.username ||
      meta.username ||
      (email ? email.split("@")[0] : `user_${u.id.slice(0, 5)}`),
    full_name: u.full_name || meta.full_name || meta.name || null,
    bio: meta.bio || null,
    avatar_url: u.avatar_url || meta.avatar_url || meta.picture || null,
    created_at: u.created_at || null,
    updated_at: u.updated_at || null,
    has_interests: u.has_interests ?? false,
  } as User;
};

/**
 * High-Level Auth Bridge.
 */
export function AuthInit() {
  useEffect(() => {
    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const token = session.access_token;
        try {
          const { data } = await authAPI.getMe();
          if (data?.user) {
            updateGlobalUser(normalize(data.user), token);
          } else {
            const { data: synced } = await authAPI.syncProfile();
            if (synced?.user) updateGlobalUser(normalize(synced.user), token);
          }
          useUserActivityStore.getState().fetchActivity();
        } catch (e) {
          updateGlobalUser(normalize(session.user), token);
          useUserActivityStore.getState().fetchActivity();
        }
      } else {
        updateGlobalUser(null);
        useUserActivityStore.getState().reset();
      }
    };

    sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "SIGNED_IN" || event === "USER_UPDATED") &&
        session?.user
      ) {
        sync();
      }
      if (event === "SIGNED_OUT") {
        updateGlobalUser(null);
        useUserActivityStore.getState().reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}

/**
 * Hook to access user data from Storage/Global state.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const l = (u: User | null) => {
      setUser(u);
      setLoading(false);
    };
    listeners.add(l);
    if (globalUser !== undefined) setLoading(false);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message || "Login failed" };
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    fullName?: string,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, full_name: fullName },
        },
      });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message || "Registration failed" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await updateGlobalUser(null);
    await setUser(null);
    await useUserActivityStore.getState().reset();
    await localStorage.removeItem("qalamda-theme");
    await localStorage.removeItem("qalamda-lang");
    router.push("/");
  };

  const signInWithOAuth = async (provider: "github" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateUser = useCallback((u: User) => {
    updateGlobalUser(u);
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    signInWithOAuth,
    updateUser,
  };
}
