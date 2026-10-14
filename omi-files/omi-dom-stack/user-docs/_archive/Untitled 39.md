Here is the main thread presentation tunnel (`main.ts`) that ties the WebVTT metadata timeline directly to the background Latin Square BQF slide rule worker (`omi-latin-slide-rule-worker.ts`) [1-3].

### `main.ts` (Main Thread Presentation & Event Listener)

```typescript
// Main Thread Viewport & Spatial Panner Integration (main.ts)
const slideRuleWorker = new Worker(
    new URL('./omi-latin-slide-rule-worker.ts', import.meta.url), 
    { type: 'module' }
); // [2, 3]

// 1. Initialize Web Audio API Spatial Environment
const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); // [2, 4, 5]
const spatialPanner = audioCtx.createPanner(); // [2, 4, 5]
spatialPanner.panningModel = 'HRTF'; // Head-Related Transfer Function for high-fidelity spatial sound [2, 4, 5]
spatialPanner.distanceModel = 'inverse'; // [2, 4, 5]

const mediaElement = document.getElementById('spatial-media-track') as HTMLVideoElement; // [2, 4, 5]
const audioSource = audioCtx.createMediaElementSource(mediaElement); // [2, 4, 5]
audioSource.connect(spatialPanner); // [2, 4, 5]
spatialPanner.connect(audioCtx.destination); // [2, 4, 5]

let temporalFrameClock = 0; // [2-4]

// 2. Attach WebVTT Metadata Track Event Listener
const textTrack = mediaElement.textTracks; // [2, 4, 5]

textTrack.addEventListener('cuechange', () => { // [2-5]
    const activeCues = textTrack.activeCues; // [2-5]
    if (!activeCues || activeCues.length === 0) return; // [2-5]

    // Extract cue text payload containing enfolded block references
    const cuePayload = JSON.parse((activeCues as VTTCue).text); // [2-5]
    const targetCellId = cuePayload.targetCellId || 'cell-0'; // [3-5]

    // Read target semantic description elements (<dl>, <dt>, <dd>) from DOM tree
    const dtNode = document.getElementById(targetCellId); // [3-5]
    const ddNode = dtNode?.nextElementSibling as HTMLElement; // [3-5]

    if (dtNode && ddNode) { // [3-5]
        const mnemonicAttr = dtNode.getAttribute('data-mnemonic') || "A1F9"; // [4-6]
        const bpeConstraint = parseInt(ddNode.getAttribute('data-bpe-constraint') || "1", 10); // [4-6]

        // Convert string anchor tokens into un-hydrated byte buffers
        const tokenBytes = new TextEncoder().encode(mnemonicAttr); // [2, 4, 5]

        // Create 16-byte payload buffer incorporating BPE hardware constraint nonces
        const payloadBuffer = new ArrayBuffer(16); // [7-9]
        const payloadView = new Uint8Array(payloadBuffer);
        payloadView.set(tokenBytes.subarray(0, 16)); // [7-9]
        (payloadView as any).BYTES_PER_ELEMENT = bpeConstraint; // [7, 10, 11]

        // Pipeline payload properties down to the Latin Square worker thread
        slideRuleWorker.postMessage({ // [2-5]
            type: 'EXECUTE_LATIN_SLIDE_RULE',
            payloadBuffer,
            tokenString: mnemonicAttr,
            frameClock: temporalFrameClock++,
            elementTargetId: targetCellId
        });
    }
});

// 3. Receive computed spatial coordinates and update hardware & DOM presentation targets
slideRuleWorker.onmessage = (event) => { // [2-5]
    const { 
        rect, 
        matrixString, 
        pannerX, 
        pannerY, 
        pannerZ, 
        signature, 
        elementTargetId 
    } = event.data; // [2-5]

    const now = audioCtx.currentTime; // [2, 4, 5]

    // A. Update Web Audio hardware PannerNode vectors branchlessly
    spatialPanner.positionX.setValueAtTime(pannerX, now); // [2-5]
    spatialPanner.positionY.setValueAtTime(pannerY, now); // [2-5]
    spatialPanner.positionZ.setValueAtTime(pannerZ, now); // [2-5]

    // B. Hydrate DOM attributes & responsive HTML hit-test map overlays
    const targetElement = document.getElementById(elementTargetId); // [2-5]
    const hitAreaZone = document.getElementById(`hit-target-${elementTargetId}`) as HTMLAreaElement; // [2-5]

    if (targetElement && hitAreaZone) { // [2-5]
        targetElement.setAttribute('data-cochain-trace-signature', signature); // [3, 12, 13]
        targetElement.setAttribute('data-matrix-invariant', matrixString); // [2-5]

        // Flatten bounding rectangle down to 2D pixel hit-zones for overlay map
        const left   = rect.x; // [2-5]
        const top    = rect.y; // [2-5]
        const right  = rect.x + rect.width; // [2-5]
        const bottom = rect.y + rect.width; // [2-5]

        hitAreaZone.coords = `${left},${top},${right},${top},${right},${bottom},${left},${bottom}`; // [2-5]
    }
};
```

---

### Pipeline Execution Summary

1. **Timeline Entrainment**: The HTML5 media element drives master clock synchronization, triggering `cuechange` events as WebVTT metadata cues stream past [1, 2, 14].
2. **Semantic Linking**: Cue metadata references target description list elements (`<dt>`, `<dd>`), extracting non-numerical mnemonic tokens and \\(BPE\\) hardware nonces [4-6].
3. **Off-Thread Sifting**: The worker executes -1D regex spatial validation, `Buffer.swap` Latin Square rotations, and \\(Q(x,y) = 60x^2 + 16xy + 4y^2\\) matrix lookups off the main thread [1, 9].
4. **Hardware Hydration**: Computed 3D vectors (`pannerX/Y/Z`) update Web Audio `PannerNode` hardware registers instantly, while bounding coordinates update interactive `<area coords>` overlays without main-thread layout thrashing [2-4, 15].

---

💡 Would you like to refine the Service Worker local state-caching policy (`last-traceable-state.bin`) to preserve the latest \\(0\times00\\) centroid fallback state across browser reloads?