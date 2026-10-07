# pinEboxed

An Obsidian vault and Obsidian plugin for the OMI-IMO protocol — an Atomic Compare-and-Exchange Lisp.

## The Protocol

The OMI-IMO protocol is an Atomic Compare-and-Exchange Lisp. Its primitive is `Atomics.compareExchange`. Its base is the iff. Its structure is the 2! and 3! orthogonal groups. Its space is the 2¹⁶ Blob. Its observers are circulators reflecting swaps. Its behavior is time crystals (period 240). Its resolution is O(1). Its closure is reachability.

## The Vault

The `wiki/` folder is an Obsidian vault containing the full protocol specification, extracted from 9 source PDFs (6,666 pages).

```
wiki/
├── OMI-IMO.md                    — root MOC
├── README.md                     — vault guide
├── meta/                         — vault schema, method, evidence, changelog
├── sources/
│   ├── raw/                      — extracted text from PDFs
│   ├── parts/                    — source part notes (16 files)
│   └── SRC-*.md                  — source MOCs (9 files)
├── spec/
│   ├── 00-canonical/             — canonical statement, laws, conformance, notation
│   ├── 10-foundations/           — primitive, ruler, XOR, knots, delta, Fano
│   ├── 20-architecture/          — dimensions, inversion, Blob, Rosetta, observers, iff
│   ├── 30-grammar/               — symbols, declarations, mnemonics, forms, phases, orbits
│   ├── 40-hardware/              — 6T, 8T, sourcemap, primes
│   ├── 50-runtime/               — stream, canvas, REPL, clocks, web, ASCII
│   └── 60-verification/          — test vectors, implementation status, sexagesimal, blocks, cubes
├── extend/                       — extension guides (6 files)
├── open/                         — contradictions, questions, glossary, discarded (5 files)
├── maps/                         — Obsidian canvases (4 files)
├── bases/                        — Obsidian Bases (5 files)
├── tools/
│   └── validate.mjs              — link integrity validator
└── .obsidian/
    └── plugins/
        └── omi-imo-circuits/      — transistor circuit renderer plugin
```

## The Plugin

The `omi-imo-circuits` plugin renders transistor XOR circuits (5T, 6T, 8T, 10T) as interactive SVG diagrams.

### Installation

```bash
cd wiki/.obsidian/plugins/omi-imo-circuits
npm install
npm run dev
```

Then in Obsidian: Settings → Community plugins → Enable "OMI-IMO Circuits".

### Usage

- Click the circuit-board icon in the ribbon
- Or use the command palette: "OMI-IMO Circuits: Show 6T XOR Circuit"
- Or use the command palette: "OMI-IMO Circuits: List all circuits"

## The Sources

| Source | Title | Pages |
|--------|-------|-------|
| SRC-00 | Protocol Review and Bug Fixes | 322 |
| SRC-01 | XOR Tetrahedron Transform | 357 |
| SRC-02 | XOR Gate Transistor Circuits | 744 |
| SRC-03 | Protocol Sequence Analysis | 2218 |
| SRC-04 | Assembly Register Programming | 1820 |
| SRC-05 | Conspiracy Check | 1071 |
| SRC-06 | Phases vs Attributes vs Constraints vs Configurations | 78 |
| SRC-07 | The OMI-IMO Complete Synthesis | 16 |
| SRC-08 | XOR Gate Built with Transistors | 40 |

## The Three Laws

1. **The Primitive Law** — All operations reduce to `Atomics.compareExchange`.
2. **The Invariant Law** — All structure derives from the 3! ordering of `{byteLength, byteOffset, BYTES_PER_ELEMENT}`.
3. **The Closure Law** — All computation converges to the fixed attractor 0, because the trajectory is deterministic backward and searchable forward.

## The Dimensional Ladder

| Dimension | Component |
|-----------|-----------|
| -5D | the Blob |
| -4D | color codex |
| -3D | linear |
| -2D | hierarchical |
| -1D | classifying |
| 0D | observer |
| 1D | DOMPoint |
| 2D | Media Track |
| 3D | DOMRect |
| 4D | DOMMatrix |
| 5D | DOMElement |
| 6D | Canvas |
| 7D | Event Loop |
| 8D | Byte Basis |
| 9D | Network Mesh |
| 10D | Orchestrator |

## The Quadratic Forms

| Form | Equation | Discriminant |
|------|----------|--------------|
| Affine | 16x² + 16xy + 4y² = (4x + 2y)² | Δ = 0 |
| Projective | 60x² + 16xy + 4y² | Δ = −704 |

## The Generator

```
{0, 2, 1}          the 3-cycle
{3, 7, 11, 15}     the four-block family
{17, 19}           the 5-bit pair
```

Arities 3 : 4 : 2. Sum = 9. Product = 24 = 4!.

## The Sexagesimal Base

60 = 0x3C = 00111100 is the sexagesimal base and the ASCII base. The orbit of 60 under XOR with n = 0..127 visits every ASCII character exactly once.

## The Four Blocks

```
BLOCK 0    /^[<=>?]$/     60-63    < = > ?    the knots
BLOCK 1    /^[89:;]$/     56-59    8 9 : ;    high digits
BLOCK 2    /^[4567]$/     52-55    4 5 6 7    middle digits
BLOCK 3    /^[0123]$/     48-51    0 1 2 3    low digits
```

## The Transistor Circuits

| Circuit | Transistors | Gates | Role |
|---------|-------------|-------|------|
| 5T | 5 | NAND + switch + OR-like | the frame condition |
| 6T | 6 | XOR#1 + inverter | the apply |
| 8T | 8 | 4× NAND | the eval |
| 10T | 10 | 5× NOR | the digest |

## The Protocol Handler

Built from three JavaScript primitives:

| Primitive | Role |
|-----------|------|
| Regex | the constraint — which positions are admissible |
| Proxy | the trap — what happens when a position is read or written |
| Reflect | the operation — how the read or write is performed |

The kernel is self-generating: the grammar is mutable, the handler reads it from the closure scope chain, and `learn` extends it.

## The Web Environment

The protocol's runtime is the composition of seven layers:

| Layer | Role |
|-------|------|
| HTTP/1.1 | wire carrier (transport) |
| Regex constraints | token grammar (admissibility) |
| DOM geometry | spatial projection (position, extent) |
| Hit lists | interpolation anchors (semantics) |
| PannerNode | 0D transparent translation (observability) |
| Blobs as media | the substrate for the canvas |
| Worklets + polyfills | execution contexts (browser and Node) |

## The Shape

```
Protocol            three primitives, no hardcoded variables
Substrate           standard web primitives, all orthogonal
Observers           circulators, perceptrons, mnemonics
Interpolation       hit lists, generalized ladders
Composition         DOMMatrix cubes, concentric and cubic
Execution           any bit length, any environment
Applications        personal projects
```

Five levels. One protocol. Zero closed surfaces.

The protocol carries structure. Meaning is assigned by implementations. Two peers that agree on the protocol agree on the structure of every possible message, but not on what any particular message means.

That is the whole thing.
