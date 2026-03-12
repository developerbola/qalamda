'use client'
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const signin = async () => {
      await supabase.auth.getSession();
      router.push("/");
    };
    signin();
  }, []);

  return (
    <div className="h-screen w-full grid place-items-center">
      <Loader2Icon className="animate-spin" />
    </div>
  );
}
