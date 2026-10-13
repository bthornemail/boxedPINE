// READING ANOTHER ARCHITECTURE OVER SERIAL
//
// The ESP32 is now the parity organ (breadboard/esp32, SPEC-07 I-102): it
// cycles 60 ^ 0 … 128 and reports the 3-bit parity byte, the poles and the
// deviation it sensed; expectedOrgan() is the same reading made here. The
// first probe (I-101) printed the readings core/ makes, one per
// line. This file computes the same readings here, parses the board's, and
// reports each line's deviation: the XOR of the two words, 0 where the two
// frames agree. The board's tick_us is a physical reading of its own frame and
// has no host twin. wiki: SPEC-07 I-101.
import { spawnSync } from 'node:child_process';
import { openSync, readSync, writeSync, closeSync } from 'node:fs';
import { CONSTANTS, converge, isConstant, step } from '../../core/src/verified/fano.ts';
import { delta16 } from '../../core/src/verified/delta.ts';
import { tick, META_START } from '../../core/src/verified/cycle.ts';
import { expectedOrgan, respondTwin, parseReflect, intact } from '../../rosetta/src/organ.ts';
import { parseAnalog, readAnalog } from '../../rosetta/src/analog.ts';

export { expectedOrgan, respondTwin, parseReflect };

export type Reading = Record<string, number[]>;

/** The word lists of a transcript: "orbit 4242 061b …" → { orbit: [0x4242, 0x061b, …] }. */
export function parseReading(text: string): Reading {
  const out: Reading = {};
  const hexKeys = new Set(['orbit', 'constants', 'blob', 'parity', 'dev']);
  for (const line of text.split(/\r?\n/)) {
    const m = /^(orbit|period|constants|converge|blob|meta|tick_us|parity|pole|dev|us|wall|cycles) ((?:[0-9a-f]+ ?)+)$/.exec(line.trim());
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

/** Prompt the organ: send one request line, collect its answer up to the departure, leaving out reflect lines. */
export function askOrgan(port: string, request: string, timeoutMs = 4000): string[] {
  const text = readBoard(port, request, timeoutMs, /218 This is fine\r?\n/);
  const end = text.indexOf('218 This is fine');
  const lines = (end < 0 ? text : text.slice(0, end + 16)).split(/\r?\n/).filter((l) => l && !l.startsWith('reflect') && !l.startsWith('omi '));
  const start = lines.findIndex((l) => /^\d{3} /.test(l));
  return start < 0 ? lines : lines.slice(start);
}

/** Ask the organ for 64 raw readings of ADC1 channel ch (I-181), and read them as logic, values and spectrum; asks again if the fold breaks. */
export function askAnalog(port: string, ch = 0, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const answer = askOrgan(port, `GET /analog/${ch}`);
    const readings = parseAnalog(answer);
    if (intact(answer) && readings.length === 64) return { answer, ...readAnalog(readings), samples: readings };
  }
  throw new Error(`no whole answer to GET /analog/${ch} in ${tries} tries`);
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

/** Send a line to a board on a serial port and collect what comes back until `until` (or the timeout). */
export function readBoard(port = '/dev/ttyUSB0', ask = 'GET /parity', timeoutMs = 8000, until: RegExp | ((text: string) => boolean) = /\nready\r?\n|218 This is fine\r?\n/, settleMs = 300): string {
  // every echo and flow-control flag off: an echoing port feeds the board its own lines
  spawnSync('stty', ['-F', port, '115200', 'cs8', '-cstopb', '-parenb', 'raw', '-echo', '-echoe', '-echok', '-echoctl', '-echoke', '-ixon', '-ixoff', '-crtscts', '-hupcl']);
  const fd = openSync(port, 'r+');
  try {
    const buf = Buffer.alloc(256);
    // Just after the port opens, the USB serial layer can hand over the same
    // packet more than once (seen on 2026-10-11 with cat and with Node). Let it
    // settle: read and discard for settleMs, the organ's reflect lines keep reads returning.
    for (const settle = Date.now() + settleMs; Date.now() < settle; ) readSync(fd, buf, 0, buf.length, null);
    writeSync(fd, `\n${ask}\n`);
    let text = '';
    const end = Date.now() + timeoutMs;
    const done = typeof until === 'function' ? until : (t: string) => until.test(t);
    while (Date.now() < end && !done(text)) {
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
  console.log(text.trim().split(/\r?\n/).filter((l) => /^(omi|tick_us|us|wall|cycles)/.test(l)).join('\n'));
  for (const [k, d] of Object.entries(deviation(board, 'parity' in board ? expectedOrgan() : expectedReading())))
    console.log(`${k.padEnd(10)} ${d === 'missing' ? 'missing' : d.every((v) => v === 0) ? '0 (same)' : d.map((v) => v.toString(16)).join(' ')}`);
}
