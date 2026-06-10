"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Newspaper, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { newsService, type NewsListParams } from "@/services/news-service";
import { ApiError } from "@/lib/api-client";
import type { News } from "@/types";

type NewsStatus = News["status"];

const PAGE_SIZE = 20;

export default function NewsDashboardPage() {
  const t = useTranslations("newsAdmin");
  const tStatus = useTranslations("newsAdmin.status");
  const tCategory = useTranslations("newsAdmin.new.categories");
  const tCommon = useTranslations("common");
  const { date } = useLocaleFormat();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NewsStatus | "">("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params: NewsListParams = {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["news", params],
    queryFn: () => newsService.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsService.remove(id),
    onSuccess: () => {
      toast.success(t("list.deleted"));
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const items = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <PermissionGate permission={PERMISSIONS.NEWS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={t("list.title")}
          description={t("list.subtitle")}
          actions={
            <PermissionGate permission={PERMISSIONS.NEWS_WRITE} fallback={null}>
              <Button size="sm" asChild>
                <Link href="/dashboard/news/new">
                  <Plus className="h-4 w-4" /> {t("list.new")}
                </Link>
              </Button>
            </PermissionGate>
          }
        />
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t("list.search")}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as NewsStatus | "");
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t("list.allStatuses")}</option>
                <option value="DRAFT">{tStatus("DRAFT")}</option>
                <option value="PUBLISHED">{tStatus("PUBLISHED")}</option>
                <option value="ARCHIVED">{tStatus("ARCHIVED")}</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("list.loading")}
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {(error as ApiError).message}
              </div>
            ) : items.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Newspaper className="mb-2 h-8 w-8 text-muted-foreground" />
                  <h3 className="font-medium">{t("list.empty")}</h3>
                  <p className="text-sm text-muted-foreground">{t("list.emptyDesc")}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("list.headers.title")}</TableHead>
                        <TableHead>{t("list.headers.category")}</TableHead>
                        <TableHead>{t("list.headers.status")}</TableHead>
                        <TableHead>{t("list.headers.author")}</TableHead>
                        <TableHead>{t("list.headers.published")}</TableHead>
                        <TableHead className="text-right">{t("list.headers.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((n) => (
                        <TableRow key={n.id}>
                          <TableCell>
                            <Link
                              href={`/dashboard/news/${n.id}`}
                              className="font-medium hover:underline"
                            >
                              {n.title}
                            </Link>
                            {n.titleNepali && (
                              <p className="font-devanagari text-xs text-muted-foreground">
                                {n.titleNepali}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tCategory(n.category as "ANNOUNCEMENT" | "POLICY" | "EVENT" | "PRESS_RELEASE" | "OTHER")}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                n.status === "PUBLISHED"
                                  ? "success"
                                  : n.status === "DRAFT"
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {tStatus(n.status as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{n.author?.name ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {n.publishedAt ? date(n.publishedAt) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/news/${n.id}`}>{t("list.edit")}</Link>
                              </Button>
                              <PermissionGate permission={PERMISSIONS.NEWS_WRITE} fallback={null}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (window.confirm(t("list.deleteConfirm"))) {
                                      deleteMutation.mutate(n.id);
                                    }
                                  }}
                                  aria-label={t("list.delete")}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </PermissionGate>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      {tCommon("previous")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      {tCommon("next")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
