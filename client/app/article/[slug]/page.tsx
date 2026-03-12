'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { articleAPI, commentAPI, likeAPI, bookmarkAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bookmark, Clock, MessageCircle, Heart, User as UserIcon, ArrowLeft, Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  author_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  reading_time_minutes: number;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_full_name: string | null;
  author_avatar_url: string | null;
  author_bio: string | null;
  likes_count: number;
  comments_count: number;
  tags: Array<{ id: string; name: string; slug: string }>;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchArticle = async () => {
    try {
      const res = await articleAPI.getBySlug(slug);
      setArticle(res.data.article);
      setLikesCount(res.data.article.likes_count);
      setComments(res.data.article.comments_count > 0 ? await fetchComments() : []);
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await commentAPI.getByArticle(article!.id);
      return res.data.comments;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return [];
    }
  };

  const checkLikeStatus = async () => {
    if (!user || !article) return;
    try {
      const res = await likeAPI.getStatus('article', article.id);
      setLiked(res.data.liked);
    } catch (error) {
      // Ignore
    }
  };

  const checkBookmarkStatus = async () => {
    if (!user || !article) return;
    try {
      const res = await bookmarkAPI.getAll();
      setBookmarked(res.data.bookmarks.some((b: Article) => b.id === article.id));
    } catch (error) {
      // Ignore
    }
  };

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (article && user) {
      checkLikeStatus();
      checkBookmarkStatus();
    }
  }, [article, user]);

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    if (!article) return;

    try {
      const res = await likeAPI.toggle('article', article.id);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    if (!article) return;

    try {
      const res = await bookmarkAPI.toggle(article.id);
      setBookmarked(res.data.bookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !article) return;
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await commentAPI.create(article.id, { content: commentText });
      setComments(prev => [...prev, res.data.comment]);
      setCommentText('');
      setArticle(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
    } catch (error) {
      console.error('Failed to post comment:', error);
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
        parentId 
      });
      setComments(prev => [...prev, res.data.comment]);
      setReplyingTo(null);
      setReplyText('');
      setArticle(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
    } catch (error) {
      console.error('Failed to post reply:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    if (!confirm('Delete this comment?')) return;

    try {
      await commentAPI.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setArticle(prev => prev ? { ...prev, comments_count: prev.comments_count - 1 } : null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const renderComment = (comment: Comment) => {
    const isReply = comment.parent_id !== null;
    const isAuthor = user?.id === comment.id; // This should be user.id comparison
    
    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-4' : 'py-4 border-b border-slate-100'}`}>
        <div className="flex gap-3">
          {comment.avatar_url ? (
            <Image
              src={comment.avatar_url}
              alt={comment.full_name || comment.username}
              width={isReply ? 32 : 40}
              height={isReply ? 32 : 40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <UserIcon className={`${isReply ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link 
                href={`/profile/${comment.username}`}
                className="font-medium text-slate-900 hover:text-blue-600 text-sm"
              >
                {comment.full_name || comment.username}
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
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-blue-600 hover:text-blue-700 mt-2"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Article not found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.slug}`}
                className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/profile/${article.author_username}`}>
              {article.author_avatar_url ? (
                <Image
                  src={article.author_avatar_url}
                  alt={article.author_full_name || article.author_username}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
              )}
            </Link>
            <div>
              <Link 
                href={`/profile/${article.author_username}`}
                className="font-medium text-slate-900 hover:text-blue-600"
              >
                {article.author_full_name || article.author_username}
              </Link>
              {article.author_bio && (
                <p className="text-sm text-slate-500">{article.author_bio}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
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
            </div>
          </div>

          {/* Cover Image */}
          {article.cover_image && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <Image
                src={article.cover_image}
                alt=""
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-slate max-w-none mb-12">
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
            {article.content}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between py-4 border-y border-slate-200 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                liked
                  ? 'bg-red-50 text-red-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount} likes</span>
            </button>

            <div className="flex items-center gap-2 text-slate-600">
              <MessageCircle className="h-5 w-5" />
              <span>{article.comments_count} comments</span>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full transition ${
              bookmarked
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Comments Section */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Comments ({article.comments_count})
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex gap-3">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name || user.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button type="submit" disabled={!commentText.trim() || submittingComment}>
                      {submittingComment ? 'Posting...' : 'Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-slate-600 mb-2">Sign in to join the discussion</p>
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div>
            {comments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments
                .filter(c => c.parent_id === null)
                .map(comment => (
                  <div key={comment.id}>
                    {renderComment(comment)}
                    {/* Replies */}
                    {comments
                      .filter(c => c.parent_id === comment.id)
                      .map(reply => renderComment(reply))
                    }
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}