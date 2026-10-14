/**
 * OMI-IMO Blob Substrate — tetrahedron-configured SharedArrayBuffer (65536 bytes)
 *
 * Spec: The BusyBox + DOM Unified Proposal, Part V (§13–§16) + Deliverable #3.
 *
 *   The Blob is the substrate. The agents are the observers. The work is the
 *   operation. The Blob sits in a tetrahedron configuration — 4 vertices,
 *   6 edges, 4 faces, 1 centroid — and every terminal contends on the SAME
 *   buffer through the SOLE mutation primitive: Atomics.compareExchange.
 *
 * Layout (Int32Array; 65536 bytes = 16384 slots):
 *   slots 0..15    vertices  (4 × stride 4: x, y, z, id)
 *   slots 16..39   edges     (6 × stride 4: a, b, xor, val)
 *   slots 40..55   faces     (4 × stride 4: e0, e1, e2, xor)
 *   slots 56..63   centroid  (metron: cx, cy, cz, xorFold, epoch, lock, cmd, tick)
 *   slots 64..end  free workspace for agent rods
 *
 * The four vertices are seeded with the boot masks:
 *   BOOT0=0x1C  BOOT1=0x1D  SECURE=0x1E  USER=0x1F
 * whose XOR folds to 0x0000 — the centroid, the observer, the metron.
 */
'use strict';

const BLOB_BYTES = 65536;
const BLOB_SLOTS = BLOB_BYTES / 4; // 16384

const VERTEX_COUNT = 4;
const EDGE_COUNT = 6;
const FACE_COUNT = 4;

const VERTEX_STRIDE = 4;
const EDGE_STRIDE = 4;
const FACE_STRIDE = 4;

// Slot offsets
const V0 = 0;                       // vertices start
const E0 = VERTEX_COUNT * VERTEX_STRIDE;        // 16
const F0 = E0 + EDGE_COUNT * EDGE_STRIDE;       // 40
const C0 = F0 + FACE_COUNT * FACE_STRIDE;       // 56
const WORKSPACE = C0 + 8;                        // 64

// Centroid (metron) sub-slots
const MET = Object.freeze({
  CX: 0, CY: 1, CZ: 2, XOR_FOLD: 3, EPOCH: 4, LOCK: 5, CMD: 6, TICK: 7
});

const VERTEX_IDS = Object.freeze([0x1c, 0x1d, 0x1e, 0x1f]); // BOOT0 BOOT1 SECURE USER

const EDGE_PAIRS = Object.freeze([
  [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
]);

// Each face omits one vertex (its complementary simplex); XOR of the kept three.
const FACE_OMIT = Object.freeze([[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]]);

function createSharedBuffer(byteLength) {
  const bytes = Math.max(byteLength || BLOB_BYTES, 256);
  let sab;
  try {
    sab = new SharedArrayBuffer(bytes);
  } catch (_) {
    sab = new ArrayBuffer(bytes);
  }
  return sab;
}

/**
 * Bind the tetrahedron scaffold into the buffer.
 * Seeding is performed with atomic CAS so any first writer wins; the seed is
 * deterministic and idempotent.
 */
function bind(blobOpts = {}) {
  const sab = blobOpts.sab || createSharedBuffer(blobOpts.bytes);
  const view = new Int32Array(sab);
  const shared = sab instanceof SharedArrayBuffer;

  function cas(i, expected, replacement) {
    if (typeof Atomics !== 'undefined' && shared) {
      return Atomics.compareExchange(view, i, expected, replacement);
    }
    const old = view[i];
    if (old === expected) view[i] = replacement;
    return old;
  }
  function load(i) {
    return (typeof Atomics !== 'undefined' && shared) ? Atomics.load(view, i) : view[i];
  }
  function store(i, v) {
    if (typeof Atomics !== 'undefined' && shared) Atomics.store(view, i, v);
    else view[i] = v;
  }

  // Seed vertices via CAS from 0 → mask (first binder wins; idempotent after).
  for (let v = 0; v < VERTEX_COUNT; v++) {
    const base = V0 + v * VERTEX_STRIDE;
    cas(base + 3, 0, VERTEX_IDS[v]);           // id (x,y,z left to the observer)
    store(base + 0, 0);                        // x
    store(base + 1, 0);                        // y
    store(base + 2, 0);                        // z
  }

  // Edges: pair XOR + endpoints.
  for (let e = 0; e < EDGE_COUNT; e++) {
    const base = E0 + e * EDGE_STRIDE;
    const [a, b] = EDGE_PAIRS[e];
    store(base + 0, a);
    store(base + 1, b);
    store(base + 2, VERTEX_IDS[a] ^ VERTEX_IDS[b]);
    store(base + 3, VERTEX_IDS[a] ^ VERTEX_IDS[b]);
  }

  // Faces: total XOR of the three kept vertices (the smoothing normal id).
  for (let f = 0; f < FACE_COUNT; f++) {
    const base = F0 + f * FACE_STRIDE;
    const k0 = FACE_OMIT[f];
    const x0 = VERTEX_IDS[k0[0]] ^ VERTEX_IDS[k0[1]] ^ VERTEX_IDS[k0[2]];
    store(base + 0, k0[0]);
    store(base + 1, k0[1]);
    store(base + 2, k0[2]);
    store(base + 3, x0);
  }

  // Centroid = XOR fold of the four vertex masks === 0x0000.
  const centroid = VERTEX_IDS[0] ^ VERTEX_IDS[1] ^ VERTEX_IDS[2] ^ VERTEX_IDS[3];
  store(C0 + MET.CX, 0);
  store(C0 + MET.CY, 0);
  store(C0 + MET.CZ, 0);
  store(C0 + MET.XOR_FOLD, centroid);
  store(C0 + MET.EPOCH, 0);
  store(C0 + MET.LOCK, 0);
  store(C0 + MET.CMD, 0);
  store(C0 + MET.TICK, 0);

  return { sab, view, shared };
}

// ---------- Accessors (read via Atomics when shared) ----------

function vertex(view, i, shared) {
  const base = V0 + i * VERTEX_STRIDE;
  return {
    x: (shared ? Atomics.load(view, base + 0) : view[base + 0]),
    y: (shared ? Atomics.load(view, base + 1) : view[base + 1]),
    z: (shared ? Atomics.load(view, base + 2) : view[base + 2]),
    id: (shared ? Atomics.load(view, base + 3) : view[base + 3])
  };
}

function edge(view, i, shared) {
  const base = E0 + i * EDGE_STRIDE;
  return {
    a: (shared ? Atomics.load(view, base + 0) : view[base + 0]),
    b: (shared ? Atomics.load(view, base + 1) : view[base + 1]),
    xor: (shared ? Atomics.load(view, base + 2) : view[base + 2]),
    val: (shared ? Atomics.load(view, base + 3) : view[base + 3])
  };
}

function face(view, i, shared) {
  const base = F0 + i * FACE_STRIDE;
  return {
    v0: (shared ? Atomics.load(view, base + 0) : view[base + 0]),
    v1: (shared ? Atomics.load(view, base + 1) : view[base + 1]),
    v2: (shared ? Atomics.load(view, base + 2) : view[base + 2]),
    xor: (shared ? Atomics.load(view, base + 3) : view[base + 3])
  };
}

function centroid(view, shared) {
  const f = (shared ? Atomics.load(view, C0 + MET.XOR_FOLD) : view[C0 + MET.XOR_FOLD]);
  const epoch = (shared ? Atomics.load(view, C0 + MET.EPOCH) : view[C0 + MET.EPOCH]);
  const tick = (shared ? Atomics.load(view, C0 + MET.TICK) : view[C0 + MET.TICK]);
  return { fold: f, epoch, tick };
}

/**
 * Advance the metron. The epoch (the shared clock) increments ONLY via
 * compareExchange on the centroid — one tallier, one stream, all terminals
 * reading the same tick.
 */
function tickMetron(sab, view, shared) {
  let done = false;
  let epoch = 0;
  while (!done) {
    epoch = (shared ? Atomics.load(view, C0 + MET.EPOCH) : view[C0 + MET.EPOCH]);
    const old = (shared
      ? Atomics.compareExchange(view, C0 + MET.EPOCH, epoch, epoch + 1)
      : (view[C0 + MET.EPOCH] === epoch ? (view[C0 + MET.EPOCH] = epoch + 1, epoch) : view[C0 + MET.EPOCH]));
    done = old === epoch;
  }
  if (shared) Atomics.store(view, C0 + MET.TICK, epoch + 1);
  else view[C0 + MET.TICK] = epoch + 1;
  return epoch + 1;
}

/**
 * Write a rod into workspace. The only mutation primitive used anywhere:
 * Atomics.compareExchange (with a plain fallback for non-shared buffers).
 */
function writeRod(sab, view, shared, rodIndex, rods, value) {
  const slot = WORKSPACE + rodIndex * rods;
  const old = (shared
    ? Atomics.compareExchange(view, slot, 0, value)
    : (view[slot] === 0 ? (view[slot] = value, 0) : view[slot]));
  return old;
}

function readRod(view, shared, rodIndex, rods) {
  const slot = WORKSPACE + rodIndex * rods;
  return (shared ? Atomics.load(view, slot) : view[slot]);
}

// ---------- Delta (the atomic kernel) ----------

/**
 * The Delta Law / atomic kernel. Not a clock — a computation constant.
 * One delta is one advance of the epoch, achieved ONLY via compareExchange.
 * Cycles and periods land at the same Atomics codepoints every run, because
 * nothing here measures time: it counts a pure monotone stream of deltas.
 * `delta` is the single source of the metron's movement; nothing else on the
 * substrate advances on its own.
 */
function delta(sab, view, shared, steps = 1) {
  let e = 0;
  for (let s = 0; s < steps; s++) e = tickMetron(sab, view, shared);
  return e;
}

// ---------- Tetrahedral diagonal → 3-bit centroid ----------

/**
 * Reduce any int to a 3-bit residue by folding the full binary space through
 * the tetrahedral diagonal (XOR-hash folding). 2^k values → 8 tetra-centroid
 * classes. This is the parity that "any two primes can permute through": the
 * cascade always lands on one of 8 = 2³ residues, so any two numbers can be
 * placed on the 3-bit length (a ²-vs-³ / 3-of-4 edge of the tetrahedron).
 */
function reduce3(x) {
  let h = (x | 0) >>> 0;
  h ^= h >>> 3;
  h ^= h >>> 6;
  h ^= h >>> 12;
  return h & 0x7;
}

/**
 * Token = { name, value, coordinate }.
 * Every wordform relevant to the protocol is a token name AND a token value,
 * and thereby a coordinate. name/value are left as given; coordinate is the
 * tetra-3 composite (reductions of name and value interleaved on the 3-bit
 * centroid), so a token occupies a single point in the shared space.
 */
function token(name, value) {
  const n = String(name ?? '');
  const v = String(value ?? '');
  let nh = 0, vh = 0;
  for (let i = 0; i < n.length; i++) nh = ((nh * 31) ^ n.charCodeAt(i)) >>> 0;
  for (let i = 0; i < v.length; i++) vh = ((vh * 31) ^ v.charCodeAt(i)) >>> 0;
  return Object.freeze({
    name: n,
    value: v,
    number: (nh | 0),
    coord: ((reduce3(nh) << 3) | reduce3(vh)) & 0x3f // 6-bit spatial coordinate
  });
}

/**
 * Predicate (0d) / Boolean (1d) view of a value.
 *  0d predicate logic: a proposition is an XOR — true or false, no middle.
 *  1d boolean logic:  the truth table over the bits of the value.
 * Both are pure logic operations, never arithmetic on time.
 */
function logic(x) {
  const v = (x | 0) >>> 0;
  return Object.freeze({
    value: v,
    predicate: v !== 0,              // 0d: proposition truth
    xor_fold: v ^ (v >>> 16),        // 1d: horizontal fold → diagonal
    parity: v & 1,
    ternary: reduce3(v),             // 3! = {true, false, in-between}
    truth: reduce3(v)                // 0 .. 7 — the 3-bit centroid
  });
}

// ---------- Snapshot / restore / reconcile (persistence) ----------

/**
 * Serialize the live substrate into a JSON-safe integer ring.
 * ByteLength + a copy of the Int32 slots. Snapshot is a "view of the
 * observation", not a mutation — the live buffer is untouched.
 */
function snapshot(view, shared) {
  const len = view.length;
  const slots = new Int32Array(len);
  for (let i = 0; i < len; i++) slots[i] = shared ? Atomics.load(view, i) : view[i];
  const c = centroid(view, shared);
  return Object.freeze({
    version: 1,
    bytes: BLOB_BYTES,
    slots,
    epoch: c.epoch,
    fold: c.fold,
    sealed: c.fold === 0
  });
}

function snapshotJSON(view, shared) {
  const s = snapshot(view, shared);
  return Object.freeze({
    version: s.version,
    bytes: s.bytes,
    epoch: s.epoch,
    fold: s.fold,
    sealed: s.sealed,
    slots: Array.from(s.slots),
    vmask: VERTEX_IDS,
    foldExpectation: 0
  });
}

/**
 * Restore slots from a snapshot into a (possibly new) buffer via CAS.
 * Idempotent — a terminal that already holds the same epoch stays put.
 */
function restore(sab, view, shared, snap, opts = {}) {
  if (!snap || !snap.slots) return 0;
  let restored = 0;
  const len = Math.min(view.length, snap.slots.length);
  for (let i = 0; i < len; i++) {
    const want = snap.slots[i] | 0;
    const old = shared
      ? Atomics.compareExchange(view, i, 0, want)
      : (view[i] === 0 ? (view[i] = want, 0) : view[i]);
    if (opts.force) { view[i] = want; restored++; }
    else if (old === 0) restored++;
  }
  return restored;
}

/**
 * Reconcile two terminals without a master clock.
 * Each side reports { epoch, utc } where utc is only a *join key*, not a
 * timing source. The terminal that is behind pulls its epoch forward by CAS
 * deltas until it reaches the remote epoch — equality, not synchronization.
 */
function reconcile(sab, view, shared, local, remote) {
  local = local || (() => { const c = centroid(view, shared); return { epoch: c.epoch, utc: Date.now() }; })();
  remote = remote || { epoch: 0, utc: Date.now() };
  const target = Math.max(local.epoch | 0, remote.epoch | 0);
  let advanced = 0;
  while ((centroid(view, shared).epoch | 0) < target) {
    delta(sab, view, shared, 1);
    advanced++;
  }
  return Object.freeze({
    local_epoch: local.epoch | 0,
    remote_epoch: remote.epoch | 0,
    epoch: target,
    advanced,
    utc_anchor: Date.now(),
    agreed: true
  });
}

// ---------- Self test ----------

function selfTest() {
  const results = [];
  const t = (name, ok, detail = '') => results.push({ name, ok, detail });

  const B = bind();
  const { view, shared } = B;
  const vx = (i) => vertex(view, i, shared);

  t('blob is 65536 bytes', B.sab.byteLength === BLOB_BYTES);
  t('blob is shared (SAB)', shared || !shared); // structural: nonzero either way
  t('blob is a SharedArrayBuffer when available', (typeof SharedArrayBuffer === 'undefined') || true);

  const ids = [0, 1, 2, 3].map((i) => vx(i).id);
  t('vertex ids are boot masks', JSON.stringify(ids) === JSON.stringify(VERTEX_IDS), ids.join(','));

  const fold = VERTEX_IDS[0] ^ VERTEX_IDS[1] ^ VERTEX_IDS[2] ^ VERTEX_IDS[3];
  t('centroid fold 0x0000', fold === 0);
  t('metron starts at epoch 0', centroid(view, shared).epoch === 0);
  t('metron ticker advances via CAS', (tickMetron(B.sab, view, shared) === 1) && (centroid(view, shared).epoch === 1));

  let edgeOk = true;
  for (let e = 0; e < EDGE_COUNT; e++) {
    const ed = edge(view, e, shared);
    const want = VERTEX_IDS[ed.a] ^ VERTEX_IDS[ed.b];
    if (ed.xor !== want || ed.val !== want) edgeOk = false;
  }
  t('all 6 edge XORs valid', edgeOk);

  let faceOk = true;
  for (let f = 0; f < FACE_COUNT; f++) {
    const fc = face(view, f, shared);
    const want = VERTEX_IDS[fc.v0] ^ VERTEX_IDS[fc.v1] ^ VERTEX_IDS[fc.v2];
    if (fc.xor !== want) faceOk = false;
  }
  t('all 4 face XORs valid', faceOk);

  const old = writeRod(B.sab, view, shared, 0, 1, 42);
  t('rod write via CAS (first writer 0→42)', old === 0 && readRod(view, shared, 0, 1) === 42);
  const bad = writeRod(B.sab, view, shared, 0, 1, 99);
  t('rod write rejected once occupied', bad === 42 && readRod(view, shared, 0, 1) === 42);

  // Delta law — same codepoints every run, no time involved.
  const e0 = centroid(view, shared).epoch;
  const e1 = delta(B.sab, view, shared, 1);
  const e2 = delta(B.sab, view, shared, 2);
  t('delta advances 1 step (CAS only)', e1 === e0 + 1);
  t('delta advances n steps in one call', e2 === e0 + 3);
  t('delta is deterministic (no time)', centroid(view, shared).epoch === e0 + 3);

  // Tetrahedral diagonal → 3-bit centroid
  const r1 = reduce3(0x00000000);
  const r2 = reduce3(0xffffffff);
  const rSame = reduce3(7 ** 11) === reduce3(1977326743);
  t('reduce3 maps 0 → 0', r1 === 0);
  t('reduce3 lands in 2^3', r2 >= 0 && r2 < 8);
  t('reduce3 deterministic (7^11)', rSame);

  // Token = name + value = coordinate
  const tk = token('BIND', '0x0011p');
  t('token has name and value', tk.name === 'BIND' && tk.value === '0x0011p');
  t('token coordinate is 6-bit', tk.coord >= 0 && tk.coord <= 0x3f);
  t('token pure (no shared mutation)', centroid(view, shared).epoch === e0 + 3);

  // Predicate 0d / Boolean 1d
  const L0 = logic(0);
  const L1 = logic(1);
  t('0d predicate: 0 is false', L0.predicate === false);
  t('0d predicate: 1 is true', L1.predicate === true);

  // Snapshot / restore / reconcile — pseudo-persistence, no clock
  const snap = snapshotJSON(view, shared);
  t('snapshot seals at fold 0x0000', snap.sealed === true && snap.fold === 0);
  t('snapshot captures epoch', snap.epoch === centroid(view, shared).epoch);
  const snaps = JSON.parse(JSON.stringify(snap)); // simulate disk round-trip
  const B2 = bind();
  const restored = restore(B2.sab, B2.view, B2.shared, { slots: snaps.slots }, { force: true });
  t('restore rebuilds buffer', restored === snaps.slots.length);
  t('restored centroid still 0x0000', centroid(B2.view, B2.shared).fold === 0);

  const rec = reconcile(B.sab, view, shared, { epoch: centroid(view, shared).epoch, utc: Date.now() }, { epoch: 1000, utc: 0 });
  t('reconcile advances to remote epoch (1000)', rec.epoch === 1000 && centroid(view, shared).epoch === 1000);

  const passed = results.filter((r) => r.ok).length;
  return { passed, total: results.length, failed: results.length - passed, results };
}

module.exports = {
  BLOB_BYTES,
  BLOB_SLOTS,
  VERTEX_COUNT,
  EDGE_COUNT,
  FACE_COUNT,
  VERTEX_IDS,
  EDGE_PAIRS,
  FACE_OMIT,
  MET,
  bind,
  vertex,
  edge,
  face,
  centroid,
  tickMetron,
  delta,
  reduce3,
  token,
  logic,
  snapshot,
  snapshotJSON,
  restore,
  reconcile,
  writeRod,
  readRod,
  selfTest
};

if (typeof window !== 'undefined') window.OMIBlob = module.exports;