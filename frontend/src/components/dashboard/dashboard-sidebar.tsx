"use client";

import { usePathname, Link } from "@/lib/i18n-navigation";
import Image from "next/image";
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
  Mail,
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
    | "pages"
    | "documents"
    | "legalCases"
    | "training"
    | "incidents"
    | "donations"
    | "campaigns"
    | "users"
    | "branches"
    | "auditLog"
    | "myProfile"
    | "settings"
    | "support";
  icon: LucideIcon;
  permission?: Permission;
};

type NavSection = {
  headingKey: "overview" | "operations" | "labour" | "account";
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    headingKey: "overview",
    items: [
      { href: "/dashboard", key: "dashboard", icon: Home },
      {
        href: "/dashboard/audit-log",
        key: "auditLog",
        icon: ScrollText,
        permission: PERMISSIONS.AUDIT_VIEW,
      },
      {
        href: "/dashboard/reports",
        key: "reports",
        icon: BarChart3,
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      { href: "/dashboard/notifications", key: "notifications", icon: Bell },
    ],
  },
  {
    headingKey: "operations",
    items: [
      {
        href: "/dashboard/members",
        key: "members",
        icon: Users,
        permission: PERMISSIONS.MEMBERS_READ,
      },
      {
        href: "/dashboard/users",
        key: "users",
        icon: UserCog,
        permission: PERMISSIONS.USERS_MANAGE,
      },
      {
        href: "/dashboard/branches",
        key: "branches",
        icon: Building2,
        permission: PERMISSIONS.BRANCHES_MANAGE,
      },
      {
        href: "/dashboard/complaints",
        key: "complaints",
        icon: MessageSquareWarning,
        permission: PERMISSIONS.COMPLAINTS_READ,
      },
      {
        href: "/dashboard/events",
        key: "events",
        icon: Calendar,
        permission: PERMISSIONS.EVENTS_READ,
      },
      { href: "/dashboard/news", key: "news", icon: Newspaper, permission: PERMISSIONS.NEWS_READ },
      {
        href: "/dashboard/pages",
        key: "pages",
        icon: FileText,
        permission: PERMISSIONS.USERS_MANAGE,
      },
      {
        href: "/dashboard/documents",
        key: "documents",
        icon: FileText,
        permission: PERMISSIONS.DOCUMENTS_READ,
      },
    ],
  },
  {
    headingKey: "labour",
    items: [
      {
        href: "/dashboard/legal-cases",
        key: "legalCases",
        icon: Gavel,
        permission: PERMISSIONS.LEGAL_READ,
      },
      {
        href: "/dashboard/training",
        key: "training",
        icon: GraduationCap,
        permission: PERMISSIONS.TRAINING_READ,
      },
      {
        href: "/dashboard/incidents",
        key: "incidents",
        icon: Shield,
        permission: PERMISSIONS.INCIDENTS_READ,
      },
      {
        href: "/dashboard/donations",
        key: "donations",
        icon: HandHeart,
        permission: PERMISSIONS.DONATIONS_READ,
      },
      {
        href: "/dashboard/campaigns",
        key: "campaigns",
        icon: Mail,
        permission: PERMISSIONS.CAMPAIGNS_READ,
      },
    ],
  },
  {
    headingKey: "account",
    items: [
      { href: "/dashboard/profile", key: "myProfile", icon: Briefcase },
      {
        href: "/dashboard/settings",
        key: "settings",
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_MANAGE,
      },
      { href: "/dashboard/support", key: "support", icon: LifeBuoy },
    ],
  },
];

export function DashboardSidebar({ onNavClick }: { onNavClick?: () => void }) {
  const t = useTranslations("dashboard.sidebar");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);

  return (
    <aside className="border-background/10 bg-foreground text-background flex h-screen w-full shrink-0 flex-col border-r md:w-72">
      <div className="border-background/10 flex h-20 items-center border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onNavClick}>
          <span className="bg-background/10 flex h-10 w-10 items-center justify-center rounded-xl">
            <Image
              src="/image/Logo.jpeg"
              alt=""
              width={40}
              height={40}
              className="h-8 w-8 rounded-lg object-contain"
            />
          </span>
          <span className="font-devanagari text-sm font-bold">{tCommon("appName")}</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav aria-label={t("navAria")} className="space-y-7 px-3 py-5">
          {SECTIONS.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.permission || can(item.permission),
            );
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.headingKey} className="space-y-1.5">
                <p className="text-background/35 px-3 text-[10px] font-bold tracking-[0.18em] uppercase">
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
                      onClick={onNavClick}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                        active
                          ? "bg-primary text-primary-foreground shadow-[0_10px_22px_-14px_hsl(var(--primary)/0.9)]"
                          : "text-background/60 hover:bg-background/[0.08] hover:text-background",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                          active
                            ? "text-primary-foreground"
                            : "text-background/45 group-hover:text-background",
                        )}
                      />
                      {t(item.key)}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator className="bg-background/10" />
      <div className="text-background/35 px-5 py-4 text-[11px]">
        v0.1.0 · © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
