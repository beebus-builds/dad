"use client";

import {
  Bell,
  Calendar,
  Gavel,
  GraduationCap,
  HandHeart,
  Loader2,
  MessageSquareWarning,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { memberService } from "@/services/members-service";
import { useLocaleFormat } from "@/lib/use-locale-format";
import type { TimelineEventType } from "@/types";

const TYPE_ICON: Record<TimelineEventType, LucideIcon> = {
  COMPLAINT: MessageSquareWarning,
  DONATION: HandHeart,
  EVENT: Calendar,
  TRAINING: GraduationCap,
  LEGAL_CASE: Gavel,
  NOTIFICATION: Bell,
  COMMUNICATION_LOG: Phone,
};

const TYPE_COLOR: Record<TimelineEventType, string> = {
  COMPLAINT: "bg-warning/15 text-warning",
  DONATION: "bg-success/15 text-success",
  EVENT: "bg-primary/15 text-primary",
  TRAINING: "bg-purple-500/15 text-purple-600",
  LEGAL_CASE: "bg-destructive/15 text-destructive",
  NOTIFICATION: "bg-muted text-muted-foreground",
  COMMUNICATION_LOG: "bg-govt-blue/15 text-govt-blue",
};

export function MemberTimeline({ memberId }: { memberId: string }) {
  const t = useTranslations("members.timeline");
  const tCommon = useTranslations("common");
  const { dateTime } = useLocaleFormat();

  const { data, isLoading } = useQuery({
    queryKey: ["member-timeline", memberId],
    queryFn: () => memberService.timeline(memberId, { pageSize: 30 }),
    enabled: Boolean(memberId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
      </div>
    );
  }

  const items = data?.data ?? [];

  if (items.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item, i) => {
        const Icon = TYPE_ICON[item.type] ?? Bell;
        return (
          <li key={`${item.type}-${item.refId}-${i}`} className="flex gap-3">
            <div className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_COLOR[item.type] ?? "bg-muted text-muted-foreground"}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{t(`types.${item.type}`)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{dateTime(item.occurredAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
