// Self-test for the XOR breadboard kernel, rendered offline with node-web-audio-api.
import { OfflineAudioContext } from 'node-web-audio-api';
import { createKernel, evaluate, selfTest } from './kernel.mjs';

const kernel = createKernel();
let failed = 0;

console.log('--- grammar (truth table -> spectrum c0 cx cy cxy) ---');
for (const rule of kernel.grammar.values()) {
  console.log(`${rule.name.padEnd(7)} ${rule.table.join('')}  [${rule.spectrum.join(', ')}]  ${rule.transistors}T`);
}

console.log('\n--- four builds, rendered offline ---');
for (const { circuit, rows, ok } of await selfTest(kernel, OfflineAudioContext)) {
  const counts = { '5T': 5, '6T': 6, '8T': 8, '10T': 10 };
  const countOk = circuit.transistorCount === counts[circuit.id];
  console.log(`${circuit.id.padEnd(3)} ${circuit.role.padEnd(6)} transistors=${circuit.transistorCount}${countOk ? '' : ' WRONG'}`);
  for (const r of rows) {
    const out = r.signals[circuit.led.net].toFixed(4);
    console.log(`    a=${r.a} b=${r.b}  ${circuit.led.net}=${out}  led=${r.led}  expected=${r.expected}  ${r.ok ? 'ok' : 'WRONG'}`);
  }
  if (!ok || !countOk) failed++;
}

// OPEN-00 #1: reading the 6T before its output transistor gives XNOR.
console.log('\n--- 6T read before the output stage (the node) ---');
const sixT = kernel.circuits.find((c) => c.id === '6T');
const node = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => evaluate(sixT, a, b).get('node'));
console.log(`node over 00,01,10,11 = ${node.join('')}  (XNOR = 1001)`);
if (node.join('') !== '1001') failed++;

// learn(): a rule the description never mentioned, added at runtime and used by a new circuit.
console.log('\n--- learn() then compile() ---');
kernel.learn('XNOR', { table: [1, 0, 0, 1], transistors: 2 });
const learned = kernel.compile({
  id: 'XN', role: 'learned', led: { net: 'out', drive: 'source' },
  nets: [['x', 'XNOR', 'A', 'B'], ['out', 'NOT', 'x']],
});
const [learnedResult] = await selfTest({ circuits: [learned] }, OfflineAudioContext);
console.log(`NOT(XNOR(A,B)) from a learned rule: ${learnedResult.ok ? 'ok' : 'WRONG'}`);
if (!learnedResult.ok) failed++;

console.log(failed ? `\nRESULT: ${failed} failure(s)` : '\nRESULT: all four builds compute XOR in the audio graph.');
process.exit(failed ? 1 : 0);
