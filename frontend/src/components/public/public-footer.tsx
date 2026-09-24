"use client";

import { Link } from "@/lib/i18n-navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

type FooterSection = { heading: string; items: { href: string; label: string }[] };

export function PublicFooter() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const tCon = useTranslations("contact");

  const sections: FooterSection[] = [
    {
      heading: t("organisation"),
      items: [
        { href: "/about", label: t("aboutUs") },
        { href: "/leadership", label: t("leadership") },
        { href: "/branches", label: t("branches") },
        { href: "/careers", label: t("careers") },
      ],
    },
    {
      heading: t("services"),
      items: [
        { href: "/legal", label: t("legalAid") },
        { href: "/training", label: t("training") },
        { href: "/migrant-support", label: t("migrantSupport") },
        { href: "/incidents/report", label: t("reportIncident") },
      ],
    },
    {
      heading: t("resources"),
      items: [
        { href: "/labour-act", label: t("labourAct") },
        { href: "/documents", label: t("documents") },
        { href: "/faq", label: t("faqs") },
        { href: "/contact", label: t("contactSupport") },
      ],
    },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-14 sm:py-16">
        <div className="border-background/10 bg-background/[0.05] mb-12 grid gap-8 rounded-3xl border p-6 sm:p-8 lg:grid-cols-[1.2fr_auto] lg:items-center">
          <div>
            <p className="text-background/70 text-sm font-semibold">{tCommon("appName")}</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
              {t("tagline")}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/register" label="दर्ता गर्नुहोस्" />
            <ButtonLink href="/contact" label="हामीलाई सम्पर्क गर्नुहोस्" muted />
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="bg-background/10 flex h-11 w-11 items-center justify-center rounded-2xl">
                <Image
                  src="/image/Logo.jpeg"
                  alt="Shram Jagaran Network Logo"
                  width={44}
                  height={44}
                  className="h-9 w-9 rounded-xl object-contain"
                />
              </span>
              <span className="font-devanagari text-lg font-bold">{tCommon("appName")}</span>
            </Link>
            <p className="text-background/60 mt-5 max-w-xs text-sm leading-relaxed">
              {t("tagline")}
            </p>
            <div className="text-background/60 mt-6 space-y-3 text-sm">
              <div className="text-background/60 flex items-start gap-2.5">
                <MapPin className="text-background/70 mt-0.5 h-4 w-4 shrink-0" />
                <span>{tCon("address")}</span>
              </div>
              <a
                className="hover:text-background flex items-center gap-2.5 transition-colors"
                href="tel:+9779851147727"
              >
                <Phone className="text-background/70 h-4 w-4 shrink-0" />
                <span>{tCon("phone")}</span>
              </a>
              <a
                className="hover:text-background flex items-center gap-2.5 transition-colors"
                href="mailto:cstunepal2019@gmail.com"
              >
                <Mail className="text-background/70 h-4 w-4 shrink-0" />
                <span>cstunepal2019@gmail.com</span>
              </a>
            </div>
          </div>
          {sections.map((section) => (
            <nav key={section.heading} aria-labelledby={`footer-${section.heading}`}>
              <h2 id={`footer-${section.heading}`} className="text-background text-sm font-bold">
                {section.heading}
              </h2>
              <ul className="text-background/60 mt-4 space-y-3 text-sm">
                {section.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="hover:text-background transition-colors">
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-background/10 text-background/50 mt-12 flex flex-col gap-4 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year: new Date().getFullYear(), appName: tCommon("appName") })}</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-background transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-background transition-colors">
              {t("terms")}
            </Link>
            <Link href="/accessibility" className="hover:text-background transition-colors">
              {t("accessibility")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ButtonLink({
  href,
  label,
  muted = false,
}: {
  href: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        muted
          ? "border-background/20 text-background hover:bg-background/10 inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors"
          : "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all hover:-translate-y-0.5"
      }
    >
      {label}
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}
