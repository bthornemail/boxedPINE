/**
 * OMI-IMO Walkthrough Wiki Player
 * Data-driven player for /wiki. Fetches /api/wiki (live meta-compile), renders
 * each chapter's story / build steps / breadboard canvas-as-SVG / netlist /
 * cues and gates. Sets data-omi-chapter / data-omi-mask / data-omi-state on
 * document.body. Completion of the final chapter enables the meta-compiled
 * bundle download.
 *
 * Style: plain browser JS, 'use strict', no dependencies.
 */
(function () {
  'use strict';

  var FACES = ['BOOT0', 'BOOT1', 'SECURE', 'USER'];
  var COLS = {
    '0': '#888',
    '1': '#3c78c0',
    '2': '#a64d2d',
    '3': '#276432',
    '4': '#6a4fb0',
    '5': '#b8860b',
    '6': '#2b8cbe',
    '7': '#4a4a4a'
  };
  var STATE_DONE = 'done';
  var STATE_LOCKED = 'locked';
  var state = { bundle: null, active: null, done: {}, stepOpen: {}, a: 0, b: 0 };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  function init() {
    fetch('/api/wiki')
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function (err) {
        document.getElementById('main').textContent = 'failed to load /api/wiki: ' + (err && err.message ? err.message : err);
      });
  }

  function render(bundle) {
    state.bundle = bundle;
    document.body.setAttribute('data-omi-state', 'started');
    renderNav();
    var ch = bundle.index && bundle.index[0];
    if (ch) openChapter(ch.n);
    updateProgress();
  }

  function renderNav() {
    var nav = document.getElementById('chapters-nav');
    clear(nav);
    state.bundle.index.forEach(function (ch) {
      var b = el('button', '', null);
      b.setAttribute('data-chapter', ch.n);
      var led = ch.led || '';
      var tag = ch.face ? escapeHtml(ch.face) : (ch.role || '');
      b.appendChild(document.createTextNode(
        'cn-' + String(ch.n).padStart(2, '0') + '  ' + (ch.name || ch.id)));
      var t = el('span', 'tag', tag);
      b.appendChild(t);
      if (state.done[ch.n]) b.classList.add(STATE_DONE);
      if (state.active === ch.n) b.classList.add('active');
      b.addEventListener('click', function () { openChapter(ch.n); });
      nav.appendChild(b);
    });
  }

  function currentChapter() {
    var ch = state.bundle.index[state.active];
    return state.bundle.chapters.find(function (c) { return c.n === state.active; }) || ch;
  }

  function openChapter(n) {
    state.active = n;
    var ch = currentChapter();
    document.body.setAttribute('data-omi-chapter', ch.id);
    document.body.setAttribute('data-omi-mask', ch.mask ? '0x' + num4(ch.mask) : '0x0000');
    renderNav();
    renderChapter(ch);
  }

  function renderChapter(ch) {
    var main = document.getElementById('main');
    clear(main);

    var h1 = el('h1', null, escapeHtml(ch.name));
    main.appendChild(h1);

    var meta = el('div', 'meta');
    meta.appendChild(el('span', null, 'role <b>' + (ch.role || '—') + '</b>'));
    if (ch.face) meta.appendChild(el('span', null, 'face <b>' + ch.face + '</b>'));
    if (ch.led) meta.appendChild(el('span', null, 'led <b>' + escapeHtml(String(ch.led).toUpperCase()) + '</b>'));
    meta.appendChild(el('span', null, 'mask <b>0x' + num4(ch.mask) + '</b>'));
    meta.appendChild(el('span', null, 'variant <b>' + (ch.circuit && ch.circuit.variant ? ch.circuit.variant : '—') + '</b>'));
    if (ch.circuit && ch.circuit.transistors) {
      meta.appendChild(el('span', null, 'transistors <b>' + ch.circuit.transistors + 't</b>'));
    }
    if (ch.circuit && ch.circuit.fanOut) {
      meta.appendChild(el('span', null, 'fan-out <b>' + escapeHtml(String(ch.circuit.fanOut)) + '</b>'));
    }
    main.appendChild(meta);

    var story = el('div', 'story');
    (ch.story || []).forEach(function (p) {
      story.appendChild(el('p', null, escapeHtml(p)));
    });
    main.appendChild(story);

    if (ch.principles && ch.principles.length) {
      var ul = el('ul', 'principles');
      ch.principles.forEach(function (p) { ul.appendChild(el('li', null, escapeHtml(p))); });
      main.appendChild(ul);
    }

    var panel = el('div', 'panel');

    // Canvas (breadboard as SVG)
    var left = el('div', 'card');
    left.appendChild(el('h2', null, 'breadboard'));
    var svg = renderCanvas(ch);
    left.appendChild(svg);
    panel.appendChild(left);

    // Build steps + netlist
    var right = el('div', 'card');
    right.appendChild(el('h2', null, 'build'));
    var build = renderBuild(ch);
    right.appendChild(build);
    if (ch.probes && Object.keys(ch.probes).length) {
      right.appendChild(el('h2', null, 'probes'));
      var probes = renderProbes(ch);
      right.appendChild(probes);
    }
    panel.appendChild(right);

    main.appendChild(panel);

    // Verification (only for circuit chapters)
    if (ch.verification && ch.verification.length) {
      main.appendChild(renderVerification(ch));
    }

    // Gate / completion readout
    main.appendChild(renderGate());

    // Controls
    var controls = el('div', 'controls');
    var prev = el('button', null, '← previous');
    prev.disabled = ch.n <= 0;
    prev.addEventListener('click', function () { openChapter(Math.max(0, ch.n - 1)); });
    var next = el('button', 'primary', ch.n >= state.bundle.index.length - 1 ? 'finish' : 'next →');
    next.addEventListener('click', function () {
      markDone(ch.n);
      if (ch.n >= state.bundle.index.length - 1) {
        setBodyAttrsDone();
        renderGate();
        renderNav();
      } else {
        openChapter(Math.min(state.bundle.index.length - 1, ch.n + 1));
      }
    });
    controls.appendChild(prev);
    controls.appendChild(next);
    main.appendChild(controls);
  }

  function markDone(n) {
    state.done[n] = true;
    if (n === state.bundle.index.length - 1) state.complete = true;
  }

  function setBodyAttrsDone() {
    document.body.setAttribute('data-omi-state', STATE_DONE);
    var cb = document.body.getAttribute('data-omi-mask') || '0x0000';
    document.body.setAttribute('data-omi-centroid', cb);
  }

  // ---- breadboard layout ----
  var COLW = 16, ROWH = 10, NW = 12, NH = 6;

  function bb(node) {
    // Physical breadboard position → SVG coords. Rows: 1=+5V, 2=collectors,
    // 5=bases, 10=emitters, 15=LED anode, 20=LED cathode→GND.
    var has = node.bRow != null && node.bCol != null;
    if (has) {
      return { x: 10 + node.bCol * COLW, y: 8 + node.bRow * ROWH, w: NW, h: NH };
    }
    return { x: 10 + (node.x != null ? node.x * 2 : 0), y: 8 + (node.y != null ? node.y * 2 : 0), w: NW, h: NH };
  }

  function anchor(pos, side) {
    var x = pos.x + pos.w / 2, y = pos.y + pos.h / 2;
    if (side === 'left') return { x: pos.x, y: y };
    if (side === 'right') return { x: pos.x + pos.w, y: y };
    if (side === 'top') return { x: x, y: pos.y };
    return { x: x, y: pos.y + pos.h }; // bottom
  }

  function routePath(a, fromSide, b, toSide) {
    var p1 = anchor(a, fromSide);
    var p2 = anchor(b, toSide);
    // Orthogonal (Manhattan) path: leave along the source side, enter along target side.
    var vertical1 = (fromSide === 'top' || fromSide === 'bottom');
    if (vertical1) {
      var mid = (p2.x + p1.x) / 2;
      return [p1, { x: mid, y: p1.y }, { x: mid, y: p2.y }, p2];
    }
    var midy = (p2.y + p1.y) / 2;
    return [p1, { x: p1.x, y: midy }, { x: p2.x, y: midy }, p2];
  }

  function renderCanvas(ch) {
    var nodes = (ch.canvas && ch.canvas.nodes) || [];
    var edges = (ch.canvas && ch.canvas.edges) || [];

    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });

    var pos = {};
    var maxX = 0, maxY = 0;
    nodes.forEach(function (n) {
      var p = bb(n);
      pos[n.id] = p;
      maxX = Math.max(maxX, p.x + p.w);
      maxY = Math.max(maxY, p.y + p.h);
    });
    var W = maxX + 18, H = maxY + 18;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'canvas');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    edges.forEach(function (e) {
      var a = byId[e.fromNode], b = byId[e.toNode];
      if (!a || !b) return;
      var path = routePath(pos[e.fromNode], e.fromSide || 'right', pos[e.toNode], e.toSide || 'left');
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      poly.setAttribute('points', path.map(function (p) { return p.x + ',' + p.y; }).join(' '));
      poly.classList.add('edge');
      poly.setAttribute('data-edge', e.id);
      if (e.label && e.label !== 'current limit') poly.setAttribute('data-label', e.label);
      g.appendChild(poly);
      if (e.label && e.label !== 'current limit' && e.label !== 'return') {
        // place label on the midpoint of the longest leg
        var longest = null, li = 0;
        for (var i = 1; i < path.length; i++) {
          var seg = Math.abs(path[i].x - path[i - 1].x) + Math.abs(path[i].y - path[i - 1].y);
          if (!longest || seg > longest) { longest = seg; li = i; }
        }
        var mx = (path[li - 1].x + path[li].x) / 2;
        var my = (path[li - 1].y + path[li].y) / 2;
        var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', mx + 2); t.setAttribute('y', my - 2);
        t.setAttribute('class', 'edge-label');
        t.textContent = e.label;
        g.appendChild(t);
      }
      svg.appendChild(g);
    });

    nodes.forEach(function (n) {
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-node', n.id);
      var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', pos[n.id].x); r.setAttribute('y', pos[n.id].y);
      r.setAttribute('width', pos[n.id].w); r.setAttribute('height', pos[n.id].h);
      r.setAttribute('rx', 2); r.setAttribute('ry', 2);
      r.classList.add('node');
      var fill = COLS[String(n.color || '0')] || '#fff';
      r.setAttribute('fill', fill);
      r.setAttribute('stroke', '#444');
      g.appendChild(r);
      var t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', pos[n.id].x + pos[n.id].w / 2);
      t.setAttribute('y', pos[n.id].y + pos[n.id].h / 2);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'central');
      t.setAttribute('class', 'node-text');
      // rail/led/bus get short labels; transistors keep id + role in title
      var short = n.role === 'transistor' ? (n.text || n.id).split(' ')[0] : (n.text || n.id);
      t.textContent = short;
      var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = n.text || n.id;
      g.appendChild(t);
      g.appendChild(title);
      svg.appendChild(g);
    });
    return svg;
  }

  function renderBuild(ch) {
    var wrap = el('div', 'build');
    var steps = (ch.build && ch.build.length ? ch.build : []).concat(
      (ch.cues || []).map(function (c) {
        return { step: c.payload && c.payload.step, text: c.text, place: [] };
      })
    );
    // dedupe steps occupying same position
    var seen = new Set();
    var uniq = [];
    steps.forEach(function (s) {
      var key = s.step + '\u0000' + s.text;
      if (seen.has(key)) return;
      seen.add(key);
      uniq.push(s);
    });
    uniq.forEach(function (s) {
      var row = el('div', 'step');
      row.setAttribute('data-step', s.step);
      row.appendChild(el('span', 'num', 's' + s.step));
      var t = el('span', null, escapeHtml(s.text));
      row.appendChild(t);
      row.addEventListener('click', function () {
        document.querySelectorAll('.build .step').forEach(function (n) { n.classList.remove('on'); });
        row.classList.add('on');
        highlight(ch, s.place);
      });
      wrap.appendChild(row);
    });
    if (!uniq.length) wrap.appendChild(el('p', null, 'no build steps for this chapter'));
    return wrap;
  }

  function highlight(ch, place) {
    var svg = document.querySelector('svg.canvas');
    if (!svg) return;
    svg.querySelectorAll('.node').forEach(function (n) { n.classList.remove('hot'); });
    svg.querySelectorAll('.edge').forEach(function (n) { n.classList.remove('hot'); });
    (place || []).forEach(function (id) {
      var n = svg.querySelector('[data-node="' + id + '"]');
      if (n) n.classList.add('hot');
    });
  }

  function renderProbes(ch) {
    var wrap = el('div', 'probes');
    var probes = ch.probes || {};
    Object.keys(probes).forEach(function (key) {
      var p = probes[key];
      var row = el('div', 'p');
      var label = key;
      var val = (p && p.value !== undefined) ? '0x' + num4(p.value) : '(breadboard ' + (p && p.row) + ',' + (p && p.col) + ')';
      row.appendChild(el('span', null, label));
      row.appendChild(el('span', 'kbd', val));
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderVerification(ch) {
    var card = el('div', 'card');
    card.appendChild(el('h2', null, 'verification'));
    var table = el('table', 'verify');
    var thead = el('tr', null, '<th>A</th><th>B</th><th>LED</th><th>expected</th>');
    table.appendChild(thead);
    ch.verification.forEach(function (row) {
      var tr = el('tr');
      tr.appendChild(el('td', null, String(row.A)));
      tr.appendChild(el('td', null, String(row.B)));
      tr.appendChild(el('td', null, row.out ? 'on' : 'off'));
      tr.appendChild(el('td', null, visual(ch, row)));
      table.appendChild(tr);
    });
    card.appendChild(table);
    return card;
  }

  function visual(ch, row) {
    // live XOR: recompute from current A/B switches
    var a = row.A, b = row.B;
    var live = computeGate(a, b, ch);
    return (live === row.out ? '✓ ' : '✗ ') + live + ' (XOR)';
  }

  function renderGate() {
    var card = el('div', 'card');
    card.appendChild(el('h2', null, 'centroid gate'));
    var cb = state.bundle.centroid;
    if (!cb) { card.appendChild(el('p', null, 'no centroid in bundle')); return card; }
    var faceLine = FACES.map(function (f) {
      return f + '=0x' + num4(cb.faces[f]);
    }).join(' ^ ');
    var ok = cb.balanced;
    var gate = el('div', 'gate' + (ok ? ' ok' : ''));
    gate.innerHTML = '<code>Centroid = ' + escapeHtml(faceLine) + '</code> &nbsp;= <b>' + cb.xorHex + '</b>' +
      ' — gate <b>' + cb.gateHex + '</b>';
    if (state.complete && ok) {
      gate.innerHTML += ' → <b>0x0000 balanced — walkthrough complete</b>';
      var dl = el('div', 'download' + (state.complete ? '' : ' locked'));
      var a = el('a', 'dl', 'download meta-compiled bundle');
      a.setAttribute('href', '/api/bundle');
      a.setAttribute('download', 'omi-imo-bundle.json');
      dl.appendChild(a);
      card.appendChild(gate);
      card.appendChild(dl);
      return card;
    }
    if (state.complete && !ok) {
      gate.innerHTML += ' → <b>0x0000 not reached</b>';
    }
    card.appendChild(gate);
    return card;
  }

  function computeGate(a, b, ch) {
    if (ch.verification && ch.verification[0] && ch.verification[0].expect === 'xn') {
      return 1 - (a ^ b);
    }
    return a ^ b;
  }

  function updateProgress() {
    var chs = state.bundle.index || [];
    var total = 29;
    var placed = 0;
    chs.forEach(function (c) {
      if (c.circuit && c.circuit.transistors) placed += c.circuit.transistors;
    });
    var done = countDone();
    document.getElementById('progress-label').textContent = placed + 't / ' + total + 't';
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = Math.round((placed / total) * 100) + '%';
    document.getElementById('head-progress').textContent = 'chapters ' + state.bundle.index.length +
      ' · faces ' + Object.keys(state.bundle.faces || {}).length + ' · transistors ' + placed;
  }

  function countDone() {
    return Object.keys(state.done).length;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function num4(v) {
    v = v >>> 0;
    return v.toString(16).padStart(4, '0');
  }

  init();
})();