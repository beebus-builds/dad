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
import { legalService } from "@/services/legal-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const legalSchema = z.object({
  title: z.string().min(5, "शीर्षक कम्तिमा ५ अक्षर हुनुपर्छ"),
  description: z.string().min(20, "विवरण कम्तिमा २० अक्षर हुनुपर्छ"),
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

const TYPE_LABELS: Record<string, string> = {
  FOREIGN_EMPLOYMENT: "वैदेशिक रोजगारी",
  LABOR_DISPUTE: "श्रम विवाद",
  OSH: "OSH",
  COLLECTIVE_BARGAINING: "सामूहिक सौदाबाजी",
  OTHER: "अन्य",
};

export default function NewLegalCasePage() {
  const router = useRouter();
  const t = useTranslations("legalCasesAdmin.new");
  const tCommon = useTranslations("common");
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
      toast.success(t("created"));
      router.push("/dashboard/legal-cases");
    },
    onError: (err: ApiError) => toast.error(err.message || t("createFailed")),
  });

  return (
    <PermissionGate permission={PERMISSIONS.LEGAL_WRITE}>
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
              <div className="space-y-2">
                <Label htmlFor="memberName">{t("clientName")}</Label>
                <Input id="memberName" {...register("memberName")} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("type")}</CardTitle>
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
                  {TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("openCase")}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
