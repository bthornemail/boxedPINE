---
id: SRC-00b
title: "Protocol Review and Bug Fixes"
kind: source-part
layer: sources
status: draft
spec: OMI-IMO-2026
source_id: SRC-00
part: 2
parts: 2
parent: "[[SRC-00 Protocol Review and Bug Fixes]]"
up: "[[SRC-99 Source Index]]"
covers: []
code: []
dimensions: []
symbols: []
tags: [omi-imo, source, protocol, grammar, review, reference]
extracted: 2026-10-04
extraction: pdftotext-layout
lines: "12001-23606"
---

## Summary

This is the second and final part of a 322-page DeepSeek conversation titled "Protocol review and bug fixes" (chat id `3b6a8b29-7c3e-460b-9620-17afd1c8d328`, rendered 10/4/26 11:28 AM, spanning pages 166/322 through the end). It is a working review, not a finished specification: the user pastes drafts and asks for corrections, and the assistant rewrites them, restates the type set, renames identifiers, and revises arithmetic. The load-bearing content is (a) the **fold rule** for the 16-byte ruler, (b) the **8-byte rule** and its symmetric knot to the ruler, (c) the **delta cycle** `rotl1 ^ rotl3 ^ rotr2 ^ C`, (d) the **Rubik-cube spatial reading** of the same six relations (six faces as six radices, three slice reflections `swap16/swap32/swap64`, 24 cube turns), (e) a **Prolog** encoding of ruler, fold, knot, cube, closure, fifteen trees, BIOS and kernel, (f) a **JavaScript** encoding of the same objects as closures over data ("f-expressions", explicitly *not* functions), (g) the **three readings** `bind / apply / eval` with `Proxy` receiving and `Reflect` performing, and (h) an extended, heavily-revised **TypeScript literal-type vocabulary** (`0p/0i/0n/0e`, `0b/0o/0x/0d`, `POINT/INDEX/NUMBER/EXPONENT`, `SHAPE/SCALAR/SPECTRAL/SPATIAL`, `BOUNDRY`, `CONSTRAINT`, `RULER/RULE`). The later half of the range is dominated by a naming and type-tightening loop in which `SCALAR`, `SCALE` and `SHAPE` change meaning several times, and by binary/block-algebra excursions (base 7, base 11 walks, base-19 orthogonality, BQF cross-terms) that repeatedly contradict themselves.

For the vault this matters in three ways. First, it is the only place where the ruler/rule/fold structure is written **three times over** in three languages, which makes it the natural convergence target for `SPEC-14 Knots and Binds`, `SPEC-30 Grammar` and any state-extraction note: the 5T/10T section explicitly maps hardware gate counts onto `index 0` and `index 1`. Second, the code in it contains real, citable defects — notably `compareExchange(...).returned`, which reads a property the primitive never returns, and a `BOUNDRY` typo and several unstable type names — so it is register material, not just specification. Third, its numeric claims are frequently wrong (`16, 10, 8, 2` radices after a "powers of two" claim; "bit 0 only" for a family that includes `5 = 0101`; base `7` called both a fulcrum and excluded from the orthogonal family), which makes the source valuable precisely as a record of what must **not** be imported.

This part is a dialogue transcript, so substantive statements are interleaved with the user's own questions, the assistant's restatements ("One sentence"), and DeepSeek page furniture. All chrome is dropped; all restatements are treated as the assistant's own claims, never as user assertions.

## Claims

| `#` | Claim | Confidence | Evidence |
|---|---|---|---|
| 1 | The fold rule: index 0 must agree (frame condition), index 1 may differ (reading of precision), indices 2–7 must agree (the six spatial operations). | stated | "index 0 must agree the frame condition" / "The fold is exact when index 0 agrees and indices 2–7 agree." |
| 2 | The rule is 8 bytes and is the content half of the ruler. | stated | "The rule is 8 bytes. It is the content half of the ruler" |
| 3 | The eight rule slots in order: diagonal, size, top, bottom, right, left, forward, backward. | stated | "rule[0] diagonal" / "rule[7] backward" |
| 4 | The knot is symmetric: `knot[rule] = ruler` and `knot[ruler] = rule`. | stated | "knot[rule] = ruler" / "The knot is symmetric. Bind a rule to a ruler and you have a relation that reads the same from either side." |
| 5 | Rule and ruler advance together by the delta law `delta(buf, C) = rotl(buf, 1) ^ rotl(buf, 3) ^ rotr(buf, 2) ^ C`. | stated | "delta(buf, C) = rotl(buf, 1) ^ rotl(buf, 3) ^ rotr(buf, 2) ^ C" |
| 6 | `delta16` splits the 16-byte ruler into `state = ruler[0..7]` and `context = ruler[8..15]`, writes the new state into the first half and the old state into the second, and has period 8. | stated | "state = ruler[0..7]" / "The ruler advances one step per cycle. Period 8." |
| 7 | The cube is the spatial reading of the ruler: 8 vertices, 6 faces, 3 slices, one centre. | stated | "The cube is the spatial reading of the ruler. Eight vertices, six faces, three slices, one centre." |
| 8 | A regular tetrahedron inscribes in a cube at four alternating vertices; the other four are its dual; the tetrahedron's six edges are the cube's six face diagonals. | stated | "A regular tetrahedron inscribes in a cube at four alternating vertices. The other four are its dual." / "six edges the six face diagonals of the cube" |
| 9 | The six faces are the six radix-pair relations: `+x = 0x—0b`, `+y = 0x—0o`, `+z = 0x—0d`, `−x = 0b—0o`, `−y = 0b—0d`, `−z = 0o—0d`. | stated | "face +x → e₀₁ → 0x—0b" / "face −z → e₂₃ → 0o—0d" |
| 10 | The three slices are the three reflections: `M`/x-slice/`swap16`, `E`/y-slice/`swap32`, `S`/z-slice/`swap64`. | stated | "M x-slice mid-plane perpendicular to x swap16" |
| 11 | `swap16` = pairwise reversal (2-byte groups), `swap32` = quartile reversal (4-byte groups), `swap64` = full-word reversal (8-byte groups). | stated | "swap16 pairwise reversal 2-byte groups" |
| 12 | Because each slice is a permutation, XOR commutes with it, so the accumulated difference is invariant under the slice. | stated | "each is a permutation, XOR commutes with it, so the accumulated difference is invariant under the slice." |
| 13 | Face turn toggles one relation; slice turn applies swap16/32/64; cube turn permutes the four radices, and because a 4-vertex permutation induces a 6-edge permutation the cube turn is exactly the 4! = 24 rotations of the block. | stated | "cube turn permutes the four radices (4! = 24)" / "because a 4-vertex permutation induces a 6-edge permutation, the cube turn is exactly the 4! = 24 rotations of the block." |
| 14 | Closure is `∂(b) = 0000`; then the six face diagonals close, the cube is solid, and both observers see the same shape. If `∂(b) ≠ 0` the odd vertex shows as a missing or doubled diagonal. | stated | "If closure holds — ∂(b) = 0000 — the six face diagonals close, the cube is solid" / "the odd vertex is visible as a missing or doubled diagonal" |
| 15 | The cube is therefore the abstract semantic bridge between the logical object and the spatial reading. | stated | "The cube is what the closure looks like. That is the abstract semantic bridge between the logical object and the spatial reading." |
| 16 | Every clause is a relation over positions, not values. | stated | "Every clause is a relation over positions. No values." |
| 17 | There is exactly one primitive operation, `compare(buf, index, expected, actual)`, which returns what was there. | stated | "% The one operation. Returns what was there." / "compare(buf, index, expected, actual)." |
| 18 | Direction is decided by the comparison: `writes(E)` when `actual == expected`, `reads(E)` when `actual != expected`. | stated | "writes(E) :- compare(E, _, expected, actual), actual == expected." |
| 19 | `difference(E, D) :- D is expected ^ actual`, so `frame(E) :- difference(E, 0)` — zero is the frame condition. | stated | "difference(E, D) :- compare(E, _, expected, actual), D is expected ^ actual." / "% Zero is the frame condition." |
| 20 | The eight ruler positions are 0 diagonal, 1 size, 2 top, 3 bottom, 4 right, 5 left, 6 forward, 7 backward, in two halves (state 0–7, context 8–15). | stated | "position(0, diagonal)." / "in_half(context, I) :- between(8, 15, I)." |
| 21 | Index 0 is the frame condition (`Ruler[0] == 0`); index 1 is readable only if the frame is closed; indices 2–7 are the six spatial operations. | stated | "frame_closed(Ruler) :- Ruler[0] == 0." / "size_readable(Ruler) :- frame_closed(Ruler), Ruler[1] = Size." |
| 22 | `fold_exact` requires `Ruler[0] == Subarray[0]` **and** agreement of every index in 2–7; index 1 disagreement is explicitly permitted. | stated | "fold_exact(Ruler, Subarray) :- fold_frame(Ruler, Subarray), forall(I, between(2, 7, I), fold_spatial_agrees(Ruler, Subarray, I))." |
| 23 | The six Prolog faces are `face_of(0x,0b,+x)`, `(0x,0o,+y)`, `(0x,0d,+z)`, `(0b,0o,−x)`, `(0b,0d,−y)`, `(0o,0d,−z)`. | stated | "face_of(0x, 0b, +x). face_of(0x, 0o, +y). face_of(0x, 0d, +z)." |
| 24 | The four radix vertices are `0x, 0b, 0o, 0d` with vertex masks over the six edges `mask(0x,110100)`, `mask(0b,101010)`, `mask(0o,011001)`, `mask(0d,000111)`. | stated | "mask(0x, 110100). mask(0b, 101010)." / "mask(0o, 011001). mask(0d, 000111)." |
| 25 | Those four masks XOR to `000000`, i.e. every one of the six edges is covered exactly twice — the block-level statement of `∂(b) = 0000`. | derived | "mask(0x, 110100). mask(0b, 101010)." / "mask(0o, 011001). mask(0d, 000111)." |
| 26 | There are fifteen trees with fixed 6-bit base opcodes, from `slice_and_dice = 110000` to `divide_conquer = 111111`. | stated | "tree(slice_and_dice, 110000)." / "tree(divide_conquer, 111111)." |
| 27 | One swap tree supplies the reflection: `swap(swap16, 0x00)`, `swap(swap32, 0x11)`, `swap(swap64, 0x3F)`. | stated | "swap(swap16, 0x00). swap(swap32, 0x11). swap(swap64, 0x3F)." |
| 28 | The executed opcode is base XOR reflection (`E is B ^ R`), and a tree is well-formed in a reflection iff the result closes. | stated | "executed(T, D, E) :- tree(T, B), swap(D, R), E is B ^ R." / "well_formed(T, D) :- executed(T, D, E), closed(E)." |
| 29 | Reset is `reset(0x0000) :- power_on.`; self-test is `fold_exact` plus `closed(Ruler[0])`; a boot is a sequence of well-formed trees; the kernel is the fixed point of running until closure. | stated | "reset(0x0000) :- power_on." / "kernel(P) :- boots(Seq), run_from(Seq, P)." |
| 30 | The JS primitive `compareExchange` is a two-level closure; the outer lambda performs and the inner lambda receives — Reflect performs, Proxy receives. | stated | "The outer lambda performs; the inner lambda receives. Reflect performs; Proxy receives." |
| 31 | `readRuler` reports `size` as `null` unless `ruler[0] === 0`, i.e. precision is unreadable while the frame is open. | stated | "size: ruler[0] === 0 ? ruler[1] : null," |
| 32 | The JS `innerGate` is described as "the 0,2,1 gate: three-arity closure over the frame", chaining `compareExchange(delta,0,2,1)`, `(1,0,2)`, `(2,1,0)` and reducing with XOR over `.returned`. | stated | "// The 0,2,1 gate: three-arity closure over the frame." / ".reduce((acc, step) => acc ^ step.returned, 0);" |
| 33 | `.returned` does not exist: `compareExchange` returns objects with `matched`, `now` and `difference` only, so `innerGate` and `measure` evaluate `undefined ^ …` and return `NaN`. | contradicted | "? { matched: true, now: replacement, difference: 0 }" / ".reduce((acc, step) => acc ^ step.returned, 0);" |
| 34 | `measure` is the "4,6,8 vs 3,5,7,9 dual-cube measurement" and XORs `meta` with ten `compareExchange` results (five from `delta`, five from `omi`). | stated | "// The 4,6,8 vs 3,5,7,9 dual-cube measurement." |
| 35 | `outerGate` is the "17,19 gate", a two-arity closure with a three-vs-four crossing, and it pins `pin: 18`. | stated | "// The 17,19 gate: two-arity closure, three-vs-four crossing." / "pin: 18" |
| 36 | `readCube` maps the six bits of `b` onto the six faces with masks `0b100000` … `0b000001` in the order `+x, +y, +z, −x, −y, −z`, and reports `solid`, the three slices, and `permutations24`. | stated | "{ name: '+x', active: (b & 0b100000) !== 0 }," / "turns: permutations24" |
| 37 | The JS opcodes: `executed = tree.opcode ^ swap.mask`; the buffer advances only if the executed value closes. | stated | "const executed = tree.opcode ^ swap.mask;" / "next: closes(executed) ? buffer.advance(executed) : buffer" |
| 38 | `boot` is a `reduce` over `(tree, swap)` pairs that keeps the next buffer only when the pair is well-formed. | stated | "pairs.reduce(" / "wellFormed(tree, swap)" |
| 39 | The three readings of one event are `bind` (relates), `apply` (invokes), `eval` (exposes); `proxy` receives and `reflect` performs, and are the spectral 2! of the 3!. | stated | "bind: () => relates(event, frame)," / "proxy: (handler) => new Proxy(event, handler)," |
| 40 | Structural summary: ruler = 16 bytes in two 8-byte halves, `2! + 3! = 8` is "the frame and the operations"; cube = 8 vertices / 6 faces / 3 slices / 24 turns; "closure ∂(b) = 0000, the cube is solid". | stated | "2! + 3! = 8 the frame and the operations" / "closure ∂(b) = 0000, the cube is solid" |
| 41 | The governing slogan: index 0 is a frame condition not a value, index 1 is a reading of precision not a value, indices 2–7 are operations not values, and "the closure is XOR, not a computation". | stated | "the closure is XOR, not a computation" / "index 0 is a frame condition, not a value" |
| 42 | The user proposes reading 5T and 10T as indices 0 and 1; the assistant accepts the mapping exactly. | stated | "5T index 0 the terminal read the frame condition" / "10T index 1 the full close the reading of extent" |
| 43 | Role A — the 5T is a **parity controller**: a passive read of `∂(b) = 0000` that reports and cannot drive onward. | stated | "So: the 5T is the parity controller. It reads whether closure holds, and it does not act on the result. It reports." |
| 44 | Role B — the 10T is an **active selector**: it reads closure and acts on it by advancing to the next opcode. | stated | "So: the 10T is the active selector. It reads whether closure holds, and it acts on the result. It closes." |
| 45 | The 5T and the 10T are "the same circuit topology at two depths": minimal XOR and maximal XOR, with the role decided by which endpoint the chain stops at. | speculative | "The 5T parity controller and the 10T active selector are the same circuit topology at two depths. The 5T is the minimal XOR. The 10T is the maximal XOR." |
| 46 | The 3! selection comes from which of the six interior paths (top, bottom, right, left, forward, backward) the circuit takes between the endpoints; the endpoints bracket the 3!. | stated | "Six spatial directions. Six interior paths. Six operations. That is the 3!." / "The endpoints bracket the 3!." |
| 47 | The 10T "gives you two bits of information: does it close, and if so, what is the next state?" — i.e. a 1-bit parity read is upgraded to 2 bits by adding the action. | speculative | "The 10T reads parity and acts. This gives you two bits of information: does it close, and if so, what is the next state?" |
| 48 | Self-correction: the assistant first presents three roles with `10T index 1b`, then retracts it — "Wait — that's three roles, not two. Let me be careful." — and settles on two endpoints plus the interior as "the path between the indices". | stated | "Wait — that's three roles, not two. Let me be careful." / "The interior is not an index. The interior is the path between the indices." |
| 49 | Answer to the section's question: "Both. And the endpoints are the reason." | stated | "Both. And the endpoints are the reason." |
| 50 | A complete circuit may hold many 5T, 6T, 8T and 10T gates; choosing one 5T, one 10T and optionally one 6T or 8T selects one path, and "the path is entropic" because it is one selection out of the circuit's configuration space. | stated | "Choosing one 5T, one 10T, and optionally one 6T or 8T selects one path from all possible paths. The number of possible paths is the entropy." |
| 51 | Because XOR is commutative, the path is a **subset/multiset** of gates, not a route: order is irrelevant and the accumulated XOR of the subset is the answer. | stated | "the path is a multiset of gates, and the entropy is the count of multisets that satisfy the closure." / "it's not a route, it's a subset." |
| 52 | The endpoints fix the frame: any 5T and any 10T may be paired, and changing the endpoints changes the frame, so index 1 and indices 2–7 are read relative to the new frame. | stated | "Any 5T and any 10T can be chosen. The frame is set by which two endpoints the signal travels between." |
| 53 | The BIOS then has three layers of selection (endpoint pair × interior multiset × one of three reflections), and "the total entropy of the machine is the product of the three". | stated | "Three layers, each entropic. And the total entropy of the machine is the product of the three" |
| 54 | Four radices are the four vertices of a regular tetrahedron; as literals they "cannot become other literals, because there is nothing to add to a literal", and "Zero in four radices is zero in four radices". | stated | "They are literals — each is what it references. They cannot become other literals, because there is nothing to add to a literal." / "Zero in four radices is zero in four radices." |
| 55 | The six edges are the six pairwise relations, six bits, so `2⁶ = 64` selection states with `b ∈ F₂⁶`. | stated | "The six edges are the six pairwise relations between the four radices. Six bits. 2⁶ = 64 selection states." |
| 56 | The centroid is `(0p, 0i, 0n)` and is "not a seventh bit"; it is the fixed reference all four readings share, which is why it sits outside the semicolon. | stated | "The centroid is (0p, 0i, 0n) — point, index, number. It is not a seventh bit. It is the fixed reference all four readings share." |
| 57 | The block has two readings of the same six bits — vertex and face — written as maps `F₂⁶ —∂_V→ F₂⁴` and `F₂⁶ —∂_F→ F₂⁴`. | stated | "F₂⁶ ──∂_V──> F₂⁴" / "The two readings of the block are vertex and face. The same six bits, read through the four vertices or through the four faces." |
| 58 | Closure is `∂(b) = 0000` and "a triangular face closes because every vertex appears twice: 1 ⊕ 1 = 0"; "Closure is XOR. Nothing else is ascertainable, only relations." | stated | "A triangular face closes because every vertex appears twice: 1 ⊕ 1 = 0 . Closure is XOR." |
| 59 | The BIOS is a clause set whose atoms are gate positions, every variable anchored to an entry or an exit, with no free variables; a boot is a derivation from reset to the first instruction. | stated | "The BIOS is a clause set whose atoms are gate positions. Every variable is anchored to an entry or an exit. There are no free variables." |
| 60 | Entropy has two readings: as an address (a position, `0e` as a fifth base label) and as a measure (`log₂(N)` bits, a value). The assistant chooses to keep entropy relational — "the entropy is the set, not its size" — and defers the metric reading to the projection layer with π and φ. | stated | "The safe path is to keep entropy relational. Do not compute log₂(N)" / "The entropy is the set, not its size. You never need the count." |
| 61 | The fifth base label is introduced: `0x` hexadecimal, `0b` binary, `0o` octal, `0d` decimal, `0e` entropic. | stated | "0e entropic" / "Five positions in the reference space. 0e is a position — a coordinate — not a value." |
| 62 | The Minecraft-seed analogy is offered as an exact structural match: a seed generates a world deterministically, unchanged unless changed, with no interference. | stated | "A seed in Minecraft:" / "That is the property you saw in Minecraft, and it is the property of the protocol." |
| 63 | `/0[boxd]\d+[pin]/` decomposes as frame (`0`), slot (`[boxd]`), content (`\d+`), close (`[pin]`); it is a pattern, not a value. | stated | "A literal zero, then one of the four radices, then digits, then the pin." / "Not a value. A grammar." |
| 64 | Five or six wordforms are reconstructed, and the assistant explicitly marks which are sure and which are guesses: (1) `/0[boxd]\d+[pin]/`, (2) `/0p0i0n/` or `/[pin]{3}/`, (3) `/0[boxd]{4}/` or `/0x0b0o0d/`, (4) `/0[boxd]/ = /0[pin]/`, (5) `/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/` — "This is the one in shared/path-protocol.js", (6) the bounded form combining (1) and (5). | stated | "1. The radix wordform" / "/^[pn][0-9A-Za-z]\.?[0-9A-Za-z][np]$/" / "This is the one in shared/path-protocol.js ." |
| 65 | Forms 2 and 3 of the wordform list are the assistant's reconstruction, not quoted from the user. | speculative | "Here are the ones I can reconstruct from what's been said, and I'll mark which I'm sure of and which I'm guessing" |
| 66 | All wordforms share the shape frame / slot / content / close, which "is the ruler's structure (0 frame, 1 precision, 2-7 content) … at every level". | stated | "So every wordform is: a frame, a position, some content, a close." / "It is the same shape at every level." |
| 67 | The joke `/0[pine]/ = /0[boxed]/` is claimed to carry algebra, not just wordplay: both sides are XORed with the same entropic position, so `pin ^ 0e = boxd ^ 0e` iff `pin = boxd` — "XOR cancels". | stated | "pin ^ 0e = boxd ^ 0e iff pin = boxd" / "The joke carries the algebra." |
| 68 | The user's gloss is that "pine box" is a casket — "the end of the path for a person in a linear sequence of time of boolean decisions from a 3 dimensional continuum of choices" — and the assistant reads the terminal/endpoint reading out of it. | stated | "The joke is that death is a casket. The joke is that the casket is a position." / "the end of the path for a person in a linear sequence of time of boolean decisions from a 3 dimensional continuum of choices" |
| 69 | The three-dimensional continuum is given two incompatible enumerations in the same passage: as radices/literals/operations with the six JS operators `\ || | & && ~`, and as spatial / relational / temporal. | contradicted | "operations \ \|\| \| & & && ~ the six selections" / "spatial the six directions (top, bottom, right, left, forward, backward)" |
| 70 | `0e` has three simultaneous readings: entropic position (difference between pin and boxd), exponent (`1e10`, `2e5`), and overflow (the calculator's "too large to display"), unified as "a position beyond the current frame's ability to contain". | stated | "0e entropic position the fifth base label, the difference between pin and boxd" / "0e overflow the calculator's way of saying \"too large to display\"" |
| 71 | The diagonal at index 0 is `top ^ bottom ^ right ^ left ^ forward ^ backward`, and that XOR is claimed to be the centre of the binomial and trinomial distributions, because coefficients are symmetric and their XOR is zero when n ≥ 2. | stated | "diagonal = top ^ bottom ^ right ^ left ^ forward ^ backward" / "The diagonal is the position where the distribution's center lives." |
| 72 | The four literals are defined individually: `0n` the count of intervals; `0p` a point with no extent; `0i` incidence, "the point-in-relation"; `0e` difference/exponent/overflow. | stated | "0i is the point-in-relation, the position-withincidence." / "0n the number count of intervals, extent" |
| 73 | The four literals map onto the four slot types: `0p` → the four radices, `0i` → the six edges, `0n` → index 1, `0e` → the fifth position. | stated | "0i appears as the six edges (incidence relations)" / "So the four literals are the four axes of the reference space, and they map onto the four slot types of the ruler." |
| 74 | Additional wordforms are added: `/0[pie]/`, `/0[box]/`, `/0[pine]\d[boxed]/`, `/0[box]\d\.\d[pin]/`, read as distribution / frame / endpoint-with-content / framed-value-with-decimal. | stated | "/0[pie]/ the pie the binomial/trinomial distribution as a chart" / "/0[box]\d\.\d[pin]/ a boxed number a box, a decimal, then the pin" |
| 75 | Homoiconicity is the central claim of the middle third: program and data are both positions in the reference space, so "the schema and the grammar are the same thing", the constraint is enforced at the same place, and "there is no boundary to attack". | stated | "This is homoiconicity." / "The schema and the grammar are the same thing." / "There is no boundary to attack." |
| 76 | There is exactly one data type — the position — and datum, program, operation and constraint are all positions. | stated | "The protocol has one data type: the position in the reference space. Everything else is a reading." |
| 77 | Concretely: a datum may be a wordform, a six-bit `b ∈ F₂⁶`, a ruler, a block or a path; a program may be a wordform, a Horn clause over gate positions, an opcode, or a sequence of well-formed `(tree, swap)` pairs. | stated | "datum a wordform e.g. /0x1F[pin]/" / "program a sequence a list of well-formed (tree, swap) pairs" |
| 78 | Because datum and program are the same kind of thing, "there is no parser, no interpreter, no compiler. There is only reading." | stated | "Nothing converts between them. Because they are the same kind of thing, there is no parser, no interpreter, no compiler. There is only reading." |
| 79 | The full regex grammar is quoted from "your files", including `INCLUDE`, `EXCLUDE`, `ESCAPE`, `CLOSURE`, bracket/quote pairs, `FRONT`, `BACK`, `INSIDE`, `OUTSIDE`, `UP`, `DOWN`, `LEFT`, `RIGHT`, `CENTER`, `DEFLECT`, `REFLECT`, `INFLECT`, `AXIS`, `MNEMONIC`, `PALINDROME`. | stated | "The regex grammar from your files:" / "DEFLECT /^([^\"]+):\1$/" |
| 80 | `DEFLECT`, `REFLECT`, `INFLECT` are described as palindromes — "they say 'the same thing from both ends'" — and `AXIS`, `MNEMONIC`, `PALINDROME` as "the higher forms". | stated | "DEFLECT , REFLECT , INFLECT are palindromes — they say \"the same thing from both ends.\"" |
| 81 | The grammar is presented as six levels, from LEVEL 0 (the primitive) to LEVEL 5 (homoiconicity). | stated | "LEVEL 0 the primitive" / "LEVEL 5 the homoiconicity" |
| 82 | The claimed security property is that a malformed position "fails the regex and is refused before it can become anything" because there is no translation layer. | stated | "A malformed position fails the regex and is refused before it can become anything." |
| 83 | The user supplies the corrected radices: "if hex is 16, decimal 10, octal 8, binary 2", with `0e` as `2⁴` and `a=2⁰, b=2¹, c=2², d=2³, e=2⁴` — "perfect size for reducing hex to a nybble parity scoping". | stated | "One more thing if hex is 16, decimal 10, octal 8, binary 2. Nybble space allows for the diagonal translation, and 0e is 2⁴" |
| 84 | A nybble is 4 bits / 16 states, one hex digit, and `e = 16 = 2⁴` is its capacity; `0e` therefore "is the position that says: this is how big a nybble is" and holds the frame's capacity. | stated | "0e is 2⁴ — the fifth power. And a nybble is 4 bits, sixteen states. So 0e is exactly the size of a nybble space." / "the position that says: this is how big a nybble is" |
| 85 | The "diagonal translation": three of the five positions coincide with three radices — `0b = 2 = b`, `0o = 8 = d`, `0x = 16 = e` — and decimal is the odd one out because it is `2¹ × 5`, not a power of two. | stated | "0b = 2 = b" / "Decimal is 2¹ × 5 , not a power of two, and it does not coincide with any position." |
| 86 | `0b ^ 0o ^ 0x ^ 0d = 2 ^ 8 ^ 16 ^ 10 = 16 = e` — the four radices XOR to the fifth position. | stated | "0b ^ 0o ^ 0x ^ 0d = 2 ^ 8 ^ 16 ^ 10 = 16 = e" |
| 87 | The assistant's first pass wrongly wrote the six edges as `0x ^ 0b = 1 ^ 2 = 3` etc., then retracts it: "But wait — the radices are not the powers of two. The radices are 16, 10, 8, 2. Let me redo." | stated | "e₀₁ = 0x ^ 0b 1 ^ 2 = 3" / "But wait — the radices are not the powers of two. The radices are 16, 10, 8, 2. Let me redo." |
| 88 | Nybble parity is the XOR of the four bits, `∂(nybble) = 0000` closes it, and `e` "scopes the parity to the nybble". | stated | "parity XOR of 4 bits 0 or 1" / "e scopes the parity to the nybble" |
| 89 | The user asks whether `TIME` should be `[e, d]` or `[e] \| [d]`; the assistant argues for `[e, d]` because time must have extent, and computes `e − d = 8` (half the nybble), `e + d = 24`, `e / d = 2`. | stated | "TIME = [e, d] the top two positions, e and d" / "e − d = 8 the interval" |
| 90 | The user's own `ENTROPY` type `e${number}${'b'|'o'|'x'|'d'}${number}${'p'|'i'|'n'}` is used as evidence that the wordform spans from `e` at the top to a `[pin]` literal at the bottom, crossing a radix — "a range with two endpoints". | stated | "export type ENTROPY = \`e${number}${'b' | 'o' | 'x' | 'd'}${number}${'p' | 'i' | 'n'}\`;" / "which is a range with two endpoints, and a range needs both e and d to be defined." |
| 91 | The user then retracts `[e, d]`: "wait the Time is the value substitution for the entropy in Time = Space ^ Continuum", so `TIME` becomes `[b ^ p, o ^ i, x ^ n]` — three XOR'd slots — and the assistant accepts: "Time is not a position and not a pair." | stated | "wait the Time is the value substitution for the entropy in Time = Space ^ Continuum" / "Time is not a position, and it is not a pair. Time is the XOR of Space and Continuum." |
| 92 | On the next turn the user revises again — "Time is the binary quartic of the Pythagorean theorem" — and the assistant reframes `TIME` as the hypotenuse of a right triangle whose legs are `SPACE` and `CONTINUUM`. | stated | "Time is the binary quartic of the Pythagorean theorem." / "Time the hypotenuse Space ⊕ Continuum" |
| 93 | The derivation given is `a² + b² = c²` → in F₂, `x² = x` → `a + b = c` → `a ⊕ b = c`; "XOR is the binary quartic of the Pythagorean theorem." | stated | "In binary, x² = x for x ∈ {0,1} . So the Pythagorean theorem in binary is:" / "c = a ⊕ b" |
| 94 | The 4-D extension is claimed as `a² + b² + c² + d² = e²` → `a ⊕ b ⊕ c ⊕ d = e`. | stated | "a² + b² + c² + d² = e²" / "a ⊕ b ⊕ c ⊕ d = e" |
| 95 | That last step is immediately retracted: "`a ⊕ b ⊕ c ⊕ d = e`? not quite — it's `a ⊕ b ⊕ c ⊕ d = 0` when the nybble is closed", with `1 + 2 + 4 + 8 = 15 not 16` as the counterexample. | stated | "a ⊕ b ⊕ c ⊕ d = e ? not quite — it's a ⊕ b ⊕ c ⊕ d = 0 when the nybble is closed" / "1 + 2 + 4 + 8 = 15 not 16" |
| 96 | `BOUNDARY` and `CONSTRAINT` are given the same spread type `[...SPACE, ...TIME, ...CONTINUUM]`, and the spelling `BOUNDRY` appears elsewhere — the two spellings are never reconciled. | stated | "export type BOUNDARY = [...SPACE, ...TIME, ...CONTINUUM];" / "export type CONSTRAINT = [...SPACE, ...TIME, ...CONTINUUM];" |
| 97 | The labelled tuple members written `b ^ p: number` are not valid TypeScript syntax, and `TIME` is given three incompatible definitions across the passage: `[e: number, d: number]`, `[bp: number, oi: number, xn: number]`, and `[b ^ p: number, o ^ i: number, x ^ n: number]`. | contradicted | "export type TIME = [b ^ p: number, o ^ i: number, x ^ n: number];" / "export type TIME = [bp: number, oi: number, xn: number];" |
| 98 | The binary quartic is patched with a diagonal term: `a² + b² + c² + d² + diagonal² = e²`, i.e. `a ⊕ b ⊕ c ⊕ d ⊕ 1 = e`, and `Time = Space ⊕ Continuum ⊕ 1`, giving `TIME = [b^p^1, o^i^1, x^n^1]`. | stated | "a ⊕ b ⊕ c ⊕ d ⊕ 1 = e" / "Time = Space ⊕ Continuum ⊕ 1" |
| 99 | That patched identity is arithmetically incoherent as stated: the supporting arithmetic `1 + 2 + 4 + 8 + 1 = 16` is integer addition, whereas over F₂ the same operands XOR to 14, not 16. | contradicted | "1 + 2 + 4 + 8 + 1 = 16 ✓" / "a ⊕ b ⊕ c ⊕ d ⊕ 1 = e" |
| 100 | The unfolding: `SPECTRAL = [p, i]` (two-sided frame), `SPATIAL = [b, o, x, e, d, n]` (six slots), `SCALAR = [e, d, n]` (three shared slots), and the nesting claim `SCALAR ⊂ SPATIAL`, `SPECTRAL ⊂ CONTINUUM`. | stated | "SPECTRAL [p, i] the two-sided frame" / "SPECTRAL ⊂ CONTINUUM p, i are the first two of p, i, n" |
| 101 | The cube view is eight slots `[p, i, F, B, U, D, L, R]`, with `b, o, x` initially mapped to faces and then retracted as "a bit off"; the assistant leaves open whether `b, o, x` are the coordinate's dimension or its three axes. | stated | "Hmm, that's a bit off, because SCALAR says e = FRONT \| BACK , d = UP \| DOWN , n = LEFT \| RIGHT ." / "(a) b, o, x are the radices and do not appear in the COORDINATE" |
| 102 | Three scalars give `2³ = 8` orientations, claimed to be "exactly the number of cube orientations you can reach without rotating the whole cube". | contradicted | "the three choices give the eight positions of the cube's coordinate system." |
| 103 | `TIME` is described as collapsing six positions to two, "a four-fold reduction — hence quartic". | contradicted | "it collapses six positions (three radices plus three literals) to two (entropy and span)." / "That's a reduction from six to two, which is a four-fold reduction — hence quartic." |
| 104 | `RULER` and `RULE` are introduced as the two-sided and one-sided readings, differing only by arity: two coordinates versus one. | stated | "RULER returns two coordinates. It's the two-sided reading" / "RULER and RULE differ only by arity, returning two or one coordinate, which is the two-sidedness" |
| 105 | Four interface sketches are proposed for `Bind`, `Apply`, `Eval`, `Digest` — each containing only comments and therefore no members. | stated | "interface Bind {" / "interface Digest {" |
| 106 | `export type BOUNDRY_READING = NESTED | COORDINATE;` is proposed, referring to an undefined `NESTED` and reusing the tuple alias `COORDINATE` where a literal type is needed. | contradicted | "export type BOUNDRY_READING = NESTED \| COORDINATE;" |
| 107 | The user collapses `ENTROPY` into `SCALAR`: the `e` is unnecessary because `/boxed/ = /pine/ === /boxd/ = /pin/` — the `e` cancels on both sides, so "the e is a notational convenience, not a structural component". | stated | "The e on both sides cancels." / "It was there to make the joke read as English, and the algebra behind the joke doesn't need it." |
| 108 | The BigInt analogy: `0x0011n` combines a frame (leading zeros) and a type marker (`n`); "Neither adds a value. Both name something that was already implied by the structure." | stated | "0x0011n" / "Neither adds a value. Both name something that was already implied by the structure." |
| 109 | The explicit form implies the base form but not vice versa: "/0[pine]/ = /0[boxed]/ implies /0[pin]/ = /0[boxd]/ , but not vice versa." | stated | "The implication is a superset: /0[pine]/ = /0[boxed]/ implies /0[pin]/ = /0[boxd]/ , but not vice versa." |
| 110 | `EXPONENT` replaces `ENTROPY` as the fourth domain literal: `e${number}`, a position that names the exponent before expansion or decomposition — not a value, not a reading. | stated | "e is the literal exponent — a position that names the exponent before any expansion or decomposition" / "export type EXPONENT = \`e${number}\`;" |
| 111 | The user proposes `EXPONENT = \`e${number}\` | \`e${number}${'p'|'i'|'n'}\`` with the reason "scalar becomes encapsulation": the exponent encapsulates the continuum literals, not the radices. | stated | "Because scalar becomes encapsulation" / "export type EXPONENT = \`e${number}\` \| \`e${number}${'p' \| 'i' \| 'n'}\`;" |
| 112 | Nesting is three levels deep — dimension (frame) → exponent (scale/encapsulation) → literal (content) — with the exponent as the middle layer. | stated | "dimension b, o, x, d the frame" / "The nesting is three levels deep. The exponent is the middle." |
| 113 | The wordform spelling changes accordingly: `SHAPE = number [dimension] number [exponent] [literal]` and `WORD FORM = number [dim] number [exp] [lit]`. | stated | "SHAPE = number [dimension] number [exponent] [literal]" |
| 114 | Two alternative `EXPONENT` forms are weighed: implied dimension (`e${number}${'p'|'i'|'n'}`) versus explicit dimension (`e${number}${'b'|'o'|'x'|'d'}${'p'|'i'|'n'}`); option (a) is chosen because "the dimension is not repeated in the exponent because it's already named by the scalar". | stated | "(b) Explicit — the dimension is named alongside the literal:" / "You said (a) with scalar becomes encapsulation" |
| 115 | A `DECIMAL` literal with an optional dot form appears, `\`${number}.${number}\` | \`${number}d${number}\``, alongside `BINARY`/`OCTAL`/`HEX`. | stated | "export type DECIMAL = \`${number}.${number}\` \| \`${number}d${number}\`;" |
| 116 | A final `EXPONENT` form is proposed with two readings: `${number}e${number}` for scientific notation (`1e10`, `2e5`) and `e${number}${'p'|'i'|'n'}` for the encapsulated literal (`e10p`, `e10i`, `e10n`). | stated | "export type EXPONENT = \`${number}e${number}\` \| \`e${number}${'p' \| 'i' \| 'n'}\`;" / "1e10 a base number with an exponent" |
<!-- FILL:claims -->

## Definitions

**The fold rule (verbatim, raw lines 12003–12014):**

```text
The fold rule, stated plainly

  index 0         must agree     the frame condition
  index 1         may differ     the reading of precision
  indices 2-7     must agree     the six spatial operations

The fold is exact when index 0 agrees and indices 2–7 agree. Index 1 may differ, and if it
differs, that difference is the reading of precision.
```

**The eight rule positions (verbatim, raw 12020–12032):**

```text
Part 2 — The Rule
The rule is 8 bytes. It is the content half of the ruler:

  rule[0]        diagonal
  rule[1]        size
  rule[2]        top
  rule[3]        bottom
  rule[4]        right
  rule[5]        left
  rule[6]        forward
  rule[7]        backward
```

**The knot (verbatim, raw 12041–12046):**

```text
  knot[rule] = ruler
  knot[ruler] = rule

The knot is symmetric. Bind a rule to a ruler and you have a relation that reads the same
from either side.
```

**The cube's six faces as six relations (verbatim, raw 12105–12113):**

```text
face +x     →    e₀₁    →    0x—0b
face +y     →    e₀₂    →    0x—0o
face +z     →    e₀₃    →    0x—0d
face −x     →    e₁₂    →    0b—0o
face −y     →    e₁₃    →    0b—0d
face −z     →    e₂₃    →    0o—0d

Six faces, six relations. A relation is engaged when its face diagonal is drawn.
```

**The three slices and the three Rubik moves (verbatim, raw 12121–12147):**

```text
M      x-slice         mid-plane perpendicular to x        swap16
E      y-slice         mid-plane perpendicular to y        swap32
S      z-slice         mid-plane perpendicular to z        swap64

swap16      pairwise reversal             2-byte groups
swap32      quartile reversal             4-byte groups
swap64      full-word reversal            8-byte groups

face turn        toggles one relation
slice turn       applies swap16 / swap32 / swap64
cube turn        permutes the four radices (4! = 24)
```

**Closure as the semantic bridge (verbatim, raw 12164–12173):**

```text
Two observers hold the same b ∈ F₂⁶ . Each draws the cube corresponding to b .

 If closure holds — ∂(b) = 0000 — the six face diagonals close, the cube is solid, and
 both observers see the same shape.

 If closure fails — ∂(b) ≠ 0 — the odd vertex is visible as a missing or doubled
 diagonal, and both observers see which relation is missing.

The cube is what the closure looks like. That is the abstract semantic bridge between
the logical object and the spatial reading.
```

**The four literals, as documented (verbatim, raw 2230–2233, 5394–5398):**

```text
  0p       the point                     position, no extent
  0i       the index                     position in relation, incidence
  0n       the number                    count of intervals, extent
  0e       the entropic                  difference, exponent, overflow

                             0p           literal point       a position, no extent
                             0i           literal index       a position in relation
                             0n           literal number      the count of intervals
                             0e           literal exponent    the position of the exponent
```

**The reference space as five bases plus the centroid (verbatim, raw 13995–14003, 1464–1467):**

```text
  0x     hexadecimal
  0b     binary
  0o     octal
  0d     decimal
  0e     entropic

0x, 0b, 0o, 0d     four positions         the four readings
0e                 fifth position         the position that holds the difference
0p, 0i, 0n         three literals         the centroid
```

**Wordform anatomy (verbatim, raw 1590–1606):**

```text
/0[boxd]\d+[pin]/
 │     │     │     │
 │     │     │     └── the pin, closing
 │     │     └────── \d+ — the digits between, the content
 │     └────────── [boxd] — one of the four radix letters
 └──────────────── 0 — the literal zero, the frame
```

**Homoiconicity, as stated (verbatim, raw 2670–2679):**

```text
homoiconic(P)     :-   position(P),
                            regex_constraint(P, R),
                            reading(P, data)    ∨   reading(P, program).
```

**Structural glossary used throughout (verbatim, raw 12230–12233):**

| Term | Source gloss | Line |
|---|---|---|
| point (`0p`) | "position, no extent" | 5394 |
| index (`0i`) | "position in relation" | 5395 |
| number (`0n`) | "the count of intervals" | 5396 |
| exponent (`0e`) | "the position of the exponent" | 5397 |
| literal | "Each one names a position. Each one is a literal. None of them is a value." | 5400 |
| frame (`∂(b)=0000`) | "If closure holds — ∂(b) = 0000 — the six face diagonals close, the cube is solid" | 12166–12167 |
| predictor / f-expression | "Closures over data. Not functions — f-expressions." | 12455 |
| reflection | "a relation is engaged when its face diagonal is drawn" | 12113 |
| swap tree | "% The swap tree supplies the reflection." | 12410 |
| entropic position | "a position beyond the current frame's ability to contain" | 14096–14097 |
| homoiconic | "a datum can be read as a program … and a program can be read as data … Nothing is converted." | 13483–13485 |
<!-- FILL:definitions -->

## Numbers and Invariants

| Quantity | Value | Meaning | Stated or Derived |
|---|---|---|---|
| Ruler length | 16 bytes | two 8-byte halves, state and context | stated (12020, 12064–12068) |
| Rule length | 8 bytes | the content half of the ruler | stated (12020) |
| Ruler indices | 0–7 | diagonal, size, top, bottom, right, left, forward, backward | stated (12025–12032) |
| Context half | indices 8–15 | the second half of the 16-byte ruler | stated (12065, 12231) |
| Delta cycle period | 8 | "The ruler advances one step per cycle. Period 8." | stated (12072) |
| Cube vertices | 8 | four tetrahedral + four dual | stated (12092) |
| Tetrahedron | 4 | half the cube | stated (12093) |
| Cube faces / edges | 6 | the six face diagonals of the cube | stated (12094, 12098) |
| Cube turns | 4! = 24 | the 4-vertex permutations induce a 6-edge permutation | stated (12147, 12156) |
| Slice groupings | 2, 4, 8 bytes | swap16 / swap32 / swap64 | stated (12131–12133) |
| Block state space | 2⁶ = 64 | `b ∈ F₂⁶`, one bit per relation | stated (12339–12340) |
| Frame + operations | 2! + 3! = 8 | "the frame and the operations" | stated (12086) |
| Spectral 2! inside the 3! | proxy / reflect | "Proxy and Reflect are the spectral 2! of the 3!." | stated (12384) |
| Vertex masks | 0x=110100, 0b=101010, 0o=011001, 0d=000111 | six-bit masks over the six edges | stated (12357–12358) |
| Mask XOR | 000000 | each of the six edges covered exactly twice — block closure | derived (12357–12358) |
| Mask popcount | 3 each, 12 total | 12 = 6 edges × 2 incidences | derived (12357–12358) |
| Tree count | 15 | slice_and_dice … divide_conquer, all 6-bit | stated (12397–12407) |
| Swap-tree masks | 0x00, 0x11, 0x3F | swap16 / swap32 / swap64 | stated (12411) |
| Reset address | 0x0000 | `reset(0x0000) :- power_on.` | stated (12430) |
| innerGate cycle | 0,2,1 → 1,0,2 → 2,1,0 | three-arity closure over the frame | stated (12537–12542) |
| measure term count | 10 | five `delta` + five `omi` compareExchange results, XORed with `meta` | stated (12553–12569) / derived (count) |
| measure index sets | 4,6,8 cycle / 3,5,7,9 cycle | the "dual-cube" pairing | stated (12552–12569) |
| outerGate indices | 17, 17, 19 with `pin: 18` | "the 17,19 gate", two-arity closure | stated (12580–12584) |
| Cube face bit masks | 0b100000 … 0b000001 | `+x, +y, +z, −x, −y, −z` | stated (12597–12602) |
| Frame/topology roles | 5T = index 0, 10T = index 1 | parity controller / active selector | stated (12772–12773) |
| Gate ladder | 5T, 6T, 8T, 10T | endpoints and interior | stated (12731, 12762–12763) |
| Interior 3! | 6 paths | top, bottom, right, left, forward, backward | stated (12935–12947) |
| Literal count | 4 | `0p`, `0i`, `0n`, `0e` (with `0e` also counted as the fifth base label) | stated (13990–13999, 2230–2233) |
| Base count | 5 | `0x`, `0b`, `0o`, `0d`, `0e` | stated (13995–13999) |
| Nybble | 4 bits / 16 states | one hex digit | stated (13956–13960) |
| Position values | a=1, b=2, c=4, d=8, e=16 | 2⁰…2⁴ | stated (12798–12802) |
| Radix values | 0b=2, 0o=8, 0d=10, 0x=16 | the corrected radices | stated (12783) |
| Radix↔position coincidences | 3 of 5 | `0b=b`, `0o=d`, `0x=e`; `0d=10` unmatched | stated (12930–12935) |
| Radix XOR | 2 ^ 8 ^ 16 ^ 10 = 16 = e | the four readings sum to the fifth position | stated (13046) |
| Edge XOR values | 3, 5, 9, 6, 10, 12 | e₀₁…e₂₃ written as `0x^0b` etc. (retracted notation) | stated (12877–12885) |
| TIME interval | e − d = 8 | half the nybble | stated (13023, 13061) |
| TIME total / ratio | e + d = 24, e / d = 2 | capacity + span, doubling | stated (13024, 13035) |
| Entropy (metric reading) | log₂(N) bits | explicitly refused in the predicate layer | stated (13338–13341) |
| Binary quartic identity | `a ⊕ b ⊕ c ⊕ d = 0` | closure of the nybble (after retraction) | stated (13983) |
| Counterexample to `Σ2ⁱ = 16` | 1 + 2 + 4 + 8 = 15 | why `a⊕b⊕c⊕d = e` fails | stated (13992) |
| Grammar levels | 6 | LEVEL 0 primitive … LEVEL 5 homoiconicity | stated (12689–12726) |
| Named regexes | 26 | INCLUDE…PALINDROME in the quoted grammar table | derived (12625–12653) |
<!-- FILL:numbers -->