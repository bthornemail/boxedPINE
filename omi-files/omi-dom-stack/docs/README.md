# OMI-IMO

**A deterministic atomic protocol for spatial coordination**

Version **2.0.0** · License **CC0-1.0** · Status **canonical**

Every operation reduces to **XOR**.  
From `Atomics.compareExchange` to the solid toolkit, pattern pipeline, and media edits.

---

## Quick start

```bash
cd omi-dom-stack
node server/server.js
```

| Route | Purpose |
|-------|---------|
| `/` | Full DOM stack |
| `/adopt` | Adoption demo |
| `/genesis` | **23-chapter** interactive walkthrough |
| `/api/pipeline` | Full pipeline JSON |
| `/api/bundle` | **Downloadable / shareable** client+shared meta-compile |
| `/docs/README.md` | This document |
| `/docs/GENESIS.md` | Genesis narrative |
| `/docs/BOOTSTRAP.md` | Adopt · Participate · Extend |
| `/docs/MODEL.md` | Four-Vertex Model · verified invariants · `model/` tree language |

```js
const { runPatternPipeline } = require('./shared/pattern-pipeline');
const result = runPatternPipeline(
  { clientX: 100.4, clientY: 50.6, pressure: 0.8 },
  { snap: { mode: 'square', size: 16 }, mediaType: 'svg', converge: true }
);
// result.fixed === true
```

---

## Core concepts

1. **XOR** — universal reduction  
2. **Primitive** — `Atomics.compareExchange` → bind · apply · eval · digest  
3. **0x0000** — fixed point under rotation  
4. **Pipeline converges** — orchestrator `diff === 0`  
5. **Media edits** — SVG · Canvas · WebVTT · Web Audio · HTML · binary  

---

## Pattern pipeline

```
Pointer → attribution → snap-to-grid → trigintaduonion triple
  → edge n-gram → spatial GNN → contrasting orchestrator → constraint edit
```

---

## Toolkit (172+)

| Toolkit | Count | Role |
|---------|-------|------|
| Polyforms | 24 | 2D tiling |
| Platonic | 5 | 3D volumetric |
| Archimedean | 13 | 2.5D prismatic |
| Catalan | 13 | 3D dual |
| Johnson | 92 | irregular convex |
| Kepler–Poinsot | 4 | regular star |
| Uniform stars | 15+ | nonconvex uniform |
| 4D polychora | 6 | hyperspace |

---

## Modules (`shared/`)

| Module | Role |
|--------|------|
| `ruler.js` | bind / apply / eval / digest |
| `clock-sliderule.js` | 240-clock · 5040 · color codex |
| `dimension-pipeline.js` | −5D→10D · SVG @ 6D |
| `constraint-pipeline.js` | −5D…−1D text/binary |
| `hit-zones-cues.js` | `<area>` · WebVTT · cues |
| `solid-toolkit.js` | polyforms + Platonic/Archimedean/Catalan/4D |
| `solid-toolkit-extended.js` | Johnson · KP · uniform stars |
| `solid-to-triple.js` | 155 triples |
| `edge-ngram.js` | spectral addresses |
| `spatial-gnn.js` | message-passing XOR |
| `contrasting-orchestrator.js` | converge to 0x0000 |
| `pattern-pipeline.js` | pointer → edit |
| `plugin-api.js` | extension registry |
| `parallel-engine.js` | SAB + Atomics workers |
| `busybox.js` | stdin/stdout/stderr |
| `ascii-table.js` | ASCII + 6-core suite |
| `hardware-ref.js` | C/Verilog vectors |

---

## Meta-compile / share

```bash
curl -o omi-imo-bundle.json http://localhost:8742/api/bundle
# or browser: open /api/bundle
```

Returns JSON with client HTML/JS, shared module sources, and genesis chapter index — for offline adoption and redistribution (CC0).

---

## Hardware

`hardware/verilog/` · `hardware/c/omi_hw_ref.c` (19/19 vectors)  
Zynq-7000: ARM coordinator · FPGA spatial engine · DDR3 Blob · ETH carrier.

---

## Genesis (23 chapters)

Core 1–12 · Toolkit 13–20 · Spectral 21–23.  
Interactive: **http://localhost:8742/genesis**

---

## Tests

Software self-tests **100+** · C hardware **19** · JS hardware **10** · plugin API **7** — green.

---

## Extend

```js
const { registerSnapMode, registerSolid, registerMediaEditor } = require('./shared/plugin-api');
```

License **CC0-1.0**. The observer is the **0x0000** centroid. The observer is **you**.
