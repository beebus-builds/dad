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
    <div className="border-border/70 bg-card/80 shadow-soft flex flex-col gap-2 rounded-2xl border p-2 sm:flex-row sm:items-center">
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-muted/60 focus-visible:border-primary/40 focus-visible:bg-card h-10 border-transparent pl-10 shadow-none"
          />
        </div>
      )}
      {selects.map((s) => (
        <select
          key={s.key}
          value={s.value}
          onChange={(e) => s.onChange(e.target.value)}
          className="bg-muted/60 text-foreground hover:border-primary/20 focus:border-primary/40 focus:ring-ring h-10 rounded-xl border border-transparent px-3 text-sm transition-colors outline-none focus:ring-2 focus:ring-offset-2"
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
