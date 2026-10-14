/**
 * OMI-IMO HTTP/1.1 Content-Negotiation + SSE Server
 * Serves:
 *   Accept: text/html          → bootstrap.html (Full DOM Stack)
 *   Accept: text/event-stream  → SSE event stream
 *   Static client assets
 *
 * Orthogonal transport layer of the seven-layer stack.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8742;
const ROOT = path.resolve(__dirname, '..');
const CLIENT = path.join(ROOT, 'client');
const AGENT = path.join(ROOT, 'agent');
const DATA_DIR = path.join(ROOT, 'data');
const SUBSTRATE_FILE = path.join(DATA_DIR, 'substrate.json');

// Canonical substrate: the single shared data volume every terminal joins.
// Epoch advances only via Atomics.compareExchange (the delta law). Persisted
// to disk on change so the simulation lives across restarts — the delta keeps
// counting from where it left off, driven entirely by the atomic kernel.
let substrate = null;
let SUBSTRATE = null;
try {
  substrate = require('../shared/blob-substrate');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  SUBSTRATE = substrate.bind();
} catch (e) {
  console.error('[substrate] unavailable:', e.message);
}
let fanoLottery = null;
try { fanoLottery = require('../shared/fano-lottery'); } catch (e) {
  console.error('[fano] unavailable:', e.message);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml'
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function contentType(filePath) {
  return MIME[path.extname(filePath)] || 'application/octet-stream';
}

function preferHtml(accept) {
  if (!accept) return true;
  const parts = accept.split(',').map(s => s.trim().toLowerCase());
  const htmlQ = parts.find(p => p.startsWith('text/html')) ? 1 : 0;
  const sseQ  = parts.find(p => p.startsWith('text/event-stream')) ? 1 : 0;
  // Simple preference: if both present, HTML wins for navigation; SSE for EventSource
  return htmlQ >= sseQ;
}

// NOTE: COOP + COEP are already set globally in the request handler below, so
// every page in this server is cross-origin isolated and SharedArrayBuffer is
// already available in the browser. The portal needs no special-casing and gets
// none — see the "CORS + cross-origin isolation" block in createServer.

function serveFile(res, filePath, extraHeaders) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
      return;
    }
    send(res, 200, Object.assign({
      'Content-Type': contentType(filePath),
      'Cache-Control': 'no-cache',
      'Vary': 'Accept'
    }, extraHeaders || null), data);
  });
}

// ---------- Substrate persistence (delta-only, no time) ----------

let persistTimer = null;

function persistSubstrate() {
  if (!SUBSTRATE) return;
  try {
    const { view, shared } = SUBSTRATE;
    const snap = substrate.snapshotJSON(view, shared);
    const json = JSON.stringify(snap);
    fs.writeFileSync(path.join(DATA_DIR, 'substrate.json.tmp'), json);
    fs.renameSync(path.join(DATA_DIR, 'substrate.json.tmp'), SUBSTRATE_FILE);
  } catch (e) {
    console.error('[substrate] persist error:', e.message);
  }
}

function loadSubstrate() {
  if (!SUBSTRATE) return;
  try {
    if (!fs.existsSync(SUBSTRATE_FILE)) {
      persistSubstrate();
      return;
    }
    const snap = JSON.parse(fs.readFileSync(SUBSTRATE_FILE, 'utf8'));
    if (!snap || !Array.isArray(snap.slots)) return;
    const { view, shared } = SUBSTRATE;
    substrate.restore(SUBSTRATE, view, shared, snap, { force: true });
    console.log(`[substrate] restored ${snap.slots.length} slots, epoch=${snap.epoch}`);
  } catch (e) {
    console.error('[substrate] load error:', e.message);
  }
}

function persistAndReturn(snapshot) {
  persistSubstrate();
  return snapshot;
}

loadSubstrate();

if (SUBSTRATE) {
  // Period: persist every 32 deltas. Not a timed clock — the delta drives it.
  const { view, shared } = SUBSTRATE;
  const lastPersistEpochRef = { epoch: substrate.centroid(view, shared).epoch };
  if (!persistTimer) {
    persistTimer = setInterval(() => {
      const e = substrate.centroid(view, shared).epoch;
      if (e - lastPersistEpochRef.epoch >= 32) {
        lastPersistEpochRef.epoch = e;
        persistSubstrate();
      }
    }, 1000);
  }
  process.on('SIGINT', () => {
    persistSubstrate();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    persistSubstrate();
    process.exit(0);
  });
}

function handleSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Vary': 'Accept',
    'X-OMI-Layer': 'http1.1-carrier'
  });

  // Initial comment / retry
  res.write(': OMI-IMO SSE stream\n');
  res.write('retry: 3000\n\n');

  let n = 0;
  // Each SSE impulse advances the shared epoch by one delta. There is no
  // analog clock here: the heartbeat IS a delta applied to the substrate.
  const timer = setInterval(() => {
    n++;
    let e = 0, fold = -1;
    if (SUBSTRATE) {
      e = substrate.delta(SUBSTRATE, SUBSTRATE.view, SUBSTRATE.shared, 1);
      fold = substrate.centroid(SUBSTRATE.view, SUBSTRATE.shared).fold;
    }
    const tk = substrate ? substrate.token(`t${e}`, `substrate`) : null;
    const payload = JSON.stringify({
      delta: n,
      epoch: e,
      foldHex: fold < 0 ? null : `0x${(fold >>> 0).toString(16).padStart(4, '0')}`,
      coord: tk ? tk.coord : null,
      layer: 'carrier',
      msg: 'delta'
    });
    res.write(`id: ${e}\n`);
    res.write(`event: omi\n`);
    res.write(`data: ${payload}\n\n`);
    // Snapshot every 32 deltas so persistence and observability share a cadence.
    if (SUBSTRATE && (n % 32 === 0)) persistSubstrate();
  }, 2000);

  req.on('close', () => {
    clearInterval(timer);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const accept = req.headers.accept || '';

  // CORS + cross-origin isolation for local experimentation.
  // COOP+COEP make crossOriginIsolated === true so every terminal can hold
  // the SAME SharedArrayBuffer and contend on the same Atomics.compareExchange.
  // This is the entire shared-universe gate; without it browsers throw on SAB.
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');

  // Isolation handshake used by the client: report crossOriginIsolated + SAB
  if (url.pathname === '/isolation' && req.method !== 'OPTIONS') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<html>ok</html>');
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // SSE endpoint
  if (url.pathname === '/events' || accept.includes('text/event-stream')) {
    handleSSE(req, res);
    return;
  }

  // Root / bootstrap — content negotiation
  if (url.pathname === '/' || url.pathname === '/bootstrap' || url.pathname === '/index.html') {
    if (preferHtml(accept) || !accept.includes('text/event-stream')) {
      serveFile(res, path.join(CLIENT, 'bootstrap.html'));
      return;
    }
    // rare: client asked for event-stream on /
    handleSSE(req, res);
    return;
  }

  // The front door: the two-click demo. Three peers, no server, no clock.
  if (url.pathname === '/portal' || url.pathname === '/portal.html') {
    serveFile(res, path.join(CLIENT, 'portal.html'));
    return;
  }

  // Adoption bootstrap demo
  if (url.pathname === '/adopt' || url.pathname === '/adopt.html') {
    serveFile(res, path.join(CLIENT, 'adopt.html'));
    return;
  }

  // Genesis narrative walkthrough
  if (url.pathname === '/genesis' || url.pathname === '/genesis.html') {
    serveFile(res, path.join(CLIENT, 'genesis.html'));
    return;
  }

  // Interactive fold: torus ↔ Dali Cross
  if (url.pathname === '/genesis-fold' || url.pathname === '/genesis-fold.html') {
    serveFile(res, path.join(CLIENT, 'genesis-fold.html'));
    return;
  }

  // Walkthrough wiki: the data-driven breadboard player
  if (url.pathname === '/wiki' || url.pathname === '/wiki.html') {
    serveFile(res, path.join(CLIENT, 'wiki.html'));
    return;
  }

  // Living universe: popup book + Steiner cone lattice
  if (url.pathname === '/universe' || url.pathname === '/universe.html') {
    serveFile(res, path.join(CLIENT, 'universe.html'));
    return;
  }

  // DevTools for media: the protocol's UI (inspect/decompose/modify/recompose)
  if (url.pathname === '/devtools' || url.pathname === '/devtools.html') {
    serveFile(res, path.join(CLIENT, 'devtools.html'));
    return;
  }

  // Transistor circuit: the four XOR realizations (5T/6T/8T/10T) as Web Audio
  // graphs — carrier oscillators gated by transistors (gain), placed in the
  // stereo field (StereoPanner), read by the spectrometer (AnalyserNode).
  if (url.pathname === '/agent' || url.pathname === '/agent.html') {
    serveFile(res, path.join(AGENT, 'transistor-circuit.html'));
    return;
  }

  // Agent world: the four agent rods on the Steiner lattice (epoch-driven)
  if (url.pathname === '/agent/world' || url.pathname === '/agent/world.html') {
    serveFile(res, path.join(AGENT, 'world.html'));
    return;
  }

  if (url.pathname === '/agent/transistor-circuit.html' || url.pathname === '/agent/transistor-circuit.js' ||
      url.pathname === '/agent/world.html' || url.pathname === '/agent/world.js') {
    serveFile(res, path.join(AGENT, path.basename(url.pathname)));
    return;
  }

  // Popup-book cues: VTT-track facts bound via media queries. Each POST runs
  // the Fano-plane lottery: up to 14 cycles to wire the fact to a recognized
  // media channel (screen/print today, more as the lattice grows) or report
  // it is not allocatable.
  const CUES_FILE = path.join(DATA_DIR, 'cues.json');
  if (url.pathname === '/api/cues') {
    if (req.method === 'GET') {
      let cues = [];
      try { cues = JSON.parse(fs.readFileSync(CUES_FILE, 'utf8')); } catch (_) {}
      send(res, 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' },
        JSON.stringify({ ok: true, count: cues.length, cues }));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        let body2 = {};
        try { body2 = JSON.parse(body || '{}'); } catch (_) {}
        body2 = {
          name: String(body2.name || 'fact'),
          media: String(body2.media || ''),
          text: String(body2.text || 'xor')
        };

        let e = 0, alloc = null;
        if (substrate && SUBSTRATE) {
          e = substrate.delta(SUBSTRATE, SUBSTRATE.view, SUBSTRATE.shared, 1); // each bind = 1 delta
          if (fanoLottery) {
            const day = Math.floor(substrate.centroid(SUBSTRATE.view, SUBSTRATE.shared).epoch / 16);
            // live wires grow ~1 point/day from the 2 today: min(7, 2 + day/7)
            const liveCount = Math.min(7, 2 + Math.floor(day / 7));
            alloc = fanoLottery.allocate({ name: body2.name, text: body2.text, day, liveCount });
          }
        } else {
          e = (Date.now() % 1000000) | 0;
        }

        const cue = {
          id: e,
          name: body2.name,
          media: body2.media || (alloc && alloc.allocatable && alloc.media) || 'all',
          text: body2.text,
          lottery: alloc ? {
            allocatable: alloc.allocatable,
            cycles: alloc.cycles,
            point: alloc.point,
            media: alloc.media,
            line: alloc.line,
            live: alloc.live,
            note: alloc.note
          } : null
        };
        let cues = [];
        try { cues = JSON.parse(fs.readFileSync(CUES_FILE, 'utf8')); } catch (_) {}
        cues.push(cue);
        if (cues.length > 720) cues.splice(0, cues.length - 720); // shed weight, keep balance
        fs.writeFileSync(CUES_FILE, JSON.stringify(cues, null, 2));
        const c = substrate && SUBSTRATE ? substrate.centroid(SUBSTRATE.view, SUBSTRATE.shared).epoch : e;
        send(res, 200, { 'Content-Type': 'application/json; charset=utf-8' },
          JSON.stringify({ ok: true, cue, epoch: c }));
      });
      return;
    }
    send(res, 405, { 'Content-Type': 'text/plain' }, 'Method Not Allowed');
    return;
  }

  // Substrate: the shared living data volume (join / delta / reconcile).
  if (url.pathname === '/api/substrate' && SUBSTRATE) {
    const { view, shared } = SUBSTRATE;
    const c = substrate.centroid(view, shared);
    if (req.method === 'GET') {
      const snap = substrate.snapshotJSON(view, shared);
      const payload = {
        ok: true,
        epoch: c.epoch,
        foldHex: `0x${(c.fold >>> 0).toString(16).padStart(4, '0')}`,
        sealed: c.fold === 0,
        vertices: [0, 1, 2, 3].map((i) => substrate.vertex(view, i, shared)),
        centroid: c,
        slots: snap.slots,
        version: snap.version,
        bytes: snap.bytes
      };
      send(res, 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' },
        JSON.stringify(payload));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        let action = 'delta', remoteEpoch = -1;
        try {
          const parsed = JSON.parse(body || '{}');
          action = parsed.action || 'delta';
          remoteEpoch = Number.isInteger(parsed.epoch) ? parsed.epoch : -1;
        } catch (_) { action = 'delta'; }
        if (action === 'delta') {
          const e = substrate.delta(SUBSTRATE, view, shared, 1);
          const snap = substrate.snapshotJSON(view, shared);
          send(res, 200, { 'Content-Type': 'application/json; charset=utf-8' },
            JSON.stringify({ ok: true, action: 'delta', epoch: e, sealed: snap.sealed }));
          return;
        }
        if (action === 'reconcile') {
          const local = { epoch: c.epoch, utc: Date.now() };
          const remote = { epoch: remoteEpoch >= 0 ? remoteEpoch : 0, utc: 0 };
          const rec = substrate.reconcile(SUBSTRATE, view, shared, local, remote);
          const snap = substrate.snapshotJSON(view, shared);
          send(res, 200, { 'Content-Type': 'application/json; charset=utf-8' },
            JSON.stringify({ ok: true, action: 'reconcile', ...rec, sealed: snap.sealed }));
          return;
        }
        send(res, 400, { 'Content-Type': 'application/json' }, JSON.stringify({ ok: false, error: `unknown action ${action}` }));
      });
      return;
    }
    send(res, 405, { 'Content-Type': 'text/plain' }, 'Method Not Allowed');
    return;
  }

  // Walkthrough wiki chapter data + generated index
  if (url.pathname === '/wiki/index.json') {
    try {
      const { compileWiki } = require(path.join(__dirname, '..', 'wiki', 'meta-compile.js'));
      const result = compileWiki();
      if (!result.ok) throw new Error(result.errors.join('; '));
      send(res, 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' },
        JSON.stringify({ index: result.bundle.index, centroid: result.bundle.centroid, tally: result.bundle.tally }, null, 2));
    } catch (err) {
      send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ ok: false, error: String(err.message || err) }));
    }
    return;
  }
  if (url.pathname.startsWith('/wiki/chapters/')) {
    const safe = path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(ROOT, safe);
    if (!filePath.startsWith(path.join(ROOT, 'wiki', 'chapters'))) {
      send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
      return;
    }
    serveFile(res, filePath);
    return;
  }
  if (url.pathname === '/api/wiki') {
    try {
      const { compileWiki } = require(path.join(__dirname, '..', 'wiki', 'meta-compile.js'));
      const result = compileWiki();
      if (!result.ok) {
        send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ ok: false, errors: result.errors }));
        return;
      }
      const body = JSON.stringify({
        ok: true,
        name: result.bundle.name,
        version: result.bundle.version,
        index: result.bundle.index,
        tally: result.bundle.tally,
        faces: result.bundle.faces,
        centroid: result.bundle.centroid,
        vtt: result.bundle.vtt,
        digest: result.bundle.digest,
        chapters: result.bundle.chapters
      }, null, 2);
      send(res, 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' }, body);
    } catch (err) {
      send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ ok: false, error: String(err.message || err) }));
    }
    return;
  }

  // Docs (markdown as text/markdown)
  if (url.pathname.startsWith('/docs/')) {
    const safe = path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(ROOT, safe);
    if (!filePath.startsWith(path.join(ROOT, 'docs'))) {
      send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        send(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
        return;
      }
      const ct = filePath.endsWith('.md') ? 'text/markdown; charset=utf-8' : contentType(filePath);
      send(res, 200, { 'Content-Type': ct }, data);
    });
    return;
  }

  // Static client assets
  if (url.pathname.startsWith('/client/')) {
    const safe = path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) {
      send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
      return;
    }
    serveFile(res, filePath);
    return;
  }

  // Shared modules (for Node workers later, and for the browser portal)
  if (url.pathname.startsWith('/shared/')) {
    const safe = path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) {
      send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
      return;
    }
    serveFile(res, filePath);
    return;
  }

  // Meta-compile: downloadable / shareable client + shared sources + genesis index
  if (url.pathname === '/api/bundle') {
    try {
      const readSafe = (rel) => {
        try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (_) { return null; }
      };
      const clientFiles = ['bootstrap.html', 'adopt.html', 'genesis.html', 'genesis-fold.html', 'wiki.html', 'wiki.js', 'genesis-interactive.js', 'webgl-renderer.js', 'webaudio-renderer.js', 'texttrack-attach.js', 'dom-stack.js', 'svg-worker.js', 'universe.html', 'universe.js', 'devtools.html', 'devtools.js', 'portal.html', 'portal.js'];
      const agentFiles = ['transistor-circuit.html', 'transistor-circuit.js', 'world.html', 'world.js'];
      const sharedFiles = [
        'pattern-pipeline.js', 'plugin-api.js', 'ruler.js', 'dimension-pipeline.js',
        'constraint-pipeline.js', 'regex-constraints.js', 'solid-toolkit.js',
        'solid-toolkit-extended.js', 'solid-to-triple.js', 'edge-ngram.js',
        'spatial-gnn.js', 'contrasting-orchestrator.js', 'clock-sliderule.js',
        'hit-zones-cues.js', 'busybox.js', 'parallel-engine.js', 'ascii-table.js',
        'algorithmic-core.js', 'blob-substrate.js', 'fano-lottery.js', 'path-protocol.js',
        'space.js', 'peers.js', 'declare.js'
      ];
      const client = {};
      for (const f of clientFiles) {
        const c = readSafe(path.join('client', f));
        if (c != null) client[f] = c;
      }
      const agent = {};
      for (const f of agentFiles) {
        const c = readSafe(path.join('agent', f));
        if (c != null) agent[f] = c;
      }
      const shared = {};
      for (const f of sharedFiles) {
        const c = readSafe(path.join('shared', f));
        if (c != null) shared[f] = c;
      }
      const bundle = {
        name: 'omi-imo-meta-compile',
        version: '2.0.0',
        license: 'CC0-1.0',
        generatedAt: new Date().toISOString(),
        genesisChapters: 23,
        routes: ['/', '/adopt', '/genesis', '/api/pipeline', '/api/bundle', '/wiki', '/api/wiki', '/api/substrate', '/events', '/universe', '/devtools', '/agent', '/api/cues', '/isolation'],
        client,
        agent,
        shared,
        wiki: (() => {
          try {
            const { compileWiki } = require(path.join(__dirname, '..', 'wiki', 'meta-compile.js'));
            const result = compileWiki();
            if (!result.ok) return { ok: false, errors: result.errors };
            return {
              ok: true,
              name: result.bundle.name,
              version: result.bundle.version,
              index: result.bundle.index,
              streamComplete: result.bundle.streamComplete,
              vtt: result.bundle.vtt,
              tally: result.bundle.tally,
              faces: result.bundle.faces,
              centroid: result.bundle.centroid,
              digest: result.bundle.digest
            };
          } catch (_) {
            return { ok: false };
          }
        })(),
        docs: {
          'GENESIS.md': readSafe(path.join('docs', 'GENESIS.md')),
          'BOOTSTRAP.md': readSafe(path.join('docs', 'BOOTSTRAP.md')),
          'README.md': readSafe(path.join('docs', 'README.md'))
        },
        substrate: SUBSTRATE
          ? (() => {
              const { view, shared } = SUBSTRATE;
              const c = substrate.centroid(view, shared);
              return {
                ok: true,
                bytes: substrate.BLOB_BYTES,
                epoch: c.epoch,
                foldHex: `0x${(c.fold >>> 0).toString(16).padStart(4, '0')}`,
                sealed: c.fold === 0
              };
            })()
          : { ok: false },
        note: 'Share or unpack client/ + shared/ sources. Run with Node >=16: node server/server.js after restoring server.js from the repo or rebuilding.'
      };
      const body = JSON.stringify(bundle, null, 2);
      send(res, 200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="omi-imo-bundle.json"',
        'Cache-Control': 'no-cache'
      }, body);
    } catch (err) {
      send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ ok: false, error: String(err.message || err) }));
    }
    return;
  }

  // API: run full −5D→10D pipeline + instantiate areas/cues/clock
  if (url.pathname === '/api/pipeline' && (req.method === 'GET' || req.method === 'POST')) {
    let body = '';
    const finish = (text) => {
      try {
        const { runFullPipeline } = require(path.join(ROOT, 'shared', 'dimension-pipeline'));
        const { instantiateFromPipeline } = require(path.join(ROOT, 'shared', 'hit-zones-cues'));
        const input = text || url.searchParams.get('q') || 'OMI bootstrap\r\ncolor Band1';
        const pipe = runFullPipeline(input);
        const inst = instantiateFromPipeline(pipe, { wireClock: true, structuredVtt: true });
        const payload = {
          ok: pipe.ok,
          tokens: pipe.tokens,
          observer: pipe.observer,
          points: pipe.points,
          rects: pipe.rects,
          matrix: pipe.matrix,
          elements: pipe.elements,
          cues: pipe.cues,
          color: pipe.color,
          svg: pipe.svg,
          validation: pipe.validation,
          mapHtml: inst.mapHtml,
          vtt: inst.vtt,
          metrics: inst.metrics,
          scheduleMetrics: inst.schedule ? inst.schedule.metrics : null
        };
        send(res, 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' }, JSON.stringify(payload));
      } catch (err) {
        send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ ok: false, error: String(err.message || err) }));
      }
    };
    if (req.method === 'POST') {
      req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
      req.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          finish(parsed.text || parsed.q || body);
        } catch (_) {
          finish(body);
        }
      });
    } else {
      finish();
    }
    return;
  }

  // --- Inter-instance agreement API ---
  const readJsonBody = (req) => new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (_) { resolve({}); }
    });
  });

  if (url.pathname === '/api/witness' && req.method === 'POST') {
    readJsonBody(req).then((payload) => {
      try {
        const { makeWitness } = require(path.join(ROOT, 'shared', 'codex-agreement'));
        const { submit } = require(path.join(ROOT, 'shared', 'witness-exchange'));
        const { runPatternPipeline } = require(path.join(ROOT, 'shared', 'pattern-pipeline'));
        let witness = payload.witness;
        if (!witness && payload.input) {
          const result = runPatternPipeline(payload.input, payload.config || {});
          witness = makeWitness(payload.instance_id || 'anonymous', payload.input, result);
        }
        if (!witness) {
          send(res, 400, { 'Content-Type': 'application/json' }, JSON.stringify({ error: 'witness or input required' }));
          return;
        }
        const id = submit(witness);
        if (typeof global.__OMI_BROADCAST_WITNESS__ === 'function') {
          global.__OMI_BROADCAST_WITNESS__(witness);
        }
        send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify({ id, witness }));
      } catch (err) {
        send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ error: String(err.message || err) }));
      }
    });
    return;
  }

  if (url.pathname.startsWith('/api/witness/') && req.method === 'GET') {
    const id = decodeURIComponent(url.pathname.slice('/api/witness/'.length));
    try {
      const { retrieve } = require(path.join(ROOT, 'shared', 'witness-exchange'));
      const w = retrieve(id);
      if (!w) {
        send(res, 404, { 'Content-Type': 'application/json' }, JSON.stringify({ error: 'not found' }));
        return;
      }
      send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify(w));
    } catch (err) {
      send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ error: String(err.message || err) }));
    }
    return;
  }

  if (url.pathname === '/api/agree' && req.method === 'POST') {
    readJsonBody(req).then((payload) => {
      try {
        const { compare } = require(path.join(ROOT, 'shared', 'witness-exchange'));
        const { agree, makeWitness } = require(path.join(ROOT, 'shared', 'codex-agreement'));
        const { runPatternPipeline } = require(path.join(ROOT, 'shared', 'pattern-pipeline'));
        if (payload.idA && payload.idB) {
          send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify(compare(payload.idA, payload.idB)));
          return;
        }
        if (payload.input) {
          const r1 = runPatternPipeline(payload.input, payload.config || {});
          const r2 = runPatternPipeline(payload.input, payload.config || {});
          const w1 = makeWitness(payload.instance_a || 'A', payload.input, r1);
          const w2 = makeWitness(payload.instance_b || 'B', payload.input, r2);
          send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify(agree(w1, w2)));
          return;
        }
        send(res, 400, { 'Content-Type': 'application/json' }, JSON.stringify({ error: 'idA/idB or input required' }));
      } catch (err) {
        send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ error: String(err.message || err) }));
      }
    });
    return;
  }

  if (url.pathname === '/api/observers' && req.method === 'GET') {
    try {
      const { list } = require(path.join(ROOT, 'shared', 'observer-sync'));
      send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify({ observers: list() }));
    } catch (err) {
      send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ error: String(err.message || err) }));
    }
    return;
  }

  if (url.pathname === '/api/observers' && req.method === 'POST') {
    readJsonBody(req).then((payload) => {
      try {
        const { register, list } = require(path.join(ROOT, 'shared', 'observer-sync'));
        if (!payload.id) {
          send(res, 400, { 'Content-Type': 'application/json' }, JSON.stringify({ error: 'id required' }));
          return;
        }
        register(payload.id, payload.position || {});
        send(res, 200, { 'Content-Type': 'application/json' }, JSON.stringify({ observers: list() }));
      } catch (err) {
        send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ error: String(err.message || err) }));
      }
    });
    return;
  }

  send(res, 404, { 'Content-Type': 'text/plain' }, 'Not Found');
});

let signaling = null;
try {
  const { createSignalingServer } = require('./signaling');
  signaling = createSignalingServer(server, { path: '/signal' });
  global.__OMI_SIGNALING__ = signaling;
} catch (err) {
  console.warn('[signal] WebSocket signaling unavailable:', err.message);
}

// Broadcast when witnesses are submitted (re-require path is already in POST /api/witness)
function broadcastWitness(w) {
  if (signaling && w) signaling.broadcast({ type: 'witness', witness: w });
}
global.__OMI_BROADCAST_WITNESS__ = broadcastWitness;

server.listen(PORT, () => {
  console.log(`OMI-IMO Full DOM Stack server listening on http://localhost:${PORT}`);
  console.log(`  GET /              → bootstrap HTML (content-negotiated)`);
  console.log(`  GET /events        → text/event-stream`);
  console.log(`  GET|POST /api/pipeline → runFullPipeline + instantiateFromPipeline`);
  console.log(`  POST /api/witness · GET /api/witness/:id · POST /api/agree · GET|POST /api/observers`);
  console.log(`  WS  /signal        → WebRTC signaling + witness gossip`);
  console.log(`  GET /client/*      → static assets`);
});
