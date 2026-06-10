import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-balance text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">{t("intro")}</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("mission.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t("mission.body")}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("vision.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t("vision.body")}</CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("history.title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{t("history.body")}</CardContent>
        </Card>
      </div>
    </div>
  );
}
