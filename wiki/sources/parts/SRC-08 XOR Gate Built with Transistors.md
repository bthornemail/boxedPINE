---
id: SRC-08
title: "XOR Gate, Exclusive OR Gate - Built with Transistors"
kind: source-part
layer: sources
status: draft
spec: OMI-IMO-2026
source_id: SRC-08
part: 1
parts: 1
parent: "[[SRC-08 XOR Gate Built with Transistors]]"
up: "[[SRC-99 Source Index]]"
covers: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, hardware, xor, transistor, reference]
extracted: 2026-10-04
extraction: pdftotext-layout
lines: "1-948"
---

## Summary

An educational web article (Cody Wabiszewski, Global Science Network, July 2, 2024) that builds the XOR gate four separate ways out of discrete NPN BJTs on solderless breadboards, then scales the same primitives up into a 32-breadboard 4-bit computer. The protocol cares about it because it supplies the only physical, hand-verified transistor-count ladder for XOR in this vault: 5 transistors (LED sink only), 6 transistors (recommended, driveable output), 8 transistors (four 2-transistor NAND gates), 10 transistors (five 2-transistor NOR gates). It also anchors XOR as the arithmetic primitive — the source places XOR gates in half adders, full adders, and four explicit "XOR subtract gates" in a working ALU. Critically, the source contains **no** CMOS, no pass-transistor topology, and no 4T/6T/10T CMOS figures; every count here is discrete-BJT breadboard work, which constrains how far it can be cited as evidence about CMOS XOR cells. All four schematics and the truth table in the article are raster images, so the text layer carries topology prose but zero verbatim netlists and zero verbatim truth tables.

## Claims

| `#` | Claim | Confidence | Evidence |
|---|---|---|---|
| 1 | XOR is also called the exclusive OR gate. | stated | "The XOR gate is also called the exclusive OR gate." |
| 2 | The simplest discrete design needs 5 transistors; driving an output needs 6. | stated | "In the simplest design, only 5 transistors are needed. However in order to send an output 6 transistors" |
| 3 | XOR from NAND gates needs 8 transistors. | stated | "The XOR gate can be built with NAND gates but 8 transistors are needed." |
| 4 | XOR from NOR gates needs 10 transistors. | stated | "It can also be built with NOR gates and 10 transistors would be needed." |
| 5 | The defining behaviour: both inputs on ⇒ output off. | stated | "This gate is similar to the OR gate but when both inputs are on the output is off." |
| 6 | XOR is the primitive of addition: used in half adders and full adders. | stated | "It is common to use XOR gates in half adders, full adders, and for other computations" |
| 7 | Gate 1's five transistors decompose as 2 (NAND) + 1 (switch) + 2 (OR-like). | stated | "a NAND gate on the left two transistors, a switch for the middle transistors, and an OR-like gate" |
| 8 | The middle transistor acts as a switch driven by base voltage from the input resistor. | stated | "the switch is off because there is not enough voltage going into the base of the third transistor" |
| 9 | Gate 2 = Gate 1 + one extra right-hand transistor that acts as an inverter. | stated | "adds one more transistor on the right-hand side of the circuit" / "somewhat acting as an inverter" |
| 10 | Gate 2 is the author's recommended build because it works in all cases. | stated | "I would recommend building the XOR gate this way as it works in all cases and only requires 6 transistors." |
| 11 | Gate 1 cannot forward its output to another circuit (LED sinks current). | stated | "It will not work to send the signal elsewhere." |
| 12 | Gate 3 = 4 NAND gates × 2 transistors each = 8 transistors. | stated | "XOR gate 3 is built using 4 NAND gates. Each NAND gate requires 2 transistors" |
| 13 | Gate 4 = 5 NOR gates × 2 transistors each = 10 transistors. | stated | "Exclusive OR gate 4 is built using 5 NOR gates. Each NOR gate requires 2 transistors" |
| 14 | Gate 4 bill of materials: 10 NPN transistors, 7 × 2K resistors, one LED, 5 V supply. | stated | "requires 10 NPN transistors, 7 2K resistors, and an LED" |
| 15 | Transistor part numbers: 2N2222 or 2N3904 NPN BJTs. | stated | "model numbers 2N2222 or 2N3904, which are both BJT transistors" |
| 16 | Gate 3/4 resistor value is 2K; the accepted range is 330 Ω to 2.2K. | stated | "All the resistors are 2K but values from 330 ohms to 2.2K would work." |
| 17 | Gate 3 supply is a 5-volt battery pack. | stated | "the circuit is powered with a 5-volt battery pack" |
| 18 | NAND-based XOR has a stated cost penalty; it is not the simplest. | stated | "For this reason, this is not the simplest NOR gate to implement." (about gate 4) |
| 19 | NOR-based XOR is only worth it when the architecture is already NOR-based. | stated | "it will not be used unless the computer or circuit architecture is based on the NOR gate" |
| 20 | Apollo Guidance Computer: first version 4,100 NOR gates; later version 5,600. | stated | "the first used 4,100 NOR gates on separate integrated circuits, and a later version used 5,600 NOR gates" |
| 21 | The 4-bit computer uses 32 breadboards and 962 NPN BJT transistors at ~1 AMP from 5 V. | stated | "built on 32 breadboards and uses 962 NPN BJT transistors" / "uses about 1 AMP of current" |
| 22 | The ALU of the 4-bit computer uses four full adders and four XOR subtract gates. | stated | "This is done by using four full adders and four XOR subtract gates." |
| 23 | The clock is a 4-transistor astable multivibrator with two 10 µF capacitors, period 1.75 s. | stated | "built with four transistors and two 10 microfard capacitors" / "completing a full cycle once every 1.75 seconds" |
| 24 | Ring counter is 7-stage, built from four edge-triggered flip-flops, each trigger 330 pF + 1K. | stated | "built with four edge-triggered data flip flops" / "a 330 picofarad capacitor and a 1K resistor" |
| 25 | Data bus defaults all lines on via pull-ups from +5 V; circuits ground the off lines. | stated | "the data bus has all the data lines on" / "pull-up resistors are connected from positive 5-volts to each data line" |
| 26 | 2 + 2 + 1 = 5 transistors for Gate 1 — arithmetic consistency check on claim 7. | derived | "a NAND gate on the left two transistors, a switch for the middle transistors, and an OR-like gate" |
| 27 | Gate 3's stated transistor total (8) equals 4 gates × 2, consistent. | derived | "a total of 8 transistors is needed to build the gate in this configuration" |
| 28 | Gate 4's stated transistor total (10) equals 5 gates × 2, consistent. | derived | "a total of 10 transistors is needed" |
| 29 | Gate 2's 6 transistors = Gate 1's 5 + 1 output stage, consistent with the prose. | derived | "only requires 6 transistors" |
| 30 | Gate 4 is resistor-starved relative to its gate count: 7 resistors for 10 transistors. | derived | "requires 10 NPN transistors, 7 2K resistors, and an LED" |
| 31 | If "in two of the full adders" means two of four full adders use XOR internally, total ALU XOR = 2 + 4 = 6. | speculative | "XOR gates are used in the ALU for the subtract feature and in two of the full adders." |
| 32 | Modern silicon scale given for contrast: ~3B (CPU), ~35B (32 GB RAM), ~7B (8 GB GPU), ~3T (1 TB SSD). | stated | "the 8GB NVIDIA GPU has around 7 billion transistors, and the 1 TB SSD has around 3 trillion transistors" |
| 33 | Breadboard replication of a 3-billion-transistor CPU would need ~100 million breadboards. | stated | "it would take about 100 million breadboards to build" |
| 34 | A 2-transistor NAND gate is assumed as the primitive cell in both the NAND and NOR builds. | derived | "the two transistor NAND gate is likely the best option" |
| 35 | The NAND-built section's own caption says the connections make a **NOR** gate, not an XOR gate. | contradicted | "how the inputs and output of each NAND gate need to be connected to make the NOR gate" |
| 36 | Gate 4's cost statement says "this is not the simplest NOR gate" — a gate-type slip inside the XOR article. | contradicted | "For this reason, this is not the simplest NOR gate to implement." |
| 37 | "each NOR gate could actually be made from four NAND gates" — no transistor or level count is reconciled against the 10-device total. | contradicted | "each NOR gate could actually be made from four NAND gates" |
| 38 | The article's own transistor-count ladder is presented as transistor-count-minimal advice, but the 5T/6T cells are RTL/BJT, not CMOS. | speculative | "In the simplest design, only 5 transistors are needed." |
| 39 | LED forward drop 1.8 V–3.2 V vs ~0.6 V for a standard diode. | stated | "Most LEDs have a voltage drop ranging from 1.8 volts to 3.2 volts." |
| 40 | Resistor >350 Ω is claimed to limit LED current below 20 mA; LED max rating 20–25 mA. | stated | "If the resistor is larger than 350 ohms it should limit the current to less than 20 milliamps." |
| 41 | Video timestamp 31:48 in the "all types of logic gates" video is the XOR build segment. | stated | "At 31:48 how to build the Exclusive OR gate is discussed at length." |

## Definitions

**XOR (verbatim, lines 15–18):**

```text
The XOR gate is also called the exclusive OR gate. In this article, I will show 4
different ways it can be built on a breadboard using individual transistors.
This gate is similar to the OR gate but when both inputs are on the output is
off. That is why is the exclusive OR gate as in only for the true OR cases.
```

**Truth-table behaviour (verbatim, lines 69–72) — this is the ONLY textual statement of the table:**

```text
The XOR gate symbol and truth table are shown above. This table makes it
clear that when both inputs are on or off the output is off. When only one
input is on the output is on. I will show several different ways to make an
XOR gate but the truth table will be the same for all of the cases.
```

> **Gap:** the table itself is an image (`XOR Gate Truth Table`, line 64) and does not survive `pdftotext`. It is therefore **not** reproduced verbatim anywhere in this note. The table below is **DERIVED from the prose above** and is labelled as such — it must not be cited as a verbatim extraction.

```text
DERIVED FROM PROSE (lines 69-72) — NOT VERBATIM FROM SOURCE
A  B | OUT
0  0 |  0
0  1 |  1
1  0 |  1
1  1 |  0
```

**Terminology appearing in the source, with the source's own gloss:**

| Term | Source gloss (verbatim) | Line |
|---|---|---|
| Breadboard | "they are also called solderless breadboards" | 242–243 |
| Power rails | "Power is supplied to the power rails which run along the outside of the breadboard." | 264–265 |
| Breadboard row label set | "the rows are labeled a-j and the columns are numbered 1-60" | 270–271 |
| Breadboard internal connectivity | "Vertical columns are electrically connected between rows a-e and rows f-j." | 272–273 |
| BJT pins | "The three pins are the emitter, base, and collector." | 424 |
| NPN/PNP pin-order caveat | "Which pin is which will vary depending on if it is an NPN or PNP transistor." | 425–426 |
| 2N2222 role | "This is an amplifying transistor and also works as a switching transistor." | 427–428 |
| Tri-state buffer | "connected to the data bus via simplified tri-site buffers which invert the value" | 805–806 |
| ALU | "the arithmetic logic unit which is also called the ALU" | 733–734 |
| Astable multivibrator (clock) | "an a-stable multi-vibrator" | 737 |
| Edge-triggered flip-flop | "four edge-triggered data flip flops" | 760 |

**Case-by-case switching behaviour of Gate 1 (verbatim, lines 39–49)** — the most physically explicit truth-table-adjacent text in the source:

```text
Looking at the configuration in the photo the current from the far right
resistor can not reach the ground to the left so the LED is off. This is the
case because all of the current from the first resistor from the left is going
to the first ground. When this happens the switch is off
because there is not enough voltage going into the base of the third
transistor.

When one input is on current is able to flow from the far right transistor to
the second ground. Finally when both inputs are off the output is off
because the current does flow into the base of the OR gate transistors
making it so the current can flow from the far right resistor into the second
ground.
```

## Numbers and Invariants

| Quantity | Value | Meaning | Stated or Derived |
|---|---|---|---|
| XOR Gate 1 transistor count | 5 | Smallest discrete-BJT XOR; LED sinks current, output not routable | stated (line 19) |
| XOR Gate 2 transistor count | 6 | Gate 1 + one output inverter; author's recommendation | stated (line 20, 105) |
| XOR Gate 3 transistor count | 8 | 4 NAND gates × 2 transistors | stated (line 21, 137) |
| XOR Gate 4 transistor count | 10 | 5 NOR gates × 2 transistors | stated (line 22, 181) |
| Gate 1 gate composition | 2 + 1 + 2 | left pair = NAND, middle = switch, right pair = OR-like | stated (line 36–38) |
| Gate 1 transistor arithmetic | 2+1+2 = 5 | consistent with the stated 5 | derived |
| Gate 3 gate composition | 4 NAND | gate-level XOR from NAND | stated (line 136) |
| Gate 3 transistors per NAND gate | 2 | the assumed primitive cell | stated (line 136–137) |
| Gate 4 gate composition | 5 NOR | gate-level XOR from NOR | stated (line 180) |
| Gate 4 transistors per NOR gate | 2 | the assumed primitive cell | stated (line 180–181) |
| Gate 4 resistor count | 7 | all 2K | stated (line 206) |
| Gate 4 LED count | 1 | output indicator | stated (line 206) |
| Gate 4 supply voltage | 5 V | battery pack | stated (line 207) |
| Gate 3 supply voltage | 5 V | battery pack | stated (line 141–142) |
| Resistor value (all builds) | 2K | standard | stated (line 141, 166) |
| Accepted resistor range | 330 Ω – 2.2K | substitution tolerance | stated (line 166–167) |
| Transistor models | 2N2222, 2N3904 | NPN BJT | stated (line 165) |
| PNP equivalents given | 2N2907 ≡ "2N222"; 2N3906 ≡ 2N3904 | note the likely typo in "2N222" | stated (line 442–443) |
| Video timestamp for XOR build | 31:48 | in the "all types of logic gates" video | stated (line 54–55) |
| AGC NOR gates, version 1 | 4,100 | separate integrated circuits | stated (line 185–186) |
| AGC NOR gates, later version | 5,600 | — | stated (line 186) |
| 4-bit computer breadboards | 32 | solderless breadboards | stated (line 688–689) |
| 4-bit computer transistors | 962 | NPN BJT | stated (line 689) |
| 4-bit computer supply | 5 V, ~1 AMP | rechargeable battery pack | stated (line 690–691) |
| 4-bit computer value range | 0–15 | add or subtract | stated (line 698–699) |
| 4-bit computer opcodes held | 7 | operational commands | stated (line 699–700) |
| 4-bit computer stored values | 3 | load A, add, subtract | stated (line 700) |
| Clock transistors | 4 | astable multivibrator | stated (line 739–740) |
| Clock capacitors | 2 × 10 µF | astable timing | stated (line 740) |
| Clock period | 1.75 s | one full cycle, as shown in video | stated (line 740–741) |
| Ring counter stages | 7 | program counter implementation | stated (line 750–752) |
| Ring counter flip-flops | 4 | edge-triggered | stated (line 760) |
| Ring counter trigger components | 330 pF + 1K each | per trigger | stated (line 761–762) |
| Data bus lines | 4 data + 4 aux | aux = ground, +5 V, clock, clear | stated (line 796–797) |
| Clear-line behaviour | counters → 1, output register → 0 | when clear grounded | stated (line 797–798) |
| Memory | 10 bytes × 4-bit | 7 opcode, 8 loadA, 9 add, 10 subtract | stated (line 800–812) |
| ALU full adders | 4 | add/subtract up to 15 | stated (line 837) |
| ALU XOR subtract gates | 4 | separate borrow/subtract XORs | stated (line 837–838) |
| ALU XOR inside full adders | "two of the full adders" | ambiguous scope — see Open Questions | stated (line 219) |
| Calculator full adders | 4 | add up to 31 | stated (line 863–864) |
| Calculator output width | 5-bit | because range is 31 | stated (line 863–864) |
| LED forward drop | 1.8 V – 3.2 V | vs ~0.6 V for a diode | stated (line 402–404) |
| Breadboard supply range | 3 V – 9 V | common input voltage | stated (line 404–405) |
| LED current limit rule | >350 Ω ⇒ <20 mA | stated heuristic | stated (line 405–406) |
| LED max current | 20–25 mA | typical rating | stated (line 406–407) |
| Common resistor range | 1 Ω – 1 MΩ | breadboard values | stated (line 369–370) |
| Value-substitution example | 945 Ω → 1K | "will work in most cases" | stated (line 371–373) |
| Ceramic capacitor range | 0.1 µF – 10 µF | non-polarized | stated (line 464–465) |
| Breadboard capacitor range | 10 pF – 10,000 µF | overall | stated (line 471) |
| Breadboard wire | 22 gauge solid core, >25 ft/spool | recommended | stated (line 344–345) |
| Battery stacks | 2 × 1.5 V = 3 V; 3 × 1.5 V = 4.5 V; 9 V cell | — | stated (line 536–538) |
| PSU module outputs | 3.3 V or 5 V | jumper-selectable per rail | stated (line 539–540, 598) |
| PSU jack input | 6.5 V – 9 V | USB path ~5 V | stated (line 621–623) |
| PSU module pins | 8 (4 per side) | into the power rails | stated (line 623–624) |
| Battery pack auto-shutoff | ~30 s | restarts on button press | stated (line 563–566) |
| Modern CPU transistors | ~3 billion | comparison figure | stated (line 870–871) |
| Breadboards to replicate CPU | ~100 million | derived from the above, stated as an estimate | stated (line 871) |
| 32 GB RAM transistors | ~35 billion | comparison figure | stated (line 872–873) |
| 8 GB NVIDIA GPU transistors | ~7 billion | comparison figure | stated (line 873) |
| 1 TB SSD transistors | ~3 trillion | comparison figure | stated (line 873–874) |

## Circuits

### XOR Gate 1 — 5 transistors (discrete NPN, LED sinks current)

- **Transistor count:** 5 (stated, line 19; "uses 5 transistors", line 29).
- **Gate composition:** no standard-gate decomposition. Verbatim structure: "a NAND gate on the left two transistors, a switch for the middle transistors, and an OR-like gate for the last two transistors" (lines 36–38). So 2 + 1 + 2 = 5 (derived).
- **Inputs:** "Inputs A and B are on when the first two resistors are in place" (line 85–86). The two left resistors are the inputs.
- **How it computes XOR:** two-level current-steering. With both inputs on, all current from the leftmost resistor goes to the near ground, starving the third transistor's base, so the switch is off and the far-right resistor cannot reach the left ground ⇒ LED off. With one input on, current flows "from the far right transistor to the second ground". With both inputs off, current enters the OR-gate transistors' bases and reaches the second ground ⇒ output off (lines 39–49, verbatim in Definitions).
- **Stated pros/cons:** pros — smallest device count in the article. Cons — "This layout will work as a stand-alone logic gate or as a final logic gate. It will not work to send the signal elsewhere." (lines 88–89); LED direction is configured for current *flowing into* the circuit (line 86–87).
- **Demo state:** "In the layout inputs A and B are both on which is why the LED is off" (lines 29–30).

### XOR Gate 2 — 6 transistors (discrete NPN, recommended, driveable output)

- **Transistor count:** 6 (stated, lines 20, 105–106).
- **Gate composition:** XOR Gate 1 plus one additional transistor on the right-hand side (stated, lines 102–103).
- **How it computes XOR:** same core as Gate 1; the sixth transistor provides the output stage. Verbatim: "Now there is an additional transistor that is somewhat acting as an inverter." (lines 119–120).
- **Stated pros/cons:** pros — "This makes it so that the current can be sent as an output" (lines 103–104); "It is good as the output can be sent elsewhere. Typically it is sent to other logic gates to complete more computations." (lines 121–123). Recommendation: "I would recommend building the XOR gate this way as it works in all cases and only requires 6 transistors." (lines 104–106).
- **Direction flip:** "the LED direction is flipped and the current is flowing out of the circuit" (lines 120–121).

### XOR Gate 3 — 8 transistors (four 2-transistor NAND gates)

- **Transistor count:** 8 (stated, line 21 and "a total of 8 transistors is needed", line 137–138). Derived: 4 × 2 = 8.
- **Gate composition:** 4 NAND gates (stated, line 136).
- **How it computes XOR:** the gate-level schematic wires the four NANDs into XOR. **The gate-level netlist is an image only** (line 144 heading "XOR Gate Built with NAND Gates Circuit Diagrams", lines 152–156 prose) — no textual netlist exists in the source. The prose says the diagram "shows how the inputs and output of each NAND gate need to be connected to make the NOR gate" (lines 152–154) — a gate-type contradiction, logged below.
- **Component detail:** "This shows the connections to the base, emitter, and collector of each NPN transistor." (lines 164–165); resistors 2K, substitutable 330 Ω–2.2K; 5 V battery pack.
- **Stated pros/cons:** pros — the high-level diagram is sufficient when using gate ICs: "Many times circuit designers are just using integrated circuits for the logic gates and the high-level diagram is sufficient." (lines 155–156). The NAND cell is "likely the best option" (lines 199–200). Cons — no explicit cons stated for gate 3; the source's stated cost complaint is attached to gate 4.
- **Demo state:** "Right now both inputs are on and the output is off, which is expected." (lines 139–140); inputs toggled by removing the input resistors.

### XOR Gate 4 — 10 transistors (five 2-transistor NOR gates)

- **Transistor count:** 10 (stated, line 22 and "a total of 10 transistors is needed", line 181). Derived: 5 × 2 = 10.
- **Gate composition:** 5 NOR gates (stated, line 180).
- **How it computes XOR:** gate-level NOR schematic (image only, lines 196–200 prose). No textual netlist.
- **Bill of materials (verbatim, lines 205–207):**

```text
Above is the component level circuit diagram of NOR Gate 4. The circuit
requires 10 NPN transistors, 7 2K resistors, and an LED. The circuit is
powered with a 5 Volt power supply.
```

- **Stated pros/cons:** pros — only chosen "unless the computer or circuit architecture is based on the NOR gate" (lines 182–184), citing the Apollo Guidance Computer. Cons — "For this reason, this is not the simplest NOR gate to implement." (lines 181–183), plus higher device count than gates 1–3.
- **Note on the gate-count claim:** "each NOR gate could actually be made from four NAND gates. However, using the two transistor NAND gate is likely the best option." (lines 198–200). 5 × 4 = 20 NAND cells if taken literally (derived); the source does not reconcile this with the 10-device total.

### Downstream circuit: XOR inside a working ALU (context, not a topology)

- The 4-bit computer's ALU: "The ALU allows the computer to add and subtract numbers up to 15. This is done by using four full adders and four XOR subtract gates." (lines 836–838).
- Elsewhere: "XOR gates are used in the ALU for the subtract feature and in two of the full adders." (lines 218–219).
- The source does **not** state a full-adder internal XOR count, a half-adder schematic, or a borrow-subtract schematic. All such detail is in images.

### Topologies explicitly ABSENT from this source

For the avoidance of doubt, and because the vault contains CMOS-flavoured XOR specs: this article never mentions CMOS, never mentions PMOS, never mentions transmission/pass transistors, never mentions a 4-transistor XOR cell, and never gives a 6T or 10T **CMOS** figure. Its "6 transistors" and "8 transistors" are BJT breadboard builds. Absence verified across all 948 lines.

## Truth Tables

**No truth table survives as text.** The article's only truth table is the image under the heading `XOR Gate Truth Table` (line 64), referenced at line 69: "The XOR gate symbol and truth table are shown above."

What the source *does* provide as text is (a) the prose behaviour rule and (b) the physical switching narrative for Gate 1. Both are reproduced verbatim in **Definitions**. The derived table in **Definitions** is explicitly marked as derived and must not be cited as verbatim.

Additionally, the article asserts table-invariance across topologies, which is the closest thing to a spec-relevant invariant it offers:

```text
I will show several different ways to make an
XOR gate but the truth table will be the same for all of the cases.
```
(lines 71–72)

And the title-level statement of the exclusive behaviour:

```text
This gate is similar to the OR gate but when both inputs are on the output is
off. That is why is the exclusive OR gate as in only for the true OR cases.
```
(lines 17–18)

## Open Questions and Contradictions

1. **Gate-type contradiction (high confidence this is a source typo).** The NAND-built XOR section's description says the connections make "the NOR gate", not the XOR gate: "how the inputs and output of each NAND gate need to be connected to make the NOR gate" (lines 152–154). Almost certainly should read "XOR gate".
2. **Gate-type slip in the cost argument.** Gate 4 is introduced as an XOR built from NOR gates, but the objection to it is phrased as "this is not the simplest NOR gate to implement" (lines 181–183) — the object of the sentence should be the XOR implementation, not the NOR gate.
3. **"2N222" is not a real part number** (line 443). It is presented as the PNP equivalent of the 2N2222; the intended part is almost certainly 2N2222 (i.e. 2N2907 ≡ 2N2222). Unverified against a datasheet; marked as a suspected source typo, not corrected in this note.
4. **"tri-site buffers"** (line 806) is almost certainly a typo for *tri-state buffers*; the same sentence elsewhere uses "tri-state buffers" correctly (line 839).
5. **ALU XOR count is ambiguous.** "in two of the full adders" (line 219) could mean (a) two of the four full adders contain XOR internally, or (b) the XOR usage is confined to the two lower-order full adders. Under reading (a), total ALU XOR = 2 + 4 = 6 (derived/speculative); under (b) the total is not recoverable. The source never states an ALU-wide XOR count.
6. **Missing: the XOR truth table itself.** Not recoverable from the text layer. Any vault note that needs a verbatim canonical XOR table must cite elsewhere, not this source.
7. **Missing: all four schematics.** Gate-level and component-level diagrams for gates 1–4 are images; no netlist, node list, or pin table exists in text. `SPEC-42 Circuit Sourcemap` cannot be populated from this source.
8. **Missing: half-adder and full-adder circuits.** Named as applications (lines 61–62) but never drawn or described.
9. **Gate 4 resistor count is unexplained.** 7 × 2K resistors for 10 transistors across 5 two-transistor NOR cells (line 206) — the source gives no per-cell resistor accounting, and no resistor count is given at all for gates 1, 2, or 3.
10. **"works in all cases" is unqualified** (lines 105–106). No propagation delay, rise/fall time, fan-out, noise margin, or speed/power figure is given for any of the four builds. These are breadboard demonstrations, not characterised cells.
11. **Scope mismatch with CMOS XOR specs.** The vault's `SPEC-40 The 6T XOR Circuit` and `SPEC-41 The 8T XOR Circuit` describe (per their titles) 6T and 8T cells. This source's 6T and 8T figures are **BJT breadboard** counts with completely different structure. Do not treat them as the same artifact; this is a naming collision, not corroboration.
12. **No CMOS/pass-transistor data at all.** If the vault needs the canonical 4T / 6T / 10T CMOS XOR taxonomy, this source contributes nothing and should be marked as a coverage gap rather than as a contradicting source.
13. **Gate 1's third transistor role is described qualitatively only** ("a switch", "not enough voltage going into the base") — no threshold, no bias network, no base resistor value is given.

## Quotable Fragments

> The XOR gate is also called the exclusive OR gate. In this article, I will show 4 different ways it can be built on a breadboard using individual transistors.

> This gate is similar to the OR gate but when both inputs are on the output is off. That is why is the exclusive OR gate as in only for the true OR cases.

> In the simplest design, only 5 transistors are needed. However in order to send an output 6 transistors will be needed.

> The gate design is a NAND gate on the left two transistors, a switch for the middle transistors, and an OR-like gate for the last two transistors.

> This makes it so that the current can be sent as an output. I would recommend building the XOR gate this way as it works in all cases and only requires 6 transistors.

> It is common to use XOR gates in half adders, full adders, and for other computations so this is an important gate to understand.

> I will show several different ways to make an XOR gate but the truth table will be the same for all of the cases.

> Now there is an additional transistor that is somewhat acting as an inverter.

> The circuit requires 10 NPN transistors, 7 2K resistors, and an LED. The circuit is powered with a 5 Volt power supply.

> In most cases, it will not be used unless the computer or circuit architecture is based on the NOR gate. One example where this was the case was the Apollo Guidance Computer.

> This 4-bit computer is built on 32 breadboards and uses 962 NPN BJT transistors.

> The ALU allows the computer to add and subtract numbers up to 15. This is done by using four full adders and four XOR subtract gates.

> The transistors can be model numbers 2N2222 or 2N3904, which are both BJT transistors. All the resistors are 2K but values from 330 ohms to 2.2K would work.

## Cross-references

- `"[[SPEC-13 XOR Algebra]]"` — the source's own statement that the truth table is invariant across all four implementations is the empirical anchor for XOR being one operation with many realizations; it also gives the two-case reduction rule in prose ("when both inputs are on or off the output is off").
- `"[[SPEC-41 The 8T XOR Circuit]]"` — direct count match (8 transistors) but **different technology**: this is four 2-transistor BJT NAND gates, not a CMOS 8T cell. Cite the count only with the topology caveat.
- `"[[SPEC-40 The 6T XOR Circuit]]"` — direct count match (6 transistors) but this is Gate 1 plus one BJT output/inverter transistor, not a CMOS 6T XOR topology. Log as a naming collision, not as support.
- `"[[SPEC-42 Circuit Sourcemap]]"` — attempted and failed: every schematic and the truth table in this source are images, so zero netlists are extractable. Records a concrete coverage gap.
- `"[[SPEC-21 The Inversion Law]]"` — the sixth transistor in Gate 2 is described as acting as an inverter, and the opcode decoder / control matrix are built from inverters and multi-input NANDs; a physical, repeated use of inversion as the load-bearing element.
- `"[[SPEC-10 The Primitive]]"` — the source places XOR at the bottom of the arithmetic stack (half adders, full adders, four explicit XOR subtract gates in a working ALU), which is the strongest hardware-side evidence in this source for XOR as the primitive operation.
- `"[[SPEC-53 Clocks and Periods]]"` — concrete clock periods and duty structure: 1.75 s astable period from 4 transistors + 2 × 10 µF; ring-counter increment once per full cycle; 330 pF + 1K edge triggers; 30 s battery-pack auto-shutoff as a wall-clock artifact.
- `"[[SPEC-24 Observers]]"` — the article's measurement chain is explicit and layered: LED for coarse state, multimeter for current, oscilloscope for voltage *and* transients. Useful as a concrete, non-abstract observer ladder.
- `"[[SPEC-14 Knots and Binds]]"` — the breadboard section states binding rules outright (power-rail holes common, interior rows isolated, columns common between a–e and f–j); a literal, physical specification of which terminals are bound.
- `"[[SPEC-60 Test Vectors]]"` — the XOR truth table is asserted to be the common conformance vector across all four builds ("the truth table will be the same for all of the cases"), i.e. one vector set, four implementations.
- `"[[SPEC-61 Implementation Status]]"` — four builds are described as physically constructed and demonstrated (breadboard photos, measured output), so this is working-hardware evidence rather than paper design.
- `"[[OPEN-00 Contradiction Register]]"` — items 1, 2, 3, 4 and 11 above are register-worthy: three suspected source typos, one technology/count collision, one ambiguous XOR scope statement.
- `"[[OPEN-01 Open Questions]]"` — items 5–10 and 12 above are open: missing truth table, missing netlists, missing adder schematics, no timing/power characterisation, no CMOS data.
- `"[[OPEN-04 Discarded Claims]]"` — the claim "6 transistors" / "8 transistors" must not be imported into CMOS XOR specs; if it has been, this is where the discard is recorded.

## Extraction Notes

**Lines read:** 1–948 (entire file, 949 lines including the trailing newline; frontmatter `lines: "1-948"` per instruction).

**Coverage:**
- Lines 1–232: the four XOR builds, the headline transistor-count ladder, Apollo NOR-gate counts, and the 4-bit-computer teaser. Fully extracted.
- Lines 235–682: breadboard/component/tool/power-supply chapters. Component values, electrical limits, and breadboard connectivity rules extracted into Numbers and Invariants and Definitions; the Amazon affiliate blocks, nav menus, "Buy from Amazon »" callouts, author bio ×3, and the comment form were treated as chrome and dropped.
- Lines 686–882: the 4-bit computer chapter (clock, program counter, ring counter, opcode register/decoder, control matrix, data bus, memory, registers, ALU) and Final Thoughts. Extracted.
- Lines 885–948: author bio, comment form, affiliate disclaimer, footer nav, copyright. Dropped as chrome.

**What could not be parsed (all raster, zero text):**
- The XOR truth table and gate symbol (heading at line 64, referenced line 69).
- XOR 1 Circuit Diagram (heading line 74), XOR Gate 1 photo (line 24), XOR Gate 2 photo (line 91), XOR 2 Circuit Diagram (line 108), "XOR Gate Built with NAND Gates" gate-level + component-level diagrams (lines 125, 144, 152, 161), "XOR Gate Built with NOR Gates" gate-level + component-level diagrams (lines 169, 188, 196, 205).
- The embedded videos (the all-logic-gates video, the 4-bit computer videos, the 4-bit calculator video) — only their surrounding captions/timestamps exist in text.
- All photographs in the breadboard chapter (lines 285, 291, 296, 306, 323, 344, 353, 367, 381, 395, 409, 423, 440, 461, 484, 505, 526, 534, 550, 578, 584, 595, 620, 644, 662) — descriptive captions were extracted, images were not.
- Consequently: **no verbatim netlist, node list, or schematic-as-text exists in this source.** The "Circuits" section above is therefore descriptive + verbatim prose quotation, and explicitly says so per topology. No netlist was reconstructed or invented.

**Quality notes on the source text itself:**
- The `pdftotext -layout` pass preserved the two-column-ish prose and left the "Resources" heading orphaned at line 931 (the link list itself was rendered as an image or empty list). Not recoverable.
- Typos preserved as-is in quoted evidence: "microfard" (line 740), "a-stable multi-vibrator" (line 737), "registeres" (line 718), "2N222" (line 443), "tri-site" (line 806), "the are many types" (line 440), "not to build circuits to take pictures" (line 317–318).
- The article is instructional/promotional in places (affiliate links, "Buy from Amazon"), and its comparative figures in Final Thoughts are stated without citation. Treat the transistor-count figures for modern silicon (~3B / ~35B / ~7B / ~3T) as unsourced author assertions, not as measured data.
- Article metadata captured: Cody Wabiszewski, "XOR Gate, Exclusive OR Gate", Global Science Network, July 2, 2024, `https://www.gsnetwork.com/xor-gate/`, snapshot rendered 9/29/26 4:04 PM, 40 pages.
