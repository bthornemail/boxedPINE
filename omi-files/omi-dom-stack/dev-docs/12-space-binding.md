# 12 — The Space: Three Sections and the Equation in the Middle

`shared/space.js`. One file, 20 slots, `0x00`–`0x13`, three sections. The
equation sits in the middle section, which is why it is the section that does
the work.

## The map

| Range | Section | Contents |
|-------|---------|----------|
| `0x00`–`0x02` | binding | the 3-cycle `0, 2, 1` |
| `0x03`–`0x09` | application | the equation: `3, 5, 7, 9` vs `4, 6, 8` |
| `0x0A`–`0x0F` | bound | the six that bind to a source or a sink |
| `0x10` | reserved | — |
| `0x11`–`0x13` | evaluation | anchors `17, 19`, and `/pin/` = `18` between them |

## Where each section came from

The old `bind(mnemonic, metric, fn)` was one file, and its five numbered steps are
the three sections. Read off the structure, not the words:

**Section 1 — binding `0, 2, 1`.** Step 1 of the old code:

```js
const initialFrame = Atomics.compareExchange(metric, 0, 2, 1)
                   ^ Atomics.compareExchange(metric, 1, 0, 2)
                   ^ Atomics.compareExchange(metric, 2, 1, 0);
```

Three `(index, expected, replacement)` triples: `0→1`, `1→2`, `2→0`. A 3-cycle.
The XOR of the three exchanges is the frame's own centre.

**Section 2 — application `3, 5, 7, 9` vs `4, 6, 8`.** Step 4, the dual-cube.
The even walk runs over indices `0, 2, 4, 6, 8`; the odd walk over `1, 3, 5, 7, 9`.
The values that matter are the inner ones — the odd arm `3, 5, 7, 9` against the
even arm `4, 6, 8`. That is the equation, and it is the middle section, so it is
the one that projects:

```js
const projection = meta
  ^ even walk over delta      // 0, 2, 4, 6, 8
  ^ odd  walk over omi;       // 1, 3, 5, 7, 9
```

**Section 3 — evaluation `17, 19`.** Step 5 anchors index 17 in *both* views and
returns a two-element `Float64Array`. Two anchors, one window, length 2. And
`18` is the point *between* them.

## `/pin/`

`/pin/` is written as the whatever observer reference that can XOR those points
`0p`, `0i`, `0n`. So a pin is a **reference**, and the three scalars are the
points it measures between. Reading is a fold, not a sum:

```js
observe(p, i, n) === p ^ i ^ n
```

`/pin/` = `18` is where the response comes back — on index `/pin/` of any
`Buffer`, and on `Buffer(/pin/)` of the space itself. Because XOR is
self-inverse, a pin is also how you recover one point from the other two:
`observe(fold, i, n) === p`.

The six that bind to a source or a sink are `0x0A`–`0x0F`. A read of a bound slot
comes back on `/pin/`.

## Two tiers, and they are not the same tier

This is the error discipline, and the distinction is the whole point.

**Structure — admissible, or an exception with a proper structured coordinate.**
There is no third option. We do not repair malformed structure and we do not
measure our way out of it.

```js
enforce({ nope: true }, 3, 5);
// CoordinateError: admissibility failed: expected a number, a typed array of
//   8- or 16-bit cells, or an array of numbers; got object
// coordinate: {"x":3,"y":5,"pin":18,"binding":[0,2,1],
//   "application":{"odd":[3,5,7,9],"even":[4,6,8]},"evaluation":[17,19]}
```

Admissible: a number, an `ArrayBuffer`, a typed view of 8- or 16-bit cells, or an
array of numbers. The thrown value is a real `Error`, so `catch` works and the
stack survives, and it carries the coordinate as structured data rather than
folded into a string. The old code's `throw new Float64Array(metric.buffer)`
carried structured data but was not an `Error`; a `CoordinateError` with the
view's offsets attached keeps the intent and fixes the catch semantics.

**Value — for well-formed data that merely differs, there is no "wrong."**

```js
exchange(5, 6, 9)  //  { matched: false, now: 5, discrepancy: 3 }
```

`Atomics.compareExchange` leaves the cell alone and returns what was actually
there, and the XOR of expected against actual is the discrepancy. That XOR is the
measurement. A mismatch is not an error and never throws.

## The fold and the collapse

One buffer, two views. `delta` and `omi` are 16-bit subarrays of the same
buffer, `delta` taking the first half and `omi` the second — that is the
16-bit/8-bit spatial projection plane, folded as two 8-bit subarrays of 16-bit
cells.

The three sections run in protocol order — anchor, project, read back:

```js
const f = fold(buffer);
f.frame;          // section 1, the 3-cycle centre
f.application;    // section 2, { even, odd, projection, aligned }
f.evaluation;     // section 3, { anchors: [17, 19], response: 18 }
f.compiles;       // true only if the two projections align
f.collapse;       // 0 when aligned
```

The central inversion is `projection = even ^ odd`. If the spatial projections do
not align, the XOR collapses to zero and no corrupted state can ever compile.
That is the gate: the fold reads, and it refuses to call anything compiled unless
the two halves closed against each other.

## What this does not decide

- Whether `0x10` is genuinely reserved or carries a fourth meaning.
- Whether `0p`, `0i`, `0n` are the three scalars `0^1^2`, the three sections, or
  the three radices. The code admits all of `0x0`–`0xF` and reports the section
  each point falls in, so it does not commit to a reading.
- Whether `18` relates to the sextuplet `{5, 7, 11, 13, 17, 19}` beyond being
  adjacent to two of its members.

## Self-test

48 checks, all passing. Registered as `omi-imo/space` in `package.json` and in the
`final-test.sh` loop.
