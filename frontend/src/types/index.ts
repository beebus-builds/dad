// Domain entity types are colocated by feature module under src/domain.
// This barrel re-exports them so feature code can import from a single place.
export * from "@/domain/auth";
export * from "@/domain/people";
export * from "@/domain/content";
export * from "@/domain/engagement";
export * from "@/domain/operations";
export * from "@/domain/interactions";
export * from "@/domain/campaigns";