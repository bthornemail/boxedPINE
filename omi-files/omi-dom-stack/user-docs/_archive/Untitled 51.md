SVG as the Worker-Side Geometry Contract

Status: Canonical addendum
Scope: How SVG becomes the analog to the DOM for Web Workers
Foundation: Four authorities mapped to geometry primitives

---

Part I — The Realization

§ 1. The Core Insight

The DOM is a hierarchical structure. SVG is a geometric structure.

```
DOM answers: "What is this element?"
SVG answers: "Where is this element in space?"
```

The worker doesn't need the DOM tree. It needs the geometric primitives the DOM projects into.

SVG is the worker's geometry contract.

§ 2. What a Worker Has

A Web Worker has:

```
self
postMessage
onmessage
TypedArrays
Atomics
SharedArrayBuffer
```

A Web Worker does not have:

```
document
window
HTMLElement
DOMRect
DOMMatrix
```

The worker needs a geometry-only representation of whatever the DOM is showing. That representation is SVG primitives.

---

Part II — The Primitive Mapping

§ 3. The Correspondence Table

DOM Concept SVG Primitive Worker Equivalent
DOMRect <rect> [x, y, w, h]
DOMPoint <circle> or coordinate [x, y]
DOMMatrix <g transform="..."> [a, b, c, d, e, f]
DOMQuad <polygon> [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
Range <path> [M, L, C, Z] commands
Element <g> { children: [...], attrs: {...} }
Text <text> [x, y, string]
Style <style> or fill/stroke [color, width, opacity]

Each DOM concept has an SVG primitive. Each SVG primitive has a raw coordinate representation.

The worker operates on the raw coordinates. The main thread projects them into SVG.

§ 4. The Four Authorities Mapped

```
Authority           DOM                    SVG                    Worker
OMI (citation)      element ID             primitive ID           coordinate reference
Tetragrammatron     geometric validity     proof32 / arc check    validation
Metatron            rendering              postMessage to main    projection
IMO                 viewport               SharedArrayBuffer      carrier
```

Each authority is a projection view of the same geometry.

---

Part III — The Arc Rulers as SVG Paths

§ 5. The Arc Ruler

The arc rulers are 6-byte buffers:

```
[t, b, r, l, f, br]
```

Where:

```
t  →  top
b  →  bottom
r  →  right
l  →  left
f  →  forward
br →  backward
```

§ 6. The Arc as SVG Path

Each arc can be mapped to an SVG path:

```
M <top> <bottom>
L <right> <left>
L <forward> <backward>
Z
```

Or as a triangle in the 2D projection of the 6-axis space.

§ 7. The Arc LUT as SVG Paths

The arc LUT becomes a collection of SVG paths. The popcount between adjacent arcs becomes the stroke width or opacity. The Q value becomes the fill color.

---

Part IV — The Worker as SVG Generator

§ 8. The Arc to SVG Function

```javascript
function arcToSVG(arc) {
  const [t, b, r, l, f, br] = arc;
  return `M ${t} ${b} L ${r} ${l} L ${f} ${br} Z`;
}

function popToStroke(pop) {
  return pop * 0.5; // 1 to 3
}

function qToFill(q) {
  const hue = q % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
```

§ 9. The Worker Sends

```javascript
self.postMessage({
  type: 'arc',
  path: arcToSVG(arc),
  stroke: popToStroke(pop),
  fill: qToFill(q),
});
```

§ 10. The Main Thread Renders

```javascript
const svg = document.getElementById('omi-svg');
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path.setAttribute('d', msg.path);
path.setAttribute('stroke', msg.stroke);
path.setAttribute('fill', msg.fill);
svg.appendChild(path);
```

---

Part V — Why SVG Is Better Than DOM in the Worker

§ 11. The Six Advantages

```
1.  No DOM access needed   →  the worker never touches document
2.  Geometry is the interface  →  coordinates, not elements
3.  Projection is deferred  →  the main thread decides how to render
4.  Multiple renderers      →  the same paths go to canvas, WebGL, file
5.  Serializable            →  SVG paths are strings, easy over postMessage
6.  Composable              →  paths can be combined without touching DOM
```

The worker is a geometry producer. The main thread is a geometry consumer. The SVG is the contract.

---

Part VI — The Full Architecture

§ 12. The Pipeline

```
Worker (no DOM)
    ↓
Arcs → SVG paths → postMessage
    ↓
Main thread
    ↓
SVG element ← parse paths ← receive message
    ↓
Rendering engine
    ↓
Pixels
```

§ 13. The SVG as Contract

The SVG paths are the contract between the worker and the main thread:

```
Worker sends paths  →  Main thread renders paths
Worker sends strokes  →  Main thread applies strokes
Worker sends fills  →  Main thread applies fills
```

The SVG is the interface.

---

Part VII — The Deeper Point

§ 14. Semantic vs Geometric

```
DOM is semantic  →  it says what things are
SVG is geometric  →  it says where things are
```

The protocol is about coordinates, not identity.

§ 15. The Worker's View

The worker doesn't need to know what an element is. It only needs to know where the geometry goes.

SVG gives it exactly that.

§ 16. The Main Thread's View

The main thread doesn't need to know how the geometry was computed. It only needs to know how to render the paths.

SVG gives it exactly that.

---

Part VIII — The Canonical Statement

§ 17. The Model

```
Worker  →  geometry producer  →  SVG paths
Main    →  geometry consumer  →  SVG rendering
Contract →  SVG primitives  →  the interface
```

§ 18. The Correspondence

```
DOM       =  semantic layer
SVG       =  geometric layer
Worker    =  geometry producer
Main      =  geometry consumer
SVG paths =  the contract
```

§ 19. The Full Statement

SVG is the analog to the DOM for workers.

The DOM answers "what is this element?" SVG answers "where is this element in space?"

The worker operates on raw coordinates. The main thread projects them into SVG.

The four authorities — OMI (citation), Tetragrammatron (validation), Metatron (projection), IMO (carrier) — map directly:

```
OMI              →  the coordinate reference
Tetragrammatron  →  the geometric validity proof
Metatron         →  the SVG rendering
IMO              →  the postMessage carrier
```

The arc rulers are 6-byte buffers. Each maps to an SVG path. The popcount becomes stroke width. The Q value becomes fill color.

The worker is a geometry producer. The main thread is a geometry consumer. The SVG is the contract between them.

---

Part IX — The Full Arc (Updated)

```
Atomics.compareExchange
    ↓
XOR
    ↓
bind, apply, eval, digest
    ↓
iff
    ↓
3!
    ↓
Factorial tower
    ↓
240-clock
    ↓
Klein rotators
    ↓
16-byte centroid
    ↓
ASCII table
    ↓
-4D color codex
    ↓
-5D to 10D pipeline
    ↓
Point-line duality
    ↓
The fold
    ↓
DOM = BusyBox
    ↓
SVG = DOM for workers
    ↓
The worker/geometry contract
    ↓
Verilog gates + switches + UDPs
    ↓
Zynq-7000
    ↓
The protocol
```

The circle closes. The protocol is complete. The SVG is the worker's contract.

---

Part X — The Final Statement

§ 20. The Worker-Side Geometry Contract

The SVG is the worker's geometry contract. It replaces the DOM tree with geometric primitives. It replaces semantic identity with spatial position. It replaces hierarchical structure with coordinate representation.

The four authorities map to four geometry operations:

```
OMI              →  the coordinate reference
Tetragrammatron  →  the geometric validation
Metatron         →  the SVG projection
IMO              →  the SharedArrayBuffer carrier
```

The worker produces SVG paths. The main thread renders them. The SVG is the interface.

The DOM is semantic. The SVG is geometric. The protocol is coordinate-based. The SVG is the worker's natural counterpart.

---

End of addendum.

---

That's the addendum. SVG as the analog to the DOM for workers:

1. The core difference — DOM is semantic, SVG is geometric
2. The primitive mapping — each DOM concept has an SVG primitive
3. The four authorities mapped — OMI, Tetragrammatron, Metatron, IMO
4. The arc rulers as SVG paths — 6-byte buffers → paths
5. The worker as SVG generator — produces paths, not elements
6. Why SVG is better — no DOM access, geometry as interface, deferred projection
7. The full architecture — worker → paths → main thread → rendering

The DOM is semantic. The SVG is geometric. The worker is a geometry producer. The main thread is a geometry consumer. The SVG is the contract between them.

Which aspect would you like to refine further — the arc-to-SVG mapping, the four-authority correspondence, or the worker/main-thread contract?