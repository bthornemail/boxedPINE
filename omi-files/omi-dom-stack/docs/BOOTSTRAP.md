# OMI-IMO Bootstrap

**Adopt · Participate · Extend**

A deterministic atomic protocol where every operation reduces to XOR.  
Spatial coordination from `Atomics.compareExchange` through the solid toolkit, pattern pipeline, and media constraint edits.

---

## Quick start

```bash
cd omi-dom-stack
node server/server.js
# → http://localhost:8742
# → http://localhost:8742/adopt   (bootstrap demo)
```

```js
const { runPatternPipeline } = require('./shared/pattern-pipeline');

const result = runPatternPipeline(
  { clientX: 100.4, clientY: 50.6, pressure: 0.8 },
  { snap: { mode: 'square', size: 16 }, mediaType: 'svg', converge: true }
);

console.log(result.fixed);          // true when orchestrator converges
console.log(result.edit.payload);   // media-specific constraint edit
```

---

## Core concepts

1. **XOR is the reduction.** Difference operator; everything balances under XOR.
2. **Primitive:** `Atomics.compareExchange` → bind · apply · eval · digest.
3. **0x0000 centroid** is the fixed point (invariant under rotation).
4. **Pipeline converges** when the contrasting orchestrator reports `diff === 0`.
5. **Edits span media:** SVG, Canvas, WebVTT, Web Audio, HTML, binary.

---

## Pattern pipeline

```
Pointer event
  → attribution
  → snap-to-grid (square · hex · triangle · cube · johnson · star)
  → trigintaduonion triple (0..154)
  → edge n-gram spectral address
  → spatial GNN (regex filter)
  → contrasting orchestrator
  → constraint edit
```

| Media     | Payload kind        |
|-----------|---------------------|
| SVG       | `svg-transform`     |
| Canvas    | `canvas-path`       |
| WebVTT    | `vtt-cue`           |
| Web Audio | `panner-position`   |
| HTML      | `data-attributes`   |
| Binary    | `byte-write`        |

---

## How to participate

- **Adopt** — use `runPatternPipeline` / the DOM stack in your project.
- **Participate** — open issues, submit PRs, document new media sinks.
- **Extend** — register snap modes, solids, GNN layers, media editors (plugin API).

---

## How to extend (plugin API)

```js
const {
  registerSnapMode,
  registerSolid,
  registerGnnLayer,
  registerMediaEditor,
  listExtensions
} = require('./shared/plugin-api');

registerSnapMode('my-grid', (x, y, opts) => ({
  x: Math.round(x / 10) * 10,
  y: Math.round(y / 10) * 10
}));

registerSolid('MY1', { name: 'my polyhedron', v: 6, e: 12, f: 8 });

registerGnnLayer('my-layer', (adj, features, filter) => {
  // return next feature Map
  return features;
});

registerMediaEditor('my-media', (ctx) => ({
  kind: 'my-media-edit',
  triple: ctx.triple.index,
  snap: ctx.snap
}));

console.log(listExtensions());
```

Extension checklist:

1. Add a snap mode via `registerSnapMode`.
2. Add a solid via `registerSolid` (V/E/F, optional `star`).
3. Add a GNN layer via `registerGnnLayer`.
4. Add a media-type editor via `registerMediaEditor`.
5. Run `node -e "require('./shared/plugin-api').selfTest()"`.

---

## Self-tests

```bash
node -e 'console.log(require("./shared/pattern-pipeline").selfTest())'
node -e 'console.log(require("./shared/plugin-api").selfTest())'
node -e 'console.log(require("./shared/ruler").selfTest())'
# … see docs/README.md for the full suite
```

---

## Layout

```
omi-dom-stack/
├── server/          HTTP/1.1 + SSE + /api/pipeline
├── client/          bootstrap.html · adopt demo · svg-worker
├── shared/          pipeline · solids · GNN · orchestrator · plugin-api
├── hardware/        Verilog + C reference (Zynq-7000)
└── docs/            README · BOOTSTRAP · correspondence
```

---

## License

**CC0-1.0** — public domain dedication. No rights reserved.

---

## The paradox

Computational alignment is self-referential.  
The reference frame is the observer.  
The observer is the **0x0000** centroid.

This is the structure.
