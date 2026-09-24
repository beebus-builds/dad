"use client";

import { use, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n-navigation";
import { ArrowLeft, MapPin, Briefcase, Building2, BadgeCheck, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { publicService } from "@/services/public-service";
import { useLocaleFormat } from "@/lib/use-locale-format";
import type { Member } from "@/types";

export default function PublicMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("common");
  const { date } = useLocaleFormat();
  const { id } = use(params);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    publicService
      .getMemberProfile(id)
      .then(setMember)
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="container py-12">
        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-8 w-64" />
      </div>
    );

  if (!member)
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">{t("noResults")}</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/membership">Membership</Link>
        </Button>
      </div>
    );

  return (
    <div className="container space-y-6 py-12 sm:py-16">
      <Link
        href="/membership"
        className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> सदस्यतामा फर्कनुहोस्
      </Link>
      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden">
          <div
            className="from-primary via-primary to-union-red h-24 bg-gradient-to-br"
            aria-hidden="true"
          />
          <CardContent className="-mt-12 flex flex-col items-center p-8 text-center">
            <div className="border-card from-primary to-union-red shadow-card flex h-24 w-24 items-center justify-center rounded-full border-4 bg-gradient-to-br text-3xl font-bold text-white">
              {member.fullName.charAt(0)}
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">{member.fullName}</h1>
            {member.fullNameNepali && (
              <p className="text-muted-foreground mt-1 text-base">{member.fullNameNepali}</p>
            )}
            <Badge variant={member.status === "ACTIVE" ? "success" : "secondary"} className="mt-3">
              {member.status}
            </Badge>
            <p className="text-muted-foreground mt-1.5 font-mono text-xs">
              {member.membershipNumber}
            </p>
          </CardContent>
        </Card>
        <Card className="mt-5">
          <CardContent className="space-y-4 p-6">
            <InfoRow icon={BadgeCheck} label="तह" value={member.tier} />
            {member.occupation && (
              <InfoRow icon={Briefcase} label="पेशा" value={member.occupation} />
            )}
            {member.employer && (
              <InfoRow icon={Building2} label="रोजगारदाता" value={member.employer} />
            )}
            {member.address && <InfoRow icon={MapPin} label="ठेगाना" value={member.address} />}
            <InfoRow icon={Calendar} label="सदस्य बनेको" value={date(member.joinedAt)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
      <span className="text-muted-foreground text-sm">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
