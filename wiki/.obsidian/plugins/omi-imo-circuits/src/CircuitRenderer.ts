import { CircuitData } from './CircuitData';

export function renderCircuitSVG(circuit: CircuitData): string {
  const w = 800;
  const h = 600;
  const pad = 40;
  const compW = 60;
  const compH = 40;

  const pos = new Map<string, { x: number; y: number }>();
  const cols = Math.ceil(Math.sqrt(circuit.vertices.length));
  const rows = Math.ceil(circuit.vertices.length / cols);
  const cellW = (w - 2 * pad) / cols;
  const cellH = (h - 2 * pad) / rows;

  circuit.vertices.forEach((v, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    pos.set(v.id, {
      x: pad + col * cellW + cellW / 2,
      y: pad + row * cellH + cellH / 2,
    });
  });

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  svg += `<rect width="${w}" height="${h}" fill="#1e1e1e"/>`;

  for (const edge of circuit.edges) {
    const from = pos.get(edge.from);
    const to = pos.get(edge.to);
    if (!from || !to) continue;
    svg += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#888" stroke-width="1.5" marker-end="url(#arrow)"/>`;
    if (edge.label) {
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      svg += `<text x="${mx}" y="${my - 4}" fill="#aaa" font-size="10" text-anchor="middle">${escapeXml(edge.label)}</text>`;
    }
  }

  for (const v of circuit.vertices) {
    const p = pos.get(v.id);
    if (!p) continue;
    const color = getComponentColor(v.role);
    svg += `<rect x="${p.x - compW / 2}" y="${p.y - compH / 2}" width="${compW}" height="${compH}" rx="4" fill="${color}" stroke="#fff" stroke-width="1"/>`;
    svg += `<text x="${p.x}" y="${p.y - 2}" fill="#fff" font-size="9" text-anchor="middle" font-weight="bold">${escapeXml(v.id)}</text>`;
    svg += `<text x="${p.x}" y="${p.y + 10}" fill="#ddd" font-size="8" text-anchor="middle">${escapeXml(v.value)}</text>`;
  }

  svg += `<defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#888"/></marker></defs>`;
  svg += `</svg>`;
  return svg;
}

function getComponentColor(role: string): string {
  const colors: Record<string, string> = {
    'NPN transistor': '#2d5a27',
    'resistor': '#5a3d2b',
    'LED': '#7a6a1a',
    'bus': '#1a3a5a',
    'rail': '#3a1a5a',
  };
  return colors[role] || '#444';
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
