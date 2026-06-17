"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ListOrdered, Plus, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { menuService } from "@/services/menu-service";
import { ApiError } from "@/lib/api-client";
import type { MenuItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const menuSchema = z.object({
  label: z.string().min(1, "लेबल आवश्यक छ"),
  href: z.string().min(1, "लिङ्क आवश्यक छ"),
  sortOrder: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
});

type MenuFormValues = z.infer<typeof menuSchema>;

export default function MenuManagementPage() {
  const t = useTranslations("menusAdmin");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-menus"],
    queryFn: () => menuService.adminList(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuService.remove(id),
    onSuccess: () => {
      toast.success(t("list.deleted"));
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      label: "",
      href: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: MenuFormValues) => {
      if (editingItem) {
        return menuService.update(editingItem.id, values);
      }
      return menuService.create(values);
    },
    onSuccess: () => {
      toast.success(editingItem ? tCommon("save") : tCommon("create"));
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
      setIsDialogOpen(false);
      form.reset({ label: "", href: "", sortOrder: 0, isActive: true });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      label: item.label,
      href: item.href,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({ label: "", href: "", sortOrder: 0, isActive: true });
    setIsDialogOpen(true);
  };

  const items = data?.data ?? [];

  return (
    <PermissionGate permission={PERMISSIONS.USERS_MANAGE}>
      <div className="space-y-6">
        <PageHeader
          title={t("list.title")}
          description={t("list.subtitle")}
          actions={
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> {t("list.new")}
            </Button>
          }
        />

        <Card>
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("list.loading")}
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {(error as ApiError).message}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ListOrdered className="mb-2 h-8 w-8 text-muted-foreground" />
                <h3 className="font-medium">{t("list.empty")}</h3>
                <p className="text-sm text-muted-foreground">{t("list.emptyDesc")}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("list.headers.label")}</TableHead>
                      <TableHead>{t("list.headers.href")}</TableHead>
                      <TableHead>{t("list.headers.order")}</TableHead>
                      <TableHead>{t("list.headers.status")}</TableHead>
                      <TableHead className="text-right">{t("list.headers.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {item.href}
                        </TableCell>
                        <TableCell>{item.sortOrder}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {item.isActive ? "सक्रिय" : "निष्क्रिय"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm(t("list.deleteConfirm"))) {
                                  deleteMutation.mutate(item.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? tCommon("edit") : t("list.new")}</DialogTitle>
              <DialogDescription>
                {editingItem ? "मेनु आइटम सम्पादन गर्नुहोस्" : "नयाँ मेनु आइटम थप्नुहोस्"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("new.fields.label")}</Label>
                <Input placeholder="गृहपृष्ठ" {...form.register("label")} />
                {form.formState.errors.label && (
                  <span className="text-xs text-destructive">{form.formState.errors.label.message}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("new.fields.href")}</Label>
                <Input placeholder="/about" {...form.register("href")} />
                {form.formState.errors.href && (
                  <span className="text-xs text-destructive">{form.formState.errors.href.message}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("new.fields.order")}</Label>
                <Input type="number" {...form.register("sortOrder")} />
                {form.formState.errors.sortOrder && (
                  <span className="text-xs text-destructive">{form.formState.errors.sortOrder.message}</span>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("new.submit")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGate>
  );
}
