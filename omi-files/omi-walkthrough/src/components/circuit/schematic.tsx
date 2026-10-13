import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { nand, nor, xor, xnor } from "@/lib/xor/logic";
import type { GateSlug } from "@/lib/xor/gates";

function wire(on: boolean) {
  return on ? "var(--color-high)" : "var(--color-trace)";
}

function Led({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon
        points="-8,-8 8,0 -8,8"
        fill={on ? "var(--color-led)" : "var(--color-surface)"}
        stroke={on ? "var(--color-led)" : "var(--color-trace)"}
        strokeWidth="1.5"
      />
      <line x1="8" y1="-8" x2="8" y2="8" stroke={on ? "var(--color-led)" : "var(--color-trace)"} strokeWidth="1.5" />
      <circle
        cx="0"
        cy="0"
        r="16"
        fill={on ? "color-mix(in oklab, var(--color-led) 22%, transparent)" : "transparent"}
      />
    </g>
  );
}

function Cell({
  x,
  y,
  w = 100,
  h = 64,
  title,
  sub,
  on,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  sub: string;
  on: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        rx="10"
        fill="var(--color-surface)"
        stroke={wire(on)}
        strokeWidth="1.75"
      />
      <text x={w / 2} y="26" textAnchor="middle" fontSize="12" fontFamily="var(--font-sans)" fill="var(--color-fg)">
        {title}
      </text>
      <text
        x={w / 2}
        y="46"
        textAnchor="middle"
        fontSize="10"
        fontFamily="var(--font-mono)"
        fill="var(--color-muted)"
      >
        {sub}
      </text>
    </g>
  );
}

export function Xor1Schematic({ a, b }: { a: boolean; b: boolean }) {
  const n = nand(a, b);
  const o = a || b;
  const x = xor(a, b);
  return (
    <svg viewBox="0 0 680 220" className="h-auto w-full" role="img" aria-label="XOR 1 five-transistor schematic">
      <text x="24" y="36" fontSize="12" fill="var(--color-muted)" fontFamily="var(--font-mono)">
        A {a ? "1" : "0"}
      </text>
      <text x="24" y="168" fontSize="12" fill="var(--color-muted)" fontFamily="var(--font-mono)">
        B {b ? "1" : "0"}
      </text>
      <line x1="56" y1="32" x2="120" y2="32" stroke={wire(a)} strokeWidth="2" />
      <line x1="56" y1="164" x2="120" y2="164" stroke={wire(b)} strokeWidth="2" />
      <line x1="56" y1="32" x2="56" y2="88" stroke={wire(a)} strokeWidth="1.5" />
      <line x1="56" y1="164" x2="56" y2="108" stroke={wire(b)} strokeWidth="1.5" />
      <line x1="56" y1="88" x2="120" y2="88" stroke={wire(a)} strokeWidth="1.5" />
      <line x1="56" y1="108" x2="120" y2="108" stroke={wire(b)} strokeWidth="1.5" />

      <Cell x={120} y={66} title="NAND T1–T2" sub={`series · ${n ? "1" : "0"}`} on={n} />
      <line x1="220" y1="98" x2="268" y2="98" stroke={wire(n)} strokeWidth="2" />

      <Cell x={268} y={66} title="Switch T3" sub={`enable · ${n ? "on" : "off"}`} on={n} />
      <line x1="368" y1="98" x2="416" y2="98" stroke={wire(n)} strokeWidth="2" />

      <line x1="56" y1="32" x2="416" y2="32" stroke={wire(a)} strokeWidth="1.25" strokeDasharray="5 4" />
      <line x1="56" y1="164" x2="416" y2="164" stroke={wire(b)} strokeWidth="1.25" strokeDasharray="5 4" />
      <line x1="416" y1="32" x2="416" y2="66" stroke={wire(a)} strokeWidth="1.25" strokeDasharray="5 4" />
      <line x1="416" y1="164" x2="416" y2="130" stroke={wire(b)} strokeWidth="1.25" strokeDasharray="5 4" />

      <Cell x={416} y={66} title="OR T4–T5" sub={`parallel · ${o ? "1" : "0"}`} on={o} />
      <line x1="516" y1="98" x2="568" y2="98" stroke={wire(x)} strokeWidth="2" />
      <Led x={596} y={98} on={x} />
      <text x="620" y="102" fontSize="11" fill={x ? "var(--color-led)" : "var(--color-muted)"} fontFamily="var(--font-mono)">
        {x ? "ON" : "off"}
      </text>
      <text x={120} y={204} fontSize="11" fill="var(--color-muted)" fontFamily="var(--font-sans)">
        LED sinks only when NAND is high and OR is high — exclusive-OR.
      </text>
    </svg>
  );
}

export function Xor2Schematic({ a, b }: { a: boolean; b: boolean }) {
  const n = nand(a, b);
  const x = xor(a, b);
  return (
    <svg viewBox="0 0 720 220" className="h-auto w-full" role="img" aria-label="XOR 2 six-transistor schematic">
      <text x="20" y="36" fontSize="12" fill="var(--color-muted)" fontFamily="var(--font-mono)">
        A {a ? "1" : "0"}
      </text>
      <text x="20" y="168" fontSize="12" fill="var(--color-muted)" fontFamily="var(--font-mono)">
        B {b ? "1" : "0"}
      </text>
      <line x1="52" y1="32" x2="100" y2="88" stroke={wire(a)} strokeWidth="1.75" />
      <line x1="52" y1="164" x2="100" y2="108" stroke={wire(b)} strokeWidth="1.75" />
      <Cell x={100} y={66} w={110} title="XOR 1 core" sub={`T1–T5 · ${x ? "sink" : "open"}`} on={x} />
      <line x1="210" y1="98" x2="268" y2="98" stroke={wire(x)} strokeWidth="2" />
      <Cell x={268} y={66} w={120} title="T6 invert" sub={`base from sink`} on={!x} />
      <line x1="388" y1="98" x2="460" y2="98" stroke={wire(x)} strokeWidth="2" />
      <Cell x={460} y={66} w={120} title="Vout collector" sub={x ? "high · 1" : "low · 0"} on={x} />
      <line x1="580" y1="98" x2="628" y2="98" stroke={wire(x)} strokeWidth="2" />
      <Led x={656} y={98} on={x} />
      <text x="678" y="102" fontSize="11" fill={x ? "var(--color-led)" : "var(--color-muted)"} fontFamily="var(--font-mono)">
        {x ? "ON" : "off"}
      </text>
      <text x={100} y={204} fontSize="11" fill="var(--color-muted)" fontFamily="var(--font-sans)">
        NAND {n ? "1" : "0"} enables the sink. T6 inverts so the LED sources and Vout can drive the next gate.
      </text>
    </svg>
  );
}

function NandBox({
  x,
  y,
  a,
  b,
  label,
}: {
  x: number;
  y: number;
  a: boolean;
  b: boolean;
  label: string;
}) {
  const o = nand(a, b);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="0"
        y="0"
        width="88"
        height="56"
        rx="8"
        fill="var(--color-surface)"
        stroke={wire(o)}
        strokeWidth="1.5"
      />
      <text x="44" y="22" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-fg)">
        {label}
      </text>
      <text x="44" y="40" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-muted)">
        {a ? "1" : "0"}·{b ? "1" : "0"} → {o ? "1" : "0"}
      </text>
    </g>
  );
}

function NorBox({
  x,
  y,
  a,
  b,
  label,
}: {
  x: number;
  y: number;
  a: boolean;
  b: boolean;
  label: string;
}) {
  const o = nor(a, b);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="0"
        y="0"
        width="88"
        height="56"
        rx="8"
        fill="var(--color-surface)"
        stroke={wire(o)}
        strokeWidth="1.5"
      />
      <text x="44" y="22" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--color-fg)">
        {label}
      </text>
      <text x="44" y="40" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-muted)">
        {a ? "1" : "0"}·{b ? "1" : "0"} → {o ? "1" : "0"}
      </text>
    </g>
  );
}

export function Xor3Schematic({ a, b }: { a: boolean; b: boolean }) {
  const n1 = nand(a, b);
  const n2 = nand(a, n1);
  const n3 = nand(b, n1);
  const n4 = nand(n2, n3);
  return (
    <svg viewBox="0 0 640 260" className="h-auto w-full" role="img" aria-label="XOR 3 four-NAND schematic">
      <text x="24" y="28" fontSize="11" fill="var(--color-muted)" fontFamily="var(--font-sans)">
        A
      </text>
      <text x="24" y="188" fontSize="11" fill="var(--color-muted)" fontFamily="var(--font-sans)">
        B
      </text>
      <line x1="40" y1="24" x2="120" y2="24" stroke={wire(a)} strokeWidth="1.75" />
      <line x1="40" y1="24" x2="40" y2="90" stroke={wire(a)} strokeWidth="1.5" />
      <line x1="40" y1="90" x2="120" y2="90" stroke={wire(a)} strokeWidth="1.5" />
      <line x1="40" y1="184" x2="120" y2="184" stroke={wire(b)} strokeWidth="1.75" />
      <line x1="40" y1="184" x2="40" y2="118" stroke={wire(b)} strokeWidth="1.5" />
      <line x1="40" y1="118" x2="120" y2="118" stroke={wire(b)} strokeWidth="1.5" />

      <NandBox x={120} y={76} a={a} b={b} label="NAND1" />
      <line x1="208" y1="104" x2="250" y2="104" stroke={wire(n1)} strokeWidth="1.5" />
      <line x1="250" y1="48" x2="250" y2="184" stroke={wire(n1)} strokeWidth="1.5" />
      <line x1="250" y1="48" x2="310" y2="48" stroke={wire(n1)} strokeWidth="1.5" />
      <line x1="250" y1="184" x2="310" y2="184" stroke={wire(n1)} strokeWidth="1.5" />
      <line x1="120" y1="24" x2="310" y2="24" stroke={wire(a)} strokeWidth="1.5" />
      <line x1="310" y1="24" x2="310" y2="36" stroke={wire(a)} strokeWidth="1.5" />
      <line x1="120" y1="184" x2="310" y2="200" stroke={wire(b)} strokeWidth="1.5" />

      <NandBox x={310} y={20} a={a} b={n1} label="NAND2" />
      <NandBox x={310} y={156} a={b} b={n1} label="NAND3" />

      <line x1="398" y1="48" x2="450" y2="48" stroke={wire(n2)} strokeWidth="1.5" />
      <line x1="398" y1="184" x2="450" y2="184" stroke={wire(n3)} strokeWidth="1.5" />
      <line x1="450" y1="48" x2="450" y2="90" stroke={wire(n2)} strokeWidth="1.5" />
      <line x1="450" y1="184" x2="450" y2="118" stroke={wire(n3)} strokeWidth="1.5" />

      <NandBox x={450} y={76} a={n2} b={n3} label="NAND4" />
      <line x1="538" y1="104" x2="590" y2="104" stroke={wire(n4)} strokeWidth="1.75" />
      <Led x={608} y={104} on={n4} />
    </svg>
  );
}

export function Xor4Schematic({ a, b }: { a: boolean; b: boolean }) {
  const n1 = nor(a, b);
  const n2 = nor(a, n1);
  const n3 = nor(b, n1);
  const n4 = nor(n2, n3);
  const n5 = nor(n4, n4);
  return (
    <svg viewBox="0 0 700 260" className="h-auto w-full" role="img" aria-label="XOR 4 five-NOR schematic">
      <line x1="36" y1="24" x2="120" y2="24" stroke={wire(a)} strokeWidth="1.75" />
      <line x1="36" y1="24" x2="36" y2="90" stroke={wire(a)} strokeWidth="1.5" />
      <line x1="36" y1="90" x2="120" y2="90" stroke={wire(a)} strokeWidth="1.5" />
      <line x1="36" y1="184" x2="120" y2="184" stroke={wire(b)} strokeWidth="1.75" />
      <line x1="36" y1="184" x2="36" y2="118" stroke={wire(b)} strokeWidth="1.5" />
      <line x1="36" y1="118" x2="120" y2="118" stroke={wire(b)} strokeWidth="1.5" />
      <text x="20" y="28" fontSize="11" fill="var(--color-muted)">
        A
      </text>
      <text x="20" y="188" fontSize="11" fill="var(--color-muted)">
        B
      </text>

      <NorBox x={120} y={76} a={a} b={b} label="NOR1" />
      <line x1="208" y1="104" x2="248" y2="104" stroke={wire(n1)} strokeWidth="1.5" />
      <line x1="248" y1="48" x2="248" y2="184" stroke={wire(n1)} strokeWidth="1.5" />
      <line x1="248" y1="48" x2="300" y2="48" stroke={wire(n1)} strokeWidth="1.5" />
      <line x1="248" y1="184" x2="300" y2="184" stroke={wire(n1)} strokeWidth="1.5" />
      <line x1="36" y1="24" x2="300" y2="24" stroke={wire(a)} strokeWidth="1.4" />
      <line x1="300" y1="24" x2="300" y2="36" stroke={wire(a)} strokeWidth="1.4" />
      <line x1="36" y1="184" x2="300" y2="200" stroke={wire(b)} strokeWidth="1.4" />

      <NorBox x={300} y={20} a={a} b={n1} label="NOR2" />
      <NorBox x={300} y={156} a={b} b={n1} label="NOR3" />
      <line x1="388" y1="48" x2="430" y2="48" stroke={wire(n2)} strokeWidth="1.5" />
      <line x1="388" y1="184" x2="430" y2="184" stroke={wire(n3)} strokeWidth="1.5" />
      <line x1="430" y1="48" x2="430" y2="90" stroke={wire(n2)} strokeWidth="1.5" />
      <line x1="430" y1="184" x2="430" y2="118" stroke={wire(n3)} strokeWidth="1.5" />

      <NorBox x={430} y={76} a={n2} b={n3} label="NOR4 XNOR" />
      <line x1="518" y1="104" x2="560" y2="104" stroke={wire(n4)} strokeWidth="1.5" />
      <NorBox x={560} y={76} a={n4} b={n4} label="NOR5 inv" />
      <line x1="648" y1="104" x2="668" y2="104" stroke={wire(n5)} strokeWidth="1.75" />
      <Led x={684} y={104} on={n5} />
      <text x="560" y="150" fontSize="9" fill="var(--color-muted)" fontFamily="var(--font-mono)">
        XNOR {xnor(a, b) ? "1" : "0"} → XOR {xor(a, b) ? "1" : "0"}
      </text>
    </svg>
  );
}

export function GateSchematic({ slug, a, b }: { slug: GateSlug; a: boolean; b: boolean }) {
  if (slug === "xor-1") return <Xor1Schematic a={a} b={b} />;
  if (slug === "xor-2") return <Xor2Schematic a={a} b={b} />;
  if (slug === "xor-3") return <Xor3Schematic a={a} b={b} />;
  return <Xor4Schematic a={a} b={b} />;
}

export function SchematicFrame({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
        className,
      )}
    >
      <figcaption className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-subtle">
        {title}
      </figcaption>
      <div className="px-2 py-3 md:px-4">{children}</div>
    </figure>
  );
}
