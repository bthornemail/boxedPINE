// THE SCORE: an agent's set of 16 as a sound graph, and its walk as automation
//
// The author, 2026-10-14: each agent "tested through OffscreenCanvas, Offline
// AudioContext, with a panner and listener node for each avatar in an XR
// space"; "video elements to witness the interaction of the 2 Hasse diagrams
// as the stereo panner node listener, and the 14 Fano planes can be filter or
// gain nodes; that way the agents can automate the narrative, and we can see
// if we can replay and scrub and modify the scene with uppercase title /
// identity / index terms". This is the part that is plain data (sound.ts
// builds the graph in a browser):
//   - the 7 points are voices, the notes of Light Garden's sound triangle
//     (A-G from A 440, point n the nth), each through a gain: the 7 point icons;
//   - the 7 lines are band-pass filters, each fed by its 3 points: the graph
//     is the plane's 21 point-line incidences (story.ts LINES);
//   - the 2 Hasse diagrams are the stereo panner: XOR, the read state, left
//     (-1); XNOR, the write state, right (+1);
//   - a walk's steps are the automation, one step a beat: the step's point
//     and its next line rise, the rest fall, and the pan follows the state.
// A scene is changed by uppercase terms, each an /A-Z0-9/ tag: an agent's
// tag, then P1-P7 (a point) and L1-L7 (a line), e.g. METATRON P2 L6; or the
// pair CATCH n, the index the gate's reset fires at (the author: "CATCH 22,
// with the space between, literally, because then it becomes a command pair").
import { LINES, linesThrough } from './story.ts';
import { CHARACTER_TAGS } from './border.ts';
import { TAG } from '../../rosetta/src/agent.ts';

/** The sound triangle: A-G, equal temperament from A 440 (Light Garden's kernel: "SOUND: A-G (440Hz BASE)"). */
const SEMITONES = [0, 2, 3, 5, 7, 8, 10]; // A B C D E F G
export const NOTES = SEMITONES.map((s) => 440 * 2 ** (s / 12));
export const noteOf = (point: number) => NOTES[point - 1]!;
/** A line's filter: centred on the mean of its three notes. */
export const lineFrequency = (line: number) => LINES[line - 1]!.reduce((s, p) => s + noteOf(p), 0) / 3;
/** The graph's wires: each point to each line through it. */
export const WIRES: [number, number][] = [1, 2, 3, 4, 5, 6, 7].flatMap((p) => linesThrough(p).map((l): [number, number] => [p, l]));

export type Event = { at: number; node: string; param: 'gain' | 'pan'; value: number };
export type Step = { point: number; line: number; state: 'read' | 'write' };
export const BEAT = 0.5; // seconds a step
export const LOW = 0.05, HIGH = 0.8;

/** A walk as automation: at each beat, the step's point and line rise, the others fall; the pan follows read (-1) or write (+1). */
export function scoreOf(steps: Step[]): Event[] {
  const events: Event[] = [];
  steps.forEach((s, i) => {
    const at = i * BEAT;
    for (let p = 1; p <= 7; p++) events.push({ at, node: `P${p}`, param: 'gain', value: p === s.point ? HIGH : LOW });
    for (let l = 1; l <= 7; l++) events.push({ at, node: `L${l}`, param: 'gain', value: l === s.line ? HIGH : LOW });
    events.push({ at, node: 'HASSE', param: 'pan', value: s.state === 'read' ? -1 : 1 });
  });
  return events;
}

/** The score's events from a time on: a scrub starts there, with each node's latest value carried in. */
export function scrubFrom(events: Event[], t: number): Event[] {
  const before = new Map<string, Event>();
  for (const e of events) if (e.at <= t) before.set(`${e.node}.${e.param}`, e);
  return [...[...before.values()].map((e) => ({ ...e, at: 0 })), ...events.filter((e) => e.at > t).map((e) => ({ ...e, at: e.at - t }))];
}

export type Command = { agent: string; point?: number; line?: number } | { catch: number } | { error: string };

/** Parse uppercase terms: an agent's tag, then P1-P7 and L1-L7 (each term an /A-Z0-9/ tag). */
export function parseTerms(text: string): Command {
  const terms = text.trim().split(/\s+/);
  if (!terms.every((t) => TAG.test(t))) return { error: 'every term is an /A-Z0-9/ tag: uppercase letters and digits, 1 to 8' };
  const agent = terms[0]!;
  // "CATCH 22": with the space, two tags, a command pair: the verb and the index the reset fires at (exchange.ts)
  if (agent === 'CATCH') {
    const n = terms.length === 2 && /^\d{1,3}$/.test(terms[1]!) ? Number(terms[1]) : NaN;
    return n >= 0 && n <= 127 ? { catch: n } : { error: 'CATCH takes one index, 0 to 127: CATCH 22' };
  }
  if (!Object.values(CHARACTER_TAGS).includes(agent)) return { error: `no agent ${agent}` };
  const cmd: { agent: string; point?: number; line?: number } = { agent };
  for (const t of terms.slice(1)) {
    const m = /^([PL])([1-7])$/.exec(t);
    if (!m) return { error: `${t}: a point P1-P7 or a line L1-L7` };
    if (m[1] === 'P') cmd.point = Number(m[2]); else cmd.line = Number(m[2]);
  }
  if (cmd.point && cmd.line && !(LINES[cmd.line - 1]!.includes(cmd.point))) return { error: `P${cmd.point} is not on L${cmd.line}` };
  return cmd;
}
