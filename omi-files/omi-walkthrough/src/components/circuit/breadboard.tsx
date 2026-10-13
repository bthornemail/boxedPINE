import { cn } from "@/lib/utils";
import { xor } from "@/lib/xor/logic";
import type { GateSlug } from "@/lib/xor/gates";

const COLS = 22;
const ROWS = ["a", "b", "c", "d", "e"] as const;

function Hole({ lit }: { lit?: boolean }) {
  return (
    <span
      className={cn(
        "size-1.5 rounded-full md:size-2",
        lit ? "bg-high" : "bg-fg/25",
      )}
    />
  );
}

function TO92({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className={cn(
          "flex h-7 w-8 items-end justify-center rounded-t-md border border-fg/40 bg-fg",
          on && "border-high",
        )}
      >
        <span className="mb-0.5 font-mono text-[8px] text-primary-fg">{label}</span>
      </div>
      <div className="flex gap-0.5">
        <span className="h-2 w-0.5 bg-subtle" />
        <span className="h-2 w-0.5 bg-subtle" />
        <span className="h-2 w-0.5 bg-subtle" />
      </div>
    </div>
  );
}

function Rbody({ label, inserted = true }: { label: string; inserted?: boolean }) {
  if (!inserted) {
    return (
      <div className="flex h-6 w-10 items-center justify-center rounded-sm border border-dashed border-border font-mono text-[8px] text-subtle">
        {label}
      </div>
    );
  }
  return (
    <div className="flex h-5 w-12 items-center overflow-hidden rounded-sm bg-[#c4a574]">
      <span className="h-full w-1 bg-[#4a3a1a]" />
      <span className="h-full w-1 bg-red-800" />
      <span className="h-full w-1 bg-black" />
      <span className="mx-auto font-mono text-[8px] text-fg/80">{label}</span>
    </div>
  );
}

export function Breadboard({
  slug,
  a,
  b,
}: {
  slug: GateSlug;
  a: boolean;
  b: boolean;
}) {
  const out = xor(a, b);
  const nandOn = !(a && b);
  const count = slug === "xor-1" ? 5 : slug === "xor-2" ? 6 : slug === "xor-3" ? 8 : 10;
  const transistors =
    slug === "xor-1"
      ? [
          { id: "T1", on: a },
          { id: "T2", on: a && b },
          { id: "T3", on: nandOn && out },
          { id: "T4", on: a && out },
          { id: "T5", on: b && out },
        ]
      : slug === "xor-2"
        ? [
            { id: "T1", on: a },
            { id: "T2", on: a && b },
            { id: "T3", on: nandOn && out },
            { id: "T4", on: a && out },
            { id: "T5", on: b && out },
            { id: "T6", on: !out },
          ]
        : slug === "xor-3"
          ? Array.from({ length: 8 }, (_, i) => ({
              id: `T${i + 1}`,
              on: out && i >= 6 ? true : i < 2 ? a || b : out,
            }))
          : Array.from({ length: 10 }, (_, i) => ({
              id: `T${i + 1}`,
              on: i >= 8 ? out : a !== b,
            }));

  return (
    <div className="overflow-hidden rounded-xl bg-[#d8c9a8] p-2 shadow-[var(--shadow-border)] md:p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg/50">
          solderless · {count} NPN
        </p>
        <p className="font-mono text-[10px] text-fg/50">5 V rail</p>
      </div>
      <div className="flex gap-1">
        <div className="flex w-3 flex-col justify-between py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="size-1.5 rounded-full bg-rail-v/80" />
          ))}
        </div>
        <div className="min-w-0 flex-1 rounded-md bg-[#efe6cf] p-2">
          <div className="mb-2 flex justify-between">
            {Array.from({ length: COLS }).map((_, i) => (
              <Hole key={`p${i}`} lit={i < 3} />
            ))}
          </div>
          <div className="mb-3 flex flex-wrap items-end justify-center gap-2 md:gap-3">
            <Rbody label="A" inserted={a} />
            <Rbody label="B" inserted={b} />
            {transistors.map((t) => (
              <TO92 key={t.id} label={t.id} on={t.on} />
            ))}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "size-5 rounded-full border border-fg/20",
                  out ? "bg-led shadow-[0_0_12px_var(--color-led)]" : "bg-[#6a6a62]",
                )}
              />
              <span className="mt-0.5 font-mono text-[8px] text-fg/60">LED</span>
            </div>
          </div>
          {ROWS.map((row) => (
            <div key={row} className="mb-1 flex justify-between">
              {Array.from({ length: COLS }).map((_, i) => (
                <Hole key={`${row}${i}`} />
              ))}
            </div>
          ))}
          <div className="my-2 h-px bg-fg/10" />
          {ROWS.map((row) => (
            <div key={`b${row}`} className="mb-1 flex justify-between">
              {Array.from({ length: COLS }).map((_, i) => (
                <Hole key={`${row}b${i}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex w-3 flex-col justify-between py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="size-1.5 rounded-full bg-rail-g/80" />
          ))}
        </div>
      </div>
      <p className="mt-2 px-1 font-mono text-[10px] text-fg/55">
        A {a ? "in" : "out"} · B {b ? "in" : "out"} · LED {out ? "on" : "off"}
      </p>
    </div>
  );
}
