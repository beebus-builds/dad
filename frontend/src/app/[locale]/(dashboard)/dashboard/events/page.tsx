"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Plus, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { eventService, type EventListParams } from "@/services/events-service";
import { ApiError } from "@/lib/api-client";
import type { Event } from "@/types";

type EventStatus = Event["status"];

const PAGE_SIZE = 20;

export default function EventsDashboardPage() {
  const t = useTranslations("eventsAdmin");
  const tStatus = useTranslations("eventsAdmin.status");
  const tCategory = useTranslations("eventsAdmin.list.categories");
  const tCommon = useTranslations("common");
  const { date } = useLocaleFormat();
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params: EventListParams = {
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", params],
    queryFn: () => eventService.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventService.remove(id),
    onSuccess: () => {
      toast.success(t("detail.deleted"));
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const events = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <PermissionGate permission={PERMISSIONS.EVENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={t("list.title")}
          description={t("list.subtitle")}
          actions={
            <>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as EventStatus | "");
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t("list.allStatuses")}</option>
                <option value="DRAFT">{tStatus("DRAFT")}</option>
                <option value="PUBLISHED">{tStatus("PUBLISHED")}</option>
                <option value="CANCELLED">{tStatus("CANCELLED")}</option>
                <option value="COMPLETED">{tStatus("COMPLETED")}</option>
              </select>
              <PermissionGate permission={PERMISSIONS.EVENTS_WRITE} fallback={null}>
                <Button size="sm" asChild>
                  <Link href="/dashboard/events/new">
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
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">{t("list.empty")}</h3>
              <p className="text-sm text-muted-foreground">{t("list.emptyDesc")}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((e) => {
                const pct =
                  e.capacity && e.capacity > 0
                    ? Math.min(100, Math.round((e.registeredCount / e.capacity) * 100))
                    : 0;
                return (
                  <Card key={e.id} className="overflow-hidden">
                    <div className="h-28 gradient-union" aria-hidden />
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="govt">{tCategory(e.category as "MEETING" | "RALLY" | "TRAINING" | "WORKSHOP" | "CONFERENCE" | "OTHER")}</Badge>
                        <Badge variant={e.status === "PUBLISHED" ? "success" : "secondary"}>
                          {tStatus(e.status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED")}
                        </Badge>
                      </div>
                      <h3 className="line-clamp-2 font-semibold">{e.title}</h3>
                      {e.titleNepali && (
                        <p className="font-devanagari text-sm text-muted-foreground">
                          {e.titleNepali}
                        </p>
                      )}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" /> {date(e.startsAt)}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" /> {e.location}
                        </div>
                        {e.capacity ? (
                          <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3 w-3" /> {t("list.registered", { count: e.registeredCount, capacity: e.capacity })}
                              </span>
                              <span className="font-medium">{pct}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-gradient-to-r from-govt-blue to-union-red"
                                style={{ width: `${pct}%` }}
                                aria-hidden
                              />
                            </div>
                          </div>
                        ) : null}
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/dashboard/events/${e.id}`}>{t("list.manage")}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
          </>
        )}
      </div>
    </PermissionGate>
  );
}
