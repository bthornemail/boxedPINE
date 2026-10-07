// THE CATALOG COORDINATE  <base32?base36=base64>
//
// From the author's RFC sketch (rosetta/src/rfc.ts) and the assignment
// pattern in core/src/broadcast.ts (/<[\w\?]*=[\w\?]*>/). A coordinate
// names one thing three ways:
//   base32  the name (RFC 4648 alphabet A–Z 2–7, '=' padding)
//   base36  the meter, a number (0–9 a–z)
//   base64  the name again
// The delimiters < = > ? are block 0 of the orbit of 60 (codes 60–63).
// It parses unambiguously: base36 has no '=', so the first '=' after '?' is
// the separator. And it checks itself: base32 and base64 must decode to the
// same name. Verified 2026-10-07 (wiki: SPEC-37 The Catalog Coordinate).

export const CATALOG = /^<([A-Z2-7]+=*)\?([0-9a-z]+)=([A-Za-z0-9+/]+=*)>$/;

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(text: string): string {
  let bits = 0, value = 0, out = '';
  for (const byte of new TextEncoder().encode(text)) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { out += BASE32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  while (out.length % 8 !== 0) out += '=';
  return out;
}

export function base32Decode(text: string): string {
  let bits = 0, value = 0;
  const bytes: number[] = [];
  for (const ch of text.replace(/=+$/, '')) {
    const index = BASE32.indexOf(ch);
    if (index === -1) throw new Error(`not base32: ${ch}`);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

const base64Encode = (text: string) => btoa(String.fromCharCode(...new TextEncoder().encode(text)));
const base64Decode = (text: string) => new TextDecoder().decode(Uint8Array.from(atob(text), (c) => c.charCodeAt(0)));

/** Make the coordinate <base32(name)?base36(meter)=base64(name)>. */
export function catalog(name: string, meter: number): string {
  return `<${base32Encode(name)}?${meter.toString(36)}=${base64Encode(name)}>`;
}

/** Read a coordinate back. `consistent` is true when both encodings name the same thing. */
export function readCatalog(coordinate: string) {
  const m = CATALOG.exec(coordinate);
  if (!m) return null;
  const name32 = base32Decode(m[1]);
  const name64 = base64Decode(m[3]);
  return { name: name32, meter: parseInt(m[2], 36), consistent: name32 === name64 };
}
