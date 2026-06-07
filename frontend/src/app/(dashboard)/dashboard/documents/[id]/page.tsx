"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Download,
  File,
  FileText,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate, formatDateTime } from "@/lib/utils";
import { documentService } from "@/services/documents-service";
import { ApiError } from "@/lib/api-client";
import type { DocumentItem } from "@/types";

const VISIBILITY_VARIANT: Record<
  DocumentItem["visibility"],
  "success" | "secondary" | "warning"
> = {
  PUBLIC: "success",
  MEMBERS: "secondary",
  ADMIN: "warning",
};

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["documents", { pageSize: 200 }],
    queryFn: () => documentService.list({ page: 1, pageSize: 200 }),
    enabled: Boolean(id),
  });

  const doc = data?.data.find((d) => d.id === id) ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading document…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Document"
          description={`Could not load document ${id}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/documents">
                <ArrowLeft className="h-4 w-4" /> Back
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

  if (!doc) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Document not found"
          description={`No document with id ${id}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/documents">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const isPdf = doc.fileType?.includes("pdf");

  return (
    <PermissionGate permission={PERMISSIONS.DOCUMENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={doc.title}
          description={doc.description || "Document details"}
          actions={
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/documents">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Link>
              </Button>
              <Button size="sm" asChild>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Download
                </a>
              </Button>
            </>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{doc.category}</Badge>
                <Badge variant={VISIBILITY_VARIANT[doc.visibility]}>{doc.visibility}</Badge>
              </div>
              <CardTitle>{doc.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-4">
                <div className="rounded-md bg-background p-2">
                  {isPdf ? <FileText className="h-6 w-6" /> : <File className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.fileType} · {bytes(doc.fileSize)}
                  </p>
                </div>
              </div>
              {doc.description && (
                <p className="whitespace-pre-wrap text-muted-foreground">{doc.description}</p>
              )}
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {doc.uploadedBy?.name ?? "—"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Uploaded {formatDateTime(doc.createdAt)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Category: <span className="font-medium text-foreground">{doc.category}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Visibility:{" "}
                  <span className="font-medium text-foreground">{doc.visibility}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Size: <span className="font-medium text-foreground">{bytes(doc.fileSize)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatDate(doc.createdAt)}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(doc.createdAt)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
