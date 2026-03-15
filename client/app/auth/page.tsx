"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { authAPI } from "@/lib/api";
import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLastUsed(localStorage.getItem("lastUsed"));
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const res: any = await auth.register(
          email,
          username,
          password,
          fullName,
        );
        if (res?.error) throw new Error(res.error || "Registration failed");
        router.push("/get-started/topics");
      } else {
        const res: any = await auth.login(email, password);
        if (res?.error) throw new Error(res.error || "Login failed");
        
        // Check if onboarding is needed
        try {
          const { data } = await authAPI.getMe();
          if (data?.user && data.user.has_interests === false) {
            router.push("/get-started/topics");
          } else {
            router.push("/");
          }
        } catch (err) {
          router.push("/");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError(null);
    localStorage.setItem("lastUsed", provider);
    try {
      const res: any = await auth.signInWithOAuth(provider);
      if (res?.error) throw new Error(res.error || "OAuth failed");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 relative">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in to access your personal AI assistant
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                className="h-11 px-4"
                required
                value={email}
                placeholder="email@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    type="text"
                    className="h-11 px-4"
                    required
                    value={username}
                    placeholder="username"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input
                    type="text"
                    className="h-11 px-4"
                    value={fullName}
                    placeholder="Full name (optional)"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                className="h-11 px-4"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant={"outline"}
              className="w-full h-11 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  Create Account
                  <UserPlus size={18} />
                </>
              ) : (
                <>
                  Sign In
                  <LogIn size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-background px-2 text-xs text-muted-foreground uppercase">
              Or continue with
            </span>
          </div>

          <div className="flex justify-evenly relative">
            {lastUsed && (
              <div
                className={cn(
                  "absolute -top-1 py-[1px] px-[5px] bg-secondary rounded-[5px] text-[12px]",
                  lastUsed == "google" ? "left-[41%]" : "left-[90%]",
                )}
              >
                Last
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="w-[46%] flex items-center gap-3 rounded-sm! h-11"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26
                  1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92
                  3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98
                  7.28-2.66l-3.57-2.77c-.98.66-2.23
                  1.06-3.71 1.06-2.86
                  0-5.29-1.93-6.16-4.53H2.18v2.84C3.99
                  20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43
                  .35-2.09V7.07H2.18C1.43
                  8.55 1 10.22 1 12s.43
                  3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0
                  3.06.56 4.21 1.66l3.15-3.15C17.45
                  2.09 14.97 1 12 1 7.7
                  1 3.99 3.47 2.18 7.07l3.66
                  2.84c.87-2.6 3.3-4.53
                  6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuth("github")}
              disabled={loading}
              className="w-[46%] flex items-center gap-3 rounded-sm! h-11"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
              </svg>
              Github
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Need an account? Create one"}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-[96%] left-[85%] w-fit flex gap-3 opacity-40 text-xs">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of usage</Link>
      </div>
    </div>
  );
};

export default Auth;
