import type { Permission, Role } from "@/lib/rbac";

export type User = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  permissions: Permission[];
  branchId?: string;
  branchName?: string;
  provinceCode?: string;
  districtCode?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
};

export type Branch = {
  id: string;
  name: string;
  nameNepali?: string;
  provinceCode: string;
  districtCode: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
};

export type Member = {
  id: string;
  membershipNumber: string;
  fullName: string;
  fullNameNepali?: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  citizenshipNumber?: string;
  occupation?: string;
  employer?: string;
  address?: string;
  branchId: string;
  branchName?: string;
  tier: "STANDARD" | "LIFETIME" | "HONORARY";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
  joinedAt: string;
  expiresAt?: string;
  avatarUrl?: string;
};

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
  attachments?: { id: string; url: string; name: string }[];
};

export type Event = {
  id: string;
  title: string;
  titleNepali?: string;
  slug: string;
  description: string;
  category: "MEETING" | "RALLY" | "TRAINING" | "WORKSHOP" | "CONFERENCE" | "OTHER";
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  startsAt: string;
  endsAt: string;
  location: string;
  capacity?: number;
  registeredCount: number;
  coverImageUrl?: string;
  branchId?: string;
};

export type News = {
  id: string;
  slug: string;
  title: string;
  titleNepali?: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category: "ANNOUNCEMENT" | "POLICY" | "EVENT" | "PRESS_RELEASE" | "OTHER";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string;
  author: { id: string; name: string };
  tags?: string[];
};

export type DocumentItem = {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: "POLICY" | "LEGAL" | "REPORT" | "FORM" | "OTHER";
  visibility: "PUBLIC" | "MEMBERS" | "ADMIN";
  uploadedBy: { id: string; name: string };
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

export type TrainingProgram = {
  id: string;
  title: string;
  titleNepali?: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  trainer?: string;
  capacity?: number;
  registeredCount: number;
  status: "UPCOMING" | "ONGOING" | "COMPLETED";
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

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export type DashboardStats = {
  totalMembers: number;
  activeMembers: number;
  openComplaints: number;
  resolvedComplaints: number;
  upcomingEvents: number;
  totalDonations: number;
  activeLegalCases: number;
  monthlyGrowth: { month: string; members: number; complaints: number }[];
  recentActivity: { id: string; type: string; message: string; at: string }[];
};
