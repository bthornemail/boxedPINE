// THE SELF-GENERATING KERNEL — LEVELS 3 TO 5
//
// Ported from "The complete file" in the Fano Fold conversation
// (_archive/The try xor catch xnor finally as the Fano Plane of the Fold.md,
// lines ~1404–1625). Three web primitives do all the work:
//   Regex   — the grammar: which positions are admissible
//   Proxy   — the trap: every read and write is checked
//   Reflect — the operation: the read or write itself
//
// Changes from the transcript, each recorded in the wiki:
//   - the grammar comes from grammar.ts (HEX now accepts 0xFF; OPEN-02 #21)
//   - positions are checked against Levels 1–2 only (POSITION_RULES); the
//     Level 3 symbols classify characters (see grammar.ts)
//   - each kernel gets its own copy of the grammar unless one is passed in.
//     Pass a shared Map to get the transcript's "global scope" behaviour.

import { makeGrammar, POSITION_RULES } from './grammar.ts';

export type Grammar = Map<string, RegExp>;

export function classify(position: unknown, grammar: Grammar): string | null {
  if (typeof position !== 'string') return null;
  for (const [name, pattern] of grammar) if (pattern.test(position)) return name;
  return null;
}

export const admissible = (position: unknown, grammar: Grammar) => classify(position, grammar) !== null;

type State = Record<string, number> & { learn?: (name: string, source: string) => string; grammar?: Grammar };

/** A Proxy over plain state: every position read or written must pass the grammar. */
export function makeHandler(state: Record<string, number>, grammar: Grammar): State {
  return new Proxy(state as State, {
    get(target, position) {
      if (typeof position === 'symbol') return Reflect.get(target, position);
      if (position === 'learn') return (name: string, source: string) => { grammar.set(name, new RegExp(source)); return name; };
      if (position === 'grammar') return grammar;
      if (!admissible(position, grammar)) throw new TypeError(`inadmissible position read: ${position}`);
      return Reflect.get(target, position);
    },
    set(target, position, value) {
      if (typeof position === 'symbol') return Reflect.set(target, position, value);
      if (!admissible(position, grammar)) throw new TypeError(`inadmissible position write: ${position}`);
      return Reflect.set(target, position, value);
    },
    has(target, position) {
      if (typeof position === 'symbol') return Reflect.has(target, position);
      return admissible(position, grammar) && Reflect.has(target, position);
    },
  });
}

/** Compare-exchange through the handler (the Level 0 step, on named positions). */
export function compareExchange(state: State, position: string, expected: number, replacement: number) {
  const actual = state[position];
  if (actual === expected) {
    state[position] = replacement;
    return { matched: true, now: replacement, difference: 0 };
  }
  return { matched: false, now: actual, difference: (expected ^ actual) >>> 0 };
}

/** XOR every listed position together. Closed when the fold is 0. */
export function digest(state: State, positions: string[]) {
  let fold = 0;
  for (const p of positions) fold = (fold ^ (state[p] ?? 0)) >>> 0;
  return { fold, closed: fold === 0 };
}

type HistoryEntry =
  | { generation: number; position: string; result: ReturnType<typeof compareExchange> }
  | { generation: number; learned: string; source: string };

export function makeKernel(grammar: Grammar = makeGrammar(POSITION_RULES), initial: Record<string, number> = {}) {
  const state = makeHandler(initial, grammar);
  const history: HistoryEntry[] = [];
  let generation = 0;

  return {
    state,
    history,
    get generation() { return generation; },

    step(position: string, expected: number, replacement: number) {
      const result = compareExchange(state, position, expected, replacement);
      history.push({ generation, position, result });
      return result;
    },

    /** Add a pattern to the grammar. The very next access obeys it. */
    learn(name: string, source: string) {
      state.learn!(name, source);
      generation++;
      history.push({ generation, learned: name, source });
      return generation;
    },

    /** The kernel as data: what it knows and what it has done. */
    describe() {
      return { generation, grammar: [...grammar.keys()], history: [...history] };
    },
  };
}

/**
 * Rebuild a kernel from its description by replaying what it learned.
 * ⟦PLACEHOLDER⟧ Positions written by step() are NOT replayed. Should a
 * description carry state as well as grammar? Author to decide (OPEN-01 #9).
 */
export function regenerate(description: { history: HistoryEntry[] }) {
  const kernel = makeKernel();
  for (const entry of description.history) if ('learned' in entry) kernel.learn(entry.learned, entry.source);
  return kernel;
}

/**
 * LEVEL 4 — read a wordform as a program.
 * ⟦PLACEHOLDER⟧ Not built. The EXCHANGE wordform (e.g. 0p3x40n) should run as a
 * compare-exchange, and the author's instruction "read index 60; if 60 is
 * expected, exchange it with the iExtant Exponent or Exception" should be
 * writable as one wordform. What each capture group means is the author's
 * call (wiki: PROG-00 Homoiconic Syntax Tracker, Level 4).
 */
export function readAsProgram(_wordform: string): never {
  throw new Error('Level 4 not built yet: see PROG-00 Homoiconic Syntax Tracker');
}
