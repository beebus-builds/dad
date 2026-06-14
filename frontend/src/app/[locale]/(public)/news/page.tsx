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
    title: "न्यूनतम ज्याला सम्बन्धी अद्यावधिक निर्देशिका जारी",
    excerpt: "श्रम मन्त्रालयले सन् २०२६ जुलाईदेखि लागू हुने गरी सबै क्षेत्रका लागि न्यूनतम ज्यालाको संशोधित सीमा घोषणा गरेको छ, जसले देशभरका २० लाखभन्दा बढी श्रमिकहरूलाई असर पार्नेछ।",
    category: "POLICY",
    date: "2026-06-01",
  },
  {
    slug: "migrant-rescue-saudi",
    title: "रियादबाट १२ जना नेपाली श्रमिकको उद्धार गरी स्वदेश फिर्ता",
    excerpt: "श्रम जागरण र दूतावासबीचको समन्वयमा ज्याला वा कागजातविहीन अलपत्र परेका १२ जना श्रमिकको सफलतापूर्वक उद्धार गरिएको छ।",
    category: "ANNOUNCEMENT",
    date: "2026-05-28",
  },
  {
    slug: "osh-training-launched",
    title: "कोशी प्रदेशमा नयाँ व्यावसायिक सुरक्षा तथा स्वास्थ्य तालिम सुरु",
    excerpt: "विराटनगरमा २० वटा कारखानाका ५०० श्रमिकलाई समेट्ने गरी विस्तृत व्यावसायिक सुरक्षा तालिम कार्यक्रम सुरु भएको छ।",
    category: "ANNOUNCEMENT",
    date: "2026-05-20",
  },
  {
    slug: "collective-bargaining-guide",
    title: "सामूहिक सौदाबाजीको अधिकार: एक व्यावहारिक निर्देशिका",
    excerpt: "नयाँ स्रोतले श्रम ऐन २०७४ अन्तर्गत सामूहिक सौदाबाजी सम्झौताहरू नेभिगेट गर्न शाखाका नेताहरूलाई मद्दत गर्दछ।",
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
                  {new Date(n.date).toLocaleDateString("ne-NP", {
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
