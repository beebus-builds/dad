"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";
import { PERMISSIONS, type Permission } from "@/lib/rbac";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
};

type NavSection = { heading: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/reports", label: "Reports", icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    heading: "Operations",
    items: [
      { href: "/dashboard/members", label: "Members", icon: Users, permission: PERMISSIONS.MEMBERS_READ },
      { href: "/dashboard/complaints", label: "Complaints", icon: MessageSquareWarning, permission: PERMISSIONS.COMPLAINTS_READ },
      { href: "/dashboard/events", label: "Events", icon: Calendar, permission: PERMISSIONS.EVENTS_READ },
      { href: "/dashboard/news", label: "News", icon: Newspaper, permission: PERMISSIONS.NEWS_READ },
      { href: "/dashboard/documents", label: "Documents", icon: FileText, permission: PERMISSIONS.DOCUMENTS_READ },
    ],
  },
  {
    heading: "Labour",
    items: [
      { href: "/dashboard/legal-cases", label: "Legal Cases", icon: Gavel, permission: PERMISSIONS.LEGAL_READ },
      { href: "/dashboard/training", label: "Training", icon: GraduationCap, permission: PERMISSIONS.TRAINING_READ },
      { href: "/dashboard/incidents", label: "OSH Incidents", icon: Shield, permission: PERMISSIONS.INCIDENTS_READ },
      { href: "/dashboard/donations", label: "Donations", icon: HandHeart, permission: PERMISSIONS.DONATIONS_READ },
    ],
  },
  {
    heading: "Account",
    items: [
      { href: "/dashboard/profile", label: "My Profile", icon: Briefcase },
      { href: "/dashboard/settings", label: "Settings", icon: Settings, permission: PERMISSIONS.SETTINGS_MANAGE },
      { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const can = useAuthStore((s) => s.can);

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-muted/30 md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-union-red to-govt-blue text-sm font-bold text-white">
            SJ
          </span>
          <span className="text-sm">{env.appName}</span>
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
              <div key={section.heading} className="space-y-1">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.heading}
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
                      {item.label}
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
