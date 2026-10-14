/**
 * OMI-IMO 240-Clock · 5040 Slide-Rule · −4D Color Codex
 *
 * Spec basis:
 *   240  = 60×4 = 15×16 = 16²−16     → tick source
 *   5040 = 7! = 7×720 = 7×3×240      → full slide rule
 *   4320 = 6×720                     → boundary before 7th Fano group
 *   −4D color codex                  → 4! = 24 palette (H₁₁ projective half)
 *
 * Cues from the dimension pipeline drive clock instantiation and
 * slide-rule window placement.
 */
'use strict';

const { COLOR_CODEX } = require('./dimension-pipeline');

// ---------- Constants ----------
const TICKS_PER_CYCLE = 240;
const SLIDE_RULE_LENGTH = 5040;
const FANO_GROUP = 720;          // 6!
const BOUNDARY = 4320;           // 6 × 720
const FANO_GROUPS = 7;           // 7! / 6!
const TETRA_BLOCKS_PER_FANO = 3; // 720 / 240
const COLOR_COUNT = 24;          // 4!

// ---------- −4D Color Codex ----------
/**
 * Full 24-color codex with spectral metadata.
 * Index is stable; correlations follow Complete Codex.
 */
const COLOR_CODEX_FULL = Object.freeze(
  (COLOR_CODEX || [
    '#000000', '#1a1a2e', '#16213e', '#0f3460',
    '#e94560', '#533483', '#e94560', '#0f3460',
    '#1a1a2e', '#16213e', '#533483', '#e94560',
    '#f5f5f5', '#e8e8f0', '#c0c0d0', '#a0a0b0',
    '#5b8def', '#6dcea5', '#e0b050', '#e07a7a',
    '#7a5be0', '#5be0c0', '#e05b8d', '#8de05b'
  ]).map((hex, i) => Object.freeze({
    index: i,
    hex,
    band: (i % 4) + 1,
    fano: Math.floor(i / 4) % 7,
    name: `codex-${i}`
  }))
);

function colorAt(index) {
  return COLOR_CODEX_FULL[((index % COLOR_COUNT) + COLOR_COUNT) % COLOR_COUNT];
}

function colorForTick(tick) {
  return colorAt(Math.floor(tick / 10) % COLOR_COUNT);
}

// ---------- 240-Clock ----------
/**
 * Create a 240-tick clock.
 * @param {object} [opts]
 * @param {number} [opts.start=0]
 * @param {function} [opts.onTick]  (tick, phase, color) => void
 */
function createClock(opts = {}) {
  let tick = opts.start || 0;
  let running = false;
  let timer = null;
  const listeners = [];
  if (opts.onTick) listeners.push(opts.onTick);

  const api = {
    get tick() { return tick; },
    get phase() { return tick % TICKS_PER_CYCLE; },
    get cycle() { return Math.floor(tick / TICKS_PER_CYCLE); },
    get color() { return colorForTick(tick); },
    get running() { return running; },

    onTick(fn) {
      listeners.push(fn);
      return () => {
        const i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      };
    },

    /** Advance one tick (manual or from cue) */
    step(n = 1) {
      for (let i = 0; i < n; i++) {
        tick = (tick + 1) >>> 0;
        const phase = tick % TICKS_PER_CYCLE;
        const color = colorForTick(tick);
        for (const fn of listeners) fn(tick, phase, color);
      }
      return tick;
    },

    /** Jump to absolute tick */
    seek(t) {
      tick = Math.max(0, t | 0);
      return tick;
    },

    /** Map a cue start-time (seconds) onto the 240 grid */
    cueToTick(cueStartSec, ticksPerSecond = 48) {
      return Math.floor(cueStartSec * ticksPerSecond) % TICKS_PER_CYCLE;
    },

    /** Instantiate clock position from a list of cues */
    scheduleFromCues(cues, ticksPerSecond = 48) {
      const schedule = (cues || []).map(c => ({
        id: c.id,
        text: c.text,
        cueStart: c.start,
        cueEnd: c.end,
        tick: Math.floor((c.start || 0) * ticksPerSecond),
        phase: Math.floor((c.start || 0) * ticksPerSecond) % TICKS_PER_CYCLE,
        color: colorForTick(Math.floor((c.start || 0) * ticksPerSecond))
      }));
      return Object.freeze(schedule);
    },

    start(intervalMs = 1000 / 48) {
      if (running) return;
      running = true;
      timer = setInterval(() => api.step(1), intervalMs);
    },

    stop() {
      running = false;
      if (timer) clearInterval(timer);
      timer = null;
    },

    reset() {
      api.stop();
      tick = 0;
    }
  };

  return api;
}

// ---------- 5040 Slide-Rule ----------
/**
 * 5040-slot slide rule = 7 Fano groups × 720.
 * Each Fano group = 3 tetra blocks of 240.
 *
 * Window of length `windowSize` (default 240) can slide along the rule.
 * Cues schedule which window is active.
 */
function createSlideRule(opts = {}) {
  const length = opts.length || SLIDE_RULE_LENGTH;
  const windowSize = opts.windowSize || TICKS_PER_CYCLE;
  let position = opts.position || 0; // left edge of window
  const slots = new Float64Array(length);

  // Optional seed from ruler / tokens
  if (opts.seed && opts.seed.length) {
    for (let i = 0; i < length; i++) {
      slots[i] = Number(opts.seed[i % opts.seed.length]) || 0;
    }
  }

  const api = {
    get length() { return length; },
    get windowSize() { return windowSize; },
    get position() { return position; },
    get boundary() { return BOUNDARY; },
    get fanoGroup() { return Math.floor(position / FANO_GROUP); },
    get tetraBlock() {
      const within = position % FANO_GROUP;
      return Math.floor(within / TICKS_PER_CYCLE);
    },

    /** Read the current window (length windowSize) */
    window() {
      const out = new Float64Array(windowSize);
      for (let i = 0; i < windowSize; i++) {
        out[i] = slots[(position + i) % length];
      }
      return out;
    },

    /** Slide the window by delta slots */
    slide(delta) {
      position = ((position + delta) % length + length) % length;
      return position;
    },

    /** Jump window so that `slot` is at the left edge */
    seek(slot) {
      position = ((slot % length) + length) % length;
      return position;
    },

    /** Write a value into an absolute slot */
    write(slot, value) {
      slots[((slot % length) + length) % length] = value;
    },

    read(slot) {
      return slots[((slot % length) + length) % length];
    },

    /**
     * Instantiate slide-rule windows from a cue schedule.
     * Each cue maps to a window whose left edge = cue.tick % 5040.
     */
    windowsFromCues(schedule) {
      return (schedule || []).map(c => {
        const left = (c.tick || 0) % length;
        const win = new Float64Array(windowSize);
        for (let i = 0; i < windowSize; i++) {
          win[i] = slots[(left + i) % length];
        }
        return Object.freeze({
          id: c.id,
          text: c.text,
          left,
          fano: Math.floor(left / FANO_GROUP),
          tetra: Math.floor((left % FANO_GROUP) / TICKS_PER_CYCLE),
          color: c.color || colorAt(left % COLOR_COUNT),
          window: win
        });
      });
    },

    /** Snapshot of structural metrics */
    metrics() {
      return {
        length,
        windowSize,
        position,
        fanoGroup: api.fanoGroup,
        tetraBlock: api.tetraBlock,
        pastBoundary: position >= BOUNDARY
      };
    }
  };

  return api;
}

// ---------- Combined scheduler ----------
/**
 * Wire cues → clock schedule → slide-rule windows → color.
 * @param {Array} cues  from dimension-pipeline (2D media-track)
 * @param {object} [opts]
 */
function scheduleFromCues(cues, opts = {}) {
  const clock = createClock(opts.clock);
  const rule = createSlideRule(opts.slideRule);
  const schedule = clock.scheduleFromCues(cues, opts.ticksPerSecond || 48);
  const windows = rule.windowsFromCues(schedule);

  return Object.freeze({
    clock,
    rule,
    schedule,
    windows,
    colors: schedule.map(s => s.color),
    metrics: {
      cueCount: (cues || []).length,
      scheduleLength: schedule.length,
      windowCount: windows.length,
      clockPhase: clock.phase,
      rulePosition: rule.position
    }
  });
}

// ---------- Self-test ----------
function selfTest() {
  const results = [];
  const assert = (name, cond, detail) => {
    results.push({ name, pass: !!cond, detail: detail || '' });
  };

  // Color codex
  assert('color count 24', COLOR_CODEX_FULL.length === 24);
  assert('colorAt wrap', colorAt(25).index === 1);

  // Clock
  const clock = createClock();
  assert('clock start 0', clock.tick === 0);
  clock.step(10);
  assert('clock step 10', clock.tick === 10);
  assert('clock phase', clock.phase === 10);
  clock.step(240);
  assert('clock wraps cycle', clock.cycle >= 1);

  const cues = [
    { id: 'c0', start: 0, end: 0.5, text: 'A' },
    { id: 'c1', start: 1.0, end: 1.5, text: 'B' },
    { id: 'c2', start: 2.5, end: 3.0, text: 'C' }
  ];
  const sched = clock.scheduleFromCues(cues, 48);
  assert('schedule length 3', sched.length === 3);
  assert('schedule has ticks', typeof sched[0].tick === 'number');
  assert('schedule has color', sched[0].color && sched[0].color.hex);

  // Slide rule
  const rule = createSlideRule({ seed: [1, 2, 3, 4, 5, 6, 7, 8] });
  assert('rule length 5040', rule.length === 5040);
  assert('window size 240', rule.window().length === 240);
  rule.slide(720);
  assert('fano group 1', rule.fanoGroup === 1);
  rule.seek(4320);
  assert('at boundary', rule.position === 4320);
  assert('past boundary', rule.metrics().pastBoundary === true);

  const wins = rule.windowsFromCues(sched);
  assert('windows from cues', wins.length === 3);
  assert('window has fano', typeof wins[0].fano === 'number');

  // Combined
  const combined = scheduleFromCues(cues);
  assert('combined schedule', combined.schedule.length === 3);
  assert('combined windows', combined.windows.length === 3);
  assert('combined metrics', combined.metrics.cueCount === 3);

  const failed = results.filter(r => !r.pass);
  return {
    passed: failed.length === 0,
    total: results.length,
    failed: failed.length,
    results
  };
}

module.exports = {
  TICKS_PER_CYCLE,
  SLIDE_RULE_LENGTH,
  FANO_GROUP,
  BOUNDARY,
  COLOR_COUNT,
  COLOR_CODEX_FULL,
  colorAt,
  colorForTick,
  createClock,
  createSlideRule,
  scheduleFromCues,
  selfTest
};
