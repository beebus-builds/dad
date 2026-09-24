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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DhakaPattern } from "@/components/decorative-pattern";
import { HeroInteractive } from "@/components/public/hero-interactive";

type Story = { quote: string; name: string; role: string; impact: string };

const stories: Story[] = [
  {
    quote:
      "मैले श्रम जागरण मार्फत उजुरी दर्ता गरेपछि, युनियनका वकिलहरूले एक हप्ताभित्र मेरो मुद्दा हातमा लिए। मेरो रोजगारदाताले ६ महिनाको ज्याला रोकेको थियो — मैले हरेक रुपैयाँ फिर्ता पाएँ।",
    name: "रामप्रसाद आचार्य",
    role: "निर्माण मजदुर, काठमाडौं",
    impact: "रु. १,८०,००० फिर्ता",
  },
  {
    quote:
      "म्याद सकिएको भिसा र राहदानीविना म कतारमा अलपत्र परेको थिएँ। आप्रवासी सहायता टोलीले दूतावाससँग समन्वय गरी मलाई दुई हप्ताभित्र सुरक्षित घर पुर्‍यायो।",
    name: "सीतादेवी थापा",
    role: "कतारबाट फर्केकी आप्रवासी श्रमिक",
    impact: "सुरक्षित स्वदेश फिर्ती",
  },
  {
    quote:
      "हाम्रो शाखाले प्लेटफर्म प्रयोग गरेर एकै महिनामा ३०० नयाँ महिला सदस्य दर्ता गर्‍यो। डिजिटल प्रणालीले दुर्गम गाउँका श्रमिकहरूलाई सामेल हुन र कानुनी सहायता प्राप्त गर्न सजिलो बनायो।",
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

      <div className="bg-background relative h-20 overflow-hidden sm:h-24">
        <svg
          className="text-primary/[0.06] absolute bottom-0 h-32 w-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0,120 L40,90 L80,100 L130,60 L180,80 L240,35 L290,55 L360,18 L410,40 L480,28 L530,50 L590,22 L640,45 L700,35 L750,58 L800,25 L850,48 L910,38 L960,62 L1020,30 L1070,55 L1130,45 L1170,70 L1200,85 L1200,120 Z" />
          <path
            d="M0,120 L50,105 L100,110 L160,80 L220,95 L280,65 L330,80 L400,55 L450,70 L520,60 L570,78 L640,55 L690,72 L760,62 L810,80 L870,55 L920,72 L980,65 L1030,82 L1090,60 L1140,78 L1200,95 L1200,120 Z"
            opacity="0.5"
          />
        </svg>
      </div>

      <Testimonials />
      <Services />
      <Modules />
      <CallToAction />
    </div>
  );
}

async function Testimonials() {
  const t = await getTranslations("home.testimonials");
  return (
    <section className="bg-muted/20 relative overflow-hidden py-20 sm:py-24">
      <div className="bg-primary/10 pointer-events-none absolute top-10 -left-32 h-72 w-72 rounded-full blur-3xl" />
      <div className="relative container">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary mb-4">
            {t("heading")}
          </Badge>
          <h2 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{t("subheading")}</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {stories.map((story) => (
            <article
              key={story.name}
              className="group border-border/70 bg-card shadow-soft hover:shadow-card relative overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="bg-primary/5 absolute -top-8 -right-8 h-28 w-28 rounded-full transition-transform duration-500 group-hover:scale-125" />
              <div className="bg-primary/10 text-primary relative flex h-10 w-10 items-center justify-center rounded-xl">
                <Quote className="h-5 w-5" />
              </div>
              <blockquote className="text-muted-foreground relative mt-5 text-sm leading-relaxed">
                “{story.quote}”
              </blockquote>
              <div className="relative mt-6 border-t pt-4">
                <p className="text-sm font-bold">{story.name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{story.role}</p>
                <span className="bg-success/10 text-success mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold">
                  {story.impact}
                </span>
              </div>
            </article>
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
    <section className="container py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-primary text-xs font-bold tracking-[0.16em] uppercase">सेवाहरू</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{t("heading")}</h2>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">{t("subheading")}</p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.key} className="group card-hover relative overflow-hidden">
            <div className="from-primary via-primary/50 to-union-red absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100" />
            <CardHeader className="p-6 pb-5">
              <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-12 w-12 items-center justify-center rounded-2xl transition-colors">
                <service.icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-4 text-lg">{t(`${service.key}.title`)}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t(`${service.key}.description`)}
              </CardDescription>
              <span className="text-primary mt-3 inline-flex items-center gap-1 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100">
                थप जान्नुहोस् <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
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
    <section className="bg-foreground relative overflow-hidden py-20 text-white sm:py-24">
      <div className="absolute inset-0 opacity-[0.05]">
        <DhakaPattern className="h-full w-full text-white" />
      </div>
      <div className="relative container">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <Badge className="border border-white/15 bg-white/10 text-white" variant="outline">
              {t("badge")}
            </Badge>
            <h2 className="mt-5 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
              {t("heading")}
            </h2>
            <p className="mt-4 leading-relaxed text-white/65">{t("description")}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <li
                key={module}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <span className="bg-primary/20 text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                  <Building2 className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-white/85">{t(`items.${module}`)}</span>
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
    <section className="container py-20 sm:py-24">
      <div className="border-primary/10 from-primary via-primary to-union-red shadow-float relative overflow-hidden rounded-[2rem] border bg-gradient-to-br p-8 text-white sm:p-12 lg:p-14">
        <DhakaPattern className="pointer-events-none absolute inset-0 h-full w-full text-white opacity-[0.04]" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/80">{t("description")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">{t("join")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white shadow-none hover:border-white/50 hover:bg-white/20 hover:text-white"
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
