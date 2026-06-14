"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { api, type Paginated } from "@/lib/api-client";
import { useLocaleFormat } from "@/lib/use-locale-format";

type AuditEntry = {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

const ACTION_COLOR: Record<string, "default" | "secondary" | "warning" | "destructive" | "success"> = {
  POST: "success",
  PATCH: "warning",
  PUT: "warning",
  DELETE: "destructive",
};

const PAGE_SIZE = 30;

export default function AuditLogPage() {
  const t = useTranslations("common");
  const tAudit = useTranslations("audit");
  const { dateTime } = useLocaleFormat();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", { page, action: actionFilter }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize: PAGE_SIZE };
      if (actionFilter) params.action = actionFilter;
      const { data: d } = await api.get<Paginated<AuditEntry>>("/audit-logs", { params });
      return d;
    },
  });

  return (
    <PermissionGate permission={PERMISSIONS.AUDIT_VIEW}>
      <PageHeader title={tAudit("title")} description={tAudit("subtitle")} />
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <span className="text-sm font-medium">{tAudit("filter")}</span>
            {["", "POST", "PATCH", "DELETE"].map((a) => (
              <Button key={a} variant={actionFilter === a ? "default" : "outline"} size="sm" onClick={() => { setActionFilter(a); setPage(1); }}>
                {a || t("all")}
              </Button>
            ))}
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tAudit("action")}</TableHead>
                  <TableHead>{tAudit("resource")}</TableHead>
                  <TableHead>{tAudit("user")}</TableHead>
                  <TableHead>{tAudit("ip")}</TableHead>
                  <TableHead>{tAudit("time")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell><Badge variant={ACTION_COLOR[e.action] ?? "secondary"}>{e.action}</Badge></TableCell>
                    <TableCell className="max-w-[300px] truncate font-mono text-xs">{e.resource}</TableCell>
                    <TableCell className="text-sm">{e.userId ? e.userId.substring(0, 8) + "…" : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.ip || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{dateTime(e.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && <TableRow><TableCell colSpan={5} className="py-12 text-center text-muted-foreground">{tAudit("noResults")}</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
          {data && (data.pagination?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
              <span>{t("showing", { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, data.pagination?.total ?? 0), total: data.pagination?.total ?? 0 })}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t("previous")}</Button>
                <Button variant="outline" size="sm" disabled={page >= (data.pagination?.totalPages ?? 1)} onClick={() => setPage(p => p + 1)}>{t("next")}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}
