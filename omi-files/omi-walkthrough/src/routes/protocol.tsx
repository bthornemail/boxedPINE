"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { ProtocolBench } from "@/components/protocol/protocol-bench";

export const Route = createFileRoute("/protocol")({ component: Protocol });

function Protocol() {
  return (
    <div className="space-y-8 pb-16">
      <header className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">
          Protocol bench
        </p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">Model the exclusive channel</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Once XOR 2 is on the board, the same cell is a disagreement detector, the sum
          bit of a half-adder, a parity fold, and a programmable inverter. These four
          protocols are the reason to build exclusive-OR instead of stopping at AND/OR.
        </p>
        <p className="mt-3 text-sm text-muted">
          Need a cascadeable cell first?{" "}
          <Link to="/gates/$slug" params={{ slug: "xor-2" }} className="text-accent">
            Build XOR 2
          </Link>
          .
        </p>
      </header>
      <ProtocolBench />
    </div>
  );
}
