// CROSS-CHANNEL LOGIC: GATES SPREAD OVER BOARDS, WIRED BY A PROXY
//
// The author: test "the 4 XOR circuits together make all gates" on the boards,
// with a proxy to test cross-channel logic generation. Each node (an ESP32
// running breadboard/esp32, or a mock answering from the kernel's twin)
// evaluates one gate per request, GET /gate/<RULE>/<ab>. The proxy measures
// every node against breadboard/kernel.mjs, then builds functions out of a gate
// set and runs them gate by gate, each gate on the next node in turn, so every
// wire between gates crosses from one node to another. wiki: SPEC-07 I-105, I-106.
import { spawnSync } from 'node:child_process';
import { openSync, readSync, writeSync, closeSync } from 'node:fs';
import { respondTwin, GATE_TABLES, buildTwin, intact } from '../../rosetta/src/organ.ts';

export type Node = { name: string; ask(request: string): string[]; close(): void; retries?: number };

/** A board on a serial port, kept open: every request is a line, every answer ends with 218. */
export function boardNode(port: string, settleMs = 300): Node {
  spawnSync('stty', ['-F', port, '115200', 'cs8', '-cstopb', '-parenb', 'raw', '-echo', '-echoe', '-echok', '-echoctl', '-echoke', '-ixon', '-ixoff', '-crtscts', '-hupcl']);
  const fd = openSync(port, 'r+');
  const buf = Buffer.alloc(512);
  for (const end = Date.now() + settleMs; Date.now() < end; ) readSync(fd, buf, 0, buf.length, null);
  let rest = '';
  const once = (request: string): string[] => {
      writeSync(fd, `\n${request}\n`);
      const lines: string[] = [];
      const deadline = Date.now() + 4000;
      while (Date.now() < deadline) {
        const n = readSync(fd, buf, 0, buf.length, null);
        const parts = (rest + buf.toString('latin1', 0, n)).split(/\r?\n/);
        rest = parts.pop() ?? '';
        for (const l of parts) {
          if (!l || l.startsWith('reflect') || l.startsWith('omi ')) continue;
          if (!lines.length && !/^\d{3} /.test(l)) continue; // only from the status line on
          lines.push(l);
          if (l === '218 This is fine') return lines;
        }
      }
      return lines; // incomplete: the fold check below will not pass
  };
  const node: Node = {
    name: port,
    retries: 0,
    // An answer counts only when its fold matches what arrived; a damaged or
    // missing answer is asked again (up to 3 times), and each retry is counted.
    ask(request) {
      for (let attempt = 0; attempt < 4; attempt++) {
        const answer = once(request);
        if (intact(answer) && answer.at(-1) === '218 This is fine') return answer;
        node.retries!++;
      }
      throw new Error(`${port}: no intact answer to ${request} after 4 tries`);
    },
    close() { closeSync(fd); },
  };
  return node;
}

/** A node with no hardware: it answers from the twin (a stand-in for a board not attached). */
export const mockNode = (name = 'mock'): Node => ({ name, ask: respondTwin, close() {} });

/** One gate on one node. */
export function gate(node: Node, rule: string, a: number, b: number): number {
  const answer = node.ask(`GET /gate/${rule}/${a}${b}`);
  const m = /^gate \S+ [01]{2} ([01])$/.exec(answer[1] ?? '');
  if (answer[0] !== '200 OK' || !m) throw new Error(`${node.name}: ${answer.join(' / ')}`);
  return Number(m[1]);
}

/** Every rule and build on a node, against the kernel: the deviations (empty means the node agrees). */
export function measure(node: Node): string[] {
  const out: string[] = [];
  for (const rule of Object.keys(GATE_TABLES))
    for (const [a, b] of [[0, 0], [0, 1], [1, 0], [1, 1]] as const) {
      const got = gate(node, rule, a, b), want = GATE_TABLES[rule]![a * 2 + b]!;
      if (got !== want) out.push(`${rule} ${a}${b}: ${got}, kernel ${want}`);
    }
  for (const id of ['5T', '6T', '8T', '10T'])
    for (const [a, b] of [[0, 0], [0, 1], [1, 0], [1, 1]] as const) {
      const got = node.ask(`GET /build/${id}/${a}${b}`)[1], want = `build ${id} ${a}${b} ${buildTwin(id, a, b)}`;
      if (got !== want) out.push(`${id} ${a}${b}: ${got}, kernel ${want}`);
    }
  return out;
}

// ---- Building functions out of a gate set ----
// A function of (a, b) is its column over the rows 00, 01, 10, 11: bit i is row i.
export const A = 0b1100, B = 0b1010;
const applyCol = (table: number[], x: number, y: number) =>
  [0, 1, 2, 3].reduce((m, i) => m | (table[((x >> i) & 1) * 2 + ((y >> i) & 1)]! << i), 0);

export type Recipe = { leaf: 'a' | 'b' | '0' | '1' } | { rule: string; x: Recipe; y: Recipe };

/** The functions a gate set reaches from a, b (and 0, 1 if allowed), with one recipe each. */
export function recipes(rules: string[], constants: boolean): Map<number, Recipe> {
  const found = new Map<number, Recipe>([[A, { leaf: 'a' }], [B, { leaf: 'b' }]]);
  if (constants) { found.set(0, { leaf: '0' }); found.set(0b1111, { leaf: '1' }); }
  for (let grew = true; grew; ) {
    grew = false;
    for (const [x, rx] of [...found]) for (const [y, ry] of [...found]) for (const rule of rules) {
      const f = applyCol(GATE_TABLES[rule]!, x, y);
      if (!found.has(f)) { found.set(f, { rule, x: rx, y: ry }); grew = true; }
    }
  }
  return found;
}

/** Run a recipe on one row, every gate on the next node in turn; returns the bit and the hops taken. */
export function run(recipe: Recipe, a: number, b: number, nodes: Node[], turn = { n: 0 }, hops: string[] = []): { bit: number; hops: string[] } {
  if ('leaf' in recipe) return { bit: recipe.leaf === 'a' ? a : recipe.leaf === 'b' ? b : Number(recipe.leaf), hops };
  const x = run(recipe.x, a, b, nodes, turn, hops).bit;
  const y = run(recipe.y, a, b, nodes, turn, hops).bit;
  const node = nodes[turn.n++ % nodes.length]!;
  hops.push(`${node.name}:${recipe.rule}`);
  return { bit: gate(node, recipe.rule, x, y), hops };
}

/** Build every reachable function from the gate set and run it across the nodes; count those whose 4 rows match. */
export function crossChannel(rules: string[], constants: boolean, nodes: Node[]) {
  const book = recipes(rules, constants);
  let matched = 0, hops = 0;
  const crossings = new Set<string>();
  const turn = { n: 0 }; // one rotation for the whole experiment, so every node takes gates
  for (const [f, recipe] of book) {
    let col = 0;
    for (const [i, [a, b]] of ([[0, 0], [0, 1], [1, 0], [1, 1]] as const).entries()) {
      const r = run(recipe, a, b, nodes, turn);
      col |= r.bit << i;
      hops += r.hops.length;
      r.hops.forEach((h) => crossings.add(h.split(':')[0]!));
    }
    if (col === f) matched++;
  }
  return { reached: book.size, matched, gateRequests: hops, nodesUsed: crossings.size };
}

/** The 4-XOR network on three inputs, each gate on the next node: the 7 non-zero XOR combinations, all 8 rows. */
export function sevenXors(nodes: Node[]) {
  const rows: string[] = [];
  let ok = true;
  for (let r = 0; r < 8; r++) {
    const [a, b, c] = [(r >> 2) & 1, (r >> 1) & 1, r & 1];
    const at = (i: number) => nodes[i % nodes.length]!;
    const g1 = gate(at(0), 'XOR', a, b), g2 = gate(at(1), 'XOR', a, c), g3 = gate(at(2), 'XOR', b, c), g4 = gate(at(3), 'XOR', g1, c);
    ok &&= g1 === (a ^ b) && g2 === (a ^ c) && g3 === (b ^ c) && g4 === (a ^ b ^ c);
    rows.push(`${a}${b}${c}: a^b=${g1} a^c=${g2} b^c=${g3} a^b^c=${g4}`);
  }
  return { ok, rows };
}

// CLI: node repl/src/gates.ts /dev/ttyUSB0 /dev/ttyUSB1 [mock]
if (import.meta.url === `file://${process.argv[1]}`) {
  const nodes = process.argv.slice(2).map((p, i) => (p === 'mock' ? mockNode(`mock${i + 1}`) : boardNode(p)));
  try {
    for (const n of nodes) { const d = measure(n); console.log(`${n.name}: ${d.length ? d.join('; ') : 'every gate and build agrees with the kernel'}`); }
    const xorOnly = crossChannel(['XOR'], true, nodes);
    console.log(`XOR only (with 0, 1): reaches ${xorOnly.reached} of 16; run across the nodes, ${xorOnly.matched} matched; ${xorOnly.gateRequests} gate requests over ${xorOnly.nodesUsed} nodes`);
    const inside = crossChannel(['NAND', 'OR', 'NOR'], false, nodes);
    console.log(`the builds' inside gates (NAND, OR, NOR): reaches ${inside.reached} of 16; ${inside.matched} matched; ${inside.gateRequests} gate requests over ${inside.nodesUsed} nodes`);
    const seven = sevenXors(nodes);
    console.log(`4 XOR gates across nodes, 3 inputs: ${seven.ok ? 'all 7 combinations right on all 8 rows' : 'MISMATCH'}`);
    console.log(`retries (answers whose fold did not match): ${nodes.map((n) => `${n.name} ${n.retries ?? 0}`).join(', ')}`);
  } finally { nodes.forEach((n) => n.close()); }
}
