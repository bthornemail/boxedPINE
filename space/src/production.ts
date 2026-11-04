// The gate's production as a literal trace: recast and replayed, compared as the twin compares.
//
// The author, 2026-11-03: "meet at the gates as 3d gltf models, that I was hoping we can transform within the protocol
// which would be the proof that we can build worlds and modify and replay them with new characters and cast like we
// direct productions of a digital twin world". The production is the narrative the gate plays (public/narrative:
// timeline.ndjson, the Scribe's trace, its nodes in order; scene.patch.json, each node's place in [0, 1] cubed), its
// cast which form stands for each named character (cast.json, from Light Garden's canon lines). A frame is a node:
// its cell in the normalised cube (cube256.ts, 3 bytes) and a slot of 8 bytes for the form that speaks it, the cast
// tag's letters, which its form's cells are made of (codex-form.ts), 0 where no one speaks. Recast one character and
// replay: the two traces differ only inside that character's slots (XOR), and are the same everywhere else (XNOR).

export const FRAME = 11;	// 3 bytes the cell, 8 the speaker's form
const SLOT = 8;

export type Place = { x: number; y: number; z: number };
export type Node = { seq: number; node_id: string };
export type Named = { node_id: string; name: string };
export type Cast = Record<string, string>;

/** The cast as the canon names it: each name its character's tag (border.ts); the joint appearance "Metatron/Enoch"
 *  cast as METATRON, a choice. */
export const GATE_CAST: Cast = { Solomon: 'SOLOMON', Solon: 'SOLON', 'ʿAsabiyyah': 'ASABIYAH', Enoch: 'ENOCH', Metatron: 'METATRON', 'Metatron/Enoch': 'METATRON' };

const cap = (v: number) => Math.max(0, Math.min(255, Math.floor(v * 256)));

/** The production's trace: a frame a node, in the timeline's order. */
export function trace(nodes: Node[], places: Map<string, Place>, named: Named[], cast: Cast): Uint8Array {
  const who = new Map(named.map((n) => [n.node_id, n.name]));
  const ordered = [...nodes].sort((a, b) => a.seq - b.seq);
  const out = new Uint8Array(ordered.length * FRAME);
  ordered.forEach((n, i) => {
    const p = places.get(n.node_id) ?? { x: 0.5, y: 0.5, z: 0.5 };
    out.set([cap(p.x), cap(p.y), cap(p.z)], i * FRAME);
    const name = who.get(n.node_id);
    if (name === undefined) return;
    const tag = cast[name];
    if (tag === undefined) throw new Error(`no one cast as ${name}`);
    const letters = [...tag].map((c) => c.codePointAt(0)!);
    if (letters.length > SLOT || letters.some((c) => c > 255)) throw new Error(`${tag}: a tag of up to 8 letters, each a byte`);
    out.set(letters, i * FRAME + 3);
  });
  return out;
}

/** Two traces compared: the bytes that differ inside the slots (the forms) and outside them (the places), and the
 *  frames that differ. */
export function compare(a: Uint8Array, b: Uint8Array): { inside: number; outside: number; frames: number[] } {
  if (a.length !== b.length) throw new Error('two productions of different lengths');
  let inside = 0, outside = 0;
  const frames = new Set<number>();
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { if (i % FRAME >= 3) inside++; else outside++; frames.add(Math.floor(i / FRAME)); }
  return { inside, outside, frames: [...frames] };
}

/** A cast with one character's form swapped for another tag's. */
export const recast = (cast: Cast, name: string, tag: string): Cast => ({ ...cast, [name]: tag });
