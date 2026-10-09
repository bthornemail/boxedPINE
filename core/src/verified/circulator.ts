// THE CIRCULATOR — the type the Axiom of Propagation is about
//
// From the author's ontology conversation (_archive/_chat_history/
// "I'm working on this protocol with a codi", "The Circulator", lines
// 8646–9048; wiki: SPEC-06 The Circulator). A circulator is a
// decision-bearing boundary. Receiving a relation, it ends in exactly one
// state:
//
//   raise               decide failed and no handler took it (not a choice)
//   terminate           local resolution; nothing forwarded
//   forward             carried on unchanged (zero delta)
//   modify-and-forward  carried on with an attributable delta
//   exit                stepped out: neither resolved, forwarded nor raised
//
// The departure (finally) runs exactly once, in every state.
// Decision and delta are separate: the decision is the path, the delta is
// the modification, present only on modify-and-forward.
//
// Every state is returned as a value (nothing escapes), like OMI.Try in
// types. Relations here are indices, and a delta is applied
// by XOR.
// Verified 2026-10-09 by the tests in src/testbed/core.test.ts.

export type Decision =
  | { kind: 'terminate' }
  | { kind: 'forward' }
  | { kind: 'modify-and-forward'; delta: number }
  | { kind: 'exit' };

export type Outcome =
  | { state: 'raise'; raised: unknown }
  | { state: 'terminate' }
  | { state: 'forward'; carried: number }
  | { state: 'modify-and-forward'; carried: number; delta: number }
  | { state: 'exit' };

export type Circulator = {
  decide: (relation: number) => Decision;
  handler?: (raised: unknown) => Decision;
  depart: () => void;
};

function settle(decision: Decision, relation: number): Outcome {
  switch (decision.kind) {
    case 'terminate': return { state: 'terminate' };
    case 'forward': return { state: 'forward', carried: relation };
    case 'modify-and-forward': return { state: 'modify-and-forward', carried: relation ^ decision.delta, delta: decision.delta };
    case 'exit': return { state: 'exit' };
  }
}

/** Run one boundary: decide (or let the handler decide on a raise), then depart, always. */
export function circulate(circulator: Circulator, relation: number): Outcome {
  try {
    let decision: Decision;
    try {
      decision = circulator.decide(relation);
    } catch (raised) {
      if (!circulator.handler) return { state: 'raise', raised };
      decision = circulator.handler(raised);
    }
    return settle(decision, relation);
  } finally {
    circulator.depart();
  }
}

/** The sameness reading at a fixed width: bit i is 1 where a and b agree. */
export function xnor(a: number, b: number, width: number): number {
  const mask = width >= 32 ? 0xffffffff : (1 << width) - 1;
  return (~(a ^ b) & mask) >>> 0;
}
