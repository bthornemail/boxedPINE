---
id: SPEC-41
title: "The 8T XOR Circuit"
kind: spec
layer: hardware
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-40 The 6T XOR Circuit]]"
down: []
related:
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-30 The Symbol Table G]]"
sources:
  - "[[SRC-02 XOR Gate Transistor Circuits]]"
  - "[[SRC-08 XOR Gate Built with Transistors]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code:
  - "rosetta/src/omi_rosetta_stone.yaml"
dimensions: []
symbols: []
tags: [omi-imo, hardware, XOR, transistor, 8T, circuit, NAND, SECURE]
---

# The 8T XOR Circuit

## Definition

From `rosetta/src/omi_rosetta_stone.yaml`:

```yaml
circuit_8t:
  description: "The 8T XOR circuit (XOR #3, the eval, the SECURE). It is built from 4 NAND gates."
  canvas_id: "8t-xor"
  canvas_version: "1.0"
```

The 8T XOR circuit is the **eval** — the SECURE. It is the third XOR gate in the protocol's physical realization. It is built from 4 NAND gates.

## The Components

| ID | Type | Value | Subgraph |
|----|------|-------|----------|
| Q1 | NPN transistor | 2N2222 | NAND1 |
| Q2 | NPN transistor | 2N2222 | NAND1 |
| Q3 | NPN transistor | 2N2222 | NAND2 |
| Q4 | NPN transistor | 2N2222 | NAND2 |
| Q5 | NPN transistor | 2N2222 | NAND3 |
| Q6 | NPN transistor | 2N2222 | NAND3 |
| Q7 | NPN transistor | 2N2222 | NAND4 |
| Q8 | NPN transistor | 2N2222 | NAND4 |
| LED | LED | GREEN | output |

## The NAND Structure

The 8T circuit is built from 4 NAND gates:

```
NAND1: Q1, Q2
NAND2: Q3, Q4
NAND3: Q5, Q6
NAND4: Q7, Q8
```

Each NAND gate is 2 transistors. 4 NAND gates × 2 transistors = 8 transistors.

## The Sourcemap

| Canvas Node | Physical Node | Breadboard Row | Breadboard Col | Notes |
|-------------|---------------|----------------|----------------|-------|
| Q1 | Q1 | 5 | 1 | NAND1 left |
| Q2 | Q2 | 5 | 6 | NAND1 right |
| Q3 | Q3 | 5 | 11 | NAND2 left |
| Q4 | Q4 | 5 | 16 | NAND2 right |
| Q5 | Q5 | 5 | 21 | NAND3 left |
| Q6 | Q6 | 5 | 26 | NAND3 right |
| Q7 | Q7 | 5 | 31 | NAND4 left |
| Q8 | Q8 | 5 | 36 | NAND4 right |

## The Truth Table

The 8T circuit computes XOR. The truth table:

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

## The 8T as Eval

The 8T circuit is the **eval** — the SECURE. It is the third XOR gate in the protocol's physical realization.

```
5T   →  the frame condition (read)
6T   →  the apply (full fan-out)
8T   →  the eval (SECURE)
10T  →  the digest (reads and drives)
```

## The Algebraic Correctness

From the extraction of SRC-02: the 8T and 10T netlists are algebraically correct XOR (verified by hand). The 8T is built from 4 NAND gates, which is the standard XOR-from-NAND construction.

## The Virtual Build

The 8T runs as four NAND rules in a Web Audio graph in [[SPEC-44 The Virtual Breadboard]]. Its generated sourcemap matches the table above.

## The Naming Collision

**Important:** The 8T in the protocol's YAML spec is a BJT breadboard circuit with 8 transistors organized into 4 NAND gates. The reference source (SRC-08) describes 5T, 6T, 8T, and 10T BJT circuits. There is a naming collision: the "8T" in the YAML is a BJT circuit, while "8T" in CMOS literature typically means 8 transistors in a CMOS XOR gate. These are different circuits.
