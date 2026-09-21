// Validation schemas are colocated with their feature types in src/domain.
// This barrel re-exports them for callers that import from "@/lib/validations".
export * from "@/domain/auth";
export * from "@/domain/people";
export * from "@/domain/content";
export * from "@/domain/engagement";