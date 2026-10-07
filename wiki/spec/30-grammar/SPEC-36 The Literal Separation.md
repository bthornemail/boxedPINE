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

The author's first-principles model of the literals, from a later chat (2026-10-07). It supersedes `/pinEboxed/` and `/pinboxd/`. Statements marked **author** are the author's; **verified** means it was run.

## Three Kinds of Literal

| Literal | Case | What it is | Interface | Family |
|---------|------|------------|-----------|--------|
| `/PINE/` | UPPER | **index** literals: Point, Index, Number, Exception. Positions; root 0 | Simplex | lambda |
| `/boxed/` | lower | **value** literals: binary, octal, hex, exponent, decimal. The BigInt-like value form | Point | shape |
| `/eE/` | mixed | the **iExtant** interface between them | iExtant | shared (Circle and Simplex implement it) |

**Author:** uppercase is the source (index), lowercase the projection (value), and mixed case the boundary. `E` and `e` are **different letters**, not one letter read twice:
- `E` is the **exception buffer** (`Exception: Blob`, 16 bytes);
- `e` is the **exponent offset** from 0, in `BYTES_PER_ELEMENT` (`Exponent: number`).

Only one is active at a time (the chirality).

**Author:** `/eE/` sits between sign-value and place-value notation. That is why it shares its form with scientific notation (`1e5`, `1E5`) and decimal dot-notation (`1.5`): all are `\d [marker] \d`.

**Author:** `/PINEboxed/` is a **tagname**, a display convention for the most reduced full form. It is not the regex.

**Verified:** `PIN` + `E` + `boxed` contains exactly the letters of `PINEboxed`, and E and e are both present as separate letters.

## The Base Form

**Author:**

```
/0[boxd]?\d+[eE]?\d+[PIN]/

0        the frame (the origin)
[boxd]?  the value radix, lowercase
\d+      the value
[eE]?    e = exponent offset, E = exception buffer
\d+      the scale
[PIN]    the index axis, uppercase
```

**Purpose (author):** to constrain the radix, by comparing the BigInt offset (`0n`) with an environmental/global delta: the Omicron form. Big O is the environmental delta (with E), little o the local delta (with e). The comparison is **analogue interaction through switches**: the XNOR of two signals through transistors.

It is in the grammar as `PINEBOXED` (`rosetta/src/grammar/grammar.ts`).

## What Running It Shows (verified)

| Input | Read as | Note |
|-------|---------|------|
| `0x0005e10N` | radix x, value `0005`, marker e, scale `10`, axis N | ✅ works as described |
| `0x0005E10N` | radix x, value `0005`, marker E, scale `10`, axis N | ✅ |
| `0x05e10n` | no match | the axis must be uppercase |
| `0x0005N` | value `000`, scale `5` | ⚠️ with no marker, the value and scale run together and the split is arbitrary |
| `0x5N` | no match | ⚠️ a plain value needs at least two digits |
| `0xFFN` | no match | ⚠️ `\d` admits no hex digits |

The tests are in `src/testbed/rosetta.test.ts`.

## Corrections and Answers

- **XNOR direction.** XNOR is **1** when the two signals are equal (truth table `1001`, verified). The chat's "XNOR = 0 when the same" describes XOR, the compare-exchange *difference*. "Admissible iff the difference is 0" and "admissible iff XNOR is all ones" are the same condition.
- **Which transistors are the switches** (the chat's last question). The breadboard already answers it. The XNOR physically exists at the 5T's collector node: BOOT0, the terminal read, where the two inputs meet. The 6T's Q6 inverts it to XOR to drive onward ([[OPEN-00 Contradiction Register]] #1, [[SPEC-44 The Virtual Breadboard]]). Every transistor is a switch; the XNOR is *read* at the 5T endpoint.
- **Hex and the marker.** Admitting hex digits would collide with the marker: `e`/`E` (and `b`, `d`) are hex digits, so `0x1E5N` could be the value `1E5` or the value `1`, exception, scale `5`. Keeping value digits decimal (`\d`), as the form does, avoids this.

## Decisions for the Author

1. ⟦**Optional or required marker?** If `[eE]` is optional, the form needs the marker and the scale to go together, e.g. `/^0[boxd]?\d+(?:[eE]\d+)?[PIN]$/`. Then `0x5N` matches and `0x0005N` reads value `0005` with no scale. If the marker is always present, write `[eE]` without `?`.⟧
2. ⟦**Is `.` a third marker** (pure place-value), so the form is `[eE.]`?⟧
3. ⟦**Hex values:** keep decimal digits only, or allow hex digits and give up the marker inside hex values?⟧
4. ⟦**β in the Omicron comparison:** with XNOR read as equality of `0n` and the environmental delta, what is the environmental delta concretely: the exception buffer E?⟧
