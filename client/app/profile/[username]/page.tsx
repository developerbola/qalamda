import ProfileClient from "./ProfileClient";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const cookieStore = await cookies();

  let profile = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`,
      {
        cache: "no-store",
      },
    );
    const data = await res.json();
    profile = data.user;
  } catch (error) {
    console.error("Failed to fetch profile on server:", error);
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-2">
            User not found
          </h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  let isFollowing = false;
  const token = cookieStore.get("qalamda_token")?.value;

  if (token && profile) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile.id}/follow-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );
      if (res.ok) {
        const data = await res.json();
        isFollowing = data.is_following;
      }
    } catch (error) {
      console.error("Failed to fetch follow status on server:", error);
    }
  }

  return (
    <ProfileClient
      initialProfile={profile}
      initialIsFollowing={isFollowing}
      username={username}
    />
  );
}
