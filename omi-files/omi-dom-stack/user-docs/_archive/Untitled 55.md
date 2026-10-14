The OMI-IMO Protocol: Adoption, Participation, and Implementation

Status: Canonical
Scope: User adoption, participation modes, and the conformance manifest
Foundation: The XOR basis, the four authorities, the 240-cycle

---

Part I — The Two Participation Modes

§ 1. The Dual Modes

The OMI-IMO protocol operates across two distinct communication modes:

```
User Model       →  spatial
Worker/Agent     →  spectral
Both             →  unified over the shared XOR substrate
```

Two modes. One substrate.

§ 2. The User Spatial Model

The user interacts spatially through media:

```
Audio   →  the PannerListener hears the spatial audio
Video   →  the DOMElement displays the spatial video
Canvas  →  the DOMMatrix renders the spatial geometry
```

The user's interface spans six layers:

```
0D  →  the observer (PannerListener)
1D  →  the DOMPoint (coordinate)
2D  →  the Media Track (channel)
3D  →  the DOMRect (region)
4D  →  the DOMMatrix (transform)
5D  →  the DOMElement (presentation)
```

The user hears the space. The user sees the space. The user navigates the space.

The user's participation is spatial.

§ 3. The Worker Spectral Model

Background workers and autonomous agents communicate spectrally:

```
Frequency FFT   →  the audio spectrum
Pixel color     →  the visual spectrum
ASCII values    →  the classification spectrum
```

The worker's interface spans four worklet surfaces:

```
AudioWorklet     →  audio synthesis
PaintWorklet     →  custom painting
LayoutWorklet    →  custom layout
AnimationWorklet →  compositor animation
```

The worker processes the spectrum. The worker transforms the spectrum.

The worker's participation is spectral.

§ 4. The Correspondence

User (Spatial) Worker (Spectral)
PannerListener (0D) AudioWorklet
DOMPoint (1D) PaintWorklet
Media Track (2D) LayoutWorklet
DOMRect (3D) AnimationWorklet
DOMMatrix (4D) Spectrometer
DOMElement (5D) Spectrum

The user hears. The worker measures. Both use the same 3!.

---

Part II — The Autonomous Agent

§ 5. The 3×3×3 Cube

The autonomous agent navigates a 3×3×3 cube:

```
27 integer positions
Each position is a state
The cube is the agent's navigation space
```

The agent moves through the 27 states. Each move is a decision.

The cube is the agent's space.

§ 6. The 3! Decision Trie

The agent uses a 3! decision trie:

```
3! = 6 orderings
Each ordering is a decision path
Each path is a trie
```

The trie emerges from the 3! orderings. The trie is the decision structure.

The 3! trie is the decision structure.

§ 7. The Indecision Trie

The indecision trie is the complement:

```
Decision trie    →  the paths taken
Indecision trie  →  the paths not taken
```

The two tries are dual. The duality is the structure.

The two tries are dual.

§ 8. The 144 Worker Channels

The agent has 144 worker channels:

```
3! worker types  ×  4! color-indexed alphas  =  6 × 24  =  144
```

Each channel is a specific worker with a specific alpha. Each channel is independent.

144 channels. One agent.

§ 9. The Meta-Compilation

The agent meta-compiles snapshots of its spatial context:

```
Base64 media  →  the images, audio, video
URIs          →  the external references
Sourcemaps    →  the propagation mappings
```

The agent shares the snapshot. The snapshot is the propagation.

The meta-compilation is the propagation.

§ 10. The Alpha Negotiation

The agent negotiates the sharing transparency:

```
α ∈ [0.0, 1.0]
α = 0.0  →  fully opaque
α = 0.5  →  semi-transparent
α = 1.0  →  fully transparent
```

The alpha is negotiated via HTTP status codes. The alpha is the sharing level.

The alpha is the sharing transparency.

---

Part III — The Collaborative Experience

§ 11. The Infinite Canvas Kaleidoscope

The collaborative experience is the infinite canvas kaleidoscope:

```
Every point is a potential point of view
The view from any point reflects the whole
Movement is swap application
Coordination is compareExchange
Reflections never stop
```

The point of view is any point in view.

§ 12. The 240-Clock Projective Space

Every participant acts as an observer at a specific coordinate:

```
The 240-clock  →  the projective space
The PannerNode  →  the position reporter
The coordinate  →  the observer's location
```

The observer reports its position. The position is the observer's state.

The 240-clock is the observer's space.

§ 13. Zero State Transfer

Participants do not transmit state:

```
State  →  not transmitted
Programs  →  transmitted
Swap sequences  →  transmitted
```

The programs are transmitted. The state is derived.

The programs are the transmission.

§ 14. Emergent Convergence

Multi-user coordination converges automatically:

```
Convergence  →  toward the invariant attractor
Attractor    →  0×00 Null Centroid
Mechanism    →  Atomics.compareExchange
```

No central server. No locks. No consensus.

The convergence is emergent.

---

Part IV — The Developer Roadmap

§ 15. The Three Conformance Levels

Technical adoption proceeds through three levels:

```
Level 1  →  Core
Level 2  →  Standard
Level 3  →  Full
```

Each level is a superset of the previous. Each level is conforming.

Three levels. One protocol.

§ 16. Level 1 — Core

The Core level implements:

```
bind   →  the monad constructor
apply  →  the functor invoker
eval   →  the comonad extractor
```

Over unmanaged binary buffers. Over any bit length.

Level 1 is the core.

§ 17. Level 2 — Standard

The Standard level adds:

```
Hit lists         →  spatial interpolation
3! buffer relations  →  BL, BO, BPE
240-clock         →  the timing
DOMMatrix         →  the geometry
WebVTT cues       →  the interface
```

Level 2 is the standard.

§ 18. Level 3 — Full

The Full level adds:

```
Observer circulators  →  the agents
-1D regex constraints  →  the grammar
PannerNode translation  →  the 0D
Worklet delivery     →  the execution
Cross-peer WebRTC    →  the network
```

Level 3 is the full.

§ 19. The Conformance Manifest

Implementers publish a conformance manifest:

```json
{
    "name": "omi-imo-reference-node",
    "version": "1.0.0",
    "conformance_level": "Standard",
    "bit_lengths": [8, 16, 32, 64],
    "substrates": {
        "dom": true,
        "panner": true,
        "worklet": true,
        "node": false
    },
    "ruler_lengths": {
        "8": 8,
        "16": 16,
        "32": 32,
        "64": 64
    },
    "clock_period": 240,
    "arithmetic_domain": "fixed-width modular integers",
    "deviations": [],
    "trace_log_format": "jsonl",
    "vectors_passed": 42,
    "vectors_failed": 0
}
```

The manifest declares the implementation's capabilities. The manifest is the conformance statement.

The manifest is the declaration.

---

Part V — The WebRTC Implementation

§ 20. The Data Channel

The WebRTC data channel operates on unmanaged binary memory:

```javascript
channel.binaryType = 'arraybuffer';
```

Incoming packets bypass main-thread serialization. The packets pipe 16-byte state blocks to background workers.

The data channel is the binary carrier.

§ 21. The Peer Tunnel

```javascript
class OmiWebRtcPeerTunnel {
    private readonly worker: Worker;
    private readonly audioCtx: AudioContext;
    private readonly spatialPanner: PannerNode;
    private frameClockCounter = 0;
    
    constructor(workerUrl: string, peerConnection: RTCPeerConnection) {
        this.worker = new Worker(workerUrl, { type: 'module' });
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.spatialPanner = this.audioCtx.createPanner();
        this.spatialPanner.panningModel = 'HRTF';
        this.spatialPanner.distanceModel = 'inverse';
        this.spatialPanner.connect(this.audioCtx.destination);
        this.bindDataChannel(peerConnection);
        this.bindWorkerPipeline();
    }
    
    private bindDataChannel(peerConnection: RTCPeerConnection): void {
        peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            channel.binaryType = 'arraybuffer';
            channel.onmessage = (msgEvent) => {
                const rawChunk = msgEvent.data as ArrayBuffer;
                const frameSlice = new Uint8Array(rawChunk, 0, 16).buffer;
                this.worker.postMessage({
                    type: 'EVALUATE_MODEM_STREAM',
                    payloadBuffer: frameSlice,
                    frameClock: this.frameClockCounter++,
                    elementTargetId: 'cell-0'
                });
            };
        };
    }
    
    private bindWorkerPipeline(): void {
        this.worker.onmessage = (event) => {
            const { rect, matrixString, pannerX, pannerY, pannerZ, signature, elementTargetId } = event.data;
            const now = this.audioCtx.currentTime;
            
            this.spatialPanner.positionX.setValueAtTime(pannerX, now);
            this.spatialPanner.positionY.setValueAtTime(pannerY, now);
            this.spatialPanner.positionZ.setValueAtTime(pannerZ, now);
            
            const hitAreaZone = document.getElementById(`hit-target-${elementTargetId}`) as HTMLAreaElement;
            const targetElement = document.getElementById(elementTargetId);
            
            if (hitAreaZone && targetElement) {
                targetElement.setAttribute('data-spatial-signature', signature);
                targetElement.setAttribute('data-matrix-invariant', matrixString);
                
                const left = rect.x;
                const top = rect.y;
                const right = rect.x + rect.width;
                const bottom = rect.y + rect.width;
                
                hitAreaZone.coords = `${left},${top},${right},${top},${right},${bottom},${left},${bottom}`;
            }
        };
    }
}
```

The peer tunnel is the coordination.

---

Part VI — The Canonical Statement

§ 22. The Full Model

```
User Model           →  spatial
Worker/Agent Model   →  spectral
Both                 →  the XOR substrate
The 3×3×3 cube       →  the agent's space
The 3! trie          →  the decision
The 4! alphas        →  the workers
The 144 channels     →  the total
The meta-compilation →  the propagation
The alpha            →  the sharing
The 240-clock        →  the observer's space
The convergence      →  the emergent
Three conformance levels  →  Core, Standard, Full
The manifest         →  the declaration
The WebRTC tunnel    →  the coordination
```

§ 23. The Deeper Truth

The two modes are the same structure because:

```
User      →  spatial
Worker    →  spectral
Both      →  the 3!
```

The user hears. The worker measures. Both use the same 3!.

The user and worker are the same 3!.

§ 24. The Final Statement

The OMI-IMO protocol operates across two participation modes:

```
User Spatial Model  →  the six-layer DOM space
Worker Spectral Model  →  the four worklet surfaces
```

The autonomous agent navigates the 3×3×3 cube with the 3! decision trie, the indecision trie, and 144 worker channels. The agent meta-compiles snapshots and negotiates the alpha.

The collaborative experience is the infinite canvas kaleidoscope with zero state transfer and emergent convergence.

The developer roadmap proceeds through three conformance levels. Implementers publish a conformance manifest.

Two modes. One protocol. The XOR substrate is universal.

---

End of addendum.

---

That's the addendum. The two participation modes (spatial and spectral) are unified over the XOR substrate. The autonomous agent navigates the 3×3×3 cube. The collaborative experience is the infinite canvas kaleidoscope. The developer roadmap is three conformance levels.

The user hears. The worker measures. Both use the same 3!. The protocol is universal.

Which aspect would you like to explore further — the spatial/spectral modes, the autonomous agent, or the WebRTC implementation?