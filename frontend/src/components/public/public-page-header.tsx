import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicPageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon: Icon,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-border/70 bg-card shadow-soft relative overflow-hidden rounded-3xl border px-6 py-8 sm:px-10 sm:py-10",
        className,
      )}
    >
      <div className="bg-primary/[0.08] pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl" />
      <div className="bg-union-red/[0.05] pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon && (
            <span className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div>
            {eyebrow && (
              <p className="text-primary mb-2 text-xs font-bold tracking-[0.16em] uppercase">
                {eyebrow}
              </p>
            )}
            <h1 className="text-foreground text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="relative flex flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
