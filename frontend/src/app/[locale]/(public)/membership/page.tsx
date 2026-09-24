"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, Star, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { Link } from "@/lib/i18n-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicService } from "@/services/public-service";
import { ApiError } from "@/lib/api-client";

const TIERS = [
  { tier: "STANDARD" as const, price: "NPR 500 / year", features: ["legal", "training", "voice"] },
  {
    tier: "LIFETIME" as const,
    price: "NPR 5,000 once",
    features: ["legal", "training", "voice", "insurance", "news"],
    featured: true,
  },
  { tier: "HONORARY" as const, price: "By nomination", features: ["voice", "news"] },
];

export default function MembershipPage() {
  const t = useTranslations("membership");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
    employer: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicService.memberApply(form);
      setDone(true);
      toast.success(t("applyForm.success"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("applyForm.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container space-y-10 py-12 sm:py-16">
      <PublicPageHeader
        eyebrow="सदस्यता"
        title={t("title")}
        description={t("subtitle")}
        icon={Sparkles}
        actions={
          <Button asChild>
            <Link href="#apply">{t("cta")}</Link>
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        {TIERS.map((tier) => (
          <Card
            key={tier.tier}
            className={tier.featured ? "border-primary ring-primary shadow-md ring-1" : ""}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t(`tiers.${tier.tier}` as Parameters<typeof t>[0])}
                {tier.featured && (
                  <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                    <Star className="h-3 w-3" /> Popular
                  </span>
                )}
              </CardTitle>
              <p className="text-2xl font-bold">{tier.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="text-muted-foreground space-y-2 text-sm">
                {tier.features.map((f: string) => (
                  <li key={f} className="flex gap-2">
                    <Check className="text-success h-4 w-4 shrink-0" />
                    {t(`benefitItems.${f}` as Parameters<typeof t>[0])}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div id="apply" className="mx-auto max-w-2xl scroll-mt-28">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">{t("applyForm.title")}</h2>
          <p className="text-muted-foreground mt-2">{t("applyForm.subtitle")}</p>
        </div>
        {done ? (
          <Card className="border-success/20">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <CheckCircle className="text-success h-12 w-12" />
              <p className="text-lg font-medium">{t("applyForm.success")}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("applyForm.fullName")}</Label>
                  <Input
                    id="name"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder={t("applyForm.fullNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("applyForm.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder={t("applyForm.emailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("applyForm.phone")}</Label>
                  <Input
                    id="phone"
                    required
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder={t("applyForm.phonePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t("applyForm.address")}</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder={t("applyForm.addressPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">{t("applyForm.occupation")}</Label>
                  <Input
                    id="occupation"
                    value={form.occupation}
                    onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))}
                    placeholder={t("applyForm.occupationPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employer">{t("applyForm.employer")}</Label>
                  <Input
                    id="employer"
                    value={form.employer}
                    onChange={(e) => setForm((p) => ({ ...p, employer: e.target.value }))}
                    placeholder={t("applyForm.employerPlaceholder")}
                  />
                </div>
                <Button type="submit" variant="union" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("applyForm.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
