// PURE BIT-SHIFT META-CYCLES
//
// The author: through JavaScript the animation frame, and through anything the
// atomic kernel, drive "platform agnostic pure bit-shift meta-cycles". The
// tick source differs; the cycle does not. Inner cycle: a one-hot ring of 16,
// one bit walking the nibble by shifts. Outer cycle: the swap32 crystal, which
// flips (60 ↔ 63) each time the ring wraps. Together: 32 ticks, shifts and XOR
// only. wiki: SPEC-07 I-88.

/** One step of the ring: the single set bit moves up one place, wrapping 15 → 0. */
export const ring = (s: number) => ((s << 1) | (s >>> 15)) & 0xffff;

/** Which of the 16 places the ring's bit is in. */
export const place = (s: number) => 31 - Math.clz32(s);

export type Meta = { ring: number; crystal: number };
export const META_START: Meta = { ring: 1, crystal: 60 };

/** One tick of the meta-cycle: the ring steps; when it wraps to 1, the crystal flips by swap32. */
export function tick(m: Meta): Meta {
  const r = ring(m.ring);
  return { ring: r, crystal: r === 1 ? m.crystal ^ 3 : m.crystal };
}

/** A tick source: the browser's animation frames, or the kernel anywhere else. */
export function animationTicks(raf: (cb: () => void) => unknown, onTick: (m: Meta) => void): void {
  let m = META_START;
  const loop = () => { m = tick(m); onTick(m); raf(loop); };
  raf(loop);
}

export function* kernelTicks(start: Meta = META_START): Generator<Meta> {
  for (let m = start; ; m = tick(m)) yield m;
}
