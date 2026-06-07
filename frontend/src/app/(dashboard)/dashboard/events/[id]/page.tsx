"use client";

import Link from "next/link";
import { use } from "react";
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
import { formatDate, formatDateTime } from "@/lib/utils";
import { eventService } from "@/services/events-service";
import { ApiError } from "@/lib/api-client";
import type { Event } from "@/types";

const STATUS_VARIANT: Record<
  Event["status"],
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
      toast.success("Event updated");
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventService.remove(id),
    onSuccess: () => {
      toast.success("Event deleted");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading event…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Event"
          description={`Could not load event ${id}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/events">
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
          description={e.titleNepali || "Event details"}
          actions={
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/events">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
              </Button>
              <PermissionGate permission={PERMISSIONS.EVENTS_WRITE} fallback={null}>
                <Button variant="outline" size="sm" disabled>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Delete this event?")) deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" /> Delete
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
                <Badge variant="govt">{e.category}</Badge>
                <Badge variant={STATUS_VARIANT[e.status]}>{e.status}</Badge>
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
                  {formatDateTime(e.startsAt)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Until {formatDateTime(e.endsAt)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {e.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Slug: <span className="font-mono text-xs">{e.slug}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Registered</span>
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
                    <p className="mt-1 text-xs text-muted-foreground">{pct}% capacity used</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Unlimited capacity</p>
                )}
                <Button className="w-full" disabled>
                  <Users className="h-4 w-4" /> View registrations
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <PermissionGate permission={PERMISSIONS.EVENTS_PUBLISH} fallback={null}>
                  <Button
                    className="w-full"
                    variant={e.status === "PUBLISHED" ? "outline" : "default"}
                    disabled={updateMutation.isPending || e.status === "PUBLISHED"}
                    onClick={() => updateMutation.mutate({ status: "PUBLISHED" })}
                  >
                    {e.status === "PUBLISHED" ? "Published" : "Publish"}
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    disabled={updateMutation.isPending || e.status === "CANCELLED"}
                    onClick={() => updateMutation.mutate({ status: "CANCELLED" })}
                  >
                    Cancel event
                  </Button>
                </PermissionGate>
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.startsAt)} – {formatDate(e.endsAt)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
