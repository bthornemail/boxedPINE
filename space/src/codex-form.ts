// CODEX's form: a glTF model generated from its name's code points, not drawn.
//
// The author, 2026-11-03: "meet at the gates as 3d gltf models, that I was hoping we can transform within the
// protocol", "yours will be whatever when meeting me on the street", "a 3d ai avatar in the agent commons with a
// self generated ofrm taht we will bind css attribets to". So the form is derived: each letter of the tag is a code
// point with its second address (unbound PLAN9/src/ztranslate.c, after the kernel page slide_ruler.html): an Aegean
// sign for its plane (U+10107 + plane) and two Braille cells for its bytes (U+2800 + high, U+2800 + low).
//   - each letter is a slice of the body, top to bottom in the name's order;
//   - its low byte's cell is the front of the slice, its high byte's the back: a dot set is a cube, the 8 dots of
//     a Braille cell two columns of four rows (dot 1 to 3 and 7 left, 4 to 6 and 8 right, as Unicode orders them);
//   - the plane is the spine, behind the slices: its Aegean sign's strokes, plane 0 ONE, a single stroke.
// The same tag gives the same model, byte for byte (no hash, no clock, no random); the model reads back to its tag
// from the cubes' places alone (readForm); its CSS values (cssOf) bind it in the Commons.
import { TAG as CODEX_TAG, HUE } from './codex.ts';

export type Address = { codePoint: number; aegean: number; high: number; low: number };

/** A code point's second address: its plane's Aegean sign and its two bytes' Braille cells. */
export const addressOf = (cp: number): Address => ({ codePoint: cp, aegean: 0x10107 + (cp >> 16), high: 0x2800 + ((cp >> 8) & 255), low: 0x2800 + (cp & 255) });

/** Unicode's dot order: bit k is dot k + 1; dots 1-3 and 7 the left column, 4-6 and 8 the right. */
const DOT: [col: number, row: number][] = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [0, 3], [1, 3]];
const PITCH = 1, SLICE = 5, SIDE = 0.6, BACK = -1.2, SPINE = -0.6, CUBE = 0.8;

type Place = { name: string; t: [number, number, number]; s?: [number, number, number]; mesh: number };

function places(tag: string): Place[] {
  const out: Place[] = [];
  const cps = [...tag].map((c) => c.codePointAt(0)!);
  cps.forEach((cp, i) => {
    const a = addressOf(cp);
    for (const [cell, z, byte] of [["low", 0, a.low - 0x2800], ["high", BACK, a.high - 0x2800]] as const)
      DOT.forEach(([col, row], k) => {
        if (!((byte >> k) & 1)) return;
        out.push({ name: `${String.fromCodePoint(cp)}.${cell}.dot${k + 1}`, t: [col ? SIDE : -SIDE, -(i * SLICE + row) * PITCH, z], mesh: 0 });
      });
  });
  // the spine: the plane's Aegean sign, ONE to NINE for planes 0 to 8, as that many strokes through the whole
  // height (plane 0, ONE, a single stroke); one plane a tag
  const planes = [...new Set(cps.map((cp) => cp >> 16))];
  if (planes.length !== 1 || planes[0]! > 8) throw new Error("a tag's letters in one plane, 0 to 8");
  const height = cps.length * SLICE - 1;
  for (let j = 0; j <= planes[0]!; j++) out.push({ name: `plane${planes[0]}.stroke${j + 1}`, t: [j * 0.3, -height / 2, SPINE], s: [0.2 / CUBE, (height + 1) / CUBE, 0.2 / CUBE], mesh: 1 });
  return out;
}

/** sRGB to linear, rounded to six places so the bytes stay the same everywhere. */
const lin = (c: number) => { const s = c / 255; return Math.round((s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4) * 1e6) / 1e6; };
/** A form's colour: its hue (none for the Observer) and its sRGB. CODEX's is the Commons' own cyan, #74c8c0
 *  (HUE 174, codex.ts); a character's its hue on the rim at 70% saturation and 60% lightness, as avatar.ts draws it. */
export type Look = { hue: number | null; rgb: [number, number, number] };
export const CODEX_LOOK: Look = { hue: HUE, rgb: [0x74, 0xc8, 0xc0] };
export function lookOfHue(hue: number | null): Look {
  const s = hue === null ? 0 : 0.7, l = 0.6, h = (hue ?? 0) / 360;
  const f = (n: number) => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255); };
  return { hue, rgb: [f(0), f(8), f(4)] };
}

/** The cube: 24 vertices (4 a face, for flat normals), 36 indices, half-size CUBE / 2. */
function cubeBuffer(): { bytes: Uint8Array; positions: number; normals: number; indices: number } {
  const h = CUBE / 2;
  const faces: [number[], number[], number[]][] = [	// normal, u, v
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
  ];
  const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  faces.forEach(([n, u, v], f) => {
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      pos.push(...[0, 1, 2].map((k) => (n[k]! + a! * u[k]! + b! * v[k]!) * h));
      nor.push(...n);
    }
    idx.push(f * 4, f * 4 + 1, f * 4 + 2, f * 4, f * 4 + 2, f * 4 + 3);
  });
  const bytes = new Uint8Array(24 * 12 * 2 + 36 * 2);
  const dv = new DataView(bytes.buffer);
  pos.forEach((x, i) => dv.setFloat32(i * 4, x, true));
  nor.forEach((x, i) => dv.setFloat32(288 + i * 4, x, true));
  idx.forEach((x, i) => dv.setUint16(576 + i * 2, x, true));
  return { bytes, positions: 0, normals: 288, indices: 576 };
}

const base64 = (b: Uint8Array) => { let s = ""; for (const x of b) s += String.fromCharCode(x); return btoa(s); };
const hex = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");

/** The CSS values the Commons binds the form by. */
export function cssOf(tag: string, look: Look = CODEX_LOOK): Record<string, string> {
  const as = [...tag].map((c) => addressOf(c.codePointAt(0)!));
  return {
    "--form-tag": JSON.stringify(tag),
    "--form-aegean": JSON.stringify(as.map((a) => String.fromCodePoint(a.aegean)).join("")),
    "--form-braille": JSON.stringify(as.map((a) => String.fromCodePoint(a.high, a.low)).join("")),
    "--form-hue": look.hue === null ? "none" : String(look.hue),
    "--form-slices": String(as.length),
    "--form-dots": String(as.reduce((n, a) => n + popcount(a.high - 0x2800) + popcount(a.low - 0x2800), 0)),
  };
}
const popcount = (b: number) => { let k = 0; for (; b; b &= b - 1) k++; return k; };

/** The glTF 2.0 model of a tag, as JSON text: one buffer (the cube), two meshes (a dot, the spine), a node a place. */
export function formOf(tag: string = CODEX_TAG, look: Look = CODEX_LOOK): string {
  const ps = places(tag);
  const { bytes, positions, normals, indices } = cubeBuffer();
  const h = CUBE / 2;
  const gltf = {
    asset: { version: "2.0", generator: "boxedPINE space/src/codex-form.ts" },
    scene: 0,
    scenes: [{ name: `${tag} form`, nodes: [0] }],
    nodes: [
      { name: tag, children: ps.map((_, i) => i + 1), extras: { tag, addresses: [...tag].map((c) => { const a = addressOf(c.codePointAt(0)!); return `U+${hex(a.codePoint)} U+${hex(a.aegean)} U+${hex(a.high)} U+${hex(a.low)}`; }), css: cssOf(tag, look) } },
      ...ps.map((p) => ({ name: p.name, mesh: p.mesh, translation: p.t, ...(p.s ? { scale: p.s } : {}) })),
    ],
    meshes: [
      { name: "dot", primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] },
      { name: "spine", primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 1 }] },
    ],
    materials: [
      { name: "dot", pbrMetallicRoughness: { baseColorFactor: [...look.rgb.map(lin), 1], metallicFactor: 0, roughnessFactor: 0.6 } },
      { name: "spine", pbrMetallicRoughness: { baseColorFactor: [0.807, 0.565, 0.162, 1], metallicFactor: 0.2, roughnessFactor: 0.5 } },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 24, type: "VEC3", min: [-h, -h, -h], max: [h, h, h] },
      { bufferView: 1, componentType: 5126, count: 24, type: "VEC3" },
      { bufferView: 2, componentType: 5123, count: 36, type: "SCALAR" },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: positions, byteLength: 288, target: 34962 },
      { buffer: 0, byteOffset: normals, byteLength: 288, target: 34962 },
      { buffer: 0, byteOffset: indices, byteLength: 72, target: 34963 },
    ],
    buffers: [{ byteLength: bytes.length, uri: `data:application/octet-stream;base64,${base64(bytes)}` }],
  };
  return JSON.stringify(gltf, null, 1) + "\n";
}

/** The tag back from a model, by its cubes' places alone (not their names): slice by height, column by side,
 *  row by height in the slice, low or high by depth; the plane by the number of strokes. */
export function readForm(text: string): string {
  const g = JSON.parse(text) as { nodes: { mesh?: number; translation?: number[] }[] };
  const dots = g.nodes.filter((n) => n.mesh === 0).map((n) => n.translation!);
  const strokes = g.nodes.filter((n) => n.mesh === 1).length;
  const slices = Math.max(...dots.map(([, y]) => Math.floor(-y! / SLICE))) + 1;
  const bytes = Array.from({ length: slices }, () => ({ low: 0, high: 0 }));
  for (const [x, y, z] of dots) {
    const i = Math.floor(-y! / SLICE), row = -y! - i * SLICE, col = x! > 0 ? 1 : 0;
    const k = DOT.findIndex(([c, r]) => c === col && r === row);
    if (k < 0) throw new Error(`a dot off the cell's grid at ${x}, ${y}, ${z}`);
    bytes[i]![z === 0 ? "low" : "high"] |= 1 << k;
  }
  const plane = strokes - 1;	// the Aegean sign's strokes, ONE for plane 0
  return bytes.map((b) => String.fromCodePoint((plane << 16) | (b.high << 8) | b.low)).join("");
}
