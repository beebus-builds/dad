"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n-navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Menu, ChevronDown, Shield, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { menuService } from "@/services/menu-service";
import { cn } from "@/lib/utils";

const FALLBACK_NAV = [
  { id: "fallback-about", label: "हाम्रो बारेमा", href: "/about" },
  { id: "fallback-news", label: "समाचार", href: "/news" },
  { id: "fallback-events", label: "कार्यक्रमहरू", href: "/events" },
  { id: "fallback-donate", label: "दान गर्नुहोस्", href: "/donate" },
];
const FALLBACK_RESOURCES = [
  { id: "fallback-legal", label: "कानुनी सहायता", href: "/legal" },
  { id: "fallback-membership", label: "सदस्यता", href: "/membership" },
  { id: "fallback-contact", label: "सम्पर्क", href: "/contact" },
  { id: "fallback-branches", label: "शाखाहरू", href: "/branches" },
];

export function PublicHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { data: menuData } = useQuery({
    queryKey: ["public-menu"],
    queryFn: () => menuService.list(),
  });

  const menus = menuData?.data ?? [];
  const mainItems = menus.length > 0 ? menus.slice(0, 4) : FALLBACK_NAV;
  const resourceItems = menus.length > 0 ? menus.slice(4) : FALLBACK_RESOURCES;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }, [pathname, locale]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header
      className={cn(
        "border-border/70 bg-background/90 sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-shadow",
        isScrolled && "shadow-soft",
      )}
    >
      <div className="bg-foreground text-background hidden lg:block">
        <div className="container flex h-9 items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:text-background/80 flex items-center gap-1.5 transition-colors focus:outline-none">
                  श्रम कानुन संकलन <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1.5">
                <DropdownMenuItem asChild>
                  <Link href="/legal" className="py-2 text-sm">
                    श्रम ऐन, २०७४
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/legal" className="py-2 text-sm">
                    श्रम नियमावली, २०७५
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:text-background/80 flex items-center gap-1.5 transition-colors focus:outline-none">
                  संस्थागत जानकारी <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1.5">
                <DropdownMenuItem asChild>
                  <Link href="/about" className="py-2 text-sm">
                    केन्द्रीय कार्यसमिति
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/branches" className="py-2 text-sm">
                    जिल्ला शाखाहरू
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="bg-background/20 hidden h-3 w-px xl:inline" />
            <Link
              href="/legal"
              className="hover:text-background/80 hidden transition-colors xl:inline"
            >
              न्यूनतम पारिश्रमिक २०८३
            </Link>
            <Link
              href="/register"
              className="hover:text-background/80 hidden transition-colors xl:inline"
            >
              अनलाइन सदस्यता फारम
            </Link>
            <Link
              href="/contact"
              className="hover:text-background/80 hidden transition-colors xl:inline"
            >
              उजुरी तथा सहायता डेस्क
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/donate"
              className="hover:text-background/80 flex items-center gap-1 transition-colors"
            >
              सहयोग कोष <ArrowUpRight className="h-3 w-3" />
            </Link>
            <span className="bg-background/20 h-3 w-px" />
            <Link
              href="/dashboard"
              className="hover:text-background/80 flex items-center gap-1.5 font-medium transition-colors"
            >
              <Shield className="h-3 w-3" /> सदस्य लग-इन
            </Link>
          </div>
        </div>
      </div>

      <div className="container flex h-[4.5rem] items-center gap-5 px-4">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label={tCommon("appName")}
        >
          <span className="border-border/70 bg-card flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/image/Logo.jpeg"
              alt="Shram Jagaran Network Logo"
              width={48}
              height={48}
              className="h-10 w-10 rounded-xl object-contain"
              priority
            />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-devanagari text-foreground text-lg font-bold tracking-tight">
              {tCommon("appName")}
            </span>
            <span className="text-muted-foreground text-[10px] font-bold tracking-[0.18em] uppercase">
              Shram Jagaran Network
            </span>
          </span>
        </Link>

        <nav
          className="hidden h-full flex-1 items-center justify-end gap-1 lg:flex"
          aria-label={t("quickLinks")}
        >
          {mainItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id || item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-10 items-center rounded-full px-3.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
                {active && (
                  <span className="bg-primary absolute inset-x-3.5 -bottom-[1.05rem] h-0.5 rounded-full" />
                )}
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-10 items-center rounded-full px-3.5 text-sm font-semibold transition-colors focus:outline-none">
                {t("resources")} <ChevronDown className="ml-1.5 h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[500px] p-4" sideOffset={8}>
              <div className="grid grid-cols-2 gap-2">
                {resourceItems.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="group border-border/70 bg-card hover:border-primary/30 hover:bg-primary/[0.04] rounded-xl border p-3.5 transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {item.label}
                      <ArrowUpRight className="text-muted-foreground group-hover:text-primary h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">स्रोत हेर्नुहोस्</div>
                  </Link>
                ))}
              </div>
              <DropdownMenuSeparator className="my-3" />
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-muted-foreground">सहयोग चाहिन्छ?</span>
                <Link href="/contact" className="text-primary font-semibold hover:underline">
                  हामीलाई सम्पर्क गर्नुहोस्
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-2 flex items-center gap-1 border-l pl-2">
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="animate-in slide-in-from-right-4 flex items-center gap-1.5"
              >
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tCommon("search")}
                  className="h-10 w-48"
                  autoFocus
                  aria-label={tCommon("search")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSearchOpen(false)}
                  aria-label={tCommon("close")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setSearchOpen(true)}
                aria-label={tCommon("search")}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 lg:hidden">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? tCommon("close") : tCommon("open")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="bg-background animate-in slide-in-from-right fixed inset-0 z-[100] overflow-y-auto duration-300 lg:hidden">
          <div className="flex min-h-full flex-col">
            <div className="bg-background/95 sticky top-0 z-10 flex items-center justify-between border-b p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="bg-card flex h-11 w-11 items-center justify-center rounded-2xl border">
                  <Image
                    src="/image/Logo.jpeg"
                    alt="Shram Jagaran Network Logo"
                    width={44}
                    height={44}
                    className="h-9 w-9 rounded-xl object-contain"
                  />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="font-devanagari text-foreground font-bold">
                    {tCommon("appName")}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-bold tracking-[0.18em] uppercase">
                    Shram Jagaran Network
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label={tCommon("close")}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 space-y-8 p-5 sm:p-7">
              <div className="space-y-2">
                <p className="text-primary mb-3 px-3 text-xs font-bold tracking-[0.16em] uppercase">
                  मुख्य मेनु
                </p>
                {mainItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id || item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                      <ArrowUpRight className="h-4 w-4 opacity-60" />
                    </Link>
                  );
                })}
              </div>
              <div className="space-y-2 border-t pt-7">
                <p className="text-primary mb-3 px-3 text-xs font-bold tracking-[0.16em] uppercase">
                  स्रोतहरू
                </p>
                {resourceItems.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors"
                  >
                    {item.label}
                    <ArrowUpRight className="ml-auto h-4 w-4 opacity-50" />
                  </Link>
                ))}
              </div>
            </nav>
            <div className="grid grid-cols-2 gap-3 border-t p-5 sm:p-7">
              <Button variant="outline" asChild className="h-12 font-semibold">
                <Link href="/donate">दान गर्नुहोस्</Link>
              </Button>
              <Button variant="union" asChild className="h-12 font-semibold">
                <Link href="/register">दर्ता गर्नुहोस्</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
