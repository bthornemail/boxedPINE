import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/basics")({ component: Basics });

function Basics() {
  return (
    <article className="max-w-2xl space-y-10 pb-16">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Chapter 0</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">Breadboard 101</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          All four XOR builds use the same kit: a solderless breadboard, 2N2222 or 2N3904
          NPNs, 2 kΩ resistors, one LED, 22 AWG solid-core wire, and 5 V. Inputs are
          asserted by inserting a resistor from +5 V to the base net — pull it out for 0.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">The board</h2>
        <p className="text-sm leading-relaxed text-muted">
          Power rails run the long edges and are electrically continuous along each stripe.
          The interior is columns: holes a–e are shorted together, the gutter breaks the
          connection, then f–j are a second shorted group. One transistor sits across three
          adjacent columns so emitter, base, and collector are on isolated nets.
        </p>
        <div className="overflow-hidden rounded-xl bg-[#d8c9a8] p-4 shadow-[var(--shadow-border)]">
          <div className="rounded-md bg-[#efe6cf] p-3">
            <div className="mb-2 flex justify-between">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="size-2 rounded-full bg-rail-v/70" />
              ))}
            </div>
            {["a", "b", "c", "d", "e"].map((row) => (
              <div key={row} className="mb-1 flex items-center gap-2">
                <span className="w-3 font-mono text-[10px] text-fg/40">{row}</span>
                <div className="flex flex-1 justify-between">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="size-1.5 rounded-full bg-fg/20 md:size-2" />
                  ))}
                </div>
              </div>
            ))}
            <div className="my-2 h-4 rounded-sm bg-[#d8c9a8]" />
            {["f", "g", "h", "i", "j"].map((row) => (
              <div key={row} className="mb-1 flex items-center gap-2">
                <span className="w-3 font-mono text-[10px] text-fg/40">{row}</span>
                <div className="flex flex-1 justify-between">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className="size-1.5 rounded-full bg-fg/20 md:size-2" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-fg/50">+ rail · columns a–e · gutter · f–j · − rail</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Transistors</h2>
        <p className="text-sm leading-relaxed text-muted">
          2N2222 and 2N3904 are both NPN BJTs that switch cleanly at 5 V. With the flat
          facing you, the pins are emitter, base, collector. The base always gets a series
          resistor (the 2 kΩ input). Never tie a base straight to +5 V. A conducting NPN
          drops about 0.1–0.2 V collector-to-emitter; treat that as logic 0.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Resistors and the LED</h2>
        <p className="text-sm leading-relaxed text-muted">
          2 kΩ is the value on every diagram. Anything from 330 Ω to 2.2 kΩ works; lower
          values make brighter LEDs and hotter transistors. The LED needs that limiter or
          it will take 20 mA+ and die. Red LEDs drop ~1.8 V, green/blue closer to 3 V —
          both are fine on 5 V with 2 kΩ.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Power</h2>
        <p className="text-sm leading-relaxed text-muted">
          5 V from a USB pack, a phone charger with the cable split to 22 AWG, or a
          breadboard regulator module. Keep the module off the board if you can — two
          wires into the rails leave more columns for gates. XOR 4 draws the most; XOR 1
          the least. If a USB pack auto-shuts off, the current is too low: press it again
          or add a dummy load LED on the rails.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Wire</h2>
        <p className="text-sm leading-relaxed text-muted">
          22 AWG solid core on spools, color by function: red +5 V, black ground, another
          color for data. Cut so the jacket lies flat. Flexible jumper wires are faster
          and harder to photograph or debug. Pre-cut packs are color-by-length, which
          fights a function color code — recut them if you use them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">The input convention</h2>
        <p className="text-sm leading-relaxed text-muted">
          In these four builds, A and B are not CMOS pads. They are resistors you insert
          from +5 V onto the base nets. Inserted = 1. Removed = 0. The live lab in this
          wiki treats the toggle the same way. When you cascade XOR 2 into another gate,
          replace that input resistor with the previous collector.
        </p>
      </section>

      <Button asChild>
        <Link to="/lab">Open the live lab</Link>
      </Button>
    </article>
  );
}
