---
id: SRC-01a
title: "XOR Tetrahedron Transform - Part 1 of 2"
kind: source-part
layer: sources
status: draft
spec: OMI-IMO-2026
source_id: SRC-01
part: 1
parts: 2
parent: "[[SRC-01 XOR Tetrahedron Transform]]"
up: "[[SRC-99 Source Index]]"
covers: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, deepseek, xor, tetrahedron]
extracted: 2026-10-04
extraction: pdftotext-layout
lines: "1-13500"
---

## Summary

This is the first half (PDF pages ~1–179) of a 357-page ChatGPT/DeepSeek transcript in which the user (Brian) reconstructs a lost conversation about an "XOR Tetrahedron Transform." DeepSeek supplies long formalized answers; the user repeatedly corrects them. The major content clusters are: (1) a tetrahedral/ESP32-S3 framing built from the 5-point generalized F-mean, the 5T/6T/8T/10T transistor XOR variants, and the binary quadratic form `60x² + 16xy + 4y²` vs `16x² + 16xy + 4y²`; (2) a three-clock mapping (240 MHz ESP32 crystal, 44,100 Hz audio, 60 fps) with the "missing prime 7" smuggled in through `44,100 = 210²`; (3) "The Grand Reduction," a Coq-laden derivation chain from transistors through BQF, prime gaps, the cyclic numbers 1/7 and 1/73, the period-8 delta law, the Fano plane, diagonal accumulator/π, encapsulation mapping, and an "annihilation identity"; (4) the `0x/0b/0o/0d` popcount precision layer and the 6-axis measurement; (5) a synthesis of "the OMI-IMO Protocol" as an Atomic Compare-and-Exchange Lisp with three primitives (bind/apply/eval), an 8-slot ruler, an F-mean digest, 16 dimensions, and a canonical statement; (6) the `0p`/`0n`/`0i` scalar literal type system, its regexes and a full 0p specification; (7) a coding-agent review that catches concrete bugs (broken `decodeBase36`, a Fano duplicate, a 62-vs-64 alphabet mismatch, byte-order errors, dead `Atomics` code); (8) the "pinch point" correction that 0p is an integer position and the Hamming distance is what is tracked; (9) the blackboard/Latin-square distributed-declaration model; and (10) the treemap-automaton (`Q` as the 16th algorithm, `P(15,3) = 2730`). DeepSeek's formal glosses are often plausible but frequently overreach; the user's own corrections and the coding agent's arithmetic review are the most reliable content.

## Claims

| # | Claim | Confidence | Evidence |
|---|---|---|---|
| 1 | A regular tetrahedron is built from the 5 points of the generalized F-mean, the 5th acting as centroid; generalizing with 6, 8, 10 gives {1,2,3,4,7} and 9 as controller/observer | stated | "a regular tetrahedron can be constructed from the 5 points that define the generalized F-mean, where that 5th point acts as the centroid" |
| 2 | Ten toggles run until 0 because 9 is "irrational" and never resolves into the binary/factorial lattice | stated | "9 is irrational ... it forces a toggling dynamic" |
| 3 | Four transistor-level XOR realizations (5T, 6T, 8T, 10T) can compute any state and their counts are the geometric delineation points | stated | "with these 4 variants, we can compute any state" |
| 4 | 5T = NAND + switch + OR-like (standalone, no fan-out); 6T adds inverter (full fan-out); 8T = 4 NAND gates × 2T; 10T = 5 NOR gates × 2T (Apollo style) | stated | "XOR 4  10T  5 NOR gates × 2T  (Apollo Guidance Computer style)" |
| 5 | The 240 MHz ESP32 crystal factors as 15 × 16 = 16² − 16 | derived | "15 × 15 + 15 = 15 × 16 = 240" |
| 6 | `15x² = 11x² + 4x²` is where the 90° (right angle) emerges | stated | "15x² = 11x² + 4x²" |
| 7 | 44,100 = 210² = (2·3·5·7)²; 240 and 60 carry no factor of 7 | derived | "44,100 = 2² × 3² × 5² × 7² = (2·3·5·7)² = 210²" |
| 8 | 33,600 = 44,100 × 16/21, but it is a derived marker, not a real audio crossover rate | contradicted | "There is no industry 33.6k crossover frequency" |
| 9 | 1/7 has period 6 (cyclic number 142857); 1/73 has period 8 with repetend [0,1,3,6,9,8,6,3] summing to 36 | stated | "1/73 = 0.01369863013698630... Period: 8" |
| 10 | `delta16` has exact period 8, formally verified in Coq | stated | "delta16_001d_has_exact_period_8" |
| 11 | Affine `16x² + 16xy + 4y² = (4x + 2y)²` has Δ = 0; projective `60x² + 16xy + 4y²` has Δ = −704 | derived | "16x² + 16xy + 4y²   =   (4x + 2y)²    Δ = 0" |
| 12 | The lift from affine to projective is `60x² − 16x² = 44x² = 4 · 11x²` | derived | "60x² - 16x² = 44x² = 4 · 11x²" |
| 13 | Diagonal constants dplus {0,5,10,15} and dminus {3,6,9,12} each XOR to 0; their total sum is 60 | derived | "dplus0 + dplus1 + dplus2 + dplus3 + (dminus0 + ... + dminus3) = 60" |
| 14 | π emerges from the Leibniz alternating series via the diagonal accumulator | stated | "OMI_PI_FROM_DIAGONAL_ACCUMULATOR_EQUALS_PI" |
| 15 | Encapsulation pairs map to transistor variants `()↔5T, []↔6T, {}↔8T, <>↔10T`, walked by `0x28 − 5n` / `0x29 + 5n` | stated | "0x28 − 5n = (        for n = 0, 1, 2, ..." |
| 16 | Annihilation identity: `3! × (6T,8T,10T) × ([],<>,{},()) & (alphanumeric) = 0` iff alphanumerics present | stated | "3! × (6T, 8T, 10T) × ([], <>, {}, ()) & (^/[A-Z]/g ^ /[a-z]/g ^ /[0-9]/g ^) = 0" |
| 17 | The four radices are four readings of one popcount invariant; their values sum to 2+8+10+16 = 36 = 6² = (3!)² | derived | "2 + 8 + 10 + 16 = 36 = the digit sum of 1/73" |
| 18 | `0n` is the numerical scalar (JS BigInt); `0p` is the positional scalar ("Poisson point") | stated | "0n is the literal number — the BigInt type in JavaScript" |
| 19 | `{0p,0n} × {0b,0o,0x,0d} = 8` — the product is the 8-slot ruler | derived | "{0p, 0n} × {0b, 0o, 0x, 0d} = 8 slots" |
| 20 | The canonical atomic regex is `/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/`; the optional dot is the Fano 7th point | stated | "/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/" |
| 21 | 0p is a scalar integer, not a ratio; the ratio `0n/0p` or `0p/0n` is an operation on two scalars | stated | "0p is a scalar and scalars are integers. the ratio is 0n/0p or 0p/0n" |
| 22 | ASCII is a Hamming-distance structure; control codes were positioned to maximize Hamming distance | stated | "positioned to maximize the Hamming distance between their bit patterns" |
| 23 | The Hamming distance is the pinch point of the Fano plane; distance = `popcount(0p XOR 0n)` | stated | "the hamming distance is what we are traking its the pinch point of the fano plane" |
| 24 | The blackboard is written via `Atomics.compareExchange` and structured as tables of Latin squares; it validates no truth | stated | "atomics.compareExchange of the blackboard pattern using tables of latin squares" |
| 25 | In a Latin square any two rows differ in every position (and likewise columns) — maximum Hamming distance | stated | "Any two rows differ in every position" |
| 26 | The protocol is for distributed networking of declarations and definitions | stated | "we are making a protocol, for distributed networking of declarations and definitions" |
| 27 | After shared algorithms, syntax, and data representation, only shared wordforms remain, over a doubly-linked-list swap space | stated | "we only need shared wordforms, and with a doubly linked list swap space" |
| 28 | Every wordform is a `(0n, 0p)` vector; distances combine Pythagorean-style: `d_total² = d_p² + d_n²`; slope = `0n/0p` | stated | "distance²(A, B) = distance²(0p_a, 0p_b) + distance²(0n_a, 0n_b)" |
| 29 | `0i` is the index scalar; ruler indices 0,1 are spectral and 2–7 spatial; the coordinate has 16 indices (0–7 local, 8–15 shared) | stated | "Indices 0–7     →   local space / Indices 8–15    →   shared space" |
| 30 | The `0i` is the "zero polynomial expression"; the regex ascertains polynomial order from text context | speculative | "The 0i is now the 0 polynomial expression/function" |
| 31 | Balance equation `0p ^ 0i ^ 0n = 0b ^ 0o ^ 0x ^ 0d`; both sides are empty sets of logical relations/codepoints | stated | "0p ^ 0i ^ 0n   =   0b ^ 0o ^ 0x ^ 0d   =   0" |
| 32 | 0x precedes 0d because nibbles bridge the tetrahedral diagonals (4 vertices=4 bits, 6 edges, 4 faces) | stated | "I keep putting the 0x before the 0d because we use nibbles" |
| 33 | Read mode maps to the 16x² (radices); write mode maps to the 60x² (scalars); `16xy + 4y²` is the bridge | stated | "0b, 0o, 0x, 0d       →     16x²" |
| 34 | `Q(x,y)=60x²+16xy+4y²` is the 16th treemap algorithm, pinned always-active at slot 0; any 3 of the other 15 are selectable | stated | "I want my Q(x,y)=60x²+16xy+4y² algorithm to be the 16th" |
| 35 | The automaton's state space is ordered `P(15,3) = 2730 = 455 × 3!` | derived | "P(15,3) = 2730" |
| 36 | Both the 44x² structural gap and the XOR+popcount positional gap feed the automaton | stated | "the 44x² is the structural discrepancy, the XOR is the positional discrepancy" |
| 37 | X = data source, Y = data target; `bind(X,Y)` sets a boundary and constraints reveal structure | stated | "X = data source and Y = data target" |
| 38 | Three spaces: binding {0,2,1}, application {3,5,7,9} vs {4,6,8}, evaluation {17,19}; the response lands at index 18 | stated | "Binding space:       0, 2, 1" |
| 39 | Anything referenceable by a truth table normalizes to the 16 positions; `!p @I #n == 16b*16o*16x*16d == 65536` | speculative | "normalizes all data to the 16 positions of the full coordinate" |
| 40 | The only shared literal is 0; the only shared operation is XOR; the reference space is `/0[boxd]/` | stated | "The only shared literal is 0" |
| 41 | Agreement is the closest thing to truth in a 3D context; agreement is Hamming distance 0 | stated | "agreement is the closest thing to truth in a three-dimensional context of reality" |
| 42 | The bind function answers "is this 0, 1, or 2?" in the order 0, 2, 1 | stated | "it answers the question is this 0 and 1 or 2. 021" |
| 43 | Binary computation space is finite 0; "is" is always 0 | stated | "Binary computation space is finite 0. Is is always 0" |
| 44 | `decodeBase36` is broken: `'a'` maps to 10, colliding with `'A' → 10`; the offset should be 61 (36–61) | stated | "decodeBase36 is broken — 'a' maps to 10, colliding with 'A' → 10" |
| 45 | The alphabet is 62 symbols (0-9A-Za-z), not 64; 64 only works as the 2⁶ address frame with 2 reserved slots | stated | "Alphabet = 62 symbols ( 0-9A-Za-z ), not 64" |
| 46 | The Fano set had a duplicate `0d`; the fix `{0p,0n,0b,0o,0x,0d,·}` makes the dot the literal 7th point | stated | "{0p, 0n, 0b, 0o, 0x, 0d} ∪ {·} = 7 distinct points" |
| 47 | The spec byte order is wrong on little-endian: `Int8Array[0]` is the LOW byte; 0x00A5 reads as high=−91, distance=23296 | stated | "Int8Array[0] is the LOW byte; 0x00A5 reads as high=-91, distance=23296" |
| 48 | The user corrects DeepSeek's "only invariant is the speed of light": that is an assumption; the protocol is outside time and pure logic | stated | "This is outside of time, it just all logic." |
| 49 | The user reports ~60 repos / ~25 published tested projects and >80 hours/week for two years | stated | "I spent more than 80 hours a week every week for the past two years" |
| 50 | The claim that the BQF is "the unique quadratic form" respecting the clock, π, and Fano is asserted, not proved | speculative | "it is the unique quadratic form that" |

### C1. The four transistor XOR variants and the Grand Reduction chain

DeepSeek attributes the four realizations to "Cody Wabiszewski's breadboard constructions (Global Science Network, July 2024)" using NPN BJTs (2N2222 or 2N3904):

```
XOR 1   5T    NAND + switch + OR-like       None (standalone)
XOR 2   6T    Same + output inverter        Full
XOR 3   8T    4 NAND gates × 2T             Full
XOR 4   10T   5 NOR gates × 2T              Full (Apollo Guidance Computer)
```

All four share the XOR truth table. The reduction chain is presented as Layer 0 (physical) → Layer 1 (electrical: V=x², I=xy, R=y²; RC linear, LC quadratic) → Layer 2 (BQF) → Layer 3 (prime gaps) → Layer 4 (cyclic numbers) → Layer 5 (Fano plane) → Layer 6 (diagonal accumulator/π) → Layer 7 (encapsulation) → Layer 8 (alphanumerics) → Layer 9 (annihilation). The load-bearing arithmetic is `15x² = 11x² + 4x²`, `240 = 15 × 16 = 16² − 16`, and `4(15x² + 4xy + y²)`. The document claims every link is "either formally verified in Coq or directly observable on a breadboard," but the Coq files are the user's and the transistor→BQF mapping is analogical.

### C2. The BQF pair and the 44x² lift

```
Affine:     16x² + 16xy + 4y² = (4x + 2y)²   Δ = 0
Projective: 60x² + 16xy + 4y²                Δ = −704
```

Worked discriminants from the transcript: Δ(Q16) = 16² − 4·16·4 = 256 − 256 = 0; Δ(Q60) = 16² − 4·60·4 = 256 − 960 = −704. The difference is

```
60x² - 16x² = 44x² = 4 · 11x²
```

with 4 = "the local seed" and 11 = "the occlusion prime." The transcript also ties the 16xy term to the 44,100 Hz carrier and the 4y² term to the 60 fps unit cycle, and notes that y² "has no same-degree partner," so isolating 11x² abandons y (and the 60 fps anchor). The "Q is the only one of the 15 treemap algorithms that is not a perfect square" claim is stated later but only asserted here.

### C3. Cyclic numbers, the period-8 delta law, and π

The genesis is two cyclic numbers. `1/7 = 0.142857142857...` (period 6, cyclic number 142857, multiples are cyclic rotations). `1/73 = 0.013698630...` (period 8, repetend `[0,1,3,6,9,8,6,3]`, digit sum 36, `10⁸ mod 73 = 1`). The delta rolling law is the sole state-changing operation:

```
delta16(x, c) = mask16( lxor( lxor( lxor(rotl16 x 1) (rotl16 x 3)) (rotr16 x 2)) c )
```

verified to have exact period 8 (`delta16_001d_has_exact_period_8`, constant `0x1D1D`). The diagonal accumulator's constants `dplus {0,5,10,15}` and `dminus {3,6,9,12}` each XOR to zero and sum to 60, and the alternating phase schedule reproduces the Leibniz series `1 − 1/3 + 1/5 − 1/7 + ... = π/4`. The explicit error bound is `Rdist (omi_pi_partial n) OMI_PI <= 4 / INR (2 * n + 1)`.

### C4. The 0p/0n/0i scalar type system

`0n` is the numerical scalar (JS BigInt), `0p` the positional scalar (named from the Poisson point process), `0i` the index scalar. The frame `{0p,0n}` has 2 elements (the iff), the notation content `{0b,0o,0x,0d}` has 4, and their product is the 8-slot ruler. The combined literal is `0p<radix><digit>0n`. Internal representation is a `Uint16Array(1)` read as two signed `Int8Array` subarrays. The user's correction is decisive: **0p is not a ratio — it is an integer position; the ratio `0n/0p` is an operation.** The canonical atomic regex was narrowed to `/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/`, where the optional dot is the literal Fano 7th point. The `0i` literal names a ruler slot: indices 0,1 are spectral; 2–7 spatial; the full coordinate has 16 indices (0–7 local ASCII rows, 8–15 shared). The user frames this as algebraic geometry (variety = ruler, points = scalars, relations = XOR, metric = Hamming).

### C5. ASCII as a Hamming-distance grid and the pinch point

The user's Wikipedia observation drives this section: ASCII control codes were "positioned to maximize the Hamming distance between their bit patterns." Digits `0x30–0x39` are `011 + BCD`; uppercase `0x41–0x5A` is one contiguous 64-character-alphabet block; lowercase `0x61–0x7A` differs from uppercase by exactly bit 5; space `0x20` is the pinch point separating control (`0x00–0x1F`) from graphics. DeepSeek formalizes the Fano 7 points as the non-zero 3-bit patterns `001..111` with `000` as the origin/pinch, and states `distance = popcount(0p XOR 0n)`. The user's phrasing is "the hamming distance is what we are tracking, it's the pinch point of the fano plane."

### C6. Blackboard, Latin squares, and distributed declarations

The protocol is reframed as a shared-representation system with no truth value: data "either is or isn't," and agents "triangulate with the expectations." The shared space is a blackboard written atomically via `Atomics.compareExchange(blackboard, position, expected, replacement)`, structured as tables of Latin squares so any two rows (or columns) differ in every position. Declarations are `0p[position] = [scalar]`; definitions are `define 0p[position] := [meaning]`. The protocol carries declarations and definitions but does not validate, enforce, resolve conflicts, or determine truth.

### C7. Pythagorean wordforms and the doubly-linked streaming model

Every wordform is a `(0n, 0p)` pair — a vector in the (number, position) plane. Comparison is per-axis plus cross-product:

```
Δ0p = 0p_a XOR 0p_b      d_p = popcount(Δ0p)
Δ0n = 0n_a XOR 0n_b      d_n = popcount(Δ0n)
d_total² = d_p² + d_n²
slope = 0n / 0p
```

After shared algorithms, syntax, and data representation, only shared wordforms remain. The blackboard is a doubly-linked-list swap space; each agent's singly-linked streaming view is a directional projection of it; the structure is decentralized and pseudo-persistent. (The Pythagorean step is analogical: 0p and 0n are integers, not orthogonal Euclidean lengths.)

### C8. The treemap automaton (Q as the 16th algorithm)

The user wants `Q(x,y)=60x²+16xy+4y²` to be a 16th "meta-algorithm" and entry point into the 15 treemap algorithms (Slice-and-Dice, Squarified, Ordered/Pivot, Strip, Quantum, Voronoi, Jigsaw, Orthoconvex, Split, Nmap, GosperMaps, Map-treemaps, Force-based, Incremental, Divide & Conquer). Slot 0 is pinned to Q; slots 1–3 hold three of the other 15, giving ordered `P(15,3) = 15·14·13 = 2730 = 455 × 3!`. The discrepancy is dual: structural `44x²` (constant lift) and positional XOR+popcount (variable). DeepSeek explicitly rejects the false correspondence "15 algorithms ↔ 15 modules" (the test suite has 19 modules). The genuine correspondences given are `16xy ↔ 15+Q`, `4y² ↔ 4 active slots`, `60x² ↔ Q pinned`, `44x² ↔ 60−16`, `2730 ↔ 455 × 3!`.

## Definitions

**The two binary quadratic forms (verbatim):**

```
BQF(x, y) = 60x² + 16xy + 4y²
BQF(x, y) = 4(15x² + 4xy + y²)
Affine:     16x² + 16xy + 4y² = (4x + 2y)²   Δ = 0
Projective: 60x² + 16xy + 4y²                Δ = −704
```

**The delta law (verbatim, two spellings):**

```
Definition delta16 (x c : N) : N :=
  mask16 (N.lxor (N.lxor (N.lxor (rotl16 x 1) (rotl16 x 3)) (rotr16 x 2)) c).
```

```
delta16(x, c) = mask16(rotl16(x,1) ⊕ rotl16(x,3) ⊕ rotr16(x,2) ⊕ c)
```

**The generalized F-mean (digest):**

```
M_p(x_1, ..., x_n) = ( (1/n) Σ x_i^p )^(1/p)
```

**The Hamming / logical distance:**

```
distance(A, B) = popcount(A XOR B)
```

**The balance equation:**

```
0p ^ 0i ^ 0n   =   0b ^ 0o ^ 0x ^ 0d   =   0
```

**The G regex-constrained vocabulary (verbatim, from the Synthesis; note this differs from the later 7-gate table):**

```js
const G = Object.freeze({
      FRONT:        /^[A-Za-z0-9:+]$/,
      BACK:         /^[A-Za-z0-9.\-]$/,
      INSIDE:       /^[A-Za-z0-9_]$/,
      OUTSIDE:      /^[^A-Za-z0-9_]$/,
      UP:           /^[A-Z_]$/,
      DOWN:         /^[a-z_]$/,
      DEFLECT:      /^([^".]+):\1$/,
      REFLECT:      /^([".]+):\1$/,
      INFLECT:      /^([".]+):([".]+):\2:\1$/,
      AXIS:         /^(\d\d)[A-Za-z_](\d\d):\2[0-9+\-]\1$/,
      MNEMONIC:     /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/,
      PALINDROME:/^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/
});
```

**The canonical atomic port regex (verbatim, several spellings):**

```
/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/
/[np]A-Za-z0-9[\.]A-Za-z0-9[np]/
/[np]\d[\.]\d[np]/
```

**The 0p/0n TLV regex family (verbatim):**

```
/0p[\d][boxd][\d]0n/
/0[pn][boxd]0[np]/
/0p[\d][^\d]0[b,o,x,d][^\d][\d]0n/
/[0][pn]\d[boxd]\d[0][np]/
/[A-Za-z0-9][pn]\d[boxd]\d[np][A-Za-z0-9]/
/[np].[d].[np]/
/0p\d+/
/0p0[boxd][0-9a-fA-F]+/
/0p[+-]?\d+\.\d+/
/0p[A-Za-z0-9]+\.[A-Za-z0-9]+/
/0p[A-Za-z0-9]+\.[A-Za-z0-9]+0n/
/0n[A-Za-z0-9]+\.[A-Za-z0-9]+0p/
```

**The alphanumeric extended forms (verbatim):**

```
/[np]A-Za-z0-9[\.]A-Za-z0-9[np][+-]/
/[np]A-Za-z0-9[\.]A-Za-z0-9[np]:[0-9A-F]{2}/
/[np]A-Za-z0-9[\.]A-Za-z0-9[np]@[0-9]{2}/
/[A-Za-z0-9][np]A-Za-z0-9[\.]A-Za-z0-9[np][A-Za-z0-9]/
```

**The 0i regex forms (verbatim):**

```
/^[pni][0-9A-Za-z]\.?[0-9A-Za-z][pni]$/
/^[i][0-9A-Za-z]$/
/^[pn][0-9A-Za-z][i][0-7]\.?[0-9A-Za-z][np]$/
```

**The 0p TLV grammar (verbatim):**

```
<tlv>           ::= <literal-anchor> <scalar-type> <magnitude> <radix> <precision> <literal-anchor> <scalar-type>
<literal-anchor>     ::= "0"
<scalar-type>        ::= "p" | "n"
<magnitude>          ::= <digit>
<radix>              ::= "b" | "o" | "x" | "d"
<precision>          ::= <digit>
<digit>              ::= "0" | "1" | ... | "9"
```

**Coq: BQF decomposition (verbatim):**

```coq
Definition bqf_high_shell (x : N) : N := 60 * x * x.
Definition bqf_chiral_bridge (x y : N) : N := 16 * x * y.
Definition bqf_local_seed (y : N) : N := 4 * y * y.

Definition bqf (x y : N) : N :=
  bqf_high_shell x + bqf_chiral_bridge x y + bqf_local_seed y.

Theorem bqf_decompose : forall x y : N,
  bqf x y = 4 * (15 * x * x + 4 * x * y + y * y).
```

**Coq: period-8 delta theorem (verbatim):**

```coq
Theorem delta16_001d_has_exact_period_8 :
  forall x,
      word_iter 8 constant_001d x = x /\
      forall k : nat,
         k = 1%nat \/ k = 2%nat \/ k = 3%nat \/ k = 4%nat \/
         k = 5%nat \/ k = 6%nat \/ k = 7%nat ->
         word_iter k constant_001d x <> x.
```

**Coq: cyclic-number step recovery (verbatim):**

```coq
Definition cyclic_number (q period : nat) : nat :=
  (pow10 period - 1) / q.

Definition encode_step (q period k : nat) : nat :=
  let R := cyclic_number q period in
  let M := cyclic_modulus period in
  (R * k) mod M.

Definition recover_step (q period : nat) (B : nat) : option nat :=
  let R := cyclic_number q period in
  let R_mod_q := R mod q in
  match modinv R_mod_q q with
  | None => None
  | Some inv =>
         let k := (B mod q * inv) mod q in
         if Nat.eqb k 0 then Some q else Some k
  end.

Theorem roundtrip_q7 :
  forall k, 1 <= k <= 6 ->
  recover_step 7 6 (encode_step 7 6 k) = Some k.
```

**Coq: 1/73 constants (verbatim):**

```coq
Definition repetend73 : list N := [0; 1; 3; 6; 9; 8; 6; 3].

Theorem repetend73_length8 : length repetend73 = 8%nat.
Theorem repetend73_sum36 : fold_left N.add repetend73 0 = 36.
Theorem rem73_8_returns_to_one : rem73_8 = 1.
Theorem block_period_8 : ((10 ^ 8 - 1) mod 73 = 0)%N.
Theorem derived_base36_from_73_is_36 : derived_base36_from_73 = 36.
```

**Coq: Fano plane (verbatim):**

```coq
Definition fano_points : list N := [0; 1; 2; 3; 4; 5; 6].

Definition fano_lines : list fano_line :=
  (0, 1, 2) ::
  (0, 3, 4) ::
  (1, 3, 5) ::
  (1, 4, 6) ::
  (2, 3, 6) ::
  (2, 4, 5) ::
  (0, 5, 6) ::
  nil.

Definition fano_selector (n : nat) : N := N.of_nat (n mod 7)%nat.
```

**Coq: diagonal accumulator (verbatim):**

```coq
Definition dplus0 : N := 0.       Definition dplus1 : N := 5.
Definition dplus2 : N := 10. Definition dplus3 : N := 15.

Definition dminus0 : N := 3.       Definition dminus1 : N := 6.
Definition dminus2 : N := 9. Definition dminus3 : N := 12.

Theorem dplus_xor_zero :
     poly_xor4 dplus0 dplus1 dplus2 dplus3 = 0.
Theorem dminus_xor_zero :
     poly_xor4 dminus0 dminus1 dminus2 dminus3 = 0.
Theorem diag_sum_3c :
     dplus0 + dplus1 + dplus2 + dplus3 +
     (dminus0 + dminus1 + dminus2 + dminus3) = 60.
```

**Coq: popcount / precision / 6-axis (verbatim):**

```coq
Fixpoint popcount (n : N) (fuel : nat) : nat :=
  match fuel with
  | O => 0
  | S fuel' =>
         (if N.testbit n 0 then 1 else 0) +
         popcount (N.shiftr n 1) fuel'
  end.

Definition precision (x : N) : nat :=
  popcount x 16.

Definition axis_xor (a b : N) : N := N.lxor a b.

Definition measure_6_axes (x y z p q r : N) : N :=
  N.lxor (N.lxor (N.lxor x y) (N.lxor z p)) (N.lxor q r).
```

**Coq: radix independence / annihilation (verbatim — note the trivial definitions and `Admitted`):**

```coq
Definition read_hex (x : N) : N := x.
Definition read_bin (x : N) : N := x.
Definition read_oct (x : N) : N := x.
Definition read_dec (x : N) : N := x.

Theorem radix_independence : forall x : N,
  popcount (read_hex x) = popcount (read_bin x) /\
  popcount (read_bin x) = popcount (read_oct x) /\
  popcount (read_oct x) = popcount (read_dec x).
Proof.
  intros x.
  unfold read_hex, read_bin, read_oct, read_dec.
  repeat split; reflexivity.
Qed.

Theorem annihilation : forall (state : N),
  popcount (state XOR z{p,q,r,...,y}) = 0 ->
  alphanumeric_present state = true.
Proof.
  (* The proof follows from the Fano plane structure *)
Admitted.
```

**The three laws (verbatim):**

```
First Law — The Primitive Law
  All operations reduce to Atomics.compareExchange.
Second Law — The Invariant Law
  All structure derives from the 3! ordering of {byteLength, byteOffset, BYTES_PER_ELEMENT}.
Third Law — The Closure Law
  All computation converges to the fixed attractor 0, because the trajectory is
  deterministic backward and searchable forward.
```

**The canonical statement (verbatim):**

```
The OMI-IMO protocol is an Atomic Compare-and-Exchange Lisp.

Its primitive is Atomics.compareExchange.
Its base is the iff.
Its structure is the 2! and 3! orthogonal groups.
Its space is the 2¹⁶ Blob.
Its observers are circulators reflecting swaps.
Its behavior is time crystals (period 240).
Its resolution is O(1).
Its closure is reachability.
```

## Numbers and Invariants

| Quantity | Value | Meaning | Stated or Derived |
|---|---|---|---|
| Transistor variants | 5T / 6T / 8T / 10T | four XOR realizations; counts = delineation points | stated |
| 240 MHz factorization | 15 × 16 = 16² − 16 | ESP32-S3 CPU crystal | stated |
| BQF coefficients | 60 / 16 / 4 | high shell / chiral bridge / local seed | stated |
| BQF factored | 4(15x² + 4xy + y²) | shared factoring of both forms | derived |
| 90° identity | 15x² = 11x² + 4x² | emergence of the right angle | stated |
| Δ(Q16) | 0 | `16² − 4·16·4`; parabolic/perfect square | derived |
| Δ(Q60) | −704 | `16² − 4·60·4 = 256 − 960`; elliptic | derived |
| Lift / gap | 44x² = 4 · 11x² | projective minus affine | derived |
| 44,100 | 210² = (2·3·5·7)² | audio rate; missing prime 7 | derived |
| 240 / 60 primes | 2⁴·3·5 / 2²·3·5 | no factor of 7 | derived |
| 33,600 | 44,100 × 16/21 | derived crossover marker, not a hardware rate | contradicted |
| 16/21 | 2⁴ / (3×7) | the crossover ratio | derived |
| 1/7 | period 6, cyclic number 142857 | cyclic number genesis | stated |
| 1/73 | period 8, repetend [0,1,3,6,9,8,6,3], sum 36 | cyclic number genesis | stated |
| 10⁸ mod 73 | 1 | period-8 return | derived |
| Delta constant | `0x1D1D` (`constant_001d`) | fixed point of delta law | stated |
| Delta period | exactly 8 | proved in `Delta16HasExactPeriodEight.v` | stated |
| dplus | {0, 5, 10, 15} | XOR = 0 | derived |
| dminus | {3, 6, 9, 12} | XOR = 0 | derived |
| diag sum | 60 | `dplus + dminus` total | derived |
| π error bound | 4/(2n+1) | `omi_pi_partial_error_bound_explicit` | stated |
| Radix alphabet sizes | 2 / 8 / 10 / 16 | 0b / 0o / 0d / 0x | stated |
| Radix sum | 2+8+10+16 = 36 = 6² = (3!)² | connects to 1/73 digit sum | derived |
| Radix product | 2×8×10×16 = 2560 = 2⁹ × 5 | — | derived |
| 6-axis pairs | C(6,2) = 15 | pairwise precision measurements | derived |
| 4 radices × 6 axes | 24 = 4! | 24-cell vertex count | derived |
| Encapsulation ASCII | `()` 0x28/0x29, `[]` 0x5B/0x5D, `{}` 0x7B/0x7D, `<>` 0x3C/0x3E | four pairs ↔ four variants | stated |
| Probe quotes | `""` 0x22, `''` 0x27, `` `` `` 0x60 | three probe pins | stated |
| Alphanumeric classes | [A-Z]=26, [a-z]=26, [0-9]=10 | three Fano points | stated |
| 3! | 6 | orderings of {6T,8T,10T}; period of 1/7 | stated |
| Ruler slots | 2! + 3! = 8 | 2 frame + 6 operations | stated |
| 16 dimensions | 2¹⁶ = 65536 | −5D…10D (canonical −3D…10D) | stated |
| Blob | 16⁴ = 2¹⁶ = 65536 | −5D substrate | stated |
| Tetrahedral numbers | T(n) = C(n+2,3) | parity period 4, odd at n≡1 mod 4 | stated |
| T(8) | 120 = 5! | 240 = 2 × 120 | derived |
| Prime sextuplet | {5, 7, 11, 13, 17, 19} | gaps 2,4,2,4,2 | stated |
| Gap path | 2, 4, 0, 4, 2 | the prime-gap path | stated |
| Residue classes | {1, 3, 7, 9} mod 10 | prime groups | stated |
| Resolution bound | < 14 steps | bounded by Fano structure | stated |
| Canonical observer range | −3D…10D = 14 levels | max encapsulation −5D…12D = 18 | stated |
| Propagation | forward O(n³), back O(n) | cubic vs linear | stated |
| Alphabet size | 62 (0-9A-Za-z) | 64 is the 2⁶ frame with 2 reserved | stated |
| Bit budget | [c:1][e:1][L:6][R:6] = 14 ≤ 16 | atomic port packing | stated |
| Base stack | 36 × 72 × 64 × 60 = 9,953,280 | full alphanumeric state space | derived |
| 33,600 arithmetic | 60×560 = 70×480 = 33,600 | verified | derived |
| Derived markers | 168 = 1·2·3·2·7·2; 168 & 3125 = 32; 525000 = 168·5⁵ | arithmetic true, no hardware meaning | stated |
| Carrier ladder | 240 · 120 · 60 · 44100 · 210 · 45 · 32 | from docs/MODEL.md | stated |
| Audible carriers | FANA=60, FANB=240 | 44,100/33,600 are scope markers only | stated |
| Nyquist | 22,050 Hz | at 44.1 kHz AudioContext | derived |
| Treemap automaton | P(15,3) = 2730 = 455 × 3! | ordered triples | derived |
| Q pinned | slot 0 | always-active coordinate system | stated |
| Binding space | {0, 2, 1} | diagonal / offset / size | stated |
| Application space | {3,5,7,9} vs {4,6,8} | odds vs evens | stated |
| Evaluation space | {17, 19} | bracketing primes; response at 18 | stated |
| Full-space equation | `16b*16o*16x*16d = 65536 = 2¹⁶` | truth-table normalization | speculative |
| Agreement | `distance(A,B) = popcount(A XOR B) = 0` | closest thing to truth in 3D | stated |

## Code

**JS: the 0p literal `Position` class (verbatim; presented as the reference implementation):**

```js
'use strict';

const ZERO_P = Symbol('0p');

class Position {
     constructor(n) {
           this.word = new Uint16Array(1);
           this.word[0] = n & 0xFFFF;
           this[ZERO_P] = true;
     }

     get high() {
           return new Int8Array(this.word.buffer)[0];
     }

     get low() {
           return new Int8Array(this.word.buffer)[1];
     }

     get distance() {
           return (Math.abs(this.high) << 8) | Math.abs(this.low);
     }

     get chirality() {
           return this.high < 0 ? 'left' : 'right';
     }

     static from(n) {
           return new Position(n);
     }

     static fromRadix(radix, digits) {
           return new Position(parseInt(digits, { b: 2, o: 8, x: 16, d: 10 }[radix]));
     }

     static fromSigned(sign, magnitude) {
           return new Position(sign === '-' ? -magnitude : magnitude);
     }
}
```

**JS: the TLV parser (verbatim):**

```js
function parseTLV(str) {
     const match = str.match(/^0([pn])(\d)([boxd])(\d)0([np])$/);
     if (!match) return null;

     const [, leftType, magnitude, radix, precision, rightType] = match;

     return {
           leftType,      // 'p' or 'n'
           magnitude: parseInt(magnitude, 10),
           radix,         // 'b', 'o', 'x', 'd'
           precision: parseInt(precision, 10),
           rightType,     // 'n' or 'p'
           isDeclaration: true,
           word: buildWord(leftType, magnitude, radix, precision, rightType)
     };
}

function buildWord(leftType, magnitude, radix, precision, rightType) {
     // Encode the TLV into a 16-bit word
     const leftBit = leftType === 'p' ? 0 : 1;
     const rightBit = rightType === 'n' ? 0 : 1;
     const radixBits = { b: 0, o: 1, x: 2, d: 3 }[radix];

     return (leftBit << 15) | (magnitude << 11) | (radixBits << 9) | (precision << 5) | (rightBit << 4);
}
```

**JS: the 0p spec helpers (verbatim; note `0p` is an illegal JS identifier, so this is aspirational pseudocode):**

```js
function 0p(n) {
     const word = new Uint16Array(1);
     word[0] = n & 0xFFFF;
     return word;
}

function read0p(word) {
     const bytes = new Int8Array(word.buffer);
     return {
          high: bytes[0],
          low: bytes[1],
          distance: (Math.abs(bytes[0]) << 8) | Math.abs(bytes[1]),
          chirality: bytes[0] < 0 ? 'left' : 'right'
     };
}

function bind0p0n(pos, num) {
     return {
          position: 0p(pos),
          number: 0n(num),
          knot: { a: pos, b: num }
     };
}

function exchange(word, index, expected, replacement) {
     return Atomics.compareExchange(word, index, expected, replacement);
}
```

**JS: binding-core sketch (verbatim; the "protocol stripped down" build suggestion):**

```js
// shared/binding-core.js

// X = data source, Y = data target.
// bind(X, Y) sets a boundary.
// The constraint reveals the structure.
// The reference can be XOR'd.

function bind(x, y) {
     return { x, y, boundary: [x, y] };
}

function read(binding, ref) {
     // read within the boundary
     return binding.boundary.includes(ref) ? ref : null;
}

function write(binding, ref, value) {
     // write within the boundary
     if (!binding.boundary.includes(ref)) return null;
     return { ...binding, [ref]: value };
}

function distance(ref1, ref2) {
     // XOR + popcount, because both are XOR-able
     const delta = ref1 ^ ref2;
     return popcount(delta);
}
```

**Status:** None of the JS above is reported as executed or tested in this range. The `Position` class and `parseTLV`/`buildWord` are presented as a spec implementation; `function 0p(n)` is syntactically invalid JavaScript (aspirational). The coding agent's review explicitly calls the pasted `Atomics` call "dead code" (it compares on `metricSharedBuffer` but returns a `wordView` over a different local buffer).

## Open Questions and Contradictions

1. **Is `44,100` intrinsic to the lattice or a historical artifact?** The transcript states the "100" is suspect (PAL/NTSC line-rate compromise) and that the true audio term should be `441 = 21²`. DeepSeek treats it as the fork in the road. **Not resolved; the coding agent later says 33,600 is unsupported as a real rate, which narrows but does not settle 44,100.**
2. **Is 0p a ratio or a scalar?** DeepSeek initially calls 0p a rational/ratio; the user corrects: "0p is a scalar and scalars are integers. the ratio is 0n/0p or 0p/0n." **Resolved by user correction in favour of scalar.**
3. **`decodeBase36('a')` collision.** The coding agent reports `'a'` maps to 10, colliding with `'A' → 10`; the correct offset is 61 (36–61). **Contradicted; the transcript does not show the fix applied.**
4. **`pAd5n` fails its own regex (no dot).** The real example is `pA.5n → 5/10 → 1/2`. **Contradicted; corrected by the coding agent.**
5. **Alphabet size 62 vs 64.** The regex matches 62 symbols; the protocol text says Base-64. The coding agent says 64 only works as the 2⁶ address frame with 2 reserved slots. **Not fully resolved (option A/B/C offered; user later reframes as 26 letters + 10 numbers).**
6. **Fano set duplicate.** `[0p,0n,0d,0b,0o,0x,0d]` lists `0d` twice (7 slots, 6 distinct). Fix: `{0p,0n,0b,0o,0x,0d,·}`. **Contradicted, with a proposed fix accepted by DeepSeek.**
7. **Little-endian byte order.** The 0p spec says `bytes[0] = high`, but on little-endian `Int8Array[0]` is the LOW byte, so `0x00A5` reads as high=−91, distance=23296. **Contradicted; unresolved in spec.**
8. **Two different `distance` formulas.** One place uses `Math.abs(bytes[0]) + Math.abs(bytes[1])`; another uses `(Math.abs(bytes[0]) << 8) | Math.abs(bytes[1])`. These disagree. **Not reconciled.**
9. **`radix_independence` proves nothing.** `read_hex/bin/oct/dec` are all defined as the identity, so the theorem is trivially true. **Unnoticed in the transcript.**
10. **The `annihilation` Coq theorem is `Admitted.`** — not proved. **Flagged here; the transcript calls the proof stack "complete."**
11. **The BQF "uniqueness" claim is asserted.** "It is the unique quadratic form that respects the 240 MHz clock, bridges to Leibniz π, and encodes the Fano 7-fold structure." No uniqueness argument is given. **Speculative.**
12. **`!p @I #n == 16b*16o*16x*16d`.** DeepSeek notes `16o = 14` and `16x = 22`, so the equality is not literal; it is only true if "16" is read symbolically in each radix, giving 16⁴ = 65536. The user later says the symbols "were just to show differences not literally." **Resolved as symbolic.**
13. **The "15 algorithms ↔ 15 modules" correspondence is false.** DeepSeek rejects it: the 15 is from Wikipedia, the 19 from the test suite. **Contradicted by the transcript itself.**
14. **Is the mode (read/write) a state of the wordform or the observer?** DeepSeek leans observer; the user does not answer in this range. **Unresolved.**
15. **One Latin square or a table of many?** The user says "tables of Latin squares"; DeepSeek leans many. **Unresolved.**
16. **Is the Hamming distance closed under the scalar type?** DeepSeek asks whether `popcount(XOR(0p_a,0p_b))` yields another 0p; the user's answer ("this only works for shared data representation...") does not directly answer. **Unresolved.**
17. **"0p and 0n are not read or written" vs the full Uint16Array 0p spec.** The later correction ("we don't have to read or write data") directly contradicts the earlier detailed read/write representation. **Contradicted across the range.**
18. **The Pythagorean claim.** `d_total² = d_p² + d_n²` treats two integer popcounts as orthogonal Euclidean axes. No justification is given. **Speculative.**
19. **Is `0i` standalone or a component?** Options (a)/(b)/(c) offered; DeepSeek leans standalone. **Unresolved.**
20. **"Q is the only treemap algorithm that isn't a perfect square."** The other 15 are asserted to be perfect squares; not shown. **Speculative.**
21. **Is the Fano 7th point the dot `·`, and is the dot optional?** The canonical regex has `\.?`, yet the coding agent says "the dot becomes the 7th point." **Unresolved tension between optional dot and required 7th point.**
22. **The Coq file attribution.** The Grand Reduction presents the `.v` files as the user's ("the proofs you sent"), while DeepSeek wrote some reconstruction code (e.g., `popcount`, `read_hex`). **Ambiguous provenance.**

## Quotable Fragments

> a regular tetrahedron can be constructed from the 5 points that define the generalized F-mean, where that 5th point acts as the centroid

> 44,100 is not derivable from the 240 MHz / 60 fps lattice by any clean factorial or quadratic step.

> 240 and 60 carry no factor of 7, but 44,100 is built entirely around 7².

> 15x² = 11x² + 4x²

> 60x² - 16x² = 44x² = 4 · 11x²

> The only shared literal is 0. The only shared operation is XOR. The only shared reference space is /0[boxd]/.

> 0p is a scalar and scalars are integers. the ratio is 0n/0p or 0p/0n.

> the hamming distance is what we are traking its the pinch point of the fano plane

> agreement is the closest thing to truth in a three-dimensional context of reality

> Binary computation space is finite 0. Is is always 0.

> This is outside of time, it just all logic.

> The protocol defines the path. The constraint reveals the structure. The reference can be XOR'd.

> atomics.compareExchange of the blackboard pattern using tables of latin squares

> The OMI-IMO protocol is an Atomic Compare-and-Exchange Lisp.

## Cross-references

- `"[[OMI-IMO]]"` — this range contains the fullest statement of the protocol's self-definition as "an Atomic Compare-and-Exchange Lisp" with three primitives, the ruler, and the three laws.
- `"[[SPEC-00 Canonical Statement]]"` — the range repeats "The Canonical Statement" many times; the Part-1 instance is the Atomic Compare-and-Exchange Lisp paragraph, one of several competing canonical statements.
- `"[[SPEC-01 The Three Laws]]"` — the Primitive / Invariant / Closure laws are stated verbatim here, including `{byteLength, byteOffset, BYTES_PER_ELEMENT}`.
- `"[[SPEC-10 The Primitive]]"` — `Atomics.compareExchange` is named the primitive, with the 0-2-1 reading ("is this 0, 1, or 2?") and the blackboard-write semantics.
- `"[[SPEC-11 The Three Primitives]]"` — `bind` / `apply` / `eval` (plus `digest`) are defined with their Monad/Functor/Comonad reading and the knot symmetry `knot[a]=b ⟺ knot[b]=a`.
- `"[[SPEC-12 The Ruler]]"` — the 8-slot ruler `2! + 3!`, its semantic labels, and the 16-index local/shared extension (0–7 local, 8–15 shared).
- `"[[SPEC-13 XOR Algebra]]"` — XOR as the sole operation, `distance = popcount(a ⊕ b)`, the Fano pinch as `000`, and the "XOR always returns" totality claim.
- `"[[SPEC-14 Knots and Binds]]"` — `bind(X,Y)` as a boundary over source X and target Y; the knot symmetry; the blackboard declaration/definition pair.
- `"[[SPEC-15 The Delta Transform]]"` — `delta16` with `rotl16/rotr16`, constant `0x1D1D`, exact period 8, and the swap16/32/64 locality swaps.
- `"[[SPEC-16 The Fano Invariant]]"` — 7 points / 7 lines / 3 per line, the explicit `fano_lines` list, `fano_selector = n mod 7`, and the dot as 7th point.
- `"[[SPEC-20 The Dimensional Axis]]"` — the −5D…12D ladder (Blob → color codex → … → meta-federation) and the 16-index local/shared split.
- `"[[SPEC-21 The Inversion Law]]"` — the balance equation `0p ^ 0i ^ 0n = 0b ^ 0o ^ 0x ^ 0d`, read/write mode inversion, and the empty-set reading.
- `"[[SPEC-22 The Blob]]"` — `2¹⁶ = 65536` as the −5D substrate and the truth-table normalization to 16 positions.
- `"[[SPEC-23 The Rosetta Stone]]"` — the encapsulation ASCII map and codepoint walk `0x28 − 5n` / `0x29 + 5n`; the Rosetta shape is only referenced here, not detailed.
- `"[[SPEC-24 Observers]]"` — observer defined as "any circulator capable of reflecting swap rotations"; mnemonic observers as perceptrons; canonical range −3D…10D.
- `"[[SPEC-25 The Iff]]"` — `position(n) ⟺ period(n−1, n, n+1)`, 2! as the two sides of the iff, and the local/global read scope.
- `"[[SPEC-30 The Symbol Table G]]"` — the Synthesis G regex set (FRONT/BACK/INSIDE/OUTSIDE/UP/DOWN/DEFLECT/REFLECT/INFLECT/AXIS/MNEMONIC/PALINDROME), which differs from the later 7-gate table.
- `"[[SPEC-31 Declaration Syntax]]"` — `0p[position] = [scalar]` (declaration) and `define 0p[position] := [meaning]` (definition), plus the TLV grammar.
- `"[[SPEC-32 Mnemonics and Axes]]"` — the 6 axes `{x,y,z,p,q,r}`, the ruler labels, and the spectral/spatial index split.
- `"[[SPEC-33 The Quadratic Forms]]"` — the affine/projective BQF pair, Δ = 0 vs −704, the 44x² lift, and the `15x² = 11x² + 4x²` emergence.
- `"[[SPEC-34 Phases Attributes Constraints Configurations]]"` — read mode = local/global regex scope (16x²) vs write mode = spectral/spatial PannerNode (60x²); constraints reveal structure.
- `"[[SPEC-35 Reflections and Orbits]]"` — the cyclic numbers 1/7 (period 6) and 1/73 (period 8), the repetend and its rotations, and the diagonal-accumulator orbits.
- `"[[SPEC-40 The 6T XOR Circuit]]"` — the 6T variant (same + output inverter, full fan-out) and its mapping to `apply`.
- `"[[SPEC-41 The 8T XOR Circuit]]"` — the 8T variant (4 NAND gates × 2T) and the WebAudio/rod mapping.
- `"[[SPEC-42 Circuit Sourcemap]]"` — only tangential here; the 0i/0p index parsing and the atomic port regex are the nearest sourcemap-adjacent material.
- `"[[SPEC-43 Prime Gaps and Sextuplets]]"` — the prime-gap sequence, the sextuplet {5,7,11,13,17,19}, the path 2,4,0,4,2, and residue classes {1,3,7,9} mod 10.
- `"[[SPEC-50 Stream Transport]]"` — the WebRTC/HTTP framing context (`X-VTT-Cue-0x00` header) and the streaming/blackboard model.
- `"[[SPEC-51 JSON Canvas Interchange]]"` — the treemap automaton input is the `wiki/chapters/*.json` node trees, which is the interchange shape used here.
- `"[[SPEC-52 The REPL and the Digest]]"` — the digest as read/consider/print/loop REPL, the F-mean `M_p`, and the Horn clause `ruler_has_value(V) :- M_p(ruler,V)`.
- `"[[SPEC-53 Clocks and Periods]]"` — the 240 MHz / 44,100 Hz / 60 fps clock lattice, `240 = 15×16`, the period-8 delta law, and the carrier ladder.
- `"[[SPEC-54 The Web Platform Layers]]"` — the WebAudio node taxonomy, PannerNode vs StereoPannerNode, WebXR, HNSW, SCGNN, Prompt API, WebMIDI, WebGL hybrid.
- `"[[SPEC-55 ASCII Folds]]"` — ASCII as a Hamming-distance grid, the 0x20 pinch, the digit `011 + BCD` structure, and the lowercase bit-5 flip.
- `"[[SPEC-60 Test Vectors]]"` — the 0x1F/0b11111/0o37/0d31 popcount-5 example, the diagonal constants, the `0x0011`-adjacent orbit framing, and the treemap `P(15,3)` state space.
- `"[[SPEC-61 Implementation Status]]"` — the coding-agent review: `/agent/world` four rods, `allocatable:false`, the 60/240 carriers, the WebNN stub, and the outstanding 0p module bugs.
- `"[[OPEN-00 Contradiction Register]]"` — `decodeBase36` collision, the Fano duplicate `0d`, 62-vs-64 alphabet, little-endian byte-order error, the two `distance` formulas, and the 15-vs-19 module false identity.
- `"[[OPEN-01 Open Questions]]"` — the unresolved Latin-square count, read/write mode ownership, Hamming-distance closure, `0i` standalone-vs-component, and the 44,100 fork.
- `"[[OPEN-02 Broken Code Inventory]]"` — the dead `Atomics` call, the invalid `function 0p(n)` identifier, and the two conflicting `distance` implementations.
- `"[[OPEN-04 Discarded Claims]]"` — DeepSeek's "only invariant is the speed of light" (retracted), the 0p-as-ratio reading (retracted), and "0p and 0n are read/written" (superseded by "we don't read or write data").

## Extraction Notes

- Lines actually read: 1–13500 (all of the requested range), via `sed -n '1,13500p'` into a temp file and sequential reads. No gaps.
- The range ends mid-sentence at line 13500 ("It's just the difference. The distance. The agreement." / blank), inside the "Outside of Time" section; the continuation is in SRC-01b.
- UI chrome ignored: page headers/footers (`XOR Tetrahedron Transform - DeepSeek`, the chat URL, `NN/357`), the "Copy"/arrow glyphs, and attachment-card filenames (e.g. `phi_proof.v.md`, `omi_geometry_proof.v.md`, `CyclicClock.v.md`, `Delta16HasExactPeriodEight.v.md`, `Untitled 73.md`). Those filenames are recorded only where they carry technical meaning.
- Some tables are column-truncated in the `pdftotext -layout` output (e.g. the transistor table's "Notes" column, the encapsulation "Role" column, the treemap "Aspect Ratio Performance" column). Where a cell is cut mid-word I have not reconstructed it.
- The transcript contains at least two distinct "Canonical Statement" formulations and two distinct G regex sets (the Synthesis 12-key `G` vs. the later 7-gate table in SRC-01b). Both are preserved; they are not reconciled in the source.
- Several numeric claims are arithmetically correct but semantically overreaching (see C7 Pythagorean, C8 treemap). Confidence marks distinguish `derived` (arithmetic checked in-transcript) from `speculative` (asserted mapping).
- The Coq code is reproduced verbatim as it appears in the transcript. Some of it is DeepSeek's reconstruction rather than a direct quote from the user's `.v` files; provenance is flagged in Open Questions #22.
- Not parsed: a handful of large ASCII-art boxes (the "Grand Reduction" layer box, the blackboard diagrams) are summarized rather than reproduced; their textual content is captured in Definitions/Claims.
