// XOR as multiplication of +1/-1 signals, rendered offline.
// bit 0 -> +1, bit 1 -> -1.  XOR(a,b) = a*b  (in that encoding).
// A GainNode whose .gain parameter is driven by a second signal multiplies the two.
import { OfflineAudioContext } from 'node-web-audio-api';

const SR = 8000;      // lowest sample rate the spec requires support for
const LEN = 128;      // one render block is enough for constants

const enc = (bit) => (bit ? -1 : 1);
const dec = (v) => (v < 0 ? 1 : 0);

async function renderGraph(build) {
  const ctx = new OfflineAudioContext(1, LEN, SR);
  const out = build(ctx);
  out.connect(ctx.destination);
  const buf = await ctx.startRendering();
  return buf.getChannelData(0)[LEN - 1];
}

function constant(ctx, value) {
  const n = ctx.createConstantSource();
  n.offset.value = value;
  n.start();
  return n;
}

// XOR gate: signal a goes through a gain whose gain is driven by signal b.
function xorGate(ctx, a, b) {
  const g = ctx.createGain();
  g.gain.value = 0;          // base value 0, so only the connected signal sets the gain
  a.connect(g);
  b.connect(g.gain);
  return g;
}

// NOT gate: multiply by the beta constant (-1).
function notGate(ctx, a) {
  const g = ctx.createGain();
  g.gain.value = -1;
  a.connect(g);
  return g;
}

console.log('--- XOR truth table (rendered offline) ---');
let allOk = true;
for (const a of [0, 1]) for (const b of [0, 1]) {
  const v = await renderGraph((ctx) => xorGate(ctx, constant(ctx, enc(a)), constant(ctx, enc(b))));
  const got = dec(v);
  const want = a ^ b;
  if (got !== want) allOk = false;
  console.log(`a=${a} b=${b}  signal=${v.toFixed(4)}  xor=${got}  expected=${want}  ${got === want ? 'ok' : 'WRONG'}`);
}

console.log('\n--- NOT (multiply by beta = -1) ---');
for (const a of [0, 1]) {
  const v = await renderGraph((ctx) => notGate(ctx, constant(ctx, enc(a))));
  console.log(`a=${a}  not=${dec(v)}  expected=${1 - a}  ${dec(v) === 1 - a ? 'ok' : 'WRONG'}`);
  if (dec(v) !== 1 - a) allOk = false;
}

console.log('\n--- Four-way balance (centroid): closed iff XOR of all four = 0, i.e. product = +1 ---');
let balOk = true, closedCount = 0;
for (let m = 0; m < 16; m++) {
  const bits = [0, 1, 2, 3].map((i) => (m >> i) & 1);
  const v = await renderGraph((ctx) => {
    let acc = constant(ctx, enc(bits[0]));
    for (let i = 1; i < 4; i++) acc = xorGate(ctx, acc, constant(ctx, enc(bits[i])));
    return acc;
  });
  const closed = v > 0;
  const want = (bits[0] ^ bits[1] ^ bits[2] ^ bits[3]) === 0;
  if (closed !== want) balOk = false;
  if (closed) closedCount++;
  console.log(`${bits.join('')}  product=${v.toFixed(4)}  closed=${closed}  expected=${want}`);
}
console.log(`\nclosed states: ${closedCount} of 16 (expected 8)`);
console.log(allOk && balOk ? 'RESULT: XOR-as-multiplication works exactly in the offline render.' : 'RESULT: MISMATCH found.');
