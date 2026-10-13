"use client";

import { cn } from "@/lib/utils";
import { bit } from "@/lib/xor/logic";

export function InputToggles({
  a,
  b,
  onA,
  onB,
  labels = { a: "Input A", b: "Input B" },
}: {
  a: boolean;
  b: boolean;
  onA: (v: boolean) => void;
  onB: (v: boolean) => void;
  labels?: { a: string; b: string };
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <BitSwitch label={labels.a} value={a} onChange={onA} />
      <BitSwitch label={labels.b} value={b} onChange={onB} />
    </div>
  );
}

export function BitSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex min-h-11 min-w-[9.5rem] items-center justify-between gap-4 rounded-lg bg-surface px-3.5 py-2 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-out hover:shadow-[var(--shadow-border-hover)]",
      )}
      aria-pressed={value}
    >
      <span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">
          {label}
        </span>
        <span className="font-mono text-sm tabular-nums">
          {value ? "resistor in · 1" : "resistor out · 0"}
        </span>
      </span>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-sm font-mono text-sm tabular-nums",
          value ? "bg-high text-primary-fg" : "bg-bg-warm text-muted",
        )}
      >
        {bit(value)}
      </span>
    </button>
  );
}

export function LedBadge({ on, label = "LED" }: { on: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface px-3.5 py-2 shadow-[var(--shadow-border)]">
      <span
        className={cn(
          "size-4 rounded-full transition-[background-color,box-shadow] duration-200",
          on ? "bg-led shadow-[0_0_16px_2px_color-mix(in_oklab,var(--color-led)_55%,transparent)]" : "bg-led-dim",
        )}
        aria-hidden
      />
      <span>
        <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">
          {label}
        </span>
        <span className="font-mono text-sm tabular-nums">{on ? "ON · 1" : "OFF · 0"}</span>
      </span>
    </div>
  );
}
