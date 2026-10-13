import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-bg-warm px-2.5 py-0.5 text-xs font-medium tracking-wide text-muted",
        className,
      )}
      {...props}
    />
  );
}
