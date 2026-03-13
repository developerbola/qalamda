import { create } from "zustand";
import { userAPI } from "./api";

interface FollowedUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface UserActivityState {
  likedArticles: Set<string>;
  bookmarkedArticles: Set<string>;
  following: FollowedUser[];
  hasFetched: boolean;
  loading: boolean;
  fetchActivity: () => Promise<void>;
  toggleLikeLocally: (id: string, isLiked: boolean) => void;
  toggleBookmarkLocally: (id: string, isBookmarked: boolean) => void;
  reset: () => void;
}

export const useUserActivityStore = create<UserActivityState>((set, get) => ({
  likedArticles: new Set(),
  bookmarkedArticles: new Set(),
  following: [],
  hasFetched: false,
  loading: false,

  fetchActivity: async () => {
    if (get().hasFetched || get().loading) return;
    set({ loading: true });

    try {
      const [likesRes, bookmarksRes, followingRes] = await Promise.all([
        userAPI.getLikes(),
        userAPI.getBookmarks(),
        userAPI.getFollowing(),
      ]);

      const likes = likesRes.data.likes || [];
      const bookmarks = (bookmarksRes.data.bookmarks || []).map((b: any) =>
        typeof b === "string" ? b : b.article_id || b.id || b,
      );
      const following = followingRes.data.following || [];

      set({
        likedArticles: new Set(likes),
        bookmarkedArticles: new Set(bookmarks),
        following: following,
        hasFetched: true,
      });
    } catch (e) {
      console.error("Failed to fetch user activity", e);
    } finally {
      set({ loading: false });
    }
  },

  toggleLikeLocally: (id, isLiked) => {
    set((state) => {
      const next = new Set(state.likedArticles);
      if (isLiked) next.add(id);
      else next.delete(id);
      return { likedArticles: next };
    });
  },

  toggleBookmarkLocally: (id, isBookmarked) => {
    set((state) => {
      const next = new Set(state.bookmarkedArticles);
      if (isBookmarked) next.add(id);
      else next.delete(id);
      return { bookmarkedArticles: next };
    });
  },

  reset: () => {
    set({
      likedArticles: new Set(),
      bookmarkedArticles: new Set(),
      following: [],
      hasFetched: false,
    });
  },
}));
