'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tagAPI } from '@/lib/api';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  article_count: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await tagAPI.getAll();
        setTags(res.data.tags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tags</h1>
          <p className="text-slate-600">Explore content by topic.</p>
        </div>

        {tags.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No tags available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${tag.slug}`}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition group"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 mb-2">
                  {tag.name}
                </h3>
                {tag.description && (
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {tag.description}
                  </p>
                )}
                <div className="text-sm text-slate-500">
                  {tag.article_count} article{tag.article_count !== 1 ? 's' : ''}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}