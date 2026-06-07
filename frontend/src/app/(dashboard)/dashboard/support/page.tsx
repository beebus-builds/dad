"use client";

import { useState } from "react";
import { LifeBuoy, Loader2, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/dashboard/page-header";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    toast.success("Support request sent — we will respond within 24 hours");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Reach out to our support team or browse help resources."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <CardTitle className="mt-3">Helpline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1660-01-XXXXX</p>
            <p className="mt-1 text-sm text-muted-foreground">Sun–Fri · 9:00–18:00 NPT</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <CardTitle className="mt-3">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">support@shramjagaran.np</p>
            <p className="mt-1 text-sm text-muted-foreground">Response within 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <CardTitle className="mt-3">Live chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Available 9 am – 5 pm on working days.</p>
            <Button className="mt-3">
              <LifeBuoy className="h-4 w-4" /> Start chat
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
