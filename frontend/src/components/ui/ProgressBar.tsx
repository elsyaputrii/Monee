import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0 - 100 (nilai di atas 100 dipotong) */
  value: number;
  barClassName?: string;
  className?: string;
}

export function ProgressBar({ value, barClassName = "bg-lavender-ink/60", className }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
