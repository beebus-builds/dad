import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Providers } from "@/app/providers";
import { locales, localeHtmlLang, defaultLocale, type Locale } from "@/i18n";
import { env } from "@/lib/env";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  variable: "--font-noto-devanagari",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: env.appName,
    template: `%s · ${env.appName}`,
  },
  description:
    "श्रम जागरण नेपाली ट्रेड युनियनहरू, श्रमिकहरू र श्रम अधिवक्ताहरूलाई सशक्त बनाउने एक डिजिटल प्लेटफर्म हो।",
  keywords: [
    "नेपाल ट्रेड युनियन",
    "श्रम जागरण",
    "श्रम अधिकार",
    "श्रमिक कल्याण",
    "वैदेशिक रोजगारी",
    "कानूनी सहायता",
  ],
  authors: [{ name: "श्रम जागरण" }],
  metadataBase: new URL(env.appUrl),
  alternates: {
    languages: {
      ne: "/ne",
    },
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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const htmlLang = localeHtmlLang[locale as Locale] ?? "en";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoDevanagari.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only-focusable absolute left-2 top-2 z-50 rounded bg-primary px-3 py-2 text-primary-foreground"
        >
          {messages.common && typeof messages.common === "object" && "skipToContent" in messages.common
            ? (messages.common as Record<string, string>).skipToContent
            : "Skip to main content"}
        </a>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
