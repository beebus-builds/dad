"use client";

import Link from "next/link";
import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Heart,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { donationService } from "@/services/donations-service";
import { ApiError } from "@/lib/api-client";
import type { Donation } from "@/types";

const STATUS_VARIANT: Record<Donation["status"], "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export default function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("donations");
  const tMethod = useTranslations("donations.method");
  const tStatus = useTranslations("donations.status");
  const tCommon = useTranslations("common");
  const { currency, dateTime } = useLocaleFormat();
  const { id } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["donations", { pageSize: 200 }],
    queryFn: () => donationService.list({ page: 1, pageSize: 200 }),
    enabled: Boolean(id),
  });

  const donation = data?.data.find((d) => d.id === id) ?? null;

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
              <Link href="/dashboard/donations">
                <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
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

  if (!donation) {
    return (
      <div className="space-y-4">
        <PageHeader
          title={t("detail.notFound")}
          description={t("detail.notFoundDesc", { id })}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/donations">
                <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <PermissionGate permission={PERMISSIONS.DONATIONS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={t("detail.receiptNumber") + " " + donation.receiptNumber}
          description={donation.donorName}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/donations">
                <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("detail.details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-union-red/10 p-3 text-union-red">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{currency(donation.amount, donation.currency)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("detail.via", { method: tMethod(donation.method as "CASH" | "BANK_TRANSFER" | "ESEWA" | "KHALTI" | "CARD") })}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[donation.status]} className="ml-auto">
                  {tStatus(donation.status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED")}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <Info icon={CreditCard} label={t("detail.receiptNumber")} value={donation.receiptNumber} />
                <Info icon={Calendar} label={t("detail.date")} value={dateTime(donation.createdAt)} />
                {donation.purpose && <Info icon={Heart} label={t("detail.purpose")} value={donation.purpose} />}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.donor")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{donation.donorName}</p>
              {donation.donorEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> {donation.donorEmail}
                </div>
              )}
              {donation.donorPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> {donation.donorPhone}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGate>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-muted-foreground" /> {value}
      </div>
    </div>
  );
}
