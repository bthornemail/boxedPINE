# The OMI Protocol: A Complete Specification

## From First Principles to Physical Circuit

---

## Part I: The Foundation

### 1.1 The One Primitive

Everything begins with a single hardware operation:

```
Atomics.compareExchange(buffer, index, expected, replacement)
```

This operation:
1. Reads the value at `index`
2. Compares it to `expected`
3. If equal, writes `replacement` and returns the old value
4. If not equal, writes nothing and returns the actual value

**The return is the difference, not a value.**

```
difference = expected ^ actual
```

- If `difference == 0`: The frame is **closed**. The write succeeds.
- If `difference != 0`: The frame is **open**. The difference is the measurement.

This is the only mutation primitive. Everything else is a reading of its result. XOR is the operation because it is self-inverse:

```
(expected ^ actual) ^ expected = actual
```

The measurement is its own repair.

### 1.2 The Zero Condition

An observer can only expect and offset from an operation when the difference is zero.

```
xor = 0  →  the frame is set, the operation has an anchor
xor ≠ 0  →  no frame, no origin, no operation
```

This is not agreement as a value. It is the precondition for an operation to exist.

---

## Part II: The Block

### 2.1 The Tetrahedron

The state of the system is a **regular tetrahedron**.

```
Vertices (4): 0x, 0b, 0o, 0d  — the four radix readings
Edges (6):    the six pairwise relations between vertices
Faces (4):    the four triples of vertices
Centroid (1): 0p, 0i, 0n  — the three literals
```

| Element | Count | Role |
|---------|-------|------|
| Vertices | 4 | The four radix readings (scales) |
| Edges | 6 | The six pairwise relations (bits) |
| Faces | 4 | The four triples (consensus readings) |
| Centroid | 1 | The fixed reference (point, index, number) |

### 2.2 The State Word

The state of the block is a 6-bit selection word:

```
b = (b₀₁, b₀₂, b₀₃, b₁₂, b₁₃, b₂₃) ∈ F₂⁶
```

Where each bit says whether a pairwise relation between two radices is active.

```
|F₂⁶| = 2⁶ = 64 possible states
```

### 2.3 The Two Readings

The same 6-bit state `b` is read two ways:

**Vertex Reading (∂_V):**

```
∂_V : F₂⁶ → F₂⁴
```

For each vertex, count incidence parity. A face boundary closes because every vertex appears twice: `1 ⊕ 1 = 0`.

**Face Reading (∂_F):**

```
∂_F : F₂⁶ → F₂⁴
```

Each edge belongs to two faces. Read the same selection against the four faces.

### 2.4 Closure

A selection is closed when its incidence boundary is zero:

```
∂_V(b) = 0000  →  vertex-closed
∂_F(b) = 0000  →  face-closed
```

The four face words, in edge order (e₀₁, e₀₂, e₀₃, e₁₂, e₁₃, e₂₃):

```
f₀ = 000111
f₁ = 011001
f₂ = 101010
f₃ = 110100
```

Each satisfies `B_V fᵢ = 0000`. Each is vertex-closed.

### 2.5 The Four Families

The 64 states partition into families:

| Family | Bases | Property |
|--------|-------|----------|
| Four-block | 3, 7, 11, 15 | bits 0, 1 set; descending runs |
| Ascending | 0, 4, 8, 12 | bits 0, 1 clear; ascending runs |
| Pair-swap (bit 0) | 1, 5, 9, 13 | bit 0 only |
| Mid-swap (bit 1) | 2, 6, 10, 14 | bit 1 only |
| 5-bit bases | 17, 19 | higher walks |

The **four-block family** {3, 7, 11, 15} is the natural orbit of the middle layer:

```
3  →  A B C D
7  →  B A D C
11 →  C D A B
15 →  D C B A
```

Base 7 is the **fulcrum**: its first half is 7..0 and its second half is 15..8, splitting the space cleanly.

Base 19 is the **orbital base**: fully orthogonal to the diagonal, its walk is the pure cycle.

---

## Part III: The Sexagesimal Orbit

### 3.1 The Generator

The orbit of 60 under XOR:

```
60 = 0x3C = 00111100
```

The first sixteen steps:

```
60 ^ 0  = 60  <
60 ^ 1  = 61  =
60 ^ 2  = 62  >
60 ^ 3  = 63  ?
60 ^ 4  = 56  8
60 ^ 5  = 57  9
60 ^ 6  = 58  :
60 ^ 7  = 59  ;
60 ^ 8  = 52  4
60 ^ 9  = 53  5
60 ^ 10 = 54  6
60 ^ 11 = 55  7
60 ^ 12 = 48  0
60 ^ 13 = 49  1
60 ^ 14 = 50  2
60 ^ 15 = 51  3
```

### 3.2 The Four Blocks

Four descending runs of four:

| Block | ASCII | Characters | Bits 4,5 |
|-------|-------|------------|----------|
| 0 | 60–63 | `< = > ?` | 11 |
| 1 | 56–59 | `8 9 : ;` | 10 |
| 2 | 52–55 | `4 5 6 7` | 01 |
| 3 | 48–51 | `0 1 2 3` | 00 |

### 3.3 The Regex Grammar

```javascript
BLOCK_0 = /^[<=>?]$/;  // 60-63  comparison operators
BLOCK_1 = /^[89:;]$/;  // 56-59  high digits + low punctuation
BLOCK_2 = /^[4567]$/;  // 52-55  middle digits
BLOCK_3 = /^[0123]$/;  // 48-51  low digits
```

### 3.4 The High-Bit Toggle

```
60 ^ 64 = 124 = '|'
```

The transition from the low half (0–63) to the high half (64–127). This toggles the execution context between the printable control region and the boundary enclosure.

---

## Part IV: The Binary Quadratic Form

### 4.1 The Projective Form

```
Q₆₀(x, y) = 60x² + 16xy + 4y²
```

Discriminant:

```
Δ = 16² − 4·60·4 = 256 − 960 = −704
```

### 4.2 The Affine Form

```
Q₁₆(x, y) = 16x² + 16xy + 4y² = (4x + 2y)²
```

Discriminant:

```
Δ = 16² − 4·16·4 = 256 − 256 = 0
```

A perfect square — the degenerate case.

### 4.3 The Lift

```
Q₆₀(x, y) − Q₁₆(x, y) = 44x²
```

The lift is `44x² = 4 × 11 × x²`.

### 4.4 The Decomposition

```
Q₆₀ = 60x² + 16xy + 4y²
    = 4(15x² + 4xy + y²)
    = 4(11x² + 4x² + 4xy + y²)
    = 44x² + 4(2x + y)²
    = 44x² + Q₁₆
```

The `11x²` is the irreducible residue — the part that doesn't factor into the square.

### 4.5 The Cross-Term

The bridge term `16xy` evaluates to 12 at the half-unit diagonal:

```
x = 3/2, y = 1/2  →  16 × 3/2 × 1/2 = 12
```

And `12 = 01100₂` has bits 2 and 3 set — the diagonal.

Base 19 (`10011₂`) has bits 2 and 3 clear, making it **fully orthogonal** to the diagonal.

---

## Part V: The Delta Transform

### 5.1 The Hamming Step

```javascript
function delta(buf, C) {
    return xor(xor(xor(rotl(buf, 1), rotl(buf, 3)), rotr(buf, 2)), C);
}
```

Three rotations are the parity checks:

- `rotl(buf, 1)` checks bit i against bit i−1
- `rotl(buf, 3)` checks bit i against bit i−3
- `rotr(buf, 2)` checks bit i against bit i+2
- `C` is the syndrome (correction)

### 5.2 Period 8

The delta law has exact period 8:

```
delta⁸(x, c) = x  for all x, c
deltaᵏ(x, c) ≠ x  for 1 ≤ k ≤ 7
```

### 5.3 The 16/8 Fold

```javascript
function delta16(ruler) {
    const state = Buffer.from(ruler.subarray(0, 8));
    const C = Buffer.from(ruler.subarray(8, 16));
    const next = delta(state, C);
    ruler.set(next, 0);
    ruler.set(state, 8);
    return ruler;
}
```

The 16-byte ruler:

- Bytes 0–7: the spatial state (the **local**)
- Bytes 8–15: the correction (the **shared**)

Each cycle, the halves swap. Period 8.

### 5.4 The Ruler Layout

| Index | Name | Role |
|-------|------|------|
| 0 | diagonal | the frame condition |
| 1 | size | the precision |
| 2 | top | spatial |
| 3 | bottom | spatial |
| 4 | right | spatial |
| 5 | left | spatial |
| 6 | forward | spatial |
| 7 | backward | spatial |

```
2! + 3! = 2 + 6 = 8
```

Index 0 is the frame condition. Index 1 is readable only if the frame is closed. Indices 2–7 are the six spatial operations.

### 5.5 The Top 8 as Operations

| Index | Operation | Role |
|-------|-----------|------|
| 8 | buffer | the current reference |
| 9 | get | read the current position |
| 10 | set | write the current position |
| 11 | catch | handle the failure |
| 12 | bind | build the relation |
| 13 | apply | invoke the relation |
| 14 | eval | extract from the relation |
| 15 | digest | fold the relations |

Seven operations plus the buffer.

---

## Part VI: The Seven-Gate Reduction

### 6.1 All Gates Reduce to XOR and β

| Gate | Expression | β Count |
|------|------------|---------|
| BUF | `a` | 0 |
| XOR | `a ⊕ b` | 0 |
| NOT | `a ⊕ β` | 1 |
| XNOR | `(a ⊕ b) ⊕ β` | 1 |
| AND | `a ⊕ (a ⊕ b) ⊕ b` | 0 |
| NAND | `(a ⊕ (a ⊕ b) ⊕ b) ⊕ β` | 1 |
| OR | `a ⊕ b ⊕ AND(a, b)` | 0 |
| NOR | `(a ⊕ b ⊕ AND(a, b)) ⊕ β` | 1 |

### 6.2 The β-Cancellation

Unnegated gates (BUF, XOR, AND, OR) contain zero β terms.

Negated gates (NOT, XNOR, NAND, NOR) each contain exactly one β.

Across a complete 4-gate negated suite:

```
β ⊕ β ⊕ β ⊕ β = 0
```

The observer units cancel completely, holding the circuit in idempotent zero-closure.

---

## Part VII: The Physical Circuit

### 7.1 The Four Transistor Topologies

| Circuit | Transistors | Topology | Role |
|---------|-------------|----------|------|
| 5T | 5 | NAND + switch + OR | bind / BOOT0 |
| 6T | 6 | 5T + inverter driver | apply / BOOT1 |
| 8T | 8 | 4 NAND gates | eval / SECURE |
| 10T | 10 | 5 NOR gates | digest / USER |

### 7.2 The 5T Circuit (Terminal Read)

**Function:** Minimal XOR, stand-alone read anchor.

**Components:** 5 NPN BJTs (2N2222), 5× 2kΩ, 1× 330Ω, 1× LED, 5V, DIP switches.

**Topology:**

- Q1, Q2: NAND stage (series wire-AND)
- Q3: switch stage
- Q4, Q5: OR-like stage

**Signal Flow:**

```
Inputs A, B → Q1, Q2 (NAND) → Q3 (switch) → Q4, Q5 (OR-like) → LED
```

**Output:** Collector of Q4 is BOOT0.

**Property:** Cannot drive downstream logic. Reads only.

### 7.3 The 6T Circuit (Interior Driver)

**Function:** Adds inverter stage for fan-out.

**Components:** 6 NPN BJTs.

**Connection from 5T:** BOOT0 → 2kΩ → B(Q6).

**Output:** Collector of Q6 is BOOT1.

**Property:** Full-drive signal. Propagates onward.

### 7.4 The 8T Circuit (Composable Matrix)

**Function:** 4 NAND gates for gate-level composability.

**Components:** 8 NPN BJTs.

**Topology:**

- NAND1 (Q7, Q8): Inputs A, B
- NAND2 (Q9, Q10): Input A, NAND1
- NAND3 (Q11, Q12): Input B, NAND1
- NAND4 (Q13, Q14): NAND2, NAND3

**Output:** Collector of Q14 is SECURE.

### 7.5 The 10T Circuit (Full Form)

**Function:** 5 NOR gates for maximal reliability.

**Components:** 10 NPN BJTs.

**Topology (collectors tied for wire-AND NOT-OR):**

- NOR1 (Q15, Q16): Inputs A, B
- NOR2 (Q17, Q18): Input A, NOR1
- NOR3 (Q19, Q20): Input B, NOR1
- NOR4 (Q21, Q22): NOR2, NOR3
- NOR5 (Q23, Q24): Buffer

**Output:** Collector of Q23 is USER.

### 7.6 The Full Pipeline

```
BOOT0 → BOOT1 → SECURE → USER
 5T      6T       8T      10T
```

**Centroid:**

```
Centroid = BOOT0 ⊕ BOOT1 ⊕ SECURE ⊕ USER
```

When all four face outputs balance, the accumulated difference returns to zero.

### 7.7 The Endpoints and Interior

| Position | Role | Property |
|----------|------|----------|
| 5T | endpoint | read, do not drive |
| 6T | interior | declaration, reflect |
| 8T | interior | definition, proxy |
| 10T | endpoint | read, and drive |

Any number of 6T and 8T gates can exist between the endpoints. The interior is a multiset because XOR is commutative.

### 7.8 The Entropic Path

A complete circuit may hold many 5T, 6T, 8T, and 10T gates. Choosing one 5T, one 10T, and optionally one 6T or 8T selects one path from all possible paths.

```
path = (5T, 10T, interior multiset)
```

The number of possible paths is the entropy. The well-formed paths are the ones that close.

---

## Part VIII: The Pipeline

### 8.1 The Ten Stages

```
SExpr → Citation → Gauge → WittgensteinOperator → TruthGate
→ DecisionTable → KarnaughMap → Combinator → Delta
→ Blackboard → ProjectionFace → Attestation
```

| Stage | Input | Output | Role |
|-------|-------|--------|------|
| Citation | SExpr | Relation + Gauge | the declaration |
| Gauge | Relation | 0xF0–0xFF | the operator |
| Wittgenstein | Gauge | 0–15 | the truth table |
| TruthGate | Operator | Classification | the gate |
| DecisionTable | Classification | Table | the rules |
| KarnaughMap | Table | Map | the reduction |
| Combinator | Map | Combinator | the combinator |
| Delta | Combinator | Fold | the transform |
| Blackboard | Fold | State | the memory |
| ProjectionFace | State | Projection | the reading |
| Attestation | Projection | Witness | the closure |

### 8.2 The Pipeline as One Function

```haskell
resolveDeclaration =
    attestProjection
  . projectFace
  . constructBlackboard
  . applyDelta
  . buildCombinator
  . reduceKarnaugh
  . decisionFromGate
  . classifyTruthGate
  . selectGauge
  . citeDeclaration
```

### 8.3 The Invalid Chain

Every stage carries the Relation forward. If a stage fails, it produces an `Invalid*` variant that still carries the Relation. The invalidity is a structural property, not a separate error channel.

---

## Part IX: The Handler

### 9.1 The Three Primitives

| Primitive | Role | Example |
|-----------|------|---------|
| Regex | Constraint | `admissible(position)` |
| Proxy | Trap | `get`, `set`, `has` |
| Reflect | Operation | `Reflect.get`, `Reflect.set` |

### 9.2 The Grammar

```javascript
const GRAMMAR = {
  POINT:    /^(\d+)p$/,
  INDEX:    /^(\d+)i$/,
  NUMBER:   /^(\d+)n$/,
  EXPONENT: /^(\d+)e(\d+)$/,
  BINARY:   /^0b(\d+)$/,
  OCTAL:    /^0o(\d+)$/,
  HEX:      /^0x(\d+)$/,
  DECIMAL:  /^(\d+)\.(\d+)$/,
  LITERAL:  /^(\d+)([boxd])(\d+)([pin])$/,
  STRUCT:   /^(\d+)([e.])(\d+)([boxd])(\d+)([pin])$/,
  EXCHANGE: /^0([pn])(\d)([boxd])(\d)0([np])$/,
};
```

### 9.3 The Handler

```javascript
function makeHandler(state = {}) {
  return new Proxy(state, {
    get(target, position) {
      if (!admissible(position)) {
        throw new TypeError(`inadmissible position: ${position}`);
      }
      return Reflect.get(target, position);
    },
    set(target, position, value) {
      if (!admissible(position)) {
        throw new TypeError(`inadmissible position: ${position}`);
      }
      return Reflect.set(target, position, value);
    },
    has(target, position) {
      return admissible(position) && Reflect.has(target, position);
    },
  });
}
```

### 9.4 The Kernel

```javascript
function makeKernel(grammar, initial = {}) {
  const state = makeHandler(initial);
  const history = [];

  function step(position, expected, replacement) {
    const result = compareExchange(state, position, expected, replacement);
    history.push({ position, result });
    return result;
  }

  function close(positions) {
    return digest(state, positions);
  }

  return { state, step, close, history };
}
```

### 9.5 The Self-Modifying Extension

```javascript
function learn(kernel, name, source) {
  kernel.state.learn(name, source);
  return kernel;
}
```

The kernel can extend its own grammar. The scope chain lets every layer reach every other layer.

---

## Part X: The iExtant Torus

### 10.1 The Coordinates

| Coordinate | Values | Axis |
|------------|--------|------|
| scope | FS, GS, RS, US | the scope axis |
| shape | KK, KU, UK, UU | the shape axis |

Two coordinates, each cyclic over four values. Sixteen cells.

### 10.2 The Diagonal

```
(FS, KK) ⊕ (GS, KU) ⊕ (RS, UK) ⊕ (US, UU) = 0
```

The diagonal is the closure. Four cells close to zero.

### 10.3 The Metric

```javascript
function toroidalDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 4 - d);
}

function weight(p1, p2) {
  const Δs = toroidalDistance(p1.scope, p2.scope);
  const Δh = toroidalDistance(p1.shape, p2.shape);
  return Δs + Δh;
}
```

The weight ranges over 0 to 4. Zero means the peers agree.

### 10.4 The P2P Protocol

```
A holds (scope_A, shape_A)
B holds (scope_B, shape_B)
A transmits (scope_A, shape_A) to B
B transmits (scope_B, shape_B) to A
Both compute: weight = Δs + Δh
```

The wire carries only the two coordinates. The weight is derived.

### 10.5 The Properties

| Property | Description |
|----------|-------------|
| No central authority | Both peers compute the same weight |
| Symmetric | weight(a, b) = weight(b, a) |
| Total | Every pair has a defined weight |
| Clockless | The weight does not depend on time |

---

## Part XI: The BIOS and Kernel

### 11.1 The BIOS as Clauses

```prolog
% The reset vector
reset(0x0000) :- power_on.

% The endpoints
endpoint(5T).
endpoint(10T).

% The interior forms
interior(6T).
interior(8T).

% All forms apply XOR
applies_xor(G) :- endpoint(G).
applies_xor(G) :- interior(G).

% A path is between the endpoints
path(P) :- start(P, 5T), end(P, 10T), interior_of(P, _).

% Conservation: the path's accumulated XOR is the answer
accumulated(P, 0) :- path(P), no_interior(P).
accumulated(P, M) :- path(P), mask_of(P, M).
```

### 11.2 The Kernel

```prolog
% Run until closure
run(P, P) :- closed(answer(P)).
run(P, P2) :- step(P, P1), run(P1, P2).

% A step executes one well-formed opcode
step(P, P1) :- well_formed(T, D), executes(T, D), apply(T, P, P1).

% The kernel is the fixed point
kernel(P) :- boots(Seq), run_from(Seq, P).
```

### 11.3 The Boot Sequence

```
1. switch selects a base from {3, 7, 11, 15}
2. the base determines the orbit
3. the orbit is the walk through 16 positions
4. each position is a state on the blackboard
5. the 6T/8T gates read and write the blackboard
6. the 10T endpoint reads the final state
```

---

## Part XII: The Ruler and Rule

### 12.1 The Ruler

The ruler is 16 bytes:

```
ruler[0..7]   the spatial subarray   the reference literal
ruler[8..15]  the reference operations   the top 8
```

### 12.2 The Rule

The rule is 8 bytes — the content half:

```
rule[0] = diagonal
rule[1] = size
rule[2] = top
rule[3] = bottom
rule[4] = right
rule[5] = left
rule[6] = forward
rule[7] = backward
```

### 12.3 The Knot

```
knot[rule] = ruler
knot[ruler] = rule
```

The knot is symmetric. Bind a rule to a ruler and you have a relation that reads the same from either side.

### 12.4 The Fold Rule

```
index 0 must agree  →  the frame condition
index 1 may differ  →  the reading of precision
indices 2-7 must agree  →  the six spatial operations
```

The fold is exact when index 0 agrees and indices 2–7 agree. Index 1 may differ, and if it differs, that difference is the reading of precision.

---

## Part XIII: The Three Cubes

### 13.1 Two Canvas Views

| Cube | Position | Role |
|------|----------|------|
| 0 | bottom 8 | the first canvas view |
| 1 | top 8 | the second canvas view |
| 2 | between | the blackboard |

### 13.2 The Blackboard

The blackboard holds the four-block family:

```
{3, 7, 11, 15}
```

### 13.3 The Fold

Each cycle, Cube 0 and Cube 1 swap their roles:

```
even cycles: Cube 0 = Exponent, Cube 1 = Exception
odd cycles:  Cube 0 = Exception, Cube 1 = Exponent
```

Cube 2 stays invariant — the blackboard state is the same in both chiralities.

### 13.4 The 60 of 64

The orbit visits 64 values. The regex keeps 60. The 4 skipped are the boundaries.

```
60 kept  →  the values in the 12 blocks
4 skipped  →  the boundaries between blocks
```

---

## Part XIV: The 240-Clock

### 14.1 Derivation

```
240 = 2 × T(8) = 2 × 120 = 2 × 5!
```

### 14.2 The Period Hierarchy

| Period | Value | Role |
|--------|-------|------|
| Unit cell | 8 | the delta law period |
| Time crystal | 240 | the master clock period |
| Supercell | 5040 | the slide rule (7!) |

### 14.3 The Timestamp

Every atomic frame transition records a 240-clock tick index at offset `0x0C` inside a 16-byte receipt in the SECURE ring.

### 14.4 The Cross-Domain Bridge

| Domain | Rate |
|--------|------|
| Master clock | 240 MHz |
| Audio | 44,100 Hz |
| Video | 60 fps |

---

## Part XV: The Fano Invariant

### 15.1 The Fano Plane

Seven points, seven lines, three points per line, three lines per point.

### 15.2 The Mapping

| Slot | Role |
|------|------|
| 0 | the invariant diagonal origin |
| 1–7 | the 7 Fano points |

### 15.3 The Resolution Bound

Any two points uniquely determine a line. Any search is bounded to fewer than 14 steps.

```
7 points × 2 readings = 14 max
```

### 15.4 The 14 Fano Tickets

**Low Set:**

```
1-2-5, 1-3-6, 1-4-7, 2-3-7, 2-4-6, 3-4-5, 5-6-7
```

**High Set:**

```
8-9-12, 8-10-13, 8-11-14, 9-10-14, 9-11-13, 10-11-12, 12-13-14
```

---

## Part XVI: The Blob

### 16.1 The Size

```
65536 = 2¹⁶
```

### 16.2 The Recursive Fold

```
65536 → 256 → 16 → 4 → 1
```

### 16.3 The Layer

| Layer | Name |
|-------|------|
| -5D | Configuration Pattern (The Blob) |

### 16.4 The Normalization

At exponent n = 4:

```
16⁴ = 65536 = 2¹⁶
```

This aligns with the cosine/octave reading of the byte space.

---

## Part XVII: The Virtual eMMC

### 17.1 The Address Space

| Face | Address Range | Size | Hardware |
|------|---------------|------|----------|
| BOOT0 | 0x0000–0x01FF | 512 B | 5T XOR |
| BOOT1 | 0x0200–0x03FF | 512 B | 6T XOR |
| SECURE | 0x0400–0x07FF | 1 KB | 8T XOR |
| USER | 0x0800–0x0FFF | 2 KB | 10T XOR |
| CENTROID | 0x1000–0x1FFF | 4 KB | XOR Balance Tree |

### 17.2 The SECURE Ring

64 sequential 16-byte receipts. Each receipt records:

```
0x00: Receipt ID
0x01: Index within face
0x02: Expected value
0x03: Replacement value
0x04: Operation result
0x05: Trace hash (XOR fold)
0x06: Accepted flag
0x08-0x0B: Timestamp (little-endian)
0x0C: 240-clock tick index
```

### 17.3 The Centroid

```
Centroid = BOOT0 ⊕ BOOT1 ⊕ SECURE ⊕ USER
```

When all four face outputs balance, the accumulated difference reaches zero.

---

## Part XVIII: The Complete Sentence

A difference is read (`compareExchange`); from the zero condition (`xor = 0`) a frame is set; the observer selects the operation from the difference; the interior is an order-free multiset of gates (5T, 6T, 8T, 10T) that conserves XOR; the path is one selection from the circuit's entropy; the endpoint closes when the difference returns to zero (`∂(b) = 0000`); and the BIOS and kernel are clause sets over gate positions, with no values anywhere, just relations and reflections.

---

## Appendix A: Constants

| Constant | Value | Derivation |
|----------|-------|------------|
| Tetrahedron vertices | 4 | the four radices |
| Tetrahedron edges | 6 | 3! = the six relations |
| Tetrahedron faces | 4 | the four triples |
| Block states | 64 | 2⁶ |
| Delta period | 8 | 3! + 2! |
| Sexagesimal base | 60 | 30 + 30 |
| High-bit toggle | 64 | 2⁶ |
| Fold result | 124 | 60 ⊕ 64 |
| BQF discriminant | −704 | 16² − 4·60·4 |
| Affine discriminant | 0 | 16² − 4·16·4 |
| Lift | 44x² | 60x² − 16x² |
| Residue | 11x² | 15x² − 4x² |
| QuQuart | 4 | 2² |
| Nybble | 16 | 2⁴ |
| omi body | 32 | 2⁵ |
| eMMC sector | 512 | 2⁹ |
| eMMC block | 128 | 2⁷ |
| Block bytes | 65536 | 512 × 128 |
| 240-clock | 240 | 2 × 5! |
| Supercell | 5040 | 7! |

---

## Appendix B: The Three Layers

| Layer | Document | Derives |
|-------|----------|---------|
| Law | PURE_ALGORITHMS.md | delta, replay, Fano schedule |
| Clock | the 7-months-ago doc | period 8, prime 73, block B, W=36 |
| Symbols | Base36 document | alphabet, emoji, domino |

---

## Appendix C: The Three CLIs

| CLI | Layer | Reads |
|-----|-------|-------|
| app/Main.hs | projection | ProjectionFace |
| app2/Main.hs | transport | Blackboard |
| app3/Main.hs | evidence | Attestation |

---

## Appendix D: The Wordforms

| Wordform | Regex | Meaning |
|----------|-------|---------|
| Point | `\d+p` | the position |
| Index | `\d+i` | the position in relation |
| Number | `\d+n` | the count of intervals |
| Exponent | `e\d+` | the scale |
| Binary | `0b\d+` | binary reading |
| Octal | `0o\d+` | octal reading |
| Hex | `0x\d+` | hex reading |
| Decimal | `\d+\.\d+` or `\d+d\d+` | decimal reading |
| Literal | `\d+[boxd]\d+[pin]` | the wordform |
| Struct | `\d+[e.]\d+[boxd]\d+[pin]` | the full wordform |

---

## Appendix E: The Notation Pairs

| Pair | Little | Big |
|------|--------|-----|
| e/E | exponent | exception |
| o/O | omicron | omega |

The little form is the projected reading. The big form is the boundary.

---

*End of Specification*