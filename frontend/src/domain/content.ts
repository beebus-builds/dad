import { z } from "zod";

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
  views: number;
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

export type Page = {
  id: string;
  slug: string;
  title: string;
  titleNepali: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export const NEWS_CATEGORIES = [
  "ANNOUNCEMENT",
  "POLICY",
  "EVENT",
  "PRESS_RELEASE",
  "OTHER",
] as const;

export const EVENT_CATEGORIES = [
  "MEETING",
  "RALLY",
  "TRAINING",
  "WORKSHOP",
  "CONFERENCE",
  "OTHER",
] as const;

export const newsSchema = z.object({
  title: z.string().min(5),
  titleNepali: z.string().optional(),
  excerpt: z.string().min(20).max(280),
  content: z.string().min(50),
  category: z.enum(NEWS_CATEGORIES),
  tags: z.string().optional(),
});
export type NewsInput = z.infer<typeof newsSchema>;

export const eventSchema = z.object({
  title: z.string().min(3),
  titleNepali: z.string().optional(),
  description: z.string().min(10),
  category: z.enum(EVENT_CATEGORIES),
  startsAt: z.string(),
  endsAt: z.string(),
  location: z.string().min(2),
  capacity: z.number().int().positive().optional(),
});
export type EventInput = z.infer<typeof eventSchema>;