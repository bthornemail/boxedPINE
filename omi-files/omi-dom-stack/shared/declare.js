/**
 * declare.js — the declarative syntax.
 *
 * The protocol does not define anything. It does not read the response and it
 * does not decide what a number means. It only sets up the path. The user binds
 * the references, the user reads, the user interprets.
 *
 * So this syntax declares ARRANGEMENTS, not meanings. Every line names peers
 * and says which comparison to run. Nothing here assigns a value to a point or
 * an order to two edits. If a line asserts something about meaning, it is not
 * this file's job to accept it.
 *
 *     peer alice 0x00000000        declare a peer and its starting word
 *     peer bob   0x00000000
 *     link  alice bob              bind a source to a sink
 *     offline alice                take a peer off the path
 *     edit alice 0x0BADF00D        an honest write
 *     edit bob   0x0BADF00C        ...while the other was away
 *     online  alice                put it back on the path
 *     read   alice bob             one XOR: how far apart, and where
 *     roll   alice bob             apply the displacement already measured
 *     read   alice bob carol       three peers: the fold IS the outlier
 *     roll   alice bob carol       roll every outlier to the majority
 *     witness alice                has this peer been tampered with?
 *     bind                         0, 2, 1 — is this 0, 1, or 2?
 *
 * `read` and `roll` take two or three peers. With two you get magnitude and
 * displacement. With three, when two agree and one does not, the XOR of all
 * three IS the outlier's value — so the same single XOR names the dissenter.
 *
 * Two tiers, the same discipline as the space: a line that is not properly
 * structured is refused with a structured error carrying the line number. A
 * line that is well formed but merely disagrees is a reading, and readings are
 * never refusals.
 *
 * 'use strict';
 */

const peers = require('./peers.js');

class DeclarationError extends Error {
  constructor(line, reason, source) {
    super('declaration ' + line + ': ' + reason);
    this.name = 'DeclarationError';
    this.line = line;
    this.reason = reason;
    this.coordinate = Object.freeze({
      line,
      column: 0,
      source: typeof source === 'string' ? source.slice(0, 80) : '',
    });
  }
}

// Minimum arity. `peer` takes an optional seed, so its floor is 1.
const OPS = Object.freeze({
  peer: 1, link: 2, offline: 1, online: 1, edit: 2, tamper: 2,
  read: 2, roll: 2, witness: 1, bind: 0, reset: 0,
});

// Maximum arity, where a declaration is a count of peers rather than a list.
// Unbounded elsewhere, so `peer name seed` keeps working.
const MAX_OPS = Object.freeze({ read: 3, roll: 3 });

// One line into its parts. Words and a 0x-prefixed or bare number.
function parseLine(raw, n) {
  const text = String(raw).split('#')[0].trim();
  if (!text) return null;
  const parts = text.split(/\s+/);
  const op = parts[0].toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(OPS, op)) {
    throw new DeclarationError(n, 'unknown declaration "' + op + '"', raw);
  }
  const arity = OPS[op];
  const args = parts.slice(1);
  if (args.length < arity) {
    throw new DeclarationError(n, op + ' needs ' + arity + ' argument' + (arity === 1 ? '' : 's'), raw);
  }
  const max = MAX_OPS[op];
  if (max !== undefined && args.length > max) {
    throw new DeclarationError(n, op + ' takes at most ' + max + ' peers, got ' + args.length, raw);
  }
  return { op, args, line: n, raw: text };
}

function parse(source) {
  if (typeof source !== 'string') {
    const e = new DeclarationError(0, 'a declaration must be text');
    throw e;
  }
  return source.split('\n')
    // Humans count lines from 1, so the coordinate must too.
    .map((text, i) => parseLine(text, i + 1))
    .filter(Boolean);
}

// A number, in any of the four readings the reference space allows. The
// radix prefix is a reading, not a value: 0xF, 0b1111, 0o17 and 0d15 are the
// same number, and the file says so rather than asking you to pick a base.
function asNumber(text, n) {
  const t = String(text).trim();
  let v;
  if (/^0x[0-9a-f]+$/i.test(t)) v = parseInt(t.slice(2), 16);
  else if (/^0b[01]+$/i.test(t)) v = parseInt(t.slice(2), 2);
  else if (/^0o[0-7]+$/i.test(t)) v = parseInt(t.slice(2), 8);
  else if (/^0d[0-9]+$/i.test(t)) v = parseInt(t.slice(2), 10);
  else if (/^[0-9a-f]+$/i.test(t) && /[a-f]/i.test(t)) v = parseInt(t, 16);
  else if (/^[0-9]+$/.test(t)) v = parseInt(t, 10);
  else v = NaN;
  if (!Number.isFinite(v)) throw new DeclarationError(n, '"' + t + '" is not a number in any reading', t);
  return v >>> 0;
}

function need(table, name, n) {
  const p = table[name];
  if (!p) {
    throw new DeclarationError(n, 'no peer named "' + name + '"', name);
  }
  return p;
}

// Run a parsed or raw program. The return value is a log the user reads; this
// function never interprets it and never decides anything about it.
function run(source, opts) {
  const lines = parse(source);
  const world = { peers: Object.create(null), links: [] };
  const log = [];
  const emit = (line, op, result) => log.push(Object.freeze({ line, op, result }));

  for (const decl of lines) {
    const { op, args, line } = decl;
    switch (op) {
      case 'peer': {
        const name = String(args[0]);
        const seed = args.length > 1 ? asNumber(args[1], line) : 0;
        world.peers[name] = peers.createPeer({ name, cells: 1 });
        if (seed) world.peers[name].write(seed);
        emit(line, op, { name, seed: seed >>> 0, mode: world.peers[name].mode });
        break;
      }
      case 'link': {
        const a = need(world.peers, String(args[0]), line);
        const b = need(world.peers, String(args[1]), line);
        world.links.push([a, b]);
        emit(line, op, { from: a.name, to: b.name });
        break;
      }
      case 'offline':
      case 'online': {
        const p = need(world.peers, String(args[0]), line);
        p.offline = (op === 'offline');
        emit(line, op, { name: p.name, offline: p.offline });
        break;
      }
      case 'edit':
      case 'tamper': {
        const p = need(world.peers, String(args[0]), line);
        const v = asNumber(args[1], line);
        if (op === 'edit') p.write(v); else p.tamper(v);
        emit(line, op, { name: p.name, value: v, hex: peers.hex32(v) });
        break;
      }
      case 'read': {
        const named = args.map((x) => need(world.peers, String(x), line));
        if (named.length === 3) {
          const [a, b, c] = named;
          const report = peers.fold3(a, b, c);
          // Stash it on all three, keyed by who was read together, so a later
          // `roll a b c` acts on the report the user was actually looking at.
          const tag = { names: [b.name, c.name], report };
          a._last3 = tag; b._last3 = tag; c._last3 = tag;
          emit(line, op, {
            names: [a.name, b.name, c.name],
            agreed: report.agreed,
            disagreement: report.disagreement,
            residue: peers.hex32(report.residue),
            hasMajority: report.hasMajority,
            majority: report.hasMajority ? peers.hex32(report.majority) : null,
            majorityCount: report.majorityCount,
            outliers: report.outliers,
            // Stated, not assumed: this only holds with exactly one outlier.
            residueIsOutlier: report.residueIsOutlier,
            pairs: report.pairs,
          });
          break;
        }
        const [a, b] = named;
        const report = peers.divergence(a, b);
        // Stash it on the pair so a later `roll` acts on the report the user
        // was actually looking at, not a fresh one.
        a._last = { b: b.name, report };
        b._last = { a: a.name, report };
        emit(line, op, {
          from: a.name, to: b.name,
          agreed: report.agreed,
          fold: report.fold, hex: peers.hex32(report.fold),
          popcount: report.popcount,
          bytes: report.bytes,
        });
        break;
      }
      case 'roll': {
        const named = args.map((x) => need(world.peers, String(x), line));
        if (named.length === 3) {
          const [a, b, c] = named;
          const stale = (a._last3 && a._last3.names[0] === b.name && a._last3.names[1] === c.name)
            ? a._last3.report : null;
          const r = peers.reconcile3(a, b, c, stale);
          for (const p of named) p._last3 = null;
          // Two very different refusals that both leave the peers alone, and
          // must not be reported as the same thing: nobody is in a majority, or
          // the user acted on a report that has since been overtaken.
          const noMajority = !r.fold.hasMajority;
          emit(line, op, {
            names: [a.name, b.name, c.name],
            moved: r.moved,
            noMajority,
            clobbered: r.stalled && !noMajority,
            majority: r.fold.hasMajority ? peers.hex32(r.fold.majority) : null,
            outliers: r.fold.outliers,
          });
          break;
        }
        const [a, b] = named;
        const stale = (a._last && a._last.b === b.name) ? a._last.report : null;
        const r = peers.repair(a, b, stale);
        a._last = null; b._last = null;
        emit(line, op, {
          from: a.name, to: b.name,
          moved: r.moved, clobbered: r.clobbered,
          before: peers.hex32(r.before), after: peers.hex32(r.after),
        });
        break;
      }
      case 'witness': {
        const p = need(world.peers, String(args[0]), line);
        const w = p.witness();
        // intact is exact: it asks whether the current state is the one the
        // peer last published through its own gate. The fold is displayed as
        // an invariant, never used as the check — after two honest writes the
        // fold is a^b, which is not the state, and nothing is wrong.
        emit(line, op, {
          name: p.name, steps: w.steps,
          state: peers.hex32(w.state), fold: peers.hex32(w.fold),
          attested: peers.hex32(w.attested),
          intact: w.intact,
        });
        break;
      }
      case 'bind': {
        const first = world.links[0] ? world.links[0][0] : null;
        const f = peers.bind021(first ? first.view : new Uint32Array(3));
        emit(line, op, f);
        break;
      }
      case 'reset': {
        for (const k of Object.keys(world.peers)) world.peers[k].reset();
        world.links.length = 0;
        emit(line, op, { reset: true });
        break;
      }
      default:
        throw new DeclarationError(line, 'unhandled declaration "' + op + '"', decl.raw);
    }
  }
  return Object.freeze({ lines, log, peers: world.peers, links: world.links });
}

module.exports = { OPS, DeclarationError, parse, parseLine, asNumber, run, selfTest };

function selfTest() {
  const results = [];
  const assert = (name, cond) => results.push({ name, pass: !!cond });

  // --- the four readings of one number
  assert('the same number reads the same in all four radices', (function () {
    // && not ===, because a === b === c parses as (a===b) === c.
    const v = ['0xF', '0b1111', '0o17', '0d15'].map(t => asNumber(t, 1));
    return v[0] === 15 && v[1] === 15 && v[2] === 15 && v[3] === 15;
  })());
  assert('zero is zero in all four readings', asNumber('0x0', 1) === 0 && asNumber('0b0', 1) === 0
    && asNumber('0o0', 1) === 0 && asNumber('0d0', 1) === 0);
  assert('a non-number is refused with a line number', (function () {
    try { asNumber('hello', 7); return false; } catch (e) { return e instanceof DeclarationError && e.line === 7; }
  })());

  // --- structure tier: a bad line is refused, with a coordinate
  assert('an unknown declaration is refused', (function () {
    try { parse('frobnicate x'); return false; } catch (e) { return e instanceof DeclarationError; }
  })());
  assert('the refusal carries a structured coordinate', (function () {
    try { parse('\n\nbad op here'); return false; } catch (e) {
      return e.coordinate.line === 3 && typeof e.coordinate.source === 'string' && e.coordinate.column === 0;
    }
  })());
  assert('too few arguments is refused', (function () {
    try { parse('link alice'); return false; } catch (e) { return /needs 2 arguments/.test(e.message); }
  })());
  assert('a reference to a peer that does not exist is refused', (function () {
    try { run('read alice bob'); return false; } catch (e) { return /no peer named/.test(e.message); }
  })());
  assert('non-text is refused at line 0', (function () {
    try { run(42); return false; } catch (e) { return e.line === 0; }
  })());
  assert('comments and blank lines are ignored', (function () {
    return parse('# a comment\n\n  \npeer a').length === 1;
  })());

  // --- value tier: the whole demo, as text
  const out = run([
    'peer alice 0x00000000',
    'peer bob   0x00000000',
    'link alice bob',
    'offline alice',
    'offline bob',
    'edit alice 0x0BADF00D',
    'edit bob   0x0BAFF00D',
    'online alice',
    'read alice bob',
    'roll alice bob',
    'read alice bob',
  ].join('\n'));
  assert('every declaration ran', out.log.length === 11);
  assert('the first read disagrees', out.log[8].result.agreed === false && out.log[8].result.popcount > 0);
  assert('the first read names the bytes that differ', out.log[8].result.bytes.length > 0);
  assert('the roll repaired it', out.log[9].result.moved === true);
  assert('the second read agrees', out.log[10].result.agreed === true);

  // --- the roll acts on the report the user was shown
  const stale = run([
    'peer a 0x0', 'peer b 0x0',
    'edit a 7', 'edit b 3',
    'read a b',
    'edit b 9',
    'roll a b',
  ].join('\n'));
  assert('a stale report reports a clobber instead of lying', stale.log[6].result.clobbered === true);
  assert('the clobbering write is not overwritten', stale.peers.b.read() === 9);

  // --- witness
  const w = run('peer t 0x0\nedit t 0x1111\nwitness t');
  assert('an honest peer witnesses its own history', w.log[2].result.intact === true);
  const w2 = run('peer t 0x0\nedit t 0x1111\ntamper t 0x2222\nwitness t');
  assert('a tampered peer is reported', w2.log[3].result.intact === false);
  const w3 = run('peer t 0x0\nedit t 0x1111\nedit t 0x3333\nwitness t');
  assert('two honest writes are NOT tampering, even though fold != state',
    w3.log[3].result.intact === true && w3.log[3].result.fold !== w3.log[3].result.state);
  const w4 = run('peer x 0x0\npeer y 0x0\nedit x 0xBADF00D\nedit y 3\nread x y\nroll x y\nwitness y');
  assert('a repaired peer witnesses clean, not as a tamper', w4.log[6].result.intact === true);

  // --- bind
  const bd = run('peer x 0x0\npeer y 0x0\nlink x y\nbind');
  assert('the bind declares the literal cycle 0, 2, 1', bd.log[3].result.order.join(',') === '0,2,1');
  assert('the bind classifies into exactly three possibilities', [0, 1, 2].includes(bd.log[3].result.classified));

  // Look declarations up by what they ARE, not by line number. Indexing a log
  // by position breaks the moment a line is inserted, and then the test is
  // asserting about the wrong declaration rather than failing loudly.
  const nth = (out, op, n) => out.log.filter((e) => e.op === op)[n].result;

  // --- three peers: the fold names the outlier
  const tri = run([
    'peer alice 0x0', 'peer bob 0x0', 'peer carol 0x0',
    'link alice bob',
    'read alice bob carol',
    'offline carol',
    'edit carol 0x00000009',
    'online carol',
    'read alice bob carol',
    'roll alice bob carol',
    'read alice bob carol',
  ].join('\n'));
  assert('three peers all zero agree', nth(tri, 'read', 0).agreed === true);
  assert('the residue of three equal values is NOT the agreement test',
    nth(tri, 'read', 0).residue === '0x00000000' || nth(tri, 'read', 0).disagreement === 0);
  assert('a three-way read reports one outlier', nth(tri, 'read', 1).outliers.length === 1
    && nth(tri, 'read', 1).outliers[0] === 'c');
  assert('the residue IS the outlier value when exactly one diverges',
    nth(tri, 'read', 1).residueIsOutlier === true
    && nth(tri, 'read', 1).residue === peers.hex32(0x9));
  assert('the three-way roll repaired it', nth(tri, 'roll', 0).moved === true);
  assert('they agree afterwards', nth(tri, 'read', 2).agreed === true);

  // the trap, stated as a test: 5^5^5 is nonzero yet they all agree
  const odd = run('peer a 5\npeer b 5\npeer c 5\nread a b c');
  const oddr = nth(odd, 'read', 0);
  assert('three copies of x fold to x, not to zero',
    oddr.residue === '0x00000005' && oddr.agreed === true && oddr.disagreement === 0);

  // no majority: refused, and it must not invent a winner
  const none = run([
    'peer a 1', 'peer b 2', 'peer c 4',
    'read a b c',
    'roll a b c',
  ].join('\n'));
  assert('a three-way split reports no majority', nth(none, 'read', 0).hasMajority === false);
  assert('a three-way split still measures disagreement', nth(none, 'read', 0).disagreement > 0);
  assert('a three-way roll refuses instead of picking a winner', nth(none, 'roll', 0).moved === false
    && nth(none, 'roll', 0).noMajority === true);
  assert('the refusal is reported as no-majority, not as a clobber',
    nth(none, 'roll', 0).clobbered === false);

  // a stale three-peer report
  const stale3 = run([
    'peer a 0x0', 'peer b 0x0', 'peer c 0x0',
    'edit a 7', 'edit b 7', 'edit c 9',
    'read a b c',
    'edit c 3',
    'roll a b c',
  ].join('\n'));
  assert('a stale three-peer roll reports a clobber instead of lying',
    nth(stale3, 'roll', 0).clobbered === true && nth(stale3, 'roll', 0).noMajority === false);
  assert('the overtaken peer is not overwritten', stale3.peers.c.read() === 3);

  assert('four peers is refused as a structural error', (function () {
    try { run('peer a 0\npeer b 0\npeer c 0\npeer d 0\nread a b c d'); return false; }
    catch (e) { return e instanceof DeclarationError && /at most 3 peers/.test(e.message); }
  })());

  const failed = results.filter(r => !r.pass);
  return { passed: failed.length === 0, total: results.length, failed: failed.length, results };
}
