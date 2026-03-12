"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { userAPI, articleAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Bookmark,
  Edit,
  Heart,
  MessageCircle,
  Clock,
  Plus,
  Check,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  followers_count: number;
  following_count: number;
}

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

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"articles" | "bookmarks">(
    "articles",
  );

  const isOwnProfile = currentUser?.username === username;

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile(username);
      setProfile(res.data.user);
      setFollowersCount(res.data.user.followers_count);
      setFollowingCount(res.data.user.following_count);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await articleAPI.getAll({ author: username });
      setArticles(res.data.articles || []);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!isOwnProfile) return;
    try {
      const res = await userAPI.getBookmarks();
      setArticles(res.data.bookmarks || []);
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || isOwnProfile) return;
    try {
      const res = await userAPI.getFollowStatus(profile!.id);
      setIsFollowing(res.data.is_following);
    } catch (error) {
      console.error("Failed to check follow status:", error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
      fetchArticles();
    }
  }, [username]);

  useEffect(() => {
    if (profile && currentUser && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [profile, currentUser]);

  useEffect(() => {
    if (activeTab === "bookmarks" && isOwnProfile) {
      setLoading(true);
      fetchBookmarks();
    } else if (activeTab === "articles") {
      setLoading(true);
      fetchArticles();
    }
  }, [activeTab]);

  const handleFollow = async () => {
    if (!currentUser) {
      window.location.href = "/auth";
      return;
    }
    if (!profile) return;

    setFollowingLoading(true);
    try {
      if (isFollowing) {
        await userAPI.unfollow(profile.id);
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
      } else {
        await userAPI.follow(profile.id);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setFollowingLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            User not found
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || profile.username}
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-30 h-30 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <UserIcon className="h-16 w-16 text-white" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {profile.full_name || profile.username}
                </h1>
                {isOwnProfile ? (
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={handleFollow}
                    disabled={followingLoading}
                  >
                    {followingLoading ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : isFollowing ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-slate-600 mb-3">@{profile.username}</p>

              {profile.bio && (
                <p className="text-slate-700 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-900">
                    {followersCount}
                  </span>
                  Followers
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-900">
                    {followingCount}
                  </span>
                  Following
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Joined {formatDate(profile.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("articles")}
              className={`flex-1 py-4 text-sm font-medium transition ${
                activeTab === "articles"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Articles
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 py-4 text-sm font-medium transition ${
                  activeTab === "bookmarks"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bookmark className="h-4 w-4 inline mr-2" />
                Bookmarks
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">
              {activeTab === "articles"
                ? "No articles yet."
                : "No bookmarks yet."}
            </p>
            {isOwnProfile && activeTab === "articles" && (
              <Link href="/write" className="mt-4 inline-block">
                <Button>Write your first article</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {article.cover_image && (
                    <img
                      src={article.cover_image}
                      alt=""
                      width={120}
                      height={80}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      <Link
                        href={`/article/${article.slug}`}
                        className="hover:text-blue-600 transition"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    {article.excerpt && (
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
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
                      <span>
                        {formatDate(article.published_at || article.created_at)}
                      </span>
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
