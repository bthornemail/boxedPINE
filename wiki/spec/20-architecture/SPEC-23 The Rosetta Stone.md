---
id: SPEC-23
title: "The Rosetta Stone"
kind: spec
layer: architecture
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-20 The Dimensional Axis]]"
down: []
related:
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-21 The Inversion Law]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-24 Observers]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-51 JSON Canvas Interchange]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-02 XOR Gate Transistor Circuits]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-08 XOR Gate Built with Transistors]]"
code:
  - "rosetta/src/omi_rosetta_stone.yaml"
  - "rosetta/src/rosetta_stone.json"
  - "rosetta/src/unified_canonical_statement.yaml"
dimensions: []
symbols: []
tags: [omi-imo, rosetta, stone, specification, yaml, json, canvas]
---

# The Rosetta Stone

## Definition

The Rosetta Stone is the specification document for the OMI-IMO protocol. It is the single source of truth that describes the protocol's structure, grammar, and physical realization.

From `rosetta/src/omi_rosetta_stone.yaml`:

```yaml
omi_rosetta_stone:
  metadata:
    version: "1.3.0"
    previous_version: "1.2.0"
    codex: "OMI-IMO-2026"
    date: "2026-09-24"
    license: "MIT"
    structure:
      - "Part I  — The Haskell type cast (v1.2.0)"
      - "Part II — The JSON Canvas rendering (v1.2.0)"
      - "Part III — The circuit sourcemap (v1.3.0)"
    canonical_law:
      - "The graph is the structure."
      - "The stream is the transport."
      - "The canvas is the interoperability."
      - "The sourcemap is the physical trace."
      - "OMI-Lisp is the executable notation."
```

## The Canonical Laws

```
The graph is the structure.
The stream is the transport.
The canvas is the interoperability.
The sourcemap is the physical trace.
OMI-Lisp is the executable notation.
```

## The Unified Canonical Statement

From `rosetta/src/unified_canonical_statement.yaml`:

```yaml
unified_canonical_statement:
  protocol: "The data doesn't change. The observer's interpretation changes based on the point of view they infer from."
  stream: "The stream is the transport. Each vertex and each edge is one line of the JSONL/NDJSON stream."
  canvas: "The canvas is the interoperability. The .canvas file is the JSON Canvas 1.0 format."
  sourcemap: "The sourcemap is the physical trace. Every canvas node traces back to its physical realization."
  notation: "OMI-Lisp is the executable notation. ASCII is the terminal projection."
  authority: "Projection"
```

## The Three Parts

### Part I — The Haskell Type Cast (v1.2.0)

The type system. The grammar. The constraint.

### Part II — The JSON Canvas Rendering (v1.2.0)

The canvas. The interoperability. The visualization.

### Part III — The Circuit Sourcemap (v1.3.0)

The physical trace. The hardware realization. The breadboard layout.

## The Circuit Sourcemap

The 6T and 8T circuits are described as groups of electrical component nodes in the OMI Canvas format. The sourcemap traces every canvas node back to its physical realization.

### The 6T Circuit

```
description: "The 6T XOR circuit (XOR #2, the apply, the full fan-out)."
canvas_id: "6t-xor"
canvas_version: "1.0"
```

Vertices: Q1-Q6 (NPN transistors, 2N2222), R1-R6 (2K resistors), RLED (330), LED (YELLOW), BUS (8-bit), GND (0V), VCC (+5V).

Edges: A-to-Q1-B, B-to-Q2-B, Q1-C-to-Q2-E, Q2-C-to-Q3-B, Q3-C-to-Q4-B, Q3-C-to-Q5-B, Q4-C-to-LED, Q1-C-to-VCC, Q2-C-to-VCC, Q3-C-to-VCC, Q4-C-to-VCC, Q5-C-to-VCC, Q1-E-to-GND, Q3-E-to-GND, Q4-E-to-Q5-C, Q5-E-to-GND, LED-to-RLED, RLED-to-GND.

Sourcemap: Each canvas node traces to a physical node with breadboard row/col, datasheet URL, and notes.

### The 8T Circuit

```
description: "The 8T XOR circuit (XOR #3, the eval, the SECURE). It is built from 4 NAND gates."
canvas_id: "8t-xor"
canvas_version: "1.0"
```

Vertices: Q1-Q8 (NPN transistors, 2N2222, organized into NAND1-NAND4), LED (GREEN).

## The Authority

```
authority: "Projection"
```

The authority is projection. The protocol is a projection of the observer's point of view. The data doesn't change; the observer's interpretation changes.
