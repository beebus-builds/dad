"use client";

import { HandHeart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageHeader } from "@/components/public/public-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicService } from "@/services/public-service";
import { ApiError } from "@/lib/api-client";

const AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonatePage() {
  const t = useTranslations("donate");
  const [amount, setAmount] = useState<number>(1000);
  const [form, setForm] = useState({ donorName: "", donorEmail: "", donorPhone: "", purpose: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicService.donate({ ...form, amount, method: "KHALTI" });
      toast.success(t("success"));
      setForm({ donorName: "", donorEmail: "", donorPhone: "", purpose: "" });
      setAmount(1000);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container space-y-8 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <PublicPageHeader
          eyebrow="सहयोग"
          title={t("title")}
          description={t("subtitle")}
          icon={HandHeart}
        />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label>{t("amount")}</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {AMOUNTS.map((a) => (
                    <Button
                      key={a}
                      variant={amount === a ? "default" : "outline"}
                      type="button"
                      onClick={() => setAmount(a)}
                      className="h-10 px-2 text-xs"
                    >
                      NPR {a.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  required
                  value={form.donorName}
                  onChange={(e) => setForm((p) => ({ ...p, donorName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.donorEmail}
                  onChange={(e) => setForm((p) => ({ ...p, donorEmail: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  value={form.donorPhone}
                  onChange={(e) => setForm((p) => ({ ...p, donorPhone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">{t("purpose")}</Label>
                <Input
                  id="purpose"
                  value={form.purpose}
                  onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
                />
              </div>
              <Button
                type="submit"
                variant="union"
                className="w-full"
                disabled={submitting || !amount}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? t("submitting") : t("submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
