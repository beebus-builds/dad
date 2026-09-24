"use client";

import { Bell, LogOut, Menu, Search, Settings, User as UserIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/lib/i18n-navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useLogout } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const ROLE_KEYS = {
  SUPER_ADMIN: "SUPER_ADMIN",
  NATIONAL_ADMIN: "NATIONAL_ADMIN",
  PROVINCE_ADMIN: "PROVINCE_ADMIN",
  DISTRICT_ADMIN: "DISTRICT_ADMIN",
  BRANCH_ADMIN: "BRANCH_ADMIN",
  MEMBER: "MEMBER",
  PUBLIC: "PUBLIC",
} as const;

export function DashboardHeader() {
  const t = useTranslations("dashboard.header");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("roles");
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-border/70 bg-background/85 sticky top-0 z-30 flex h-20 items-center gap-3 border-b px-4 backdrop-blur-xl sm:gap-5 sm:px-6 lg:px-8">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label={t("openNav")}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <DashboardSidebar onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <form className="max-w-xl flex-1">
        <label htmlFor="dashboard-search" className="sr-only">
          {tCommon("search")}
        </label>
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="dashboard-search"
            type="search"
            placeholder={t("searchPlaceholder")}
            className="bg-muted/70 focus-visible:border-primary/40 focus-visible:bg-card h-11 rounded-xl border-transparent pr-4 pl-11 shadow-none"
          />
        </div>
      </form>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("notificationsAria")}
          className="relative rounded-xl"
        >
          <Bell className="h-5 w-5" />
          <span className="bg-union-red ring-background absolute top-2 right-2 inline-flex h-2 w-2 rounded-full ring-2" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-auto items-center gap-2.5 rounded-xl px-1.5 py-1.5 sm:gap-3"
              aria-label={t("userMenu")}
            >
              <Avatar className="ring-primary/10 h-9 w-9 ring-2">
                <AvatarImage src={user?.avatarUrl} alt="" />
                <AvatarFallback>{getInitials(user?.fullName ?? "?")}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <div className="max-w-32 truncate text-sm font-semibold">
                  {user?.fullName ?? "Guest"}
                </div>
                <div className="text-muted-foreground text-xs">
                  {user ? tRoles(ROLE_KEYS[user.role as keyof typeof ROLE_KEYS]) : ""}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-1.5">
            <DropdownMenuLabel className="px-3 py-2">
              <div className="font-semibold">{user?.fullName}</div>
              {user && (
                <Badge variant="secondary" className="mt-1.5">
                  {tRoles(ROLE_KEYS[user.role as keyof typeof ROLE_KEYS])}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" /> {tCommon("profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" /> {tCommon("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> {tCommon("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
