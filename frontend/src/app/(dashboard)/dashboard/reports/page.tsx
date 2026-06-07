"use client";

import { BarChart3, Download, LineChart, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";

export default function ReportsPage() {
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
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Member growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">+4.2%</p>
              <p className="text-sm text-muted-foreground">vs previous month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-4 w-4" /> Avg. complaint resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5.2 days</p>
              <p className="text-sm text-muted-foreground">−0.8 days improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-4 w-4" /> Donation distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">68% recurring</p>
              <p className="text-sm text-muted-foreground">across 12 programmes</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Province performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { p: "Bagmati", members: 38420, growth: 5.2 },
              { p: "Koshi", members: 24110, growth: 3.8 },
              { p: "Madhesh", members: 19880, growth: 4.7 },
              { p: "Lumbini", members: 17520, growth: 6.1 },
              { p: "Gandaki", members: 12330, growth: 2.9 },
              { p: "Sudurpashchim", members: 7220, growth: 3.4 },
              { p: "Karnali", members: 5050, growth: 4.1 },
            ].map((p) => (
              <div key={p.p} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.p}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {p.members.toLocaleString()} members · +{p.growth}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-govt-blue to-union-red"
                    style={{ width: `${(p.members / 40000) * 100}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
