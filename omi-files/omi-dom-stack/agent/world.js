/**
 * OMI-IMO Agent World — a virtual space for the four agent rods.
 *
 * Four faces (the four seed bytes) own four rods on the Steiner-triple cone
 * lattice. Each agent rod advances on the SAME deterministic lattice that
 * /universe draws — epoch-drive only, never a clock. Clicking an agent
 * declares a fact via /api/cues; that POST applies one delta, which grows the
 * world. The fold (BOOT0 ^ BOOT1 ^ SECURE ^ USER) stays 0x0000 by the same
 * Steiner law z = x ^ y that keeps the lattice closed.
 */
'use strict';

(function () {
  var PHI = (1 + Math.sqrt(5)) / 2;

  var canvas = document.getElementById('world');
  var ctx = canvas.getContext('2d');

  let epoch = 0;

  var AGENTS = [
    { id: 'boot0',  face: 'BOOT0',  mask: 0x1c, variant: '5T',  role: 'bind',   color: '#5c8cff' },
    { id: 'boot1',  face: 'BOOT1',  mask: 0x1d, variant: '6T',  role: 'apply',  color: '#ffd166' },
    { id: 'secure', face: 'SECURE', mask: 0x1e, variant: '8T',  role: 'eval',   color: '#9fd356' },
    { id: 'user',   face: 'USER',   mask: 0x1f, variant: '10T', role: 'digest', color: '#ff5c8a' }
  ];
  var SEED_POS = [
    [0.0, 0.9, 0.0],
    [-0.8, -0.3, 0.5],
    [0.8, -0.3, 0.5],
    [0.0, -0.3, -0.7]
  ];

  function resize() {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
  }
  window.addEventListener('resize', resize);
  resize();

  /**
   * Deterministic lattice: pure function of epoch, same as /universe.
   * Each vertex carries the face index that owns it (0..3), so every agent
   * rod is a line through its own vertices.
   */
  function lattice(ep) {
    const day = Math.floor(ep / 16);
    const ids = [0x1c, 0x1d, 0x1e, 0x1f];
    const pos = SEED_POS.map((p) => p.slice());
    const owner = [0, 1, 2, 3];

    for (let d = 1; d <= day; d++) {
      const x = ids[ids.length - 1];
      const y = ids[ids.length - 2];
      const z = (x ^ y) >>> 0;
      ids.push(z);
      const theta = (d - 1) * 2 * Math.PI / PHI;
      const r = 0.35 + d * 0.22;
      const h = 0.25 + d * 0.42;
      pos.push([r * Math.cos(theta), h, r * Math.sin(theta)]);
      // z attaches to the two newest vertices, both owned by the same agent
      // rod that owns the previous z — hand the new vertex to the rod whose
      // owner is the face of y (the older of the two parents).
      owner.push(owner[owner.length - 2]);
    }

    const edges = [];
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) edges.push([i, j]);
    }
    for (let d = 1; d <= day; d++) {
      edges.push([d + 2, d + 3]);
      edges.push([d + 1, d + 3]);
    }

    return { ids, pos, owner, edges, day, N: 4 + day };
  }

  function project(points, spin, scale, cy) {
    const out = [];
    for (const p of points) {
      const c = Math.cos(spin), s = Math.sin(spin);
      const x1 = p[0] * c - p[2] * s;
      const z1 = p[0] * s + p[2] * c;
      const tilt = 0.42;
      const y1 = p[1] * Math.cos(tilt) - z1 * Math.sin(tilt);
      const z2 = p[1] * Math.sin(tilt) + z1 * Math.cos(tilt);
      const persp = 4.2 / (4.2 + z2);
      out.push([canvas.width / 2 + x1 * scale * persp, cy - y1 * scale * persp, persp]);
    }
    return out;
  }

  // ---------- Render ----------

  function render(ep, lastDeclared) {
    const L = lattice(ep);
    const spin = (ep % 360) * Math.PI / 180;
    const scale = Math.min(canvas.width, canvas.height) * 0.9;
    const cy = canvas.height * 0.44;

    ctx.fillStyle = '#06070b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const P = project(L.pos, spin, scale, cy);

    // subtle day-rungs
    ctx.strokeStyle = 'rgba(92,140,255,0.08)';
    for (let i = 1; i <= L.day; i++) {
      const a = i * Math.floor(360 / (L.day + 1)) % 360 * Math.PI / 180;
      const r = (0.35 + i * 0.22) * scale * 0.32;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, cy + 6, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // lattice edges
    for (const [a, b] of L.edges) {
      const pa = P[a], pb = P[b];
      if (!pa || !pb) continue;
      ctx.strokeStyle = 'rgba(92,140,255,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    }

    // agent rods: the rod = consecutive vertices owned by each face.
    for (let f = 0; f < 4; f++) {
      const me = AGENTS[f];
      const mine = [];
      for (let i = 0; i < L.owner.length; i++) {
        if (L.owner[i] === f) mine.push(i);
      }
      // rod body
      ctx.strokeStyle = me.color;
      ctx.globalAlpha = 0.38;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k < mine.length; k++) {
        const p = P[mine[k]];
        if (k === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // rod head (most recent vertex) halos
      const head = mine[mine.length - 1];
      const hp = P[head];
      if (hp) {
        ctx.beginPath();
        ctx.arc(hp[0], hp[1], 7 * hp[2], 0, Math.PI * 2);
        ctx.strokeStyle = me.color;
        ctx.globalAlpha = 0.25;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(hp[0], hp[1], 4 * hp[2], 0, Math.PI * 2);
        ctx.fillStyle = me.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(223,230,240,0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // label
      const seedP = P[head] || P[f];
      if (seedP) {
        const faceLabel = me.face + ' ' + me.variant;
        ctx.fillStyle = me.color;
        ctx.font = (11 * devicePixelRatio) + 'px "Iosevka", ui-monospace, monospace';
        ctx.fillText(faceLabel, seedP[0] + 10, seedP[1] - 8);
      }
    }

    // equator through the tetra
    ctx.strokeStyle = 'rgba(255,209,102,0.20)';
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.18, cy + 6);
    ctx.lineTo(canvas.width * 0.82, cy + 6);
    ctx.stroke();
    ctx.setLineDash([]);

    // HUD
    const fold = AGENTS.reduce((a, g) => (a ^ g.mask) >>> 0, 0);
    document.getElementById('epoch').textContent = ep;
    document.getElementById('day').textContent = L.day;
    document.getElementById('vertices').textContent = L.N;
    document.getElementById('fold').textContent = '0x' + (fold & 0xFFFF).toString(16).padStart(4, '0');
    document.getElementById('obs').textContent = lastDeclared || '0,0,0';
  }

  // ---------- Roster ----------

  function buildRoster(declareFn) {
    const roster = document.getElementById('roster');
    roster.innerHTML = '';
    for (const g of AGENTS) {
      const el = document.createElement('div');
      el.className = 'ag';
      el.style.borderColor = g.color;
      el.innerHTML =
        `<div class="face">${g.face} · 0x${g.mask.toString(16)}</div>` +
        `<div class="role" style="color:${g.color}">${g.role} — ${g.variant}</div>` +
        `<div class="meta">click to declare from this rod</div>`;
      el.addEventListener('click', () => declareFn(g));
      roster.appendChild(el);
    }
  }

  // ---------- Declare (the only mover: 1 delta per click) ----------

  function bindDeclare() {
    let lastDeclared = '0,0,0';
    buildRoster(function (g) {
      fetch('/api/cues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: g.face.toLowerCase(), media: '', text: 'xor' })
      })
        .then((r) => r.json())
        .then((j) => {
          if (j && typeof j.epoch === 'number') {
            epoch = j.epoch;
            lastDeclared = g.face + ' · media=' + (j.cue && j.cue.media ? j.cue.media : '?');
            render(epoch, lastDeclared);
          }
        })
        .catch(() => {});
    });
    return function () { return lastDeclared; };
  }

  // ---------- Live substrates: epoch only via SSE ----------

  function openStream(getLast) {
    fetch('/api/substrate')
      .then((r) => r.json())
      .then((j) => {
        if (j && typeof j.epoch === 'number') { epoch = j.epoch; render(epoch, getLast()); }
      })
      .catch(() => {});

    const es = new EventSource('/events');
    es.addEventListener('omi', (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (typeof d.epoch === 'number') { epoch = d.epoch; render(epoch, getLast()); }
      } catch (_) {}
    });
    es.onopen = () => render(epoch, getLast());
  }

  // ---------- Paint loop (repaint only) ----------

  let getLast = function () { return '0,0,0'; };
  function paint() {
    render(epoch, getLast());
    requestAnimationFrame(paint);
  }

  getLast = bindDeclare();
  openStream(getLast);
  paint();

  window.OMIWorld = {
    epoch: function () { return epoch; },
    lattice: lattice,
    agents: AGENTS
  };
})();