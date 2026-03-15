"use client";

import { useState, useEffect } from "react";
import { bookmarkAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language";
import RenderArticle from "@/components/RenderArticle";

export default function BookmarksPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const res = await bookmarkAPI.getAll();
        setArticles(res.data.bookmarks);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen pt-20 w-full">
      <div className="max-w-4xl mx-auto px-[10%] md:px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("bookmarks")}</h1>
          <p className="text-muted-foreground">{t("bookmarksDesc")}</p>
        </div>

        {loading ? (
          <RenderArticle.Skeleton />
        ) : articles.length === 0 ? (
          <RenderArticle.Empty />
        ) : (
          articles.map(RenderArticle)
        )}
      </div>
    </div>
  );
}
