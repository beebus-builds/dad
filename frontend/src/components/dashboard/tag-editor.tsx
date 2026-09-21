"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function TagEditor({
  tags,
  onChange,
  placeholder,
  disabled,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const value = draft.trim().toLowerCase();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="gap-1 pr-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!disabled && (
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          placeholder={placeholder}
          className="h-9"
        />
      )}
    </div>
  );
}
