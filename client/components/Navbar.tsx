"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Search,
  User,
  LogOut,
  Bookmark,
  X,
  Settings,
  Globe,
  Palette,
  Check,
  SquarePen,
  TextAlignEnd,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Logo from "./Logo";
import { SidebarTrigger } from "./ui/sidebar";

export default function Navbar({
  initialUsername,
}: {
  initialUsername?: string;
}) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const effectiveUsername = user?.username || initialUsername;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname && pathname.startsWith("/auth")) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { href: "/tags", label: t("tags") },
    ...(mounted && user ? [{ href: "/write", label: t("write") }] : []),
  ];

  return (
    <nav className="fixed flex items-center justify-center top-0 z-50 w-full bg-background h-16 border-b border-border/40">
      <div className="flex items-center justify-between px-[5%] w-full">
        <div className="flex items-center gap-2">
          {user && <SidebarTrigger />}
          <Link href="/" className="h-max w-[120px]">
            <Logo className="h-full w-auto" />
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-6"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-foreground"
              />
            </div>
          </form>
        </div>

        {/* Auth & Settings Section */}
        <div className="hidden md:flex items-center gap-1">
          {!mounted && !initialUsername ? (
            <div className="w-8 h-8" />
          ) : user || initialUsername ? (
            <>
              <Link href="/bookmarks">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/write">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("write")}
                  <SquarePen />
                </Button>
              </Link>

              {!mounted ? (
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-accent/50 cursor-pointer transition-colors border border-transparent hover:border-border/50 h-auto"
                >
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50 shadow-sm">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {effectiveUsername}
                  </span>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-accent/50 cursor-pointer transition-colors border border-transparent hover:border-border/50 h-auto"
                    >
                      <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50 shadow-sm">
                        {user?.avatar_url ? (
                          <Avatar className={"size-5"}>
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className={"text-[10px]"}>
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {effectiveUsername}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground uppercase py-2 px-3">
                        {t("settings")}
                      </DropdownMenuLabel>
                      <Link href={`/profile/${effectiveUsername}`}>
                        <DropdownMenuItem className="cursor-pointer py-2 px-3">
                          <User className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span>{t("profile")}</span>
                        </DropdownMenuItem>
                      </Link>

                      <Link href="/settings">
                        <DropdownMenuItem className="cursor-pointer py-2 px-3">
                          <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span>{t("settings")}</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>

                    <DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="py-2 px-3">
                          <Palette className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span>{t("theme")}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-40">
                          <DropdownMenuItem
                            onClick={() => setTheme("light")}
                            className="justify-between"
                          >
                            {t("light")}{" "}
                            {theme === "light" && <Check className="h-3 w-3" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTheme("dark")}
                            className="justify-between"
                          >
                            {t("dark")}{" "}
                            {theme === "dark" && <Check className="h-3 w-3" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTheme("sepia")}
                            className="justify-between"
                          >
                            {t("sepia")}{" "}
                            {theme === "sepia" && <Check className="h-3 w-3" />}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="py-2 px-3">
                          <Globe className="mr-3 h-4 w-4 text-muted-foreground" />
                          <span>{t("language")}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-40">
                          <DropdownMenuItem
                            onClick={() => setLanguage("uz")}
                            className="justify-between"
                          >
                            O'zbekcha{" "}
                            {language === "uz" && <Check className="h-3 w-3" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setLanguage("uzc")}
                            className="justify-between"
                          >
                            Ўзбекча{" "}
                            {language === "uzc" && (
                              <Check className="h-3 w-3" />
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setLanguage("ru")}
                            className="justify-between"
                          >
                            Русский{" "}
                            {language === "ru" && <Check className="h-3 w-3" />}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>

                    <DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer py-2 px-3"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span>{t("signOut")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-foreground">
                  {t("signIn")}
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t("getStarted")}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <TextAlignEnd className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-xl animate-in slide-in-from-top-1 px-4 py-6 z-40">
          <div className="space-y-6">
            {/* Mobile Nav Links */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-xl text-base font-medium transition-all active:scale-95",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <DropdownMenuSeparator className="opacity-50" />

            {/* Theme Selector (Mobile) */}
            <div className="space-y-3 px-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
                {t("theme")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["light", "dark", "sepia"].map((tKey) => (
                  <Button
                    key={tKey}
                    variant={theme === tKey ? "default" : "outline"}
                    size="sm"
                    className="justify-start gap-3 h-11 px-4 rounded-xl border-border/60"
                    onClick={() => setTheme(tKey as any)}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border shadow-sm",
                        tKey === "light" && "bg-white",
                        tKey === "dark" && "bg-black",
                        tKey === "sepia" && "bg-[#f4ecd8]",
                      )}
                    />
                    <span className="capitalize text-sm font-medium">
                      {t(tKey)}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Selector (Mobile) */}
            <div className="space-y-3 px-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
                {t("language")}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: "uz", label: "UZ" },
                  { code: "uzc", label: "ЎЗ" },
                  { code: "ru", label: "RU" },
                ].map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? "default" : "outline"}
                    size="sm"
                    className="h-10 px-5 text-sm font-semibold rounded-xl border-border/60"
                    onClick={() => setLanguage(lang.code as any)}
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator className="opacity-50" />

            {/* Mobile Auth Links */}
            <div className="space-y-2">
              {!mounted && !initialUsername ? (
                <div className="h-12" />
              ) : user || initialUsername ? (
                <>
                  <Link
                    href={`/profile/${effectiveUsername}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 text-base px-3 hover:bg-accent/50"
                    >
                      <User className="h-5 w-5 mr-3 text-muted-foreground" />
                      {t("profile")}
                    </Button>
                  </Link>
                  <Link
                    href="/bookmarks"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 text-base px-3 hover:bg-accent/50"
                    >
                      <Bookmark className="h-5 w-5 mr-3 text-muted-foreground" />
                      {t("bookmarks")}
                    </Button>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 text-base px-3 hover:bg-accent/50"
                    >
                      <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                      {t("settings")}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-base px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {t("signOut")}
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base font-semibold border-border/60"
                    >
                      {t("signIn")}
                    </Button>
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full h-12 text-base font-semibold">
                      {t("getStarted")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
