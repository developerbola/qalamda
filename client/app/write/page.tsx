'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { articleAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Save, Send, Image as ImageIcon } from 'lucide-react';

export default function WritePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/auth');
    }
    return null;
  }

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setError('');
    const setLoading = publish ? setPublishing : setSaving;

    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

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
      setError(error.response?.data?.error || 'Failed to save article');
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
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Write a Story</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full text-3xl font-bold placeholder-slate-400 border-none outline-none focus:ring-0 px-0"
            />
          </div>

          {/* Excerpt */}
          <div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Add a brief excerpt (optional)"
              rows={2}
              className="w-full text-slate-600 placeholder-slate-400 border-none outline-none focus:ring-0 px-0 resize-none"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Cover Image URL</span>
            </div>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story..."
              rows={20}
              className="w-full px-0 border-none outline-none focus:ring-0 resize-none text-lg leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tags (comma-separated)
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
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-slate-700">
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </label>
            <span className="text-sm text-slate-500">
              {isPublished 
                ? 'Your story will be visible to everyone' 
                : 'Only you can see this draft'
              }
            </span>
          </div>
        </div>

        {/* Word Count */}
        <div className="mt-4 text-sm text-slate-500 text-right">
          {content.split(/\s+/).filter(w => w.length > 0).length} words
        </div>
      </div>
    </div>
  );
}