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
import { newsService } from "@/services/news-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const newsSchema = z.object({
  title: z.string().min(5),
  titleNepali: z.string().optional(),
  excerpt: z.string().min(20),
  content: z.string().min(50),
  category: z.enum(["ANNOUNCEMENT", "POLICY", "EVENT", "PRESS_RELEASE", "OTHER"]),
});
type NewsInput = z.infer<typeof newsSchema>;

const CATEGORIES = [
  "ANNOUNCEMENT",
  "POLICY",
  "EVENT",
  "PRESS_RELEASE",
  "OTHER",
] as const;

export default function NewNewsPage() {
  const t = useTranslations("newsAdmin");
  const tCategory = useTranslations("newsAdmin.new.categories");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: { category: "ANNOUNCEMENT" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: NewsInput) => newsService.create(payload),
    onSuccess: () => {
      toast.success(t("new.created"));
      router.push("/dashboard/news");
    },
    onError: (err: ApiError) => toast.error(err.message || t("new.createFailed")),
  });

  return (
    <PermissionGate permission={PERMISSIONS.NEWS_WRITE}>
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
                <Label htmlFor="excerpt">{`${t("new.fields.excerpt")} *`}</Label>
                <Textarea id="excerpt" rows={2} {...register("excerpt")} />
                {errors.excerpt && (
                  <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">{`${t("new.fields.content")} *`}</Label>
                <Textarea id="content" rows={12} {...register("content")} />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
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
                  onValueChange={(v) => setValue("category", v as NewsInput["category"])}
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
                {t("new.publish")}
              </Button>
              <p className="text-xs text-muted-foreground">{t("new.submitHint")}</p>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
