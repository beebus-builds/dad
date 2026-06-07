"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Filter, Plus, Search, UserPlus, Loader2 } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate, getInitials } from "@/lib/utils";
import { memberService, type MemberListParams } from "@/services/members-service";
import { ApiError } from "@/lib/api-client";
import type { Member } from "@/types";

const STATUS_VARIANT: Record<Member["status"], "success" | "secondary" | "warning" | "destructive"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  EXPIRED: "warning",
  SUSPENDED: "destructive",
};

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Member["status"]>("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const params: MemberListParams = {
    page,
    pageSize: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["members", params],
    queryFn: () => memberService.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => memberService.remove(id),
    onSuccess: () => {
      toast.success("Member deleted");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || "Failed to delete member");
    },
  });

  const handleExport = () => {
    if (!data?.data.length) {
      toast.info("No data to export");
      return;
    }
    const csv = [
      ["Membership #", "Full Name", "Phone", "Email", "Branch", "Tier", "Status", "Joined"].join(","),
      ...data.data.map((m) =>
        [m.membershipNumber, m.fullName, m.phone, m.email ?? "", m.branchName ?? m.branchId, m.tier, m.status, m.joinedAt]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <PermissionGate permission={PERMISSIONS.MEMBERS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Members"
          description="Manage union membership across all branches and provinces."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
              <PermissionGate permission={PERMISSIONS.MEMBERS_WRITE} fallback={null}>
                <Button size="sm" asChild>
                  <Link href="/dashboard/members/new">
                    <UserPlus className="h-4 w-4" /> Add Member
                  </Link>
                </Button>
              </PermissionGate>
            </>
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
                  placeholder="Search by name, ID or phone…"
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="EXPIRED">Expired</option>
              </select>
              <Button variant="outline" size="icon" aria-label="More filters">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading members…
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Failed to load members: {(error as ApiError).message}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={Plus}
                title="No members match your search"
                description="Try adjusting your filters or adding a new member."
              />
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Membership #</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>{getInitials(m.fullName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{m.fullName}</div>
                                <div className="text-xs text-muted-foreground">{m.phone}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {m.membershipNumber}
                          </TableCell>
                          <TableCell>{m.branchName ?? m.branchId}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{m.tier}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(m.joinedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/members/${m.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
                    </span>
                    <div className="flex gap-2">
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
