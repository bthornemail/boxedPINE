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

## The Author's Draft Form

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
