/**
 * OMI-IMO <area> Hit Zones + TextTrack / WebVTT Cue Pipeline
 *
 * - Converts dimension-pipeline rects / elements into <area> descriptors
 *   and HTML image-map markup.
 * - Builds WebVTT from cues (2D media-track) and drives a TextTrack-like
 *   listener for cuechange events (browser or polyfill).
 * - Integrates with 240-clock schedule so cue firing advances the clock.
 */
'use strict';

const { scheduleFromCues, colorAt } = require('./clock-sliderule');

// ---------- <area> hit zones ----------
/**
 * Build <area> descriptors from pipeline rects (3D) or elements (5D).
 * @param {Array} rects  [{x,y,width,height,label}]
 * @param {object} [opts]
 */
function buildAreaZones(rects, opts = {}) {
  const shape = opts.shape || 'rect';
  return (rects || []).map((r, i) => {
    const x1 = Math.round(r.x);
    const y1 = Math.round(r.y);
    const x2 = Math.round(r.x + r.width);
    const y2 = Math.round(r.y + r.height);
    return Object.freeze({
      id: r.id || `area-${i}`,
      shape,
      coords: shape === 'rect' ? `${x1},${y1},${x2},${y2}` : `${x1},${y1},${Math.round(r.width / 2)}`,
      href: opts.href || `#${r.label || i}`,
      alt: r.label || `zone-${i}`,
      label: r.label || '',
      data: {
        'data-omi-offset': r.offset != null ? String(r.offset) : String(i * 32),
        'data-omi-band': r.band != null ? String(r.band) : String((i % 4) + 1)
      }
    });
  });
}

/**
 * Serialize zones to an HTML <map> + <area> fragment.
 */
function areasToHtml(zones, mapName = 'omi-hitmap') {
  const lines = [`<map name="${mapName}" id="${mapName}">`];
  for (const z of zones) {
    const dataAttrs = Object.entries(z.data || {})
      .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
      .join(' ');
    lines.push(
      `  <area id="${escapeAttr(z.id)}" shape="${z.shape}" coords="${z.coords}" href="${escapeAttr(z.href)}" alt="${escapeAttr(z.alt)}" ${dataAttrs}>`
    );
  }
  lines.push('</map>');
  return lines.join('\n');
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------- WebVTT generation ----------
/**
 * Format seconds as WebVTT timestamp (HH:MM:SS.mmm)
 */
function toVttTime(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const whole = Math.floor(secs);
  const ms = Math.round((secs - whole) * 1000);
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${pad(h)}:${pad(m)}:${pad(whole)}.${pad(ms, 3)}`;
}

/**
 * Build a WebVTT document from cues.
 * @param {Array} cues  [{id, start, end, text, layer?}]
 * @param {object} [opts]
 */
function cuesToWebVTT(cues, opts = {}) {
  const lines = ['WEBVTT', ''];
  if (opts.note) {
    lines.push(`NOTE ${opts.note}`, '');
  }
  (cues || []).forEach((c, i) => {
    const id = c.id || `cue-${i}`;
    const start = toVttTime(c.start);
    const end = toVttTime(c.end != null ? c.end : (c.start || 0) + 0.5);
    lines.push(String(id));
    lines.push(`${start} --> ${end}`);
    // payload: text + optional JSON block for protocol consumers
    if (opts.structured) {
      lines.push(JSON.stringify({
        text: c.text,
        layer: c.layer || '-1D',
        block: c.block || null
      }));
    } else {
      lines.push(String(c.text || ''));
    }
    lines.push('');
  });
  return lines.join('\n');
}

/**
 * Parse a minimal WebVTT string back into cue objects (subset).
 */
function parseWebVTT(vtt) {
  const cues = [];
  const blocks = String(vtt || '').split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length || lines[0] === 'WEBVTT' || lines[0].startsWith('NOTE')) continue;
    let id = null;
    let timeLine = null;
    let textLines = [];
    if (lines[0].includes('-->')) {
      timeLine = lines[0];
      textLines = lines.slice(1);
    } else if (lines[1] && lines[1].includes('-->')) {
      id = lines[0];
      timeLine = lines[1];
      textLines = lines.slice(2);
    } else continue;
    const m = timeLine.match(/([\d:.]+)\s*-->\s*([\d:.]+)/);
    if (!m) continue;
    cues.push({
      id: id || `cue-${cues.length}`,
      start: parseVttTime(m[1]),
      end: parseVttTime(m[2]),
      text: textLines.join(' ')
    });
  }
  return cues;
}

function parseVttTime(ts) {
  const parts = String(ts).split(':');
  if (parts.length === 3) {
    return (+parts[0]) * 3600 + (+parts[1]) * 60 + parseFloat(parts[2]);
  }
  if (parts.length === 2) {
    return (+parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(ts) || 0;
}

// ---------- TextTrack-like cue pipeline ----------
/**
 * Create a cue pipeline that:
 *  - holds cues
 *  - emits cuechange when time advances into a cue
 *  - optionally steps the 240-clock
 *
 * Works in Node (polyfill) and browser (can attach to real TextTrack).
 */
function createCuePipeline(cues, opts = {}) {
  const list = (cues || []).slice().sort((a, b) => a.start - b.start);
  let currentTime = 0;
  let active = [];
  const listeners = { cuechange: [], tick: [] };

  const clockSchedule = opts.wireClock
    ? scheduleFromCues(list, opts.scheduleOpts || {})
    : null;

  const api = {
    get cues() { return list; },
    get activeCues() { return active.slice(); },
    get currentTime() { return currentTime; },
    get schedule() { return clockSchedule; },

    on(event, fn) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
      return () => {
        const arr = listeners[event];
        const i = arr.indexOf(fn);
        if (i >= 0) arr.splice(i, 1);
      };
    },

    _emit(event, payload) {
      for (const fn of (listeners[event] || [])) fn(payload);
    },

    /** Seek media time; fire cuechange if active set changes */
    seek(timeSec) {
      currentTime = Math.max(0, timeSec);
      const next = list.filter(c => c.start <= currentTime && currentTime < c.end);
      const changed =
        next.length !== active.length ||
        next.some((c, i) => !active[i] || active[i].id !== c.id);
      active = next;
      if (changed) {
        api._emit('cuechange', { activeCues: active, currentTime });
      }
      // Advance clock to matching tick if wired
      if (clockSchedule && clockSchedule.clock) {
        const tps = (opts.scheduleOpts && opts.scheduleOpts.ticksPerSecond) || 48;
        const tick = Math.floor(currentTime * tps);
        clockSchedule.clock.seek(tick);
        api._emit('tick', {
          tick: clockSchedule.clock.tick,
          phase: clockSchedule.clock.phase,
          color: clockSchedule.clock.color
        });
      }
      return active;
    },

    /** Step time forward by delta seconds */
    advance(deltaSec = 0.1) {
      return api.seek(currentTime + deltaSec);
    },

    /** Export WebVTT */
    toWebVTT(vttOpts) {
      return cuesToWebVTT(list, vttOpts);
    },

    /**
     * Browser helper: attach to a media element as a metadata TextTrack
     * and mirror cuechange events.
     */
    attachToMedia(mediaEl) {
      if (!mediaEl || !mediaEl.addTextTrack) {
        return null;
      }
      const track = mediaEl.addTextTrack('metadata', 'omi-cues', 'en');
      track.mode = 'hidden';
      // Add VTTCues when available
      if (typeof VTTCue !== 'undefined') {
        for (const c of list) {
          try {
            const cue = new VTTCue(c.start, c.end, c.text || '');
            cue.id = c.id || '';
            track.addCue(cue);
          } catch (_) { /* ignore malformed */ }
        }
      }
      track.addEventListener('cuechange', () => {
        const act = [];
        if (track.activeCues) {
          for (let i = 0; i < track.activeCues.length; i++) {
            act.push({
              id: track.activeCues[i].id,
              start: track.activeCues[i].startTime,
              end: track.activeCues[i].endTime,
              text: track.activeCues[i].text
            });
          }
        }
        active = act;
        currentTime = mediaEl.currentTime || currentTime;
        api._emit('cuechange', { activeCues: active, currentTime });
      });
      return track;
    }
  };

  return api;
}

// ---------- Full integration: pipeline rects + cues → areas + VTT + clock ----------
/**
 * @param {object} pipelineResult  from runFullPipeline()
 * @param {object} [opts]
 */
function instantiateFromPipeline(pipelineResult, opts = {}) {
  const rects = pipelineResult.rects || [];
  const cues = pipelineResult.cues || [];
  const elements = pipelineResult.elements || [];

  // Enrich rects with element metadata when available
  const enriched = rects.map((r, i) => ({
    ...r,
    id: (elements[i] && elements[i].id) || `area-${i}`,
    band: elements[i] && elements[i].band,
    offset: elements[i] && elements[i].offset
  }));

  const zones = buildAreaZones(enriched, opts.area);
  const mapHtml = areasToHtml(zones, opts.mapName || 'omi-hitmap');
  const vtt = cuesToWebVTT(cues, { structured: !!opts.structuredVtt, note: 'OMI-IMO cue pipeline' });
  const pipeline = createCuePipeline(cues, {
    wireClock: opts.wireClock !== false,
    scheduleOpts: opts.scheduleOpts
  });

  return Object.freeze({
    zones,
    mapHtml,
    vtt,
    cuePipeline: pipeline,
    schedule: pipeline.schedule,
    svg: pipelineResult.svg || '',
    metrics: {
      areaCount: zones.length,
      cueCount: cues.length,
      scheduleLength: pipeline.schedule ? pipeline.schedule.schedule.length : 0
    }
  });
}

// ---------- Self-test ----------
function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  const rects = [
    { x: 10, y: 20, width: 30, height: 16, label: 'A1' },
    { x: 50, y: 20, width: 40, height: 16, label: 'B2' }
  ];
  const zones = buildAreaZones(rects);
  assert('2 areas', zones.length === 2);
  assert('coords format', /^\d+,\d+,\d+,\d+$/.test(zones[0].coords));
  const html = areasToHtml(zones);
  assert('map html', html.includes('<map') && html.includes('<area'));

  const cues = [
    { id: 'c0', start: 0, end: 1, text: 'hello' },
    { id: 'c1', start: 1.5, end: 2.5, text: 'world' }
  ];
  const vtt = cuesToWebVTT(cues);
  assert('vtt header', vtt.startsWith('WEBVTT'));
  assert('vtt times', vtt.includes('-->'));
  const parsed = parseWebVTT(vtt);
  assert('parse roundtrip', parsed.length === 2 && parsed[0].text.includes('hello'));

  const pipe = createCuePipeline(cues, { wireClock: true });
  pipe.seek(0.5);
  assert('active at 0.5', pipe.activeCues.length === 1 && pipe.activeCues[0].id === 'c0');
  pipe.seek(1.7);
  assert('active at 1.7', pipe.activeCues.length === 1 && pipe.activeCues[0].id === 'c1');
  pipe.seek(3);
  assert('active empty', pipe.activeCues.length === 0);
  assert('has schedule', pipe.schedule && pipe.schedule.schedule.length === 2);

  // Integration with fake pipeline result
  const fake = {
    rects,
    cues,
    elements: [
      { id: 'cell-0', band: 1, offset: 0 },
      { id: 'cell-1', band: 2, offset: 32 }
    ],
    svg: '<svg></svg>'
  };
  const inst = instantiateFromPipeline(fake);
  assert('instantiate areas', inst.zones.length === 2);
  assert('instantiate vtt', inst.vtt.includes('WEBVTT'));
  assert('instantiate metrics', inst.metrics.areaCount === 2);

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

module.exports = {
  buildAreaZones,
  areasToHtml,
  toVttTime,
  cuesToWebVTT,
  parseWebVTT,
  createCuePipeline,
  instantiateFromPipeline,
  selfTest
};
