"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { articleAPI, userAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useUserActivityStore } from "@/lib/useUserActivityStore";
import { useTagStore } from "@/lib/useTagStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import RenderArticle from "@/components/RenderArticle";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const observerTarget = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { hasFetched } = useUserActivityStore();

  const { tags, setTags, hasFetchedTags } = useTagStore();

  useEffect(() => {
    if (initialTags && !hasFetchedTags) {
      setTags(initialTags);
    }
  }, [initialTags, hasFetchedTags, setTags]);

  useEffect(() => {
    const fetchUserInterests = async () => {
      if (user) {
        try {
          const res = await userAPI.getInterests();
          if (res.data?.tags) {
            setTags(res.data.tags);
          }
        } catch (error) {
          console.error("Failed to fetch user interests:", error);
        }
      }
    };

    // Only fetch if we are logged in - this ensures we show ONLY interests
    if (user) {
      fetchUserInterests();
    }
  }, [user, setTags]);

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
    const search = searchParams.get("search") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const author = searchParams.get("author") || undefined;
    fetchArticles(page, search, tag, author);
  }, [page, fetchArticles, searchParams]);

  useEffect(() => {
    setPage(1);
    setArticles([]);
  }, [searchParams]);

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

  const handleTagClick = (tagSlug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tagSlug) {
      params.set("tag", tagSlug);
    } else {
      params.delete("tag");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (user && user.has_interests === false) {
      router.push("/get-started/topics");
    }
  }, [user, router]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 w-full">
      <div className="max-w-2xl mx-auto px-[12%] md:px-4">
        <header className="sticky top-16 h-12 flex items-center z-20 bg-background">
          <div className="relative flex items-center gap-5 md:px-0 max-w-full overflow-x-auto no-scrollbar">
            <Button
              onClick={() => handleTagClick()}
              className={cn(
                "relative rounded-none px-0 border-0 h-12 hover:bg-transparent!",
                !searchParams.get("tag")
                  ? "active-tab text-foreground"
                  : "text-muted-foreground",
              )}
              variant={"ghost"}
            >
              For you
            </Button>

            {tags.length > 0 &&
              tags.map((tag) => (
                <Button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.slug)}
                  className={cn(
                    "relative rounded-none px-0 border-0 h-12 hover:bg-transparent!",
                    searchParams.get("tag") === tag.slug
                      ? "active-tab text-foreground"
                      : "text-muted-foreground",
                  )}
                  variant={"ghost"}
                >
                  {tag.name}
                </Button>
              ))}
            <div
              className="sticky right-0 h-[60px] w-[20px] z-12"
              style={{
                background:
                  "linear-gradient(90deg,transparent,var(--background))",
              }}
            >
              &#10240;
            </div>
          </div>
          <div className="absolute h-px w-full bottom-0 bg-border/40" />
        </header>

        {/* Articles */}
        {loading || (user && !hasFetched) ? (
          <RenderArticle.Skeleton />
        ) : articles.length === 0 ? (
          <RenderArticle.Empty />
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
