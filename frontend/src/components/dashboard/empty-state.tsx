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
        "border-border/80 bg-muted/25 animate-fade-in grid place-items-center rounded-2xl border border-dashed p-12 text-center",
        className,
      )}
    >
      <div className="bg-primary/10 text-primary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl">
        <Icon className="text-muted-foreground h-6 w-6" />
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      {description && (
        <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">{description}</p>
      )}
      {hint && (
        <p className="text-muted-foreground/70 mx-auto mt-3 max-w-sm text-xs italic">{hint}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
