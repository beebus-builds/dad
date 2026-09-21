"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n-navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Filter, Upload, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Link } from "@/lib/i18n-navigation";
import { PERMISSIONS } from "@/lib/rbac";
import { getInitials } from "@/lib/utils";
import { useLocaleFormat } from "@/lib/use-locale-format";
import { memberService, type MemberListParams } from "@/services/members-service";
import { ApiError } from "@/lib/api-client";
import type { Member } from "@/types";

const STATUS_VARIANT: Record<Member["status"], "success" | "secondary" | "warning" | "destructive"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  EXPIRED: "warning",
  SUSPENDED: "destructive",
};

const PAGE_SIZE = 20;

export default function MembersPage() {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("members.status");
  const tTier = useTranslations("members.tier");
  const router = useRouter();
  const { date } = useLocaleFormat();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Member["status"]>("");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors?: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const params: MemberListParams = {
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: statusFilter || undefined,
    tag: tagFilter || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["members", params],
    queryFn: () => memberService.list(params),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => memberService.remove(id),
    onSuccess: () => {
      toast.success(t("list.deleted"));
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message || t("list.deleteFailed"));
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => memberService.importCsv(file),
    onSuccess: (res) => {
      setImportResult(res);
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.message);
    },
  });

  const handleImport = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }
    setImportResult(null);
    importMutation.mutate(file);
  };

  const handleExport = () => {
    if (!data?.data.length) {
      toast.info(t("list.noData"));
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

  const columns: DataTableColumn<Member>[] = [
    {
      key: "member",
      header: t("list.headers.member"),
      cell: (m) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{getInitials(m.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{m.fullName}</div>
            <div className="text-xs text-muted-foreground">{m.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: "membershipNumber",
      header: t("list.headers.membershipNumber"),
      className: "font-mono text-xs",
      cell: (m) => m.membershipNumber,
    },
    {
      key: "branch",
      header: t("list.headers.branch"),
      cell: (m) => m.branchName ?? m.branchId,
    },
    {
      key: "tier",
      header: t("list.headers.tier"),
      cell: (m) => <Badge variant="outline">{tTier(m.tier as "STANDARD" | "LIFETIME" | "HONORARY")}</Badge>,
    },
    {
      key: "status",
      header: t("list.headers.status"),
      cell: (m) => <Badge variant={STATUS_VARIANT[m.status]}>{tStatus(m.status)}</Badge>,
    },
    {
      key: "joined",
      header: t("list.headers.joined"),
      className: "text-sm text-muted-foreground",
      cell: (m) => date(m.joinedAt),
    },
    {
      key: "actions",
      header: t("list.headers.actions"),
      className: "text-right",
      cell: (m) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/members/${m.id}`}>{t("list.view")}</Link>
        </Button>
      ),
    },
  ];

  return (
    <PermissionGate permission={PERMISSIONS.MEMBERS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={t("list.title")}
          description={t("list.subtitle")}
          actions={
            <>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" /> {t("list.exportCsv")}
              </Button>
              <PermissionGate permission={PERMISSIONS.MEMBERS_WRITE} fallback={null}>
                <Dialog open={importOpen} onOpenChange={setImportOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" /> {t("list.importCsv")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("list.importTitle")}</DialogTitle>
                      <DialogDescription>{t("list.importDesc")}</DialogDescription>
                    </DialogHeader>
                    {importResult ? (
                      <div className="space-y-2 text-sm">
                        <p className="text-success">{t("list.importDone", { n: importResult.imported })}</p>
                        {importResult.skipped > 0 && (
                          <p className="text-muted-foreground">{t("list.importSkipped", { n: importResult.skipped })}</p>
                        )}
                        {importResult.errors && importResult.errors.length > 0 && (
                          <ul className="max-h-32 overflow-y-auto rounded border bg-muted p-2 text-xs text-destructive">
                            {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Input ref={fileRef} type="file" accept=".csv" />
                        {importMutation.isPending && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> {t("list.importing")}
                          </div>
                        )}
                      </div>
                    )}
                    <DialogFooter>
                      {importResult ? (
                        <Button onClick={() => { setImportOpen(false); setImportResult(null); }}>{tCommon("close")}</Button>
                      ) : (
                        <Button onClick={handleImport} disabled={importMutation.isPending}>
                          {t("list.importBtn")}
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button size="sm" asChild>
                  <Link href="/dashboard/members/new">
                    <UserPlus className="h-4 w-4" /> {t("list.add")}
                  </Link>
                </Button>
              </PermissionGate>
            </>
          }
        />
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <FilterBar
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              searchPlaceholder={t("list.search")}
              selects={[
                {
                  key: "status",
                  value: statusFilter,
                  onChange: (v) => {
                    setStatusFilter(v as typeof statusFilter);
                    setPage(1);
                  },
                  options: [
                    { value: "", label: t("list.allStatuses") },
                    { value: "ACTIVE", label: tStatus("ACTIVE") },
                    { value: "INACTIVE", label: tStatus("INACTIVE") },
                    { value: "SUSPENDED", label: tStatus("SUSPENDED") },
                    { value: "EXPIRED", label: tStatus("EXPIRED") },
                  ],
                },
              ]}
            >
              <Input
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                placeholder={t("list.filterByTag")}
                className="sm:w-40"
              />
              <Button variant="outline" size="icon" aria-label={t("list.moreFilters")}>
                <Filter className="h-4 w-4" />
              </Button>
            </FilterBar>

            <DataTable
              columns={columns}
              data={items}
              rowKey={(m) => m.id}
              isLoading={isLoading}
              isError={isError}
              errorMessage={(error as ApiError)?.message}
              loadingLabel={t("list.loading")}
              emptyIcon={UserPlus}
              emptyTitle={t("list.noResults")}
              emptyDescription={t("list.noResultsDesc")}
              pagination={{
                page,
                totalPages,
                total,
                pageSize: PAGE_SIZE,
                onPageChange: setPage,
                showingLabel: tCommon("showing", {
                  from: (page - 1) * PAGE_SIZE + 1,
                  to: Math.min(page * PAGE_SIZE, total),
                  total,
                }),
                previousLabel: tCommon("previous"),
                nextLabel: tCommon("next"),
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
