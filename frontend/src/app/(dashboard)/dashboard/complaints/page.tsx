"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { Complaint } from "@/types";

const MOCK: Complaint[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `cmp-${i + 1}`,
  ticketNumber: `CMP-2${(100 + i).toString()}`,
  title: [
    "Wage withheld for 3 months",
    "Unsafe workplace - no helmets provided",
    "Forced overtime beyond legal limit",
    "Termination without notice",
    "Sexual harassment at site",
    "Denied PF benefits",
    "Discrimination based on caste",
    "Recruitment fee fraud",
    "Workplace injury - no compensation",
    "Bonus not paid for festival",
  ][i],
  description: "Detailed description of the complaint…",
  category: ["WAGES", "SAFETY", "WORKING_HOURS", "TERMINATION", "HARASSMENT"][i % 5] as Complaint["category"],
  priority: ["HIGH", "URGENT", "MEDIUM", "LOW"][i % 4] as Complaint["priority"],
  status: ["OPEN", "IN_REVIEW", "ESCALATED", "RESOLVED", "CLOSED"][i % 5] as Complaint["status"],
  submittedBy: { id: `mem-${i}`, name: ["Ram Shrestha", "Sita Magar", "Hari Thapa"][i % 3] },
  createdAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  updatedAt: new Date().toISOString(),
}));

const STATUS_VARIANT: Record<Complaint["status"], "secondary" | "warning" | "destructive" | "success"> = {
  OPEN: "warning",
  IN_REVIEW: "secondary",
  ESCALATED: "destructive",
  RESOLVED: "success",
  CLOSED: "secondary",
};

const PRIORITY_VARIANT: Record<Complaint["priority"], "outline" | "warning" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "outline",
  HIGH: "warning",
  URGENT: "destructive",
};

export default function ComplaintsPage() {
  const [tab, setTab] = useState<"all" | Complaint["status"]>("all");
  const [search, setSearch] = useState("");
  const filtered = MOCK.filter(
    (c) =>
      (tab === "all" || c.status === tab) &&
      (c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.ticketNumber.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <PermissionGate permission={PERMISSIONS.COMPLAINTS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Complaints"
          description="Track grievances raised by members and resolve them across branches."
          actions={
            <PermissionGate permission={PERMISSIONS.COMPLAINTS_WRITE} fallback={null}>
              <Button size="sm" asChild>
                <Link href="/dashboard/complaints/new">
                  <Plus className="h-4 w-4" /> File complaint
                </Link>
              </Button>
            </PermissionGate>
          }
        />
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="OPEN">Open</TabsTrigger>
                  <TabsTrigger value="IN_REVIEW">In Review</TabsTrigger>
                  <TabsTrigger value="ESCALATED">Escalated</TabsTrigger>
                  <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex flex-1 gap-2 sm:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ticket or title…"
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted by</TableHead>
                    <TableHead>Filed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.ticketNumber}</TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/complaints/${c.id}`}
                          className="font-medium hover:underline"
                        >
                          {c.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.category.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PRIORITY_VARIANT[c.priority]}>
                          {c.priority === "URGENT" && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {c.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[c.status]}>
                          {c.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{c.submittedBy.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}
