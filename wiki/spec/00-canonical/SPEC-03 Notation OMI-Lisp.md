---
id: SPEC-03
title: "Notation: OMI-Lisp"
kind: spec
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-00 Canonical Statement]]"
down: []
related:
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, notation, OMI-Lisp, ASCII, terminal]
---

# Notation: OMI-Lisp

## Definition

OMI-Lisp is the executable notation. ASCII is the terminal projection.

From `rosetta/src/unified_canonical_statement.yaml`:

```yaml
notation: "OMI-Lisp is the executable notation. ASCII is the terminal projection."
```

## The Canonical Laws

```
The graph is the structure.
The stream is the transport.
The canvas is the interoperability.
The sourcemap is the physical trace.
OMI-Lisp is the executable notation.
```

## The Four Readings

All four describe the same structure:

```
Lisp on sets
Horn clause
Calculus of constructions
Prime-composite
```

## The ASCII Projection

ASCII is the terminal projection. The ASCII table is the projection of the protocol's structure onto the terminal.

```
Stick 0: 0x00–0x1F (32 control codes)
Stick 1: 0x20–0x3F (32 codes)
Stick 2: 0x40–0x5F (32 codes)
Stick 3: 0x60–0x7F (32 codes)
```

Four sticks of 32. And 4 × 32 = 128 = 2⁷.

## The Fold

The ASCII table folds at 0x1C (and 0x0C for the first half). The four face separators (FS, GS, RS, US = 0x1C, 0x1D, 0x1E, 0x1F) are the four tetrahedral vertices.

See [[SPEC-55 ASCII Folds]] for the full fold structure.

## The OMI-Lisp Syntax

The OMI-Lisp syntax is the syntax of the protocol's messages. It is defined by the grammar G and the declaration syntax.

See [[SPEC-30 The Symbol Table G]] for the grammar.
See [[SPEC-31 Declaration Syntax]] for the declaration syntax.

## The Terminal Projection

The terminal projection is the ASCII rendering of the protocol's structure. The ASCII table is the projection. The fold is the projection operator. The four face separators are the projection vertices.

```
ASCII table → the projection
fold → the projection operator
face separators → the projection vertices
```
