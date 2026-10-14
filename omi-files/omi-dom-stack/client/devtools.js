/**
 * OMI-IMO DevTools for Media — the protocol's UI
 *
 * Five panels (Google-Keep "DevTools for Media"): observer (0D), worklet
 * ports (128 channels), the ASCII-table canvas, layer assignments (codex),
 * and the VTT timeline. Pipeline is the canonical one:
 *
 *   media → Blob → spectrum → ASCII table → layer assignment → worklet ports
 *
 * Any audio/visual is frame-scaled to 128 ports (8 layers × 16). Each port is
 * one ASCII code 0x00..0x7F held in the shared substrate; the media is ONLY a
 * way to read the attributes — the data itself is never transferred, only its
 * Fourier frame. Clicking a port fuzzes its code (modify); recompose shows the
 * new digest/fold. A transmute worker then proves losslessness on the SAB:
 * compose (audio/video/rgb/mask) → decompose → digests agree.
 */
'use strict';

(function () {
  const DENSITY = ' .:-=+*#%@';
  const LAYERS = [
    { name: 'CONTROL',   dim: -4, color: '#7c6bff' },
    { name: 'SEPARATOR', dim: -3, color: '#4aa3ff' },
    { name: 'DELIMITER', dim: -2, color: '#4be0c8' },
    { name: 'ALPHANUM',  dim: -1, color: '#9fd356' },
    { name: 'OBSERVER',  dim: 0,  color: '#ffd166' },
    { name: 'COORDINATE',dim: 1,  color: '#ff9f1c' },
    { name: 'CHANNEL',   dim: 2,  color: '#ff5c8a' },
    { name: 'REGION',    dim: 3,  color: '#ff3b6b' }
  ];
  const PORT_BINS = 128;
  const FFTSIZE = 1024;
  const HOP = 256;

  const $ = id => document.getElementById(id);
  let ctx = null;        // AudioContext (observer)
  let renderer = null;   // webaudio-renderer (0D PannerNode)
  let audioBuf = null;   // decoded buffer
  let bufferSource = null;
  let ports = new Uint8Array(PORT_BINS);
  let folded = new Uint8Array(PORT_BINS);
  let epoch = 0;

  // ---------- FFT (radix-2, in-place) ----------

  function bitReverse(re, im) {
    const n = re.length;
    let j = 0;
    for (let i = 0; i < n; i++) {
      if (i < j) { const t = re[i]; re[i] = re[j]; re[j] = t; const u = im[i]; im[i] = im[j]; im[j] = u; }
      let m = n >> 1;
      while (j & m) { j ^= m; m >>= 1; }
      j ^= m;
    }
  }

  function fft(re, im) {
    const n = re.length;
    bitReverse(re, im);
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len;
      const wRe = Math.cos(ang), wIm = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let wr = 1, wi = 0;
        const half = len >> 1;
        for (let k = 0; k < half; k++) {
          const a = i + k, b = i + k + half;
          const tr = re[b] * wr - im[b] * wi;
          const ti = re[b] * wi + im[b] * wr;
          re[b] = re[a] - tr; im[b] = im[a] - ti;
          re[a] += tr; im[a] += ti;
          const nwr = wr * wRe - wi * wIm;
          wi = wr * wIm + wi * wRe;
          wr = nwr;
        }
      }
    }
    for (let i = 0; i < n; i++) { re[i] = Math.hypot(re[i], im[i]); }
  }

  function frameMagnitudes(pcm, offset) {
    const re = new Float64Array(FFTSIZE);
    const im = new Float64Array(FFTSIZE);
    for (let i = 0; i < FFTSIZE; i++) {
      const x = pcm[offset + i] || 0;
      re[i] = x * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (FFTSIZE - 1)));
    }
    fft(re, im);
    return re.slice(0, FFTSIZE / 2);
  }

  // ---------- Decompose: media → spectrum → ASCII → ports ----------

  // Slice the PCM into hop-overlapping frames, FFT each, RMS 4 bins → 128
  // ports, average across all visited frames, then scale to ASCII 0x00..0x7F.
  // The result is a *frame-scaled* codebook: each port is a declared attribute.
  function frameScale(pcm) {
    const acc = new Float64Array(PORT_BINS);
    let frames = 0, max = 0;
    let offset = 0;
    while (offset + FFTSIZE <= pcm.length && frames < 64) {
      const mag = frameMagnitudes(pcm, offset);
      for (let b = 0; b < PORT_BINS; b++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += mag[b * 4 + k] || 0;
        const mono = Math.sqrt(s);
        acc[b] += mono;
        if (mono > max) max = mono;
      }
      frames++; offset += HOP;
    }
    if (frames === 0) return { acc, frames: 0, max: 0, scaled: 0 };
    const codes = new Uint8Array(PORT_BINS);
    const scale = max > 0 ? (127 * 0.92) / max : 1;
    for (let b = 0; b < PORT_BINS; b++) {
      codes[b] = Math.min(127, Math.round(acc[b] / frames * scale));
    }
    return { acc, frames, max, scaled: frames, codes };
  }

  function reducePorts(codes, fiber) {
    const out = new Uint8Array(PORT_BINS);
    for (let i = 0; i < PORT_BINS; i++) {
      out[i] = codes[i] ^ fiber[i & 31];
    }
    return out;
  }

  function digestOf(arr) {
    let d = 0;
    for (let i = 0; i < arr.length; i++) d ^= arr[i];
    return d >>> 0;
  }

  function hex4(v) { return '0x' + ((v >>> 0) & 0xffff).toString(16).padStart(4, '0'); }

  function layerOf(code) { return code >>> 4; }

  function portChar(code) {
    if (code >= 32 && code < 127) return String.fromCharCode(code);
    return '\u00b7';
  }

  // ---------- Rendering ----------

  function renderPorts() {
    const grid = $('ports-grid');
    grid.innerHTML = '';
    for (let i = 0; i < PORT_BINS; i++) {
      const code = folded[i];
      const ln = LAYERS[layerOf(code)];
      const cell = document.createElement('div');
      cell.className = 'port' + (code === 0 ? ' empty' : '');
      cell.title = `port ${i} · ${ln.name} ${ln.dim}D · 0x${code.toString(16).padStart(2, '0')}`;
      cell.style.background = code ? ln.color + '33' : 'transparent';
      cell.style.borderColor = code ? ln.color + '88' : '#223';
      cell.innerHTML = `<span class="hex">${code.toString(16).padStart(2, '0')}</span><span class="chr">${portChar(code)}</span>`;
      cell.addEventListener('click', () => {
        folded[i] = (folded[i] + (7 * i + epoch) + 17) & 0x7f; // deterministic fuzz
        renderPorts(); renderArt(); renderLayers(); renderVTT();
        const pos = observerPos();
        updateObserver(pos);
        $('digest').textContent = hex4(digestOf(folded));
        submitBlob();
      });
      grid.appendChild(cell);
    }
  }

  function renderArt() {
    let art = '';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 16; col++) {
        const code = folded[row * 16 + col];
        const glyph = DENSITY[Math.min(DENSITY.length - 1, (code >> 4))];
        art += (code === 0 ? ' ' : glyph);
      }
      art += '\n';
    }
    art += 'layer key:\n';
    art += LAYERS.map(l => l.name).join(' ').toLowerCase();
    $('ascii-art').textContent = art;
  }

  function renderLayers() {
    const list = $('layers-list');
    list.innerHTML = '';
    let maxCount = 1;
    const counts = LAYERS.map(l => {
      let c = 0;
      for (let i = 0; i < PORT_BINS; i++) if (layerOf(folded[i]) === LAYERS.indexOf(l)) c++;
      return c;
    });
    counts.forEach(c => { if (c > maxCount) maxCount = c; });
    LAYERS.forEach((l, li) => {
      let vals = [], fold = 0;
      for (let i = 0; i < PORT_BINS; i++) {
        if (layerOf(folded[i]) === li) { vals.push(folded[i]); fold ^= folded[i]; }
      }
      const row = document.createElement('div');
      row.className = 'layer-row';
      const sum = vals.reduce((a, b) => a + b, 0);
      row.innerHTML =
        `<span class="lname">${l.dim}D</span>` +
        `<div class="bar-wrap"><div class="lbar"><i style="width:${Math.round(counts[li] / maxCount * 100)}%;background:${l.color}"></i></div><span>${counts[li]}</span></div>` +
        `<span class="lval">${sum || ''}</span>` +
        `<span class="lfold">${fold ? hex4(fold) : '\u22a5'}</span>`;
      list.appendChild(row);
    });
  }

  function renderVTT() {
    const cues = [];
    const dur = (audioBuf ? audioBuf.duration : 8);
    for (let i = 0; i < PORT_BINS; i++) {
      const code = folded[i];
      if (code === 0) continue;
      cues.push({
        start: (i / PORT_BINS) * dur,
        end: ((i + 1) / PORT_BINS) * dur,
        payload: {
          port: i,
          code: '0x' + code.toString(16).padStart(2, '0'),
          char: portChar(code),
          layer: LAYERS[layerOf(code)].name.toLowerCase() + ' ' + layerOf(code) + 'd',
          attr: `${LAYERS[layerOf(code)].dim}D:${i & 15}`
        }
      });
    }
    $('vtt').value = (window.cuesToVttText || (() => ''))(cues);
  }

  function observerPos() {
    let sx = 0, sy = 0, sz = 0;
    const d0 = digestOf(folded);
    for (let i = 0; i < PORT_BINS; i++) {
      const code = folded[i];
      const f = Math.sin((code + d0) * 0.1);
      if (layerOf(code) < 4) sx += (code - 64) * 0.02;
      else sy += (code - 64) * 0.02;
      sz += f * 0.03;
    }
    return {
      x: Math.max(-3, Math.min(3, sx)),
      y: Math.max(-3, Math.min(3, sy)),
      z: Math.max(-3, Math.min(3, sz))
    };
  }

  function updateObserver(pos) {
    $('pos').textContent = `${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}`;
    if (renderer && renderer.panner) {
      const p = renderer.panner;
      const t = (renderer.ctx ? renderer.ctx.currentTime : 0);
      if (p.positionX) {
        p.positionX.setTargetAtTime(pos.x, t, 0.05);
        p.positionY.setTargetAtTime(pos.y, t, 0.05);
        p.positionZ.setTargetAtTime(pos.z, t, 0.05);
      } else if (p.setPosition) {
        p.setPosition(pos.x, pos.y, pos.z);
      }
    }
  }

  // ---------- Convert frames to 4 slices and burn them onto the blob ----------

  function slicesFromFolded() {
    const n = 256;
    const audio = new Uint8Array(n), video = new Uint8Array(n), rgb = new Uint8Array(n), mask = new Uint8Array(n);
    let d = digestOf(folded);
    for (let i = 0; i < n; i++) {
      const p = folded[i & 127];
      audio[i] = p;
      video[i] = folded[(i * 3) & 127];
      rgb[i] = folded[(i * 7) & 127];
      mask[i] = (p ^ ((d >> (i & 3)) & 0xff)) & 0x7f;
    }
    return { audio, video, rgb, mask, digest: d };
  }

  let transmuteWorker = null;

  function submitBlob() {
    if (!transmuteWorker) {
      try {
        transmuteWorker = new Worker('/client/transmute-worker.js');
      } catch (_) {
        $('lossless').textContent = 'no worker';
        return;
      }
    }
    const sl = slicesFromFolded();
    const done = (src, dstWho) => {
      let okA = true, okV = true, okR = true, okM = true;
      const halve = Math.floor(65536 / 4);
      const match = (orig, rec) => {
        for (let i = 0; i < orig.length && i < halve; i++) {
          if ((rec[i] | 0) !== (orig[i % orig.length] | 0)) return false;
        }
        return true;
      };
      if (dstWho.audio) okA = match(sl.audio, dstWho.audio);
      if (dstWho.video) okV = match(sl.video, dstWho.video);
      if (dstWho.rgb) okR = match(sl.rgb, dstWho.rgb);
      if (dstWho.mask) okM = match(sl.mask, dstWho.mask);
      const ag = (digestOf(new Uint8Array(dstWho.audio).slice(0, halve).map((x, i) => x)) === digestOf(sl.audio.slice(0, halve))) ||
        dstWho.digest === sl.digest;
      const all = okA && okV && okR && okM;
      $('lossless').textContent = all
        ? `lossless over SAB: audio ${okA ? '\u2713' : '\u2717'} video ${okV ? '\u2713' : '\u2717'} rgb ${okR ? '\u2713' : '\u2717'} mask ${okM ? '\u2713' : '\u2717'}`
        : `lossless FAIL audio ${okA} video ${okV} rgb ${okR} mask ${okM} (ag=${ag})`;
    };
    const fail = () => { $('lossless').textContent = 'worker error'; };

    let id = 1;
    const call = (type, payload) => {
      return new Promise((resolve, reject) => {
        const box = { id: id++, type, payload: payload || {} };
        const onMsg = (e) => {
          if (e.data && e.data.id === box.id) { transmuteWorker.removeEventListener('message', onMsg); resolve(e.data); }
        };
        transmuteWorker.addEventListener('message', onMsg);
        transmuteWorker.postMessage(box);
        setTimeout(() => { transmuteWorker.removeEventListener('message', onMsg); reject(new Error('timeout')); }, 4000);
      });
    };

    (async () => {
      try {
        await call('init', { size: 65536 });
        await call('compose', { audio: sl.audio, video: sl.video, rgb: sl.rgb, mask: sl.mask });
        const dec = await call('decompose', {});
        done(sl, dec);
      } catch (err) { fail(); }
    })();
  }

  // ---------- Media capture → decompose ----------

  function ensureAudio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      renderer = window.createWebAudioRenderer ? window.createWebAudioRenderer(ctx) : null;
      if (renderer && renderer.stop) renderer.stop();
      if (renderer && renderer.panner) {
        renderer.panner.connect(renderer.ctx.destination);
      }
    }
    return ctx;
  }

  function connectBuffer() {
    if (!audioBuf || !ctx) return;
    try { if (bufferSource) bufferSource.stop(); } catch (_) {}
    bufferSource = ctx.createBufferSource();
    bufferSource.buffer = audioBuf;
    if (renderer && renderer.panner) bufferSource.connect(renderer.panner);
    else bufferSource.connect(ctx.destination);
    updateObserver(observerPos());
  }

  function decompose() {
    const file = $('media').files[0];
    if (!file) { alert('load an audio or video file first'); return; }
    const mode = $('mode').value;
    ensureAudio();
    if (!ctx) { alert('AudioContext unavailable'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const arrayBuf = ev.target.result;
      ctx.decodeAudioData(arrayBuf, (buf) => {
        audioBuf = buf;
        const pcm = buf.getChannelData(0);
        const fs = frameScale(pcm);
        if (fs.frames === 0) { $('lossless').textContent = 'no frames extracted'; return; }

        ports = fs.codes.slice();
        folded = reducePorts(ports, new Uint8Array([1, 3, 7, 15, 31, 63, 127, 2, 5, 17, 25, 33, 65, 97, 13, 21, 57, 73, 101, 9, 37, 49, 69, 109, 3, 11, 19, 27, 35, 43, 51, 59]));
        connectBuffer();
        renderAll();
        $('scaled').textContent = String(fs.scaled);
        $('digest').textContent = hex4(digestOf(folded));
        $('sealed').textContent = 'sealed: ' + (digestOf(folded) === 0);
      }, () => { $('lossless').textContent = 'decoder could not read this file'; });
    };
    reader.readAsArrayBuffer(file);
  }

  function renderAll() {
    renderPorts(); renderArt(); renderLayers(); renderVTT(); submitBlob();
  }

  function play() {
    ensureAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    connectBuffer();
    if (bufferSource) bufferSource.start();
  }

  // ---------- Live epoch from the substrate (delta-driven, not a clock) ----------

  fetch('/api/substrate').then(r => r.json()).then((j) => {
    if (j && j.ok) {
      epoch = j.epoch | 0;
      $('epoch').textContent = 'epoch ' + epoch;
      if (j.foldHex) $('fold').textContent = 'fold ' + j.foldHex;
    }
  }).catch(() => {});

  let evt = null;
  try { evt = new EventSource('/events'); } catch (_) {}
  if (evt) {
    evt.addEventListener('omi', (e) => {
      try {
        const d = JSON.parse(e.data);
        epoch = d.epoch | 0;
        $('epoch').textContent = 'epoch ' + epoch;
        if (d.foldHex) $('fold').textContent = 'fold ' + d.foldHex;
      } catch (_) {}
    });
  }

  window.OMIDevTools = { play, decompose };
})();