// THE BLOCK AND ITS CLOSURE LAW
//
// rev1 Part II: a tetrahedron. Vertices 0x, 0b, 0o, 0d (numbered 0..3), six
// edges, four faces, the centroid 0p 0i 0n. The state is a 6-bit word b in
// edge order (e01, e02, e03, e12, e13, e23), written left to right, so e01 is
// the high bit. Two readings of the same b:
//   vertex reading ∂V: for each vertex, the parity of its selected edges
//   face reading   ∂F: for each face, the parity of its selected edges
// The block is closed when the reading is 0000.
//
// Verified 2026-10-08 by enumerating all 64 states (wiki: SPEC-67 The Block
// and Its Closure): 8 are vertex-closed (zero, the 4 faces, the 3
// four-cycles), 8 are face-closed (zero, the 3 four-cycles, the 4
// vertex-stars), and 4 are closed both ways (zero and the 3 four-cycles).

/** The six edges as vertex pairs, in edge order. */
export const EDGES = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] as const;

/** The four face words of rev1 §2.4: face i is the face opposite vertex i. */
export const FACES = [0b000111, 0b011001, 0b101010, 0b110100] as const;

const edgeBit = (b: number, i: number) => (b >> (5 - i)) & 1;

/** ∂V: one parity bit per vertex, vertex 0 first. */
export function vertexReading(b: number): number[] {
  return [0, 1, 2, 3].map((v) =>
    EDGES.reduce((parity, [x, y], i) => parity ^ (x === v || y === v ? edgeBit(b, i) : 0), 0));
}

/** ∂F: one parity bit per face, face 0 first. */
export function faceReading(b: number): number[] {
  return FACES.map((f) => {
    let common = b & f, parity = 0;
    while (common) { parity ^= common & 1; common >>= 1; }
    return parity;
  });
}

/** The closure law: the reading is 0000. */
export const vertexClosed = (b: number) => vertexReading(b).every((p) => p === 0);
export const faceClosed = (b: number) => faceReading(b).every((p) => p === 0);
