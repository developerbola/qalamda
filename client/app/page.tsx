"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { articleAPI, tagAPI, likeAPI, bookmarkAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Starter from "@/components/Starter";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  Clock,
  MessageCircle,
  Heart,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  article_count: number;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(
    new Set(),
  );

  const fetchArticles = async (
    pageNum: number,
    search?: string,
    tag?: string,
    author?: string,
  ) => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 10 };
      if (search) params.search = search;
      if (tag) params.tag = tag;
      if (author) params.author = author;

      const res = await articleAPI.getAll(params);
      setArticles(res.data.articles || []);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await tagAPI.getAll();
      setTags(res.data.tags || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const checkLikeStatus = async (articleId: string) => {
    if (!user) return;
    try {
      const res = await likeAPI.getStatus("article", articleId);
      if (res.data.liked) {
        setLikedArticles((prev) => new Set(prev).add(articleId));
      }
    } catch (error) {
      // Ignore errors for unauthenticated users
    }
  };

  const loadBookmarks = async () => {
    if (!user) return;
    try {
      const res = await bookmarkAPI.getAll();
      const bookmarkedIds = new Set<string>(
        (res.data.bookmarks || [])
          .map((b: any) => (typeof b === "string" ? b : b.article_id))
          .filter(Boolean),
      );
      setBookmarkedArticles(bookmarkedIds);
    } catch (error) {
      // Ignore errors
    }
  };

  const handleLike = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    try {
      const res = await likeAPI.toggle("article", articleId);
      if (res.data.liked) {
        setLikedArticles((prev) => new Set(prev).add(articleId));
      } else {
        setLikedArticles((prev) => {
          const next = new Set(prev);
          next.delete(articleId);
          return next;
        });
      }
      // Update local count
      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId
            ? { ...article, likes_count: res.data.likes_count }
            : article,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleBookmark = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    try {
      const res = await bookmarkAPI.toggle(articleId);
      if (res.data.bookmarked) {
        setBookmarkedArticles((prev) => new Set(prev).add(articleId));
      } else {
        setBookmarkedArticles((prev) => {
          const next = new Set(prev);
          next.delete(articleId);
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  useEffect(() => {
    fetchArticles(page);
    fetchTags();
  }, [page]);

  useEffect(() => {
    // Check like and bookmark status for articles
    articles.forEach((article) => {
      checkLikeStatus(article.id);
    });
    if (user) loadBookmarks();
  }, [articles, user]);

  const getSearchParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || undefined,
      tag: params.get("tag") || undefined,
      author: params.get("author") || undefined,
    };
  };

  useEffect(() => {
    const { search, tag, author } = getSearchParams();
    if (search || tag || author) {
      fetchArticles(1, search, tag, author);
    }
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString).toLocaleString(), {
        addSuffix: true,
      });
    } catch {
      return "";
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Starter />;
  }

  const renderArticleCard = (article: Article) => {
    console.log(article);

    return (
      <Link href={`/article/${article.slug}`}>
        <article key={article.id} className="group flex flex-col gap-6 py-6">
          {/* Author Avatar */}
          <Link
            href={`/profile/${article.users.username}`}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            {article.users.avatar_url ? (
              <Avatar className="size-5">
                <AvatarImage src={article.users.avatar_url} />
                <AvatarFallback>
                  {article.users.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="size-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
            )}
            {article.users.full_name}
          </Link>

          {/* Content */}
          <div className="flex-1">
            {/* Author & Date */}
            <div className="flex items-center gap-2 text-sm mb-2">
              <span>{formatDate(article.created_at)}</span>
              {article.reading_time_minutes && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.reading_time_minutes} min
                  </span>
                </>
              )}
            </div>

            {/* Title */}

            <h2 className="text-xl font-bol transition mb-2 line-clamp-2">
              {article.title}
            </h2>

            {/* Tags & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {article.cover_image && (
                  <img
                    src={article.cover_image}
                    alt=""
                    width={60}
                    height={40}
                    className="rounded object-cover"
                  />
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => handleLike(article.id, e)}
                  className={`flex items-center gap-1 text-sm transition ${
                    likedArticles.has(article.id)
                      ? "text-red-500"
                      : "text-neutral-500 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${likedArticles.has(article.id) ? "fill-current" : ""}`}
                  />
                  <span>{article.likes_count}</span>
                </button>

                <Link
                  href={`/article/${article.slug}`}
                  className="flex items-center gap-1 text-sm text-neutral-500 hover:text-blue-500 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{article.comments_count}</span>
                </Link>

                <button
                  onClick={(e) => handleBookmark(article.id, e)}
                  className={`transition ${
                    bookmarkedArticles.has(article.id)
                      ? "text-blue-600"
                      : "text-neutral-500 hover:text-blue-600"
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${bookmarkedArticles.has(article.id) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Latest Stories</h1>
          <p className="">Discover stories from writers around the world.</p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.slug}`}
                className="px-3 py-1 bg-white rounded-full text-sm text-neutral-700 hover:border-blue-300 hover:text-blue-600 transition"
              >
                {tag.name}
                <span className="ml-1">({tag.article_count})</span>
              </Link>
            ))}
          </div>
        )}

        {/* Articles */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse py-6 border-b border-neutral-100"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-1/4" />
                    <div className="h-6 bg-neutral-200 rounded w-3/4" />
                    <div className="h-4 bg-neutral-200 rounded w-full" />
                    <div className="h-4 bg-neutral-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No articles found.</p>
          </div>
        ) : (
          <div className="border-t border-border/80">
            {articles.map(renderArticleCard)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-neutral-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
