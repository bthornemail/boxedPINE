---
id: SPEC-55
title: "ASCII Folds and Separators"
kind: spec
layer: runtime
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-50 Stream Transport]]"
down: []
related:
  - "[[SPEC-50 Stream Transport]]"
  - "[[SPEC-51 JSON Canvas Interchange]]"
  - "[[SPEC-52 The REPL and the Digest]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-54 The Web Platform Layers]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code: []
dimensions: []
symbols: []
tags: [omi-imo, ASCII, folds, separators, control-codes, 0x1C, 0x0C]
---

# ASCII Folds and Separators

## The ASCII Table

```
Stick 0: 0x00–0x1F (32 control codes)
Stick 1: 0x20–0x3F (32 codes)
Stick 2: 0x40–0x5F (32 codes)
Stick 3: 0x60–0x7F (32 codes)
```

Four sticks of 32. And 4 × 32 = 128 = 2⁷.

## The Fold at 0x1C

The four face separators:

```
0x1C = FS (File Separator)
0x1D = GS (Group Separator)
0x1E = RS (Record Separator)
0x1F = US (Unit Separator)
```

These four are the four tetrahedral vertices. And they're the operators that fold the control stick into the printable range.

And 0x1C = 28 = 16 + 12 = the 16-bit base plus the 12-bit offset.

So the fold happens at 0x1C because 0x1C = 28 = 16 + 12, and 12 is the 12D (the cascade top).

## The Fold at 0x0C

0x0C = 12 = Form Feed. And 12 is also the 12D.

And 0x0C is in the first half of the control stick (0x00–0x0F).

So 0x0C and 0x1C are both fold points:

```
0x0C = 12 = Form Feed = the first fold (in the first half)
0x1C = 28 = File Separator = the second fold (in the second half)
```

And 0x0C + 16 = 0x1C. So the two folds are 16 apart.

And 16 + 16 = 32. So the two folds are exactly the two 16-blocks of Stick 0.

## The Pattern in Full

```
16 → 32 → 32 → 32 → 16
```

And this is:

```
Stick 0 first half (16)
Stick 1 (32)
Stick 2 (32)
Stick 3 (32)
Stick 0 second half (16)
```

And the fold points are:

```
0x0C (12, Form Feed) — folds the first half of Stick 0
0x1C (28, File Separator) — folds the second half of Stick 0
```

And the pattern starts and ends at 16, with three 32s in between.

And 16 + 32 + 32 + 32 + 16 = 128 = 2⁷ = the full earned surface.

## The 16-32-32-32-16 as the Fold

The fold goes:

```
16 → 32 → 32 → 32 → 16
```

And 32 × 3 = 96. Plus 16 + 16 = 128. And 128 = 2⁷ = the earned surface size.

So the pattern is:

```
Start: 16
Middle: 32, 32, 32 (three 32s)
End: 16
Total: 16 + 96 + 16 = 128
```

And 128 = 2⁷ = the full earned surface.

## The Three 32s

Three 32s. And 32 × 3 = 96. And 96 is:

- The earned_surface_sizes meta boundary cumulative size
- The 0x60 in ASCII (backtick)
- The 96 characters in printable ASCII (0x20–0x7F)

So the three 32s are the printable ASCII (96 characters).

And the 16 on each side is the first 16 (control codes 0x00–0x0F) and the last 16 (control codes 0x10–0x1F).

So the fold is:

```
First 16 control codes (0x00–0x0F)
    ↓
Three 32-blocks (the printable ASCII split into three)
    ↓
Last 16 control codes (0x10–0x1F)
```

And 16 + 96 + 16 = 128 = the full byte space (0x00–0x7F).

## The Connection to the Forms

The two forms (Form 1 = 3, Form 2 = 5) generate the whole structure.

And the fold:

```
16 → 32 → 32 → 32 → 16
```

Has 16 at the ends and 32 in the middle. And 16 = 2⁴, 32 = 2⁵.

So the fold is: 2⁴ → 2⁵ → 2⁵ → 2⁵ → 2⁴.

And 2⁴ = 16, 2⁵ = 32.

And 2⁴ is the index count (16 indices).

And 2⁵ is the word size (32 bits = 4 bytes).

So the fold is: index count → word size → word size → word size → index count.

The three word sizes in the middle are the three printable sticks.
