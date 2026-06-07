"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";

export default function SettingsPage() {
  return (
    <PermissionGate permission={PERMISSIONS.SETTINGS_MANAGE}>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure organisation, branches, integrations and security."
        />
        <Tabs defaultValue="organisation">
          <TabsList>
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          <TabsContent value="organisation">
            <Card>
              <CardHeader>
                <CardTitle>Organisation profile</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Name</Label>
                  <Input id="org-name" defaultValue="Shram Jagaran" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-name-ne">Name (Nepali)</Label>
                  <Input id="org-name-ne" className="font-devanagari" defaultValue="श्रम जागरण" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="org-tagline">Tagline</Label>
                  <Input id="org-tagline" defaultValue="Workers' Awakening" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Public email</Label>
                  <Input id="org-email" type="email" defaultValue="contact@shramjagaran.np" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input id="org-phone" defaultValue="+977 1 4XXX XXX" />
                </div>
                <div className="sm:col-span-2">
                  <Button>Save</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="branches">
            <Card>
              <CardHeader>
                <CardTitle>Branch management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage 80+ branches across all 7 provinces. Add, edit and assign branch
                  administrators.
                </p>
                <Button className="mt-4">Manage branches</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security &amp; access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingRow
                  title="Two-factor authentication"
                  description="Require admin users to set up 2FA on login."
                  action={<Button variant="outline">Enforce</Button>}
                />
                <Separator />
                <SettingRow
                  title="Session timeout"
                  description="Automatically sign out idle users after 30 minutes."
                  action={<Button variant="outline">Configure</Button>}
                />
                <Separator />
                <SettingRow
                  title="Audit log retention"
                  description="Currently storing 2 years of audit data per compliance policy."
                  action={<Button variant="outline">Adjust</Button>}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
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
                  <div
                    key={i.name}
                    className="flex items-center justify-between rounded-md border p-4"
                  >
                    <div>
                      <p className="font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.enabled ? "Connected" : "Not configured"}
                      </p>
                    </div>
                    <Button variant={i.enabled ? "outline" : "default"} size="sm">
                      {i.enabled ? "Manage" : "Connect"}
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

function SettingRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
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
