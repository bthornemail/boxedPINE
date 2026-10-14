Full Recap — The OMI-IMO Protocol

Part I — The Primitives

§ 1. Three Operations

The protocol is exactly three operations:

```
bind   — construct a symmetric relation
apply  — invoke a relation
eval   — extract from a relation
```

bind(a, b) produces a knot — a bidirectional pair. apply executes a knot as a function. eval reads a knot as a value.

§ 2. Categorical Structure

```
bind   →  Monad    (composition)
apply  →  Functor  (lifting)
eval   →  Comonad  (extraction)
```

Three categorical structures. The minimum toolkit for a computation.

§ 3. Turing Completeness

The three primitives are Turing-complete: any computation can be expressed as a sequence of bind, apply, eval.

§ 4. Symmetry

bind is symmetric: bind(a, b) = bind(b, a). The knot is bidirectional. This symmetry is what makes the protocol sharing-capable.

---

Part II — The Structure

§ 5. The 3! Invariant

The buffer at bit length N has three properties:

```
BL  — byteLength
BO  — byteOffset
BPE — BYTES_PER_ELEMENT
```

These admit 3! = 6 orderings. The six relations are the only source of structure in the protocol.

§ 6. Bit Length as the Only Parameter

BPE = N / 8 is bounded by native element size (1, 2, 4, 8). So N ∈ {8, 16, 32, 64}. Everything else is derived.

§ 7. The Ruler

For bit length N, the ruler has N slots. Each slot is a relation R_(k mod 6) evaluated at position k.

§ 8. The 240-Clock

Derived as 240 = 60 × 4 = 15 × 16 = 16² − 16. The BQF period. The tick source for upper layers.

§ 9. The 5040 Slide Rule

5040 = 7! = 7 × 720 = 7 × 3 × 240. The full ruler. Composed of 7 Fano groups, each 720 slots, each 3 tetra blocks of 240.

§ 10. The 4320 Boundary

4320 = 6 × 720. The boundary before the seventh Fano group. The gauge line of the slide rule.

---

Part III — The Quadratic Form

§ 11. Two Forms

```
Affine:      16x² + 16xy + 4y²  =  (4x + 2y)²       Δ = 0
Projective:  60x² + 16xy + 4y²                      Δ = −704
```

The affine form is the 1D coordinate (1D-3D pipeline). The projective form is the barycentric range (4D-10D pipeline).

§ 12. Coefficients

```
60 = |A₅| = the icosahedral rotation group order
16 = 4² = window squared
4  = tetrahedron vertices
```

§ 13. Two Readings

```
Affine reading:      point in transport space
Projective reading:  range in presentation space
```

Both are valid simultaneously. The 0D observer picks one per tick.

---

Part IV — The Primes

§ 14. The Prime Sextuplet

```
{5, 7, 11, 13, 17, 19}
```

The only primes that survive the 16-branch window with a symmetric visibility orbit.

§ 15. The 2,4,0,4,2 Path

```
2  →  {17, 19}     (largest, first to drop)
4  →  {5,7,11,13}  (middle, hold longer)
0  →  {11, 13}     (center, oscillate)
4  →  {5,7,11,13}  (return)
2  →  {17, 19}     (closure)
```

The spatial encoding of the exceptional prime sextuplet's XOR visibility orbit.

§ 16. The Hidden 5

The primes straddle 5. But the protocol's center is 0. The 5 is the unspoken offset: 5 − 0 = 5.

§ 17. Prime 73

1/73 has decimal period 8. Sum of period digits = 36 = 6². The whole structure derives from this prime.

§ 18. The Linear Sum

The trace is the linear sum of two gap prime groups that XOR to 0 on tetrahedral diagonals of Pascal's Triangle and Pascal's Pyramid.

---

Part V — The Schläfli Families

§ 19. Three Families

```
{2,n}:{n,2}   —  dihedral family, constant 2
{2,4}:{4,2}   —  square case, constant 4
{3,5}:{5,3}   —  icosahedral case, constant φ → 60
```

§ 20. The 3! as Quasi-Generator

The 3! is the quasi-generator of the families. Via subset selection of its 6 elements, it produces the Schläfli families and their constants.

§ 21. φ from H₃

φ is forced by {3,5}:{5,3}, analogous to how π is forced by SO(2). The Coq proof formalizes this.

§ 22. The Fundamental Constants

```
π  →  forced by SO(2)  →  continuous rotation
φ  →  forced by H₃    →  5-fold discrete
2  →  forced by Z/2   →  binary information
```

Three constants, three symmetries, one protocol.

---

Part VI — The Pinch Point

§ 23. The Pinch

The pinch is the boundary between void and structure. It's the minimum of the sphere tower.

§ 24. S⁰ as the Pinch

S⁰ (0-sphere) is the mathematical realization: two discrete points bounding the 1-ball.

§ 25. The Hopf Fibrations

```
S⁰  →  S¹  →  S¹    (real,    ℝ)
S¹  →  S³  →  S²    (complex, ℂ)
S³  →  S⁷  →  S⁴    (quaternionic, ℍ)
S⁷  →  S¹⁵ →  S⁸    (octonionic, 𝕆)
```

The S⁰ fiber holds the Fibonacci. The Fibonacci tends to φ, which drives the BQF.

§ 26. The Cayley-Dickson Tower

```
ℝ ⊂ ℂ ⊂ ℍ ⊂ 𝕆 ⊂ S₁₆ ⊂ S₃₂ ⊂ S₆₄
```

Each level doubles dimension, loses a property. Caps at 64.

§ 27. Two Caps

```
Topological cap:  Hopf fibrations at dim 8
Algebraic cap:    Cayley-Dickson at dim 64
```

Both emerge from the same pinch.

---

Part VII — The Blob

§ 28. Definition

A Blob is 2¹⁶ = 65536. It's the minimum boolean truth table for 16 binary choices.

§ 29. Three Factors

```
Binary   —  bitwise representation
Large    —  size n (16 in the canonical case)
Object   —  addressable, composable
```

§ 30. The Sum

```
Blob = Σ(declared constraints) + Σ(selected observers)
     = sum of all traceable constraints
```

§ 31. The Derivative

```
Blob = ∂(time-space index) / ∂(traceable constraints)
```

The Blob is the derivative of the time-space index.

§ 32. The Popcount

```
Blob = popcount of 65536 frequency spectrum
```

The bit-density at each position.

§ 33. Six Readings

```
Blob  =  generalized f mean
      =  XOR (index-based)
      =  XOR (buffer-based)
      =  Horn clause
      =  coproduct cochain
      =  recursion on indices
```

All readings are equivalent.

§ 34. The 0D Frame

Every 0D observer is a potential Blob — a complete program snapshot of one point of view.

§ 35. The Hierarchy

0D observers form a hierarchy. Each Blob contains sub-Blobs, recursively. The federation is a Blob hierarchy.

§ 36. Position

The Blob is both the -5D potential and the actualization at every layer.

---

Part VIII — The 2!

§ 37. The Pre-Structural Boundary

```
2!  =  2  =  the fundamental split
         =  bit-wise vs. logic
         =  buffer length vs. undefined
         =  spatial points vs. undefined
```

§ 38. The Perceptron, Matroid, Automaton

The Blob is:

· A perceptron (threshold function over constraints)
· A matroid (independence structure over constraints)
· An automaton (state machine over constraints)

§ 39. Activation Space

The Blob encapsulates the min-max range of constraint satisfaction.

§ 40. The Factorial Tower

```
0!  =  1  =  void
1!  =  1  =  unity (the Blob)
2!  =  2  =  split
3!  =  6  =  structure
```

The Blob is at every level.

---

Part IX — The Spectrum

§ 41. The 65536 Space

Any spectrum can fill the 65536 space:

```
ROYGBIV  —  color spectrum
A-G      —  audio spectrum
Any 7-fold structure
```

§ 42. Hexadecimal as Notation

Hex is the canonical notation. 4 hex digits per 16-bit word.

§ 43. Cross-Modal Translation

Same hex value, different spectrum. Color 0x1234 = Audio 0x1234 = Any spectrum 0x1234.

§ 44. Barycentric vs. Cartesian

The protocol provides barycentric relations. The browser provides Cartesian values. The mapping is the rendering layer.

---

Part X — The Layered Pipeline

§ 45. The Full Range

```
-5D  →  Blob (potential)
-4D  →  color codex (11x² projective half)
-3D  →  linear (page/line delimiters)
-2D  →  hierarchical (block delimiters)
-1D  →  classifying (token classes)
 0D  →  observer (potential Blob)
 1D  →  DOMPoint
 2D  →  Media Track
 3D  →  DOMRect
 4D  →  DOMMatrix
 5D  →  DOMElement
 6D  →  Canvas
 7D  →  Event Loop
 8D  →  Byte Basis
 9D  →  Network Mesh
10D  →  Orchestrator
11D  →  Primary board
12D  →  Encapsulation (Blob pairs)
```

§ 46. Substrates

```
HTTP/1.1            —  wire carrier
Regex constraints   —  token grammar
DOM geometry        —  spatial projection
PannerNode          —  transparent 0D translation
Worklets            —  off-thread execution
JSDOM / CSSOM / DOM —  document surface
Node.js + polyfills —  server surface
```

All substrates are standard. All substrates are orthogonal.

§ 47. Declarative by Construction

Everything is declarative:

· HTML attributes declare structure
· CSS rules declare rendering
· Worklets declare procedures
· Default actions declare behavior
· Ranges and markup declare hit zones

The browser's native cascade resolves all declarations.

---

Part XI — The Observer

§ 48. Definition

An observer is any circulator capable of reflecting swap rotations.

§ 49. Perceptron Reading

Every mnemonic observer is a perceptron. Mnemonic is input, local frame is weights, reading is output.

§ 50. Orthogonal Coordinates

Each orthogonal coordinate of each precision is an observer of its tangent axis.

§ 51. Network

Observers form a network via tangent relationships. The network is the state space.

---

Part XII — The Kaleidoscope

§ 52. The Vision

The web becomes an infinite canvas kaleidoscope:

· Any point is a potential point of view
· The view from any point reflects the whole
· Movement is swap application
· Coordination is compareExchange on positions
· Reflections never stop

§ 53. The Point of View

The point of view is any point in view.

---

Part XIII — The Paradigm Shift

§ 54. Six Assumptions Shifted

```
State          →  layout, not location
Coordination   →  position, not communication
Identity       →  structural, not assigned
Operations     →  permutations, not transformations
Convergence    →  emergent, not enforced
Protocol       →  primitive set, not behavior spec
```

§ 55. What It Enables

```
zero-copy coordination
no-lock concurrency
no-consensus convergence
no-identity management
no-version negotiation
no-central authority
```

§ 56. The Boundary

The protocol carries structure. Meaning is assigned by implementations. Everything above the protocol is a personal project.

---

Part XIV — The Two Towers

§ 57. Algebraic Tower

```
ℝ ⊂ ℂ ⊂ ℍ ⊂ 𝕆 ⊂ S₁₆ ⊂ S₃₂ ⊂ S₆₄
```

Caps at 64-ion level.

§ 58. Topological Tower

```
S⁰ → S¹ → S³ → S⁷
```

Hopf fibrations. Caps at dim 8.

§ 59. The Same Pinch

Both towers emerge from the same pinch at S⁰ / 3!.

§ 60. The Unified Structure

The protocol is the composition of the two towers, anchored at the pinch, elaborated into the Blob, and rendered through the web.

---

Part XV — The Canonical Statement

The OMI-IMO protocol is three bitwise operations applied to buffers at any bit length. Everything else is derived:

```
3!  →  6 relations
    →  ruler
    →  240-clock
    →  5040 slide rule
    →  Schläfli families
    →  BQF
    →  Blob
    →  the protocol
```

The protocol is substrate-independent, Turing-complete, declarative, and free of hardcoded variables.

Its constants are Schläfli invariants: π (continuous), φ (5-fold), 2 (binary).

Its structure is two towers: the algebraic (Cayley-Dickson) and the topological (Hopf), both anchored at the same pinch.

Its output is the Blob — a program snapshot at the 65536 space.

Its vision is the infinite canvas kaleidoscope — the web as a self-reflecting structure where any point is a point of view.

---

The protocol is bind, apply, eval. Everything else is the elaboration.

That's the whole thing.

---

Full Recap — The Complete Coordination

Part I — The Foundations

§ 1. The Primitive

The protocol is a single primitive:

```
Atomics.compareExchange(array, index, expected, replacement)
```

It is binding, evaluation, and application, uninterrupted. All three logical primitives in one atomic operation.

§ 2. The Three Logical Primitives

```
bind   — construct a relation
apply  — invoke a relation
eval   — extract from a relation
```

These are three readings of the same atomic operation.

§ 3. The Categorical Structure

```
bind   →  Monad     (composition)
apply  →  Functor   (lifting)
eval   →  Comonad   (extraction)
```

Three categorical structures. The minimum toolkit for computation.

§ 4. Turing Completeness

The primitive is Turing-complete. Anything expressible as bind, apply, eval is expressible as Atomics.compareExchange chains.

---

Part II — The Invariant

§ 5. The 3! Invariant

```
BL  = byteLength
BO  = byteOffset
BPE = BYTES_PER_ELEMENT
```

Six orderings. Six relations. The only source of structure.

§ 6. The Only Parameter

BPE = N / 8, bounded by native element size. N ∈ {8, 16, 32, 64}. Everything else is derived.

§ 7. The Factorial Tower

```
0!  =  1     (void)
1!  =  1     (identity / void port)
2!  =  2     (binomial / digital port)
3!  =  6     (trinomial / analog port)
4!  =  24    (quadrinomial)
5!  =  120   (quintinomial)
6!  =  720   (sextinomial)
7!  =  5040  (septinomial / slide rule)
...
```

Every port is a factorial. Every factorial is a port.

---

Part III — The Two Ports

§ 8. Digital Is Binomial

```
Digital port  =  binomial  =  2!  =  2 states
```

Two states. Two orderings. Binary.

§ 9. Analog Is Trinomial

```
Analog port  =  trinomial  =  3!  =  3 states, 6 orderings
```

Three states. Six orderings. Ternary.

§ 10. Both Reduce to 1!

```
The void port  =  1!  =  1 state
```

Both digital and analog converge to the void at their fixed point.

§ 11. The 2! Constraint

```
0!  =  1
0!/2 = 1/2 ≠ 0
```

The void can't be halved to zero. So 2! = 2 is the irreducible base.

If the operation is idempotent, it can't be factored. The 2! is the base of the non-trivial tower.

---

Part IV — The Quadratic Forms

§ 12. The Two Forms

```
Affine:      16x² + 16xy + 4y²  =  (4x + 2y)²       Δ = 0
Projective:  60x² + 16xy + 4y²                      Δ = −704
```

§ 13. The Lift

The 16 → 60 lift:

```
Adds the sexagesimal factor (60 = 4 × 15)
Introduces periodicity (240-clock)
Enables spatial selection (via ratios)
Makes the operation multidimensional
```

The lift is what makes Atomics.compareExchange multidimensional.

§ 14. The Coefficients

```
60 = |A₅|   →  icosahedral rotation group
16 = 4²     →  window squared
4  = tetrahedron vertices
```

---

Part V — The Schläfli Families

§ 15. The Three Families

```
{2,n}:{n,2}   →  dihedral, constant 2
{2,4}:{4,2}   →  square, constant 4
{3,5}:{5,3}   →  icosahedral, constant φ → 60
```

§ 16. The Quasi-Generator

The 3! generates the families via subset selection of its 6 elements.

§ 17. The Constants

```
π  →  forced by SO(2)  →  continuous rotation
φ  →  forced by H₃    →  5-fold discrete
2  →  forced by Z/2   →  binary information
```

Three constants. Three symmetries. One protocol.

---

Part VI — The Pinch Point

§ 18. The Pinch

The pinch is the boundary between void and structure. It's the minimum of the sphere tower.

§ 19. S⁰

S⁰ (0-sphere) is the pinch's mathematical realization: two discrete points.

§ 20. The Hopf Fibrations

```
S⁰  →  S¹  →  S¹    (real, ℝ)
S¹  →  S³  →  S²    (complex, ℂ)
S³  →  S⁷  →  S⁴    (quaternionic, ℍ)
S⁷  →  S¹⁵ →  S⁸    (octonionic, 𝕆)
```

The S⁰ fiber holds the Fibonacci. The limit is φ.

§ 21. The Cayley-Dickson Tower

```
ℝ ⊂ ℂ ⊂ ℍ ⊂ 𝕆 ⊂ S₁₆ ⊂ S₃₂ ⊂ S₆₄
```

Caps at 64-ion level. The Hopf cap is at dim 8.

---

Part VII — The Primes

§ 22. The Prime Sextuplet

```
{5, 7, 11, 13, 17, 19}
```

The only primes surviving the 16-branch window with a symmetric orbit.

§ 23. The 2,4,0,4,2 Path

```
2  →  {17, 19}
4  →  {5, 7, 11, 13}
0  →  {11, 13}
4  →  {5, 7, 11, 13}
2  →  {17, 19}
```

The spatial encoding of the visibility orbit.

§ 24. The Two Principles

```
Principle 1:  two prime gap measurements (magnitude, type)
Principle 2:  prime groups (residue classes {1,3,7,9} mod 10)
```

§ 25. Prime vs Composite

```
Prime      →  atomic operations (bitwise)
Composite  →  structured operations (logic)
```

§ 26. The Linear Sum

The trace is the linear sum of two gap prime groups that XOR to 0 on tetrahedral diagonals of Pascal's Triangle and Pascal's Pyramid.

---

Part VIII — The Tetrahedral Diagonals

§ 27. Pascal's Triangle

```
Row 0:           1
Row 1:          1 1
Row 2:         1 2 1
Row 3:        1 3 3 1
Row 4:       1 4 6 4 1
...
```

Diagonals: ones, naturals, triangulars, tetrahedrals (1, 4, 10, 20, 35, ...).

§ 28. Pascal's Pyramid

```
1
1 1 1
1 2 3 2 1
1 3 6 7 6 3 1
...
```

The same tetrahedral numbers on the diagonals.

§ 29. The Conjoint Structure

The tetrahedral diagonal is the joint between the triangle and the pyramid. It's where 2D and 3D meet.

§ 30. The Parity Pattern

```
T(n):  even, odd, even, even, even, odd, even, even, even, odd, ...
```

Period 4. Odd at n ≡ 1 mod 4.

§ 31. The 240

```
T(8) = 120 = 5!
240 = 2 × 120
```

The 240-clock comes from the tetrahedral numbers.

---

Part IX — XOR as Difference

§ 32. XOR Is Difference

```
XOR measures how much two values differ
0 means no difference
Nonzero means difference
```

§ 33. The Diagonal

The diagonal x XOR x = 0 is the no-difference locus, not the "sameness" set.

§ 34. Operating on Difference

The protocol operates only on differences. Values are never directly manipulated.

§ 35. The Origin

The 0 is the origin of the difference space. Every operation is a vector from 0.

---

Part X — The Blob

§ 36. The Blob Is 2¹⁶

```
BLOB = 65536
```

The minimum boolean truth table for 16 binary choices.

§ 37. Three Factors

```
Binary   →  bitwise representation
Large    →  size n
Object   →  addressable, composable
```

§ 38. The Sum

```
Blob = Σ(declared constraints) + Σ(selected observers)
```

The sum of all traceable constraints.

§ 39. The Derivative

```
Blob = ∂(time-space index) / ∂(traceable constraints)
```

The Blob is the derivative of the time-space index.

§ 40. Six Readings

```
Blob  =  generalized f mean
      =  XOR (index-based)
      =  XOR (buffer-based)
      =  Horn clause
      =  coproduct cochain
      =  recursion on indices
```

§ 41. The 0D Frame

Every 0D observer is a potential Blob — a complete program snapshot.

§ 42. The −5D Potential

The Blob is the −5D potential of the 12D encapsulation.

§ 43. The Blob as Program Snapshot

The Blob encodes the program, not the data. Any peer with the same protocol interprets the same Blob.

---

Part XI — The Multidimensional compareExchange

§ 44. Four Dimensions

```
Dimension 1:  board (duplicate + difference)
Dimension 2:  coordinate (row × column)
Dimension 3:  relation (knot structure)
Dimension 4:  emergence (convergence trajectory)
```

§ 45. The Lift

The 16 → 60 lift adds the fifth dimension (cycle).

§ 46. The Pattern

```
Three 2! operations (the cycle)
One 1! operation (the void check)

3! + 1! = 6 + 1 = 7
```

The operation is Fano-sized.

---

Part XII — The Observer

§ 47. Definition

An observer is any circulator capable of reflecting swap rotations.

§ 48. Perceptron Reading

Every mnemonic observer is a perceptron. Mnemonic is input, local frame is weights, reading is output.

§ 49. Orthogonal Coordinates

Each orthogonal coordinate of each precision is an observer of its tangent axis.

§ 50. The Network

Observers form a network via tangent relationships. The network is the state space.

---

Part XIII — The Propagation Asymmetry

§ 51. Propagation Is Cubic

```
Forward:   explore all combinations   O(n³)
```

§ 52. Back-Propagation Is Linear

```
Backward:  retrace a single path   O(n)
```

§ 53. The Optimizations

The protocol optimizes for backward. Linear convergence is what makes it practical.

---

Part XIV — The Operations

§ 54. Bitwise vs Logic

```
Bitwise  →  parallel   →  cubic  →  propagation
Logic    →  sequential  →  linear  →  back-propagation
```

§ 55. Prime vs Composite

```
Prime      →  atomic operations
Composite  →  structured operations
```

§ 56. The Four Readings

```
Lisp on sets              →  set operations
Horn clause               →  logical implication
Calculus of constructions →  dependent types
Prime vs composite        →  atomic vs structured
```

All four describe the same structure.

---

Part XV — The Normalization

§ 57. Analog to Digital

The computational space is predefined to normalize analog to digital.

§ 58. The Pipeline

```
Analog input
    ↓
Sampling (discretize in time/space)
    ↓
Quantization (discretize in value)
    ↓
Encoding (assign a digital representation)
    ↓
Digital value in the 65536 space
```

§ 59. The Purpose

The normalization is why the protocol exists. All readings are how we describe it.

---

Part XVI — The Ports

§ 60. Digital Is Binomial

```
Digital port:  2 states, 2 orderings, 2! level
```

§ 61. Analog Is Trinomial

```
Analog port:  3 states, 6 orderings, 3! level
```

§ 62. The Trinomial Has a Middle

```
low, mid, high
```

The midpoint is the third state that digital lacks.

§ 63. Constraints Add the Middle

A constraint defines a range. The range has a midpoint. The constraint adds the middle state.

§ 64. Time Crystals

The protocol's oscillation through the 65536 space is a time crystal — period 240, driven only by constraints.

---

Part XVII — The Final Coordination

§ 65. Multiplexed compareExchange

The protocol's operation is multiplexed compare-and-exchange through spatial reference:

```
Multiplex  +  compare-and-exchange  +  spatial reference
    ↓              ↓                         ↓
multiple   +   atomic swap          +   coordinate-based
channels   +   with guard           +   selection
```

§ 66. Algorithmic Routing

The multiplexing is algorithmic — the algorithm's trajectory determines the active channel. No explicit switch needed.

§ 67. The Four Steps

```
locate    —  find the current coordinate
select    →  determine the active channel
swap      →  perform the atomic operation
advance   →  move to the next coordinate
```

§ 68. The Fano Pattern

```
Three 2! operations (cycle)
One 1! operation (check)
3! + 1! = 7 (Fano)
```

§ 69. The Tetrahedral Parity

```
even, odd, even, even, even, odd, even, even, even, odd, ...
```

Period 4. The signature of the 2! base.

§ 70. Both Are the Same

The tetrahedral parity and the Atomics.compareExchange pattern share the period-4 structure. Both emerge from the 2! base.

The period-4 structure is universal.

---

Part XVIII — The Canonical Statement

§ 71. One Operation

```
Multiplexed compare-and-exchange through spatial reference
```

§ 72. One Structure

```
The factorial tower
```

§ 73. One Origin

```
The void (1! = 1)
```

§ 74. Infinite Levels

```
Every factorial is a port
Every port is a factorial
The tower goes up indefinitely
```

§ 75. The Protocol

```
An Atomic Compare-and-Exchange Lisp
    with the factorial tower as its structure
    with the void as its origin
    with Fano-sized operations
    with period-4 parity
    with the 65536 space as its substrate
    with time crystals as its behavior
```

The protocol is the coordination.

---

The Complete Arc

```
Primitive:       Atomics.compareExchange
Structure:       the factorial tower
Invariant:       the 3! relations
Parameter:       bit length
Ports:           binomial (digital) / trinomial (analog)
Port base:       2! (irreducible)
Port origin:     1! (the void)
Quadratic forms: affine (16x²) / projective (60x²)
Lift:            16 → 60 (multidimensionality)
Symmetries:      {2,n} / {2,4} / {3,5}
Constants:       π / φ / 2
Pinch:           S⁰ (0-sphere)
Towers:          Cayley-Dickson (dim 64) / Hopf (dim 8)
Primes:          {5, 7, 11, 13, 17, 19}
Path:            2, 4, 0, 4, 2
Blob:            2¹⁶ = 65536
Observer:        any circulator reflecting swaps
Network:         observers form the state space
Propagation:     cubic (explore)
Back-propagation: linear (converge)
Operations:      bitwise (parallel) / logic (sequential)
Numbers:         prime (atomic) / composite (structured)
Readings:        Lisp / Horn / Calculus / prime-composite
Purpose:         normalize analog to digital
Behavior:        time crystal (period 240)
Coordination:    multiplexed compare-exchange through spatial reference
Pattern:         3 × 2! + 1 × 1! = 7 (Fano)
Parity:          even, odd, even, even (period 4)
```

---

The protocol is one operation. Everything else is coordination.

That's the whole thing.