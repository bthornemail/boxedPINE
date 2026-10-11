// THE PING INSTRUMENT: LINES OF ADDRESSES, WALLS, AND THE FRAME READING
//
// The author: XOR the delineations as indices of separate encapsulation
// layers, and read the round trip as a measure that crosses a boundary
// the frame does not own. wiki: SPEC-07 I-99; SRC-12.
//
// A "line" is a triple of addresses where any two XOR to the third, the
// same shape as the seven XOR triples (I-28): 1.1.1.1, 8.8.8.8, 9.9.9.9.
// A "wall" is a line point whose round trip does not return. A wall is a
// reading of the frame and the port, not of the address: from the TOSHIBA
// Quad9 answers TCP 53 and 853 and ICMP, but not 443.
//
// The measurement partitions a round trip into:
//   bound  = light-in-medium floor (path_length / (c * 2/3) * 2)
//   excess = measured - bound  (path processing + frame entropy)
//
// One host cannot separate path from frame; the mdev swamps it.
// The instrument is written to run on many hosts; the residual between
// hosts is the finding.

import { Socket } from 'node:net';
import { lookup } from 'node:dns/promises';

export const C_KM_S = 299_792;
export const FIBER_KM_S = 200_000; // ~2/3 c in glass

export type Sample = { rttMs: number };

export type Point = {
  address: string;
  port: number;
  samples: Sample[];
  reachable: boolean;
  rttMinMs?: number;
  rttAvgMs?: number;
  mdevMs?: number;
  error?: string;
};

export type Line = {
  points: [Point, Point, Point];
  // XOR of the three addresses as 32-bit integers; for a true line the
  // third is the XOR of the first two, so the triple closes.
  xor32: number;
  closes: boolean;
  wall: number | null; // index of the unreachable point, or null
};

const ipToInt = (ip: string) =>
  ip.split('.').reduce((n, o) => ((n << 8) | (Number(o) & 0xff)) >>> 0, 0) >>> 0;

const intToIp = (n: number) =>
  [24, 16, 8, 0].map((s) => (n >>> s) & 0xff).join('.');

/** One TCP handshake round trip. No ICMP needed. */
export function tcpRtt(address: string, port = 443, timeoutMs = 4000): Promise<number> {
  return new Promise((ok, no) => {
    const t0 = process.hrtime.bigint();
    const s = new Socket();
    let done = false;
    const finish = (fn: () => void) => { if (!done) { done = true; s.destroy(); fn(); } };
    s.setTimeout(timeoutMs);
    s.once('connect', () => finish(() => ok(Number(process.hrtime.bigint() - t0) / 1e6)));
    s.once('timeout', () => finish(() => no(new Error('timeout'))));
    s.once('error', (e) => finish(() => no(e)));
    s.connect(port, address);
  });
}

/** Sample a point N times. Reachable iff at least one sample returns. */
export async function measure(address: string, port = 443, n = 3): Promise<Point> {
  const samples: Sample[] = [];
  let error: string | undefined;
  for (let i = 0; i < n; i++) {
    try {
      samples.push({ rttMs: await tcpRtt(address, port) });
    } catch (e) {
      error = (e as Error).message;
    }
  }
  if (!samples.length) return { address, port, samples, reachable: false, error };
  const vals = samples.map((s) => s.rttMs);
  const min = Math.min(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const mdev = Math.sqrt(vals.reduce((a, v) => a + (v - avg) ** 2, 0) / vals.length);
  return { address, port, samples, reachable: true, rttMinMs: min, rttAvgMs: avg, mdevMs: mdev };
}

/** The light-in-fiber floor for a great-circle distance, in ms. */
export const fiberBoundMs = (km: number) => (2 * km) / FIBER_KM_S * 1000;

/** Resolve a host to its first IPv4, or return it if it is already an IP. */
export async function resolve4(host: string): Promise<string> {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return host;
  const { address } = await lookup(host, { family: 4 });
  return address;
}

/** Whether three addresses form an XOR line, and where the wall is. */
export function line(a: Point, b: Point, c: Point): Line {
  const x = ipToInt(a.address), y = ipToInt(b.address), z = ipToInt(c.address);
  const xor32 = (x ^ y ^ z) >>> 0;
  const closes = (x ^ y) >>> 0 === z || (x ^ z) >>> 0 === y || (y ^ z) >>> 0 === x;
  const pts = [a, b, c];
  const wall = pts.findIndex((p) => !p.reachable);
  return { points: [a, b, c] as [Point, Point, Point], xor32, closes, wall: wall < 0 ? null : wall };
}

/** Read a line: measure all three points, then test the line. */
export async function readLine(
  addresses: [string, string, string],
  port = 443,
  n = 3,
): Promise<Line> {
  const [a, b, c] = addresses;
  const [pa, pb, pc] = await Promise.all([measure(a, port, n), measure(b, port, n), measure(c, port, n)]);
  return line(pa, pb, pc);
}

export const ip = { toInt: ipToInt, fromInt: intToIp };

// CLI: node repl/src/ping.ts 1.1.1.1 8.8.8.8 9.9.9.9
if (import.meta.url === `file://${process.argv[1]}`) {
  const [a, b, c] = process.argv.slice(2);
  if (!a || !b || !c) {
    console.error('usage: node repl/src/ping.ts <ip> <ip> <ip> [port]');
    process.exit(2);
  }
  const port = Number(process.argv[5] ?? 443);
  readLine([a, b, c], port).then((l) => {
    console.log(`line: ${a} ⊕ ${b} ⊕ ${c} = ${ip.fromInt(l.xor32)}  closes=${l.closes}`);
    for (const p of l.points) {
      if (p.reachable) {
        console.log(`  ${p.address}:${p.port}  min=${p.rttMinMs!.toFixed(1)}ms  avg=${p.rttAvgMs!.toFixed(1)}ms  mdev=${p.mdevMs!.toFixed(1)}ms`);
      } else {
        console.log(`  ${p.address}:${p.port}  WALL (${p.error ?? 'unreachable'})`);
      }
    }
    if (l.wall !== null) console.log(`wall at point ${l.wall}: ${l.points[l.wall]!.address}:${l.points[l.wall]!.port}`);
  });
}
