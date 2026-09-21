"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PieChartWidget } from "@/components/dashboard/charts/pie-chart";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { campaignService } from "@/services/campaigns-service";
import { ApiError } from "@/lib/api-client";
import type { Campaign, CampaignRecipient } from "@/types";

const RECIPIENT_STATUS_VARIANT: Record<CampaignRecipient["status"], "secondary" | "success" | "destructive" | "warning"> = {
  PENDING: "secondary",
  SENT: "success",
  FAILED: "destructive",
  BOUNCED: "warning",
};

const PAGE_SIZE = 25;

export default function CampaignReportPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("campaigns.detail");
  const tCommon = useTranslations("common");
  const { dateTime } = useLocaleFormat();
  const { id } = use(params);
  const [page, setPage] = useState(1);

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaignService.detail(id),
    enabled: Boolean(id),
  });

  const { data: stats } = useQuery({
    queryKey: ["campaign-stats", id],
    queryFn: () => campaignService.stats(id),
    enabled: Boolean(id),
    refetchInterval: campaign && (campaign.status === "SENDING" || campaign.status === "SCHEDULED") ? 5000 : false,
  });

  const { data: recipientsData, isLoading, isError, error } = useQuery({
    queryKey: ["campaign-recipients", id, page],
    queryFn: () => campaignService.recipients(id, { page, pageSize: PAGE_SIZE }),
    enabled: Boolean(id),
  });

  const items = recipientsData?.data ?? [];
  const total = recipientsData?.pagination.total ?? 0;
  const totalPages = recipientsData?.pagination.totalPages ?? 1;

  const columns: DataTableColumn<CampaignRecipient>[] = [
    { key: "email", header: t("recipients.email"), cell: (r) => r.email },
    {
      key: "status",
      header: tCommon("status"),
      cell: (r) => <Badge variant={RECIPIENT_STATUS_VARIANT[r.status]}>{r.status}</Badge>,
    },
    {
      key: "sentAt",
      header: t("recipients.sentAt"),
      className: "text-sm text-muted-foreground",
      cell: (r) => (r.sentAt ? dateTime(r.sentAt) : "—"),
    },
    {
      key: "error",
      header: t("recipients.error"),
      className: "text-xs text-destructive",
      cell: (r) => r.error ?? "—",
    },
  ];

  const pieData = stats
    ? [
        { name: t("recipients.sent"), value: stats.sent, color: "hsl(var(--success))" },
        { name: t("recipients.pending"), value: stats.pending, color: "hsl(var(--muted-foreground))" },
        { name: t("recipients.failed"), value: stats.failed, color: "hsl(var(--destructive))" },
        { name: t("recipients.bounced"), value: stats.bounced, color: "hsl(var(--warning))" },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <PermissionGate permission={PERMISSIONS.CAMPAIGNS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={campaignLoading ? "…" : (campaign?.name ?? "")}
          description={t("reportSubtitle")}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/campaigns/${id}`}>
                <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
              </Link>
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t("recipients.delivery")}</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <PieChartWidget data={pieData} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">{tCommon("loading")}</p>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            <StatTile label={t("recipients.total")} value={stats?.total} />
            <StatTile label={t("recipients.sent")} value={stats?.sent} />
            <StatTile label={t("recipients.failed")} value={stats?.failed} />
            <StatTile label={t("recipients.pending")} value={stats?.pending} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("recipients.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={items}
              rowKey={(r) => r.id}
              isLoading={isLoading}
              isError={isError}
              errorMessage={(error as ApiError)?.message}
              loadingLabel={tCommon("loading")}
              emptyIcon={Mail}
              emptyTitle={t("recipients.none")}
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

function StatTile({ label, value }: { label: string; value?: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold">{value ?? "—"}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
