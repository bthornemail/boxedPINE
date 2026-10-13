"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { XorLab } from "@/components/circuit/xor-lab";
import { PartsList, StepList } from "@/components/wiki/step-list";
import { gateBySlug, GATES } from "@/lib/xor/gates";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/gates/$slug")({
  component: GatePage,
});

function GatePage() {
  const { slug } = Route.useParams();
  const gate = gateBySlug(slug);

  if (!gate) {
    return (
      <div className="py-16">
        <h1 className="font-display text-3xl">No such gate</h1>
        <p className="mt-2 text-muted">The four builds are XOR 1 through XOR 4.</p>
        <Link to="/" className="mt-4 inline-block text-accent">
          Back to overview
        </Link>
      </div>
    );
  }

  const idx = GATES.findIndex((g) => g.slug === gate.slug);
  const prev = idx > 0 ? GATES[idx - 1] : null;
  const next = idx < GATES.length - 1 ? GATES[idx + 1] : null;

  return (
    <article className="space-y-10 pb-16">
      <header className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>XOR {gate.number}</Badge>
          <Badge>{gate.transistors} NPN</Badge>
          <Badge>{gate.family}</Badge>
          {gate.recommended ? <Badge className="bg-accent/10 text-accent">recommended</Badge> : null}
        </div>
        <h1 className="font-display mt-4 text-4xl tracking-tight">{gate.name}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">{gate.lead}</p>
      </header>

      <XorLab slug={gate.slug} />

      <section className="max-w-2xl space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Why this topology</h2>
        <p className="text-sm leading-relaxed text-muted">{gate.why}</p>
        <p className="text-sm leading-relaxed text-muted">{gate.how}</p>
        <p className="rounded-lg bg-bg-warm/80 px-4 py-3 text-sm leading-relaxed text-fg">{gate.caveat}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Parts</h2>
        <PartsList gate={gate} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Walkthrough</h2>
        <p className="max-w-2xl text-sm text-muted">
          Check each step as you seat it. The live schematic above stays available — keep
          A and B in the combination you are debugging.
        </p>
        <StepList gate={gate} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Bench check</h2>
        <ul className="max-w-2xl space-y-2 text-sm leading-relaxed text-muted">
          {gate.test.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
              <span className="font-mono text-[13px]">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        {prev ? (
          <Link
            to="/gates/$slug"
            params={{ slug: prev.slug }}
            className="inline-flex items-center gap-2 text-sm text-fg no-underline"
          >
            <ArrowLeft className="size-4" />
            XOR {prev.number}
          </Link>
        ) : (
          <Link to="/basics" className="inline-flex items-center gap-2 text-sm text-fg no-underline">
            <ArrowLeft className="size-4" />
            Breadboard 101
          </Link>
        )}
        {next ? (
          <Link
            to="/gates/$slug"
            params={{ slug: next.slug }}
            className="inline-flex items-center gap-2 text-sm text-fg no-underline"
          >
            XOR {next.number}
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <Link to="/protocol" className="inline-flex items-center gap-2 text-sm text-fg no-underline">
            Protocol bench
            <ArrowRight className="size-4" />
          </Link>
        )}
      </nav>
    </article>
  );
}
