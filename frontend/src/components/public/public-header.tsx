"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Menu,
  Search,
  X,
  ChevronDown,
  Info,
  Newspaper,
  Calendar,
  Gavel,
  Users,
  Phone,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MAIN_NAV = ["about", "news", "events", "donate"] as const;
const RESOURCES_NAV = ["legal", "membership", "contact", "branches"] as const;

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
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-union-red via-red-700 to-govt-blue shadow-lg">
            <span className="text-lg font-bold text-white">श्र</span>
          </div>
          <span className="text-xl font-bold tracking-tight">{tCommon("appName")}</span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-1 md:flex items-center">
          {MAIN_NAV.map((k) => (
            <Link key={k} href={`/${k}`} className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground/80 transition-all hover:bg-primary/10 hover:text-primary">
              {t(k as Parameters<typeof t>[0])}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground/80 hover:bg-primary/10 hover:text-primary">
                {t("resources")} <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {RESOURCES_NAV.map((k) => (
                <DropdownMenuItem key={k} asChild>
                  <Link href={`/${k}`} className="flex items-center gap-2">
                    {k === 'legal' && <Gavel className="h-4 w-4"/>}
                    {k === 'membership' && <Users className="h-4 w-4"/>}
                    {k === 'contact' && <Phone className="h-4 w-4"/>}
                    {t(k as Parameters<typeof t>[0])}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-1">
              <Input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={tCommon("search")} className="h-9 w-32 rounded-lg lg:w-48" autoFocus />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setSearchOpen(false)} aria-label={tCommon("close")}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => setSearchOpen(true)} aria-label={tCommon("search")}>
              <Search className="h-4 w-4" />
            </Button>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex rounded-lg">
            <Link href="/login">{t("signIn")}</Link>
          </Button>
          <Button size="sm" variant="union" asChild className="hidden sm:inline-flex rounded-lg px-4">
            <Link href="/register">{t("joinNow")}</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden rounded-lg" aria-label={open ? tCommon("close") : tCommon("open")} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t bg-background md:hidden">
          <nav aria-label="Primary mobile" className="container flex flex-col gap-1 py-4">
            {[...MAIN_NAV, ...RESOURCES_NAV].map((k) => (
              <Link key={k} href={`/${k}`} className="rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                {t(k as Parameters<typeof t>[0])}
              </Link>
            ))}
            <div className="mt-4 flex gap-3 border-t pt-4">
              <Button variant="outline" className="flex-1 rounded-lg" asChild><Link href="/login">{t("signIn")}</Link></Button>
              <Button variant="union" className="flex-1 rounded-lg" asChild><Link href="/register">{t("joinNow")}</Link></Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
