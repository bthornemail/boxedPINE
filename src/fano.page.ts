// The Fano Constants page (index.html). Ported from the page's original inline
// script (_archive/_inbox/Fano Constants.html); the reading now comes from
// core/src/verified/fano.ts, which uses whole numbers only, so every buffer
// and every device reads the same constant (wiki: SPEC-16, "The Sixteen Constants").
import { LINES, step, converge, perp, CONSTANTS, constantIndex, readFanoSvg } from '../core/src/verified/fano.ts';

const SOURCES = import.meta.glob('../space/src/assets/fano/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const FILES = Object.entries(SOURCES)
  .map(([path, text]) => ({ name: path.split('/').pop()!, text }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Where the seven points sit in the files' own coordinates (read from Fano_full.svg).
const P: Record<number, [number, number]> = { 1: [13.5, 72.3], 2: [47.5, 13.5], 3: [30.5, 42.9], 4: [81.4, 72.3], 5: [47.5, 72.3], 6: [64.5, 42.9], 7: [47.5, 52.7] };
const bin = (m: number) => m.toString(2).padStart(7, '0');
const pop = (m: number) => { let c = 0; for (; m; m >>= 1) c += m & 1; return c; };
const pointsOf = (m: number) => [1, 2, 3, 4, 5, 6, 7].filter((n) => (m >> (n - 1)) & 1);
const $ = (id: string) => document.getElementById(id)!;

// ---- live plane ----
const NS = 'http://www.w3.org/2000/svg';
const live = $('live');
const mk = (tag: string, attrs: Record<string, string | number>, parent: Element) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent.appendChild(e);
  return e;
};
const lineEls: Record<string, Element> = {};
for (const L of LINES) {
  const key = [...L].sort().join('');
  if (key === '356') { lineEls[key] = mk('circle', { cx: 47.5, cy: 52.7, r: 19.6, class: 'ln' }, live); continue; }
  const pts = L.map((n) => P[n]!).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  lineEls[key] = mk('line', { x1: pts[0]![0], y1: pts[0]![1], x2: pts[2]![0], y2: pts[2]![1], class: 'ln' }, live);
}
const ptEls: Record<number, Element> = {};
for (const n of [1, 2, 3, 4, 5, 6, 7]) {
  const g = mk('g', { class: 'pt', tabindex: 0, role: 'button', 'aria-label': 'Point ' + n }, live);
  mk('circle', { cx: P[n]![0], cy: P[n]![1], r: 5.2 }, g);
  mk('text', { x: P[n]![0], y: P[n]![1] + 0.3 }, g).textContent = String(n);
  ptEls[n] = g;
  g.addEventListener('click', () => toggle(n));
  g.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    if (k === 'Enter' || k === ' ') { e.preventDefault(); toggle(n); }
  });
}
let sel = [2, 4];
function toggle(n: number) {
  sel = sel.includes(n) ? sel.filter((x) => x !== n) : [...sel, n].slice(-2);
  drawLive();
}
$('clear').onclick = () => { sel = []; drawLive(); };
function drawLive() {
  Object.values(lineEls).forEach((e) => e.classList.remove('hit'));
  Object.values(ptEls).forEach((e) => e.classList.remove('on', 'third'));
  sel.forEach((n) => ptEls[n]!.classList.add('on'));
  const eq = $('eq'), bits = $('bits');
  if (sel.length < 2) { eq.innerHTML = '— ⊕ — = —'; bits.innerHTML = ''; return; }
  const [a, b] = sel as [number, number];
  const c = a ^ b;
  ptEls[c]!.classList.add('third');
  lineEls[[a, b, c].sort().join('')]!.classList.add('hit');
  eq.innerHTML = `<span class="a">${a}</span> ⊕ <span class="b">${b}</span> = <span class="c">${c}</span>`;
  const r = (lbl: string, v: number, cls = '') =>
    `<span class="label">${lbl}</span><span class="${cls}">${v.toString(2).padStart(3, '0')}</span><span>${v}</span><span>0x${v.toString(16)}</span>`;
  bits.innerHTML = r('a', a) + r('b', b) + r('a ⊕ b', c) + r('a⊕b⊕c', a ^ b ^ c, 'zero');
}
drawLive();

const tb = document.querySelector('#lines tbody')!;
for (const [a, b, c] of LINES) {
  const tr = document.createElement('tr');
  const t = (v: number) => v.toString(2).padStart(3, '0');
  tr.innerHTML = `<td>${a}-${b}-${c}</td><td>${t(a)}</td><td>${t(b)}</td><td>${t(c)}</td><td class="zero">${t(a ^ b ^ c)}</td>`;
  tb.appendChild(tr);
}

// ---- library: each file read with whole numbers only ----
const lib = $('lib');
const items = FILES.map((f) => ({ ...f, mask: readFanoSvg(f.text), el: null as HTMLButtonElement | null }));
items.forEach((it, i) => {
  const twin = items.findIndex((o, j) => j < i && o.text === it.text);
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'card';
  const svg = it.text.replace(/<\?xml[^>]*>/, '').replace(/<svg\b/, '<svg viewBox="0 0 94.931824 85.793999"')
    .replace(/\swidth="94\.931824"/, '').replace(/\sheight="85\.793999"/, '');
  const pts = pointsOf(it.mask);
  card.innerHTML = `<div class="img">${svg}</div><div class="name">${it.name}</div>
    <div class="mask">${bin(it.mask)} · 0x${it.mask.toString(16).padStart(2, '0')} · index ${constantIndex(it.mask)}</div>
    <div class="label">${pts.length ? 'points ' + pts.join(',') : 'no marked points'}${twin >= 0 ? ' · same bytes as ' + items[twin]!.name : ''}</div>`;
  card.onclick = () => pick(i);
  it.el = card;
  lib.appendChild(card);
});
let A: number | null = null, B: number | null = null;
function pick(i: number) {
  if (A === null || B !== null) { A = i; B = null; } else if (i !== A) B = i;
  render();
}
function render() {
  items.forEach((it, i) => { it.el!.classList.toggle('A', i === A); it.el!.classList.toggle('B', i === B); });
  const s = (i: number | null, n: string, m: string) => {
    $(n).textContent = i === null ? '—' : items[i]!.name;
    $(m).textContent = i === null ? '—' : bin(items[i]!.mask);
  };
  s(A, 'aName', 'aMask');
  s(B, 'bName', 'bMask');
  const v = $('verdict'), x = $('xMask');
  if (A === null || B === null) { x.textContent = '—'; v.textContent = 'Pick two files.'; return; }
  const d = items[A]!.mask ^ items[B]!.mask, h = pop(d);
  x.textContent = bin(d);
  v.innerHTML = h === 0 ? `<span class="zero">Hamming 0.</span> Same constant, two views.`
    : `Hamming ${h}. They differ at point${h > 1 ? 's' : ''} ${pointsOf(d).join(', ')}.`;
}
A = items.findIndex((f) => f.name === 'Fano_point_2.svg');
B = items.findIndex((f) => f.name === 'Fano_point_2 (Copy).svg');
render();

// ---- convergence: any byte, two gate steps, one of sixteen constants ----
const byte = $('byte') as HTMLInputElement;
function drawConverge() {
  const m = Number(byte.value) & 0xff;
  const s1 = step(m & 0x7f), s2 = step(s1), c = converge(m), i = constantIndex(c);
  $('byteOut').textContent = String(m);
  $('steps').innerHTML = [
    ['byte', m.toString(2).padStart(8, '0')], ['low 7 bits', bin(m & 0x7f)], ['step 1', bin(s1)], ['step 2', bin(s2)],
    ['constant', `${bin(c)} · index ${i}`], ['dual (index ' + (i ^ 15) + ')', bin(perp(c))],
  ].map(([k, v]) => `<span class="label">${k}</span><span>${v}</span>`).join('');
}
byte.addEventListener('input', drawConverge);
drawConverge();
$('table').textContent = [...CONSTANTS].map((m, i) => `${String(i).padStart(2)}  ${bin(m)}  dual ${String(i ^ 15).padStart(2)}`).join('\n');
