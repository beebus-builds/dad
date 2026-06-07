import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .min(10, "Enter a valid phone number")
      .regex(/^\+?\d[\d\s-]*$/u, "Only digits, spaces and dashes allowed"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const memberSchema = z.object({
  fullName: z.string().min(2),
  fullNameNepali: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  citizenshipNumber: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  address: z.string().optional(),
  branchId: z.string().min(1, "Branch is required"),
  tier: z.enum(["STANDARD", "LIFETIME", "HONORARY"]),
});
export type MemberInput = z.infer<typeof memberSchema>;

export const complaintSchema = z.object({
  title: z.string().min(5, "Provide a meaningful title"),
  description: z.string().min(20, "Please describe the issue (min 20 chars)"),
  category: z.enum([
    "WAGES",
    "WORKING_HOURS",
    "SAFETY",
    "HARASSMENT",
    "TERMINATION",
    "BENEFITS",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});
export type ComplaintInput = z.infer<typeof complaintSchema>;

export const eventSchema = z.object({
  title: z.string().min(3),
  titleNepali: z.string().optional(),
  description: z.string().min(10),
  category: z.enum(["MEETING", "RALLY", "TRAINING", "WORKSHOP", "CONFERENCE", "OTHER"]),
  startsAt: z.string(),
  endsAt: z.string(),
  location: z.string().min(2),
  capacity: z.number().int().positive().optional(),
});
export type EventInput = z.infer<typeof eventSchema>;

export const newsSchema = z.object({
  title: z.string().min(5),
  titleNepali: z.string().optional(),
  excerpt: z.string().min(20).max(280),
  content: z.string().min(50),
  category: z.enum(["ANNOUNCEMENT", "POLICY", "EVENT", "PRESS_RELEASE", "OTHER"]),
  tags: z.string().optional(),
});
export type NewsInput = z.infer<typeof newsSchema>;

export const donationSchema = z.object({
  donorName: z.string().min(2),
  donorEmail: z.string().email().optional().or(z.literal("")),
  donorPhone: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["CASH", "BANK_TRANSFER", "ESEWA", "KHALTI", "CARD"]),
  purpose: z.string().optional(),
});
export type DonationInput = z.infer<typeof donationSchema>;
