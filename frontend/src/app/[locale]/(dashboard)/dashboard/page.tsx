"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarPlus,
  FileText,
  HandHeart,
  MessageSquareWarning,
  Newspaper,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { reportsService } from "@/services/reports-service";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { StaggerList, StaggerItem } from "@/components/stagger-list";
import { LineChartWidget } from "@/components/dashboard/charts/line-chart";

const QUICK_ACTIONS = [
  {
    href: "/dashboard/members/new",
    icon: UserPlus,
    labelKey: "addMember",
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/dashboard/complaints/new",
    icon: MessageSquareWarning,
    labelKey: "fileComplaint",
    color: "bg-warning/10 text-warning",
  },
  {
    href: "/dashboard/news/new",
    icon: Newspaper,
    labelKey: "publishNews",
    color: "bg-success/10 text-success",
  },
  {
    href: "/dashboard/events/new",
    icon: CalendarPlus,
    labelKey: "createEvent",
    color: "bg-union-red/10 text-union-red",
  },
];

export default function DashboardPage() {
  const t = useTranslations("dashboard.home");
  const tStats = useTranslations("dashboard.home.stats");
  const tActions = useTranslations("dashboard.home.quickActions");
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: reportsService.dashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const summaryCards = [
    {
      label: tStats("members"),
      value: formatNumber(stats?.totalMembers ?? 0),
      sub: `${formatNumber(stats?.activeMembers ?? 0)} ${t("activeMembers")}`,
      icon: Users,
      trend: "up" as const,
    },
    {
      label: tStats("openComplaints"),
      value: formatNumber(stats?.openComplaints ?? 0),
      sub: `${formatNumber(stats?.resolvedComplaints ?? 0)} ${t("resolvedComplaints")}`,
      icon: MessageSquareWarning,
      trend: "down" as const,
    },
    {
      label: tStats("upcomingEvents"),
      value: formatNumber(stats?.upcomingEvents ?? 0),
      sub: `${formatNumber(stats?.activeLegalCases ?? 0)} ${t("activeLegalCases")}`,
      icon: BarChart3,
      trend: "up" as const,
    },
    {
      label: tStats("donations"),
      value: formatCurrency(stats?.totalDonations ?? 0),
      sub: t("totalAllTime"),
      icon: HandHeart,
      trend: "up" as const,
    },
  ];

  const growth = stats?.monthlyGrowth ?? [];
  const chartData = growth.map((g) => ({
    label: g.month.slice(5),
    members: g.members,
    complaints: g.complaints,
  }));

  return (
    <div className="space-y-8">
      <section className="border-primary/15 from-card via-card to-primary/[0.08] shadow-soft relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 sm:p-8">
        <div className="bg-primary/10 pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="success" className="mb-3 gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {t("liveBadge")}
            </Badge>
            <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              {t("welcome", { name: user?.fullName?.split(" ")[0] ?? t("defaultName") })}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">{t("subtitle")}</p>
          </div>
          <div className="bg-background/70 hidden items-center gap-3 rounded-2xl border p-4 sm:flex">
            <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-muted-foreground text-xs font-semibold">आजको फोकस</p>
              <p className="mt-0.5 text-sm font-bold">डेटामा स्पष्टता</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={t("quickActionsAria")} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StaggerList className="contents">
          {QUICK_ACTIONS.map((action, i) => (
            <StaggerItem key={action.href} index={i}>
              <Link href={action.href} className="block h-full">
                <Card className="card-hover h-full">
                  <CardContent className="flex h-full flex-col items-center gap-2 p-4 text-center sm:flex-row sm:text-left">
                    <div
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.color}`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm leading-tight font-semibold">
                      {tActions(action.labelKey)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      <section
        aria-label={t("keyMetricsAria")}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StaggerList className="contents">
          {summaryCards.map((s) => (
            <StaggerItem key={s.label}>
              <Card className="card-hover h-full overflow-hidden">
                <div className="border-border/60 flex items-center justify-between border-b px-5 py-4">
                  <CardTitle className="text-muted-foreground text-sm font-semibold">
                    {s.label}
                  </CardTitle>
                  <span className="bg-primary/8 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
                    <s.icon className="h-4 w-4" />
                  </span>
                </div>
                <CardContent className="p-5">
                  <div className="text-2xl font-bold tracking-tight tabular-nums">{s.value}</div>
                  <p className="text-muted-foreground mt-1.5 flex items-center gap-1 text-xs">
                    <TrendingUp className="text-success h-3.5 w-3.5" />
                    {s.sub}
                  </p>
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
              <div className="bg-muted/20 text-muted-foreground flex h-64 items-center justify-center rounded-2xl border border-dashed text-sm">
                {t("noData")}
              </div>
            ) : (
              <LineChartWidget
                data={chartData}
                xKey="label"
                series={[
                  { key: "members", label: t("membersChart"), color: "hsl(var(--govt-blue))" },
                  {
                    key: "complaints",
                    label: t("complaintsChart"),
                    color: "hsl(var(--union-red))",
                  },
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
              <p className="text-muted-foreground py-10 text-center text-sm">
                {t("noRecentActivity")}
              </p>
            ) : (
              <ul className="space-y-4">
                {stats.recentActivity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <div className="bg-primary/10 text-primary mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm leading-snug">{a.message}</p>
                      <p className="text-muted-foreground text-xs">{a.at}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Separator className="my-5" />
            <Link
              href="/dashboard/reports"
              className="btn-hover text-primary inline-flex items-center gap-1 text-sm font-bold"
            >
              {" "}
              {t("viewReports")}{" "}
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
