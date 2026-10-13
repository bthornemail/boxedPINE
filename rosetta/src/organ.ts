// THE PARITY ORGAN'S LINES, AS DECLARATIONS
//
// What the ESP32 parity organ (breadboard/esp32) says, and what it answers,
// made in any frame: Node (repl/src/serial.ts) and the browser (space/, over
// Web Serial) read the board against these. No I/O here. wiki: SPEC-07 I-102, I-103.

export type Reading = Record<string, number[]>;

/**
 * Whether the organ reflects on tick n (a tick is 256 cycles). The author:
 * "if modulus % 4 = 0 when the modulus 2 is 0, or when the modulus of 2 and the
 * modulus of 4 are not 0": silent only when n & 3 = 2.
 */
export const reflectsOn = (n: number) => (n & 3) !== 2;

/** The paths the organ offers with 300 Multiple Choices. */
export const ORGAN_CHOICES = ['/parity', ...[0, 1, 2, 3, 4, 5, 6, 7].map((a) => `/atom/${a}`), '/m/0-128', '/gate/NAND/00', '/build/8T/00', '/analog/0'];

const parity3 = (a: number) => (a ^ (a >> 1) ^ (a >> 2)) & 1;

/** The parity organ's reading, made here: one octet's byte, the poles, and no deviation. */
export function expectedOrgan(seed = 60): Reading {
  const octet = (k: number) => [0, 1, 2, 3, 4, 5, 6, 7].reduce((p, i) => p | (parity3((seed ^ ((k << 3) | i)) & 7) << i), 0);
  let dev = 0;
  for (let k = 0; k < 16; k++) dev |= octet(k) ^ octet(0);
  const p = parity3(seed & 7);
  const pole = Number(parity3((seed ^ 64) & 7) === p && parity3((seed ^ 128) & 7) === p);
  return { parity: [octet(0)], pole: [pole], dev: [dev] };
}

/** A reflect line, "reflect 69 1 00 002a": the organ's unprompted state (205 Reflect). */
export function parseReflect(line: string): { parity: number; pole: number; dev: number; count: number } | null {
  const m = /^reflect ([0-9a-f]{2}) ([01]) ([0-9a-f]{2}) ([0-9a-f]{4})$/.exec(line.trim());
  return m ? { parity: parseInt(m[1]!, 16), pole: Number(m[2]), dev: parseInt(m[3]!, 16), count: parseInt(m[4]!, 16) } : null;
}

/**
 * What the organ answers a request with, made in this frame (without the
 * timing lines, which belong to the board). Ends with the departure, 218.
 */
export function respondTwin(request: string, seed = 60): string[] {
  const sense = (m: number) => parity3((seed ^ m) & 7);
  const { parity: [tag], pole: [pole], dev: [dev] } = expectedOrgan(seed) as { parity: number[]; pole: number[]; dev: number[] };
  const hex2 = (n: number) => n.toString(16).padStart(2, '0');
  let out: string[];
  let m: RegExpExecArray | null;
  if (request === 'GET /') out = ['300 Multiple Choices', ...ORGAN_CHOICES.map((c) => `choice ${c}`)];
  else if (request === 'GET /parity') out = ['200 OK', `parity ${hex2(tag!)}`, `pole ${pole}`, `dev ${hex2(dev!)}`];
  else if ((m = /^GET \/parity ([0-9a-fA-F]{2})$/.exec(request))) out = parseInt(m[1]!, 16) === tag && dev === 0 ? ['304 Not Modified'] : ['200 OK', `parity ${hex2(tag!)}`, `dev ${hex2(dev!)}`];
  else if ((m = /^GET \/atom\/([0-9a-fA-F])$/.exec(request))) {
    const a = parseInt(m[1]!, 16);
    out = a < 8 ? ['200 OK', `atom ${a.toString(16)} parity ${sense(a ^ 4)} dual ${(a ^ 15).toString(16)}`] : ['307 Temporary Redirect', `location /atom/${(a ^ 15).toString(16)}`];
  } else if ((m = /^GET \/m\/(\d+)-(\d+)$/.exec(request)) && Number(m[1]) <= Number(m[2])) {
    const a = Number(m[1]), b = Number(m[2]);
    out = b > 128 ? ['416 Range Not Satisfiable', 'content-range m */129']
      : ['206 Partial Content', `content-range m ${a}-${b}/129`, `bits ${Array.from({ length: b - a + 1 }, (_, i) => sense(a + i)).join('')}`];
  } else if ((m = /^GET \/analog\/(\d)$/.exec(request))) {
    // The readings are the board's (I-181): the twin knows the frame, not the voltages.
    out = Number(m[1]) > 7 ? ['404 Not Found'] : ['200 OK', `analog ${m[1]}`];
  } else out = gateRespondTwin(request) ?? ['400 Bad Request'];
  return [...out, foldLine(out), '218 This is fine'];
}

// ---- Gates and builds (SPEC-07 I-105, I-106): the twin reads breadboard/kernel.mjs ----
import { createKernel, evaluate, ledLit } from '../../breadboard/kernel.mjs';

const KERNEL = createKernel();
/** Truth tables over a * 2 + b: the kernel's grammar, plus XOR, XNOR and AND. */
export const GATE_TABLES: Record<string, number[]> = {
  ...Object.fromEntries([...KERNEL.grammar.values()].map((r: { name: string; table: number[] }) => [r.name, r.table])),
  XOR: [0, 1, 1, 0], XNOR: [1, 0, 0, 1], AND: [0, 0, 0, 1],
};
export const gateTwin = (rule: string, a: number, b: number) => GATE_TABLES[rule]![a * 2 + b]!;

/** A build's nodes and LED on a, b, as the kernel evaluates them: "n=1 p=0 … led=1". */
export function buildTwin(id: string, a: number, b: number): string | null {
  const c = KERNEL.circuits.find((x: { id: string }) => x.id === id);
  if (!c) return null;
  const bits = evaluate(c, a, b);
  return `${c.gates.map((g: { net: string }) => `${g.net}=${bits.get(g.net)}`).join(' ')} led=${ledLit(c, bits)}`;
}

/** The twin's answers to the gate and build requests (respondTwin calls this). */
export function gateRespondTwin(request: string): string[] | null {
  let m = /^GET \/gate\/([^/]+)\/(.*)$/.exec(request);
  if (m) {
    if (!/^[01][01]$/.test(m[2]!)) return ['400 Bad Request'];
    const [a, b] = [Number(m[2]![0]), Number(m[2]![1])];
    return m[1]! in GATE_TABLES ? ['200 OK', `gate ${m[1]} ${a}${b} ${gateTwin(m[1]!, a, b)}`] : ['404 Not Found'];
  }
  m = /^GET \/build\/([^/]+)\/(.*)$/.exec(request);
  if (m) {
    if (!/^[01][01]$/.test(m[2]!)) return ['400 Bad Request'];
    const [a, b] = [Number(m[2]![0]), Number(m[2]![1])];
    const body = buildTwin(m[1]!, a, b);
    return body === null ? ['404 Not Found'] : ['200 OK', `build ${m[1]} ${a}${b} ${body}`];
  }
  return null;
}

// ---- The fold every answer carries (SPEC-07 I-107) ----
import { delta16 } from '../../core/src/verified/delta.ts';

/**
 * Fold an answer as sent (each line and its newline, from the status line on),
 * pair-wise, like a zipper (the author: "everything is pair-wise"): the bytes
 * pair up as car (even) and cdr (odd), a last odd byte with 00. bits XORs the
 * pairs, so any bit that moves changes it; place zips the pairs through the
 * step law, z = K(z ^ pair, 0x1D), so a pair dropped, repeated or moved changes it.
 */
export function fold(lines: string[]): { bits: number; place: number; length: number } {
  const bytes = [...lines.map((l) => l + '\n').join('')].map((ch) => ch.charCodeAt(0) & 0xff);
  let bits = 0, place = 0;
  for (let i = 0; i < bytes.length; i += 2) {
    const pair = (bytes[i]! << 8) | (bytes[i + 1] ?? 0);
    bits ^= pair;
    place = delta16(place ^ pair, 0x1d);
  }
  return { bits, place, length: bytes.length };
}

export const foldLine = (lines: string[]) => {
  const f = fold(lines);
  return `fold ${f.bits.toString(16).padStart(4, '0')} ${f.place.toString(16).padStart(4, '0')} ${f.length}`;
};

/** Whether an answer (status line … fold line, 218) is intact: its fold line matches what arrived. */
export function intact(answer: string[]): boolean {
  const i = answer.findIndex((l) => l.startsWith('fold '));
  return i > 0 && answer[i] === foldLine(answer.slice(0, i));
}
