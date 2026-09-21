"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/lib/i18n-navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  Menu,
  ChevronDown,
  Gavel,
  Users,
  MessageSquare,
  ExternalLink,
  Heart,
  Newspaper,
  Shield,
  ArrowUpRight,
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }, [pathname, locale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="relative w-full z-50 bg-white dark:bg-background border-b select-none">
      {/* UTILITY BAR: quiet, informational — govt-blue, small type, no shouting */}
      <div className="hidden lg:block bg-govt-blue text-white/90">
        <div className="container mx-auto px-4 flex items-center justify-between h-9 text-xs">
          <div className="flex items-center gap-5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none">
                  श्रम कानुन संकलन <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1">
                <DropdownMenuItem asChild>
                  <Link href="/legal" className="text-sm py-2">श्रम ऐन, २०७४</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/legal" className="text-sm py-2">श्रम नियमावली, २०७५</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none">
                  संस्थागत जानकारी <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-1">
                <DropdownMenuItem asChild>
                  <Link href="/about" className="text-sm py-2">केन्द्रीय कार्यसमिति</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/branches" className="text-sm py-2">जिल्ला शाखाहरू</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="hidden xl:inline text-white/50">|</span>
            <Link href="/legal" className="hidden xl:inline hover:text-white transition-colors">न्यूनतम पारिश्रमिक २०८३</Link>
            <Link href="/register" className="hidden xl:inline hover:text-white transition-colors">अनलाइन सदस्यता फारम</Link>
            <Link href="/contact" className="hidden xl:inline hover:text-white transition-colors">उजुरी तथा सहायता डेस्क</Link>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/donate" className="flex items-center gap-1 hover:text-white transition-colors">
              सहयोग कोष <ArrowUpRight className="h-3 w-3" />
            </Link>
            <div className="h-3 w-px bg-white/25" />
            <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Shield className="h-3 w-3" /> सदस्य लग-इन
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN ROW: logo + primary nav */}
      <div className="container mx-auto px-4 flex items-center gap-6 h-20">
        <Link href="/" className="hover:opacity-90 transition-opacity shrink-0 flex items-center gap-3">
          <Image
            src="/image/Logo.jpeg"
            alt="Shram Jagaran Network Logo"
            width={56}
            height={56}
            className="h-14 w-14 object-contain rounded-sm"
            priority
          />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-foreground font-devanagari">{tCommon("appName")}</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Shram Jagaran Network</span>
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="hidden lg:flex flex-1 items-center justify-end gap-1 h-full">
          {mainItems.map((item) => (
            <Link
              key={item.id || item.href}
              href={item.href}
              className={`h-full flex items-center px-4 text-sm font-semibold transition-colors relative ${
                pathname === item.href ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary" />
              )}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-full flex items-center px-4 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors focus:outline-none">
                {t("resources")} <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[480px] p-4" sideOffset={8}>
              <div className="grid grid-cols-2 gap-3">
                {resourceItems.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="block rounded-lg border border-border/60 p-3 hover:bg-muted/70 hover:border-primary/30 transition-colors"
                  >
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">View resource</div>
                  </Link>
                ))}
              </div>
              <DropdownMenuSeparator className="my-3" />
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs text-muted-foreground">Need support?</span>
                <Link href="/contact" className="text-xs text-primary font-medium hover:underline">Contact us</Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-2 flex items-center gap-1 border-l pl-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in slide-in-from-right-4">
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tCommon("search")}
                  className="h-9 w-44 text-sm"
                  autoFocus
                />
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4" />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </nav>

        {/* MOBILE HEADER LAYOUT */}
        <div className="lg:hidden flex-1 flex items-center justify-end gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background animate-in slide-in-from-right duration-300 lg:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Image
                  src="/image/Logo.jpeg"
                  alt="Shram Jagaran Network Logo"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain rounded-sm"
                />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-foreground font-devanagari">{tCommon("appName")}</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Shram Jagaran Network</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">मुख्य मेनु</p>
                {mainItems.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-md text-base font-semibold transition-colors ${
                      pathname === item.href ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="pt-6 border-t space-y-1">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">स्रोतहरू</p>
                {resourceItems.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-foreground/70 hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="p-6 border-t grid grid-cols-2 gap-3">
              <Button variant="outline" asChild className="w-full h-11 font-semibold">
                <Link href="/donate">दान गर्नुहोस्</Link>
              </Button>
              <Button variant="union" asChild className="w-full h-11 font-semibold">
                <Link href="/register">दर्ता गर्नुहोस्</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
