"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, Newspaper, Plus, Search, Trash2 } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import { newsService, type NewsListParams } from "@/services/news-service";
import { ApiError } from "@/lib/api-client";

export default function NewsDashboardPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params: NewsListParams = {
    page,
    pageSize: 20,
    search: search || undefined,
    status: (statusFilter as never) || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["news", params],
    queryFn: () => newsService.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsService.remove(id),
    onSuccess: () => {
      toast.success("Article deleted");
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
          title="News &amp; Updates"
          description="Publish announcements, policy briefs, and press releases."
          actions={
            <PermissionGate permission={PERMISSIONS.NEWS_WRITE} fallback={null}>
              <Button size="sm" asChild>
                <Link href="/dashboard/news/new">
                  <Plus className="h-4 w-4" /> New article
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
                  placeholder="Search title or slug…"
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading articles…
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Failed to load articles: {(error as ApiError).message}
              </div>
            ) : items.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Newspaper className="mb-2 h-8 w-8 text-muted-foreground" />
                  <h3 className="font-medium">No articles yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first article to populate the public news page.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                            <Badge variant="outline">{n.category.replace("_", " ")}</Badge>
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
                              {n.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{n.author?.name ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {n.publishedAt ? formatDate(n.publishedAt) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/news/${n.id}`}>Edit</Link>
                              </Button>
                              <PermissionGate permission={PERMISSIONS.NEWS_WRITE} fallback={null}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm("Delete this article?")) {
                                      deleteMutation.mutate(n.id);
                                    }
                                  }}
                                  aria-label="Delete"
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
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
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
