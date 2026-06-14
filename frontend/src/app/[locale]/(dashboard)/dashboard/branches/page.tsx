"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PERMISSIONS } from "@/lib/rbac";
import { api, ApiError } from "@/lib/api-client";

type Branch = {
  id: string;
  name: string;
  nameNepali: string | null;
  provinceCode: string;
  districtCode: string;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function BranchesPage() {
  const t = useTranslations("common");
  const tBranches = useTranslations("branchesAdmin");
  const queryClient = useQueryClient();

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data } = await api.get<Branch[]>("/branches");
      return data;
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/branches/${id}`, { isActive: false });
    },
    onSuccess: () => {
      toast.success(tBranches("deactivated"));
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return (
    <PermissionGate permission={PERMISSIONS.BRANCHES_MANAGE}>
      <PageHeader title={tBranches("title")} description={tBranches("subtitle")} />
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">{tBranches("count", { count: branches?.length ?? 0 })}</p>
            <Button variant="union" size="sm"><Plus className="mr-2 h-4 w-4" />{tBranches("addBranch")}</Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : !branches?.length ? (
            <EmptyState
              icon={Building2}
              title={tBranches("empty")}
              description={tBranches("emptyDesc")}
              hint={tBranches("emptyHint")}
              action={<Button variant="union" size="sm"><Plus className="mr-2 h-4 w-4" />{tBranches("addBranch")}</Button>}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tBranches("name")}</TableHead>
                  <TableHead>{tBranches("province")}</TableHead>
                  <TableHead>{tBranches("district")}</TableHead>
                  <TableHead>{tBranches("contact")}</TableHead>
                  <TableHead>{tBranches("status")}</TableHead>
                  <TableHead>{tBranches("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches?.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}{b.nameNepali && <span className="ml-1 text-muted-foreground">({b.nameNepali})</span>}</TableCell>
                    <TableCell>{b.provinceCode}</TableCell>
                    <TableCell>{b.districtCode}</TableCell>
                    <TableCell className="text-sm">{b.contactEmail || b.contactPhone || "—"}</TableCell>
                    <TableCell><Badge variant={b.isActive ? "success" : "secondary"}>{b.isActive ? tBranches("active") : tBranches("inactive")}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" disabled={!b.isActive} onClick={() => deactivateMutation.mutate(b.id)}>{tBranches("deactivate")}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PermissionGate>
  );
}
