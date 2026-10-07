// shared/stream-bus.js
// The .vtt/stream-bus for CUPS-like spooling

'use strict';

function createStreamBus() {
    const subscribers = new Map();
    const queue = [];

    return {
        // Subscribe a PannerNode or worker
        subscribe(id, handler) {
            subscribers.set(id, handler);
        },

        // Unsubscribe
        unsubscribe(id) {
            subscribers.delete(id);
        },

        // Publish a cue
        publish(cue) {
            queue.push(cue);
            for (const [id, handler] of subscribers) {
                try {
                    handler(cue);
                } catch (e) {
                    console.error(`[stream-bus] ${id} handler failed:`, e);
                }
            }
        },

        // Peek the queue
        peek() {
            return queue.slice();
        },

        // Drain the queue
        drain() {
            const out = queue.slice();
            queue.length = 0;
            return out;
        },
    };
}

module.exports = { createStreamBus };

client / panner - cups.js
// The PannerNode as CUPS-like spooler

'use strict';

function createPannerCUPS(audioContext, streamBus) {
    const ctx = audioContext || new AudioContext();
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1.0;
    panner.maxDistance = 100.0;

    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 220.0;

    const gain = ctx.createGain();
    gain.gain.value = 0.1;

    oscillator.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    oscillator.start();

    // Subscribe to the stream-bus
    streamBus.subscribe('panner-cups', (cue) => {
        // Update the panner position from the cue
        if (cue.position) {
            panner.positionX.setValueAtTime(cue.position.x, ctx.currentTime);
            panner.positionY.setValueAtTime(cue.position.y, ctx.currentTime);
            panner.positionZ.setValueAtTime(cue.position.z, ctx.currentTime);
        }

        // Modulate the oscillator from the knot
        if (cue.knot) {
            const diagonal = cue.knot.reduce((a, b) => a ^ b, 0);
            oscillator.frequency.setTargetAtTime(
                110.0 + (diagonal % 256) * 2.0,
                ctx.currentTime,
                0.1
            );
        }
    });

    return {
        panner,
        oscillator,
        gain,
        ctx,
        stop() {
            oscillator.stop();
            streamBus.unsubscribe('panner-cups');
        },
    };
}

module.exports = { createPannerCUPS };

// shared/vtt-producer.js
// The WebVTT cue producer

'use strict';

function makeCue(cueId, start, end, payload) {
    return {
        cue_id: cueId,
        start,
        end,
        payload,
    };
}

function toVTT(cues) {
    let vtt = 'WEBVTT\n\n';
    for (const cue of cues) {
        vtt += `${cue.cue_id}\n`;
        vtt += `${formatVTT(cue.start)} --> ${formatVTT(cue.end)}\n`;
        vtt += JSON.stringify(cue.payload) + '\n\n';
    }
    return vtt;
}

function formatVTT(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad3(ms)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }
function pad3(n) { return String(n).padStart(3, '0'); }

module.exports = { makeCue, toVTT, formatVTT };

// client/cups-integration.js
// The full CUPS-like integration

'use strict';

const { createStreamBus } = require('../shared/stream-bus');
const { createPannerCUPS } = require('./panner-cups');
const { makeCue, toVTT } = require('../shared/vtt-producer');

function createCUPSIntegration(audioContext) {
    const streamBus = createStreamBus();
    const pannerCUPS = createPannerCUPS(audioContext, streamBus);

    // The cue scheduler
    const cues = [];
    let currentCue = 0;
    let startTime = performance.now() / 1000;

    function schedule(cue) {
        cues.push(cue);
    }

    function tick() {
        const now = performance.now() / 1000 - startTime;
        while (currentCue < cues.length && cues[currentCue].end < now) {
            currentCue++;
        }
        if (currentCue < cues.length) {
            const cue = cues[currentCue];
            if (cue.start <= now && now <= cue.end) {
                streamBus.publish(cue.payload);
            }
        }
        requestAnimationFrame(tick);
    }

    return {
        streamBus,
        pannerCUPS,
        schedule,
        start() {
            startTime = performance.now() / 1000;
            tick();
        },
        stop() {
            pannerCUPS.stop();
        },
    };
}

module.exports = { createCUPSIntegration };
