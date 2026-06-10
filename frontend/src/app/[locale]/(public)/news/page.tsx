import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return { title: t("title") };
}

const SAMPLE = [
  {
    slug: "minimum-wage-update-2026",
    title: "Updated Minimum Wage Guidelines Released",
    excerpt: "The Ministry of Labour has announced revised minimum wage thresholds.",
    category: "POLICY",
    date: "2026-06-01",
  },
  {
    slug: "migrant-rescue-saudi",
    title: "12 Nepalese Workers Repatriated from Riyadh",
    excerpt: "Coordinated effort between Shram Jagaran and embassy successfully rescues 12.",
    category: "ANNOUNCEMENT",
    date: "2026-05-28",
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
            <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
              <div className="h-40 gradient-union" aria-hidden />
              <CardHeader>
                <Badge variant="union" className="w-fit">
                  {t(`categories.${n.category}` as Parameters<typeof t>[0])}
                </Badge>
                <CardTitle className="mt-2 line-clamp-2 group-hover:text-primary">
                  {n.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">{n.excerpt}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(n.date).toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US")}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
