"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Link } from "@/lib/i18n-navigation";
import { PERMISSIONS } from "@/lib/rbac";
import { api, type ApiResponse, ApiError } from "@/lib/api-client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [orgForm, setOrgForm] = useState<Record<string, string>>({});

  const { data: orgSettings, isLoading: orgLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, string>>>("/settings");
      return data.data;
    },
  });

  useEffect(() => {
    if (orgSettings) setOrgForm(orgSettings);
  }, [orgSettings]);

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      await api.put("/settings", payload);
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; name: string }[]>("/branches");
      return data;
    },
  });

  return (
    <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("subtitle")} />
        <Tabs defaultValue="organisation">
          <TabsList>
            <TabsTrigger value="organisation">{t("tabs.organisation") || "Organisation"}</TabsTrigger>
            <TabsTrigger value="branches">{t("tabs.branches") || "Branches"}</TabsTrigger>
            <TabsTrigger value="security">{t("tabs.security") || "Security"}</TabsTrigger>
            <TabsTrigger value="integrations">{t("tabs.integrations") || "Integrations"}</TabsTrigger>
          </TabsList>
          <TabsContent value="organisation">
            <Card>
              <CardHeader>
                <CardTitle>{t("organisation.title") || "Organisation profile"}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {orgLoading ? (
                  <div className="col-span-2 flex items-center justify-center py-8"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="org-name">{t("organisation.name") || "Name"}</Label>
                      <Input id="org-name" value={orgForm.name || ""} onChange={(e) => setOrgForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-name-ne">{t("organisation.nameNepali") || "Name (Nepali)"}</Label>
                      <Input id="org-name-ne" className="font-devanagari" value={orgForm.nameNepali || ""} onChange={(e) => setOrgForm(p => ({ ...p, nameNepali: e.target.value }))} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="org-tagline">{t("organisation.tagline") || "Tagline"}</Label>
                      <Input id="org-tagline" value={orgForm.tagline || ""} onChange={(e) => setOrgForm(p => ({ ...p, tagline: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-email">{t("organisation.email") || "Public email"}</Label>
                      <Input id="org-email" type="email" value={orgForm.email || ""} onChange={(e) => setOrgForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-phone">{t("organisation.phone") || "Phone"}</Label>
                      <Input id="org-phone" value={orgForm.phone || ""} onChange={(e) => setOrgForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(orgForm)}>
                        {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {tCommon("save")}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="branches">
            <Card>
              <CardHeader>
                <CardTitle>{t("branches.title") || "Branch management"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {branches ? `${branches.length} branches across all provinces.` : t("branches.description") || "Manage 80+ branches across all 7 provinces."}
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/branches">{t("branches.manage") || "Manage branches"}</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>{t("security.title") || "Security & access"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingRow title={t("security.twoFactor") || "Two-factor authentication"} description={t("security.twoFactorDesc") || "Require admin users to set up 2FA on login."} action={<Button variant="outline">{t("security.enforce") || "Enforce"}</Button>} />
                <Separator />
                <SettingRow title={t("security.sessionTimeout") || "Session timeout"} description={t("security.sessionTimeoutDesc") || "Automatically sign out idle users after 30 minutes."} action={<Button variant="outline">{t("security.configure") || "Configure"}</Button>} />
                <Separator />
                <SettingRow title={t("security.auditLog") || "Audit log retention"} description={t("security.auditLogDesc") || "Storing 2 years of audit data."} action={<Button variant="outline">{t("security.adjust") || "Adjust"}</Button>} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>{t("integrations.title") || "Integrations"}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  { name: "eSewa", enabled: true },
                  { name: "Khalti", enabled: true },
                  { name: "Sentry", enabled: false },
                  { name: "Better Stack", enabled: false },
                  { name: "Cloudflare R2", enabled: true },
                  { name: "Twilio SMS", enabled: false },
                ].map((i) => (
                  <div key={i.name} className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <p className="font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.enabled ? (t("connected") || "Connected") : (t("notConfigured") || "Not configured")}</p>
                    </div>
                    <Button variant={i.enabled ? "outline" : "default"} size="sm">
                      {i.enabled ? (t("manage") || "Manage") : (t("connect") || "Connect")}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGate>
  );
}

function SettingRow({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
