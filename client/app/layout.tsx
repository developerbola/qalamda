"use client";
import { useState, useEffect } from "react";
import { Poppins, Playwrite_DE_VA, Geist } from "next/font/google";
import "./styles/index.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { AuthInit, useAuth } from "@/lib/auth";

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

import { ThemeProvider } from "@/lib/theme";
import { LanguageProvider } from "@/lib/language";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Starter from "@/components/Starter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
              content="Maqolalar o'qish va bilimlaringizni boshqalar bilan ulashish uchun
                yangi imkoniyat."
            />
          </head>
          <body
            className={`${playwrite.variable} ${poppins.variable} antialiased`}
          >
            <AuthInit />
            <SidebarProvider>
              <Navbar />
              {mounted && user ? (
                <>
                  <AppSidebar />
                  <main className="flex justify-center w-full">{children}</main>
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
