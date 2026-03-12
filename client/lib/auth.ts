"use client";

import { useEffect, useRef } from "react";
import { authAPI } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuthStore, User } from "@/lib/useAuthStore";

/**
 * High-Level Auth Bridge.
 * Orchestrates Supabase authentication with our custom PostgreSQL profile.
 */
export function AuthInit() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logoutStore = useAuthStore((s) => s.logoutStore);
  
  // Track listeners to avoid multiple attachments
  const isStarted = useRef(false);

  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;

    // Standard normalization for user objects
    const normalize = (raw: any): User | null => {
      if (!raw) return null;
      const u = raw.user || raw;
      const meta = u.user_metadata || {};
      const email = u.email || meta.email || null;
      return {
        id: u.id,
        email,
        username: u.username || meta.username || (email ? email.split("@")[0] : `user_${u.id.slice(0, 5)}`),
        full_name: u.full_name || meta.full_name || meta.name || null,
        bio: meta.bio || null,
        avatar_url: u.avatar_url || meta.avatar_url || meta.picture || null,
        created_at: u.created_at || null,
        updated_at: u.updated_at || null,
      } as User;
    };

    /**
     * Primary session detection loop.
     */
    const syncCurrentState = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Detect profile from our database
          try {
            const { data } = await authAPI.getMe();
            if (data?.user) {
              setUser(normalize(data.user));
            } else {
              // Self-heal if profile is totally missing
              const { data: synced } = await authAPI.syncProfile();
              if (synced?.user) setUser(normalize(synced.user));
            }
          } catch (e) {
            console.error("[AuthInit] Failed to sync profile with DB", e);
            // Fallback to JWT metadata if backend is offline
            setUser(normalize(session.user));
          }
        } else {
          logoutStore();
        }
      } catch (err) {
        console.error("[AuthInit] CRITICAL ERROR", err);
      } finally {
        setLoading(false);
      }
    };

    // 1. Immediate execution
    syncCurrentState();

    // 2. State Change Listener (Native Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
            // Speed up perceived login by syncing now
            try {
              const { data: synced } = await authAPI.syncProfile();
              if (synced?.user) setUser(normalize(synced.user));
            } catch (e) {
               setUser(normalize(session.user));
            }
        }
        
        if (event === "SIGNED_OUT") {
          logoutStore();
        }

        if (event === "USER_UPDATED" && session?.user) {
          syncCurrentState(); // Refresh profile on updates
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, logoutStore]);

  return null;
}

/**
 * Clean UI Hooks for all components.
 * No longer requires manual backend proxying.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const logoutStore = useAuthStore((s) => s.logoutStore);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data };
    } catch (error: any) {
      return { error: error.message || "Login failed" };
    }
  };

  const register = async (email: string, _username: string, password: string, fullName?: string) => {
    try {
      /**
       * Note: Username and Full Name are passed as metadata.
       * The sync backend will reliably migrate this to the public DB.
       */
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: _username, full_name: fullName },
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
    logoutStore();
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
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateUser = (updatedUser: User) => {
    useAuthStore.getState().setUser(updatedUser);
  };

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
