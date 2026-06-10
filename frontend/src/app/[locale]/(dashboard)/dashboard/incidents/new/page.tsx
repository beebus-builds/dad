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
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  severity: z.enum(["MINOR", "MODERATE", "SEVERE", "FATAL"]),
  occurredAt: z.string().min(1),
  location: z.string().min(1),
  workplaceName: z.string().optional(),
});
type IncidentInput = z.infer<typeof incidentSchema>;

const SEVERITIES = ["MINOR", "MODERATE", "SEVERE", "FATAL"] as const;

export default function NewIncidentPage() {
  const router = useRouter();
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
      toast.success("Incident reported");
      router.push("/dashboard/incidents");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to report incident"),
  });

  return (
    <PermissionGate permission={PERMISSIONS.INCIDENTS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title="Report OSH Incident"
          description="Log a workplace safety or health incident."
          actions={
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
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
              <CardTitle>Incident details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" rows={8} {...register("description")} />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="occurredAt">Occurred at *</Label>
                  <Input id="occurredAt" type="datetime-local" {...register("occurredAt")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" {...register("location")} />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workplaceName">Workplace name</Label>
                <Input id="workplaceName" {...register("workplaceName")} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Severity</CardTitle>
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
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Report incident
              </Button>
              <p className="text-xs text-muted-foreground">
                FATAL incidents trigger an immediate alert to the National OSH officer.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
