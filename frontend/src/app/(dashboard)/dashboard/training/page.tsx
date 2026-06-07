"use client";

import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";

const PROGRAMS = [
  {
    id: "tr-1",
    title: "Occupational Safety Fundamentals",
    titleNepali: "व्यवसायजन्य सुरक्षा आधारभूत",
    location: "Kathmandu",
    startsAt: "2026-07-01",
    endsAt: "2026-07-03",
    capacity: 80,
    registered: 56,
    status: "UPCOMING",
  },
  {
    id: "tr-2",
    title: "Labour Law for Branch Leaders",
    location: "Pokhara",
    startsAt: "2026-06-20",
    endsAt: "2026-06-21",
    capacity: 50,
    registered: 49,
    status: "ONGOING",
  },
  {
    id: "tr-3",
    title: "Digital Literacy for Workers",
    location: "Biratnagar",
    startsAt: "2026-05-12",
    endsAt: "2026-05-14",
    capacity: 60,
    registered: 60,
    status: "COMPLETED",
  },
];

export default function TrainingPage() {
  return (
    <PermissionGate permission={PERMISSIONS.TRAINING_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Training Programmes"
          description="Skill-building and rights education for members across Nepal."
          actions={
            <PermissionGate permission={PERMISSIONS.TRAINING_WRITE} fallback={null}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Add programme
              </Button>
            </PermissionGate>
          }
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PROGRAMS.map((p) => {
            const pct = Math.round((p.registered / p.capacity) * 100);
            const statusVariant =
              p.status === "UPCOMING"
                ? "secondary"
                : p.status === "ONGOING"
                  ? "warning"
                  : "success";
            return (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <Badge variant={statusVariant}>{p.status}</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{p.title}</CardTitle>
                  {p.titleNepali && (
                    <p className="font-devanagari text-sm text-muted-foreground">
                      {p.titleNepali}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>📍 {p.location}</div>
                  <div>
                    🗓 {formatDate(p.startsAt)} – {formatDate(p.endsAt)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span>
                        {p.registered}/{p.capacity} registered
                      </span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PermissionGate>
  );
}
