"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type FilterBarSelect = {
  key: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  selects = [],
  children,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  selects?: FilterBarSelect[];
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}
      {selects.map((s) => (
        <select
          key={s.key}
          value={s.value}
          onChange={(e) => s.onChange(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      {children}
    </div>
  );
}
