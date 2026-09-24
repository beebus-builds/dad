import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import { DhakaPattern } from "@/components/decorative-pattern";

export const metadata: Metadata = {
  title: "प्रमाणीकरण",
};

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tCommon = await getTranslations("common");
  const tAuth = await getTranslations("auth");

  return (
    <div className="bg-background grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
      <aside className="hero-surface relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <DhakaPattern className="h-full w-full text-white" />
        </div>
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Image
                src="/image/Logo.jpeg"
                alt=""
                width={44}
                height={44}
                className="h-9 w-9 rounded-xl object-contain"
              />
            </span>
            <span className="font-devanagari text-lg font-bold">{tCommon("appName")}</span>
          </Link>
        </div>
        <div className="relative mt-auto max-w-xl space-y-8">
          <div className="h-1 w-12 rounded-full bg-white/70" />
          <blockquote className="space-y-3">
            <p className="text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance xl:text-4xl">
              {tAuth("quote")}
            </p>
            <footer className="text-sm text-white/60">{tAuth("quoteAuthor")}</footer>
          </blockquote>
          <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
            <Stat label="सदस्यहरू" value="१.२ लाख+" />
            <Stat label="शाखाहरू" value="८०+" />
            <Stat label="जिल्लाहरू" value="७७" />
          </div>
        </div>
      </aside>

      <main
        id="main-content"
        className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 sm:py-12"
      >
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
            <span className="bg-card flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm">
              <Image
                src="/image/Logo.jpeg"
                alt=""
                width={44}
                height={44}
                className="h-9 w-9 rounded-xl object-contain"
              />
            </span>
            <span className="font-devanagari text-foreground font-bold">{tCommon("appName")}</span>
          </Link>
          <div className="border-border/70 bg-card/95 shadow-card rounded-3xl border p-6 sm:p-8">
            {children}
          </div>
          <p className="text-muted-foreground mt-6 text-center text-xs">
            सुरक्षित, गोपनीय र नेपाली श्रमिकहरूका लागि।
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-4 text-center backdrop-blur">
      <div className="text-xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] font-semibold tracking-[0.08em] text-white/55 uppercase">
        {label}
      </div>
    </div>
  );
}
