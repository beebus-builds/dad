"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Loader2,
  MapPin,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate, formatDateTime } from "@/lib/utils";
import { incidentService } from "@/services/incidents-service";
import { ApiError } from "@/lib/api-client";
import type { WorkerIncident } from "@/types";

const SEVERITY_VARIANT: Record<
  WorkerIncident["severity"],
  "outline" | "warning" | "destructive"
> = {
  MINOR: "outline",
  MODERATE: "warning",
  SEVERE: "destructive",
  FATAL: "destructive",
};

const STATUS_VARIANT: Record<
  WorkerIncident["status"],
  "secondary" | "warning" | "success"
> = {
  REPORTED: "secondary",
  INVESTIGATING: "warning",
  RESOLVED: "success",
};

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["incidents", { pageSize: 200 }],
    queryFn: () => incidentService.list({ page: 1, pageSize: 200 }),
    enabled: Boolean(id),
  });

  const incident = data?.data.find((i) => i.id === id) ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading incident…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Incident"
          description={`Could not load incident ${id}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/incidents">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as ApiError).message}
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Incident not found"
          description={`No incident with id ${id}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/incidents">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isFatal = incident.severity === "FATAL";

  return (
    <PermissionGate permission={PERMISSIONS.INCIDENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={incident.title}
          description={`${incident.incidentNumber} · ${incident.severity} severity`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/incidents">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />
        {isFatal && (
          <div className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/5 p-4 text-destructive">
            <AlertTriangle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Fatal incident — escalation required</p>
              <p className="text-sm">
                A fatality must be reported to the Department of Labour within 48 hours.
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={SEVERITY_VARIANT[incident.severity]}>
                  {incident.severity === "FATAL" && (
                    <ShieldAlert className="mr-1 h-3 w-3" />
                  )}
                  {incident.severity}
                </Badge>
                <Badge variant={STATUS_VARIANT[incident.status]}>{incident.status}</Badge>
              </div>
              <CardTitle>{incident.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap">{incident.description}</p>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Occurred {formatDateTime(incident.occurredAt)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {incident.location}
                </div>
                {incident.workplaceName && (
                  <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                    <AlertCircle className="h-4 w-4" />
                    Workplace: {incident.workplaceName}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reported by</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {incident.reportedBy?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(incident.occurredAt)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Info label="Severity" value={incident.severity} />
                <Info label="Status" value={incident.status} />
                <Info label="Occurred" value={formatDateTime(incident.occurredAt)} />
                <Info label="Location" value={incident.location} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
