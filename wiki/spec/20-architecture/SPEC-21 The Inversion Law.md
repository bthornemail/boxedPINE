---
id: SPEC-21
title: "The Inference Inversion Law"
kind: spec
layer: architecture
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-20 The Dimensional Axis]]"
down: []
related:
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-24 Observers]]"
  - "[[SPEC-25 The Iff]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code:
  - "codex.yaml"
dimensions: []
symbols: []
tags: [omi-imo, inversion, law, parity, active, passive]
---

# The Inference Inversion Law

## Definition

From `codex.yaml`:

```yaml
inference_inversion_law:
  negative_dimensions:
    domain: Hardware Substrate
    odd_dimensions: ⚡ Active (Dynamic switching, gating, filtering primitives)
    even_dimensions: 🟢 Passive (Static configurations, wiring layouts, passive components)
  positive_dimensions:
    domain: Runtime Interpretation / Software Execution
    odd_dimensions: 🟢 Passive (Declarative structures, coordinates, regions)
    even_dimensions: ⚡ Active (Rendering, matrix transformations, mutation pipelines)
```

## The Law

The inference state inverts between the negative and positive dimensions:

| Domain | Odd Dimensions | Even Dimensions |
|--------|---------------|-----------------|
| Negative (Hardware Substrate) | ⚡ Active | 🟢 Passive |
| Positive (Runtime Interpretation) | 🟢 Passive | ⚡ Active |

## The Reading

In the hardware substrate (negative dimensions):
- **Odd dimensions are Active** — dynamic switching, gating, filtering primitives
- **Even dimensions are Passive** — static configurations, wiring layouts, passive components

In the runtime interpretation (positive dimensions):
- **Odd dimensions are Passive** — declarative structures, coordinates, regions
- **Even dimensions are Active** — rendering, matrix transformations, mutation pipelines

## The 0D Exception

0D is the Neutral Invariant. It is neither active nor passive. It is the observer, the anchor, the point that doesn't move.

```
0D: ⚓ Neutral Invariant
```

## The Significance

The inversion law is why the protocol is scale-invariant. The same structure appears at every scale, but the inference state inverts. What is active at the hardware level is passive at the runtime level, and vice versa.

This is the O(1) constant projected resolution across all scales. The structure is the same; only the inference state changes.

## The Inversion and the Swap

The inversion is the swap. The three swaps (`swap16`, `swap32`, `swap64`) are the three readings of the same buffer at different granularities. Each swap inverts the inference state.

```
swap16    small slice       the smallest reflection
swap32    medium slice      the medium reflection
swap64    large slice       the largest reflection
```

The compare-exchange selects which swap is active by measuring the deviation. The deviation's signature is the swap selection.

## The Inversion and the Observer

The observer is any circulator capable of reflecting swap rotations. The observer reads the inversion. The reading is the materialized meaning.

```
observer     — the circulator
inversion    — the structure
reading      — the result
```

The observer reads the inversion. The reading is the materialized meaning.
