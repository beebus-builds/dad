import { z } from "zod";

export type Complaint = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category:
    | "WAGES"
    | "WORKING_HOURS"
    | "SAFETY"
    | "HARASSMENT"
    | "TERMINATION"
    | "BENEFITS"
    | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_REVIEW" | "ESCALATED" | "RESOLVED" | "CLOSED";
  submittedBy: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  branchId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  dueAt?: string;
  firstRespondedAt?: string;
  isOverdue?: boolean;
  attachments?: { id: string; url: string; name: string }[];
};

export type CaseNote = {
  id: string;
  complaintId: string;
  userId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
};

export type Donation = {
  id: string;
  receiptNumber: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  method: "CASH" | "BANK_TRANSFER" | "ESEWA" | "KHALTI" | "CARD";
  purpose?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  createdAt: string;
};

export type LegalCase = {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  type: "FOREIGN_EMPLOYMENT" | "LABOR_DISPUTE" | "OSH" | "COLLECTIVE_BARGAINING" | "OTHER";
  status: "INTAKE" | "ACTIVE" | "HEARING" | "RESOLVED" | "CLOSED";
  memberId?: string;
  memberName?: string;
  assignedAdvisor?: { id: string; name: string };
  filedAt: string;
  nextHearingAt?: string;
};

export type WorkerIncident = {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  severity: "MINOR" | "MODERATE" | "SEVERE" | "FATAL";
  occurredAt: string;
  location: string;
  workplaceName?: string;
  reportedBy: { id: string; name: string };
  status: "REPORTED" | "INVESTIGATING" | "RESOLVED";
};

export const COMPLAINT_CATEGORIES = [
  "WAGES",
  "WORKING_HOURS",
  "SAFETY",
  "HARASSMENT",
  "TERMINATION",
  "BENEFITS",
  "OTHER",
] as const;

export const COMPLAINT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const DONATION_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "ESEWA",
  "KHALTI",
  "CARD",
] as const;

export const complaintSchema = z.object({
  title: z.string().min(5, "Provide a meaningful title"),
  description: z.string().min(20, "Please describe the issue (min 20 chars)"),
  category: z.enum(COMPLAINT_CATEGORIES),
  priority: z.enum(COMPLAINT_PRIORITIES),
});
export type ComplaintInput = z.infer<typeof complaintSchema>;

export const donationSchema = z.object({
  donorName: z.string().min(2),
  donorEmail: z.string().email().optional().or(z.literal("")),
  donorPhone: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(DONATION_METHODS),
  purpose: z.string().optional(),
});
export type DonationInput = z.infer<typeof donationSchema>;