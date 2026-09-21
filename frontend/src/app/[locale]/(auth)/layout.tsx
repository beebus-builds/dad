import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import { env } from "@/lib/env";

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
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col bg-gradient-to-b from-govt-blue to-[hsl(221,70%,26%)] p-10 text-white">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold">
          <Image
            src="/image/Logo.jpeg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-sm object-contain"
          />
          <span className="font-devanagari">{tCommon("appName")}</span>
        </Link>
        <div className="mt-auto space-y-4">
          <blockquote className="space-y-2">
            <p className="text-2xl font-medium leading-relaxed text-balance">{tAuth("quote")}</p>
            <footer className="text-sm opacity-90">{tAuth("quoteAuthor")}</footer>
          </blockquote>
          <div className="grid grid-cols-3 gap-4 pt-6">
            <Stat label="सदस्यहरू" value="१.२ लाख+" />
            <Stat label="शाखाहरू" value="८०+" />
            <Stat label="जिल्लाहरू" value="७७" />
          </div>
        </div>
      </aside>
      <main id="main-content" className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}
