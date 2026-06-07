"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gavel, Loader2, Plus, Scale } from "lucide-react";
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
import { legalService, type LegalListParams } from "@/services/legal-service";
import { ApiError } from "@/lib/api-client";

const TYPE_LABELS: Record<string, string> = {
  FOREIGN_EMPLOYMENT: "Foreign Employment",
  LABOR_DISPUTE: "Labour Dispute",
  OSH: "Occupational Safety",
  COLLECTIVE_BARGAINING: "Collective Bargaining",
  OTHER: "Other",
};

const STATUS_VARIANT: Record<string, "warning" | "destructive" | "secondary" | "success"> = {
  INTAKE: "secondary",
  ACTIVE: "warning",
  HEARING: "destructive",
  RESOLVED: "success",
  CLOSED: "secondary",
};

export default function LegalCasesPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const params: LegalListParams = {
    page,
    pageSize: 50,
    status: (statusFilter as never) || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["legal", params],
    queryFn: () => legalService.list(params),
  });

  const items = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const activeCount = items.filter((c) => c.status === "ACTIVE").length;
  const hearingCount = items.filter((c) => c.status === "HEARING").length;
  const resolvedCount = items.filter((c) => c.status === "RESOLVED").length;
  const intakeCount = items.filter((c) => c.status === "INTAKE").length;

  return (
    <PermissionGate permission={PERMISSIONS.LEGAL_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Legal Cases"
          description="Track foreign employment, OSH, bargaining and labour dispute cases."
          actions={
            <>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All statuses</option>
                <option value="INTAKE">Intake</option>
                <option value="ACTIVE">Active</option>
                <option value="HEARING">Hearing</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <PermissionGate permission={PERMISSIONS.LEGAL_WRITE} fallback={null}>
                <Button size="sm" asChild>
                  <Link href="/dashboard/legal-cases/new">
                    <Plus className="h-4 w-4" /> New case
                  </Link>
                </Button>
              </PermissionGate>
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Active" value={activeCount} icon={Scale} />
          <Stat label="In Hearing" value={hearingCount} icon={Gavel} />
          <Stat label="Resolved" value={resolvedCount} icon={Scale} />
          <Stat label="Intake" value={intakeCount} icon={Scale} />
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
                    <TableHead>Case #</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Advisor</TableHead>
                    <TableHead>Next Hearing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                        No cases found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.caseNumber}</TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/legal-cases/${c.id}`}
                            className="font-medium hover:underline"
                          >
                            {c.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{TYPE_LABELS[c.type] ?? c.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[c.status]}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{c.memberName ?? "—"}</TableCell>
                        <TableCell className="text-sm">
                          {c.assignedAdvisor?.name ?? "Unassigned"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.nextHearingAt ? formatDate(c.nextHearingAt) : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        {totalPages > 1 && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Scale;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
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
