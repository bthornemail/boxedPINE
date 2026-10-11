// A MAC ADDRESS AS AN INDEX ON THE LOOPBACK (wiki: SPEC-07 I-69 to I-71)
//
// The author: physical propagation keyed by MAC address, with the machine's
// own 127.0.0.0/8 as the local 0, and a CUPS IPP address for the 0 of the
// subnet. A MAC has 48 bits; 127/8 leaves 24. The fold is XOR of the two
// halves (the maker's 24 bits ⊕ the device's 24 bits): carry-free, so the
// same MAC gives the same address in any buffer. It is a fold, not a code:
// many MACs share an address, and the address does not give the MAC back.

export type Mac = Uint8Array; // 6 bytes

export function parseMac(text: string): Mac {
  const parts = text.trim().split(/[:-]/);
  if (parts.length !== 6 || !parts.every((p) => /^[0-9a-fA-F]{2}$/.test(p))) throw new RangeError(`not a MAC: ${text}`);
  return Uint8Array.from(parts, (p) => parseInt(p, 16));
}

/** The 24-bit loopback index: the first three bytes ⊕ the last three. */
export function foldMac(mac: Mac): number {
  if (mac.length !== 6) throw new RangeError('a MAC is 6 bytes');
  return ((mac[0]! ^ mac[3]!) << 16) | ((mac[1]! ^ mac[4]!) << 8) | (mac[2]! ^ mac[5]!);
}

/** The loopback address of a 24-bit index: 127.a.b.c. */
export const loopbackAddress = (index: number) =>
  `127.${(index >>> 16) & 255}.${(index >>> 8) & 255}.${index & 255}`;

/**
 * The 0 of the subnet. 127.0.0.0 is the network address and cannot be
 * connected to, so index 0 is served where CUPS listens: IPP on 127.0.0.1:631.
 * DECISION (author to confirm): index 0 means this endpoint, not 127.0.0.0.
 */
export const IPP_ZERO = 'ipp://127.0.0.1:631/';

/** Where a MAC propagates: its loopback address, or the IPP zero when it folds to 0. */
export function propagationAddress(mac: Mac): string {
  const index = foldMac(mac);
  return index === 0 ? IPP_ZERO : loopbackAddress(index);
}

/**
 * The same loopback address over NAT64 (author: "you can use NAT64 also").
 * The well-known prefix 64:ff9b::/96 must not carry non-global addresses such
 * as 127/8 (RFC 6052 §3.1), so this uses the local-use prefix 64:ff9b:1::/48
 * (RFC 8215), with the IPv4 address in the last 32 bits.
 */
export const NAT64_LOCAL_PREFIX = '64:ff9b:1::';

export function nat64(index: number): string {
  const v4 = (0x7f000000 | (index & 0xffffff)) >>> 0;
  return `${NAT64_LOCAL_PREFIX}${(v4 >>> 16).toString(16)}:${(v4 & 0xffff).toString(16)}`;
}
