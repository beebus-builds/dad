import Link from "next/link";
import { env } from "@/lib/env";

const FOOTER_LINKS = {
  Organisation: [
    { href: "/about", label: "About Us" },
    { href: "/leadership", label: "Leadership" },
    { href: "/branches", label: "Our Branches" },
    { href: "/careers", label: "Careers" },
  ],
  Services: [
    { href: "/legal", label: "Legal Aid" },
    { href: "/training", label: "Training Programs" },
    { href: "/migrant-support", label: "Migrant Worker Support" },
    { href: "/incidents/report", label: "Report Incident" },
  ],
  Resources: [
    { href: "/labour-act", label: "Labour Act" },
    { href: "/documents", label: "Documents" },
    { href: "/faq", label: "FAQs" },
    { href: "/contact", label: "Contact Support" },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-union-red to-govt-blue text-sm font-bold text-white">
                SJ
              </span>
              <span className="text-base font-semibold">{env.appName}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering Nepalese workers through unity, advocacy and digital transformation.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, items]) => (
            <nav key={heading} aria-labelledby={`footer-${heading}`}>
              <h2 id={`footer-${heading}`} className="text-sm font-semibold">
                {heading}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {items.map((it) => (
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
          <p>© {new Date().getFullYear()} {env.appName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/accessibility" className="hover:underline">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
