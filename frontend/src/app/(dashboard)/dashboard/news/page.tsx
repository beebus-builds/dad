"use client";

import Link from "next/link";
import { Eye, Plus } from "lucide-react";
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

const NEWS = [
  {
    id: "n-1",
    title: "Updated Minimum Wage Guidelines",
    category: "POLICY",
    status: "PUBLISHED",
    author: "Editorial Team",
    publishedAt: "2026-06-01",
    views: 12340,
  },
  {
    id: "n-2",
    title: "12 Nepalese Workers Repatriated",
    category: "ANNOUNCEMENT",
    status: "PUBLISHED",
    author: "Migrant Desk",
    publishedAt: "2026-05-28",
    views: 8210,
  },
  {
    id: "n-3",
    title: "Province 3 Workers Festival",
    category: "EVENT",
    status: "DRAFT",
    author: "Bagmati Branch",
    publishedAt: "",
    views: 0,
  },
];

export default function NewsDashboardPage() {
  return (
    <PermissionGate permission={PERMISSIONS.NEWS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="News &amp; Announcements"
          description="Publish updates, policy briefs and press releases."
          actions={
            <PermissionGate permission={PERMISSIONS.NEWS_WRITE} fallback={null}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New article
              </Button>
            </PermissionGate>
          }
        />
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {NEWS.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{n.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.status === "PUBLISHED" ? "success" : "secondary"}>
                        {n.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{n.author}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {n.publishedAt ? formatDate(n.publishedAt) : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {n.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/dashboard/news/${n.id}`}>
                          <Eye className="h-4 w-4" /> Open
                        </Link>
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
