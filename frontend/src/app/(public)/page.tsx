import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/constants";

export default function HomePage() {
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

function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-0 -z-10 gradient-union opacity-95" />
      <div className="container py-20 text-white sm:py-28">
        <div className="max-w-3xl space-y-6">
          <Badge variant="outline" className="border-white/40 bg-white/10 text-white">
            Shram Jagaran · Workers' Awakening
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            The unified digital home of Nepalese trade unions.
          </h1>
          <p className="text-pretty text-lg text-white/90">
            Membership, complaints, events, legal aid and labour advocacy — managed in one secure,
            modern platform built for every branch, district and province across Nepal.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href={APP_ROUTES.register}>
                Become a Member <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href={APP_ROUTES.legal}>Request Legal Aid</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { label: "Active Members", value: "120,000+" },
    { label: "Branches Nationwide", value: "80+" },
    { label: "Districts Covered", value: "77" },
    { label: "Cases Resolved", value: "5,400+" },
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

function Services() {
  const services = [
    {
      icon: ShieldCheck,
      title: "Workplace Protection",
      description:
        "File complaints, track resolutions and access OSH guidance — all with full audit trails.",
    },
    {
      icon: Gavel,
      title: "Legal Aid Network",
      description:
        "Connect with vetted labour advocates for foreign employment, disputes and collective bargaining.",
    },
    {
      icon: GraduationCap,
      title: "Worker Training",
      description: "Register for skills, safety and rights training delivered nationwide.",
    },
    {
      icon: Megaphone,
      title: "Voice & Advocacy",
      description: "Share stories, mobilise action and stay informed on labour policy changes.",
    },
    {
      icon: HandHeart,
      title: "Migrant Support",
      description:
        "Resources, rescue coordination and case tracking for Nepalese migrant workers overseas.",
    },
    {
      icon: Users,
      title: "Branch Management",
      description: "Powerful admin tools for province, district and branch leadership.",
    },
  ];
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight">What we deliver</h2>
        <p className="mt-3 text-muted-foreground">
          End-to-end services covering every stage of a worker's union journey.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.title} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-3">{s.title}</CardTitle>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Modules() {
  const modules = [
    "Foreign Employment Cases",
    "Labour Disputes",
    "Occupational Safety Incidents",
    "Collective Bargaining",
    "Legal Aid Requests",
    "Migrant Worker Support",
    "Labour Act Knowledge Base",
  ];
  return (
    <section className="border-y bg-muted/20">
      <div className="container py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="govt">Specialised Modules</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Built around real Nepalese labour challenges.
            </h2>
            <p className="mt-3 text-muted-foreground">
              From foreign employment grievances to OSH incidents, our modules are aligned to Nepal
              Labour Act 2017 and the country's evolving workforce realities.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {modules.map((m) => (
              <li
                key={m}
                className="flex items-center gap-3 rounded-lg border bg-background p-4 shadow-sm"
              >
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="container py-20">
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-govt-blue to-union-red p-10 text-white sm:p-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr,auto]">
          <div>
            <h2 className="text-balance text-3xl font-bold sm:text-4xl">
              Stand with Nepal's workforce. Power their voice with technology.
            </h2>
            <p className="mt-3 max-w-2xl text-white/90">
              Whether you're a worker seeking support, a union leader managing thousands, or a
              donor backing the movement — Shram Jagaran is the platform that scales with you.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button size="lg" variant="secondary" asChild>
              <Link href={APP_ROUTES.register}>Join Today</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={APP_ROUTES.donate}>
                <HeartHandshake className="h-4 w-4" /> Donate
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
