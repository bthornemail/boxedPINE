// THE SIXTEEN FANO CONSTANTS
//
// A constant is a 7-bit mask: bit n−1 is point n of the Fano plane, the
// nonzero 3-bit indices 1..7. Of all 128 masks exactly 16 are XOR-closed
// (with a, b marked, a ⊕ b is marked): the 16 subspaces of three bits, which
// are the 16 icons (empty, 7 points, 7 lines, full). wiki: SPEC-16.
//
// Everything here is bitwise or whole-number arithmetic, so it reads the same
// in any buffer and can be wired on any FPGA: no floats, no parser, no clock.

/** The seven lines {a, b, a ⊕ b}. */
export const LINES = [[1, 2, 3], [1, 4, 5], [1, 6, 7], [2, 4, 6], [2, 5, 7], [3, 4, 7], [3, 5, 6]] as const;

const bit = (m: number, n: number) => (m >> (n - 1)) & 1;

/**
 * One convergence step: each point turns on when two other points of a line
 * through it are on. Per point that is one OR of three ANDs, so seven small
 * gates; two steps reach a closed mask from any input (tested over all 128).
 */
export function step(mask: number): number {
  let out = mask & 0x7f;
  for (const [a, b, c] of LINES) {
    out |= (bit(mask, a) & bit(mask, b)) << (c - 1);
    out |= (bit(mask, a) & bit(mask, c)) << (b - 1);
    out |= (bit(mask, b) & bit(mask, c)) << (a - 1);
  }
  return out;
}

/** Converge any byte to its constant (the smallest closed mask containing it). */
export function converge(mask: number): number {
  let m = mask & 0x7f;
  for (let next = step(m); next !== m; next = step(m)) m = next;
  return m;
}

export const isConstant = (mask: number) => mask >= 0 && mask < 128 && step(mask) === mask;

/** The dual: every point x whose bits meet each marked point an even number of times. */
export function perp(mask: number): number {
  let out = 0;
  for (let x = 1; x < 8; x++) {
    let even = true;
    for (let n = 1; n < 8; n++) {
      if (!bit(mask, n)) continue;
      let p = x & n;
      p ^= p >> 2;
      p ^= p >> 1;
      if (p & 1) even = false;
    }
    if (even) out |= 1 << (x - 1);
  }
  return out;
}

/**
 * The sixteen constants as one 16-byte table, indexed so that index i ⊕ 15 is
 * the dual of index i: 0 empty, 1..7 the points, 8..14 the lines (15 − n is
 * the line dual to point n), 15 full. So the direction flip j ⊕ 15 is the
 * Fano point–line duality.
 */
export const CONSTANTS = Uint8Array.from({ length: 16 }, (_, i) =>
  i === 0 ? 0 : i === 15 ? 0x7f : i < 8 ? 1 << (i - 1) : perp(1 << (15 - i - 1)));

export const constantIndex = (mask: number) => CONSTANTS.indexOf(mask);

// ---- The transform matrix from any three numbers (author, 2026-10-11) ----
//
// Three 3-bit indices are the three columns of a 3×3 matrix of bits. Applying
// it to a position XORs together the columns its bits select: index-only. The
// matrix moves the Fano plane onto itself exactly when the three are
// independent (none is the XOR of the other two); there are 7 · 6 · 4 = 168
// such ordered triples, the plane's whole symmetry group.

/** The position x sent through the matrix with columns a, b, c. */
export function transform3(a: number, b: number, c: number, x: number): number {
  return ((x & 1 ? a : 0) ^ (x & 2 ? b : 0) ^ (x & 4 ? c : 0)) & 7;
}

/** Whether a, b, c are independent, so the matrix permutes the seven points. */
export const independent = (a: number, b: number, c: number) =>
  a !== 0 && b !== 0 && a !== b && c !== 0 && c !== a && c !== b && c !== (a ^ b);

// ---- Reading an Inkscape Fano file with whole numbers only ----
// VALUE DOOR: a drawing's geometry is values; what comes out is an index (a mask).

const SCALE = 1_000_000n;

/** A decimal string as a whole number of millionths, truncated, identical everywhere. */
function fixed(s: string): bigint {
  const m = /^(-?)(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m) throw new RangeError(`not a plain decimal: ${s}`);
  const v = BigInt(m[2] || '0') * SCALE + BigInt((m[3] ?? '').padEnd(6, '0').slice(0, 6));
  return m[1] ? -v : v;
}

type Matrix = [bigint, bigint, bigint, bigint, bigint, bigint];
const IDENTITY: Matrix = [SCALE, 0n, 0n, SCALE, 0n, 0n];

function transform(attr: string | undefined): Matrix {
  if (!attr) return IDENTITY;
  const m = /(matrix|translate)\(([^)]*)\)/.exec(attr);
  if (!m) return IDENTITY;
  const n = m[2]!.split(/[\s,]+/).filter(Boolean).map(fixed);
  return m[1] === 'matrix' ? (n as Matrix) : [SCALE, 0n, 0n, SCALE, n[0]!, n[1] ?? 0n];
}

const mul = (a: Matrix, b: Matrix): Matrix => [
  (a[0] * b[0] + a[2] * b[1]) / SCALE, (a[1] * b[0] + a[3] * b[1]) / SCALE,
  (a[0] * b[2] + a[2] * b[3]) / SCALE, (a[1] * b[2] + a[3] * b[3]) / SCALE,
  (a[0] * b[4] + a[2] * b[5]) / SCALE + a[4], (a[1] * b[4] + a[3] * b[5]) / SCALE + a[5],
];

const attr = (tag: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

/** Where the seven points sit in the files' own coordinates (read from Fano_full.svg). */
const POINTS: [bigint, bigint][] = ([[13.5, 72.3], [47.5, 13.5], [30.5, 42.9], [81.4, 72.3], [47.5, 72.3], [64.5, 42.9], [47.5, 52.7]] as const)
  .map(([x, y]) => [fixed(String(x)), fixed(String(y))]);

/**
 * The constant a file marks: the dots (r = 20) in its marked layer, each
 * placed through its transforms and matched to the nearest of the seven
 * points within 4 units. A file with no marked layer is the empty constant.
 */
export function readFanoSvg(source: string | Uint8Array): number {
  // bytes are read one character per byte, so any buffer holding the file reads the same
  const text = typeof source === 'string' ? source : Array.from(source, (b) => String.fromCharCode(b)).join('');
  const start = text.indexOf('id="layer2"');
  if (start < 0) return 0;
  const end = text.indexOf('id="layer3"', start);
  const layer = text.slice(start, end < 0 ? undefined : end);
  const group = /<g\b[^>]*>/.exec(layer)?.[0];
  const outer = transform(group && attr(group, 'transform'));
  let mask = 0;
  for (const [tag] of layer.matchAll(/<circle\b[^>]*>/g)) {
    if (attr(tag, 'r') !== '20') continue;
    const m = mul(outer, transform(attr(tag, 'transform')));
    const cx = fixed(attr(tag, 'cx') ?? '0');
    const cy = fixed(attr(tag, 'cy') ?? '0');
    const x = (m[0] * cx + m[2] * cy) / SCALE + m[4];
    const y = (m[1] * cx + m[3] * cy) / SCALE + m[5];
    POINTS.forEach(([px, py], i) => {
      const dx = px - x, dy = py - y;
      if (dx * dx + dy * dy < 16n * SCALE * SCALE) mask |= 1 << i;
    });
  }
  return mask;
}
// END VALUE DOOR
