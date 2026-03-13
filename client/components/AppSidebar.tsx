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

const mainLinks = [
  { label: "Home", icon: Home },
  { label: "Library", icon: Bookmark },
  { label: "Profile", icon: User },
  { label: "Stories", icon: FileText },
  { label: "Stats", icon: BarChart2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith("/auth")) return null;

  return (
    <Sidebar>
      <SidebarContent className="pt-20 px-4 text-sm">
        {/* MAIN LINKS */}
        <SidebarGroup>
          <SidebarGroupContent className="space-y-1">
            {mainLinks.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className="flex items-center gap-3 cursor-pointer w-full px-2 py-2 rounded-md hover:bg-muted/70 transition"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* divider */}
        <div className="my-6 border-t" />

        {/* FOLLOWING */}
        <SidebarGroup>
          <SidebarGroupContent className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users size={20} />
              <span>Following</span>
            </div>

            <div className="flex items-center gap-3">
              <img src="/avatar.png" className="w-6 h-6 rounded-full" />
              <span>Habibov Ulug'bek</span>
            </div>

            <div className="flex items-start gap-3 text-muted-foreground">
              <Plus size={18} />
              <div>
                <p>Find writers and publications to follow.</p>
                <span className="underline cursor-pointer">
                  See suggestions
                </span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
