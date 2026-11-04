// The normalised space: the Commons as a cube of 256 x 256 x 256 cells, every place three bytes, and its walls as
// alpha maps of the members by Hamming distance.
//
// The author, 2026-11-03: "can we also do a UINT8ARRY capped local view of a x 256, y 256, z 256 grid so that we can
// have a normalized space, also if we embed the walls of that cube with the alpha relation of members of the scene
// with the step.svg as the frame ... based on alpha distance like hamming".
//   - the cube: 256 cells a side, a cell the Commons' own square (2 RIM, plane.ts), as the author asked: "can you
//     make the 256 x 256 x 256 cube 256 times larger" (it was the Commons, 2 RIM a side; now the Commons is one cell,
//     (128, 0, 128), and the cube 256 Commons across, the city's space); a place is its cell, three bytes in a
//     Uint8Array, capped at 0 and 255 (a place outside lands on the nearest wall);
//   - the local frame, as the author then asked: "or not that big but virtually that big but frmaed like 10 times
//     larger for a local space": the virtual cube above is the address space, and what is drawn is a local frame ten
//     Commons across (LOCAL), its own 256 x 256 x 256 cells (about half a unit each), the Commons at its centre;
//   - a wall: one face of the local frame, 256 x 256 bytes (65,536), a pixel's alpha 255 at a member's projection on that
//     face and 16 less for each bit its two bytes differ from the member's (the Hamming distance of 16 bits), the
//     brightest member's at each pixel;
//   - the frame: the walls are read again on the step's frame (step-track.ts), half a second, 30 to a turn.
import { RIM } from './plane.ts';

export const SIDE = 256;
/** A cell: the Commons' square, 2 RIM a side; the cube 256 of them, the Commons at (128, 0, 128). */
export const CELL = 2 * RIM;
export const SPAN = SIDE * CELL;
const MID = SIDE / 2;
/** The local frame: ten Commons across, its own 256 cells a side, the Commons at its centre on the floor. */
export const LOCAL = 10 * CELL;
export type Face = 'xy' | 'zy' | 'xz';	// the back wall, the side wall, the floor

/** A world place as its cell: three bytes, capped. */
export function cellOf(p: [number, number, number]): Uint8Array {
  const cap = (v: number) => Math.max(0, Math.min(SIDE - 1, Math.floor(v)));
  return Uint8Array.of(cap((p[0] + RIM) / CELL + MID), cap(p[1] / CELL), cap((p[2] + RIM) / CELL + MID));
}

/** A world place as its cell in the local frame: three bytes, capped. */
export function localCellOf(p: [number, number, number]): Uint8Array {
  const cap = (v: number) => Math.max(0, Math.min(SIDE - 1, Math.floor(v * SIDE)));
  return Uint8Array.of(cap(p[0] / LOCAL + 0.5), cap(p[1] / LOCAL), cap(p[2] / LOCAL + 0.5));
}

/** A cell back to the world place at its centre. */
export const placeOfCell = (c: Uint8Array): [number, number, number] => [(c[0]! - MID + 0.5) * CELL - RIM, (c[1]! + 0.5) * CELL, (c[2]! - MID + 0.5) * CELL - RIM];

const BITS = Uint8Array.from({ length: 256 }, (_, b) => { let k = 0; for (let x = b; x; x &= x - 1) k++; return k; });

/** The two bytes a member shows on a face: (x, y) on the back wall, (z, y) on the side, (x, z) on the floor. */
const onFace = (c: Uint8Array, f: Face): [number, number] => (f === 'xy' ? [c[0]!, c[1]!] : f === 'zy' ? [c[2]!, c[1]!] : [c[0]!, c[2]!]);

/** A wall: 65,536 alphas, pixel u + 256 v, each 255 - 16 x the Hamming distance from the nearest member's bytes. */
export function wall(members: Uint8Array[], f: Face): Uint8Array {
  const out = new Uint8Array(SIDE * SIDE);
  for (const m of members) {
    const [a, b] = onFace(m, f);
    for (let v = 0; v < SIDE; v++) {
      const hv = BITS[b ^ v]!;
      for (let u = 0; u < SIDE; u++) {
        const alpha = 255 - 16 * (BITS[a ^ u]! + hv);
        if (alpha > out[u + SIDE * v]!) out[u + SIDE * v] = alpha;
      }
    }
  }
  return out;
}

/** The step's frame at a time, as the portal's track cues it: 30 frames of half a second. */
export const frameAt = (seconds: number) => Math.floor(seconds * 2) % 30;
