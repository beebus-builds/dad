"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { InputProps } from "@/components/ui/input";

const PasswordInput = forwardRef<
  HTMLInputElement,
  InputProps & { showPasswordLabel?: string; hidePasswordLabel?: string }
>(
  (
    {
      className,
      showPasswordLabel = "Show password",
      hidePasswordLabel = "Hide password",
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "border-input bg-card text-foreground ring-offset-background placeholder:text-muted-foreground/70 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-ring flex h-11 w-full rounded-xl border px-3.5 py-2 pr-12 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground absolute top-0.5 right-0.5 h-10 w-10"
          onClick={() => setVisible(!visible)}
          tabIndex={-1}
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
