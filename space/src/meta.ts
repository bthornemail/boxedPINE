// META GENERATION (space/meta.html)
//
// The functions in rosetta/src/meta.generate.ts, run in the browser: every
// constant generates its SVG (tiles), its CSS (rules on the tiles' ETags) and
// its cue (a text track on a video of the canvas). Each cue compiles back to
// its constant, which paints the canvas from the SVG and moves a PannerNode
// through the constant's corners. An IntersectionObserver records which tiles
// have been seen. wiki: SPEC-07 I-93.
import { constantSvg, constantCss, compileCue, pannerPositions, metaCues, etag } from '../../rosetta/src/meta.generate.ts';
import { readFanoSvg, CONSTANTS } from '../../core/src/verified/fano.ts';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const status = (rows: [string, string][]) => {
  $('status').innerHTML = rows.map(([k, v]) => `<span class="label">${k}</span><span>${v}</span>`).join('');
};

// CSS, generated: each tile's outline colour is queried from its ETag.
$('generated').textContent = constantCss();

// SVG, generated: sixteen tiles.
const tiles = $('tiles');
for (let i = 0; i < 16; i++) {
  const tile = document.createElement('figure');
  tile.className = 'tile';
  tile.dataset.etag = etag(i);
  tile.innerHTML = `${constantSvg(i)}<figcaption class="label">port ${i} · etag ${etag(i)}</figcaption>`;
  tiles.appendChild(tile);
}

// Intersection: which tiles have been observed.
const seen = new Set<number>();
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { seen.add(Number((e.target as HTMLElement).dataset.etag!.replace(/"/g, ''))); (e.target as HTMLElement).dataset.observed = ''; }
  draw();
});
tiles.querySelectorAll('.tile').forEach((t) => io.observe(t));

// Audio: a PannerNode that moves through the constant's corners.
const audio = new AudioContext();
const panner = new PannerNode(audio, { panningModel: 'HRTF' });

// Canvas and video: the canvas is streamed into a video that carries the cues.
const canvas = $<HTMLCanvasElement>('canvas');
const ctx = canvas.getContext('2d')!;
const video = $<HTMLVideoElement>('video');
video.srcObject = canvas.captureStream(30);
const track = video.addTextTrack('metadata', 'constants');
for (const c of metaCues()) track.addCue(new VTTCue(c.start, c.end, c.text));
track.mode = 'hidden';

let current = -1, readBack = -1, corner = [0, 0, 0];
function show(i: number) {
  current = i;
  readBack = CONSTANTS.indexOf(readFanoSvg(constantSvg(i)));
  const img = new Image();
  img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(constantSvg(i));
  const corners = pannerPositions(i);
  corner = corners[0] ?? [0, 0, 0];
  // .value sets the position at once, whether or not the audio clock is running
  panner.positionX.value = corner[0]!;
  panner.positionY.value = corner[1]!;
  panner.positionZ.value = corner[2]!;
  tiles.querySelectorAll('.tile').forEach((el, k) => (k === i ? ((el as HTMLElement).dataset.active = '') : delete (el as HTMLElement).dataset.active));
  draw();
}
function draw() {
  status([
    ['cue', current < 0 ? 'none yet' : `port ${current}`],
    ['compiled', current < 0 ? '—' : `the cue compiles to ${current}`],
    ['svg reads back', readBack < 0 ? '—' : `constant ${readBack}${readBack === current ? ' (same)' : ' (DIFFERENT)'}`],
    ['panner', `x ${panner.positionX.value} · y ${panner.positionY.value} · z ${panner.positionZ.value}`],
    ['tiles observed', `${seen.size} of 16`],
  ]);
}
track.addEventListener('cuechange', () => {
  const cue = track.activeCues?.[0] as VTTCue | undefined;
  if (cue) show(compileCue(cue.text));
});
$('play').onclick = () => { audio.resume(); video.currentTime = 0; video.play(); };
// ?port=i shows a constant directly, so a reading can be linked (and checked headless).
const start = new URLSearchParams(location.search).get('port');
show(start === null ? 0 : Number(start) & 15);
