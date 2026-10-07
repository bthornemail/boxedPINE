import type { OO, XX } from "../omi-ii.js";

export default class RFC {
  v: [number, number, number, number] = [0x78, 0x87, 0xA5, 0xff];
  spec: string = 'RFC-OMI-II';
  base: XX = 'RFC-OMI-II';
  meter: OO = 0o0;
  BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  base36Encode() {
    return (this.meter).toString(36)
  }
  base36Decode() {
    return (this.meter).toString(36)
  }
  base64Encode() {
    return btoa(this.base);
  }

  base64Decode() {
    return atob(this.base);
  }


  // Encode a standard string to Base32
  base32Encode() {
    const encoder = new TextEncoder();
    const data = encoder.encode(this.base);
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < data.length; i++) {
      value = (value << 8) | data[i];
      bits += 8;
      while (bits >= 5) {
        output += this.BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += this.BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }
    while (output.length % 8 !== 0) {
      output += '=';
    }
    return output;
  }

  // Decode a Base32 string back to a standard string
  base32Decode() {
    const cleaned = this.base.replace(/=+$/, '').toUpperCase();
    let bits = 0;
    let value = 0;
    const decoded = [];

    for (let i = 0; i < cleaned.length; i++) {
      const idx = this.BASE32_ALPHABET.indexOf(cleaned[i]);
      if (idx === -1) throw new Error('Invalid Base32 character');
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        decoded.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return new TextDecoder().decode(new Uint8Array(decoded));
  }
  version() {
    return this.v.map(num => '0x' + num.toString(16).toUpperCase()).join(', ')
  }
  print() {
    console.log(`rfc.${this.version()}.${this.spec}.base64(${this.base64Encode()}).base32(${this.base32Encode()})`);
  }
  constructor(base: XX, meter: OO) {
    this.base = base;
    this.meter = meter;
    this.version();
    this.print();
  }
}