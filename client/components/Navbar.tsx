"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Search, User, LogOut, Bookmark, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
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
    { href: "/tags", label: "Tags" },
    ...(user ? [{ href: "/write", label: "Write" }] : []),
  ];

  return (
    <nav className="fixed flex items-center justify-center top-0 z-50 w-full bg-background h-16">
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
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-neutral-800"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, tags, authors..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link href={`/profile/${user.username}`}>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user.username}
                </Button>
              </Link>
              <Link href="/bookmarks">
                <Button variant="ghost" size="icon">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  Settings
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
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
        <div className="md:hidden py-4 border-t border-slate-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Mobile Nav Links */}
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Auth */}
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            {user ? (
              <>
                <Link href="/settigns" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link
                  href="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmarks
                  </Button>
                </Link>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href="/auth?mode=signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
