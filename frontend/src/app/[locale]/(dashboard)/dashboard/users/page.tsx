"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { userService } from "@/services/user-service";
import { ROLE_LABELS } from "@/lib/rbac";
import { ApiError } from "@/lib/api-client";

const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  SUPER_ADMIN: "destructive",
  NATIONAL_ADMIN: "default",
  PROVINCE_ADMIN: "default",
  DISTRICT_ADMIN: "secondary",
  BRANCH_ADMIN: "secondary",
  MEMBER: "outline",
};

const PAGE_SIZE = 20;

export default function UsersPage() {
  const t = useTranslations("common");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { date } = useLocaleFormat();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", { page, search }],
    queryFn: () => userService.list({ page, pageSize: PAGE_SIZE, search: search || undefined }),
  });

  return (
    <PermissionGate permission={PERMISSIONS.USERS_MANAGE}>
      <PageHeader title="Users" description="Manage staff accounts and permissions" />
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…" />
            </div>
            <Button variant="union" onClick={() => {}}><UserPlus className="mr-2 h-4 w-4" />Add User</Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : !data?.data.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("noResults")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge variant={ROLE_VARIANT[u.role] ?? "outline"}>{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role}</Badge></TableCell>
                    <TableCell><Badge variant={u.isActive ? "success" : "secondary"}>{u.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.lastLoginAt ? date(u.lastLoginAt) : "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {data && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
              <span>{t("showing", { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, data.pagination.total), total: data.pagination.total })}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t("previous")}</Button>
                <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)}>{t("next")}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}
