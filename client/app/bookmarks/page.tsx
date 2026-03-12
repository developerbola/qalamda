'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { articleAPI, bookmarkAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Bookmark, Clock, Heart, MessageCircle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  reading_time_minutes: number;
  published_at: string | null;
  created_at: string;
  author_username: string;
  author_full_name: string | null;
  author_avatar_url: string | null;
  likes_count: number;
  comments_count: number;
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const res = await bookmarkAPI.getAll();
        setArticles(res.data.bookmarks);
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bookmarks</h1>
          <p className="text-slate-600">Articles you've saved for later.</p>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Bookmark className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">You haven't bookmarked any articles yet.</p>
            <Link href="/">
              <Button>Explore Articles</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  {article.cover_image && (
                    <Image
                      src={article.cover_image}
                      alt=""
                      width={120}
                      height={80}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      <Link href={`/article/${article.slug}`} className="hover:text-blue-600 transition">
                        {article.title}
                      </Link>
                    </h2>
                    {article.excerpt && (
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <Link 
                        href={`/profile/${article.author_username}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {article.author_full_name || article.author_username}
                      </Link>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {article.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {article.comments_count}
                      </span>
                      {article.reading_time_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.reading_time_minutes} min
                        </span>
                      )}
                      <span>{formatDate(article.published_at || article.created_at)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}