"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Loader2,
  MessageSquare,
  Paperclip,
  Tag,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { complaintService } from "@/services/complaints-service";
import { ApiError } from "@/lib/api-client";
import type { Complaint } from "@/types";

const STATUS_VARIANT: Record<
  Complaint["status"],
  "warning" | "secondary" | "destructive" | "success"
> = {
  OPEN: "warning",
  IN_REVIEW: "secondary",
  ESCALATED: "destructive",
  RESOLVED: "success",
  CLOSED: "secondary",
};

const PRIORITY_VARIANT: Record<Complaint["priority"], "outline" | "warning" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "outline",
  HIGH: "warning",
  URGENT: "destructive",
};

export default function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => complaintService.detail(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading complaint…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Complaint"
          description={`Could not load complaint ${id}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/complaints">
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
    <PermissionGate permission={PERMISSIONS.COMPLAINTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={`${c.ticketNumber} · ${c.title}`}
          description={`Filed by ${c.submittedBy?.name ?? "Unknown"} on ${formatDateTime(c.createdAt)}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/complaints">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap">{c.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={PRIORITY_VARIANT[c.priority]}>
                  {c.priority === "URGENT" && <AlertTriangle className="mr-1 h-3 w-3" />}
                  {c.priority}
                </Badge>
                <Badge variant="outline">
                  <Tag className="mr-1 h-3 w-3" /> {c.category.replace("_", " ")}
                </Badge>
                <Badge variant={STATUS_VARIANT[c.status]}>
                  {c.status.replace("_", " ")}
                </Badge>
              </div>
              <Separator />
              <h3 className="font-semibold">Timeline</h3>
              <ul className="space-y-3 text-sm">
                {c.resolvedAt && (
                  <TimelineRow
                    who="System"
                    what={`Marked as ${c.status.toLowerCase()}`}
                    when={formatDateTime(c.resolvedAt)}
                  />
                )}
                <TimelineRow
                  who={c.assignedTo?.name ?? "Branch Admin"}
                  what={
                    c.assignedTo
                      ? `Assigned to ${c.assignedTo.name}`
                      : "Awaiting assignment"
                  }
                  when={formatDateTime(c.updatedAt)}
                />
                <TimelineRow
                  who={c.submittedBy?.name ?? "Member"}
                  what="Filed complaint"
                  when={formatDateTime(c.createdAt)}
                />
              </ul>
              {c.attachments && c.attachments.length > 0 && (
                <>
                  <Separator />
                  <h3 className="font-semibold">Attachments</h3>
                  <ul className="space-y-2 text-sm">
                    {c.attachments.map((a) => (
                      <li key={a.id} className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {a.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Add update</h3>
                <p className="text-xs text-muted-foreground">
                  Comment posting and resolution workflows will be wired to the backend in a
                  follow-up update.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>
                    <MessageSquare className="h-4 w-4" /> Post update
                  </Button>
                  <Button variant="outline" disabled>
                    <Paperclip className="h-4 w-4" /> Attach file
                  </Button>
                  <PermissionGate permission={PERMISSIONS.COMPLAINTS_RESOLVE} fallback={null}>
                    <Button variant="success" className="ml-auto" disabled>
                      Mark Resolved
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned To</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {c.assignedTo ? getInitials(c.assignedTo.name) : "—"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {c.assignedTo?.name ?? "Unassigned"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.assignedTo ? "Legal advisor" : "Pending assignment"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {c.submittedBy?.name ?? "—"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Filed {formatDate(c.createdAt)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Info label="Current status" value={c.status.replace("_", " ")} />
                <Info label="Priority" value={c.priority} />
                <Info label="Category" value={c.category.replace("_", " ")} />
                <Info label="Last updated" value={formatDateTime(c.updatedAt)} />
                {c.resolvedAt && <Info label="Resolved" value={formatDateTime(c.resolvedAt)} />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

function TimelineRow({ who, what, when }: { who: string; what: string; when: string }) {
  return (
    <li className="flex gap-3">
      <div className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
      <div>
        <p className="text-sm">
          <span className="font-medium">{who}</span> · {what}
        </p>
        <p className="text-xs text-muted-foreground">{when}</p>
      </div>
    </li>
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
