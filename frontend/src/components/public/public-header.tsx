"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  Menu,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Clock,
  Gavel,
  Users,
  MessageSquare,
  ExternalLink,
  Heart,
  Calendar,
  Newspaper,
  Shield,
  ArrowRight,
  FileText,
  HandHelping,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { menuService } from "@/services/menu-service";
import { publicService } from "@/services/public-service";

const FALLBACK_NAV: { id: string; label: string; href: string }[] = [
  { id: "fallback-about", label: "हाम्रो बारेमा", href: "/about" },
  { id: "fallback-news", label: "समाचार", href: "/news" },
  { id: "fallback-events", label: "कार्यक्रमहरू", href: "/events" },
  { id: "fallback-donate", label: "दान गर्नुहोस्", href: "/donate" },
];
const FALLBACK_RESOURCES: { id: string; label: string; href: string }[] = [
  { id: "fallback-legal", label: "कानुनी सहायता", href: "/legal" },
  { id: "fallback-membership", label: "सदस्यता", href: "/membership" },
  { id: "fallback-contact", label: "सम्पर्क", href: "/contact" },
  { id: "fallback-branches", label: "शाखाहरू", href: "/branches" },
];

export function PublicHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tCon = useTranslations("contact");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroPast, setHeroPast] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const navRef = useRef<HTMLDivElement>(null);
  const heroObserverRef = useRef<IntersectionObserver | null>(null);

  const { data: menuData } = useQuery({
    queryKey: ["public-menu"],
    queryFn: () => menuService.list(),
  });

  const { data: tickerData } = useQuery({
    queryKey: ["public-news-ticker"],
    queryFn: () => publicService.newsList(),
    refetchInterval: 120000,
  });

  const menus = menuData?.data ?? [];
  const mainItems = menus.length > 0 ? menus.slice(0, 4) : FALLBACK_NAV;
  const resourceItems = menus.length > 0 ? menus.slice(4) : FALLBACK_RESOURCES;

  // Update active indicator position
  const updateIndicator = useCallback(() => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector<HTMLAnchorElement>('[aria-current="page"]');
    if (activeLink) {
      const parent = activeLink.parentElement;
      if (parent) {
        const { left, width } = parent.getBoundingClientRect();
        const navLeft = navRef.current.getBoundingClientRect().left;
        setIndicatorStyle({ left: left - navLeft, width });
      }
    }
  }, []);

  // Measure indicator after active link changes
  useEffect(() => {
    updateIndicator();
    // Re-measure on resize
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [pathname, mainItems, updateIndicator]);

  // Context-aware hero detection
  useEffect(() => {
    const heroEl = document.querySelector<HTMLElement>('[data-hero], #hero, section:first-of-type');
    if (!heroEl) {
      // Fallback: viewport heuristic
      const onScroll = () => setHeroPast(window.scrollY > window.innerHeight * 0.7);
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }
    heroObserverRef.current = new IntersectionObserver(
      ([entry]) => setHeroPast(!entry.isIntersecting),
      { threshold: 0 }
    );
    heroObserverRef.current.observe(heroEl);
    return () => heroObserverRef.current?.disconnect();
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }, [pathname, locale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

    return (
      <div className="w-full">
        {/* Sticky Utility Header */}
        <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md shadow-sm">
          {/* Top Contact Bar */}
          <div className="hidden border-b md:block bg-gradient-to-r from-primary/5 via-background to-primary/5 py-2">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold">९८५११४७७२७, ९८५१०१९५९४</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold">cstunepal2019@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold">कोटेश्वर-३२, काठमाडौं, नेपाल</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold">आइत-शुक्र: १०:०० - १७:००</span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <Link href="/news" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  <Newspaper className="h-3 w-3 inline mr-1" />ताजा समाचार
                </Link>
                <span className="text-muted-foreground/20">|</span>
                <Link href="/events" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  <Calendar className="h-3 w-3 inline mr-1" />आगामी कार्यक्रम
                </Link>
                <span className="text-muted-foreground/20">|</span>
                <Link href="/dashboard" className="text-xs font-bold text-primary hover:underline">
                  <Shield className="h-3 w-3 inline mr-1" />{t("dashboard")}
                </Link>
              </div>
            </div>
          </div>

          {/* News Ticker Bar */}
          <div className="hidden md:block border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
            <div className="container flex items-center gap-4 py-1.5 overflow-hidden">
              <span className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-0.5">
                <Newspaper className="h-3 w-3" />
                ताजा समाचार
              </span>
              <div className="overflow-hidden relative flex-1">
                <div className="flex gap-12 marquee-content" style={{ animation: "tickerScroll 35s linear infinite" }}>
                  {(tickerData ?? []).length > 0 ? (
                    <>
                      {[...tickerData!, ...tickerData!].map((item, idx) => (
                        <Link
                          key={`${item.id}-${idx}`}
                          href={`/news/${item.slug}`}
                          className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                        >
                          {item.title}
                        </Link>
                      ))}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">कुनै समाचार उपलब्ध छैन</span>
                  )}
                </div>
              </div>
            </div>
            <style>{`
              @keyframes tickerScroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </div>
        </div>

        {/* Main Header - Now scrolls away */}
        <header className="w-full border-b bg-background py-5">
        <div className="container flex items-center justify-between">
          {/* Logo - bigger */}
          <Link href="/" className="flex items-center gap-4 transition-opacity hover:opacity-90 group min-w-fit">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-union-red via-red-700 to-govt-blue shadow-lg transition-transform group-hover:scale-105">
              <span className="text-2xl font-bold text-white">श्र</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight leading-none">{tCommon("appName")}</span>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">नेपाली ट्रेड युनियन महासंघ</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <nav ref={navRef} aria-label="मुख्य नेभिगेसन" role="navigation" className="flex gap-1 items-center relative">
              {/* Sliding active indicator */}
              <div
                className="absolute bottom-0 h-0.5 bg-primary rounded-full transition-all duration-500 ease-out pointer-events-none"
                style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              />
              {mainItems.map((item) => (
                <div key={item.id || item.href}>
                  <Link
                    href={item.href}
                    className={`rounded-full px-5 py-2.5 text-base font-bold transition-all ${
                      pathname === item.href 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
                    }`}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full px-5 py-2.5 text-base font-bold text-foreground/80 hover:bg-primary/10 hover:text-primary h-auto" aria-label={t("resources")}>
                    {t("resources")} <ChevronDown className="ml-1.5 h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel className="text-sm font-bold text-muted-foreground px-2 py-1.5">
                    {t("resources")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {resourceItems.map((item) => (
                    <DropdownMenuItem key={item.id || item.href} asChild className="cursor-pointer rounded-md py-2">
                      <Link href={item.href} className="flex items-center gap-3 px-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          {item.href.includes("legal") && <Gavel className="h-4 w-4" aria-hidden="true"/>}
                          {item.href.includes("membership") && <Users className="h-4 w-4" aria-hidden="true"/>}
                          {item.href.includes("contact") && <MessageSquare className="h-4 w-4" aria-hidden="true"/>}
                          {!item.href.includes("legal") && !item.href.includes("membership") && !item.href.includes("contact") && <ExternalLink className="h-4 w-4" aria-hidden="true"/>}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold">{item.label}</span>
                          <span className="text-xs text-muted-foreground">थप जानकारीको लागि क्लिक गर्नुहोस्</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Right section - larger search, buttons */}
          <div className="flex items-center gap-3">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      type="search" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      placeholder={tCommon("search")} 
                      className="h-12 w-52 rounded-full pl-11 lg:w-80 text-base font-semibold" 
                      autoFocus 
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-11 w-11 rounded-full" onClick={() => setSearchOpen(false)} aria-label="खोज बन्द गर्नुहोस्">
                    <X className="h-5 w-5" />
                  </Button>
                </form>
              ) : (
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" onClick={() => setSearchOpen(true)} aria-label={tCommon("search")}>
                  <Search className="h-5 w-5" />
                </Button>
              )}
            
            <ThemeToggle />
            
            <div className="hidden md:flex items-center gap-3">
              <Button variant="union" asChild className="rounded-full px-8 py-3 h-auto shadow-md hover:shadow-union/20 transition-all text-base font-bold">
                <Link href="/dashboard" className="gap-2">
                  <Shield className="h-5 w-5" />
                  {t("dashboard")}
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full px-8 py-3 h-auto border-primary/20 hover:bg-primary/5 text-base font-bold">
                <Link href="/donate" className="gap-2">
                  <Heart className="h-5 w-5" />
                  {t("donate")}
                </Link>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full h-11 w-11"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "नेभिगेसन बन्द गर्नुहोस्" : "नेभिगेसन खोल्नुहोस्"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Context-Aware Sub-bar: info links → floating actions */}
        <div
          className={`hidden lg:block transition-all duration-500 ease-in-out ${
            heroPast
              ? "border-b bg-background/80 backdrop-blur-xl"
              : ""
          }`}
        >
          <div className="container transition-all duration-500 ease-in-out overflow-hidden max-h-20 py-2 opacity-100">
            {heroPast ? (
              /* Floating mini-action bar after hero */
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-bold text-foreground/60 flex items-center gap-1.5">
                    <HandHelping className="h-4 w-4 text-primary" />
                    तपाईंलाई के चाहियो?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="union" asChild className="rounded-full px-4 h-8 text-xs font-bold shadow-sm">
                    <Link href="/membership" className="gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      सदस्यता लिनुहोस्
                      <ArrowRight className="h-3 w-3 ml-0.5" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" asChild className="rounded-full px-4 h-8 text-xs font-bold shadow-sm animate-pulse">
                    <Link href="/contact" className="gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      तत्काल सहायता
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild className="rounded-full px-4 h-8 text-xs font-bold">
                    <Link href="/donate" className="gap-1.5">
                      <Heart className="h-3.5 w-3.5" />
                      दान गर्नुहोस्
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-8">
                <span className="font-bold text-foreground/60 text-sm">हाम्रा सेवाहरू:</span>
                <Link href="/legal" className="text-sm font-bold hover:text-primary transition-colors">कानुनी सहायता</Link>
                <span className="text-muted-foreground/20">•</span>
                <Link href="/training" className="text-sm font-bold hover:text-primary transition-colors">तालिम</Link>
                <span className="text-muted-foreground/20">•</span>
                <Link href="/membership" className="text-sm font-bold hover:text-primary transition-colors">सदस्यता</Link>
                <span className="text-muted-foreground/20">•</span>
                <Link href="/branches" className="text-sm font-bold hover:text-primary transition-colors">शाखाहरू</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="नेभिगेसन मेनु"
            className="lg:hidden border-t bg-background/98 backdrop-blur-lg animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto"
          >
            <nav aria-label="मोबाइल नेभिगेसन" role="navigation" className="container py-4 space-y-1">
              {mainItems.map((item) => (
                <Link
                  key={item.id || item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg px-4 py-3.5 text-lg font-bold transition-colors ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
                  }`}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
              <details className="group">
                <summary className="flex cursor-pointer items-center rounded-lg px-4 py-3.5 text-lg font-bold text-foreground/80 hover:bg-primary/10 hover:text-primary [&::-webkit-details-marker]:hidden">
                  {t("resources")}
                  <ChevronDown className="ml-auto h-5 w-5 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="ml-4 space-y-1 pb-2">
                  {resourceItems.map((item) => (
                    <Link
                      key={item.id || item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {item.href.includes("legal") && <Gavel className="h-3.5 w-3.5" aria-hidden="true"/>}
                        {item.href.includes("membership") && <Users className="h-3.5 w-3.5" aria-hidden="true"/>}
                        {item.href.includes("contact") && <MessageSquare className="h-3.5 w-3.5" aria-hidden="true"/>}
                        {!item.href.includes("legal") && !item.href.includes("membership") && !item.href.includes("contact") && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true"/>}
                      </div>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>

              {/* Mobile contact info */}
              <div className="border-t pt-4 mt-4 space-y-3">
                <div className="space-y-2 px-1">
                  <div className="flex items-center gap-2 text-base font-bold text-muted-foreground">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>{tCon("phone")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-base font-bold text-muted-foreground">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>cstunepal2019@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-base font-bold text-muted-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>आइत-शुक्र: १०:०० - १७:००</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="union" className="rounded-lg h-14 text-base font-bold" asChild>
                    <Link href="/dashboard">{t("dashboard")}</Link>
                  </Button>
                  <Button variant="outline" className="rounded-lg h-14 text-base font-bold" asChild>
                    <Link href="/donate">{t("donate")}</Link>
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
