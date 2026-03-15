import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

import {
  Home,
  Bookmark,
  User,
  BarChart2,
  Users,
  Plus,
  Hash,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUserActivityStore } from "@/lib/useUserActivityStore";
import { useLanguage } from "@/lib/language";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

const mainLinks = [
  { label: "home", icon: Home, href: "/" },
  { label: "bookmarks", icon: Bookmark, href: "/bookmarks" },
  { label: "profile", icon: User, href: "/profile" },
  { label: "tags", icon: Hash, href: "/tags" },
  { label: "stats", icon: BarChart2, href: "/stats" },
];

export function AppSidebar({ initialUsername }: { initialUsername?: string }) {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/auth")) return null;
  const { user } = useAuth();
  const { t } = useLanguage();
  const { following, hasFetched } = useUserActivityStore();

  const effectiveUsername = user?.username || initialUsername;
  const profileHref = effectiveUsername
    ? `/profile/${effectiveUsername}`
    : "/auth";

  return (
    <Sidebar className="sticky">
      <SidebarContent className="mt-20 px-1 text-sm">
        {/* MAIN LINKS */}
        <SidebarGroup className="px-0">
          <SidebarGroupContent className="space-y-1 w-full">
            {mainLinks.map((item) => {
              const Icon = item.icon;
              const href = item.label === "profile" ? profileHref : item.href;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 cursor-pointer w-full px-4 py-2 transition",
                    isActive
                      ? "text-foreground border-l-2 pl-[14px] border-foreground"
                      : "text-foreground/60 hover:text-foreground",
                  )}
                >
                  <Icon size={20} />
                  <span>{t(item.label)}</span>
                </Link>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* divider */}
        <div className="my-6 border-t border-border/40" />

        {/* FOLLOWING */}
        <SidebarGroup className="px-4">
          <SidebarGroupContent className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground px-2">
              <Users size={20} />
              <span className="font-medium">{t("following")}</span>
            </div>

            {following.length > 0 ? (
              <div className="space-y-1">
                {following.map((followedUser) => (
                  <Link
                    key={followedUser.id}
                    href={`/profile/${followedUser.username}`}
                    className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-muted/70 transition"
                  >
                    <Avatar className="size-6">
                      <AvatarImage src={followedUser.avatar_url || ""} />
                      <AvatarFallback className="text-[10px]">
                        {followedUser.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {followedUser.full_name || followedUser.username}
                    </span>
                  </Link>
                ))}
              </div>
            ) : !hasFetched ? (
              <div className="space-y-3 px-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse"
                  >
                    <div className="size-6 bg-muted rounded-full" />
                    <div className="h-4 bg-muted rounded w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3 text-muted-foreground px-2">
                <Plus size={18} />
                <div>
                  <p className="text-xs leading-relaxed">{t("findWriters")}</p>
                  <span className="text-xs underline cursor-pointer hover:text-foreground">
                    {t("seeSuggestions")}
                  </span>
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
