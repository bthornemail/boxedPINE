/**
 * OMI-IMO Full DOM Stack
 * Implements:
 *   - <dl>/<dt>/<dd> hit-list structure
 *   - data-omi-* attribute validation
 *   - DOM geometry overlay (Point / Rect / Matrix)
 *   - Hit-list construction
 *   - PannerNode 0D observer bridge
 *   - TextTrack / cuechange listener hooks
 *   - Meta-compilation from <meta> tags + document.body
 *
 * Orthogonal layers as specified:
 *   HTTP/1.1 → Regex → DOM geometry → Hit lists → PannerNode → Blobs → Worklets
 */
(function (global) {
  'use strict';

  // ---------- Full REGEX Constraint Mapping (from Complete Codex / Spec §21) ----------
  // Serialized source: shared/complete-codex.yaml
  const G = Object.freeze({
    FRONT:      /^[A-Za-z0-9:+]$/,
    BACK:       /^[A-Za-z0-9.\-]$/,
    INSIDE:     /^[A-Za-z0-9_]$/,
    OUTSIDE:    /^[^A-Za-z0-9_]$/,
    UP:         /^[A-Z_]$/,
    DOWN:       /^[a-z_]$/,
    LEFT:       /^[0-9+\-]\.[^0-9+\-]$/,
    RIGHT:      /^[^0-9+\-]\.[0-9+\-]$/,
    CENTER:     /^[0-9]\.[0-9]$/,
    CONSTRAINT: /^[^"]+$/,
    BOUNDARY:   /^"([^"]+)"$/,
    DEFLECT:    /^([^".]+):\1$/,
    REFLECT:    /^([".]+):\1$/,
    INFLECT:    /^([".]+):([".]+):\2:\1$/,
    AXIS:       /^(\d\d)[A-Za-z_](\d\d):\2[0-9+\-]\1$/,
    MNEMONIC:   /^(\d\d)([A-Z_]?[a-z_]+)(\d\d):\3\2\1$/,
    PALINDROME: /^(\d\d)[A-Za-z_\-](\d\d):\2[0-9_\-]\1$/,
    // Practical DOM-stack attribute validators
    OMI_MNEMONIC: /^[A-Za-z0-9]{2,8}$/,
    OMI_BAND:     /^[0-9]{1,2}$/,
    OMI_OFFSET:   /^[0-9]+$/,
    OMI_BPE:      /^[1248]$/,
    OMI_HIT_LIST: /^[0-9]+(,[0-9]+)*$/,
    OMI_ID:       /^[a-z][a-z0-9\-]*$/
  });

  const CORRELATION = Object.freeze({
    FRONT: '0x0000', BACK: 'Omicron', INSIDE: 'Imago Dei', OUTSIDE: '3!',
    UP: 'Imago Dei', DOWN: '3!', LEFT: '76', RIGHT: '155', CENTER: '651'
  });

  function admits(name, value) {
    const re = G[name];
    return re ? re.test(String(value ?? '')) : false;
  }

  function validateOmiAttributes(el) {
    const errors = [];
    const m = el.getAttribute('data-omi-mnemonic');
    const b = el.getAttribute('data-omi-band');
    const o = el.getAttribute('data-omi-offset');
    const p = el.getAttribute('data-omi-bpe-constraint');
    const h = el.getAttribute('data-omi-hit-list');

    if (m !== null && !admits('OMI_MNEMONIC', m)) errors.push(`mnemonic:${m}`);
    if (b !== null && !admits('OMI_BAND', b)) errors.push(`band:${b}`);
    if (o !== null && !admits('OMI_OFFSET', o)) errors.push(`offset:${o}`);
    if (p !== null && !admits('OMI_BPE', p)) errors.push(`bpe:${p}`);
    if (h !== null && !admits('OMI_HIT_LIST', h)) errors.push(`hit-list:${h}`);
    return { ok: errors.length === 0, errors };
  }

  // ---------- Meta-compilation ----------
  /**
   * Read all <meta name="omi-*"> and optional body directives.
   * Returns a configuration object used to constrain the stack.
   */
  function metaCompile() {
    const cfg = {
      mode: 'sse',
      endpoint: '/events',
      parse: 'body',
      http11Only: true,
      constraints: [],
      bodyDirective: null
    };

    document.querySelectorAll('meta[name^="omi-"]').forEach(meta => {
      const name = meta.getAttribute('name');
      const content = meta.getAttribute('content') || '';
      if (name === 'omi-bootstrap') {
        content.split(';').forEach(part => {
          const [k, v] = part.split('=').map(s => s.trim());
          if (k && v) cfg[k] = v;
        });
      } else if (name === 'omi-constraint') {
        cfg.constraints.push(content);
      }
    });

    // Optional body payload (first text node or data attribute)
    if (cfg.parse === 'body') {
      const bodyText = (document.body.dataset.omiPayload || document.body.textContent || '').trim();
      if (bodyText) cfg.bodyDirective = bodyText;
    }

    // Apply simple constraint checks (HTTP/1.1 feature detection example)
    if (cfg.http11Only || cfg.constraints.some(c => c.includes('http11-only'))) {
      // Browser always speaks HTTP/1.1+ under the hood; this is a declarative marker.
      cfg.http11Confirmed = true;
    }

    return Object.freeze(cfg);
  }

  // ---------- Hit-list construction from <dl>/<dt>/<dd> ----------
  /**
   * Scan a <dl> (or the whole document) and build an ordered hit list.
   * Each entry is a knot: { id, mnemonic, band, geometry, dt, dd }
   */
  function buildHitList(root = document) {
    const list = [];
    const dls = root.querySelectorAll('dl[id^="omi-"], dl.omi-hit-list, #omi-canvas-overlay');

    dls.forEach(dl => {
      const dts = dl.querySelectorAll(':scope > dt');
      dts.forEach(dt => {
        const dd = dt.nextElementSibling;
        if (!dd || dd.tagName !== 'DD') return;

        const validation = validateOmiAttributes(dt);
        const validationDd = validateOmiAttributes(dd);
        if (!validation.ok || !validationDd.ok) {
          console.warn('[OMI DOM Stack] rejected element', dt.id, validation.errors, validationDd.errors);
          return;
        }

        const entry = {
          id: dt.id || null,
          mnemonic: dt.getAttribute('data-omi-mnemonic'),
          band: parseInt(dt.getAttribute('data-omi-band') || '0', 10),
          offset: parseInt(dd.getAttribute('data-omi-offset') || '0', 10),
          bpe: parseInt(dd.getAttribute('data-omi-bpe-constraint') || '1', 10),
          hitListRaw: dt.getAttribute('data-omi-hit-list'),
          dt,
          dd,
          // Geometry will be filled by the geometry layer
          geometry: null
        };
        list.push(Object.freeze(entry));
      });
    });

    return Object.freeze(list);
  }

  // ---------- DOM Geometry layer ----------
  /**
   * Attach geometry (DOMPoint / DOMRect / DOMMatrix) to each hit-list entry.
   * Uses getBoundingClientRect + optional data attributes for explicit coords.
   */
  function attachGeometry(hitList) {
    return hitList.map(entry => {
      const rect = entry.dt.getBoundingClientRect();
      const point = new DOMPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      const matrix = new DOMMatrix(); // identity; can be composed later

      const geometry = Object.freeze({
        point,
        rect: DOMRect.fromRect(rect),
        matrix,
        // Convenience
        x: point.x,
        y: point.y,
        width: rect.width,
        height: rect.height
      });

      return Object.freeze({ ...entry, geometry });
    });
  }

  // ---------- PannerNode 0D observer bridge ----------
  let audioCtx = null;
  let panner = null;

  function ensurePanner() {
    if (panner) return panner;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      panner = audioCtx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      // Connect a silent source so the node is live
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(audioCtx.destination);
      osc.start();
    } catch (e) {
      console.warn('[OMI DOM Stack] PannerNode unavailable', e);
      panner = null;
    }
    return panner;
  }

  function setObserverPosition(x, y, z = 0) {
    const p = ensurePanner();
    if (!p || !audioCtx) return;
    const t = audioCtx.currentTime;
    p.positionX.setValueAtTime(x, t);
    p.positionY.setValueAtTime(y, t);
    p.positionZ.setValueAtTime(z, t);
  }

  function getObserverPosition() {
    const p = ensurePanner();
    if (!p) return { x: 0, y: 0, z: 0 };
    return {
      x: p.positionX.value,
      y: p.positionY.value,
      z: p.positionZ.value
    };
  }

  // ---------- TextTrack / cuechange listener ----------
  function attachTextTrackListener(videoOrAudio, onCue) {
    if (!videoOrAudio || !videoOrAudio.addTextTrack) return null;
    const track = videoOrAudio.addTextTrack('metadata', 'omi-cues', 'en');
    track.mode = 'hidden';
    track.addEventListener('cuechange', () => {
      const cues = track.activeCues;
      if (!cues) return;
      for (let i = 0; i < cues.length; i++) {
        onCue(cues[i]);
      }
    });
    return track;
  }

  // ---------- Public API ----------
  const DomStack = {
    metaCompile,
    buildHitList,
    attachGeometry,
    validateOmiAttributes,
    admits,
    G,
    ensurePanner,
    setObserverPosition,
    getObserverPosition,
    attachTextTrackListener,

    /**
     * Full bootstrap: meta-compile → build & validate hit list → attach geometry → ready.
     */
    bootstrap(root = document) {
      const config = metaCompile();
      const rawList = buildHitList(root);
      const withGeometry = attachGeometry(rawList);
      const pannerReady = !!ensurePanner();

      const state = Object.freeze({
        config,
        hitList: withGeometry,
        pannerReady,
        observer: getObserverPosition(),
        timestamp: Date.now()
      });

      // Expose for debugging / later layers
      global.__OMI_DOM_STACK__ = state;
      console.info('[OMI DOM Stack] bootstrapped', {
        cells: state.hitList.length,
        mode: state.config.mode,
        endpoint: state.config.endpoint,
        panner: state.pannerReady
      });
      return state;
    }
  };

  // UMD-style export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomStack;
  } else {
    global.OMIDomStack = DomStack;
  }
})(typeof window !== 'undefined' ? window : global);
