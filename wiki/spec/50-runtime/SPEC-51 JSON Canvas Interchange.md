---
id: SPEC-51
title: "JSON Canvas Interchange"
kind: spec
layer: runtime
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-50 Stream Transport]]"
down: []
related:
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-52 The REPL and the Digest]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-54 The Web Platform Layers]]"
  - "[[SPEC-55 ASCII Folds]]"
  - "[[SPEC-23 The Rosetta Stone]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-02 XOR Gate Transistor Circuits]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, canvas, JSON, interchange, interoperability, visualization]
---

# JSON Canvas Interchange

## Definition

The canvas is the interoperability. The `.canvas` file is the JSON Canvas 1.0 format.

From `rosetta/src/unified_canonical_statement.yaml`:

```yaml
canvas: "The canvas is the interoperability. The .canvas file is the JSON Canvas 1.0 format."
```

## The JSON Canvas Format

JSON Canvas is a JSON-based format for representing graphs. It has:

| Element | Type | Description |
|---------|------|-------------|
| nodes | array | The nodes in the graph |
| edges | array | The edges in the graph |

Each node has:

| Field | Type | Description |
|-------|------|-------------|
| id | string | The node ID |
| type | string | The node type (text, file, link, group) |
| x | number | The x position |
| y | number | The y position |
| width | number | The width |
| height | number | The height |
| color | string | The color |
| label | string | The label |

Each edge has:

| Field | Type | Description |
|-------|------|-------------|
| id | string | The edge ID |
| fromNode | string | The source node ID |
| fromSide | string | The source side (top, bottom, left, right) |
| toNode | string | The target node ID |
| toSide | string | The target side (top, bottom, left, right) |
| toEnd | string | The arrow style (arrow, none) |
| label | string | The label |

## The 6T Canvas

From `rosetta/src/omi_rosetta_stone.yaml`:

```yaml
circuit_6t:
  canvas_id: "6t-xor"
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
    # ... more vertices
  edges:
    - id: "A-to-Q1-B"
      from: "BUS"
      from_side: "left"
      to: "Q1"
      to_side: "top"
      to_end: "arrow"
      label: "A"
    # ... more edges
```

## The 8T Canvas

```yaml
circuit_8t:
  canvas_id: "8t-xor"
  canvas_version: "1.0"
  vertices:
    - id: "Q1"
      role: "NPN transistor"
      value: "2N2222"
      subgraph: "NAND1"
    # ... more vertices
```

## The Canvas as Interoperability

The canvas is the interoperability. It is the format that allows different tools to exchange graph data. The JSON Canvas format is the standard.

```
canvas       — the logical structure (the graph)
sourcemap     — the mapping (the trace)
breadboard   — the physical realization (the circuit)
```

The canvas is the graph. The sourcemap is the trace. The breadboard is the circuit.

## The Canvas and the Protocol

The canvas is the protocol's visualization. It is the graph that the protocol operates on. The nodes are the positions. The edges are the relations.

```
canvas       — the graph (the structure)
protocol     — the operation (the walk)
orbit        — the result (the reading)
```

The canvas is the static structure. The protocol is the dynamic operation. The orbit is the result.
