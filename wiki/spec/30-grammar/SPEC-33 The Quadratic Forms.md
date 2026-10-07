---
id: SPEC-33
title: "The Quadratic Forms"
kind: spec
layer: grammar
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-30 The Symbol Table G]]"
down: []
related:
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-31 Declaration Syntax]]"
  - "[[SPEC-32 Mnemonics and Axes]]"
  - "[[SPEC-34 Phases Attributes Constraints Configurations]]"
  - "[[SPEC-35 Reflections and Orbits]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-22 The Blob]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-01 XOR Tetrahedron Transform]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/animation.frame.ts"
dimensions: []
symbols: []
tags: [omi-imo, quadratic, forms, BQF, discriminant, affine, projective]
---

# The Quadratic Forms

## The Two Forms

| Form | Equation | Discriminant |
|------|----------|--------------|
| Affine | 16x² + 16xy + 4y² = (4x + 2y)² | Δ = 0 |
| Projective | 60x² + 16xy + 4y² | Δ = −704 |

The lift from 16 to 60 adds periodicity. It enables spatial selection. It makes the operation multidimensional.

The projection is the O(1) resolution. The projection is atomic, so the resolution is constant-time.

## The Affine Form

```
Q(x, y) = 16x² + 16xy + 4y² = (4x + 2y)²
```

The affine form is a perfect square. It factors into a single linear projection.

### Algebraic Properties

Unlike non-degenerate elliptical or hyperbolic quadratic forms, this specific form has a Discriminant of exactly Zero:

```
Δ = b² − 4ac = (16)² − 4(16)(4) = 256 − 256 = 0
```

### Implications

- **The Parabolic Degeneracy:** Because Δ = 0, the quadratic form factors perfectly into a single linear projection: Q(x, y) = (4x + 2y)².
- **The Absolute Centroid Alignment:** The value vanishes (Q(x, y) = 0) if and only if 4x + 2y = 0, which maps directly to the 0x00 & 0° OMNION Centroid.

## The Projective Form

```
Q(x, y) = 60x² + 16xy + 4y²
```

Equivalent:

```
Q(x, y) = 4(15x² + 4xy + y²)
```

The signing residue comes from the decomposition:

```
15x² = 4x² + 11x²
```

Therefore:

```
Q(x, y) = 4(4x² + 11x² + 4xy + y²)
```

### Interpretation

```
4x²  = tetragrammatron square frame
11x² = residual orientation / signing frame
4xy  = internal bridge
y²   = dialect / local variation
```

## The 11x² Signing Frame

The factored form is:

```
Q(x, y) = 4(15x² + 4xy + y²)
```

The high-plane term inside the parentheses is 15x². This may be decomposed as:

```
15x² = 4x² + 11x²
```

Here:

```
4x²  = tetragrammatron square frame
11x² = residual signing / orientation frame
```

Therefore:

```
Q(x, y) = 4(4x² + 11x² + 4xy + y²)
```

## The BQF Bridge

The cross term 16xy is the coupling between x and y. And the bridge term equals 12 at the half-unit diagonal.

```
16xy = 12 at x = 3/2, y = 1/2
```

The diagonal 12 = 01100 has bits 2 and 3. And base 19 = 10011 has bits 2 and 3 clear. So 19 is orthogonal to the diagonal.

And 19's walk is the cleanest because it's fully orthogonal to the diagonal. So the BQF's cross term stays at exactly 12 throughout the walk, and the walk is the clean orbital cycle.

## The Animation Frame Forms

From `rosetta/src/animation.frame.ts`:

```typescript
class AnimationFrame {
    q = (x, y) => 15 * (x ** 2) + 4 * (x * y) + (y ** 2)
    e = (x, y) => 16 * (x ** 2) + 16 * (x * y) + 4 * (y ** 2)
    E = (x, y) => 60 * (x ** 2) + 16 * (x * y) + 4 * (y ** 2)
```

Three forms:

| Method | Form | Coefficient |
|--------|------|-------------|
| `q` | 15x² + 4xy + y² | 15 |
| `e` | 16x² + 16xy + 4y² | 16 |
| `E` | 60x² + 16xy + 4y² | 60 |

## The Component Forms

```typescript
const b0e = (x: number, y: number) => (2 * x) + (y ** 2);
const o0e = (x: number, y: number) => (11 * (x ** 2)) + (4 * (x ** 2)) + (4 * x * y) + (y ** 2);
const x0e = (x: number, y: number, z: number) => ((4 * (x + y)) + (15 * z)) ** 2;
const d0e = (x: number, y: number, z: number) => ((16 * x) * (4 * y) * (60 * z)) ** 2;
const p0e = (x: number, y: number, z: number) => (((4 * x) + y) + (15 * z)) ** 2;
const i0e = (x: number, y: number, z: number) => ((16 * x) * (4 * y) * (60 * z)) ** 2;
const n0e = (x: number, y: number, z: number) => ((4 * x) + y + (15 * z)) ** 2;
const e0e = (x: number, y: number, z: number) => ((16 * x) * (4 * y) * (60 * z)) ** 2;
```

## The Reflection Forms

```typescript
// (2x + y)²
const S = (x: number, y: number) => ((2 * x) + y) ** 2
// 44x² + 4(2x + y)²
const FS = (x: number, y: number) => ((44 * x) ** 2) + (4 * S(x, y));
// 4[11x² + (2x + y)²]
const GS = (x: number, y: number) => [
    ((11 * x) ** 2) + S(x, y),
    ((11 * x) ** 2) + S(x, y),
    ((11 * x) ** 2) + S(x, y),
    ((11 * x) ** 2) + S(x, y)
];
// 4(15x² + 4xy + y²)
const RS = (x: number, y: number) => 4 * (((15 * x) ** 2) + (4 * x * y) + (y ** 2));
// 60x² + 16xy + 4y²
const US = (x: number, y: number) => ((60 * x) ** 2) + (16 * x * y) + ((4 * y) ** 2)
```

## The Reflections

```typescript
const reflections = [0, 1, 2, 4, 5, 8, 9, 10, 13, 16, 17, 18, 20, 25, 26, 29, 32]
```

## The Canonical Closure

The canonical closure is the preserved Polybius split:

```
D+ = {0,5,A,F}       = 0x1E
D- = {3,6,9,C}       = 0x1E

D  = D+ ∪ D-         = 0x3C
K  = {1,2,4,7,8,B,D,E} = 0x3C

D + K = 0x78
```

Therefore:

```
0x1E = diagonal half-closure
0x3C = base60 surface
0x78 = full carry-close
```

## The Ring

The ring has 5040 slots.

An upper bound can be given using the Fano plane with a collection of 14 tickets in two sets of seven. Each set of seven uses every line of a Fano plane, labelled with the numbers 1 to 7, and 8 to 14.

## The Real Coordinate Formula

In real coordinates (a, b, c, d) with S³ ⊂ ℝ⁴:

```
h(a, b, c, d) = (a² + b² - c² - d², 2(ad + bc), 2(bd - ac))
```

This maps the unit 3-sphere to the unit 2-sphere.

## The NULL Ring Law

The NULL Ring law fixes the dot relation as XOR over a 16-bit bounded execution surface:

```
(NULL.NULL) -> 0x0000
0x00 ^ 0x20 -> 0x20
0x20 ^ 0x7F -> 0x5F
0x7F ^ 0xFF -> 0x80
0xFF ^ 0x00 -> 0xFF
0x20 ^ 0x5F ^ 0x80 ^ 0xFF -> 0x00
```

## The Weight Map

```
0x0 -> 0  centroid
0x1, 0x7, 0xF -> 1
0x2, 0x3, 0x5, 0x6 -> 4
0x8, 0x9, 0xC, 0xD -> 4
0x4, 0xA, 0xE -> 6
0xB -> 12
```
