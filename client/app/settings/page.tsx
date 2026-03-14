"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { User, Save, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    if (typeof window !== "undefined") {
      router.push("/auth");
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await userAPI.updateProfile({
        fullName: fullName.trim() || undefined,
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      updateUser(res.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    fullName.trim() !== (user.full_name || "") ||
    username.trim() !== (user.username || "") ||
    bio.trim() !== (user.bio || "") ||
    avatarUrl.trim() !== (user.avatar_url || "");

  return (
    <div className="min-h-screen pt-20 w-full">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("settings")}</h1>
          <p className="text-muted-foreground">{t("settingsDesc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {t("profileUpdated")}
            </div>
          )}

          {/* Avatar URL */}
          <div>
            <label
              htmlFor="avatarUrl"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              {t("avatarUrl")}
            </label>
            <Input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="h-10"
              placeholder="https://example.com/avatar.jpg"
            />
            {avatarUrl && (
              <div className="mt-3">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              {t("fullName")}
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-10"
              placeholder="John Doe"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              {t("bio")}
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              // className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t("emailNoChange")}
            </label>
            <Input type="email" value={user.email} disabled className="h-10" />
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              {t("usernameLabel")}
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="h-10"
              placeholder="username"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Button type="submit" disabled={saving || !hasChanges}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("saveChanges")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
