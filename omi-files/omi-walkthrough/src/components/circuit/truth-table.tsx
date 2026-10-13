import { cn } from "@/lib/utils";
import { TRUTH, bit, xor } from "@/lib/xor/logic";

export function TruthTable({ a, b }: { a: boolean; b: boolean }) {
  const out = xor(a, b);
  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <table className="w-full text-sm">
        <caption className="sr-only">XOR truth table</caption>
        <thead>
          <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">
            <th className="px-4 py-2.5 font-medium">A</th>
            <th className="px-4 py-2.5 font-medium">B</th>
            <th className="px-4 py-2.5 font-medium">A ⊕ B</th>
          </tr>
        </thead>
        <tbody>
          {TRUTH.map((row) => {
            const active = row.a === a && row.b === b;
            return (
              <tr
                key={`${bit(row.a)}${bit(row.b)}`}
                className={cn(
                  "border-b border-border last:border-0 font-mono tabular-nums transition-colors duration-150",
                  active ? "bg-bg-warm" : "",
                )}
              >
                <td className="px-4 py-2.5">{bit(row.a)}</td>
                <td className="px-4 py-2.5">{bit(row.b)}</td>
                <td className={cn("px-4 py-2.5", row.out ? "text-high" : "text-muted")}>
                  {bit(row.out)}
                  {active ? <span className="ml-2 font-sans text-xs text-muted">live</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-2 text-xs text-muted">
        Live output {bit(a)} ⊕ {bit(b)} = <span className="font-mono text-fg">{bit(out)}</span>
      </p>
    </div>
  );
}
