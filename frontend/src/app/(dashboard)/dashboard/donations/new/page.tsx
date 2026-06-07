"use client";

import { useRouter } from "next/navigation";
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
  donorName: z.string().min(2, "Donor name is required"),
  donorEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().default("NPR"),
  method: z.enum(["CASH", "BANK_TRANSFER", "ESEWA", "KHALTI", "CARD"]),
  purpose: z.string().optional(),
});
type DonationInput = z.infer<typeof donationSchema>;

const METHODS = ["CASH", "BANK_TRANSFER", "ESEWA", "KHALTI", "CARD"] as const;

export default function NewDonationPage() {
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
      toast.success("Donation recorded");
      router.push("/dashboard/donations");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to record donation"),
  });

  return (
    <PermissionGate permission={PERMISSIONS.DONATIONS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title="Record Donation"
          description="Log a cash, bank, eSewa, Khalti or card contribution."
          actions={
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
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
              <CardTitle>Donor details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donorName">Donor name *</Label>
                  <Input id="donorName" {...register("donorName")} />
                  {errors.donorName && (
                    <p className="text-sm text-destructive">{errors.donorName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorPhone">Phone</Label>
                  <Input id="donorPhone" {...register("donorPhone")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="donorEmail">Email</Label>
                <Input id="donorEmail" type="email" {...register("donorEmail")} />
                {errors.donorEmail && (
                  <p className="text-sm text-destructive">{errors.donorEmail.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input id="amount" type="number" min="1" step="0.01" {...register("amount")} />
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" {...register("currency")} />
                </div>
                <div className="space-y-2">
                  <Label>Method *</Label>
                  <Select
                    value={watch("method")}
                    onValueChange={(v) => setValue("method", v as DonationInput["method"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METHODS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose / programme</Label>
                <Input id="purpose" {...register("purpose")} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Save</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A unique receipt number will be generated. The donor can use it for tax
                exemption.
              </p>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Record donation
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </PermissionGate>
  );
}
