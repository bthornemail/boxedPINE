// A TRACE AS A TEXT TRACK, WITH A CACHE LIMIT
//
// Readings are written as WebVTT cues, one per kernel tick: appending a cue is
// propagation, reading the cues back is backpropagation. The track keeps only
// the last CACHE cues, so the text track is the cache and its limit is the
// window (wiki: SPEC-07 I-84). Cue time is the tick, not wall time (I-79).

/** DECISION: sixteen cues, one nibble of ticks. */
export const CACHE = 16;

export type Reading = { tick: number; frame: string; port: number; deviation: number };

const stamp = (s: number) =>
  `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.000`;

/** Propagate: add a reading, dropping the oldest past the cache limit. */
export const propagate = (trace: Reading[], r: Reading, cache = CACHE) => [...trace, r].slice(-cache);

/** The trace as WebVTT: cue id is the tick, the payload is the reading. */
export function traceVtt(trace: Reading[]): string {
  const cues = trace.map((r) => [`tick-${r.tick}`, `${stamp(r.tick)} --> ${stamp(r.tick + 1)}`,
    `frame=${r.frame} port=${r.port} deviation=${r.deviation}`].join('\n'));
  return ['WEBVTT - trace', '', ...cues.flatMap((c) => [c, ''])].join('\n');
}

/** Backpropagate: read the readings back out of the track. */
export function backpropagate(vtt: string): Reading[] {
  return [...vtt.matchAll(/^tick-(\d+)\n.+\nframe=(0x[0-9a-f]+) port=(\d+) deviation=(\d+)$/gm)]
    .map((m) => ({ tick: Number(m[1]), frame: m[2]!, port: Number(m[3]), deviation: Number(m[4]) }));
}
