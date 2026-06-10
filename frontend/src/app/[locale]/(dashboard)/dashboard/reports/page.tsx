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

export default function ReportsPage() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const { number, currency } = useLocaleFormat();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports-dashboard"],
    queryFn: () => reportsService.dashboard(),
  });

  return (
    <PermissionGate permission={PERMISSIONS.REPORTS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          actions={
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" /> {t("exportPdf") || "Export PDF"}
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
                    <BarChart3 className="h-4 w-4" /> {t("members") || "Members"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{number(data.totalMembers)}</p>
                  <p className="text-sm text-muted-foreground">
                    {number(data.activeMembers)} {t("active") || "active"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" /> {t("complaints") || "Complaints"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{number(data.openComplaints)}</p>
                  <p className="text-sm text-muted-foreground">
                    {number(data.resolvedComplaints)} {t("resolved") || "resolved"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" /> {t("donations") || "Donations"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{currency(data.totalDonations, "NPR")}</p>
                  <p className="text-sm text-muted-foreground">{t("totalReceived") || "total received"}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Mini label={t("upcomingEvents") || "Upcoming events"} value={data.upcomingEvents} />
              <Mini label={t("activeLegal") || "Active legal cases"} value={data.activeLegalCases} />
              <Mini label={t("openComplaints") || "Open complaints"} value={data.openComplaints} tone="warning" />
              <Mini label={t("resolvedComplaints") || "Resolved complaints"} value={data.resolvedComplaints} tone="success" />
            </div>

            {data.monthlyGrowth?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t("monthlyGrowth") || "Monthly growth"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.monthlyGrowth.map((m: { month: string; members: number; complaints: number }) => (
                    <div key={m.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{m.month}</span>
                        <span className="text-muted-foreground tabular-nums">
                          +{m.members} {t("members") || "members"} · {m.complaints} {t("complaints") || "complaints"}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-to-r from-govt-blue to-union-red"
                          style={{ width: `${Math.min(100, m.members * 2)}%` }}
                          aria-hidden
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t("provincePerformance") || "Province performance"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t("provinceDataUnavailable") || "Monthly growth data is not yet available."}
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
