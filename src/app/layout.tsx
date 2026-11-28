import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "FlexiGo Stays | Holiday properties in Shimla", template: "%s | FlexiGo Stays" },
  description: "Three calm, fully equipped holiday properties in a gated community above Shimla. See live prices and book direct with the host.",
  openGraph: { type: "website", siteName: "FlexiGo Stays", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#23392f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        <SmoothScroll />
        <Suspense fallback={null}>
          <RevealOnScroll />
        </Suspense>
      </body>
    </html>
  );
}
