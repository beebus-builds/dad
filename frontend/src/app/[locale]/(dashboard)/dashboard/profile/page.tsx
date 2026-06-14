"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { useAuthStore } from "@/stores/auth-store";
import { ROLE_LABELS } from "@/lib/rbac";
import { getInitials } from "@/lib/utils";
import { authService } from "@/services/auth-service";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tRoles = useTranslations("roles");
  const tCommon = useTranslations("common");
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile({ fullName, phone });
      setUser(updated);
      toast.success(tCommon("save"));
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatarUrl} alt="" />
                <AvatarFallback className="text-xl">
                  {getInitials(user?.fullName ?? tCommon("profile"))}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm"
                aria-label={tCommon("edit")}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.fullName ?? tCommon("profile")}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Badge variant="secondary">{user ? tRoles(user.role) : tCommon("profile")}</Badge>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("accountDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("fields.fullName")}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("fields.phone")}</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">{t("fields.email")}</Label>
                <Input id="email" type="email" defaultValue={user?.email} disabled />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("save")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
