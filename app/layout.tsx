import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/components";

export const metadata: Metadata = {
  title: "Qalamda | Online maqolalar",
  description: "Maqolalar joylanadigan o'zbek tilidagi platforma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:image" content="/long-logo.png" />
        <link rel="icon" href="/white-logo.svg" />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 85px)", marginTop: "85px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
