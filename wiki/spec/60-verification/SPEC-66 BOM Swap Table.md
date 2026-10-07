---
id: SPEC-66
title: "BOM Swap Table and Reference Operations"
kind: spec
layer: verification
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[SPEC-62 Sexagesimal XOR Delineation]]"
  - "[[SPEC-64 Three Cubes]]"
  - "[[SPEC-65 Hamming Code Delta]]"
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-33 The Quadratic Forms]]"
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
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/model.ts"
  - "rosetta/src/constants.ts"
  - "rosetta/src/bind.offset.ts"
dimensions: []
symbols: []
tags: [omi-imo, BOM, swap, reference, operations, get, set, catch, bind, apply, eval, digest]
---

# BOM Swap Table and Reference Operations

## The Top 8 as the Operation Set

The top 8 of the 16 bytes are the reference operations:

```
8     buffer         the current reference
9     get            read the current position
10    set            write the current position
11    catch          handle the failure
12    bind           build the relation
13    apply          invoke the relation
14    eval           extract from the relation
15    digest         fold the relations
```

Eight slots. Eight operations. And they occupy the top half of the 16-byte ruler.

And the bottom 8 are the spatial subarray — the reference literal, the spatial 8.

So the ruler splits:

```
0-7      the spatial subarray      the reference literal, the 8-byte spatial
8-15     the reference operations  the eight operation slots
```

Eight and eight. Sixteen total. And the fold is between them.

## The Fold Between Them

And the fold is the delta:

```
delta(state, C) = xor(xor(xor(rotl(state, 1), rotl(state, 3)), rotr(state, 2)), C)
```

Where state is the bottom 8 and C is the top 8. And the result is the new state. And then the halves swap.

So each cycle:

1. Read the bottom 8 (spatial) and top 8 (operations)
2. Compute the delta (Hamming code)
3. Write the delta into the bottom 8 (new spatial)
4. Write the old spatial into the top 8 (new operations)
5. Return the ruler

The spatial subarray moves through the operation set, and the operation set moves through the spatial subarray. One step per cycle. Period 8.

## The Seven Operations

And the eight operations in the top half:

```
8     buffer         the current reference
```

Slot 8 is not an operation. It is the current reference — the buffer itself. So slot 8 is the identity of the operations. It's the "what is being operated on."

And slots 9-15 are the seven operations:

```
9     get            read the current position
10    set            write the current position
11    catch          handle the failure
12    bind           build the relation
13    apply          invoke the relation
14    eval           extract from the relation
15    digest         fold the relations
```

Seven operations, one identity. Eight total.

## Why Seven Operations

Because there are three access operations and four protocol operations:

```
ACCESS      get, set, catch                 three
PROTOCOL    bind, apply, eval, digest        four
TOTAL                                         seven
```

And the seven plus the identity is eight. And eight is 2³. So the eight slots are the three-bit operations:

```
bit 0    access or protocol
bit 1    read or write      (for access)
bit 2    bind, apply, eval, or digest  (for protocol)
```

Or more simply: the eight slots are the eight values of a three-bit code, and each one names an operation.

## The Bottom 8 as the Spatial Subarray

And the bottom 8 is the spatial subarray:

```
0     diagonal        the frame condition
1     size            the precision
2     top             spatial
3     bottom          spatial
4     right           spatial
5     left            spatial
6     forward         spatial
7     backward        spatial
```

Eight slots. Eight spatial positions. And the spatial positions are the reference literal — the literal positions of the spatial frame.

So:

```
0-7      the spatial subarray      the reference literal
8-15     the reference operations  the top 8
```

## The Frame Markers

And the 0, 7, 15 at the bottom of the code is the frame markers:

```
0      the low boundary       the start of the spatial subarray
7      the midpoint           the fulcrum of the spatial subarray
15     the high boundary      the end of the operations set
```

Three markers. And they bound the ruler:

```
0      →  start of spatial subarray
7      →  end of spatial subarray / start of the fold
15     →  end of operations set
```

So 0 and 15 are the outer boundaries of the 16-byte ruler, and 7 is the inner boundary between the two halves.

And the fold is between 7 and 8. The bottom 8 is 0-7, the top 8 is 8-15, and the boundary is between them.

## The REFERENCE Type

```typescript
type REFERENCE = (declaration: RegExp, definition: string) => Point
```

A reference takes a regex and a string, and returns a Point. So the reference is:

```
declaration    the regex           the constraint
definition     the string          the value
→ Point        the resulting position
```

And Point has four references:

```typescript
class Point {
    Point: number = 0;
    Index: number = 0;
    Number: number = 0;
    bind: REFERENCE = function Bind() { };
    apply: REFERENCE = function Apply() { };
    evaluate: REFERENCE = function Evaluate() { };
    digest: REFERENCE = function Digest() { };
}
```

Four references on every Point. Each one is a protocol operation that takes a regex and a string and returns a Point.

So a Point is not just a position. It is a position that can perform the four operations. Bind, apply, evaluate, digest.

## The Seven Operations as One Operation

Because each one takes the same shape:

```
get(state, index)              → value
set(state, index, value)       → value
catch(error, handler)          → result
bind(declaration, definition)  → Point
apply(declaration, definition) → Point
eval(declaration, definition)  → Point
digest(declaration, definition)→ Point
```

Every one is (something, something) → result. And the result is either a value, a failure, or a Point.

So the seven are the same operation at seven different levels:

```
get          read the current position
set          write the current position
catch        handle the failure
bind         build the relation
apply        invoke the relation
eval         extract from the relation
digest       fold the relations
```

Same shape. Different role. And the role is determined by the declaration — the regex — and the definition — the string.

## The Class Hierarchy as the Scope Chain

```
Point            the base — point, index, number, four references
Circle           adds centroid and radius
Triangle         adds X, Y, Z                (three swap sets)
Square           adds six faces
Tetrahedron      adds four radices
Simplex          adds two exceptions
Structure        adds Expression, Error, Exit, Escape
```

And each class extends the previous one, so each class has access to all the fields and methods of its ancestors. That's the scope chain.

And the Shape class contains the get, set, catch access. So the Shape is the access layer, and the Point is the protocol layer, and the higher classes are the frame layers.

## The X, Y, Z Methods as Swap Sets

And the X, Y, Z methods are the swap sets:

```
X     swaps {0, 1, 2} + frame check     the middle set
Y     swaps {3, 7, 11, 15}              the four-block family
Z     swaps {17, 19}                     the 5-bit bases
```

Each method applies a set of swaps (BOM permutations) to the omi buffer. And the swap is the byte order mark — the mark that says which reading of the 16 is active.

## The Source, Stream, Substrate

```
Source      input, output, bytes
Stream      reader, writer, buffer
Substrate   length, offset, base
```

Three classes, each with a 16-byte buffer. And each one is a substrate — a place where the bytes live.
