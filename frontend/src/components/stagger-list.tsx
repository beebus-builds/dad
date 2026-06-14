"use client";

export function StaggerList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "backwards" }}
    >
      {children}
    </div>
  );
}
