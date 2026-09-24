import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("title") };
}

const AREA_KEYS = ["foreign", "labour", "osh", "bargaining", "other"] as const;

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const tNav = await getTranslations("nav");
  return (
    <div className="container space-y-8 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <PublicPageHeader
          eyebrow="सहायता"
          title={t("title")}
          description={t("subtitle")}
          icon={Scale}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {AREA_KEYS.map((k) => (
            <Card key={k}>
              <CardHeader>
                <CardTitle>{t(`areas.${k}`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/register">{t("request")}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="border-primary/15 bg-primary/[0.04] shadow-soft mt-8 rounded-3xl border p-8 text-center sm:p-10">
          <h2 className="text-2xl font-semibold">{t("call")}</h2>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild>
              <Link href="/register">{t("request")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">{tNav("contact")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
