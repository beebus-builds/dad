"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Gavel,
  Loader2,
  Scale,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate, formatDateTime } from "@/lib/utils";
import { legalService } from "@/services/legal-service";
import { ApiError } from "@/lib/api-client";
import type { LegalCase } from "@/types";

const TYPE_LABELS: Record<LegalCase["type"], string> = {
  FOREIGN_EMPLOYMENT: "Foreign Employment",
  LABOR_DISPUTE: "Labour Dispute",
  OSH: "Occupational Safety",
  COLLECTIVE_BARGAINING: "Collective Bargaining",
  OTHER: "Other",
};

const STATUS_VARIANT: Record<
  LegalCase["status"],
  "secondary" | "warning" | "destructive" | "success"
> = {
  INTAKE: "secondary",
  ACTIVE: "warning",
  HEARING: "destructive",
  RESOLVED: "success",
  CLOSED: "secondary",
};

export default function LegalCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["legal-case", id],
    queryFn: () => legalService.detail(id),
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { status?: LegalCase["status"] }) =>
      legalService.update(id, payload),
    onSuccess: () => {
      toast.success("Case updated");
      queryClient.invalidateQueries({ queryKey: ["legal-case", id] });
      queryClient.invalidateQueries({ queryKey: ["legal"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading case…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Legal case"
          description={`Could not load case ${id}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/legal-cases">
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

  if (!data) return null;
  const c = data;

  return (
    <PermissionGate permission={PERMISSIONS.LEGAL_READ}>
      <div className="space-y-6">
        <PageHeader
          title={c.title}
          description={`${c.caseNumber} · ${TYPE_LABELS[c.type]}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/legal-cases">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{TYPE_LABELS[c.type]}</Badge>
                <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
              </div>
              <CardTitle>{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap">{c.description}</p>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Filed {formatDate(c.filedAt)}
                </div>
                {c.nextHearingAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gavel className="h-4 w-4" />
                    Next hearing {formatDateTime(c.nextHearingAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advisor</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {c.assignedAdvisor?.name ?? "Unassigned"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.assignedAdvisor ? "Legal advisor" : "Awaiting assignment"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {c.memberName ?? "—"}
                </div>
                {c.memberId && (
                  <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                    <Link href={`/dashboard/members/${c.memberId}`}>View member</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Info label="Current" value={c.status} />
                <Info label="Filed" value={formatDate(c.filedAt)} />
                {c.nextHearingAt && (
                  <Info label="Next hearing" value={formatDateTime(c.nextHearingAt)} />
                )}
                <PermissionGate permission={PERMISSIONS.LEGAL_WRITE} fallback={null}>
                  <div className="space-y-2 pt-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={updateMutation.isPending || c.status === "RESOLVED"}
                      onClick={() => updateMutation.mutate({ status: "RESOLVED" })}
                    >
                      Mark Resolved
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      disabled={updateMutation.isPending || c.status === "CLOSED"}
                      onClick={() => updateMutation.mutate({ status: "CLOSED" })}
                    >
                      Close case
                    </Button>
                  </div>
                </PermissionGate>
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
