"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { trainingService } from "@/services/training-service";
import { ApiError } from "@/lib/api-client";
import type { TrainingProgram } from "@/types";

type TrainingStatus = TrainingProgram["status"];

const STATUS_VARIANT: Record<TrainingStatus, "secondary" | "warning" | "success"> = {
  UPCOMING: "secondary",
  ONGOING: "warning",
  COMPLETED: "success",
};

export default function TrainingPage() {
  const t = useTranslations("training");
  const tStatus = useTranslations("training.status");
  const tCommon = useTranslations("common");
  const { date } = useLocaleFormat();
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | "">("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["training", { page, statusFilter }],
    queryFn: () =>
      trainingService.list({
        page,
        pageSize: 50,
        status: statusFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trainingService.remove(id),
    onSuccess: () => {
      toast.success(t("list.deleted"));
      queryClient.invalidateQueries({ queryKey: ["training"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const items = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <PermissionGate permission={PERMISSIONS.TRAINING_READ}>
      <div className="space-y-6">
        <PageHeader
          title={t("list.title")}
          description={t("list.subtitle")}
          actions={
            <>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as TrainingStatus | "");
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t("list.allStatuses")}</option>
                <option value="UPCOMING">{tStatus("UPCOMING")}</option>
                <option value="ONGOING">{tStatus("ONGOING")}</option>
                <option value="COMPLETED">{tStatus("COMPLETED")}</option>
              </select>
              <PermissionGate permission={PERMISSIONS.TRAINING_WRITE} fallback={null}>
                <Button size="sm" asChild>
                  <Link href="/dashboard/training/new">
                    <Plus className="h-4 w-4" /> {t("list.new")}
                  </Link>
                </Button>
              </PermissionGate>
            </>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("list.loading")}
          </div>
        ) : isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(error as ApiError).message}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="mb-2 h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">{t("list.noResults")}</h3>
              <p className="text-sm text-muted-foreground">{t("list.noResultsDesc")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => {
              const pct =
                p.capacity && p.capacity > 0
                  ? Math.min(100, Math.round((p.registeredCount / p.capacity) * 100))
                  : 0;
              return (
                <Card key={p.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <Badge variant={STATUS_VARIANT[p.status]}>{tStatus(p.status as TrainingStatus)}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{p.title}</CardTitle>
                    {p.titleNepali && (
                      <p className="font-devanagari text-sm text-muted-foreground">{p.titleNepali}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div>📍 {p.location}</div>
                    <div>🗓 {date(p.startsAt)} – {date(p.endsAt)}</div>
                    {p.capacity ? (
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span>{t("list.registered", { count: p.registeredCount, capacity: p.capacity })}</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} aria-hidden />
                        </div>
                      </div>
                    ) : null}
                    <PermissionGate permission={PERMISSIONS.TRAINING_WRITE} fallback={null}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(t("list.removeConfirm"))) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> {t("list.headers.remove")}
                      </Button>
                    </PermissionGate>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              {tCommon("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              {tCommon("next")}
            </Button>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
