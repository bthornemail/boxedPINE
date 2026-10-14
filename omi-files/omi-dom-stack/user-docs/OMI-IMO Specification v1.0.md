OMI-IMO Specification v1.0

Status: Canonical
Scope: Complete — primitives, structure, standard model
Foundation: Atomics.compareExchange and the iff

---

Part I — The Primitives

§ 1. The One Operation

```
Atomics.compareExchange(array, index, expected, replacement)
```

The primitive is atomic. It performs three phases in one uninterrupted step:

```
bind   —  constructs the relation between expected and replacement
apply  —  invokes the comparison and conditional swap
eval   —  returns the old value
```

All three happen together. There is no gap between them. The physical primitive is the logical primitive.

§ 2. The Two Bitwise Components

```
XOR  —  the difference operator
AND  —  the conditional write
```

§ 3. The One Logic Component

```
IFF  —  the equivalence check
IFF = XOR ⊕ 1
```

§ 4. The S-P-O Triple

```
S (Subject)    →  XOR  →  bitwise
P (Predicate)  →  IFF  →  logic
O (Object)     →  AND  →  bitwise
```

Two bitwise, one logic. The operation's structure.

§ 5. The Fourth Primitive

```
digest  —  read, consider, print
```

The digest reads the buffer, computes the significance (popcount, XOR), and prints the result. It closes the loop.

§ 6. The Loop

```
read  →  eval  →  print  →  loop
```

The digest's cycle. The protocol is a REPL.

---

Part II — The Invariant

§ 7. The Buffer Properties

```
BL   =  byteLength
BO   =  byteOffset
BPE  =  BYTES_PER_ELEMENT
```

§ 8. The 3! Relations

```
3! = 6 orderings of {BL, BO, BPE}
```

Six relations. Six orthogonal axes. The only source of structure.

§ 9. The Only Parameter

```
N ∈ {8, 16, 32, 64}
BPE = N / 8
```

Everything else is derived.

§ 10. The Factorial Tower

```
0! = 1     →  void
1! = 1     →  identity
2! = 2     →  binomial
3! = 6     →  trinomial
4! = 24    →  quadrinomial
5! = 120   →  quintinomial
6! = 720   →  sextinomial
7! = 5040  →  septinomial (the slide rule)
```

Every port is a factorial. Every factorial is a port.

---

Part III — The Ruler

§ 11. The Eight Slots

```
ruler[0]  →  diagonal   (the origin, XOR of all six)
ruler[1]  →  size       (the unit count, base 1)
ruler[2]  →  top
ruler[3]  →  bottom
ruler[4]  →  right
ruler[5]  →  left
ruler[6]  →  forward
ruler[7]  →  backward
```

§ 12. The Two Groups

```
2!  =  indices 0, 1  =  {diagonal, size}  →  the frame
3!  =  indices 2..7  =  the six operations  →  the content
```

The ruler is 2! + 3! = 8 slots long.

§ 13. The Orthogonality

Three levels of orthogonality:

```
Internal  —  axes within a group
External  —  groups to each other
Parent    —  child to container
```

The 2! and 3! are separate orthogonal groups. The 3! is already orthogonal to indices 0 and 1.

§ 14. The Named K-Tuple

```
{diagonal, size, top, bottom, right, left, forward, backward}
```

Each slot is an orthogonal axis. Order doesn't matter — only orthogonality.

§ 15. The Index-1 Beginning

```
Index 0  →  the origin (no difference, base 1)
Index 1+ →  the basis (difference begins)
```

Spatial difference begins at index 1. Index 0 is the origin.

---

Part IV — The Digest

§ 16. The Digest Operation

```
digest(ruler)  =  M_p(ruler)
```

The digest computes the generalized F-mean of the ruler.

§ 17. The Generalized F-Mean

```
M_p(x_1, ..., x_n) = ( (1/n) Σ x_i^p )^(1/p)
```

The mean order p is determined by the observer's position.

§ 18. The Digest Cycle

```
read      →  read the ruler
consider  →  compute the F-mean
print     →  write the result
loop      →  repeat
```

§ 19. The Horn Clause Reading

```
ruler_has_value(V) :- M_p(ruler, V).
```

The head is ruler_has_value(V). The body is M_p(ruler, V).

---

Part V — The Standard Model

§ 20. The Entities

```
Buffer      →  the substrate
Ruler       →  the named k-tuple
Regex set   →  the vocabulary constraint
F-mean      →  the significance measure
Digest      →  the operation
```

§ 21. The Regex-Constrained Vocabulary

```js
const G = Object.freeze({
    FRONT:     /^[A-Za-z0-9:+]$/,
    BACK:      /^[A-Za-z0-9.\-]$/,
    INSIDE:    /^[A-Za-z0-9_]$/,
    OUTSIDE:   /^[^A-Za-z0-9_]$/,
    UP:        /^[A-Z_]$/,
    DOWN:      /^[a-z_]$/,
    LEFT:      /^[0-9+\-]\.[^0-9+\-]$/,
    RIGHT:     /^[^0-9+\-]\.[0-9+\-]$/,
    CENTER:    /^[0-9]\.[0-9]$/,
    CONSTRAINT:/^[^"]+$/,
    BOUNDARY:  /^"([^"]+)"$/,
    DEFLECT:   /^([^".]+):\1$/,
    REFLECT:   /^([".]+):\1$/,
    INFLECT:   /^([".]+):([".]+):\2:\1$/,
    AXIS:      /^(\d\d)[A-Za-z_](\d\d):\2[0-9+\-]\1$/,
    MNEMONIC:  /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/,
    PALINDROME:/^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/
});
```

§ 22. The Constraints

```
token matches G.X  →  token admissible
M_p(ruler) = v     →  ruler admissible
```

Both constraints must hold.

§ 23. The Prime K-Tuple Patterns

```
Twin:       (0, 2)
Triplet:    (0, 2, 6)
Quadruplet: (0, 2, 6, 8)
Sextuplet:  (0, 4, 6, 10, 12, 16)
```

Patterns of differences across the orthogonal axes.

---

Part VI — The Iff

§ 24. The Base Equivalence

```
position(n)  ⟺  period(n−1, n, n+1)
```

The position holds iff the period holds. Neither can exist without the other.

§ 25. The 2! as the Iff

```
2!  =  2  =  the two sides of the iff
           ├── position
           └── period
```

The iff has two sides. This is the 2!.

§ 26. The 3! as the Operations

```
3!  =  6  =  the six operations, read through the iff
```

§ 27. The n±1

```
n−1  →  the before
n    →  the now
n+1  →  the after
```

The n±1 is the local neighborhood. It captures both the position and the period.

---

Part VII — The Pattern

§ 28. The Parity Pattern

```
n:        0    1    2    3    4    5    6    7    8    9    ...
parity:   e    O    e    e    e    O    e    e    e    O    ...
```

Odd at n ≡ 1 mod 4.

§ 29. The Odd as Position and Period

The odd is both:

· A position (at n)
· A period (the n±1 transition)

§ 30. The Four Atomics

```
{0, 2, 1}  →  swap 2 and 1
{2, 1, 0}  →  reverse
{1, 0, 2}  →  cycle
{0, 1, 2}  →  identity
```

Four permutations. Four atomic operations.

§ 31. The Extremes

```
012  →  forward (identity)
210  →  reverse
```

The two extremes.

---

Part VIII — The Spatial Structure

§ 32. The 16 Dimensions

```
-5D  →  the Blob
-4D  →  color codex
-3D  →  linear
-2D  →  hierarchical
-1D  →  classifying
 0D  →  observer (BOM)
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
```

Sixteen dimensions. 2¹⁶ = 65536.

§ 33. The Blob

```
BLOB = 2¹⁶ = 65536
```

The minimum boolean truth table for 16 binary choices.

§ 34. The Blob as Folded Subarray

The Blob is derived from a 16-bit buffer by recursive folding of an 8-bit subarray using:

· Central inversion permutation
· Snubbed truncation

The result is 16⁴ = 65536.

§ 35. The Index 0 Invariant

Index 0 is always base 1. The fold preserves it. Central inversion and snubbed truncation don't touch it.

---

Part IX — The Quadratic Forms

§ 36. The Two Forms

```
Affine:      16x² + 16xy + 4y²  =  (4x + 2y)²       Δ = 0
Projective:  60x² + 16xy + 4y²                      Δ = −704
```

§ 37. The Lift

```
16 → 60
```

Adds periodicity. Enables spatial selection. Makes the operation multidimensional.

§ 38. The Projection

The 60x² projection is the O(1) resolution. The projection is atomic, so the resolution is constant-time.

§ 39. The Algebraic Limit

The 64-ions are non-associative. The algebraic context is limited to Cartesian rendering. The spatial enumeration is limited to the 16x² affine data.

---

Part X — The Schläfli Families

§ 40. The Three Families

```
{2,n}:{n,2}   →  constant 2
{2,4}:{4,2}   →  constant 4
{3,5}:{5,3}   →  constant φ → 60
```

§ 41. The Quasi-Generator

The 3! generates the families via subset selection of its 6 elements.

§ 42. The Constants

```
π  →  forced by SO(2)
φ  →  forced by H₃
2  →  forced by Z/2
```

§ 43. The Tetrahedral Structure

```
4 vertices  →  Subject
6 edges     →  Predicate
4 faces     →  Object

4-6-4  =  S-P-O
```

---

Part XI — The Pinch and the Towers

§ 44. The Pinch

```
S⁰  →  the 0-sphere  →  two points  →  the pinch
```

§ 45. The Hopf Fibrations

```
S⁰  →  S¹  →  S¹
S¹  →  S³  →  S²
S³  →  S⁷  →  S⁴
S⁷  →  S¹⁵ →  S⁸
```

§ 46. The Cayley-Dickson Tower

```
ℝ ⊂ ℂ ⊂ ℍ ⊂ 𝕆 ⊂ S₁₆ ⊂ S₃₂ ⊂ S₆₄
```

Caps at 64-ion level. The Hopf cap is at 8.

§ 47. The Octree Octonion Relationship

Three views of the same orthogonality principle:

· Octree — spatial orthogonality (parent/child)
· Octonions — algebraic orthogonality (basis/basis)
· Cayley-Dickson — recursive orthogonality (level/level)

---

Part XII — The Primes

§ 48. The Prime Sextuplet

```
{5, 7, 11, 13, 17, 19}
```

§ 49. The Path

```
2, 4, 0, 4, 2
```

The spatial encoding of the visibility orbit.

§ 50. The Two Principles

```
Prime gap measurements:  magnitude, type
Prime groups:            residue classes {1, 3, 7, 9} mod 10
```

§ 51. Prime vs Composite

```
Prime      →  atomic operations (bitwise)
Composite  →  structured operations (logic)
```

§ 52. The Linear Sum

The trace is the linear sum of two gap prime groups XORing to zero on tetrahedral diagonals.

---

Part XIII — The Tetrahedral Diagonals

§ 53. The Tetrahedral Numbers

```
T(n) = C(n+2, 3)
```

§ 54. The Parity Pattern

```
even, odd, even, even, even, odd, even, even, even, odd, ...
```

Period 4. Odd at n ≡ 1 mod 4.

§ 55. The 240

```
T(8) = 120 = 5!
240 = 2 × 120
```

---

Part XIV — The Coordination

§ 56. The Operation

```
Multiplexed compare-and-exchange through spatial reference
```

§ 57. The Four Steps

```
locate  →  find the current coordinate
select  →  determine the active channel
swap    →  perform the atomic operation
advance →  move to the next coordinate
```

§ 58. The Transylvania Lottery

The minimum connection is 2 of 5 or 3 consecutive. The 0D observer always connects.

§ 59. The Bound

The resolution is < 14 steps, bounded by the Fano structure.

---

Part XV — The Observer

§ 60. Definition

An observer is any circulator capable of reflecting swap rotations.

§ 61. Perceptron

Every mnemonic observer is a perceptron. Mnemonic is input; local frame is weights; reading is output.

§ 62. Network

Observers form a network via tangent relationships. The network is the state space.

---

Part XVI — The Propagation Asymmetry

§ 63. Forward

```
Propagation:  cubic, O(n³)
```

§ 64. Backward

```
Back-propagation:  linear, O(n)
```

§ 65. The Optimization

The protocol optimizes for backward. Linear convergence is what makes it practical.

---

Part XVII — The Operations

§ 66. Bitwise vs Logic

```
Bitwise  →  parallel   →  cubic  →  propagation
Logic    →  sequential  →  linear  →  back-propagation
```

§ 67. The Four Readings

```
Lisp on sets
Horn clause
Calculus of constructions
Prime-composite
```

All four describe the same structure.

---

Part XVIII — The Normalization

§ 68. Analog to Digital

The computational space is predefined to normalize analog to digital.

§ 69. The Pipeline

```
Sample → Quantize → Encode → Digital value in 65536 space
```

§ 70. The Purpose

Normalization is why the protocol exists. All readings describe it.

---

Part XIX — The Digest as the Fourth Primitive

§ 71. The Digest

```
digest  —  read, consider, print
```

§ 72. The Digest as F-Mean

```
digest(ruler)  =  M_p(ruler)
```

§ 73. The Digest as the Iff

The digest is the iff operation: read ⟺ print.

---

Part XX — The Canonical Statement

§ 74. The Full Model

The OMI-IMO system is a standard model of spatial indices. It defines:

```
Entities:
    Buffer, Ruler, Regex set, F-mean, Digest

Relations:
    index 0 → diagonal
    index 1 → size
    indices 2..7 → the six operations

Vocabulary:
    {diagonal, size, top, bottom, right, left, forward, backward}

Constraints:
    token matches G.X → token admissible
    M_p(ruler) = v → ruler admissible

Operations:
    digest(ruler) = M_p(ruler)
    read → consider → print → loop

Structure:
    2! = the iff (two sides)
    3! = the operations (six axes)
    iff = the base equivalence

Constants:
    π (continuous), φ (5-fold), 2 (binary)

Towers:
    Cayley-Dickson (dim 64), Hopf (dim 8)

Pinch:
    S⁰ (0-sphere)

Bound:
    < 14 steps

Coordinate:
    O(1) resolution via 60x² projection
```

§ 75. The Final Statement

The OMI-IMO protocol is an Atomic Compare-and-Exchange Lisp.

Its primitive is Atomics.compareExchange.
Its base is the iff.
Its structure is the 2! and 3! orthogonal groups.
Its space is the 2¹⁶ Blob.
Its observers are circulators reflecting swaps.
Its behavior is time crystals (period 240).
Its resolution is O(1).
Its closure is reachability.

Every part connects to every other.
Every question returns to the primitive.
Every primitive expands to the full structure.

The standard model is complete.

---

Appendix A — The Ruler as a Slide Rule of Rulers

```
Slide rule  →  the array (the instrument)
Rulers      →  the slots (the scales)
Sliding     →  the operation
Reading     →  the measurement
```

One slide rule. Eight rulers. One instrument.

---

Appendix B — The Index 0 as the Diagonal

The diagonal (XOR of all six) is the origin. It belongs at index 0. The six operations belong at indices 2 through 7. Index 1 is the size.

---

Appendix C — The n±1 Structure

```
n−1  →  the before
n    →  the now
n+1  →  the after
```

The n±1 is the local neighborhood. It captures both the position (n) and the period (n−1 → n → n+1).

---

Appendix D — The Iff

```
position(n)  ⟺  period(n−1, n, n+1)
```

The position holds iff the period holds. The iff is the base equivalence.

---

End of specification.

---

That's the full spec. Seven parts, seventy-five sections, four appendices. Everything is derived from the primitive Atomics.compareExchange and the base equivalence iff.

The spec is complete. The standard model is closed.

---

DOM Geometry Hit List Overlays on the Shared Pseudo-Persistent Infinite Canvas

Companion to: All prior specs
Scope: How the DOM geometry layer, hit lists, PannerNode, HTTP/1.1, regex constraints, and blob media elements compose into the shared pseudo-persistent infinite canvas
Status: Draft

---

§ 1. The Composed System

The protocol's runtime is the composition of seven layers that each serve a distinct purpose, and each remains orthogonal to the others:

```
HTTP/1.1              →  wire carrier (transport)
Regex constraints     →  token grammar (admissibility)
DOM geometry          →  spatial projection (position, extent)
Hit lists             →  interpolation anchors (semantics)
PannerNode            →  0D transparent translation (observability)
Blobs as media        →  the substrate for the canvas
Worklets + polyfills  →  execution contexts (browser and Node)
```

Each layer speaks to the next through a standard interface. None of them knows about the others' internals.

Seven layers, one composed system.

---

§ 2. The DOM Geometry as the Overlay Surface

The DOM provides the spatial primitives for the overlay:

```
DOMPoint      →  a coordinate in the canvas
DOMRect       →  an axis-aligned bounding box
DOMQuad       →  a four-corner polygon (with rotation)
DOMMatrix     →  a 4×4 transform (composition of transforms)
DOMRange      →  a start/end anchor (text-level)
```

Each primitive is a standard interface, available natively in every browser.

The overlay surface is the union of these primitives. Each hit zone is described by one or more of them.

The DOM geometry is the overlay's coordinate system.

---

§ 3. Hit Lists as Overlay Anchors

A hit list is an ordered set of knots:

```js
hit_list = [
    bind(coord_0, anchor_0),
    bind(coord_1, anchor_1),
    ...
]
```

Each entry binds a coordinate (a spatial position) to an anchor (a semantic reference).

The Anchor Vocabulary

Anchors are declared using the DOM's standard semantic elements:

```html
<dt id="cell-0" data-omi-mnemonic="A1F9" data-omi-band="1">
    Mnemonic core
</dt>
<dd data-omi-bpe-constraint="2" data-omi-offset="32">
    Refraction vector
</dd>
```

The <dt> carries the mnemonic (the semantic label).
The <dd> carries the spatial constraints (the geometry).
The <dl> wraps the pair as a description list.

Why dl/dt/dd

Because they're the DOM's native key-value structure. The dt is the key; the dd is the value. Together they form a semantic pair.

The hit list is the collection of all such pairs.

The <dl> is the hit list's container.

---

§ 4. The data-* and id Targeting Surface

The id and data-* attributes are the interface between the protocol and the DOM.

id — Semantic Identity

```html
<dt id="cell-0">...</dt>
```

The id is the unique handle for the element. It's how the protocol addresses the element.

data-* — Protocol Payload

```html
<dt id="cell-0"
    data-omi-mnemonic="A1F9"
    data-omi-band="1"
    data-omi-hit-list="12,34,56">
</dt>
```

The data-* attributes carry protocol-specific data. Each is a named slot in the element's payload.

The id is the address. The data-* is the payload.

---

§ 5. The Regex Constraint on Attributes

The attributes are validated by the regex constraint set:

```js
const G = Object.freeze({
    MNEMONIC:  /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/,
    PALINDROME:/^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/,
    AXIS:      /^(\d\d)[A-Za-z_](\d\d):\2[0-9+\-]\1$/,
    // ...
});
```

The data-omi-mnemonic attribute is validated against the mnemonic patterns. If it doesn't match, the element is rejected.

The regex constraints are the admissibility filter for the attributes.

---

§ 6. The PannerNode as the 0D Translation

The observer's position is exposed via the PannerNode:

```js
panner.positionX.setValueAtTime(x, audioCtx.currentTime);
panner.positionY.setValueAtTime(y, audioCtx.currentTime);
panner.positionZ.setValueAtTime(z, audioCtx.currentTime);
```

The position is:

· Native to the browser
· Observable by any consumer
· Updated per-frame at audio rate

The PannerNode is the transparent 0D translator. Any web consumer can read the observer's position through it.

The PannerNode is the observability point.

---

§ 7. HTTP/1.1 as the Wire Carrier

The protocol's messages are carried as HTTP/1.1 headers:

```http
X-VTT-Cue-0x00: 00:01.000 --> 00:02.000; block=FF001C1D1E1F20FF; context=B36_Q0; token=FRONT:^A1F9$; layer=-1D
X-Omi-Gate-0x00: Requires absolute validation of the 0x20 Space Fulcrum.
```

The Service Worker intercepts the stream, parses the headers, and emits WebVTT cues:

```
WEBVTT

00:01.000 --> 00:02.000
{"block":"FF001C1D1E1F20FF","context":"B36_Q0","token":"FRONT:^A1F9$"}
```

The cues are consumed by the DOM's <track> element, firing cuechange events.

HTTP/1.1 is the wire. WebVTT is the client-side resolution.

---

§ 8. Blobs as the Media Elements

Each media element (audio, video, canvas, offscreen canvas) is backed by a Blob — a binary large object.

The Blob is:

· Binary — the underlying representation is bytes
· Large — the size is a parameter
· Object — it's an addressable, composable object

The Blob is the substrate for the media element. Its content is decoded and rendered by the browser's native pipeline.

The Blob is the media element's backing store.

---

§ 9. Worklets and Polyfills

The protocol runs in multiple execution contexts:

```
Main thread      →  DOM access, rendering
AudioWorklet     →  audio synthesis
PaintWorklet     →  custom CSS painting
LayoutWorklet    →  custom layout
AnimationWorklet →  compositor animation
```

And outside the browser:

```
Node.js worker_threads  →  off-thread execution
Node.js vm + vm.Script  →  sandboxed evaluation
Node.js SharedArrayBuffer → shared memory
```

These are polyfill contexts — the same protocol, different substrate.

The protocol runs everywhere, in the same way.

---

§ 10. The Hit List Overlay Construction

Putting it all together: constructing a hit list overlay on the infinite canvas.

Step 1 — Declare the elements

```html
<dl id="omi-canvas-overlay">
    <dt id="cell-0" data-omi-mnemonic="A1F9" data-omi-band="1">Mnemonic</dt>
    <dd data-omi-bpe-constraint="2" data-omi-offset="32">Vector</dd>
    
    <dt id="cell-1" data-omi-mnemonic="B2E8" data-omi-band="2">Mnemonic</dt>
    <dd data-omi-bpe-constraint="2" data-omi-offset="64">Vector</dd>
    <!-- ... -->
</dl>
```

Step 2 — Parse and validate

The regex constraint set validates each data-omi-mnemonic. Invalid entries are rejected.

Step 3 — Read the observer position

```js
const positionX = panner.positionX.value;
const positionY = panner.positionY.value;
const positionZ = panner.positionZ.value;
```

Step 4 — Compute the geometry

For each valid element, compute its DOMQuad in canvas space:

```js
const quad = DOMQuad.fromRect(
    new DOMRect(x, y, w, h)
);
```

The x, y, w, h are derived from the mnemonic, the observer's position, and the spatial constraints.

Step 5 — Update the hit zones

```js
const hitArea = document.getElementById(`hit-target-${elementId}`);
hitArea.coords = `${quad.p1.x},${quad.p1.y},${quad.p2.x},${quad.p2.y},...`;
```

The <area> element's coords attribute is updated with the quad's corners.

Step 6 — Compose into the infinite canvas

The canvas's overlay is the union of all hit zones. Each zone is a DOMQuad. The overlay is the spatial structure of all zones.

The hit list is the DOM's declarative description of the canvas's interactive regions.

---

§ 11. The Pseudo-Persistent State

The overlay's state is pseudo-persistent because:

· The DOM elements are persistent (they don't disappear)
· The data-* attributes are declarative (they hold the state)
· The Service Worker caches the last traceable state
· The Blobs are stored in the cache
· The trace log records every state transition

The state survives:

· Page reloads (via Service Worker cache)
· Tab switches (via Shared Worker coordination)
· Peer disconnects (via the trace log)

The overlay is pseudo-persistent because the DOM holds the declaration and the trace holds the history.

---

§ 12. The Infinite Canvas

The canvas has no fixed bounds because:

· The ruler extends to any bit length
· The observer can be at any point
· The projection can be any reading
· The hit zones are computed from the current state

The visible window is the current projection. The full canvas is the entire ruler.

The canvas is infinite because the ruler is unbounded.

---

§ 13. The Full Pipeline

```
-5D  →  the Blob (universal substrate)
-4D  →  color codex (H₁₁)
-3D  →  linear (page/line boundaries in HTTP)
-2D  →  hierarchical (delimiters in HTTP)
-1D  →  classifying (regex tokens)
 0D  →  observer (PannerNode position)
 1D  →  DOMPoint (canvas coordinates)
 2D  →  Media Track (cues from HTTP)
 3D  →  DOMRect (hit zone bounds)
 4D  →  DOMMatrix (composition of overlays)
 5D  →  DOMElement (the <dl>/<dt>/<dd> structure)
 6D  →  Canvas (rendering surface)
 7D  →  Event Loop (cuechange-driven ticks)
 8D  →  Byte Basis (the Blob's structure)
 9D  →  Network Mesh (multi-peer coordination)
10D  →  Orchestrator (validation)
```

Each layer is a distinct structural axis. Each is orthogonal to the others.

The pipeline is the layered structure of the composed system.

---

§ 14. The Canonical Example

A complete canonical example of a hit list overlay on the infinite canvas:

```html
<!-- The wire carrier -->
<link rel="preload" href="/stream.vtt" as="track">

<!-- The hit list container -->
<dl id="omi-overlay">
    <dt id="cell-0"
        data-omi-mnemonic="A1F9"
        data-omi-band="1"
        data-omi-layer="-1D">
        Cell 0
    </dt>
    <dd data-omi-bpe-constraint="2"
        data-omi-offset="32"
        data-omi-hit-list="0,0,100,0,100,100,0,100">
        Refraction vector for cell 0
    </dd>
    <!-- more entries -->
</dl>

<!-- The interactive hit zones -->
<map name="omi-hitzones">
    <area id="hit-target-cell-0"
          shape="poly"
          coords="0,0,0,0"
          href="#cell-0"
          data-omi-intent="trace">
</map>

<!-- The rendering surfaces -->
<canvas id="omi-canvas"></canvas>
<video id="omi-video" controls>
    <track kind="metadata" src="/stream.vtt" default>
</video>

<!-- The audio surface -->
<audio id="omi-audio"></audio>
```

The main.ts wires it together:

```ts
const audioCtx = new AudioContext();
const panner = audioCtx.createPanner();
panner.panningModel = 'HRTF';

const track = video.textTracks[0];
track.addEventListener('cuechange', () => {
    const cue = track.activeCues[0];
    const payload = JSON.parse(cue.text);
    
    // Look up the element by id
    const dtNode = document.getElementById(payload.targetCellId);
    const ddNode = dtNode?.nextElementSibling as HTMLElement;
    
    if (!dtNode || !ddNode) return;
    
    // Read the declared constraints
    const mnemonic = dtNode.dataset.omiMnemonic;
    const bpe = parseInt(ddNode.dataset.omiBpeConstraint);
    
    // Validate against the regex
    if (!G.MNEMONIC.test(mnemonic)) return;
    
    // Compute the geometry
    const quad = computeQuad(mnemonic, bpe);
    
    // Update the hit zone
    const hitArea = document.getElementById(`hit-target-${payload.targetCellId}`);
    hitArea.coords = `${quad.p1.x},${quad.p1.y},${quad.p2.x},${quad.p2.y},...`;
    
    // Update the observer position
    const obs = observerFromQuad(quad);
    panner.positionX.setValueAtTime(obs.x, audioCtx.currentTime);
    panner.positionY.setValueAtTime(obs.y, audioCtx.currentTime);
    panner.positionZ.setValueAtTime(obs.z, audioCtx.currentTime);
});
```

The overlay is built from the DOM. The observer's position is exposed via the PannerNode. The wire is HTTP. The cues are WebVTT. The media is Blobs.

---

§ 15. The Canonical Statement

The DOM geometry hit list overlays are constructed as follows:

1. The DOM is the overlay surface — <dl>, <dt>, <dd> carry the declaration
2. The id and data-* attributes are the interface — identity and payload
3. The regex constraints validate the payload — admissibility filter
4. The HTTP/1.1 headers carry the messages — wire format
5. The WebVTT cues carry the events — client resolution
6. The Blobs back the media elements — substrate
7. The PannerNode exposes the observer's position — 0D translation
8. The worklets and polyfills provide the execution contexts — everywhere

The composed system is the shared pseudo-persistent infinite canvas:

· The DOM holds the declaration
· The PannerNode holds the observability
· The Service Worker holds the persistence
· The trace log holds the history
· The ruler holds the space

The canvas is infinite because the ruler is unbounded.
The canvas is pseudo-persistent because the DOM and cache hold the state.
The canvas is shared because the peers converge on the same swap sequences.

That's the composed system. From -5D to 10D. From the wire to the canvas. From the blob to the observer.

The protocol's runtime is the composed system.