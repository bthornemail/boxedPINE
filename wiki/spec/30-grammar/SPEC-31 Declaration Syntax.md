---
id: SPEC-31
title: "Declaration Syntax"
kind: spec
layer: grammar
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-30 The Symbol Table G]]"
down: []
related:
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
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
  - "rosetta/src/index.ts"
dimensions: []
symbols: []
tags: [omi-imo, declarations, regex, syntax, TLV, grammar]
---

# Declaration Syntax

## The Declarations

From `rosetta/src/constants.ts`:

```typescript
export const Declarations: RegExp[] = [
    /0[b,o,x,d,n,p]+\d/,
    /0p[\d][boxd][\d]0n/,
    /0[pn][boxd]0[np]/,
    /0p[\d][^\d]0[b,o,x,d][^\d][\d]0n/,
    /[0][pn]\d[boxd]\d[0][np]/,
    /[A-Za-z0-9][pn]\d[boxd]\d[np][A-Za-z0-9]/,
    /[0][pn]\d[boxd]\d[0][np]/,
    /[np].[d].[np]/,
];
```

## The Canonical Implementation

The canonical implementation of `Atomics.compareExchange` as message syntax:

```
[0][pn]\d[boxd]\d[0][np]
```

Reads as:

```
[0]      →  the literal anchor
[pn]     →  the scalar type (position or number)
\d       →  the magnitude digit
[boxd]   →  the radix
\d       →  the precision digit
[0]      →  the literal anchor
[np]     →  the scalar type (number or position)
```

The **left side** is the **self-described encoding precision**. The **right side** is the **precision − 1**.

## The Self-Described TLV String

```
[0][pn]\d[boxd]\d[0][np]
```

This is a **self-described TLV (Type-Length-Value) string** with:

- **Cardinality** built in — the `\d` after `[pn]`
- **Chirality** built in — the `[np]` at the end
- **Spatial** — the position (0p)
- **Spectral** — the radix (0b, 0o, 0x, 0d)
- **Network** — the alphanumeric endcaps

### The Reading

| Part | Type | Value |
|------|------|-------|
| `[0]` | Literal anchor | 0 |
| `[pn]` | Scalar type | p or n |
| `\d` | Magnitude | 0-9 |
| `[boxd]` | Radix | b, o, x, or d |
| `\d` | Precision | 0-9 |
| `[0]` | Literal anchor | 0 |
| `[np]` | Scalar type | n or p |

Seven components. **7 = the Fano plane.**

## The Full Spatial, Spectral, Network Message

```
[A-Za-z0-9][pn]\d[boxd]\d[np][A-Za-z0-9]
```

Reads: "alphanumeric, scalar type, digit, radix, digit, scalar type, alphanumeric."

The alphanumeric **endcaps** (`[A-Za-z0-9]`) make it a **full spatial, spectral, network message**.

## The Configurations

```typescript
export const Expressions: EXPRESSION[] = []
export const Configurations: CONFIGURATION[] = [
    [
        Declarations,
        [[8, templateLiteral]],
        Expressions,
        [(p, i, n, E, b, o, x, e, d) => '']
    ]
]
```

The configuration is a 4-tuple: declarations, definitions, expressions, templates.

## The Domain Literals

From `rosetta/src/index.ts`:

```typescript
export type POINT = `${number}p`;
export type INDEX = `${number}i`;
export type NUMBER = `${number}n`;
export type EXPONENT = `${number}e${number}` | `${number}e${number}${'p' | 'i' | 'n'}`;
```

## The Dimension Literals

```typescript
export type BINARY = `0b${number}`;
export type OCTAL = `0o${number}`;
export type HEX = `0x${number}`;
export type DECIMAL = `${number}.${number}` | `${number}.${number}d`;
```

## The Structural Literals

```typescript
export type LITERAL = `${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'}`;
export type STRUCT = `${number}${'e' | '.'}${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'} `;
```

SHAPE is the flat wordform:

```
number [boxd] number [pin]
```

Six parts: a number, a radix, a number, a literal. No exponent, no dot.

STRUCT is the full wordform with the exponent slot:

```
number [e or .] number [boxd] number [pin]
```

Eight parts: a number, then either e or ., then a number, then a radix, then a number, then a literal. Two more slots than SHAPE — the exponent slot and the sign slot (. or e).

## The Two Structural Readings

The e | . alternation in STRUCT is the point:

```
e      the exponent marker
.      the decimal marker
```

Both mark the same slot — the slot between the two numbers. e says "exponent." . says "decimal point." Same slot, two readings.

And that's the answer to the earlier question about the two decimals. The two decimal forms:

```
${number}.${number}         the dot form
${number}.${number}d        the d-suffixed form
```

And the two exponent forms:

```
${number}e${number}              the scientific form
${number}e${number}[pin]         the encapsulated form
```

Both read through the same slot, marked either by e or by .. STRUCT names that slot and lets you read it either way.
