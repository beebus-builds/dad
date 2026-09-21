"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, LineChart, Loader2, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { reportsService } from "@/services/reports-service";
import { ApiError } from "@/lib/api-client";
import { LineChartWidget } from "@/components/dashboard/charts/line-chart";
import { BarChartWidget } from "@/components/dashboard/charts/bar-chart";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const { number, currency } = useLocaleFormat();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports-dashboard"],
    queryFn: () => reportsService.dashboard(),
  });

  const { data: branchData } = useQuery({
    queryKey: ["reports-branches"],
    queryFn: () => reportsService.branchBreakdown(),
  });

  return (
    <PermissionGate permission={PERMISSIONS.REPORTS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          actions={
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" /> {t("exportPdf")}
            </Button>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
          </div>
        ) : isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(error as ApiError).message}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> {t("members")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{number(data.totalMembers)}</p>
                  <p className="text-sm text-muted-foreground">
                    {number(data.activeMembers)} {t("active")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" /> {t("complaints")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{number(data.openComplaints)}</p>
                  <p className="text-sm text-muted-foreground">
                    {number(data.resolvedComplaints)} {t("resolved")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" /> {t("donations")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{currency(data.totalDonations, "NPR")}</p>
                  <p className="text-sm text-muted-foreground">{t("totalReceived")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Mini label={t("upcomingEvents")} value={data.upcomingEvents} />
              <Mini label={t("activeLegal")} value={data.activeLegalCases} />
              <Mini label={t("openComplaints")} value={data.openComplaints} tone="warning" />
              <Mini label={t("resolvedComplaints")} value={data.resolvedComplaints} tone="success" />
            </div>

            {data.monthlyGrowth?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t("monthlyGrowth")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChartWidget
                    data={data.monthlyGrowth.map((m: { month: string; members: number; complaints: number }) => ({
                      label: m.month,
                      members: m.members,
                      complaints: m.complaints,
                    }))}
                    xKey="label"
                    series={[
                      { key: "members", label: t("members"), color: "hsl(var(--govt-blue))" },
                      { key: "complaints", label: t("complaints"), color: "hsl(var(--union-red))" },
                    ]}
                  />
                </CardContent>
              </Card>
            ) : null}

            {branchData?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t("provincePerformance")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChartWidget
                    data={branchData.map((b) => ({ name: b.branchName, value: b.members }))}
                    horizontal
                    height={Math.max(200, branchData.length * 36)}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t("provincePerformance")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("provinceDataUnavailable")}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </PermissionGate>
  );
}

function Mini({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warning" | "success";
}) {
  const colors = {
    default: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/10 text-success",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`rounded-md p-2 ${colors}`}>
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
