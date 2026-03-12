import { create } from "zustand";

/**
 * Modern User Interface focusing on profile data.
 * Session/Token management is handled natively by SupabaseSDK.
 */
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

type AuthState = {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  setLoading: (v: boolean) => void;
  logoutStore: () => void;
};

/**
 * Lightweight store for user profile state.
 * No persistence layer needed as Supabase provides the persistent session.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (u) => set({ user: u }),
  setLoading: (v) => set({ loading: v }),
  logoutStore: () => set({ user: null, loading: false }),
}));
