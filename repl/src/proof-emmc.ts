// THE PROOF TREE ON THE eMMC: RESTORE, RESET, REPLAY, SCRUB
//
// The author, 2026-10-13: "so we can restore states now with the proof tree in
// an eMMC, we can replay and scrub them"; "we should be able to use the GED
// event bus"; and "reset as the signal of the n in n+1 and n-1". The image of
// SPEC-07 I-94 holds the proof Blob and the sixteen constants; after them this
// writes the proofs catalogue, every record's check as its base64 classic script
// (proofs/js/vm), with an index of tag, place, length and SHA3-256, and a root
// hash over the index. One step of the cycle, through NBD and QMP:
//   n - 1  read the tree back; scrub names each damaged record; restore writes
//          it back from the proof tree, byte for byte;
//   n      reset the virt machine that holds the drive: the host's event bus
//          carries RESET (host-qmp-system-reset);
//   n + 1  read back again: the scrub is clean, the root is n - 1's, and every
//          record replays from the bytes read.
// (On the GED itself, microvm's event register at 0xfea00000, a pending event
// survives a reset and is consumed by its first read; this QEMU's GED fires only
// the power-down event. SPEC-07 I-190.)
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makeImage, IMAGE_BYTES, readNbd } from './emmc.ts';

const PROOFS = new URL('../../proofs/js/', import.meta.url);
/** Where the index starts: after the Blob (0) and the constants (8192), on a 16 KiB boundary. */
export const INDEX_AT = 16384;
const HEADER = 48; // "OMIPROOF", count (4), spare (4), root SHA3-256 (32)
const ENTRY = 64; // tag (8, ASCII), offset (4), length (4), SHA3-256 (32), spare (16)
const MAGIC = 'OMIPROOF';
const SECTOR = 512;

export type Entry = { tag: string; id: string; offset: number; length: number; sha256: string };

// SHA3-256 (Keccak, a sponge), not SHA-256: the author, 2026-10-13, "if sha256 we should use sha3".
const sha = (b: Uint8Array | string) => createHash('sha3-256').update(b).digest('hex');
/** The tree's root: the hash of its records' hashes, in order. */
export const rootOf = (entries: Entry[]) => sha(entries.map((e) => e.sha256).join(''));

/** The proof tree: each catalogue record's tag, id and base64 script, in catalogue order. */
export function proofTree(): { tag: string; id: string; script: Uint8Array }[] {
  const catalog = JSON.parse(readFileSync(new URL('catalog.json', PROOFS), 'utf8')) as { id: string; tag: string }[];
  return catalog.map((r) => ({ tag: r.tag, id: r.id, script: new Uint8Array(readFileSync(new URL(`vm/${r.tag}.b64`, PROOFS))) }));
}

/** Make the I-94 image and write the proof tree after it: header, index, then each record on a sector boundary. */
export function makeProofImage(path: string): Entry[] {
  const image = makeImage(path);
  const tree = proofTree();
  const view = new DataView(image.buffer);
  let at = Math.ceil((INDEX_AT + HEADER + tree.length * ENTRY) / SECTOR) * SECTOR;
  const entries: Entry[] = tree.map((r, i) => {
    if (at + r.script.length > IMAGE_BYTES) throw new Error(`the proof tree does not fit: ${r.id} ends past ${IMAGE_BYTES}`);
    image.set(r.script, at);
    const e = INDEX_AT + HEADER + i * ENTRY;
    image.set(new TextEncoder().encode(r.tag.padEnd(8, ' ')), e);
    view.setUint32(e + 8, at, true);
    view.setUint32(e + 12, r.script.length, true);
    image.set(Buffer.from(sha(r.script), 'hex'), e + 16);
    const entry = { tag: r.tag, id: r.id, offset: at, length: r.script.length, sha256: sha(r.script) };
    at = Math.ceil((at + r.script.length) / SECTOR) * SECTOR;
    return entry;
  });
  image.set(new TextEncoder().encode(MAGIC), INDEX_AT);
  view.setUint32(INDEX_AT + 8, tree.length, true);
  image.set(Buffer.from(rootOf(entries), 'hex'), INDEX_AT + 16);
  writeFileSync(path, image);
  return entries;
}

/** Read the index (and its stored root) from an image as it was read back. */
export function readIndex(image: Uint8Array): { root: string; entries: Entry[] } {
  const magic = new TextDecoder().decode(image.subarray(INDEX_AT, INDEX_AT + 8));
  if (magic !== MAGIC) throw new Error(`no proof tree at ${INDEX_AT} (found ${JSON.stringify(magic)})`);
  const view = new DataView(image.buffer, image.byteOffset);
  const ids = new Map(proofTree().map((r) => [r.tag, r.id]));
  const entries = Array.from({ length: view.getUint32(INDEX_AT + 8, true) }, (_, i) => {
    const e = INDEX_AT + HEADER + i * ENTRY;
    const tag = new TextDecoder().decode(image.subarray(e, e + 8)).trim();
    return { tag, id: ids.get(tag) ?? '?', offset: view.getUint32(e + 8, true), length: view.getUint32(e + 12, true), sha256: Buffer.from(image.subarray(e + 16, e + 48)).toString('hex') };
  });
  return { root: Buffer.from(image.subarray(INDEX_AT + 16, INDEX_AT + 48)).toString('hex'), entries };
}

/** Scrub: every record whose bytes no longer hash to its index entry (and whether the index still matches its root). */
export function scrub(image: Uint8Array): { indexIntact: boolean; damaged: Entry[] } {
  const { root, entries } = readIndex(image);
  return { indexIntact: rootOf(entries) === root, damaged: entries.filter((e) => sha(image.subarray(e.offset, e.offset + e.length)) !== e.sha256) };
}

/** Replay: decode and run the intact records from the image; a record's result is null when it holds. */
export async function replay(image: Uint8Array, only?: string[]): Promise<{ id: string; tag: string; result: string | null }[]> {
  const { runInVm } = await import(new URL('tools/vm.mjs', PROOFS).href);
  const damaged = new Set(scrub(image).damaged.map((e) => e.tag));
  const out = [];
  for (const e of readIndex(image).entries) {
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
      if (!script || script.length !== e.length || sha(script) !== e.sha256) throw new Error(`${e.id}: the proof tree no longer holds the bytes the image indexed`);
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

/** One step: n - 1 (read, scrub, restore), n (the reset), n + 1 (read, scrub, compare roots). */
export async function step(nbdSocket: string, qmpSocket: string, scratch: string) {
  const before = readNbd(nbdSocket, join(scratch, 'n-1.img'));
  const { root } = readIndex(before);
  const found = scrub(before);
  const restored = restore(nbdSocket, found.damaged);
  const signal = await resetSignal(qmpSocket);
  const after = readNbd(nbdSocket, join(scratch, 'n+1.img'));
  const clean = scrub(after);
  return { found: found.damaged.map((e) => e.id), restored, signal, clean: clean.damaged.length === 0 && clean.indexIntact, sameRoot: readIndex(after).root === root && rootOf(readIndex(after).entries) === root, after };
}
