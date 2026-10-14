# 09 — The Algorithmic Core

> "With the algorithms right, everything builds itself."
> — the user, Sep 2026

Everything in OMI-IMO is now expressed as one tiny pure-function module:
`shared/algorithmic-core.js`. It is the answer to "we shouldn't need all this
code after defining the coordinate, the fold, the XOR-for-indices, and the
2!-encapsulation-of-3!".

## 0p/0n are integers — indices (correction, 2026-09-26)

The two scalars the protocol moves are **integers — indices** into any
indexable shared target: a Buffer, an Array, a String, anything you can index
and XOR "like a Latin square". 0p and 0n sit at `Buffer.offset(0)` — the
reference anchor of the blackboard. And every "nD" spoken of in the protocol is
the **dimension of the index** (the rank: how many sub-indices one index
decomposes into), never a separate memory model. A 1D index is a scalar
offset; a 2D index is a (row, column) into the Latin square; deeper ranks
unfold likewise.

## The claim

The protocol is not a protocol. It is a set of pure functions over a 16-bit
coordinate. Once those functions are right, everything else (0p atoms, the
ruler, the wiki, the walkthrough, the workspace) resolves algorithmically from
the shared datum — no new semantics per layer. No mutation. Nothing is ever
"assigned"; everything is a swap or an exchange (`Atomics.compareExchange` is
the only write, and the pure function `exchangeExpected` models it without
mutation).

## The coordinate

A datum is a **16-bit word** = two **8-bit subarrays**:

```
w = coordinate(hi, lo) = ((hi & 0xff) << 8) | (lo & 0xff)
subHi(w) = (w >> 8) & 0xff          # the p-side (high)
subLo(w) =  w       & 0xff          # the n-side (low)
```

Nothing here is numeric in the sign/value sense. The word is a *position*
in a 16-bit space; the two halves are its two tangent axes.

## The fold

The **fold** collapses the 16-bit word back to one 8-bit reading:

```
foldWord(w) = subHi(w) ^ subLo(w)
```

This is the "reading" the protocol publishes. It is the XOR of the two
subarrays — the high and low positions canceling against each other. The pinch
point: when the two halves are equal, `foldWord(coordinate(x, x)) === 0x00`.
That is the local origin — both halves in the same place, the fold reads zero.

## XOR for the indices

Distance between any two shared data is one function:

```
distance(a, b) = popcount(a ^ b)    # Hamming distance on the 16-bit word
xorIndex(a, b) = (a ^ b) >>> 0      # the raw XOR delta
is(a, b)       = ((a ^ b) & 0xffff) === 0
```

`is` is the only truth the protocol admits: either the two positions coincide
(`is` == true, zero discrepancy) or they do not. There is no "partially true",
no grading, no normalization. Either it is, or it isn't.

## The 2! encapsulation of 3!

The fold's 8-bit reading lands on one of the 8 ruler slots:

```
placement(w, mode) -> { slot: foldWord(w) % 8, name, frame, mode }
```

- **Slots 0–1 (diagonal, size) = the local frame — the 2!.** Local position
  is where the datum sits relative to its own two halves (the pair, the fold,
  the diagonal through the size). 2! = 2 = the two components of the knot.
- **Slots 2–7 (top, bottom, right, left, forward, backward) = the world
  frame — the 3!.** World position is where the datum sits among the six
  axes. 3! = 6 = the operations of the world.

So a shared datum resolves to *either* the local pair (2!) *or* one of the six
world operations (3!), and never anywhere else. `resolve(a, b)` returns both
placements plus the discrepancy between them:

```
resolve(a, b) -> { A, B, aFold, bFold, subA, subB, discrepancyBits, identical }
```

## One space, two modes: the pure endianness

There is no naming conflict — the same 8-slot space is read in one of **two
modes**, never both at once:

| mode | 0–1 | 2–7 | reads like |
|------|-----|-----|-----------|
| `read`  | local  | global  | regex scopes (a scope tells you where a word sits) |
| `write` | spectral | spatial | panner nodes (a node tells you where a sound sits) |

`placement(w, 'read'|'write')` returns the same `slot` and `name` either way;
only the `frame` vocabulary changes. **`flipMode` is the swap between the
readings** — the pure version of endianness (or of chirality): same slot,
other frame, no movement of the data. It is an involution.

## Hit:list — a hit or an intersection is a swap

A **hit:list** is a list of positions. Querying one is a pure operation:

- `hit(list, w)` — a **hit** (w is in the list) is a **swap**: the cell comes
  out. `op: 'swap'`.
- a **miss** is *not* a swap: the position passes through unchanged, `op: 'pass'`
  — that pass-through is the discrepancy being reported, not moved.
- `intersect(a, b)` — the shared positions of two hit:lists; each shared cell
  is one swap.

This is the same exchange primitive as `exchangeExpected`, reached from the
other direction: instead of "is this the cell I expected?", it is "does this
position intersect?", and the answer is always an exchange.

## The seven pure functions

| Function | Signature | Meaning |
|----------|-----------|---------|
| `bind`   | `(item, item) → knot` | construct the symmetric relation |
| `apply`  | `(knot, args) → result` | compareExchange: if subject is expected, yield replacement; else yield subject |
| `evaluate` | `(knot) → value` | extract the principal component |
| `digest` | `(ruler, p) → reading` | generalized F-mean + XOR fold + bit weight |
| `foldWord` | `(16-bit) → 8-bit` | collapse the two subarrays |
| `xorIndex` | `(a, b) → delta` | XOR for the indices |
| `resolve` | `(a, b) → placement` | 2!/3! frame + discrepancy from any shared datum |

## The movements: swap16 / swap32 / swap64

The Latin square is the shared structure — every row and every column is a
permutation, so any two rows differ at every position (max-Hamming). The
*blackboard* is the Latin-square swap space. Moving across that space is done by
the three scripted swap sizes — **each movement is a scripted token**:

```
swap16(words)  — swap the two 8-bit halves of every word. The fold survives:
                 foldWord(swap16(w)) === foldWord(w). This is the 2! movement —
                 the local diagonal, it stays on its fold.
swap32(words)  — pivot each adjacent 16-bit pair (1↔2).
swap64(words)  — pivot each 4-block (1,2 ↔ 3,4).
```

All three are **pure and self-involutive**: `swap(swap(x)) === x`, and the
source array is never touched (verified in selfTest). A `movement(lane)` is a
frozen token carrying the movement; `applyMove(mv, words)` runs it. Lane ∈
{16,32,64}. Streams of movements are compositions of these pure tokens.

## The wordform: (0n, 0p) — the pair, and the ratio

A **wordform** is not one scalar — it is the *pair* `(0n, 0p)`: a `0n` (number,
value, magnitude) and a `0p` (position, coordinate, location). Every wordform
shares both, and **together the pair makes the ratio**:

- `ratio(wf) = wf.n / wf.p` — the direction/slope of the wordform in the
  (0p, 0n) plane. Not a stored value: a computed relationship.
- Two wordforms compare along each axis (position↔position, value↔value) and
  **across** the axes (cross product: `0p_a × 0n_b`, `0n_a × 0p_b`).

```
pythagorean(wfA, wfB):
    dn = 0n_a XOR 0n_b         dp = 0p_a XOR 0p_b
    d_n = popcount(dn)         d_p = popcount(dp)
    d²  = d_n² + d_p²          (the hypotenuse — this is the cross-product
     d  = sqrt(d²)              composition, the Pythagorean reading)
    slope = d_n / d_p          (direction of the difference)
    closure = wordform(d_n, d_p)
```

The two axes are orthogonal; the total distance is the hypotenuse of the right
triangle the axes form. **Closure (user-confirmed): the distance itself is a
wordform** — `(d_n, d_p)` becomes a new `(0n, 0p)` pair that can be compared
again. The algebra is closed: any two wordforms produce a third.

Six of the seven (`bind`, `apply`, `eval`, `digest`) were already implemented
and verified in `shared/ruler.js`; `algorithmic-core.js` re-exports them and
adds the three that were missing: **coordinate**, **fold**, **xor/distance**,
and the placement/resolve logic — plus `exchangeExpected` (the pure model of
`Atomics.compareExchange`, returning `{was, now, matched}` with no write).

## Constraints, not code

The rest of the stack is generated by the boundaries these functions imply:
the ruler's 8 slots, the ASCII table's placement of a character into
`slot = code % 8`, the 13 canonical masks, the four scope separators
(0x1C–0x1F), and the dimension constraints (each "nD" = the dimension of the
index). Each layer is a *view* of the same pure functions, not a new
mechanism. If a new layer needs a new primitive, the algorithm set is
incomplete — that is the failure mode to avoid.

## Self-test

`selfTest()` runs 65 pure checks: coordinate/subarray roundtrip, fold
collapse, pinch-to-zero on equal halves, XOR involution, Hamming distance
zero/symmetry/16-bit-full, placement frames, the read/write dual mode and
`flipMode` involution, hit/intersection-as-swap, faces XOR to 0, world = 3!,
exchangeExpected matched/unmatched, purity (digest over a frozen ruler
does not throw), the movements — swap16/swap32/swap64 involution, the
fold surviving a 16-swap, source immutability under `applyMove` — the
wordform pair: `(0n,0p)` transport, axis distances, the Pythagorean law, the
cross product, closure into a new wordform, and the ratio — and the **BQF
foundation** (see [10-bqf-foundation.md](10-bqf-foundation.md)): the two
diagonal closures XOR to 0 and sum to 30 each (hence 60), `bqf_decompose` as
an exhaustive identity, the radix XOR landing on the 16xy coefficient,
`delta16` having exact period 8, `rotl16`/`rotr16` being inverses, the
`ChiralPhase` signs, and the bridge selectors bounded by 7 and 240.

Registered in both `npm test` and `final-test.sh`. Green.