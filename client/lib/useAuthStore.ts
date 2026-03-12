import { create } from "zustand";

/**
 * Minimal store for transient UI states like loading indicators.
 * User profile information is now managed directly via Storage/Supabase.
 */
type UIAuthState = {
  loading: boolean;
  setLoading: (v: boolean) => void;
};

export const useUIAuthStore = create<UIAuthState>((set) => ({
  loading: true,
  setLoading: (v) => set({ loading: v }),
}));

// Export legacy name for compatibility if needed, but discouraged
export const useAuthStore = useUIAuthStore;
