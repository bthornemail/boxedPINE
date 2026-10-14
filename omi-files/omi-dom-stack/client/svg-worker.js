/**
 * OMI-IMO SVG Worker Geometry Contract
 *
 * Worker-side path producer (Untitled 51).
 * Main thread sends geometry; worker returns SVG paths / markup.
 * Worker never touches the DOM.
 *
 * Message protocol:
 *   → { type: 'render', id, points?, rects?, matrix?, color?, width?, height? }
 *   ← { type: 'svg', id, svg, paths, metrics }
 *   → { type: 'ping' }
 *   ← { type: 'pong', version }
 */
'use strict';

const VERSION = '1.0.0-omi-svg-worker';

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Convert a rect to an SVG path `d` string (closed rectangle).
 */
function rectToPath(r) {
  const x = Number(r.x) || 0;
  const y = Number(r.y) || 0;
  const w = Number(r.width) || 0;
  const h = Number(r.height) || 0;
  return `M${x} ${y}h${w}v${h}h${-w}z`;
}

/**
 * Convert a point to a small diamond / cross path for visibility.
 */
function pointToPath(p, size) {
  const s = size || 4;
  const x = Number(p.x) || 0;
  const y = Number(p.y) || 0;
  return `M${x - s} ${y}L${x} ${y - s}L${x + s} ${y}L${x} ${y + s}z`;
}

/**
 * Build full SVG document + path list from geometry payload.
 */
function renderGeometry(msg) {
  const rects = msg.rects || [];
  const points = msg.points || [];
  const matrix = msg.matrix || { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  const color = msg.color || '#5b8def';
  const paths = [];

  let maxX = 200;
  let maxY = 100;
  for (const r of rects) {
    maxX = Math.max(maxX, (r.x || 0) + (r.width || 0));
    maxY = Math.max(maxY, (r.y || 0) + (r.height || 0));
  }
  for (const p of points) {
    maxX = Math.max(maxX, (p.x || 0) + 10);
    maxY = Math.max(maxY, (p.y || 0) + 10);
  }
  const width = msg.width || Math.ceil(maxX + 20);
  const height = msg.height || Math.ceil(maxY + 20);

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  parts.push(`  <g transform="matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})">`);

  rects.forEach((r, i) => {
    const d = rectToPath(r);
    paths.push({ kind: 'rect', index: i, d, label: r.label || '' });
    parts.push(
      `    <path d="${d}" fill="${color}" fill-opacity="0.35" stroke="${color}" stroke-width="1" data-label="${escapeXml(r.label || '')}"/>`
    );
    if (r.label) {
      parts.push(
        `    <text x="${(r.x || 0) + 2}" y="${(r.y || 0) + 12}" font-size="10" font-family="monospace" fill="#e8e8f0">${escapeXml(r.label)}</text>`
      );
    }
  });

  points.forEach((p, i) => {
    // Only emit point markers if no matching rect label covers them
    const d = pointToPath(p, 3);
    paths.push({ kind: 'point', index: i, d, label: p.label || '' });
  });

  parts.push('  </g>');
  parts.push('</svg>');

  return {
    svg: parts.join('\n'),
    paths,
    metrics: {
      width,
      height,
      rectCount: rects.length,
      pointCount: points.length,
      pathCount: paths.length
    }
  };
}

self.onmessage = function (ev) {
  const msg = ev.data || {};
  try {
    if (msg.type === 'ping') {
      self.postMessage({ type: 'pong', version: VERSION });
      return;
    }
    if (msg.type === 'render') {
      const result = renderGeometry(msg);
      self.postMessage({
        type: 'svg',
        id: msg.id || null,
        svg: result.svg,
        paths: result.paths,
        metrics: result.metrics
      });
      return;
    }
    self.postMessage({ type: 'error', id: msg.id || null, error: 'unknown message type: ' + msg.type });
  } catch (err) {
    self.postMessage({
      type: 'error',
      id: msg.id || null,
      error: String(err && err.message ? err.message : err)
    });
  }
};
