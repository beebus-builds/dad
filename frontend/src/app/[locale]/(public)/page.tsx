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

type Story = { quote: string; name: string; role: string; impact: string };

const storiesEn: Story[] = [
  {
    quote: "After I filed a complaint through Shram Jagaran, the union lawyers took up my case within a week. My employer had withheld six months of wages â€” I got every rupee back.",
    name: "Ram Prasad Acharya",
    role: "Construction worker, Kathmandu",
    impact: "Rs. 1,80,000 recovered",
  },
  {
    quote: "I was stranded in Qatar with an expired visa and no passport. The migrant support team coordinated with the embassy and got me home safely within two weeks.",
    name: "Sita Devi Thapa",
    role: "Migrant worker, returned from Qatar",
    impact: "Safe repatriation",
  },
  {
    quote: "Our branch used the platform to register 300 new women members in one month. The digital system made it easy for workers in remote villages to join and access legal aid.",
    name: "Mina Kumari Shrestha",
    role: "Branch secretary, Pokhara",
    impact: "300 women registered",
  },
];

const storiesNe: Story[] = [
  {
    quote: "à¤®à¥ˆà¤²à¥‡ à¤¶à¥à¤°à¤® à¤œà¤¾à¤—à¤°à¤£ à¤®à¤¾à¤°à¥à¤«à¤¤ à¤‰à¤œà¥à¤°à¥€ à¤¦à¤°à¥à¤¤à¤¾ à¤—à¤°à¥‡à¤ªà¤›à¤¿, à¤¯à¥à¤¨à¤¿à¤¯à¤¨à¤•à¤¾ à¤µà¤•à¤¿à¤²à¤¹à¤°à¥‚à¤²à¥‡ à¤à¤• à¤¹à¤ªà¥à¤¤à¤¾à¤­à¤¿à¤¤à¥à¤° à¤®à¥‡à¤°à¥‹ à¤®à¥à¤¦à¥à¤¦à¤¾ à¤¹à¤¾à¤¤à¤®à¤¾ à¤²à¤¿à¤à¥¤ à¤®à¥‡à¤°à¥‹ à¤°à¥‹à¤œà¤—à¤¾à¤°à¤¦à¤¾à¤¤à¤¾à¤²à¥‡ à¥¬ à¤®à¤¹à¤¿à¤¨à¤¾à¤•à¥‹ à¤œà¥à¤¯à¤¾à¤²à¤¾ à¤°à¥‹à¤•à¥‡à¤•à¥‹ à¤¥à¤¿à¤¯à¥‹ â€” à¤®à¥ˆà¤²à¥‡ à¤¹à¤°à¥‡à¤• à¤°à¥à¤ªà¥ˆà¤¯à¤¾à¤ à¤«à¤¿à¤°à¥à¤¤à¤¾ à¤ªà¤¾à¤à¤à¥¤",
    name: "à¤°à¤¾à¤®à¤ªà¥à¤°à¤¸à¤¾à¤¦ à¤†à¤šà¤¾à¤°à¥à¤¯",
    role: "à¤¨à¤¿à¤°à¥à¤®à¤¾à¤£ à¤®à¤œà¤¦à¥à¤°, à¤•à¤¾à¤ à¤®à¤¾à¤¡à¥Œà¤‚",
    impact: "à¤°à¥. à¥§,à¥®à¥¦,à¥¦à¥¦à¥¦ à¤«à¤¿à¤°à¥à¤¤à¤¾",
  },
  {
    quote: "à¤®à¥à¤¯à¤¾à¤¦ à¤¸à¤•à¤¿à¤à¤•à¥‹ à¤­à¤¿à¤¸à¤¾ à¤° à¤°à¤¾à¤¹à¤¦à¤¾à¤¨à¥€à¤µà¤¿à¤¨à¤¾ à¤® à¤•à¤¤à¤¾à¤°à¤®à¤¾ à¤…à¤²à¤ªà¤¤à¥à¤° à¤ªà¤°à¥‡à¤•à¥‹ à¤¥à¤¿à¤à¤à¥¤ à¤†à¤ªà¥à¤°à¤µà¤¾à¤¸à¥€ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤Ÿà¥‹à¤²à¥€à¤²à¥‡ à¤¦à¥‚à¤¤à¤¾à¤µà¤¾à¤¸à¤¸à¤à¤— à¤¸à¤®à¤¨à¥à¤µà¤¯ à¤—à¤°à¥€ à¤®à¤²à¤¾à¤ˆ à¤¦à¥à¤ˆ à¤¹à¤ªà¥à¤¤à¤¾à¤­à¤¿à¤¤à¥à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤˜à¤° à¤ªà¥à¤°à¥à¤¯à¤¾à¤¯à¥‹à¥¤",
    name: "à¤¸à¥€à¤¤à¤¾à¤¦à¥‡à¤µà¥€ à¤¥à¤¾à¤ªà¤¾",
    role: "à¤•à¤¤à¤¾à¤°à¤¬à¤¾à¤Ÿ à¤«à¤°à¥à¤•à¥‡à¤•à¥€ à¤†à¤ªà¥à¤°à¤µà¤¾à¤¸à¥€ à¤¶à¥à¤°à¤®à¤¿à¤•",
    impact: "à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤¸à¥à¤µà¤¦à¥‡à¤¶ à¤«à¤¿à¤°à¥à¤¤à¥€",
  },
  {
    quote: "à¤¹à¤¾à¤®à¥à¤°à¥‹ à¤¶à¤¾à¤–à¤¾à¤²à¥‡ à¤ªà¥à¤²à¥‡à¤Ÿà¤«à¤°à¥à¤® à¤ªà¥à¤°à¤¯à¥‹à¤— à¤—à¤°à¥‡à¤° à¤à¤•à¥ˆ à¤®à¤¹à¤¿à¤¨à¤¾à¤®à¤¾ à¥©à¥¦à¥¦ à¤¨à¤¯à¤¾à¤ à¤®à¤¹à¤¿à¤²à¤¾ à¤¸à¤¦à¤¸à¥à¤¯ à¤¦à¤°à¥à¤¤à¤¾ à¤—à¤°à¥à¤¯à¥‹à¥¤ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤ªà¥à¤°à¤£à¤¾à¤²à¥€à¤²à¥‡ à¤¦à¥à¤°à¥à¤—à¤® à¤—à¤¾à¤‰à¤à¤•à¤¾ à¤¶à¥à¤°à¤®à¤¿à¤•à¤¹à¤°à¥‚à¤²à¤¾à¤ˆ à¤¸à¤¾à¤®à¥‡à¤² à¤¹à¥à¤¨ à¤° à¤•à¤¾à¤¨à¥à¤¨à¥€ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤—à¤°à¥à¤¨ à¤¸à¤œà¤¿à¤²à¥‹ à¤¬à¤¨à¤¾à¤¯à¥‹à¥¤",
    name: "à¤®à¥€à¤¨à¤¾ à¤•à¥à¤®à¤¾à¤°à¥€ à¤¶à¥à¤°à¥‡à¤·à¥à¤ ",
    role: "à¤¶à¤¾à¤–à¤¾ à¤¸à¤šà¤¿à¤µ, à¤ªà¥‹à¤–à¤°à¤¾",
    impact: "à¥©à¥¦à¥¦ à¤®à¤¹à¤¿à¤²à¤¾ à¤¦à¤°à¥à¤¤à¤¾",
  },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <Hero />
      <Stats />
      <Testimonials locale={locale} />
      <Services />
      <Modules />
      <CallToAction />
    </div>
  );
}

async function Hero() {
  const t = await getTranslations("home.hero");
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 -z-10 gradient-union opacity-95" />
      <DhakaPattern className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-white opacity-[0.04]" />
      <div className="container py-20 text-white sm:py-28">
        <div className="max-w-3xl space-y-6">
          <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
            {t("badge")}
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="text-pretty text-lg text-white/90">{t("subtitle")}</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                {t("primaryCta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href="/legal">{t("secondaryCta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

async function Stats() {
  const t = await getTranslations("home.stats");
  const items = [
    { label: t("members"), value: "120,000+" },
    { label: t("branches"), value: "80+" },
    { label: t("districts"), value: "77" },
    { label: t("cases"), value: "5,400+" },
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

async function Testimonials({ locale }: { locale: string }) {
  const t = await getTranslations("home.testimonials");
  const stories = locale === "ne" ? storiesNe : storiesEn;
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
