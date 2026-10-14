/**
 * OMI-IMO Living Universe — popup book
 *
 * Movement comes from exactly ONE place: the delta law. The epoch advances
 * only via Atomics.compareExchange on the shared substrate. This page never
 * uses a time-based clock for state: the spin of the cone, the lattice growth
 * and the cue pages are all pure functions of epoch. requestAnimationFrame
 * only repaints the same deterministic state — it never advances it.
 *
 * Lattice growth (Steiner triples):
 *   day = epoch >>> 4            (16 = 2⁴ deltas per day — the fractal factor)
 *   each day adds 1 Steiner triple → 2 new connections (edges) + 1 new vertex.
 *   new vertex z = x ^ y of the two newest vertices, so x ^ y ^ z = 0 — the
 *   global fold stays 0x0000 forever: the 0-attractor sheds what it doesn't
 *   need to hold. Golden-ratio cone: each new vertex sits on a spiral that
 *   expands the cone day by day by φ.
 */
'use strict';

(function () {
  const EPSILON = 0.000001;
  const PHI = (1 + Math.sqrt(5)) / 2;

  const canvas = document.getElementById('universe');
  const ctx = canvas.getContext('2d');

  let epoch = 0;
  let cues = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Geometry: deterministic lattice = pure function of epoch ----------

  const SEED_IDS = [0x1c, 0x1d, 0x1e, 0x1f];
  const SEED_POS = [
    [0.0, 0.9, 0.0],
    [-0.8, -0.3, 0.5],
    [0.8, -0.3, 0.5],
    [0.0, -0.3, -0.7]
  ];

  /**
   * Build vertices + edges at a given epoch. No stored state: everything is
   * derived from epoch alone, so every terminal sees the identical lattice.
   */
  function lattice(ep) {
    const day = Math.floor(ep / 16);
    const N = 4 + day; // one new vertex per day
    const ids = SEED_IDS.slice(0, 4);
    const pos = SEED_POS.map((p) => p.slice());

    for (let d = 1; d <= day; d++) {
      // Steiner triple law: z = x ^ y keeps x^y^z = 0.
      const x = ids[ids.length - 1];
      const y = ids[ids.length - 2];
      const z = (x ^ y) >>> 0;
      ids.push(z);

      // golden-ratio spiral on an expanding cone
      const theta = (d - 1) * 2 * Math.PI / PHI;
      const r = 0.35 + d * 0.22;
      const h = 0.25 + d * 0.42;
      pos.push([r * Math.cos(theta), h, r * Math.sin(theta)]);
    }

    const edges = [];
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) edges.push([i, j]);
    }
    for (let d = 1; d <= day; d++) {
      // two new connections per day: x-z and y-z
      edges.push([d + 2, d + 3]); // x-z
      edges.push([d + 1, d + 3]); // y-z
    }

    return { ids, pos, edges, day, N };
  }

  // ---------- 3D projection (canvas 2D, zero deps) ----------

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

  function hueOf(id) {
    const h = ((id % 360) + 360) % 360;
    return `hsl(${h} 70% 60%)`;
  }

  // ---------- Render: spin is f(epoch), not a clock ----------

  function render(ep) {
    const L = lattice(ep);
    const spin = (ep % 360) * Math.PI / 180; // one full DIDO turn per 360 deltas
    const scale = Math.min(canvas.width, canvas.height) * 0.9;
    const cy = canvas.height * 0.46;

    ctx.fillStyle = '#06070b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const P = project(L.pos, spin, scale, cy);

    // cone day-rungs (subtle)
    ctx.strokeStyle = 'rgba(92,140,255,0.08)';
    for (let i = 1; i <= L.day; i++) {
      const a = i * Math.floor(360 / (L.day + 1)) % 360 * Math.PI / 180;
      const r = (0.35 + i * 0.22) * scale * 0.32;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, cy + 6, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // edges
    for (const [a, b] of L.edges) {
      const pa = P[a], pb = P[b];
      if (!pa || !pb) continue;
      ctx.strokeStyle = 'rgba(92,140,255,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();

      // golden twist: a soft highlight on alternating edges
      if ((a + b) % 5 === 0) {
        ctx.strokeStyle = 'rgba(255,209,102,0.14)';
        ctx.stroke();
      }
    }

    // vertices
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      const active = i >= 4 ? i === P.length - 1 : true;
      const rad = active ? 3.4 : 2.4;
      ctx.beginPath();
      ctx.arc(p[0], p[1], rad * p[2], 0, Math.PI * 2);
      ctx.fillStyle = i < 4 ? '#ff5c8a' : hueOf(L.ids[i]);
      ctx.fill();
      if (i < 4) {
        ctx.strokeStyle = 'rgba(255,92,138,0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // equator through the tetra (fold magnet)
    ctx.strokeStyle = 'rgba(255,209,102,0.20)';
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.18, cy + 6);
    ctx.lineTo(canvas.width * 0.82, cy + 6);
    ctx.stroke();
    ctx.setLineDash([]);

    // HUD
    const foldId = SEED_IDS.reduce((a, b) => (a ^ b) >>> 0, 0);
    document.getElementById('epoch').textContent = ep;
    document.getElementById('fold').textContent = '0x' + (foldId & 0xFFFF).toString(16).padStart(4, '0');
    document.getElementById('day').textContent = L.day;
    document.getElementById('triples').textContent = L.day;
    document.getElementById('vertices').textContent = L.N;
  }

  // ---------- Popup book: cues on VTT tracks from media queries ----------

  function slotOf(cue) {
    // a cue's delta slot is deterministic from its id
    return (Math.abs(cue.id || 0) % 720) * 2;
  }

  function renderCues() {
    const book = document.getElementById('book');
    book.innerHTML = '';
    for (const cue of cues) {
      const el = document.createElement('div');
      el.className = 'page';
      el.dataset.cue = cue.id;
      el.innerHTML =
        `<div class="name">${escapeHtml(cue.name)}</div>` +
        `<div class="media">${escapeHtml(cue.media)}</div>` +
        `<div class="text">${escapeHtml(cue.text)}</div>`;
      book.appendChild(el);
    }
    refreshCuePopState();
  }

  function cueMatchesMedia(cue) {
    try {
      const mq = cue.media || '';
      if (!mq) return true;
      return window.matchMedia(mq).matches;
    } catch (_) {
      return true;
    }
  }

  function refreshCuePopState() {
    for (const cue of cues) {
      const el = document.querySelector(`[data-cue="${cue.id}"]`);
      if (!el) continue;
      const onSlot = epoch >= slotOf(cue);
      const onMedia = cueMatchesMedia(cue);
      el.classList.toggle('pop', onSlot && onMedia);
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- Cue API ----------

  function refreshCues() {
    fetch('/api/cues')
      .then((r) => r.json())
      .then((j) => {
        cues = (j && j.cues) || [];
        renderCues();
      })
      .catch(() => {});
  }

  function bindAdd() {
    const nameEl = document.getElementById('c-name');
    const mediaEl = document.getElementById('c-media');
    const textEl = document.getElementById('c-text');
    document.getElementById('c-add').addEventListener('click', () => {
      const name = nameEl.value.trim() || 'fact.' + (epoch);
      const media = mediaEl.value.trim();
      const text = textEl.value.trim() || 'xor';
      fetch('/api/cues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, media, text })
      })
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) {
            epoch = j.epoch; // the delta that the cue brought
            refreshCues();
            nameEl.value = '';
          }
        })
        .catch(() => {});
    });
  }

  // ---------- Delta stream: the ONLY mover ----------

  function openStream() {
    fetch('/api/substrate')
      .then((r) => r.json())
      .then((j) => {
        if (j && typeof j.epoch === 'number') {
          epoch = j.epoch;
          render(epoch);
          refreshCuePopState();
        }
      })
      .catch(() => {});

    const es = new EventSource('/events');
    es.addEventListener('omi', (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (typeof d.epoch === 'number') {
          epoch = d.epoch;
          render(epoch);
          refreshCuePopState();
        }
      } catch (_) {}
    });
    es.onopen = () => render(epoch);
  }

  // ---------- Paint loop (repaint only — state never advances here) ----------

  function paint() {
    render(epoch);
    requestAnimationFrame(paint);
  }

  // media-query live switching (e.g. resize/devtools)
  window.addEventListener('change', refreshCuePopState);

  renderCues();
  bindAdd();
  refreshCues();
  openStream();
  paint();
})();