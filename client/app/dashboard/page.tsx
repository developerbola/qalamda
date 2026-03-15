"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Users, 
  FileText, 
  Eye, 
  TrendingUp, 
  Settings, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OWNER_EMAIL = "developerbola08@gmail.com";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== OWNER_EMAIL) {
        setIsAuthorized(false);
        // We could redirect here if we want to be strict
        // router.push('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || isAuthorized === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center space-y-4 px-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This page is restricted to the platform owner. If you believe this is an error, please contact support.
        </p>
        <Button onClick={() => router.push("/")} variant="outline" className="mt-4">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-[5%] pb-20 bg-background/50">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Owner Dashboard
            </div>
            <h1 className="text-4xl font-black tracking-tight">System Overview</h1>
            <p className="text-muted-foreground">Welcome back, Boss. Here's what's happening on Qalamda.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-10 border-border/40 bg-background/50 backdrop-blur-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="h-10 bg-primary shadow-lg shadow-primary/20">
              Export Reports
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Users" 
            value="1,284" 
            change="+12.5%" 
            icon={<Users className="w-5 h-5" />} 
            trend="up"
          />
          <StatsCard 
            title="Active Articles" 
            value="432" 
            change="+5.2%" 
            icon={<FileText className="w-5 h-5" />} 
            trend="up"
          />
          <StatsCard 
            title="Platform Views" 
            value="48.5K" 
            change="+18.7%" 
            icon={<Eye className="w-5 h-5" />} 
            trend="up"
          />
          <StatsCard 
            title="Growth Rate" 
            value="24.2%" 
            change="-2.1%" 
            icon={<TrendingUp className="w-5 h-5" />} 
            trend="down"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <section className="p-8 rounded-3xl bg-secondary/30 border border-border/40 backdrop-blur-xl">
              <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-border/40 last:border-0 hover:bg-white/5 transition-colors px-4 -mx-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">New user signed up: <span className="text-primary">@user_{i}23</span></p>
                        <p className="text-xs text-muted-foreground">{i * 2} minutes ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">View detail</Button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-6 text-muted-foreground text-sm">View all activity</Button>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <section className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20">
              <h3 className="text-lg font-bold mb-2">Pro Plan Status</h3>
              <p className="text-sm opacity-90 mb-6">Your enterprise subscription is active and healthy.</p>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-70">
                  <span>Storage</span>
                  <span>78%</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[78%] rounded-full shadow-lg" />
                </div>
              </div>
            </section>

            <section className="p-6 rounded-3xl bg-secondary/30 border border-border/40">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton icon={<FileText />} label="Articles" />
                <QuickActionButton icon={<ShieldCheck />} label="Moderation" />
                <QuickActionButton icon={<Eye />} label="Traffic" />
                <QuickActionButton icon={<Users />} label="Users" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, icon, trend }: any) {
  return (
    <div className="p-6 rounded-3xl bg-secondary/30 border border-border/40 hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-background group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
          {icon}
        </div>
        <div className={cn(
          "text-xs font-bold px-2 py-1 rounded-full",
          trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {change}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function QuickActionButton({ icon, label }: any) {
  return (
    <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-background/50 border border-border/40 hover:border-primary/50 hover:bg-primary/5 transition-all gap-2 group">
      <div className="text-muted-foreground group-hover:text-primary transition-colors [&_svg]:w-5 [&_svg]:h-5">
        {icon}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
