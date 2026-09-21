"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Mail, Plus } from "lucide-react";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { campaignService } from "@/services/campaigns-service";
import { ApiError } from "@/lib/api-client";
import type { Campaign } from "@/types";

const STATUS_VARIANT: Record<Campaign["status"], "secondary" | "warning" | "success" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  SCHEDULED: "warning",
  SENDING: "warning",
  SENT: "success",
  FAILED: "destructive",
  CANCELLED: "outline",
};

const PAGE_SIZE = 20;

export default function CampaignsPage() {
  const t = useTranslations("campaigns.list");
  const tStatus = useTranslations("campaigns.status");
  const tCommon = useTranslations("common");
  const { dateTime } = useLocaleFormat();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["campaigns", { status, page }],
    queryFn: () => campaignService.list({ status: (status || undefined) as Campaign["status"] | undefined, page, pageSize: PAGE_SIZE }),
  });

  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  const columns: DataTableColumn<Campaign>[] = [
    {
      key: "name",
      header: t("headers.name"),
      cell: (c) => (
        <Link href={`/dashboard/campaigns/${c.id}`} className="font-medium hover:underline">
          {c.name}
        </Link>
      ),
    },
    { key: "subject", header: t("headers.subject"), cell: (c) => c.subject },
    {
      key: "segment",
      header: t("headers.segment"),
      cell: (c) => {
        const parts = [c.segment.branchId && t("headers.branchFilter"), c.segment.tier, c.segment.status, c.segment.tag].filter(Boolean);
        return parts.length ? parts.join(" · ") : t("headers.allMembers");
      },
    },
    {
      key: "status",
      header: t("headers.status"),
      cell: (c) => <Badge variant={STATUS_VARIANT[c.status]}>{tStatus(c.status)}</Badge>,
    },
    {
      key: "when",
      header: t("headers.when"),
      className: "text-sm text-muted-foreground",
      cell: (c) => (c.sentAt ? dateTime(c.sentAt) : c.scheduledAt ? dateTime(c.scheduledAt) : "—"),
    },
  ];

  return (
    <PermissionGate permission={PERMISSIONS.CAMPAIGNS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          actions={
            <PermissionGate permission={PERMISSIONS.CAMPAIGNS_WRITE} fallback={null}>
              <Button size="sm" asChild>
                <Link href="/dashboard/campaigns/new">
                  <Plus className="h-4 w-4" /> {t("new")}
                </Link>
              </Button>
            </PermissionGate>
          }
        />
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <FilterBar
              selects={[
                {
                  key: "status",
                  value: status,
                  onChange: (v) => {
                    setStatus(v);
                    setPage(1);
                  },
                  options: [
                    { value: "", label: t("allStatuses") },
                    { value: "DRAFT", label: tStatus("DRAFT") },
                    { value: "SCHEDULED", label: tStatus("SCHEDULED") },
                    { value: "SENDING", label: tStatus("SENDING") },
                    { value: "SENT", label: tStatus("SENT") },
                    { value: "CANCELLED", label: tStatus("CANCELLED") },
                  ],
                },
              ]}
            />
            <DataTable
              columns={columns}
              data={items}
              rowKey={(c) => c.id}
              isLoading={isLoading}
              isError={isError}
              errorMessage={(error as ApiError)?.message}
              loadingLabel={tCommon("loading")}
              emptyIcon={Mail}
              emptyTitle={t("noResults")}
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
