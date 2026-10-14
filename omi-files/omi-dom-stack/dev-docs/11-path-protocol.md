# 11 — The Path Protocol

**`shared/path-protocol.js`** — 95 checks, registered in `package.json` and
`final-test.sh`.

A protocol defines pathways and suggests shortcuts. It does not do the work: it
does not render, validate, interpret, or store. Those belong to the app.

```
X = data source        (an anchor)
Y = data target        (an anchor)
```

Computational cycles read in a sequence, so source and target are **anchors**
rather than free values. Binding targets closures and combinators, never people
— `apply(knot, fn)` in `ruler.js:86-88` is the canonical invocation, and
`bindPath(path, fn)` routes to it.

---

## 1. There is no wrong. Compare and exchange.

This is the whole protocol, in one function:

```js
compareExchange(cell, expected, replacement)
//   -> { matched, now, discrepancy }
```

`Atomics.compareExchange` on a request that does not match does **not** throw
and does **not** report an error. It leaves the cell alone and returns what was
actually there. So:

- `matched` — did the cell hold what was expected
- `now` — what it holds afterwards: the replacement, or the original
- `discrepancy` — `xor(cell, expected)`, non-zero exactly when they differ

**`xor ≠ 0` is not "wrong." It is the measurement.** Every operation in the
module is this one function composed with itself, and most of the module is
composed out of it precisely so that a disagreement arrives as a number.

That principle is worth protecting, and protecting it required drawing a line
the first draft did not have. The line is not "does the caller like the answer".
It is **whether the question was well posed.**

## The two tiers

| | Tier 1 — value | Tier 2 — structure |
|---|---|---|
| what it is | a well-formed request that disagrees | a request with no answer |
| answer | a measurement, reported | `CoordinateError` + `.coordinate` |
| throws | never | always |

**Tier 1, the reading tier.** `rebase('0x', 16, '0d')` is well posed and answers
`10` vs `16`. `Q('p0xn', 'n0bp')` is well posed and answers "does not close",
with a non-zero `closure`. `pin(0x10, 'BUS')` is well posed and answers
`inRange: false`. `resolveWordform('0x1f')` is well posed and answers
`recognized: false` with a real discrepancy. None of these throw, and none of
them should: each is a question with a true answer, and the answer is the
content. Deciding what to *do* about it is the app's job.

**Tier 2, the refusal tier.** `partitionByName('0q')` is not a surprising
reading — `/0[boxd]/` holds exactly four partitions and `0q` is not one of them,
so there is no `0q` to have an opinion about. `cycleIndex('0x', 16)` asks for
slot 16 in a slot space that ends at `0xF`. `compareExchange('a', 1, 2)` names
a cell that is not a cell, so there is nothing to XOR. These throw, because
silently returning something would be inventing an answer to a question nobody
asked.

```js
try {
  pathProtocol.partitionByName('0q');
} catch (e) {
  e.name;                            // 'CoordinateError'
  e.coordinate.argument;             // 'partition'
  e.coordinate.partition;            // '0q'
  e.coordinate.pin;                  // 18
  e.coordinate.binding;              // [0, 2, 1]
  e.coordinate.application;          // { odd: [3,5,7,9], even: [4,6,8] }
  e.coordinate.evaluation;           // [17, 19]
}
```

`CoordinateError` is imported from `space.js` rather than redefined, so there is
one exception type and one coordinate shape in the whole protocol. The
path layer adds only the fields that mean something here: `argument`, `form`,
`partition`, `slot`, `index`.

## Why the magic numbers had to go

The first draft kept `null` and `-1` as the answer to "not found", and that was
the actual bug — worse than any missing feature, because it was silent.

`compareExchange('a', 1, 2).discrepancy === null` is the worst one. A caller
checking `if (report.discrepancy) { ... }` reads `null` as *no difference*, and
`null` is also what the same field returns for a perfectly good exchange where
`cell === expected`. **"I could not measure this" and "there is no difference"
were the same value.** One of those is a reading and the other is a mistake,
and the type system was asked to carry a distinction it cannot carry.

`cycleIndex` returning `-1` had the same shape, with an extra trap: `-1` is a
number, so it flows onward into arithmetic as if it were a position.

Removing them is what took the module from 74 checks to 95. The extra checks
are almost entirely the tier boundary, and they are the checks worth having:
not "does it return null" but "does it throw *and does the coordinate survive
the throw*". A bare `Error`, or a throw with no coordinate, fails them both —
which is the only way a claim like "it refuses" stays honest.

---

---

## 2. The wordform is an open half

```js
const WORDFORM = /^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/;
```

The endcaps are `[p]` and `[n]`. And:

```
'p' ^ 'n'  =  0x70 ^ 0x6e  =  0x1E
```

**`0x1E` is the SECURE face mask** (`01-invariants.md`), and it is not zero. So a
single wordform does not close — it is an open half. Two of them, mirrored, do:

```
p0xn ^ n0xp = 0     p0bn ^ n0bp = 0
p0on ^ n0op = 0     p0dn ^ n0dp = 0
```

`stringXor` is the character-wise XOR, and `stringXor(a, b) === 0` is the only
validity test in the module. **This is why `Q` takes two arguments:** the two
anchors are what make the XOR vanish. One wordform cannot close a binding.

The four radices are four closed pairs — `/0[boxd]/` closes pairwise.

A wordform resolves by **XOR-folding its body**, never by base conversion:

```js
resolveWordform('p0xn').index  ===  '0'.charCodeAt(0) ^ 'x'.charCodeAt(0)
```

An index is an index, not a value. The only requirement of a reference is that
it can be XOR'd, so the fold is XOR and nothing else.

---

## 3. Q(x: Regex, y: Regex)

```
Q(x, y) = 60x² + 16xy + 4y²
```

The regex is the declarative form; resolving it yields the natural number the
Coq development quantifies over (`bqf : N -> N -> N`,
`coq/03-projection/BQFBridgePreservesForms.v`). The constraint reveals the
structure: the regex is the lens, the index is what the lens shows.

`Q` always returns a report. It states whether the pair `closed`, what the
`closure` XOR was, and the three terms — plus `exchange`, the compareExchange
over the two resolved indices. A pair that does not close gets a number for
`q` anyway. Nothing is refused.

See [10-bqf-foundation.md](10-bqf-foundation.md) for the form, the derivation
of the 60 from the two diagonal sets, and the delta law.

---

## 4. Four partitions, one thing

```js
PARTITIONS = [ 0b (2), 0o (8), 0d (10), 0x (16) ]   // ascending precision
PARTITION_XOR === 16                                 // the 16xy coefficient
```

Four precisions, and to `/0[pin]/` they are the same thing: place-value
indices, XOR-able. `0b ^ 0o ^ 0x ^ 0d === 16` — the four radices XOR to exactly
the chiral-bridge coefficient.

`rebase(partition, index, other)` re-expresses one index in another precision
and reports whether the *digits* agree: `16` is `10` in `0x` and `16` in `0d`,
so `matched: false` with the digit-wise discrepancy. Same digits → matched.

---

## 5. The read sequence

The protocol's answer to "cycles read in a sequence": the sequence is *defined*,
not merely required. Partitions in ascending precision, slots ascending:

```
4 partitions × 16 slots = 64 reads per cycle
```

`cycleIndex(partition, slot)` locates a read. Anything outside the cycle — a
fifth partition, or a slot past `0xF` — is tier 2 and refuses with a coordinate
naming the slot, because the cycle has no position for it. If the order were
left to each agent, they would each pick one and disagree — the order *is* the
protocol, and so is the fact that the cycle is closed at 64.

---

## 6. Pins, and collisions as facts

Any of `0x0`–`0xF` may be pinned to any node. Nothing is fixed; a pin is a
declaration, not an action.

`pinSet` reports `colliding` — two pins holding the same value on the same
node. Collisions are **stated, never resolved**: two agents may hold different
pins on one node, and that is a fact to be reported, not an error to be refused.
`pinExchange(pin, value, node)` reports what was already there.

---

## 7. Shortcuts are suggested, never chosen

```js
suggest(path)  // -> candidates. The caller selects, or declines.
```

`direct` is offered for a single-anchor path, the rest for multi-anchor paths.
An empty list is a valid answer meaning "no shortcut claimed." The protocol
never picks — that would be the app deciding, which is the line the protocol
does not cross.

Two distinctions here are worth keeping straight, because the first draft
collapsed both of them into an empty array:

- `suggest(path)` returning `[]` = *the protocol has no shortcut for this path*.
- `suggest(null)` **refusing** = *you did not give me a path.*

Those are different events and a caller will want to react differently to them.
Likewise `shortcut('nope')` refuses and lists the seven real names, rather than
returning `null` and leaving the caller to guess whether it typo'd.

---

## 8. What I guessed, and needs confirming

These are the two places I had no source for and chose the smallest reading:

1. **Wordform body length.** The regex requires a 2-character body (`p0xn`) and
   optionally a dotted form (`p1.5n`). I initially wrote tests against 3-char
   `p1n` and they failed — the regex was right and my tests were wrong. If the
   real forms are shorter or longer, only `WORDFORM` and `resolveWordform`
   change.
2. **The index resolution.** I read "the only requirement is that it can be
   XOR'd" as *the fold is XOR*, so `resolveWordform` XOR-folds the body rather
   than converting the base. If the body is meant to name a radix directly
   (`p0xn` → 16), that is one line in `resolveWordform`.

Also still open, and **not yet built**: the 4-slot treemap automaton
(`P(15,3) = 2730`, slot 0 pinned to Q, per-slot flip bits, the dual
`44x²`/XOR discrepancy). The four answers to that design are recorded below; the
module does not exist yet because the protocol layer is a precondition for it —
Q is a binding of two wordforms, and nothing can project through a form that
cannot be bound.

### Recorded, unbuilt: the treemap automaton

| # | Answer |
|---|---|
| 1 | Ordered triples. `P(15,3) = 2730 = 455 × 3!`. Slots 1–3 are positions, so swapping two is a real transition. |
| 2 | Input: the `wiki/chapters/*.json` node trees. **Correction:** they are *flat* node lists (86 nodes across 6 chapters), not trees — no parent/child field. Hierarchy is derivable only by declaring a lens (group by `role`: 33 resistor, 29 transistor, 12 rail, 6 bus, 5 LED, 1 gate; or band by `bRow`). That declaration *is* the declarative model. |
| 3 | Per-slot flip bit, not a fixed partition. Read = local, write = remote; each of the three slots carries its own. |
| 4 | Both. Structural `44x²` (constant lift) and positional XOR+popcount (variable). |
