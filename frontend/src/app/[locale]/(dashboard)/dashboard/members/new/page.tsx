"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n-navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { FormWizard, type WizardStep } from "@/components/form-wizard";
import { PERMISSIONS } from "@/lib/rbac";
import { memberSchema, type MemberInput } from "@/lib/validations";
import { memberService } from "@/services/members-service";
import { branchService } from "@/services/branches-service";
import { ApiError } from "@/lib/api-client";

const TIERS: Array<MemberInput["tier"]> = ["STANDARD", "LIFETIME", "HONORARY"];

const STEPS: WizardStep[] = [
  { id: "identity", label: "Identity", description: "Personal details" },
  { id: "work", label: "Work", description: "Occupation & address" },
  { id: "membership", label: "Membership", description: "Branch & tier" },
];

export default function NewMemberPage() {
  const t = useTranslations("members");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<MemberInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: { tier: "STANDARD", branchId: "" },
    mode: "onBlur",
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: MemberInput) => memberService.create(payload),
    onSuccess: (member) => {
      toast.success(`${member.membershipNumber}`);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      router.push("/dashboard/members");
    },
    onError: (err: ApiError) => {
      toast.error(err.message || t("list.deleteFailed"));
    },
  });

  const STEP_FIELDS: Record<number, (keyof MemberInput)[]> = {
    0: ["fullName", "fullNameNepali", "email", "phone", "citizenshipNumber", "dateOfBirth"],
    1: ["occupation", "employer", "address"],
    2: ["branchId", "tier"],
  };

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    const ok = await trigger(fields as any);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
    return ok;
  };

  return (
    <PermissionGate permission={PERMISSIONS.MEMBERS_WRITE}>
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
          noValidate
        >
          <FormWizard
            steps={STEPS}
            currentStep={step}
            onStepChange={setStep}
            onNext={handleNext}
            isSubmitting={createMutation.isPending}
          >
            {step === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                    {t("new.identity")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <Field id="fullName" label={`${t("new.fields.fullName")} *`} error={errors.fullName?.message}>
                    <Input id="fullName" {...register("fullName")} />
                  </Field>
                  <Field id="fullNameNepali" label={t("new.fields.fullNameNepali")} error={errors.fullNameNepali?.message}>
                    <Input id="fullNameNepali" className="font-devanagari" placeholder={t("new.placeholders.fullNameNepali")} {...register("fullNameNepali")} />
                  </Field>
                  <Field id="email" label={t("new.fields.email")} error={errors.email?.message}>
                    <Input id="email" type="email" {...register("email")} />
                  </Field>
                  <Field id="phone" label={`${t("new.fields.phone")} *`} error={errors.phone?.message}>
                    <Input id="phone" type="tel" placeholder={t("new.placeholders.phone")} {...register("phone")} />
                  </Field>
                  <Field id="citizenshipNumber" label={t("new.fields.citizenshipNumber")} error={errors.citizenshipNumber?.message}>
                    <Input id="citizenshipNumber" {...register("citizenshipNumber")} />
                  </Field>
                  <Field id="dateOfBirth" label={t("new.fields.dateOfBirth")} error={errors.dateOfBirth?.message}>
                    <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                  </Field>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                    {t("new.work")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <Field id="occupation" label={t("new.fields.occupation")} error={errors.occupation?.message}>
                    <Input id="occupation" {...register("occupation")} />
                  </Field>
                  <Field id="employer" label={t("new.fields.employer")} error={errors.employer?.message}>
                    <Input id="employer" {...register("employer")} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="address" label={t("new.fields.address")} error={errors.address?.message}>
                      <Textarea id="address" rows={3} {...register("address")} />
                    </Field>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                    {t("new.membership")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("new.fields.branch")} *</Label>
                    <Select
                      value={watch("branchId") || undefined}
                      onValueChange={(v) => setValue("branchId", v, { shouldValidate: true })}
                    >
                      <SelectTrigger className={errors.branchId ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("new.selectBranch")} />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.branchId && <p className="text-sm text-destructive">{errors.branchId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("new.fields.tier")} *</Label>
                    <Select
                      value={watch("tier")}
                      onValueChange={(v) => setValue("tier", v as MemberInput["tier"], { shouldValidate: true })}
                    >
                      <SelectTrigger className={errors.tier ? "border-destructive" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIERS.map((tier) => (
                          <SelectItem key={tier} value={tier}>{t(`tier.${tier}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </FormWizard>
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
