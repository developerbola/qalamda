"use client";
import RenderArticle from "@/components/RenderArticle";
import { tagAPI } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const ArticlesByTag = () => {
  const params = useParams();
  const tag = params.tag as string;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      const { data } = await tagAPI.getArticles(tag);
      setArticles(data.articles);
      setLoading(false);
    }
    fetchArticles();
  }, [tag]);

  return (
    <div className="min-h-screen pt-20 w-full">
      <div className="max-w-2xl mx-auto px-[10%] md:px-4 py-8">
        <h1 className="text-xl font-bold mb-4">Articles tagged with: {tag}</h1>
        <div className="space-y-4 h-full flex-1">
          {loading ? (
            <RenderArticle.Skeleton />
          ) : articles.length === 0 ? (
            <RenderArticle.Empty />
          ) : (
            articles.map(RenderArticle)
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesByTag;
