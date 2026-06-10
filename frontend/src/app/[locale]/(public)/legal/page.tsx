import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
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
        <div className="mt-10 rounded-xl border bg-muted/30 p-8 text-center">
          <h2 className="text-2xl font-semibold">{t("call")}</h2>
          <div className="mt-4 flex justify-center gap-3">
            <Button asChild>
              <Link href="/register">{t("request")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
