import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DhakaPattern } from "@/components/decorative-pattern";

function AnimatedCounter({
  target,
  suffix = "",
  label,
}: {
  target: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-3xl font-bold tracking-tight text-white tabular-nums sm:text-4xl">
        {target.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-1 text-xs font-semibold tracking-[0.08em] text-white/60 uppercase">
        {label}
      </div>
    </div>
  );
}

export function HeroInteractive({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
}) {
  return (
    <section className="hero-surface relative w-full overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <DhakaPattern className="h-full w-full text-white" />
      </div>
      <div className="bg-primary/20 pointer-events-none absolute top-16 -right-24 h-80 w-80 rounded-full blur-3xl" />
      <div className="bg-union-red/20 pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full blur-3xl" />

      <div className="relative container py-20 sm:py-24 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-5 lg:items-center lg:gap-16">
          <div className="space-y-7 lg:col-span-3">
            <Badge className="border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-sm hover:bg-white/15">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {badge}
            </Badge>

            <h1 className="font-devanagari max-w-3xl text-4xl leading-[1.12] font-bold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              {subtitle}
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                size="lg"
                className="text-primary bg-white font-semibold shadow-[0_14px_30px_-16px_rgb(0_0_0/0.55)] hover:bg-white/90"
                asChild
              >
                <Link href="/register" className="flex items-center gap-2">
                  {primaryCta} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/5 font-semibold text-white shadow-none hover:border-white/50 hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/legal">{secondaryCta}</Link>
              </Button>
            </div>
          </div>

          <div className="relative lg:col-span-2">
            <div
              className="absolute -inset-4 rounded-[2rem] border border-white/10"
              aria-hidden="true"
            />
            <div className="shadow-float relative grid grid-cols-2 gap-2 rounded-3xl border border-white/15 bg-white/[0.08] p-2 backdrop-blur-xl">
              <div className="rounded-2xl bg-white/[0.08] p-5 sm:p-6">
                <AnimatedCounter target={120000} suffix="+" label="सदस्यहरू" />
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-5 sm:p-6">
                <AnimatedCounter target={80} suffix="+" label="शाखाहरू" />
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-5 sm:p-6">
                <AnimatedCounter target={77} label="जिल्लाहरू" />
              </div>
              <div className="rounded-2xl bg-white/[0.08] p-5 sm:p-6">
                <AnimatedCounter target={5400} suffix="+" label="कानुनी सहायता" />
              </div>
            </div>
            <div className="bg-foreground/80 shadow-float absolute -right-3 -bottom-4 hidden rounded-2xl border border-white/15 px-4 py-3 backdrop-blur-xl sm:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgb(52_211_153/0.15)]" />
                नेटवर्क सक्रिय
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
