"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { GATES } from "@/lib/xor/gates";
import { useProgress } from "@/lib/xor/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({ component: Compare });

function Compare() {
  const done = useProgress((s) => s.completedGates);
  const reset = useProgress((s) => s.reset);

  return (
    <div className="space-y-8 pb-16">
      <header className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Compare</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">Which XOR to put on the board</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Same truth table. Different spend, different output discipline, different
          architecture. If you are modeling a protocol that fans into another gate, skip
          XOR 1.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">
              <th className="px-4 py-3 font-medium">Build</th>
              <th className="px-4 py-3 font-medium">NPN</th>
              <th className="px-4 py-3 font-medium">Family</th>
              <th className="px-4 py-3 font-medium">Cascade</th>
              <th className="px-4 py-3 font-medium">Use when</th>
            </tr>
          </thead>
          <tbody>
            {GATES.map((g) => (
              <tr key={g.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link
                    to="/gates/$slug"
                    params={{ slug: g.slug }}
                    className="font-medium text-fg no-underline hover:underline"
                  >
                    XOR {g.number}
                  </Link>
                  {done.includes(g.slug) ? (
                    <span className="ml-2 text-xs text-high">built</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">{g.transistors}</td>
                <td className="px-4 py-3 uppercase tracking-wide text-muted">{g.family}</td>
                <td className={cn("px-4 py-3", g.cascade ? "text-high" : "text-muted")}>
                  {g.cascade ? "yes" : "LED only"}
                </td>
                <td className="px-4 py-3 text-muted">
                  {g.slug === "xor-1" && "Demo lamp, no fan-out"}
                  {g.slug === "xor-2" && "Default cell for adders and parity"}
                  {g.slug === "xor-3" && "NAND-native computers"}
                  {g.slug === "xor-4" && "NOR-native machines"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="max-w-2xl space-y-3">
        <h2 className="font-display text-2xl tracking-tight">A practical order</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>XOR 2 if you will reuse the output. Six transistors, five resistors.</li>
          <li>XOR 1 only to see the sink-LED trick. Do not put it in an ALU.</li>
          <li>XOR 3 when the rest of the board is NAND (the usual 4-NAND recipe).</li>
          <li>XOR 4 when you are deliberately NOR-universal. Ten transistors is the cost.</li>
        </ol>
      </section>

      <Button variant="ghost" onClick={reset}>
        Reset notebook progress
      </Button>
    </div>
  );
}
