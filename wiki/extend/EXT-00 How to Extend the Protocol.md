---
id: EXT-00
title: "How to Extend the Protocol"
kind: extension
layer: extension
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down:
  - "[[EXT-01 Adding a Dimension]]"
  - "[[EXT-02 Adding a Symbol]]"
  - "[[EXT-03 Adding a Substrate]]"
  - "[[EXT-04 Literate Workflow]]"
  - "[[EXT-05 Review Checklist]]"
related:
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, extension, guide, how-to]
---

# How to Extend the Protocol

## The Principle

The protocol is extensible. The three laws are fixed, but the substrates, the symbols, and the dimensions can be extended.

The key principle: **the protocol carries structure. Meaning is assigned by implementations.**

## What Can Be Extended

| Layer | What | How |
|-------|------|-----|
| Dimensions | Add a new D-axis | Define the component, substrate, and interface |
| Symbols | Add a new regex to G | Define the pattern and the helper function |
| Substrates | Add a new hardware realization | Define the circuit and the sourcemap |
| Grammar | Add a new declaration | Define the regex and the configuration |
| Runtime | Add a new web layer | Define the interface and the implementation |

## What Cannot Be Extended

| Layer | What | Why |
|-------|------|-----|
| The primitive | `Atomics.compareExchange` | The First Law |
| The invariant | 3! ordering | The Second Law |
| The closure | Attractor 0 | The Third Law |
| The three primitives | `bind`, `apply`, `eval` | The canonical statement |

## The Extension Process

1. **Identify the layer** — Is it a dimension, a symbol, a substrate, a grammar, or a runtime layer?
2. **Define the structure** — What is the component? What is the substrate? What is the interface?
3. **Write the specification** — Add a new SPEC note. Link it to the existing notes.
4. **Implement** — Write the code. Add it to the appropriate file.
5. **Test** — Add a test vector to [[SPEC-60 Test Vectors]].
6. **Document** — Update the source MOCs and the change log.

## The Literate Workflow

The extension should follow the literate workflow:

1. **Extract** — Read the source material. Extract the claims, definitions, and code.
2. **Distill** — Write a source note. Link it to the existing notes.
3. **Specify** — Write a spec note. Link it to the source notes.
4. **Implement** — Write the code. Link it to the spec notes.
5. **Verify** — Run the tests. Update the implementation status.

See [[EXT-04 Literate Workflow]] for the full workflow.

## The Review Checklist

See [[EXT-05 Review Checklist]] for the checklist that every extension must pass.
