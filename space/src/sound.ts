// THE SOUND: an agent's set of 16 as an audio graph (score.ts is the plan)
//
// In any BaseAudioContext, offline for testing and replay, live for the XR
// space: 7 oscillators at the points' notes, each through its gain (the 7
// point icons) into the 3 line filters through it (the 7 line icons, band-pass,
// each followed by its gain), all into one stereo panner (the 2 Hasse
// diagrams: XOR read left, XNOR write right), into the avatar's panner node at
// its place in the space, heard by the context's listener. The score's events
// are set on the parameters at their times, so a render is fixed by the walk:
// the same walk, the same samples, and a rendered buffer can be replayed and
// scrubbed exactly.
import { WIRES, noteOf, lineFrequency, LOW, type Event } from './score.ts';

export type AgentGraph = { output: AudioNode; params: Map<string, AudioParam>; sources: OscillatorNode[] };

/** Build one avatar's graph in ctx, at a place in the space; connect it to dest. */
export function buildAgent(ctx: BaseAudioContext, at: [number, number, number], dest: AudioNode = ctx.destination): AgentGraph {
  const params = new Map<string, AudioParam>();
  const hasse = new StereoPannerNode(ctx, { pan: -1 });
  params.set('HASSE.pan', hasse.pan);
  const place = new PannerNode(ctx, { panningModel: 'equalpower', distanceModel: 'inverse', positionX: at[0], positionY: at[1], positionZ: at[2] });
  hasse.connect(place).connect(dest);
  const lines = [1, 2, 3, 4, 5, 6, 7].map((l) => {
    const filter = new BiquadFilterNode(ctx, { type: 'bandpass', frequency: lineFrequency(l), Q: 1 });
    const gain = new GainNode(ctx, { gain: LOW });
    params.set(`L${l}.gain`, gain.gain);
    filter.connect(gain).connect(hasse);
    return filter;
  });
  const sources = [1, 2, 3, 4, 5, 6, 7].map((p) => {
    const osc = new OscillatorNode(ctx, { type: 'sine', frequency: noteOf(p) });
    const gain = new GainNode(ctx, { gain: LOW });
    params.set(`P${p}.gain`, gain.gain);
    osc.connect(gain);
    for (const [wp, wl] of WIRES) if (wp === p) gain.connect(lines[wl - 1]!);
    return osc;
  });
  return { output: place, params, sources };
}

/** Set the score's events on the graph and start its voices at `start`. */
export function play(g: AgentGraph, events: Event[], start = 0) {
  for (const e of events) g.params.get(`${e.node}.${e.param}`)?.setValueAtTime(e.value, start + e.at);
  for (const s of g.sources) s.start(start);
}

/** Render a score offline: stereo, at `rate`, for `seconds`. */
export async function renderOffline(events: Event[], seconds: number, at: [number, number, number] = [0, 0, -1], rate = 22050): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * rate), rate);
  play(buildAgent(ctx, at), events);
  return ctx.startRendering();
}
