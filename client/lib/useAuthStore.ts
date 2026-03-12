import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
 * Persisted store for user profile state.
 * Syncs with localStorage to provide instant profile data on load.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (u) => set({ user: u }),
      setLoading: (v) => set({ loading: v }),
      logoutStore: () => set({ user: null, loading: false }),
    }),
    {
      name: "qalamda-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist the user profile, not the loading state
      partialize: (state) => ({ user: state.user }),
    }
  )
);
