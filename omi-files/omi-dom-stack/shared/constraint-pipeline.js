/**
 * OMI-IMO −5D → −1D Regex Constraints Pipeline
 *
 * Native dual-mode: text (string / UTF-8) and binary (Uint8Array / Buffer / ArrayBuffer).
 * Layers and correlations from Complete Codex (Untitled 70 / complete-codex.yaml).
 *
 * Dimension map:
 *   −5  global          //g
 *   −4  color           /color/g
 *   −3  delimiter       \r\n
 *   −2  non-alphanumeric [^a-zA-Z0-9]
 *   −1  alphanumeric    [a-zA-Z0-9]
 *    0  (compareExchange / higher layers — not part of this pipeline)
 */
'use strict';

const { G, CORRELATION, admits } = require('./regex-constraints');

// ---------- Layer definitions (canonical) ----------
const LAYERS = Object.freeze([
  {
    dimension: -5,
    name: 'global',
    pattern: /(?:)/g,                    // empty global — identity / whole-input
    binaryPattern: null,                 // binary: treat whole buffer as one unit
    correlation: '0x0000',
    description: 'Global empty pattern — admit entire input'
  },
  {
    dimension: -4,
    name: 'color',
    pattern: /color/gi,
    binaryPattern: null,                 // text-oriented; binary falls through
    correlation: 'Omicron',
    description: 'Color token presence'
  },
  {
    dimension: -3,
    name: 'delimiter',
    pattern: /\r\n|\n|\r/g,
    binaryPattern: [0x0d, 0x0a],         // CRLF bytes; also accept lone LF / CR
    correlation: 'Imago Dei',
    description: 'Line / record delimiter'
  },
  {
    dimension: -2,
    name: 'non-alphanumeric',
    pattern: /[^a-zA-Z0-9]/g,
    binaryPattern: 'non-alnum',          // special: any byte outside 0-9A-Za-z
    correlation: '3!',
    description: 'Non-alphanumeric separators'
  },
  {
    dimension: -1,
    name: 'alphanumeric',
    pattern: /[a-zA-Z0-9]/g,
    binaryPattern: 'alnum',              // special: bytes in 0-9A-Za-z
    correlation: '76',
    description: 'Alphanumeric tokens'
  }
]);

// ---------- Input normalization ----------
/**
 * Normalize any supported input into a dual view: { text, bytes, kind }
 * @param {string|Uint8Array|Buffer|ArrayBuffer|Array} input
 * @param {object} [opts]
 * @param {string} [opts.encoding='utf8']  encoding used when decoding binary → text
 * @returns {{ text: string|null, bytes: Uint8Array, kind: 'text'|'binary' }}
 */
function normalizeInput(input, opts = {}) {
  const encoding = opts.encoding || 'utf8';

  if (typeof input === 'string') {
    const bytes = typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(input)
      : Buffer.from(input, encoding);
    return { text: input, bytes: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), kind: 'text' };
  }

  let bytes;
  if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else if (ArrayBuffer.isView(input)) {
    bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  } else if (Array.isArray(input)) {
    bytes = new Uint8Array(input);
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(input)) {
    bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  } else {
    throw new TypeError('constraint-pipeline: input must be string, Uint8Array, Buffer, ArrayBuffer or number[]');
  }

  // Attempt lossless UTF-8 decode for the text view; if it fails, text = null
  let text = null;
  try {
    if (typeof TextDecoder !== 'undefined') {
      text = new TextDecoder(encoding, { fatal: true }).decode(bytes);
    } else if (typeof Buffer !== 'undefined') {
      text = Buffer.from(bytes).toString(encoding);
    }
  } catch (_) {
    text = null; // binary that is not valid text under the chosen encoding
  }

  return { text, bytes, kind: text !== null ? 'text' : 'binary' };
}

// ---------- Byte-level helpers ----------
function isAlnumByte(b) {
  return (b >= 0x30 && b <= 0x39) || // 0-9
         (b >= 0x41 && b <= 0x5a) || // A-Z
         (b >= 0x61 && b <= 0x7a);   // a-z
}

/**
 * Split a byte buffer by a delimiter sequence (e.g. CRLF).
 * Returns array of Uint8Array segments (delimiters themselves are not included).
 */
function splitBytes(bytes, delim) {
  const d = Array.isArray(delim) ? delim : [delim];
  const out = [];
  let start = 0;
  for (let i = 0; i <= bytes.length - d.length; i++) {
    let match = true;
    for (let j = 0; j < d.length; j++) {
      if (bytes[i + j] !== d[j]) { match = false; break; }
    }
    if (match) {
      out.push(bytes.subarray(start, i));
      start = i + d.length;
      i = start - 1;
    }
  }
  out.push(bytes.subarray(start));
  return out;
}

/**
 * Extract runs of alphanumeric / non-alphanumeric bytes.
 */
function extractByteRuns(bytes, wantAlnum) {
  const runs = [];
  let start = -1;
  for (let i = 0; i < bytes.length; i++) {
    const alnum = isAlnumByte(bytes[i]);
    if (alnum === wantAlnum) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      runs.push(bytes.subarray(start, i));
      start = -1;
    }
  }
  if (start >= 0) runs.push(bytes.subarray(start));
  return runs;
}

// ---------- Pipeline execution ----------
/**
 * Run the −5D → −1D pipeline on text or binary input.
 *
 * @param {string|Uint8Array|Buffer|ArrayBuffer|Array} input
 * @param {object} [opts]
 * @param {string} [opts.encoding='utf8']
 * @param {boolean} [opts.stopOnEmpty=false]  stop if a layer yields no matches
 * @returns {object} pipeline result
 */
function runPipeline(input, opts = {}) {
  const view = normalizeInput(input, opts);
  const results = [];
  let currentText = view.text;
  let currentBytes = view.bytes;

  for (const layer of LAYERS) {
    const entry = {
      dimension: layer.dimension,
      name: layer.name,
      correlation: layer.correlation,
      description: layer.description,
      matches: [],
      matchCount: 0,
      mode: view.kind
    };

    // ----- −5 global -----
    if (layer.dimension === -5) {
      if (view.kind === 'text' && currentText !== null) {
        entry.matches = [currentText];
      } else {
        entry.matches = [currentBytes]; // whole buffer as one unit
      }
      entry.matchCount = 1;
    }

    // ----- −4 color (text-oriented) -----
    else if (layer.dimension === -4) {
      if (currentText !== null) {
        const m = currentText.match(layer.pattern) || [];
        entry.matches = m;
        entry.matchCount = m.length;
      } else {
        // binary: no text “color” concept; empty
        entry.matches = [];
        entry.matchCount = 0;
        entry.mode = 'binary-skip';
      }
    }

    // ----- −3 delimiter -----
    else if (layer.dimension === -3) {
      if (currentText !== null) {
        const parts = currentText.split(layer.pattern);
        entry.matches = parts;
        entry.matchCount = parts.length;
        // keep text for next layers
        currentText = parts.join('\n'); // normalized
      } else {
        // try CRLF, then LF, then CR
        let parts = splitBytes(currentBytes, [0x0d, 0x0a]);
        if (parts.length === 1) parts = splitBytes(currentBytes, [0x0a]);
        if (parts.length === 1) parts = splitBytes(currentBytes, [0x0d]);
        entry.matches = parts;
        entry.matchCount = parts.length;
        currentBytes = parts.length ? parts[0] : currentBytes; // continue with first segment by default
      }
    }

    // ----- −2 non-alphanumeric -----
    else if (layer.dimension === -2) {
      if (currentText !== null) {
        const m = currentText.match(layer.pattern) || [];
        entry.matches = m;
        entry.matchCount = m.length;
      } else {
        const runs = extractByteRuns(currentBytes, false);
        entry.matches = runs;
        entry.matchCount = runs.length;
      }
    }

    // ----- −1 alphanumeric -----
    else if (layer.dimension === -1) {
      if (currentText !== null) {
        const m = currentText.match(layer.pattern) || [];
        entry.matches = m;
        entry.matchCount = m.length;
      } else {
        const runs = extractByteRuns(currentBytes, true);
        entry.matches = runs;
        entry.matchCount = runs.length;
      }
    }

    results.push(Object.freeze(entry));

    if (opts.stopOnEmpty && entry.matchCount === 0) break;
  }

  return Object.freeze({
    kind: view.kind,
    encoding: opts.encoding || 'utf8',
    byteLength: view.bytes.byteLength,
    layers: results,
    // convenience: final alphanumeric tokens (text) or runs (binary)
    tokens: results.length
      ? results[results.length - 1].matches
      : [],
    admissible: results.every(r => r.dimension === -5 || r.matchCount >= 0) // always true for now; extend with G checks
  });
}

/**
 * Convenience: parse a file path as text or binary.
 * Node-only (uses fs).
 */
function parseFile(filePath, opts = {}) {
  const fs = require('fs');
  const buf = fs.readFileSync(filePath);
  // Heuristic: if opts.forceBinary or high proportion of non-text bytes → binary
  if (opts.forceBinary) {
    return runPipeline(buf, { ...opts, encoding: opts.encoding || 'utf8' });
  }
  // try text first; pipeline itself decides via normalizeInput
  return runPipeline(buf, opts);
}

/**
 * Apply a single named G constraint to a token (text only).
 */
function admitToken(name, token) {
  return admits(name, token);
}

module.exports = {
  LAYERS,
  normalizeInput,
  runPipeline,
  parseFile,
  admitToken,
  G,
  CORRELATION
};
