"use client";

import { Link } from "@/lib/i18n-navigation";
import { useTranslations } from "next-intl";
import { env } from "@/lib/env";

type FooterSection = { heading: string; items: { href: string; label: string }[] };

export function PublicFooter() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

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
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-union-red to-govt-blue text-sm font-bold text-white">
                SJ
              </span>
              <span className="text-base font-semibold">{tCommon("appName")}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("tagline")}</p>
          </div>
          {sections.map((section) => (
            <nav key={section.heading} aria-labelledby={`footer-${section.heading}`}>
              <h2 id={`footer-${section.heading}`} className="text-sm font-semibold">
                {section.heading}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {section.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href} className="hover:text-foreground hover:underline">
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year: new Date().getFullYear(), appName: tCommon("appName") })}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:underline">
              {t("terms")}
            </Link>
            <Link href="/accessibility" className="hover:underline">
              {t("accessibility")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
