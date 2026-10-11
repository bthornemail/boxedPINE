// A FRAME OF REFERENCE: TIME AND MEMORY OF THE POOL A READING IS TAKEN IN
//
// The author: each frame of reference should coordinate on the time and space
// of the memory pool it is in. Time: the kernel tick (I-79) against UTC and
// local time, whose difference is the frame's offset. Space: a raw allocation
// against a zeroed one, whose XOR is the pool's contamination (I-83).

/** The swap32 crystal: tick k reads 60 ⊕ 3·(k & 1), alternating '<' (60) and '?' (63). */
export const crystal = (tick: number) => 60 ^ (tick & 1 ? 3 : 0);

/** Time in this frame: the tick, UTC, and the local offset from UTC in minutes. */
export function timeFrame(tick: number, now = new Date()) {
  return { tick, state: crystal(tick), utc: now.toISOString(), localOffsetMinutes: -now.getTimezoneOffset() };
}

/** Space in this frame: bytes where a raw 65,536-byte allocation differs from a zeroed one. */
export function contamination(size = 65536): number {
  const raw = Buffer.allocUnsafe(size), safe = Buffer.alloc(size);
  let n = 0;
  for (let i = 0; i < size; i++) if ((raw[i]! ^ safe[i]!) !== 0) n++;
  return n;
}
