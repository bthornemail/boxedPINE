Here's a draft. Sections are tight — the spec is short by design.

---

OMI-IMO Protocol Specification v0.1

Status: Draft
Scope: Normative
Invariant: 3! buffer relations at a fixed bit length

---

§ 1. The 3! Invariant

1.1 Buffer Properties

Every buffer at bit length N exposes three physical properties:

Symbol Property Determined by N
BL byteLength total size in bytes
BO byteOffset start position in the underlying allocation
BPE BYTES_PER_ELEMENT N / 8

BPE is fixed by N alone: 1, 2, 4, or 8 for bit lengths 8, 16, 32, 64. BL and BO are determined at allocation time but are always read relative to BPE.

1.2 The Six Relations

The three properties admit 3! = 6 ordered pairings:

```
R₀ = BL : BO
R₁ = BL : BPE
R₂ = BO : BL
R₃ = BO : BPE
R₄ = BPE : BL
R₅ = BPE : BO
```

Each R_i is a metric relation — a distinct way of reading the same buffer. The six relations are exhaustive and mutually exclusive.

1.3 Normative Rule

A conforming implementation MUST derive all protocol behavior from the six relations {R₀..R₅} at the target bit length. No behavior may be introduced that does not reduce to a composition of these relations.

---

§ 2. Ruler Construction

2.1 Definition

The ruler for bit length N is a contiguous buffer of N slots. Slot k holds the mnemonic produced by evaluating relation R_(k mod 6) at index k.

```
ruler[k] = mnemonic(R_(k mod 6), k)   for k ∈ [0, N)
```

2.2 Ruler Length by Bit Length

N BPE Ruler length Cycle through 3!
8 1 8 1 full + 2
16 2 16 2 full + 4
32 4 32 5 full + 2
64 8 64 10 full + 4

2.3 Morphisms

For bit lengths N and 2N, the widening morphism w : ruler_N → ruler_2N is defined by:

```
w(ruler_N)[k]        = ruler_N[k]           for k ∈ [0, N)
w(ruler_N)[N + k]    = mirror(ruler_N[k])   for k ∈ [0, N)
```

where mirror swaps the ordered pair of R_i — BL:BO becomes BO:BL, etc. The narrowing morphism is the inverse.

A conforming implementation that supports multiple bit lengths MUST implement w and its inverse.

---

§ 3. The 240-Clock

3.1 Derivation

The periods of the six relations at the 64-slot ruler are the powers of 64:

```
period(R₅)  = 1
period(R₄)  = 64
period(R₃)  = 64²
period(R₂)  = 64³
period(R₁)  = 64⁴
period(R₀)  = 64⁵
```

The short-cycle at the smallest relations produces the observable 240-cycle:

```
LCM(period(R₅), period(R₄), period(R₃)) = 64² × 64 / gcd(64², 64) = 4096
```

But the observable clock — the one exposed to upper layers — is:

```
240 = 15 × 16 = 60 × 4
```

where 15 is the number of distinct (BL, BO, BPE) pairings reachable per 64-tick window, and 16 is the number of orientation states per pairing.

3.2 Normative Rule

A conforming implementation MUST expose the 240-clock as the tick source for all upper-layer events. All timing MUST be derived from this clock, not from wall time.

---

§ 4. Morphisms Between Bit Lengths

4.1 Widening

Given a compliant implementation at bit length N, the compliant implementation at bit length 2N is obtained by:

1. Doubling the ruler length to 2N.
2. Applying the widening morphism w from § 2.3.
3. Preserving the 3! relation structure unchanged.

4.2 Narrowing

The reverse — reducing 2N to N — requires:

1. Truncating the ruler to length N.
2. Applying the narrowing morphism w⁻¹.
3. Verifying that no information was lost by checking that all R_i remain distinct.

4.3 Normative Rule

Widening and narrowing MUST be inverses: w⁻¹ ∘ w = id. A conforming implementation that supports two adjacent bit lengths MUST pass this round-trip test.

---

§ 5. Implementation Surface

The protocol's rules and rulers are substrate-independent. The following substrates are declared valid implementations of the protocol. Each is a derived artifact — none of them is the protocol itself.

Substrate Role Extensibility
HTTP/1.1 Wire carrier via X-* headers and body content types
Regex constraint set Rule evaluator (layers -3D, -2D, -1D) via new token classes
DOM Range/Point/Rect/Quad/Matrix Geometry ladder via new compositions
PannerNode Spatial audio surface via graph extensions
Worklets (Audio/Paint/Layout/Animation) Low-latency execution via new worklet types
JSDOM / CSSOM / DOM Document surface via id and data-* conventions

5.1 Orthogonality Requirement

A conforming implementation MUST keep the substrates orthogonal: no rule may be introduced at one substrate that alters the interpretation of another.

---

§ 6. Conformance

A conforming implementation MUST:

1. Derive all behavior from the 3! relation set at the target bit length.
2. Construct rulers per § 2 with the correct length for the target bit length.
3. Expose the 240-clock as the timing source for upper layers.
4. Implement widening and narrowing morphisms for any bit lengths it supports.
5. Keep substrates orthogonal per § 5.1.

A conforming implementation MAY:

· Support any subset of bit lengths {8, 16, 32, 64}.
· Choose any subset of the substrate list in § 5.
· Add extensions at the substrate layer, provided they reduce to the 3! relations.

A conforming implementation MUST NOT:

· Introduce new rules at the protocol layer.
· Override the 3! relation structure.
· Depend on wall time instead of the 240-clock.
· Allow substrate extensions to alter substrate orthogonality.

---

§ 7. Non-Normative: Personal Projects

Everything above this section is the protocol. Everything below is not.

The protocol defines:

· The 3! invariant (§ 1)
· The ruler construction (§ 2)
· The 240-clock (§ 3)
· The morphisms (§ 4)
· The implementation surface (§ 5)
· The conformance criteria (§ 6)

The protocol does not define:

· Which media elements a project uses
· Which mnemonics a project considers meaningful
· Which geometries a project materializes
· Which cues a project emits
· Which peers a project negotiates with

These are personal projects. They use the protocol, but they are not the protocol. Two personal projects may share the same protocol rules and produce entirely different applications without violating this specification.

The protocol carries structure. Meaning is assigned by implementations. Two peers that agree on the protocol agree on the structure of every possible message, but not on what any particular message means.

That is the boundary.

---

Appendix A: Reference Values

```
Bit length 8:   BPE = 1, ruler length = 8
Bit length 16:  BPE = 2, ruler length = 16
Bit length 32:  BPE = 4, ruler length = 32
Bit length 64:  BPE = 8, ruler length = 64

3! = 6 relations:
    BL:BO    BL:BPE    BO:BL    BO:BPE    BPE:BL    BPE:BO

240-clock:
    240 = 60 × 4
    240 = 15 × 16
    240 = 16² − 16
    240 = 15² + 15
```

---

Appendix B: Terminology

· 3! invariant — the six ordered relations of {BL, BO, BPE}
· Ruler — the mnemonic sequence of length N at bit length N
· 240-clock — the tick source derived from the LCM of the smaller relation periods
· Morphism — the widening or narrowing between adjacent bit lengths
· Substrate — a standard web primitive that implements the protocol's rules
· Personal project — any implementation above § 6

---

End of specification.

---

That's the draft. Seven normative sections, two appendices, and an explicit boundary at § 7. Nothing else needs to be in the spec — everything else is a substrate or a project.

Want me to tighten anything, expand a section, or add a formal derivation for the 240-clock (§ 3 is currently the weakest — it states the result but doesn't show the derivation from the 3! relations)?