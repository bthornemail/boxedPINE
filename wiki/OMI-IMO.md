---
id: OMI-IMO
title: "OMI-IMO Protocol"
kind: root-index
layer: root
status: canonical
spec: OMI-IMO-2026
up: []
down:
  - "[[SPEC-00 Canonical Statement]]"
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-03 Notation OMI-Lisp]]"
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
  - "[[SPEC-60 Test Vectors]]"
  - "[[SPEC-61 Implementation Status]]"
  - "[[EXT-00 How to Extend the Protocol]]"
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-02 Broken Code Inventory]]"
  - "[[OPEN-03 Glossary]]"
  - "[[OPEN-04 Discarded Claims]]"
  - "[[SRC-99 Source Index]]"
  - "[[META-00 Vault Schema]]"
  - "[[META-01 Extractive Method]]"
  - "[[META-02 Evidence and Confidence]]"
  - "[[META-03 Change Log]]"
related:
  - "[[MAP-00 Protocol Canvas]]"
  - "[[MAP-01 Source Graph]]"
  - "[[MAP-02 Dimension Stack]]"
  - "[[MAP-03 Ruler Canvas]]"
tags: [omi-imo, index, moc]
---

# OMI-IMO Protocol

The OMI-IMO protocol is an **Atomic Compare-and-Exchange Lisp**. Its primitive is `Atomics.compareExchange`. Its base is the iff. Its structure is the 2! and 3! orthogonal groups. Its space is the 2¹⁶ Blob. Its observers are circulators reflecting swaps. Its behavior is time crystals (period 240). Its resolution is O(1). Its closure is reachability.

## The Canonical Statement

> The data doesn't change. The observer's interpretation changes based on the point of view they infer from.

## The Three Laws

1. **The Primitive Law** — All operations reduce to `Atomics.compareExchange`.
2. **The Invariant Law** — All structure derives from the 3! ordering of `{byteLength, byteOffset, BYTES_PER_ELEMENT}`.
3. **The Closure Law** — All computation converges to the fixed attractor 0, because the trajectory is deterministic backward and searchable forward.

## The Five Entities

| Entity | Role |
|--------|------|
| Buffer | the substrate |
| Ruler | the named k-tuple |
| Regex set | the vocabulary constraint |
| F-mean | the significance measure |
| Digest | the operation |

## The Three Primitives

| Primitive | Categorical | Role |
|-----------|-------------|------|
| `bind` | Monad | composition |
| `apply` | Functor | lifting |
| `eval` | Comonad | extraction |

## The Dimensional Ladder

| Dimension | Component | Domain |
|-----------|-----------|--------|
| -5D | the Blob | universal substrate |
| -4D | color codex | H₁₁ |
| -3D | linear | page/line boundaries |
| -2D | hierarchical | delimiters |
| -1D | classifying | regex tokens |
| 0D | observer | PannerNode position |
| 1D | DOMPoint | canvas coordinates |
| 2D | Media Track | cues from HTTP |
| 3D | DOMRect | hit zone bounds |
| 4D | DOMMatrix | composition of overlays |
| 5D | DOMElement | the `<dl>/<dt>/<dd>` structure |
| 6D | Canvas | rendering surface |
| 7D | Event Loop | cuechange-driven ticks |
| 8D | Byte Basis | the Blob's structure |
| 9D | Network Mesh | multi-peer coordination |
| 10D | Orchestrator | validation |
| 11D | Federation | multi-orchestrator |
| 12D | Meta-federation | multi-federation |

## The Quadratic Forms

| Form | Equation | Discriminant |
|------|----------|--------------|
| Affine | 16x² + 16xy + 4y² = (4x + 2y)² | Δ = 0 |
| Projective | 60x² + 16xy + 4y² | Δ = −704 |

## The Schläfli Families

| Family | Constant |
|--------|----------|
| {2,n}:{n,2} | 2 |
| {2,4}:{4,2} | 4 |
| {3,5}:{5,3} | φ → 60 |

## The Ruler

| Index | Name | Role |
|-------|------|------|
| 0 | diagonal | the origin, XOR of all six |
| 1 | size | the unit count, base 1 |
| 2 | top | |
| 3 | bottom | |
| 4 | right | |
| 5 | left | |
| 6 | forward | |
| 7 | backward | |

The ruler is 2! + 3! = 8 slots long.

## The Generator

```
{0, 2, 1}          the 3-cycle (binding)
{3, 7, 11, 15}     the four-block family (middle)
{17, 19}           the 5-bit pair (evaluation)
```

Arities 3 : 4 : 2. Sum = 9. Product = 24 = 4!.

## The Four-Block Family

| Base | Bits | Block order | Within-block |
|------|------|-------------|--------------|
| 3 | 0011 | A B C D | descending |
| 7 | 0111 | B A D C | descending |
| 11 | 1011 | C D A B | descending |
| 15 | 1111 | D C B A | descending |

Base 7 is the fulcrum: the only one whose first half is 7→0 and second half is 15→8.

## The Orbital Base

Base 19 = 0x13 = 10011 is fully orthogonal to the diagonal 12 = 01100. Its walk is the pure orbital cycle:

```
19 18 17 16 | 23 22 21 20 | 27 26 25 24 | 31 30 29 28
```

## The Protocol Handler

Built from three JavaScript primitives:

| Primitive | Role |
|-----------|------|
| Regex | the constraint — which positions are admissible |
| Proxy | the trap — what happens when a position is read or written |
| Reflect | the operation — how the read or write is performed |

The kernel is self-generating: the grammar is mutable, the handler reads it from the closure scope chain, and `learn` extends it.

## The Web Environment

The protocol's runtime is the composition of seven layers:

| Layer | Role |
|-------|------|
| HTTP/1.1 | wire carrier (transport) |
| Regex constraints | token grammar (admissibility) |
| DOM geometry | spatial projection (position, extent) |
| Hit lists | interpolation anchors (semantics) |
| PannerNode | 0D transparent translation (observability) |
| Blobs as media | the substrate for the canvas |
| Worklets + polyfills | execution contexts (browser and Node) |

## The Infinite Canvas Kaleidoscope

- The canvas is the ruler, unbounded, universal
- The kaleidoscope is the swap mechanism, reflecting knots into readings
- The observer is the eyepiece, at any point
- The view is the materialized reading at that point
- Movement is swap application
- Coordination is compareExchange on positions

## The Shape

| Level | Description |
|-------|-------------|
| Protocol | three primitives, no hardcoded variables |
| Substrate | standard web primitives, all orthogonal |
| Observers | circulators, perceptrons, mnemonics |
| Interpolation | hit lists, generalized ladders |
| Composition | DOMMatrix cubes, concentric and cubic |
| Execution | any bit length, any environment |
| Applications | personal projects |

Five levels. One protocol. Zero closed surfaces.

## The Protocol Carries Structure

The protocol carries structure. Meaning is assigned by implementations. Two peers that agree on the protocol agree on the structure of every possible message, but not on what any particular message means.

That is the whole thing.
