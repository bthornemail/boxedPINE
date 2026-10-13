"use client";

import { useMemo, useState, type ReactNode } from "react";
import { BitSwitch, LedBadge } from "@/components/circuit/input-toggles";
import { Button } from "@/components/ui/button";
import { halfAdder, oddParity, xor, bit } from "@/lib/xor/logic";
import { useProgress, type ProtocolId } from "@/lib/xor/store";
import { cn } from "@/lib/utils";

function Card({
  id,
  title,
  kicker,
  children,
}: {
  id: ProtocolId;
  title: string;
  kicker: string;
  children: ReactNode;
}) {
  const done = useProgress((s) => s.completedProtocols.includes(id));
  const complete = useProgress((s) => s.completeProtocol);
  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">{kicker}</p>
      <h2 className="font-display mt-1 text-2xl tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
      <div className="mt-5">
        {done ? (
          <p className="text-sm text-high">Logged in the notebook.</p>
        ) : (
          <Button variant="secondary" onClick={() => complete(id)}>
            Mark this protocol understood
          </Button>
        )}
      </div>
    </section>
  );
}

export function ProtocolBench() {
  return (
    <div className="space-y-6">
      <Handshake />
      <HalfAdder />
      <Parity />
      <Invert />
    </div>
  );
}

function Handshake() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const disagree = xor(a, b);
  return (
    <Card id="handshake" kicker="Protocol 1" title="Exclusive handshake">
      <p className="text-sm leading-relaxed text-muted">
        Two stations each assert a bit. The XOR is the disagreement wire: it is high only
        when the stations do not match. That is the exclusive-OR protocol in one sentence —
        shared-true is silent, exclusive-true is the event.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <BitSwitch label="Station A" value={a} onChange={setA} />
        <BitSwitch label="Station B" value={b} onChange={setB} />
        <LedBadge on={disagree} label="Disagree" />
      </div>
      <p className="mt-3 font-mono text-sm tabular-nums text-muted">
        A={bit(a)} ⊕ B={bit(b)} → {bit(disagree)} {disagree ? "mismatch" : "agree"}
      </p>
    </Card>
  );
}

function HalfAdder() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const { sum, carry } = halfAdder(a, b);
  return (
    <Card id="half-adder" kicker="Protocol 2" title="Half-adder">
      <p className="text-sm leading-relaxed text-muted">
        Binary addition of two bits is XOR plus AND. Sum is exclusive — 1+0 and 0+1 write
        a 1 with no carry. 1+1 writes a 0 and raises carry. Build XOR 2 for the sum bit;
        a two-transistor NAND plus inverter, or two series NPNs, makes the carry.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <BitSwitch label="Bit A" value={a} onChange={setA} />
        <BitSwitch label="Bit B" value={b} onChange={setB} />
        <LedBadge on={sum} label="Sum ⊕" />
        <LedBadge on={carry} label="Carry ·" />
      </div>
      <div className="mt-4 overflow-hidden rounded-lg bg-bg-warm/70">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-subtle">
              <th className="px-3 py-2 font-medium">A</th>
              <th className="px-3 py-2 font-medium">B</th>
              <th className="px-3 py-2 font-medium">Sum</th>
              <th className="px-3 py-2 font-medium">Carry</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {[
              [false, false],
              [true, false],
              [false, true],
              [true, true],
            ].map(([x, y]) => {
              const r = halfAdder(x, y);
              const live = x === a && y === b;
              return (
                <tr key={`${x}${y}`} className={cn(live && "bg-surface")}>
                  <td className="px-3 py-1.5">{bit(x)}</td>
                  <td className="px-3 py-1.5">{bit(y)}</td>
                  <td className="px-3 py-1.5">{bit(r.sum)}</td>
                  <td className="px-3 py-1.5">{bit(r.carry)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Parity() {
  const [bits, setBits] = useState([true, false, true]);
  const p = useMemo(() => oddParity(bits), [bits]);
  return (
    <Card id="parity" kicker="Protocol 3" title="Odd parity">
      <p className="text-sm leading-relaxed text-muted">
        XOR is associative. Chain three (or n) bits and the result is 1 iff an odd number
        of them are 1. Breadboard this as two XOR 2 cells: first ⊕ second, then that result
        ⊕ third. Parity bits on buses and memory are this protocol.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {bits.map((v, i) => (
          <BitSwitch
            key={i}
            label={`Bit ${i}`}
            value={v}
            onChange={(next) =>
              setBits((prev) => prev.map((b, j) => (j === i ? next : b)))
            }
          />
        ))}
        <LedBadge on={p} label="Odd parity" />
      </div>
      <p className="mt-3 font-mono text-sm tabular-nums text-muted">
        {bits.map(bit).join(" ⊕ ")} = {bit(p)}
      </p>
    </Card>
  );
}

function Invert() {
  const [data, setData] = useState(true);
  const [ctrl, setCtrl] = useState(true);
  const out = xor(data, ctrl);
  return (
    <Card id="invert" kicker="Protocol 4" title="Controlled invert">
      <p className="text-sm leading-relaxed text-muted">
        XOR with 0 copies a bit. XOR with 1 flips it. A control line into one XOR input is
        a programmable inverter — subtract in an ALU is add with every bit of B inverted
        and carry-in set, which is why transistor computers hang XOR on the ALU B-side.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <BitSwitch label="Data" value={data} onChange={setData} />
        <BitSwitch label="Invert if 1" value={ctrl} onChange={setCtrl} />
        <LedBadge on={out} label="Result" />
      </div>
      <p className="mt-3 text-sm text-muted">
        {ctrl ? "Control is high — data is complemented." : "Control is low — data passes through."}{" "}
        <span className="font-mono tabular-nums">
          {bit(data)} ⊕ {bit(ctrl)} = {bit(out)}
        </span>
      </p>
    </Card>
  );
}
