import { z } from "zod";

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
  tags: string[];
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

export const MEMBERSHIP_TIERS = [
  { value: "STANDARD", label: "Standard" },
  { value: "LIFETIME", label: "Lifetime" },
  { value: "HONORARY", label: "Honorary" },
] as const;

export const NEPAL_PROVINCES = [
  { code: "P1", name: "Koshi" },
  { code: "P2", name: "Madhesh" },
  { code: "P3", name: "Bagmati" },
  { code: "P4", name: "Gandaki" },
  { code: "P5", name: "Lumbini" },
  { code: "P6", name: "Karnali" },
  { code: "P7", name: "Sudurpashchim" },
] as const;