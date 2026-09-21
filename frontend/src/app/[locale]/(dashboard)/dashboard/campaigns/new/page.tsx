"use client";

import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { CampaignForm } from "@/components/dashboard/campaign-form";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { campaignService, type CampaignPayload } from "@/services/campaigns-service";
import { ApiError } from "@/lib/api-client";

export default function NewCampaignPage() {
  const t = useTranslations("campaigns.new");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CampaignPayload) => campaignService.create(payload),
    onSuccess: (campaign) => {
      toast.success(t("created"));
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      router.push(`/dashboard/campaigns/${campaign.id}`);
    },
    onError: (err: ApiError) => toast.error(err.message || t("createFailed")),
  });

  return (
    <PermissionGate permission={PERMISSIONS.CAMPAIGNS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/campaigns">
                <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
              </Link>
            </Button>
          }
        />
        <CampaignForm onSubmit={(payload) => mutation.mutate(payload)} submitting={mutation.isPending} />
      </div>
    </PermissionGate>
  );
}
