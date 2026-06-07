"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";

const NOTIFS = [
  { id: 1, title: "Urgent complaint escalated", body: "CMP-2104 needs senior review.", type: "ERROR", unread: true, at: "12 min ago" },
  { id: 2, title: "Event approval needed", body: "Migrant Rally awaiting approval.", type: "WARNING", unread: true, at: "1 hour ago" },
  { id: 3, title: "New donation received", body: "Ananda Foundation donated NPR 250,000.", type: "SUCCESS", unread: false, at: "Yesterday" },
  { id: 4, title: "Monthly report ready", body: "May 2026 KPI report has been generated.", type: "INFO", unread: false, at: "2 days ago" },
];

const VARIANT = {
  INFO: "secondary",
  WARNING: "warning",
  SUCCESS: "success",
  ERROR: "destructive",
} as const;

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="System alerts and personal mentions."
        actions={
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />
      <Card>
        <CardContent className="divide-y p-0">
          {NOTIFS.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 ${n.unread ? "bg-primary/5" : ""}`}
            >
              <div className="mt-1 rounded-md bg-muted p-2">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  <Badge variant={VARIANT[n.type as keyof typeof VARIANT]}>{n.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="text-xs text-muted-foreground">{n.at}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
