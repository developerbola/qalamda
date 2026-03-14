"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { userAPI, articleAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Bookmark,
  Edit,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import RenderArticle from "@/components/RenderArticle";

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

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { t } = useLanguage();

  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
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
      setProfileLoading(false);
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
      return new Date(dateString).toLocaleString();
    } catch {
      return "";
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">
            {t("userNotFound")}
          </h1>
          <Link href="/">
            <Button>{t("backToHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 w-full">
      <div className="max-w-4xl mx-auto px-[10%] md:px-4 py-8">
        {/* Profile Header */}
        <div className="p-6 mb-6">
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
              <div className="w-30 h-30 rounded-full bg-foreground/40 flex items-center justify-center">
                <UserIcon className="h-16 w-16 text-foreground" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                <h1 className="text-2xl font-bold">
                  {profile.full_name || profile.username}
                </h1>
                {isOwnProfile ? (
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      {t("editProfile")}
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
                        {t("following")}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("follow")}
                      </>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-muted-foreground mb-3">@{profile.username}</p>

              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">
                    {followersCount}
                  </span>
                  {t("followers")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">
                    {followingCount}
                  </span>
                  {t("following")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-xl mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab("articles")}
              className={`flex-1 py-4 text-sm font-medium cursor-pointer transition ${
                activeTab === "articles"
                  ? "text-foreground border-b-2 border-border"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {t("articles")}
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 py-4 text-sm font-medium cursor-pointer transition ${
                  activeTab === "bookmarks"
                    ? "text-foreground border-b-2 border-border"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                <Bookmark className="h-4 w-4 inline mr-2" />
                {t("bookmarks")}
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
                className="rounded-xl shadow-sm border border-muted-foreground p-6 animate-pulse"
              >
                <div className="h-6 bg-muted-goborder-muted-foreground rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-muted-goborder-muted-foreground rounded w-full mb-2"></div>
                <div className="h-4 bg-muted-goborder-muted-foreground rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl shadow-sm border border-muted-foreground p-12 text-center">
            <p className="text-muted-foreground">
              {activeTab === "articles" ? t("noArticles") : t("noBookmarks")}
            </p>
            {isOwnProfile && activeTab === "articles" && (
              <Link href="/write" className="mt-4 inline-block">
                <Button>{t("writeFirst")}</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map(RenderArticle)}
          </div>
        )}
      </div>
    </div>
  );
}
