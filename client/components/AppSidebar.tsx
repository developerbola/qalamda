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
  FileText,
  BarChart2,
  Users,
  Plus,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useUserActivityStore } from "@/lib/useUserActivityStore";
import { useLanguage } from "@/lib/language";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const mainLinks = [
  { label: "home", icon: Home, href: "/" },
  { label: "library", icon: Bookmark, href: "/bookmarks" },
  { label: "profile", icon: User, href: "/profile" },
  { label: "stories", icon: FileText, href: "/write" },
  { label: "stats", icon: BarChart2, href: "/stats" },
];

export function AppSidebar({ initialUsername }: { initialUsername?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { following } = useUserActivityStore();

  if (pathname && pathname.startsWith("/auth")) return null;

  // Use initialUsername from SSR/Cookie if user object isn't hydrated yet
  const effectiveUsername = user?.username || initialUsername;
  const profileHref = effectiveUsername ? `/profile/${effectiveUsername}` : "/auth";

  return (
    <Sidebar>
      <SidebarContent className="pt-20 px-4 text-sm">
        {/* MAIN LINKS */}
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            {mainLinks.map((item) => {
              const Icon = item.icon;
              const href = item.label === "profile" ? profileHref : item.href;

              return (
                <Link
                  key={item.label}
                  href={href}
                  className="flex items-center gap-3 cursor-pointer w-full px-2 py-2 rounded-md hover:bg-muted/70 transition"
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
        <SidebarGroup>
          <SidebarGroupContent className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground px-2">
              <Users size={20} />
              <span className="font-medium">{t("following")}</span>
            </div>

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

            {following.length === 0 && (
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
