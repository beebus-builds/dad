"use client";

import Link from "next/link";
import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import { trainingService } from "@/services/training-service";
import { ApiError } from "@/lib/api-client";
import type { TrainingProgram } from "@/types";

const STATUS_VARIANT: Record<TrainingProgram["status"], "secondary" | "warning" | "success"> = {
  UPCOMING: "secondary",
  ONGOING: "warning",
  COMPLETED: "success",
};

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "आगामी",
  ONGOING: "चलिरहेको",
  COMPLETED: "सम्पन्न",
};

export default function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("trainingAdmin.detail");
  const tCommon = useTranslations("common");
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["training", { pageSize: 200 }],
    queryFn: () => trainingService.list({ page: 1, pageSize: 200 }),
    enabled: Boolean(id),
  });

  const program = data?.data.find((p) => p.id === id) ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title={t("title")}
          description={t("loadError", { id })}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/training">
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

  if (!program) {
    return (
      <div className="space-y-4">
        <PageHeader
          title={t("notFound")}
          description={t("notFoundDesc", { id })}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/training">
                <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const pct =
    program.capacity && program.capacity > 0
      ? Math.min(100, Math.round((program.registeredCount / program.capacity) * 100))
      : 0;

  return (
    <PermissionGate permission={PERMISSIONS.TRAINING_READ}>
      <div className="space-y-6">
        <PageHeader
          title={program.title}
          description={program.titleNepali || t("title")}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/training">
                <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <Badge variant={STATUS_VARIANT[program.status]}>{STATUS_LABELS[program.status]}</Badge>
              </div>
              <CardTitle>{program.title}</CardTitle>
              {program.titleNepali && (
                <p className="font-devanagari text-sm text-muted-foreground">
                  {program.titleNepali}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="whitespace-pre-wrap">{program.description}</p>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(program.startsAt)} – {formatDate(program.endsAt)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {program.location}
                </div>
                {program.trainer && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    {t("trainer")}: {program.trainer}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("registration")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("enrolled")}</span>
                  <span className="font-medium">
                    {program.registeredCount} {program.capacity ? `/ ${program.capacity}` : ""}
                  </span>
                </div>
                {program.capacity ? (
                  <div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{pct}% {t("capacityUsed")}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t("unlimitedCapacity")}</p>
                )}
                <Button className="w-full" disabled>
                  <Users className="h-4 w-4" /> {t("viewEnrolments")}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("schedule")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("starts")}:</span>{" "}
                  {formatDate(program.startsAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("ends")}:</span> {formatDate(program.endsAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("location")}:</span> {program.location}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
