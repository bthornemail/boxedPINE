---
id: SPEC-42
title: "Circuit Sourcemap"
kind: spec
layer: hardware
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-40 The 6T XOR Circuit]]"
down: []
related:
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-23 The Rosetta Stone]]"
sources:
  - "[[SRC-02 XOR Gate Transistor Circuits]]"
  - "[[SRC-08 XOR Gate Built with Transistors]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
code:
  - "rosetta/src/omi_rosetta_stone.yaml"
dimensions: []
symbols: []
tags: [omi-imo, sourcemap, physical, trace, breadboard, datasheet]
---

# Circuit Sourcemap

## Definition

The sourcemap is the physical trace. Every canvas node traces back to its physical realization.

From `rosetta/src/unified_canonical_statement.yaml`:

```yaml
sourcemap: "The sourcemap is the physical trace. Every canvas node traces back to its physical realization."
```

## The Sourcemap Entry

Each sourcemap entry has:

| Field | Type | Description |
|-------|------|-------------|
| canvas_node | string | The node ID in the canvas |
| physical_node | string | The node ID in the physical circuit |
| component_type | string | NPN, resistor, LED, bus, rail |
| component_value | string | 2N2222, 2K, 330, YELLOW, 8-bit, 0V, +5V |
| breadboard_row | number | The row on the breadboard |
| breadboard_col | number | The column on the breadboard |
| datasheet | string | URL to the component datasheet |
| notes | string | Human-readable notes |

## The 6T Sourcemap

| Canvas Node | Physical Node | Type | Value | Row | Col | Notes |
|-------------|---------------|------|-------|-----|-----|-------|
| Q1 | Q1 | NPN | 2N2222 | 5 | 1 | NAND gate left |
| Q2 | Q2 | NPN | 2N2222 | 5 | 6 | NAND gate right |
| Q3 | Q3 | NPN | 2N2222 | 5 | 11 | switch |
| Q4 | Q4 | NPN | 2N2222 | 5 | 21 | OR-like left |
| Q5 | Q5 | NPN | 2N2222 | 5 | 26 | OR-like right |
| Q6 | Q6 | NPN | 2N2222 | 5 | 31 | inverter stage |
| R1 | R1 | resistor | 2K | 1 | 1 | pull-up Q1 |
| R2 | R2 | resistor | 2K | 1 | 6 | pull-up Q2 |
| R3 | R3 | resistor | 2K | 1 | 11 | pull-up Q3 |
| R4 | R4 | resistor | 2K | 1 | 21 | pull-up Q4 |
| R5 | R5 | resistor | 2K | 1 | 26 | pull-up Q5 |
| R6 | R6 | resistor | 2K | 1 | 31 | pull-up Q6 |
| RLED | RLED | resistor | 330 | 12 | 48 | current limit |
| LED | LED | LED | YELLOW | 24 | 48 | apply indicator |
| BUS | BUS | bus | 8-bit | 24 | 0 | data bus |
| GND | GND | rail | 0V | 24 | 24 | ground |
| VCC | VCC | rail | +5V | 24 | 32 | power |

## The 8T Sourcemap

| Canvas Node | Physical Node | Type | Value | Row | Col | Notes |
|-------------|---------------|------|-------|-----|-----|-------|
| Q1 | Q1 | NPN | 2N2222 | 5 | 1 | NAND1 left |
| Q2 | Q2 | NPN | 2N2222 | 5 | 6 | NAND1 right |
| Q3 | Q3 | NPN | 2N2222 | 5 | 11 | NAND2 left |
| Q4 | Q4 | NPN | 2N2222 | 5 | 16 | NAND2 right |
| Q5 | Q5 | NPN | 2N2222 | 5 | 21 | NAND3 left |
| Q6 | Q6 | NPN | 2N2222 | 5 | 26 | NAND3 right |
| Q7 | Q7 | NPN | 2N2222 | 5 | 31 | NAND4 left |
| Q8 | Q8 | NPN | 2N2222 | 5 | 36 | NAND4 right |

## The Datasheet

All transistors use the same datasheet:

```
https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf
```

## The Unambiguous Linking

From the extraction of SRC-05: the source-map "unambiguous linking" spec text. The sourcemap provides unambiguous linking from the canvas (the logical structure) to the breadboard (the physical realization).

## The Canvas-to-Physical Mapping

The canvas is the logical structure. The breadboard is the physical realization. The sourcemap is the mapping between them.

```
canvas       — the logical structure (the graph)
sourcemap     — the mapping (the trace)
breadboard   — the physical realization (the circuit)
```

The sourcemap is the physical trace. Every canvas node traces back to its physical realization. The breadboard row and column give the physical location. The datasheet gives the component specification. The notes give the human-readable description.
