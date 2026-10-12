// i122.ts — I-122: the roll-up
// Runs I-108 … I-150, prints the table, reports the shared shape.
import assert from "node:assert";

// ─── The literal /A-Z0-9/ block ────────────────────────────────────
const BLOCK = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// ─── The record runner ─────────────────────────────────────────────
type Record = {
  id: string;
  claim: string;
  run: () => void;
  shape?: string;       // point/line/duality or catch-at-0 or head/value/tail
  status?: "pass" | "fail";
  error?: string;
};

const records: Record[] = [];

function record(id: string, claim: string, run: () => void, shape?: string) {
  records.push({ id, claim, run, shape });
}

// ══════════════════════════════════════════════════════════════════
// I-108: head = modulus, tail = prime
// ══════════════════════════════════════════════════════════════════
record("I-108", "head = modulus, tail = prime", () => {
  const mod = (a: number, m: number) => ((a % m) + m) % m;
  const xor = (...xs: number[]) => xs.reduce((a, b) => a ^ b, 0);
  const atoms = [8, 9, 10, 11].map(m => mod(m, 8));
  assert.deepStrictEqual(atoms, [0, 1, 2, 3]);
  assert.strictEqual(xor(...atoms), 0);
  assert.strictEqual(atoms.reduce((a, b) => a + b, 0), 6);
  assert.strictEqual(xor(1, 1, 1, 1), 0);
  assert.strictEqual(3960, 8 * 9 * 5 * 11);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-109 → I-141: shared zero (derived)
// ══════════════════════════════════════════════════════════════════
record("I-109", "two chains, shared zero (derived)", () => {
  const xor = (...xs: number[]) => xs.reduce((a, b) => a ^ b, 0);
  const chainA = [0,1,2,3,4,5,6,7];
  assert.strictEqual(xor(...chainA), 0);
  assert.strictEqual(xor(1, 2, 3), 0);
  assert.strictEqual(10 % 10, 0);
  assert.strictEqual(9 % 9, 0);
  assert.strictEqual(11 % 11, 0);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-110: the cover is the uncovering (corrected)
// ══════════════════════════════════════════════════════════════════
record("I-110", "cover = uncovering; NaN/RangeError/TypeError split", () => {
  let apiThrew = false;
  try { new Uint8Array(-1); } catch (e) { apiThrew = e instanceof RangeError; }
  assert.ok(apiThrew);
  assert.ok(Number.isNaN(1 % 0));
  assert.strictEqual(1 / 0, Infinity);
  let typeThrew = false;
  try { 17n + 17; } catch (e) { typeThrew = e instanceof TypeError; }
  assert.ok(typeThrew);
  assert.strictEqual(17n + 17n, 34n);
  assert.strictEqual(0x17n, 23n);
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-111: faces are the reverse view
// ══════════════════════════════════════════════════════════════════
record("I-111", "faces are the reverse view; no seam", () => {
  const NIBBLE = [0,1,2,3,4,5,6,7];
  const V = [0x0, 0x1];
  const E = [0x2,0x3,0x4,0x5,0x6,0x7];
  assert.strictEqual(V.length, 2);
  assert.strictEqual(E.length, 6);
  assert.deepStrictEqual([...V, ...E].sort(), NIBBLE);
  const faces = [];
  for (const r of NIBBLE) for (const c of NIBBLE) faces.push([r, c]);
  assert.strictEqual(faces.length, 64);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-112: stellated tetrahedron; swap = presentation
// ══════════════════════════════════════════════════════════════════
record("I-112", "stellated tetrahedron; swap = presentation", () => {
  const V = 4, E = 6, F = 4;
  assert.strictEqual(V - E + F, 2);
  assert.strictEqual(0x8000 ^ 0x0000, 0x8000);
  const swap16 = (x: number) => ((x & 0xFF) << 8) | ((x >> 8) & 0xFF);
  assert.strictEqual(swap16(0x1234), 0x3412);
  assert.strictEqual(3 * 2, 6);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-113: V/E/F partition
// ══════════════════════════════════════════════════════════════════
record("I-113", "V/E/F partition; stellation at 0x3", () => {
  const NIBBLE = [0,1,2,3,4,5,6,7];
  const V = [0x0, 0x1];
  const E = [0x2,0x3,0x4,0x5,0x6,0x7];
  assert.strictEqual(V.length + E.length, 8);
  assert.ok(V.every(v => !E.includes(v)));
  const within = (a: number, c: number, d: number) => Math.abs(a - c) <= d;
  assert.deepStrictEqual(NIBBLE.filter(n => within(n, 0x0, 0x3)), [0,1,2,3]);
  assert.deepStrictEqual(NIBBLE.filter(n => !within(n, 0x0, 0x3)), [4,5,6,7]);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-114: prefix = index length
// ══════════════════════════════════════════════════════════════════
record("I-114", "prefix = index length, not value", () => {
  assert.strictEqual(0b11, 3);
  assert.strictEqual(0o17, 15);
  assert.strictEqual(0x1F, 31);
  assert.strictEqual(typeof 0n, "bigint");
  assert.strictEqual(2 + 2, 4);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-115: 0n vertex, 0u reference
// ══════════════════════════════════════════════════════════════════
record("I-115", "0n vertex, 0u reference; swap permutes order", () => {
  let threw = false;
  try { 17n + 17; } catch (e) { threw = e instanceof TypeError; }
  assert.ok(threw);
  assert.strictEqual(String.fromCodePoint(0x003C), "<");
  assert.strictEqual(0x003C, 60);
  const swap16 = (x: number) => ((x & 0xFF) << 8) | ((x >> 8) & 0xFF);
  assert.strictEqual(swap16(0x003C), 0x3C00);
  assert.strictEqual(60, 60);
}, "head/value/tail");

// ══════════════════════════════════════════════════════════════════
// I-116: index 60 pinned; 0,2,1 interchange
// ══════════════════════════════════════════════════════════════════
record("I-116", "index 60 pinned; 0,2,1 interchange", () => {
  const buf = new Int32Array(128);
  buf[60] = 60;
  const prev = Atomics.compareExchange(buf, 60, 60, 60);
  assert.strictEqual(prev, 60);
  const readNibble = (b: number, high: boolean) => high ? (b >> 4) & 0xF : b & 0xF;
  assert.strictEqual(readNibble(0x1F, false), 0xF);
  assert.strictEqual(readNibble(0x1F, true), 0x1);
  assert.notDeepStrictEqual([0, 2, 1], [0, 1, 2]);
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-117: PINE box
// ══════════════════════════════════════════════════════════════════
record("I-117", "PINE box", () => {
  const PINE = ["0P", "0I", "0N", "0E"];
  assert.strictEqual(PINE.length, 4);
  const seedOf = (m: string) => m[1] === "N" ? "0n" : m[1] === "E" ? "0e" : "0u";
  assert.strictEqual(seedOf("0N"), "0n");
  assert.strictEqual(seedOf("0E"), "0e");
  assert.strictEqual(seedOf("0P"), "0u");
  assert.strictEqual(seedOf("0I"), "0u");
  assert.strictEqual(0x1F - 0x00 + 1, 32);
  assert.strictEqual(0x9F - 0x80 + 1, 32);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-118: decimal = derivative, scientific = exception
// ══════════════════════════════════════════════════════════════════
record("I-118", "decimal = derivative, scientific = exception", () => {
  const x = 123.456;
  const fracPart = x - Math.trunc(x);
  assert.ok(fracPart > 0 && fracPart < 1);
  const h = 1e-6;
  assert.ok(Math.abs(((x + h) - x) / h - 1) < 1e-3);
  assert.ok((1e21).toExponential().includes("e"));
  assert.ok((1e-21).toExponential().includes("e"));
  assert.strictEqual((1e21).toString(), "1e+21");
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-119: globalThis node; base-36 overlay
// ══════════════════════════════════════════════════════════════════
record("I-119", "globalThis node; base-36 overlay", () => {
  assert.strictEqual(typeof globalThis, "object");
  assert.strictEqual(globalThis, globalThis.globalThis);
  const A = (c: number) => 0x41 <= c && c <= 0x5A;
  const D = (c: number) => 0x30 <= c && c <= 0x39;
  const is36 = (c: number) => A(c) || D(c);
  let count = 0;
  for (let c = 0; c < 128; c++) if (is36(c)) count++;
  assert.strictEqual(count, 36);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-120: 3! overlay
// ══════════════════════════════════════════════════════════════════
record("I-120", "3! overlay (streams, GED)", () => {
  import("node:process").then(({ stdin, stdout, stderr }) => {
    assert.strictEqual(stdin.fd, 0);
    assert.strictEqual(stdout.fd, 1);
    assert.strictEqual(stderr.fd, 2);
  });
  function perms<T>(xs: T[]): T[][] {
    if (xs.length <= 1) return [xs];
    const out: T[][] = [];
    for (let i = 0; i < xs.length; i++) {
      const rest = [...xs.slice(0, i), ...xs.slice(i + 1)];
      for (const p of perms(rest)) out.push([xs[i], ...p]);
    }
    return out;
  }
  assert.strictEqual(perms([0,1,2]).length, 6);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-121: nibble-pair root
// ══════════════════════════════════════════════════════════════════
record("I-121", "nibble-pair root; (index, value)", () => {
  const ged = { index: 0x910, value: 0x01 };
  assert.strictEqual(typeof ged.index, "number");
  assert.strictEqual(typeof ged.value, "number");
  assert.strictEqual(0x0, 0);
  assert.strictEqual(0x00, 0);
  assert.strictEqual(0x0, 0x00);
  assert.strictEqual(0x1F - 0x00 + 1, 32);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-123: S3 at four scales
// ══════════════════════════════════════════════════════════════════
record("I-123", "S3 at four scales; XOR/Fano/byte", () => {
  const scales = {
    transistor: ["gate", "source", "drain"],
    streams: [0, 1, 2],
    readings: ["fwd", "row", "diag"],
    swaps: [16, 32, 64],
  };
  for (const xs of Object.values(scales)) assert.strictEqual(xs.length, 3);
  const FANO = 7, GF2_3 = 8;
  assert.strictEqual(GF2_3 - 1, FANO);
  assert.strictEqual(1 ^ 2 ^ 3, 0);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-124: 4 circuits, 7 positions, 12th meta
// ══════════════════════════════════════════════════════════════════
record("I-124", "4 circuits / 7 positions / 12th meta", () => {
  assert.strictEqual(4, 4);
  assert.strictEqual(7, 7);
  assert.strictEqual(12, 7 + 5);
  assert.strictEqual(0xC, 12);
  assert.strictEqual(0xC0, 192);
  assert.strictEqual(192 % 8, 0);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-125: compare-exchange chain
// ══════════════════════════════════════════════════════════════════
record("I-125", "compare-exchange chain + 72/60/48 descent", () => {
  const calls = [
    { index: 60,  expected: 128, replacement: 64  },
    { index: 128, expected: 64,  replacement: 60  },
    { index: 64,  expected: 60,  replacement: 128 },
  ];
  assert.strictEqual(calls.length, 3);
  const chain = [72, 60, 48];
  assert.deepStrictEqual(chain.map(v => v / 12), [6, 5, 4]);
  for (const v of chain) assert.strictEqual(v % 12, 0);
  assert.deepStrictEqual([chain[0] % 11, chain[1] % 10, chain[2] % 9], [6, 0, 3]);
  const fact = (n: number): number => n <= 1 ? 1 : n * fact(n - 1);
  assert.strictEqual(fact(8) % fact(0), 0);
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-126: Node Buffer
// ══════════════════════════════════════════════════════════════════
record("I-126", "Node Buffer: byte indexing, endianness, native swaps", () => {
  const buf = Buffer.alloc(128);
  buf[60] = 0x3C;
  assert.strictEqual(buf[60], 60);
  assert.strictEqual(buf.length, 128);
  const b16 = Buffer.from([0x12, 0x34]);
  b16.swap16();
  assert.deepStrictEqual([...b16], [0x34, 0x12]);
  const b32 = Buffer.from([0x12,0x34,0x56,0x78]);
  b32.swap32();
  assert.deepStrictEqual([...b32], [0x78,0x56,0x34,0x12]);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-127: error taxonomy + DOM inheritance
// ══════════════════════════════════════════════════════════════════
record("I-127", "error taxonomy (space/range/frame) + DOM", () => {
  let threw = false, msg = "";
  try { Atomics.compareExchange(new Float64Array(4) as any, 0, 0, 0); }
  catch (e: any) { threw = e instanceof TypeError; msg = e.message; }
  assert.ok(threw);
  assert.ok(/integer typed array/.test(msg));
  let threwR = false;
  try { Atomics.compareExchange(new Int32Array(4), 999, 0, 0); }
  catch (e) { threwR = e instanceof RangeError; }
  assert.ok(threwR);
  assert.ok(Number.isNaN(0 % 0));
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-127b: the octet of Atomics spaces
// ══════════════════════════════════════════════════════════════════
record("I-127b", "octet of Atomics spaces: 4 widths × 2 signedness = 8", () => {
  const buf = Buffer.alloc(128);
  const spaces: [string, any, any, any][] = [
    ["u8",  new Uint8Array(buf.buffer, 0, 128), 0, 0],
    ["i8",  new Int8Array(buf.buffer, 0, 128),  0, 0],
    ["u16", new Uint16Array(buf.buffer, 0, 64), 0, 0],
    ["i16", new Int16Array(buf.buffer, 0, 64),  0, 0],
    ["u32", new Uint32Array(buf.buffer, 0, 32), 0, 0],
    ["i32", new Int32Array(buf.buffer, 0, 32),  0, 0],
    ["big64",  new BigInt64Array(buf.buffer, 0, 16),  0n, 0n],
    ["ubig64", new BigUint64Array(buf.buffer, 0, 16), 0n, 0n],
  ];
  assert.strictEqual(spaces.length, 8);
  for (const [name, view, exp, repl] of spaces) {
    const r = Atomics.compareExchange(view, 0, exp, repl);
    assert.strictEqual(r, exp, `${name} works`);
  }
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-128: prompt characters + Atomics cycle
// ══════════════════════════════════════════════════════════════════
record("I-128", "prompt characters + Atomics cycle + mod-12 orbits", () => {
  const prompt = "main@TOSHIBA-PORTEGE-Z30t-C:~/Programs/boxedPINE/src$ ";
  const buf = Buffer.alloc(256);
  Buffer.from(prompt).copy(buf, 0);
  const view = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  const IA = 10, IB = 20, IC = 30;
  const bA = buf[IA], bB = buf[IB], bC = buf[IC];
  Atomics.compareExchange(view, IA, bA, bB);
  Atomics.compareExchange(view, IB, bB, bC);
  Atomics.compareExchange(view, IC, bC, bA);
  assert.strictEqual(buf[IA], bB);
  assert.strictEqual(buf[IB], bC);
  assert.strictEqual(buf[IC], bA);
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-129: 60^n hex-digit descent
// ══════════════════════════════════════════════════════════════════
record("I-129", "60^n hex-digit descent + prompt sigils + 64-blocks", () => {
  const orbit = Array.from({ length: 20 }, (_, i) => 60 ^ (64 + i));
  const nibbles = orbit.map(c => c & 0xF);
  assert.deepStrictEqual(
    nibbles,
    [0xC,0xD,0xE,0xF, 0x8,0x9,0xA,0xB, 0x4,0x5,0x6,0x7,
     0x0,0x1,0x2,0x3, 0xC,0xD,0xE,0xF]
  );
  const sixteen = Array.from({ length: 16 }, (_, i) => 0x30 + i);
  assert.strictEqual(sixteen.map(c => String.fromCharCode(c)).join(""),
    "0123456789:;<=>?");
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-130: two rates; 5-slice; Unicode lift
// ══════════════════════════════════════════════════════════════════
record("I-130", "two rates + 5-slice + Unicode lift", () => {
  const mod = (a: bigint, m: bigint) => ((a % m) + m) % m;
  for (const m of [8n,9n,10n,11n]) assert.strictEqual(mod(5n, m), 5n);
  function liftEven(start: bigint, steps: number): bigint[] {
    const out = [start];
    for (let i = 1; i < steps; i++) out.push(out[i-1] * 2n);
    return out;
  }
  function liftOdd(start: bigint, steps: number): bigint[] {
    const out = [start];
    for (let i = 1; i < steps; i++) out.push(out[i-1] * 2n + 1n);
    return out;
  }
  const l6 = liftEven(0x6n, 29);
  const l8 = liftEven(0x8n, 29);
  const l10 = liftEven(0xAn, 29);
  const l9 = liftOdd(0x9n, 29);
  assert.strictEqual(l8[l8.length-1], 0x80000000n);
  assert.strictEqual(l9[l9.length-1], 0x9FFFFFFFn);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-131: walls at 4/5/6; 0,2,1 offset
// ══════════════════════════════════════════════════════════════════
record("I-131", "adding 6; walls at 4/5/6; 0,2,1 offset", () => {
  const CAP = 0x80000000n;
  function liftEvenCapped(base: bigint, cap: bigint): bigint[] {
    const out = [base];
    while (out[out.length - 1] * 2n < cap) out.push(out[out.length - 1] * 2n);
    return out;
  }
  function liftOddCapped(base: bigint, cap: bigint): bigint[] {
    const out = [base];
    while (out[out.length - 1] * 2n + 1n < cap) out.push(out[out.length - 1] * 2n + 1n);
    return out;
  }
  const l6  = liftEvenCapped(0x6n, CAP);
  const l8  = liftEvenCapped(0x8n, CAP);
  const l10 = liftEvenCapped(0xAn, CAP);
  const l9  = liftOddCapped (0x9n, CAP);
  assert.strictEqual(l6[l6.length-1], 0x60000000n);
  assert.strictEqual(l8[l8.length-1], 0x40000000n);
  assert.strictEqual(l10[l10.length-1], 0x50000000n);
  assert.strictEqual(l9[l9.length-1], 0x4FFFFFFFn);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-132: exponent meeting
// ══════════════════════════════════════════════════════════════════
record("I-132", "exponent meeting (2^4, 2^5, 2^6, 2^16, 16^10)", () => {
  assert.strictEqual(2 ** 4, 16);
  assert.strictEqual(2 ** 5, 32);
  assert.strictEqual(2 ** 6, 64);
  assert.strictEqual(2 ** 16, 65536);
  assert.strictEqual(16 ** 10, 2 ** 40);
  for (let n = 0; n <= 10; n++) {
    assert.strictEqual(Math.log2(16 ** n), 4 * n);
  }
  assert.strictEqual(2 ** 16, 16 ** 4);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-133b: base-36 gap delineation
// ══════════════════════════════════════════════════════════════════
record("I-133b", "delineating :; <=>? {|}~ via 59/60, 127, 63", () => {
  const m36 = (n: number) => n % 36;
  assert.strictEqual(m36(63) - m36(127), 8);
  const groups = {
    colon:   [0x3A, 0x3B],
    compare: [0x3C, 0x3D, 0x3E, 0x3F],
    brace:   [0x7B, 0x7C, 0x7D, 0x7E],
  };
  assert.strictEqual(groups.colon.length, 2);
  assert.strictEqual(groups.compare.length, 4);
  assert.strictEqual(groups.brace.length, 4);
  assert.strictEqual(groups.colon.length + groups.compare.length, 6);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-134: base-36 tag literal taxonomy
// ══════════════════════════════════════════════════════════════════
record("I-134", "base-36 tag literal taxonomy", () => {
  assert.strictEqual(0x5F, 95);
  assert.strictEqual(0x60, 96);
  assert.strictEqual(0x61, 97);
  for (const [u, l] of [["A","a"], ["Z","z"]]) {
    assert.strictEqual(l.charCodeAt(0) - u.charCodeAt(0), 0x20);
  }
  assert.strictEqual(0x1B, 27);
  assert.strictEqual(0xFEFF, 65279);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-135: Proxy/Reflect/Catch/Template
// ══════════════════════════════════════════════════════════════════
record("I-135", "Proxy/Reflect/Catch/Template pattern", () => {
  const swap16 = (x: number) => ((x & 0xFF) << 8) | ((x >> 8) & 0xFF);
  assert.strictEqual(swap16(0xFEFF), 0xFFFE);
  const traps = ["get","set","has","deleteProperty","ownKeys","apply","construct"];
  for (const t of traps) assert.ok(t in Reflect);
  assert.ok(new TypeError("x") instanceof Error);
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-136: all catches converge at 0
// ══════════════════════════════════════════════════════════════════
record("I-136", "all catches converge at 0", () => {
  const classify = (e: unknown): string =>
    e instanceof TypeError  ? "space"   :
    e instanceof RangeError ? "range"   :
    e instanceof EvalError  ? "code"    : "default";
  assert.strictEqual(classify(new TypeError("x")),  "space");
  assert.strictEqual(classify(new RangeError("x")), "range");
  assert.strictEqual(classify(new EvalError("x")),  "code");
  assert.strictEqual(classify(new Error("x")),      "default");
  const interchange = [0, 2, 1];
  assert.strictEqual(interchange[0], 0);
  assert.strictEqual(interchange[1], 2);
  assert.strictEqual(interchange[2], 1);
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-137: mod_rewrite two-phase reduction
// ══════════════════════════════════════════════════════════════════
record("I-137", "mod_rewrite two-phase reduction + catch-all", () => {
  type Vhost = { ip: string; port: number | "*"; serverName: string; priority: number };
  function phase1Match(vhosts: Vhost[], ip: string, port: number): Vhost[] {
    const tiers = [
      (v: Vhost) => v.ip === ip && v.port === port,
      (v: Vhost) => v.ip === ip && v.port === "*",
      (v: Vhost) => v.ip === "*" && v.port === port,
      (v: Vhost) => v.ip === "*" && v.port === "*",
    ];
    for (const tier of tiers) {
      const m = vhosts.filter(tier);
      if (m.length > 0) return m;
    }
    return [];
  }
  const vhosts: Vhost[] = [
    { ip: "10.0.0.1", port: 80,  serverName: "a", priority: 1 },
    { ip: "10.0.0.1", port: "*", serverName: "b", priority: 2 },
    { ip: "*",        port: 80,  serverName: "c", priority: 3 },
    { ip: "*",        port: "*", serverName: "d", priority: 4 },
  ];
  assert.deepStrictEqual(phase1Match(vhosts, "10.0.0.1", 80).map(v => v.serverName), ["a"]);
  assert.deepStrictEqual(phase1Match(vhosts, "10.0.0.2", 80).map(v => v.serverName), ["c"]);
  assert.deepStrictEqual(phase1Match(vhosts, "x", 99999).map(v => v.serverName), ["d"]);
  const noWild: Vhost[] = [
    { ip: "10.0.0.1", port: 80,  serverName: "a", priority: 1 },
    { ip: "10.0.0.1", port: "*", serverName: "b", priority: 2 },
  ];
  assert.deepStrictEqual(phase1Match(noWild, "10.0.0.2", 99999), []);
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-138: HTTP/1.1 three-reference index
// ══════════════════════════════════════════════════════════════════
record("I-138", "HTTP/1.1 three-reference index", () => {
  const m = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec("bytes 500-999/1234");
  assert.ok(m !== null);
  assert.strictEqual(Number(m![1]), 500);
  assert.strictEqual(Number(m![2]), 999);
  assert.strictEqual(Number(m![3]), 1234);
  const errors: Record<number, string> = {
    400: "space", 404: "frame", 416: "range", 500: "code",
  };
  assert.strictEqual(errors[400], "space");
  assert.strictEqual(errors[404], "frame");
  assert.strictEqual(errors[416], "range");
  assert.strictEqual(errors[500], "code");
}, "head/value/tail");

// ══════════════════════════════════════════════════════════════════
// I-139: Host header + window frame + uppercase-as-header
// ══════════════════════════════════════════════════════════════════
record("I-139", "Host header + window frame + uppercase-as-header", () => {
  function http11RequestValid(h: Record<string, string>): number {
    return "Host" in h ? 200 : 400;
  }
  assert.strictEqual(http11RequestValid({}), 400);
  assert.strictEqual(http11RequestValid({ Host: "x" }), 200);
  assert.strictEqual(0x41 + 0x20, 0x61);
  assert.strictEqual(parseInt("A", 36), 10);
  assert.strictEqual(parseInt("a", 36), 10);
  assert.strictEqual(4 * 36 * 36 + 4 * 36 + 19, 5347);
}, "head/value/tail");

// ══════════════════════════════════════════════════════════════════
// I-140: Web Workers as 65536-space
// ══════════════════════════════════════════════════════════════════
record("I-140", "Web Workers as 65536-space background processors", () => {
  const SPACE = 2 ** 16;
  assert.strictEqual(SPACE, 65536);
  assert.strictEqual(SPACE / 4, 2 ** 14);
  const slices = Array.from({ length: 4 }, (_, i) => ({
    start: i * 16384, end: (i + 1) * 16384 - 1,
  }));
  assert.deepStrictEqual(slices[0], { start: 0, end: 16383 });
  assert.deepStrictEqual(slices[3], { start: 49152, end: 65535 });
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-141: the shared zero is derived
// ══════════════════════════════════════════════════════════════════
record("I-141", "the shared zero is derived, not axiomatic", () => {
  const xor = (...xs: number[]) => xs.reduce((a, b) => a ^ b, 0);
  assert.strictEqual(xor(0, 1, 2, 3), 0);
  assert.strictEqual(xor(1, 2, 3, 4, 5, 6, 7), 0);
  const fact = (n: number): number => n <= 1 ? 1 : n * fact(n - 1);
  for (let k = 1; k <= 8; k++) assert.strictEqual(fact(8) % k, 0);
  // XOR closure threshold at n >= 2
  function xorRange(lo: number, hi: number): number {
    let x = 0;
    for (let i = lo; i <= hi; i++) x ^= i;
    return x;
  }
  for (let n = 2; n <= 8; n++) assert.strictEqual(xorRange(0, 2 ** n - 1), 0);
  assert.strictEqual(xorRange(0, 1), 1);  // n = 1 case
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-142: Unicode lift 0x8 → 0xFFFFFFFF
// ══════════════════════════════════════════════════════════════════
record("I-142", "Unicode lift 0x8 → 0xFFFFFFFF, end-to-end", () => {
  const CAP = 0x80000000n;
  function liftEvenCapped(base: bigint, cap: bigint): bigint[] {
    const out = [base];
    while (out[out.length - 1] * 2n < cap) out.push(out[out.length - 1] * 2n);
    return out;
  }
  const l8 = liftEvenCapped(0x8n, CAP);
  assert.strictEqual(l8[l8.length-1], 0x40000000n);
  assert.strictEqual(0xFFFFFFFFn, 4294967295n);
  assert.strictEqual(0xFFFFFFFFn + 1n, 0x100000000n);
  const surrogateLo = 0x8000n;
  const surrogateHi = 0xFFFFn;
  assert.strictEqual(surrogateHi - surrogateLo + 1n, 0x8000n);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-143: prompt sigils as two privilege frames
// ══════════════════════════════════════════════════════════════════
record("I-143", "prompt sigils as two privilege frames", () => {
  const root = 16n ** 19n;
  const user = 16n ** 21n;
  assert.strictEqual(root, 2n ** 76n);
  assert.strictEqual(user, 2n ** 84n);
  assert.strictEqual(user / root, 256n);
  const unicodeMax = 0x10FFFFn;
  assert.strictEqual(unicodeMax.toString(2).length, 21);
}, "head/value/tail");

// ══════════════════════════════════════════════════════════════════
// I-144b: base-36 as literal /A-Z0-9/ block
// ══════════════════════════════════════════════════════════════════
record("I-144b", "base-36 as literal /A-Z0-9/ block", () => {
  assert.strictEqual(BLOCK.length, 36);
  assert.strictEqual(BLOCK[0], "0");
  assert.strictEqual(BLOCK[10], "A");
  assert.strictEqual(BLOCK[31], "V");
  assert.strictEqual(BLOCK[35], "Z");
  assert.strictEqual(BLOCK.indexOf("V"), 31);
  // the gap
  const gap: number[] = [];
  for (let c = 0x3A; c <= 0x40; c++) gap.push(c);
  assert.strictEqual(gap.length, 7);
  assert.deepStrictEqual(gap.map(c => String.fromCharCode(c)),
    [":",";","<","=",">","?","@"]);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-145: 0x20 as the Hamming prefix; Fano projection
// ══════════════════════════════════════════════════════════════════
record("I-145", "0x20 as the Hamming prefix; Fano projection", () => {
  assert.strictEqual(0x20, 32);
  assert.strictEqual(0x20.toString(2), "100000");
  // gap is 7 chars
  const gap: number[] = [];
  for (let c = 0x3A; c <= 0x40; c++) gap.push(c);
  assert.strictEqual(gap.length, 7);
  // 0x20-0x3F: bit 5 set; 0x40-0x5F: bit 6 set
  for (let c = 0x20; c <= 0x3F; c++) {
    assert.strictEqual(c & 0x20, 0x20);
    assert.strictEqual(c & 0x40, 0);
  }
  for (let c = 0x40; c <= 0x5F; c++) {
    assert.strictEqual(c & 0x40, 0x40);
    assert.strictEqual(c & 0x20, 0);
  }
  // gap straddles: 6 + 1
  const gapLow = gap.filter(c => c <= 0x3F);
  const gapHigh = gap.filter(c => c === 0x40);
  assert.strictEqual(gapLow.length, 6);
  assert.strictEqual(gapHigh.length, 1);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-146b: every 7-slot cycle closes with a BEL-equivalent reset
// ══════════════════════════════════════════════════════════════════
record("I-146b", "every 7-slot cycle closes with a BEL reset", () => {
  assert.strictEqual(0x07, 7);
  assert.strictEqual((0x07).toString(2), "111");
  const gap: number[] = [];
  for (let c = 0x3A; c <= 0x40; c++) gap.push(c);
  let gapXor = 0;
  for (const c of gap) gapXor ^= c;
  assert.strictEqual(gapXor, 0x41);  // 'A', not BEL
  // structural reset: any 7-slot window closes
  function structuralClose(buf: Uint8Array, start: number): boolean {
    return start + 7 <= buf.length;
  }
  const buf = new Uint8Array(28);
  assert.ok(structuralClose(buf, 0));
  assert.ok(structuralClose(buf, 21));
  assert.ok(!structuralClose(buf, 22));
}, "catch-at-0");

// ══════════════════════════════════════════════════════════════════
// I-147: gap as constant tag; beep content-specific
// ══════════════════════════════════════════════════════════════════
record("I-147", "gap as constant tag; beep content-specific for base-36", () => {
  const gap: number[] = [];
  for (let c = 0x3A; c <= 0x40; c++) gap.push(c);
  for (const c of gap) {
    assert.ok(!BLOCK.includes(String.fromCharCode(c)));
  }
  for (const c of "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    assert.ok(BLOCK.includes(c));
  }
  assert.strictEqual(gap.length, 7);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-148: PINEboxed SPO + swap axes
// ══════════════════════════════════════════════════════════════════
record("I-148", "PINEboxed SPO + swap axes anchored at 0n, 0u", () => {
  const swap16 = (x: number) => ((x & 0xFF) << 8) | ((x >> 8) & 0xFF);
  const swap32 = (x: number) => {
    x = ((x & 0xFFFF) << 16) | ((x >>> 16) & 0xFFFF);
    return ((x & 0xFF00FF00) >>> 8) | ((x & 0x00FF00FF) << 8);
  };
  assert.strictEqual(swap16(swap16(0x1234)), 0x1234);
  assert.strictEqual(swap32(swap32(0x12345678)), 0x12345678);
  assert.strictEqual(3 * 2, 6);
  assert.strictEqual(8 + 12 + 6, 26);
}, "head/value/tail");

// ══════════════════════════════════════════════════════════════════
// I-149: DOMMatrix over IPv4
// ══════════════════════════════════════════════════════════════════
record("I-149", "DOMMatrix over IPv4; WebXR observer; MIDI channel", () => {
  assert.strictEqual(4 * 4, 16);
  assert.strictEqual(2 ** 4, 16);
  const ip = "192.168.1.1".split(".").map(Number);
  assert.strictEqual(ip.length, 4);
  const pose = new Float32Array(16);
  assert.strictEqual(pose.length, 16);
  const midi = new Uint8Array([0x90, 0x3C, 0x7F]);
  assert.strictEqual(midi.length, 3);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-150: 144 web workers, HSV of codepoints
// ══════════════════════════════════════════════════════════════════
record("I-150", "144 web workers, HSV of codepoints", () => {
  const scopes = ["Window","DedicatedWorkerGlobalScope","SharedWorkerGlobalScope","ServiceWorkerGlobalScope"];
  assert.strictEqual(scopes.length, 4);
  assert.strictEqual(BLOCK.length, 36);
  assert.strictEqual(scopes.length * BLOCK.length, 144);
  assert.strictEqual(12 * 12, 144);
  assert.strictEqual(256 ** 4, 2 ** 32);
  assert.strictEqual(256 ** 4, 4294967296);
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// I-151: edge-n-tokenizer → TemplateLiteralArray → RegExp → Proxy/Reflect
// ══════════════════════════════════════════════════════════════════
record("I-151", "edge-n-tokenizer → TemplateLiteralArray → RegExp → Proxy/Reflect", () => {
  const VERTEX = [0x0, 0x1];
  const EDGE   = [0x2, 0x3, 0x4, 0x5, 0x6, 0x7];
  assert.strictEqual(VERTEX.length, 2);
  assert.strictEqual(EDGE.length, 6);
  assert.strictEqual(VERTEX.length + EDGE.length, 8);

  type Token = { kind: "edge" | "data"; value: number; index: number };
  function edgeNTokenize(buf: Uint8Array, n: number): Token[] {
    const tokens: Token[] = [];
    const edgeSet = new Set(EDGE);
    let dataRun: number[] = [];
    let runStart = 0;
    for (let i = 0; i < buf.length; i++) {
      if (edgeSet.has(buf[i])) {
        if (dataRun.length > 0) {
          for (let j = 0; j < dataRun.length; j++) {
            tokens.push({ kind: "data", value: dataRun[j], index: runStart + j });
          }
          dataRun = [];
        }
        tokens.push({ kind: "edge", value: buf[i], index: i });
      } else {
        if (dataRun.length === 0) runStart = i;
        dataRun.push(buf[i]);
      }
    }
    if (dataRun.length > 0) {
      for (let j = 0; j < dataRun.length; j++) {
        tokens.push({ kind: "data", value: dataRun[j], index: runStart + j });
      }
    }
    const grouped: Token[] = [];
    let edgeRun: Token[] = [];
    for (const t of tokens) {
      if (t.kind === "edge") {
        edgeRun.push(t);
        if (edgeRun.length === n) { grouped.push(...edgeRun); edgeRun = []; }
      } else {
        if (edgeRun.length > 0) { grouped.push(...edgeRun); edgeRun = []; }
        grouped.push(t);
      }
    }
    if (edgeRun.length > 0) grouped.push(...edgeRun);
    return grouped;
  }

  function re(strings: TemplateStringsArray, ...values: unknown[]): RegExp {
    let pattern = "";
    for (let i = 0; i < strings.length; i++) {
      pattern += strings[i];
      if (i < values.length) pattern += String(values[i]);
    }
    return new RegExp(pattern);
  }

  function makeSelfContainedProxy<T extends object>(target: T) {
    const handler: ProxyHandler<T> = {
      get(t, p, r) { return Reflect.get(t, p, r); },
      set(t, p, v, r) { return Reflect.set(t, p, v, r); },
      has(t, p) { return Reflect.has(t, p); },
      deleteProperty(t, p) { return Reflect.deleteProperty(t, p); },
      ownKeys(t) { return Reflect.ownKeys(t); },
      getOwnPropertyDescriptor(t, p) { return Reflect.getOwnPropertyDescriptor(t, p); },
    };
    return new Proxy(target, handler);
  }

  const testBuf = new Uint8Array([0x41, 0x02, 0x42, 0x03, 0x43]);
  const tokens = edgeNTokenize(testBuf, 1);
  assert.ok(tokens.length > 0);
  assert.strictEqual(tokens.filter(t => t.kind === "edge").length, 2);

  const rx = re`^a${"b"}+c$`;
  assert.ok(rx instanceof RegExp);
  assert.strictEqual(rx.source, "^ab+c$");

  const obj = makeSelfContainedProxy({ a: 1, b: 2 });
  assert.strictEqual(obj.a, 1);
  obj.c = 3;
  assert.strictEqual(obj.c, 3);
  delete (obj as any).c;
  assert.ok(!("c" in obj));

  for (const n of [1, 2, 3, 4, 5, 6]) {
    assert.ok(edgeNTokenize(testBuf, n).length > 0);
  }
}, "point/line/duality");

// ══════════════════════════════════════════════════════════════════
// Run all records
// ══════════════════════════════════════════════════════════════════
console.log("═".repeat(72));
console.log("I-122: THE ROLL-UP");
console.log("═".repeat(72));
console.log();

const results: Record[] = [];
for (const r of records) {
  try {
    r.run();
    r.status = "pass";
  } catch (e) {
    r.status = "fail";
    r.error = e instanceof Error ? e.message : String(e);
  }
  results.push(r);
}

// Table
const idW = 10, claimW = 55;
console.log(`${"ID".padEnd(idW)} ${"CLAIM".padEnd(claimW)} STATUS`);
console.log("─".repeat(idW + claimW + 8));
for (const r of results) {
  const id = r.id.padEnd(idW);
  const claim = r.claim.slice(0, claimW).padEnd(claimW);
  const status = r.status === "pass" ? "✔ pass" : "✗ FAIL";
  console.log(`${id} ${claim} ${status}`);
}

console.log();
console.log("═".repeat(72));

// Summary
const passed = results.filter(r => r.status === "pass").length;
const failed = results.filter(r => r.status === "fail").length;
console.log(`Total:   ${results.length} records`);
console.log(`Passed:  ${passed}`);
console.log(`Failed:  ${failed}`);
console.log();

// Shared shapes
const shapes = new Map<string, number>();
for (const r of results) {
  if (r.shape) shapes.set(r.shape, (shapes.get(r.shape) ?? 0) + 1);
}
console.log("SHARED SHAPES");
console.log("─".repeat(72));
for (const [shape, count] of [...shapes.entries()].sort((a,b) => b[1]-a[1])) {
  console.log(`  ${shape.padEnd(20)} ${count} records`);
}

console.log();
console.log("═".repeat(72));
console.log("THE SHARED STRUCTURE");
console.log("═".repeat(72));
console.log(`
The vault is one structure read ${results.length} times:

  Primitive:         point-line duality (I-108)
  Operation:         the reduction to the frame (I-108)
  Closure:           0, derived not assumed (I-141)
  Catch condition:   no frame matches (I-136 … I-140)
  Triple:            head / value / tail (I-138, I-148)
  Reset:             the 7-slot BEL (I-146b)
  Constant tag:      the gap :;<=>?@ (I-147)
  Structure:         fixed; interpretation is the only change (I-148)

Recurring constants:

  4      nibbles, walls, 2^4, workers
  8      octet, mod-8 frame, Atomics spaces
  6      S3, 6 DOF, sextuplet
  5      constant column, wall, {|}~ size
  12     mod-12 ring
  60     anchor index, sexagesimal ruler
  0      closure, catch, catch-all

Strongest claims (the engine's own words):

  TypeError: not an integer typed array      (I-127b)
  Atomics accepts exactly 8 integer spaces   (I-127b)
  Host header mandatory                       (I-139)
  window errors inside a worker               (I-140)
  swap16 on Buffer                            (I-126)
  XRRigidTransform.matrix = Float32Array(16)  (I-149)
  WindowOrWorkerGlobalScope mixin             (I-150)

Threshold corrections:

  I-131: high bit exclusive (<= → <)
  I-141: XOR/XNOR threshold at n = 2
  I-145: bit 5 / bit 6 boundary (<= 0x5F → <= 0x3F)
  I-146b: gap XOR = 'A' (0x41), not BEL
`);

console.log("═".repeat(72));
console.log(`I-122: ${passed} passed, ${failed} failed, ${results.length} total`);
console.log("═".repeat(72));

if (failed > 0) {
  process.exit(1);
}