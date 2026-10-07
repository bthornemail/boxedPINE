---
id: SPEC-12
title: "The Ruler"
kind: spec
layer: foundations
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-10 The Primitive]]"
down: []
related:
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-11 The Three Primitives]]"
  - "[[SPEC-13 XOR Algebra]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-15 The Delta Transform]]"
  - "[[SPEC-16 The Fano Invariant]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-52 The REPL and the Digest]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
code:
  - "rosetta/src/model.ts"
  - "rosetta/src/constants.ts"
dimensions: []
symbols: []
tags: [omi-imo, ruler, slide-rule, 3!, permutation]
---

# The Ruler

## Definition

The ruler is a slide rule of rulers:

```
Slide rule        →   the array (the instrument)
Rulers            →   the slots (the scales)
Sliding           →   the operation
Reading           →   the measurement
```

One slide rule. Eight rulers. One instrument.

## The Eight Slots

| Index | Name | Role |
|-------|------|------|
| 0 | diagonal | the origin, XOR of all six |
| 1 | size | the unit count, base 1 |
| 2 | top | |
| 3 | bottom | |
| 4 | right | |
| 5 | left | |
| 6 | forward | |
| 7 | backward | |

The ruler is 2! + 3! = 8 slots long:

```
2! = indices 0, 1 = {diagonal, size} = the frame
3! = indices 2..7 = the six operations = the content
```

## The Diagonal

Index 0 is the diagonal — the XOR of all six operations. It is the origin, the invariant, the point that doesn't move.

The diagonal is formed as the invariant diagonal (`ruler[0]`), which is the XOR sum of all six 3! permutations of `{byteLength, byteOffset, BYTES_PER_ELEMENT}`.

## The Size

Index 1 is the size — the unit count, the base 1.

Spatial difference begins at index 1. Index 0 is the origin.

## The Six Operations

The indices 2 through 7 are the six operations — the six orthogonal axes of the 3! structure.

From `rosetta/src/model.ts`, the ruler is constructed:

```typescript
const ruler = Buffer.allocUnsafe(16).fill(0);
ruler[2] = p;
ruler[3] = i;
ruler[4] = b;
ruler[5] = o;
ruler[6] = x;
ruler[1] = d;
ruler[0] = xy;
const rule: Buffer = ruler.subarray(8);
rule[0] = front[p];
rule[1] = back[i];
rule[2] = right[b];
rule[3] = left[o];
rule[4] = up[x];
rule[5] = down[d];
rule[6] = linear;
rule[7] = diagonal;
```

The ruler is 16 bytes: 8 bytes for the ruler proper, 8 bytes for the rule. The rule is the subarray from index 8.

## The Three Levels of Orthogonality

```
Internal — axes within a group
External — groups to each other
Parent — child to container
```

The 2! and 3! are separate orthogonal groups. The 3! is already orthogonal to indices 0 and 1.

## The Ruler as Slide Rule

The ruler is a slide rule of rulers. The index 0 is the diagonal — the XOR of all six operations. It is the origin, the invariant, the point that doesn't move.

The index 1 is the size — the unit count, the base 1.

The indices 2 through 7 are the six operations — the six orthogonal axes of the 3! structure.

Spatial difference begins at index 1. Index 0 is the origin.

## The delta16 Function

From `rosetta/src/constants.ts`:

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

## The Ruler in the Kernel

The ruler is the state that the kernel walks through. Each step of the kernel reads and writes the ruler. The ruler is the blackboard — the shared state that the computation reads and writes.

The ruler is not a computation — it is a state. The four-block family is a state space, and the ruler's role is to hold the state, not to compute it.

A state held outside the computation is exactly what blackboard and automata theory describe:

```
blackboard    a shared state that multiple processes read and write
automaton     a state machine that transitions between states
```

Both are the same idea: the state is first-class, not embedded.
