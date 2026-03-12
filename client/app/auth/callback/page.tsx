'use client'
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { authAPI } from "@/lib/api";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const signin = async () => {
      try {
        const sessionRes: any = await supabase.auth.getSession();
        const token = sessionRes?.data?.session?.access_token;
        if (token) {
          sessionStorage.setItem("token", token);
        }

        try {
          const res = await authAPI.getMe();
          if (res?.data?.user) {
            sessionStorage.setItem("user", JSON.stringify(res.data.user));
          }
        } catch (e) {
          // ignore
        }
      } finally {
        router.push("/");
      }
    };
    signin();
  }, []);

  return (
    <div className="h-screen w-full grid place-items-center">
      <Loader2Icon className="animate-spin" />
    </div>
  );
}
