// THE TWIN, one view: the Commons floor drawn on a transferred canvas (an OffscreenCanvas
// in a worker), each character's state stepped by K once a tick, the same in both views;
// only Solomon's icon differs, a disc in one, a square in the other (global.vtt
// replay-video: the two states separate in the icon, XOR, the same in the story, XNOR).
// Each frame's pixels go back to the page, which compares the two views.
import { drawFloor, atHue, toFloor, type Mark } from './plane.ts';
import { CHARACTERS } from './characters.ts';
import { K, hex16 } from './gnomon.ts';

export type Icon = 'disc' | 'square' | 'stray';
export type ToWorker = { canvas: OffscreenCanvas; icon: Icon } | { tick: number };
export type FromWorker = { tick: number; pixels: Uint8ClampedArray };

let ctx: OffscreenCanvasRenderingContext2D | null = null;
let size = 0;
let icon: Icon = 'disc';

const hsl = (hue: number | null, l: number) => (hue === null ? `hsl(0 0% ${l}%)` : `hsl(${hue} 70% ${l}%)`);

/** The states at a tick: each character's seed stepped by K that many times. */
function statesAt(tick: number): Map<string, number> {
  const out = new Map<string, number>();
  for (const c of CHARACTERS) {
    let s = c.seed;
    for (let t = 0; t < tick; t++) s = K(s);
    out.set(c.tag, s);
  }
  return out;
}

function draw(tick: number) {
  if (!ctx) return;
  const marks: Mark[] = CHARACTERS.map((c) => ({ at: atHue(c.hue), hue: c.hue, name: c.tag }));
  drawFloor(ctx, size, marks);
  const states = statesAt(tick);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(size / 56)}px monospace`;
  for (const m of marks) {
    const [x, y] = toFloor(m.at, size), r = size / 70;
    if (m.name === 'SOLOMON' && (icon === 'square' || icon === 'stray')) {
      // the other icon: drawn over the disc, inside the same place
      ctx.fillStyle = '#151c24';
      ctx.fillRect(x - r * 1.1, y - r * 1.1, r * 2.2, r * 2.2);
      ctx.fillStyle = hsl(m.hue, 55);
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.fillStyle = '#9fb0bd';
    ctx.fillText(hex16(states.get(m.name)!), x, y + r * 4.2);
  }
  if (icon === 'stray') {
    // the falsifier: a mark away from Solomon, which the comparison must catch
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size - 12, size - 12, 4, 4);
  }
  ctx.fillStyle = '#edf0e9';
  ctx.textAlign = 'left';
  ctx.fillText(`tick ${tick}`, size / 64, size / 32);
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  if ('canvas' in m) {
    ctx = m.canvas.getContext('2d');
    size = m.canvas.width;
    icon = m.icon;
    draw(0);
    return;
  }
  draw(m.tick);
  const pixels = ctx!.getImageData(0, 0, size, size).data;
  (self as unknown as Worker).postMessage({ tick: m.tick, pixels } satisfies FromWorker, [pixels.buffer]);
};
