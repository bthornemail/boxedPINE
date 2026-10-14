// THE INTERFACE CARRIER — the browser/runtime primitives accepted by the kernel
//
// Proxy traps and Reflect operations remain host operations. Catch carries an
// outcome instead of swallowing an exception, and a tagged template preserves
// the literal strings separately from its interpolated values.

export type CatchResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: unknown };

export type Literal = {
  strings: TemplateStringsArray;
  raw: readonly string[];
  values: readonly unknown[];
  text: string;
};

export type KernelInterface = {
  Proxy: ProxyConstructor;
  Reflect: typeof Reflect;
  catch<T>(run: () => T): CatchResult<T>;
  template(strings: TemplateStringsArray, ...values: unknown[]): Literal;
};

/** Convert a human ordinal (1st, 2nd, ...) to a zero-based storage index. */
export function indexOfOrdinal(ordinal: number): number {
  if (!Number.isInteger(ordinal) || ordinal < 1) throw new RangeError('ordinal must be a positive integer');
  return ordinal - 1;
}

/** Convert a zero-based storage index to the human ordinal used in records. */
export function ordinalOfIndex(index: number): number {
  if (!Number.isInteger(index) || index < 0) throw new RangeError('index must be a non-negative integer');
  return index + 1;
}

export function catchValue<T>(run: () => T): CatchResult<T> {
  try {
    return { ok: true, value: run() };
  } catch (error) {
    return { ok: false, error };
  }
}

export function templateLiteral(strings: TemplateStringsArray, ...values: unknown[]): Literal {
  return Object.freeze({
    strings,
    raw: strings.raw,
    values: Object.freeze([...values]),
    text: String.raw({ raw: strings.raw }, ...values),
  });
}

export const DEFAULT_INTERFACE: KernelInterface = {
  Proxy,
  Reflect,
  catch: catchValue,
  template: templateLiteral,
};
