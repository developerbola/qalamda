import { create } from "zustand";

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  article_count?: number;
}

interface TagState {
  tags: Tag[];
  hasFetchedTags: boolean;
  setTags: (tags: Tag[]) => void;
}

export const useTagStore = create<TagState>((set) => ({
  tags: [],
  hasFetchedTags: false,
  setTags: (tags) => set({ tags, hasFetchedTags: true }),
}));
