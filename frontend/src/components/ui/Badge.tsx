import type { ReactNode } from "react";
import { TONE_CLASS, type Tone } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function Badge({
  tone = "lavender",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Kotak emoji pastel untuk ikon kategori. */
export function IconBubble({
  emoji,
  tone,
  size = "md",
}: {
  emoji: string;
  tone: Tone;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "h-9 w-9 text-lg" : size === "lg" ? "h-14 w-14 text-3xl" : "h-11 w-11 text-xl";
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-2xl", sizeClass, TONE_CLASS[tone])}
    >
      {emoji}
    </span>
  );
}
