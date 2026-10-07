---
id: SPEC-50
title: "Stream Transport and JSONL"
kind: spec
layer: runtime
status: canonical
spec: OMI-IMO-2026
up: "[[OMI-IMO]]"
down:
  - "[[SPEC-51 JSON Canvas Interchange]]"
  - "[[SPEC-52 The REPL and the Digest]]"
  - "[[SPEC-53 Clocks and Periods]]"
  - "[[SPEC-54 The Web Platform Layers]]"
  - "[[SPEC-55 ASCII Folds]]"
related:
  - "[[SPEC-23 The Rosetta Stone]]"
  - "[[SPEC-25 The Iff]]"
  - "[[SPEC-30 The Symbol Table G]]"
  - "[[SPEC-54 The Web Platform Layers]]"
sources:
  - "[[SRC-07 The OMI-IMO Complete Synthesis]]"
  - "[[SRC-00 Protocol Review and Bug Fixes]]"
  - "[[SRC-03 Protocol Sequence Analysis]]"
  - "[[SRC-04 Assembly Register Programming]]"
code:
  - "rosetta/src/bin.ts"
  - "rosetta/src/main.ts"
dimensions: []
symbols: []
tags: [omi-imo, stream, transport, JSONL, NDJSON, HTTP, SSE, WebVTT]
---

# Stream Transport and JSONL

## Definition

The stream is the transport. Each vertex and each edge is one line of the JSONL/NDJSON stream.

From `rosetta/src/unified_canonical_statement.yaml`:

```yaml
stream: "The stream is the transport. Each vertex and each edge is one line of the JSONL/NDJSON stream."
```

## The Stream Bus

From `rosetta/src/bin.ts`:

```javascript
function createStreamBus() {
    const subscribers = new Map();
    const queue = [];

    return {
        subscribe(id, handler) {
            subscribers.set(id, handler);
        },
        unsubscribe(id) {
            subscribers.delete(id);
        },
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
        peek() {
            return queue.slice();
        },
        drain() {
            const out = queue.slice();
            queue.length = 0;
            return out;
        },
    };
}
```

The stream bus is a CUPS-like spooler. It has subscribers, a queue, and publish/subscribe semantics.

## The WebVTT Cue Producer

From `rosetta/src/bin.ts`:

```javascript
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
```

The WebVTT cue producer converts cues to WebVTT format. Each cue has an ID, start time, end time, and payload.

## The CUPS Integration

From `rosetta/src/bin.ts`:

```javascript
function createCUPSIntegration(audioContext) {
    const streamBus = createStreamBus();
    const pannerCUPS = createPannerCUPS(audioContext, streamBus);

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
```

The CUPS integration is a CUPS-like spooler. It schedules cues and publishes them to the stream bus at the appropriate time.

## The HTTP/1.1 Wire Carrier

From the synthesis:

```
X-VTT-Cue-0x00: 00:01.000 --> 00:02.000; block=FF001C1D1E1F20FF;
context=B36_Q0; token=FRONT:^A1F9$; layer=-1D
```

The Service Worker intercepts, parses, and emits WebVTT cues. The cues are consumed by the DOM's `<track>` element.

## The SSE Server

From `rosetta/src/main.ts`:

```typescript
const sse = http
    .createServer((request, response) => {
        if (request.url?.toLowerCase() === "/events") {
            response.writeHead(200, {
                Connection: "keep-alive",
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*"
            });
            sendEvents(response, eventHistory);
        }
    });
sse.listen(8000, () => {
    console.log("Server running at http://127.0.0.1:8000/");
});
```

The SSE server sends events to the client. The events are flight state updates.

## The REPL Server

From `rosetta/src/main.ts`:

```typescript
const server = http
    .createServer((request, response) => {
        response.setHeader('content-type', 'multipart/octet-stream');
        replServer = repl.start({
            prompt: 'curl repl> ',
            input: request,
            output: response,
            terminal: false,
            useColors: true,
            useGlobal: false,
            eval: myEval,
            writer: myWriter
        });
        defineCommands(replServer, replServer.context);
        replServer.on('reset', () => defineCommands(replServer!, replServer.context));
    });
server.listen(3000, () => {
    console.log("Server running at http://127.0.0.1:3000/");
});
```

The REPL server is an HTTP server that starts a Node.js REPL on each request. The REPL has custom commands defined by `defineCommands`.

## The Stream as the Transport

The stream is the transport. The protocol is a stream protocol. Each message is one line of the JSONL/NDJSON stream. The stream is the wire.

```
JSONL/NDJSON    — the wire format
stream          — the transport
cue             — the message
```
