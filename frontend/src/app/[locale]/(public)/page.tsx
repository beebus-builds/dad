import {
  ArrowRight,
  Building2,
  Gavel,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Megaphone,
  Quote,
  ShieldCheck,
  Users,
} from "lucide-react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DhakaPattern } from "@/components/decorative-pattern";
import { HeroInteractive } from "@/components/public/hero-interactive";

type Story = { quote: string; name: string; role: string; impact: string };

const stories: Story[] = [
  {
    quote: "मैले श्रम जागरण मार्फत उजुरी दर्ता गरेपछि, युनियनका वकिलहरूले एक हप्ताभित्र मेरो मुद्दा हातमा लिए। मेरो रोजगारदाताले ६ महिनाको ज्याला रोकेको थियो — मैले हरेक रुपैयाँ फिर्ता पाएँ।",
    name: "रामप्रसाद आचार्य",
    role: "निर्माण मजदुर, काठमाडौं",
    impact: "रु. १,८०,००० फिर्ता",
  },
  {
    quote: "म्याद सकिएको भिसा र राहदानीविना म कतारमा अलपत्र परेको थिएँ। आप्रवासी सहायता टोलीले दूतावाससँग समन्वय गरी मलाई दुई हप्ताभित्र सुरक्षित घर पुर्‍यायो।",
    name: "सीतादेवी थापा",
    role: "कतारबाट फर्केकी आप्रवासी श्रमिक",
    impact: "सुरक्षित स्वदेश फिर्ती",
  },
  {
    quote: "हाम्रो शाखाले प्लेटफर्म प्रयोग गरेर एकै महिनामा ३०० नयाँ महिला सदस्य दर्ता गर्‍यो। डिजिटल प्रणालीले दुर्गम गाउँका श्रमिकहरूलाई सामेल हुन र कानुनी सहायता प्राप्त गर्न सजिलो बनायो।",
    name: "मीना कुमारी श्रेष्ठ",
    role: "शाखा सचिव, पोखरा",
    impact: "३०० महिला दर्ता",
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const heroT = await getTranslations("home.hero");
  return (
    <div>
      <HeroInteractive
        badge={heroT("badge")}
        title={heroT("title")}
        subtitle={heroT("subtitle")}
        primaryCta={heroT("primaryCta")}
        secondaryCta={heroT("secondaryCta")}
      />
      <Stats />
      <Testimonials />
      <Services />
      <Modules />
      <CallToAction />
    </div>
  );
}


async function Stats() {
  const t = await getTranslations("home.stats");
  const items = [
    { label: t("members"), value: "१,२०,०००+" },
    { label: t("branches"), value: "८०+" },
    { label: t("districts"), value: "७७" },
    { label: t("cases"), value: "५,४००+" },
  ];
  return (
    
      <section className="border-b bg-muted/20">
      <div className="container grid grid-cols-2 gap-6 py-12 sm:grid-cols-4">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-bold text-primary">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

async function Testimonials() {
  const t = await getTranslations("home.testimonials");
  return (
    
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-amber-50/40 to-background py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="warning" className="mb-3">
            {t("heading")}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">{t("subheading")}</h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {stories.map((story, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border bg-card p-6 shadow-soft transition-all hover:shadow-card"
            >
              <div className="absolute -top-3 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Quote className="h-4 w-4" />
              </div>
              <blockquote className="mt-2 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-semibold">{story.name}</p>
                <p className="text-xs text-muted-foreground">{story.role}</p>
                <span className="mt-2 inline-block rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  {story.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function Services() {
  const t = await getTranslations("home.services");
  const services = [
    { icon: ShieldCheck, key: "protection" as const },
    { icon: Gavel, key: "legal" as const },
    { icon: GraduationCap, key: "training" as const },
    { icon: Megaphone, key: "advocacy" as const },
    { icon: HandHeart, key: "migrant" as const },
    { icon: Users, key: "branch" as const },
  ];
  return (
    
      <section className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight">{t("heading")}</h2>
        <p className="mt-3 text-muted-foreground">{t("subheading")}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.key} className="card-hover">
            <CardHeader>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-3">{t(`${s.key}.title`)}</CardTitle>
              <CardDescription>{t(`${s.key}.description`)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>  );
}

async function Modules() {
  const t = await getTranslations("home.modules");
  const modules = [
    "foreign",
    "dispute",
    "osh",
    "bargaining",
    "aid",
    "migrant",
    "knowledge",
  ] as const;
  return (
    
      <section className="border-y bg-muted/20">
      <div className="container py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="govt">{t("badge")}</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">{t("heading")}</h2>
            <p className="mt-3 text-muted-foreground">{t("description")}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {modules.map((m) => (
              <li
                key={m}
                className="flex items-center gap-3 rounded-lg border bg-background p-4 shadow-sm"
              >
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t(`items.${m}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

async function CallToAction() {
  const t = await getTranslations("home.cta");
  return (
    
      <section className="container py-20">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-govt-blue to-union-red p-10 text-white sm:p-14">
        <DhakaPattern className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.03]" />
        <div className="grid items-center gap-8 lg:grid-cols-[1fr,auto]">
          <div>
            <h2 className="text-balance text-3xl font-bold sm:text-4xl">{t("title")}</h2>
            <p className="mt-3 max-w-2xl text-white/90">{t("description")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">{t("join")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/donate">
                <HeartHandshake className="h-4 w-4" /> {t("donate")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
