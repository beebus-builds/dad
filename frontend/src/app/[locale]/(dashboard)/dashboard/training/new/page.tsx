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
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { trainingService } from "@/services/training-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const trainingSchema = z.object({
  title: z.string().min(5, "शीर्षक कम्तिमा ५ अक्षर हुनुपर्छ"),
  titleNepali: z.string().optional(),
  description: z.string().min(20, "विवरण कम्तिमा २० अक्षर हुनुपर्छ"),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  location: z.string().min(1),
  trainer: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
});
type TrainingInput = z.infer<typeof trainingSchema>;

export default function NewTrainingPage() {
  const router = useRouter();
  const t = useTranslations("trainingAdmin.new");
  const tCommon = useTranslations("common");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrainingInput>({
    resolver: zodResolver(trainingSchema),
  });

  const createMutation = useMutation({
    mutationFn: (payload: TrainingInput) =>
      trainingService.create({
        ...payload,
        startsAt: new Date(payload.startsAt).toISOString(),
        endsAt: new Date(payload.endsAt).toISOString(),
        capacity: payload.capacity,
      }),
    onSuccess: () => {
      toast.success(t("created"));
      router.push("/dashboard/training");
    },
    onError: (err: ApiError) => toast.error(err.message || t("createFailed")),
  });

  return (
    <PermissionGate permission={PERMISSIONS.TRAINING_WRITE}>
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
          className="grid gap-6 lg:grid-cols-2"
          noValidate
        >
          <Card>
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
                <Label htmlFor="titleNepali">{t("titleNepali")}</Label>
                <Input id="titleNepali" className="font-devanagari" {...register("titleNepali")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("descriptionLabel")} *</Label>
                <Textarea id="description" rows={5} {...register("description")} />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer">{t("trainer")}</Label>
                <Input id="trainer" {...register("trainer")} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("logistics")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">{t("startsAt")} *</Label>
                  <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">{t("endsAt")} *</Label>
                  <Input id="endsAt" type="datetime-local" {...register("endsAt")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t("location")} *</Label>
                <Input id="location" {...register("location")} />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">{t("capacity")}</Label>
                <Input id="capacity" type="number" min="1" {...register("capacity")} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("schedule")}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
