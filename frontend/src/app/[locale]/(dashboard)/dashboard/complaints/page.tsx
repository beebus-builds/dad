"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { FilterBar } from "@/components/dashboard/filter-bar";
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

  const { data: stats } = useQuery({
    queryKey: ["complaints-stats"],
    queryFn: () => complaintService.stats(),
  });

  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  const columns: DataTableColumn<Complaint>[] = [
    {
      key: "ticket",
      header: t("list.headers.ticket"),
      className: "font-mono text-xs",
      cell: (c) => c.ticketNumber,
    },
    {
      key: "title",
      header: t("list.headers.title"),
      cell: (c) => (
        <Link href={`/dashboard/complaints/${c.id}`} className="font-medium hover:underline">
          {c.title}
        </Link>
      ),
    },
    {
      key: "category",
      header: t("list.headers.category"),
      cell: (c) => (
        <Badge variant="outline">
          {tCategory(c.category as "WAGES" | "WORKING_HOURS" | "SAFETY" | "HARASSMENT" | "TERMINATION" | "BENEFITS" | "OTHER")}
        </Badge>
      ),
    },
    {
      key: "priority",
      header: t("list.headers.priority"),
      cell: (c) => (
        <Badge variant={PRIORITY_VARIANT[c.priority]}>
          {c.priority === "URGENT" && <AlertTriangle className="mr-1 h-3 w-3" />}
          {tPriority(c.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}
        </Badge>
      ),
    },
    {
      key: "status",
      header: t("list.headers.status"),
      cell: (c) => (
        <Badge variant={STATUS_VARIANT[c.status]}>
          {tStatus(c.status as "OPEN" | "IN_REVIEW" | "ESCALATED" | "RESOLVED" | "CLOSED")}
        </Badge>
      ),
    },
    {
      key: "submittedBy",
      header: t("list.headers.submittedBy"),
      className: "text-sm",
      cell: (c) => c.submittedBy?.name ?? "—",
    },
    {
      key: "filed",
      header: t("list.headers.filed"),
      className: "text-sm text-muted-foreground",
      cell: (c) => date(c.createdAt),
    },
  ];

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
                  <TabsTrigger value="all">
                    {t("list.tabs.all")}
                    {typeof total === "number" && total > 0 && (
                      <Badge variant="secondary" className="ml-1.5">{total}</Badge>
                    )}
                  </TabsTrigger>
                  {(["OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED"] as const).map((s) => (
                    <TabsTrigger key={s} value={s}>
                      {tStatus(s)}
                      {!!stats?.[s] && <Badge variant="secondary" className="ml-1.5">{stats[s]}</Badge>}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <FilterBar
                search={search}
                onSearchChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                searchPlaceholder={t("list.search")}
              >
                <Button variant="outline" size="icon" aria-label={t("list.moreFilters")}>
                  <Filter className="h-4 w-4" />
                </Button>
              </FilterBar>
            </div>

            <DataTable
              columns={columns}
              data={items}
              rowKey={(c) => c.id}
              isLoading={isLoading}
              isError={isError}
              errorMessage={(error as ApiError)?.message}
              loadingLabel={t("list.loading")}
              emptyTitle={t("list.noResults")}
              pagination={{
                page,
                totalPages,
                total,
                pageSize: PAGE_SIZE,
                onPageChange: setPage,
                showingLabel: `${tCommon("total")}: ${total}`,
                previousLabel: tCommon("previous"),
                nextLabel: tCommon("next"),
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
