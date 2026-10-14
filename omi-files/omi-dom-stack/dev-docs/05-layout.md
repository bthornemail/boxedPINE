# 05 — Layout of the repo

Plain CommonJS, Node >= 16, no build step, no lint, no test framework. Only
runtime dependency: `ws`. Package name `omi-imo`, subpath exports
(`/pipeline`, `/plugin-api`, `/ruler`, `/solid-toolkit`, `/dimension-pipeline`)
map to `shared/*.js`.

```
omi-dom-stack/
├── server/
│   ├── server.js          zero-dep HTTP server (http/fs/path); routes below
│   └── signaling.js       WebSocket /signal + witness gossip (ws); loads
│                          gracefully if ws absent
├── shared/                THE PROTOCOL (every module exports selfTest())
│   ├── pattern-pipeline.js    main entry — the transmission chain
│   ├── ruler.js               bind/apply/eval/digest + 6 invariants
│   ├── clock-sliderule.js     16-bit coordinate ruler
│   ├── hit-zones-cues.js      cue/zone model (drives wiki probes)
│   ├── dimension-pipeline.js  lift vectors through spatial dims
│   ├── parallel-engine.js     worker_threads engine (async selfTest, SAB
│   │                          falls back safely)
│   ├── busybox.js            busybox-style binaries (busybox-versioned too)
│   ├── ascii-table.js        128-entry table + 6-core formal suite
│   ├── solid-toolkit.js      32-bit solids engine
│   ├── solid-toolkit-extended.js
│   ├── solid-to-triple.js    solids → Steiner triples
│   ├── edge-ngram.js         n-gram edges over glyph streams
│   ├── spatial-gnn.js        spatial GNN pass over the cone
│   ├── contrasting-orchestrator.js
│   ├── plugin-api.js         extension surface
│   ├── hardware-ref.js       JS port of the C 19-vector reference
│   ├── blob-substrate.js     blob store + substrate
│   ├── prolog-resolve.js     resolution over rules/facts/clauses
│   ├── fano-lottery.js       Fano-plane lottery (the /api/cues draw)
│   ├── + witness/agreement/observer/byzantine/barrier/p2p
│   └── (CLEAN SLATE: 0p-type.js will live here when built)
├── client/                browser JS + HTML, no bundler; some double as
│                          Node worker code (transmute-coordinator/worker)
├── wiki/
│   ├── chapters/*.json    THE single source of truth (4 faces + prologue/epilogue)
│   └── meta-compile.js    deterministic validator/compiler CLI
├── hardware/
│   ├── c/omi_hw_ref.c     C reference, 19 vectors (compiled only by final-test.sh)
│   └── docs/CORRESPONDENCE.md
├── docs/                  markdown served at /docs/*
├── test/                  plain-node suites (no framework)
│   ├── inter-instance.test.js   32 checks: agreement/witness/observer/byz/barrier
│   ├── transmute.test.js        lossless audio/video transmutation (workers)
│   └── network-versions.test.js live cross-origin test vs Grok omi-walkthrough
├── dev-docs/              YOU ARE HERE — scratch, not served, not canonical
├── package.json           npm test = sync selfTest roster
├── final-test.sh          the gate (bash, not executable bit)
└── AGENTS.md              the operating manual
```

## Server routes (`server/server.js`)

```
/                      content-negotiated (HTML beats SSE)
/adopt, /genesis, /genesis-fold
/events                SSE: rungs + constant + base60 ticks
/api/pipeline          GET | POST ?q / ?text
/api/bundle            meta-compile JSON (wiki embedded)
/api/wiki
/api/witness, /api/witness/:id, /api/agree, /api/observers
/api/substrate
/agent, /agent/world
/api/cues
/wiki, /wiki/index.json, /wiki/chapters/*
/docs/*
/client/*, /shared/*
/signal                WebSocket (ws)
```

If a new client file or route is added, it must be added to BOTH the route list
in `server/server.js` AND `final-test.sh`. If a new shared module is added, add
its name to BOTH the `npm test` array in `package.json` and the loop in
`final-test.sh` (they differ slightly — final-test also covers
`parallel-engine` and `hardware-ref`).

Read on → [06-walkthrough-and-agent-world.md](06-walkthrough-and-agent-world.md).