// LEVEL 0 — THE PRIMITIVE
//
// Everything reduces to one step: compare a slot with what you expect,
// and if it matches, exchange it. The step always tells you the difference.
//
// Verified 2026-10-07 (wiki: PROG-00 Homoiconic Syntax Tracker, Level 0).

/** What one compare-exchange step reports. */
export type Exchange = {
  matched: boolean;   // did the slot hold the expected index?
  old: number;        // the index that was in the slot before the step
  difference: number; // expected XOR old: 0 when matched, the repair otherwise
};

/**
 * Read `index`; if it holds `expected`, write `replacement`.
 * Uses the real Atomics.compareExchange, so `slots` must be an Int32Array
 * over a SharedArrayBuffer.
 */
export function exchange(slots: Int32Array, index: number, expected: number, replacement: number): Exchange {
  const old = Atomics.compareExchange(slots, index, expected, replacement);
  return { matched: old === expected, old, difference: (expected ^ old) >>> 0 };
}

/**
 * The three phases folded into one digest (DeepSeek3, lines 42400–44719):
 *   bind  = expected XOR replacement
 *   apply = the compare-exchange (returns the old index)
 *   eval  = the slot after the step
 * Verified: the digest is 0 exactly when the exchange happened
 * (and expected differs from replacement); on a miss it is expected XOR replacement.
 */
export function digest(slots: Int32Array, index: number, expected: number, replacement: number): number {
  const bind = expected ^ replacement;
  const apply = Atomics.compareExchange(slots, index, expected, replacement);
  const evaluated = slots[index];
  return bind ^ apply ^ evaluated;
}

/** A fresh set of slots that Atomics can act on. */
export function makeSlots(count: number): Int32Array {
  return new Int32Array(new SharedArrayBuffer(count * Int32Array.BYTES_PER_ELEMENT));
}
