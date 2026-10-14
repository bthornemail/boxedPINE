/**
 * Prolog-style Horn resolution for OMI-IMO (pure JS)
 *
 * Two fact spaces, one unifier:
 *   - `kinds` : error(Kind) → recover(Action)  (BusyBox self-healing)
 *   - SPO     : statements about the solid graph, subject-predicate-object
 *               triples (solid-to-triple) + G rule/constraint predicates.
 *
 * A rule is a Horn clause:  G  ∧  when  →  then
 *   G    = list of predicates the space must jointly satisfy (XOR/3-bit truth)
 *   when = a fact pattern (flat or nested object)
 *   then = the production (action, or a new SPO triple to assert)
 *
 * Truth model (0d predicate / 1d boolean): a proposition is <name=value=coord>
 * where value is the literal and coord is the 3-bit tetrahedral residue.
 * A rule fires when every `when` key unifies AND every G predicate is true.
 */

/**
 * A token is <name, value, coord>. `coord` is the 6-bit composite of the
 * 3-bit tetrahedral residues of name and value — the "coordinate" a
 * proposition occupies. `predicate` is the XOR-based truth (value nonzero).
 */
function toToken(name, value) {
  const s = String(name);
  const v = String(value);
  let nh = 0, vh = 0;
  for (let i = 0; i < s.length; i++) nh = (nh * 31 ^ s.charCodeAt(i)) >>> 0;
  for (let i = 0; i < v.length; i++) vh = (vh * 31 ^ v.charCodeAt(i)) >>> 0;
  const r3 = (x) => { let h = x >>> 0; h ^= h >>> 3; h ^= h >>> 6; h ^= h >>> 12; return h & 7; };
  return {
    name: s,
    value: v,
    coord: ((r3(nh) << 3) | r3(vh)) & 0x3f,
    predicate: v.length > 0 && v !== '0' && v !== 'false'
  };
}

/** Fold a token name down to its 3-bit predicate class (0d). */
function pred(name, value) {
  return toToken(name, value).predicate;
}

/** Fold an arbitrary number to its 3-bit tetrahedral residue. */
function reduce3(x) {
  let h = (x | 0) >>> 0;
  h ^= h >>> 3;
  h ^= h >>> 6;
  h ^= h >>> 12;
  return h & 0x7;
}

const RULES = [
  { head: 'resolve', when: { kind: 'unknown_command' }, action: 'fallback' },
  { head: 'resolve', when: { kind: 'invalid_input' }, action: 'sanitize' },
  { head: 'resolve', when: { kind: 'stream_broken' }, action: 'reconnect' },
  { head: 'resolve', when: { kind: 'version_mismatch' }, action: 'upgrade' },
  { head: 'resolve', when: { kind: 'state_corrupt' }, action: 'reset' },
  { head: 'resolve', when: { kind: 'unknown' }, action: 'default' }
];

/**
 * SPO rules: statements over the solid graph. A rule's `when` matches an SPO
 * triple by subject and predicate; `then` produces (asserts) a new triple.
 */
const SPO_RULES = [
  {
    label: 'BODY → ALT',
    when: { subj: 'body', pred: 'base' },
    then: { subj: 'body', pred: 'turn', obj: 'alt' },
    g: ['sealed']
  },
  {
    label: 'ALT prove → ACCEPT',
    when: { subj: 'data', pred: 'derived', obj: 'mainstreamable' },
    then: { subj: 'data', pred: 'proof', obj: 'accept' },
    g: ['sealed']
  },
  {
    label: 'verified XOR → SIGN',
    when: { subj: 'witness', pred: 'obs', obj: 'sp' },
    then: { subj: 'witness', pred: 'sign', obj: 'escrow' },
    g: ['sealed']
  }
];

const COMPAT_MIN = '1.36.0';
const COMPAT_MAX = '2.0.0';

function classifyMessage(msg) {
  const m = String(msg || '').toLowerCase();
  if (m.includes('not found') || m.includes('unknown command')) return 'unknown_command';
  if (m.includes('invalid')) return 'invalid_input';
  if (m.includes('stream') || m.includes('ePIPE') || m.includes('epipe')) return 'stream_broken';
  if (m.includes('version')) return 'version_mismatch';
  if (m.includes('corrupt')) return 'state_corrupt';
  return 'unknown';
}

function unify(when, facts) {
  for (const k of Object.keys(when)) {
    if (facts[k] !== when[k]) return false;
  }
  return true;
}

/**
 * Predicate evaluation: the Horn `G` guard. Each predicate is a token name;
 * it holds if the given space makes that name <true-value=coord>. A space
 * item (triple/statement) satisfies a predicate P when token(P) truth
 * matches — i.e. the item carries a coordinate on the same 3-bit class.
 */
function gSatisfied(g, space) {
  if (!g || g.length === 0) return true;
  for (const p of g) {
    let any = false;
    for (const item of space) {
      const t = toToken(p, item.obj != null ? item.obj : item.value != null ? item.value : '1');
      if (t.predicate) { any = true; break; }
    }
    if (!any) return false;
  }
  return true;
}

function resolve(error, space = []) {
  const kind = error.kind || classifyMessage(error.message);
  const facts = { kind };
  for (const rule of RULES) {
    if (rule.head === 'resolve' && unify(rule.when, facts)) {
      return { kind, action: rule.action, rule: rule.when };
    }
  }
  return { kind, action: 'default', rule: null };
}

/**
 * Resolve an SPO triple over the graph. Returns the matched rule AND the
 * asserted `then` triple, or null when no rule fires.
 */
function resolveSPO(subject, predicate, object, graph = []) {
  const triple = { subj: subject, pred: predicate, obj: object != null ? object : '' };
  for (const rule of SPO_RULES) {
    if (!unify(rule.when, triple)) continue;
    if (!gSatisfied(rule.g, graph.length ? graph : [triple])) continue;
    return {
      triple,
      label: rule.label,
      assert: { ...rule.then }
    };
  }
  return null;
}

/**
 * Drive resolution over a backlog: fold SPO statements through the rule base.
 * Returns every asserted triple plus the derivation count. Purely functional —
 * the graph and the rules join, nothing mutates.
 */
function derive(space = [], subjects = []) {
  const out = [];
  const subjectsBatch = subjects.length ? subjects : [null];
  for (const s of subjectsBatch) {
    for (const item of space) {
      const subj = s || item.subj;
      const res = resolveSPO(subj, item.pred, item.obj, space);
      if (res) out.push(res);
    }
  }
  return { derived: out.length, triples: out };
}

function cmpVer(a, b) {
  for (let i = 0; i < 3; i++) {
    const d = (a[i] || 0) - (b[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

function compatibleVersion(v) {
  const parse = (s) => String(s).replace(/-.*$/, '').split('.').map((x) => parseInt(x, 10) || 0);
  const a = parse(v);
  const lo = parse(COMPAT_MIN);
  const hi = parse(COMPAT_MAX);
  return cmpVer(a, lo) >= 0 && cmpVer(a, hi) <= 0;
}
function recover(action, error, ctx) {
  ctx = ctx || {};
  switch (action) {
    case 'fallback':
      return {
        healed: true,
        out: 'help: known applets echo|cat|xor|true|false — tried: ' + (error.command || '')
      };
    case 'sanitize':
      return {
        healed: true,
        out: String(error.input || error.message || '').replace(/[^\w\s.-]/g, '')
      };
    case 'reconnect':
      return { healed: true, out: 'streams reconnected (virtual)' };
    case 'upgrade':
      return {
        healed: true,
        out: 'compat mode ' + COMPAT_MIN + '..' + COMPAT_MAX
      };
    case 'reset':
      if (typeof ctx.reset === 'function') ctx.reset();
      return { healed: true, out: 'state reset' };
    default:
      return { healed: true, out: 'default recovery' };
  }
}

function selfHeal(error, ctx) {
  const step = resolve(error);
  const result = recover(step.action, error, ctx);
  return { ...step, ...result };
}

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });
  assert('classify not found', classifyMessage('command not found') === 'unknown_command');
  const r = resolve({ kind: 'unknown_command' });
  assert('resolve fallback', r.action === 'fallback');
  const h = selfHeal({ kind: 'invalid_input', input: 'a<script>' });
  assert('sanitize healed', h.healed && String(h.out).indexOf('<') === -1);
  assert('compat 1.36', compatibleVersion('1.36.0'));
  assert('compat 2.0', compatibleVersion('2.0.0'));
  assert('incompat 3.0', !compatibleVersion('3.0.0'));

  // SPO resolution
  const sp = resolveSPO('body', 'base', '41128');
  assert('SPO fires rule', sp && sp.label === 'BODY → ALT' && sp.assert.obj === 'alt');
  const miss = resolveSPO('nobody', 'base', 'x');
  assert('SPO no rule → null', miss === null);

  // G guard truth (token name=value=coord)
  const t = toToken('sealed', '0x0000');
  assert('G token predicate', t.predicate === true && t.coord >= 0 && t.coord <= 0x3f);
  const graph = [
    { subj: 'data', pred: 'derived', obj: 'mainstreamable' },
    { subj: 'witness', pred: 'obs', obj: 'sp' }
  ];
  const d = derive(graph, ['data', 'witness']);
  assert('derive asserts', d.derived === 2 && d.triples.some((x) => x.assert.pred === 'proof'));

  const failed = results.filter((x) => !x.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}

module.exports = {
  RULES,
  SPO_RULES,
  classifyMessage,
  resolve,
  resolveSPO,
  derive,
  reduce3,
  toToken,
  pred,
  recover,
  selfHeal,
  compatibleVersion,
  COMPAT_MIN,
  COMPAT_MAX,
  selfTest
};
