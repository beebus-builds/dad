"use client";

import { AlertCircle, AlertTriangle, Plus, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";

const INCIDENTS = [
  {
    id: "i-1",
    incidentNumber: "OSH-2026-091",
    title: "Crane collapse — Construction site",
    severity: "FATAL",
    workplaceName: "Bhairahawa Towers",
    occurredAt: "2026-06-04",
    status: "INVESTIGATING",
  },
  {
    id: "i-2",
    incidentNumber: "OSH-2026-088",
    title: "Chemical burn — Textile factory",
    severity: "SEVERE",
    workplaceName: "Birgunj Mills",
    occurredAt: "2026-05-30",
    status: "REPORTED",
  },
  {
    id: "i-3",
    incidentNumber: "OSH-2026-080",
    title: "Slip and fall",
    severity: "MINOR",
    workplaceName: "Pokhara Hotel",
    occurredAt: "2026-05-18",
    status: "RESOLVED",
  },
];

const SEVERITY_VARIANT = {
  MINOR: "outline",
  MODERATE: "warning",
  SEVERE: "destructive",
  FATAL: "destructive",
} as const;

export default function IncidentsPage() {
  return (
    <PermissionGate permission={PERMISSIONS.INCIDENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="OSH Incidents"
          description="Occupational safety and health incident registry."
          actions={
            <PermissionGate permission={PERMISSIONS.INCIDENTS_WRITE} fallback={null}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Report incident
              </Button>
            </PermissionGate>
          }
        />
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total (YTD)" value={91} icon={Shield} variant="default" />
          <StatCard label="Severe / Fatal" value={14} icon={ShieldAlert} variant="destructive" />
          <StatCard label="Investigating" value={23} icon={AlertCircle} variant="warning" />
          <StatCard label="Resolved" value={54} icon={Shield} variant="success" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Workplace</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INCIDENTS.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs">{i.incidentNumber}</TableCell>
                    <TableCell className="font-medium">{i.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={SEVERITY_VARIANT[i.severity as keyof typeof SEVERITY_VARIANT]}
                      >
                        {i.severity === "FATAL" && <AlertTriangle className="mr-1 h-3 w-3" />}
                        {i.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{i.workplaceName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(i.occurredAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i.status === "RESOLVED"
                            ? "success"
                            : i.status === "INVESTIGATING"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {i.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  variant,
}: {
  label: string;
  value: number;
  icon: typeof Shield;
  variant: "default" | "destructive" | "warning" | "success";
}) {
  const colors = {
    default: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/10 text-success",
  }[variant];
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`rounded-md p-2 ${colors}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
