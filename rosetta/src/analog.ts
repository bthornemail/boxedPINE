// THE ELECTRICAL READING UNDER THE 1s AND 0s
//
// The author, 2026-10-12: "the system is the entropy, or the analog on the
// electrical reading at the hardware level"; "1 is not 1 and 0 is not 0 there,
// it's analog and spectral". The organ answers GET /analog/c with 64 raw 12-bit
// readings of one ADC1 input (breadboard/esp32). This file reads them three
// ways: as logic (each reading against the threshold, half of full scale), as
// values (the entropy of the readings themselves) and as a spectrum (the power
// at each frequency of the 64, and the entropy of how it spreads). wiki:
// SPEC-07 I-181.

export const FULL = 4096;            // 12 bits
export const THRESHOLD = FULL / 2;   // the reading where 0 becomes 1

/** The readings in an answer: "samples 7ff 800 …" lines, in order. */
export function parseAnalog(lines: string[]): number[] {
  return lines.filter((l) => l.startsWith('samples ')).flatMap((l) => l.slice(8).trim().split(' ').map((h) => parseInt(h, 16)));
}

/** Each reading as logic: 1 at or above the threshold, else 0. */
export const logical = (readings: number[]) => readings.map((r) => (r >= THRESHOLD ? 1 : 0));

/** Shannon entropy, in bits, of the values in a list. */
export function entropy(values: number[]): number {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let h = 0;
  for (const c of counts.values()) h -= (c / values.length) * Math.log2(c / values.length);
  return h;
}

/** The power at frequencies 1 … n/2 (the constant part, frequency 0, left out). */
export function spectrum(readings: number[]): number[] {
  const n = readings.length;
  const power: number[] = [];
  for (let k = 1; k <= n / 2; k++) {
    let re = 0, im = 0;
    for (let t = 0; t < n; t++) {
      re += readings[t]! * Math.cos((2 * Math.PI * k * t) / n);
      im -= readings[t]! * Math.sin((2 * Math.PI * k * t) / n);
    }
    power.push(re * re + im * im);
  }
  return power;
}

/** The entropy of how the power spreads over the frequencies: 0 for one frequency (or none), log2(n/2) for all alike. */
export function spectralEntropy(readings: number[]): number {
  const power = spectrum(readings);
  const total = power.reduce((s, p) => s + p, 0);
  if (total < 1e-9) return 0;
  return -power.reduce((h, p) => (p > 0 ? h + (p / total) * Math.log2(p / total) : h), 0);
}

/** All three readings of one answer. */
export function readAnalog(readings: number[]) {
  const bits = logical(readings);
  return {
    readings: readings.length,
    distinct: new Set(readings).size,
    min: Math.min(...readings),
    max: Math.max(...readings),
    logic: [...new Set(bits)].sort(),
    entropyOfLogic: entropy(bits),
    entropyOfReadings: entropy(readings),
    spectralEntropy: spectralEntropy(readings),
  };
}
