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
        <meta property="og:image" content="/og-image.png" />
        <link rel="icon" href="/qalamda-favicon.svg?v1" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
