"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Filter, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useLocaleFormat } from "@/lib/use-locale-format";
import { complaintService, type ComplaintListParams } from "@/services/complaints-service";
import { ApiError } from "@/lib/api-client";
import type { Complaint } from "@/types";

const STATUS_VARIANT: Record<Complaint["status"], "secondary" | "warning" | "destructive" | "success"> = {
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

const PAGE_SIZE = 20;

export default function ComplaintsPage() {
  const t = useTranslations("complaints");
  const tStatus = useTranslations("complaints.status");
  const tPriority = useTranslations("complaints.priority");
  const tCategory = useTranslations("complaints.category");
  const tCommon = useTranslations("common");
  const { date } = useLocaleFormat();
  const [tab, setTab] = useState<"all" | Complaint["status"]>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params: ComplaintListParams = {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: tab === "all" ? undefined : tab,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["complaints", params],
    queryFn: () => complaintService.list(params),
  });

  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <PermissionGate permission={PERMISSIONS.COMPLAINTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={t("list.title")}
          description={t("list.subtitle")}
          actions={
            <PermissionGate permission={PERMISSIONS.COMPLAINTS_WRITE} fallback={null}>
              <Button size="sm" asChild>
                <Link href="/dashboard/complaints/new">
                  <Plus className="h-4 w-4" /> {t("list.new")}
                </Link>
              </Button>
            </PermissionGate>
          }
        />
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  setTab(v as typeof tab);
                  setPage(1);
                }}
              >
                <TabsList>
                  <TabsTrigger value="all">{t("list.tabs.all")}</TabsTrigger>
                  <TabsTrigger value="OPEN">{tStatus("OPEN")}</TabsTrigger>
                  <TabsTrigger value="IN_REVIEW">{tStatus("IN_REVIEW")}</TabsTrigger>
                  <TabsTrigger value="ESCALATED">{tStatus("ESCALATED")}</TabsTrigger>
                  <TabsTrigger value="RESOLVED">{tStatus("RESOLVED")}</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex flex-1 gap-2 sm:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t("list.search")}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon" aria-label={t("list.moreFilters")}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("list.loading")}
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {(error as ApiError).message}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("list.headers.ticket")}</TableHead>
                        <TableHead>{t("list.headers.title")}</TableHead>
                        <TableHead>{t("list.headers.category")}</TableHead>
                        <TableHead>{t("list.headers.priority")}</TableHead>
                        <TableHead>{t("list.headers.status")}</TableHead>
                        <TableHead>{t("list.headers.submittedBy")}</TableHead>
                        <TableHead>{t("list.headers.filed")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                            {t("list.noResults")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono text-xs">{c.ticketNumber}</TableCell>
                            <TableCell>
                              <Link
                                href={`/dashboard/complaints/${c.id}`}
                                className="font-medium hover:underline"
                              >
                                {c.title}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{tCategory(c.category as "WAGES" | "WORKING_HOURS" | "SAFETY" | "HARASSMENT" | "TERMINATION" | "BENEFITS" | "OTHER")}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={PRIORITY_VARIANT[c.priority]}>
                                {c.priority === "URGENT" && <AlertTriangle className="mr-1 h-3 w-3" />}
                                {tPriority(c.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={STATUS_VARIANT[c.status]}>
                                {tStatus(c.status as "OPEN" | "IN_REVIEW" | "ESCALATED" | "RESOLVED" | "CLOSED")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {c.submittedBy?.name ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {date(c.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {tCommon("total")}: {total}
                    </span>
                    <div className="flex gap-2">
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
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
