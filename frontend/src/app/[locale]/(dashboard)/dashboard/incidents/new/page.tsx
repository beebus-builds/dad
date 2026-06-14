"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { incidentService } from "@/services/incidents-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const incidentSchema = z.object({
  title: z.string().min(5, "शीर्षक कम्तिमा ५ अक्षर हुनुपर्छ"),
  description: z.string().min(20, "विवरण कम्तिमा २० अक्षर हुनुपर्छ"),
  severity: z.enum(["MINOR", "MODERATE", "SEVERE", "FATAL"]),
  occurredAt: z.string().min(1),
  location: z.string().min(1),
  workplaceName: z.string().optional(),
});
type IncidentInput = z.infer<typeof incidentSchema>;

const SEVERITIES = ["MINOR", "MODERATE", "SEVERE", "FATAL"] as const;
const SEVERITY_LABELS: Record<string, string> = {
  MINOR: "सामान्य",
  MODERATE: "मध्यम",
  SEVERE: "गम्भीर",
  FATAL: "घातक",
};

export default function NewIncidentPage() {
  const router = useRouter();
  const t = useTranslations("incidentsAdmin.new");
  const tCommon = useTranslations("common");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncidentInput>({
    resolver: zodResolver(incidentSchema),
    defaultValues: { severity: "MINOR" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: IncidentInput) =>
      incidentService.create({
        ...payload,
        occurredAt: new Date(payload.occurredAt).toISOString(),
      }),
    onSuccess: () => {
      toast.success(t("created"));
      router.push("/dashboard/incidents");
    },
    onError: (err: ApiError) => toast.error(err.message || t("createFailed")),
  });

  return (
    <PermissionGate permission={PERMISSIONS.INCIDENTS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          description={t("subtitle")}
          actions={
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
            </Button>
          }
        />
        <form
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          className="grid gap-6 lg:grid-cols-3"
          noValidate
        >
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("titleLabel")} *</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("descriptionLabel")} *</Label>
                <Textarea id="description" rows={8} {...register("description")} />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="occurredAt">{t("occurredAt")} *</Label>
                  <Input id="occurredAt" type="datetime-local" {...register("occurredAt")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t("location")} *</Label>
                  <Input id="location" {...register("location")} />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workplaceName">{t("workplaceName")}</Label>
                <Input id="workplaceName" {...register("workplaceName")} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("severity")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={watch("severity")}
                onValueChange={(v) => setValue("severity", v as IncidentInput["severity"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEVERITY_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("report")}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t("fatalHint")}
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
