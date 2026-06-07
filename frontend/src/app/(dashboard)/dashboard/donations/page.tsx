"use client";

import { HandHeart, Receipt } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/utils";

const DONATIONS = [
  {
    id: "d-1",
    receiptNumber: "DON-2026-0421",
    donorName: "Ananda Foundation",
    amount: 250000,
    method: "BANK_TRANSFER",
    status: "COMPLETED",
    purpose: "Migrant worker rescue fund",
    createdAt: "2026-06-01",
  },
  {
    id: "d-2",
    receiptNumber: "DON-2026-0420",
    donorName: "Sushila Pandey",
    amount: 5000,
    method: "ESEWA",
    status: "COMPLETED",
    purpose: "Legal aid programme",
    createdAt: "2026-05-29",
  },
  {
    id: "d-3",
    receiptNumber: "DON-2026-0419",
    donorName: "Anonymous",
    amount: 1000,
    method: "KHALTI",
    status: "PENDING",
    purpose: "",
    createdAt: "2026-05-28",
  },
];

export default function DonationsPage() {
  return (
    <PermissionGate permission={PERMISSIONS.DONATIONS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Donations"
          description="Track and manage donations supporting our programmes."
          actions={
            <PermissionGate permission={PERMISSIONS.DONATIONS_WRITE} fallback={null}>
              <Button size="sm">
                <HandHeart className="h-4 w-4" /> Record donation
              </Button>
            </PermissionGate>
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Raised (YTD)" value={formatCurrency(8_450_000)} accent="union" />
          <StatCard label="Donations this month" value="312" accent="govt" />
          <StatCard label="Avg. donation" value={formatCurrency(2_700)} accent="success" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DONATIONS.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.receiptNumber}</TableCell>
                    <TableCell className="font-medium">{d.donorName}</TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(d.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{d.method}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.purpose || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.status === "COMPLETED" ? "success" : "warning"}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(d.createdAt)}
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "union" | "govt" | "success";
}) {
  const bg = {
    union: "bg-union-red/10 text-union-red",
    govt: "bg-govt-blue/10 text-govt-blue",
    success: "bg-success/10 text-success",
  }[accent];
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`rounded-md p-2 ${bg}`}>
          <Receipt className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
