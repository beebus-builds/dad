"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { api, ApiError, type ApiResponse } from "@/lib/api-client";
import { useLocaleFormat } from "@/lib/use-locale-format";

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
  const { date } = useLocaleFormat();
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
      toast.success("Branch deactivated");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return (
    <PermissionGate permission={PERMISSIONS.BRANCHES_MANAGE}>
      <PageHeader title="Branches" description="Manage organisation branches and offices" />
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-muted-foreground">{branches?.length ?? 0} branches</p>
            <Button variant="union" size="sm"><Plus className="mr-2 h-4 w-4" />Add Branch</Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches?.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}{b.nameNepali && <span className="ml-1 text-muted-foreground">({b.nameNepali})</span>}</TableCell>
                    <TableCell>{b.provinceCode}</TableCell>
                    <TableCell>{b.districtCode}</TableCell>
                    <TableCell className="text-sm">{b.contactEmail || b.contactPhone || "—"}</TableCell>
                    <TableCell><Badge variant={b.isActive ? "success" : "secondary"}>{b.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" disabled={!b.isActive} onClick={() => deactivateMutation.mutate(b.id)}>Deactivate</Button>
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
