"use client";

import Link from "next/link";
import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Pencil,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { eventService } from "@/services/events-service";
import { ApiError } from "@/lib/api-client";
import type { Event } from "@/types";

type EventStatus = Event["status"];

const STATUS_VARIANT: Record<
  EventStatus,
  "secondary" | "success" | "destructive" | "warning"
> = {
  DRAFT: "secondary",
  PUBLISHED: "success",
  CANCELLED: "destructive",
  COMPLETED: "warning",
};

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("eventsAdmin");
  const tStatus = useTranslations("eventsAdmin.status");
  const tCategory = useTranslations("eventsAdmin.list.categories");
  const tCommon = useTranslations("common");
  const { dateTime, date } = useLocaleFormat();
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventService.detail(id),
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Event>) => eventService.update(id, payload),
    onSuccess: () => {
      toast.success(t("detail.updated"));
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventService.remove(id),
    onSuccess: () => {
      toast.success(t("detail.deleted"));
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title={t("list.title")}
          description={id}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/events">
                <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
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
  const e = data;

  const pct =
    e.capacity && e.capacity > 0
      ? Math.min(100, Math.round((e.registeredCount / e.capacity) * 100))
      : 0;

  return (
    <PermissionGate permission={PERMISSIONS.EVENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={e.title}
          description={e.titleNepali || e.title}
          actions={
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/events">
                  <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
                </Link>
              </Button>
              <PermissionGate permission={PERMISSIONS.EVENTS_WRITE} fallback={null}>
                <Button variant="outline" size="sm" disabled>
                  <Pencil className="h-4 w-4" /> {t("detail.editEvent")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(t("detail.deleteEvent"))) deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" /> {t("detail.deleteEvent")}
                </Button>
              </PermissionGate>
            </>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="h-40 gradient-union" aria-hidden />
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="govt">{tCategory(e.category as "MEETING" | "RALLY" | "TRAINING" | "WORKSHOP" | "CONFERENCE" | "OTHER")}</Badge>
                <Badge variant={STATUS_VARIANT[e.status]}>{tStatus(e.status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED")}</Badge>
                {e.branchId && <Badge variant="outline">{e.branchId}</Badge>}
              </div>
              <CardTitle>{e.title}</CardTitle>
              {e.titleNepali && (
                <p className="font-devanagari text-sm text-muted-foreground">{e.titleNepali}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap">{e.description}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {dateTime(e.startsAt)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t("detail.until", { date: dateTime(e.endsAt) })}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {e.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  {t("detail.slug")}: <span className="font-mono text-xs">{e.slug}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.registration")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("detail.registered")}</span>
                  <span className="font-medium">
                    {e.registeredCount} {e.capacity ? `/ ${e.capacity}` : ""}
                  </span>
                </div>
                {e.capacity ? (
                  <div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-govt-blue to-union-red"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t("detail.capacityUsed", { pct })}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t("detail.unlimited")}</p>
                )}
                <Button className="w-full" disabled>
                  <Users className="h-4 w-4" /> {t("detail.viewRegistrations")}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.statusControls")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <PermissionGate permission={PERMISSIONS.EVENTS_PUBLISH} fallback={null}>
                  <Button
                    className="w-full"
                    variant={e.status === "PUBLISHED" ? "outline" : "default"}
                    disabled={updateMutation.isPending || e.status === "PUBLISHED"}
                    onClick={() => updateMutation.mutate({ status: "PUBLISHED" })}
                  >
                    {e.status === "PUBLISHED" ? t("detail.published") : t("detail.publish")}
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    disabled={updateMutation.isPending || e.status === "CANCELLED"}
                    onClick={() => updateMutation.mutate({ status: "CANCELLED" })}
                  >
                    {t("detail.cancel")}
                  </Button>
                </PermissionGate>
                <p className="text-xs text-muted-foreground">
                  {date(e.startsAt)} – {date(e.endsAt)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
