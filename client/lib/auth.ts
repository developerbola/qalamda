"use client";

import { useEffect } from "react";
import { authAPI } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuthStore, User } from "@/lib/useAuthStore";

export function AuthInit() {
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const init = async () => {
      // use sessionStorage for auth persistence
      const storedToken = sessionStorage.getItem("token");
      const storedUserRaw = sessionStorage.getItem("user");

      if (storedToken) setToken(storedToken);
      const normalize = (raw: any) => {
        if (!raw) return null;
        // handle Supabase session object or plain user object
        const u = raw.user || raw;
        const meta = u.user_metadata || u.user_metadata || {};
        const email = u.email || meta.email || null;
        const username = u.username || meta.username || (email ? email.split('@')[0] : null);
        const full_name = meta.full_name || meta.name || null;
        const avatar_url = meta.avatar_url || meta.picture || null;
        return {
          id: u.id,
          email,
          username,
          full_name,
          bio: meta.bio || null,
          avatar_url,
          created_at: u.created_at || u.confirmed_at || null,
          updated_at: u.updated_at || null,
        } as User;
      };

      if (storedUserRaw) {
        try {
          const parsed = JSON.parse(storedUserRaw);
          const normalized = normalize(parsed);
          if (normalized) setUser(normalized);
        } catch {
          // ignore parse errors
        }
      }

      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          const normalized = normalize(res.data.user);
          if (normalized) {
            setUser(normalized);
            // persist normalized user to sessionStorage
            sessionStorage.setItem("user", JSON.stringify(res.data.user));
          }
        } catch (e) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    if (typeof window !== "undefined") init();
  }, [setUser, setToken, setLoading]);

  return null;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.loading);
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);

  const login = async (email: string, password: string) => {
    try {
      const res = await authAPI.login({ email, password });
      const { user: userData, token: newToken } = res.data;
      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return {} as any;
    } catch (error: any) {
      return { error: error.response?.data?.error || "Login failed" };
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    fullName?: string,
  ) => {
    try {
      const res = await authAPI.register({
        email,
        username,
        password,
        fullName,
      });
      const { user: userData, token: newToken } = res.data;
      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return {} as any;
    } catch (error: any) {
      return { error: error.response?.data?.error || "Registration failed" };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
    try {
      supabase.auth.signOut();
    } catch (e) {
      /* noop */
    }
  };

  const signInWithOAuth = async (provider: "github" | "google") => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });
      if (error) return { error: error.message };
      if (data.user) {
        const userRes = await authAPI.getMe();
        const userData = userRes.data.user as User;
        sessionStorage.setItem("token", data.session?.access_token || "");
        sessionStorage.setItem("user", JSON.stringify(userData));
        setToken(data.session?.access_token || "");
        setUser(userData);
      }
      return {} as any;
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return {
    user,
    token,
    loading,
    login,
    register,
    logout,
    signInWithOAuth,
    updateUser,
  };
}
