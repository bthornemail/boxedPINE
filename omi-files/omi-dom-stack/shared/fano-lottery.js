/**
 * OMI-IMO Fano-plane lottery — media-channel allocator
 *
 * The browser media-type registry IS an XOR channel bank:
 *   - "User agents must recognize these media types" ⇒ every UA is a receiver
 *     the XOR can transit through at least one recognized channel.
 *   - the deprecated types (tty, tv, projection, handheld, braille, embossed,
 *     aural, speech) "must make them match nothing" ⇒ deliberately empty
 *     buffers — the 0-attractor. They still resolve (recognized), they just
 *     resolve to zero: a received FALSE is still a received bit.
 *   - screen/print/all are the live wires.
 *
 * Geometry: the Fano plane = the 8 three-bit residues (tetrahedral diagonal)
 * minus the zero point. 7 points, 7 lines, every line XORs to 000 — the same
 * Steiner-triple law as the cone lattice. reduce3() and the plane share the
 * same 3-bit centroid.
 *
 * Lottery: "make the declaration and if it's possible to define what I
 * request it will resolve in at most 14 cycles based on the Fano plane
 * lottery, or it's simply not allocatable." 14 = 2 full rounds × 7 lines.
 * After round 2 every point has been visited, so the answer is bounded, and
 * a live-but-requested point is always found quickly.
 */
'use strict';

// ---------- The plane ----------

// 7 nonzero 3-bit points (as decimal-labelled vectors)
const POINT_BIT = {
  1: 0b001,
  2: 0b010,
  3: 0b011,
  4: 0b100,
  5: 0b101,
  6: 0b110,
  7: 0b111
};

// 7 lines — every line's vectors XOR to 0b000 (Steiner triples)
const FANO_LINES = [
  [1, 2, 3], // 001^010^011 = 000
  [1, 4, 5], // 001^100^101 = 000
  [1, 6, 7], // 001^110^111 = 000
  [2, 4, 6], // 010^100^110 = 000
  [2, 5, 7], // 010^101^111 = 000
  [3, 4, 7], // 011^100^111 = 000
  [3, 5, 6]  // 011^101^110 = 000
];

// ---------- Media-type channel bank (from the CSS Media Queries spec) ----------

// point → media type. All are "recognized by user agents".
const POINT_CHANNELS = Object.freeze({
  0: { media: 'all', live: true, note: 'matches all devices' },
  1: { media: 'screen', live: true, note: 'non-print devices' },
  2: { media: 'print', live: true, note: 'printers + print preview' },
  3: { media: 'tv', live: false, note: 'must recognize, must match nothing' },
  4: { media: 'tty', live: false, note: 'must recognize, must match nothing' },
  5: { media: 'projection', live: false, note: 'must recognize, must match nothing' },
  6: { media: 'handheld', live: false, note: 'must recognize, must match nothing' },
  7: { media: 'braille', live: false, note: 'must recognize, must match nothing' }
});

// the three extra recognized-only voids (beyond the 7 points)
const VOID_CHANNELS = Object.freeze([
  { media: 'embossed', note: 'must recognize, must match nothing' },
  { media: 'aural', note: 'must recognize, must match nothing' },
  { media: 'speech', note: 'must recognize, must match nothing' }
]);

// ---------- reduce3: shared tetrahedral diagonal → 3-bit centroid ----------

function reduce3(x) {
  let h = (x | 0) >>> 0;
  h ^= h >>> 3;
  h ^= h >>> 6;
  h ^= h >>> 12;
  return h & 0x7;
}

// ---------- Lottery ----------

function want(name, text) {
  // declaration → a 3-bit desire via the XOR fold of its name^text tokens
  const fold = (s) => {
    let h = 0;
    for (let i = 0; i < String(s).length; i++) h = (h * 31 ^ String(s).charCodeAt(i)) >>> 0;
    return h;
  };
  return reduce3(fold(name) ^ fold(text));
}

/**
 * Allocate a media channel to a declaration.
 *
 * @param {object} opts { name, text, day, liveCount }
 *   day      — epoch >>> 4 (for rotation and live growth)
 *   liveCount— how many points are wired today (2 to start: "through 2 today")
 * @returns {{allocatable, cycles, point, media, line, live, note}}
 *   resolves in ≤ 14 cycles, or is simply not allocatable.
 */
function allocate(opts = {}) {
  const name = opts.name != null ? opts.name : 'fact';
  const text = opts.text != null ? opts.text : 'xor';
  const day = (opts.day || 0) | 0;
  const liveCount = Math.max(1, Math.min(7, (opts.liveCount != null ? opts.liveCount : 2) | 0));

  const desire = want(name, text);
  const livePoints = [];
  // live growth: the first `liveCount` points (1→screen, 2→print, +1/day)
  for (let p = 1; p <= liveCount; p++) livePoints.push(p);

  let found = null;
  let cycles = 0;

  // the zero point is the centroid 'all' — matches every device, resolves at once
  if (desire === 0) {
    return Object.freeze({
      allocatable: true,
      cycles: 1,
      point: 0,
      media: POINT_CHANNELS[0].media,
      line: 0,
      live: true,
      note: POINT_CHANNELS[0].note,
      desire
    });
  }

  // two full rounds of the plane — at most 14 cycles, always bounded
  for (let r = 0; r < 2 && !found; r++) {
    for (let li = 0; li < FANO_LINES.length && !found; li++) {
      const line = FANO_LINES[(li + day) % FANO_LINES.length];
      const point = line[(r + day) % 3];
      cycles++;
      const channel = POINT_CHANNELS[point];
      if (!channel.live || point === 0) {
        continue; // void channel — recognized but matches nothing: never resolves
      }
      // a live wire resolves the declaration when it agrees with the desire
      if (point === desire && livePoints.indexOf(point) !== -1) {
        found = { point, media: channel.media, line: (li + day) % 7 + 1 };
        break;
      }
    }
  }

  if (found) {
    const ch = POINT_CHANNELS[found.point];
    return Object.freeze({
      allocatable: true,
      cycles,
      point: found.point,
      media: ch.media,
      line: found.line,
      live: ch.live,
      note: ch.note,
      desire
    });
  }

  // exhaustively visited in ≤14: the request cannot be defined on today's wires
  return Object.freeze({
    allocatable: false,
    cycles,
    point: desire,
    media: null,
    line: null,
    live: false,
    note: 'not allocatable — request not expressible on today\'s wired channels',
    desire
  });
}

// ---------- Self test ----------

function selfTest() {
  const results = [];
  const t = (name, ok, detail = '') => results.push({ name, ok, detail });

  // Klein four-group closure
  t('7 lines each XOR to 000', FANO_LINES.every((l) =>
    (POINT_BIT[l[0]] ^ POINT_BIT[l[1]] ^ POINT_BIT[l[2]]) === 0));
  t('every point on exactly 3 lines', [1, 2, 3, 4, 5, 6, 7].every((p) =>
    FANO_LINES.filter((l) => l.indexOf(p) !== -1).length === 3));
  t('11 media types recognized', Object.keys(POINT_CHANNELS).length + VOID_CHANNELS.length === 11);

  // lottery bounds: any declaration → ≤ 14 cycles, allocatable or not
  let a = 0, n = 0, max = 0;
  for (let i = 0; i < 200; i++) {
    const r = allocate({ name: 'decl.' + i, text: 'xor' + i, day: i, liveCount: i % 8 });
    if (r.cycles > max) max = r.cycles;
    if (r.allocatable) a++;
    else n++;
  }
  t('lottery always bounded at 14 cycles', max <= 14, 'max=' + max);

  // deterministic: same declaration + same day → same wire
  const r1 = allocate({ name: 'bind', text: '0x2a', day: 3, liveCount: 2 });
  const r2 = allocate({ name: 'bind', text: '0x2a', day: 3, liveCount: 2 });
  t('allocation is deterministic', r1.point === r2.point && r1.cycles === r2.cycles);

  // today: 2 wires (screen/print) — a request folded onto an unwired point
  // (3..7) cannot resolve; find one deterministically.
  {
    let unwiredDecl = null;
    for (let i = 0; i < 64 && !unwiredDecl; i++) {
      const nm = 'decl.' + i;
      const d = want(nm, 'x');
      if (d >= 3 && d <= 7) unwiredDecl = { name: nm, desire: d };
    }
    if (unwiredDecl) {
      const r3 = allocate({ name: unwiredDecl.name, text: 'x', day: 0, liveCount: 2 });
      t('declaration for unwired point → not allocatable',
        r3.allocatable === false && r3.point === unwiredDecl.desire && r3.cycles <= 14);
    } else {
      t('declaration for unwired point → not allocatable', true, 'all folds land wired');
    }
  }

  // the declaration's desire decides: wired desire → allocatable, not → not
  {
    const d1 = want('bind', '0x1');
    const r4 = allocate({ name: 'bind', text: '0x1', day: 0, liveCount: 2 });
    t('wire agrees with desire', r4.point === d1 && r4.allocatable === (d1 === 0 || (d1 >= 1 && d1 <= 2)) && r4.cycles <= 14);

    const d2 = want('bind', '0x4');
    const r5 = allocate({ name: 'bind', text: '0x4', day: 3, liveCount: 4 });
    t('wired point is allocatable after growth', r5.point === d2 && r5.allocatable === (d2 === 0 || d2 <= 4));
  }

  // reduce3 ↔ plane share the centroid
  t('reduce3 lands in 0..7', [0, 1, 7, 1977326743, 0xffffffff].every((x) => reduce3(x) >= 0 && reduce3(x) < 8));

  const passed = results.filter((r) => r.ok).length;
  return { passed, total: results.length, failed: results.length - passed, results };
}

module.exports = {
  POINT_BIT,
  FANO_LINES,
  POINT_CHANNELS,
  VOID_CHANNELS,
  reduce3,
  want,
  allocate,
  selfTest
};

if (typeof window !== 'undefined') window.OMIFano = module.exports;