---
id: EXT-01
title: "Adding a Dimension"
kind: extension
layer: extension
status: canonical
spec: OMI-IMO-2026
up: "[[EXT-00 How to Extend the Protocol]]"
down: []
related:
  - "[[EXT-00 How to Extend the Protocol]]"
  - "[[EXT-02 Adding a Symbol]]"
  - "[[EXT-03 Adding a Substrate]]"
  - "[[EXT-04 Literate Workflow]]"
  - "[[EXT-05 Review Checklist]]"
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-21 The Inversion Law]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, extension, dimension, D-axis]
---

# Adding a Dimension

## The Dimensional Axis

The protocol spans 16 dimensions (-5D to +10D). Each dimension is a distinct structural axis. Each is orthogonal to the others.

To add a new dimension, you must define:

| Field | Description |
|-------|-------------|
| Component | The name of the component |
| Domain | Hardware Substrate or Runtime Interpretation |
| Structural Definition | What the component is |
| Inference State | ⚡ Active, 🟢 Passive, or ⚓ Neutral Invariant |
| Hardware Substrate | The physical realization |
| Structural Interface | The software interface |

## The Process

1. **Choose the D-axis** — Is it negative (hardware) or positive (runtime)?
2. **Determine the parity** — Is it odd or even? This determines the inference state.
3. **Define the component** — What is the name? What is the role?
4. **Define the substrate** — What is the physical realization?
5. **Define the interface** — What is the software interface?
6. **Write the spec** — Add a new SPEC note. Link it to [[SPEC-20 The Dimensional Axis]].
7. **Update the MOC** — Add the new dimension to [[OMI-IMO]].

## The Inference State

The inference state is determined by the parity and the domain:

| Domain | Odd | Even |
|--------|-----|------|
| Negative (Hardware) | ⚡ Active | 🟢 Passive |
| Positive (Runtime) | 🟢 Passive | ⚡ Active |

0D is the exception: ⚓ Neutral Invariant.

## The Higher Dimensions

The protocol already defines higher dimensions (11D to 16⁸). These are:

```
11D — the scoping. It scopes the 3! ⊕ 3! ⊕ 3! ⊕ 1!.
12D — the highest. It's the BuckeyBall cascade.
13D — the quarter diagonal. It's the digest.
17D — the first resolution. It's 16 + 1.
18D — the center. It's the reconciliation.
19D — the second resolution. It's 18 + 1.
20D — the tangent point. It's full.
21D, 22D — the tangent branch points. They're like 0D and 1D.
23D — the nach to prime reoccurrence.
24D — the 4! squaring. It's the Leech lattice.
25D — spacelike. It's the Lorentzian lattice.
26D — the alpha characters. It's the alphanumeric pipeline.
30D — the maximum. The subsumption returns.
36D — the imaginary unit. The alphanumeric channel.
48D — the meta 16⁴. The imaginary projective geometry.
60D — the meta 16⁵. The imaginary projective geometry.
64D — the two orchestrators.
128D — the four models (observer, agent, user, automaton).
256D — the 16⁸ allocatable.
512D — the minimal shared imaginary projective geometry.
1024D, 2048D — the addresses.
2036D — the corruption boundary.
4096D, 8192D — the mirror of the delta law at the sub-cycle.
2¹⁶ — the imaginary projective geometry dimensions.
16⁸ — the cyclical periodicity.
```

To add a new higher dimension, follow the same process. Define the component, the substrate, and the interface. Write the spec. Update the MOC.
