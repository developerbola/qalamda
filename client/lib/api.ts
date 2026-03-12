import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }) => api.post('/api/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  
  getMe: () => api.get('/api/auth/me'),
};

// User APIs
export const userAPI = {
  getProfile: (username: string) => api.get(`/api/users/${username}`),
  updateProfile: (data: {
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
  }) => api.patch('/api/users/profile', data),
  follow: (userId: string) => api.post(`/api/users/${userId}/follow`),
  unfollow: (userId: string) => api.delete(`/api/users/${userId}/follow`),
  getFollowStatus: (userId: string) =>
    api.get(`/api/users/${userId}/follow-status`),
  getBookmarks: () => api.get('/api/users/me/bookmarks'),
};

// Article APIs
export const articleAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    tag?: string;
    author?: string;
    search?: string;
  }) => api.get('/api/articles', { params }),
  getBySlug: (slug: string) => api.get(`/api/articles/${slug}`),
  create: (data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    isPublished?: boolean;
  }) => api.post('/api/articles', data),
  update: (articleId: string, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    isPublished?: boolean;
  }) => api.patch(`/api/articles/${articleId}`, data),
  delete: (articleId: string) => api.delete(`/api/articles/${articleId}`),
};

// Comment APIs
export const commentAPI = {
  getByArticle: (articleId: string) =>
    api.get(`/api/articles/${articleId}/comments`),
  create: (articleId: string, data: { content: string; parentId?: string }) =>
    api.post(`/api/articles/${articleId}/comments`, data),
  delete: (commentId: string) => api.delete(`/api/comments/${commentId}`),
};

// Like APIs
export const likeAPI = {
  toggle: (targetType: 'article' | 'comment', targetId: string) =>
    api.post(`/api/${targetType}/${targetId}/like`),
  getStatus: (targetType: 'article' | 'comment', targetId: string) =>
    api.get(`/api/${targetType}/${targetId}/like-status`),
};

// Bookmark APIs
export const bookmarkAPI = {
  toggle: (articleId: string) => api.post(`/api/articles/${articleId}/bookmark`),
  getAll: () => userAPI.getBookmarks(),
};

// Tag APIs
export const tagAPI = {
  getAll: () => api.get('/api/tags'),
  getArticles: (tagSlug: string, params?: { page?: number; limit?: number }) =>
    api.get(`/api/tags/${tagSlug}/articles`, { params }),
};

export type { AxiosResponse } from 'axios';
