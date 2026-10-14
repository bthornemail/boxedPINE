# Glossary

One-line definitions. Covers terms used across these notes and in the repo.
Ordered; alphabetize when consolidating.

## A

- **admissibility** — the structure tier of the space (`shared/space.js`). A datum is either properly structured and flows through unchanged, or it is not and `enforce` throws a `CoordinateError` carrying a structured coordinate. Admissible: a number, an `ArrayBuffer`, a typed view of 8- or 16-bit cells, or an array of numbers. There is no third option; malformed structure is neither repaired nor measured.
- **agreement** — the state of two peers whose XOR is zero. Measurable rather than philosophical: `distance(A,B) = popcount(A XOR B)`, and distance 0 is agreement. Deliberately *not* a claim about truth — see **divergence** for what this does and does not establish.
- **alphabet (72)** — the user character seats: 20 numeric (10 digits × high/low) + 52 letter (26 × upper/lower), the signed base-36 doubling on the two orthogonal tangent axes of 0000.
- **algorithmic core** — `shared/algorithmic-core.js`; the one pure-function module (coordinate, subHi/subLo, fold, xorIndex, distance, is, placement, resolve, exchangeExpected) that the whole protocol resolves from; 16 self-checks, registered in `npm test` and `final-test.sh`.

- **adopt** — the act of taking a foreign vertex/seed into the local lattice; a route on the server (`/adopt`).
- **agent rod** — a live vertex in `/agent/world` that carries a face (BOOT0/BOOT1/SECURE/USER) and its XOR transistor form.
- **application space** — section 2 of the space (`shared/space.js`): slots `0x03`–`0x09`, the equation in the middle of the space. Odd arm `3, 5, 7, 9` against even arm `4, 6, 8`, walked over even indices `0, 2, 4, 6, 8` and odd indices `1, 3, 5, 7, 9`. Their XOR is the central inversion, and it is the gate: if the projections do not align, nothing compiles.
- **apply** — the second phase of the protocol; the 6T XOR realization; the operation that exchanges one value into the running state (BOOT1).
- **ASCII table** — 128 entries (0–127), each split into printable/control and mapped to the 8-slot ruler (slot = code % 8) and bands (1–4 via code % 4).

## B

- **band** — a `(code % 4) + 1` grouping of the ASCII table; 4 bands.
- **bind** — the first phase of the protocol; the 5T XOR realization; establishes a binding between two datum (BOOT0).
- **binding space** — section 1 of the space (`shared/space.js`): slots `0x00`–`0x02`, the 3-cycle `0, 2, 1` (`0→1→2→0`). The XOR of the three exchanges is the frame's own centre. The other two sections are the application space and the evaluation space.
- **blackboard pattern** — the shared-memory validation model: `Atomics.compareExchange` checks a shared seat — if the cell `is` the expected value, write the replacement; if it isn't, return what it actually is (the discrepancy). The only truth-check the protocol has.
- **compareExchange** — the one function the protocol is made of. `compareExchange(cell, expected, replacement)` returns `{ matched, now, discrepancy }`. On a request that does not match it does not throw and does not report an error: it leaves the cell alone and returns what was actually there, with the XOR as the discrepancy. **`xor ≠ 0` is the measurement, not a failure.**
- **path protocol** — the declarative layer (`shared/path-protocol.js`). X = data source, Y = data target, both anchored because cycles read in a sequence. Defines pathways and suggests shortcuts; never interprets, stores, renders, or chooses.
- **wordform** — a Regex-typed coordinate, `/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/`, e.g. `p0xn`. The endcaps are `[p]` and `[n]`, and `'p' ^ 'n' = 0x1E` (the SECURE face mask), which is not zero — so **a single wordform is an open half**. Two mirrored ones close: `p0xn ^ n0xp = 0`. This is why `Q` binds two. To `/0[pin]/` all four radices are closed pairs.
- **anchor** — a source or target pinned to a partition and a slot. Because computational cycles read in a sequence, the endpoints are anchors rather than free values.
- **partition** — one of four storage precisions: `0b`(2), `0o`(8), `0d`(10), `0x`(16), in ascending precision order. To `/0[pin]/` they are all the same thing (place-value indices, XOR-able), and `0b ^ 0o ^ 0x ^ 0d = 16` — the chiral-bridge coefficient.
- **read sequence / cycle** — the protocol's defined order: 4 partitions × 16 slots = 64 reads, partitions ascending then slots ascending. The order *is* the protocol; left to each agent they would disagree.
- **lift** — `44x²`, the structural gap between the projective form (60x²) and the affine form (16x²). `44 = 4 · 11`: the local seed times the residue that is not a perfect square. Constant for every Q-vs-local comparison; paired with the variable positional XOR distance, it gives the dual reading of any gap.
- **BQF** — the binary quadratic form `60x² + 16xy + 4y²`, defined and machine-checked in `/home/main/omi/omi-axioms/coq/03-projection/BQFBridgePreservesForms.v`. Its three terms have formal names: `bqf_high_shell` (60x²), `bqf_chiral_bridge` (16xy), `bqf_local_seed` (4y²). The 60 is *derived* — the two nibble diagonal sets `{0,5,10,15}` and `{3,6,9,12}` each XOR to 0 and each sum to 30, so 30+30=60. See [10-bqf-foundation.md](10-bqf-foundation.md).
- **bqf_decompose** — the proved factorization `bqf x y = 4(15x² + 4xy + y²) = 4[11x² + (2x+y)²]`, discharged in Coq by `nia`. The 11x² is the residue that is not a perfect square; (2x+y)² is the perfect square.
- **chiral bridge** — the `16xy` cross term of the BQF (`bqf_chiral_bridge`), i.e. the cross-measurement between two coordinates. It is the formal home of the read/write mode flip: `ChiralPhase` has `DPlusPhase`/`DMinusPhase` (the two readings), and `flipMode` is the transition between them. `phase_to_sign` maps them to ±1.
- **byzantine check** — quorum/signature verification between observer instances.

## C

- **C0 separator** — the four ASCII control characters 0x1C–0x1F repurposed as scope faces: BOOT0, BOOT1, SECURE, USER. They are the "why the fold is 0" constants.
- **canonical masks** — the 13 (soon 14) fixed byte masks; the invariant reference used by both the JS protocol and the C hardware reference.
- **clobber** — a repair that lost a race. `repair(a, b, report)` checks its exchange against the state the *report* observed, so a peer that moved between the read and the roll is reported as `clobbered: true` and the write is not overwritten. Checking against a fresh read would always succeed and would silently clobber — a real bug found by the self-test in `shared/peers.js`.
- **closure** — the property that XOR-ing the four face masks gives 0x0000; "0 is the only truth".
- **cone lattice** — the Steiner-triple cone geometry: vertices on a cone, edges are Steiner triples; the substrate of `/universe` and `/agent/world`.
- **CoordinateError** — the structured exception of the space (`shared/space.js`). Thrown when a datum is *not* properly structured. It is a real `Error`, so `catch` works and the stack survives, and it carries a proper structured coordinate (`x`, `y`, `pin`, `binding`, `application`, `evaluation`, plus byte offsets when a view was given) as data rather than folded into a string. Distinct from a value mismatch, which is measured and never thrown — see **admissibility** and **exchange**.
- **cross-version** — the guarantee that the Grok (`omi-walkthrough`) and this codebase (`omi-dom-stack`) agree on masks, XOR table, and transistor counts.

## D

- **declarative syntax** — `shared/declare.js`. It declares *arrangements, not meanings*: each line names peers and says which comparison to run, and nothing in it assigns a value to a point or an order to two edits. That is the user's, and the file declines to do it. A line that is not properly structured is refused with a `DeclarationError` carrying the 1-based line number; a line that merely disagrees is a reading, never a refusal. A number reads the same in all four radices — `0xF`, `0b1111`, `0o17`, `0d15`.
- **delta rolling law** — the fixed-point rotation applied to a word each epoch; `a ^ b ^ b == a`, i.e. XOR as its own inverse, so nothing is ever destroyed.
- **distance** — `popcount(a ^ b)` on the 16-bit word; the only metric the protocol tracks; `is` = distance == 0, the protocol's only truth.
- **digest** — the final phase of the protocol; the 10T XOR realization; folds the full stream into one word (USER).
- **dimension-pipeline** — the module that lifts a vector of words through spatial dimensions using XOR only. Interpretation: each dimension is the **dimension of the index** (the rank of one index), not a count of memory layers.
- **divergence** — the difference between two peer states, as magnitude and never as order. `shared/peers.js`. Because XOR is commutative (`a^b == b^a`) it cannot tell you which of two concurrent edits came first, so it is not a vector clock or a Lamport clock. What it gives instead: how far apart two states are, which bytes, and how to undo it, with no server and no clock.
- **exchangeExpected** — the pure model of `Atomics.compareExchange`: returns `{was, now, matched}` — swap if the cell `is` expected, else return what it actually is (the discrepancy); no write, no mutation.
- **foldWord** — the fold of the coordinate: `subHi(w) ^ subLo(w)`, collapsing the 16-bit word to an 8-bit reading; equal halves fold to the pinch 0x00.

## E

- **epoch** — the current tick of the substrate; every epoch broadcasts new rungs over SSE.
- **eval** — the third phase of the protocol; the 8T XOR realization; evaluates whether a binding holds (SECURE).
- **evaluation space** — section 3 of the space (`shared/space.js`): slots `0x11`–`0x13`. The two anchors `17, 19`, with `/pin/` = `18` between them. The old `bind` anchored index 17 in both views and returned a two-element window.

## F

- **face** — one of the four scope faces (BOOT0/BOOT1/SECURE/USER), each a mask, a role, a transistor count, and a wiki chapter.
- **Fano plane** — the 7-point/7-line finite projective plane of order 2; the smallest complete Steiner system; the lattice of exactly-3 edges. The 7 points are the non-zero 3-bit words; point 0 (000) is the origin.
- **final-test.sh** — the repo gate: server syntax, all selfTests, HTTP route checks, cross-version run.
- **flipMode** — the swap between the two readings of the 8-slot space (read↔write); a pure endianness/chirality: same slot, other frame name, no movement. Involution.
- **fold** — XOR-ing through a mask; the inverse of unfold (same operation, XOR is its own inverse); the running state aspiration is 0x0000.

## H

- **hit:list** — a list of positions. A **hit** in it is a **swap** (the cell comes out); a **miss** passes through unchanged (`op: 'pass'`) — the reported discrepancy. `intersect(a,b)` gives the shared positions; each shared cell is one swap. The same exchange primitive as `exchangeExpected`, reached from the direction side.
- **Hamming distance** — `popcount(a ^ b)`: the count of differing bits between two datum. The single metric the protocol tracks; XOR gives it directly. The 3-bit Fano-plane distances measure to {1:9 pairs, 2:9, 3:3} (max 3, not 2).
- **high/low seats** — the two orthogonal tangent axes at the pinch: numbers (0–9) each get a high and a low seat (20); letters each get an uppercase-high and lowercase-low seat (52). Total 72.

## G

- **genesis** — the invariant seed subgraph from which all epochs reconstruct; `/genesis`, `/genesis-fold` routes.

## H

- **hardware-ref** — the C (and Verilog) reference implementation; compiled only by `final-test.sh`; 19 vectors.

## I

- **index** — an integer offset into any indexable shared target (Buffer, Array, String); 0p and 0n are indices, anchored at `Buffer.offset(0)`, XORed like a Latin square.
- **invariant** — a property that cannot change without breaking the protocol: the masks, the fold = 0, the XOR truth table, the bounds.
- **inter-instance** — agreement/witness/observer/byzantine/worker-barrier checks between separate server instances.

## L

- **lattice** — the graph of vertices and Steiner-triple edges; what the walkthrough and agent world render.

## M

- **mask** — a fixed byte XORed against words; each of the 13 canonical masks partitions 256 bytes into 8 groups of 32.
- **meta-compile** — `wiki/meta-compile.js`; the deterministic validator/compiler of the wiki chapters.
- **module list** — the 19 named modules hard-coded in `package.json` `test`; the canonical self-test roster.

## N

- **network-versions** — the live cross-origin test between `:8742` and the Grok app `:8080`; asserts transistor counts (5/6/8/10) and the XOR truth table.

## O

- **observer** — an outside watcher instance; the "person, place, or thing that selects the pair of active 3! of any 3!".
- **OMO** — "Ordo Mundus Omicron" (order + world + the glyph glyph); the same reduction as IMO called from the other side.
- **IMPORTANT (IMO)** — "Iter Mater Ordo" (way, matter, order): the transmutation that a stream (the way) of matter (bytes) passes through to find its order.
- **order** — the third of IMO/OMO: the fold 0x0000 the whole protocol cycles toward.
- **outlier** — the peer not in the majority, identified by `fold3` in `shared/peers.js`. With three peers holding two distinct values, the value held by two is the majority and the third peer is the outlier; the residue equals the outlier's value. With three distinct values there is no majority, so the outlier is undefined and `reconcile3` refuses rather than picking a winner.

## P

- **/pin/** — the observer reference, index `18`, the point *between* the two evaluation anchors `17, 19`. Written as the whatever observer reference that can XOR the points `0p`, `0i`, `0n`; reading is a fold, not a sum (`p ^ i ^ n`), and because XOR is self-inverse a pin also recovers any one point from the other two. The six slots `0x0A`–`0x0F` bind to a source or a sink and read back on `/pin/`.
- **0p / 0n atoms** — place-value scalars: *integers — indices* into the shared indexable target (Buffer/Array/String), anchored at `Buffer.offset(0)`, XORed like a Latin square. Every **wordform** carries both (0n, 0p): 0n = number/value, 0p = position/location; together their ratio `0n/0p` (or the inverse) is the direction/slope of that wordform in the (0p,0n) plane. Not a stored value, computed. The two axes are orthogonal and compose Pythagorean-wise (`d_p² + d_n² = d²`).
- **parity** — `(byte ^ mask) >> 5`: a 3-bit extraction (0–7) giving octants; each mask maps 256 bytes into 8 groups of 32 bytes.
- **placement** — `foldWord(w) % 8` → one of the 8 ruler slots. One space, two modes: **read** scopes it `local` (slots 0–1) / `global` (2–7) like a regex; **write** places it `spectral` (0–1) / `spatial` (2–7) like a panner node. Never both at once; `flipMode` swaps the reading.
- **place-value** — the positional model: what matters is where a glyph sits in the frame, not the sign-value of a number; interpretation is left to users.
- **pipeline** — the transmission chain: rung → (bind/apply/eval/digest) → folded word; `pattern-pipeline.js` is the main entry.
- **pinch point** — the 0x00000000 point at which projective geometry of BCD (and branch point of binary) collapses; the zero-fold.
- **popcount** — population count: the number of set bits; converts XOR into Hamming distance.
- **port** — a bound word/address; ports XOR against each other to reveal the discrepancy between two datum.

## R

- **reconcile3** — bring three peers to agreement by rolling every outlier to the majority value through its own sanctioned `applyCas` gate, so the witness advances and a legitimate repair is never mistaken for a tamper. Takes the report the user was shown and reports a clobber rather than overwriting a peer that moved in between. Returns `stalled: true` when there is no majority to roll toward.
- **residue** — the XOR of all three peer values, `a ^ b ^ c`, in `shared/peers.js`. It is **not** the agreement test: three copies of `x` fold to `x`, not zero, because three is odd. Agreement is measured pairwise. What the residue *is* good for is naming the dissenter — if two peers agree and one does not, the residue is exactly the outlier's value, so one XOR identifies who diverged with no vote, no quorum and nothing to elect.
- **ruler** — the 16-bit coordinate ruler; `ruler.js` = the protocol core (bind/apply/eval/digest + bind symmetry, apply compareExchange semantics, eval extraction, digest F-mean + XOR fold, iff, XOR ruler identity/involution).
- **rung** — one step of the ladder: `{rung, mask, state, parity}`; the SSE stream steps through 13 rungs repeatedly.
- **run-GNN / spatial-gnn** — the spatial graph-neural pass over the Steiner cone.

## S

- **SEED** — the substrate's deterministic seed; state reconstructs from seed + epoch, no clock needed.
- **selfTest** — every module in `shared/` exports `selfTest()` returning `{passed,total,failed,results}`.
- **sign-value** — the (rejected) model: data as numbers carrying sign + magnitude; the goal is to move computing away from this toward place-value.
- **solid** — a named geometry (3!/6 ordering) in the solids toolkit; `solid-toolkit.js`, `solid-toolkit-extended.js`, `solid-to-triple.js`.
- **span / scope** — the four faces; also "scope markers" 44,100 (master) and 33,600 (derived) in the transistor circuit.
- **Steiner triple** — an exactly-3-edge set; the Fano plane is the minimal complete Steiner system; the cone lattice is built from them.
- **substrate** — the one no-mutation source of truth epoch store; `/api/substrate`.
- **swap16 / swap32 / swap64** — the three scripted movements across the Latin-square swap space; each is a pure self-involution (`swap∘swap = id`) and each *is* a wordform: swap16 keeps the fold (2! local diagonal), swap32 pivots pairs, swap64 pivots 4-blocks.

## T

- **tamper evidence** — a consequence of state being a single word. A peer keeps the XOR-fold of everything it has published; an honest write advances the fold, a write from behind the peer's back does not, so the two disagree and the tampering shows. Not a security primitive — a free consequence of the representation.
- **tier 1 / tier 2 (the two tiers)** — the protocol's only two error behaviours, and the line between them is **whether the question was well posed**, not whether the caller likes the answer. *Tier 1, value:* a well-formed request that disagrees — `rebase('0x',16,'0d')` answering `10` vs `16`, a non-closing `Q` pair, `pin(0x10,...)` answering `inRange: false`. These are readings: reported, measured, never refused. *Tier 2, structure:* a request with no answer at all — `partitionByName('0q')` (only four partitions exist), `cycleIndex('0x',16)` (the slot space ends at `0xF`), `compareExchange('a',1,2)` (that is not a cell). These throw `CoordinateError` carrying `.coordinate`. A disagreement is not a rejection; a reference to nothing is not a reading.
- **transistor XOR** — the 5T/6T/8T/10T real-world XOR gates (Cody Wabiszewski breadboards) each face is named after.
- **transmutation** — the lossless transformation proof (`test/transmute.test.js`): audio/video bytes transmute through worker threads and are proven lossless.

## U

- **unfold** — XOR-ing back through a mask; identical to fold because XOR is its own inverse.

## W

- **witness** — the verifiable statement an instance emits about a binding (`/api/witness`, `witness-exchange.js`).
- **wordform** — a token pairing `(0n, 0p)` (number/value and position/location), both integer indices into the shared target. The pair's ratio `0n/0p` is its direction/slope. Comparing two wordforms gives `(d_p, d_n)` along the orthogonal axes and the Pythagorean total `d = sqrt(d_p² + d_n²)`; that distance is itself a wordform `(d_n, d_p)` — the algebra is closed. Also see the scripted movement under `swap16/32/64`.
- **world** — `/agent/world`: the live agent space where four rods (faces) sit on the cone lattice and the fold stays 0x0000.

## X

- **XOR** — exclusive-or; the *only* operation in the protocol; commutative, associative, self-inverse: `a ^ b ^ b == a`.
- **XOR law** — the truth table 0^0=0, 0^1=1, 1^0=1, 1^1=0; used as the cross-version agreement test. 

## Z

- **zero-fold / pinch** — 0x0000 (word) / 0x00000000 (pinch); the point every fold converges to; "0 is the only truth".
- **4!!!** — the fantasy number to dodge.