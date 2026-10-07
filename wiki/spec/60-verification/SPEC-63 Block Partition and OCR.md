---
id: SPEC-63
title: "Block Partition and OCR"
kind: spec
layer: verification
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down: []
related:
  - "[[SPEC-62 Sexagesimal XOR Delineation]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-35 Reflections and Orbits]]"
  - "[[SPEC-55 ASCII Folds]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, block, partition, OCR, magic-number, shebang, knots, spatial]
---

# Block Partition and OCR

## The Four Blocks as a Partition

```
BLOCK_0    /^[<=>?]$/     60-63    < = > ?
BLOCK_1    /^[89:;]$/     56-59    8 9 : ;
BLOCK_2    /^[4567]$/     52-55    4 5 6 7
BLOCK_3    /^[0123]$/     48-51    0 1 2 3
```

Four blocks. Each one four printable ASCII characters. Each one a contiguous run. And the four together cover 48-63 (0x30-0x3F).

## Block 0 as the Magic Number

A magic number is the first few bytes of a file that identify its format. `#!/bin/sh` is a shebang. `0x7F E L F` is the ELF magic. `%PDF` is the PDF magic.

And Block 0 is `/^[<=>?]$/` — the four characters `< = > ?`. Those are:

```
<      less than          the comparison operators
=      equal
>      greater than
?      the ternary        the question mark
```

Four comparison operators. And a comparison is exactly what a magic number is — it's a comparison against a pattern. The magic number says "does the file start with these bytes?" and the answer is a comparison.

So Block 0 is the comparison block — the block where comparisons happen. And comparisons are what magic numbers are made of.

## Block 0 as the Knot Reference

A knot in the protocol is the relation between a rule and a ruler:

```
knot[rule] = ruler
knot[ruler] = rule
```

It's a symmetric pair. And the knot is where the binding happens.

And Block 0 is `<=>?`. Those characters are:

```
<      the left arrow        the relation "less than"
=      the equals            the relation "equal"
>      the right arrow       the relation "greater than"
?      the question          the relation "is this?"
```

Four relations. And a knot is a relation. So Block 0 is the block of relations — the knots.

## The Other Three Blocks as Spatial Delineation

```
BLOCK_1    8 9 : ;      the high digits and low punctuation
BLOCK_2    4 5 6 7      the middle digits
BLOCK_3    0 1 2 3      the low digits
```

Three blocks. Each one a set of digit characters. And digits are the spatial positions — the indices.

So the partition is:

```
BLOCK_0    the relations       the knots
BLOCK_1    high digits         the upper spatial
BLOCK_2    middle digits       the middle spatial
BLOCK_3    low digits          the lower spatial
```

Four blocks. One for the knots, three for the spatial. That's the partition.

## The OCR Partition

OCR reads printed characters. But the partition is for non-printing characters — the ones that don't display. And the four blocks are the partition of the non-printing character space:

```
48-63     the ASCII range where the digits and comparison operators live
0-47      the control codes
64-127    the printable letters and punctuation
128-255   the extended ASCII
```

So 48-63 is one partition of the full ASCII range. And within it, the four blocks are further partitions:

```
Block 0    the comparison operators      the OCR sees them as "shapes"
Block 1    the high digits + low punct   the OCR sees them as "digits"
Block 2    the middle digits              the OCR sees them as "digits"
Block 3    the low digits                 the OCR sees them as "digits"
```

And the OCR's job is to classify each character into one of the four blocks. That's the partition.

## The 0x30 to 0x3F Range

And the whole range is 0x30 to 0x3F. That's the digit range of the ASCII table, plus the four comparison operators. And it's the range where the printable digits live.

And the blocks are:

```
0x30-0x33     0 1 2 3       Block 3
0x34-0x37     4 5 6 7       Block 2
0x38-0x3B     8 9 : ;       Block 1
0x3C-0x3F     < = > ?       Block 0
```

Four blocks. Each one four characters. And each one a shape class.

## The Connection to the Wordforms

The partition is the same structure as the old `/pinEboxed/` wordforms:

```
/0[pin]/       the three literals     point, index, number
/0[boxd]/      the four radices       binary, octal, hex, decimal
/0[pine]/      pin with e             the casket joke
/0[boxed]/     boxd with e            the boxed position
```

And the equality:

```
/0[pin]/ = /0[boxd]/
/0[pine]/ = /0[boxed]/
```

The pin equals the boxd. And the e cancels.

And those wordforms partition into blocks:

```
pin      three literals       block partition by letter
boxd     four radices         block partition by radix
pine     pin with e           block 0 territory
boxed    boxd with e          block 0 territory
```

So the pin/boxd wordforms are the same structure as the four blocks. And the partition is on the letters.
