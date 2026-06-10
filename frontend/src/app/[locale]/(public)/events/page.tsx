"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n-navigation";
import { Calendar, Loader2, MapPin, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicService } from "@/services/public-service";
import { ApiError } from "@/lib/api-client";

const SAMPLE_EVENTS = [
  { id: "1", title: "National Workers Convention 2026", date: "2026-06-21", location: "Bhrikutimandap, Kathmandu", type: "CONFERENCE" },
  { id: "2", title: "OSH Awareness Workshop", date: "2026-06-28", location: "Birgunj, Province 2", type: "WORKSHOP" },
  { id: "3", title: "Migrant Workers Rights Rally", date: "2026-07-05", location: "Maitighar, Kathmandu", type: "RALLY" },
] as const;

function EventRegisterDialog({ event }: { event: typeof SAMPLE_EVENTS[number] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations("events");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicService.registerForEvent(event.id, form);
      setDone(true);
      toast.success(t("registerDialog.success"));
      setTimeout(() => { setOpen(false); setDone(false); setForm({ fullName: "", email: "", phone: "" }); }, 2000);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("registerDialog.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setDone(false); } setOpen(v); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="mt-3">{t("register")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("registerDialog.title", { eventTitle: event.title })}</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-lg font-medium">{t("registerDialog.success")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("registerDialog.fullName")}</Label>
              <Input id="fullName" required value={form.fullName} onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder={t("registerDialog.fullNamePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("registerDialog.email")}</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder={t("registerDialog.emailPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("registerDialog.phone")}</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder={t("registerDialog.phonePlaceholder")} />
            </div>
            <Button type="submit" variant="union" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("registerDialog.submit")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function PublicEventsPage() {
  const t = useTranslations("events");
  const tNav = useTranslations("nav");

  return (
    <div className="container py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/register">{tNav("joinNow")}</Link>
        </Button>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_EVENTS.map((e) => (
          <Card key={e.id} className="flex flex-col overflow-hidden">
            <div className="h-32 gradient-union" aria-hidden />
            <CardHeader>
              <Badge variant="govt" className="w-fit">
                {t(`categories.${e.type}` as Parameters<typeof t>[0])}
              </Badge>
              <CardTitle className="mt-2 line-clamp-2">{e.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(e.date).toLocaleDateString("en-US")}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {e.location}
              </div>
              <div className="mt-auto pt-2">
                <EventRegisterDialog event={e} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
