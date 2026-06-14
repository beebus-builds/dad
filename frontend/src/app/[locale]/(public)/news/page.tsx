import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DhakaPattern } from "@/components/decorative-pattern";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return { title: t("title") };
}

const SAMPLE = [
  {
    slug: "minimum-wage-update-2026",
    title: "Updated Minimum Wage Guidelines Released",
    excerpt: "The Ministry of Labour has announced revised minimum wage thresholds for all sectors effective July 2026, impacting over 2 million workers nationwide.",
    category: "POLICY",
    date: "2026-06-01",
  },
  {
    slug: "migrant-rescue-saudi",
    title: "12 Nepalese Workers Repatriated from Riyadh",
    excerpt: "Coordinated effort between Shram Jagaran and embassy successfully rescues 12 workers stranded without wages or documentation.",
    category: "ANNOUNCEMENT",
    date: "2026-05-28",
  },
  {
    slug: "osh-training-launched",
    title: "New OSH Training Programme Launches in Province 1",
    excerpt: "A comprehensive occupational safety training programme begins in Biratnagar, covering 500 workers across 20 factories.",
    category: "ANNOUNCEMENT",
    date: "2026-05-20",
  },
  {
    slug: "collective-bargaining-guide",
    title: "Collective Bargaining Rights: A Practical Guide",
    excerpt: "New resource helps branch leaders navigate collective bargaining negotiations under the Labour Act 2017.",
    category: "PRESS_RELEASE",
    date: "2026-05-15",
  },
];

export default async function PublicNewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("news");

  return (
    <div className="container py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {SAMPLE.map((n) => (
          <Link key={n.slug} href={`/news/${n.slug}`} className="group">
            <Card className="h-full overflow-hidden transition-all group-hover:shadow-card">
              <div className="relative flex h-44 items-end overflow-hidden bg-gradient-to-br from-primary/80 to-primary">
                <DhakaPattern className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.06]" />
                <div className="relative z-10 p-5">
                  <Badge variant="secondary" className="border-white/30 bg-white/20 text-white backdrop-blur-sm">
                    {t(`categories.${n.category}` as Parameters<typeof t>[0])}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2 text-lg leading-snug transition-colors group-hover:text-primary">
                  {n.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{n.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {new Date(n.date).toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
