export function xor(a: boolean, b: boolean): boolean {
  return a !== b;
}

export function nand(a: boolean, b: boolean): boolean {
  return !(a && b);
}

export function nor(a: boolean, b: boolean): boolean {
  return !(a || b);
}

export function and(a: boolean, b: boolean): boolean {
  return a && b;
}

export function not(a: boolean): boolean {
  return !a;
}

export function xnor(a: boolean, b: boolean): boolean {
  return a === b;
}

export function halfAdder(a: boolean, b: boolean): { sum: boolean; carry: boolean } {
  return { sum: xor(a, b), carry: and(a, b) };
}

export function oddParity(bits: boolean[]): boolean {
  return bits.reduce((acc, bit) => xor(acc, bit), false);
}

export type Combo = { a: boolean; b: boolean; out: boolean };

export const TRUTH: Combo[] = [
  { a: false, b: false, out: false },
  { a: true, b: false, out: true },
  { a: false, b: true, out: true },
  { a: true, b: true, out: false },
];

export function bit(v: boolean): "1" | "0" {
  return v ? "1" : "0";
}
