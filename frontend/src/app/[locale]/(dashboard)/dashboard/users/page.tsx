"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const tUsers = useTranslations("users");
  const tRole = (role: string) => {
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: "सुपर एडमिन",
      NATIONAL_ADMIN: "राष्ट्रिय एडमिन",
      PROVINCE_ADMIN: "प्रदेश एडमिन",
      DISTRICT_ADMIN: "जिल्ला एडमिन",
      BRANCH_ADMIN: "शाखा एडमिन",
      MEMBER: "सदस्य",
      PUBLIC: "सार्वजनिक",
    };
    return roleMap[role] ?? role;
  };
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { date } = useLocaleFormat();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "MEMBER", branchId: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["users", { page, search }],
    queryFn: () => userService.list({ page, pageSize: PAGE_SIZE, search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: () => userService.create(form),
    onSuccess: () => {
      toast.success(tUsers("created"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      setForm({ fullName: "", email: "", phone: "", password: "", role: "MEMBER", branchId: "" });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      toast.success(tUsers("deleted"));
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  return (
    <PermissionGate permission={PERMISSIONS.USERS_MANAGE}>
      <PageHeader title={tUsers("title")} description={tUsers("subtitle")} />
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={tUsers("search")} />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="union"><UserPlus className="mr-2 h-4 w-4" />{tUsers("addUser")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{tUsers("createUser")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ufn">{tUsers("fullName")}</Label>
                    <Input id="ufn" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uem">{tUsers("email")}</Label>
                    <Input id="uem" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uph">{tUsers("phone")}</Label>
                    <Input id="uph" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upw">{tUsers("password")}</Label>
                    <PasswordInput id="upw" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{tUsers("role")}</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([key]) => (
                          <SelectItem key={key} value={key}>{tRole(key)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("save")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : !data?.data.length ? (
            <div className="py-12 text-center text-muted-foreground">{t("noResults")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tUsers("name")}</TableHead>
                  <TableHead>{tUsers("email")}</TableHead>
                  <TableHead>{tUsers("role")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{tUsers("lastLogin")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge variant={ROLE_VARIANT[u.role] ?? "outline"}>{tRole(u.role)}</Badge></TableCell>
                    <TableCell><Badge variant={u.isActive ? "success" : "secondary"}>{u.isActive ? tUsers("active") : tUsers("inactive")}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.lastLoginAt ? date(u.lastLoginAt) : "—"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title={t("delete")}
                        onClick={() => {
                          if (confirm(tUsers("deleteConfirm"))) {
                            deleteMutation.mutate(u.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {data && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
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
