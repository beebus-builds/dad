"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { useLocaleFormat } from "@/lib/use-locale-format";
import { donationService, type DonationListParams } from "@/services/donations-service";
import { ApiError } from "@/lib/api-client";

const METHODS = ["CASH", "BANK_TRANSFER", "ESEWA", "KHALTI", "CARD"] as const;
type Method = (typeof METHODS)[number];

export default function DonationsPage() {
  const t = useTranslations("donations");
  const tMethod = useTranslations("donations.method");
  const tStatus = useTranslations("donations.status");
  const tCommon = useTranslations("common");
  const { currency, number, date } = useLocaleFormat();
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<Method | "">("");

  const params: DonationListParams = {
    page: 1,
    pageSize: 50,
    status: "COMPLETED",
    method: methodFilter || undefined,
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
          title={t("list.title")}
          description={t("list.subtitle")}
          actions={
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> {t("list.export")}
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("list.stats.totalRaised")}</p>
                  <p className="mt-1 text-2xl font-bold">
                    {total != null ? currency(total, "NPR") : "—"}
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
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("list.stats.thisMonth")}</p>
                  <p className="mt-1 text-2xl font-bold">{filtered.length}</p>
                  <p className="text-xs text-muted-foreground">{t("list.stats.transactions")}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("list.stats.average")}</p>
              <p className="mt-1 text-2xl font-bold">
                {filtered.length > 0
                  ? currency(
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
                  placeholder={t("list.search")}
                  className="pl-9"
                />
              </div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as Method | "")}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t("list.allMethods")}</option>
                {METHODS.map((m) => (
                  <option key={m} value={m}>{tMethod(m)}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("list.loading")}
              </div>
            ) : isError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {(error as ApiError).message}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("list.headers.receipt")}</TableHead>
                      <TableHead>{t("list.headers.donor")}</TableHead>
                      <TableHead>{t("list.headers.amount")}</TableHead>
                      <TableHead>{t("list.headers.method")}</TableHead>
                      <TableHead>{t("list.headers.purpose")}</TableHead>
                      <TableHead>{t("list.headers.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                          {t("list.noResults")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono text-xs">{d.receiptNumber}</TableCell>
                          <TableCell>
                            <div className="font-medium">{d.donorName}</div>
                            {d.donorEmail && (
                              <div className="text-xs text-muted-foreground">{d.donorEmail}</div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{currency(d.amount, d.currency)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{tMethod(d.method as Method)}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{d.purpose ?? "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{date(d.createdAt)}</TableCell>
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
