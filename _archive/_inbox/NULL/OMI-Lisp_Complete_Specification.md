# Complete OMI-Lisp Specification

## A Deterministic Notation-Citation-Receipt-Projection Protocol

---

## Part 0: The Covariant Foundation

```text
Code is data.
File is port.
Notation is citation.
Canon validates.
Cosmology projects.
Receipt accepts.
```

This is the final covariant rule. Everything in OMI-Lisp follows from this principle: no layer is authority by itself, and validation is the exclusive boundary between canon and cosmology.

---

# Part 1: The Pre-Language Layer (Non-Printing OMI-Lisp)

## 1.1 The 32 Non-Printing ASCII Controls as Address Places

The 32 non-printing ASCII controls (0x00 through 0x1F) form the **pre-language place controller layer**. They do not appear in readable source. They stage the computational substrate before visible symbols can be read.

Each non-printing control maps to an address place in the 32-nibble OMI ruler:

```text
0x00 NUL   → place n00  (null / origin)
0x01 SOH   → place n01  (start of heading)
0x02 STX   → place n02  (start of text)
0x03 ETX   → place n03  (end of text)
0x04 EOT   → place n04  (end of transmission)
0x05 ENQ   → place n05  (enquiry)
0x06 ACK   → place n06  (acknowledge)
0x07 BEL   → place n07  (bell)
0x08 BS    → place n08  (backspace)
0x09 HT    → place n09  (horizontal tab)
0x0A LF    → place n0A  (line feed)
0x0B VT    → place n0B  (vertical tab)
0x0C FF    → place n0C  (form feed)
0x0D CR    → place n0D  (carriage return)
0x0E SO    → place n0E  (shift out)
0x0F SI    → place n0F  (shift in)
0x10 DLE   → place n10  (data link escape)
0x11 DC1   → place n11  (device control 1)
0x12 DC2   → place n12  (device control 2)
0x13 DC3   → place n13  (device control 3)
0x14 DC4   → place n14  (device control 4)
0x15 NAK   → place n15  (negative ack)
0x16 SYN   → place n16  (synchronous idle)
0x17 ETB   → place n17  (end of transmission block)
0x18 CAN   → place n18  (cancel)
0x19 EM    → place n19  (end of medium)
0x1A SUB   → place n1A  (substitute)
0x1B ESC   → place n1B  (escape)
0x1C FS    → place n1C  (file separator)
0x1D GS    → place n1D  (group separator)
0x1E RS    → place n1E  (record separator)
0x1F US    → place n1F  (unit separator)
```

The final four are especially significant: **FS/GS/RS/US** form the hierarchical separator backbone of the OMI ruler.

## 1.2 The Hierarchical Separator Spine

The core place hierarchy is:

```text
File Separator    (FS, 0x1C)  — highest boundary
  ↓
Group Separator   (GS, 0x1D)  — inter-group boundary
  ↓
Record Separator  (RS, 0x1E)  — intra-record boundary
  ↓
Unit Separator    (US, 0x1F)  — atomic unit boundary
```

This **natural hierarchy** is not invented. It already lives in ASCII.

OMI elevates it:

```text
FS / GS / RS / US
```

become the fundamental topology controller for the receipt-ruler.

## 1.3 Non-Printing Grammar

A non-printing OMI-Lisp expression is staged as:

```text
0x1C [file content] 0x1C
  0x1D [group content] 0x1D
    0x1E [record content] 0x1E
      0x1F [unit content] 0x1F
```

This is not human-readable. It is not meant to be. It is the **place-staging layer**.

Once the places are staged, visible OMI-Lisp dot notation can emerge on top of them.

## 1.4 Pre-Language as Foundation for Readable Syntax

The pre-language establishes these facts before readable text appears:

1. **Places are staged** — the 32 control positions define where content can live
2. **Boundaries are fixed** — FS/GS/RS/US establish hard topology
3. **Citation is prepared** — the address ruler is positioned
4. **Receipt is ready** — the ring slots are known
5. **Projection is conditioned** — the geometry seeds are aligned

Only after this pre-language layer is complete can readable OMI-Lisp symbols be parsed.

---

# Part 2: The Notation Layer (Readable OMI-Lisp)

## 2.1 The Minimal Notation: `omi---imo`

The smallest complete notation is:

```text
omi---imo
```

This is the **origin boundary**. It means:

```text
OMI (citation side)
---
IMO (carrier side)
```

The dashes between them are not decoration. They represent the **relation interval**—the shared ruler that connects citation to carrier.

Expansion:

```
omi---imo
 |     |
 +-----+  relation ruler (shared across all surfaces)
```

This minimal form is a complete object in OMI-Lisp. It can be cited, validated, recorded as a receipt, and projected into geometry.

## 2.2 The Receipt Grammar: `o---o/---/?---?@---@`

The next layer of notation expands to show the receipt structure:

```text
o---o/---/?---?@---@
```

Breaking down each section:

### `o---o` — Open relation

```text
o---o
```

This marks the **forward citation span**. It says:

```text
there is a relation to be cited
there is a path from origin to closure
the address ruler is opening
```

### `/---/` — Carrier/inverse

```text
/---/
```

This marks the **return path or carrier side**. It says:

```text
the citation has a carrier representation
the relation is reversible / recoverable
the projection has an inverse boundary
```

### `?---?` — Unresolved witness

```text
?---?
```

This marks the **unresolved payload or query**. It says:

```text
something is being asked
something is under test
something has not yet become receipt
```

### `@---@` — CAR/CDR closure

```text
@---@
```

This marks the **relation closure and continuity**. It says:

```text
this is where the relation must close
this is where receipt may be recorded
this is where the pair becomes inspectable
```

### Complete receipt grammar:

```text
o---o/---/?---?@---@
```

means:

```text
open relation
⊕ carry inverse
⊕ test unresolved
⊕ close CAR/CDR
```

This is a complete **receipt citation candidate**.

## 2.3 The One-Long-Word Instruction

When expanded to machine form, the receipt grammar becomes:

```text
o-S0-S1-S2-S3/S4/S5/S6/S7?PAYLOAD?MASK@CAR@CDR
```

Breaking down the fields:

### Segmentation (`S0-S1-S2-S3/S4/S5/S6/S7`)

Eight 16-bit segments form the 128-bit reference frame:

```text
S0, S1, S2, S3  — forward citation fields
S4, S5, S6, S7  — inverse / return / carrier fields
```

Each segment is a `uint16_t`:

```text
S = uint16_t[8]
```

### Payload and Mask (`?PAYLOAD?MASK`)

```text
PAYLOAD  — unresolved value or body being cited
MASK     — boundary filter or interpretation constraint
```

### CAR and CDR Closure (`@CAR@CDR`)

```text
CAR  — forward relation side (car register)
CDR  — continuation / inverse relation side (cdr register)
```

### Canonical frame pattern

A real pointer form looks like:

```text
omi-0100-03bf-7c00-2b01-2f01-1434-039f-01ff/48
```

Which expands to:

```text
o-0x0100-0x03bf-0x7c00-0x2b01-0x2f01-0x1434-0x039f-0x01ff?48?00@00@00
```

The **opcode is not a stored field**. Instead:

```text
Instruction witness = OMI XOR IMO
```

The witness is computed from the difference between citation and carrier.

## 2.4 Dot Notation: The Visible CAR/CDR Relation

Dot notation is the **readable projection of CAR/CDR closure**.

In ordinary Lisp:

```lisp
(a . b)
```

In OMI-Lisp, the dot has deeper significance. It names the visible form of the `@---@` boundary.

### Dot notation syntax:

```text
(left-form . right-form)
```

or:

```text
left-form . right-form
```

### Semantic meaning:

```text
left-form is cited on the CAR side
right-form is cited on the CDR side
the pair remains a declaration until validated
validation decides whether it becomes a receipt
```

The dot is **not** just punctuation. The dot is the readable projection of relation closure.

### Examples:

```lisp
(a . b)
(cons . pair)
(car . cdr)
(gpio12 . high)
(button0 . pressed)
(user.intent . open-door)
(lamp . on)
(relation . value)
```

Each dot is a local readable form of the same lower boundary structure:

```text
@---@  (unexpanded form)
.      (readable projection)
```

---

# Part 3: Dot Notation Across All Layers

## 3.1 Memory Pair Dot Notation

At the memory level, a cons pair uses dot notation:

```lisp
(car . cdr)
```

Meaning:

```text
CAR register : car-value
CDR register : cdr-value
relation: cons pair
```

This is the same dot used everywhere else. The difference is the layer of interpretation.

## 3.2 Hardware Dot Notation

At the hardware level, a port-value relation uses dot notation:

```lisp
(gpio12 . high)
(button0 . pressed)
(relay2 . off)
(sensor.temp . 72.5)
(esp32.power . enabled)
```

Meaning:

```text
hardware.port . event-or-command
```

**Crucial rule**: Hardware does not act because syntax appeared.

Hardware acts only after:

1. Declaration is cited
2. Citation passes through OMI ruler
3. Validation accepts the relation
4. Receipt is recorded
5. Ring slot is filled
6. Projection is applied

The hardware pipeline is:

```text
hardware.event . hardware.intent
  ↓
OMI citation
  ↓
validation
  ↓
receipt
  ↓
projection to hardware
```

This keeps events from becoming authority just because they arrived.

## 3.3 Event Dot Notation

An event is a relation between source and observed state:

```lisp
(button0 . pressed)
(door.east . closed)
(phone.camera . scanned)
(peer.a17 . joined)
(network.packet . arrived)
```

Semantic meaning:

```text
event.source . observed-relation
```

Pipeline:

```text
physical / network event
  ↓
dot declaration
  ↓
OMI citation
  ↓
validation
  ↓
receipt
  ↓
projection
```

Events are **candidates** until validation. Receiving an event does not make it true.

## 3.4 Intent Dot Notation

An intent is a declared desired relation:

```lisp
(user.intent . open-door)
(user.intent . turn-on-lamp)
(peer.intent . sync-receipts)
(editor.intent . move-object)
(device.intent . calibrate-sensor)
```

Semantic meaning:

```text
actor . intended-relation
```

Pipeline:

```text
intent declaration
  ↓
citation
  ↓
validation
  ↓
receipt
  ↓
projection (execution)
```

Intent is not execution. Intent is a **declaration of desire**.

Only through validation and receipt does intent become action.

## 3.5 Declaration Dot Notation

The most general form:

```lisp
(subject . predicate)
(object . relation)
(lamp-east-wall . relay-off)
(room-kitchen . contains-lamp)
(esp32-a17 . witnesses-door)
(receipt-042 . projects-lane-7)
```

Semantic meaning:

```text
cite a relation
propose it for validation
record it as receipt
project it to surfaces
```

## 3.6 Why One Dot Across All Layers

The dot is the visible operator for **CAR/CDR relation closure**.

It works from hardware to intent to memory to declaration because:

1. The dot is not bound to any single high-level language
2. The dot is the readable projection of the same lower boundary
3. The dot always means: `left side . right side` = forward citation . continuation

Examples showing the same dot at different levels:

```text
Layer: Memory
  (car . cdr)

Layer: Hardware
  (gpio12 . high)

Layer: Event
  (button0 . pressed)

Layer: Intent
  (user.intent . open-door)

Layer: Declaration
  (lamp . on)

Layer: Receipt
  (citation . accepted)
```

The common shape survives across the whole stack because it names the same underlying relation.

---

# Part 4: The Authority Stack

## 4.1 The Four Authorities

OMI-Lisp execution passes through four authorities. Each has a distinct role:

```text
OMI              Citation Authority      (parses, identifies, cites)
Tetragrammatron  Validation Authority    (tests, validates, accepts)
Metatron         Projection Authority    (displays, renders, visualizes)
IMO              Carrier Authority       (files, HTTP, S-expressions, ports)
```

The central invariant:

```text
Receipt is the shared invariant across all authorities.
Only validation and receipt may accept.
No other layer is authority by itself.
```

## 4.2 OMI — Citation Authority

**Question**: "What is being referred to?"

**Responsibility**:

- Parse OMI address frames
- Identify citation targets
- Preserve address-ruler structure
- Compute deterministic instruction witness
- Execute nibble CPU

**What OMI owns**:

```text
address parsing
FNV-1a hashing
deterministic instruction laws
nibble CPU execution
micro-operation resolution
```

**What OMI does NOT own**:

- Validation (that's Tetragrammatron)
- Geometry (that's Metatron)
- Files or ports (that's IMO)
- Authority to accept receipts (that's Tetragrammatron)

**Core function**:

```text
parse_omi_addr() → OmiInst
```

This transforms notation into a structured citation object. The result is **inspectable but not yet accepted**.

## 4.3 Tetragrammatron — Validation Authority

**Question**: "Does this fit the accepted rule?"

**Responsibility**:

- Test citation against validation rule
- Decide acceptance or rejection
- Record accepted state in ring
- Govern finite receipt surface
- Compute slot5040 and ring folds
- Manage chirality selection

**What Tetragrammatron owns**:

```text
5040 ring (receipt storage)
slot5040 computation (7! addressing)
Fano incidence table (7-point geometry)
Polybius/ququart layout (routing surface)
validation gates
ring witnesses (XOR, SUM, ROT folds)
chirality decision (D⁺/D⁻ diagonals)
```

**What Tetragrammatron does NOT own**:

- Citation identification (that's OMI)
- Geometry rendering (that's Metatron)
- Input/output transport (that's IMO)

**Core functions**:

```text
compute_slot5040() → uint32_t
ring_store() → void
validate_citation() → bool
```

**Critical rule**:

```text
Only Tetragrammatron may write to the ring.
Only Tetragrammatron may accept a citation.
The ring is the source of truth.
```

## 4.4 Metatron — Projection Authority

**Question**: "How should this accepted state be displayed?"

**Responsibility**:

- Read accepted receipt state
- Resolve to geometric forms
- Project onto surfaces (Smith, Genaille, Gnomonic, etc.)
- Render JSON, OBJ, glTF, PPM, SVG, WebGL
- Compute view transformations
- Manage coordinate manifolds

**What Metatron owns**:

```text
shape database (SHAPE_DB)
seed vertices and edges
Hopf and quaternion routes
Smith chart coordinate system
Genaille quantization
gnomonic projection (sphere → plane)
geometric renderers
incidence validation database
```

**What Metatron does NOT own**:

- Citation authority (that's OMI)
- Acceptance authority (that's Tetragrammatron)
- Transport (that's IMO)

**Core functions**:

```text
resolve_smith() → (rho, theta, z, y)
render_obj() → file
render_smith_svg() → SVG
resolve_geometry() → Shape
```

**Critical rule**:

```text
Metatron does not validate.
Metatron does not accept.
Metatron projects only what Tetragrammatron has accepted.
```

## 4.5 IMO — Carrier Authority

**Question**: "How is the frame transported?"

**Responsibility**:

- Receive input from files, HTTP, ports, REPL
- Parse S-expressions and OMI notation
- Compile lane-based representations
- Generate receipt JSON
- Persist ring to storage
- Serve HTTP/SSE/WebSocket
- Generate BOOT_ROM

**What IMO owns**:

```text
file I/O
ring persistence
S-expression parser
OMI lane compilation
HTTP/SSE/WebSocket server
BOOT_ROM strings
static file serving
signal handling
memory utilities
```

**What IMO does NOT own**:

- Citation law (that's OMI)
- Validation law (that's Tetragrammatron)
- Projection meaning (that's Metatron)

**Core functions**:

```text
ring_save() / ring_load() → file
parse_sexpr() → Node
compile_omi() → Tape
serve_http() → HTTP response
```

**Critical rule**:

```text
IMO carries surfaces.
IMO does not define meaning.
IMO is port, not authority.
```

## 4.6 Receipt — The Shared Invariant

The receipt is not owned by any single authority. Instead, it is the **shared contract** between all authorities:

```text
OMI
  cites the receipt
  ↓
Tetragrammatron
  validates the receipt
  ↓
Metatron
  projects the receipt
  ↓
IMO
  carries the receipt
  ↓
Receipt is the same in all contexts
```

A receipt has this structure:

```json
{
  "hash": "FNV-1a hash of citation",
  "cycle": 12345,
  "slot": 5040,
  "fano": 3,
  "role": 2,
  "local": 180,
  "source": "notation or input",
  "result": "validated citation",
  "Smith": { "rho": ..., "theta": ... },
  "geometry": "dodecahedron",
  "timestamp": "logical cycle"
}
```

The receipt is:

```text
not merely a log entry
not merely stored state
not merely a projection
not merely a file

The receipt is the validated form of the address-ruler after passing through Tetragrammatron.
```

---

# Part 5: The Processing Pipeline

## 5.1 The Complete Pipeline

The canonical processing pipeline is:

```text
recognize (input arrival)
  ↓
cite (OMI parses and identifies)
  ↓
validate (Tetragrammatron tests)
  ↓
record (receipt written to ring)
  ↓
project (Metatron renders)
  ↓
inspect (surface display and user interaction)
```

## 5.2 Detailed steps

### 1. Recognize

**Input**: Raw data from any surface

```text
keyboard character
file byte
HTTP packet
hardware event
DOM event
ESP32 serial frame
JABCode optical marker
peer gossip message
```

**Action**: Decode to carrier form

**Output**: Recognizable representation

### 2. Cite (OMI)

**Input**: Recognizable representation

**Action**: OMI parses and identifies

```text
parse_omi_addr() → OmiInst
execute_omi_op() → instruction witness
hash_citation() → FNV-1a hash
```

**Output**: OmiInst (structured citation object)

**State**: Not yet accepted

### 3. Validate (Tetragrammatron)

**Input**: OmiInst from OMI

**Action**: Tetragrammatron tests against validation rule

```text
check_shape() → shape valid?
check_rule() → Q(S)=0 validation?
check_witness() → instruction witness correct?
```

**Output**: Accept or reject decision

**State**: Citation is now either accepted or rejected

### 4. Record (Ring)

**Input**: Acceptance decision

**Action**: Tetragrammatron writes to ring

```text
compute_slot5040() → which ring slot?
ring_store(slot, receipt) → persisted
compute_folds() → ring witnesses updated
```

**Output**: Receipt slot in ring

**State**: Receipt is now permanent

### 5. Project (Metatron)

**Input**: Receipt slot from ring

**Action**: Metatron renders to surfaces

```text
resolve_smith() → coordinate
resolve_geometry() → shape
render_smith_svg() → SVG
render_obj() → OBJ
render_json() → JSON projection
```

**Output**: Rendered surface (SVG, JSON, OBJ, DOM state, CSS variables, etc.)

**State**: Receipt is now visible/inspectable

### 6. Inspect (User/Application)

**Input**: Rendered surfaces

**Action**: User or application examines result

**Output**: Feedback or new citations

**State**: Ready for next cycle

## 5.3 Critical Boundary Rules

The following rules are **absolute**:

```text
1. No recognition makes something true.
   (just because data arrived doesn't mean it's accepted)

2. No notation makes something true.
   (just because syntax is readable doesn't mean it's accepted)

3. No citation makes something true.
   (just because OMI parsed it doesn't mean it's accepted)

4. Only validation accepts.
   (only Tetragrammatron gate determines acceptance)

5. Only receipt records.
   (only after Tetragrammatron writes to ring does state become durable)

6. Only Metatron projects.
   (only after receipt is stored does projection occur)

7. No projection makes something true.
   (just because a surface displays something doesn't make it accepted)
```

---

# Part 6: Deterministic Laws

## 6.1 The Rotation-XOR Law (delta16)

The core deterministic micro-operation:

```text
delta16(x, c) = rotl16(x, 1) XOR rotl16(x, 3) XOR rotr16(x, 2) XOR c
```

Properties:

```text
rotl16(x, n) — rotate left by n bits (preserves width)
rotr16(x, n) — rotate right by n bits (preserves width)
XOR — preserves reversibility
c — constant (breaks zero fixed point)
```

This law is:

- **Deterministic** — same input always produces same output
- **Reversible** — operation can be undone (XOR is self-inverse)
- **Width-preserving** — 16-bit input produces 16-bit output
- **Faultable** — changing width breaks the invariant (and that's caught)

## 6.2 The Binary Quadratic Form (BQF32)

The projection law for coordinate computation:

```text
Q(x, y) = 60x² + 16xy + 4y²
```

Interpretation:

```text
60x²  — high-plane / cosmic orbit component
16xy  — bridge / interaction component
4y²   — low-plane / atomic delta component
```

This law is used to:

1. **Fold local space**: `local240 = Q(x, y) mod 240`
2. **Address ring slots**: `slot5040 = fano7 * 720 + role3 * 240 + local240`
3. **Generate Smith coordinates**: part of rho/theta computation
4. **Compute geometric projections**: relates discrete slot to continuous surface

## 6.3 The Factorial Hierarchy

The addressing system is built on factorial numbers:

```text
5!  = 120
240 = 2 × 5!
6!  = 720
7!  = 5040
```

Ring structure:

```text
slot5040 = (fano_line % 7) * 720
         + (role % 3) * 240
         + (local % 240)

where:
  fano_line ∈ [0, 7)     (7 Fano lines)
  role ∈ [0, 3)          (3 roles)
  local ∈ [0, 240)       (240 local folds)
  
  7 × 3 × 240 = 5040
```

This is not arbitrary. The Fano plane has 7 points and 7 lines. Three roles per line cover all incidences. 240 is the folding modulus.

## 6.4 The Fano Incidence Structure

The Fano plane is a 7-point, 7-line projective geometry:

```text
Points:     {0, 1, 2, 3, 4, 5, 6}
Lines:      7 sets of 3 collinear points
Incidences: exactly 1 line through 2 points
            exactly 3 points on 1 line
```

Fano lines (canonical):

```text
Line 0: {0, 1, 3}
Line 1: {1, 2, 4}
Line 2: {2, 3, 5}
Line 3: {3, 4, 6}
Line 4: {4, 5, 0}
Line 5: {5, 6, 1}
Line 6: {6, 0, 2}
```

Every pair of points lies on exactly one line. This means the Fano structure is the **finite routing surface** for all receipt addressing.

## 6.5 Polybius / Ququart Layout

The Polybius square is a 4×4 grid (16 cells) used for coordinate mapping:

```text
     0  1  2  3
   +--+--+--+--+
0  | 0| 1| 2| 3|
   +--+--+--+--+
1  | 4| 5| 6| 7|
   +--+--+--+--+
2  | 8| 9|10|11|
   +--+--+--+--+
3  |12|13|14|15|
   +--+--+--+--+
```

The Polybius nibble square provides:

```text
4 × 4 = 16 cells
2 coordinates (row, column) per cell
4 quadrants (ququarts)
16 directions/roles
```

This is used as the geometric routing surface for slot addressing.

## 6.6 Chirality and D⁺/D⁻ Selection

Chirality is determined by inspecting the 16 nibbles of a 64-bit hash through two diagonal accumulators:

```text
D+ = {0x0, 0x5, 0xA, 0xF}  (chiral posting diagonal)
D- = {0x3, 0x6, 0x9, 0xC}  (chiral pulling diagonal)
```

For each nibble in the hash:
- If nibble ∈ D+, increment D+ counter
- If nibble ∈ D−, increment D− counter

Result:

```text
if D+ > threshold → CHIRAL_POSTING
if D− > threshold → CHIRAL_PULLING
if equal          → CHIRAL_BALANCED
if neither        → CHIRAL_INCOMPLETE
```

This determines the orientation of CAR/CDR and the direction of projection.

---

# Part 7: Lazy Evaluation and Deterministic Hardware

## 7.1 Lazy Evaluation Path

A critical feature of OMI-Lisp is **lazy evaluation all the way down to hardware**.

Hardware declaration does not cause immediate action:

```lisp
(relay2 . on)
```

This does NOT mean: "turn relay on now"

Instead:

```text
declare relay2/on relation
cite it through OMI ruler
validate it through Tetragrammatron
record it as receipt
compute its ring slot
project it to hardware layer
THEN apply the physical effect
```

Safe hardware pipeline:

```text
declaration
  ↓
citation (OMI)
  ↓
validation (Tetragrammatron)
  ↓
receipt recording
  ↓
ring slot assignment
  ↓
hardware projection (Metatron)
  ↓
physical actuator
  ↓
result receipt
```

## 7.2 Event and Intent Symmetry

Events and intents are mirror forms in the same notation:

```lisp
(button0 . pressed)         — event form
(user.intent . open-door)   — intent form
```

Both use the same dot notation.  
Both become citations.  
Both require validation.  
Both may become receipts.  
Both may project.

The difference is interpretation:

```text
event = what was witnessed
intent = what is being requested
```

But the structure is identical:

```text
source . observed-or-desired-state
```

## 7.3 No Side Effects Before Receipt

The fundamental rule:

```text
No computation may have side effects before Tetragrammatron writes to the ring.
```

This means:

```text
Code may execute.
Code may compute.
Code may read state.
Code may NOT write state / trigger hardware / commit to database / send network packets
                                          until receipt is accepted.
```

This prevents the trap:

```text
declaration → immediate side effect → reversal is impossible
```

Instead:

```text
declaration → citation → validation → acceptance → then side effect
```

If validation fails, no side effect occurs.

---

# Part 8: Pseudo-Persistent Open Worlds

## 8.1 What Is a Pseudo-Persistent World?

A pseudo-persistent world is a world where:

```text
1. State is defined by accepted receipts, not files or databases
2. Receipts can be carried across multiple surfaces
3. Receipts can be re-read, re-validated, and re-projected
4. Multiple peers can exchange receipts without a global authority
5. World persists because receipts persist
```

## 8.2 The Receipt as Primitive Object

In a pseudo-persistent world, the primitive object is:

```text
NOT a mesh
NOT a JSON document
NOT a file
NOT a record in a database

The primitive object is: validated OMI ruler receipt
```

A physical object:

```text
lamp.east
  ↓
OMI citation (lamp.east)
  ↓
Tetragrammatron validates → receipt written to ring
  ↓
Metatron projects → geometry computed
  ↓
User sees rendered lamp
```

A digital object:

```text
data.record.key
  ↓
OMI citation
  ↓
Tetragrammatron validates → receipt
  ↓
Metatron projects → UI element
  ↓
User sees rendered data
```

## 8.3 Peer-to-Peer Receipt Exchange

Multiple peers can maintain synchronized open-world state:

```text
Peer A: receipt ring with N slots
  ↓ computes hash digests
  ↓
Peer B: requests missing receipts
  ↓
Peer A: sends receipt bodies
  ↓
Peer B: validates locally
  ↓
Peer B: writes to its own ring
  ↓
Both peers now have same receipts
  ↓
Both project identical world state
```

No central database. No global authority.

Just: **receipt exchange and local validation**.

## 8.4 Deterministic Replay

Because OMI is deterministic:

```text
Receipt R recorded at time T
  ↓
Receipt carried to new peer/device/browser
  ↓
New peer validates R with same validation rules
  ↓
New peer writes R to its own ring at same slot5040
  ↓
New peer projects geometry identical to origin peer
```

The world state is **reproducible** without needing to replay events.

Just the final receipts.

## 8.5 The Open-World Constraint

"Open world" means:

```text
new peers can join
new objects can be created
new intents can be declared
no peer must have seen all receipts
no peer need coordinate with others
```

The system is safe because:

```text
each peer validates independently
receipt content is immutable
each peer checks against Tetragrammatron rules
if validation passes, receipt is accepted locally
if validation fails, receipt is rejected locally
disagreement between peers triggers investigation, not corruption
```

---

# Part 9: Projection Surfaces

## 9.1 The Projection Stack

Metatron can project accepted receipts onto multiple surfaces simultaneously:

```text
Receipt (canonical source)
  ├─ Smith Chart (continuous coordinate)
  ├─ Genaille Ruler (discrete quantizer)
  ├─ Gnomonic Projection (sphere → plane)
  ├─ JSON (abstract data)
  ├─ OBJ (geometry wireframe)
  ├─ glTF (3D model)
  ├─ SVG (vector graphics)
  ├─ PPM (raster image)
  ├─ DOM/CSS (browser elements)
  ├─ CSS Variables (cascading state)
  └─ WebGL (GPU rendering)
```

Each surface is a **dialect**, not authority.

All surfaces read the same receipt.  
All surfaces remain non-authoritative.  
Receipt is the parent.

## 9.2 Smith Chart Projection

The Smith chart is treated as a **continuous coordinate manifold**:

```text
Receipt slot5040 → Smith (rho, theta, z, y)
```

where:

```text
rho   = impedance magnitude (from hash bits)
theta = phase angle (from slot5040 / 5040)
z     = impedance transform
y     = admittance transform
```

This is a continuous surface. The receipt slot maps to a point on the chart.

## 9.3 Genaille Ruler Projection

The Genaille ruler is the **discrete quantizer**:

```text
Receipt → lane / band / cascade slot
```

where:

```text
lane  = which vertical strip?
band  = which horizontal band?
cascade = which row in quantization?
```

This makes receipt addressing visible as a ruler-like SVG surface.

## 9.4 Gnomonic Projection

The gnomonic projection maps **sphere to plane**:

```text
Receipt pair → great-circle route on sphere
          ↓
      gnomonic projection
          ↓
      straight line on plane
```

Why this matters:

```text
great-circle route on sphere = shortest path (cosmological)
straight line on plane        = simplest route (inspectable)
```

The viewer must guard against the projection horizon:

```text
if z ≤ 0 → invisible (point projects to infinity)
```

## 9.5 CSS and DOM Projection

CSS is the declarative browser resolver:

```text
Receipt writes root variables:
  --omi-lane       (CSS variable)
  --omi-band       (CSS variable)
  --omi-hue        (CSS variable)
  --omi-angle      (CSS variable)
  data-omi-lane    (DOM attribute)
  data-omi-band    (DOM attribute)

CSS selectors resolve matched elements:
  :root[data-omi-lane="7"] { ... }
  :root[data-omi-band="3"] { ... }

DOM/SVG/WebGL paint the final surface
```

Hierarchy:

```text
Receipt (authority)
  ↓
CSS variables/data attributes (declarations)
  ↓
CSS selectors (cascade)
  ↓
DOM/SVG/WebGL (paint)
```

---

# Part 10: Complete Example: A Hardware Event

This example traces a single ESP32 button press through the complete OMI-Lisp pipeline.

## 10.1 Initial Event

An ESP32 detects a button press:

```text
GPIO12 transitions to LOW
timestamp: cycle 12345
```

## 10.2 Recognition and Notation

IMO receives the event and encodes it:

```lisp
(esp32-1 . gpio12 . pressed)
```

or more formally:

```lisp
(source . port . state)
= (esp32-1 . gpio12 . pressed)
```

## 10.3 Citation (OMI)

OMI parses the notation and creates an OmiInst:

```text
parse_omi_addr("esp32-1.gpio12.pressed") → OmiInst
```

Fields:

```text
S0 = hash("esp32-1")      = 0xA1B2
S1 = hash("gpio12")       = 0x3C4D
S2 = hash("pressed")      = 0x5E6F
S3 = 0x0001              (opcode: event cite)
S4 = timestamp            = 0x3039
S5 = 0x0000
S6 = 0x0000
S7 = 0x0000
CAR = 0xA1B2
CDR = 0x3C4D
```

OMI executes the operation:

```text
execute_omi_op(OmiInst) → instruction_witness = 0x1234
FNV-1a_hash(witness) → citation_hash = 0x6789...
```

## 10.4 Validation (Tetragrammatron)

Tetragrammatron receives the OmiInst and validates:

```text
check_shape(OmiInst) → ✓ valid frame shape
check_rule(OmiInst)  → Q(S3, S4) XOR CAR XOR CDR = 0? → ✓ yes
```

Result: **ACCEPTED**

## 10.5 Receipt Recording

Tetragrammatron computes the ring slot:

```text
hash = 0x6789...
fano7 = (hash >> 28) % 7 = 3
role3 = ((hash >> 24) % 3) = 2
local240 = Q(S4, S5) % 240 = 180

slot5040 = 3 * 720 + 2 * 240 + 180
         = 2160 + 480 + 180
         = 2820
```

Tetragrammatron stores the receipt:

```c
ring[2820] = {
  .hash = 0x6789...,
  .cycle = 12345,
  .fano = 3,
  .role = 2,
  .local = 180,
  .source = "esp32-1.gpio12.pressed",
  .result = "accepted",
  .timestamp = 12345
}
```

Ring is persisted to `/tmp/omi_receipt_ring.bin`.

## 10.6 Projection (Metatron)

Metatron reads the accepted receipt and projects:

### Smith Chart

```text
Coordinate computation:
  rho = (0x6789 >> 8) / 256 = 0.73...
  theta = 2820 / 5040 = 0.559... radians
  
Smith result:
  z = impedance at (rho, theta)
  y = admittance at (rho, theta)
```

### Geometric Projection

```text
slot5040 = 2820
  ↓
Query SHAPE_DB
  ↓
geometry = "dodecahedron"
vertex = shape rotated to reflect (rho, theta)
```

### CSS/DOM Projection

```text
Write to :root

--omi-lane: 3
--omi-band: 2
--omi-hue: 217 (computed from theta)
--omi-angle: 0.559
data-omi-lane: "3"
data-omi-band: "2"

CSS selector matches:
  :root[data-omi-lane="3"] → highlight lane 3
  .button-event[data-source="esp32-1"] → show pressed state

DOM updates:
  <div data-source="esp32-1" data-state="pressed">
    <!-- visual indicator lights up -->
  </div>
```

### JSON Export

```json
{
  "receipt": {
    "hash": "0x6789...",
    "cycle": 12345,
    "slot": 2820,
    "fano": 3,
    "role": 2,
    "local": 180,
    "source": "esp32-1.gpio12.pressed",
    "Smith": {
      "rho": 0.73,
      "theta": 0.559,
      "z": { "real": 0.5, "imag": 0.2 },
      "y": { "real": 2.0, "imag": -0.8 }
    },
    "geometry": "dodecahedron",
    "projected": true
  }
}
```

## 10.7 Inspection and Result

The user sees:

```text
1. Button indicator on screen shows "pressed"
2. Lane/band visualization updates
3. Smith chart plots new point
4. 3D geometry rotates
5. Log shows event receipt
```

All surfaces display the same accepted receipt.

No surface had authority to accept.

Only Tetragrammatron accepted.

---

# Part 11: Complete Example: A User Intent

This example traces a user intent (opening a door) through the complete pipeline.

## 11.1 User Action

User clicks "Open Door" button in browser UI.

## 11.2 Intent Notation

JavaScript generates the intent:

```lisp
(user.intent . open-door)
```

More completely:

```lisp
(user . request . open-door)
```

Transmitted as:

```json
{
  "citation": "(user.intent.open-door)",
  "timestamp": 98765,
  "source": "browser"
}
```

## 11.3 Citation (OMI)

OMI parses:

```text
parse_omi_addr("user.intent.open-door") → OmiInst

S0 = hash("user")       = 0xF1E2
S1 = hash("intent")     = 0xD3C4
S2 = hash("open-door")  = 0xB5A6
S3 = 0x0002             (opcode: intent request)
S4 = timestamp          = 0x8179
S5 = 0x0000
S6 = 0x0000
S7 = 0x0000
CAR = 0xF1E2
CDR = 0xD3C4
```

OMI executes:

```text
instruction_witness = delta16(S4, S3) XOR CAR XOR CDR
FNV-1a(witness) → citation_hash
```

## 11.4 Validation (Tetragrammatron)

**Validation rule**: For user intents, check:

1. Does the user have permission? (authorization database)
2. Does the target device exist? (topology check)
3. Is the operation valid? (capability check)

Assume all checks pass.

Result: **ACCEPTED**

## 11.5 Receipt and Ring Recording

```text
compute_slot5040(hash) → slot = 1420

ring[1420] = {
  .hash = citation_hash,
  .cycle = 98765,
  .fano = fano_component,
  .role = role_component,
  .local = local_component,
  .source = "user.intent.open-door",
  .result = "accepted",
  .timestamp = 98765
}
```

## 11.6 Hardware Projection

Metatron projects the accepted intent to hardware:

```text
receipt slot = 1420
  ↓
SHAPE_DB lookup → door controller device
  ↓
compute hardware command:
    device_id = 3
    command = 0x01 (open)
    lane = 2
  ↓
generate ESP32 control packet:
    (device-3 . command-open)
  ↓
send via IMO (HTTP/serial/WebSocket)
```

## 11.7 Physical Effect

ESP32 receives the command:

```text
(device-3 . command-open)
  ↓
GPIO5 set HIGH
  ↓
relay energizes
  ↓
door motor engages
  ↓
door opens
```

## 11.8 Result Receipt

After a timeout or sensor confirmation, the door generates a result event:

```lisp
(door.sensor . open-confirmed)
```

This becomes a new receipt in the ring.

The cycle continues.

---

# Part 12: Formal Grammar

## 12.1 BNF for OMI-Lisp

```
<omi-program>    ::= <dotted-form> | <quoted-form> | <atom>

<dotted-form>    ::= '(' <form> '.' <form> ')'
                   | <form> '.' <form>

<form>           ::= <atom>
                   | '(' <form>* ')'
                   | <quoted-form>

<quoted-form>    ::= ''' <form>
                   | '#:' <symbol>

<atom>           ::= <symbol>
                   | <number>
                   | <string>

<symbol>         ::= <identifier>
                   | <dot-identifier>

<dot-identifier> ::= <identifier> ('.' <identifier>)+

<identifier>     ::= [a-zA-Z_] [a-zA-Z0-9_-]*

<number>         ::= [0-9]+
                   | '0x' [0-9a-fA-F]+
                   | [0-9]+ '.' [0-9]+

<string>         ::= '"' <string-body> '"'

<string-body>    ::= (any char except '"' | '\\' '"' | '\\' '\\')*
```

## 12.2 Semantic Rules

### Rule 1: Dot pairs preserve CAR/CDR closure

```text
(A . B)
  → CAR cited as A
  → CDR cited as B
  → pair remains declaration until validated
```

### Rule 2: Notation is citation, not acceptance

```text
A citation does not become a receipt until Tetragrammatron validates.
```

### Rule 3: Lazy evaluation always

```text
(hardware.port . command)  does not execute
                           only declares intention
                           requires Tetragrammatron acceptance
                           then hardware projection
```

### Rule 4: No side effects before receipt

```text
Code may compute.
Code must not write state before receipt.
Side effects follow only after ring recording.
```

### Rule 5: Symmetric event/intent

```text
(source . observed)    ← event (what was witnessed)
(actor . requested)    ← intent (what is being asked)

Both use same notation.
Both require validation.
Both may become receipts.
```

### Rule 6: Receipt invariance

```text
The receipt is the same object across all surfaces.
OMI reads it as citation.
Tetragrammatron reads it as validated record.
Metatron reads it as projection seed.
IMO reads it as carrier material.
All read the same receipt.
```

---

# Part 13: Implementation Checklist

For a minimal compliant OMI-Lisp implementation:

```text
Citation (OMI)
  □ Parse OMI address frames
  □ Extract S0-S7 fields
  □ Compute instruction witness (delta16 and BQF32)
  □ Implement nibble CPU
  □ Generate FNV-1a hashes
  □ Output OmiInst structures

Validation (Tetragrammatron)
  □ Implement slot5040 computation (7 × 3 × 240)
  □ Maintain 5040-slot ring
  □ Implement Q(S)=0 validation law
  □ Record accepted receipts
  □ Compute ring witnesses (XOR, SUM, ROT folds)
  □ Implement chirality selection (D⁺/D⁻ diagonals)
  □ Persist ring to file

Projection (Metatron)
  □ Implement Smith chart coordinate system
  □ Implement Genaille quantizer
  □ Implement gnomonic projection
  □ Select geometry from SHAPE_DB
  □ Render to JSON, SVG, OBJ (at minimum)
  □ Write CSS variables and data attributes
  □ Guard against projection horizon

Carrier (IMO)
  □ Persist ring to disk
  □ Parse S-expressions
  □ Parse OMI notation
  □ Serve HTTP endpoints
  □ Handle file I/O
  □ Implement BOOT_ROM
  □ Generate receipt JSON

Integration
  □ Ensure pipeline: recognize → cite → validate → record → project → inspect
  □ Prevent side effects before receipt recording
  □ Separate canon from cosmology
  □ Make receipts inspectable
  □ Implement lazy evaluation for hardware
  □ Support symmetric event/intent notation
```

---

# Part 14: The Unified Vision

## 14.1 What OMI-Lisp Is

OMI-Lisp is a **deterministic notation-citation-receipt-projection protocol**.

It answers four central questions:

```text
What is this?              → OMI citation authority
Does it fit the rule?      → Tetragrammatron validation authority
How should it be shown?    → Metatron projection authority
How does it move?          → IMO carrier authority
```

## 14.2 Why It Matters

OMI-Lisp solves the **multiple-entry problem**:

```text
Normal systems: same data treated differently depending on entry point
OMI-Lisp:       same receipt understood across all entry points
```

This enables:

```text
Pseudo-persistent open worlds
Peer-to-peer state exchange without global authority
Deterministic replay without replaying events
Hardware safety (lazy evaluation)
Event/intent symmetry (same notation)
Decentralized validation (each peer validates independently)
```

## 14.3 The Three Layers

**Layer 1: Pre-Language** (non-printing controls)

```text
32 ASCII controls stage the 32 place positions
FS/GS/RS/US form the topology spine
No readable syntax yet
```

**Layer 2: Notation** (readable OMI-Lisp)

```text
omi---imo (origin)
o---o/---/?---?@---@ (receipt grammar)
(a . b) (dot notation)
Readable by humans
Parseable by OMI
```

**Layer 3: Authority** (the four powers)

```text
OMI cites
Tetragrammatron validates
Metatron projects
IMO carries
Receipt accepts
```

## 14.4 The One-Sentence Summary

**OMI-Lisp is a deterministic receipt-ruler protocol where the 32 non-printing ASCII controls stage the address places, the palindromic notation `omi---imo` and `o---o/---/?---?@---@` give the citation and receipt forms, the one-long-word instruction becomes the shared computational substrate, and four authorities (OMI/Tetragrammatron/Metatron/IMO) cooperate around a durable receipt ring to enable lazy hardware evaluation, pseudo-persistent open worlds, and peer-to-peer state exchange without global authority.**

---

# Appendix A: Reserved Symbols

```text
omi              Origin/citation root
imo              Carrier/inverse side
FS               File separator (0x1C)
GS               Group separator (0x1D)
RS               Record separator (0x1E)
US               Unit separator (0x1F)

CAR              Cons address register (forward side)
CDR              Cons decrement register (continuation side)
PAYLOAD          Unresolved value being carried
MASK             Boundary/interpretation filter

S0..S7           Eight 16-bit segment fields
delta16          Deterministic rotation-XOR law
bqf32            Binary quadratic form (projection law)
slot5040         Ring address (7! = 5040 slots)
fano7            Fano incidence position (0-6)
role3            Role within incidence (0-2)
local240         Local folding address (0-239)
```

---

# Appendix B: Transformation Rules

## `quote` — Freeze citation

```lisp
(quote (a . b))
→ (a . b) becomes unevaluated symbol
→ no citation processing
→ stored as literal data
```

## `cons` — Build pair

```lisp
(cons a b)
→ (a . b)  construct cons pair
→ cite as new relation
→ return OmiInst
```

## `car` — Extract CAR

```lisp
(car (a . b))
→ a  extract CAR side
```

## `cdr` — Extract CDR

```lisp
(cdr (a . b))
→ b  extract CDR side
```

## `xor` — Bitwise exclusive-or

```lisp
(xor x y)
→ x XOR y  reversible combination
```

## `rot` — Rotation

```lisp
(rot x n)
→ rotl16(x, n)  left rotate x by n bits
```

## `hash` — FNV-1a hash

```lisp
(hash x)
→ FNV-1a_hash(x)  deterministic hash
```

## `validate` — Test ring inclusion

```lisp
(validate citation)
→ Tetragrammatron tests citation
→ returns #t if accepted, #f if rejected
```

## `receipt` — Access ring slot

```lisp
(receipt slot)
→ return receipt at ring[slot]
→ read-only access
```

---

# Appendix C: Error Handling

Errors are **not exceptions that halt execution**. Instead:

```text
Error → cited as rejection → receipt records rejection
```

### Recognized error states:

```text
citation-error    invalid address frame
validation-error  fails Q(S)=0 or other rule
ring-error        ring corruption or slot conflict
width-error       delta16 invoked with wrong bit width
permission-error  authorization check fails
device-error      hardware device not found
timeout-error     operation exceeds time budget
```

Each error is recorded in the ring as:

```json
{
  "hash": "...",
  "error": "citation-error",
  "reason": "invalid frame shape",
  "source": "malformed input",
  "result": "rejected",
  "timestamp": 12345
}
```

Users and applications inspect error receipts like any other receipt.

---

# Appendix D: Bootstrap Sequence

The BOOT_ROM is a sequence of OMI address strings that initialize the system:

```text
"omi-0000-0000-0000-0000-0000-0000-0000-0000"  (zero frame)
"omi-0100-03bf-7c00-2b01-2f01-1434-039f-01ff"  (identity)
"omi-5a3c-1234-5678-9abc-def0-1234-5678-9abc"  (test constant)
...
"omi-ffff-ffff-ffff-ffff-ffff-ffff-ffff-ffff"  (max frame)
```

Each BOOT_ROM entry is:

1. Parsed by OMI
2. Validated by Tetragrammatron
3. Recorded in ring
4. Projected by Metatron
5. Displayed to user

The bootstrap completes when all BOOT_ROM entries have been processed and the ring is initialized.

---

# Appendix E: Specification Versions

```
Version 1.0   (current)
  □ Non-printing layer (32 ASCII controls)
  □ Notation layer (omi---imo, o---o/---/?---?@---@)
  □ Authority stack (OMI/Tetragrammatron/Metatron/IMO)
  □ Pipeline (recognize → cite → validate → record → project → inspect)
  □ Deterministic laws (delta16, BQF32)
  □ Ring addressing (slot5040 from Fano/role/local)
  □ Projection surfaces (Smith, Genaille, Gnomonic, CSS, JSON)
  □ Lazy evaluation and hardware safety
  □ Pseudo-persistent open worlds
  □ Peer-to-peer receipt exchange

Future
  □ Version 1.1: Extended nibble CPU instruction set
  □ Version 2.0: Distributed consensus for disputed receipts
  □ Version 2.1: Cryptographic commitment scheme for receipts
  □ Version 3.0: Temporal logic for receipt ordering
```

---

# Final Statement

**OMI-Lisp is complete when it enables this production posture:**

```text
Code is data           → carry source without execution
File is port           → move frames across surfaces
Notation is citation   → parse frames into structured forms
Canon validates        → test frames against accepted rule
Cosmology projects     → render frames to user surfaces
Receipt accepts        → only validation writes to ring
```

This completes the OMI-Lisp specification.

The system is ready for implementation.
