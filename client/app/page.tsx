"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { articleAPI, tagAPI, likeAPI, bookmarkAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  Clock,
  MessageCircle,
  Heart,
  User as UserIcon,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  reading_time_minutes: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_full_name: string | null;
  author_avatar_url: string | null;
  likes_count: number;
  comments_count: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  article_count: number;
}

export default function HomePage() {
  const { user } = useAuth();
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
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const renderArticleCard = (article: Article) => (
    <article key={article.id} className="group flex gap-6 py-6">
      {/* Author Avatar */}
      <Link
        href={`/profile/${article.author_username}`}
        className="flex-shrink-0"
      >
        {article.author_avatar_url ? (
          <img
            src={article.author_avatar_url}
            alt={article.author_full_name || article.author_username}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Author & Date */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link
            href={`/profile/${article.author_username}`}
            className="font-medium text-slate-900 hover:text-blue-600 transition"
          >
            {article.author_full_name || article.author_username}
          </Link>
          <span>·</span>
          <span>{formatDate(article.published_at || article.created_at)}</span>
          {article.reading_time_minutes && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.reading_time_minutes} min read
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <Link href={`/article/${article.slug}`}>
          <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">
            {article.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
            {article.excerpt}
          </p>
        )}

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
                  : "text-slate-500 hover:text-red-500"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${likedArticles.has(article.id) ? "fill-current" : ""}`}
              />
              <span>{article.likes_count}</span>
            </button>

            <Link
              href={`/article/${article.slug}`}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-500 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{article.comments_count}</span>
            </Link>

            <button
              onClick={(e) => handleBookmark(article.id, e)}
              className={`transition ${
                bookmarkedArticles.has(article.id)
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-blue-600"
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
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Latest Stories
          </h1>
          <p className="text-slate-600">
            Discover stories from writers around the world.
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.slug}`}
                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:border-blue-300 hover:text-blue-600 transition"
              >
                {tag.name}
                <span className="ml-1 text-slate-400">
                  ({tag.article_count})
                </span>
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
                className="animate-pulse py-6 border-b border-slate-100"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No articles found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
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
            <span className="flex items-center px-4 text-sm text-slate-600">
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
