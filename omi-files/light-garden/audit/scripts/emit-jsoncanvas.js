#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_DX = 360;
const DEFAULT_DY = 220;
const DEFAULT_W = 320;
const DEFAULT_H = 180;

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[key] = val;
  }
  return out;
}

function readNdjson(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function normalizeEvent(src, index) {
  const payload = src && typeof src.payload === 'object' && src.payload !== null ? src.payload : {};
  const event = typeof src.event === 'string' && src.event ? src.event : 'unknown.event';
  const seq = Number.isFinite(Number(src.seq)) ? Number(src.seq) : (index + 1);
  const timestamp = src.timestamp || src.time || null;
  return { seq, event, timestamp, payload };
}

function laneRow(event) {
  if (/^(run\.|horiz\.catalog\.|matrix\.)/.test(event)) return 0;
  if (/^(phase\.|bench\.run\.|horiz\.repo\.probe\.|capability\.run\.)/.test(event)) return 1;
  if (/^(replay\.patch|bench\.metrics|horiz\.capability\.|capability\.metrics|horiz\.repo\.probe\.fail)/.test(event)) return 2;
  if (/^(restore_|bench\.summary|horiz\.probe\.end|position\.|checkpoint\.|horiz\.probe\.stop)/.test(event)) return 3;
  return 1;
}

function toMarkdown(eventObj) {
  const payloadText = JSON.stringify(eventObj.payload || {}, null, 2);
  const ts = eventObj.timestamp || 'n/a';
  return [
    `**event:** ${eventObj.event}`,
    `**seq:** ${eventObj.seq}`,
    `**ts:** ${ts}`,
    '',
    '```json',
    payloadText,
    '```'
  ].join('\n');
}

function emitCanvasFromEvents(events, outPath, lane, fileNodes = []) {
  const nodes = [];
  const edges = [];
  const idSet = new Set();
  const bySeq = new Map();

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const id = `e:${e.seq}`;
    if (idSet.has(id)) continue;
    idSet.add(id);
    bySeq.set(e.seq, id);
    const x = e.seq * DEFAULT_DX;
    const y = laneRow(e.event) * DEFAULT_DY;
    nodes.push({
      id,
      type: 'text',
      x,
      y,
      width: DEFAULT_W,
      height: DEFAULT_H,
      text: toMarkdown(e)
    });
  }

  const sorted = [...events].sort((a, b) => a.seq - b.seq);
  for (let i = 0; i < sorted.length - 1; i++) {
    const fromNode = bySeq.get(sorted[i].seq);
    const toNode = bySeq.get(sorted[i + 1].seq);
    if (!fromNode || !toNode) continue;
    edges.push({
      id: `edge:seq:${sorted[i].seq}->${sorted[i + 1].seq}`,
      fromNode,
      toNode,
      toEnd: 'arrow'
    });
  }

  for (const e of sorted) {
    if (e.event !== 'replay.patch') continue;
    const target = Number(e.payload && e.payload.target_seq);
    if (!Number.isFinite(target)) continue;
    const fromNode = bySeq.get(e.seq);
    const toNode = bySeq.get(target);
    if (!fromNode || !toNode) continue;
    edges.push({
      id: `edge:patch:${e.seq}->${target}`,
      fromNode,
      toNode,
      toEnd: 'arrow',
      label: `target_seq=${target}`
    });
  }

  let fileX = DEFAULT_DX;
  const fileY = 4 * DEFAULT_DY;
  for (const fileNode of fileNodes) {
    if (!fileNode || !fileNode.path) continue;
    const id = `f:${fileNode.id || fileNode.path}`;
    nodes.push({
      id,
      type: 'file',
      x: fileX,
      y: fileY,
      width: DEFAULT_W,
      height: 120,
      file: fileNode.path,
      subpath: fileNode.path
    });
    if (sorted.length > 0) {
      const tailId = bySeq.get(sorted[sorted.length - 1].seq);
      if (tailId) {
        edges.push({
          id: `edge:file:${tailId}->${id}`,
          fromNode: tailId,
          toNode: id,
          toEnd: 'arrow'
        });
      }
    }
    fileX += DEFAULT_DX;
  }

  const doc = {
    schema_version: 1,
    lane,
    nodes,
    edges
  };

  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n', 'utf8');
}

function main() {
  const args = parseArgs(process.argv);
  const inPath = args.in;
  const outPath = args.out;
  const lane = String(args.lane || 'bench');
  if (!inPath || !outPath) {
    console.error('usage: emit-jsoncanvas.js --in <ndjson> --out <canvas.json> [--lane <lane>]');
    process.exit(1);
  }
  const events = readNdjson(path.resolve(inPath)).map(normalizeEvent);
  emitCanvasFromEvents(events, path.resolve(outPath), lane, []);
}

if (require.main === module) {
  main();
}

module.exports = {
  emitCanvasFromEvents,
  normalizeEvent
};
