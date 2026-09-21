"use client";

import { use, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, BarChart3, Ban, Loader2, Send } from "lucide-react";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/page-header";
import { CampaignForm } from "@/components/dashboard/campaign-form";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { campaignService, type CampaignPayload } from "@/services/campaigns-service";
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

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("campaigns.detail");
  const tStatus = useTranslations("campaigns.status");
  const tCommon = useTranslations("common");
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [scheduleAt, setScheduleAt] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaignService.detail(id),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: CampaignPayload) => campaignService.update(id, payload),
    onSuccess: () => {
      toast.success(t("updated"));
      invalidate();
    },
    onError: (err: ApiError) => toast.error(err.message || t("updateFailed")),
  });

  const sendMutation = useMutation({
    mutationFn: () => campaignService.send(id),
    onSuccess: () => {
      toast.success(t("sendStarted"));
      invalidate();
    },
    onError: (err: ApiError) => toast.error(err.message || t("sendFailed")),
  });

  const scheduleMutation = useMutation({
    mutationFn: () => campaignService.schedule(id, new Date(scheduleAt).toISOString()),
    onSuccess: () => {
      toast.success(t("scheduled"));
      invalidate();
    },
    onError: (err: ApiError) => toast.error(err.message || t("scheduleFailed")),
  });

  const cancelMutation = useMutation({
    mutationFn: () => campaignService.cancel(id),
    onSuccess: () => {
      toast.success(t("cancelled"));
      invalidate();
    },
    onError: (err: ApiError) => toast.error(err.message || t("cancelFailed")),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {(error as ApiError)?.message}
      </div>
    );
  }

  const c = data;
  const isDraft = c.status === "DRAFT";
  const canCancel = c.status === "DRAFT" || c.status === "SCHEDULED";

  return (
    <PermissionGate permission={PERMISSIONS.CAMPAIGNS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={c.name}
          description={c.subject}
          actions={
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/campaigns/${id}/report`}>
                  <BarChart3 className="h-4 w-4" /> {t("viewReport")}
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/campaigns">
                  <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
                </Link>
              </Button>
            </>
          }
        />

        <Badge variant={STATUS_VARIANT[c.status]}>{tStatus(c.status)}</Badge>

        <PermissionGate permission={PERMISSIONS.CAMPAIGNS_WRITE} fallback={null}>
          {(isDraft || c.status === "SCHEDULED") && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 p-4">
              <Input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="w-56"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => scheduleMutation.mutate()}
                disabled={!scheduleAt || scheduleMutation.isPending}
              >
                {scheduleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("scheduleSend")}
              </Button>
              <Button size="sm" onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
                {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t("sendNow")}
              </Button>
              {canCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  <Ban className="h-4 w-4" /> {t("cancel")}
                </Button>
              )}
            </div>
          )}
        </PermissionGate>

        <CampaignForm
          initial={{ name: c.name, subject: c.subject, body: c.body, segment: c.segment }}
          onSubmit={(payload) => updateMutation.mutate(payload)}
          submitting={updateMutation.isPending}
          readOnly={!isDraft}
        />
      </div>
    </PermissionGate>
  );
}
