import { create } from "zustand";

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
  token: string | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  setLoading: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,
  setUser: (u) => set({ user: u }),
  setToken: (t) => set({ token: t }),
  setLoading: (v) => set({ loading: v }),
}));
