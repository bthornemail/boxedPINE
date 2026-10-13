"use client";

import { Check } from "lucide-react";
import type { Gate } from "@/lib/xor/gates";
import { useProgress } from "@/lib/xor/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NONE: number[] = [];

export function StepList({ gate }: { gate: Gate }) {
  const checked = useProgress((s) => s.checkedSteps[gate.slug] ?? NONE);
  const toggle = useProgress((s) => s.toggleStep);
  const completeGate = useProgress((s) => s.completeGate);
  const completed = useProgress((s) => s.completedGates.includes(gate.slug));
  const allDone = checked.length === gate.steps.length && gate.steps.length > 0;

  return (
    <ol className="space-y-3">
      {gate.steps.map((step, i) => {
        const on = checked.includes(i);
        return (
          <li
            key={step.title}
            className={cn(
              "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-colors duration-150",
              on && "bg-bg-warm/80",
            )}
          >
            <button
              type="button"
              onClick={() => toggle(gate.slug, i)}
              className="flex w-full items-start gap-3 text-left"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-sm font-mono text-xs tabular-nums",
                  on ? "bg-accent text-primary-fg" : "bg-bg-warm text-muted",
                )}
              >
                {on ? <Check className="size-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <span>
                <span className="block font-medium">{step.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{step.body}</span>
                {step.hint ? (
                  <span className="mt-2 block text-sm text-accent">{step.hint}</span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
      {allDone && !completed ? (
        <li className="pt-1">
          <Button onClick={() => completeGate(gate.slug)}>Mark {gate.name.split("—")[0].trim()} built</Button>
        </li>
      ) : null}
      {completed ? (
        <li className="text-sm text-high">This build is marked complete in your notebook.</li>
      ) : null}
    </ol>
  );
}

export function PartsList({ gate }: { gate: Gate }) {
  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">
            <th className="px-4 py-2.5 font-medium">Part</th>
            <th className="px-4 py-2.5 font-medium">Qty</th>
            <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Note</th>
          </tr>
        </thead>
        <tbody>
          {gate.parts.map((p) => (
            <tr key={p.item} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5">{p.item}</td>
              <td className="px-4 py-2.5 font-mono tabular-nums">{p.qty}</td>
              <td className="hidden px-4 py-2.5 text-muted sm:table-cell">{p.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
