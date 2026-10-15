// Each project's own SVG tree: 16 SVGs — 14 Fano planes and 2 Hasse diagrams —
// the same set each Light Garden character carries (tree-set.mjs), now for every
// project, stamped with the project's tag. The contribution the author named
// (2026-10-15): "we can make a 14 set Fano plane and 2 Hasse diagrams for every
// project as our contribution." Each set is three things at once:
//   - identity: the Fano planes are the project's incidence structure, drawn;
//   - restore anchor: the 2 Hasse (XOR read, XNOR write) and two Fano planes
//     are enough literals to re-root the project; an intact set traces to zero;
//   - day-one brief: the sign on the gate a newcomer or agent reads at a glance.
//   node scripts/project-trees.mjs  ->  public/projects/<TAG>/
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { buildTreeSet, SET16 } from './tree-set.mjs';

/** The project tags (rosetta TAG: /^[A-Z0-9]{1,8}$/), one set of 16 each. Lower to upper promotes the project to its tag. */
export const PROJECT_TAGS = {
  POLYTRON: 'the declarative metaverse renderer (OpenGL ES, QEMU)',
  METALOG: 'the abstract semantic lattice (meta-log)',
  H2GNN: 'the hyperbolic-geometric neural network',
  CANVAS: 'the canvas document trees (omi-canvas)',
  SETCO: 'the outside-in classification framework',
  AXIOM: 'axiomatic sovereignty, the free-knowledge frame',
  TETRA: 'the tetragrammatron, the fold-based deterministic VM',
  ATOMIC: 'the atomic kernel, the deterministic kernel gate',
  MVKIT: 'metaverse-kit, the protocol law and ABIs',
};

const out = new URL('public/projects/', new URL('..', import.meta.url));
rmSync(out, { recursive: true, force: true });
const manifest = [];
for (const [tag, gloss] of Object.entries(PROJECT_TAGS)) {
  if (!/^[A-Z0-9]{1,8}$/.test(tag)) throw new Error(`${tag} is not a tag`);
  const dir = new URL(`${tag}/`, out);
  mkdirSync(dir, { recursive: true });
  for (const { name, svg } of buildTreeSet(tag)) writeFileSync(new URL(`${name}.svg`, dir), svg);
  manifest.push({ tag, gloss, set: SET16.map((n) => `projects/${tag}/${n}.svg`) });
}
writeFileSync(new URL('trees.json', out), JSON.stringify({ source: 'proofs/svg/fano (the 14 planes) + proofs/svg/hasse/pair-6.svg (XOR read, XNOR write), with each project\'s border (space/src/border.ts)', projects: manifest }, null, 1) + '\n');
console.log(`project-trees: ${manifest.length} projects x 16 (14 Fano planes, Hasse_XOR, Hasse_XNOR) in public/projects`);
