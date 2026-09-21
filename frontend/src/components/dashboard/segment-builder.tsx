"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { branchService } from "@/services/branches-service";
import { campaignService } from "@/services/campaigns-service";
import type { CampaignSegment } from "@/types";

export function SegmentBuilder({
  value,
  onChange,
}: {
  value: CampaignSegment;
  onChange: (segment: CampaignSegment) => void;
}) {
  const t = useTranslations("campaigns.segment");
  const [audienceCount, setAudienceCount] = useState<number | null>(null);

  const { data: branches } = useQuery({
    queryKey: ["branches-public"],
    queryFn: () => branchService.list(),
  });

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      campaignService.previewAudience(value).then((count) => {
        if (!cancelled) setAudienceCount(count);
      }).catch(() => {
        if (!cancelled) setAudienceCount(null);
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  const set = (patch: Partial<CampaignSegment>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("branch")}</label>
          <select
            value={value.branchId ?? ""}
            onChange={(e) => set({ branchId: e.target.value || undefined })}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("allBranches")}</option>
            {(branches ?? []).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("tier")}</label>
          <select
            value={value.tier ?? ""}
            onChange={(e) => set({ tier: (e.target.value || undefined) as CampaignSegment["tier"] })}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("allTiers")}</option>
            <option value="STANDARD">Standard</option>
            <option value="LIFETIME">Lifetime</option>
            <option value="HONORARY">Honorary</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("status")}</label>
          <select
            value={value.status ?? ""}
            onChange={(e) => set({ status: (e.target.value || undefined) as CampaignSegment["status"] })}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("tag")}</label>
          <Input
            value={value.tag ?? ""}
            onChange={(e) => set({ tag: e.target.value || undefined })}
            placeholder={t("tagPlaceholder")}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        {audienceCount === null ? t("counting") : t("audienceCount", { count: audienceCount })}
      </div>
    </div>
  );
}
