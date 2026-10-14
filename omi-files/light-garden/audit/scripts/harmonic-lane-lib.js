#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const CHANNEL_BASIS = ['R', 'O', 'Y', 'G', 'B', 'I', 'V', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
const FANO_BASIS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const COLOR_CHANNELS = ['R', 'O', 'Y', 'G', 'B', 'I', 'V'];
const NOTE_CHANNELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const LED_HUES = { R: '0', O: '30', Y: '60', G: '120', B: '240', I: '275', V: '300' };
const MASK_MODES = ['cancel', 'obfuscate', 'attenuate'];

function sha256Bytes(buf) {
  return `sha256:${crypto.createHash('sha256').update(buf).digest('hex')}`;
}

function sha256Text(text) {
  return sha256Bytes(Buffer.from(String(text), 'utf8'));
}

function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

function isSha256(v) {
  return typeof v === 'string' && /^sha256:[0-9a-f]{64}$/.test(v);
}

function stableValue(v) {
  if (Array.isArray(v)) return `[${v.map((x) => stableValue(x)).join(',')}]`;
  if (v && typeof v === 'object') {
    const keys = Object.keys(v).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableValue(v[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
}

function canonicalBytes(obj) {
  return Buffer.from(`${stableValue(obj)}\n`, 'utf8');
}

function withDigest(obj) {
  const clone = JSON.parse(JSON.stringify(obj));
  delete clone.digest;
  const digest = sha256Bytes(canonicalBytes(clone));
  return { ...clone, digest };
}

function digestMatches(obj) {
  if (!obj || typeof obj !== 'object' || !obj.digest) return false;
  const clone = JSON.parse(JSON.stringify(obj));
  const expected = clone.digest;
  delete clone.digest;
  return expected === sha256Bytes(canonicalBytes(clone));
}

function readNdjson(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch (err) {
        throw new Error(`ndjson_parse_error:${filePath}:${i + 1}:${String(err && err.message ? err.message : err)}`);
      }
    });
}

function asIntString(v) {
  return String(Math.trunc(Number(v)));
}

function deterministicIso(seq) {
  return `1970-01-01T00:00:${String(seq % 60).padStart(2, '0')}Z`;
}

module.exports = {
  CHANNEL_BASIS,
  FANO_BASIS,
  COLOR_CHANNELS,
  NOTE_CHANNELS,
  LED_HUES,
  MASK_MODES,
  sha256Bytes,
  sha256Text,
  sha256File,
  isSha256,
  canonicalBytes,
  withDigest,
  digestMatches,
  readNdjson,
  asIntString,
  deterministicIso
};
