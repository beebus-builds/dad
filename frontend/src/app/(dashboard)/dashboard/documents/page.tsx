"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, File, FileText, FolderOpen, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { documentService } from "@/services/documents-service";
import { ApiError } from "@/lib/api-client";

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["documents", { page, search, categoryFilter }],
    queryFn: () =>
      documentService.list({
        page,
        pageSize: 50,
        search: search || undefined,
        category: (categoryFilter as never) || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.remove(id),
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const items = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const total = data?.pagination.total ?? 0;
  const publicCount = items.filter((d) => d.visibility === "PUBLIC").length;
  const membersCount = items.filter((d) => d.visibility === "MEMBERS").length;
  const adminCount = items.filter((d) => d.visibility === "ADMIN").length;

  return (
    <PermissionGate permission={PERMISSIONS.DOCUMENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Documents"
          description="Policies, legal templates, forms and union reports."
          actions={
            <PermissionGate permission={PERMISSIONS.DOCUMENTS_WRITE} fallback={null}>
              <Button size="sm" asChild>
                <a href="/dashboard/documents/new">
                  <Upload className="h-4 w-4" /> Upload document
                </a>
              </Button>
            </PermissionGate>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total" value={total} icon={FolderOpen} />
          <Stat label="Public" value={publicCount} icon={FolderOpen} />
          <Stat label="Members only" value={membersCount} icon={FolderOpen} />
          <Stat label="Admin only" value={adminCount} icon={FolderOpen} />
        </div>
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                placeholder="Search documents…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All categories</option>
                <option value="POLICY">Policy</option>
                <option value="LEGAL">Legal</option>
                <option value="REPORT">Report</option>
                <option value="FORM">Form</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Failed: {(error as ApiError).message}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Visibility</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                            No documents found
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="rounded-md bg-muted p-2">
                                  {d.fileType?.includes("pdf") ? (
                                    <FileText className="h-4 w-4" />
                                  ) : (
                                    <File className="h-4 w-4" />
                                  )}
                                </div>
                                <span className="font-medium">{d.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{d.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  d.visibility === "PUBLIC"
                                    ? "success"
                                    : d.visibility === "MEMBERS"
                                      ? "secondary"
                                      : "warning"
                                }
                              >
                                {d.visibility}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm uppercase">
                              {d.fileType?.split("/").pop() ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm">{bytes(d.fileSize)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(d.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                                <PermissionGate permission={PERMISSIONS.DOCUMENTS_WRITE} fallback={null}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      if (confirm("Delete this document?")) {
                                        deleteMutation.mutate(d.id);
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
                        ))
                      )}
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

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof FolderOpen;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
