"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut, Bookmark, Menu, X, Settings, Globe, Palette, Check } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname && pathname.startsWith("/auth")) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { href: "/tags", label: t("tags") },
    ...(user ? [{ href: "/write", label: t("write") }] : []),
  ];

  return (
    <nav className="fixed flex items-center justify-center top-0 z-50 w-full bg-background/80 backdrop-blur-md h-16 border-b border-border/40">
      <div className="flex items-center justify-between w-2/3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 h-5 w-[100px]">
          <img src="/logo.svg" alt="qalamda logo" className="h-full w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

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

        {/* Auth & Settings Section */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link href="/bookmarks">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-accent/50 cursor-pointer transition-colors border border-transparent hover:border-border/50">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border/50 shadow-sm">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">{user.username}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="text-xs text-muted-foreground uppercase py-2 px-3">{t("settings")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <Link href={`/profile/${user.username}`}>
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

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="py-2 px-3">
                      <Palette className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span>{t("theme")}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-40">
                      <DropdownMenuItem onClick={() => setTheme("light")} className="justify-between">
                        {t("light")} {theme === "light" && <Check className="h-3 w-3" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")} className="justify-between">
                        {t("dark")} {theme === "dark" && <Check className="h-3 w-3" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("sepia")} className="justify-between">
                        {t("sepia")} {theme === "sepia" && <Check className="h-3 w-3" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("slate")} className="justify-between">
                        {t("slate")} {theme === "slate" && <Check className="h-3 w-3" />}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="py-2 px-3">
                      <Globe className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span>{t("language")}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-32">
                      <DropdownMenuItem onClick={() => setLanguage("en")} className="justify-between">
                        English {language === "en" && <Check className="h-3 w-3" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("uz")} className="justify-between">
                        Uzbek {language === "uz" && <Check className="h-3 w-3" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage("ru")} className="justify-between">
                        Russian {language === "ru" && <Check className="h-3 w-3" />}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive cursor-pointer py-2 px-3"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>{t("signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-foreground">
                  {t("signIn")}
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
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
            <Menu className="h-6 w-6" />
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
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <DropdownMenuSeparator className="opacity-50" />

            {/* Theme Selector (Mobile) */}
            <div className="space-y-3 px-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">{t("theme")}</p>
              <div className="grid grid-cols-2 gap-2">
                {["light", "dark", "sepia", "slate"].map((tKey) => (
                  <Button
                    key={tKey}
                    variant={theme === tKey ? "default" : "outline"}
                    size="sm"
                    className="justify-start gap-3 h-11 px-4 rounded-xl border-border/60"
                    onClick={() => setTheme(tKey as any)}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border shadow-sm",
                      tKey === "light" && "bg-white",
                      tKey === "dark" && "bg-black",
                      tKey === "sepia" && "bg-[#f4ecd8]",
                      tKey === "slate" && "bg-[#0f172a]"
                    )} />
                    <span className="capitalize text-sm font-medium">{t(tKey)}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Selector (Mobile) */}
            <div className="space-y-3 px-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">{t("language")}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: "en", label: "EN" },
                  { code: "uz", label: "UZ" },
                  { code: "ru", label: "RU" }
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
              {user ? (
                <>
                  <Link href={`/profile/${user.username}`} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-base px-3 hover:bg-accent/50">
                      <User className="h-5 w-5 mr-3 text-muted-foreground" />
                      {t("profile")}
                    </Button>
                  </Link>
                  <Link href="/bookmarks" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-base px-3 hover:bg-accent/50">
                      <Bookmark className="h-5 w-5 mr-3 text-muted-foreground" />
                      {t("bookmarks")}
                    </Button>
                  </Link>
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-base px-3 hover:bg-accent/50">
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
                    <Button variant="outline" className="w-full h-12 text-base font-semibold border-border/60">
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
