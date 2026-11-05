// lexical-casts.mjs: a lexical analysis of a text through the three casts the record uses, Braille, Aegean and
// dominoes (the author, 2026-11-04: "lets do a lexical analysis oof the braille aegean and dominoes distribution").
//
//   node --experimental-strip-types scripts/lexical-casts.mjs FILE [FILE ...]     (- reads standard input)
//
// For each file, counted, nothing assigned:
//   lexemes   words of ASCII letters: total, distinct, lengths; how many could be tags (1 to 8 letters, rosetta TAG)
//   braille6  each ASCII character as a 6-dot cell (Braille ASCII, lower case read as upper): cells used of 64,
//             filled and empty dot places, the cells by frequency; characters with no 6-dot cell
//   braille8  each UTF-8 byte as the 8-dot cell U+2800 + byte: cells used of 256, dots per cell
//   dominoes  each byte two nibbles (high, low): pairs used of 256, doubles; each line's parity (all its nibbles
//             XORed, the gate's nibble, rosetta tagParity) over the 16 values, with chi-square against even
//   aegean    each run of digits cast digit i to Aegean set i mod 5 (space/src/dominoes.ts aegeanOf): the five sets'
//             use, the digits' frequency, first digits
import { readFileSync } from 'node:fs';
import { aegeanOf } from '../space/src/dominoes.ts';

const BRF = " A1B'K2L@CIF/MSP\"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=";
const DOTS = new Map([...BRF].map((c, k) => [c, k]));
const pop = (n) => { let c = 0; for (; n; n &= n - 1) c++; return c; };
const top = (m, n = 12) => [...m].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, n);
const inc = (m, k, by = 1) => m.set(k, (m.get(k) ?? 0) + by);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) : '0.0') + '%';

export function analyse(text) {
  const out = {};
  // lexemes
  const words = text.match(/[A-Za-z]+/g) ?? [], forms = new Map(), lengths = new Map();
  for (const w of words) { inc(forms, w.toLowerCase()); inc(lengths, w.length); }
  const tagable = words.filter((w) => w.length <= 8).length;
  out.lexemes = { words: words.length, distinct: forms.size, tagable, over8: words.length - tagable, lengths: [...lengths].sort((a, b) => a[0] - b[0]), top: top(forms) };
  // braille 6-dot
  const cells6 = new Map(); let filled = 0, places = 0, none = 0;
  for (const ch of text) {
    if (ch === '\n' || ch === '\r' || ch === '\t') continue;
    const k = DOTS.get(ch.toUpperCase());
    if (k === undefined) { none++; continue; }
    inc(cells6, k); filled += pop(k); places += 6;
  }
  const cell = (k) => String.fromCodePoint(0x2800 + k);
  out.braille6 = { cells: places / 6, used: cells6.size, filled, empty: places - filled, none, top: top(cells6).map(([k, n]) => [cell(k), n]) };
  // braille 8-dot and dominoes, from the bytes
  const bytes = new TextEncoder().encode(text), cells8 = new Map(), dots8 = new Map();
  let doubles = 0;
  for (const b of bytes) { inc(cells8, b); inc(dots8, pop(b)); if (b >> 4 === (b & 15)) doubles++; }
  out.braille8 = { cells: bytes.length, used: cells8.size, dots: [...dots8].sort((a, b) => a[0] - b[0]) };
  const parity = new Array(16).fill(0); let lines = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    lines++;
    parity[[...new TextEncoder().encode(line)].reduce((x, b) => x ^ (b >> 4) ^ (b & 15), 0)]++;
  }
  const even = lines / 16, chi = parity.reduce((s, n) => s + (n - even) ** 2 / even, 0);
  out.dominoes = { dominoes: bytes.length, used: cells8.size, doubles, lines, parity, chi: +chi.toFixed(2) };
  // aegean
  const sets = [0, 0, 0, 0, 0], digits = new Array(10).fill(0), first = new Array(10).fill(0), signs = new Set();
  let runs = 0;
  for (const run of text.match(/[0-9]+/g) ?? []) {
    runs++; first[+run[0]]++;
    [...run].forEach((d, i) => { digits[+d]++; if (d !== '0') { sets[i % 5]++; signs.add(aegeanOf(+d, i)); } });
  }
  out.aegean = { runs, digits, first, sets, signs: signs.size };
  return out;
}

function report(name, a) {
  const L = a.lexemes, B = a.braille6, E = a.braille8, D = a.dominoes, A = a.aegean;
  console.log(`== ${name}`);
  console.log(`lexemes   ${L.words} words, ${L.distinct} distinct; ${L.tagable} of 1 to 8 letters (could be tags, ${pct(L.tagable, L.words)}), ${L.over8} longer`);
  console.log(`          lengths ${L.lengths.map(([l, n]) => `${l}:${n}`).join(' ')}`);
  console.log(`          most  ${L.top.map(([w, n]) => `${w} ${n}`).join(', ')}`);
  console.log(`braille6  ${B.cells} cells, ${B.used} of 64 used; dot places ${B.filled} filled, ${B.empty} empty (${pct(B.empty, B.filled + B.empty)} empty); ${B.none} characters with no cell`);
  console.log(`          most  ${B.top.map(([c, n]) => `${c} ${n}`).join('  ')}`);
  console.log(`braille8  ${E.cells} cells, ${E.used} of 256 used; dots per cell ${E.dots.map(([d, n]) => `${d}:${n}`).join(' ')}`);
  console.log(`dominoes  ${D.dominoes} dominoes, ${D.used} of 256 pairs, ${D.doubles} doubles (${pct(D.doubles, D.dominoes)}); ${D.lines} lines' parity over 0..F: ${D.parity.join(' ')}; chi-square ${D.chi} (15 degrees of freedom; 25.0 is the 5% line)`);
  console.log(`aegean    ${A.runs} runs of digits; digits 0..9 ${A.digits.join(' ')}; first digits 1..9 ${A.first.slice(1).join(' ')}; five sets ${A.sets.join(' ')}; ${A.signs} of 45 signs used`);
}

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: lexical-casts.mjs FILE [FILE ...] (- for standard input)'); process.exit(2); }
for (const f of files) report(f === '-' ? 'standard input' : f, analyse(readFileSync(f === '-' ? 0 : f, 'utf8')));
