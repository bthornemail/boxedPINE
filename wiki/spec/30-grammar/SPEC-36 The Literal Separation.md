---
id: SPEC-36
title: "The Literal Separation"
kind: spec
layer: grammar
status: draft
spec: OMI-IMO-2026
up: "[[SPEC-30 The Symbol Table G]]"
down: []
related:
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-40 The 6T XOR Circuit]]"
  - "[[SPEC-44 The Virtual Breadboard]]"
  - "[[OPEN-00 Contradiction Register]]"
  - "[[OPEN-01 Open Questions]]"
  - "[[OPEN-03 Glossary]]"
  - "[[PROG-00 Homoiconic Syntax Tracker]]"
sources:
  - "[[SRC-09 Try XOR Catch XNOR Finally]]"
code:
  - "rosetta/src/grammar/grammar.ts"
  - "src/testbed/rosetta.test.ts"
dimensions: []
symbols: [PINEBOXED]
tags: [omi-imo, grammar, literal, index, value, iExtant, omicron]
---

# The Literal Separation

## The Concept (author, 2026-10-07)

> We are creating literals analogous to the BigInt literal `0n`, as `0P`, `0I`, `0N`, and using the scientific notation `e`/`E` as the exponent and the exception buffer of 16 booleans. Then we balance those with datum expressed in `0b`, `0d`, `0x`, `0o`, with `0e` being the `e`/`E` of the `0E` and `0e`. The `.` is decimal notation; decimal and decimal-dot notation I try to express in `/[d\.]/`.

| Side | Literals | Case | What it is |
|------|----------|------|------------|
| Index | `0P`, `0I`, `0N` | upper | Point, Index, Number, made like JavaScript's BigInt `0n` |
| iExtant | `0e`, `0E` | lower / upper | `e` the **exponent**, `E` the **exception buffer of 16 booleans**, as in scientific notation |
| Datum | `0b`, `0o`, `0x`, and `0d` or `0.` | lower | the value side, in a radix; decimal is written `d` or `.` (`[d\.]`) |

The two sides are balanced against each other, and `e`/`E` is the hinge between them. `/PINEboxed/` is a tagname for the whole form, not part of its structure.

An earlier pasted chat wrote a model of this; the author says that model is incorrect. This note follows the concept above and the author's own draft regex.

## The Current Draft (author, 2026-10-07)

> We now only use capital `PINE` and lowercase `boxed`: `/0?[boxd]?\d+[eE\.]?\d[PIN]/`. This is my best try to be reducible to `0n` concatenation notation, so that the XOR of the form is the XNOR of a `0n` Hamming distance.

```
0?        optional frame
[boxd]?   value radix, lowercase
\d+       the value
[eE\.]?   e exponent, E exception, . decimal dot
\d        the scale (one digit)
[PIN]     the index axis, uppercase
```

**What running it shows (verified):**

| Input | Read as | |
|-------|---------|---|
| `0x5e3P` | hex, value 5, exponent 3, Point | ✅ |
| `0d12E3I` | decimal, value 12, exception 3, Index | ✅ |
| `0b101.1N` | binary, value 101, dot, 1, Number | ✅ the dot is now a marker |
| `1e5N` | value 1, exponent 5, Number | ✅ the leading 0 is optional |
| `0x5e30P` | no match | ⚠️ the scale is one digit |
| `0P`, `0x5P` | no match | ⚠️ two digits are always required |
| `0x55P` | value 5, scale 5 | ⚠️ unmarked digits split arbitrarily |

**XOR and XNOR (verified).** At a fixed width, `popcount(a XNOR b) = width − popcount(a XOR b)`. XOR counts the differing bits (the Hamming distance), XNOR the agreeing bits, so they carry the same information. A BigInt `0n` has no width, though: `~(5n ^ 3n)` is `-7n`. XNOR becomes a Hamming count only once a width is fixed, and the radix can fix it, since each `b`, `o` or `x` digit is exactly 1, 3 or 4 bits. Decimal (`d`, `.`) has no whole number of bits per digit.

**Open on this draft:**
- ⟦How does a literal reduce to `0n` "concatenation notation"? For example, is `0x5e3P` the BigInt of the concatenated digits `0x53n`, with `e` and `P` as tags?⟧
- ⟦Is the scale meant to be one digit?⟧
- ⟦Should `0P`, `0I`, `0N` themselves be admitted?⟧
- ⟦What width does a decimal literal have?⟧

## Reducing a Literal to `0n` (from the Uniform Bitboard)

The author points to *The Uniform Bitboard, Pre-Language, OMI-Lisp, and Pseudo-Persistent Open World Substrate* (`omi-files/omi-tetragrammatron/dev-docs/archive/`, lines 181–1368) as the supreme example of the `/boxedPINE/` analog of a BigInt `0n` contraction: an addressable coordinate of a data structure. It supplies the two missing pieces.

1. **Concatenation is place-value nibbles in one long word.** "An OMI address is a cascade of 32 hexadecimal place-value nibbles grouped into eight 16-bit ruler segments." That is 128 bits, and "0xA at n02 is not the same citation contribution as 0xA at n27." So a literal reduces to `0n` by concatenating its nibbles at their places, and the width is fixed (128), which makes XNOR a Hamming count (see above). Each 16-bit segment indexes exactly 65,536 places, so all eight segments are indices into the same 65,536-index Blob (verified).
2. **An addressable coordinate is a handle.** "OMI references are deterministic handles": `0x0100002A` = CONS handle, index `0x2A`. The top bits give the type, the low bits the index. A `/boxedPINE/` literal is the same shape: the `[PIN]` axis is the type and the radix-read digits are the index.

⟦Candidate rule, for the author: literal → handle = (axis tag in the top bits) ‖ (value nibbles in place order). Which bits carry the axis, and where do `e` / `E` / `.` go?⟧

## One Literal, Several Readings (verified)

The faces and reflections of G (`core/src/index.ts`) and `/PIN/` are not true of one string at once. They are three questions asked at different widths.

**Faces ask which side of a dot holds a number.** Two yes/no answers give four cells:

| | right numeric | right not numeric |
|---|---|---|
| **left numeric** | `3.5` CENTER | `3.a` LEFT |
| **left not numeric** | `a.3` RIGHT | `a.b`: unnamed in G; plain dot notation, like `car.cdr` |

**Reflections ask whether a string mirrors around `:`.** DEFLECT mirrors content and forbids dots (`ab:ab`). REFLECT mirrors frame characters, dots and quotes only (`.:.`). INFLECT nests two (`.:":":.`). The faces use the dot as a hinge between content; the reflections use it as the frame. No string matches both families: checked over 2,396,744 strings of up to 7 characters, none did.

**`/PIN/` asks which axis the whole literal stands on.** `0b101.1N` is, as a whole, a `PINEBOXED` literal on axis N; the 3-character window around its dot, `1.1`, is a CENTER face (the decimal dot of `[d\.]`). The same characters are read at two widths, the way a byte is a row and a column at once.

**Author:** the plain dot is the **exception**. The dot belongs inside numbers (CENTER, LEFT, RIGHT); a dot with no number on either side is the exception case. So the four face cells are the four letters of PINE: three ways a dot sits in a number, and E, the exception. That matches `E` as the exception buffer. It is in the grammar as the `EXCEPTION` face.

**Verified:** the four cells never overlap. But 44 of the 9,025 printable `x.y` strings fall in no cell, all with signs (`+.5`, `5.+`, `+.+`): LEFT and RIGHT count `+`/`-` as numeric, and CENTER takes digits only. With `[0-9+-]` on both sides of CENTER the four cells are an exact partition.

⟦Should CENTER accept signs?⟧ ⟦Which of P, I, N is CENTER, which LEFT, which RIGHT?⟧

## Why Base36 (verified)

The bits that partition the blocks also separate the characters:

| Bit | Toggle | Separates |
|-----|--------|-----------|
| 128 | `60 ⊕ 128` | 7-bit ASCII from everything beyond it |
| 64 | `60 ⊕ 64` | among alphanumerics: clear = exactly the 10 digits, set = exactly the 52 letters |
| 32 | `e ⊕ E` | case; folding it leaves 26 letters |

10 + 26 = **36**. The base36 alphabet is cut out by these three bits. 60 itself sits in row 3, the digits row; `60 ⊕ 64` moves it into the letters (row 7), and `60 ⊕ 128` takes it out of ASCII. Tested in `src/testbed/core.test.ts`.

The Polybius gauge in the same document also checks out: D+ `{0,5,A,F}` and D− `{3,6,9,C}` each XOR to 0 and sum to `0x1E`, and all sixteen nibbles sum to `0x78` (tested).

## The Animation Frame Forms as Proxy / Reflect / Catch

The author reads `animation.frame.ts`'s three forms ([[SPEC-33 The Quadratic Forms]]) like proxy, reflect and catch:

| Form | Expression | Verified |
|------|------------|----------|
| `q` | 15x² + 4xy + y² | — |
| `e` | 16x² + 16xy + 4y² | `= (4x + 2y)²`, a perfect square (Δ = 0) |
| `E` | 60x² + 16xy + 4y² | `= 4q` exactly; `E − e = 44x²` |

⟦Which form is which role? `E` (the exception) suggests catch, but the assignment is the author's.⟧

## The Earlier Draft Form

```
/0[box]?[d\.]?\d+[eE]?\d+[PIN]/

0        the frame, as in 0n
[box]?   datum radix: binary, octal, hex
[d\.]?   decimal: d or the dot
\d+      the value
[eE]?    e = exponent, E = exception buffer
\d+      the scale
[PIN]    the index axis
```

It is in the grammar as `PINEBOXED` (`rosetta/src/grammar/grammar.ts`), with tests in `src/testbed/rosetta.test.ts`.

## What Running It Shows (verified)

| Input | Read as | |
|-------|---------|---|
| `0x5e3P` | hex, value 5, exponent 3, Point | ✅ |
| `0d12E3I` | decimal, value 12, exception 3, Index | ✅ |
| `0.5e1N` | decimal-dot, value 5, exponent 1, Number | ✅ `[d\.]` works |
| `0b101E1N` | binary, value 101, exception 1, Number | ✅ |
| `0P`, `0I`, `0N` | no match | ⚠️ the core literals of the concept are not admitted: the form requires two digit runs |
| `0xd5e3P` | hex **and** decimal | ⚠️ `[box]?` and `[d.]?` can both appear |
| `0x0005N` | value `000`, scale `5` | ⚠️ with no marker, the value and scale split arbitrarily |

## Facts That Support the Concept (verified)

- **`e ⊕ E = 0x20`.** The exponent and the exception differ by exactly the case bit. That is the same bit that separates every uppercase letter from its lowercase one, and SRC-01a calls `0x20` (space) the pinch point. So the index/datum case separation is one bit.
- **16 booleans is one `Word16`.** In `omi-files/omi-types` a `Word16` is exactly 16 `Bit`s, the natural type for the exception buffer. The older `interface iExtant` sketch used `Buffer.allocUnsafe(16)`, which is 16 *bytes* (128 booleans). ⟦Which is meant?⟧
- **No letter-code balance.** XORing the ASCII codes of `PIN`/`PINE` against `box`/`boxd`/`boxed` gives no equal pairs. The balance has to come from the values the literals carry, not their letters.
- **Where the comparison happens.** The XNOR of two signals is read at the 5T node (BOOT0) of the breadboard ([[OPEN-00 Contradiction Register]] #1, [[SPEC-44 The Virtual Breadboard]]). XNOR is 1 when the signals are equal.

## A Possible Revision (for the author)

This keeps the draft's parts but admits the bare literals, and keeps radix and decimal exclusive:

```
/^0(?:[box]|[d.])?(?:\d+)?(?:[eE]\d+)?[PIN]$/
```

| Input | Draft | Revision |
|-------|-------|----------|
| `0P` | no | yes |
| `0x5P` | no | yes |
| `0x5e3P` | yes | yes |
| `0xd5e3P` | yes | no |
| `0x0005N` | value `000`, scale `5` | value `0005`, no scale |

And the iExtant literals on their own, `0e` and `0E`, would be `/^0[eE]$/`.

## Decisions for the Author

1. ⟦Adopt the revision, or keep the draft as written?⟧
2. ⟦Are `0e` and `0E` standalone literals as well as markers inside a form?⟧
3. ⟦The exception buffer: 16 booleans (one `Word16`) or 16 bytes?⟧
4. ⟦Hex values: decimal digits only? `e`, `E`, `b` and `d` are hex digits, so admitting hex digits collides with the markers.⟧
5. ⟦What concretely is balanced between the index side and the datum side?⟧
