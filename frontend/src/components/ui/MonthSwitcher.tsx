"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { currentMonth, formatMonth, shiftMonth } from "@/lib/format";
import { cn } from "@/lib/cn";

interface StepperProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

export function Stepper({ label, onPrev, onNext, onReset, resetLabel, className }: StepperProps) {
  const arrowClass =
    "flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-foreground";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="inline-flex items-center gap-1 rounded-2xl border border-border bg-surface p-1">
        <button type="button" onClick={onPrev} aria-label="Sebelumnya" className={arrowClass}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-32 text-center text-sm font-semibold">{label}</span>
        <button type="button" onClick={onNext} aria-label="Berikutnya" className={arrowClass}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl px-2.5 py-2 text-xs font-semibold text-lavender-ink transition hover:bg-lavender-soft"
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}

export function MonthSwitcher({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (month: string) => void;
  className?: string;
}) {
  const isCurrent = value === currentMonth();
  return (
    <Stepper
      label={formatMonth(value)}
      onPrev={() => onChange(shiftMonth(value, -1))}
      onNext={() => onChange(shiftMonth(value, 1))}
      onReset={isCurrent ? undefined : () => onChange(currentMonth())}
      resetLabel="Bulan ini"
      className={className}
    />
  );
}
