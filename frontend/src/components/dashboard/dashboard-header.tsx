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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden shrink-0" aria-label={t("openNav")}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <DashboardSidebar onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <form className="flex-1 max-w-xl">
        <label htmlFor="dashboard-search" className="sr-only">
          {tCommon("search")}
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="dashboard-search"
            type="search"
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </form>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label={t("notificationsAria")} className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-union-red" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto px-2 py-1.5"
                  aria-label={t("userMenu")}
                >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} alt="" />
                <AvatarFallback>{getInitials(user?.fullName ?? "?")}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium">{user?.fullName ?? "Guest"}</div>
                <div className="text-xs text-muted-foreground">
                  {user ? tRoles(ROLE_KEYS[user.role as keyof typeof ROLE_KEYS]) : ""}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user?.fullName}</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="mt-1">
                  {user ? tRoles(ROLE_KEYS[user.role as keyof typeof ROLE_KEYS]) : ""}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <UserIcon className="h-4 w-4" /> {tCommon("profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" /> {tCommon("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive">
              <LogOut className="h-4 w-4" /> {tCommon("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
