export type TimelineEventType =
  | "COMPLAINT"
  | "DONATION"
  | "EVENT"
  | "TRAINING"
  | "LEGAL_CASE"
  | "NOTIFICATION"
  | "COMMUNICATION_LOG";

export type MemberTimelineEvent = {
  type: TimelineEventType;
  title: string;
  refId: string;
  occurredAt: string;
  meta?: string;
};

export type CommunicationChannel = "CALL" | "MEETING" | "EMAIL" | "NOTE" | "OTHER";

export type CommunicationLog = {
  id: string;
  memberId: string;
  loggedBy: string;
  channel: CommunicationChannel;
  subject: string;
  notes: string;
  occurredAt: string;
  createdAt: string;
};

export const COMMUNICATION_CHANNELS: { value: CommunicationChannel; label: string }[] = [
  { value: "CALL", label: "Call" },
  { value: "MEETING", label: "Meeting" },
  { value: "EMAIL", label: "Email" },
  { value: "NOTE", label: "Note" },
  { value: "OTHER", label: "Other" },
];
