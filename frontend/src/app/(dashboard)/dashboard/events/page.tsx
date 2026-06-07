"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Plus, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { eventService, type EventListParams } from "@/services/events-service";
import { ApiError } from "@/lib/api-client";

export default function EventsDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params: EventListParams = {
    page,
    pageSize: 20,
    status: (statusFilter as never) || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", params],
    queryFn: () => eventService.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventService.remove(id),
    onSuccess: () => {
      toast.success("Event deleted");
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
          title="Events"
          description="Plan, publish and monitor union events across Nepal."
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
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <PermissionGate permission={PERMISSIONS.EVENTS_WRITE} fallback={null}>
                <Button size="sm" asChild>
                  <Link href="/dashboard/events/new">
                    <Plus className="h-4 w-4" /> Create Event
                  </Link>
                </Button>
              </PermissionGate>
            </>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading events…
          </div>
        ) : isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Failed to load events: {(error as ApiError).message}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
              <h3 className="font-medium">No events yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first event to start building the calendar.
              </p>
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
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="govt">{e.category}</Badge>
                        <Badge variant={e.status === "PUBLISHED" ? "success" : "secondary"}>
                          {e.status}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2">{e.title}</CardTitle>
                      {e.titleNepali && (
                        <p className="font-devanagari text-sm text-muted-foreground">
                          {e.titleNepali}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" /> {formatDate(e.startsAt)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {e.location}
                      </div>
                      {e.capacity ? (
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-3 w-3" /> {e.registeredCount} / {e.capacity}
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
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" asChild>
                          <Link href={`/dashboard/events/${e.id}`}>Manage</Link>
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
          </>
        )}
      </div>
    </PermissionGate>
  );
}
