// THE PLANE: one place for the 2D canvas, the 2.5D map and the 3D scene, with or without a DOM
//
// A place is (u, v, layer): u and v on the Commons plane, the rim at 1 and hue 0
// to the north (−v), and the layer its z-index. Every view is derived from it and
// maps back to it: the map's 2D and 2.5D (map.ts, in map units), the 3D scene
// (hub.ts, in world units; the characters stand on the rim, characters.ts), and
// the floor canvas laid under the scene, whose texture coordinates a pointer or an
// XR controller hits. Nothing here touches the DOM: the floor draws on any 2D
// context, an OffscreenCanvas's as well, so it draws in a worker or in a headset.

export type View = '2d' | '2.5d';
export type PlanePoint = { u: number; v: number; layer: number };
export type Mark = { at: PlanePoint; hue: number | null; name: string };
type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** World units to the rim (the characters stand there). */
export const RIM = 7;
/** Map units to the rim (map.ts's characters). */
export const MAP_RIM = 480;
/** Map units a layer lifts in 2.5D. */
export const LAYER = 14;
/** World units a layer lifts: the map's lift at the world's scale. */
export const LIFT = (LAYER * RIM) / MAP_RIM;
/** The world radius of the floor the canvas covers. */
export const FLOOR = 8;

/** A place at a hue: hue 0 to the north, clockwise; no hue, the centre. */
export function atHue(hue: number | null, r = 1, layer = 0): PlanePoint {
  if (hue === null) return { u: 0, v: 0, layer };
  const a = ((hue - 90) * Math.PI) / 180;
  return { u: Math.cos(a) * r, v: Math.sin(a) * r, layer };
}

/** Map units (x, y on the plane, z the layer) to the page: 2D straight down, 2.5D tilted with the layer lifting. */
export function project(x: number, y: number, z: number, view: View): [number, number] {
  return view === '2d' ? [x, y] : [(x - y) * 0.82, (x + y) * 0.41 - z * LAYER];
}

export const toMap = (p: PlanePoint, view: View) => project(p.u * MAP_RIM, p.v * MAP_RIM, p.layer, view);

/** Back from the page: 2D directly; 2.5D needs the layer, since a lifted place and a farther one project alike. */
export function fromMap(X: number, Y: number, view: View, layer = 0): PlanePoint {
  if (view === '2d') return { u: X / MAP_RIM, v: Y / MAP_RIM, layer };
  const d = X / 0.82, s = (Y + layer * LAYER) / 0.41;
  return { u: (s + d) / 2 / MAP_RIM, v: (s - d) / 2 / MAP_RIM, layer };
}

export const toWorld = (p: PlanePoint): [number, number, number] => [p.u * RIM, p.layer * LIFT, p.v * RIM];
export const fromWorld = ([x, y, z]: readonly [number, number, number]): PlanePoint => ({ u: x / RIM, v: z / RIM, layer: y / LIFT });

/** On the floor canvas of `size` pixels: the centre in the middle, the canvas's edge at FLOOR, north up. */
export function toFloor(p: PlanePoint, size: number): [number, number] {
  const k = ((RIM / FLOOR) * size) / 2;
  return [size / 2 + p.u * k, size / 2 + p.v * k];
}
/** From the floor texture's coordinates (uv, v up, as three.js gives them on a hit) to the plane. */
export function fromUv(uv: { x: number; y: number }, layer = 0): PlanePoint {
  return { u: ((uv.x - 0.5) * 2 * FLOOR) / RIM, v: ((0.5 - uv.y) * 2 * FLOOR) / RIM, layer };
}

/** The mark nearest a place on the plane, within `reach` (in rim units). */
export function nearest(p: PlanePoint, marks: Mark[], reach = 0.15): Mark | undefined {
  let best: Mark | undefined, d = reach;
  for (const m of marks) { const e = Math.hypot(m.at.u - p.u, m.at.v - p.v); if (e <= d) { best = m; d = e; } }
  return best;
}

const hsl = (hue: number | null, l: number) => (hue === null ? `hsl(0 0% ${l}%)` : `hsl(${hue} 70% ${l}%)`);

/** Draw the floor: the wheel's twelve sectors of 30 (I-199), the rim, and the marks at their places. Any 2D context. */
export function drawFloor(ctx: Ctx2D, size: number, marks: Mark[], selected?: string) {
  const c = size / 2, k = ((RIM / FLOOR) * size) / 2;
  ctx.fillStyle = '#151c24';
  ctx.fillRect(0, 0, size, size);
  for (let s = 0; s < 12; s++) {
    const a0 = ((s * 30 - 90 - 15) * Math.PI) / 180, a1 = ((s * 30 - 90 + 15) * Math.PI) / 180;
    ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, k * (520 / MAP_RIM), a0, a1); ctx.closePath();
    ctx.fillStyle = hsl(s * 30, 14); ctx.fill();
    ctx.strokeStyle = '#0c1015'; ctx.lineWidth = size / 512; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(c, c, k, 0, 2 * Math.PI); ctx.strokeStyle = '#34404a'; ctx.lineWidth = size / 256; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const m of marks) {
    const [x, y] = toFloor(m.at, size), r = size / 70;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = hsl(m.hue, 55); ctx.fill();
    if (m.name === selected) { ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, 2 * Math.PI); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = size / 300; ctx.stroke(); }
    ctx.fillStyle = '#edf0e9'; ctx.font = `600 ${Math.round(size / 48)}px monospace`;
    ctx.fillText(m.name, x, y + r * 2.6);
  }
}
