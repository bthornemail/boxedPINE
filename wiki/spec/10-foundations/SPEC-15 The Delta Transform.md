---
id: SPEC-15
title: "The Delta Transform"
kind: spec
layer: foundations
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-10 The Primitive]]"
down: []
related:
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-33 The Quadratic Forms]]"
  - "[[SPEC-35 Reflections and Orbits]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-01 XOR Tetrahedron Transform]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-05 Conspiracy Check]]"
code:
  - "rosetta/src/constants.ts"
dimensions: []
symbols: []
tags: [omi-imo, delta, transform, rotation, period-8]
---

# The Delta Transform

## Definition

From `rosetta/src/constants.ts`:

```typescript
function rotl(buf: Buffer, n: number) {
    return Buffer.from(buf.map((_, i) => buf[(i + n) % buf.length]!));
};
function rotr(buf: Buffer, n: number) {
    return Buffer.from(buf.map((_, i) => buf[(i - n + buf.length) % buf.length]!));
};

function xor(a: Buffer, b: Buffer) {
    return Buffer.from(a.map((v, i) => v ^ b[i]!));
};

export function delta(buf: Buffer, C: Buffer) {
    return xor(xor(xor(rotl(buf, 1), rotl(buf, 3)), rotr(buf, 2)), C);
};
```

The delta transform is:

```
delta16(x, c) = rotl16(x, 1) ^ rotl16(x, 3) ^ rotr16(x, 2) ^ c
```

## The Components

| Component | Operation | Role |
|-----------|-----------|------|
| `rotl(buf, 1)` | rotate left by 1 | the first rotation |
| `rotl(buf, 3)` | rotate left by 3 | the second rotation |
| `rotr(buf, 2)` | rotate right by 2 | the third rotation |
| `C` | the constant | the frame condition |
| `xor` | XOR all | the fold |

## The Period

The delta function has exact period 8. This is proven in the Coq development referenced in the transcripts (`omi-files/omi-axioms/coq/04-execution/Delta16HasExactPeriodEight.v`).

**Carry-forward fold (2026-10-09):** when the carry is the previous state (`x_{n+1} = delta(x_n, x_{n−1})`), the period is 24 = 4! for the bit rotation and 6 = 3! for the swaps. With a constant carry it is 8 and 4 ([[SPEC-07 The Fundamental Invariants]] I-10 to I-12).

**Superseded (author, 2026-10-07):** the rotations were replaced by XOR and XNOR through `swap16`, `swap32` and `swap64` used as permutations, not mutations. On 8 bytes the swaps are the index maps `j ⊕ 1`, `j ⊕ 3` and `j ⊕ 7`, and the swap law has period 4. See [[OPEN-00 Contradiction Register]] #48.

The 8-period matches the XOR orbit's 8-period. The XOR orbit's 8-period and the delta function's 8-period are the same 8.

## The delta16 Function

```typescript
function delta16(ruler: Buffer) {
    const state = Buffer.from(ruler.subarray(0, 8));
    const C = Buffer.from(ruler.subarray(8, 16));
    const next = delta(state, C);
    ruler.set(next, 0);
    ruler.set(state, 8);
    return ruler;
}
```

The `delta16` function folds the 16-byte ruler: it takes the first 8 bytes as state, the next 8 as the constant C, computes `delta(state, C)`, writes the result back to the first 8 bytes, and moves the old state to the second 8 bytes.

**Note:** `delta16` is not exported from `constants.ts`. It is used internally by `model.ts` but cannot be imported. This is a bug.

## The Arc Functions

From `rosetta/src/constants.ts`:

```typescript
export function arcRight(t: number, b: number, r: number, l: number, f: number, br: number) {
    return (t ** 2) + (b ** 2) === r ** 2 &&
        (t ** 2) + (f ** 2) === r ** 2 &&
        (t ** 2) + (br ** 2) === r ** 2 &&
        (b ** 2) + (f ** 2) === r ** 2 &&
        (b ** 2) + (br ** 2) === r ** 2 &&
        (f ** 2) + (br ** 2) === r ** 2;
}

export function arcLeft(t: number, b: number, r: number, l: number, f: number, br: number) {
    return (t ** 2) + (b ** 2) === l ** 2 &&
        (t ** 2) + (f ** 2) === l ** 2 &&
        (t ** 2) + (br ** 2) === l ** 2 &&
        (b ** 2) + (f ** 2) === l ** 2 &&
        (b ** 2) + (br ** 2) === l ** 2 &&
        (f ** 2) + (br ** 2) === l ** 2;
}
```

The arc functions check whether six values form a right or left rotation. They are used in the `Node` constructor to determine which rotation rule applies.

## The Switch in the Node Constructor

From `rosetta/src/model.ts`:

```typescript
switch (true) {
    case arcRight(p, i, b, o, x, d):
        // right Rotation rule
        ruler[2] = ~ruler[2];
        rule[2] = ~rule[2];
    case arcLeft(p, i, b, o, x, d):
        // left Rotation rule
        ruler[3] = ~ruler[3];
        rule[3] = ~rule[3];
    case linear % count === 0:
        ruler[6] = ~ruler[6];
    case xy === diagonal:
    case (xy ^ diagonal) === 0:
        ruler[7] = ~ruler[7]!;
        rule[7] = ~rule[7];
        case diagonal % xy === 0:
            rules[count] = delta16(ruler).toString('hex');
            break;
}
```

**Note:** This `switch` statement has fall-through cases. The `arcRight` case falls through to `arcLeft`, which falls through to `linear % count === 0`, etc. This is likely a bug — the cases should probably have `break` statements.

Also, `linear % count === 0` will throw a division-by-zero error when `count === 0`. This is a bug.

## The Delta and the BQF

The delta transform is the dynamic reading of the BQF. The BQF is the static form:

```
Q(x, y) = 60x² + 16xy + 4y²
```

The delta is the operation that walks the BQF. The orbit is the result of the walk.

```
BQF      — the static form
delta    — the operation
orbit    — the result
```

The delta is the fold over the BQF. The orbit is the result of the fold.

## The Delta and the Ruler

The delta transform operates on the ruler. The ruler is the state. The delta is the operation that transforms the state.

```
ruler    — the state
delta    — the operation
orbit    — the result
```

The delta is the fold over the ruler. The orbit is the result of the fold.

## The Delta and the Kernel

The delta is the step function of the kernel. Each step of the kernel applies the delta to the ruler. The orbit is the sequence of states produced by the kernel.

```
kernel   — the closure
delta    — the step
orbit    — the result
```

The delta is the fold over the kernel. The orbit is the result of the fold.
