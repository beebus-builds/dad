"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WizardStep = {
  id: string;
  label: string;
  description?: string;
};

export function FormWizard({
  steps,
  currentStep,
  onStepChange,
  children,
  onNext,
  isSubmitting,
  previousLabel = "Previous",
  nextLabel = "Next",
  saveLabel = "Save",
}: {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  onNext?: () => Promise<boolean>;
  isSubmitting?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  saveLabel?: string;
}) {
  const [transitioning, setTransitioning] = useState(false);
  const total = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === total - 1;

  const handleNext = async () => {
    if (onNext) {
      setTransitioning(true);
      const ok = await onNext();
      setTransitioning(false);
      if (!ok) return;
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="space-y-8">
      <nav aria-label="Form progress" className="space-y-2">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isCompleted = i < currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isCompleted && onStepChange(i)}
                disabled={!isCompleted && !isActive}
                className={cn(
                  "flex flex-col items-center gap-1 text-center transition-colors",
                  isActive && "text-primary",
                  isCompleted && "cursor-pointer text-success hover:text-success/80",
                  !isCompleted && !isActive && "text-muted-foreground/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                    isActive && "bg-primary text-primary-foreground ring-2 ring-primary/20",
                    isCompleted && "bg-success text-success-foreground",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground/40",
                  )}
                >
                  {isCompleted ? "✓" : i + 1}
                </span>
                <span className="hidden text-xs font-medium sm:block">{step.label}</span>
              </button>
            );
          })}
        </div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStep) / (total - 1)) * 100}%` }}
          />
        </div>
      </nav>

      <div
        className={cn(
          "transition-all duration-300",
          transitioning && "pointer-events-none opacity-50",
        )}
      >
        {children}
      </div>

      <div className="flex items-center justify-between border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={isFirst || transitioning}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> {previousLabel}
        </Button>

        <div className="flex items-center gap-2">
          {!isLast ? (
            <Button type="button" onClick={handleNext} disabled={transitioning}>
              {nextLabel} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting || transitioning}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saveLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
