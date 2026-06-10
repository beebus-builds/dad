"use client";

import { useRouter } from "@/lib/i18n-navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
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
import { documentService } from "@/services/documents-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const docSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.enum(["POLICY", "LEGAL", "REPORT", "FORM", "OTHER"]),
  visibility: z.enum(["PUBLIC", "MEMBERS", "ADMIN"]),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
  fileSize: z.coerce.number().int().positive(),
});
type DocInput = z.infer<typeof docSchema>;

const CATEGORIES = ["POLICY", "LEGAL", "REPORT", "FORM", "OTHER"] as const;
const VISIBILITIES = ["PUBLIC", "MEMBERS", "ADMIN"] as const;

export default function NewDocumentPage() {
  const t = useTranslations("documents");
  const tCategory = useTranslations("documents.category");
  const tVisibility = useTranslations("documents.visibility");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocInput>({
    resolver: zodResolver(docSchema),
    defaultValues: { category: "POLICY", visibility: "MEMBERS" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: DocInput) => documentService.create(payload),
    onSuccess: () => {
      toast.success(t("new.created"));
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      router.push("/dashboard/documents");
    },
    onError: (err: ApiError) => toast.error(err.message || t("new.createFailed")),
  });

  return (
    <PermissionGate permission={PERMISSIONS.DOCUMENTS_WRITE}>
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
              <div className="space-y-2">
                <Label htmlFor="title">{`${t("new.fields.title")} *`}</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("new.fields.description")}</Label>
                <Textarea id="description" rows={3} {...register("description")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">{`${t("new.fields.fileUrl")} *`}</Label>
                <Input
                  id="fileUrl"
                  type="url"
                  placeholder={t("new.fileUrlPlaceholder")}
                  {...register("fileUrl")}
                />
                {errors.fileUrl && (
                  <p className="text-sm text-destructive">{errors.fileUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">{t("new.submitHint")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fileType">{`${t("new.fields.fileType")} *`}</Label>
                  <Input id="fileType" placeholder={t("new.fileTypePlaceholder")} {...register("fileType")} />
                  {errors.fileType && (
                    <p className="text-sm text-destructive">{errors.fileType.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileSize">{`${t("new.fields.fileSize")} *`}</Label>
                  <Input id="fileSize" type="number" min="1" {...register("fileSize")} />
                  {errors.fileSize && (
                    <p className="text-sm text-destructive">{errors.fileSize.message}</p>
                  )}
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
                  onValueChange={(v) => setValue("category", v as DocInput["category"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{tCategory(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{`${t("new.fields.visibility")} *`}</Label>
                <Select
                  value={watch("visibility")}
                  onValueChange={(v) => setValue("visibility", v as DocInput["visibility"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITIES.map((v) => (
                      <SelectItem key={v} value={v}>{tVisibility(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {t("new.submit")}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
