import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  hint,
  action,
  className,
}: {
  icon?: typeof Inbox;
  title: string;
  description?: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-lg border border-dashed bg-muted/20 p-12 text-center animate-fade-in",
        className,
      )}
    >
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {hint && (
        <p className="mx-auto mt-3 max-w-sm text-xs text-muted-foreground/70 italic">{hint}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
