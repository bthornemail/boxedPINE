---
id: EXT-03
title: "Adding a Substrate"
kind: extension
layer: extension
status: canonical
spec: OMI-IMO-2026
up: "[[EXT-00 How to Extend the Protocol]]"
down: []
related:
  - "[[EXT-00 How to Extend the Protocol]]"
  - "[[EXT-01 Adding a Dimension]]"
  - "[[EXT-02 Adding a Symbol]]"
  - "[[EXT-04 Literate Workflow]]"
  - "[[EXT-05 Review Checklist]]"
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
sources:
  - "[[SRC-02 XOR Gate Transistor Circuits]]"
  - "[[SRC-08 XOR Gate Built with Transistors]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
code:
  - "rosetta/src/omi_rosetta_stone.yaml"
dimensions: []
symbols: []
tags: [omi-imo, extension, substrate, hardware, circuit, sourcemap]
---

# Adding a Substrate

## The Substrate

The substrate is the physical realization of the protocol. The protocol's substrates are orthogonal — each is a distinct structural axis.

To add a new substrate, you must:

1. Define the circuit topology
2. Define the components
3. Define the sourcemap
4. Write the spec
5. Update the MOC

## The Process

### 1. Define the Circuit Topology

The circuit topology is the graph of components and edges. It is the logical structure.

```yaml
circuit_new:
  description: "The new circuit."
  canvas_id: "new-circuit"
  canvas_version: "1.0"
  vertices:
    - id: "Q1"
      type: "text"
      role: "NPN transistor"
      value: "2N2222"
      position: {"x": 0, "y": 0}
      size: {"width": 8, "height": 3}
      color: "1"
      label: "Q1 (NPN)"
  edges:
    - id: "A-to-Q1-B"
      from: "BUS"
      from_side: "left"
      to: "Q1"
      to_side: "top"
      to_end: "arrow"
      label: "A"
```

### 2. Define the Components

The components are the physical parts. Each has a type, a value, and a role.

| Type | Value | Role |
|------|-------|------|
| NPN transistor | 2N2222 | the switching element |
| resistor | 2K | the pull-up |
| resistor | 330 | the current limit |
| LED | YELLOW | the indicator |
| bus | 8-bit | the data bus |
| rail | 0V | the ground |
| rail | +5V | the power |

### 3. Define the Sourcemap

The sourcemap traces every canvas node back to its physical realization.

```yaml
sourcemap:
  - canvas_node: "Q1"
    physical_node: "Q1"
    component_type: "NPN"
    component_value: "2N2222"
    breadboard_row: 5
    breadboard_col: 1
    datasheet: "https://www.onsemi.com/pdf/datasheet/2n2222-d.pdf"
    notes: "NAND gate left"
```

### 4. Write the Spec

Add a new SPEC note. Link it to [[SPEC-40 The 6T XOR Circuit]] or [[SPEC-41 The 8T XOR Circuit]].

### 5. Update the MOC

Add the new substrate to [[OMI-IMO]].

## The Existing Substrates

| Circuit | Transistors | Gates | Role |
|---------|-------------|-------|------|
| 5T | 5 | NAND + switch + OR-like | the frame condition |
| 6T | 6 | XOR#1 + inverter | the apply |
| 8T | 8 | 4× NAND | the eval |
| 10T | 10 | 5× NOR | the digest |

## Testing a Substrate Virtually

Before building on a real breadboard, add the circuit to the description in [[SPEC-44 The Virtual Breadboard]]. Each gate is a truth table and a transistor cost. The self-test renders it in Web Audio, checks it against XOR, and generates a sourcemap in the row-5, every-fifth-column convention.

## The Naming Collision

**Important:** The 6T and 8T in the protocol's YAML spec are BJT breadboard circuits, not CMOS. The reference source (SRC-08) describes 5T, 6T, 8T, and 10T BJT circuits. There is a naming collision: the "6T" in the YAML is a BJT circuit with 6 transistors, while "6T" in CMOS literature typically means 6 transistors in a CMOS XOR gate. These are different circuits.

## The Truth Table

The circuit must compute XOR. The truth table:

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

**Note:** The 6T circuit as described in the YAML is XNOR, not XOR. `Atom.apply()` returns 254/255. This is a genuine contradiction. See [[OPEN-00 Contradiction Register]].
