// The Coxeter step's frames as a text track and CSS: space/src/step-track.ts read from proofs/svg/e8/step.svg.
//   node scripts/step-track.mjs  ->  public/step/step.vtt, public/step/step.css, public/step/step.svg
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { framesOf, toVTT, toCSS } from '../space/src/step-track.ts';

const svg = readFileSync(new URL('../proofs/svg/e8/step.svg', import.meta.url), 'utf8');
const out = new URL('../public/step/', import.meta.url);
mkdirSync(out, { recursive: true });
const frames = framesOf(svg);
writeFileSync(new URL('step.vtt', out), toVTT(frames));
writeFileSync(new URL('step.css', out), toCSS(frames));
writeFileSync(new URL('step.svg', out), svg);
console.log(`step-track: ${frames.length} frames over ${frames.at(-1).end}s -> step.vtt, step.css (and step.svg, as it is)`);
