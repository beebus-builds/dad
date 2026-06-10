"use client";

import { usePathname, Link } from "@/lib/i18n-navigation";
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  FileText,
  Gavel,
  GraduationCap,
  HandHeart,
  Home,
  LifeBuoy,
  MessageSquareWarning,
  Newspaper,
  Settings,
  Shield,
  UserCog,
  Users,
  Building2,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS, type Permission } from "@/lib/rbac";

type NavItem = {
  href: string;
  key:
    | "dashboard"
    | "reports"
    | "notifications"
    | "members"
    | "complaints"
    | "events"
    | "news"
    | "documents"
    | "legalCases"
    | "training"
    | "incidents"
    | "donations"
    | "users"
    | "branches"
    | "auditLog"
    | "myProfile"
    | "settings"
    | "support";
  icon: LucideIcon;
  permission?: Permission;
};

type NavSection = { headingKey: "overview" | "operations" | "labour" | "account"; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    headingKey: "overview",
    items: [
      { href: "/dashboard", key: "dashboard", icon: Home },
      { href: "/dashboard/audit-log", key: "auditLog", icon: ScrollText, permission: PERMISSIONS.AUDIT_VIEW },
      { href: "/dashboard/reports", key: "reports", icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW },
      { href: "/dashboard/notifications", key: "notifications", icon: Bell },
    ],
  },
  {
    headingKey: "operations",
    items: [
      { href: "/dashboard/members", key: "members", icon: Users, permission: PERMISSIONS.MEMBERS_READ },
      { href: "/dashboard/users", key: "users", icon: UserCog, permission: PERMISSIONS.USERS_MANAGE },
      { href: "/dashboard/branches", key: "branches", icon: Building2, permission: PERMISSIONS.BRANCHES_MANAGE },
      { href: "/dashboard/complaints", key: "complaints", icon: MessageSquareWarning, permission: PERMISSIONS.COMPLAINTS_READ },
      { href: "/dashboard/events", key: "events", icon: Calendar, permission: PERMISSIONS.EVENTS_READ },
      { href: "/dashboard/news", key: "news", icon: Newspaper, permission: PERMISSIONS.NEWS_READ },
      { href: "/dashboard/documents", key: "documents", icon: FileText, permission: PERMISSIONS.DOCUMENTS_READ },
    ],
  },
  {
    headingKey: "labour",
    items: [
      { href: "/dashboard/legal-cases", key: "legalCases", icon: Gavel, permission: PERMISSIONS.LEGAL_READ },
      { href: "/dashboard/training", key: "training", icon: GraduationCap, permission: PERMISSIONS.TRAINING_READ },
      { href: "/dashboard/incidents", key: "incidents", icon: Shield, permission: PERMISSIONS.INCIDENTS_READ },
      { href: "/dashboard/donations", key: "donations", icon: HandHeart, permission: PERMISSIONS.DONATIONS_READ },
    ],
  },
  {
    headingKey: "account",
    items: [
      { href: "/dashboard/profile", key: "myProfile", icon: Briefcase },
      { href: "/dashboard/settings", key: "settings", icon: Settings, permission: PERMISSIONS.SETTINGS_MANAGE },
      { href: "/dashboard/support", key: "support", icon: LifeBuoy },
    ],
  },
];

export function DashboardSidebar() {
  const t = useTranslations("dashboard.sidebar");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-muted/30 md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-union-red to-govt-blue text-sm font-bold text-white">
            SJ
          </span>
          <span className="text-sm">{tCommon("appName")}</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav aria-label="Dashboard" className="space-y-6 px-3 py-4">
          {SECTIONS.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.permission || can(item.permission),
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.headingKey} className="space-y-1">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(section.headingKey)}
                </p>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t(item.key)}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="px-5 py-4 text-xs text-muted-foreground">
        v0.1.0 · © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
