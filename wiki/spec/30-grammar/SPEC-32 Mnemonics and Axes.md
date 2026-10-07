---
id: SPEC-32
title: "Mnemonics, Axes, and Palindromes"
kind: spec
layer: grammar
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-30 The Symbol Table G]]"
down: []
related:
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
  - "[[SPEC-35 Reflections and Orbits]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
code:
  - "rosetta/src/constants.ts"
dimensions: []
symbols:
  - "AXIS"
  - "MNEMONIC"
  - "PALINDROME"
tags: [omi-imo, mnemonics, axes, palindromes, wordform, grammar]
---

# Mnemonics, Axes, and Palindromes

## The AXIS Pattern

From `rosetta/src/constants.ts`:

```typescript
const AXIS = /^(\d\d)[A-Za-z_](\d\d):\2[0-9+-]\1$/;
```

The AXIS pattern matches a 4-part structure:

```
\d\d        two digits (the coordinate)
[A-Za-z_]   a letter (the axis)
\d\d        two digits (the coordinate)
:           the separator
\2          the axis (backreference)
[0-9+-]     a sign or digit
\1          the first coordinate (backreference)
```

## The MNEMONIC Pattern

```typescript
const MNEMONIC = /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/;
```

The MNEMONIC pattern matches:

```
\d\d            two digits (the coordinate)
[A-Z_]?[a-z_]+  an optional uppercase letter followed by lowercase letters
\d\d            two digits (the coordinate)
:               the separator
\3              the second coordinate (backreference)
\2              the word (backreference)
\1              the first coordinate (backreference)
```

## The PALINDROME Pattern

From the synthesis:

```typescript
PALINDROME: /^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/
```

**Note:** The PALINDROME pattern is referenced in the synthesis but is NOT present in the actual `G` object in `rosetta/src/constants.ts`. This is a bug — the pattern is declared in the type but not in the implementation.

## The Word Frame

The mnemonic is the word frame. It is the human-readable label for a position. The position is the numeric coordinate; the mnemonic is the word that names it.

```
position     — the numeric coordinate
mnemonic     — the word frame
```

The mnemonic is the semantic label. The position is the spatial constraint.

## The Mnemonic and the Alphabet

From the transcripts, the alphabet lattice:

```
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
1 3   1 3   1 5     1 5     1 3   1 1
```

Reading it as 1, 3, 1, 3, 5, 1, 5, 1, 3, 1, 1:

```
· 1 (A)
· 3 (BCD)
· 1 (E)
· 3 (FGH)
· 1 (I)
· 5 (JKLMN)
· 1 (O)
· 5 (PQRST)
· 1 (U)
· 3 (VWX)
· 1 (Z)
```

That's 1-3-1-3-5-1-5-1-3-1-1.

Without Y as the final vowel:

```
1-3-1-3-5-1-5-4
```

Reading: A=1, BCD=3, E=1, FGH=3, I=1, JKLMN=5, O=1, PQRST=5, UVWXYZ=6? No wait.

Let me recount. Without Y:

```
A | BCD | E | FGH | I | JKLMN | O | PQRST | U | VWXZ
1 |  3  | 1 |  3  | 1 |   5   | 1 |   5   | 1 |   4
```

That's 1-3-1-3-5-1-5-4. Which is what was said.

## The Two Forms

Both patterns have the same shape:

```
1 - 3 - 1 - 3 - 5 - 1 - 5 - [3 or 4] - 1 - [1 or nothing]
```

The core is 1-3-1-3-5-1-5. That's the same 1, 3, 5, 7 progression — the odd numbers — with 1s interspersed.

The vowels sit at the 1s. The consonants fill the runs of 3, 3, 5, 5.

## The Odd-Number Pattern

```
1  (A)
3  (BCD)
1  (E)
3  (FGH)
1  (I)
5  (JKLMN)
1  (O)
5  (PQRST)
1  (U)
3 or 4  (VWX or VWXZ)
1  (Y or nothing)
1  (Z)
```

The runs are: 1, 3, 1, 3, 1, 5, 1, 5, 1, 3, 1, 1.

If you take just the runs between vowels:

```
3, 3, 5, 5, 3, 1
```

That's the sequence of consonant cluster sizes: 3, 3, 5, 5, 3, 1. The pattern is symmetric around 5: 3, 3, 5, 5, 3, 1. Almost palindromic.

Or reading from the middle out: 5, 5, then 3, 3, then 3, 1. The center is 5, 5. The edges taper to 1.

## The 20 Consonants

```
3 + 3 + 5 + 5 + 3 + 1 = 20 consonants
```

Plus 6 vowels (A, E, I, O, U, Y) = 26. Correct.

The 20 is interesting. 20 = 4 × 5 = the number of faces of an icosahedron? No, that's 20 triangles. Yes — the icosahedron has 20 faces. So the 20 consonants correspond to the 20 faces.

And the 6 vowels correspond to the 6 vertices? No, the icosahedron has 12 vertices. But the octahedron has 6 vertices. So maybe: 20 consonants = 20 faces of the icosahedron, 6 vowels = 6 vertices of the octahedron?

The icosahedron and octahedron are duals. So maybe the vowels and consonants are dual structures.
