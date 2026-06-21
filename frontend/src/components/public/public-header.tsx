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
      <div className="container mx-auto px-4 flex items-center gap-6 py-3">
        
        {/* LEFT COLUMN: Brand Logo */}
        <Link href="/" className="hover:opacity-95 transition-opacity shrink-0 block">
          <Image 
            src="/image/Logo.jpeg" 
            alt="Shram Jagaran Network Logo" 
            width={128} 
            height={128} 
            className="h-32 w-32 object-contain drop-shadow-md"
            priority
          />
        </Link>

        {/* RIGHT COLUMN: Stacked Navbars (IndyCar Layout) */}
        <div className="flex-1 flex flex-col justify-between h-32 hidden lg:flex">
          
          {/* TIER 1: SECONDARY UTILITY NAV (Top Right) */}
          <nav className="flex justify-end items-center gap-6 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-union-red transition-colors focus:outline-none">
                  श्रम कानुन संकलन <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg shadow-xl">
                <DropdownMenuItem asChild>
                  <Link href="/legal" className="text-xs font-bold py-2">श्रम ऐन, २०७४</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/legal" className="text-xs font-bold py-2">श्रम नियमावली, २०७५</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-union-red transition-colors focus:outline-none">
                  संस्थागत जानकारी <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg shadow-xl">
                <DropdownMenuItem asChild>
                  <Link href="/about" className="text-xs font-bold py-2">केन्द्रीय कार्यसमिति</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/branches" className="text-xs font-bold py-2">जिल्ला शाखाहरू</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/donate" className="flex items-center gap-1 hover:text-union-red transition-colors">
              सहयोग कोष <ArrowUpRight className="h-3 w-3 text-union-red" />
            </Link>

            <div className="h-3 w-px bg-border" />
            
            <Link href="/dashboard" className="flex items-center gap-1.5 text-union-red hover:opacity-80 transition-opacity">
              <Shield className="h-3 w-3" /> सदस्य लग-इन
            </Link>
          </nav>

          {/* TIER 2: PRIMARY NAVIGATION BAR (Middle Govt Blue Capsule) */}
          <div className="relative h-14 w-full flex items-center">
            
            {/* Curved, Slanted IndyCar Style Background */}
            <div 
              className="absolute inset-0 bg-govt-blue -z-10" 
              style={{ 
                clipPath: "polygon(32px 0, 100% 0, 100% 100%, 0 100%)", 
                borderRadius: "12px 0 0 12px" 
              }} 
            />

            {/* Main Items inside Govt Blue Capsule */}
            <nav className="flex items-center justify-between w-full pl-12 pr-6 h-full text-white">
              <div className="flex items-center gap-1 h-full">
                {mainItems.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className={`h-full flex items-center px-5 text-base font-black uppercase tracking-widest hover:text-white/80 transition-colors relative ${
                      pathname === item.href ? "text-white" : ""
                    }`}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <div className="absolute bottom-0 left-5 right-5 h-1 bg-white" />
                    )}
                  </Link>
                ))}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-full flex items-center px-5 text-base font-black uppercase tracking-widest hover:text-white/80 transition-colors focus:outline-none">
                      {t("resources")} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-2xl border-primary/10">
                    {resourceItems.map((item) => (
                      <DropdownMenuItem key={item.id || item.href} asChild className="cursor-pointer rounded-lg py-3">
                        <Link href={item.href} className="flex items-center gap-3 px-2">
                          <span className="text-xs font-black uppercase">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Utility Tools on Right side of Capsule */}
              <div className="flex items-center gap-4">
                {searchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center gap-2 animate-in slide-in-from-right-4">
                    <Input 
                      type="search" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      placeholder={tCommon("search")} 
                      className="h-8 w-40 rounded bg-white/10 border-white/20 text-white placeholder:text-white/50 text-xs" 
                      autoFocus 
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => setSearchOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 rounded-full" onClick={() => setSearchOpen(true)}>
                    <Search className="h-4 w-4" />
                  </Button>
                )}
                <ThemeToggle />
              </div>
            </nav>
          </div>

          {/* TIER 3: SHORTCUTS BAR (Bottom Row) */}
          <div className="flex items-center text-xs text-muted-foreground pl-10 font-bold uppercase tracking-wider">
            <span className="text-union-red font-black italic mr-4 tracking-widest border-r border-muted pr-4">द्रुत लिङ्कहरू:</span>
            <div className="flex items-center gap-4">
              <Link href="/legal" className="hover:text-union-red transition-colors">न्यूनतम पारिश्रमिक २०८३</Link>
              <span className="text-muted-foreground/30">|</span>
              <Link href="/register" className="hover:text-union-red transition-colors">अनलाइन सदस्यता फारम</Link>
              <span className="text-muted-foreground/30">|</span>
              <Link href="/news" className="hover:text-union-red transition-colors">जागरण प्रेस वक्तव्य</Link>
              <span className="text-muted-foreground/30">|</span>
              <Link href="/contact" className="hover:text-union-red transition-colors">उजुरी तथा सहायता डेस्क</Link>
            </div>
          </div>
        </div>

        {/* MOBILE HEADER LAYOUT */}
        <div className="lg:hidden flex-1 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter uppercase text-union-red">{tCommon("appName")}</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Shram Jagaran</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg border bg-muted/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
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
                  width={64} 
                  height={64} 
                  className="h-16 w-16 object-contain"
                />
                <div className="flex flex-col leading-none">
                  <span className="font-black uppercase tracking-tighter text-union-red">{tCommon("appName")}</span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Shram Jagaran</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-2">
                <p className="text-xs font-black text-union-red uppercase tracking-widest mb-4">मुख्य मेनु</p>
                {mainItems.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg text-lg font-black uppercase tracking-tight transition-colors ${
                      pathname === item.href ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-primary/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="pt-8 border-t space-y-4">
                <p className="text-xs font-black text-union-red uppercase tracking-widest">स्रोतहरू</p>
                {resourceItems.map((item) => (
                  <Link
                    key={item.id || item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-bold text-foreground/70 hover:bg-primary/10"
                  >
                    <span className="uppercase tracking-tight">{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
            <div className="p-6 border-t grid grid-cols-2 gap-4">
              <Button variant="outline" asChild className="w-full h-12 font-black uppercase tracking-tighter">
                <Link href="/donate">दान गर्नुहोस्</Link>
              </Button>
              <Button variant="union" asChild className="w-full h-12 font-black uppercase tracking-tighter">
                <Link href="/register">दर्ता गर्नुहोस्</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
