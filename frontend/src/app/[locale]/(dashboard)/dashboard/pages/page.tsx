"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, FileText, Plus, Trash2, Edit3 } from "lucide-react";
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
import { pageService } from "@/services/page-service";
import { ApiError } from "@/lib/api-client";
import type { Page } from "@/types";
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
import { RichTextEditor } from "@/components/editor/rich-text-editor";

const pageSchema = z.object({
  title: z.string().min(1, "शीर्षक आवश्यक छ"),
  titleNepali: z.string().min(1, "नेपाली शीर्षक आवश्यक छ"),
  slug: z.string().min(1, "स्लग आवश्यक छ"),
  content: z.string().min(1, "सामग्री आवश्यक छ"),
  isActive: z.boolean().default(true),
});

type PageFormValues = z.infer<typeof pageSchema>;

export default function PagesDashboardPage() {
  const t = useTranslations("pagesAdmin");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Page | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => pageService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pageService.remove(id),
    onSuccess: () => {
      toast.success(t("list.deleted"));
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      title: "",
      titleNepali: "",
      slug: "",
      content: "",
      isActive: true,
    },
  });

  const saveMutation = useMutation({
    mutationFn: (values: PageFormValues) => {
      if (editingItem) {
        return pageService.update(editingItem.id, values);
      }
      return pageService.create(values);
    },
    onSuccess: () => {
      toast.success(editingItem ? tCommon("save") : tCommon("create"));
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      setIsDialogOpen(false);
      form.reset({ title: "", titleNepali: "", slug: "", content: "", isActive: true });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const handleEdit = (item: Page) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      titleNepali: item.titleNepali,
      slug: item.slug,
      content: item.content,
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({ title: "", titleNepali: "", slug: "", content: "", isActive: true });
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
                <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                <h3 className="font-medium">{t("list.empty")}</h3>
                <p className="text-sm text-muted-foreground">{t("list.emptyDesc")}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("list.headers.title")}</TableHead>
                      <TableHead>{t("list.headers.slug")}</TableHead>
                      <TableHead>{t("list.headers.status")}</TableHead>
                      <TableHead className="text-right">{t("list.headers.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground">{item.titleNepali}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {item.slug}
                        </TableCell>
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? tCommon("edit") : t("list.new")}</DialogTitle>
              <DialogDescription>
                {editingItem ? "पृष्ठ सम्पादन गर्नुहोस्" : "नयाँ स्थिर पृष्ठ सिर्जना गर्नुहोस्"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("new.fields.title")}</Label>
                  <Input placeholder="About Us" {...form.register("title")} />
                  {form.formState.errors.title && (
                    <span className="text-xs text-destructive">{form.formState.errors.title.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("new.fields.titleNepali")}</Label>
                  <Input placeholder="हाम्रो बारेमा" {...form.register("titleNepali")} />
                  {form.formState.errors.titleNepali && (
                    <span className="text-xs text-destructive">{form.formState.errors.titleNepali.message}</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("new.fields.slug")}</Label>
                <Input placeholder="about-us" {...form.register("slug")} />
                {form.formState.errors.slug && (
                  <span className="text-xs text-destructive">{form.formState.errors.slug.message}</span>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("new.fields.content")}</Label>
                <RichTextEditor 
                  value={form.watch("content")} 
                  onChange={(val) => form.setValue("content", val)} 
                />
                {form.formState.errors.content && (
                  <span className="text-xs text-destructive">{form.formState.errors.content.message}</span>
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
