"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DhakaPattern } from "@/components/decorative-pattern";

function AnimatedCounter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const steps = 40;
          const inc = target / steps;
          let cur = 0;
          const t = setInterval(() => {
            cur += inc;
            if (cur >= target) {
              setCount(target);
              clearInterval(t);
            } else {
              setCount(Math.floor(cur));
            }
          }, 1200 / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="text-3xl font-bold text-white sm:text-4xl">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-white/70">{label}</div>
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
    <section className="relative w-full overflow-hidden bg-govt-blue text-white">
      {/* BACKGROUND: solid govt-blue with a restrained textile motif, no motion */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-govt-blue to-[hsl(221,70%,28%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <DhakaPattern className="h-full w-full text-white" />
        </div>
      </div>

      <div className="container relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-5 lg:items-center lg:gap-16">
          <div className="space-y-6 lg:col-span-3">
            <Badge className="border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10">
              {badge}
            </Badge>

            <h1 className="font-devanagari text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{subtitle}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="bg-white font-semibold text-govt-blue hover:bg-white/90" asChild>
                <Link href="/register" className="flex items-center gap-2">
                  {primaryCta} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href="/legal">{secondaryCta}</Link>
              </Button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/15 bg-white/10 lg:col-span-2">
            <div className="bg-govt-blue/40 p-6">
              <AnimatedCounter target={120000} suffix="+" label="सदस्यहरू" />
            </div>
            <div className="bg-govt-blue/40 p-6">
              <AnimatedCounter target={80} suffix="+" label="शाखाहरू" />
            </div>
            <div className="bg-govt-blue/40 p-6">
              <AnimatedCounter target={77} label="जिल्लाहरू" />
            </div>
            <div className="bg-govt-blue/40 p-6">
              <AnimatedCounter target={5400} suffix="+" label="कानुनी सहायता" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
