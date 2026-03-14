declare global {
  interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string;
    reading_time_minutes: number;
    published_at: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    author_id: string;
    users: {
      username: string;
      full_name: string;
      avatar_url: string;
    };
  }
  interface Tag {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }
  interface TagsRes {
    json(): unknown;
    articles: Article[];
    total: number;
    page: number;
    totalPages: number;
  }
}
export {};
