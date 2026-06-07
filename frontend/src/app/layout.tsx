import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { env } from "@/lib/env";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  variable: "--font-noto-devanagari",
});

export const metadata: Metadata = {
  title: {
    default: env.appName,
    template: `%s · ${env.appName}`,
  },
  description:
    "Shram Jagaran is a digital platform empowering Nepalese trade unions, workers, and labour advocates.",
  keywords: [
    "Nepal Trade Union",
    "Shram Jagaran",
    "Labour Rights",
    "Worker Welfare",
    "Foreign Employment",
    "Legal Aid",
  ],
  authors: [{ name: "Shram Jagaran" }],
  metadataBase: new URL(env.appUrl),
  openGraph: {
    type: "website",
    locale: env.locale,
    url: env.appUrl,
    siteName: env.appName,
    title: env.appName,
    description: "Empowering Nepalese workers and trade unions.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={env.locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${notoDevanagari.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only-focusable absolute left-2 top-2 z-50 rounded bg-primary px-3 py-2 text-primary-foreground">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
