"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n-navigation";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, X } from "lucide-react";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_KEYS = ["about", "news", "events", "legal", "membership", "contact"] as const;

export function PublicHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname, locale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label={tCommon("appName")}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-union-red to-govt-blue text-sm font-bold text-white">
            SJ
          </span>
          <span className="hidden text-base font-semibold sm:inline">{tCommon("appName")}</span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-1 md:flex">
          {NAV_KEYS.map((k) => (
            <Link key={k} href={`/${k}`} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              {t(k as Parameters<typeof t>[0])}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-1">
              <Input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={tCommon("search")} className="h-8 w-40 lg:w-56" autoFocus />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(false)} aria-label={tCommon("close")}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)} aria-label={tCommon("search")}>
              <Search className="h-4 w-4" />
            </Button>
          )}
          <LocaleSwitcher />
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">{t("signIn")}</Link>
          </Button>
          <Button size="sm" variant="union" asChild className="hidden sm:inline-flex">
            <Link href="/register">{t("joinNow")}</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? tCommon("close") : tCommon("open")} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t bg-background md:hidden">
          <nav aria-label="Primary mobile" className="container flex flex-col gap-1 py-3">
            {NAV_KEYS.map((k) => (
              <Link key={k} href={`/${k}`} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                {t(k as Parameters<typeof t>[0])}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t pt-2">
              <Button variant="outline" className="flex-1" asChild><Link href="/login">{t("signIn")}</Link></Button>
              <Button variant="union" className="flex-1" asChild><Link href="/register">{t("joinNow")}</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
