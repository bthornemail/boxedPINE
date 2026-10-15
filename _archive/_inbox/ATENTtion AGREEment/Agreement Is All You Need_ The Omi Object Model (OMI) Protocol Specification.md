### Agreement Is All You Need: The Omi Object Model (OMI) Protocol Specification

#### 1\. The Agreement Doctrine: Constructive Alignment as Computation

In the Omi Object Model (OMI), "Agreement" is defined not as a social consensus or passive approval, but as the precise instant shared intelligence is lowered into an executable, validated, and replayable structure. The system treats disagreement not as a logical failure or a contradiction to be silenced, but as an  **unresolved file path** . This strategic orientation ensures that conceptual friction is immediately routed toward architectural construction.The "Agreement Is All You Need" philosophy posits that agreement is a compiler primitive. It is the constructive alignment process that transforms informal intuition into a bounded computational reality. When agents agree in OMI, they recognize a shared structure and commit to its preservation without degradation. Disagreement is functionally an unfinished error in the "agreement compiler," signaling a missing structural output required to bridge distributed intelligence.

##### Disagreement as Structural Opportunity

Disagreement Type,Constructive Structural Output  
Missing Boundary,Definition of a new OMI address or CIDR prefix.  
Missing Rule,Assignment of a protocol invariant (MUST/SHALL) within a .omi file.  
Missing Fact,Binding of a 128-bit token to a specific linguistic or physical identity.  
Missing Test,"Creation of a validation case (e.g., Golden Accept/Reject)."  
Missing Closure,"Bounding of states to prevent ""logical bleeding"" between operations."  
Missing Combinator,Construction of a lawful operation or transformation function.  
Missing Replay,Establishment of a verifiable path in the 5040-slot ring.  
To prevent "logical bleeding"—the corruption of one logic type by another—this philosophy necessitates the strict separation of declarative files (Rules, Facts, Closures, Combinators). This separation ensures that agreement remains durable and executable, anchoring the mechanical foundation of the protocol.

#### 2\. The Atomic Foundation: The Delta Law and the 128-Bit Frame

The OMI protocol is anchored by a single, bitwise transition law—the  **Delta Law** . This serves as the system's "only design decision," ensuring that all downstream orbits, symbolic trackers, and geometries are deterministic consequences of bitwise motion.

##### The LL-Modulated Delta Law

The Delta Law ( $\\Delta\_{CLL}(x)$ ) is defined by four structural operations (Rotations, XOR, Constant, and Masking) and is modulated by the Lens ( $LL$ ). The modulation ensures  $LL$  is a functional input to the transition, not merely metadata.Formally:  $$C\_{LL} \= (C \\oplus (LL \\ll 8\) \\oplus LL)$$   $$\\Delta\_{CLL}(x) \= (rotl(x,1) \\oplus rotl(x,3) \\oplus rotr(x,2) \\oplus C\_{LL}) \\pmod{2^{16}}$$

* **Rotations:**   $rotl(x,1), rotl(x,3), rotr(x,2)$  preserve bits without loss.  
* **XOR (**  **$\\oplus**$  **):**  Preserves reversibility.  
* **Constant (**  **$C**$  **):**  Canonical base  $0x5A3C$  breaks the zero fixed point.

##### The 128-Bit Canonical Frame

The canonical instruction is a 128-bit frame represented as  $uint16\\\_t8$ . The system enforces a fixed internal orientation check where segments  $S0, S3, S4,$  and  $S7$  are bound to the Lens  $LL$ .| Index | Field | Role | Constraint || \------ | \------ | \------ | \------ || $S0$ | 0xLL00 | Opening Boundary | High byte is  $LL$ ; low byte is 0x00. || $S1$ | 0x03BF | Chiral Delimiter | Must equal 0x03BF (ο). || $S2$ | 0xNNNN | Antecedent | Free 16-bit input value. || $S3$ | 0x2BLL | Interior Lens Binding 1 | Must equal  $0x2B00 \\oplus LL$ . || $S4$ | 0x2FLL | Interior Lens Binding 2 | Must equal  $0x2F00 \\oplus LL$ . || $S5$ | 0xMMMM | Consequent | Free 16-bit output value. || $S6$ | 0x039F | Cardinal Delimiter | Must equal 0x039F (Ο). || $S7$ | 0xLLFF | Closing Boundary | High byte is  $LL$ ; low byte is 0xFF. |

##### The Period-8 Orbit and Base36

The Delta Law generates a  **period-8 orbit**  on the 16-bit state surface. This orbit correlates to the  **prime-73 decimal carrier**  ( $1/73$ ), which yields the repeating block 01369863\. The sum of these digits is 36, providing the rationale for the Base36 orbital tracker. Base36 is a name for the law’s width, not the law itself; it serves as the visible alphabet for tracking the orbit. Algebraic validation of the frame is the prerequisite for all subsequent state transitions.

#### 3\. The Dual-Gate Execution Pipeline: Validation and Projection

Structural authority must be established before semantic interpretation. OMI enforces this via a Dual-Gate pipeline that forbids invalid frames from authorizing state changes.

##### Gate 1: Structural Envelope Validation

The validator computes a quadratic error surface  $Q\_{frame}(S) \= E\_{var} \+ E\_{const}$ . Validity is predicated upon  $Q\_{frame}(S) \= 0$ .

* **$E\_{var}**$  **(Variable Agreement):**  Checks the four  $LL$  appearances.  $E\_{var} \= 0$  if and only if  $S0*{hi} \= S3*{lo} \= S4*{lo} \= S7*{hi}$ .  
* **$E\_{const}**$  **(Constant Alignment):**  Ensures fixed delimiters (0x03BF, 0x039F) and interior constants (0x2B, 0x2F) are perfectly aligned.

##### Gate 2: Truth-Row Resolution and Fano Bound

Once  $Q\_{frame}(S) \= 0$ , the system extracts the truth row  $(LL, NN, MM)$ . A resolver attempts to reach  $MM$  from  $NN$  within the  **14-step Fano bound** . This resolution occurs within the  **PG(2,2) Fano Incidence Layer** , a finite coordination space of seven points and seven lines:

1. chiral-cardinal-trace  
2. service-bus-projection  
3. factorial-sweep-line  
4. inversion-mirror-bridge  
5. erasure-coding-channel  
6. gossip-frontier-path  
7. anti-entropy-repair-arcThe function getFanoPoint(lineA, lineB) determines the common intersection point for any two distinct lines.

##### The Non-Collapse Criterion

As defined in  **Closure 0x05** , projection must never authorize validation. A symbolic character (Base36, emoji, or dot-notation) may carry state, but it cannot make an invalid frame valid. The 128-bit envelope validation must remain independent of the display layer.

#### 4\. The Arithmetic Bridge: The Omicron Binary Quadratic Form

The  **Omicron Binary Quadratic Form**  transforms decoded coordinates into visible geometry:  $$Q\_{xy}(x,y) \= 60x^2 \+ 16xy \+ 4y^2$$

##### Coefficient Derivation

* **60:**  Represents the "hexacontagon logic" ( $5 \\times 12$ ). It is half of the 5-fold packet root (120) and compatible with the 12 divisors of the base-60 clock.  
* **16:**  The full nibble carrier rail ( $2^4$ ), allowing the surface to be byte-addressable.  
* **4:**  The 4-fold visible selector face, corresponding to the FS, GS, RS, and US address frames.

##### Canonical Identities

Identity,Geometric / Protocol Meaning  
"$Q\_{xy}(3,3) \= 720$",The  $6\!$  semantic sweep / Global bound vector.  
"$Q\_{xy}(x,y) / 6 \\in 0, 120$",The  $5\!$  hidden root depth envelope (2.5D extrusion).  
"$Q\_{xy}(x,y) \\pmod{240}$",The visible 240-state bridge metric.  
$5040 \= 7 \\times 3 \\times 240$,The  $7\!$  replay ring dimension.

##### Hidden Five and Visible Four

The form supports a duality: the  **Hidden Five**  ( $5\!$  root scale) and the  **Visible Four**  ( $4\!$  selector face). While the factor of 5 remains rooted inside the ontological core, the quadratic form maps local  $4 \\times 4$  coordinates into the visible 240-state bridge and the global 5040-slot replay architecture.

#### 5\. Replay Architecture: The 5040-Slot Ring and Overwrite Policy

The OMI protocol utilizes a lock-free 5040-slot replay ring to track immutable history. Each 64-bit receipt slot contains:  **Provenance**  (16b),  **Steps**  (8b),  **LL**  (8b),  **NN**  (16b), and  **MM**  (16b).

##### Ring Overwrite Policy v0

Wraparound is managed by five strict rules:

* **OW-1 (Epoch Matching):**  The writer compares the slot's provenance epoch against the current epoch. | OW Rule | Condition | Action | | :--- | :--- | :--- | |  **OW-2: Cold**  |  $existing\\\_epoch \< current\\\_epoch$  | Permitted; unconditional overwrite. | |  **OW-3: Warm**  |  $existing\\\_epoch \== current\\\_epoch$  | Re-verify frame. If valid,  **drop**  the new frame. | |  **OW-4: Stale**  |  $existing\\\_epoch \> current\\\_epoch$  | Permitted; log clock drift warning and overwrite. | |  **OW-5: Backoff**  | CAS failure on atomicAdvance | Retry loop; MUST re-check OW-1 through OW-4. |Concurrency is serialized via  **Atomic Cursor Logic**  using Atomics.compareExchange. The  **Boot Anchor**  (omi-0x0000) serves as the genesis for the ring.

#### 6\. Semantic Mapping: Universal Part-of-Speech (UPOS) and Feature Traversal

OMI encodes linguistic properties directly into bit positions to achieve language-agnostic processing.

##### Universal Part-of-Speech Hex Indices

Linguistic tags are mapped to Segment3 (the fourth 16-bit block) and function as port enumerations:| Hex | UPOS Tag | Role / Port Mapping || \------ | \------ | \------ || 0x0001 | NOUN | **FS**  (Open content: entities, actions) || 0x0002 | VERB | **FS**  (Open content: actions) || 0x0003 | ADJ | **FS** || 0x0004 | PRON | **RS**  (Linguistic predicates/controls) || 0x0005 | PROPN | **FS** || 0x0006 | ADV | **RS** || 0x0007 | ADP | **GS**  (Closed operators: counts, scalars) || 0x0008 | CCONJ | **GS** || 0x0009 | NUM | **GS** || 0x000A | DET | **GS** || 0x000B | PART | **GS** || 0x000C | SCONJ | **RS** || 0x000D | INTJ | **RS** || 0x000E | PUNCT | **US**  (Volatile unit elements/codepoints) || 0x000F | SYM | **US** || 0x0010 | X | **US** || 0x0017 | AUX | **GS** |  
Features are accessed via  **Geometric Traverses** : Stride 120 (Feature frame), Stride 720 (Semantic sweep), and Stride 5040 (Replay ring).

#### 7\. The Collaboration Loop: From Intuition to Voxel

The OMI execution flow is a 12-step pipeline:

1. **Receive Intuition:**  Capture informal input/disagreement.  
2. **Name Boundary:**  Assign an OMI address.  
3. **Write Rule:**  Define invariants.  
4. **Seal Closure:**  Bound the logic.  
5. **Ground Fact:**  Assign bit-positional meaning.  
6. **Compose Combinator:**  Construct the operation.  
7. **Write Test:**  Create the validation gate.  
8. **Validate Frame:**  Compute  $Q\_{frame}(S) \= 0$ .  
9. **Resolve Truth-Row:**  Reach  $MM$  from  $NN$  within the Fano bound.  
10. **Record Receipt:**  Write to the 5040-slot ring.  
11. **Project Coordinate:**  Compute  $Q\_{xy}$  geometry.  
12. **Render Visible State:**  Display in the browser/A-Frame.

##### Toy Example: Resolving a Disagreement

A disagreement regarding "Base36 creates state authority" is resolved through construction:

* **Boundary:**  Creating an OMI address for the Base36 projection layer.  
* **Rule:**  Declaring that symbols carry derived state, not authority (Rule 0x72).  
* **Test:**  A golden reject proving that a symbol change without a valid 128-bit frame fails validation.  
* **Replay:**  Verifying the transformation path within the 5040-slot ring.Agreement in OMI is the successful lowering of shared intelligence into validated structure. By routing disagreement into construction, the protocol ensures the preservation of intelligence across distributed nodes.**Minimal Canonical Statement:**   $$Q\_{frame}(S) \= 0 \\implies \\text{Agree}$$

