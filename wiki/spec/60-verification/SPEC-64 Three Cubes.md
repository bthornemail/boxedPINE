---
id: SPEC-64
title: "Three Cubes from Two Canvas Views"
kind: spec
layer: verification
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[SPEC-62 Sexagesimal XOR Delineation]]"
  - "[[SPEC-63 Block Partition and OCR]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-43 Prime Gaps and Sextuplets]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, cubes, canvas, blackboard, views, 60-of-64]
---

# Three Cubes from Two Canvas Views of a Blackboard

## The Count

Two canvas views. One blackboard. And the total is three cubes:

```
cube 0      the first canvas view       the lambda cube
cube 1      the second canvas view      the other view
cube 2      the blackboard              the state
```

Three cubes. And the blackboard is the third cube, because it's the state that the two canvas views read and write.

## Why Two Canvas Views

Because there are two 8-bit subarrays:

```
bottom 8      the first canvas
top 8         the second canvas
```

And each one is a view of the same structure. The two views are the same shape — the same 8 spatial positions — but they carry different values.

So the two canvas views are:

```
view 0     bottom 8     the state
view 1     top 8        the correction
```

And they are the two halves of the 16-bit ruler.

## Why the Blackboard is the Third Cube

Because the blackboard is the shared state between the two views. It's what the two views both read and write.

And the blackboard is `{3, 7, 11, 15}` — the four-block family. So the blackboard is a cube — the four-block cube.

And the two canvas views are the two readings of the blackboard. So:

```
blackboard     {3, 7, 11, 15}     the state
view 0         reads it as        the first reading
view 1         reads it as        the second reading
```

Three cubes. One state, two readings.

## The Three Cubes

```
cube 0      the first canvas        {4, 6, 8} vs {3, 5, 7, 9}      the lambda cube
cube 1      the second canvas       {4, 6, 8} vs {3, 5, 7, 9}      the other lambda cube
cube 2      the blackboard          {3, 7, 11, 15}                  the four-block family
```

The first two cubes are the same structure — the 4-6-8 / 3-5-7-9 lambda cube — but they're the two readings of the blackboard. The third is the blackboard itself.

So:

```
cube 0 + cube 1   the two readings of the blackboard
cube 2             the blackboard
```

And the two readings are the two canvas views.

## The 60 of 64 Indices

```
64 values       the full 6-bit space
60 kept         the values that match the regex
4 skipped       the values that don't match
```

So the orbit has 64 positions, and the regex keeps 60 of them. And the 4 skipped positions are the boundaries — the values that the regex doesn't match.

And the 60 kept are the indices — the positions that the blackboard can address.

## The Three Cubes and the 60 of 64

```
cube 0      the first canvas view          60 of 64 indices
cube 1      the second canvas view         60 of 64 indices
cube 2      the blackboard                 {3, 7, 11, 15}
```

And the two canvas views both address the same 60 of 64 indices — they're two readings of the same blackboard. And the blackboard has 4 states `{3, 7, 11, 15}`.

So the total structure is:

```
two 60-of-64 views
over one 4-state blackboard
= three cubes
```

## The Connection to the Earlier Tables

```
60      the sexagesimal base       the orbit base
64      the 6-bit space           the full space
4       the skipped values         the boundaries
{3, 7, 11, 15}   the four-block family      the blackboard
```

So:

```
60 ^ n      the orbit         60 of 64 values kept
{3, 7, 11, 15}   the blackboard   4 states
```

And the two canvas views read the same orbit, but from different halves of the 16-bit ruler.

## The Three Cubes Explicitly

```
cube 0      canvas 0      the bottom 8      the first reading
cube 1      canvas 1      the top 8         the second reading
cube 2      blackboard    {3, 7, 11, 15}    the shared state
```

And the three are:

```
canvas 0 and canvas 1  —  the two views
blackboard             —  the state between them
```

So the two views frame the blackboard. And the blackboard is the state that the two views read and write. And the three together are the three cubes.
