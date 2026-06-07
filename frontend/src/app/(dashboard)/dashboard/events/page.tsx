"use client";

import Link from "next/link";
import { Calendar, MapPin, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";

const EVENTS = [
  {
    id: "evt-1",
    title: "National Workers Convention 2026",
    titleNepali: "राष्ट्रिय श्रमिक सम्मेलन २०८३",
    date: "2026-06-21",
    location: "Bhrikutimandap, Kathmandu",
    registered: 1240,
    capacity: 2000,
    status: "PUBLISHED",
    category: "CONFERENCE",
  },
  {
    id: "evt-2",
    title: "OSH Awareness Workshop",
    date: "2026-06-28",
    location: "Birgunj, Province 2",
    registered: 220,
    capacity: 300,
    status: "PUBLISHED",
    category: "WORKSHOP",
  },
  {
    id: "evt-3",
    title: "Migrant Workers Rights Rally",
    date: "2026-07-05",
    location: "Maitighar, Kathmandu",
    registered: 540,
    capacity: 5000,
    status: "DRAFT",
    category: "RALLY",
  },
];

export default function EventsDashboardPage() {
  return (
    <PermissionGate permission={PERMISSIONS.EVENTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Events"
          description="Plan, publish and monitor union events across Nepal."
          actions={
            <PermissionGate permission={PERMISSIONS.EVENTS_WRITE} fallback={null}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Create Event
              </Button>
            </PermissionGate>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {EVENTS.map((e) => {
            const pct = Math.round((e.registered / e.capacity) * 100);
            return (
              <Card key={e.id} className="overflow-hidden">
                <div className="h-28 gradient-union" aria-hidden />
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="govt">{e.category}</Badge>
                    <Badge variant={e.status === "PUBLISHED" ? "success" : "secondary"}>
                      {e.status}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{e.title}</CardTitle>
                  {e.titleNepali && (
                    <p className="font-devanagari text-sm text-muted-foreground">
                      {e.titleNepali}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> {formatDate(e.date)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {e.location}
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" /> {e.registered} / {e.capacity}
                      </span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-govt-blue to-union-red"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/events/${e.id}`}>Manage</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PermissionGate>
  );
}
