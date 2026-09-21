"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { communicationLogService } from "@/services/communication-log-service";
import { COMMUNICATION_CHANNELS, type CommunicationChannel } from "@/types";
import { ApiError } from "@/lib/api-client";

export function LogInteractionDialog({ memberId }: { memberId: string }) {
  const t = useTranslations("members.detail");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<CommunicationChannel>("CALL");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () => communicationLogService.create(memberId, { channel, subject, notes }),
    onSuccess: () => {
      toast.success(t("interactionLogged"));
      setSubject("");
      setNotes("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["member-timeline", memberId] });
    },
    onError: (err: ApiError) => toast.error(err.message || t("interactionLogFailed")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Phone className="h-4 w-4" /> {t("logInteraction")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("logInteraction")}</DialogTitle>
          <DialogDescription>{t("logInteractionDesc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {COMMUNICATION_CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("interactionSubject")}
          />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("interactionNotes")}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || subject.trim().length === 0}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
