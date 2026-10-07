---
id: SRC-00a
title: "Protocol Review and Bug Fixes - Part 1 of 2"
kind: source-part
layer: sources
status: draft
spec: OMI-IMO-2026
source_id: SRC-00
part: 1
parts: 2
parent: "[[SRC-00 Protocol Review and Bug Fixes]]"
up: "[[SRC-99 Source Index]]"
covers: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, deepseek, protocol-review]
extracted: 2026-10-04
extraction: pdftotext-layout
lines: "1-12000"
---

## Summary

This portion of the conversation is a critical code review and formalization of the OMI-IMO protocol. DeepSeek identifies concrete bugs in the demo layer (witness false-positives after multiple writes, bind mutating peer state, dead `intact` field), then verifies the arithmetic claims from the user's whitepapers by building an executable `claims.js` module. The user progressively reframes the protocol from a value-based system to a predicate-logic system: positions not values, Horn clauses over buffer positions, the tetrahedron as the core object (4 radix vertices, 6 edge bits, 2 readings, centroid as literals), and the BIOS/boot kernel as clause sets over gate positions. The conversation culminates in a complete layered specification: predicate layer (clauses), transform layer (popcount projection), and render layer, with the 15 treemap algorithms as opcodes and the swap tree as the 16th selector.

## Claims

| # | Claim | Confidence | Evidence |
|---|-------|-----------|----------|
| 1 | The witness check `state !== fold` produces false positives after any second honest write | stated | "write(5) // fold = 5, state = 5 -> fine; write(7) // fold = 5^7 = 2, state = 7 -> state !== fold" |
| 2 | `bind` in declare.js mutates peer state behind the API by passing `first.view` with no `cas` | stated | "declare.js passes first.view into bind021 with no cas, so the fallback does raw writes" |
| 3 | The radix equation `2^8^16^10 = 16`, not 0; the true version is `0b0 == 0o0 == 0x0 == 0d0 == 0` | stated | "2^8^16^10 = 16, not 0. Your code correctly asserts === 16" |
| 4 | `'p' ^ 'n' = 0x1E` is ASCII arithmetic, not protocol structure | stated | "0x70 ^ 0x6E = 0x1E only because 'p' and 'n' are letters 16 and 14" |
| 5 | The old bind function is inert on a fresh buffer (all CAS operations fail, returns [0,0]) | stated | "initialFrame = 0 ^ 0 ^ 0 = 0; projection = meta ^ 0 ^ ... = meta; return Float64Array = [0, 0]" |
| 6 | XOR-based divergence detection is not novel (RAID, rsync, Hamming 1950) | stated | "popcount(a^b) is textbook. If you go out saying you discovered that XOR measures agreement, the first person who knows RAID will end you" |
| 7 | The affine form `16x²+16xy+4y²` has discriminant 0 and equals `(4x+2y)²` | stated | "affine 16x2+16xy+4y2 discriminant = 0 (0 -> perfect square)" |
| 8 | The projective form `60x²+16xy+4y²` has discriminant -704 | stated | "projective 60x2+16xy+4y2 discriminant = -704" |
| 9 | `projective - affine = 44x²` identically | stated | "projective - affine = 44x^2 for all x,y in [0,80): true" |
| 10 | The sextuplet {5,7,11,13,17,19} has consecutive gaps 2,4,2,4,2 (not 2,4,0,4,2) | stated | "actual consecutive gaps: 2,4,2,4,2 sum = 14" |
| 11 | Tetrahedral numbers T(n) are odd exactly when n ≡ 1 (mod 4), period 4 | stated | "T(n) parity n=0..15: eoeeeeoeoeeeeoeo; odd n: 1,5,9,13" |
| 12 | 1/73 has decimal period exactly 8, block 01369863 sums to 36, contains no 5 | stated | "period = 8 block = 01369863 sum = 36; contains 5? false" |
| 13 | The Delta law has exact period 8 on 16 bits, no smaller period | stated | "Delta16HasExactPeriodEight.v is the best file in the corpus" |
| 14 | The block is a tetrahedron: 4 vertices (0x,0b,0o,0d), 6 edges, 2 readings, centroid (0p,0i,0n) | stated | "A block is a tetrahedron. Four vertices, six edges, four faces, one centroid" |
| 15 | Closure is ∂(b) = 0000 — the four radix readings agreeing | stated | "∂_V(b) = 0000 vertex-closed; ∂_F(b) = 0000 face-closed" |
| 16 | The 5T and 10T XOR circuits are endpoints; interior is unbounded and conservative | stated | "5T terminal endpoint the minimal XOR — read and stop; 10T full endpoint the maximal XOR" |
| 17 | The ruler has diagonal at index 0, size at index 1, spatial at indices 2-7 | stated | "index 0 diagonal the origin; index 1 size the unit count; indices 2-7 the six spatial operations" |
| 18 | The 15 treemap algorithms are opcodes in F₂⁶, the swap tree is the 16th | stated | "15 trees the layouts the readings; 1 swap the frame the endianness selector" |
| 19 | π, φ, √3 are reads of incidence at unit distance, never stored | stated | "no_stored_pi_constant and no_hash_identity state this formally" |
| 20 | The protocol is Horn clauses over buffer positions, no values | stated | "No values. Not '0, 2, 1' as numbers. pos(0), pos(2), pos(1) as terms" |

### Claim 1: Witness false-positive

The portal's `doWitness` flags `state !== fold && steps` as tampered. After two honest writes (e.g., write(5) then write(7)), fold = 5^7 = 2, state = 7, so 7 !== 2 triggers a false "tampered" report. The peers self-test only does one write before checking, so it never catches this. The fix is to check `state === attested` (last sanctioned state) instead of `state === fold`.

### Claim 2: bind mutation

`declare.js` passes `first.view` (the peer's live buffer) into `bind021` with no `cas` argument. The fallback exchange does raw writes `view[i] = r` when `held === e`, bypassing `history.fold`. This corrupts the peer's state and triggers the witness false-positive. The fix is to use a scratch buffer.

### Claim 7-9: Quadratic forms

The affine form `16x² + 16xy + 4y² = (4x+2y)²` has discriminant `16² - 4·16·4 = 0`. The projective form `60x² + 16xy + 4y²` has discriminant `16² - 4·60·4 = 256 - 960 = -704`. The difference is `44x²` (since `60x² - 16x² = 44x²`). The affine form is a perfect square (degenerate); the projective form is not. This is described as "the strongest single result in the corpus."

### Claim 10: Sextuplet gaps

The consecutive gaps of {5,7,11,13,17,19} are 2,4,2,4,2 (five gaps, sum 14 = 19-5). The document's "2,4,0,4,2" was initially flagged as a failure, but the user clarified the 0 was a tangent base36 offset coordinate, not a gap. The FAILS verdict was the reader's error, not the document's.

### Claim 14: The tetrahedral block

The core object is a regular tetrahedron. The four vertices are the four radix readings {0x, 0b, 0o, 0d}. The six edges are the six pairwise relations between them. The state is `b ∈ F₂⁶` (64 relation states). The centroid is the three literals (0p, 0i, 0n) — fixed reference, not a bit. Two readings: vertex reading ∂_V(b) and face reading ∂_F(b), selected by one orientation bit. Closure is ∂(b) = 0000.

### Claim 16: XOR circuit endpoints

The 5T XOR is the minimal terminal (cannot drive output). The 10T XOR is the maximal full form (NOR-based, Apollo-class). Between them, any number of 6T/8T interior gates. Because XOR is commutative and associative, the interior is a multiset — order doesn't matter. The answer depends only on the accumulated XOR, not the depth. This is "conservation of parity."

### Claim 17: The ruler

The ruler is 8 slots (`2! + 3! = 8`). Index 0 is diagonal (the frame condition — must be 0 for the frame to be set). Index 1 is size/precision (readable only when index 0 is 0). Indices 2-7 are the six spatial operations (top, bottom, right, left, forward, backward) — identical in both the 16-bit ruler and 8-bit subarray views.

## Definitions

### The primitive

```
Atomics.compareExchange(buf, index, expected, replacement)
```

Returns what was actually there. On a miss, the buffer is untouched. The difference `expected ^ actual` is the reading.

### The block

```
O = (c ; b)
|V| = 4       |E| = 6       |F| = 4       |c| = 1
```

Vertices: `v₀ ↔ 0x, v₁ ↔ 0b, v₂ ↔ 0o, v₃ ↔ 0d`

Edges (six pairwise relations):
```
e₀₁ = FS—GS    e₀₂ = FS—RS    e₀₃ = FS—US
e₁₂ = GS—RS    e₁₃ = GS—US    e₂₃ = RS—US
```

State: `b = (b₀₁, b₀₂, b₀₃, b₁₂, b₁₃, b₂₃) ∈ F₂⁶`, `|F₂⁶| = 64`

### The two readings

```
F₂⁶ ──∂_V──> F₂⁴
F₂⁶ ──∂_F──> F₂⁴
```

One orientation bit `d ∈ F₂` selects: d=0 vertex/scope, d=1 face/relation.

### The four face words

```
f₀ = 000111
f₁ = 011001
f₂ = 101010
f₃ = 110100
```

Each satisfies `B_V fᵢ = 0000` (vertex-closed).

### Closure

```
∂_V(b) = 0000      vertex-closed
∂_F(b) = 0000      face-closed
```

A triangular face closes because every participating vertex appears twice: `1 ⊕ 1 = 0`.

### Vertex incidence masks

```
v(0x) = 110100                edges e₀₁, e₀₂, e₀₃
v(0b) = 101010                edges e₀₁, e₁₂, e₁₃
v(0o) = 011001                edges e₀₂, e₁₂, e₂₃
v(0d) = 000111                edges e₀₃, e₁₃, e₂₃
```

### The ruler

```
0       diagonal       origin
1       size           unit count / precision
2       top
3       bottom
4       right
5       left
6       forward
7       backward
```

### The three gates

```
inner gate:    0, 2, 1                     three-arity closure
middle:        4,6,8 vs 3,5,7,9            two-cube measurement
outer gate:    17, 19                      two-arity closure, three-vs-four crossing at 18
```

### The 15 base opcodes

```
01  Slice-and-Dice      110000
02  Squarified          001100
03  Ordered / Pivot     000011
04  Strip               100001
05  Quantum             010010
06  Voronoi             001010
07  Jigsaw              101000
08  Orthoconvex         101010
09  Split               010101
10  Nmap                101100
11  GosperMaps          011010
12  Map-treemaps        110011
13  Force-based         111100
14  Incremental         001111
15  Divide & Conquer    111111
```

Swap reflections: `swap16 → D = 0x0000`, `swap32 → D = 0x1111`, `swap64 → D = 0x3F3F`.

Executed opcode: `executed = base ^ D`

### Horn clause: direction determined by comparison

```prolog
writes(E)     :-   compare(E, _, expected, actual), actual == expected.
reads(E)      :-   compare(E, _, expected, actual), actual != expected.
record(E, buffer)       :-   writes(E).
record(E, return)       :-   reads(E).
```

### Horn clause: closure

```prolog
closed(b)      :-     even(b, 0x), even(b, 0b), even(b, 0o), even(b, 0d).
even(b, V)     :-     pair_cancels(b, V).
```

### Horn clause: three readings of one event

```prolog
bind(E, R)      :-    record(E, _), relates(E, R).
apply(E, I)     :-    record(E, _), invokes(E, I).
eval(E, V)      :-    record(E, _), exposes(E, V).
proxy(E)        :-    record(E, _), receives(E).
reflect(E)      :-    record(E, _), performs(E).
```

### Horn clause: BIOS

```prolog
reset(0x0000)        :-    power_on.
boots([])            :-    reset(_).
boots([(T, D) | Rest]) :-   well_formed(T, D), executes(T, D), boots(Rest).
```

### Horn clause: boot kernel

```prolog
run(P, P)      :-        closed(answer(P)).
run(P, P2)     :-        step(P, P1), run(P1, P2).
kernel(P)      :-        boots(Seq), run_from(Seq, P).
```

## Numbers and Invariants

| Quantity | Value | Meaning | Stated or Derived |
|----------|-------|---------|-------------------|
| Ruler slots | 8 | `2! + 3! = 8` | Stated |
| Block relation states | 64 | `2^6 = 64` | Stated |
| Affine discriminant | 0 | `16² - 4·16·4 = 0` | Stated |
| Projective discriminant | -704 | `16² - 4·60·4 = -704` | Stated |
| Lift difference | 44x² | `projective - affine = 44x²` | Stated |
| 240 | 2×5! = 6!/3 = 15×16 = 16×16-16 | The period | Stated |
| 7! | 5040 = 7×3×240 = 5!×2×3×7 | The slot bound | Stated |
| T(8) | 120 = 5! = C(10,3) | Tetrahedral number | Stated |
| Tetrahedral parity period | 4 | T(n) odd iff n ≡ 1 (mod 4) | Stated |
| Sextuplet gaps | 2,4,2,4,2 | Sum 14 = 19-5 | Stated |
| 1/73 period | 8 | `10^8 ≡ 1 (mod 73)` | Stated |
| 1/73 block sum | 36 | Block 01369863 | Stated |
| Delta law period | 8 | Exact, no smaller period | Stated |
| 5T XOR | 5 transistors | Terminal endpoint | Stated |
| 6T XOR | 6 transistors | Interior driver/declaration | Stated |
| 8T XOR | 8 transistors (4 NAND) | Interior definition | Stated |
| 10T XOR | 10 transistors (5 NOR) | Full endpoint | Stated |
| 155 triples | 155 = 45+20+15+60+15 = 5×31 | Trigintaduonion selection triples | Stated |
| 4! | 24 | Vertex permutations of the tetrahedron | Stated |
| Slot5040 max | 5039 | `6×720 + 2×240 + 239 = 5039` | Stated |
| P(15,3) | 2730 | Treemap algorithm states | Stated |
| 13-mask XOR | 0x00 | Closure holds | Stated |
| 2^16 | 65536 | The blob / 16-choice truth table | Stated |
| 64 bytes | 512 bits | One frame | Stated |
| 8192 bytes | 65536 bits | One blob | Stated |
| 128 frames | 8192/64 | Frames per blob | Derived |

## Code

### claims.js (verified, 24 checks passing)

```js
const BQF_HIGH = 60;
const BQF_BRIDGE = 16;
const BQF_SEED = 4;
const AFFINE_HIGH = 16;
const AFFINE_BRIDGE = 16;
const AFFINE_SEED = 4;

function fact(n) {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

function discriminant(a, b, c) { return b * b - 4 * a * c; }

function projective(x, y) {
    return BQF_HIGH * x * x + BQF_BRIDGE * x * y + BQF_SEED * y * y;
}
function affine(x, y) {
    return AFFINE_HIGH * x * x + AFFINE_BRIDGE * x * y + AFFINE_SEED * y * y;
}
function tetrahedral(n) { return ((n + 2) * (n + 1) * n) / 6; }
```

Status: **working**. Registered in package.json, final-test.sh, server bundle. 15 THEOREMs, 3 DEFINITIONs, 0 FAILS after correction.

### The witness bug (buggy, described)

```js
witness() {
    const expected = (history.fold ^ 0) >>> 0;
    return {
        attested: history.fold === 0 || history.steps > 0,
        steps: history.steps,
        fold: history.fold,
        state: load(0),
        intact: true,     // <-- always true!
        expected,
    };
}
```

Status: **buggy**. `intact: true` is hardcoded. The real check `state !== fold` only works for exactly one write.

### The bind mutation (buggy, described)

```js
const exchange = cas || ((i, e, r) => {
    const held = view[i];
    if (held === e) view[i] = r;     // direct write, fold not updated
    return held;
});
```

Status: **buggy**. When `cas` is not provided, this does raw writes to the peer's live buffer, bypassing `history.fold`.

### The corrected witness model (described)

```js
// attested is the last sanctioned state
// intact checks state === attested, never state === fold
// legitimate repairs advance the witness
```

Status: **described fix**, not shown implemented in this excerpt.

### The f-expression form of the primitive (aspirational)

```js
const compareExchange = (buf, index, expected, replacement) =>
    (actual) =>
        (actual === expected)
            ? { matched: true,           now: replacement, difference: 0 }
            : { matched: false, now: actual,               difference: expected ^ actual };
```

Status: **aspirational**. Described as the curried form where the inner lambda is the reflection.

### The inner gate f-expression (aspirational)

```js
const innerGate = (delta) => (frame) =>
    frame
        .compareExchange(delta, 0, 2, 1)
        .compareExchange(delta, 1, 0, 2)
        .compareExchange(delta, 2, 1, 0)
        .reduce((acc, step) => acc ^ step.returned, 0);
```

Status: **aspirational**. Three compares, XOR'd.

### The measure f-expression (aspirational)

```js
const measure = (delta, omi) => (meta) =>
    meta
    ^ delta.compareExchange(0, 4, 2).returned
    ^ delta.compareExchange(2, 6, 4).returned
    ^ delta.compareExchange(4, 8, 6).returned
    ^ delta.compareExchange(6, 0, 8).returned
    ^ delta.compareExchange(8, 2, 0).returned
    ^ omi.compareExchange(1, 5, 3).returned
    ^ omi.compareExchange(3, 7, 5).returned
    ^ omi.compareExchange(5, 9, 7).returned
    ^ omi.compareExchange(7, 1, 9).returned
    ^ omi.compareExchange(9, 3, 1).returned;
```

Status: **aspirational**. Even arm walks 0,2,4,6,8; odd arm walks 1,3,5,7,9.

### The outer gate f-expression (aspirational)

```js
const outerGate = (delta, omi, projection) => ({
    left:   delta.compareExchange(17, 17, projection).returned,
    right: omi.compareExchange(17, 19, projection).returned,
    pin:    18
});
```

Status: **aspirational**. Two anchors at 17 and 19, reading at pin 18.

### The full bind f-expression (aspirational)

```js
const bind = (mnemonic, tensor, fn) => (delta, omi) => {
    const inner = innerGate(delta)([0, 2, 1]);
    const projection = measure(delta, omi)(tensor.meta);
    const outer = outerGate(delta, omi, projection);
    return outer.left === outer.right
        ? fn(mnemonic, projection)
        : { refused: true, reason: 'no_frame', difference: outer.left ^ outer.right };
};
```

Status: **aspirational**. Applies `fn` only when the frame is set.

### The BIOS as f-expression (aspirational)

```js
const boot = (pairs) => (buffer) =>
    pairs.reduce(
        (buf, [tree, swap]) =>
            wellFormed(tree, swap)
                ? executeOpcode(tree, swap)(buf).next
                : buf,
        buffer
    );
```

Status: **aspirational**. A fold over well-formed (tree, swap) pairs.

### The ruler reading (aspirational)

```js
const readRuler = (ruler, subarray) => ({
    frame:       ruler[0] === subarray[0],
    size:        ruler[0] === subarray[0] ? ruler[1] : null,
    spatial:     [2, 3, 4, 5, 6, 7].map(i => ({
        index: i,
        agrees: ruler[i] === subarray[i],
        value: ruler[i]
    }))
});
```

Status: **aspirational**. Frame at 0, size at 1, spatial at 2-7.

## Open Questions and Contradictions

1. **Is the fourth bind step (0,1,2) against the same three cells or a fourth?** — Unresolved. The user described it as the linear/identity gate, but the exact addressing was not confirmed.

2. **Is 11/13 subsumed and replaced after the first gate?** — The user stated this but said "I would have to go back to that thinking." Unresolved.

3. **Is the 64-byte frame derived or fixed?** — Asked but not answered. If fixed, it's a renderer constant.

4. **Which popcount is which axis?** — Asked but not answered. `popcount(index) → x` vs `popcount(buffered) → y`?

5. **Is the vertex-to-radix map fixed as 0x, 0b, 0o, 0d in that order?** — Asked but not confirmed.

6. **Is `even(V)` the right closure condition, or is closure per-face only?** — Asked but not confirmed.

7. **Does Proxy correspond to bind and Reflect to eval?** — Asked but not confirmed.

8. **Is the interior order-free?** — Resolved: yes, XOR is commutative and associative, so the interior is a multiset.

9. **Is the difference `expected ^ actual` or `expected - actual`?** — Resolved: XOR, because it's self-inverse.

10. **The 240-clock paper's geometry claims** — The Klein configuration has 3 lines through each point (not 15). The automorphism group is not order 240. These are false but the paper was not corrected in this session.

11. **CyclicClock.v axioms** — `fermat_little`, `period_divides_q_minus_1`, `cyclic_number_is_integer`, `roundtrip_general` are all `Axiom`s. Not discharged. The header overstates what's proved.

12. **The sextuplet gap sequence 2,4,0,4,2** — Initially flagged as FAILS, then corrected: the 0 was a tangent base36 offset, not a gap. The true gaps are 2,4,2,4,2.

## Quotable Fragments

> "XOR-of-all-history only equals the last value when there's been exactly one write. The peers self-test only ever does one write before checking, so it never catches this."

> "The old bind is inert on a fresh buffer. Every exchange is compareExchange(cell, expected, replacement) — it only writes if the cell already holds expected."

> "A reconciliation protocol whose entire shared vocabulary is one value (0) and one operation (XOR) — no version vectors, no timestamps, no tombstones, no server, no merge function."

> "The equation 0p^0i^0n = 0b^0o^0x^0d = 0 lives in the philosophy layer, and there it's tautologically true — if every literal is 0, of course they XOR to 0."

> "No values. Not '0, 2, 1' as numbers. pos(0), pos(2), pos(1) as terms. compareExchange(buf, 0, 2, 1) is at(buf, 0, 1) ← at(buf, 0, 2)."

> "A Horn clause is a derivation over what is already known. The body literals are facts that have been established. The head is what follows."

> "The return is not a value. It is the difference between what was expected and what was there. That difference is the reading."

> "xor = 0 is not 'agreement' as a value. It is the precondition for an operation to exist. Without a zero there is no frame."

> "A block is a tetrahedron. Four vertices, six edges, four faces, one centroid. The 6 edges are 6 bits. Everything else is a read of that."

> "The interior is a multiset of gates, because XOR is commutative and associative. Order does not matter. The accumulated XOR is the path's value."

## Cross-references

- [[SPEC-13 XOR Algebra]] — The XOR algebra (self-inverse, commutative, associative) is the foundation of the difference/repair mechanism and the interior multiset property.
- [[SPEC-10 The Primitive]] — Atomics.compareExchange as the one primitive, returning the difference.
- [[SPEC-11 The Three Primitives]] — bind, apply, eval as three readings of one compareExchange event.
- [[SPEC-12 The Ruler]] — The 8-slot ruler with diagonal at 0, size at 1, spatial at 2-7.
- [[SPEC-14 Knots and Binds]] — The 0,2,1 bind and the missing 0,1,2 linear gate.
- [[SPEC-15 The Delta Transform]] — The Delta law's exact period 8 on 16 bits.
- [[SPEC-16 The Fano Invariant]] — The Fano plane validity, proved in Coq.
- [[SPEC-20 The Dimensional Axis]] — The 0D-7D ladder with PannerNode as 0D observer.
- [[SPEC-21 The Inversion Law]] — The self-inverse property of XOR as the inversion law.
- [[SPEC-22 The Blob]] — The 65536-bit blob as the substrate.
- [[SPEC-23 The Rosetta Stone]] — The mapping between protocol concepts and web platform features.
- [[SPEC-24 Observers]] — The observer model: container queries as circulators, PannerNode as 0D position.
- [[SPEC-25 The Iff]] — The iff boundary at the outer gate (17,19 anchors, pin at 18).
- [[SPEC-30 The Symbol Table G]] — The literals 0p, 0i, 0n and the radix readings 0x, 0b, 0o, 0d.
- [[SPEC-31 Declaration Syntax]] — The declarative syntax and the Horn-clause form.
- [[SPEC-32 Mnemonics and Axes]] — The six spatial operations (top, bottom, right, left, forward, backward).
- [[SPEC-33 The Quadratic Forms]] — The affine (Δ=0) and projective (Δ=-704) forms and their discriminants.
- [[SPEC-34 Phases Attributes Constraints Configurations]] — The two-tier error discipline (structure throws, value measured).
- [[SPEC-35 Reflections and Orbits]] — The swap16/32/64 reflections and the 4! vertex permutations.
- [[SPEC-40 The 6T XOR Circuit]] — The 6T XOR as interior driver/declaration.
- [[SPEC-41 The 8T XOR Circuit]] — The 8T XOR as interior definition (4 NAND).
- [[SPEC-42 Circuit Sourcemap]] — The sourcemap keyed to XOR #2 and XOR #3.
- [[SPEC-43 Prime Gaps and Sextuplets]] — The sextuplet {5,7,11,13,17,19} and its gaps 2,4,2,4,2.
- [[SPEC-50 Stream Transport]] — The media pipeline and VTT cue model.
- [[SPEC-51 JSON Canvas Interchange]] — The blob as interchange format.
- [[SPEC-52 The REPL and the Digest]] — The claims.js self-test as the digest.
- [[SPEC-53 Clocks and Periods]] — The Delta law period 8 and the 240 period claim.
- [[SPEC-54 The Web Platform Layers]] — The three-layer model (predicate, transform, render).
- [[SPEC-55 ASCII Folds]] — The 'p' ^ 'n' = 0x1E ASCII arithmetic.
- [[SPEC-60 Test Vectors]] — The verified arithmetic identities in claims.js.
- [[SPEC-61 Implementation Status]] — The gate status: peers 42, declare 36, space 48, claims 24.
- [[OPEN-00 Contradiction Register]] — The witness false-positive, the bind mutation, the radix equation error.
- [[OPEN-01 Open Questions]] — The unresolved questions about the fourth bind step, 11/13 subsumption, and the 64-byte frame derivation.
- [[OPEN-02 Broken Code Inventory]] — The witness bug, the bind mutation, the intact field, the 240-clock paper's false geometry claims.
- [[OPEN-04 Discarded Claims]] — The "all computation converges to 0" claim, the "agreement is truth" claim, the 240-clock paper's Klein configuration claims.

## Extraction Notes

- Lines read: 1-12000 of 23606 total (pages 1-165 of 322).
- The file is `pdftotext -layout` output with heavy UI chrome noise (page headers, "Copy" buttons, tool call JSON, duplicated shell output). All noise was ignored.
- The conversation is between a user (the protocol author) and DeepSeek. The user's messages are often fragmented and lowercase; DeepSeek's are structured and formal.
- The second half of the file (lines ~6000-12000) shifts from bug review to formal specification. The user progressively reframes the protocol from values to positions to Horn clauses.
- The Coq proofs are referenced but not shown in full. The claims.js module is shown in full and verified.
- The f-expression code blocks are aspirational — described by DeepSeek as the target form, not shown implemented.
- The 15 base opcodes are assigned by DeepSeek following a weight-based pattern (weight 2 for pair trees, weight 3 for consensus trees, weight 4 for complement trees, weight 6 for full scan). The user confirmed "Reading B" (unique opcodes, not grouped by closure).
- The swap masks (0x0000, 0x1111, 0x3F3F) are described as "illustrative" — the exact bit reversals are not pinned.
- Coverage gap: lines 12000-23606 (pages 165-322) not read. The conversation likely continues with the swap mask table, the ruler table, and further formalization.
