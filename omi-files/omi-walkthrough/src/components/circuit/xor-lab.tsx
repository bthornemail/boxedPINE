"use client";

import { useState } from "react";
import type { GateSlug } from "@/lib/xor/gates";
import { xor } from "@/lib/xor/logic";
import { Breadboard } from "./breadboard";
import { InputToggles, LedBadge } from "./input-toggles";
import { GateSchematic, SchematicFrame } from "./schematic";
import { TruthTable } from "./truth-table";

export function XorLab({
  slug,
  showBoard = true,
}: {
  slug: GateSlug;
  showBoard?: boolean;
}) {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const out = xor(a, b);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <div className="space-y-4">
        <SchematicFrame title="Live schematic · current path in green">
          <GateSchematic slug={slug} a={a} b={b} />
        </SchematicFrame>
        {showBoard ? <Breadboard slug={slug} a={a} b={b} /> : null}
      </div>
      <div className="space-y-3">
        <InputToggles a={a} b={b} onA={setA} onB={setB} />
        <LedBadge on={out} />
        <TruthTable a={a} b={b} />
        <p className="text-sm leading-relaxed text-muted">
          Insert the A or B resistor to pull that input to +5 V. Exclusive-OR lights only
          when the two inputs disagree.
        </p>
      </div>
    </div>
  );
}
