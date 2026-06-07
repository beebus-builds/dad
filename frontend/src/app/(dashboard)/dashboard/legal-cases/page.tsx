"use client";

import { Gavel, Plus, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatDate } from "@/lib/utils";

const CASES = [
  {
    id: "leg-1",
    caseNumber: "LEG-3322",
    title: "Wage fraud — Saudi Arabia recruitment",
    type: "FOREIGN_EMPLOYMENT",
    status: "ACTIVE",
    memberName: "Bishnu Lama",
    advisor: "Adv. Sapana Pradhan",
    filedAt: "2026-03-12",
    nextHearingAt: "2026-06-25",
  },
  {
    id: "leg-2",
    caseNumber: "LEG-3318",
    title: "Collective bargaining — Garment factory",
    type: "COLLECTIVE_BARGAINING",
    status: "HEARING",
    memberName: "GEFONT Branch",
    advisor: "Adv. Sushil KC",
    filedAt: "2026-02-04",
    nextHearingAt: "2026-06-22",
  },
  {
    id: "leg-3",
    caseNumber: "LEG-3309",
    title: "Worker fatality compensation",
    type: "OSH",
    status: "INTAKE",
    memberName: "Family of late R. Karki",
    advisor: "Unassigned",
    filedAt: "2026-05-30",
  },
];

const TYPE_LABELS: Record<string, string> = {
  FOREIGN_EMPLOYMENT: "Foreign Employment",
  LABOR_DISPUTE: "Labour Dispute",
  OSH: "Occupational Safety",
  COLLECTIVE_BARGAINING: "Collective Bargaining",
  OTHER: "Other",
};

export default function LegalCasesPage() {
  return (
    <PermissionGate permission={PERMISSIONS.LEGAL_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Legal Cases"
          description="Track foreign employment, OSH, bargaining and labour dispute cases."
          actions={
            <PermissionGate permission={PERMISSIONS.LEGAL_WRITE} fallback={null}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New case
              </Button>
            </PermissionGate>
          }
        />
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Active", value: 42, icon: Scale },
            { label: "In Hearing", value: 11, icon: Gavel },
            { label: "Resolved (YTD)", value: 67, icon: Scale },
            { label: "Intake Pending", value: 8, icon: Scale },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead>Next Hearing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CASES.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.caseNumber}</TableCell>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{TYPE_LABELS[c.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          c.status === "ACTIVE"
                            ? "warning"
                            : c.status === "HEARING"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{c.memberName}</TableCell>
                    <TableCell className="text-sm">{c.advisor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.nextHearingAt ? formatDate(c.nextHearingAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
