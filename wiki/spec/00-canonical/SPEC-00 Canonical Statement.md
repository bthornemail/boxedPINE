---
id: SPEC-00
title: "Canonical Statement"
kind: spec
layer: meta
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down:
  - "[[SPEC-01 The Three Laws]]"
  - "[[SPEC-02 Conformance Criteria]]"
  - "[[SPEC-03 Notation OMI-Lisp]]"
related:
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-20 The Dimensional Axis]]"
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-52 The REPL and the Digest]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/index.ts"
  - "rosetta/src/constants.ts"
  - "rosetta/src/model.ts"
  - "rosetta/src/bind.offset.ts"
dimensions: []
symbols: []
tags: [omi-imo, canonical, statement]
---

# Canonical Statement

> The data doesn't change. The observer's interpretation changes based on the point of view they infer from.

## The Protocol

The OMI-IMO protocol is an **Atomic Compare-and-Exchange Lisp**.

| Property | Value |
|----------|-------|
| Primitive | `Atomics.compareExchange` |
| Base | the iff |
| Structure | the 2! and 3! orthogonal groups |
| Space | the 2¹⁶ Blob |
| Observers | circulators reflecting swaps |
| Behavior | time crystals (period 240) |
| Resolution | O(1) |
| Closure | reachability |

## The Five Entities

The standard model defines five entities:

| Entity | Role |
|--------|------|
| Buffer | the substrate |
| Ruler | the named k-tuple |
| Regex set | the vocabulary constraint |
| F-mean | the significance measure |
| Digest | the operation |

## The Regex-Constrained Vocabulary

The regex-constrained vocabulary (G) defines the admissible tokens:

```typescript
const G = Object.freeze({
    FRONT:     /^[A-Za-z0-9:+]$/,
    BACK:      /^[A-Za-z0-9.-]$/,
    INSIDE:    /^[A-Za-z0-9_]$/,
    OUTSIDE:   /^[^A-Za-z0-9_]$/,
    UP:        /^[A-Z_]$/,
    DOWN:      /^[a-z_]$/,
    DEFLECT:   /^([^".]+):\1$/,
    REFLECT:   /^([".]+):\1$/,
    INFLECT:   /^([".]+):([".]+):\2:\1$/,
    AXIS:      /^(\d\d)[A-Za-z_](\d\d):\2[0-9+\-]\1$/,
    MNEMONIC: /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/,
    PALINDROME:/^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/
});
```

## The Constraints

```
token matches G.X        →   token admissible
M_p(ruler) = v           →   ruler admissible
```

Both constraints must hold.

## The Iff

The base equivalence is:

```
position(n)            ⟺     period(n−1, n, n+1)
```

The position holds iff the period holds. Neither can exist without the other.

The 2! is the iff:

```
2!    =       2   =     the two sides of the iff
                         ├── position
                         └── period
```

The 3! is the operations:

```
3!    =       6   =    the six operations, read through the iff
```

The n±1 is the local neighborhood:

```
n−1       →    the before
n         →    the now
n+1       →    the after
```

## The Parity Pattern

```
n:                0      1     2    3    4    5    6    7     8      9        ...
parity:           e      O     e    e    e    O    e    e     e      O        ...
```

Odd at n ≡ 1 mod 4.

The odd is both a position (at n) and a period (the n±1 transition).

## The Four Atomics

```
{0, 2, 1}         →     swap 2 and 1
{2, 1, 0}         →     reverse
{1, 0, 2}         →     cycle
{0, 1, 2}         →     identity
```

Four permutations. Four atomic operations.

The extremes:

```
012   →   forward (identity)
210   →   reverse
```

## The Spatial Structure

The protocol spans 16 dimensions:

```
-5D   →   the Blob
-4D   →   color codex
-3D   →   linear
-2D   →   hierarchical
-1D   →   classifying
 0D   →   observer (BOM)
 1D   →   DOMPoint
 2D   →   Media Track
 3D   →   DOMRect
 4D   →   DOMMatrix
 5D   →   DOMElement
 6D   →   Canvas
 7D   →   Event Loop
 8D   →   Byte Basis
 9D   →   Network Mesh
10D   →   Orchestrator
```

Sixteen dimensions. 2¹⁶ = 65536.

The Blob is 65536 — the minimum boolean truth table for 16 binary choices. It is derived from a 16-bit buffer by recursive folding of an 8-bit subarray using central inversion and snubbed truncation.

## The Schläfli Families

```
{2,n}:{n,2}         →   constant 2
{2,4}:{4,2}         →   constant 4
{3,5}:{5,3}         →   constant φ → 60
```

The quasi-generator: the 3! generates the families via subset selection of its 6 elements.

The constants:

```
π     →   forced by SO(2)
φ     →   forced by H₃
2     →   forced by Z/2
```

## The Tetrahedral Structure

```
4 vertices     →     Subject
6 edges        →     Predicate
4 faces        →     Object

4-6-4     =   S-P-O
```

## The Pinch and the Towers

The pinch:

```
S⁰   →    the 0-sphere   →   two points     →    the pinch
```

The Hopf fibrations:

```
S⁰   →    S¹   →   S¹
S¹   →    S³   →   S²
S³   →    S⁷   →   S⁴
S⁷   →    S¹⁵ →    S⁸
```

The Cayley-Dickson tower:

```
ℝ ⊂ ℂ ⊂ ℍ ⊂ 𝕆 ⊂ S₁₆ ⊂ S₃₂ ⊂ S₆₄
```

Caps at 64-ion level. The Hopf cap is at 8.

## The Primes

The prime sextuplet:

```
{5, 7, 11, 13, 17, 19}
```

The path:

```
2, 4, 0, 4, 2
```

The two principles:

```
Prime gap measurements:       magnitude, type
Prime groups:                 residue classes {1, 3, 7, 9} mod 10
```

Prime vs composite:

```
Prime           →   atomic operations (bitwise)
Composite       →   structured operations (logic)
```

## The Tetrahedral Diagonals

The tetrahedral numbers:

```
T(n) = C(n+2, 3)
```

The parity pattern:

```
even, odd, even, even, even, odd, even, even, even, odd, ...
```

Period 4. Odd at n ≡ 1 mod 4.

The 240:

```
T(8) = 120 = 5!
240 = 2 × 120
```

## The Coordination

The operation is multiplexed compare-and-exchange through spatial reference.

The four steps:

```
locate   →      find the current coordinate
select   →      determine the active channel
swap     →      perform the atomic operation
advance →       move to the next coordinate
```

The Transylvania Lottery: the minimum connection is 2 of 5 or 3 consecutive. The 0D observer always connects.

The bound: the resolution is < 14 steps, bounded by the Fano structure.

## The Observer

Definition: An observer is any circulator capable of reflecting swap rotations.

Every mnemonic observer is a perceptron. Mnemonic is input; local frame is weights; reading is output.

Observers form a network via tangent relationships. The network is the state space.

The canonical spectrum of observers:

```
-3D to 10D (14 levels) — the canonical range
-5D to 12D (18 levels) — the max encapsulation range
```

At every level, observers exist and interact.

## The Propagation Asymmetry

```
Forward propagation:           cubic, O(n³)
Back-propagation:              linear, O(n)
```

The protocol optimizes for backward. Linear convergence is what makes it practical.

```
Bitwise    →   parallel   → cubic → propagation
Logic      →   sequential → linear → back-propagation
```

## The Four Readings

All four describe the same structure:

```
Lisp on sets
Horn clause
Calculus of constructions
Prime-composite
```

## The Normalization

The computational space is predefined to normalize analog to digital:

```
Sample → Quantize → Encode → Digital value in 65536 space
```

Normalization is why the protocol exists. All readings describe it.

## The Web Environment

The Composed System. The protocol's runtime is the composition of seven layers:

```
HTTP/1.1                   →   wire carrier (transport)
Regex constraints          →   token grammar (admissibility)
DOM geometry               →   spatial projection (position, extent)
Hit lists                  →   interpolation anchors (semantics)
PannerNode                 →   0D transparent translation (observability)
Blobs as media             →   the substrate for the canvas
Worklets + polyfills       →   execution contexts (browser and Node)
```

Each layer speaks to the next through a standard interface. None knows about the others' internals.

## The Infinite Canvas Kaleidoscope

The web becomes an infinite canvas kaleidoscope:

```
The canvas is the ruler, unbounded, universal
The kaleidoscope is the swap mechanism, reflecting knots into readings
The observer is the eyepiece, at any point
The view is the materialized reading at that point
Movement is swap application
Coordination is compareExchange on positions
```

The point of view is any point in view. Every point is a potential observer. Every observer sees the same underlying structure from its own angle.

The reflections never stop. The canvas never ends. The observer is always somewhere, always seeing something.

## The Shape

```
Protocol            three primitives, no hardcoded variables
Substrate           standard web primitives, all orthogonal
Observers           circulators, perceptrons, mnemonics
Interpolation       hit lists, generalized ladders
Composition         DOMMatrix cubes, concentric and cubic
Execution           any bit length, any environment
Applications        personal projects
```

Five levels. One protocol. Zero closed surfaces.

The protocol carries structure. Meaning is assigned by implementations. Two peers that agree on the protocol agree on the structure of every possible message, but not on what any particular message means.

That is the whole thing.
