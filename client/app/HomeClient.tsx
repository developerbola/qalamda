"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { articleAPI, likeAPI, bookmarkAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useUserActivityStore } from "@/lib/useUserActivityStore";
import { useTagStore } from "@/lib/useTagStore";
import { Button } from "@/components/ui/button";
import { Bookmark, Clock, MessageCircle, Heart, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language";
import { formatDate } from "@/lib/utils";
import RenderArticle from "@/components/RenderArticle";


interface HomeClientProps {
  initialTags?: Tag[];
}

export default function HomeClient({ initialTags }: HomeClientProps) {
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const { t } = useLanguage();

  const {
    likedArticles,
    bookmarkedArticles,
    toggleLikeLocally,
    toggleBookmarkLocally,
    hasFetched,
  } = useUserActivityStore();

  const { tags, setTags, hasFetchedTags } = useTagStore();

  useEffect(() => {
    if (initialTags && !hasFetchedTags) {
      setTags(initialTags);
    }
  }, [initialTags, hasFetchedTags, setTags]);

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

  const handleBookmark = async (articleId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    try {
      const res = await bookmarkAPI.toggle(articleId);
      toggleBookmarkLocally(articleId, res.data.bookmarked);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  const getSearchParams = () => {
    if (typeof window === "undefined") return {};
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



  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const renderArticleCard = (article: Article) => {
    return (
      <Link href={`/article/${article.slug}`} key={article.id}>
        <article className="group flex flex-col gap-6 py-6 border-t border-border/30">
          {/* Content */}
          <div className="flex-1 flex items-center justify-between gap-10">
            {/* Author & Date */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-3 items-center">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/profile/${article.users.username}`);
                  }}
                  variant={"link"}
                  className="flex w-fit items-center gap-2 text-sm hover:underline px-0"
                >
                  {article.users.avatar_url && (
                    <Avatar className="size-5">
                      <AvatarImage src={article.users.avatar_url} />
                      <AvatarFallback className="text-[10px]">
                        {article.users.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {article.users.full_name || article.users.username}
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  <span>{formatDate(article.created_at)}</span>
                  {article.reading_time_minutes && (
                    <>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.reading_time_minutes} min
                      </span>
                    </>
                  )}
                </div>
              </div>
              {/* Title and Excerpt */}
              <h2 className="text-xl sm:text-2xl font-bold transition mb-2 line-clamp-2">
                {article.title}
              </h2>
              <p className="text-[12px] sm:text-base font-medium transition mb-2 line-clamp-2 text-muted-foreground">
                {article.excerpt}
              </p>

              <div className="flex items-center gap-4">
                <p className="text-[13px] flex items-center pt-[3px]">
                  {new Date(article.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div
                  className={`flex items-center gap-1 text-sm transition ${
                    likedArticles.has(article.id)
                      ? "text-red-500"
                      : "text-neutral-500 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${likedArticles.has(article.id) ? "fill-current" : ""}`}
                  />
                  {article.likes_count > 0 && (
                    <span className="text-destructive">
                      {article.likes_count}
                    </span>
                  )}
                </div>

                {article.comments_count > 0 && (
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <MessageCircle className="h-4 w-4" />
                    <span>{article.comments_count}</span>
                  </div>
                )}

                <button
                  onClick={(e) => handleBookmark(article.id, e)}
                  className={`transition cursor-pointer ${
                    bookmarkedArticles.has(article.id)
                      ? "text-blue-500"
                      : "text-neutral-500 hover:text-blue-500"
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${bookmarkedArticles.has(article.id) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Tags & Actions */}
            {article.cover_image && (
              <img
                src={article.cover_image}
                alt={article.title}
                // width={200}
                // height={100}
                className="rounded object-cover h-[70px] sm:h-[100px] min-w-1/4 flex-1 max-w-[30%]"
              />
            )}
          </div>
        </article>
      </Link>
    );
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto px-[10%] md:px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("latestStories")}</h1>
          <p className="">{t("discoverStories")}</p>
        </div>

        {/* Tags */}
        {tags.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag) => (
              <Link key={tag.id} href={`/tag/${tag.slug}`}>
                <Button
                  className={"rounded-full"}
                  variant={"outline"}
                  size={"sm"}
                >
                  {tag.name}
                </Button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mb-8 flex flex-wrap gap-2">
            {[...Array(4)].map((s, idx) => (
              <Button
                key={idx}
                className={"rounded-full w-[100px]"}
                variant={"outline"}
                size={"sm"}
              />
            ))}
          </div>
        )}

        {/* Articles */}
        {loading || (user && !hasFetched) ? (
          <div className="space-y-4 w-2xl flex-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse py-6 border-b border-border/40"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-foreground/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-foreground/10 rounded w-1/4" />
                    <div className="h-6 bg-foreground/10 rounded w-3/4" />
                    <div className="h-4 bg-foreground/10 rounded w-full" />
                    <div className="h-4 bg-foreground/10 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">{t("noArticlesFound")}</p>
          </div>
        ) : (
          articles.map(RenderArticle)
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t("previous")}
            </Button>
            <span className="flex items-center px-4 text-sm text-neutral-600">
              {t("page")} {page} {t("of")} {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t("next")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
