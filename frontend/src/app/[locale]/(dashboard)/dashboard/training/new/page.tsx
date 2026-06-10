"use client";

import { useRouter } from "next/navigation";
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
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { trainingService } from "@/services/training-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const trainingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  titleNepali: z.string().optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  location: z.string().min(1),
  trainer: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
});
type TrainingInput = z.infer<typeof trainingSchema>;

export default function NewTrainingPage() {
  const router = useRouter();
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
      toast.success("Programme scheduled");
      router.push("/dashboard/training");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to schedule programme"),
  });

  return (
    <PermissionGate permission={PERMISSIONS.TRAINING_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title="Schedule Training"
          description="Plan a new training programme for members."
          actions={
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
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
              <CardTitle>Programme details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleNepali">Title (Nepali)</Label>
                <Input id="titleNepali" className="font-devanagari" {...register("titleNepali")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" rows={5} {...register("description")} />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer">Trainer / facilitator</Label>
                <Input id="trainer" {...register("trainer")} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Starts at *</Label>
                  <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endsAt">Ends at *</Label>
                  <Input id="endsAt" type="datetime-local" {...register("endsAt")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" {...register("location")} />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" min="1" {...register("capacity")} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Schedule programme
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
