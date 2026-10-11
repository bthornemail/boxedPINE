// THE WALKTHROUGH AS A TEXT TRACK
//
// One WebVTT cue per step of the wiki's derivation path
// (wiki/spec/00-canonical/SPEC-08 The Derivation Path.md), each naming the
// note it lives in, how it stands, and the Coq proof in proofs/ that checks
// it, where there is one. The track is derived from the wiki, so regenerate
// it whenever SPEC-08 changes: node rosetta/src/walkthrough.ts
import { readFileSync, writeFileSync } from 'node:fs';

/** Invariants (SPEC-07) that a proof in proofs/coq actually proves. */
export const PROOFS: Record<number, string> = {
  7: 'proofs/coq/02-closure/NullRingCloses.v (xor_self_cancels)',
  10: 'proofs/coq/04-execution/Delta16HasExactPeriodEight.v',
  12: 'proofs/coq/04-execution/Delta16HasExactPeriodEight.v',
};

/** Seconds each cue is shown. DECISION: eight, one per slot of the ruler. */
export const CUE_SECONDS = 8;

const plain = (md: string) => md
  .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/-->/g, '→')
  .trim();

const stamp = (s: number) =>
  `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.000`;

export type Step = { part: number; step: string; note: string; status: string; proofs: string[] };

/** The rows of SPEC-08's path tables: | Part | Step | In the vault | Status |. */
export function steps(spec08: string): Step[] {
  const out: Step[] = [];
  for (const line of spec08.split('\n')) {
    const m = /^\| (\d+) \| (.+?) \| (.+?) \| (.+?) \|$/.exec(line);
    if (!m) continue;
    const status = plain(m[4]!);
    const invariants = [...status.matchAll(/I-(\d+)/g)].map((x) => Number(x[1]));
    const proofs = [...new Set(invariants.filter((i) => PROOFS[i]).map((i) => PROOFS[i]!))];
    out.push({ part: Number(m[1]), step: plain(m[2]!), note: plain(m[3]!), status, proofs });
  }
  return out;
}

export function walkthroughVtt(spec08: string): string {
  const cues = steps(spec08).map((s, i) => [
    `part-${s.part}`,
    `${stamp(i * CUE_SECONDS)} --> ${stamp((i + 1) * CUE_SECONDS)}`,
    `<b>Part ${s.part}</b> ${s.step}`,
    `<i>${s.note === '—' ? 'no note yet' : s.note}</i> · ${s.status === '—' ? 'unmarked' : s.status}`,
    ...(s.proofs.length ? [`proof: ${s.proofs.join('; ')}`] : []),
  ].join('\n'));
  return ['WEBVTT - The walkthrough, derived from SPEC-08 The Derivation Path', '', ...cues.flatMap((c) => [c, ''])].join('\n');
}

const SPEC08 = 'wiki/spec/00-canonical/SPEC-08 The Derivation Path.md';
export const TRACK = 'rosetta/src/assets/walkthrough.vtt';

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(TRACK, walkthroughVtt(readFileSync(SPEC08, 'utf8')));
  console.log(`wrote ${TRACK}`);
}
