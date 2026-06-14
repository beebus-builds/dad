import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/lib/i18n-navigation";
import { Phone, Mail, MapPin } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

const LEADERSHIP = [
  { role: "अध्यक्ष", name: "विष्णुप्रसाद पौडेल" },
  { role: "प्रधान सम्पादक", name: "प्रकाश भट्टराई" },
];

const CORRESPONDENTS = [
  "प्रकाश तिमल्सिना", "राजेश यादव", "रामजी रिजाल", "गोविन्द भट्टराई", "इन्द्र खुलाल",
];

const MARKET_TEAM = [
  "भोला ढुंगेल", "कमल सुनुवार", "बाबुलाल बम्जन", "पंचमान बम्जन",
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-balance text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg font-medium text-muted-foreground">
          मजदुरको आवाज, परिवर्तनको संवाहक
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {LEADERSHIP.map((l) => (
            <Card key={l.name}>
              <CardHeader>
                <CardTitle className="text-base">{l.role}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{l.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>संवाददाता समूह</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-1 sm:grid-cols-2">
              {CORRESPONDENTS.map((name) => <li key={name} className="text-sm text-muted-foreground">{name}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>बजार व्यवस्थापन</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-1 sm:grid-cols-2">
              {MARKET_TEAM.map((name) => <li key={name} className="text-sm text-muted-foreground">{name}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>सम्पर्क</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>कार्यालय: कोटेश्वर-३२, काठमाडौं</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>9851147727, 9851019594</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Link href="mailto:cstunepal2019@gmail.com" className="text-primary hover:underline">cstunepal2019@gmail.com</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
