---
id: SPEC-40
title: "The 6T XOR Circuit"
kind: spec
layer: hardware
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down:
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-44 The Virtual Breadboard]]"
related:
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
sources:
  - "[[SRC-02 XOR Gate Transistor Circuits]]"
  - "[[SRC-08 XOR Gate Built with Transistors]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code:
  - "rosetta/src/omi_rosetta_stone.yaml"
dimensions: []
symbols: []
tags: [omi-imo, hardware, XOR, transistor, 6T, circuit, breadboard]
---

# The 6T XOR Circuit

## Definition

From `rosetta/src/omi_rosetta_stone.yaml`:

```yaml
circuit_6t:
  description: "The 6T XOR circuit (XOR #2, the apply, the full fan-out)."
  canvas_id: "6t-xor"
  canvas_version: "1.0"
```

The 6T XOR circuit is the **apply** — the full fan-out. It is the second XOR gate in the protocol's physical realization.

## The Components

| ID | Type | Value | Role |
|----|------|-------|------|
| Q1 | NPN transistor | 2N2222 | NAND gate left |
| Q2 | NPN transistor | 2N2222 | NAND gate right |
| Q3 | NPN transistor | 2N2222 | switch |
| Q4 | NPN transistor | 2N2222 | OR-like left |
| Q5 | NPN transistor | 2N2222 | OR-like right |
| Q6 | NPN transistor | 2N2222 | inverter stage |
| R1 | resistor | 2K | pull-up Q1 |
| R2 | resistor | 2K | pull-up Q2 |
| R3 | resistor | 2K | pull-up Q3 |
| R4 | resistor | 2K | pull-up Q4 |
| R5 | resistor | 2K | pull-up Q5 |
| R6 | resistor | 2K | pull-up Q6 |
| RLED | resistor | 330 | current limit |
| LED | LED | YELLOW | apply indicator |
| BUS | bus | 8-bit | data bus |
| GND | rail | 0V | ground |
| VCC | rail | +5V | power |

## The Edges

| From | To | Label |
|------|-----|-------|
| BUS | Q1 | A |
| BUS | Q2 | B |
| Q1-C | Q2-E | NAND |
| Q2-C | Q3-B | switch |
| Q3-C | Q4-B | OR-like |
| Q3-C | Q5-B | OR-like |
| Q4-C | LED | OUT |
| Q1-C | VCC | pull-up |
| Q2-C | VCC | pull-up |
| Q3-C | VCC | pull-up |
| Q4-C | VCC | pull-up |
| Q5-C | VCC | pull-up |
| Q1-E | GND | emitter |
| Q3-E | GND | emitter |
| Q4-E | Q5-C | OR-like |
| Q5-E | GND | emitter |
| LED | RLED | current limit |
| RLED | GND | return |

## The Sourcemap

| Canvas Node | Physical Node | Breadboard Row | Breadboard Col | Notes |
|-------------|---------------|----------------|----------------|-------|
| Q1 | Q1 | 5 | 1 | NAND gate left |
| Q2 | Q2 | 5 | 6 | NAND gate right |
| Q3 | Q3 | 5 | 11 | switch |
| Q4 | Q4 | 5 | 21 | OR-like left |
| Q5 | Q5 | 5 | 26 | OR-like right |
| Q6 | Q6 | 5 | 31 | inverter stage |
| R1 | R1 | 1 | 1 | pull-up Q1 |
| R2 | R2 | 1 | 6 | pull-up Q2 |
| R3 | R3 | 1 | 11 | pull-up Q3 |
| R4 | R4 | 1 | 21 | pull-up Q4 |
| R5 | R5 | 1 | 26 | pull-up Q5 |
| R6 | R6 | 1 | 31 | pull-up Q6 |
| RLED | RLED | 12 | 48 | current limit |
| LED | LED | 24 | 48 | apply indicator |
| BUS | BUS | 24 | 0 | data bus |
| GND | GND | 24 | 24 | ground |
| VCC | VCC | 24 | 32 | power |

## The Truth Table

The 6T circuit computes XOR. The truth table:

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

## The Naming Collision

**Important:** The 6T and 8T in the protocol's YAML spec are BJT breadboard circuits, not CMOS. The reference source (SRC-08) describes 5T, 6T, 8T, and 10T BJT circuits. There is a naming collision: the "6T" in the YAML is a BJT circuit with 6 transistors, while "6T" in CMOS literature typically means 6 transistors in a CMOS XOR gate. These are different circuits.

## The 6T as Apply

The 6T circuit is the **apply** — the full fan-out. It is the second XOR gate in the protocol's physical realization. The 5T is the first (the frame condition), the 6T is the second (the apply), the 8T is the third (the eval), and the 10T is the fourth (the digest).

```
5T   →  the frame condition (read)
6T   →  the apply (full fan-out)
8T   →  the eval (SECURE)
10T  →  the digest (reads and drives)
```

## The Contradiction

Resolved 2026-10-07. The 6T computes XOR. The XNOR is the 5T's collector node (BOOT0), which the 5T's sinking LED shows as XOR. Q6 inverts BOOT0 into BOOT1, which is XOR. `Atom.apply()` returns 254/255 because it inverts only bit 0 of an 8-bit XNOR, and bit 0 is the correct XOR. See [[OPEN-00 Contradiction Register]] #1 and [[SPEC-44 The Virtual Breadboard]].
