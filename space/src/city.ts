// The city: the Agent Commons grown outward, its districts the canon's series (the narrative the gate plays,
// public/narrative/timeline.ndjson), around a ring outside the Commons' floor.
//
// The author, 2026-11-03: "you got the place looking real small and removed all the automatons of the agent commons
// we we the assets to make a full city". So the Commons stays as it is, its automatons with it, and the city is
// around it. A district is a series: its name, its count of nodes, its place. Each is sized by its nodes (a plate of
// radius 2 + 0.9 sqrt(nodes)) and placed in the canon's own order round the ring, given an arc in proportion to its
// size, so no two overlap; north first (hue 0's direction, plane.ts), clockwise.
import { FLOOR } from './plane.ts';

export const CITY_RING = 26;	// the ring the districts' centres stand on
export const GAP = 1.2;		// the least clear ground between two districts' plates
export type Series = { series: string; nodes: number };
export type District = Series & { name: string; order: number; angle: number; radius: number; centre: [number, number]; hue: number };

/** The canon's series in the order the timeline first meets them, each with its count of nodes. */
export function seriesOf(timeline: { series_path: string }[]): Series[] {
  const out: Series[] = [];
  for (const n of timeline) {
    const last = out.find((s) => s.series === n.series_path);
    if (last) last.nodes++;
    else out.push({ series: n.series_path, nodes: 1 });
  }
  return out;
}

const title = (series: string) => series.replace(/^canon-/, '').replace(/\.ndjson$/, '').split('-').map((w) => (w === 'agi' ? 'AGI' : w[0]!.toUpperCase() + w.slice(1))).join(' ');

/** The districts: sized by their nodes, placed round the ring in the canon's order. */
export function districtsOf(series: Series[]): District[] {
  const radii = series.map((s) => 2 + 0.9 * Math.sqrt(s.nodes));
  const total = radii.reduce((a, r) => a + r + GAP / 2, 0);
  let at = 0;
  return series.map((s, i) => {
    const share = ((radii[i]! + GAP / 2) / total) * Math.PI * 2;
    const angle = at + share / 2;
    at += share;
    return { ...s, name: title(s.series), order: i, angle, radius: radii[i]!, centre: [Math.sin(angle) * CITY_RING, -Math.cos(angle) * CITY_RING], hue: Math.round((i * 360) / series.length) };
  });
}

/** How far a district's plate stands from the Commons' floor, and from another's. */
export const clearOfCommons = (d: District) => Math.hypot(...d.centre) - d.radius - FLOOR;
export const clearOf = (a: District, b: District) => Math.hypot(a.centre[0] - b.centre[0], a.centre[1] - b.centre[1]) - a.radius - b.radius;
