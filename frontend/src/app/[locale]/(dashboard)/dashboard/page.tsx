"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarPlus,
  FileText,
  HandHeart,
  Loader2,
  Megaphone,
  MessageSquareWarning,
  Newspaper,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { reportsService } from "@/services/reports-service";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { StaggerList, StaggerItem } from "@/components/stagger-list";
import { LineChartWidget } from "@/components/dashboard/charts/line-chart";

const QUICK_ACTIONS = [
  { href: "/dashboard/members/new", icon: UserPlus, labelKey: "addMember", color: "text-blue-600 bg-blue-50" },
  { href: "/dashboard/complaints/new", icon: MessageSquareWarning, labelKey: "fileComplaint", color: "text-amber-600 bg-amber-50" },
  { href: "/dashboard/news/new", icon: Newspaper, labelKey: "publishNews", color: "text-green-600 bg-green-50" },
  { href: "/dashboard/events/new", icon: CalendarPlus, labelKey: "createEvent", color: "text-purple-600 bg-purple-50" },
];

export default function DashboardPage() {
  const t = useTranslations("dashboard.home");
  const tStats = useTranslations("dashboard.home.stats");
  const tActions = useTranslations("dashboard.home.quickActions");
  const tCommon = useTranslations("common");
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: reportsService.dashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 animate-pulse-soft">
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const summaryCards = [
    { label: tStats("members"), value: formatNumber(stats?.totalMembers ?? 0), sub: `${formatNumber(stats?.activeMembers ?? 0)} ${t("activeMembers")}`, icon: Users, trend: "up" as const },
    { label: tStats("openComplaints"), value: formatNumber(stats?.openComplaints ?? 0), sub: `${formatNumber(stats?.resolvedComplaints ?? 0)} ${t("resolvedComplaints")}`, icon: MessageSquareWarning, trend: "down" as const },
    { label: tStats("upcomingEvents"), value: formatNumber(stats?.upcomingEvents ?? 0), sub: `${formatNumber(stats?.activeLegalCases ?? 0)} ${t("activeLegalCases")}`, icon: BarChart3, trend: "up" as const },
    { label: tStats("donations"), value: formatCurrency(stats?.totalDonations ?? 0), sub: t("totalAllTime"), icon: HandHeart, trend: "up" as const },
  ];

  const growth = stats?.monthlyGrowth ?? [];
  const chartData = growth.map((g) => ({
    label: g.month.slice(5),
    members: g.members,
    complaints: g.complaints,
  }));

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("welcome", { name: user?.fullName?.split(" ")[0] ?? t("defaultName") })}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Badge variant="success" className="w-fit">{t("liveBadge")}</Badge>
      </div>

      <section aria-label={t("quickActionsAria")} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StaggerList className="contents">
          {QUICK_ACTIONS.map((action, i) => (
            <StaggerItem key={action.href} index={i}>
              <Link href={action.href}>
                <Card className="card-hover cursor-pointer">
                  <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:flex-row sm:text-left">
                    <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium leading-tight">{tActions(action.labelKey)}</span>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      <section aria-label={t("keyMetricsAria")} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerList className="contents">
          {summaryCards.map((s, i) => (
            <StaggerItem key={s.label} index={i}>
              <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">{s.value}</div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">{s.sub}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("monthlyGrowth")}</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                {t("noData")}
              </div>
            ) : (
              <LineChartWidget
                data={chartData}
                xKey="label"
                series={[
                  { key: "members", label: t("membersChart"), color: "hsl(var(--govt-blue))" },
                  { key: "complaints", label: t("complaintsChart"), color: "hsl(var(--union-red))" },
                ]}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.recentActivity?.length ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("noRecentActivity")}</p>
            ) : (
              <ul className="space-y-4">
                {stats.recentActivity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm leading-snug">{a.message}</p>
                      <p className="text-xs text-muted-foreground">{a.at}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Separator className="my-4" />
            <Link
              href="/dashboard/reports"
              className="btn-hover inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              {t("viewReports")}
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
