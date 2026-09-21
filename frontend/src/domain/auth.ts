import { z } from "zod";
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

export type UserProfileUpdate = {
  fullName?: string;
  phone?: string;
};

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