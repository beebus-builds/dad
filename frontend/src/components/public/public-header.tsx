import Link from "next/link";
import { env } from "@/lib/env";
import { APP_ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: APP_ROUTES.about, label: "About" },
  { href: APP_ROUTES.news, label: "News" },
  { href: APP_ROUTES.events, label: "Events" },
  { href: APP_ROUTES.legal, label: "Legal Aid" },
  { href: APP_ROUTES.membership, label: "Membership" },
  { href: APP_ROUTES.contact, label: "Contact" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href={APP_ROUTES.home} className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-union-red to-govt-blue text-sm font-bold text-white">
            SJ
          </span>
          <span className="hidden text-base font-semibold sm:inline">{env.appName}</span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={APP_ROUTES.login}>Sign in</Link>
          </Button>
          <Button size="sm" variant="union" asChild>
            <Link href={APP_ROUTES.register}>Join Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
