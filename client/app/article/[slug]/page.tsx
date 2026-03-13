"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { articleAPI, commentAPI, likeAPI, bookmarkAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useUserActivityStore } from "@/lib/useUserActivityStore";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  Clock,
  MessageCircle,
  Heart,
  User as UserIcon,
  Send,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  id: string;
  article_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  users: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  content: string;
  reading_time_minutes: number;
  published_at: string;
  likes_count: number;
  comments_count: number;
  author_id: string;
  users: {
    bio: string | null;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  tags: [
    {
      id: string;
      name: string;
      slug: string;
    },
  ];
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchArticle = async () => {
    try {
      const res = await articleAPI.getBySlug(slug);
      setArticle(res.data.article);
      setLikesCount(res.data.article.likes_count);
      setComments(
        res.data.article.comments_count > 0
          ? await fetchComments(res.data.article.id)
          : [],
      );
    } catch (error) {
      console.error("Failed to fetch article:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (articleId: string) => {
    try {
      const res = await commentAPI.getByArticle(articleId);
      return res.data.comments;
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      return [];
    }
  };
  const {
    likedArticles,
    bookmarkedArticles,
    toggleLikeLocally,
    toggleBookmarkLocally,
    hasFetched,
  } = useUserActivityStore();

  const liked = article ? likedArticles.has(article.id) : false;
  const bookmarked = article ? bookmarkedArticles.has(article.id) : false;

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      console.log("[handleLike] No user found, redirecting to /auth");
      window.location.href = "/auth";
      return;
    }
    if (!article) {
      console.log("[handleLike] No article found, skipping");
      return;
    }

    try {
      const res = await likeAPI.toggle("article", article.id);
      toggleLikeLocally(article.id, res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch (error: any) {
      console.error("Failed to toggle like:", error);
      if (error.response?.status === 401) {
        console.log("[handleLike] 401 received, redirecting to /auth");
        window.location.href = "/auth";
      }
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    if (!article) return;

    try {
      const res = await bookmarkAPI.toggle(article.id);
      toggleBookmarkLocally(article.id, res.data.bookmarked);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !article) return;
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await commentAPI.create(article.id, { content: commentText });
      setComments((prev) => [...prev, res.data.comment]);
      setCommentText("");
      setArticle((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : null,
      );
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !article) return;
    if (!replyText.trim()) return;

    try {
      const res = await commentAPI.create(article.id, {
        content: replyText,
        parentId,
      });
      setComments((prev) => [...prev, res.data.comment]);
      setReplyingTo(null);
      setReplyText("");
      setArticle((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : null,
      );
    } catch (error) {
      console.error("Failed to post reply:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    if (!confirm("Delete this comment?")) return;

    try {
      await commentAPI.delete(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setArticle((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count - 1 } : null,
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "";
    }
  };

  const renderComment = (comment: Comment) => {
    const isReply = comment.parent_id !== null;

    return (
      <div
        key={comment.id}
        className={`${isReply ? "ml-12 mt-4" : "py-4 border-b border-slate-100"}`}
      >
        <div className="flex gap-3">
          {comment.users.avatar_url ? (
            <Avatar>
              <AvatarImage src={comment.users.avatar_url} />
              <AvatarFallback>
                {comment.users.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${isReply ? "w-8 h-8" : "w-10 h-10"}`}
            >
              <UserIcon
                className={`${isReply ? "h-4 w-4" : "h-5 w-5"} text-white`}
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/profile/${comment.users.username}`}
                className="font-medium text-slate-900 hover:text-blue-600 text-sm"
              >
                {comment.users.full_name || comment.users.username}
              </Link>
              <span className="text-xs text-slate-500">
                {formatDate(comment.created_at)}
              </span>
              {user && user.id === comment.author_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-6 text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
            <p className="text-slate-700 text-sm">{comment.content}</p>

            {user && !isReply && (
              <button
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
                className="cursor-pointer text-xs text-blue-600 hover:text-blue-700 mt-2"
              >
                Reply
              </button>
            )}

            {replyingTo === comment.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading || (user && !hasFetched)) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Article not found
          </h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {article.tags.map((tag) => (
              <Button
                key={tag.id}
                onClick={() => {
                  router.push(`/?tag=${tag.slug}`);
                }}
                variant={"outline"}
                size={"sm"}
                className="rounded-full"
              >
                {tag.name}
              </Button>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <Link href={`/profile/${article.users.username}`}>
              {article.users.avatar_url ? (
                <img
                  src={article.users.avatar_url}
                  alt={article.users.full_name || article.users.username}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-foreground/20 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
              )}
            </Link>
            <div>
              <Link
                href={`/profile/${article.users.username}`}
                className="font-medium hover:underline"
              >
                {article.users.full_name || article.users.username}
              </Link>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span>{formatDate(article.published_at)}</span>
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
            </div>
          </div>

          {article.cover_image && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={article.cover_image}
                alt=""
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </header>

        <div className="prose prose-slate max-w-none mb-12">
          <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-lg">
            {article.content}
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-y border-border/20 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition ${
                liked
                  ? "bg-destructive/10 text-destructive"
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              <span>{likesCount} likes</span>
            </button>

            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>{article.comments_count} comments</span>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full transition cursor-pointer ${
              bookmarked
                ? "bg-blue-500/15 text-blue-500"
                : "bg-foreground/10 hover:bg-foreground/15"
            }`}
          >
            <Bookmark
              className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Comments Section */}
        <section>
          <h2 className="text-xl font-bold mb-6">
            Comments ({article.comments_count})
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex gap-3">
                {user.avatar_url ? (
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add to the discussion..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg  focus:border-foreground/30 outline-none resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                    >
                      {submittingComment ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4  rounded-lg text-center">
              <p className="text-slate-600 mb-2">
                Sign in to join the discussion
              </p>
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div>
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments
                .filter((c) => c.parent_id === null)
                .map((comment) => (
                  <div key={comment.id}>
                    {renderComment(comment)}
                    {/* Replies */}
                    {comments
                      .filter((c) => c.parent_id === comment.id)
                      .map((reply) => renderComment(reply))}
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
