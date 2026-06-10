"use client";

import Link from "next/link";
import { use } from "react";
import { useTranslations } from "next-intl";
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
import { getInitials } from "@/lib/utils";
import { useLocaleFormat } from "@/lib/use-locale-format";
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

const PLACEHOLDER = "—";

export default function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("complaints");
  const tStatus = useTranslations("complaints.status");
  const tPriority = useTranslations("complaints.priority");
  const tCategory = useTranslations("complaints.category");
  const tCommon = useTranslations("common");
  const { dateTime, date } = useLocaleFormat();
  const { id } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => complaintService.detail(id),
    enabled: Boolean(id),
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
              <Link href="/dashboard/complaints">
                <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
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
          description={t("detail.filedBy", {
            name: c.submittedBy?.name ?? t("detail.unknown"),
            date: dateTime(c.createdAt),
          })}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/complaints">
                <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("detail.description")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap">{c.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={PRIORITY_VARIANT[c.priority]}>
                  {c.priority === "URGENT" && <AlertTriangle className="mr-1 h-3 w-3" />}
                  {tPriority(c.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
                </Badge>
                <Badge variant="outline">
                  <Tag className="mr-1 h-3 w-3" /> {tCategory(c.category as "WAGES" | "WORKING_HOURS" | "SAFETY" | "HARASSMENT" | "TERMINATION" | "BENEFITS" | "OTHER")}
                </Badge>
                <Badge variant={STATUS_VARIANT[c.status]}>
                  {tStatus(c.status as "OPEN" | "IN_REVIEW" | "ESCALATED" | "RESOLVED" | "CLOSED")}
                </Badge>
              </div>
              <Separator />
              <h3 className="font-semibold">{t("detail.timeline")}</h3>
              <ul className="space-y-3 text-sm">
                {c.resolvedAt && (
                  <TimelineRow
                    who={t("detail.unknown")}
                    what={t("detail.marked", { status: tStatus(c.status as "OPEN" | "IN_REVIEW" | "ESCALATED" | "RESOLVED" | "CLOSED") })}
                    when={dateTime(c.resolvedAt)}
                  />
                )}
                <TimelineRow
                  who={c.assignedTo?.name ?? t("detail.assignedTo")}
                  when={dateTime(c.updatedAt)}
                  what={
                    c.assignedTo
                      ? t("detail.assignedToName", { name: c.assignedTo.name })
                      : t("detail.awaitingAssignment")
                  }
                />
                <TimelineRow
                  who={c.submittedBy?.name ?? t("detail.member")}
                  when={dateTime(c.createdAt)}
                  what={t("detail.filedComplaint")}
                />
              </ul>
              {c.attachments && c.attachments.length > 0 && (
                <>
                  <Separator />
                  <h3 className="font-semibold">{t("detail.attachments")}</h3>
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
                <h3 className="font-semibold">{t("detail.addUpdate")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("detail.updateHint")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>
                    <MessageSquare className="h-4 w-4" /> {t("detail.postUpdate")}
                  </Button>
                  <Button variant="outline" disabled>
                    <Paperclip className="h-4 w-4" /> {t("detail.attach")}
                  </Button>
                  <PermissionGate permission={PERMISSIONS.COMPLAINTS_RESOLVE} fallback={null}>
                    <Button variant="success" className="ml-auto" disabled>
                      {t("detail.markResolved")}
                    </Button>
                  </PermissionGate>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.assignedTo")}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {c.assignedTo ? getInitials(c.assignedTo.name) : PLACEHOLDER}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {c.assignedTo?.name ?? t("detail.unassigned")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.assignedTo ? t("detail.legalAdvisor") : t("detail.pending")}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.member")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {c.submittedBy?.name ?? PLACEHOLDER}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {t("detail.filed")} {date(c.createdAt)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{tCommon("status")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Info label={t("detail.currentStatus")} value={tStatus(c.status as "OPEN" | "IN_REVIEW" | "ESCALATED" | "RESOLVED" | "CLOSED")} />
                <Info label={t("detail.priority")} value={tPriority(c.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT")} />
                <Info label={t("detail.category")} value={tCategory(c.category as "WAGES" | "WORKING_HOURS" | "SAFETY" | "HARASSMENT" | "TERMINATION" | "BENEFITS" | "OTHER")} />
                <Info label={t("detail.lastUpdated")} value={dateTime(c.updatedAt)} />
                {c.resolvedAt && <Info label={t("detail.resolved")} value={dateTime(c.resolvedAt)} />}
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
