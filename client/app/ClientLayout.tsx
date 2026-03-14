"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Poppins, Playwrite_DE_VA, Geist } from "next/font/google";
import "./styles/index.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { AuthInit, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/language";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Starter from "@/components/Starter";
import { RightSidebar } from "@/components/RightSidebar";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const playwrite = Playwrite_DE_VA({
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-write",
});

const poppins = Poppins({
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-poppins",
});

interface ClientLayoutProps {
  children: React.ReactNode;
  isInitiallyAuth?: boolean;
  initialUsername?: string;
}

export default function ClientLayout({
  children,
  isInitiallyAuth = false,
  initialUsername,
}: ClientLayoutProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showApp = mounted ? !!user : isInitiallyAuth;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <html lang="en" className={cn("font-sans", geist.variable)}>
          <head>
            <title>Qalamda</title>
            <link
              rel="shortcut icon"
              href="favicon-light.svg"
              type="image/svg"
              media="(prefers-color-scheme: dark)"
            />
            <link
              rel="shortcut icon"
              href="favicon-dark.svg"
              type="image/svg"
              media="(prefers-color-scheme: light)"
            />
            <meta
              name="description"
              content="Maqolalar o'qish va bilimlaringizni boshqalar bilan ulashish uchun yangi imkoniyat."
            />
          </head>
          <body
            className={`${playwrite.variable} ${poppins.variable} antialiased`}
          >
            <AuthInit />
            <SidebarProvider>
              <Navbar initialUsername={initialUsername} />

              {pathname.includes("/auth") ||
              pathname === "/privacy" ||
              pathname === "/terms" ? (
                children
              ) : showApp ? (
                <>
                  <AppSidebar initialUsername={initialUsername} />
                  <main className="flex justify-center flex-1 w-full">
                    {children}
                  </main>
                  {pathname === "/" && <RightSidebar />}
                </>
              ) : (
                <Starter />
              )}
            </SidebarProvider>
          </body>
        </html>
      </LanguageProvider>
    </ThemeProvider>
  );
}
