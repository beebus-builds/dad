"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Filter, Plus, Search, UserPlus } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate, getInitials } from "@/lib/utils";
import type { Member } from "@/types";

const MOCK: Member[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `mem-${i + 1}`,
  membershipNumber: `SJ-${(10240 + i).toString()}`,
  fullName: [
    "Ram Bahadur Shrestha",
    "Sita Kumari Magar",
    "Hari Prasad Thapa",
    "Anita Sharma",
    "Bishnu Lama",
    "Gita Adhikari",
    "Suman Tamang",
    "Ramesh Karki",
    "Kabita Rai",
    "Yam Bahadur K.C.",
    "Sushila Bhatt",
    "Mohan Lamichhane",
  ][i],
  phone: `98${(10000000 + i * 17).toString()}`,
  email: `member${i + 1}@shramjagaran.np`,
  branchId: `branch-${(i % 5) + 1}`,
  branchName: ["Kathmandu Central", "Pokhara", "Biratnagar", "Birgunj", "Butwal"][i % 5],
  tier: ["STANDARD", "LIFETIME", "STANDARD", "HONORARY"][i % 4] as Member["tier"],
  status: ["ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "EXPIRED", "SUSPENDED"][i % 6] as Member["status"],
  joinedAt: new Date(Date.now() - i * 86400000 * 28).toISOString(),
}));

const STATUS_VARIANT: Record<Member["status"], "success" | "secondary" | "warning" | "destructive"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  EXPIRED: "warning",
  SUSPENDED: "destructive",
};

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK.filter(
    (m) =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.membershipNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search),
  );

  return (
    <PermissionGate permission={PERMISSIONS.MEMBERS_READ}>
      <div className="space-y-6">
        <PageHeader
          title="Members"
          description="Manage union membership across all branches and provinces."
          actions={
            <>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
              <PermissionGate permission={PERMISSIONS.MEMBERS_WRITE} fallback={null}>
                <Button size="sm" asChild>
                  <Link href="/dashboard/members/new">
                    <UserPlus className="h-4 w-4" /> Add Member
                  </Link>
                </Button>
              </PermissionGate>
            </>
          }
        />
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, ID or phone…"
                  className="pl-9"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={Plus}
                title="No members match your search"
                description="Try adjusting your filters or adding a new member."
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Membership #</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{getInitials(m.fullName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{m.fullName}</div>
                              <div className="text-xs text-muted-foreground">{m.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {m.membershipNumber}
                        </TableCell>
                        <TableCell>{m.branchName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.tier}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(m.joinedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/members/${m.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
