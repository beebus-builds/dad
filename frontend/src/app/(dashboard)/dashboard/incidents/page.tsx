"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, Loader2, Plus, Shield, ShieldAlert } from "lucide-react";
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
import { incidentService, type IncidentListParams } from "@/services/incidents-service";
import { ApiError } from "@/lib/api-client";

const SEVERITY_VARIANT = {
  MINOR: "outline",
  MODERATE: "warning",
  SEVERE: "destructive",
  FATAL: "destructive",
} as const;

const STATUS_VARIANT = {
  REPORTED: "secondary",
  INVESTIGATING: "warning",
  RESOLVED: "success",
} as const;

export default function IncidentsPage() {
  const params: IncidentListParams = { page: 1, pageSize: 100 };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["incidents", params],
    queryFn: () => incidentService.list(params),
  });

  const items = data?.data ?? [];
  const totalCount = items.length;
  const severeCount = items.filter((i) => i.severity === "SEVERE" || i.severity === "FATAL").length;
  const investigatingCount = items.filter((i) => i.status === "INVESTIGATING").length;
  const resolvedCount = items.filter((i) => i.status === "RESOLVED").length;

  return (
    <PermissionGate permission={PERMISSIONS.INCIDENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="OSH Incidents"
          description="Occupational safety and health incident registry."
          actions={
            <PermissionGate permission={PERMISSIONS.INCIDENTS_WRITE} fallback={null}>
              <Button size="sm" asChild>
                <Link href="/dashboard/incidents/new">
                  <Plus className="h-4 w-4" /> Report incident
                </Link>
              </Button>
            </PermissionGate>
          }
        />
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={totalCount} icon={Shield} variant="default" />
          <StatCard label="Severe / Fatal" value={severeCount} icon={ShieldAlert} variant="destructive" />
          <StatCard label="Investigating" value={investigatingCount} icon={AlertCircle} variant="warning" />
          <StatCard label="Resolved" value={resolvedCount} icon={Shield} variant="success" />
        </div>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Failed: {(error as ApiError).message}
              </div>
            ) : (
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
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No incidents reported
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((i) => (
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
                        <TableCell className="text-sm">{i.workplaceName ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(i.occurredAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={STATUS_VARIANT[i.status as keyof typeof STATUS_VARIANT]}
                          >
                            {i.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
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
