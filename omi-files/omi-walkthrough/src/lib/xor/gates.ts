export type GateSlug = "xor-1" | "xor-2" | "xor-3" | "xor-4";

export type Part = {
  item: string;
  qty: number;
  note: string;
};

export type Step = {
  title: string;
  body: string;
  hint?: string;
};

export type Gate = {
  slug: GateSlug;
  number: 1 | 2 | 3 | 4;
  name: string;
  short: string;
  transistors: number;
  resistors: number;
  family: "discrete" | "nand" | "nor";
  cascade: boolean;
  recommended?: boolean;
  lead: string;
  why: string;
  how: string;
  caveat: string;
  parts: Part[];
  steps: Step[];
  test: string[];
};

export const GATES: Gate[] = [
  {
    slug: "xor-1",
    number: 1,
    name: "XOR 1 — five-transistor sink",
    short: "Smallest build. Lights an LED. Cannot drive another gate.",
    transistors: 5,
    resistors: 4,
    family: "discrete",
    cascade: false,
    lead: "Five NPN transistors implement exclusive-OR as (A OR B) AND (A NAND B). The LED sinks current into the transistor network, so this layout is a stand-alone indicator — not a logic output you can wire onward.",
    why: "This is the fewest discrete transistors that still make a convincing XOR on a breadboard. Use it to prove the truth table with an LED before you spend parts on buffering.",
    how: "The left pair is a two-transistor NAND (series NPNs). Its output enables a middle series switch. The right pair is an OR (parallel NPNs). Current from the LED resistor can reach ground only when the OR path is on and the NAND switch is on — which is exactly one input high.",
    caveat: "The LED sits in the output path with current flowing into the circuit. The voltage at that node is not a clean logic level. Do not send it to another gate’s base.",
    parts: [
      { item: "2N2222 or 2N3904 NPN", qty: 5, note: "TO-92, E-B-C with flat facing you" },
      { item: "2 kΩ resistor", qty: 4, note: "330 Ω–2.2 kΩ also works" },
      { item: "LED", qty: 1, note: "Anode toward +5 V through the 2 kΩ limiter" },
      { item: "5 V supply", qty: 1, note: "USB pack, phone charger, or rail module" },
      { item: "Half-size breadboard", qty: 1, note: "Plus 22 AWG solid-core jumpers" },
    ],
    steps: [
      {
        title: "Power the rails",
        body: "Red jumper from +5 V into the top positive rail. Black jumper from ground into the negative rail. Bridge the ground rail to the inner ground strip you will use under the transistors. Confirm the supply before placing semiconductors.",
      },
      {
        title: "Place the NAND pair (T1, T2)",
        body: "Sit two NPNs on the left of the board, flat sides toward you so the pins read emitter–base–collector. Wire them in series: T1 collector is the NAND output node, T1 emitter goes to T2 collector, T2 emitter goes to ground. T1 base is input A. T2 base is input B.",
        hint: "Series NPNs pull the collector low only when both bases are driven — that is NAND with a pull-up.",
      },
      {
        title: "Add the NAND pull-up",
        body: "From +5 V, drop a 2 kΩ resistor onto the T1 collector node. This is the NAND output: high unless both A and B are on.",
      },
      {
        title: "Place the middle switch (T3)",
        body: "T3 sits in the LED current path as a series switch. Its base is tied to the NAND output. Emitter toward ground (or toward the OR pair, depending on how you stack the path). When NAND is low — both inputs on — T3 is off and the LED cannot sink.",
      },
      {
        title: "Place the OR pair (T4, T5)",
        body: "Two NPNs in parallel. T4 base from A, T5 base from B, emitters to the switch/ground path, collectors toward the LED cathode. Either input can complete the path, but only if T3 is also on.",
      },
      {
        title: "Hang the LED as a sink",
        body: "2 kΩ from +5 V to the LED anode. LED cathode into the OR collectors. Current flows into the circuit. The LED is the output. It lights only when the sink path is complete.",
      },
      {
        title: "Wire inputs A and B",
        body: "Each input is a 2 kΩ resistor from +5 V to the corresponding bases (A → T1 and T4, B → T2 and T5). Insert the resistor to assert 1. Pull it out to assert 0. That is the article method; a switch to +5 V through 2 kΩ is the same thing.",
      },
      {
        title: "Walk the truth table",
        body: "Both resistors out: LED off. Only A in: LED on. Only B in: LED on. Both in: LED off. If both-on still lights, T3 is not actually cutting the sink path — check the NAND collector to T3 base.",
      },
    ],
    test: [
      "A=0 B=0 → LED off (OR path open, even though NAND is high)",
      "A=1 B=0 → LED on (OR closed through T4, NAND high, T3 on)",
      "A=0 B=1 → LED on (OR closed through T5)",
      "A=1 B=1 → LED off (NAND low, T3 open — exclusive)",
    ],
  },
  {
    slug: "xor-2",
    number: 2,
    name: "XOR 2 — six-transistor source",
    short: "The one to build. Adds a buffer so the output can drive other gates.",
    transistors: 6,
    resistors: 5,
    family: "discrete",
    cascade: true,
    recommended: true,
    lead: "Same exclusive core as XOR 1, plus one inverter transistor on the right. The LED now sources out of the circuit, and the collector of that last transistor is a real logic node you can fan into NAND, NOR, or another XOR.",
    why: "If the XOR is a step in a protocol — half-adder, parity, invert-if-flag — you need a voltage you can send onward. Six transistors is the smallest discrete XOR that behaves like a gate, not just a lamp.",
    how: "The five-transistor sink from XOR 1 still computes exclusive-OR. Its sink node drives the base of T6. T6 inverts: when the sink is on (XOR true), T6 is off and its collector sits at +5 V through 2 kΩ. Flip the LED so current leaves the collector toward ground. That collector is the output.",
    caveat: "Do not skip the extra 2 kΩ on T6’s collector. Without it the node cannot rise, and the LED has no source.",
    parts: [
      { item: "2N2222 or 2N3904 NPN", qty: 6, note: "Five for the core, one inverter" },
      { item: "2 kΩ resistor", qty: 5, note: "A, B, NAND pull-up, core pull-up, T6 collector" },
      { item: "LED", qty: 1, note: "Cathode toward ground; anode from T6 collector" },
      { item: "5 V supply", qty: 1, note: "Same as XOR 1" },
      { item: "Half-size breadboard", qty: 1, note: "Leave space on the right for the buffer" },
    ],
    steps: [
      {
        title: "Build XOR 1 without the LED",
        body: "Place T1–T5 and the four left-side resistors exactly as XOR 1. Keep the far-right 2 kΩ as a pull-up on the sink node — that node is now a logic wire, not an LED cathode.",
      },
      {
        title: "Add T6 as an inverter",
        body: "T6 emitter to ground, collector to a fresh 2 kΩ up to +5 V, base to the XOR 1 sink node. When the core sinks, T6 base is low, T6 is off, collector is high.",
      },
      {
        title: "Flip the LED",
        body: "LED anode on T6 collector, cathode to ground (or cathode to ground through the existing collector resistor if you prefer the resistor in series with the LED). Current now flows out of the circuit.",
      },
      {
        title: "Take the output from the collector",
        body: "The T6 collector is Vout. High ≈ 5 V when XOR is true, low ≈ 0.1 V when XOR is false. That is the node you run to the next gate.",
      },
      {
        title: "Re-run the truth table",
        body: "Same four combinations. LED polarity is opposite XOR 1’s physical direction, but the logical sense is the same: light means exclusive-OR is true.",
      },
      {
        title: "Cascade check",
        body: "Tie Vout to the base resistor of a spare NPN inverter or NAND. Toggle A and B. If the downstream gate follows A XOR B, the buffer is working. If it does not, you are still tapping the LED-sink node instead of T6 collector.",
      },
    ],
    test: [
      "A=0 B=0 → T6 on, collector low, LED off",
      "A=1 B=0 → T6 off, collector high, LED on, Vout driveable",
      "A=0 B=1 → same as A=1 B=0",
      "A=1 B=1 → T6 on, collector low, LED off",
    ],
  },
  {
    slug: "xor-3",
    number: 3,
    name: "XOR 3 — four NAND gates",
    short: "Eight transistors. The composition you will reuse in adders.",
    transistors: 8,
    resistors: 6,
    family: "nand",
    cascade: true,
    lead: "XOR is not a primitive in NAND logic — it is a recipe. Four two-transistor NAND gates, wired as (A NAND (A NAND B)) NAND (B NAND (A NAND B)), produce exclusive-OR and a clean output.",
    why: "If your protocol already lives in NAND (the usual breadboard computer style), do not invent a special XOR transistor trick. Compose it. The gate-level diagram is what you will draw in an ALU.",
    how: "NAND1 takes A and B. NAND2 takes A and NAND1. NAND3 takes B and NAND1. NAND4 takes NAND2 and NAND3. Algebra: NAND2 is A NAND (A NAND B) = A NAND NAND(A,B) which is Ā + AB = Ā + B after absorption in the outer NAND… the outer NAND of those two terms is A⊕B.",
    caveat: "Each NAND needs its own 2 kΩ pull-up. Sharing pull-ups between cells will wire-AND the outputs and the recipe collapses.",
    parts: [
      { item: "2N2222 or 2N3904 NPN", qty: 8, note: "Two per NAND, four NANDs" },
      { item: "2 kΩ resistor", qty: 6, note: "Two inputs plus four NAND pull-ups; LED limiter may share the last pull-up" },
      { item: "LED", qty: 1, note: "From NAND4 output to ground" },
      { item: "5 V supply", qty: 1, note: "Current is higher than XOR 1 — four pull-ups live at once" },
      { item: "Full or half breadboard", qty: 1, note: "Leave a column between NAND cells" },
    ],
    steps: [
      {
        title: "Build one NAND and prove it",
        body: "Two NPNs in series, 2 kΩ pull-up, bases A and B, output at the top collector. Truth: output is low only when both bases are high. Do not proceed until this cell is boringly correct.",
      },
      {
        title: "Clone it three more times",
        body: "NAND2, NAND3, NAND4 get the same geometry, each with its own pull-up. Line them left to right so the wiring stays planar.",
      },
      {
        title: "Join A and B into NAND1",
        body: "Input A resistor into NAND1’s top base and also into NAND2’s free base. Input B into NAND1’s bottom base and NAND3’s free base.",
      },
      {
        title: "Fan NAND1 into NAND2 and NAND3",
        body: "NAND1 collector (the NAND of A and B) goes to the remaining base of NAND2 and the remaining base of NAND3. You now have A NAND (A NAND B) and B NAND (A NAND B).",
      },
      {
        title: "Join those into NAND4",
        body: "NAND2 output and NAND3 output into the two bases of NAND4. NAND4 collector is XOR. LED from that collector to ground, with the pull-up already limiting current.",
      },
      {
        title: "Truth-table the composition",
        body: "Probe NAND1 first: it should be 0 only when A=B=1. Then NAND4: 1 when the inputs differ. If NAND4 is stuck high, a base is floating — RTL bases must be driven or they leak the cell into an analog mess.",
      },
    ],
    test: [
      "A=0 B=0 → NAND1=1, NAND2=1, NAND3=1, NAND4=0",
      "A=1 B=0 → NAND1=1, NAND2=0, NAND3=1, NAND4=1",
      "A=0 B=1 → NAND1=1, NAND2=1, NAND3=0, NAND4=1",
      "A=1 B=1 → NAND1=0, NAND2=1, NAND3=1, NAND4=0",
    ],
  },
  {
    slug: "xor-4",
    number: 4,
    name: "XOR 4 — five NOR gates",
    short: "Ten transistors. Use only when the architecture is NOR-native.",
    transistors: 10,
    resistors: 7,
    family: "nor",
    cascade: true,
    lead: "Swap NAND for NOR in the four-gate recipe and you get XNOR. A fifth NOR as an inverter turns that into XOR. Ten transistors. This is how you XOR on a NOR-only machine — the Apollo Guidance Computer was one.",
    why: "Most people should not build this. Build it when you are modeling a NOR protocol, teaching universality, or matching a NOR-based computer. Otherwise XOR 2 or XOR 3 is the right spend.",
    how: "NOR1 = A NOR B. NOR2 = A NOR NOR1. NOR3 = B NOR NOR1. NOR4 = NOR2 NOR NOR3, which is A XNOR B. NOR5 inverts NOR4. Each NOR is two NPNs in parallel under a pull-up: either base high sinks the output.",
    caveat: "Ten transistors and seven resistors draw more current and invite wiring errors. Label every NOR cell before you run jumpers across the gutter.",
    parts: [
      { item: "2N2222 or 2N3904 NPN", qty: 10, note: "Two per NOR, five NORs" },
      { item: "2 kΩ resistor", qty: 7, note: "Two inputs, five NOR pull-ups; LED can hang on NOR5" },
      { item: "LED", qty: 1, note: "From NOR5 output to ground" },
      { item: "5 V supply", qty: 1, note: "Expect more current than XOR 3" },
      { item: "Full-size breadboard", qty: 1, note: "Five cells do not fit a cramped half board" },
    ],
    steps: [
      {
        title: "Build one NOR and prove it",
        body: "Two NPNs in parallel. Shared collector, shared 2 kΩ pull-up, both emitters to ground. Either base high → output low. Both bases low → output high. That is NOR.",
      },
      {
        title: "Clone four more NOR cells",
        body: "NOR1…NOR5 in a row. Tie NOR5’s two bases together (or feed the same wire to both) so it is an inverter.",
      },
      {
        title: "Wire the XNOR core",
        body: "A and B into NOR1. A and NOR1 into NOR2. B and NOR1 into NOR3. NOR2 and NOR3 into NOR4. NOR4 should now match A XNOR B: high when the inputs agree.",
      },
      {
        title: "Invert to XOR",
        body: "NOR4 collector into both bases of NOR5. NOR5 collector is XOR. LED on that node.",
      },
      {
        title: "Truth-table, then leave it",
        body: "Confirm the four rows. If you only needed XOR, you now have it the hard way — which is the point if your protocol is NOR-universal. For a half-adder, XOR 2 is still the better cell.",
      },
    ],
    test: [
      "A=0 B=0 → NOR1=1, NOR4=1 (XNOR), NOR5=0",
      "A=1 B=0 → NOR1=0, NOR4=0 (XNOR), NOR5=1",
      "A=0 B=1 → NOR1=0, NOR4=0, NOR5=1",
      "A=1 B=1 → NOR1=0, NOR4=1, NOR5=0",
    ],
  },
];

export function gateBySlug(slug: string): Gate | undefined {
  return GATES.find((g) => g.slug === slug);
}

export const NAV: Array<{
  to: "/" | "/basics" | "/lab" | "/gates/$slug" | "/protocol" | "/compare";
  params?: { slug: GateSlug };
  label: string;
  hint: string;
}> = [
  { to: "/", label: "Overview", hint: "XOR as a protocol primitive" },
  { to: "/basics", label: "Breadboard 101", hint: "Rails, holes, parts" },
  { to: "/lab", label: "Live lab", hint: "Toggle A and B" },
  { to: "/gates/$slug", params: { slug: "xor-1" }, label: "XOR 1", hint: "5 transistors" },
  { to: "/gates/$slug", params: { slug: "xor-2" }, label: "XOR 2", hint: "6 transistors · recommended" },
  { to: "/gates/$slug", params: { slug: "xor-3" }, label: "XOR 3", hint: "4 NANDs" },
  { to: "/gates/$slug", params: { slug: "xor-4" }, label: "XOR 4", hint: "5 NORs" },
  { to: "/protocol", label: "Protocol bench", hint: "Handshake, adder, parity" },
  { to: "/compare", label: "Compare", hint: "Which build to use" },
];

