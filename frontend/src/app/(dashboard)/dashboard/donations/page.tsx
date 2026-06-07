"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Heart, Loader2, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency, formatDate } from "@/lib/utils";
import { donationService, type DonationListParams } from "@/services/donations-service";
import { ApiError } from "@/lib/api-client";

export default function DonationsPage() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const params: DonationListParams = {
    page: 1,
    pageSize: 50,
    status: "COMPLETED",
    method: (methodFilter as never) || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["donations", params],
    queryFn: () => donationService.list(params),
  });

  const { data: total } = useQuery({
    queryKey: ["donations-total"],
    queryFn: () => donationService.total(),
  });

  const items = data?.data ?? [];
  const filtered = search
    ? items.filter(
        (d) =>
          d.donorName.toLowerCase().includes(search.toLowerCase()) ||
          (d.receiptNumber ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  return (
    <PermissionGate permission={PERMISSIONS.DONATIONS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Donations"
          description="Track contributions from members, partners, and well-wishers."
          actions={
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total raised
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {total != null ? formatCurrency(total, "NPR") : "—"}
                  </p>
                </div>
                <Heart className="h-5 w-5 text-union-red" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    This month
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {filtered.length > 0 ? filtered.length : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">transactions</p>
                </div>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Average gift
              </p>
              <p className="mt-1 text-2xl font-bold">
                {filtered.length > 0
                  ? formatCurrency(
                      filtered.reduce((s, d) => s + d.amount, 0) / filtered.length,
                      "NPR",
                    )
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search donor or receipt…"
                  className="pl-9"
                />
              </div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All methods</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="ESEWA">eSewa</option>
                <option value="KHALTI">Khalti</option>
                <option value="CARD">Card</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading donations…
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Failed to load donations: {(error as ApiError).message}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                          No donations yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono text-xs">
                            {d.receiptNumber}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{d.donorName}</div>
                            {d.donorEmail && (
                              <div className="text-xs text-muted-foreground">{d.donorEmail}</div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(d.amount, d.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{d.method.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {d.purpose ?? "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(d.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
