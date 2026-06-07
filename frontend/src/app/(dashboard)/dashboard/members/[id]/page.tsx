"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { formatDate, getInitials } from "@/lib/utils";
import { memberService } from "@/services/members-service";
import { ApiError } from "@/lib/api-client";
import type { Member } from "@/types";

const STATUS_VARIANT: Record<Member["status"], "success" | "secondary" | "warning" | "destructive"> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  EXPIRED: "warning",
  SUSPENDED: "destructive",
};

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["member", id],
    queryFn: () => memberService.detail(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading member…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Member"
          description={`Could not load member ${id}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/members">
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          }
        />
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as ApiError).message}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const m = data;

  return (
    <PermissionGate permission={PERMISSIONS.MEMBERS_READ}>
      <div className="space-y-6">
        <PageHeader
          title={m.fullName}
          description={m.fullNameNepali || `Membership #${m.membershipNumber}`}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/members">
                <ArrowLeft className="h-4 w-4" /> Back to members
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardContent className="space-y-4 p-6 text-center">
              <Avatar className="mx-auto h-20 w-20">
                {m.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatarUrl} alt={m.fullName} />
                ) : null}
                <AvatarFallback className="text-lg">{getInitials(m.fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{m.fullName}</h2>
                <p className="text-sm text-muted-foreground">{m.membershipNumber}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
                <Badge variant="outline">{m.tier}</Badge>
              </div>
              <div className="space-y-2 pt-2 text-left text-sm text-muted-foreground">
                {m.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {m.phone}
                  </div>
                )}
                {m.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {m.email}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {m.branchName ?? m.branchId}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joined {formatDate(m.joinedAt)}
                </div>
                {m.expiresAt && (
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Expires {formatDate(m.expiresAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Info label="Full name (Nepali)" value={m.fullNameNepali ?? "—"} />
                <Info label="Gender" value={m.gender ?? "—"} />
                <Info label="Date of birth" value={m.dateOfBirth ? formatDate(m.dateOfBirth) : "—"} />
                <Info label="Citizenship #" value={m.citizenshipNumber ?? "—"} />
                <Info label="Occupation" value={m.occupation ?? "—"} />
                <Info label="Employer" value={m.employer ?? "—"} />
                <Info label="Email" value={m.email ?? "—"} />
                <Info label="Phone" value={m.phone} />
                <div className="sm:col-span-2">
                  <Info label="Address" value={m.address ?? "—"} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Membership details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Info label="Branch" value={m.branchName ?? m.branchId} />
                <Info label="Tier" value={m.tier} />
                <Info label="Status" value={m.status} />
                <Info label="Joined" value={formatDate(m.joinedAt)} />
                <Info label="Expires" value={m.expiresAt ? formatDate(m.expiresAt) : "—"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Payments, complaints, and document history will appear
                  here once the relevant backend endpoints return data.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
