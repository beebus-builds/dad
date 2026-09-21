"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { SegmentBuilder } from "@/components/dashboard/segment-builder";
import type { CampaignPayload } from "@/services/campaigns-service";
import type { CampaignSegment } from "@/types";

export function CampaignForm({
  initial,
  onSubmit,
  submitting,
  readOnly,
}: {
  initial?: Partial<CampaignPayload>;
  onSubmit: (payload: CampaignPayload) => void;
  submitting?: boolean;
  readOnly?: boolean;
}) {
  const t = useTranslations("campaigns.new");
  const tCommon = useTranslations("common");
  const [name, setName] = useState(initial?.name ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [segment, setSegment] = useState<CampaignSegment>(initial?.segment ?? {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("fields.name")}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("fields.subject")}</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("fields.body")}</label>
            {readOnly ? (
              <div className="prose prose-sm max-w-none rounded-md border p-4" dangerouslySetInnerHTML={{ __html: body }} />
            ) : (
              <RichTextEditor value={body} onChange={setBody} minHeight={220} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("fields.segment")}</CardTitle>
        </CardHeader>
        <CardContent>
          {readOnly ? (
            <p className="text-sm text-muted-foreground">
              {[segment.branchId, segment.tier, segment.status, segment.tag].filter(Boolean).join(" · ") || t("allMembersFallback")}
            </p>
          ) : (
            <SegmentBuilder value={segment} onChange={setSegment} />
          )}
        </CardContent>
      </Card>

      {!readOnly && (
        <Button
          onClick={() => onSubmit({ name, subject, body, segment })}
          disabled={submitting || !name.trim() || !subject.trim() || !body.trim()}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {tCommon("save")}
        </Button>
      )}
    </div>
  );
}
