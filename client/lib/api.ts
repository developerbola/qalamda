import axios from "axios";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/useAuthStore";

/**
 * ==================== AXIOS INTERCEPTOR ====================
 * Modern interceptor using Supabase sessions directly for authentication.
 * No redundant state required.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request: Hydrate with JWT from Supabase.
 */
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

/**
 * Response: Handle session expiration.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const path = window.location.pathname || "";
        
        // Prevent redirect loops for auth pages
        if (!path.startsWith("/auth")) {
          supabase.auth.signOut();
          useAuthStore.getState().logoutStore();
          window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Clean Auth API wrappers.
 */
export const authAPI = {
  getMe: () => api.get("/api/auth/me"),
  syncProfile: () => api.post("/api/auth/sync"),
};

// ... keep other APIs (userAPI, articleAPI, etc.)
export const userAPI = {
  getProfile: (username: string) => api.get(`/api/users/${username}`),
  updateProfile: (data: any) => api.patch("/api/users/profile", data),
  follow: (userId: string) => api.post(`/api/users/${userId}/follow`),
  unfollow: (userId: string) => api.delete(`/api/users/${userId}/follow`),
  getFollowStatus: (userId: string) => api.get(`/api/users/${userId}/follow-status`),
  getBookmarks: () => api.get("/api/users/me/bookmarks"),
};

export const articleAPI = {
  getAll: (params?: any) => api.get("/api/articles", { params }),
  getBySlug: (slug: string) => api.get(`/api/articles/${slug}`),
  create: (data: any) => api.post("/api/articles", data),
  update: (id: string, data: any) => api.patch(`/api/articles/${id}`, data),
  delete: (id: string) => api.delete(`/api/articles/${id}`),
};

export const commentAPI = {
  getByArticle: (id: string) => api.get(`/api/articles/${id}/comments`),
  create: (id: string, data: any) => api.post(`/api/articles/${id}/comments`, data),
  delete: (id: string) => api.delete(`/api/comments/${id}`),
};

export const likeAPI = {
  toggle: (type: string, id: string) => api.post(`/api/${type}/${id}/like`),
  getStatus: (type: string, id: string) => api.get(`/api/${type}/${id}/like-status`),
};

export const bookmarkAPI = {
  toggle: (id: string) => api.post(`/api/articles/${id}/bookmark`),
  getAll: () => userAPI.getBookmarks(),
};

export const tagAPI = {
  getAll: () => api.get("/api/tags"),
  getArticles: (slug: string, params?: any) => api.get(`/api/tags/${slug}/articles`, { params }),
};
