#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';

const WIKI = new URL('..', import.meta.url).pathname;
const EXTS = ['.md', '.canvas', '.base'];

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (EXTS.includes(extname(p))) out.push(p);
  }
  return out;
}

function stripExt(name) {
  for (const ext of EXTS) {
    if (name.endsWith(ext)) return name.slice(0, -ext.length);
  }
  return name;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

function parseList(val) {
  if (!val) return [];
  if (val.startsWith('[')) {
    try { return JSON.parse(val.replace(/'/g, '"')); } catch { return []; }
  }
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

function stripCodeBlocks(text) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
}

const files = walk(WIKI).filter(f => !f.includes('/raw/') && !f.includes('/.obsidian/') && !f.includes('/plugins/'));
const notes = new Map();
const errors = [];

for (const f of files) {
  const text = readFileSync(f, 'utf8');
  const name = stripExt(basename(f));
  const isMd = extname(f) === '.md';
  const fm = isMd ? parseFrontmatter(text) : {};
  notes.set(name, { file: f, fm, text, isMd });
}

for (const [name, note] of notes) {
  const { fm, text, isMd } = note;

  if (!isMd) continue;

  if (!fm.id) errors.push(`${name}: missing id`);
  if (!fm.title) errors.push(`${name}: missing title`);
  if (!fm.kind) errors.push(`${name}: missing kind`);
  if (!fm.layer) errors.push(`${name}: missing layer`);
  if (!fm.status) errors.push(`${name}: missing status`);

  const validKinds = ['root-index', 'source', 'source-part', 'spec', 'extension', 'open', 'map', 'meta'];
  if (fm.kind && !validKinds.includes(fm.kind)) errors.push(`${name}: invalid kind "${fm.kind}"`);

  const validStatuses = ['draft', 'review', 'canonical', 'contested', 'deprecated'];
  if (fm.status && !validStatuses.includes(fm.status)) errors.push(`${name}: invalid status "${fm.status}"`);

  for (const field of ['up', 'down', 'related', 'sources', 'code', 'dimensions', 'symbols', 'tags']) {
    const val = fm[field];
    if (!val) continue;
    const items = parseList(val);
    for (const item of items) {
      const link = item.match(/^\[\[([^\]]+)\]\]$/);
      if (!link) continue;
      const target = stripExt(link[1].split('|')[0].split('#')[0]);
      if (!notes.has(target)) errors.push(`${name}: ${field} link to missing note "${target}"`);
    }
  }

  const cleanText = stripCodeBlocks(text);
  const links = cleanText.matchAll(/\[\[([^\]]+)\]\]/g);
  for (const m of links) {
    const target = stripExt(m[1].split('|')[0].split('#')[0]);
    if (!notes.has(target)) errors.push(`${name}: body link to missing note "${target}"`);
  }
}

console.log(`Validated ${notes.size} notes`);
if (errors.length) {
  console.log(`\n${errors.length} errors:`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
} else {
  console.log('All links valid');
}
