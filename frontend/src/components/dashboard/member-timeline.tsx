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
  TRAINING: "bg-secondary/10 text-secondary",
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
      <div className="text-muted-foreground flex items-center justify-center py-8">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
      </div>
    );
  }

  const items = data?.data ?? [];

  if (items.length === 0) {
    return <p className="text-muted-foreground py-4 text-sm">{t("empty")}</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item, i) => {
        const Icon = TYPE_ICON[item.type] ?? Bell;
        return (
          <li key={`${item.type}-${item.refId}-${i}`} className="flex gap-3">
            <div
              className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TYPE_COLOR[item.type] ?? "bg-muted text-muted-foreground"}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm leading-tight font-medium">{item.title}</p>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {t(`types.${item.type}`)}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{dateTime(item.occurredAt)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
