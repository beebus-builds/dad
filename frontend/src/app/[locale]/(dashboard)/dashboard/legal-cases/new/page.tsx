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
import { legalService } from "@/services/legal-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const legalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["FOREIGN_EMPLOYMENT", "LABOR_DISPUTE", "OSH", "COLLECTIVE_BARGAINING", "OTHER"]),
  memberName: z.string().optional(),
});
type LegalInput = z.infer<typeof legalSchema>;

const TYPES = [
  "FOREIGN_EMPLOYMENT",
  "LABOR_DISPUTE",
  "OSH",
  "COLLECTIVE_BARGAINING",
  "OTHER",
] as const;

export default function NewLegalCasePage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LegalInput>({
    resolver: zodResolver(legalSchema),
    defaultValues: { type: "FOREIGN_EMPLOYMENT" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: LegalInput) => legalService.create(payload),
    onSuccess: () => {
      toast.success("Case opened");
      router.push("/dashboard/legal-cases");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to open case"),
  });

  return (
    <PermissionGate permission={PERMISSIONS.LEGAL_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title="Open Legal Case"
          description="Initiate a new legal case — foreign employment, OSH, bargaining, dispute."
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
              <CardTitle>Case details</CardTitle>
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
              <div className="space-y-2">
                <Label htmlFor="memberName">Client / member name</Label>
                <Input id="memberName" {...register("memberName")} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={watch("type")}
                onValueChange={(v) => setValue("type", v as LegalInput["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Open case
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
