"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { XorLab } from "@/components/circuit/xor-lab";
import { GATES, type GateSlug } from "@/lib/xor/gates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lab")({ component: Lab });

function Lab() {
  const [slug, setSlug] = useState<GateSlug>("xor-2");
  return (
    <div className="space-y-6 pb-16">
      <header className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Live lab</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">Toggle the exclusive</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Same truth table, four topologies. Green traces are nets that sit high or
          conduct in this input pair. Insert A or B and watch the LED, the NAND or NOR
          cells, and the breadboard transistor row.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {GATES.map((g) => (
          <button
            key={g.slug}
            type="button"
            onClick={() => setSlug(g.slug)}
            className={cn(
              "h-11 rounded-md px-3 text-sm font-medium shadow-[var(--shadow-border)] transition-colors duration-150",
              slug === g.slug ? "bg-primary text-primary-fg" : "bg-surface text-fg hover:bg-bg-warm",
            )}
          >
            XOR {g.number}
          </button>
        ))}
      </div>
      <XorLab slug={slug} />
    </div>
  );
}
