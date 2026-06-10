"use client";

import Link from "next/link";
import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { getInitials } from "@/lib/utils";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { memberService } from "@/services/members-service";
import { ApiError } from "@/lib/api-client";
import type { Member } from "@/types";

const STATUS_VARIANT: Record<Member["status"], "success" | "secondary" | "warning" | "destructive"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  EXPIRED: "warning",
  SUSPENDED: "destructive",
};

const PLACEHOLDER = "—";

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("members.status");
  const tTier = useTranslations("members.tier");
  const tGender = useTranslations("members.gender");
  const { date } = useLocaleFormat();
  const { id } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["member", id],
    queryFn: () => memberService.detail(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title={t("list.title")}
          description={id}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/members">
                <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
              </Link>
            </Button>
          }
        />
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as ApiError).message}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const m = data;

  return (
    <PermissionGate permission={PERMISSIONS.MEMBERS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={m.fullName}
          description={m.fullNameNepali || `#${m.membershipNumber}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/members">
                <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="space-y-4 p-6 text-center">
              <Avatar className="mx-auto h-20 w-20">
                {m.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatarUrl} alt={m.fullName} />
                ) : null}
                <AvatarFallback className="text-lg">{getInitials(m.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{m.fullName}</h2>
                <p className="text-sm text-muted-foreground">{m.membershipNumber}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant={STATUS_VARIANT[m.status]}>{tStatus(m.status)}</Badge>
                <Badge variant="outline">{tTier(m.tier as "STANDARD" | "LIFETIME" | "HONORARY")}</Badge>
              </div>
              <div className="space-y-2 pt-2 text-left text-sm text-muted-foreground">
                {m.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {m.phone}
                  </div>
                )}
                {m.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {m.email}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {m.branchName ?? m.branchId}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {date(m.joinedAt)}
                </div>
                {m.expiresAt && (
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> {date(m.expiresAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.information")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Info label={t("new.fields.fullNameNepali")} value={m.fullNameNepali ?? PLACEHOLDER} />
                <Info label={t("detail.gender")} value={m.gender ? tGender(m.gender as "MALE" | "FEMALE" | "OTHER") : PLACEHOLDER} />
                <Info label={t("new.fields.dateOfBirth")} value={m.dateOfBirth ? date(m.dateOfBirth) : PLACEHOLDER} />
                <Info label={t("new.fields.citizenshipNumber")} value={m.citizenshipNumber ?? PLACEHOLDER} />
                <Info label={t("new.fields.occupation")} value={m.occupation ?? PLACEHOLDER} />
                <Info label={t("new.fields.employer")} value={m.employer ?? PLACEHOLDER} />
                <Info label={t("new.fields.email")} value={m.email ?? PLACEHOLDER} />
                <Info label={t("new.fields.phone")} value={m.phone} />
                <div className="sm:col-span-2">
                  <Info label={t("new.fields.address")} value={m.address ?? PLACEHOLDER} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.membership")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Info label={t("new.fields.branch")} value={m.branchName ?? m.branchId} />
                <Info label={t("new.fields.tier")} value={tTier(m.tier as "STANDARD" | "LIFETIME" | "HONORARY")} />
                <Info label={tCommon("status")} value={tStatus(m.status)} />
                <Info label={t("detail.joined")} value={date(m.joinedAt)} />
                <Info label={t("detail.expires")} value={m.expiresAt ? date(m.expiresAt) : PLACEHOLDER} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.activity")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" /> {t("detail.activityEmpty")}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
