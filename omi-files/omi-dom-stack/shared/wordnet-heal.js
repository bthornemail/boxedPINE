/**
 * WordNet-style recovery candidates for BusyBox errors (offline lexical map)
 */
'use strict';

const wordnet = new Map([
  ['unknown_command', ['fallback', 'help', 'list']],
  ['invalid_input', ['sanitize', 'parse', 'reject']],
  ['stream_broken', ['reconnect', 'restart', 'reopen']],
  ['version_mismatch', ['upgrade', 'downgrade', 'compat']],
  ['state_corrupt', ['reset', 'restore', 'reinit']],
  ['unknown', ['default', 'help']]
]);

/** Hypernym / synonym-ish expansion for disambiguation scoring */
const RELATED = {
  fallback: ['help', 'list', 'echo'],
  sanitize: ['parse', 'trim', 'escape'],
  reconnect: ['reopen', 'restart'],
  upgrade: ['compat', 'version'],
  reset: ['restore', 'reinit', 'clear']
};

function scoreSense(candidate, contextWords) {
  let score = 1;
  const related = RELATED[candidate] || [];
  for (const w of contextWords || []) {
    if (related.includes(w)) score += 1;
    if (w === candidate) score += 2;
  }
  return score;
}

function disambiguate(kind, context) {
  const candidates = wordnet.get(kind) || wordnet.get('unknown');
  const ranked = candidates.map((c) => ({
    sense: c,
    score: scoreSense(c, context)
  })).sort((a, b) => b.score - a.score);
  return ranked[0] ? ranked[0].sense : 'default';
}

function heal(error, handlers) {
  handlers = handlers || global;
  const kind = (error && error.kind) || 'unknown';
  const context = String((error && error.message) || '').toLowerCase().split(/\W+/).filter(Boolean);
  const ordered = wordnet.get(kind) || ['default'];
  const ranked = ordered
    .map((c) => ({ c, score: scoreSense(c, context) }))
    .sort((a, b) => b.score - a.score);

  for (const { c } of ranked) {
    const key = '__OMI_HEAL_' + c.toUpperCase() + '__';
    const handler = handlers[key] || handlers[c];
    if (typeof handler === 'function') {
      try {
        const out = handler(error);
        if (out && out.healed !== false) {
          return { healed: true, action: c, out: out.out != null ? out.out : out };
        }
      } catch (_) { /* next */ }
    }
  }
  return { healed: false, error, tried: ranked.map((r) => r.c) };
}

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });
  assert('has unknown_command', wordnet.has('unknown_command'));
  assert('disambiguate', disambiguate('unknown_command', ['help']) === 'help' ||
    disambiguate('unknown_command', []) === 'fallback');
  const handlers = {
    fallback: () => ({ healed: true, out: 'ok-fallback' })
  };
  const r = heal({ kind: 'unknown_command', message: 'cmd not found' }, handlers);
  assert('heal fallback', r.healed === true && r.action === 'fallback');
  const failed = results.filter((x) => !x.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = { heal, wordnet, disambiguate, scoreSense, selfTest };
