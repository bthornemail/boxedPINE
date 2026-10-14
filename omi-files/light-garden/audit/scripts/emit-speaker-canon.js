#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ensureDir } = require('./lib');

const auditRoot = path.resolve(__dirname, '..');
const lgRoot = path.resolve(auditRoot, '..');
const devopsRoot = path.resolve(lgRoot, '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[key] = val;
  }
  return out;
}

function sha256Text(text) {
  return `sha256:${crypto.createHash('sha256').update(String(text), 'utf8').digest('hex')}`;
}

function deterministicIso(seq) {
  return `1970-01-01T00:00:${String(seq % 60).padStart(2, '0')}Z`;
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function splitBlocks(md) {
  const blocks = [];
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  function isBlank(s) {
    return !s || !String(s).trim();
  }

  while (i < lines.length) {
    // Skip blank lines.
    while (i < lines.length && isBlank(lines[i])) i += 1;
    if (i >= lines.length) break;

    const startLine = i + 1;
    const line = lines[i];

    // Headings.
    if (/^#{1,6}\s+/.test(line)) {
      blocks.push({
        kind: 'heading',
        startLine,
        text: line.trim()
      });
      i += 1;
      continue;
    }

    // Fenced code blocks.
    if (/^```/.test(line.trim())) {
      const fence = line.trim();
      const buf = [line];
      i += 1;
      while (i < lines.length) {
        buf.push(lines[i]);
        if (lines[i].trim() === fence) {
          i += 1;
          break;
        }
        i += 1;
      }
      blocks.push({
        kind: 'code',
        startLine,
        text: buf.join('\n').trimEnd()
      });
      continue;
    }

    // Paragraph/list-ish blocks (consume until blank line).
    const buf = [];
    while (i < lines.length && !isBlank(lines[i])) {
      buf.push(lines[i]);
      i += 1;
    }
    blocks.push({
      kind: 'block',
      startLine,
      text: buf.join('\n').trim()
    });
  }

  return blocks;
}

function guessChapterId(mdText) {
  const m = mdText.match(/^\s*#\s*\*\*Chapter\s+([IVXLC]+)\b/i);
  if (!m) return null;
  return `chapter-${String(m[1]).toLowerCase()}`;
}

function main() {
  const args = parseArgs(process.argv);

  const srcDir = path.resolve(devopsRoot, String(args.src || 'speaker-for-the-untitled'));
  const outPath = path.resolve(lgRoot, String(args.out || 'canon-speaker-for-the-untitled.ndjson'));

  const filesArg = args.files
    ? String(args.files).split(',').map((s) => s.trim()).filter(Boolean)
    : [
        'Untitled 40.md',
        'Untitled 41.md',
        'Untitled 42.md',
        'Untitled 43.md',
        'Untitled 44.md',
        'Untitled 45.md',
        'Untitled 46.md',
        'Untitled 47.md',
        'Untitled 48.md',
        'Untitled 49.md',
        'Untitled 50.md',
        'Untitled 51.md',
        'Untitled 52.md',
        'Untitled 53.md',
        'Untitled 79.md'
      ];

  const srcFiles = filesArg.map((name) => path.resolve(srcDir, name));
  for (const f of srcFiles) {
    if (!fs.existsSync(f)) {
      throw new Error(`missing_source:${path.relative(devopsRoot, f)}`);
    }
  }

  const events = [];
  let seq = 1;

  events.push({
    seq: seq++,
    timestamp: deterministicIso(seq),
    event: 'speaker.canon.start',
    payload: {
      source_dir: path.relative(devopsRoot, srcDir),
      file_count: srcFiles.length,
      out_file: path.relative(lgRoot, outPath)
    }
  });

  for (const abs of srcFiles) {
    const rel = path.relative(devopsRoot, abs);
    const md = readUtf8(abs);
    const blocks = splitBlocks(md);
    const chapterId = guessChapterId(md) || path.basename(abs, '.md').toLowerCase().replace(/\s+/g, '-');

    events.push({
      seq: seq++,
      timestamp: deterministicIso(seq),
      event: 'speaker.source.start',
      payload: {
        chapter_id: chapterId,
        source: rel,
        sha256: sha256Text(md),
        blocks: blocks.length
      }
    });

    for (let i = 0; i < blocks.length; i += 1) {
      const b = blocks[i];
      const text = b.text;
      if (!text) continue;
      events.push({
        seq: seq++,
        timestamp: deterministicIso(seq),
        event:
          b.kind === 'heading'
            ? 'speaker.heading'
            : b.kind === 'code'
              ? 'speaker.code'
              : 'speaker.block',
        payload: {
          chapter_id: chapterId,
          source: rel,
          source_line: b.startLine,
          kind: b.kind,
          sha256: sha256Text(text),
          text
        }
      });
    }

    events.push({
      seq: seq++,
      timestamp: deterministicIso(seq),
      event: 'speaker.source.end',
      payload: {
        chapter_id: chapterId,
        source: rel,
        sha256: sha256Text(md),
        blocks: blocks.length
      }
    });
  }

  events.push({
    seq: seq++,
    timestamp: deterministicIso(seq),
    event: 'speaker.canon.end',
    payload: {
      out_file: path.relative(lgRoot, outPath),
      event_count: events.length + 1
    }
  });

  const body = `${events.map((e) => JSON.stringify(e)).join('\n')}\n`;
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, body, 'utf8');
  process.stdout.write(`${path.relative(lgRoot, outPath)}\n`);
}

try {
  main();
} catch (err) {
  process.stderr.write(`${String(err && err.message ? err.message : err)}\n`);
  process.exit(2);
}

