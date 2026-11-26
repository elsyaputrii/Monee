"use client";

import { cn } from "@/lib/cn";

interface SegmentedProps<V extends string> {
  options: { value: V; label: string }[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
}

/** Tombol pilihan berbentuk pil (tab). */
export function Segmented<V extends string>({ options, value, onChange, className }: SegmentedProps<V>) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex rounded-2xl border border-border bg-surface-2 p-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl px-4 py-1.5 text-sm font-semibold transition",
              active ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
