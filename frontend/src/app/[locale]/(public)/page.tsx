import {
  ArrowRight,
  Building2,
  Gavel,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Megaphone,
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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div>
      <Hero />
      <Stats />
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
          <Card key={s.key} className="transition-shadow hover:shadow-md">
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
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-govt-blue to-union-red p-10 text-white sm:p-14">
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
