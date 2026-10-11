// READING ANOTHER ARCHITECTURE OVER SERIAL
//
// The ESP32 probe (breadboard/esp32) prints the readings core/ makes, one per
// line. This file computes the same readings here, parses the board's, and
// reports each line's deviation: the XOR of the two words, 0 where the two
// frames agree. The board's tick_us is a physical reading of its own frame and
// has no host twin. wiki: SPEC-07 I-101.
import { spawnSync } from 'node:child_process';
import { openSync, readSync, writeSync, closeSync } from 'node:fs';
import { CONSTANTS, converge, isConstant, step } from '../../core/src/verified/fano.ts';
import { delta16 } from '../../core/src/verified/delta.ts';
import { tick, META_START } from '../../core/src/verified/cycle.ts';

export type Reading = Record<string, number[]>;

/** The word lists of a transcript: "orbit 4242 061b …" → { orbit: [0x4242, 0x061b, …] }. */
export function parseReading(text: string): Reading {
  const out: Reading = {};
  const hexKeys = new Set(['orbit', 'constants', 'blob']);
  for (const line of text.split(/\r?\n/)) {
    const m = /^(orbit|period|constants|converge|blob|meta|tick_us) ((?:[0-9a-f]+ ?)+)$/.exec(line.trim());
    if (m) out[m[1]!] = m[2]!.trim().split(' ').map((w) => parseInt(w, hexKeys.has(m[1]!) ? 16 : 10));
  }
  return out;
}

/** The same readings, made in this frame. */
export function expectedReading(seed = 0x4242): Reading {
  const orbit = [seed];
  for (let i = 0; i < 8; i++) orbit.push(delta16(orbit[i]!, 0x1d));
  let period = 0, x = seed;
  do { x = delta16(x, 0x1d); period++; } while (x !== seed);
  let closed = 0, most = 0;
  for (let m = 0; m < 128; m++) {
    let y = m, n = 0;
    for (let next = step(y); next !== y; next = step(y)) { y = next; n++; }
    if (isConstant(converge(m))) closed++;
    most = Math.max(most, n);
  }
  let fold = 0;
  for (let j = 0; j < 8192; j++) fold ^= 60 ^ (j & 0xff);
  let meta = tick(META_START), ticks = 1;
  while (meta.ring !== META_START.ring || meta.crystal !== META_START.crystal) { meta = tick(meta); ticks++; }
  return { orbit, period: [period], constants: [...CONSTANTS], converge: [closed, most], blob: [fold], meta: [ticks] };
}

/** Per line, the XOR of the two frames' words; all zero means the frames agree. */
export function deviation(board: Reading, host: Reading): Record<string, number[] | 'missing'> {
  const out: Record<string, number[] | 'missing'> = {};
  for (const key of Object.keys(host)) {
    const b = board[key];
    out[key] = b && b.length === host[key]!.length ? host[key]!.map((h, i) => h ^ b[i]!) : 'missing';
  }
  return out;
}

/** Ask a board on a serial port for its reading ("?") and collect lines until "ready". */
export function readBoard(port = '/dev/ttyUSB0', ask = '?', timeoutMs = 8000): string {
  // every echo and flow-control flag off: an echoing port feeds the board its own lines
  spawnSync('stty', ['-F', port, '115200', 'cs8', '-cstopb', '-parenb', 'raw', '-echo', '-echoe', '-echok', '-echoctl', '-echoke', '-ixon', '-ixoff', '-crtscts', '-hupcl']);
  const fd = openSync(port, 'r+');
  try {
    writeSync(fd, `\n${ask}\n`);
    const buf = Buffer.alloc(256);
    let text = '';
    const end = Date.now() + timeoutMs;
    while (Date.now() < end && !/\nready\r?\n/.test(text)) {
      const n = readSync(fd, buf, 0, buf.length, null);
      text += buf.toString('latin1', 0, n);
    }
    return text;
  } finally {
    closeSync(fd);
  }
}

// CLI: node repl/src/serial.ts [/dev/ttyUSB0]
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.argv[2] ?? '/dev/ttyUSB0';
  const text = readBoard(port);
  const board = parseReading(text);
  console.log(text.trim().split(/\r?\n/).filter((l) => /^(omi|tick_us)/.test(l)).join('\n'));
  for (const [k, d] of Object.entries(deviation(board, expectedReading())))
    console.log(`${k.padEnd(10)} ${d === 'missing' ? 'missing' : d.every((v) => v === 0) ? '0 (same)' : d.map((v) => v.toString(16)).join(' ')}`);
}
