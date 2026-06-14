"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister, useVerifyEmail, useResendOTP } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/validations";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const [step, setStep] = useState<"register" | "otp">("register");
  const [userId, setUserId] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const registerMutation = useRegister();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOTP();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const handleRegister = handleSubmit((data) => {
    const { confirmPassword: _confirm, ...rest } = data;
    registerMutation.mutate(rest, {
      onSuccess: (result) => {
        setUserId(result.userId);
        setRegisteredEmail(result.email);
        setStep("otp");
      },
    });
  });

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    verifyMutation.mutate({ userId, code });
  };

  const handleResend = () => {
    resendMutation.mutate(userId, {
      onSuccess: () => {
        setOtp(["", "", "", "", "", ""]);
      },
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  if (step === "otp") {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <Mail className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{registeredEmail}</span>
          </p>
        </div>
        <div className="flex justify-center gap-2">
          {otp.map((digit, i) => (
            <Input
              key={i}
              id={`otp-${i}`}
              className="h-12 w-12 text-center text-lg"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>
        {verifyMutation.error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{verifyMutation.error.message}</span>
          </div>
        )}
        {verifyMutation.isSuccess && (
          <div className="flex items-start gap-2.5 rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Email verified! Redirecting...</span>
          </div>
        )}
        <Button className="w-full" onClick={handleVerify} disabled={otp.join("").length !== 6 || verifyMutation.isPending}>
          {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Email
        </Button>
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground underline hover:text-foreground"
            onClick={handleResend}
            disabled={resendMutation.isPending}
          >
            {resendMutation.isPending ? "Sending..." : "Resend code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4" noValidate>
      <Field id="fullName" label={t("fullName")} error={errors.fullName?.message}>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
      </Field>
      <Field id="email" label={t("email")} error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Field id="phone" label={t("phone")} error={errors.phone?.message}>
        <Input id="phone" type="tel" autoComplete="tel" placeholder="+977 98XXXXXXXX" {...register("phone")} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="password" label={t("password")} error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <Field id="confirmPassword" label={t("confirmPassword")} error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </Field>
      </div>
      {registerMutation.error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{registerMutation.error.message}</span>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
        {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {registerMutation.isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
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
