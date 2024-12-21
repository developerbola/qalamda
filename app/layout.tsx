import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/components";

export const metadata: Metadata = {
  title: "Qalamda | Online maqolalar",
  description: "Maqolalar joylanadigan o'zbek tilidagi platforma.",
  openGraph: {
    images: [
      {
        url: "/long-logo.png",
        width: 200,
        height: 540,
        alt: "Qalamda meta image",
      },
    ],
  },
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
        <link rel="icon" href="/logo-white.ico" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
