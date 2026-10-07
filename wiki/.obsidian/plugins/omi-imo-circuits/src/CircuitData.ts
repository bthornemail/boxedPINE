export interface CircuitComponent {
  id: string;
  role: string;
  value: string;
  label?: string;
  subgraph?: string;
}

export interface CircuitEdge {
  from: string;
  to: string;
  label?: string;
}

export interface CircuitData {
  id: string;
  name: string;
  description: string;
  vertices: CircuitComponent[];
  edges: CircuitEdge[];
}

export const CIRCUITS: Record<string, CircuitData> = {
  '5t-xor': {
    id: '5t-xor',
    name: '5T XOR Circuit',
    description: 'The frame condition (read). NAND + switch + OR-like.',
    vertices: [
      { id: 'Q1', role: 'NPN transistor', value: '2N2222', label: 'Q1' },
      { id: 'Q2', role: 'NPN transistor', value: '2N2222', label: 'Q2' },
      { id: 'Q3', role: 'NPN transistor', value: '2N2222', label: 'Q3' },
      { id: 'Q4', role: 'NPN transistor', value: '2N2222', label: 'Q4' },
      { id: 'Q5', role: 'NPN transistor', value: '2N2222', label: 'Q5' },
      { id: 'R1', role: 'resistor', value: '2K' },
      { id: 'R2', role: 'resistor', value: '2K' },
      { id: 'R3', role: 'resistor', value: '2K' },
      { id: 'R4', role: 'resistor', value: '2K' },
      { id: 'R5', role: 'resistor', value: '2K' },
      { id: 'RLED', role: 'resistor', value: '330' },
      { id: 'LED', role: 'LED', value: 'YELLOW' },
      { id: 'BUS', role: 'bus', value: '8-bit' },
      { id: 'GND', role: 'rail', value: '0V' },
      { id: 'VCC', role: 'rail', value: '+5V' },
    ],
    edges: [
      { from: 'BUS', to: 'Q1', label: 'A' },
      { from: 'BUS', to: 'Q2', label: 'B' },
      { from: 'Q1', to: 'Q2', label: 'NAND' },
      { from: 'Q2', to: 'Q3', label: 'switch' },
      { from: 'Q3', to: 'Q4', label: 'OR-like' },
      { from: 'Q3', to: 'Q5', label: 'OR-like' },
      { from: 'Q4', to: 'LED', label: 'OUT' },
      { from: 'Q1', to: 'VCC', label: 'pull-up' },
      { from: 'Q2', to: 'VCC', label: 'pull-up' },
      { from: 'Q3', to: 'VCC', label: 'pull-up' },
      { from: 'Q4', to: 'VCC', label: 'pull-up' },
      { from: 'Q5', to: 'VCC', label: 'pull-up' },
      { from: 'Q1', to: 'GND', label: 'emitter' },
      { from: 'Q3', to: 'GND', label: 'emitter' },
      { from: 'Q4', to: 'Q5', label: 'OR-like' },
      { from: 'Q5', to: 'GND', label: 'emitter' },
      { from: 'LED', to: 'RLED', label: 'current limit' },
      { from: 'RLED', to: 'GND', label: 'return' },
    ],
  },
  '6t-xor': {
    id: '6t-xor',
    name: '6T XOR Circuit',
    description: 'The apply (full fan-out). XOR#1 + inverter.',
    vertices: [
      { id: 'Q1', role: 'NPN transistor', value: '2N2222', label: 'Q1' },
      { id: 'Q2', role: 'NPN transistor', value: '2N2222', label: 'Q2' },
      { id: 'Q3', role: 'NPN transistor', value: '2N2222', label: 'Q3' },
      { id: 'Q4', role: 'NPN transistor', value: '2N2222', label: 'Q4' },
      { id: 'Q5', role: 'NPN transistor', value: '2N2222', label: 'Q5' },
      { id: 'Q6', role: 'NPN transistor', value: '2N2222', label: 'Q6' },
      { id: 'R1', role: 'resistor', value: '2K' },
      { id: 'R2', role: 'resistor', value: '2K' },
      { id: 'R3', role: 'resistor', value: '2K' },
      { id: 'R4', role: 'resistor', value: '2K' },
      { id: 'R5', role: 'resistor', value: '2K' },
      { id: 'R6', role: 'resistor', value: '2K' },
      { id: 'RLED', role: 'resistor', value: '330' },
      { id: 'LED', role: 'LED', value: 'YELLOW' },
      { id: 'BUS', role: 'bus', value: '8-bit' },
      { id: 'GND', role: 'rail', value: '0V' },
      { id: 'VCC', role: 'rail', value: '+5V' },
    ],
    edges: [
      { from: 'BUS', to: 'Q1', label: 'A' },
      { from: 'BUS', to: 'Q2', label: 'B' },
      { from: 'Q1', to: 'Q2', label: 'NAND' },
      { from: 'Q2', to: 'Q3', label: 'switch' },
      { from: 'Q3', to: 'Q4', label: 'OR-like' },
      { from: 'Q3', to: 'Q5', label: 'OR-like' },
      { from: 'Q4', to: 'LED', label: 'OUT' },
      { from: 'Q1', to: 'VCC', label: 'pull-up' },
      { from: 'Q2', to: 'VCC', label: 'pull-up' },
      { from: 'Q3', to: 'VCC', label: 'pull-up' },
      { from: 'Q4', to: 'VCC', label: 'pull-up' },
      { from: 'Q5', to: 'VCC', label: 'pull-up' },
      { from: 'Q1', to: 'GND', label: 'emitter' },
      { from: 'Q3', to: 'GND', label: 'emitter' },
      { from: 'Q4', to: 'Q5', label: 'OR-like' },
      { from: 'Q5', to: 'GND', label: 'emitter' },
      { from: 'LED', to: 'RLED', label: 'current limit' },
      { from: 'RLED', to: 'GND', label: 'return' },
    ],
  },
  '8t-xor': {
    id: '8t-xor',
    name: '8T XOR Circuit',
    description: 'The eval (SECURE). Built from 4 NAND gates.',
    vertices: [
      { id: 'Q1', role: 'NPN transistor', value: '2N2222', label: 'Q1', subgraph: 'NAND1' },
      { id: 'Q2', role: 'NPN transistor', value: '2N2222', label: 'Q2', subgraph: 'NAND1' },
      { id: 'Q3', role: 'NPN transistor', value: '2N2222', label: 'Q3', subgraph: 'NAND2' },
      { id: 'Q4', role: 'NPN transistor', value: '2N2222', label: 'Q4', subgraph: 'NAND2' },
      { id: 'Q5', role: 'NPN transistor', value: '2N2222', label: 'Q5', subgraph: 'NAND3' },
      { id: 'Q6', role: 'NPN transistor', value: '2N2222', label: 'Q6', subgraph: 'NAND3' },
      { id: 'Q7', role: 'NPN transistor', value: '2N2222', label: 'Q7', subgraph: 'NAND4' },
      { id: 'Q8', role: 'NPN transistor', value: '2N2222', label: 'Q8', subgraph: 'NAND4' },
      { id: 'LED', role: 'LED', value: 'GREEN', subgraph: 'output' },
    ],
    edges: [
      { from: 'Q1', to: 'Q2', label: 'NAND1' },
      { from: 'Q3', to: 'Q4', label: 'NAND2' },
      { from: 'Q5', to: 'Q6', label: 'NAND3' },
      { from: 'Q7', to: 'Q8', label: 'NAND4' },
      { from: 'Q2', to: 'Q3', label: 'chain' },
      { from: 'Q4', to: 'Q5', label: 'chain' },
      { from: 'Q6', to: 'Q7', label: 'chain' },
      { from: 'Q8', to: 'LED', label: 'OUT' },
    ],
  },
  '10t-xor': {
    id: '10t-xor',
    name: '10T XOR Circuit',
    description: 'The digest (reads and drives). Built from 5 NOR gates.',
    vertices: [
      { id: 'Q1', role: 'NPN transistor', value: '2N2222', label: 'Q1', subgraph: 'NOR1' },
      { id: 'Q2', role: 'NPN transistor', value: '2N2222', label: 'Q2', subgraph: 'NOR1' },
      { id: 'Q3', role: 'NPN transistor', value: '2N2222', label: 'Q3', subgraph: 'NOR2' },
      { id: 'Q4', role: 'NPN transistor', value: '2N2222', label: 'Q4', subgraph: 'NOR2' },
      { id: 'Q5', role: 'NPN transistor', value: '2N2222', label: 'Q5', subgraph: 'NOR3' },
      { id: 'Q6', role: 'NPN transistor', value: '2N2222', label: 'Q6', subgraph: 'NOR3' },
      { id: 'Q7', role: 'NPN transistor', value: '2N2222', label: 'Q7', subgraph: 'NOR4' },
      { id: 'Q8', role: 'NPN transistor', value: '2N2222', label: 'Q8', subgraph: 'NOR4' },
      { id: 'Q9', role: 'NPN transistor', value: '2N2222', label: 'Q9', subgraph: 'NOR5' },
      { id: 'Q10', role: 'NPN transistor', value: '2N2222', label: 'Q10', subgraph: 'NOR5' },
      { id: 'LED', role: 'LED', value: 'RED', subgraph: 'output' },
    ],
    edges: [
      { from: 'Q1', to: 'Q2', label: 'NOR1' },
      { from: 'Q3', to: 'Q4', label: 'NOR2' },
      { from: 'Q5', to: 'Q6', label: 'NOR3' },
      { from: 'Q7', to: 'Q8', label: 'NOR4' },
      { from: 'Q9', to: 'Q10', label: 'NOR5' },
      { from: 'Q2', to: 'Q3', label: 'chain' },
      { from: 'Q4', to: 'Q5', label: 'chain' },
      { from: 'Q6', to: 'Q7', label: 'chain' },
      { from: 'Q8', to: 'Q9', label: 'chain' },
      { from: 'Q10', to: 'LED', label: 'OUT' },
    ],
  },
};

export function getCircuitNames(): string[] {
  return Object.keys(CIRCUITS);
}

export function getCircuit(id: string): CircuitData | undefined {
  return CIRCUITS[id];
}
