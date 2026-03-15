"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { authAPI } from "@/lib/api";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * ==================== AUTH CALLBACK ====================
 * Post-login landing page for OAuth (Google/GitHub).
 * Ensures profile sync before redirecting to home.
 */

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 1. Wait for Supabase to persist the session (native)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // 2. Trigger a one-time profile sync for safety
          const { data } = await authAPI.syncProfile();
          if (data?.user && data.user.has_interests === false) {
            router.push("/get-started/topics");
            return;
          }
        }
      } catch (e) {
        console.error("[Callback] Profile sync failed", e);
      } finally {
        if (!window.location.pathname.includes("/get-started/topics")) {
          router.push("/");
        }
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="h-screen w-full grid place-items-center">
      <Loader2Icon className="animate-spin h-8 w-8" />
    </div>
  );
}
