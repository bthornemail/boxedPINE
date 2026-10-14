/**
 * OMI-IMO Interactive Genesis
 * Knot (ruler) ↔ torus fold ↔ Dali Cross unfold
 * Proto-attributes: svg | canvas | webgl | audio
 * VTT-cue driven scheduling
 */
'use strict';

class Knot {
  constructor(ruler) {
    this.ruler = (ruler && ruler.length) ? ruler.slice(0, 16) : new Array(16).fill(0);
    while (this.ruler.length < 16) this.ruler.push(0);
  }

  diagonal() {
    return this.ruler.reduce((a, b) => (a ^ (b | 0)) >>> 0, 0);
  }

  linear() {
    return this.ruler.reduce((a, b) => a + (Number(b) || 0), 0);
  }

  /** 12-bit Pythagorean-relation mask (Dali Cross) */
  daliCross() {
    const r = this.ruler.map(Number);
    const t = r[0] || 0, b = r[1] || 0, right = r[2] || 0, l = r[3] || 0;
    const f = r[4] || 0, br = r[5] || 0;
    const py = (a, c, hyp) => Math.abs(a * a + c * c - hyp * hyp) < 1e-6;
    let mask = 0;
    if (py(t, b, right)) mask |= 1;
    if (py(t, f, right)) mask |= 2;
    if (py(t, br, right)) mask |= 4;
    if (py(b, f, right)) mask |= 8;
    if (py(b, br, right)) mask |= 16;
    if (py(f, br, right)) mask |= 32;
    if (py(t, b, l)) mask |= 64;
    if (py(t, f, l)) mask |= 128;
    if (py(t, br, l)) mask |= 256;
    if (py(b, f, l)) mask |= 512;
    if (py(b, br, l)) mask |= 1024;
    if (py(f, br, l)) mask |= 2048;
    // always encode diagonal bits so mask is informative even without exact triples
    mask |= (this.diagonal() & 0xfff);
    return mask >>> 0;
  }

  foldTorus(major, minor, segments) {
    major = major != null ? major : 1.0;
    minor = minor != null ? minor : 0.25;
    segments = segments || 240;
    const points = [];
    const diag = this.diagonal();
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const phi = ((diag % 256) / 256) * 2 * Math.PI + (i / segments) * Math.PI * 0.25;
      const x = (major + minor * Math.cos(phi)) * Math.cos(theta);
      const y = (major + minor * Math.cos(phi)) * Math.sin(theta);
      const z = minor * Math.sin(phi);
      points.push({ x, y, z });
    }
    return points;
  }

  unfoldDaliCross() {
    const mask = this.daliCross();
    const points = [];
    for (let bit = 0; bit < 12; bit++) {
      const angle = (bit / 12) * 2 * Math.PI - Math.PI / 2;
      const active = (mask & (1 << bit)) !== 0;
      const rad = active ? 1.0 : 0.45;
      points.push({
        x: rad * Math.cos(angle),
        y: rad * Math.sin(angle),
        z: active ? 0.15 : 0,
        bit,
        active
      });
    }
    return points;
  }
}

function project2D(p, mode) {
  if (mode === 'iso' || mode === '2.5d') {
    // isometric-ish
    return { x: p.x - p.z * 0.5, y: p.y * 0.866 + p.z * 0.5 };
  }
  // perspective for 3d-ish canvas
  if (mode === 'persp' || mode === '3d') {
    const d = 2.5;
    const z = p.z || 0;
    const s = d / (d + z + 1.5);
    return { x: p.x * s, y: p.y * s };
  }
  return { x: p.x, y: p.y };
}

function renderSVG(geometry, target, opts) {
  opts = opts || {};
  const mode = opts.mode || '2d';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '-1.6 -1.6 3.2 3.2');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.background = '#0d0d14';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const d = geometry.map((p, i) => {
    const q = project2D(p, mode);
    return (i === 0 ? 'M' : 'L') + ' ' + q.x.toFixed(4) + ' ' + q.y.toFixed(4);
  }).join(' ') + (opts.close !== false ? ' Z' : '');
  path.setAttribute('d', d);
  path.setAttribute('fill', opts.fill || 'none');
  path.setAttribute('stroke', opts.stroke || '#5b8def');
  path.setAttribute('stroke-width', '0.03');
  svg.appendChild(path);

  geometry.forEach((p) => {
    if (p.active === false) return;
    const q = project2D(p, mode);
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', q.x);
    c.setAttribute('cy', q.y);
    c.setAttribute('r', '0.04');
    c.setAttribute('fill', p.active ? '#6dcea5' : '#5b8def');
    svg.appendChild(c);
  });

  if (target) {
    target.innerHTML = '';
    target.appendChild(svg);
  }
  return svg;
}

function renderCanvas(geometry, target, opts) {
  opts = opts || {};
  const mode = opts.mode || '2.5d';
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0d0d14';
  ctx.fillRect(0, 0, 400, 400);
  ctx.translate(200, 200);
  ctx.scale(120, 120);
  ctx.beginPath();
  geometry.forEach((p, i) => {
    const q = project2D(p, mode);
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  });
  if (opts.close !== false) ctx.closePath();
  ctx.strokeStyle = '#5b8def';
  ctx.lineWidth = 0.025;
  ctx.stroke();
  geometry.forEach((p) => {
    const q = project2D(p, mode);
    ctx.beginPath();
    ctx.arc(q.x, q.y, 0.04, 0, Math.PI * 2);
    ctx.fillStyle = p.active ? '#6dcea5' : '#5b8def';
    ctx.fill();
  });
  if (target) {
    target.innerHTML = '';
    target.appendChild(canvas);
  }
  return canvas;
}

function renderWebGL(geometry, target) {
  // Lightweight WebGL point/line renderer
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    return renderCanvas(geometry, target, { mode: '3d' });
  }
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, 'attribute vec3 a; void main(){ gl_Position=vec4(a.xy*0.7, a.z*0.3, 1.0); gl_PointSize=4.0; }');
  gl.compileShader(vs);
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, 'precision mediump float; void main(){ gl_FragColor=vec4(0.36,0.55,0.94,1.0); }');
  gl.compileShader(fs);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const verts = new Float32Array(geometry.length * 3);
  geometry.forEach((p, i) => {
    verts[i * 3] = p.x;
    verts[i * 3 + 1] = p.y;
    verts[i * 3 + 2] = p.z || 0;
  });
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  gl.clearColor(0.05, 0.05, 0.08, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINE_LOOP, 0, geometry.length);
  gl.drawArrays(gl.POINTS, 0, geometry.length);
  if (target) {
    target.innerHTML = '';
    target.appendChild(canvas);
  }
  return canvas;
}

function renderAudio(geometry, target) {
  // Map geometry centroid to PannerNode-like readout (no autoplay required)
  let sx = 0, sy = 0, sz = 0;
  geometry.forEach((p) => {
    sx += p.x; sy += p.y; sz += (p.z || 0);
  });
  const n = Math.max(geometry.length, 1);
  const pos = { x: sx / n, y: sy / n, z: sz / n };
  const el = document.createElement('div');
  el.style.cssText = 'color:#6dcea5;font-size:12px;padding:1rem;font-family:monospace';
  el.textContent = 'PannerNode position ≈ (' +
    pos.x.toFixed(3) + ', ' + pos.y.toFixed(3) + ', ' + pos.z.toFixed(3) + ')';
  if (target) {
    target.innerHTML = '';
    target.appendChild(el);
  }
  // Optional: create silent AudioContext panner for API parity
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !window.__OMI_AC__) window.__OMI_AC__ = new AC();
    if (window.__OMI_AC__) {
      const panner = window.__OMI_AC__.createPanner();
      panner.panningModel = 'HRTF';
      if (panner.positionX) {
        panner.positionX.value = pos.x;
        panner.positionY.value = pos.y;
        panner.positionZ.value = pos.z;
      } else if (panner.setPosition) {
        panner.setPosition(pos.x, pos.y, pos.z);
      }
      window.__OMI_PANNER__ = panner;
    }
  } catch (_) { /* ignore */ }
  return el;
}

function renderProto(proto, geometry, target, opts) {
  switch (proto) {
    case 'svg': return renderSVG(geometry, target, opts);
    case 'canvas': return renderCanvas(geometry, target, opts);
    case 'webgl': return renderWebGL(geometry, target, opts);
    case 'audio': return renderAudio(geometry, target, opts);
    default: return renderSVG(geometry, target, opts);
  }
}

class GenesisScheduler {
  constructor(knot, container) {
    this.knot = knot;
    this.container = container;
    this.cues = [];
    this.currentCue = 0;
    this.startTime = 0;
    this.playing = false;
    this.raf = null;
    this.onCue = null;
  }

  addCue(cue) {
    this.cues.push(cue);
  }

  play() {
    this.startTime = performance.now() / 1000;
    this.currentCue = 0;
    this.playing = true;
    const tick = () => {
      if (!this.playing) return;
      const now = performance.now() / 1000 - this.startTime;
      while (this.currentCue < this.cues.length && this.cues[this.currentCue].end < now) {
        this.currentCue++;
      }
      if (this.currentCue < this.cues.length) {
        const cue = this.cues[this.currentCue];
        if (cue.start <= now && now <= cue.end) {
          this.renderCue(cue);
          if (this.onCue) this.onCue(cue, this.currentCue);
        }
      } else {
        this.playing = false;
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.playing = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  renderCue(cue) {
    const geometry = cue.fold === 'torus'
      ? this.knot.foldTorus()
      : this.knot.unfoldDaliCross();
    renderProto(cue.proto || 'svg', geometry, this.container, {
      mode: cue.proto === 'canvas' ? '2.5d' : (cue.proto === 'webgl' ? '3d' : '2d')
    });
  }
}

function cuesToWebVTT(cues) {
  const lines = ['WEBVTT', '', 'NOTE OMI-IMO genesis fold/proto timeline', ''];
  cues.forEach((c, i) => {
    const pad = (n) => String(Math.floor(n)).padStart(2, '0');
    const ts = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return pad(h) + ':' + pad(m) + ':' + pad(Math.floor(sec)) + '.' +
        String(Math.round((sec % 1) * 1000)).padStart(3, '0');
    };
    lines.push(String(i + 1));
    lines.push(ts(c.start) + ' --> ' + ts(c.end));
    lines.push(JSON.stringify({ fold: c.fold, proto: c.proto, chapter: c.chapter }));
    lines.push('');
  });
  return lines.join('\n');
}

function createInteractiveGenesis(container, opts) {
  opts = opts || {};
  const seed = opts.ruler || [65, 80, 53, 48, 97, 112, 3, 4, 5, 12, 13, 0, 0, 0, 0, 0];
  const knot = new Knot(seed);
  const scheduler = new GenesisScheduler(knot, container);
  for (let i = 0; i < 23; i++) {
    scheduler.addCue({
      start: i * 1.0,
      end: (i + 1) * 1.0,
      fold: i % 2 === 0 ? 'torus' : 'dali-cross',
      proto: ['svg', 'canvas', 'webgl'][i % 3],
      chapter: i + 1
    });
  }
  return {
    knot,
    scheduler,
    vtt: cuesToWebVTT(scheduler.cues),
    render: (fold, proto) => {
      const geometry = fold === 'torus' ? knot.foldTorus() : knot.unfoldDaliCross();
      renderProto(proto || 'svg', geometry, container, {
        mode: proto === 'canvas' ? '2.5d' : (proto === 'webgl' ? '3d' : '2d')
      });
      return geometry;
    }
  };
}

// UMD-ish export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Knot, renderProto, renderSVG, renderCanvas, renderWebGL, renderAudio,
    GenesisScheduler, createInteractiveGenesis, cuesToWebVTT
  };
}
if (typeof window !== 'undefined') {
  window.OMIGenesis = {
    Knot, renderProto, createInteractiveGenesis, cuesToWebVTT, GenesisScheduler
  };
}
