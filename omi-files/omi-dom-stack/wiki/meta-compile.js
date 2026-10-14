'use strict';
/**
 * wiki/meta-compile.js — data-driven walkthrough compiler.
 *
 * Loads wiki/chapters/*.json in `order`, validates relationships, and emits:
 *   index: chapter index (also served at /wiki/index.json)
 *   streams: one JSONL/NDJSON line per vertex and per edge, per chapter
 *   streamComplete: concatenation of all chapter streams (deterministic)
 *   vtt: web-vtt timeline of all walkthrough cues
 *   tally: chapter totals (transistors, nodes, edges, stream lines)
 *   faces: the four circuit faces (BOOT0/BOOT1/SECURE/USER) + centroid
 *   digest: sha256 of the compact canonical serialization
 *
 * CLI:
 *   node wiki/meta-compile.js          emit JSON bundle to stdout
 *   node wiki/meta-compile.js --write  write out/omi-imo-wiki-bundle.json
 *   node wiki/meta-compile.js --list   list chapters + totals
 * Exits 1 with a report when validation fails.
 *
 * No external deps; plain CommonJS for Node >= 16.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const CHAPTERS_DIR = path.join(__dirname, 'chapters');
const OUT_DIR = path.join(ROOT, 'out');

const CENTROID_GATE = 0x0000;
const FACES = ['BOOT0', 'BOOT1', 'SECURE', 'USER'];

function loadChapters() {
  const files = fs.readdirSync(CHAPTERS_DIR)
    .filter((f) => /^cn-\d\d-.*\.json$/.test(f))
    .sort();
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(CHAPTERS_DIR, f), 'utf8')));
}

// ---------------------------------------------------------------- validate

function validateChapters(chapters) {
  const errors = [];
  const ids = new Set();
  const byId = new Map();

  chapters.forEach((ch) => {
    if (ids.has(ch.id)) errors.push('duplicate chapter id: ' + ch.id);
    ids.add(ch.id);
    byId.set(ch.id, ch);

    if (typeof ch.n !== 'number') errors.push(ch.id + ': missing numeric n');
    if (!Array.isArray(ch.story)) errors.push(ch.id + ': missing story[]');
    if (!Array.isArray(ch.principles)) errors.push(ch.id + ': missing principles[]');
    if (!ch.circuit || !ch.circuit.type) errors.push(ch.id + ': missing circuit');

    if (!ch.canvas || !Array.isArray(ch.canvas.nodes)) {
      errors.push(ch.id + ': missing canvas.nodes');
      return;
    }
    const nodeIds = new Set();
    ch.canvas.nodes.forEach((nd) => {
      if (!nd || !nd.id) errors.push(ch.id + ': canvas node without id');
      else if (nodeIds.has(nd.id)) errors.push(ch.id + ': duplicate canvas node id ' + nd.id);
      else nodeIds.add(nd.id);
    });

    if (ch.canvas.edges) {
      ch.canvas.edges.forEach((e) => {
        if (!e || !e.id) return errors.push(ch.id + ': edge without id');
        if (!nodeIds.has(e.fromNode)) errors.push(ch.id + ': edge ' + e.id + ' references missing fromNode ' + e.fromNode);
        if (!nodeIds.has(e.toNode)) errors.push(ch.id + ': edge ' + e.id + ' references missing toNode ' + e.toNode);
      });
    }

    if (Array.isArray(ch.sourcemap)) {
      ch.sourcemap.forEach((sm) => {
        if (!nodeIds.has(sm.smeCanvasNodeId)) {
          errors.push(ch.id + ': sourcemap entry ' + sm.smeCanvasNodeId + ' not in canvas.nodes');
        }
      });
    }

    if (ch.probes) {
      Object.keys(ch.probes).forEach((k) => {
        if (typeof ch.probes[k] === 'object' && ch.probes[k].row) return; // breadboard coordinate
        if (typeof ch.probes[k] === 'object' && ch.probes[k].value !== undefined) return; // fixed-point probe
        if (!nodeIds.has(k)) errors.push(ch.id + ': probe ' + k + ' not in canvas.nodes');
      });
    }

    if (Array.isArray(ch.cues)) {
      ch.cues.forEach((c) => {
        if (typeof c.start !== 'number' || typeof c.end !== 'number' || c.start > c.end) {
          errors.push(ch.id + ': cue ' + c.id + ' has invalid start/end');
        }
      });
    }

    if (Array.isArray(ch.build)) {
      ch.build.forEach((b) => {
        (b.place || []).forEach((p) => {
          if (!nodeIds.has(p)) errors.push(ch.id + ': build step ' + b.step + ' places unknown node ' + p);
        });
      });
    }

    if (ch.verification) {
      ch.verification.forEach((row) => {
        const expected = xorOut(row.A, row.B, row.expect);
        if (row.out !== expected) {
          errors.push(ch.id + ': verification A=' + row.A + ' B=' + row.B + ' expect=' + row.expect +
            ' wrote out=' + row.out + ' but gate yields ' + expected);
        }
      });
    }
  });

  // order must be contiguous 0..n-1
  const ns = chapters.map((c) => c.n).sort((a, b) => a - b);
  for (let i = 0; i < ns.length; i++) {
    if (ns[i] !== i) errors.push('chapter order not contiguous 0..' + (ns.length - 1) + ' (got ' + ns[i] + ' at index ' + i + ')');
  }

  // faces complete
  const present = new Set(chapters.filter((c) => c.face).map((c) => c.face));
  FACES.forEach((f) => {
    if (!present.has(f)) errors.push('missing face ' + f);
  });

  return { errors, byId };
}

function xorOut(a, b, kind) {
  const x = a ^ b;
  return kind === 'xn' ? 1 - x : x;
}

// ---------------------------------------------------------------- streams

const STREAM_ROW = ['bRow', 'bCol'];
const STREAM_COL = ['bCol', 'id'];

function vertexLine(ch, nd) {
  return JSON.stringify({
    k: 'v',
    id: nd.id,
    type: nd.type || 'text',
    role: nd.role || null,
    value: nd.value != null ? nd.value : null,
    circuit: ch.circuit.variant,
    chapter: ch.n,
    row: nd.bRow != null ? nd.bRow : 0,
    col: nd.bCol != null ? nd.bCol : 0
  });
}

function edgeLine(ch, e) {
  return JSON.stringify({
    k: 'e',
    id: e.id,
    fromNode: e.fromNode,
    fromSide: e.fromSide || 'left',
    toNode: e.toNode,
    toSide: e.toSide || 'right',
    label: e.label || null,
    circuit: ch.circuit.variant,
    chapter: ch.n
  });
}

function chapterStream(ch) {
  const nodes = (ch.canvas.nodes || []).slice();
  nodes.sort((a, b) => {
    for (const key of STREAM_ROW) {
      const av = a[key] != null ? a[key] : 0;
      const bv = b[key] != null ? b[key] : 0;
      if (av !== bv) return av - bv;
    }
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  const edges = (ch.canvas.edges || []).slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return nodes.map((nd) => vertexLine(ch, nd)).concat(edges.map((e) => edgeLine(ch, e))).join('\n');
}

// ---------------------------------------------------------------- centroid

function centroidOf(chapters) {
  const masks = {};
  chapters.filter((c) => c.face).forEach((c) => {
    masks[c.face] = c.mask != null ? c.mask : 0;
  });
  let xor = 0;
  FACES.forEach((f) => {
    xor ^= masks[f] || 0;
  });
  return {
    faces: masks,
    xor: xor,
    xorHex: '0x' + xor.toString(16).padStart(4, '0'),
    gate: CENTROID_GATE,
    gateHex: '0x' + CENTROID_GATE.toString(16).padStart(4, '0'),
    balanced: xor === CENTROID_GATE && Object.keys(masks).length === FACES.length
  };
}

// ---------------------------------------------------------------- VTT

function buildVtt(chapters) {
  let lines = ['WEBVTT', '', ''];
  let offset = 0;
  let cueNo = 1;
  chapters.forEach((ch) => {
    (ch.cues || []).forEach((c) => {
      const start = offset + c.start;
      const end = offset + c.end;
      lines.push(String(cueNo));
      lines.push(vttTime(start) + ' --> ' + vttTime(end));
      lines.push(c.text);
      lines.push('');
      cueNo++;
    });
    offset += maxCueEnd(ch);
  });
  return lines.join('\n');
}

function maxCueEnd(ch) {
  let m = 0;
  (ch.cues || []).forEach((c) => {
    if (c.end > m) m = c.end;
  });
  return m;
}

function vttTime(sec) {
  const s = Math.floor(sec);
  const ms = Math.round((sec - s) * 1000);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return (
    String(hh).padStart(2, '0') + ':' +
    String(mm).padStart(2, '0') + ':' +
    String(ss).padStart(2, '0') + '.' +
    String(ms).padStart(3, '0')
  );
}

// ---------------------------------------------------------------- compile

function compileWiki() {
  const chapters = loadChapters();
  const { errors } = validateChapters(chapters);
  if (errors.length) {
    return { ok: false, errors };
  }
  chapters.sort((a, b) => a.n - b.n);

  const streams = {};
  let streamComplete = [];
  let nodes = 0;
  let edges = 0;
  let transistors = 0;
  let resistors = 0;

  const index = chapters.map((ch) => ({
    id: ch.id,
    n: ch.n,
    name: ch.name,
    role: ch.role,
    face: ch.face,
    led: ch.led,
    mask: ch.mask,
    circuit: ch.circuit,
    transistors: ch.circuit.transistors,
    resistors: ch.circuit.resistors
  }));

  chapters.forEach((ch) => {
    const lines = chapterStream(ch);
    streams[ch.id] = lines;
    streamComplete.push(lines);
    nodes += ch.canvas.nodes.length;
    edges += ch.canvas.edges.length;
    if (ch.face) {
      transistors += ch.circuit.transistors;
      resistors += ch.circuit.resistors;
    }
  });

  const tally = {
    chapters: index.length,
    transistorCount: transistors,
    resistorCount: resistors,
    totalNodes: nodes,
    totalEdges: edges,
    streamLines: streamComplete.join('\n').split('\n').filter(Boolean).length
  };

  const bundle = {
    name: 'omi-imo-wiki-meta-compile',
    version: '1.0.0',
    license: 'CC0-1.0',
    generatedAt: new Date().toISOString(),
    route: '/wiki',
    index: index,
    streams: streams,
    streamComplete: streamComplete.join('\n'),
    vtt: buildVtt(chapters),
    cues: chapters.reduce((acc, ch) => acc.concat(ch.cues || []), []),
    tally: tally,
    faces: facesSummary(chapters),
    centroid: centroidOf(chapters),
    chapters: chapters
  };

  bundle.digest = sha256(bundle);
  return { ok: true, bundle };
}

function facesSummary(chapters) {
  const out = {};
  chapters.filter((c) => c.face).forEach((c) => {
    out[c.face] = {
      role: c.role,
      variant: c.circuit.variant,
      mask: c.mask,
      led: c.led,
      probes: c.probes || {}
    };
  });
  return out;
}

function sha256(bundle) {
  const view = Object.assign({}, bundle);
  delete view.digest;
  delete view.generatedAt;
  delete view.chapters;
  const canonical = canonicalize(view);
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}

function canonicalize(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
}

// ---------------------------------------------------------------- CLI

function main() {
  const argv = process.argv.slice(2);
  const result = compileWiki();

  if (!result.ok) {
    console.error('meta-compile FAILED:');
    result.errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }

  const { bundle } = result;

  if (argv.includes('--list')) {
    console.log('omi-imo wiki chapters (' + bundle.index.length + '):');
    bundle.index.forEach((c) => {
      const gate = bundle.centroid.faces[c.face];
      const line = [
        'cn-' + String(c.n).padStart(2, '0'),
        String(c.role).padEnd(9),
        String(c.name || c.id).padEnd(30),
        String(c.led || '').padEnd(6),
        String(c.face || '').padEnd(8),
        'mask=' + (c.face ? '0x' + gate.toString(16).padStart(4, '0') : '0x0000'),
        String(c.transistors).padStart(2) + 't'
      ];
      console.log('  ' + line.join(' '));
    });
    console.log('tally:', JSON.stringify(bundle.tally));
    console.log('centroid:', bundle.centroid.xorHex, 'gate', bundle.centroid.gateHex,
      bundle.centroid.balanced ? 'BALANCED' : 'UNBALANCED');
    console.log('digest:', bundle.digest);
    return;
  }

  const json = JSON.stringify(bundle, null, 2);

  if (argv.includes('--write')) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const file = path.join(OUT_DIR, 'omi-imo-wiki-bundle.json');
    fs.writeFileSync(file, json + '\n');
    console.log('wrote ' + file);
    console.log('digest: ' + bundle.digest);
  } else {
    process.stdout.write(json + '\n');
  }
}

module.exports = {
  compileWiki,
  validateChapters,
  centroidOf,
  chapterStream,
  buildVtt,
  CENTROID_GATE,
  FACES
};

if (require.main === module) main();