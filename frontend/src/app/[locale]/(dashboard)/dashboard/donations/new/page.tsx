"use client";

import { useRouter } from "@/lib/i18n-navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/page-header";
import { PermissionGate } from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/rbac";
import { donationService } from "@/services/donations-service";
import { ApiError } from "@/lib/api-client";
import { z } from "zod";

const donationSchema = z.object({
  donorName: z.string().min(2),
  donorEmail: z.string().email().optional().or(z.literal("")),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().positive(),
  currency: z.string().default("NPR"),
  method: z.enum(["CASH", "BANK_TRANSFER", "ESEWA", "KHALTI", "CARD"]),
  purpose: z.string().optional(),
});
type DonationInput = z.infer<typeof donationSchema>;

const METHODS = ["CASH", "BANK_TRANSFER", "ESEWA", "KHALTI", "CARD"] as const;

export default function NewDonationPage() {
  const t = useTranslations("donations");
  const tMethod = useTranslations("donations.method");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonationInput>({
    resolver: zodResolver(donationSchema),
    defaultValues: { currency: "NPR", method: "CASH" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: DonationInput) => donationService.create(payload),
    onSuccess: () => {
      toast.success(t("new.created"));
      router.push("/dashboard/donations");
    },
    onError: (err: ApiError) => toast.error(err.message || t("new.createFailed")),
  });

  return (
    <PermissionGate permission={PERMISSIONS.DONATIONS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title={t("new.title")}
          description={t("new.subtitle")}
          actions={
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> {tCommon("back")}
            </Button>
          }
        />
        <form
          onSubmit={handleSubmit((values) => createMutation.mutate(values))}
          className="grid gap-6 lg:grid-cols-3"
          noValidate
        >
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("new.details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donorName">{`${t("new.fields.donorName")} *`}</Label>
                  <Input id="donorName" {...register("donorName")} />
                  {errors.donorName && <p className="text-sm text-destructive">{errors.donorName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorPhone">{t("new.fields.donorPhone")}</Label>
                  <Input id="donorPhone" {...register("donorPhone")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="donorEmail">{t("new.fields.donorEmail")}</Label>
                <Input id="donorEmail" type="email" {...register("donorEmail")} />
                {errors.donorEmail && <p className="text-sm text-destructive">{errors.donorEmail.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">{`${t("new.fields.amount")} *`}</Label>
                  <Input id="amount" type="number" min="1" step="0.01" {...register("amount")} />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t("new.fields.currency")}</Label>
                  <Input id="currency" {...register("currency")} />
                </div>
                <div className="space-y-2">
                  <Label>{`${t("new.fields.method")} *`}</Label>
                  <Select
                    value={watch("method")}
                    onValueChange={(v) => setValue("method", v as DonationInput["method"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map((m) => (
                        <SelectItem key={m} value={m}>{tMethod(m)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">{t("new.fields.purpose")}</Label>
                <Input id="purpose" {...register("purpose")} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("new.save")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("new.receiptHint")}</p>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("new.submit")}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
