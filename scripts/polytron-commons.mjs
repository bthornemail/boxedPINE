// The synset agents of the Agent Commons, from polytron's barcodes and WordNet.
//
// Polytron drew its barcodes for WordNet synsets (omi-files/polytron/polyform:
// aztec-<id>.svg, maxicode-<id>.svg, beetag-<id>.svg, the id a WordNet 3.0
// synset). The author's layering: Aztec and MaxiCode split the frame, Code 16K
// is the modem, Code 128 the message carrier, BEEtag the pixels. This copies
// those SVGs into public/polytron/svg and writes public/polytron/commons.json:
// one agent per synset, with its word, gloss, hypernym and depth read from
// WordNet's Prolog files (the same files polytron's wn-geometry reads), and the
// geometry wn-geometry names for that depth. Synsets polytron drew that WordNet
// 3.0 does not hold are listed as missing, not made into agents.
//   node scripts/polytron-commons.mjs          (re-run when polytron draws more)
import { readFileSync, readdirSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = new URL('..', import.meta.url).pathname;
const polyform = join(repo, 'omi-files/polytron/polyform');
const WN = process.env.WNPROLOG ?? '/home/main/Downloads/WNprolog-3.0/prolog';
const out = join(repo, 'public/polytron'), svgOut = join(out, 'svg');
mkdirSync(svgOut, { recursive: true });

// wn-geometry.c's depth_to_geom
const GEOMETRY = ['point', 'line', 'triangle', 'tetrahedron', '5-cell', '8-cell', '16-cell', '24-cell', '120-cell', '600-cell'];
const ROOT = 100001740; // entity

const ids = [...new Set(readdirSync(polyform).map((f) => /^(?:aztec|maxicode|beetag)-(\d{9})\.svg$/.exec(f)?.[1]).filter(Boolean))].map(Number).sort((a, b) => a - b);
const lines = (file, id) => readFileSync(join(WN, file), 'latin1').split('\n').filter((l) => l.startsWith(`${file === 'wn_hyp.pl' ? 'hyp' : file === 'wn_g.pl' ? 'g' : 's'}(${id},`));
const word = (id) => /^s\(\d+,\d+,'((?:[^']|'')*)'/.exec(lines('wn_s.pl', id)[0] ?? '')?.[1]?.replace(/''/g, "'");
const gloss = (id) => /^g\(\d+,'((?:[^']|'')*)'\)/.exec(lines('wn_g.pl', id)[0] ?? '')?.[1]?.replace(/''/g, "'");
const hypernym = (id) => Number(/^hyp\(\d+,(\d+)\)/.exec(lines('wn_hyp.pl', id)[0] ?? '')?.[1]) || null;
function depth(id) { let d = 0; for (let h = id; h !== ROOT; d++) { h = hypernym(h); if (h === null || d > 30) return null; } return d; }

const agents = [], missing = [];
for (const id of ids) {
  const w = word(id);
  if (!w) { missing.push(id); continue; }
  const svg = {};
  for (const kind of ['aztec', 'maxicode', 'beetag']) {
    const file = `${kind}-${id}.svg`;
    try { copyFileSync(join(polyform, file), join(svgOut, file)); svg[kind] = `polytron/svg/${file}`; } catch { /* polytron did not draw this one */ }
  }
  const d = depth(id);
  agents.push({ id, word: w, gloss: gloss(id), hypernym: hypernym(id), depth: d, geometry: GEOMETRY[Math.min(d ?? 0, 9)], svg });
}
// ── The 144 colour synsets (proofs I-199): color, the 138 below it, the 5 above ──
// Each takes a hue (0-359) from its CSS Color 4 name if it has one (the standard
// sRGB value, converted to HSL hue); otherwise from its nearest ancestor that
// has one; the achromatic (black, white, gray, and the route above color) have none.
const CSS = { aliceblue:'f0f8ff',antiquewhite:'faebd7',aqua:'00ffff',aquamarine:'7fffd4',azure:'f0ffff',beige:'f5f5dc',bisque:'ffe4c4',black:'000000',blanchedalmond:'ffebcd',blue:'0000ff',blueviolet:'8a2be2',brown:'a52a2a',burlywood:'deb887',cadetblue:'5f9ea0',chartreuse:'7fff00',chocolate:'d2691e',coral:'ff7f50',cornflowerblue:'6495ed',cornsilk:'fff8dc',crimson:'dc143c',cyan:'00ffff',darkblue:'00008b',darkcyan:'008b8b',darkgoldenrod:'b8860b',darkgray:'a9a9a9',darkgreen:'006400',darkkhaki:'bdb76b',darkmagenta:'8b008b',darkolivegreen:'556b2f',darkorange:'ff8c00',darkorchid:'9932cc',darkred:'8b0000',darksalmon:'e9967a',darkseagreen:'8fbc8f',darkslateblue:'483d8b',darkslategray:'2f4f4f',darkturquoise:'00ced1',darkviolet:'9400d3',deeppink:'ff1493',deepskyblue:'00bfff',dimgray:'696969',dodgerblue:'1e90ff',firebrick:'b22222',floralwhite:'fffaf0',forestgreen:'228b22',fuchsia:'ff00ff',gainsboro:'dcdcdc',ghostwhite:'f8f8ff',gold:'ffd700',goldenrod:'daa520',gray:'808080',grey:'808080',green:'008000',greenyellow:'adff2f',honeydew:'f0fff0',hotpink:'ff69b4',indianred:'cd5c5c',indigo:'4b0082',ivory:'fffff0',khaki:'f0e68c',lavender:'e6e6fa',lavenderblush:'fff0f5',lawngreen:'7cfc00',lemonchiffon:'fffacd',lightblue:'add8e6',lightcoral:'f08080',lightcyan:'e0ffff',lightgoldenrodyellow:'fafad2',lightgray:'d3d3d3',lightgreen:'90ee90',lightpink:'ffb6c1',lightsalmon:'ffa07a',lightseagreen:'20b2aa',lightskyblue:'87cefa',lightslategray:'778899',lightsteelblue:'b0c4de',lightyellow:'ffffe0',lime:'00ff00',limegreen:'32cd32',linen:'faf0e6',magenta:'ff00ff',maroon:'800000',mediumaquamarine:'66cdaa',mediumblue:'0000cd',mediumorchid:'ba55d3',mediumpurple:'9370db',mediumseagreen:'3cb371',mediumslateblue:'7b68ee',mediumspringgreen:'00fa9a',mediumturquoise:'48d1cc',mediumvioletred:'c71585',midnightblue:'191970',mintcream:'f5fffa',mistyrose:'ffe4e1',moccasin:'ffe4b5',navajowhite:'ffdead',navy:'000080',oldlace:'fdf5e6',olive:'808000',olivedrab:'6b8e23',orange:'ffa500',orangered:'ff4500',orchid:'da70d6',palegoldenrod:'eee8aa',palegreen:'98fb98',paleturquoise:'afeeee',palevioletred:'db7093',papayawhip:'ffefd5',peachpuff:'ffdab9',peru:'cd853f',pink:'ffc0cb',plum:'dda0dd',powderblue:'b0e0e6',purple:'800080',rebeccapurple:'663399',red:'ff0000',rosybrown:'bc8f8f',royalblue:'4169e1',saddlebrown:'8b4513',salmon:'fa8072',sandybrown:'f4a460',seagreen:'2e8b57',seashell:'fff5ee',sienna:'a0522d',silver:'c0c0c0',skyblue:'87ceeb',slateblue:'6a5acd',slategray:'708090',snow:'fffafa',springgreen:'00ff7f',steelblue:'4682b4',tan:'d2b48c',teal:'008080',thistle:'d8bfd8',tomato:'ff6347',turquoise:'40e0d0',violet:'ee82ee',wheat:'f5deb3',white:'ffffff',whitesmoke:'f5f5f5',yellow:'ffff00',yellowgreen:'9acd32' };
const hueOf = (hex) => { const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); const M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m; if (!d) return null; const x = M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4; return Math.round((x * 60 + 360) % 360); };
const allS = new Map(), parentOf = new Map(), kidsOf = new Map();
for (const l of readFileSync(join(WN, 'wn_s.pl'), 'latin1').split('\n')) { const m = /^s\((\d+),1,'((?:[^']|'')*)',n,/.exec(l); if (m) allS.set(+m[1], m[2].replace(/''/g, "'")); }
for (const l of readFileSync(join(WN, 'wn_hyp.pl'), 'latin1').split('\n')) { const m = /^hyp\((\d+),(\d+)\)/.exec(l); if (m) { const a = +m[1], b = +m[2]; if (!parentOf.has(a)) parentOf.set(a, b); (kidsOf.get(b) ?? kidsOf.set(b, []).get(b)).push(a); } }
const COLOR = 104956594;
const colorIds = []; for (let h = COLOR; h; h = parentOf.get(h)) colorIds.unshift(h);
for (const queue = [COLOR]; queue.length; ) { const k = (kidsOf.get(queue.shift()) ?? []).sort((a, b) => a - b); colorIds.push(...k); queue.push(...k); }
const own = (id) => { const w = allS.get(id).toLowerCase().replace(/[ -]/g, ''); return CSS[w] ? hueOf(CSS[w]) : undefined; };
const colors = colorIds.map((id) => {
  let hue = null, from = null;
  for (let h = id; h; h = parentOf.get(h)) { const o = own(h); if (o !== undefined) { hue = o; from = allS.get(h); break; } }
  let depth = 0; for (let h = id; h !== ROOT; h = parentOf.get(h)) depth++;
  return { id, parent: parentOf.get(id) ?? null, word: allS.get(id), depth, hue, hueFrom: from };
});
writeFileSync(join(out, 'colors.json'), JSON.stringify({ source: 'WordNet 3.0 (Prolog): color, the synsets below it, its route to entity (proofs I-199); hues from CSS Color 4 names', colors }, null, 1) + '\n');
console.log(`polytron-commons: ${colors.length} colour synsets, ${colors.filter((c) => c.hue !== null).length} with a hue (${colors.filter((c) => c.hue !== null && c.hueFrom === c.word).length} their own)`);

writeFileSync(join(out, 'commons.json'), JSON.stringify({ source: 'omi-files/polytron/polyform + WordNet 3.0 (Prolog)', agents, missing }, null, 2) + '\n');
console.log(`polytron-commons: ${agents.length} synset agents (${agents.map((a) => a.word).join(', ')}); not in WordNet 3.0: ${missing.join(', ') || 'none'}`);
