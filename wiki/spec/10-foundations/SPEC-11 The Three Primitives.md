---
id: SPEC-11
title: "The Three Primitives: bind, apply, eval"
kind: spec
layer: foundations
status: canonical
spec: OMI-IMO-2026
up: "[[SPEC-10 The Primitive]]"
down: []
related:
  - "[[SPEC-10 The Primitive]]"
  - "[[SPEC-12 The Ruler]]"
  - "[[SPEC-14 Knots and Binds]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-52 The REPL and the Digest]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
code:
  - "rosetta/src/model.ts"
dimensions: []
symbols: []
tags: [omi-imo, primitives, bind, apply, eval, monad, functor, comonad]
---

# The Three Primitives: bind, apply, eval

## Definition

The protocol consists of exactly three operations:

| Primitive | Signature | Role |
|-----------|-----------|------|
| `bind` | `knot[a] = b ⟺ knot[b] = a` | construct a symmetric relation (a knot) |
| `apply` | `apply(knot, args) → result` | invoke a relation as a function |
| `eval` | `eval(knot) → value` | extract a value from a relation |

## The Categorical Reading

These three form the minimum categorical toolkit:

| Primitive | Categorical | Role |
|-----------|-------------|------|
| `bind` | Monad | composition |
| `apply` | Functor | lifting |
| `eval` | Comonad | extraction |

No other operations are part of the core. Everything else is substrate, presentation, or interpretation.

## bind

`bind` creates a knot — a bidirectional pair between two items:

```
knot[a] = b      ⟺    knot[b] = a
```

From `rosetta/src/model.ts`:

```typescript
bind(rule: Buffer = Buffer.allocUnsafe(8).fill(0), ruler: Buffer = Buffer.allocUnsafe(8).fill(0)) {
    const rulerKey = ruler.toString('hex');
    const ruleKey = rule.toString('hex');
    this.knot[rulerKey] = ruleKey;
    this.knot[ruleKey] = rulerKey;
    return this.knot;
};
```

The knot is a `Record<string, string>` — a bidirectional map between hex-encoded buffers. The symmetry is the defining property: if `knot[a] = b` then `knot[b] = a`.

## apply

`apply` executes a knot as a function descriptor, producing a result.

From `rosetta/src/model.ts`:

```typescript
apply(mneumonic: Buffer, metric: Buffer) {
    return
}
```

**Status: stub.** The `apply` method is declared but not implemented. It is the missing piece of the three primitives.

## eval

`eval` reads a knot as a value descriptor, extracting its materialized meaning.

From `rosetta/src/model.ts`:

```typescript
eval(omi, delta, meta, tensor) {
    Atomics.compareExchange(omi, 0, 2, 1)
    Atomics.compareExchange(omi, 1, 0, 2)
    Atomics.compareExchange(omi, 2, 1, 0)
    if (Atomics.compareExchange(omi, 0, 2, 1)) { throw (new Float64Array(tensor)); }

    const projection = meta ^
        Atomics.compareExchange(delta, 0, 4, 2) ^
        Atomics.compareExchange(delta, 2, 6, 4) ^
        Atomics.compareExchange(delta, 4, 8, 6) ^
        Atomics.compareExchange(delta, 6, 0, 8) ^
        Atomics.compareExchange(delta, 8, 2, 0) ^
        Atomics.compareExchange(omi, 1, 5, 3) ^
        Atomics.compareExchange(omi, 3, 7, 5) ^
        Atomics.compareExchange(omi, 5, 9, 7) ^
        Atomics.compareExchange(omi, 7, 1, 9) ^
        Atomics.compareExchange(omi, 9, 3, 1)
    const datum = new Float64Array(
        tensor,
        Atomics.compareExchange(delta, 17, 17, projection),
        Atomics.compareExchange(omi, 17, 19, projection)
    );
    return datum;
}
```

The `eval` method performs the projective reduction. It reads the `delta` and `omi` buffers through compare-exchange, computes the projection, and returns a `Float64Array` view into the `tensor` at the projected offset.

**Note:** The `Atomics.compareExchange` calls here are used as reads (the return value is the old value), not as writes. The `expected` and `replacement` arguments are chosen so that the comparison fails, making the call a pure read. This is the "compare-exchange as read" idiom.

## The Digest

The fourth primitive is the digest:

```
digest    —   read, consider, print
```

The digest computes the generalized F-mean of the ruler:

```
M_p(x_1, ..., x_n) = ( (1/n) Σ x_i^p )^(1/p)
```

The mean order p is determined by the observer's position.

The digest cycle:

```
read          →    read the ruler
consider      →    compute the F-mean
print         →    write the result
loop          →    repeat
```

This is a REPL. The protocol is a read-eval-print loop.

The Horn clause reading:

```
ruler_has_value(V) :- M_p(ruler, V).
```

The head is `ruler_has_value(V)`. The body is `M_p(ruler, V)`.

## The pin Method

From `rosetta/src/model.ts`:

```typescript
async * pin(name: string, fn: any) {
    const regex = new RegExp(name);
    try {
        try {
            const blob = new Blob([`(${fn.toString()})()`], { type: "text/javascript" });
            throw new Error("oops", {
                cause: {
                    options: { cause: "No Reflelection Found" },
                    filename: URL.createObjectURL(blob),
                    lineNumber: 0n
                }
            });
        } catch (ex: any) {
            const blob = new Blob([`(${fn.toString()})()`], { type: "application/octet-stream" });
            throw new Error("oops", {
                cause: {
                    options: { cause: "No Reflelection Found" },
                    filename: URL.createObjectURL(blob),
                    lineNumber: 0n
                }
            });
            console.error("inner", ex.message);
        } finally {
            console.log("finally");
        }
    } catch (ex: any) {
        console.error("outer", ex.message);
    }
}
```

**Status: broken.** The `pin` method has a `try/catch/finally` structure that always throws. The inner `try` block creates a Blob and immediately throws. The outer `catch` catches it. The `finally` always runs. The method never yields. The `lineNumber: 0n` is a BigInt literal, which is valid but unusual.

The `pin` method is the mechanism for pinning a function by name. It is the bridge between the protocol's symbolic layer and its execution layer. It is not yet working.

## The Relationship to the Primitive

The three primitives are the logical reading of the single physical primitive:

```
Atomics.compareExchange(array, index, expected, replacement)
    ↓
bind     — the relation between expected and replacement
apply    — the comparison and conditional swap
eval     — the old value
```

The physical operation is the logical operation. The hardware implements the protocol natively.
