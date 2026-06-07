"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { newsService } from "@/services/news-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const newsSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  titleNepali: z.string().optional(),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  category: z.enum(["ANNOUNCEMENT", "POLICY", "EVENT", "PRESS_RELEASE", "OTHER"]),
});
type NewsInput = z.infer<typeof newsSchema>;

const CATEGORIES = [
  "ANNOUNCEMENT",
  "POLICY",
  "EVENT",
  "PRESS_RELEASE",
  "OTHER",
] as const;

export default function NewNewsPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: { category: "ANNOUNCEMENT" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: NewsInput) => newsService.create(payload),
    onSuccess: () => {
      toast.success("Article created");
      router.push("/dashboard/news");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to create article"),
  });

  return (
    <PermissionGate permission={PERMISSIONS.NEWS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title="New Article"
          description="Publish an announcement, policy brief, or press release."
          actions={
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          }
        />
        <form
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          className="grid gap-6 lg:grid-cols-3"
          noValidate
        >
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleNepali">Title (Nepali)</Label>
                  <Input id="titleNepali" className="font-devanagari" {...register("titleNepali")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea id="excerpt" rows={2} {...register("excerpt")} />
                {errors.excerpt && (
                  <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea id="content" rows={12} {...register("content")} />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) => setValue("category", v as NewsInput["category"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish article
              </Button>
              <p className="text-xs text-muted-foreground">
                Drafts are saved automatically and can be reviewed before publishing.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
