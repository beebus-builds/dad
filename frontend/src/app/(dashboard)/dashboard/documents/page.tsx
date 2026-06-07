"use client";

import { Download, File, FileText, FolderOpen, Upload } from "lucide-react";
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

const DOCS = [
  {
    id: "doc-1",
    title: "Labour Act 2017 (Nepali)",
    category: "LEGAL",
    visibility: "PUBLIC",
    size: 2_300_000,
    type: "PDF",
    createdAt: "2026-01-15",
  },
  {
    id: "doc-2",
    title: "Annual Report 2082",
    category: "REPORT",
    visibility: "PUBLIC",
    size: 5_100_000,
    type: "PDF",
    createdAt: "2026-04-22",
  },
  {
    id: "doc-3",
    title: "Foreign Employment Grievance Form",
    category: "FORM",
    visibility: "MEMBERS",
    size: 240_000,
    type: "DOCX",
    createdAt: "2026-05-01",
  },
  {
    id: "doc-4",
    title: "Internal Audit Policy",
    category: "POLICY",
    visibility: "ADMIN",
    size: 880_000,
    type: "PDF",
    createdAt: "2026-05-12",
  },
];

function bytes(n: number) {
  const mb = n / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default function DocumentsPage() {
  return (
    <PermissionGate permission={PERMISSIONS.DOCUMENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Documents"
          description="Policies, legal templates, forms and union reports."
          actions={
            <PermissionGate permission={PERMISSIONS.DOCUMENTS_WRITE} fallback={null}>
              <Button size="sm">
                <Upload className="h-4 w-4" /> Upload document
              </Button>
            </PermissionGate>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Documents", value: 142 },
            { label: "Public", value: 56 },
            { label: "Members Only", value: 71 },
            { label: "Admin Only", value: 15 },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
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
                {DOCS.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-muted p-2">
                          {d.type === "PDF" ? (
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
                    <TableCell className="text-sm">{d.type}</TableCell>
                    <TableCell className="text-sm">{bytes(d.size)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(d.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
