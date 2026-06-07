"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { memberSchema, type MemberInput } from "@/lib/validations";
import { MEMBERSHIP_TIERS } from "@/lib/constants";

const BRANCHES = [
  { id: "branch-1", name: "Kathmandu Central" },
  { id: "branch-2", name: "Pokhara" },
  { id: "branch-3", name: "Biratnagar" },
  { id: "branch-4", name: "Birgunj" },
  { id: "branch-5", name: "Butwal" },
];

export default function NewMemberPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: { tier: "STANDARD", branchId: "" },
  });

  return (
    <PermissionGate permission={PERMISSIONS.MEMBERS_WRITE}>
      <div className="space-y-6">
        <PageHeader
          title="Add New Member"
          description="Register a new union member with full identity and branch assignment."
          actions={
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          }
        />
        <form
          onSubmit={handleSubmit(async () => {
            await new Promise((r) => setTimeout(r, 700));
            toast.success("Member created successfully");
            router.push("/dashboard/members");
          })}
          className="grid gap-6 lg:grid-cols-3"
          noValidate
        >
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Identity</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field id="fullName" label="Full Name *" error={errors.fullName?.message}>
                  <Input id="fullName" {...register("fullName")} />
                </Field>
                <Field
                  id="fullNameNepali"
                  label="Full Name (Nepali)"
                  error={errors.fullNameNepali?.message}
                >
                  <Input
                    id="fullNameNepali"
                    className="font-devanagari"
                    placeholder="राम बहादुर"
                    {...register("fullNameNepali")}
                  />
                </Field>
                <Field id="email" label="Email" error={errors.email?.message}>
                  <Input id="email" type="email" {...register("email")} />
                </Field>
                <Field id="phone" label="Phone *" error={errors.phone?.message}>
                  <Input id="phone" type="tel" {...register("phone")} />
                </Field>
                <Field
                  id="citizenshipNumber"
                  label="Citizenship #"
                  error={errors.citizenshipNumber?.message}
                >
                  <Input id="citizenshipNumber" {...register("citizenshipNumber")} />
                </Field>
                <Field id="dateOfBirth" label="Date of Birth" error={errors.dateOfBirth?.message}>
                  <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                </Field>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Work & Address</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field id="occupation" label="Occupation" error={errors.occupation?.message}>
                  <Input id="occupation" {...register("occupation")} />
                </Field>
                <Field id="employer" label="Employer" error={errors.employer?.message}>
                  <Input id="employer" {...register("employer")} />
                </Field>
                <div className="sm:col-span-2">
                  <Field id="address" label="Address" error={errors.address?.message}>
                    <Textarea id="address" rows={3} {...register("address")} />
                  </Field>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Membership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Branch *</Label>
                  <Select
                    value={watch("branchId") || undefined}
                    onValueChange={(v) => setValue("branchId", v, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.branchId && (
                    <p className="text-sm text-destructive">{errors.branchId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Membership Tier *</Label>
                  <Select
                    value={watch("tier")}
                    onValueChange={(v) =>
                      setValue("tier", v as MemberInput["tier"], { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBERSHIP_TIERS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Member
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </PermissionGate>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
