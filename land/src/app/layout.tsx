import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Valeria — Astroloji, Tarot & Fal Uygulaması",
  description:
    "Valeria ile günlük burç yorumları, tarot falı, kahve falı, numeroloji ve horary astroloji keşfet. Kişisel kozmik rehberin cebinde.",
  keywords: "astroloji, tarot, fal, burç, kahve falı, numeroloji, horary, natal harita",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Valeria — Kozmik Rehberin",
    description: "Astroloji, Tarot & Fal — Hemen İndir",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
