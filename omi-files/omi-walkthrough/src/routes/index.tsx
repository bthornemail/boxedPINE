"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputToggles, LedBadge } from "@/components/circuit/input-toggles";
import { TruthTable } from "@/components/circuit/truth-table";
import { Xor2Schematic, SchematicFrame } from "@/components/circuit/schematic";
import { GATES } from "@/lib/xor/gates";
import { xor } from "@/lib/xor/logic";
import { useProgress } from "@/lib/xor/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const out = xor(a, b);
  const done = useProgress((s) => s.completedGates);

  return (
    <div className="space-y-14 pb-16">
      <section className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">
          Breadboard notebook
        </p>
        <h1 className="font-display mt-3 text-4xl leading-[1.1] tracking-tight md:text-5xl">
          Four ways to build exclusive-OR in transistors
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          XOR is the exclusive protocol: the output is true only when the inputs disagree.
          This wiki walks the four discrete builds — five transistors, six with a buffer,
          four NAND gates, five NOR gates — then uses them to model handshake, half-add,
          parity, and controlled invert on a breadboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/gates/$slug" params={{ slug: "xor-2" }}>
              Start with XOR 2
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/protocol">Open the protocol bench</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
        <SchematicFrame title="Recommended cell · XOR 2 · six NPN">
          <Xor2Schematic a={a} b={b} />
        </SchematicFrame>
        <div className="space-y-3">
          <InputToggles a={a} b={b} onA={setA} onB={setB} />
          <LedBadge on={out} />
          <TruthTable a={a} b={b} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl tracking-tight">The four builds</h2>
          <Link to="/compare" className="text-sm text-accent no-underline hover:underline">
            Compare
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {GATES.map((g) => (
            <Link
              key={g.slug}
              to="/gates/$slug"
              params={{ slug: g.slug }}
              className={cn(
                "group rounded-xl bg-surface p-5 no-underline shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge>XOR {g.number}</Badge>
                {done.includes(g.slug) ? (
                  <span className="text-xs text-high">built</span>
                ) : g.recommended ? (
                  <span className="text-xs text-accent">recommended</span>
                ) : null}
              </div>
              <h3 className="mt-3 font-display text-xl tracking-tight text-fg">{g.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{g.short}</p>
              <p className="mt-3 font-mono text-xs tabular-nums text-subtle">
                {g.transistors} NPN · {g.resistors} × 2 kΩ · {g.cascade ? "cascades" : "LED only"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-bg-warm/80 p-6 md:p-8">
        <h2 className="font-display text-2xl tracking-tight">How to use this notebook</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <li>
            <span className="font-medium text-fg">1. Rails and parts.</span> Read Breadboard 101
            if you have not placed a TO-92 on a solderless board.
          </li>
          <li>
            <span className="font-medium text-fg">2. Prove XOR in the live lab.</span> Toggle A
            and B until the truth table is muscle memory.
          </li>
          <li>
            <span className="font-medium text-fg">3. Build XOR 2.</span> It is the cell you will
            reuse. XOR 1 is a demo LED. XOR 3 and 4 are for NAND- or NOR-native protocols.
          </li>
          <li>
            <span className="font-medium text-fg">4. Model the protocol.</span> Handshake, half-adder,
            odd parity, and controlled invert are all XOR plus one other gate.
          </li>
        </ol>
      </section>
    </div>
  );
}
