"use client";

import { use, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n-navigation";
import { Loader2, MapPin, Briefcase, Building2, BadgeCheck, Calendar } from "lucide-react";
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
    publicService.getMemberProfile(id).then(setMember).catch(() => setMember(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-12"><Skeleton className="mx-auto h-48 w-48 rounded-full" /><Skeleton className="mx-auto mt-4 h-8 w-64" /></div>;

  if (!member) return <div className="container py-16 text-center"><p className="text-muted-foreground">{t("noResults")}</p><Button asChild variant="link" className="mt-4"><Link href="/membership">Membership</Link></Button></div>;

  return (
    <div className="container py-12">
      <Link href="/membership" className="mb-6 inline-flex text-sm text-muted-foreground hover:text-foreground">&larr; Back to Membership</Link>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-union-red to-govt-blue text-3xl font-bold text-white">
              {member.fullName.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold">{member.fullName}</h1>
            {member.fullNameNepali && <p className="text-lg text-muted-foreground">{member.fullNameNepali}</p>}
            <Badge variant={member.status === "ACTIVE" ? "success" : "secondary"} className="mt-2">{member.status}</Badge>
            <p className="mt-1 text-sm text-muted-foreground">{member.membershipNumber}</p>
          </CardContent>
        </Card>
        <Card className="mt-6">
          <CardContent className="space-y-4 p-6">
            <InfoRow icon={BadgeCheck} label="Tier" value={member.tier} />
            {member.occupation && <InfoRow icon={Briefcase} label="Occupation" value={member.occupation} />}
            {member.employer && <InfoRow icon={Building2} label="Employer" value={member.employer} />}
            {member.address && <InfoRow icon={MapPin} label="Address" value={member.address} />}
            <InfoRow icon={Calendar} label="Member since" value={date(member.joinedAt)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
