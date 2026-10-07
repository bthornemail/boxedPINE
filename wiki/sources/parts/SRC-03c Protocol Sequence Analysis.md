---
id: SRC-03c
title: "Protocol Sequence Analysis - Part 3 of 4"
kind: source-part
layer: sources
status: draft
spec: OMI-IMO-2026
source_id: SRC-03
part: 3
parts: 4
parent: "[[SRC-03 Protocol Sequence Analysis]]"
up: "[[SRC-99 Source Index]]"
covers: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, deepseek, sequence, orbits, generator]
extracted: 2026-10-04
extraction: pdftotext-layout
lines: "63001-94500"
---

## Summary

This portion of the transcript (pages ~1118–1667 of 2218) continues a long chain of DeepSeek "rounds," each ending in a canonical statement and a full Coq / Haskell / YAML / Verilog listing. It opens with the observer hierarchy (autonomous observer = `0x0000` universal constant, autonomous agent = Omicron ruler = gnomonic projective, agent observer = Imago Dei receipt), then formalizes the −5D→−1D spatial-preprocessing cascade with regex constraints, the octtrie (2⁸ = 256, 3⁸ = 6561), and the trigintaduonion (155) and sexagintaquatronion/64nion (651) triple counts. It then derives the 76 kernel (60+12+4), the geometric configurations (Miquel, Möbius, Klein, Perles, Stellated Tetrahedron), the 65536 metaspace, quadratic forms and the simplex/Pythagorean/R⁴ ladder, the 0!=1 base relation, the idempotence of XOR and the collapse, and the automata/algorithmic/axiomatic reframing. The latter two-thirds build an extensible YAML "codex," a Haskell type model + YAML generator, an exact Coq↔Haskell correspondence, and Verilog RTL modules (including the Δ swap law and a 240-clock / 5040-slot), then extend to polyforms, the Dali cross / torus / Karnaugh chart, SVG/Smith-chart/Genaille-rod raw forms, a UTF-8 "preheader," a meta-circular meta-compiler, an HTTP/1.1 bootstrap, an "imaginary 11D" identified with the axiom of choice, the BuckeyBall 12D→13D cascade, and a final reconciliation via sexy-prime sextuplets. Arithmetic is frequently conflated (XOR vs `+` vs `×`), several Coq proofs are `Admitted`, and the base relation is revised twice (0₂! → 0₈ₙ! → (0₄ₙ)!).

## Claims

| # | Claim | Confidence | Evidence |
|---|-------|------------|----------|
| 1 | The three observers are autonomous observer (0x0000, universal constant / projective azimuth), autonomous agent (Omicron, ruler / gnomonic projective), agent observer (Imago Dei, receipt) | stated | "Autonomous Observer — the universal constant (0x0000), the Projective Azimuth" |
| 2 | The minimum kernel size over all injective residual maps is 16; the protocol's kernel size is 76 because the residual map is not injective | stated | "The minimum kernel size over all injective residual maps is 16." |
| 3 | The 76 kernel decomposes as 60 (Klein) + 12 (Perles) + 4 (tetrahedral observer) | stated | "76 = 60 + 12 + 4" |
| 4 | The trigintaduonion has 155 distinguished triples = 45+20+15+60+15 = 5×31 | stated | "155 = 45 + 20 + 15 + 60 + 15" |
| 5 | The 64nion has 651 distinguished triples = 189+84+63+252+63 = 3×7×31 | stated | "651 = 189 + 84 + 63 + 252 + 63" |
| 6 | Kernel connections: 155 = 76 + 79 and 651 = 8×76 + 43 | stated | "155 = 76 + 79" |
| 7 | The octtrie is 2⁸ = 256; the octtrie trinomial is 3⁸ = 6561 | stated | "Octtrie = 28 = 256" |
| 8 | The −5D Blob is 2¹⁶ = 65536 = 16⁴, and 65536 = 65535 ⊕ 1 | stated | "65536 = 65535 ⊕ 1!" |
| 9 | The affine form is 16x²+16xy+4y² = (4x+2y)² with discriminant 0 (parabolic) | derived | "Δ = 162 − 4 × 16 × 4 = 256 − 256 = 0" |
| 10 | The projective form is 60x²+16xy+4y² with discriminant −704 (elliptic) | derived | "Δ = 162 − 4 × 60 × 4 = 256 − 960 = −704" |
| 11 | The Miquel configuration has 8 points, 6 circles, 3 points per circle, 4 circles per point | stated | "The Miquel configuration has 8 points and 6 circles." |
| 12 | The Möbius configuration has 8 points and 8 planes; the Stellated Tetrahedron has 2 tetrahedra, 8 vertices, 6 edges | stated | "The Möbius configuration has 8 points and 8 planes." |
| 13 | The full 76 breakdown is 48 + 12 + 4 + 12, where 48 = 8 points × 6 circles (Miquel) | stated | "76 = 48 + 12 + 4 + 12" |
| 14 | The 12 is the imaginary unit and the 1!; 12 = 16xy with xy = 3/4 | stated | "12 = imaginary unit = 1!" |
| 15 | The collapse 3!⊕3!⊕3!⊕1! = 19; the four-way 3!⊕3!⊕3!⊕3! = 1296; the multiplicative collapse = 216 | contradicted | "3! ⊕ 3! ⊕ 3! ⊕ 1! = 19" |
| 16 | The base relation is 0₂! = 1₈, later restated 0₈ₙ! = 1₈, then corrected to (0₄ₙ)! = 1₄ | contradicted | "02 ! = 18" |
| 17 | BytesPerElement = bit width / 8, giving 8→1, 16→2, 32→4, 64→8 | stated | "BytesPerElement = bit width / 8" |
| 18 | Any binomial distribution of a trinomial distribution is the simplex distribution (the diagonal) | stated | "Any binomial distribution of a trinomial distribution is the simplex distribution" |
| 19 | The Pythagorean theorem is the 2D simplex; the simplex x²+y²+z²=r² is the 3D Pythagorean theorem | stated | "The Pythagorean theorem is the 2D simplex." |
| 20 | The binary quadratic form is Q(x,y)=ax²+bxy+cy² with discriminant Δ=b²−4ac | stated | "Q(x, y) = ax2 + bxy + cy 2" |
| 21 | The cubic form ax³+by³+cz³=r⁴ and mixed form 2ax+bxyz+cz² generalize to axⁿ+byⁿ+czⁿ=rⁿ⁺¹ | stated | "axn + by n + cz n = rn+1" |
| 22 | Fermat n=3 and n=4 are stated as requiring Fermat's Last Theorem (proofs Admitted) | stated | "This is Fermat's Last Theorem for n = 3." |
| 23 | XOR is self-inverse (x⊕x=0) and the collapse is idempotent | stated | "x⊕x=0" |
| 24 | The three reframings automata ≅ algorithmic ≅ axiomatic map origin/process/result to 0/1/2 | stated | "Automata ≅ Algorithmic ≅ Axiomatic" |
| 25 | The codex can be written in strict YAML front matter and is extensible via placeholders | stated | "The codex can be written in strict YAML for front matter." |
| 26 | The primitive is Atomics.compareExchange with phases bind/apply/eval/digest, all reducing to XOR | stated | "signature: \"Atomics.compareExchange(array, index, expected, replacement)\"" |
| 27 | The Δ swap law is swap16(x) ⊕ swap32(x) ⊕ swap64(x) ⊕ carry | stated | "delta x c = swap16 x ^ swap32 x ^ swap64 x ^ c" |
| 28 | The 5040 slot formula is (fano × 720) + (role × 240) + local | stated | "assign o_slot = (i_fano * 720) + (i_role * 240) + i_local;" |
| 29 | The 240-clock counts 0..239 and wraps | stated | "if (o_tick == 8'd239)" |
| 30 | The Fano router encodes 7 lines as bitmasks {0,1,3},{1,2,4},{2,3,5},{3,4,6},{4,5,0},{5,6,1},{6,0,2} | stated | "line_points[0] = 7'b0001011;         // {0,1,3}" |
| 31 | The Dali Cross is a 12-bit mask of the Pythagorean relations (proof32) | stated | "The Dali Cross is the 12-bit mask of the Pythagorean relations." |
| 32 | The Smith Chart is the 16⁸ (imaginary) projection; the Genaille Rods are the 16⁵ (meta) projection | stated | "The Smith Chart is the 16⁸ projection." |
| 33 | The preheader is a UTF-8 metadata block that binds content and works on any UTF-8 | stated | "It works on any UTF-8." |
| 34 | Preloading the regex constraints as kernel/preheader/frame yields a meta-circular meta-compiler | speculative | "then we have a meta-circular, meta-compiler" |
| 35 | The imaginary 11D is the axiom of choice and the full −5D→10D pipeline orchestrator | speculative | "The imaginary 11D is the axiom of choice." |
| 36 | The BuckeyBall (C₆₀) has 60 vertices, 90 edges, 12 pentagons, 20 hexagons; 12D is highest, 13D the quarter diagonal / parity at 3D | stated | "The BuckeyBall (buckminsterfullerene, C₆₀) is a truncated icosahedron." |
| 37 | Subsumption: {0D,2D,1D} ⊂ {3D,5D,7D,9D}, digest {11D,13D}, resolution {17D,19D} | speculative | "the 0D, 2D, 1D will be subsumed by the 3D, 5D, 7D, 9D" |
| 38 | The diagonal sequence is [0,2,1],[1,0,2],[2,1,0]; linear [0,1,2]; inverse [2,1,0] | stated | "The diagonal sequence is [0,2,1], [1,0,2], [2,1,0]." |
| 39 | The exceptional sexy-prime sextuplet is {5,7,11,13,17,19}; non-exceptional sextuplets are 210n+{97,101,103,107,109,113}; 210=2×3×5×7 and 5∣210 | stated | "The exceptional sextuplet is: {5, 7, 11, 13, 17, 19}" |
| 40 | Two-cube measurement: cubeA {1,2,4,8,16,32,64,128} vs cubeB {0,2,6,8,12,14,18,20}, squared differences {1,0,4,0,16,324,2116,11664}, six axes {1,4,16,324,2116,11664} | stated | "{1, 4, 16, 324, 2116, 11664}" |
| 41 | Golden ratio φ≈1.618, inverse ≈0.618, and 1618×618 = 999924 | stated | "golden_ratio * inverse_golden_ratio = 999924" |
| 42 | 16⁵ = 1048576 and 16⁸ = 4294967296 | stated | "16^8 = 4294967296" |
| 43 | Polyform counts: polyominoes 1,1,2,5,12,35,108,369; polyiamonds 1,1,1,3,4,12; polyhexes 1,1,3,7,22,82; polycubes 1,1,2,8,29,166 | stated | "Polyhex | hexagon | 1, 1, 3, 7, 22, 82, ..." |
| 44 | An automaton is a 5-tuple M=(Q,Σ,δ,q₀,F), mapped to constant/Omicron/Imago Dei/ASCII/65536 metaspace | stated | "M = (Q, Σ, δ, q0 , F )" |
| 45 | The 1! pull selection is bind, apply, eval, digest (length 4) | stated | "1! pull = bind, apply, eval, digest" |
| 46 | Spatial preprocessing cascade: −5D Blob (65536), −4D RGBA, −3D CRLF, −2D non-alphanumeric, −1D alphanumeric | stated | "−5D → −4D → −3D → −2D → −1D" |
| 47 | The seven regex axes are FRONT, BACK, UP, DOWN, LEFT, RIGHT, CENTER | stated | "FRONT: /^[A-Za-z0-9:+]$/" |
| 48 | 0x0000 is the code / fixed point, not an error | stated | "The 0x0000 is the code, not the error." |

### Claim 2: Kernel 16 vs 76

The transcript opens mid-proof, asserting the Coq formalization establishes the minimum kernel size over all injective residual maps as 16, while the protocol's own kernel size is 76 because its residual map is not injective. The actual enumeration and the residual-map construction are not re-derived in this range (they belong to Part 2); here the numbers are restated as proven facts. The closure list reads: "The minimum kernel size — 16, achieved with linearly independent residuals" and "The protocol's kernel size — 76, because the residual map is not injective." No counterexample or arithmetic for the 16 minimum appears in lines 63001–94500.

### Claim 3: 76 = 60 + 12 + 4

The kernel is decomposed three ways across the transcript. The stable form is `76 = 60 + 12 + 4` (60 Klein points, 12 Perles points, 4 tetrahedral observer). A later, self-corrected variant is `76 = 48 + 12 + 4 + 12`, where 48 = 8 points × 6 circles of the Miquel configuration. The transcript explicitly catches its own error: it first writes `76 = 8 × 6 + 12 + 4 + 12`, says "Wait — this is not right," computes 8×6 = 48, then 48+12+4+12 = 76 and declares "Yes!" The 60/12/4 breakdown remains the canonical one used in the codex.

### Claims 4–6: Trigintaduonion 155 and 64nion 651

The trigintaduonion (32-dimensional Cayley–Dickson algebra) has 155 distinguished triples, broken down as {α,α,β}=45 (5×9), {β,β,β}=20 (4×5), {β,β,β}=15 (3×5), {α,β,γ}=60 (Klein configuration), {β,γ,γ}=15 (Klein lines). Sum: 45+20+15+60+15 = 155 = 5×31, with 31 the Mersenne prime 2⁵−1. The 64nion has 651 = 189+84+63+252+63 = 3×7×31, with 7 the Fano plane and 63 = 2⁶−1. The kernel links are 155 = 76 + 79 and 651 = 8×76 + 43 (8×76 = 608; 608+43 = 651).

### Claims 9–10: Affine and Projective Forms

Treating the affine form as a binary quadratic form with (a,b,c) = (16,16,4): Δ = b² − 4ac = 16² − 4·16·4 = 256 − 256 = 0 → parabolic, and indeed 16x²+16xy+4y² = (4x+2y)². The projective form (a,b,c) = (60,16,4): Δ = 256 − 4·60·4 = 256 − 960 = −704 → elliptic. Both are placed in the codex as the parabolic (1D–3D, "autonomous agent") and elliptic (4D–10D, "user agent") forms. The same Δ test is then applied to Pythagorean (2D), simplex (3D) and R⁴ (4D).

### Claim 15: The 3! Arithmetic Contradiction

The expression "3! XOR 3! XOR 3! XOR 1!" is assigned three mutually incompatible values in this range. As multiplication it is `three_factorial * three_factorial * three_factorial * 1` = 216 (the "collapse"); as addition it is `6 + 6 + 6 + 1` = 19 (also called "the collapse" and used throughout the codex glossary); and as true XOR it would be 6⊕6⊕6⊕1 = 7. The four-way "3!⊕3!⊕3!⊕3!" is given as 1296 (= 6⁴), which is likewise multiplication, not XOR (which would be 0). The Coq `collapse` function is literally defined `a + b + c + d`, yet its idempotence is argued from XOR self-inverse. This is the single largest internal contradiction in the range.

### Claim 27: Δ Swap Law and the 240/5040 Machinery

The Verilog `omi_delta_law` computes `o_next <= s16 ^ s32 ^ s64 ^ i_carry`, where s16/s32/s64 are the outputs of three `omi_swap_engine` instances selecting `2'b00/2'b01/2'b10`. The `omi_slot5040` module maps a Fano index (0..6), role (0..2) and local index (0..239) to a 0..5039 slot via `(i_fano * 720) + (i_role * 240) + i_local`, so 7 × 720 = 5040 and 3 × 240 = 720. The `omi_240_clock` counts 0..239 and wraps, matching the "240-frame orbit." Note that the Verilog swap16 and swap64 cases have identical byte-reversal bodies, which is suspicious (swap16 should reverse adjacent bytes, not all eight).

### Claim 39–40: Sexy Primes and Two-Cube Measurement

The final round identifies the exceptional sexy-prime sextuplet {5,7,11,13,17,19} with gaps 2,4,2,4,2. All non-exceptional sextuplets are claimed to be `210n + {97,101,103,107,109,113}` with 210 = 2×3×5×7; the "exceptional delineation" is that 5 divides 210, so 5 cannot appear in the non-exceptional residues. The "two-cube measurement" compares cubeA = powers of two {1,2,4,8,16,32,64,128} against cubeB = {0,2,6,8,12,14,18,20} (a prime-gap-related set), giving squared differences {1,0,4,0,16,324,2116,11664}; the "six axes" {1,4,16,324,2116,11664} drop the two zero entries and are said to correspond to the six exceptional primes. The 3! is then called the reconciliation of the 3D-and-above, with 11D scoping the collapse and 10D orchestrating the 9D.

## Definitions

### Regex Constraint Set G (JavaScript)

```js
const G = Object.freeze({
  FRONT: /^[A-Za-z0-9:+]$/,
  BACK:   /^[A-Za-z0-9.\-]$/,
  UP:     /^[A-Z_]$/,
  DOWN:   /^[a-z_]$/,
  LEFT:   /^[0-9+\-]\.[^0-9+\-]$/,
  RIGHT: /^[^0-9+\-]\.[0-9+\-]$/,
  CENTER:/^[0-9]\.[0-9]$/,
});
```

### Regex Constraint Patterns (Coq, verbatim)

```coq
Definition regex_pattern (r : regex_constraint) : string :=
     match r with
     | FRONT   => "^[A-Za-z0-9:+]$"
     | BACK    => "^[A-Za-z0-9.-]$"
     | UP      => "^[A-Z_]$"
     | DOWN    => "^[a-z_]$"
     | LEFT    => "^[0-9+-].[^0-9+-]$"
     | RIGHT   => "^[^0-9+-].[0-9+-]$"
     | CENTER => "^[0-9].[0-9]$"
     end.
```

### Regex Cascade at Each Layer

| Layer | Constraint | Regex |
|-------|------------|-------|
| −5D | The substrate | `//g` |
| −4D | The palette | `/color/g` |
| −3D | The delimiters | `/\r\n/g` |
| −2D | The hierarchy | `/[^a-zA-Z0-9]/g` |
| −1D | The primitives | `/[a-zA-Z0-9]/g` |
| 0D | The observer | `//g` |

### XOR Word (Coq)

```coq
Fixpoint xor_word {n : nat} (a b : word n) : word n :=
     match a, b with
     | [], [] => []
     | x :: xs, y :: ys =>
            (match x, y with
             | O, O => O
             | O, I => I
             | I, O => I
             | I, I => O
             end) :: xor_word xs ys
     | _, _ => []
     end.
```

### Binomial, Trinomial, Simplex

```coq
Definition binomial (n k : nat) : nat :=
     fact n / (fact k * fact (n - k)).

Definition trinomial (n k1 k2 k3 : nat) : nat :=
     fact n / (fact k1 * fact k2 * fact k3).

Definition simplex (n : nat) : nat := 2^n.
```

### Quadratic Forms and Discriminant

```coq
Definition bqf (a b c x y : nat) : nat :=
     a * x^2 + b * x * y + c * y^2.

Definition discriminant (a b c : nat) : int :=
     b^2 - 4 * a * c.

Definition affine (x y : nat) : nat :=
     16 * x^2 + 16 * x * y + 4 * y^2.

Definition projective (x y : nat) : nat :=
     60 * x^2 + 16 * x * y + 4 * y^2.

Definition cubic_form (a b c x y z : nat) : nat :=
     a * x^3 + b * y^3 + c * z^3.

Definition mixed_form (a b c x y z : nat) : nat :=
     2 * a * x + b * x * y * z + c * z^2.

Definition general_form (a b c n x y z r : nat) : Prop :=
     a * x^n + b * y^n + c * z^n = r^(n+1).
```

### BytesPerElement

```coq
Definition bytes_per_element (bit_width : nat) : nat := bit_width / 8.
```

### Automaton (Coq)

```coq
Record automaton : Type := mkAutomaton {
     states : Type;
     alphabet : Type;
     transition : states -> alphabet -> states;
     initial : states;
     accepting : states -> Prop
}.

Definition protocol_automaton : automaton :=
     mkAutomaton
       nat
       nat
       (fun q a => q + a)
       0
       (fun q => q = 0).
```

### Δ Swap Law

```coq
Definition delta x c = swap16 x ^ swap32 x ^ swap64 x ^ c
```

### 1! Pull Atomic Selection (Coq)

```coq
Inductive atomic_op : Type :=
     | Bind   : atomic_op
     | Apply : atomic_op
     | Eval   : atomic_op
     | Digest : atomic_op.

Definition one_pull_selection : list atomic_op :=
     [Bind; Apply; Eval; Digest].
```

### Codex Front Matter (YAML, verbatim)

```yaml
---
codex: OMI-IMO
title: "The OMI-IMO Protocol Codex"
subtitle: "A Deterministic Atomic Protocol for Spatial Coordination"
version: "1.0.0"
status: canonical
language: en
encoding: utf-8
created: "2026-09-20T00:00:00Z"
updated: "2026-09-20T00:00:00Z"
authors:
     - name: "System Architect"
       role: "primary"
       affiliation: "OMI-IMO Project"
     - name: "AI Collaborator"
       role: "secondary"
       affiliation: "OMI-IMO Project"
license: "CC0-1.0"
doi: "10.0000/omi-imo.2026.001"
keywords:
     - "XOR"
     - "Atomics"
     - "comparExchange"
     - "spatial coordination"
     - "deterministic protocol"
     - "binary quadratic form"
     - "trigintaduonion"
     - "Miquel configuration"
     - "geometric algebra"
---
```

### Primitive / Reduction Sections (YAML, verbatim)

```yaml
primitive:
     name: "Atomics.compareExchange"
     signature: "Atomics.compareExchange(array, index, expected, replacement)"
     phases:
       - name: "bind"
         description: "Constructs the relation between expected and replacement"
         operation: "XOR"
       - name: "apply"
         description: "Invokes the comparison and conditional swap"
         operation: "XOR"
       - name: "eval"
         description: "Returns the old value"
         operation: "XOR"
       - name: "digest"
         description: "Reads, considers, prints"
         operation: "XOR"
     properties:
       - "atomic"
       - "indivisible"
       - "deterministic"
       - "lock-free"
```

```yaml
reduction:
     primitive: "XOR"
     laws:
       - name: "self-inverse"
         formula: "a ⊕ a = 0"
       - name: "associative"
         formula: "(a ⊕ b) ⊕ c = a ⊕ (b ⊕ c)"
       - name: "commutative"
         formula: "a ⊕ b = b ⊕ a"
       - name: "identity"
         formula: "a ⊕ 0 = a"
       - name: "void"
         formula: "a ⊕ a = 0"
     reductions:
       - operation: "and"
         formula: "a ⊕ (a ⊕ b) ⊕ b"
       - operation: "nand"
         formula: "(a ⊕ (a ⊕ b) ⊕ b) ⊕ β"
       - operation: "or"
         formula: "a ⊕ b ⊕ (a & b)"
       - operation: "nor"
         formula: "(a ⊕ b ⊕ (a & b)) ⊕ β"
       - operation: "xnor"
         formula: "(a ⊕ b) ⊕ β"
       - operation: "not"
         formula: "a ⊕ β"
       - operation: "buf"
         formula: "a"
```

### Invariant Section (YAML, verbatim)

```yaml
invariant:
     name: "3!"
     value: 6
     components:
       - name: "BL"
         meaning: "byteLength"
       - name: "BO"
         meaning: "byteOffset"
       - name: "BPE"
         meaning: "BYTES_PER_ELEMENT"
     orderings:
       - "BL:BL"
       - "BL:BO"
       - "BL:BPE"
       - "BO:BO"
       - "BO:BPE"
       - "BPE:BPE"
     dimension: 6
     parameter: "N ∈ {8, 16, 32, 64}"
```

### Haskell Codex Types (verbatim excerpts)

```haskell
data Primitive = Primitive
     { primitiveName        :: Text
     , primitivePhases      :: [Phase]
     , primitiveLaws        :: [Law]
     } deriving (Show, Eq, Generic, ToJSON, FromJSON)

data Phase = Phase
     { phaseName           :: Text
     , phaseDescription :: Text
     , phaseOperation      :: Text
     } deriving (Show, Eq, Generic, ToJSON, FromJSON)

data Law = Law
     { lawName             :: Text
     , lawFormula          :: Text
     , lawProof            :: Text
     } deriving (Show, Eq, Generic, ToJSON, FromJSON)

data Codex = Codex
     { codexVersion          :: Text
     , codexStatus           :: Text
     , codexPrimitive        :: Primitive
     , codexReduction        :: Reduction
     , codexInvariant        :: Invariant
     , codexFactorials       :: [Factorial]
     , codexAlgebras         :: [Algebra]
     , codexConfigurations :: [Configuration]
     , codexForms            :: [Form]
     , codexConstants        :: [Constant]
     , codexSchlafli         :: [Schlafli]
     , codexObservers        :: [Observer]
     , codexDimensions       :: [Dimension]
     , codexRegex            :: [Regex]
     , codexCoq              :: [CoqTheorem]
     , codexVerilog          :: [VerilogModule]
     , codexGlossary         :: [GlossaryTerm]
     , codexTriples          :: [Triple]
     } deriving (Show, Eq, Generic, ToJSON, FromJSON)
```

### Coq↔Haskell Type Correspondence

| Haskell | Coq | Correspondence |
|---------|-----|----------------|
| Primitive | primitive | The primitive type |
| Reduction | reduction | The reduction type |
| Invariant | invariant | The invariant type |
| Factorial | factorial | The factorial type |
| Algebra | algebra | The algebra type |
| Configuration | configuration | The configuration type |
| Form | form | The form type |
| Constant | constant | The constant type |
| Schlafli | schlafli | The Schläfli type |
| Observer | observer | The observer type |
| Dimension | dimension | The dimension type |
| Regex | regex | The regex type |
| CoqTheorem | coq_theorem | The Coq theorem |
| VerilogModule | verilog_module | The Verilog module |
| GlossaryTerm | glossary_term | The glossary term |
| Triple | triple | The triple type |
| Codex | codex | The codex type |

### Haskell Preheader / Bind-Apply-Eval-Digest (verbatim)

```haskell
data Preheader = Preheader
     { preheaderVersion         :: Text
     , preheaderType            :: Text
     , preheaderCanvas          :: Text
     , preheaderEncoding        :: Text
     , preheaderOrthogonal      :: Bool
     , preheaderVisual          :: Bool
     , preheaderRegenerate      :: Bool
     } deriving (Show, Eq, Generic, ToJSON, FromJSON)

bind :: Text -> Preheader -> SVGMeta
bind content preheader = SVGMeta preheader "offscreen" content

apply :: SVGMeta -> WordChart
apply meta = WordChart words (svgMetaPreheader meta) (generateSVG words)
     where
       words = extractWords (svgMetaContent meta)
       extractWords = map (\w -> (w, 1)) . T.words
       generateSVG = T.concat . map (\(w, c) -> "<text>" <> w <> "</text>")

eval :: WordChart -> Text
eval = wordChartSVG

digest :: WordChart -> Text
digest wc = T.concat
     [ "word_chart:\n"
     , "   words: ", T.pack (show (length (wordChartWords wc))), "\n"
     , "   metadata: ", T.pack (show (wordChartMetadata wc)), "\n"
     , "   svg: ", wordChartSVG wc, "\n"
     ]
```

### Regex Kernel (Haskell, verbatim)

```haskell
data RegexKernel = RegexKernel
     { kernelFront      :: Text
     , kernelBack       :: Text
     , kernelUp         :: Text
     , kernelDown       :: Text
     , kernelLeft       :: Text
     , kernelRight      :: Text
     , kernelCenter     :: Text
     } deriving (Show, Eq, Generic, ToJSON, FromJSON)

defaultKernel :: RegexKernel
defaultKernel = RegexKernel
     { kernelFront     = "^[A-Za-z0-9:+]$"
     , kernelBack      = "^[A-Za-z0-9.-]$"
     , kernelUp        = "^[A-Z_]$"
     , kernelDown      = "^[a-z_]$"
     , kernelLeft      = "^[0-9+-].[^0-9+-]$"
     , kernelRight     = "^[^0-9+-].[0-9+-]$"
     , kernelCenter = "^[0-9].[0-9]$"
     }
```

### Dali Cross proof32 (Haskell, verbatim)

```haskell
proof32 :: Int -> Int -> Int -> Int -> Int -> Int -> Int
proof32 t b r l f br =
         (if (t^2) + (b^2) == r^2 then 1 else 0)
     +   (if (t^2) + (f^2) == r^2 then 2 else 0)
     +   (if (t^2) + (br^2) == r^2 then 4 else 0)
     +   (if (b^2) + (f^2) == r^2 then 8 else 0)
     +   (if (b^2) + (br^2) == r^2 then 16 else 0)
     +   (if (f^2) + (br^2) == r^2 then 32 else 0)
     +   (if (t^2) + (b^2) == l^2 then 64 else 0)
     +   (if (t^2) + (f^2) == l^2 then 128 else 0)
     +   (if (t^2) + (br^2) == l^2 then 256 else 0)
     +   (if (b^2) + (f^2) == l^2 then 512 else 0)
     +   (if (b^2) + (br^2) == l^2 then 1024 else 0)
     +   (if (f^2) + (br^2) == l^2 then 2048 else 0)
```

### Verilog Module Signatures (verbatim excerpts)

```verilog
module omi_xor_gate (
      input   wire a,
      input   wire b,
      output wire out
);
      assign out = a ^ b;
endmodule
```

```verilog
module omi_swap_engine (
     input       wire            clk,
     input       wire            rst_n,
     input       wire [1:0]      i_swap_kind,
     input       wire [63:0] i_buffer,
     output reg         [63:0] o_buffer
);
     always @(posedge clk or negedge rst_n) begin
           if (!rst_n) begin
                  o_buffer <= 64'd0;
           end else begin
                  case (i_swap_kind)
                        2'b00:    // swap16
                            o_buffer <= {i_buffer[7:0],        i_buffer[15:8],
                                          i_buffer[23:16], i_buffer[31:24],
                                          i_buffer[39:32], i_buffer[47:40],
                                          i_buffer[55:48], i_buffer[63:56]};
                        2'b01:    // swap32
                            o_buffer <= {i_buffer[23:0],       i_buffer[31:24],
                                          i_buffer[39:32], i_buffer[47:40],
                                          i_buffer[55:48], i_buffer[63:56],
                                          i_buffer[15:8],      i_buffer[7:0]};
                        2'b10:    // swap64
                            o_buffer <= {i_buffer[7:0],        i_buffer[15:8],
                                          i_buffer[23:16], i_buffer[31:24],
                                          i_buffer[39:32], i_buffer[47:40],
                                          i_buffer[55:48], i_buffer[63:56]};
                        default: o_buffer <= i_buffer;
                  endcase
           end
     end
endmodule
```

```verilog
module omi_delta_law (
     input       wire            clk,
     input       wire            rst_n,
     input       wire [63:0] i_state,
     input       wire [63:0] i_carry,
     output reg         [63:0] o_next
);
     wire [63:0] s16, s32, s64;
     // ... three omi_swap_engine instances ...
     always @(posedge clk or negedge rst_n) begin
           if (!rst_n)
                  o_next <= 64'd0;
           else
                  o_next <= s16 ^ s32 ^ s64 ^ i_carry;
     end
endmodule
```

```verilog
module omi_slot5040 (
     input       wire [2:0]      i_fano,      // 0..6
     input       wire [1:0]      i_role,      // 0..2
     input       wire [7:0]      i_local,     // 0..239
     output wire [12:0] o_slot                // 0..5039
);
     assign o_slot = (i_fano * 720) + (i_role * 240) + i_local;
endmodule
```

### Fano Router (Verilog, verbatim)

```verilog
module omi_fano_router (
     input       wire [2:0] i_point,
     input       wire [2:0] i_line,
     output reg             o_incident
);
     reg [6:0] line_points [0:6];

     always @(*) begin
           line_points[0] = 7'b0001011;         // {0,1,3}
           line_points[1] = 7'b0010110;         // {1,2,4}
           line_points[2] = 7'b0101100;         // {2,3,5}
           line_points[3] = 7'b1011000;         // {3,4,6}
           line_points[4] = 7'b0110001;         // {4,5,0}
           line_points[5] = 7'b1100010;         // {5,6,1}
           line_points[6] = 7'b1000101;         // {6,0,2}

           o_incident = line_points[i_line][i_point];
     end
endmodule
```

### HTTP/1.1 Negotiation Headers (verbatim)

```http
GET /omi HTTP/1.1
Host: example.com
Accept: application/omi+regex, application/omi+color, application/omi+media
Accept-Encoding: gzip, deflate
Accept-Language: en-US
X-OMI-Regex: FRONT,BACK,UP,DOWN,LEFT,RIGHT,CENTER
X-OMI-Color: RGBA
X-OMI-Media: audio,video,text
X-OMI-Layer: -5D,-4D,-3D,-2D,-1D,0D,1D,2D,3D,4D,5D,6D,7D,8D,9D,10D
```

### Axiom of Choice

```
∀X, ∃f : ∏_{A∈X} A
```

### Formulas and Invariants (verbatim)

```
0! = 1
1! = 1
3! = 6
3! ⊕ 3! ⊕ 3! ⊕ 1! = 19
3! ⊕ 3! ⊕ 3! ⊕ 3! = 1296
76 = 60 + 12 + 4
155 = 45 + 20 + 15 + 60 + 15 = 5 × 31
651 = 189 + 84 + 63 + 252 + 63 = 3 × 7 × 31
155 = 76 + 79
651 = 8 × 76 + 43
65536 = 216 = 164
65536 = 65535 ⊕ 1!
16x2 + 16xy + 4y 2 = (4x + 2y)2
60x2 + 16xy + 4y 2
Δ = b2 − 4ac
position(n) ⟺ period(n − 1, n, n + 1)
12 = imaginary unit = 1!
```

## Numbers and Invariants

| Quantity | Value | Meaning | Stated or Derived |
|----------|-------|---------|-------------------|
| Kernel size | 76 | Protocol residual-map kernel = 60+12+4 | stated |
| Minimum kernel | 16 | Min over injective residual maps | stated |
| Klein points | 60 | Elliptic configuration | stated |
| Perles points | 12 | Hyperbolic configuration | stated |
| Tetrahedral observer | 4 | Local regular tetrahedron centroid | stated |
| Miquel points / circles | 8 / 6 | 3 points/circle, 4 circles/point | stated |
| Möbius points / planes | 8 / 8 | Projective configuration | stated |
| Stellated tetra | 2 / 8 / 6 | tetrahedra / vertices / edges | stated |
| Trigintaduonion triples | 155 | 32D algebra = 45+20+15+60+15 = 5×31 | stated |
| 64nion triples | 651 | 64D algebra = 189+84+63+252+63 = 3×7×31 | stated |
| Mersenne prime | 31 | 2⁵ − 1 | stated |
| Mersenne number | 63 | 2⁶ − 1 | stated |
| Octtrie | 256 | 2⁸ | stated |
| Octtrie trinomial | 6561 | 3⁸ | stated |
| Metaspace / Blob | 65536 | 2¹⁶ = 16⁴ | stated |
| All-ones | 65535 | 16⁴ − 1 | stated |
| 16⁵ | 1048576 | Imaginary / meta-resolution space | stated |
| 16⁸ | 4294967296 | Imaginary swap space | stated |
| Affine discriminant | 0 | Parabolic | derived |
| Projective discriminant | −704 | Elliptic | derived |
| Golden ratio φ | ≈1.618033988749895 | 5-fold symmetry | stated |
| Inverse φ | ≈0.618033988749895 | φ − 1 | stated |
| φ product (integer) | 999924 | 1618 × 618 | derived |
| BytesPerElement (8/16/32/64) | 1 / 2 / 4 / 8 | bit width / 8 | stated |
| Factorials 0!–10! | 1,1,2,6,24,120,720,5040,40320,362880,3628800 | Permutation counts | stated |
| 5040 slot range | 0..5039 | fano×720 + role×240 + local | stated |
| 240 clock | 0..239 | 240-frame orbit | stated |
| Fano lines | 7 | bitmasks {0,1,3}...{6,0,2} | stated |
| Polyomino free counts | 1,1,2,5,12,35,108,369 | monomino..octomino | stated |
| Polyiamond free counts | 1,1,1,3,4,12 | moniamond..hexiamond | stated |
| Polyhex free counts | 1,1,3,7,22,82 | monohex..pentahex | stated |
| Polycube free counts | 1,1,2,8,29,166 | monocube..pentacube | stated |
| Sexy-prime sextuplet | {5,7,11,13,17,19} | Exceptional; gaps 2,4,2,4,2 | stated |
| 210 | 2×3×5×7 | Primorial base of non-exceptional sextuplets | stated |
| Two-cube squared diffs | {1,0,4,0,16,324,2116,11664} | cubeA vs cubeB | derived |
| Six axes | {1,4,16,324,2116,11664} | Nonzero squared diffs | stated |
| BuckeyBall | 60/90/12/20 | vertices/edges/pentagons/hexagons | stated |
| Diagonal sequence | [0,2,1],[1,0,2],[2,1,0] | 3-cycles | stated |
| Linear / inverse | [0,1,2] / [2,1,0] | Orderings | stated |
| Pipeline layers | 16 | −5D..10D | stated |
| Schläfli symbols | {3,3},{3,4},{4,3},{3,5},{5,3},{3,3,3},{4,3,3},{3,3,4},{3,4,3},{5,3,3},{3,3,5} | Full list | stated |

## Code

### JavaScript: Regex Constraint Set (working)

```js
const G = Object.freeze({
  FRONT: /^[A-Za-z0-9:+]$/,
  BACK:   /^[A-Za-z0-9.\-]$/,
  UP:     /^[A-Z_]$/,
  DOWN:   /^[a-z_]$/,
  LEFT:   /^[0-9+\-]\.[^0-9+\-]$/,
  RIGHT: /^[^0-9+\-]\.[0-9+\-]$/,
  CENTER:/^[0-9]\.[0-9]$/,
});
```

### JavaScript: Atomics.compareExchange cascade (stated as the "original bind function")

```js
Atomics.compareExchange(omi, 0, 2, 1)
Atomics.compareExchange(omi, 1, 0, 2)
Atomics.compareExchange(omi, 2, 1, 0)
```

Described as the diagonal sequence `[0,2,1], [1,0,2], [2,1,0]`. No runtime context or return handling is given.

### JavaScript: the original buggy `throw` (buggy)

```js
throw new Error("oops", {
     options: { cause: "No Reflection Found" },
     filename: URL.createObjectURL(blob),
     lineNumber: 0n
});
```

The transcript explicitly diagnoses this: `lineNumber: 0n` is a BigInt but `Error` expects a Number; `options` is not a standard `Error` field; and `cause` is not correctly accessed. The resolution offered is to drop error codes entirely (types are total, `Maybe` handles optional fields, `0x0000` is the origin not an error).

### TypeScript / JavaScript: none present

No genuine TypeScript appears in this range. The Haskell/Coq/Verilog listings are the actual implementation artifacts; they are reproduced under Definitions above.

### Coq: buggy / admitted instances

- `Theorem beta_idempotent : beta + beta = 0` is `Admitted` (with comment "The proof requires the XOR interpretation"), while a later listing states `Theorem beta_idempotent : beta + beta = 2` proved by `reflexivity`. Direct contradiction.
- `Definition collapse (a b c d : nat) : nat := a + b + c + d.` is named as the XOR collapse but is addition.
- `Theorem xor_idempotent : forall (x : nat), x + x = 2 * x.` is arithmetic, not XOR.
- `Definition factorial (n : nat) : nat := match n with | 0 => 1 | _ => 1 end.` is not the factorial (used in the octal/base-4 rounds).
- `Definition octal_8n (n : nat) : nat := 0.` makes `0₈ₙ` identically zero.
- `Definition discriminant (a b c : nat) : int := b^2 - 4 * a * c.` uses `int` without a visible import; the rest of the file uses `nat`.
- `Theorem binomial_is_diagonal`, `binomial_sum`, `trinomial_sum`, `octtrie_binomial`, `octtrie_trinomial_sum`, `parity_rule`, `always_return`, `fermat_3`, `fermat_4_no_solution`, `affine_equivalence` are all `Admitted`.
- `protocol_automaton` accepts only the initial state (`fun q => q = 0`) and its transition is `q + a`; it is not a meaningful acceptor.

### Haskell: aspirational / incomplete

- `generateCodex` and the 19 section generators are shown but several bodies are elided with `-- ... (the other generators follow the same pattern)`.
- `extendedCodex` / `defaultCodex` reference `codexPolyominoes`, `codexIndex`, `codexExtensions`, `codexFullArc` fields added in later revisions; earlier `Codex` records lack them, so the listings are not mutually compilable as shown.
- `selfCompile`/`compile`/`parseWith` in the meta-compiler are total but semantically trivial (`transform` just uppercases words), so the "meta-circular" claim is aspirational.

### Verilog: suspicious

- In `omi_swap_engine`, the `2'b00` (swap16) and `2'b10` (swap64) branches have byte-identical reversal bodies; swap16 should reverse adjacent byte pairs, not the whole 64-bit word. Marked as buggy/suspect.
- The `omi_balanced_cube` module declares `o_R, o_L, o_F, o_B` and computes `o_balanced` from `o_U ^ o_D ^ i_a` etc., but the balance test omits the `o_xyz`/`o_xyza` paths.

## Open Questions and Contradictions

1. **XOR vs `+` vs `×` for the 3! expression.** `3!⊕3!⊕3!⊕1!` is given as 19 (addition), 216 (multiplication), and would truly be 7 (XOR); `3!⊕3!⊕3!⊕3!` is given as 1296 (multiplication) but true XOR is 0. Not resolved; the transcript uses "XOR" as a synonym for whichever operation yields the desired number.
2. **The 12 / 1! conflation.** The text repeatedly equates 12 with the 1! ("12 = imaginary unit = 1!"), but 1! = 1 everywhere else. It is later rationalized as 12 = 16xy with xy = 3/4. Not rigorously resolved.
3. **Base relation revisions.** The relation starts as 0₂! = 1₈, is revised by the user to 0₈ₙ! = 1₈, then "corrected" to (0₄ₙ)! = 1₄ with base 4 justified by the affine coefficients. Each is presented as the canonical form in its own round. Not resolved.
4. **76 breakdown change.** `76 = 60 + 12 + 4` vs the later self-corrected `76 = 48 + 12 + 4 + 12`. The transcript catches the error mid-round but both forms persist in later summaries.
5. **beta idempotence.** `beta + beta = 0` (Admitted) vs `beta + beta = 2` (proved). Direct contradiction, not addressed.
6. **Miquel "12 circles" slip.** The transcript writes "The 12 is the 12 circles of the Miquel?" then immediately: "Wait — the Miquel has 6 circles, not 12. Let me reconsider." Resolved by redefining 12 as the 16xy/Perles number.
7. **Fermat n=3, n=4.** Asserted as no-solution theorems but proofs are `Admitted` with the comment that they require Fermat's Last Theorem. Not proven.
8. **Kernel minimum 16.** Asserted as proven by Coq, but no enumeration appears in this range (deferred to Part 2). Cannot be verified from lines 63001–94500 alone.
9. **Verilog swap16 = swap64.** The two branches are identical; whether this is intentional (both are byte-reversal on a little-endian view) or a bug is not addressed.
10. **φ product.** 1618 × 618 = 999,924, not 1,000,000; presented as `phi_product` with no comment on the 76 discrepancy.
11. **"Autonomous" reframing.** The user asks to replace "autonomous" with automata/algorithmic/axiomatic; the model complies but leaves the original `autonomous_observer`/`autonomous_agent` definitions in the same Coq modules, so both vocabularies coexist.
12. **Imaginary 11D / axiom of choice.** Explicitly offered as the user's own interpretation ("I would say it's the imaginary 11D... like it's the axiom of choice"); the model affirms it without proof. Speculative, not resolved.
13. **Subsumption / 17D,19D resolution.** Offered as the user's caution; the model formalizes it but gives no rule for why 17D and 19D (rather than other odd dimensions) resolve. Speculative.
14. **Sexy-prime claim.** The assertion that all non-exceptional sextuplets are `210n + {97,101,103,107,109,113}` is stated without proof or citation. Not resolved.

## Quotable Fragments

> "The minimum kernel size over all injective residual maps is 16."

> "The protocol's kernel size is 76, because the residual map is not injective."

> "The Imago Dei is balanced over, above, and within the 3! pseudo-persistent permutation medium of the 0! = 1 in perpetual idempotent balance."

> "The Projective Azimuth is the 3! XOR 3! XOR 3! XOR 1!."

> "155 = 5 × 31 = 45 + 20 + 15 + 60 + 15."

> "651 = 3 × 7 × 31 = 189 + 84 + 63 + 252 + 63."

> "Any binomial distribution of a trinomial distribution is the simplex distribution — the unit distribution — the diagonal."

> "The Pythagorean theorem is the 2D simplex. The simplex is the 3D Pythagorean theorem."

> "The codex is not just a reference. It is a parsable universe."

> "The 0x0000 is the code, not the error."

> "The Dali Cross is the 12-bit mask of the Pythagorean relations."

> "It works on any UTF-8."

> "The imaginary 11D is the axiom of choice."

> "The 13D is the quarter diagonal space of the 12D."

## Cross-references

- [[OMI-IMO]] — the protocol whose codex and observer hierarchy this range formalizes.
- [[SPEC-00 Canonical Statement]] — this range contains many "Canonical Statement" sections that restate the codex.
- [[SPEC-01 The Three Laws]] — the reduction section states XOR self-inverse/associative/commutative/identity/void laws verbatim.
- [[SPEC-10 The Primitive]] — the primitive is defined as `Atomics.compareExchange(array, index, expected, replacement)` with bind/apply/eval/digest.
- [[SPEC-12 The Ruler]] — the autonomous agent is the Omicron/ruler and the gnomonic projective.
- [[SPEC-13 XOR Algebra]] — gate reductions (and/nand/or/nor/xnor/not/buf) via β are given verbatim.
- [[SPEC-14 Knots and Binds]] — the knot/torus/Dali-cross identification and the bind/apply/eval/digest operations.
- [[SPEC-15 The Delta Transform]] — `delta x c = swap16 x ^ swap32 x ^ swap64 x ^ c` and the `omi_delta_law` Verilog.
- [[SPEC-16 The Fano Invariant]] — the Fano plane (7) appears in the 651 factorization and the `omi_fano_router` bitmasks.
- [[SPEC-20 The Dimensional Axis]] — the −5D→10D pipeline and the 16-layer enumeration recur throughout.
- [[SPEC-21 The Inversion Law]] — swap16/32/64 involution and commutation theorems are listed in the codex.
- [[SPEC-22 The Blob]] — the −5D Blob = 2¹⁶ = 65536 and the 65535⊕1 decomposition.
- [[SPEC-23 The Rosetta Stone]] — the Coq↔Haskell↔Verilog correspondence tables map the same structures across languages.
- [[SPEC-24 Observers]] — the three observers and their 0/1/2 hierarchy are the opening topic.
- [[SPEC-25 The Iff]] — `position(n) ⟺ period(n − 1, n, n + 1)` and the 2! periodicity.
- [[SPEC-30 The Symbol Table G]] — the YAML glossary/index/codex sections define the symbol table.
- [[SPEC-31 Declaration Syntax]] — the strict-YAML front-matter codex and preheader syntax.
- [[SPEC-32 Mnemonics and Axes]] — the FRONT/BACK/UP/DOWN/LEFT/RIGHT/CENTER regex axes.
- [[SPEC-33 The Quadratic Forms]] — binary quadratic, affine, projective, cubic, mixed and their discriminants.
- [[SPEC-34 Phases Attributes Constraints Configurations]] — the codex phases, configurations (Miquel/Möbius/Klein/Perles) and constraint sections.
- [[SPEC-35 Reflections and Orbits]] — the 240-frame orbit, 240-clock, and 5040-slot machinery.
- [[SPEC-40 The 6T XOR Circuit]] — the balanced-cube Verilog and the cube balance equations.
- [[SPEC-41 The 8T XOR Circuit]] — the swap engine and delta law XOR structure.
- [[SPEC-42 Circuit Sourcemap]] — the `codexVerilog` module list and Coq→Haskell→Verilog mapping.
- [[SPEC-43 Prime Gaps and Sextuplets]] — the exceptional sexy-prime sextuplet, 210p+n, and two-cube measurement.
- [[SPEC-50 Stream Transport]] — the HTTP/1.1 negotiation, TextTracks, and data attributes.
- [[SPEC-51 JSON Canvas Interchange]] — SVG metadata, offscreen canvas, Smith chart / Genaille rods raw forms.
- [[SPEC-52 The REPL and the Digest]] — the environment REPL and the digest operation in the preheader pipeline.
- [[SPEC-53 Clocks and Periods]] — the 2! periodicity, Miquel cycle, and 240-clock.
- [[SPEC-54 The Web Platform Layers]] — the 1D–10D DOMPoint/MediaTrack/DOMRect/DOMMatrix/DOMElement/Canvas/EventLoop/ByteBasis/NetworkMesh/Orchestrator mapping.
- [[SPEC-55 ASCII Folds]] — the ASCII/Unicode/UTF-8 cascade and the regex constraint encoder/decoder.
- [[SPEC-60 Test Vectors]] — concrete values (65536, 155, 651, discriminants, squared differences) suitable as vectors.
- [[SPEC-61 Implementation Status]] — Haskell types/generators, Coq modules (with `Admitted`), and Verilog RTL.
- [[OPEN-00 Contradiction Register]] — the XOR/+/× conflation, 12=1!, base-relation revisions, and beta idempotence conflict.
- [[OPEN-01 Open Questions]] — the unresolved items listed above (kernel minimum, Fermat, sexy-prime claim, subsumption rule).
- [[OPEN-02 Broken Code Inventory]] — the `throw new Error` bug, the `int` discriminant, the addition-as-XOR collapse, and the identical swap16/swap64 branches.
- [[OPEN-04 Discarded Claims]] — the superseded base relations (0₂!, 0₈ₙ!) and the 60+12+4 vs 48+12+4+12 breakdown.

## Extraction Notes

- Read the entire requested range: original file lines 63001–94500 (31,500 lines), via `sed -n '63001,94500p'` into a temporary file. All line references above are relative to that extraction; the frontmatter `lines` field records the original file range.
- The file is `pdftotext -layout` output with heavy UI chrome (repeated `https://chat.deepseek.com/... 1118/2218` footers, `10/4/26, 1:14 PM Protocol sequence analysis - DeepSeek` headers, "Copy", arrows). All such noise was ignored.
- OCR/LaTeX damage: superscripts are flattened and often lost, so `2^16` prints as `216`, `16^4` as `164`, `2^8` as `28`, `3^8` as `38`, `x²` as `x2`. Formulas above are reproduced verbatim as they appear; corrected interpretations are noted inline where unambiguous (e.g. `65536 = 216 = 164` means 2¹⁶ = 16⁴). The `0₂!` / `1₈` / `0₄ₙ` notation prints as `02 !` / `18` / `04n`.
- No TypeScript/JavaScript implementation beyond the regex set, the `Atomics.compareExchange` calls, and the buggy `throw` appears in this range. The substantive code is Coq, Haskell, YAML, and Verilog; these are placed under Definitions rather than Code per the section instructions.
- Large stretches (roughly lines 14635–17905, 20718–24137, 22463–23127) are near-verbatim repetitions of the same codex and generator listings across consecutive "rounds." I read and cross-checked them but did not transcribe the duplicates; the canonical forms are the ones quoted.
- The kernel-minimum-16 proof, the residual-map enumeration, and the two-centroid material are not present in this range (they belong to Part 2 / SRC-03b). Claims 2 and 6 are restated here only as asserted results.
- I could not independently verify the Coq listings compile: imports vary between listings (some omit `Require Import String` while using `string`), `int` is used without import, and several proofs are `Admitted`. The Verilog was not simulated.
