---
id: OPEN-03
title: "Glossary"
kind: open
layer: open
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-04 Discarded Claims]]"
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-21 The Inversion Law]]"
  - "[[SPEC-22 The Blob]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-24 Observers]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
  - "[[SPEC-35 Reflections and Orbits]]"
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-41 The 8T XOR Circuit]]"
  - "[[SPEC-42 Circuit Sourcemap]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-51 JSON Canvas Interchange]]"
  - "[[SPEC-52 The REPL and the Digest]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-54 The Web Platform Layers]]"
  - "[[SPEC-55 ASCII Folds]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, glossary, terminology, definitions]
---

# Glossary

## A

**apply** — The second primitive. Executes a knot as a function descriptor, producing a result. Categorically a Functor.

**Atomics.compareExchange** — The physical primitive. In one uninterrupted step, it binds the relation between expected and replacement, applys the comparison and conditional swap, and evals the old value.

## B

**bind** — The first primitive. Creates a knot — a bidirectional pair between two items. Categorically a Monad.

**Blob** — The 65536-bit truth table. The minimum boolean truth table for 16 binary choices. The -5D substrate.

**BOUNDRY** — The type of the constraint result. Either `[SPECTRAL, SPATIAL]` (the nested reading) or `COORDINATE` (the cube reading).

## C

**COORDINATE** — The eight-slot cube reading. `[SPECTRAL, SPATIAL, SHAPE, SCALAR?]`.

**CONTINUUM** — The position array `[p: number, i: number, n: number]`.

**CONSTRAINT** — The function `(spectrum: TIME, space: SPACE | CONTINUUM) => BOUNDRY`.

## D

**delta** — The transform `delta16(x, c) = rotl16(x, 1) ^ rotl16(x, 3) ^ rotr16(x, 2) ^ c`. Has exact period 8.

**digest** — The fourth primitive. Computes the generalized F-mean of the ruler. The read-eval-print loop.

## E

**eval** — The third primitive. Reads a knot as a value descriptor, extracting its materialized meaning. Categorically a Comonad.

## F

**F-mean** — The generalized mean `M_p(x_1, ..., x_n) = ( (1/n) Σ x_i^p )^(1/p)`. The mean order p is determined by the observer's position.

**Fano plane** — The 7-point projective plane over GF(2). The minimal structure in which every pair of points is on a line.

## G

**G** — The regex-constrained vocabulary. The symbol table that defines the admissible tokens.

## H

**Homoiconic** — Code is data. The knot is both a program and a value.

## I

**iff** — The base equivalence. `position(n) ⟺ period(n−1, n, n+1)`. The position holds iff the period holds.

## K

**knot** — A bidirectional pair between two items. `knot[a] = b ⟺ knot[b] = a`.

## L

**logical loop** — The orbit of a base under XOR with n = 0..15. A cycle of length 16 that exists as a mathematical fact of XOR being an involution.

## M

**mnemonic** — The word frame. The human-readable label for a position.

## O

**observer** — Any circulator capable of reflecting swap rotations. A perceptron.

**orbit** — The sequence `c ^ n` for `n = 0..15`. A cycle of length 16.

## P

**pinch** — The 0-sphere. Two points.

## R

**RULER** — The function `(boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE, COORDINATE]`.

**RULE** — The function `(boundry: BOUNDRY, constraint: CONSTRAINT) => [COORDINATE]`.

## S

**SCALAR** — The reading `[e: FRONT | BACK, d: UP | DOWN, n: LEFT | RIGHT]`.

**SHAPE** — The eight-slot cube reading `[POINT, INDEX, FRONT, BACK, UP, DOWN, LEFT, RIGHT]`.

**SPACE** — The position array `[b: number, o: number, x: number]`.

**SPECTRAL** — The reading `[p: number, i: number]`.

**SPATIAL** — The reading `[b: number, o: number, x: number, e: number, d: number, n: number]`.

**STRUCT** — The full wordform `${number}${'e' | '.'}${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'}`.

## T

**TIME** — The position array `[e: number, d: number]`.
