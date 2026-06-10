"use client";

import { useRouter } from "@/lib/i18n-navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { eventService } from "@/services/events-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(5),
  titleNepali: z.string().optional(),
  description: z.string().min(20),
  category: z.enum(["MEETING", "RALLY", "TRAINING", "WORKSHOP", "CONFERENCE", "OTHER"]),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  location: z.string().min(1),
  capacity: z.coerce.number().int().positive().optional(),
});
type EventInput = z.infer<typeof eventSchema>;

const CATEGORIES = [
  "MEETING",
  "RALLY",
  "TRAINING",
  "WORKSHOP",
  "CONFERENCE",
  "OTHER",
] as const;

export default function NewEventPage() {
  const t = useTranslations("eventsAdmin");
  const tCategory = useTranslations("eventsAdmin.list.categories");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: { category: "MEETING" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: EventInput) =>
      eventService.create({
        ...payload,
        startsAt: new Date(payload.startsAt).toISOString(),
        endsAt: new Date(payload.endsAt).toISOString(),
        capacity: payload.capacity,
      }),
    onSuccess: () => {
      toast.success(t("new.created"));
      router.push("/dashboard/events");
    },
    onError: (err: ApiError) => toast.error(err.message || t("new.createFailed")),
  });

  return (
    <PermissionGate permission={PERMISSIONS.EVENTS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title={t("new.title")}
          description={t("new.subtitle")}
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
              <CardTitle>{t("new.details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">{`${t("new.fields.title")} *`}</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleNepali">{t("new.fields.titleNepali")}</Label>
                  <Input id="titleNepali" className="font-devanagari" {...register("titleNepali")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{`${t("new.fields.description")} *`}</Label>
                <Textarea id="description" rows={6} {...register("description")} />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">{`${t("new.fields.startsAt")} *`}</Label>
                  <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
                  {errors.startsAt && (
                    <p className="text-sm text-destructive">{errors.startsAt.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">{`${t("new.fields.endsAt")} *`}</Label>
                  <Input id="endsAt" type="datetime-local" {...register("endsAt")} />
                  {errors.endsAt && (
                    <p className="text-sm text-destructive">{errors.endsAt.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">{`${t("new.fields.location")} *`}</Label>
                  <Input id="location" {...register("location")} />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">{t("new.fields.capacity")}</Label>
                  <Input id="capacity" type="number" min="1" {...register("capacity")} />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("new.classification")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{`${t("new.fields.category")} *`}</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v as EventInput["category"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {tCategory(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("new.submit")}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
