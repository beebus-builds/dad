"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, LineChart, Loader2, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { reportsService } from "@/services/reports-service";
import { ApiError } from "@/lib/api-client";

const PROVINCE_NAMES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

export default function ReportsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reports-dashboard"],
    queryFn: () => reportsService.dashboard(),
  });

  return (
    <PermissionGate permission={PERMISSIONS.REPORTS_VIEW}>
      <div className="space-y-6">
        <PageHeader
          title="Reports &amp; Analytics"
          description="KPI tracking — member growth, complaint resolution, donations and events."
          actions={
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading reports…
          </div>
        ) : isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Failed: {(error as ApiError).message}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatNumber(data.totalMembers)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(data.activeMembers)} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" /> Complaints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatNumber(data.openComplaints)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(data.resolvedComplaints)} resolved
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" /> Donations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {formatCurrency(data.totalDonations, "NPR")}
                  </p>
                  <p className="text-sm text-muted-foreground">total received</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Mini label="Upcoming events" value={data.upcomingEvents} />
              <Mini label="Active legal cases" value={data.activeLegalCases} />
              <Mini
                label="Open complaints"
                value={data.openComplaints}
                tone="warning"
              />
              <Mini label="Resolved complaints" value={data.resolvedComplaints} tone="success" />
            </div>

            {data.monthlyGrowth?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly growth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.monthlyGrowth.map((m) => (
                    <div key={m.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{m.month}</span>
                        <span className="text-muted-foreground tabular-nums">
                          +{m.members} members · {m.complaints} complaints
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
                  <CardTitle>Province performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Monthly growth data is not yet available. Province-level breakdowns
                    require the <code>monthly_growth</code> endpoint which is part of Phase F.
                  </p>
                  <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {PROVINCE_NAMES.map((p) => (
                      <li
                        key={p}
                        className="rounded-md border bg-muted/30 px-3 py-2 text-muted-foreground"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {data.recentActivity?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.recentActivity.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between border-b py-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{a.message}</p>
                        <p className="text-xs text-muted-foreground">{a.type}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
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
          <div className="text-2xl font-bold">{formatNumber(value)}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
