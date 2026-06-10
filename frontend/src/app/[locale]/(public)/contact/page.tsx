"use client";

import { Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { publicService } from "@/services/public-service";
import { ApiError } from "@/lib/api-client";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await publicService.contactSubmit(form);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      toast.success(t("success"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-4xl">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </header>
        <div className="mt-10 grid gap-6 md:grid-cols-[1.2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t("title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("name")}</Label>
                    <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("subject")}</Label>
                  <Input id="subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t("message")}</Label>
                  <Textarea id="message" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <Button type="submit" className="w-full sm:w-auto" disabled={sending}>
                  {sending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {sending ? t("sending") : t("send")}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <InfoLine icon={MapPin} title={t("office")}>{t("address")}</InfoLine>
            <InfoLine icon={Phone} title={t("phoneLabel")}>+977 1 4XXX XXX</InfoLine>
            <InfoLine icon={Mail} title={t("emailLabel")}>support@shramjagaran.np</InfoLine>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ icon: Icon, title, children }: { icon: typeof Mail; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}
