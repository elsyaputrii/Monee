import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-3xl border border-border bg-surface p-5", className)} {...props} />
  );
}

interface CardTitleProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function CardTitle({ title, action, className }: CardTitleProps) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h2 className="text-base font-bold">{title}</h2>
      {action}
    </div>
  );
}
