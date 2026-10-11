// THE BREADBOARD'S GEOMETRY, AS DATA
//
// The author: "aframe extends from threejs and canvas so we just need the
// geometries". So the shapes are derived once from the circuit descriptions in
// breadboard/kernel.mjs, as plain data with no renderer. three.js
// (space/src/xr.ts), A-Frame (toAframe below) or a 2D canvas draw the same list.
// Coordinates are values, so this whole file is a value door (SPEC-07 I-74).
import { createKernel } from '../../breadboard/kernel.mjs';

export type Vec = [number, number, number];
export type Shape =
  | { kind: 'box'; at: Vec; size: Vec; role: 'board' }
  | { kind: 'cylinder'; at: Vec; radius: number; height: number; role: 'transistor'; id: string; build: string }
  | { kind: 'sphere'; at: Vec; radius: number; role: 'led'; build: string }
  | { kind: 'line'; from: Vec; to: Vec; role: 'wire' };

type Circuit = {
  id: string; depth: number;
  gates: { net: string; depth: number; inputs: string[]; transistors: { id: string }[] }[];
  led: { net: string };
};

/** One row per build: board, transistors by gate depth, wires, and the LED. */
export function breadboardGeometry(circuits: Circuit[] = createKernel().circuits as Circuit[]): Shape[] {
  const shapes: Shape[] = [];
  circuits.forEach((c, row) => {
    const z = row * 1.4;
    shapes.push({ kind: 'box', at: [4.5, -0.05, z], size: [10, 0.08, 1.1], role: 'board' });
    const at = new Map<string, Vec>([['A', [0, 0.2, z - 0.3]], ['B', [0, 0.2, z + 0.3]]]);
    const perDepth = new Map<number, number>();
    for (const g of c.gates) {
      const k = perDepth.get(g.depth) ?? 0;
      perDepth.set(g.depth, k + 1);
      const p: Vec = [g.depth * 1.6, 0.2, z - 0.3 + k * 0.3];
      at.set(g.net, p);
      g.transistors.forEach((t, i) => shapes.push({
        kind: 'cylinder', at: [p[0] - 0.2 + i * 0.16, 0.11, p[2]], radius: 0.07, height: 0.22, role: 'transistor', id: t.id, build: c.id,
      }));
      for (const input of new Set(g.inputs)) shapes.push({ kind: 'line', from: at.get(input)!, to: p, role: 'wire' });
    }
    const led: Vec = [(c.depth + 1) * 1.6, 0.25, z];
    shapes.push({ kind: 'line', from: at.get(c.led.net)!, to: led, role: 'wire' });
    shapes.push({ kind: 'sphere', at: led, radius: 0.18, role: 'led', build: c.id });
  });
  return shapes;
}

const v = (p: Vec) => p.map((n) => +n.toFixed(3)).join(' ');

/** The same shapes as A-Frame entities, for an <a-scene>. */
export function toAframe(shapes: Shape[]): string {
  return shapes.map((s) => {
    switch (s.kind) {
      case 'box': return `<a-box position="${v(s.at)}" width="${s.size[0]}" height="${s.size[1]}" depth="${s.size[2]}" color="#e9e6dc"></a-box>`;
      case 'cylinder': return `<a-cylinder position="${v(s.at)}" radius="${s.radius}" height="${s.height}" color="#2b2d33" data-id="${s.id}"></a-cylinder>`;
      case 'sphere': return `<a-sphere position="${v(s.at)}" radius="${s.radius}" color="#444444" data-build="${s.build}"></a-sphere>`;
      case 'line': return `<a-entity line="start: ${v(s.from)}; end: ${v(s.to)}; color: #8a8f99"></a-entity>`;
    }
  }).join('\n');
}
