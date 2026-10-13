// THE PROOF TREE ON THE eMMC: RESTORE, RESET, REPLAY, SCRUB
//
// The author, 2026-10-13: "so we can restore states now with the proof tree in
// an eMMC, we can replay and scrub them"; "we should be able to use the GED
// event bus"; "reset as the signal of the n in n+1 and n-1"; and, of hashing,
// "we shouldn't use hashing at all; the literals are the hash" ("OMI notation
// citations are not identified by hashes": the address is the identity, the
// place-value relation is the witness, carry-forward is the proof).
//
// The image of SPEC-07 I-94 holds the proof Blob and the sixteen constants;
// after them this writes the proofs catalogue, every record's check as its base64
// classic script (proofs/js/vm), each under its /A-Z0-9/ tag at its own place,
// with an index of tag, place and length. No digest anywhere: the scrub reads
// each record back and XORs it against the proof tree's literal at the same tag,
// and every byte that is not 0 is damage, at the place it is. One step, through
// NBD and QMP:
//   n - 1  read the tree back; the scrub names each damaged record and where;
//          restore writes the literal back, byte for byte;
//   n      reset the virt machine that holds the drive: the host's event bus
//          carries RESET (host-qmp-system-reset);
//   n + 1  read back again: the index is the one laid out, the XOR difference
//          is 0 everywhere, and every record replays (the carry-forward).
// (On the GED itself, microvm's event register at 0xfea00000, a pending event
// survives a reset and is consumed by its first read; this QEMU's GED fires only
// the power-down event. SPEC-07 I-190.)
import { execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makeImage, IMAGE_BYTES, readNbd } from './emmc.ts';

const PROOFS = new URL('../../proofs/js/', import.meta.url);
/** Where the index starts: after the Blob (0) and the constants (8192), on a 16 KiB boundary. */
export const INDEX_AT = 16384;
const HEADER = 16; // "OMIPROOF", count (4), spare (4)
const ENTRY = 16; // tag (8, ASCII /A-Z0-9/), place (4), length (4)
const MAGIC = 'OMIPROOF';
const SECTOR = 512;

export type Entry = { tag: string; id: string; offset: number; length: number };
export type Damage = Entry & { bytes: number; first: number; last: number };

/** The proof tree: each catalogue record's tag, id and base64 script, in catalogue order. */
export function proofTree(): { tag: string; id: string; script: Uint8Array }[] {
  const catalog = JSON.parse(readFileSync(new URL('catalog.json', PROOFS), 'utf8')) as { id: string; tag: string }[];
  return catalog.map((r) => ({ tag: r.tag, id: r.id, script: new Uint8Array(readFileSync(new URL(`vm/${r.tag}.b64`, PROOFS))) }));
}

/** Where each record goes: after the index, each on a sector boundary, in catalogue order. */
export function layout(tree = proofTree()): Entry[] {
  let at = Math.ceil((INDEX_AT + HEADER + tree.length * ENTRY) / SECTOR) * SECTOR;
  return tree.map((r) => {
    if (at + r.script.length > IMAGE_BYTES) throw new Error(`the proof tree does not fit: ${r.id} ends past ${IMAGE_BYTES}`);
    const e = { tag: r.tag, id: r.id, offset: at, length: r.script.length };
    at = Math.ceil((at + r.script.length) / SECTOR) * SECTOR;
    return e;
  });
}

/** Make the I-94 image and write the proof tree after it: header, index, then each record at its place. */
export function makeProofImage(path: string): Entry[] {
  const image = makeImage(path);
  const tree = proofTree();
  const entries = layout(tree);
  const view = new DataView(image.buffer);
  image.set(new TextEncoder().encode(MAGIC), INDEX_AT);
  view.setUint32(INDEX_AT + 8, tree.length, true);
  entries.forEach((e, i) => {
    image.set(tree[i]!.script, e.offset);
    const at = INDEX_AT + HEADER + i * ENTRY;
    image.set(new TextEncoder().encode(e.tag.padEnd(8, ' ')), at);
    view.setUint32(at + 8, e.offset, true);
    view.setUint32(at + 12, e.length, true);
  });
  writeFileSync(path, image);
  return entries;
}

/** Read the index from an image as it was read back. */
export function readIndex(image: Uint8Array): Entry[] {
  const magic = new TextDecoder().decode(image.subarray(INDEX_AT, INDEX_AT + 8));
  if (magic !== MAGIC) throw new Error(`no proof tree at ${INDEX_AT} (found ${JSON.stringify(magic)})`);
  const view = new DataView(image.buffer, image.byteOffset);
  const ids = new Map(proofTree().map((r) => [r.tag, r.id]));
  return Array.from({ length: view.getUint32(INDEX_AT + 8, true) }, (_, i) => {
    const at = INDEX_AT + HEADER + i * ENTRY;
    const tag = new TextDecoder().decode(image.subarray(at, at + 8)).trim();
    return { tag, id: ids.get(tag) ?? '?', offset: view.getUint32(at + 8, true), length: view.getUint32(at + 12, true) };
  });
}

/**
 * Scrub: XOR every record read back against the proof tree's literal at the same
 * tag. A record is damaged where a byte is not 0; the damage is given by place.
 * The index is intact when it reads back as the layout of the tree.
 */
export function scrub(image: Uint8Array): { indexIntact: boolean; difference: number; damaged: Damage[] } {
  const tree = new Map(proofTree().map((r) => [r.tag, r.script]));
  const entries = readIndex(image);
  const laid = layout();
  const indexIntact = JSON.stringify(entries.map(({ tag, offset, length }) => [tag, offset, length])) === JSON.stringify(laid.map(({ tag, offset, length }) => [tag, offset, length]));
  let difference = 0;
  const damaged: Damage[] = [];
  for (const e of entries) {
    const literal = tree.get(e.tag);
    if (!literal) { damaged.push({ ...e, bytes: e.length, first: e.offset, last: e.offset + e.length - 1 }); difference += e.length; continue; }
    let bytes = 0, first = -1, last = -1;
    for (let i = 0; i < e.length; i++) if ((image[e.offset + i]! ^ (literal[i] ?? 0)) !== 0) { bytes++; if (first < 0) first = e.offset + i; last = e.offset + i; }
    if (literal.length !== e.length) bytes += Math.abs(literal.length - e.length);
    if (bytes) damaged.push({ ...e, bytes, first, last });
    difference += bytes;
  }
  return { indexIntact, difference, damaged };
}

/** Replay: decode and run the intact records from the image; a record's result is null when it holds. */
export async function replay(image: Uint8Array, only?: string[]): Promise<{ id: string; tag: string; result: string | null }[]> {
  const { runInVm } = await import(new URL('tools/vm.mjs', PROOFS).href);
  const damaged = new Set(scrub(image).damaged.map((e) => e.tag));
  const out = [];
  for (const e of readIndex(image)) {
    if (only && !only.includes(e.tag)) continue;
    if (damaged.has(e.tag)) { out.push({ id: e.id, tag: e.tag, result: 'damaged: not replayed' }); continue; }
    const text = new TextDecoder().decode(image.subarray(e.offset, e.offset + e.length));
    out.push({ id: e.id, tag: e.tag, result: (await runInVm(text, 'base64')) as string | null });
  }
  return out;
}

/** Restore: write each damaged record back from the proof tree through NBD, byte for byte. */
export function restore(nbdSocket: string, damaged: Entry[]): number {
  const tree = new Map(proofTree().map((r) => [r.tag, r.script]));
  const dir = mkdtempSync(join(tmpdir(), 'restore-'));
  try {
    for (const e of damaged) {
      const script = tree.get(e.tag);
      if (!script || script.length !== e.length) throw new Error(`${e.id}: the proof tree holds no literal of that length at this tag`);
      const file = join(dir, `${e.tag}.b64`);
      writeFileSync(file, script);
      execFileSync('qemu-io', ['-f', 'raw', '-c', `write -s ${file} ${e.offset} ${e.length}`, `nbd+unix:///?socket=${nbdSocket}`], { stdio: 'ignore' });
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return damaged.length;
}

/** The signal at n: reset the machine over QMP and wait for the RESET the host's event bus carries. */
export function resetSignal(qmpSocket: string, timeoutMs = 10000): Promise<{ event: string; reason: string }> {
  return new Promise((resolve, reject) => {
    const conn = createConnection(qmpSocket);
    const timer = setTimeout(() => { conn.destroy(); reject(new Error('no RESET event')); }, timeoutMs);
    let buffer = '';
    conn.on('data', (d) => {
      buffer += d;
      let nl;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const msg = JSON.parse(buffer.slice(0, nl));
        buffer = buffer.slice(nl + 1);
        if (msg.QMP) conn.write(JSON.stringify({ execute: 'qmp_capabilities' }) + '\n');
        else if ('return' in msg && !('id' in msg)) conn.write(JSON.stringify({ execute: 'system_reset', id: 'n' }) + '\n');
        else if (msg.event === 'RESET') { clearTimeout(timer); conn.end(); resolve({ event: msg.event, reason: msg.data?.reason }); }
      }
    });
    conn.on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

/** One step: n - 1 (read, scrub, restore), n (the reset), n + 1 (read; the index as laid out, the XOR difference 0). */
export async function step(nbdSocket: string, qmpSocket: string, scratch: string) {
  const before = readNbd(nbdSocket, join(scratch, 'n-1.img'));
  const found = scrub(before);
  const restored = restore(nbdSocket, found.damaged);
  const signal = await resetSignal(qmpSocket);
  const after = readNbd(nbdSocket, join(scratch, 'n+1.img'));
  const now = scrub(after);
  return { found: found.damaged.map((e) => e.id), where: found.damaged.map(({ id, bytes, first, last }) => ({ id, bytes, first, last })), restored, signal, clean: now.indexIntact && now.difference === 0, after };
}
