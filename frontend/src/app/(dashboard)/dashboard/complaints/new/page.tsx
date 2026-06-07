"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { complaintSchema, type ComplaintInput } from "@/lib/validations";
import { complaintService } from "@/services/complaints-service";
import { ApiError } from "@/lib/api-client";

const CATEGORIES = [
  "WAGES",
  "WORKING_HOURS",
  "SAFETY",
  "HARASSMENT",
  "TERMINATION",
  "BENEFITS",
  "OTHER",
] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export default function NewComplaintPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplaintInput>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { category: "WAGES", priority: "MEDIUM" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: ComplaintInput) => complaintService.create(payload),
    onSuccess: (complaint) => {
      toast.success(`Complaint ${complaint.ticketNumber} filed`);
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      router.push("/dashboard/complaints");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to file complaint"),
  });

  return (
    <PermissionGate permission={PERMISSIONS.COMPLAINTS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title="File a Complaint"
          description="Help us understand the issue. All complaints are tracked with full audit trails."
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
              <CardTitle>Complaint Details</CardTitle>
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v as ComplaintInput["category"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(v) => setValue("priority", v as ComplaintInput["priority"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit complaint
              </Button>
              <p className="text-xs text-muted-foreground">
                Urgent complaints are notified to province leadership within 1 hour.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
