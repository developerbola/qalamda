"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { articleAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useUserActivityStore } from "@/lib/useUserActivityStore";
import { useTagStore } from "@/lib/useTagStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language";
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
  const [fetchingMore, setFetchingMore] = useState(false);
  const { t } = useLanguage();
  const observerTarget = useRef<HTMLDivElement>(null);

  const { hasFetched } = useUserActivityStore();

  const { tags, setTags, hasFetchedTags } = useTagStore();

  useEffect(() => {
    if (initialTags && !hasFetchedTags) {
      setTags(initialTags);
    }
  }, [initialTags, hasFetchedTags, setTags]);

  const fetchArticles = useCallback(
    async (pageNum: number, search?: string, tag?: string, author?: string) => {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setFetchingMore(true);
      }

      try {
        const params: any = { page: pageNum, limit: 10 };
        if (search) params.search = search;
        if (tag) params.tag = tag;
        if (author) params.author = author;

        const res = await articleAPI.getAll(params);
        const newArticles = res.data.articles || [];

        setArticles((prev) =>
          pageNum === 1 ? newArticles : [...prev, ...newArticles],
        );
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    const { search, tag, author } = getSearchParams();
    fetchArticles(page, search, tag, author);
  }, [page, fetchArticles]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          page < totalPages &&
          !loading &&
          !fetchingMore
        ) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [page, totalPages, loading, fetchingMore]);

  const getSearchParams = () => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || undefined,
      tag: params.get("tag") || undefined,
      author: params.get("author") || undefined,
    };
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto px-[10%] md:px-4">
        <header className="z-20 bg-background border-b border-border/40">
          <div className="flex gap-1 px-2 md:px-0">
            <Link href="/">
              <Button
                className={
                  "relative active-tab rounded-none px-4 py-2 border-0 h-full hover:bg-transparent!"
                }
                variant={"ghost"}
              >
                For you
              </Button>
            </Link>

            {tags.length > 0 ? (
              tags.map((tag) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}>
                  <Button
                    className={
                      "rounded-none px-4 py-5 border-0 h-full text-muted-foreground hover:bg-transparent!"
                    }
                    variant={"ghost"}
                  >
                    {tag.name}
                  </Button>
                </Link>
              ))
            ) : (
              <>
                {[...Array(4)].map((s, idx) => (
                  <Button
                    key={idx}
                    className={"rounded-none px-4 py-5 border-0"}
                    variant={"ghost"}
                    size={"sm"}
                  />
                ))}
              </>
            )}
          </div>
        </header>

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

        {/* Infinite Scroll Sentinel */}
        <div ref={observerTarget} className="h-10 w-full" />

        {/* Loading More Indicator */}
      </div>
    </div>
  );
}
