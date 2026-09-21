import { z } from "zod";

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED" | "CANCELLED";

export type CampaignSegment = {
  branchId?: string;
  tier?: "STANDARD" | "LIFETIME" | "HONORARY";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
  tag?: string;
};

export type Campaign = {
  id: string;
  name: string;
  subject: string;
  body: string;
  segment: CampaignSegment;
  scheduledAt?: string;
  status: CampaignStatus;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignRecipient = {
  id: string;
  campaignId: string;
  memberId: string;
  email: string;
  status: "PENDING" | "SENT" | "FAILED" | "BOUNCED";
  sentAt?: string;
  error?: string;
  createdAt: string;
};

export type CampaignStats = {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  bounced: number;
};

export const campaignSchema = z.object({
  name: z.string().min(2, "Name is required"),
  subject: z.string().min(2, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
  segment: z.object({
    branchId: z.string().optional(),
    tier: z.enum(["STANDARD", "LIFETIME", "HONORARY"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
    tag: z.string().optional(),
  }),
});
export type CampaignInput = z.infer<typeof campaignSchema>;
