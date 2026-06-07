import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Calendar,
  HandHeart,
  MessageSquareWarning,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const STATS = [
  { label: "Total Members", value: 124530, delta: "+4.2%", trend: "up" as const, icon: Users },
  {
    label: "Open Complaints",
    value: 312,
    delta: "-1.8%",
    trend: "down" as const,
    icon: MessageSquareWarning,
  },
  { label: "Upcoming Events", value: 27, delta: "+12%", trend: "up" as const, icon: Calendar },
  {
    label: "Donations (MTD)",
    value: 1850000,
    currency: true,
    delta: "+18%",
    trend: "up" as const,
    icon: HandHeart,
  },
];

const ACTIVITY = [
  { id: 1, type: "complaint", message: "New complaint #CMP-2104 — Wage dispute, Sunsari branch", time: "12 min ago" },
  { id: 2, type: "member", message: "245 new members onboarded in Bagmati Province", time: "1 hour ago" },
  { id: 3, type: "event", message: "OSH Workshop registration crossed 320 attendees", time: "3 hours ago" },
  { id: 4, type: "legal", message: "Foreign Employment case #LEG-3322 marked Resolved", time: "Yesterday" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operations Overview</h1>
          <p className="text-sm text-muted-foreground">
            A real-time pulse of the union — membership, complaints, events and finance.
          </p>
        </div>
        <Badge variant="success">Live</Badge>
      </header>

      <section
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {s.currency ? formatCurrency(s.value) : formatNumber(s.value)}
              </div>
              <p
                className={`mt-1 flex items-center gap-1 text-xs ${
                  s.trend === "up" ? "text-success" : "text-destructive"
                }`}
              >
                {s.trend === "up" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {s.delta} vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Member Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {ACTIVITY.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <div className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">{a.message}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <a
              href="/dashboard/reports"
              className="text-sm font-medium text-primary hover:underline"
            >
              View full activity log →
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function GrowthChart() {
  const data = [
    { month: "Jan", value: 60 },
    { month: "Feb", value: 75 },
    { month: "Mar", value: 80 },
    { month: "Apr", value: 95 },
    { month: "May", value: 110 },
    { month: "Jun", value: 130 },
  ];
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="h-56 flex items-end gap-3" role="img" aria-label="Monthly member growth">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t bg-gradient-to-t from-govt-blue to-union-red transition-all"
            style={{ height: `${(d.value / max) * 100}%` }}
            aria-hidden
          />
          <span className="text-xs text-muted-foreground">{d.month}</span>
        </div>
      ))}
    </div>
  );
}
