"use client";

import Link from "next/link";
import { use } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Pencil,
  Tag,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { newsService } from "@/services/news-service";
import { ApiError } from "@/lib/api-client";
import type { News } from "@/types";

const STATUS_VARIANT: Record<News["status"], "warning" | "success" | "secondary"> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "secondary",
};

const PLACEHOLDER = "—";

export default function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("newsAdmin");
  const tStatus = useTranslations("newsAdmin.status");
  const tCategory = useTranslations("newsAdmin.new.categories");
  const tCommon = useTranslations("common");
  const { dateTime, date } = useLocaleFormat();
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["news", id],
    queryFn: () => newsService.detail(id),
    enabled: Boolean(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<News>) => newsService.update(id, payload),
    onSuccess: () => {
      toast.success(t("detail.updated"));
      queryClient.invalidateQueries({ queryKey: ["news", id] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => newsService.remove(id),
    onSuccess: () => {
      toast.success(t("detail.deleted"));
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title={t("list.title")}
          description={id}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/news">
                <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
              </Link>
            </Button>
          }
        />
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as ApiError).message}
        </div>
      </div>
    );
  }

  if (!data) return null;
  const n = data;

  return (
    <PermissionGate permission={PERMISSIONS.NEWS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={n.title}
          description={n.excerpt}
          actions={
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/news">
                  <ArrowLeft className="h-4 w-4" /> {t("detail.back")}
                </Link>
              </Button>
              <PermissionGate permission={PERMISSIONS.NEWS_WRITE} fallback={null}>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/news/${id}/edit`}>
                  <Pencil className="h-4 w-4" /> {t("detail.editArticle")}
                </Link>
              </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(t("detail.deleteConfirm"))) deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" /> {t("detail.deleteArticle")}
                </Button>
              </PermissionGate>
            </>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden">
            {n.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={n.coverImageUrl}
                alt={n.title}
                className="h-56 w-full object-cover"
              />
            )}
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  <Tag className="mr-1 h-3 w-3" /> {tCategory(n.category as "ANNOUNCEMENT" | "POLICY" | "EVENT" | "PRESS_RELEASE" | "OTHER")}
                </Badge>
                <Badge variant={STATUS_VARIANT[n.status]}>{tStatus(n.status as "DRAFT" | "PUBLISHED" | "ARCHIVED")}</Badge>
              </div>
              <CardTitle>{n.title}</CardTitle>
              {n.titleNepali && (
                <p className="font-devanagari text-sm text-muted-foreground">{n.titleNepali}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: n.content }} />
              {n.tags && n.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {n.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.author")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {n.author?.name ?? PLACEHOLDER}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {n.publishedAt
                    ? t("detail.published", { date: dateTime(n.publishedAt) })
                    : t("detail.notPublished")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.publication")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Info label={t("detail.slug")} value={n.slug} />
                <Info label={tCommon("status")} value={tStatus(n.status as "DRAFT" | "PUBLISHED" | "ARCHIVED")} />
                <Info label={t("new.fields.category")} value={tCategory(n.category as "ANNOUNCEMENT" | "POLICY" | "EVENT" | "PRESS_RELEASE" | "OTHER")} />
                <PermissionGate permission={PERMISSIONS.NEWS_PUBLISH} fallback={null}>
                  <Button
                    className="w-full"
                    disabled={updateMutation.isPending || n.status === "PUBLISHED"}
                    onClick={() => updateMutation.mutate({ status: "PUBLISHED" })}
                  >
                    {n.status === "PUBLISHED" ? t("detail.published2") : t("detail.publishNow")}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={updateMutation.isPending || n.status === "ARCHIVED"}
                    onClick={() => updateMutation.mutate({ status: "ARCHIVED" })}
                  >
                    {t("detail.archive")}
                  </Button>
                </PermissionGate>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
