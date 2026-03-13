"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { articleAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Save,
  Send,
  Image as ImageIcon,
  Loader2,
  AlertCircleIcon,
} from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useLanguage } from "@/lib/language";

export default function WritePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    if (typeof window !== "undefined") {
      router.push("/auth");
    }
    return null;
  }

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setError("");
    const setLoading = publish ? setPublishing : setSaving;

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await articleAPI.create({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        tags: tagArray,
        isPublished: publish,
      });

      router.push(`/article/${res.data.article.slug}`);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save article");
      setPublishing(false);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    setSaving(true);
    handleSave(false);
  };

  const handlePublish = () => {
    setPublishing(true);
    handleSave(true);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-[10%] md:px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t("writeStory")}</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("saveDraft")}
                </>
              )}
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  {t("publishing")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t("publish")}
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-3">
            <AlertCircleIcon />
            <AlertTitle>{t("errorPublishing")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-xl p-6 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("title")}
              className="w-full text-3xl font-bold placeholder-muted-foreground border-none outline-none focus:ring-0 px-0"
            />
          </div>

          {/* Excerpt */}
          <div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={t("excerpt")}
              rows={2}
              className="w-full text-foreground/90 placeholder-muted-foreground border-none outline-none focus:ring-0 px-0 resize-none"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {t("coverImageUrl")}
              </span>
            </div>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-border/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("content")}
              rows={20}
              className="w-full px-0 border-none outline-none focus:ring-0 resize-none text-lg leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("tags")}
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="technology, programming, web development"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-slate-700">
                {isPublished ? t("published") : t("draft")}
              </span>
            </label>
            <span className="text-sm text-slate-500">
              {isPublished
                ? t("publishedDesc")
                : t("draftDesc")}
            </span>
          </div>
        </div>

        {/* Word Count */}
        <div className="mt-4 text-sm text-slate-500 text-right">
          {content.split(/\s+/).filter((w) => w.length > 0).length} words
        </div>
      </div>
    </div>
  );
}
