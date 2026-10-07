// The XOR breadboard kernel: the four discrete-BJT XOR builds (5T, 6T, 8T, 10T)
// generated from one description.
//
//   description --learn--> grammar (truth table -> Walsh spectrum)
//   description --compile--> circuits (netlist, transistor numbering, sourcemap)
//   circuits --realize--> Web Audio graph (the signals)
//   circuits --layout--> canvas positions (the geometry)
//
// Bits travel as signals in the same encoding as ../xor.mjs: bit 0 -> +1, bit 1 -> -1.
// In that encoding every 2-input gate is affine in {1, x, y, x*y}:
//
//   out = (c0 + cx*x + cy*y + cxy*x*y) / 2
//
// The constant term comes from the VCC rail (a ConstantSourceNode at 1) and the
// product term from a GainNode whose gain is driven by the second input.
// Nothing in this file touches the DOM, so the browser page and the Node test share it.

export const enc = (bit) => (bit ? -1 : 1);
export const dec = (v) => (v < 0 ? 1 : 0);
export const VECTORS = [[0, 0], [0, 1], [1, 0], [1, 1]];

// Walsh spectrum of a 2-input truth table, indexed by a*2 + b.
export function spectrum(table) {
  const c = [0, 0, 0, 0];
  VECTORS.forEach(([a, b], i) => {
    const t = enc(table[i]), x = enc(a), y = enc(b);
    c[0] += t / 2; c[1] += (t * x) / 2; c[2] += (t * y) / 2; c[3] += (t * x * y) / 2;
  });
  return c;
}

// The default description. Rule tables are indexed by a*2 + b (00, 01, 10, 11).
// Transistor costs are chosen so each build's total matches the source count (SRC-08).
// The internal topology of the 5T/6T is a gate-level reading of the source prose; the
// source schematics are images only.
export const DESCRIPTION = {
  rules: {
    NAND:   { table: [1, 1, 1, 0], transistors: 2 },
    NOR:    { table: [1, 0, 0, 0], transistors: 2 },
    OR:     { table: [0, 1, 1, 1], transistors: 2, note: 'the OR-like pair' },
    SWITCH: { table: [1, 1, 1, 0], transistors: 1, note: 'pulls the node low only when both bases are high' },
    NOT:    { table: [1, 1, 0, 0], transistors: 1, arity: 1, note: 'output stage / inverter' },
  },
  circuits: [
    {
      id: '5T', role: 'read', note: 'frame condition; LED sinks current, output cannot be forwarded',
      led: { net: 'node', drive: 'sink', color: 'YELLOW' }, tone: 220,
      nets: [['n', 'NAND', 'A', 'B'], ['o', 'OR', 'A', 'B'], ['node', 'SWITCH', 'n', 'o']],
    },
    {
      id: '6T', role: 'apply', note: '5T plus one output transistor; driveable',
      led: { net: 'out', drive: 'source', color: 'YELLOW' }, tone: 277.18,
      nets: [['n', 'NAND', 'A', 'B'], ['o', 'OR', 'A', 'B'], ['node', 'SWITCH', 'n', 'o'], ['out', 'NOT', 'node']],
    },
    {
      id: '8T', role: 'eval', note: 'four 2-transistor NAND gates',
      led: { net: 'out', drive: 'source', color: 'GREEN' }, tone: 329.63,
      nets: [['n', 'NAND', 'A', 'B'], ['p', 'NAND', 'A', 'n'], ['q', 'NAND', 'B', 'n'], ['out', 'NAND', 'p', 'q']],
    },
    {
      id: '10T', role: 'digest', note: 'five 2-transistor NOR gates',
      led: { net: 'out', drive: 'source', color: 'RED' }, tone: 440,
      nets: [['n1', 'NOR', 'A', 'B'], ['n2', 'NOR', 'A', 'n1'], ['n3', 'NOR', 'B', 'n1'], ['n4', 'NOR', 'n2', 'n3'], ['out', 'NOR', 'n4', 'n4']],
    },
  ],
};

const INPUTS = ['A', 'B'];

export function createKernel(description = DESCRIPTION) {
  const grammar = new Map();

  function learn(name, { table, transistors = 2, arity = 2, note = '' }) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(name)) throw new Error(`rule name "${name}" must be UPPER_CASE`);
    if (!Array.isArray(table) || table.length !== 4 || table.some((t) => t !== 0 && t !== 1)) {
      throw new Error(`rule ${name}: table must be four bits indexed by a*2+b`);
    }
    const rule = { name, table, transistors, arity, note, spectrum: spectrum(table) };
    grammar.set(name, rule);
    return rule;
  }

  function compile(decl) {
    const { id, nets = [], led } = decl;
    if (!id) throw new Error('circuit without id');
    const known = new Map(INPUTS.map((n) => [n, { depth: 0 }]));
    const gates = [];
    let q = 0;
    for (const [net, ruleName, a, b = a] of nets) {
      const rule = grammar.get(ruleName);
      if (!rule) throw new Error(`${id}: net ${net} uses unknown rule ${ruleName} (learn it first)`);
      if (known.has(net)) throw new Error(`${id}: net ${net} is driven twice`);
      for (const input of [a, b]) {
        if (!known.has(input)) throw new Error(`${id}: net ${net} reads ${input} before it is driven`);
      }
      const inputs = rule.arity === 1 ? [a, a] : [a, b];
      const depth = 1 + Math.max(known.get(inputs[0]).depth, known.get(inputs[1]).depth);
      // Sourcemap convention from SPEC-41: transistors on row 5, every fifth column from 1.
      const transistors = Array.from({ length: rule.transistors }, () => {
        q += 1;
        return { id: `Q${q}`, row: 5, col: 1 + 5 * (q - 1), gate: net, rule: ruleName };
      });
      const gate = { net, rule, inputs, depth, transistors };
      gates.push(gate);
      known.set(net, gate);
    }
    if (!led || !known.has(led.net)) throw new Error(`${id}: led must read a driven net`);
    const drive = led.drive === 'sink' ? 'sink' : 'source';
    return {
      ...decl,
      led: { ...led, drive },
      gates,
      transistorCount: q,
      depth: Math.max(0, ...gates.map((g) => g.depth)),
      sourcemap: gates.flatMap((g) => g.transistors),
    };
  }

  for (const [name, rule] of Object.entries(description.rules || {})) learn(name, rule);
  const circuits = (description.circuits || []).map(compile);

  return { description, grammar, learn, compile, circuits };
}

// Pure-JS reference evaluation, used to cross-check the audio graph.
export function evaluate(circuit, a, b) {
  const bits = new Map([['A', a], ['B', b]]);
  for (const g of circuit.gates) {
    bits.set(g.net, g.rule.table[bits.get(g.inputs[0]) * 2 + bits.get(g.inputs[1])]);
  }
  return bits;
}

export const ledLit = (circuit, bits) =>
  circuit.led.drive === 'sink' ? 1 - bits.get(circuit.led.net) : bits.get(circuit.led.net);

// Build one circuit as Web Audio nodes. rails = { one, A, B } are AudioNodes carrying ±1.
// Returns a Map from net name to the AudioNode carrying that net.
export function realize(ctx, circuit, rails) {
  const nets = new Map([['A', rails.A], ['B', rails.B]]);
  for (const g of circuit.gates) {
    const x = nets.get(g.inputs[0]);
    const y = nets.get(g.inputs[1]);
    const [c0, cx, cy, cxy] = g.rule.spectrum;
    const sum = ctx.createGain();
    const tap = (src, k) => {
      if (!k) return;
      const t = ctx.createGain();
      t.gain.value = k / 2;
      src.connect(t).connect(sum);
    };
    tap(rails.one, c0);
    tap(x, cx);
    tap(y, cy);
    if (cxy) {
      const product = ctx.createGain();
      product.gain.value = 0; // only the driven signal sets the gain, so out = x * y
      x.connect(product);
      y.connect(product.gain);
      tap(product, cxy);
    }
    nets.set(g.net, sum);
  }
  return nets;
}

// LED level as a signal: 1 when lit, 0 when dark. Built from the rail so it stays in-graph.
export function realizeLed(ctx, circuit, nets, one) {
  const level = ctx.createGain();
  const half = ctx.createGain();
  half.gain.value = 0.5;
  one.connect(half).connect(level);
  const signed = ctx.createGain();
  signed.gain.value = circuit.led.drive === 'sink' ? 0.5 : -0.5;
  nets.get(circuit.led.net).connect(signed).connect(level);
  return level;
}

const constant = (ctx, v) => {
  const n = ctx.createConstantSource();
  n.offset.value = v;
  n.start();
  return n;
};

// Render every circuit through all four input vectors in an OfflineAudioContext and
// compare the audio result against XOR and against the pure-JS reference.
export async function selfTest(kernel, OfflineAudioContextCtor, { sampleRate = 8000 } = {}) {
  const BLOCK = 128;
  const results = [];
  for (const circuit of kernel.circuits) {
    const probes = ['A', 'B', ...circuit.gates.map((g) => g.net), '#led'];
    if (probes.length > 32) throw new Error(`${circuit.id}: too many nets to probe offline`);
    const ctx = new OfflineAudioContextCtor(probes.length, BLOCK * VECTORS.length, sampleRate);
    const one = constant(ctx, 1);
    const A = constant(ctx, 1);
    const B = constant(ctx, 1);
    VECTORS.forEach(([a, b], k) => {
      A.offset.setValueAtTime(enc(a), (k * BLOCK) / sampleRate);
      B.offset.setValueAtTime(enc(b), (k * BLOCK) / sampleRate);
    });
    const nets = realize(ctx, circuit, { one, A, B });
    nets.set('#led', realizeLed(ctx, circuit, nets, one));
    const merger = ctx.createChannelMerger(probes.length);
    probes.forEach((p, i) => nets.get(p).connect(merger, 0, i));
    merger.connect(ctx.destination);
    const buffer = await ctx.startRendering();

    const rows = VECTORS.map(([a, b], k) => {
      const at = k * BLOCK + BLOCK - 1;
      const signals = Object.fromEntries(probes.map((p, i) => [p, buffer.getChannelData(i)[at]]));
      const reference = evaluate(circuit, a, b);
      const led = signals['#led'] > 0.5 ? 1 : 0;
      const netsAgree = circuit.gates.every((g) => dec(signals[g.net]) === reference.get(g.net));
      return {
        a, b, led, expected: a ^ b, signals,
        agreesWithReference: netsAgree && led === ledLit(circuit, reference),
        ok: led === (a ^ b) && netsAgree,
      };
    });
    results.push({ circuit, rows, ok: rows.every((r) => r.ok) });
  }
  return results;
}
