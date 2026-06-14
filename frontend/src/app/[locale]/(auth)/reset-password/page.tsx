"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { z } from "zod";
import { Link } from "@/lib/i18n-navigation";
import { toast } from "sonner";
import { useRouter } from "@/lib/i18n-navigation";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "कम्तिमा ८ अक्षर हुनुपर्छ")
      .regex(/[A-Z]/, "कम्तिमा एउटा ठूलो अक्षर हुनुपर्छ")
      .regex(/[0-9]/, "कम्तिमा एउटा अंक हुनुपर्छ"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "पासवर्ड मेल खाँदैन",
  });

type ResetInput = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const t = useTranslations("auth.reset");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const mutation = useMutation({
    mutationFn: (password: string) => authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success(t("success"));
      router.push("/login");
    },
    onError: (err: Error) => toast.error(err.message ?? t("error")),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold">{t("invalid")}</h1>
        <p className="text-sm text-muted-foreground">{t("noToken")}</p>
        <Button asChild><Link href="/login">{t("backToLogin")}</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d.password))} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">{t("newPassword")}</Label>
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <PasswordInput id="confirmPassword" autoComplete="new-password" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mutation.isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">{t("backToLogin")}</Link>
      </p>
    </div>
  );
}
