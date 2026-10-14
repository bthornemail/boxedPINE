/**
 * portal.js — the DOM portal.
 *
 * It loads the real shared/peers.js and shared/declare.js over /shared/* and
 * runs them as they are. It deliberately does NOT re-implement the engine in
 * the page: the thing being demonstrated is the tested code, so a copy here
 * would be a different thing wearing the same name.
 *
 * There is no server, no clock and no state in this file. Every state change
 * goes through Atomics.compareExchange inside peers.js. Nothing here holds a
 * copy of the truth; it only renders what the XOR says.
 *
 * The first screen is the whole argument, in two clicks: "carol goes offline"
 * and "roll back". The declarative panel is below it, because it is real but it
 * is not the front door.
 *
 * 'use strict';
 */

(function () {
  // ---- the smallest CommonJS loader that can resolve peers.js -> ./peers.js
  const cache = Object.create(null);
  async function loadModule(path) {
    if (cache[path]) return cache[path].exports;
    const res = await fetch(path);
    if (!res.ok) throw new Error('cannot load ' + path);
    const src = await res.text();
    const mod = { exports: {} };
    cache[path] = mod;
    const dir = path.slice(0, path.lastIndexOf('/') + 1);
    const req = (spec) => {
      const target = dir + spec.replace(/^\.\//, '');
      if (cache[target]) return cache[target].exports;
      throw new Error('module not preloaded: ' + spec);
    };
    // eslint-disable-next-line no-new-func
    new Function('require', 'module', 'exports', src)(req, mod, mod.exports);
    return mod.exports;
  }

  let P = null;   // shared/peers.js
  let D = null;   // shared/declare.js
  const A = { peer: null, id: 'a' };
  const B = { peer: null, id: 'b' };
  const C = { peer: null, id: 'c' };
  let lastFold = null;

  const $ = (id) => document.getElementById(id);
  const hex = (v) => '0x' + (v >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const el = {};
  const slots = {};

  function bindSlots() {
    const ids = ['A', 'B', 'C'];
    ids.forEach((id, i) => {
      const s = [A, B, C][i];
      slots[id] = {
        peerBox: $('p' + id), word: $('w' + id), bytes: $('b' + id),
        input: $('e' + id), off: $('off' + id), mode: $('m' + id),
      };
      slots[id].tag = id === 'C' ? $('tC') : null;
      s.slot = slots[id];
    });
  }

  function byteBoxes(container, value, hot) {
    container.innerHTML = '';
    for (let k = 3; k >= 0; k--) {
      const b = (value >>> (8 * k)) & 0xff;
      const d = document.createElement('div');
      d.className = 'byte' + (hot && hot.has(k) ? ' hot' : '');
      d.textContent = b.toString(16).toUpperCase().padStart(2, '0');
      container.appendChild(d);
    }
  }

  function say(msg, cls) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = msg;
    el.log.appendChild(d);
    el.log.scrollTop = el.log.scrollHeight;
  }
  function sayLine(n, tag, body, cls) {
    say('<span class="ln">' + String(n).padStart(2, '0') + '  ' + tag + '</span>  ' + body, cls);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function fromInput(peer, input) {
    const t = input.value.trim();
    let v;
    if (/^0x[0-9a-f]+$/i.test(t)) v = parseInt(t.slice(2), 16);
    else if (/^0b[01]+$/i.test(t)) v = parseInt(t.slice(2), 2);
    else if (/^0o[0-7]+$/i.test(t)) v = parseInt(t.slice(2), 8);
    else if (/^[0-9a-f]+$/i.test(t) && /[a-f]/i.test(t)) v = parseInt(t, 16);
    else v = parseInt(t, 10);
    if (!Number.isFinite(v)) return null;
    input.value = hex(v);
    return v >>> 0;
  }

  // ---- render. The page only draws what the XOR says.
  function render() {
    const f = P.fold3(A.peer, B.peer, C.peer);
    [A, B, C].forEach((s, i) => {
      const id = ['A', 'B', 'C'][i];
      const sl = slots[id];
      const v = s.peer.read();
      sl.word.textContent = hex(v);
      const hot = new Set();
      // any pairwise difference involving this peer marks the byte
      [[A, B], [B, C], [A, C]].forEach(([x, y]) => {
        if (x === s || y === s) {
          P.divergence(x.peer, y.peer).bytes.forEach((d) => hot.add(d.byte));
        }
      });
      byteBoxes(sl.bytes, v, hot.size ? hot : null);
      sl.peerBox.classList.toggle('off', !!s.peer.offline);
      sl.mode.textContent = s.peer.mode;
      const isOut = !f.agreed && f.outliers.indexOf(s.id) !== -1;
      sl.peerBox.classList.toggle('out', isOut);
      if (sl.tag) {
        sl.tag.className = 'tag' + (isOut ? ' out' : '');
        sl.tag.textContent = isOut ? 'outlier' : '';
      }
    });

    el.num.textContent = String(f.disagreement);
    el.num.className = 'num ' + (f.agreed ? 'agreed' : (f.hasMajority ? 'diverged' : 'stalled'));
    el.readBox.classList.toggle('agreed', f.agreed);
    el.readBox.classList.toggle('stalled', !f.agreed && !f.hasMajority);

    if (f.agreed) {
      el.outlier.className = 'outlier';
      el.outlier.innerHTML = 'all three agree — every pairwise distance is 0. '
        + '<span class="mode">the fold is not the test: three copies of x fold to x, not to 0, because three is odd.</span>';
    } else if (!f.hasMajority) {
      el.outlier.className = 'outlier hit';
      el.outlier.innerHTML = '<b>no majority.</b> three different values, so there is nothing to roll toward. '
        + 'refusing rather than picking a winner. residue ' + hex(f.residue) + '.';
    } else {
      const who = f.outliers.length === 1 ? f.outliers[0] : f.outliers.join(', ');
      const name = { a: 'alice', b: 'bob', c: 'carol' }[who] || who;
      el.outlier.className = 'outlier hit';
      el.outlier.innerHTML = f.residueIsOutlier
        ? 'the outlier is <b>' + name + '</b> — and the fold <b>' + hex(f.residue) + '</b> <b>is</b> '
          + name + '’s value. one XOR named the dissenter. no vote, no quorum.'
        : 'majority is ' + hex(f.majority) + ' (held by ' + f.majorityCount + '); out: <b>' + name + '</b>.';
    }
    return f;
  }

  // ---- the two clicks.
  function splitOne() {
    // Alice and Bob stay in sync. Carol goes offline and edits. Two agree, one
    // does not, so the fold IS the outlier.
    C.peer.offline = true;
    C.peer.write((C.peer.read() ^ 0x00000003) >>> 0);
    slots.C.input.value = hex(C.peer.read());
    C.peer.offline = false;
    slots.C.off.checked = false;
    lastFold = null;
    const f = render();
    sayLine(0, 'split', 'carol went offline and changed. alice and bob never moved. '
      + 'carol is <b>' + hex(C.peer.read()) + '</b>.', 'warn');
    if (f.residueIsOutlier) {
      sayLine(0, 'read', 'residue ' + hex(f.residue) + ' — that is exactly carol’s value. '
        + 'the outlier named itself, from one XOR.', 'warn');
    }
  }

  function splitAll() {
    // Three different values: no majority, and the honest answer is to refuse.
    [[A, 0x11111111], [B, 0x22222222], [C, 0x44444444]].forEach(([s, v]) => {
      s.peer.offline = true;
      s.peer.write(v);
      s.slot.input.value = hex(v);
      s.peer.offline = false;
      s.slot.off.checked = false;
    });
    lastFold = null;
    render();
    sayLine(0, 'split', 'all three changed, all differently. there is no majority, '
      + 'so there is nothing to roll toward.', 'warn');
    sayLine(0, 'read', 'refused. it will not pick a winner for you.', 'warn');
  }

  function roll() {
    const r = P.reconcile3(A.peer, B.peer, C.peer, lastFold);
    if (r.fold.agreed) {
      sayLine(0, 'roll', 'nothing to do — already agreeing', 'ok');
    } else if (r.stalled && !r.fold.hasMajority) {
      sayLine(0, 'roll', 'refused: no majority. three-way disagreement cannot be repaired by XOR alone.', 'bad');
    } else if (r.stalled) {
      sayLine(0, 'roll', 'clobbered: a peer moved between the read and the roll. '
        + '<b>not overwritten.</b>', 'bad');
    } else {
      const who = r.fold.outliers.join(', ');
      sayLine(0, 'roll', 'rolled ' + who + ' to the majority ' + hex(r.fold.majority)
        + ' — the displacement was already measured.  <b>AGREEMENT</b>', 'ok');
    }
    lastFold = null;
    render();
  }

  function doBind() {
    const f = P.bind021(A.peer.view);
    const what = { 0: 'the origin', 2: 'the offset', 1: 'the unit' }[f.classified];
    el.bindOut.innerHTML = 'centre ' + f.hex + ' → <b>' + f.classified + '</b> — ' + what;
    sayLine(0, 'bind', '0, 2, 1 — three possibilities, extremes first. centre ' + f.hex
      + ' → is this <b>' + f.classified + '</b>? (' + what + ')', 'ok');
  }

  function doReset() {
    [A, B, C].forEach((s) => {
      s.peer.reset();
      s.peer.offline = false;
      s.slot.input.value = '0x00000000';
      s.slot.off.checked = false;
    });
    lastFold = null;
    el.bindOut.innerHTML = '&nbsp;';
    render();
    sayLine(0, 'reset', 'all three zeroed.', 'ok');
  }

  // ---- declarative panel
  const DEMO = [
    '# three peers, no server, no clock',
    'peer alice 0x0',
    'peer bob   0x0',
    'peer carol 0x0',
    'link alice bob',
    'read alice bob carol',
    '',
    '# carol goes offline and edits. alice and bob do not.',
    'offline carol',
    'edit carol 0x00000009',
    'online carol',
    'read alice bob carol',
    '',
    '# the fold IS carol. one XOR, no vote, no quorum.',
    'roll alice bob carol',
    'read alice bob carol',
    '',
    '# is this 0, 1, or 2?',
    'bind',
  ].join('\n');

  function doRun() {
    el.log.innerHTML = '';
    let out;
    try {
      out = D.run(el.src.value);
    } catch (e) {
      const c = e.coordinate || {};
      sayLine(c.line || 0, 'refused', '<span class="bad">' + esc(e.message) + '</span>'
        + (c.source ? '  <span class="ln">at: ' + esc(c.source) + '</span>' : ''), 'bad');
      return;
    }
    for (const entry of out.log) {
      const r = entry.result;
      let body = '', cls = 'ok';
      switch (entry.op) {
        case 'peer': body = r.name + ' seeded ' + (r.seed ? hex(r.seed) : '0x00000000') + '  [' + r.mode + ']'; break;
        case 'link': body = r.from + ' → ' + r.to; break;
        case 'offline': case 'online': body = r.name + (r.offline ? ' offline' : ' online'); break;
        case 'edit': case 'tamper': body = r.name + ' = ' + r.hex; break;
        case 'read':
          if (r.names) {
            // three peers: the fold is not the test, the pairwise sum is
            body = r.agreed
              ? 'all three agree. the fold is not the test: three copies of x fold to x, not to 0.'
              : 'disagreement ' + r.disagreement + ' bits  residue ' + r.residue
                + (r.hasMajority
                  ? '  majority ' + r.majority + ' (×' + r.majorityCount + ')  <b>out: ' + r.outliers.join(', ') + '</b>'
                  : '  <b>no majority</b>')
                + (r.residueIsOutlier ? '  ← the fold <b>is</b> the outlier' : '');
            cls = r.agreed ? 'ok' : 'warn';
          } else {
            body = 'xor ' + (r.agreed ? '0x00000000' : r.hex) + '  popcount ' + r.popcount
              + (r.agreed ? '  <b>AGREEMENT</b>' : '  bytes: ' + r.bytes.map((x) => x.byte + ':' + x.hex).join(' '));
            cls = r.agreed ? 'ok' : 'warn';
          }
          break;
        case 'roll':
          if (r.names) {
            body = r.moved ? 'rolled ' + r.outliers.join(', ') + ' to the majority ' + r.majority + '  <b>AGREEMENT</b>'
              : (r.noMajority
                ? '<b>refused</b>: no majority. three-way disagreement cannot be repaired by XOR alone.'
                : '<b>clobbered</b>, not overwritten — a peer moved between the read and the roll');
            cls = r.moved ? 'ok' : (r.noMajority ? 'bad' : 'bad');
          } else {
            body = r.moved ? 'repaired — ' + r.before + ' → ' + r.after
              : (r.clobbered ? '<b>clobbered</b>, not overwritten' : 'already agreeing');
            cls = r.moved ? 'ok' : (r.clobbered ? 'bad' : 'ok');
          }
          break;
        case 'witness':
          body = r.name + '  state ' + r.state + '  attested ' + r.attested + '  fold ' + r.fold
            + (r.intact ? '' : '  <b>tampered</b>');
          cls = r.intact ? 'ok' : 'bad';
          break;
        case 'bind': body = '0, 2, 1 → centre ' + r.hex + '  is this <b>' + r.classified + '</b>?'; break;
        case 'reset': body = 'cleared'; break;
        default: body = JSON.stringify(r);
      }
      sayLine(entry.line, entry.op, body, cls);
    }
  }

  // ---- boot
  async function boot() {
    P = await loadModule('/shared/peers.js');
    D = await loadModule('/shared/declare.js');

    bindSlots();
    for (const s of [A, B, C]) {
      s.peer = P.createPeer({ name: { a: 'alice', b: 'bob', c: 'carol' }[s.id], cells: 1 });
    }

    ['num', 'readBox', 'outlier', 'log', 'src', 'modeLine', 'bindOut'].forEach((k) => { el[k] = $(k); });

    el.modeLine.textContent = 'memory: ' + A.peer.mode
      + (A.peer.shared
        ? ' — SharedArrayBuffer present; Atomics.compareExchange is atomic across the peer boundary.'
        : ' — no SharedArrayBuffer, so compareExchange is local-only. Same arithmetic, no atomicity guarantee.');

    $('btnSplitOne').onclick = splitOne;
    $('btnSplitAll').onclick = splitAll;
    $('btnRoll').onclick = roll;
    $('btnBind').onclick = doBind;
    $('btnReset').onclick = doReset;
    $('btnRun').onclick = doRun;
    $('btnDemo').onclick = () => { el.src.value = DEMO; doRun(); };

    [A, B, C].forEach((s) => {
      s.slot.input.addEventListener('change', () => {
        const v = fromInput(s.peer, s.slot.input);
        if (v === null) { s.slot.input.value = hex(s.peer.read()); return; }
        s.peer.write(v);
        lastFold = null;
        render();
      });
      s.slot.off.addEventListener('change', () => {
        s.peer.offline = s.slot.off.checked;
        render();
      });
    });

    el.src.value = DEMO;
    render();
    sayLine(0, 'ready', 'three peers, no server. press <b>carol goes offline</b>, then <b>roll back</b>.', 'ok');
  }

  boot().catch((e) => {
    document.body.insertAdjacentHTML('afterbegin',
      '<pre style="color:#f87171;padding:20px">portal failed to boot: ' + esc(e.message) + '</pre>');
  });
})();
