import type { ReactNode } from "react";
import { IconBubble } from "./Badge";
import type { Tone } from "@/lib/constants";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: string;
  emoji: string;
  tone: Tone;
  hint?: ReactNode;
  valueClassName?: string;
  className?: string;
}

export function StatCard({ label, value, emoji, tone, hint, valueClassName, className }: StatCardProps) {
  return (
    <div className={cn("rounded-3xl border border-border bg-surface p-4 sm:p-5", className)}>
      <div className="flex items-center gap-3">
        <IconBubble emoji={emoji} tone={tone} size="sm" />
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
      <p className={cn("mt-3 truncate text-xl font-extrabold tracking-tight sm:text-2xl", valueClassName)}>
        {value}
      </p>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
