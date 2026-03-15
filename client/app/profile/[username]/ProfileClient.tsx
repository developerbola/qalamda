"use client";

import { useState, useEffect } from "react";
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
import RenderArticle from "@/components/RenderArticle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface ProfileClientProps {
  initialProfile: UserProfile;
  initialIsFollowing: boolean;
  username: string;
}

export default function ProfileClient({
  initialProfile,
  initialIsFollowing,
  username,
}: ProfileClientProps) {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();

  const [profile] = useState<UserProfile>(initialProfile);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(
    initialProfile.followers_count,
  );
  const [followingCount] = useState(initialProfile.following_count);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"articles" | "bookmarks">(
    "articles",
  );

  const isOwnProfile = currentUser?.username === username;

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
      const res = await userAPI.getFollowStatus(profile.id);
      setIsFollowing(res.data.is_following);
    } catch (error) {
      console.error("Failed to check follow status:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "bookmarks" && isOwnProfile) {
      setLoading(true);
      fetchBookmarks();
    } else if (activeTab === "articles") {
      setLoading(true);
      fetchArticles();
    }
  }, [activeTab, username, isOwnProfile]);

  useEffect(() => {
    if (currentUser && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [currentUser, profile.id, isOwnProfile]);

  const handleFollow = async () => {
    if (!currentUser) {
      window.location.href = "/auth";
      return;
    }
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

  return (
    <div className="min-h-screen pt-20 w-full">
      <div className="max-w-4xl mx-auto px-[10%] md:px-4 py-8">
        {/* Profile Header */}
        <div className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            {profile.avatar_url ? (
              <Avatar className="size-30">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-3xl">
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
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
                      <Loader2 className="animate-spin size-4" />
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
                  ? "bg-foreground/2"
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
                    ? "bg-foreground/2"
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
