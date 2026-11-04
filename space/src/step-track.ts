// The Coxeter step as an instantiation portal: proofs/svg/e8/step.svg's own animation frames, read from its
// animateTransform, written as a WebVTT text track and a CSS animation, so that anything in the Commons can be
// cued by its frames through the portal (attachTrack).
//
// The author, 2026-11-03, of step.svg: "a base unit of perception that can be extended. an this has an animation
// frame built in for relation to any animated framing", "itrs like the {c+r,c-r} in a visual form, amd cam ne
// aufumenyed and ectended with tect tracks cues and proto cues of css", and "yes if noting elese an instantiantiation
// portal". The frames are not restated: each cue's times are the SVG's keyTimes times its dur, its angle the SVG's
// rotation, and frame k + 15 the root at the other end of its diameter (c^15 = -1, e8.mjs): {c + r, c - r}.

export type Frame = { k: number; start: number; end: number; angle: number; half: 'c+r' | 'c-r' };

/** The frames of the SVG's first animateTransform: its discrete values, keyTimes and dur. */
export function framesOf(svg: string): Frame[] {
  const a = /<animateTransform\b[^>]*>/.exec(svg)?.[0];
  if (!a) throw new Error('no animateTransform');
  const attr = (n: string) => new RegExp(`\\b${n}="([^"]*)"`).exec(a)?.[1] ?? '';
  if (attr('calcMode') !== 'discrete' || attr('type') !== 'rotate') throw new Error('a discrete rotation is read here');
  const dur = Number(/^([\d.]+)s$/.exec(attr('dur'))?.[1]);
  const times = attr('keyTimes').split(';').map(Number);
  const angles = attr('values').split(';').map((v) => Number(v.trim().split(/\s+/)[0]));
  if (times.length !== angles.length || !(dur > 0)) throw new Error('keyTimes and values do not pair');
  const n = times.length - 1;	// the last value closes the turn (-360, the same as 0)
  return Array.from({ length: n }, (_, k) => ({
    k, start: round(times[k]! * dur), end: round(times[k + 1]! * dur), angle: angles[k]!, half: k < n / 2 ? 'c+r' : 'c-r',
  }));
}
const round = (x: number) => Math.round(x * 1000) / 1000;

const stamp = (s: number) => {
  const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
};

/** The frames as a WebVTT track: a cue a frame, its id step-k, its text the frame, its turn, and its half. */
export function toVTT(frames: Frame[]): string {
  const cues = frames.map((f) => `step-${f.k}\n${stamp(f.start)} --> ${stamp(f.end)}\nframe ${f.k} · ${f.angle}° · c^${f.k} · ${f.half}`);
  return ['WEBVTT - the Coxeter step, proofs/svg/e8/step.svg: a turn of 12 degrees a frame', ...cues].join('\n\n') + '\n';
}

/** The frames as CSS: a property a frame (--step-frame, --step-angle) and an animation of as many discrete steps over
 *  the same duration, for anything to be framed by. */
export function toCSS(frames: Frame[]): string {
  const dur = frames.at(-1)!.end;
  const keys = frames.map((f) => `  ${round((f.start / dur) * 100)}% { --step-frame: ${f.k}; --step-angle: ${f.angle}deg; }`);
  return [
    `/* the Coxeter step's frames (proofs/svg/e8/step.svg): ${frames.length} discrete frames over ${dur}s */`,
    '@property --step-frame { syntax: "<integer>"; inherits: true; initial-value: 0; }',
    '@property --step-angle { syntax: "<angle>"; inherits: true; initial-value: 0deg; }',
    '@keyframes coxeter-step {', ...keys, '}',
    `.coxeter-step { animation: coxeter-step ${dur}s steps(1, end) infinite; }`,
    '',
  ].join('\n');
}
