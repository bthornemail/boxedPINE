'use strict';
/**
 * One-off authoring generator for wiki/chapters/*.json.
 * Sources: dev-docs/the_full_bootstrap_rosetta_stone_sourcemap.md (6T canvas
 * verbatim) and dev-docs/Untitled 75.md wire-by-wire tables (5T/8T/10T).
 * Output is committed as static chapter data; this generator is scratch.
 */

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'wiki', 'chapters');

function node(id, role, value, x, y, color, extra) {
  const n = {
    id, type: 'text', role, value, color,
    x, y, width: 8, height: 3,
    text: extra && extra.text ? extra.text : id
  };
  if (extra) {
    if (extra.bRow != null) n.bRow = extra.bRow;
    if (extra.bCol != null) n.bCol = extra.bCol;
    if (extra.pin != null) n.pin = extra.pin;
  }
  return n;
}

function edge(id, fromNode, fromPin, toNode, toPin, label) {
  return { id, fromNode, fromPin, toNode, toPin, label };
}

function sourcemap(nodes) {
  return nodes.map((n) => ({
    smeCanvasNodeId: n.id,
    smePhysicalNodeId: n.id,
    smeComponentType: n.role === 'transistor' ? 'NPN' : n.role,
    smeComponentValue: n.value,
    smeBreadboardRow: n.bRow != null ? n.bRow : 0,
    smeBreadboardCol: n.bCol != null ? n.bCol : 0,
    smeNotes: n.role + ' ' + n.id
  }));
}

function cuesFor(spec, steps) {
  return steps.map((s, i) => ({
    id: 'wk-' + spec.id + '-' + s.step,
    start: i * 0.5,
    end: (i + 1) * 0.5,
    text: s.text,
    payload: { chapter: spec.n, step: s.step, face: spec.face || null, role: spec.role }
  }));
}

function compileChapter(spec) {
  const nodes = [];
  const edges = [];
  const builds = [];
  const probeMap = spec.probes || {};

  const xs = { q: 0, r: 12, rail: 24 };
  const ys = {};
  const qs = spec.transistors;
  qs.forEach((q, i) => {
    ys[q.id] = i * 10;
    nodes.push(node(q.id, 'transistor', '2N2222', xs.q, ys[q.id], '1', { bRow: 5, bCol: q.bCol, text: q.id + (q.group ? ' (' + q.group + ')' : ' (NPN)') }));
    if (spec.pullups) {
      const num = (/^(\d+)$/.exec(q.id.slice(1)))[1];
      nodes.push(node('R' + num, 'resistor', '2K', xs.r, ys[q.id], '2', { bRow: 1, bCol: q.bCol }));
      edges.push(edge('R' + num + '-C-to-VCC', 'R' + num, 'right', 'VCC', 'left', 'pull-up'));
    }
  });

  // Rails
  nodes.push(node('BUS', 'bus', '8-bit', xs.rail, 0, '4', { bRow: 1, bCol: 0, text: 'DATA BUS' }));
  nodes.push(node('GND', 'rail', '0V', xs.rail, qs.length * 10, '0', { bRow: 20, bCol: 0 }));
  nodes.push(node('VCC', 'rail', '+5V', xs.rail, 16, '7', { bRow: 1, bCol: qs.length * 10, text: 'VCC (+5V)' }));

  const ledY = qs.length * 10 + 8;
  nodes.push(node('RLED', 'resistor', '330', xs.r, ledY, '2', { bRow: 15, bCol: spec.led.bCol - 2, text: 'RLED (330)' }));
  nodes.push(node('LED', 'LED', spec.led.color.toUpperCase(), xs.rail, ledY, spec.led.colorFace, { bRow: 15, bCol: spec.led.bCol, text: spec.led.color.toUpperCase() + ' LED' }));

  // Inputs
  (spec.inputs || []).forEach((s) => {
    edges.push(edge(s.sig + '-to-' + s.to + '-B', 'BUS', 'left', s.to, 'top', s.sig));
    builds.push({ step: s.step, text: s.text || (s.sig + ' → 2K → B(' + s.to + ')'), place: [s.to] });
  });

  // Connections
  (spec.wires || []).forEach((w) => {
    const e = edge(w.id || w.from + '-' + w.fromPin + '-to-' + w.to + '-' + w.toPin, w.from, w.fromPin, w.to, w.toPin, w.label || 'wire');
    if (w.dup) e.dup = true;
    edges.push(e);
    builds.push({ step: w.step, text: w.text || (w.from + ' ' + w.fromPin + ' → ' + w.to + ' ' + w.toPin + (w.label ? ' [' + w.label + ']' : '')), place: [w.from, w.to] });
  });

  // Emitters to GND
  (spec.gnd || []).forEach((g) => {
    edges.push(edge(g.from + '-E-to-GND', g.from, 'E', 'GND', 'top', 'emitter'));
  });

  // Output chain
  const out = spec.output;
  if (out) {
    edges.push(edge(out.from + '-C-to-LED', out.from, 'C', 'LED', 'left', 'OUT'));
  }
  edges.push(edge('LED-to-RLED', 'LED', 'right', 'RLED', 'left', 'current limit'));
  edges.push(edge('RLED-to-GND', 'RLED', 'bottom', 'GND', 'right', 'return'));

  const ch = {
    id: spec.id,
    n: spec.n,
    name: spec.name,
    role: spec.role,
    face: spec.face,
    led: spec.led.color.toLowerCase(),
    mask: spec.mask,
    circuit: spec.circuit,
    story: spec.story,
    principles: spec.principles,
    build: builds,
    canvas: { nodes, edges },
    sourcemap: sourcemap(nodes),
    netlist: edges.map((e, i) => ({ step: i + 1, from: e.fromNode, fromPin: e.fromPin, to: e.toNode, toPin: e.toPin, label: e.label })),
    cues: cuesFor(spec, spec.cueSteps || []),
    probes: probeMap,
    codex: { role: spec.role, centroid: spec.centroid || '0x0000', face: spec.face },
    verification: spec.verification || []
  };
  return ch;
}

function chSpec(id, n) {
  return { id: 'wk-' + n, n };
}

// ---------- Prologue ----------
const PROLOGUE = {
  id: 'cn-00-prologue',
  n: 0,
  name: 'Prologue — The Breadboard and the Centroid',
  role: 'prologue',
  face: null,
  led: null,
  mask: 0x00,
  circuit: { type: 'scaffold', variant: 'rails', transistors: 0, resistors: 0, fanOut: 'rails' },
  story: [
    'The breadboard is the physical carrier. Row 1 is the +5V rail, row 2 the collector taps, row 5 the bases, row 10 the emitters, rows 15/20 the LED anodes and cathodes.',
    'Every operation reduces to XOR. Four faces realize the four phases: BOOT0 (bind, 5T), BOOT1 (apply, 6T), SECURE (eval, 8T), USER (digest, 10T).'
  ],
  principles: ['The carrier is the transport. The graph is the structure.', 'Rails: +5V, GND, DATA BUS make every subgraph shareable.'],
  transistors: [],
  pullups: false,
  led: { color: 'black', colorFace: '0', bCol: 0 },
  inputs: [],
  wires: [],
  gnd: [],
  output: null,
  probes: {},
  cueSteps: [
    { step: 'w0', text: 'Lay the rails: +5V row 1, GND row 20, DATA BUS across.' },
    { step: 'w0b', text: 'The centroid gate: BOOT0 ^ BOOT1 ^ SECURE ^ USER.' }
  ],
  verification: [],
  centroid: '0x0000'
};
const PLED0 = { color: 'blue', colorFace: '0', bCol: 0 };

// ---------- 5T bind (XOR #1, BOOT0, RED) ----------
const SPEC5 = {
  id: 'cn-01-bind-5t',
  n: 1,
  name: 'XOR #1 — Bind (5T)',
  role: 'bind',
  face: 'BOOT0',
  led: { color: 'red', colorFace: '1', bCol: 31 },
  mask: 0x1C,
  circuit: { type: 'xor', variant: '5t', transistors: 5, resistors: 6, fanOut: 'None' },
  story: [
    'XOR #1 is a NAND gate on the left two transistors, a switch for the middle transistor, and an OR-like gate for the last two.',
    'It can only show its result: current flows into the circuit and through the LED. It has no fan-out — BOOT0 is a terminal.'
  ],
  principles: ['NAND+switch+OR-like realizes XOR with 5 transistors.', 'The bind phase constructs the relation; it cannot drive downstream.'],
  transistors: [
    { id: 'Q1', bCol: 1 }, { id: 'Q2', bCol: 6 }, { id: 'Q3', bCol: 11 },
    { id: 'Q4', bCol: 21 }, { id: 'Q5', bCol: 26 }
  ],
  pullups: true,
  inputs: [
    { sig: 'A', to: 'Q1', step: 's1', text: 'A → 2K → B(Q1)' },
    { sig: 'B', to: 'Q2', step: 's2', text: 'B → 2K → B(Q2)' }
  ],
  wires: [
    { from: 'Q2', fromPin: 'E', to: 'Q1', toPin: 'C', label: 'NAND', step: 's3', text: 'E(Q2) → C(Q1) [NAND wire-AND]' },
    { from: 'Q2', fromPin: 'C', to: 'Q3', toPin: 'B', label: 'switch', step: 's4', text: 'C(Q2) → B(Q3) [NAND output drives switch base]' },
    { from: 'Q3', fromPin: 'C', to: 'Q4', toPin: 'B', label: 'OR-like', step: 's5', text: 'C(Q3) → B(Q4)' },
    { from: 'Q3', fromPin: 'C', to: 'Q5', toPin: 'B', label: 'OR-like', step: 's6', text: 'C(Q3) → B(Q5)' },
    { from: 'Q4', fromPin: 'E', to: 'Q5', toPin: 'C', label: 'OR-like', step: 's7', text: 'E(Q4) → C(Q5) [OR-like wire-AND]' }
  ],
  gnd: [
    { from: 'Q1' }, { from: 'Q3' }, { from: 'Q5' }
  ],
  output: { from: 'Q4' },
  probes: { BOOT0: { row: 2, col: 21 } },
  cueSteps: [
    { step: 's1', text: 'Bind: A → 2K → B(Q1), B → 2K → B(Q2).' },
    { step: 's3-4', text: 'NAND wire-AND: E(Q2) → C(Q1). Switch drives Q3.' },
    { step: 's5-7', text: 'OR-like: Q3 drives Q4 and Q5; E(Q4) → C(Q5).' },
    { step: 's8', text: 'Output: C(Q4) → 330Ω → RED LED. BOOT0 = bind output.' }
  ],
  verification: [
    { A: 0, B: 0, out: 0, expect: 'xor', led: 'off' },
    { A: 1, B: 0, out: 1, expect: 'xor', led: 'on' },
    { A: 0, B: 1, out: 1, expect: 'xor', led: 'on' },
    { A: 1, B: 1, out: 0, expect: 'xor', led: 'off' }
  ],
  centroid: '0x1C'
};

// helper to inject fromPin/toPin on edge objects after edge() calls get mapped
function finalize(spec) {
  const ch = compileChapter(spec);
  return ch;
}

let prologue = compileChapter(PROLOGUE);
prologue.canvas = { nodes: [], edges: [] };
prologue.sourcemap = [];
prologue.netlist = [];
prologue = Object.assign(prologue, {
  canvas: {
    nodes: [
      node('BUS', 'bus', '8-bit', 0, 0, '4', { bRow: 1, bCol: 0 }),
      node('GND', 'rail', '0V', 0, 16, '0', { bRow: 20, bCol: 0 }),
      node('VCC', 'rail', '+5V', 0, 32, '7', { bRow: 1, bCol: 1, text: 'VCC (+5V)' })
    ],
    edges: [
      edge('BUS-to-VCC-rail', 'BUS', 'bottom', 'VCC', 'left', 'caption')
    ]
  },
  sourcemap: [
    { smeCanvasNodeId: 'BUS', smePhysicalNodeId: 'BUS', smeComponentType: 'rail', smeComponentValue: '0V/+5V', smeBreadboardRow: 1, smeBreadboardCol: 0, smeNotes: 'carrier rails' },
    { smeCanvasNodeId: 'GND', smePhysicalNodeId: 'GND', smeComponentType: 'rail', smeComponentValue: '0V', smeBreadboardRow: 20, smeBreadboardCol: 0, smeNotes: 'ground rail' }
  ],
  netlist: [
    { step: 1, from: '+5V', fromPin: 'rail', to: 'VCC', toPin: 'bus', label: 'power' },
    { step: 2, from: 'GND', fromPin: 'rail', to: 'GND', toPin: 'bus', label: 'ground' }
  ],
  cues: [
    { id: 'wk-0-w0', start: 0, end: 0.5, text: 'Lay the rails: +5V row 1, GND row 20, DATA BUS across.', payload: { chapter: 0, step: 'w0' } },
    { id: 'wk-0-w0b', start: 0.5, end: 1, text: 'The centroid gate: BOOT0 ^ BOOT1 ^ SECURE ^ USER.', payload: { chapter: 0, step: 'w0b' } }
  ],
  story: PROLOGUE.story,
  principles: PROLOGUE.principles,
  circuit: PROLOGUE.circuit
});

// ---------- 6T apply (XOR #2, BOOT1, YELLOW) — verbatim sourcemap ----------
const SIX_NODES = [
  {"id":"Q1","type":"text","x":0,"y":0,"width":8,"height":3,"color":"1","text":"Q1 (NPN)","role":"transistor","value":"2N2222","pin":"B","bRow":5,"bCol":1},
  {"id":"Q2","type":"text","x":0,"y":8,"width":8,"height":3,"color":"1","text":"Q2 (NPN)","role":"transistor","value":"2N2222","pin":"B","bRow":5,"bCol":6},
  {"id":"Q3","type":"text","x":0,"y":16,"width":8,"height":3,"color":"1","text":"Q3 (NPN)","role":"transistor","value":"2N2222","pin":"B","bRow":5,"bCol":11},
  {"id":"Q4","type":"text","x":0,"y":24,"width":8,"height":3,"color":"1","text":"Q4 (NPN)","role":"transistor","value":"2N2222","pin":"B","bRow":5,"bCol":21},
  {"id":"Q5","type":"text","x":0,"y":32,"width":8,"height":3,"color":"1","text":"Q5 (NPN)","role":"transistor","value":"2N2222","pin":"B","bRow":5,"bCol":26},
  {"id":"Q6","type":"text","x":0,"y":40,"width":8,"height":3,"color":"1","text":"Q6 (NPN)","role":"transistor","value":"2N2222","pin":"B","bRow":5,"bCol":41},
  {"id":"R1","type":"text","x":12,"y":0,"width":6,"height":3,"color":"2","text":"R1 (2K)","role":"resistor","value":"2K","pin":"C","bRow":1,"bCol":1},
  {"id":"R2","type":"text","x":12,"y":8,"width":6,"height":3,"color":"2","text":"R2 (2K)","role":"resistor","value":"2K","pin":"C","bRow":1,"bCol":6},
  {"id":"R3","type":"text","x":12,"y":16,"width":6,"height":3,"color":"2","text":"R3 (2K)","role":"resistor","value":"2K","pin":"C","bRow":1,"bCol":11},
  {"id":"R4","type":"text","x":12,"y":24,"width":6,"height":3,"color":"2","text":"R4 (2K)","role":"resistor","value":"2K","pin":"C","bRow":1,"bCol":21},
  {"id":"R5","type":"text","x":12,"y":32,"width":6,"height":3,"color":"2","text":"R5 (2K)","role":"resistor","value":"2K","pin":"C","bRow":1,"bCol":26},
  {"id":"R6","type":"text","x":12,"y":40,"width":6,"height":3,"color":"2","text":"R6 (2K)","role":"resistor","value":"2K","pin":"C","bRow":1,"bCol":41},
  {"id":"RLED","type":"text","x":12,"y":48,"width":6,"height":3,"color":"2","text":"RLED (330)","role":"resistor","value":"330","pin":"C","bRow":15,"bCol":49},
  {"id":"LED","type":"text","x":24,"y":48,"width":8,"height":3,"color":"5","text":"YELLOW LED","role":"LED","value":"YELLOW","pin":"A","bRow":15,"bCol":51},
  {"id":"BUS","type":"text","x":24,"y":0,"width":10,"height":3,"color":"4","text":"DATA BUS","role":"bus","value":"8-bit","pin":null,"bRow":1,"bCol":0},
  {"id":"GND","type":"text","x":24,"y":24,"width":8,"height":3,"color":"0","text":"GND","role":"rail","value":"0V","pin":null,"bRow":20,"bCol":0},
  {"id":"VCC","type":"text","x":24,"y":32,"width":8,"height":3,"color":"7","text":"VCC (+5V)","role":"rail","value":"+5V","pin":null,"bRow":1,"bCol":42}
];
const SIX_EDGES = [
  {"id":"A-to-Q1-B","fromNode":"BUS","fromSide":"left","toNode":"Q1","toSide":"top","toEnd":"arrow","label":"A"},
  {"id":"B-to-Q2-B","fromNode":"BUS","fromSide":"left","toNode":"Q2","toSide":"top","toEnd":"arrow","label":"B"},
  {"id":"Q1-C-to-Q2-E","fromNode":"Q1","fromSide":"bottom","toNode":"Q2","toSide":"top","toEnd":"arrow","label":"NAND"},
  {"id":"Q2-C-to-Q3-B","fromNode":"Q2","fromSide":"bottom","toNode":"Q3","toSide":"top","toEnd":"arrow","label":"switch"},
  {"id":"Q3-C-to-Q4-B","fromNode":"Q3","fromSide":"bottom","toNode":"Q4","toSide":"top","toEnd":"arrow","label":"OR-like"},
  {"id":"Q3-C-to-Q5-B","fromNode":"Q3","fromSide":"bottom","toNode":"Q5","toSide":"top","toEnd":"arrow","label":"OR-like"},
  {"id":"Q4-C-to-LED","fromNode":"Q4","fromSide":"bottom","toNode":"LED","toSide":"left","toEnd":"arrow","label":"OUT"},
  {"id":"Q1-C-to-VCC","fromNode":"Q1","fromSide":"right","toNode":"VCC","toSide":"left","toEnd":"arrow","label":"pull-up"},
  {"id":"Q2-C-to-VCC","fromNode":"Q2","fromSide":"right","toNode":"VCC","toSide":"left","toEnd":"arrow","label":"pull-up"},
  {"id":"Q3-C-to-VCC","fromNode":"Q3","fromSide":"right","toNode":"VCC","toSide":"left","toEnd":"arrow","label":"pull-up"},
  {"id":"Q4-C-to-VCC","fromNode":"Q4","fromSide":"right","toNode":"VCC","toSide":"left","toEnd":"arrow","label":"pull-up"},
  {"id":"Q5-C-to-VCC","fromNode":"Q5","fromSide":"right","toNode":"VCC","toSide":"left","toEnd":"arrow","label":"pull-up"},
  {"id":"Q1-E-to-GND","fromNode":"Q1","fromSide":"bottom","toNode":"GND","toSide":"top","toEnd":"arrow","label":"emitter"},
  {"id":"Q3-E-to-GND","fromNode":"Q3","fromSide":"bottom","toNode":"GND","toSide":"top","toEnd":"arrow","label":"emitter"},
  {"id":"Q4-E-to-Q5-C","fromNode":"Q4","fromSide":"bottom","toNode":"Q5","toSide":"top","toEnd":"arrow","label":"OR-like"},
  {"id":"Q5-E-to-GND","fromNode":"Q5","fromSide":"bottom","toNode":"GND","toSide":"top","toEnd":"arrow","label":"emitter"},
  {"id":"LED-to-RLED","fromNode":"LED","fromSide":"right","toNode":"RLED","toSide":"left","toEnd":"arrow","label":"current limit"},
  {"id":"RLED-to-GND","fromNode":"RLED","fromSide":"bottom","toNode":"GND","toSide":"right","toEnd":"arrow","label":"return"}
];

const SPEC6 = {
  base: {
    id: 'cn-02-apply-6t', n: 2, name: 'XOR #2 — Apply (6T)', role: 'apply', face: 'BOOT1',
    led: 'yellow', mask: 0x1D,
    circuit: { type: 'xor', variant: '6t', transistors: 6, resistors: 7, fanOut: 'Full' },
    story: [
      'XOR #2 is XOR #1 plus one transistor on the right-hand side — Q6, acting as an inverter.',
      'The LED direction is flipped and current flows OUT of the circuit. The output can be sent elsewhere — BOOT1 is a source, so it can drive the eval stage.'
    ],
    principles: [
      'The apply phase needs fan-out. One inverter transistor turns a terminal into a source.',
      'BOOT1 = BOOT0 inverted through the Q6 inverter stage.'
    ],
    probes: { BOOT1: { row: 2, col: 42 } },
    cueSteps: [
      { step: 's9', text: 'Apply: C(Q4) → 2K → B(Q6) inverter stage.' },
      { step: 's10', text: 'C(Q6) → 330Ω → YELLOW LED. BOOT1 = apply output.' }
    ],
    verification: [
      { A: 0, B: 0, out: 1, expect: 'xn' },
      { A: 1, B: 0, out: 0, expect: 'xn' },
      { A: 0, B: 1, out: 0, expect: 'xn' },
      { A: 1, B: 1, out: 1, expect: 'xn' }
    ],
    centroid: '0x1D'
  },
  nodes: SIX_NODES,
  edges: SIX_EDGES
};

// ---------- 8T eval (XOR #3, SECURE, GREEN) ----------
const SPEC8 = {
  id: 'cn-03-eval-8t',
  n: 3,
  name: 'XOR #3 — Eval (8T)',
  role: 'eval',
  face: 'SECURE',
  led: { color: 'green', colorFace: '2', bCol: 41 },
  mask: 0x1E,
  circuit: { type: 'xor', variant: '8t', transistors: 8, resistors: 9, fanOut: 'Composable' },
  story: [
    'XOR #3 is built from 4 NAND gates, each requiring 2 transistors: 8 transistors total.',
    'NAND1 = ~(A & B); NAND2 = ~(A & NAND1); NAND3 = ~(B & NAND1); NAND4 = ~(NAND2 & NAND3).',
    'The 4-NAND structure is gate-level composable. SECURE stores receipts and each receipt must be independently addressable — the composable topology gives that.'
  ],
  principles: ['Eval is composed of identical subgates.', 'SECURE must be composable to keep receipts independently verifiable.'],
  transistors: [
    { id: 'Q7', bCol: 1, group: 'NAND1' }, { id: 'Q8', bCol: 6, group: 'NAND1' },
    { id: 'Q9', bCol: 11, group: 'NAND2' }, { id: 'Q10', bCol: 16, group: 'NAND2' },
    { id: 'Q11', bCol: 21, group: 'NAND3' }, { id: 'Q12', bCol: 26, group: 'NAND3' },
    { id: 'Q13', bCol: 31, group: 'NAND4' }, { id: 'Q14', bCol: 36, group: 'NAND4' }
  ],
  pullups: true,
  inputs: [
    { sig: 'A', to: 'Q7', step: 's11', text: 'A → 2K → B(Q7) [NAND1]' },
    { sig: 'B', to: 'Q8', step: 's12', text: 'B → 2K → B(Q8) [NAND1]' }
  ],
  wires: [
    { from: 'Q8', fromPin: 'E', to: 'Q7', toPin: 'C', label: 'NAND', step: 's13', text: 'NAND1 wire-AND: E(Q8) → C(Q7); NAND1 = C(Q8)' },
    { from: 'Q8', fromPin: 'C', to: 'Q10', toPin: 'B', label: 'NAND2-in', step: 's14', text: 'A → Q9; NAND1 → B(Q10)' },
    { from: 'Q10', fromPin: 'E', to: 'Q9', toPin: 'C', label: 'NAND', step: 's15', text: 'NAND2 wire-AND: E(Q10) → C(Q9); NAND2 = C(Q10)' },
    { from: 'Q12', fromPin: 'E', to: 'Q11', toPin: 'C', label: 'NAND', step: 's16', text: 'B → Q11; NAND1 → B(Q12); NAND3 = C(Q12)' },
    { from: 'Q10', fromPin: 'C', to: 'Q13', toPin: 'B', label: 'NAND4-in', step: 's17', text: 'NAND2 → B(Q13)' },
    { from: 'Q12', fromPin: 'C', to: 'Q14', toPin: 'B', label: 'NAND4-in', step: 's18', text: 'NAND3 → B(Q14)' },
    { from: 'Q14', fromPin: 'E', to: 'Q13', toPin: 'C', label: 'NAND', step: 's19', text: 'NAND4 wire-AND: E(Q14) → C(Q13); NAND4 = C(Q14)' }
  ],
  gnd: [
    { from: 'Q7' }, { from: 'Q9' }, { from: 'Q11' }, { from: 'Q13' }
  ],
  output: { from: 'Q14' },
  probes: { SECURE: { row: 2, col: 36 } },
  cueSteps: [
    { step: 's11', text: 'Eval: NAND1 = ~(A & B) built from Q7, Q8.' },
    { step: 's14', text: 'NAND2 = ~(A & NAND1); NAND3 = ~(B & NAND1).' },
    { step: 's17', text: 'NAND4 = ~(NAND2 & NAND3).' },
    { step: 's20', text: 'Output: C(Q14) → 330Ω → GREEN LED. SECURE = eval output.' }
  ],
  verification: [
    { A: 0, B: 0, out: 0, expect: 'xor' },
    { A: 1, B: 0, out: 1, expect: 'xor' },
    { A: 0, B: 1, out: 1, expect: 'xor' },
    { A: 1, B: 1, out: 0, expect: 'xor' }
  ],
  centroid: '0x1E'
};

// ---------- 10T digest (XOR #4, USER, BLUE) ----------
const SPEC10 = {
  id: 'cn-04-digest-10t',
  n: 4,
  name: 'XOR #4 — Digest (10T)',
  role: 'digest',
  face: 'USER',
  led: { color: 'blue', colorFace: '2', bCol: 96 },
  mask: 0x1F,
  circuit: { type: 'xor', variant: '10t', transistors: 10, resistors: 11, fanOut: 'Full (maximum reliability)' },
  story: [
    'XOR #4 is built from 5 NOR gates, each requiring 2 transistors: 10 transistors total.',
    'NOR1 = ~(A | B); NOR2 = ~(A | NOR1); NOR3 = ~(B | NOR1); NOR4 = ~(NOR2 | NOR3); NOR5 buffers NOR4.',
    'The 5-NOR topology is the most reliable — precedent: the Apollo Guidance Computer ran on NOR gates because NOR was the most trusted topology.'
  ],
  principles: ['Digest maximizes reliability — NOR-only mirrors the Apollo Guidance Computer.', 'USER is where the data lives; it must be the most robust face.'],
  transistors: [
    { id: 'Q15', bCol: 51, group: 'NOR1' }, { id: 'Q16', bCol: 56, group: 'NOR1' },
    { id: 'Q17', bCol: 61, group: 'NOR2' }, { id: 'Q18', bCol: 66, group: 'NOR2' },
    { id: 'Q19', bCol: 71, group: 'NOR3' }, { id: 'Q20', bCol: 76, group: 'NOR3' },
    { id: 'Q21', bCol: 81, group: 'NOR4' }, { id: 'Q22', bCol: 86, group: 'NOR4' },
    { id: 'Q23', bCol: 91, group: 'NOR5' }, { id: 'Q24', bCol: 96, group: 'NOR5' }
  ],
  pullups: true,
  inputs: [
    { sig: 'A', to: 'Q15', step: 's21', text: 'A → 2K → B(Q15) [NOR1]' },
    { sig: 'B', to: 'Q16', step: 's22', text: 'B → 2K → B(Q16) [NOR1]' }
  ],
  wires: [
    { from: 'Q16', fromPin: 'C', to: 'Q15', toPin: 'C', label: 'NOR', step: 's23', text: 'C(Q15) & C(Q16) tied — NOR1 wire-AND' },
    { from: 'Q15', fromPin: 'C', to: 'Q18', toPin: 'B', label: 'NOR2-in', step: 's24', text: 'A → Q17; NOR1 → B(Q18)' },
    { from: 'Q18', fromPin: 'C', to: 'Q17', toPin: 'C', label: 'NOR', step: 's25', text: 'NOR2 collectors tied' },
    { from: 'Q20', fromPin: 'C', to: 'Q19', toPin: 'C', label: 'NOR', step: 's26', text: 'B → Q19; NOR1 → B(Q20); NOR3 collectors tied' },
    { from: 'Q17', fromPin: 'C', to: 'Q21', toPin: 'B', label: 'NOR4-in', step: 's27', text: 'NOR2 → B(Q21)' },
    { from: 'Q19', fromPin: 'C', to: 'Q22', toPin: 'B', label: 'NOR4-in', step: 's28', text: 'NOR3 → B(Q22)' },
    { from: 'Q22', fromPin: 'C', to: 'Q21', toPin: 'C', label: 'NOR', step: 's29', text: 'NOR4 collectors tied' },
    { from: 'Q21', fromPin: 'C', to: 'Q23', toPin: 'B', label: 'NOR5-in', step: 's30', text: 'NOR4 → B(Q23), B(Q24) [buffer]' },
    { from: 'Q24', fromPin: 'C', to: 'Q23', toPin: 'C', label: 'NOR', step: 's31', text: 'NOR5 collectors tied' }
  ],
  gnd: [
    { from: 'Q15' }, { from: 'Q16' }, { from: 'Q17' }, { from: 'Q18' },
    { from: 'Q19' }, { from: 'Q20' }, { from: 'Q21' }, { from: 'Q22' },
    { from: 'Q23' }, { from: 'Q24' }
  ],
  output: { from: 'Q23' },
  probes: { USER: { row: 2, col: 91 } },
  cueSteps: [
    { step: 's21', text: 'Digest: NOR1 = ~(A | B) built from Q15, Q16.' },
    { step: 's24', text: 'NOR2 = ~(A | NOR1); NOR3 = ~(B | NOR1).' },
    { step: 's27', text: 'NOR4 = ~(NOR2 | NOR3).' },
    { step: 's30', text: 'NOR5 buffers NOR4 → BLUE LED. USER = digest output.' }
  ],
  verification: [
    { A: 0, B: 0, out: 0, expect: 'xor' },
    { A: 1, B: 0, out: 1, expect: 'xor' },
    { A: 0, B: 1, out: 1, expect: 'xor' },
    { A: 1, B: 1, out: 0, expect: 'xor' }
  ],
  centroid: '0x1F'
};

// ---------- Epilogue ----------
const EPILOGUE = {
  id: 'cn-05-epilogue',
  n: 5,
  name: 'Epilogue — The Centroid and the Meta-Compile',
  role: 'epilogue',
  face: null,
  led: { color: 'gray', colorFace: '2', bCol: 0 },
  mask: 0x00,
  circuit: { type: 'centroid', variant: 'tetrahedral', transistors: 0, resistors: 0, fanOut: 'gate' },
  story: [
    'The tetrahedral centroid is the XOR of the four faces: Centroid = BOOT0 ^ BOOT1 ^ SECURE ^ USER.',
    'The transistor count increases monotonically 5 → 6 → 8 → 10 because each face adds capability: BOOT0 constructs, BOOT1 drives, SECURE composes, USER carries.',
    'When the walkthrough is complete, the meta-compilation is complete: every canvas node traces back to its physical realization, every vertex and every edge is one line of the JSONL/NDJSON stream.'
  ],
  principles: [],
  transistors: [],
  pullups: false,
  led: { color: 'gray', colorFace: '2', bCol: 0 },
  inputs: [],
  wires: [],
  gnd: [],
  output: null,
  probes: { CENTROID: { row: 2, col: 110 }, CENTROID_XOR: { value: 0x00 } },
  cueSteps: [
    { step: 'e1', text: 'Wire the centroid gate: BOOT0 ^ BOOT1 ^ SECURE ^ USER.' },
    { step: 'e2', text: 'Green centroid LED illuminates at the terminal. Meta-compilation complete.' }
  ],
  verification: [],
  centroid: '0x00'
};

// Build all chapters
const five = finalize(SPEC5);
const six = (() => {
  const ch = {...SPEC6.base};
  ch.canvas = { nodes: SPEC6.nodes, edges: SPEC6.edges };
  ch.sourcemap = SPEC6.nodes.map(n => ({
    smeCanvasNodeId: n.id, smePhysicalNodeId: n.id,
    smeComponentType: n.role === 'transistor' ? 'NPN' : n.role,
    smeComponentValue: n.value,
    smeBreadboardRow: n.bRow != null ? n.bRow : 0,
    smeBreadboardCol: n.bCol != null ? n.bCol : 0,
    smeNotes: n.role + ' ' + n.id + (n.text || '')
  }));
  ch.netlist = SPEC6.edges.map((e, i) => ({ step: i + 1, from: e.fromNode, fromPin: e.fromSide, to: e.toNode, toPin: e.toSide, label: e.label }));
  ch.cueSteps = SPEC6.base.cueSteps;
  ch.build = SPEC6.base.cueSteps.map((s, i) => ({ step: s.step, text: s.text, place: ['Q6'] }));
  ch.cues = ch.cueSteps.map((s, i) => ({
    id: 'wk-' + ch.id + '-' + s.step, start: i * 0.5, end: (i + 1) * 0.5, text: s.text,
    payload: { chapter: ch.n, step: s.step, face: 'BOOT1', role: 'apply' }
  }));
  return ch;
})();
const eight = finalize(SPEC8);
const ten = finalize(SPEC10);
const epilogue = finalize(EPILOGUE);
epilogue.canvas.nodes = [
  node('BUS', 'bus', '8-bit', 0, 0, '4', { bRow: 1, bCol: 0, text: 'DATA BUS' }),
  node('VCC', 'rail', '+5V', 0, 16, '7', { bRow: 1, bCol: 110, text: 'VCC (+5V)' }),
  node('GND', 'rail', '0V', 0, 32, '0', { bRow: 20, bCol: 0, text: 'GND' })
];
epilogue.canvas.nodes.push(node('CENTROID', 'gate', 'XOR', 24, 8, '6', { bRow: 2, bCol: 110, text: 'CENTROID (XOR)' }));
epilogue.canvas.nodes.push(node('LED', 'LED', 'GRAY', 24, 24, '2', { bRow: 15, bCol: 110, text: 'CENTROID LED' }));
epilogue.canvas.edges = [
  { id: 'BOOT0-into-centroid', fromNode: 'BUS', fromSide: 'left', toNode: 'CENTROID', toSide: 'left', toEnd: 'arrow', label: 'BOOT0' },
  { id: 'BOOT1-into-centroid', fromNode: 'VCC', fromSide: 'left', toNode: 'CENTROID', toSide: 'top', toEnd: 'arrow', label: 'BOOT1' },
  { id: 'SECURE-into-centroid', fromNode: 'GND', fromSide: 'left', toNode: 'CENTROID', toSide: 'right', toEnd: 'arrow', label: 'SECURE' },
  { id: 'USER-into-centroid', fromNode: 'VCC', fromSide: 'right', toNode: 'CENTROID', toSide: 'bottom', toEnd: 'arrow', label: 'USER' },
  { id: 'probe-0x00', fromNode: 'CENTROID', fromSide: 'bottom', toNode: 'LED', toSide: 'top', toEnd: 'arrow', label: '0x00' },
  { id: 'gnd-return', fromNode: 'LED', fromSide: 'bottom', toNode: 'GND', toSide: 'right', toEnd: 'arrow', label: 'return' }
];
epilogue.cues = (EPILOGUE.cueSteps || []).map((s, i) => ({
  id: 'wk-' + epilogue.id + '-' + s.step, start: i * 0.5, end: (i + 1) * 0.5, text: s.text,
  payload: { chapter: 5, step: s.step }
}));
epilogue.sourcemap = epilogue.canvas.nodes.map((n) => ({
  smeCanvasNodeId: n.id,
  smePhysicalNodeId: n.id,
  smeComponentType: n.role === 'transistor' ? 'NPN' : n.role,
  smeComponentValue: n.value,
  smeBreadboardRow: n.bRow != null ? n.bRow : 0,
  smeBreadboardCol: n.bCol != null ? n.bCol : 0,
  smeNotes: n.role + ' ' + n.id
}));
epilogue.netlist = epilogue.canvas.edges.map((e, i) => ({
  step: i + 1, from: e.fromNode, fromPin: e.fromSide || 'left', to: e.toNode, toPin: e.toSide || 'right', label: e.label
}));

const chapters = [prologue, five, six, eight, ten, epilogue];

for (const ch of chapters) {
  delete ch.cueSteps;
  ch.probes = ch.probes || {};
}

fs.mkdirSync(OUT, { recursive: true });
for (const ch of chapters) {
  const file = path.join(OUT, ch.id + '.json');
  fs.writeFileSync(file, JSON.stringify(ch, null, 2) + '\n');
  console.log('wrote', file, '-', ch.canvas.nodes.length, 'nodes', ch.canvas.edges.length, 'edges', ch.cues.length, 'cues');
}
console.log('done', chapters.length, 'chapters');