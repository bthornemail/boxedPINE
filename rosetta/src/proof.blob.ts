// THE PROOF BLOB: ONE 65,536-BIT INDEX, WRITTEN EVERY WAY
//
// The author: a 65,536-bit proof buffer in 0x, 0b, 0o and 0d, stored as a
// file Blob "that anyone can xor to 0 as proof of equivalency to a 0u and 0n
// offset", carried as a file, Buffer, Blob, ArrayBuffer and Array, and as a
// base32 tagged template literal for transport (base32 rather than base64:
// its alphabet A-Z2-7 sits inside the protocol's A-Z0-9, and it needs no URL
// or template escaping). wiki: SPEC-07 I-81.
//
// Every form reads back to the same 8,192 bytes; XOR with the Blob gives 0n
// as one BigInt and 0 in every unsigned byte.

export const BYTES = 8192; // 65,536 bits

/** DECISION: the content is the orbit of 60 through every dial, byte j = 60 ⊕ (j & 0xFF). */
export const proofBlob = () => Uint8Array.from({ length: BYTES }, (_, j) => 60 ^ (j & 0xff));

export type Radix = 'x' | 'b' | 'o' | 'd';
const BASE: Record<Radix, number> = { x: 16, b: 2, o: 8, d: 10 };

const toBigInt = (bytes: Uint8Array) => BigInt('0x' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(''));

function fromBigInt(n: bigint, width = BYTES): Uint8Array {
  const hex = n.toString(16).padStart(width << 1, '0');
  if (hex.length > width << 1) throw new RangeError('wider than the Blob');
  return Uint8Array.from({ length: width }, (_, i) => parseInt(hex.slice(i << 1, (i << 1) + 2), 16));
}

/** The whole Blob as one literal. The width is the frame's (65,536 bits), not the literal's (SPEC-07 I-6). */
export const toLiteral = (bytes: Uint8Array, radix: Radix) => `0${radix}${toBigInt(bytes).toString(BASE[radix])}`;

/** Read a literal back to the Blob's width. 0d is the protocol's decimal prefix (Java and JS write decimal bare). */
export function fromLiteral(text: string, width = BYTES): Uint8Array {
  const t = text.trim();
  const m = /^0([xbod])([0-9a-fA-F]+)$/.exec(t);
  if (!m) throw new RangeError('not a 0x, 0b, 0o or 0d literal');
  return fromBigInt(m[1] === 'd' ? BigInt(m[2]!) : BigInt(`0${m[1]}${m[2]}`), width);
}

// ---- base32 (RFC 4648 alphabet, no padding) ----
export const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function toBase32(bytes: Uint8Array): string {
  let out = '', acc = 0, bits = 0;
  for (const b of bytes) {
    acc = ((acc << 8) | b) & 0xffff;
    bits += 8;
    while (bits >= 5) { bits -= 5; out += BASE32[(acc >> bits) & 31]; }
  }
  if (bits) out += BASE32[(acc << (5 - bits)) & 31];
  return out;
}

export function fromBase32(text: string, width = BYTES): Uint8Array {
  const out = new Uint8Array(width);
  let acc = 0, bits = 0, i = 0;
  for (const c of text.replace(/\s+/g, '')) {
    const v = BASE32.indexOf(c);
    if (v < 0) throw new RangeError(`not base32: ${c}`);
    acc = ((acc << 5) | v) & 0xffff;
    bits += 5;
    if (bits >= 8) { bits -= 8; if (i < width) out[i++] = (acc >> bits) & 0xff; }
  }
  if (i !== width) throw new RangeError(`base32 gave ${i} bytes, not ${width}`);
  return out;
}

/** A self-contained module: the Blob as a base32 tagged template literal, decoded by its own tag. */
export function toTemplateModule(bytes: Uint8Array): string {
  const lines = toBase32(bytes).match(/.{1,64}/g)!.join('\n');
  return `// The proof Blob as a base32 tagged template literal (boxedPINE rosetta/src/proof.blob.ts).
// The tag reads the template's raw strings; base32 needs no URL or template escaping.
const A = '${BASE32}';
export const base32 = (strings) => {
  const text = strings.raw.join('').replace(/\\s+/g, '');
  const out = []; let acc = 0, bits = 0;
  for (const c of text) { acc = ((acc << 5) | A.indexOf(c)) & 0xffff; bits += 5; if (bits >= 8) { bits -= 8; out.push((acc >> bits) & 0xff); } }
  return Uint8Array.from(out);
};
export default base32\`
${lines}
\`;
`;
}

/** XOR two readings: 0n as one BigInt and 0 in every unsigned byte means they are the same index. */
export function xorProof(a: Uint8Array, b: Uint8Array): { n: bigint; u: Uint8Array } {
  if (a.length !== b.length) throw new RangeError('different widths');
  const u = a.map((x, i) => x ^ b[i]!);
  return { n: toBigInt(a) ^ toBigInt(b), u };
}

const JAVA = `import java.math.BigInteger;
import java.nio.file.*;

/** Reads proof.bin and every literal beside it, and XORs each against the Blob. Run: java Equivalence.java */
public class Equivalence {
  static final String B32 = "${BASE32}";
  static byte[] fixed(BigInteger n) {
    byte[] raw = n.toByteArray(), out = new byte[8192];
    int skip = Math.max(0, raw.length - 8192);
    System.arraycopy(raw, skip, out, 8192 - (raw.length - skip), raw.length - skip);
    return out;
  }
  static byte[] base32(String s) {
    byte[] out = new byte[8192]; int acc = 0, bits = 0, i = 0;
    for (char c : s.replaceAll("\\\\s+", "").toCharArray()) {
      acc = ((acc << 5) | B32.indexOf(c)) & 0xffff; bits += 5;
      if (bits >= 8) { bits -= 8; if (i < 8192) out[i++] = (byte) ((acc >> bits) & 0xff); }
    }
    return out;
  }
  public static void main(String[] args) throws Exception {
    byte[] blob = Files.readAllBytes(Path.of("proof.bin"));
    BigInteger whole = new BigInteger(1, blob);
    String[][] forms = { {"0x", "16"}, {"0b", "2"}, {"0o", "8"}, {"0d", "10"} };
    boolean all = true;
    for (String[] f : forms) {
      String text = Files.readString(Path.of("proof." + f[0])).trim().substring(2);
      BigInteger n = new BigInteger(text, Integer.parseInt(f[1]));
      byte[] u = fixed(n); int ones = 0;
      for (int i = 0; i < 8192; i++) ones |= (u[i] ^ blob[i]) & 0xff;
      boolean zero = n.xor(whole).signum() == 0 && ones == 0;
      all &= zero;
      System.out.println(f[0] + ": xor " + (zero ? "0n and 0u" : "NOT zero"));
    }
    byte[] b = base32(Files.readString(Path.of("proof.b32"))); int ones = 0;
    for (int i = 0; i < 8192; i++) ones |= (b[i] ^ blob[i]) & 0xff;
    all &= ones == 0;
    System.out.println("base32: xor " + (ones == 0 ? "0u" : "NOT zero"));
    System.out.println(all ? "EQUIVALENT: every form XORs the Blob to 0" : "NOT EQUIVALENT");
    if (!all) System.exit(1);
  }
}
`;

/** Every file of the proof directory, by name. */
export function proofFiles(bytes = proofBlob()): Record<string, string | Uint8Array> {
  return {
    'proof.bin': bytes,
    'proof.0x': toLiteral(bytes, 'x') + '\n',
    'proof.0b': toLiteral(bytes, 'b') + '\n',
    'proof.0o': toLiteral(bytes, 'o') + '\n',
    'proof.0d': toLiteral(bytes, 'd') + '\n',
    'proof.b32': toBase32(bytes) + '\n',
    'proof.template.mjs': toTemplateModule(bytes),
    'Equivalence.java': JAVA,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { mkdirSync, writeFileSync } = await import('node:fs');
  const dir = process.argv[2] ?? 'proofs/blob';
  mkdirSync(dir, { recursive: true });
  for (const [name, data] of Object.entries(proofFiles())) writeFileSync(`${dir}/${name}`, data);
  console.log(`wrote ${dir}`);
}
